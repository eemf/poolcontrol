'use client';

/**
 * @fileOverview Ejecutor transaccional integral y multi-sucursal para todas las operaciones decididas por el Asistente de Voz.
 * Cubre: Control de Mesas, Punto de Venta (POS) y Tragamonedas.
 */

import {
  Firestore,
  doc,
  runTransaction,
  Timestamp,
  increment,
  collection,
  query,
  where,
  getDocs,
  limit,
  serverTimestamp,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import type { Mesa, Tarifa, Producto, ProductoVirtual, DetalleVenta, Venta, GeneralesTragamonedas, Cliente } from '@/lib/tipos';
import { validarSucursal, toDate } from './utils';
import {
  iniciarSesion,
  ajustarTiempoDefinido,
  trasladarMesa,
  procesarVentaTiempoDeMesa,
  pasarACuenta,
  eliminarConsumoMesa,
} from './mesas';
import { procesarVentaRapidaConId } from './ventas';
import {
  registrarBaseTragamonedas,
  registrarExtraccionTragamonedas,
  registrarPagoPremioTragamonedas,
} from './tragamonedas';
import { registrarAuditoria } from './auditoria';
import type { AsistenteVozOutput } from '@/ai/flows/asistente-voz';

export interface ResultadoEjecucionVoz {
  exito: boolean;
  tipoAccion: string;
  mensaje: string;
  mensajeVoz: string;
  deshacer?: () => Promise<void>;
}

/**
 * Calcula el costo de tiempo de mesa según la tarifa configurada.
 */
function calcularCostoAlquiler(segundos: number, tarifa: Tarifa, numControles: number = 0): number {
  if (!tarifa || segundos <= 0) return 0;
  const baseControles = tarifa.controlesBase || 0;
  const extraControles = Math.max(0, numControles - baseControles);
  const extraPorHora = extraControles * (tarifa.costoControlExtra || 0);

  if (tarifa.tipoDeMesa === 'Consola') {
    let tarifaPorHoraBase = 0;
    if (tarifa.tipoDeCalculo === 'Por minuto') {
      tarifaPorHoraBase = (tarifa.costoPorMinuto || 0) * 60;
    } else if (tarifa.intervalos && tarifa.intervalos.length > 0) {
      const int60 = tarifa.intervalos.find(i => i.duracionMinutos === 60);
      if (int60) tarifaPorHoraBase = int60.precio;
      else {
        const mayor = [...tarifa.intervalos].sort((a, b) => b.duracionMinutos - a.duracionMinutos)[0];
        if (mayor && mayor.duracionMinutos > 0) tarifaPorHoraBase = (mayor.precio / mayor.duracionMinutos) * 60;
      }
    }
    const tarifaPorHoraTotal = tarifaPorHoraBase + extraPorHora;
    const minutos = Math.ceil(segundos / 60);
    const bloques30 = Math.ceil(minutos / 30);
    return bloques30 * (tarifaPorHoraTotal / 2);
  }

  const minutos = Math.ceil(segundos / 60);
  if (minutos <= 0) return 0;

  if (tarifa.tipoDeCalculo === 'Por minuto') {
    return minutos * (tarifa.costoPorMinuto || 0);
  }

  if (tarifa.tipoDeCalculo === 'Por intervalo' && tarifa.intervalos && tarifa.intervalos.length > 0) {
    const intervalosOrdenados = [...tarifa.intervalos].sort((a, b) => b.duracionMinutos - a.duracionMinutos);
    let minutosRestantes = minutos;
    let costoTotal = 0;
    for (const intervalo of intervalosOrdenados) {
      if (minutosRestantes > 0 && intervalo.duracionMinutos > 0) {
        const bloques = Math.floor(minutosRestantes / intervalo.duracionMinutos);
        if (bloques > 0) {
          costoTotal += bloques * intervalo.precio;
          minutosRestantes -= bloques * intervalo.duracionMinutos;
        }
      }
    }
    if (minutosRestantes > 0) {
      const intervaloMenor = [...tarifa.intervalos]
        .sort((a, b) => a.duracionMinutos - b.duracionMinutos)
        .find(i => minutosRestantes <= i.duracionMinutos);
      if (intervaloMenor) costoTotal += intervaloMenor.precio;
      else if (intervalosOrdenados.length > 0) costoTotal += intervalosOrdenados[0].precio;
    }
    return costoTotal;
  }
  return 0;
}

/**
 * Normaliza y busca un producto por coincidencia de texto en el catálogo.
 */
function buscarProducto(
  termino: string,
  productos: (Producto | ProductoVirtual)[]
): (Producto | ProductoVirtual) | null {
  if (!termino || !productos.length) return null;
  const t = termino.toLowerCase().trim();

  const exacto = productos.find(p => p.nombre.toLowerCase().trim() === t);
  if (exacto) return exacto;

  const contiene = productos.find(p => p.nombre.toLowerCase().includes(t) || t.includes(p.nombre.toLowerCase()));
  if (contiene) return contiene;

  const palabras = t.split(/\s+/).filter(w => w.length > 2);
  const porTokens = productos.find(p => {
    const pNom = p.nombre.toLowerCase();
    return palabras.some(w => pNom.includes(w));
  });

  return porTokens || null;
}

/**
 * Busca una máquina tragamonedas en el contexto por nombre o número.
 */
function buscarMaquinaEnContexto(
  nombreOId: string | undefined,
  maquinas: GeneralesTragamonedas[] | undefined
): GeneralesTragamonedas | null {
  if (!maquinas || !maquinas.length) return null;
  if (!nombreOId) return maquinas[0];

  const t = nombreOId.toLowerCase().trim();
  const exacto = maquinas.find(m => m.nombre.toLowerCase().trim() === t || m.id === t);
  if (exacto) return exacto;

  const matchNum = t.match(/\d+/);
  if (matchNum) {
    const num = matchNum[0];
    const porNum = maquinas.find(m => m.nombre.includes(num) || m.id.includes(num));
    if (porNum) return porNum;
  }

  const contiene = maquinas.find(m => m.nombre.toLowerCase().includes(t));
  return contiene || maquinas[0];
}

/**
 * Ejecuta la acción determinada de forma atómica y transaccional.
 */
export async function ejecutarAccionVoz(
  firestore: Firestore,
  sucursalId: string,
  usuarioId: string,
  accion: AsistenteVozOutput,
  contexto: {
    mesas: Mesa[];
    productos: (Producto | ProductoVirtual)[];
    tarifas: Tarifa[];
    clientes?: string[];
    maquinas?: GeneralesTragamonedas[];
  }
): Promise<ResultadoEjecucionVoz> {
  const sid = validarSucursal(sucursalId);

  switch (accion.tipoAccion) {
    // ==========================================
    // 1. INICIAR MESA (LIBRE O DEFINIDO)
    // ==========================================
    case 'INICIAR_MESA': {
      if (!accion.numeroMesa) {
        return {
          exito: false,
          tipoAccion: accion.tipoAccion,
          mensaje: 'No se especificó el número de mesa a iniciar.',
          mensajeVoz: 'No logré identificar qué número de mesa deseas iniciar.',
        };
      }

      const mesa = contexto.mesas.find(m => m.numeroMesa === accion.numeroMesa);
      if (!mesa) {
        return {
          exito: false,
          tipoAccion: accion.tipoAccion,
          mensaje: `La Mesa #${accion.numeroMesa} no existe en esta sucursal.`,
          mensajeVoz: `No encontré la Mesa número ${accion.numeroMesa}.`,
        };
      }

      if (mesa.estado === 'ocupado') {
        return {
          exito: false,
          tipoAccion: accion.tipoAccion,
          mensaje: `La Mesa #${accion.numeroMesa} ya se encuentra ocupada.`,
          mensajeVoz: `La Mesa ${accion.numeroMesa} ya está ocupada en este momento.`,
        };
      }

      const tarifa = contexto.tarifas.find(t => t.id === mesa.tarifaId) || contexto.tarifas[0];
      if (!tarifa) {
        return {
          exito: false,
          tipoAccion: accion.tipoAccion,
          mensaje: `La Mesa #${accion.numeroMesa} no tiene tarifa asignada.`,
          mensajeVoz: `La Mesa ${accion.numeroMesa} no tiene tarifa configurada.`,
        };
      }

      const modo = accion.modoJuego || 'libre';
      const duracion = modo === 'definido' ? (accion.minutosDefinidos || 60) : 0;

      await iniciarSesion({
        firestore,
        sucursalId: sid,
        usuarioId,
        mesaId: mesa.id,
        numeroMesa: mesa.numeroMesa,
        modoJuego: modo,
        pagadoDeContado: false,
        duracionDefinida: duracion,
        tarifa,
        numControles: 0,
        serverOffset: 0,
      });

      return {
        exito: true,
        tipoAccion: accion.tipoAccion,
        mensaje: `Mesa #${mesa.numeroMesa} iniciada en modo ${modo === 'libre' ? 'Libre' : `Definido (${duracion} min)`}.`,
        mensajeVoz: accion.mensajeVoz || `Listo, se inició la Mesa ${mesa.numeroMesa}.`,
      };
    }

    // ==========================================
    // 2. AJUSTAR / AGREGAR TIEMPO A MESA
    // ==========================================
    case 'AJUSTAR_TIEMPO_MESA': {
      if (!accion.numeroMesa) {
        return { exito: false, tipoAccion: accion.tipoAccion, mensaje: 'Número de mesa no especificado.', mensajeVoz: '¿A qué mesa deseas agregarle tiempo?' };
      }
      const mesa = contexto.mesas.find(m => m.numeroMesa === accion.numeroMesa);
      if (!mesa || mesa.estado !== 'ocupado') {
        return { exito: false, tipoAccion: accion.tipoAccion, mensaje: `La Mesa #${accion.numeroMesa} no tiene una sesión activa.`, mensajeVoz: `La Mesa ${accion.numeroMesa} no está ocupada.` };
      }

      const minutosParaAnadir = accion.minutosDefinidos || 30;
      await ajustarTiempoDefinido(firestore, sid, usuarioId, mesa.id, minutosParaAnadir, false, 0);

      return {
        exito: true,
        tipoAccion: accion.tipoAccion,
        mensaje: `Se agregaron +${minutosParaAnadir} minutos a la Mesa #${mesa.numeroMesa}.`,
        mensajeVoz: accion.mensajeVoz || `Listo, agregué ${minutosParaAnadir} minutos a la Mesa ${mesa.numeroMesa}.`,
      };
    }

    // ==========================================
    // 3. TRASLADAR MESA
    // ==========================================
    case 'TRASLADAR_MESA': {
      if (!accion.numeroMesa || !accion.numeroMesaDestino) {
        return { exito: false, tipoAccion: accion.tipoAccion, mensaje: 'Se requiere mesa de origen y mesa de destino.', mensajeVoz: 'Debes indicar la mesa de origen y la mesa de destino.' };
      }
      const origen = contexto.mesas.find(m => m.numeroMesa === accion.numeroMesa);
      const destino = contexto.mesas.find(m => m.numeroMesa === accion.numeroMesaDestino);

      if (!origen || origen.estado !== 'ocupado') {
        return { exito: false, tipoAccion: accion.tipoAccion, mensaje: `Mesa de origen #${accion.numeroMesa} no está ocupada.`, mensajeVoz: `La Mesa ${accion.numeroMesa} no tiene una sesión activa.` };
      }
      if (!destino || destino.estado !== 'disponible') {
        return { exito: false, tipoAccion: accion.tipoAccion, mensaje: `Mesa de destino #${accion.numeroMesaDestino} no está libre.`, mensajeVoz: `La Mesa ${accion.numeroMesaDestino} no está disponible.` };
      }

      await trasladarMesa(firestore, sid, origen.id, destino.id, usuarioId);

      return {
        exito: true,
        tipoAccion: accion.tipoAccion,
        mensaje: `Mesa #${origen.numeroMesa} trasladada con éxito a Mesa #${destino.numeroMesa}.`,
        mensajeVoz: accion.mensajeVoz || `Listo, trasladé la Mesa ${origen.numeroMesa} a la Mesa ${destino.numeroMesa}.`,
      };
    }

    // ==========================================
    // 4. COBRAR / CERRAR MESA
    // ==========================================
    case 'COBRAR_MESA': {
      if (!accion.numeroMesa) {
        return { exito: false, tipoAccion: accion.tipoAccion, mensaje: 'Número de mesa no especificado.', mensajeVoz: '¿Qué mesa deseas cobrar?' };
      }
      const mesa = contexto.mesas.find(m => m.numeroMesa === accion.numeroMesa);
      if (!mesa || mesa.estado !== 'ocupado') {
        return { exito: false, tipoAccion: accion.tipoAccion, mensaje: `La Mesa #${accion.numeroMesa} no está ocupada.`, mensajeVoz: `La Mesa ${accion.numeroMesa} no está ocupada.` };
      }

      const tarifa = contexto.tarifas.find(t => t.id === mesa.tarifaId) || contexto.tarifas[0];
      const ms = mesa.horaInicio ? Math.max(0, Date.now() - toDate(mesa.horaInicio).getTime()) : 0;
      const costoAlquiler = calcularCostoAlquiler(Math.floor(ms / 1000), tarifa, mesa.numControles || 0);
      const metodo = accion.metodoPago || 'Efectivo';

      await procesarVentaTiempoDeMesa(firestore, sid, mesa, usuarioId, costoAlquiler, metodo, 0);

      return {
        exito: true,
        tipoAccion: accion.tipoAccion,
        mensaje: `Mesa #${mesa.numeroMesa} cobrada y cerrada exitosamente (${metodo}).`,
        mensajeVoz: accion.mensajeVoz || `Listo, cobré y cerré la Mesa ${mesa.numeroMesa} en ${metodo}.`,
      };
    }

    // ==========================================
    // 5. PASAR MESA A CUENTA DE CLIENTE
    // ==========================================
    case 'PASAR_MESA_A_CUENTA': {
      if (!accion.numeroMesa || !accion.nombreCliente) {
        return { exito: false, tipoAccion: accion.tipoAccion, mensaje: 'Se requiere el número de mesa y el nombre del cliente.', mensajeVoz: 'Indica qué mesa y a qué cliente deseas cargarla.' };
      }
      const mesa = contexto.mesas.find(m => m.numeroMesa === accion.numeroMesa);
      if (!mesa || mesa.estado !== 'ocupado') {
        return { exito: false, tipoAccion: accion.tipoAccion, mensaje: `La Mesa #${accion.numeroMesa} no está ocupada.`, mensajeVoz: `La Mesa ${accion.numeroMesa} no está ocupada.` };
      }

      // Buscar cliente en Firestore
      const nomC = accion.nombreCliente.toLowerCase().trim();
      const qCl = query(collection(firestore, `sucursales/${sid}/clientes`), where('nombre', '>=', nomC), limit(10));
      const clSnap = await getDocs(qCl);
      let clienteDoc = clSnap.docs.find(d => d.data().nombre.toLowerCase().includes(nomC));

      if (!clienteDoc) {
        const qAll = query(collection(firestore, `sucursales/${sid}/clientes`), limit(50));
        const allSnap = await getDocs(qAll);
        clienteDoc = allSnap.docs.find(d => d.data().nombre.toLowerCase().includes(nomC));
      }

      if (!clienteDoc) {
        return {
          exito: false,
          tipoAccion: accion.tipoAccion,
          mensaje: `No se encontró al cliente "${accion.nombreCliente}" en el registro.`,
          mensajeVoz: `No encontré ningún cliente llamado ${accion.nombreCliente}.`,
        };
      }

      const clienteId = clienteDoc.id;
      const tarifa = contexto.tarifas.find(t => t.id === mesa.tarifaId) || contexto.tarifas[0];
      const ms = mesa.horaInicio ? Math.max(0, Date.now() - toDate(mesa.horaInicio).getTime()) : 0;
      const costoAlquiler = calcularCostoAlquiler(Math.floor(ms / 1000), tarifa, mesa.numControles || 0);
      const costoConsumo = (mesa.consumos || []).reduce((acc: number, c: any) => acc + (c.total || 0), 0);

      await pasarACuenta(firestore, sid, usuarioId, mesa, costoAlquiler, costoConsumo, clienteId, 0);

      return {
        exito: true,
        tipoAccion: accion.tipoAccion,
        mensaje: `La cuenta de Mesa #${mesa.numeroMesa} fue transferida a ${clienteDoc.data().nombre}.`,
        mensajeVoz: accion.mensajeVoz || `Listo, cargué la cuenta de la Mesa ${mesa.numeroMesa} a ${clienteDoc.data().nombre}.`,
      };
    }

    // ==========================================
    // 6. AGREGAR CONSUMO A MESA
    // ==========================================
    case 'AGREGAR_CONSUMO_MESA': {
      if (!accion.numeroMesa) {
        return { exito: false, tipoAccion: accion.tipoAccion, mensaje: 'No se indicó el número de mesa.', mensajeVoz: '¿A qué mesa deseas cargar el consumo?' };
      }
      const mesa = contexto.mesas.find(m => m.numeroMesa === accion.numeroMesa);
      if (!mesa || mesa.estado !== 'ocupado') {
        return { exito: false, tipoAccion: accion.tipoAccion, mensaje: `La Mesa #${accion.numeroMesa} no está ocupada.`, mensajeVoz: `La Mesa ${accion.numeroMesa} está libre.` };
      }

      const prod = buscarProducto(accion.nombreProducto || '', contexto.productos);
      if (!prod) {
        return { exito: false, tipoAccion: accion.tipoAccion, mensaje: `Producto "${accion.nombreProducto}" no encontrado.`, mensajeVoz: `No encontré el producto en el catálogo.` };
      }

      const cantidad = Math.max(1, Math.floor(accion.cantidad || 1));
      const esVirtual = 'esVirtual' in prod ? !!(prod as any).esVirtual : false;
      const precioUnitario = 'precioVenta' in prod ? (prod as Producto).precioVenta : (prod as any).precio || 0;
      const totalItem = precioUnitario * cantidad;

      const itemId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const nuevoConsumo = {
        id: itemId,
        idProducto: prod.id,
        nombreProducto: prod.nombre,
        cantidad,
        precioUnitario,
        total: totalItem,
        fechaAgregado: Timestamp.now(),
        esVirtual,
      };

      await runTransaction(firestore, async (transaction) => {
        const mesaRef = doc(firestore, `sucursales/${sid}/mesas_de_billar`, mesa.id);
        const mesaDoc = await transaction.get(mesaRef);
        if (!mesaDoc.exists() || mesaDoc.data()?.estado !== 'ocupado') throw new Error('Mesa no disponible');

        const consumosActuales = mesaDoc.data()?.consumos || [];
        transaction.update(mesaRef, { consumos: [...consumosActuales, nuevoConsumo] });

        if (!esVirtual) {
          transaction.update(doc(firestore, `sucursales/${sid}/productos`, prod.id), { existencia: increment(-cantidad) });
        }

        registrarAuditoria(firestore, sid, {
          usuarioId,
          categoria: 'MESAS',
          accion: 'MESA_CONSUMO_AGREGADO',
          titulo: `Consumo por Voz en Mesa #${mesa.numeroMesa}`,
          descripcion: `Agregado: ${cantidad}x ${prod.nombre} (Q${totalItem.toFixed(2)})`,
          detalles: { mesaId: mesa.id, numeroMesa: mesa.numeroMesa, producto: prod.nombre, cantidad, total: totalItem },
        }, transaction);
      });

      return {
        exito: true,
        tipoAccion: accion.tipoAccion,
        mensaje: `Se cargaron ${cantidad}x ${prod.nombre} a la Mesa #${mesa.numeroMesa}.`,
        mensajeVoz: accion.mensajeVoz || `Listo, agregué ${cantidad} ${prod.nombre} a la Mesa ${mesa.numeroMesa}.`,
      };
    }

    // ==========================================
    // 7. ELIMINAR CONSUMO DE MESA
    // ==========================================
    case 'ELIMINAR_CONSUMO_MESA': {
      if (!accion.numeroMesa) {
        return { exito: false, tipoAccion: accion.tipoAccion, mensaje: 'Número de mesa no especificado.', mensajeVoz: '¿De qué mesa deseas eliminar el consumo?' };
      }
      const mesa = contexto.mesas.find(m => m.numeroMesa === accion.numeroMesa);
      if (!mesa || mesa.estado !== 'ocupado') {
        return { exito: false, tipoAccion: accion.tipoAccion, mensaje: `La Mesa #${accion.numeroMesa} no está ocupada.`, mensajeVoz: `La Mesa ${accion.numeroMesa} no está ocupada.` };
      }

      const prodBuscado = accion.nombreProducto?.toLowerCase().trim() || '';
      const consumos = mesa.consumos || [];
      const item = consumos.find((c: any) => c.nombreProducto.toLowerCase().includes(prodBuscado));

      if (!item) {
        return {
          exito: false,
          tipoAccion: accion.tipoAccion,
          mensaje: `No se encontró "${accion.nombreProducto}" entre los consumos de la Mesa #${mesa.numeroMesa}.`,
          mensajeVoz: `No encontré ese producto cargado en la Mesa ${mesa.numeroMesa}.`,
        };
      }

      await eliminarConsumoMesa(firestore, sid, mesa.id, item.id, usuarioId);

      return {
        exito: true,
        tipoAccion: accion.tipoAccion,
        mensaje: `Se eliminó 1x ${item.nombreProducto} de la Mesa #${mesa.numeroMesa} y se restauró a stock.`,
        mensajeVoz: accion.mensajeVoz || `Listo, eliminé ${item.nombreProducto} de la Mesa ${mesa.numeroMesa}.`,
      };
    }

    // ==========================================
    // 8. VENTA RÁPIDA (POS)
    // ==========================================
    case 'VENTA_RAPIDA': {
      const prod = buscarProducto(accion.nombreProducto || '', contexto.productos);
      if (!prod) {
        return { exito: false, tipoAccion: accion.tipoAccion, mensaje: `Producto "${accion.nombreProducto}" no encontrado.`, mensajeVoz: 'No encontré ese producto en el catálogo.' };
      }

      const cantidad = Math.max(1, Math.floor(accion.cantidad || 1));
      const esVirtual = 'esVirtual' in prod ? !!(prod as any).esVirtual : false;

      await procesarVentaRapidaConId(
        firestore,
        sid,
        usuarioId,
        { cantidad, nombreProducto: prod.nombre },
        prod.id,
        prod,
        esVirtual
      );

      return {
        exito: true,
        tipoAccion: accion.tipoAccion,
        mensaje: `Venta rápida de ${cantidad}x ${prod.nombre} procesada en efectivo.`,
        mensajeVoz: accion.mensajeVoz || `Listo, registré la venta de ${cantidad} ${prod.nombre} en efectivo.`,
      };
    }

    // ==========================================
    // 9. AGREGAR CONSUMO A CUENTA DE CLIENTE
    // ==========================================
    case 'AGREGAR_CONSUMO_CUENTA': {
      const nomC = accion.nombreCliente?.trim();
      if (!nomC) {
        return { exito: false, tipoAccion: accion.tipoAccion, mensaje: 'Cliente no especificado.', mensajeVoz: '¿A qué cliente deseas cargar el consumo?' };
      }

      const prod = buscarProducto(accion.nombreProducto || '', contexto.productos);
      if (!prod) {
        return { exito: false, tipoAccion: accion.tipoAccion, mensaje: `Producto "${accion.nombreProducto}" no encontrado.`, mensajeVoz: 'No encontré el producto en el catálogo.' };
      }

      const cantidad = Math.max(1, Math.floor(accion.cantidad || 1));
      const esVirtual = 'esVirtual' in prod ? !!(prod as any).esVirtual : false;
      const precioUnitario = 'precioVenta' in prod ? (prod as Producto).precioVenta : (prod as any).precio || 0;
      const totalItem = precioUnitario * cantidad;

      // Buscar cliente o venta existente
      const qVentas = query(collection(firestore, `sucursales/${sid}/ventas`), where('estado', '==', 'Pendiente de pago'), limit(50));
      const vSnap = await getDocs(qVentas);
      const ventaExistenteDoc = vSnap.docs.find(d => (d.data().nombreCliente || '').toLowerCase().includes(nomC.toLowerCase()));

      let finalClienteId = ventaExistenteDoc?.data()?.clienteId || 'cliente-voz';
      let finalNombreCliente = ventaExistenteDoc?.data()?.nombreCliente || nomC;

      if (!ventaExistenteDoc) {
        const qCl = query(collection(firestore, `sucursales/${sid}/clientes`), limit(50));
        const clSnap = await getDocs(qCl);
        const matchC = clSnap.docs.find(d => (d.data().nombre || '').toLowerCase().includes(nomC.toLowerCase()));
        if (matchC) {
          finalClienteId = matchC.id;
          finalNombreCliente = matchC.data().nombre;
        }
      }

      await runTransaction(firestore, async (transaction) => {
        const corrVentaRef = doc(firestore, `sucursales/${sid}/correlativos`, 'ventas');
        const corrDetalleRef = doc(firestore, `sucursales/${sid}/correlativos`, 'ventas_detalles');
        const [corrVentaDoc, corrDetalleDoc] = await Promise.all([transaction.get(corrVentaRef), transaction.get(corrDetalleRef)]);

        let siguienteIdDetalle = (corrDetalleDoc.data()?.correlativo || 0) + 1;
        const nuevoDetalle: DetalleVenta = {
          idDetalle: siguienteIdDetalle,
          idProducto: prod.id,
          nombreProducto: prod.nombre,
          cantidad,
          precioUnitario,
          subtotal: totalItem,
          saldo: totalItem,
          pagadoEfectivo: 0,
          pagadoTarjeta: 0,
          metodoPago: null,
          estado: 'Pendiente de pago',
          fechaAgregado: Timestamp.now(),
          esVirtual,
        };

        if (ventaExistenteDoc) {
          const vData = ventaExistenteDoc.data() as Venta;
          transaction.update(ventaExistenteDoc.ref, {
            detalles: [...(vData.detalles || []), nuevoDetalle],
            total: (vData.total || 0) + totalItem,
            saldo: (vData.saldo || 0) + totalItem,
          });
        } else {
          const siguienteIdVenta = (corrVentaDoc.data()?.correlativo || 0) + 1;
          const nuevaVentaDoc = doc(firestore, `sucursales/${sid}/ventas`, siguienteIdVenta.toString());
          transaction.set(nuevaVentaDoc, {
            idVenta: siguienteIdVenta,
            sucursalId: sid,
            fecha: serverTimestamp(),
            clienteId: finalClienteId,
            nombreCliente: finalNombreCliente,
            total: totalItem,
            saldo: totalItem,
            tipoVenta: 'POS',
            metodoPago: null,
            estado: 'Pendiente de pago',
            detalles: [nuevoDetalle],
          });
          transaction.set(corrVentaRef, { correlativo: siguienteIdVenta }, { merge: true });
        }

        if (!esVirtual) {
          transaction.update(doc(firestore, `sucursales/${sid}/productos`, prod.id), { existencia: increment(-cantidad) });
        }
        transaction.set(corrDetalleRef, { correlativo: siguienteIdDetalle }, { merge: true });
      });

      return {
        exito: true,
        tipoAccion: accion.tipoAccion,
        mensaje: `Se cargaron ${cantidad}x ${prod.nombre} a la cuenta de ${finalNombreCliente}.`,
        mensajeVoz: accion.mensajeVoz || `Listo, cargué ${cantidad} ${prod.nombre} a la cuenta de ${finalNombreCliente}.`,
      };
    }

    // ==========================================
    // 10. COBRAR CUENTA DE CLIENTE
    // ==========================================
    case 'COBRAR_CUENTA_CLIENTE': {
      const nomC = accion.nombreCliente?.toLowerCase().trim();
      if (!nomC) {
        return { exito: false, tipoAccion: accion.tipoAccion, mensaje: 'Cliente no especificado.', mensajeVoz: '¿La cuenta de qué cliente deseas cobrar?' };
      }

      const qVentas = query(collection(firestore, `sucursales/${sid}/ventas`), where('estado', '==', 'Pendiente de pago'));
      const snap = await getDocs(qVentas);
      const ventaDoc = snap.docs.find(d => (d.data().nombreCliente || '').toLowerCase().includes(nomC));

      if (!ventaDoc) {
        return {
          exito: false,
          tipoAccion: accion.tipoAccion,
          mensaje: `No hay cuentas pendientes de pago para "${accion.nombreCliente}".`,
          mensajeVoz: `No encontré ninguna cuenta pendiente para ${accion.nombreCliente}.`,
        };
      }

      const vData = ventaDoc.data() as Venta;
      const metodo = accion.metodoPago || 'Efectivo';
      const montoTotal = vData.saldo || vData.total || 0;

      await runTransaction(firestore, async (transaction) => {
        const corrPagoRef = doc(firestore, `sucursales/${sid}/correlativos`, 'pagos');
        const generalesRef = doc(firestore, `sucursales/${sid}/generales`, 'actual');
        const [corrPagoDoc] = await Promise.all([transaction.get(corrPagoRef)]);
        const nuevoIdPago = (corrPagoDoc.data()?.correlativo || 0) + 1;

        transaction.update(ventaDoc.ref, {
          estado: 'Pagada',
          saldo: 0,
          metodoPago: metodo,
        });

        transaction.set(doc(firestore, `sucursales/${sid}/pagos`, nuevoIdPago.toString()), {
          idPago: nuevoIdPago,
          sucursalId: sid,
          fecha: serverTimestamp(),
          idVenta: vData.idVenta,
          ventaDocId: ventaDoc.id,
          clienteNombre: vData.nombreCliente,
          montoTotalPagado: montoTotal,
          ventaTotal: vData.total,
          metodoPago: metodo,
          usuarioId,
          itemsSaldados: (vData.detalles || []).map(d => ({
            idDetalle: d.idDetalle,
            nombreProducto: d.nombreProducto,
            montoAplicado: d.subtotal,
            subtotalItem: d.subtotal,
            cantidad: d.cantidad,
          })),
        });

        if (metodo === 'Efectivo') transaction.update(generalesRef, { totalEfectivo: increment(montoTotal) });
        else transaction.update(generalesRef, { totalVentasTarjeta: increment(montoTotal) });

        transaction.set(corrPagoRef, { correlativo: nuevoIdPago }, { merge: true });

        registrarAuditoria(firestore, sid, {
          usuarioId,
          categoria: 'VENTAS',
          accion: 'VENTA_COBRADA',
          titulo: `Cobro de Cuenta: ${vData.nombreCliente}`,
          descripcion: `Cuenta cobrada: Q${montoTotal.toFixed(2)} (${metodo})`,
          detalles: { cliente: vData.nombreCliente, total: montoTotal, metodo },
        }, transaction);
      });

      return {
        exito: true,
        tipoAccion: accion.tipoAccion,
        mensaje: `La cuenta de ${vData.nombreCliente} fue cobrada en ${metodo} (Total: Q${montoTotal.toFixed(2)}).`,
        mensajeVoz: accion.mensajeVoz || `Listo, cobré la cuenta de ${vData.nombreCliente} por Q${montoTotal.toFixed(2)} en ${metodo}.`,
      };
    }

    // ==========================================
    // 11. CONSULTAR CUENTA DE CLIENTE
    // ==========================================
    case 'CONSULTAR_CUENTA_CLIENTE': {
      const nomC = accion.nombreCliente?.toLowerCase().trim();
      const qVentas = query(collection(firestore, `sucursales/${sid}/ventas`), where('estado', '==', 'Pendiente de pago'));
      const snap = await getDocs(qVentas);
      const ventaDoc = snap.docs.find(d => (d.data().nombreCliente || '').toLowerCase().includes(nomC || ''));

      if (!ventaDoc) {
        return {
          exito: true,
          tipoAccion: accion.tipoAccion,
          mensaje: `${accion.nombreCliente} no tiene saldos pendientes de pago.`,
          mensajeVoz: `${accion.nombreCliente} no tiene ninguna cuenta pendiente.`,
        };
      }

      const vData = ventaDoc.data() as Venta;
      const total = vData.saldo || vData.total || 0;
      const count = vData.detalles?.length || 0;
      return {
        exito: true,
        tipoAccion: accion.tipoAccion,
        mensaje: `Cuenta de ${vData.nombreCliente}: Saldo pendiente Q${total.toFixed(2)} (${count} consumos).`,
        mensajeVoz: `La cuenta de ${vData.nombreCliente} tiene un saldo de Q${total.toFixed(2)} con ${count} productos.`,
      };
    }

    // ==========================================
    // 12. TRAGAMONEDAS: BASE
    // ==========================================
    case 'TRAGAMONEDAS_BASE': {
      const maquina = buscarMaquinaEnContexto(accion.maquinaNombre, contexto.maquinas);
      if (!maquina) {
        return { exito: false, tipoAccion: accion.tipoAccion, mensaje: 'No hay máquinas tragamonedas registradas.', mensajeVoz: 'No encontré máquinas registradas.' };
      }
      const montoBase = accion.monto || 50;
      await registrarBaseTragamonedas(firestore, sid, maquina.id, montoBase, usuarioId);

      return {
        exito: true,
        tipoAccion: accion.tipoAccion,
        mensaje: `Se agregaron Q${montoBase} de base a ${maquina.nombre}.`,
        mensajeVoz: accion.mensajeVoz || `Listo, registré Q${montoBase} de base en la ${maquina.nombre}.`,
      };
    }

    // ==========================================
    // 13. TRAGAMONEDAS: EXTRACCIÓN
    // ==========================================
    case 'TRAGAMONEDAS_EXTRACCION': {
      const maquina = buscarMaquinaEnContexto(accion.maquinaNombre, contexto.maquinas);
      if (!maquina) {
        return { exito: false, tipoAccion: accion.tipoAccion, mensaje: 'No hay máquinas tragamonedas registradas.', mensajeVoz: 'No encontré máquinas registradas.' };
      }
      const montoExtraccion = accion.monto || 50;
      await registrarExtraccionTragamonedas(firestore, sid, maquina.id, montoExtraccion, usuarioId);

      return {
        exito: true,
        tipoAccion: accion.tipoAccion,
        mensaje: `Se extrajeron Q${montoExtraccion} de ${maquina.nombre}.`,
        mensajeVoz: accion.mensajeVoz || `Listo, registré extracción de Q${montoExtraccion} en la ${maquina.nombre}.`,
      };
    }

    // ==========================================
    // 14. TRAGAMONEDAS: PREMIO
    // ==========================================
    case 'TRAGAMONEDAS_PREMIO': {
      const maquina = buscarMaquinaEnContexto(accion.maquinaNombre, contexto.maquinas);
      if (!maquina) {
        return { exito: false, tipoAccion: accion.tipoAccion, mensaje: 'No hay máquinas tragamonedas registradas.', mensajeVoz: 'No encontré máquinas registradas.' };
      }
      const montoPremio = accion.monto || 20;
      await registrarPagoPremioTragamonedas(firestore, sid, { maquinaId: maquina.id, tipoPago: 'total', monto: montoPremio }, usuarioId);

      return {
        exito: true,
        tipoAccion: accion.tipoAccion,
        mensaje: `Se registró premio pagado por Q${montoPremio} en ${maquina.nombre}.`,
        mensajeVoz: accion.mensajeVoz || `Listo, registré el premio de Q${montoPremio} en la ${maquina.nombre}.`,
      };
    }

    // ==========================================
    // 15. TRAGAMONEDAS: CONSULTA
    // ==========================================
    case 'CONSULTAR_TRAGAMONEDAS': {
      const maquinas = contexto.maquinas || [];
      const totalBase = maquinas.reduce((acc, m) => acc + (m.totalBase || 0), 0);
      const totalExt = maquinas.reduce((acc, m) => acc + (m.totalExtraccion || 0), 0);
      const totalDeuda = maquinas.reduce((acc, m) => acc + (m.totalDeuda || 0), 0);

      const msj = `Hay ${maquinas.length} máquinas: Base total Q${totalBase.toFixed(0)}, Extracciones Q${totalExt.toFixed(0)}, Deuda Q${totalDeuda.toFixed(0)}.`;
      return {
        exito: true,
        tipoAccion: accion.tipoAccion,
        mensaje: msj,
        mensajeVoz: `Tienes ${maquinas.length} máquinas tragamonedas con Q${totalBase.toFixed(0)} de base y Q${totalExt.toFixed(0)} de extracciones acumuladas.`,
      };
    }

    // ==========================================
    // 16. CONSULTAR ESTADO DE MESA
    // ==========================================
    case 'CONSULTAR_ESTADO_MESA': {
      if (accion.numeroMesa) {
        const mesa = contexto.mesas.find(m => m.numeroMesa === accion.numeroMesa);
        if (!mesa) return { exito: false, tipoAccion: accion.tipoAccion, mensaje: `Mesa #${accion.numeroMesa} no existe.`, mensajeVoz: `No encontré la Mesa ${accion.numeroMesa}.` };

        if (mesa.estado === 'disponible') {
          return { exito: true, tipoAccion: accion.tipoAccion, mensaje: `La Mesa #${mesa.numeroMesa} está disponible y lista para iniciar.`, mensajeVoz: `La Mesa ${mesa.numeroMesa} está libre.` };
        }

        const ms = mesa.horaInicio ? Math.max(0, Date.now() - toDate(mesa.horaInicio).getTime()) : 0;
        const mins = Math.floor(ms / 60000);
        const consumos = mesa.consumos?.length || 0;
        return {
          exito: true,
          tipoAccion: accion.tipoAccion,
          mensaje: `Mesa #${mesa.numeroMesa} ocupada (${mesa.modoJuego || 'Libre'}). Tiempo: ${mins} min. Consumos: ${consumos}.`,
          mensajeVoz: `La Mesa ${mesa.numeroMesa} lleva ${mins} minutos y tiene ${consumos} consumos agregados.`,
        };
      }

      const libres = contexto.mesas.filter(m => m.estado === 'disponible').map(m => m.numeroMesa);
      const ocupadas = contexto.mesas.filter(m => m.estado === 'ocupado').map(m => m.numeroMesa);
      return {
        exito: true,
        tipoAccion: accion.tipoAccion,
        mensaje: `Mesas libres: ${libres.length ? libres.join(', ') : 'Ninguna'}. Ocupadas: ${ocupadas.length ? ocupadas.join(', ') : 'Ninguna'}.`,
        mensajeVoz: `Tienes ${libres.length} mesas libres y ${ocupadas.length} ocupadas.`,
      };
    }

    case 'CONSULTA_GENERAL':
    default: {
      return {
        exito: true,
        tipoAccion: accion.tipoAccion,
        mensaje: accion.explicacion || accion.mensajeVoz,
        mensajeVoz: accion.mensajeVoz || 'Entendido.',
      };
    }
  }
}
