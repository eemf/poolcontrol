'use client';

/**
 * @fileOverview Ejecutor transaccional seguro y multi-sucursal para las acciones decididas por el Asistente de Voz.
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
} from 'firebase/firestore';
import type { Mesa, Tarifa, Producto, ProductoVirtual, DetalleVenta, Venta } from '@/lib/tipos';
import { validarSucursal } from './utils';
import { iniciarSesion } from './mesas';
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
 * Normaliza y busca un producto por coincidencia de texto
 */
function buscarProducto(
  termino: string,
  productos: (Producto | ProductoVirtual)[]
): (Producto | ProductoVirtual) | null {
  if (!termino || !productos.length) return null;
  const t = termino.toLowerCase().trim();

  // 1. Coincidencia exacta
  const exacto = productos.find(p => p.nombre.toLowerCase().trim() === t);
  if (exacto) return exacto;

  // 2. Coincidencia por inclusión de palabra clave
  const contiene = productos.find(p => p.nombre.toLowerCase().includes(t) || t.includes(p.nombre.toLowerCase()));
  if (contiene) return contiene;

  // 3. Coincidencia por tokens/palabras
  const palabras = t.split(/\s+/);
  const porTokens = productos.find(p => {
    const pNom = p.nombre.toLowerCase();
    return palabras.some(w => w.length > 2 && pNom.includes(w));
  });

  return porTokens || null;
}

/**
 * Ejecuta la acción determinada por la IA de forma segura y transaccional
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
  }
): Promise<ResultadoEjecucionVoz> {
  const sid = validarSucursal(sucursalId);

  switch (accion.tipoAccion) {
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

      const tarifa = contexto.tarifas.find(t => t.id === mesa.tarifaId);
      if (!tarifa) {
        return {
          exito: false,
          tipoAccion: accion.tipoAccion,
          mensaje: `La Mesa #${accion.numeroMesa} no tiene una tarifa configurada.`,
          mensajeVoz: `La Mesa ${accion.numeroMesa} no tiene tarifa asignada.`,
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

    case 'AGREGAR_CONSUMO_MESA': {
      if (!accion.numeroMesa) {
        return {
          exito: false,
          tipoAccion: accion.tipoAccion,
          mensaje: 'No se indicó el número de mesa para cargar el consumo.',
          mensajeVoz: '¿A qué número de mesa deseas cargar el consumo?',
        };
      }

      const mesa = contexto.mesas.find(m => m.numeroMesa === accion.numeroMesa);
      if (!mesa) {
        return {
          exito: false,
          tipoAccion: accion.tipoAccion,
          mensaje: `La Mesa #${accion.numeroMesa} no existe.`,
          mensajeVoz: `No encontré la Mesa número ${accion.numeroMesa}.`,
        };
      }

      if (mesa.estado !== 'ocupado') {
        return {
          exito: false,
          tipoAccion: accion.tipoAccion,
          mensaje: `La Mesa #${accion.numeroMesa} está disponible. Primero debe iniciarse para cargar consumos.`,
          mensajeVoz: `La Mesa ${accion.numeroMesa} está libre. Debes iniciarla antes de cargarle consumos.`,
        };
      }

      const prod = buscarProducto(accion.nombreProducto || '', contexto.productos);
      if (!prod) {
        return {
          exito: false,
          tipoAccion: accion.tipoAccion,
          mensaje: `No se encontró el producto "${accion.nombreProducto || ''}" en el catálogo.`,
          mensajeVoz: `No encontré el producto ${accion.nombreProducto || ''} en el catálogo.`,
        };
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
        if (!mesaDoc.exists()) throw new Error('La mesa no existe.');
        if (mesaDoc.data()?.estado !== 'ocupado') throw new Error('La mesa ya no está ocupada.');

        const consumosActuales = mesaDoc.data()?.consumos || [];
        transaction.update(mesaRef, {
          consumos: [...consumosActuales, nuevoConsumo],
        });

        // Descontar inventario
        if (!esVirtual) {
          const prodRef = doc(firestore, `sucursales/${sid}/productos`, prod.id);
          transaction.update(prodRef, { existencia: increment(-cantidad) });
        }

        registrarAuditoria(
          firestore,
          sid,
          {
            usuarioId,
            categoria: 'mesas',
            accion: 'mesa_consumo_agregado',
            titulo: `Consumo por Voz en Mesa #${mesa.numeroMesa}`,
            descripcion: `Agregado: ${cantidad}x ${prod.nombre} (Q${totalItem.toFixed(2)}) vía Asistente de Voz`,
            detalles: {
              mesaId: mesa.id,
              numeroMesa: mesa.numeroMesa,
              productoId: prod.id,
              productoNombre: prod.nombre,
              cantidad,
              total: totalItem,
              origen: 'asistente_voz',
            },
          },
          transaction
        );
      });

      return {
        exito: true,
        tipoAccion: accion.tipoAccion,
        mensaje: `Se agregaron ${cantidad}x ${prod.nombre} a la Mesa #${mesa.numeroMesa}.`,
        mensajeVoz: accion.mensajeVoz || `Listo, cargué ${cantidad} ${prod.nombre} a la Mesa ${mesa.numeroMesa}.`,
      };
    }

    case 'AGREGAR_CONSUMO_CUENTA': {
      const nombreCliente = accion.nombreCliente?.trim();
      if (!nombreCliente) {
        return {
          exito: false,
          tipoAccion: accion.tipoAccion,
          mensaje: 'No se indicó el nombre del cliente para la cuenta.',
          mensajeVoz: '¿A nombre de qué cliente debo cargar el consumo?',
        };
      }

      const prod = buscarProducto(accion.nombreProducto || '', contexto.productos);
      if (!prod) {
        return {
          exito: false,
          tipoAccion: accion.tipoAccion,
          mensaje: `No se encontró el producto "${accion.nombreProducto || ''}".`,
          mensajeVoz: `No encontré el producto ${accion.nombreProducto || ''}.`,
        };
      }

      const cantidad = Math.max(1, Math.floor(accion.cantidad || 1));
      const esVirtual = 'esVirtual' in prod ? !!(prod as any).esVirtual : false;
      const precioUnitario = 'precioVenta' in prod ? (prod as Producto).precioVenta : (prod as any).precio || 0;
      const subtotalItem = precioUnitario * cantidad;

      // Buscar si el cliente ya tiene una venta pendiente (cuenta abierta)
      const qCuentas = query(
        collection(firestore, `sucursales/${sid}/ventas`),
        where('estado', '==', 'Pendiente de pago')
      );
      const snapshot = await getDocs(qCuentas);
      const ventaClienteDoc = snapshot.docs.find(d => {
        const nom = (d.data()?.nombreCliente || '').toLowerCase();
        return nom.includes(nombreCliente.toLowerCase()) || nombreCliente.toLowerCase().includes(nom);
      });

      await runTransaction(firestore, async (transaction) => {
        const corrDetalleRef = doc(firestore, `sucursales/${sid}/correlativos`, 'ventas_detalles');
        const corrVentaRef = doc(firestore, `sucursales/${sid}/correlativos`, 'ventas');

        const [corrDetDoc, corrVentaDoc] = await Promise.all([
          transaction.get(corrDetalleRef),
          transaction.get(corrVentaRef),
        ]);

        const nextIdDetalle = (corrDetDoc.data()?.correlativo || 0) + 1;
        const nuevoDetalle: DetalleVenta = {
          idDetalle: nextIdDetalle,
          idProducto: prod.id,
          nombreProducto: prod.nombre,
          cantidad,
          precioUnitario,
          subtotal: subtotalItem,
          saldo: subtotalItem,
          pagadoEfectivo: 0,
          pagadoTarjeta: 0,
          metodoPago: null,
          estado: 'Pendiente de pago',
          fechaAgregado: Timestamp.now(),
          esVirtual,
        };

        let ventaIdFinal: string;
        if (ventaClienteDoc && ventaClienteDoc.exists()) {
          // Actualizar cuenta abierta existente
          const ventaData = ventaClienteDoc.data() as Venta;
          transaction.update(ventaClienteDoc.ref, {
            total: increment(subtotalItem),
            saldo: increment(subtotalItem),
            detalles: [...ventaData.detalles, nuevoDetalle],
          });
          ventaIdFinal = ventaClienteDoc.id;
        } else {
          // Crear nueva cuenta abierta para este cliente
          const nextIdVenta = (corrVentaDoc.data()?.correlativo || 0) + 1;
          const nuevaVentaRef = doc(firestore, `sucursales/${sid}/ventas`, nextIdVenta.toString());
          transaction.set(nuevaVentaRef, {
            idVenta: nextIdVenta,
            sucursalId: sid,
            fecha: serverTimestamp(),
            clienteId: '0',
            nombreCliente,
            total: subtotalItem,
            saldo: subtotalItem,
            tipoVenta: 'POS',
            estado: 'Pendiente de pago',
            detalles: [nuevoDetalle],
          });
          transaction.set(corrVentaRef, { correlativo: nextIdVenta }, { merge: true });
          ventaIdFinal = nextIdVenta.toString();
        }

        transaction.set(corrDetalleRef, { correlativo: nextIdDetalle }, { merge: true });

        // Descontar inventario físico
        if (!esVirtual) {
          const prodRef = doc(firestore, `sucursales/${sid}/productos`, prod.id);
          transaction.update(prodRef, { existencia: increment(-cantidad) });
        }

        registrarAuditoria(
          firestore,
          sid,
          {
            usuarioId,
            categoria: 'ventas',
            accion: 'producto_agregado',
            titulo: `Consumo cargado a cuenta de ${nombreCliente}`,
            descripcion: `${cantidad}x ${prod.nombre} (Q${subtotalItem.toFixed(2)}) cargado a cuenta #${ventaIdFinal}`,
            detalles: {
              ventaId: ventaIdFinal,
              nombreCliente,
              productoId: prod.id,
              productoNombre: prod.nombre,
              cantidad,
              subtotal: subtotalItem,
              origen: 'asistente_voz',
            },
          },
          transaction
        );
      });

      return {
        exito: true,
        tipoAccion: accion.tipoAccion,
        mensaje: `Se agregaron ${cantidad}x ${prod.nombre} a la cuenta de ${nombreCliente}.`,
        mensajeVoz: accion.mensajeVoz || `Listo, cargué ${cantidad} ${prod.nombre} a la cuenta de ${nombreCliente}.`,
      };
    }

    case 'CONSULTAR_ESTADO_MESA': {
      if (!accion.numeroMesa) {
        return {
          exito: true,
          tipoAccion: accion.tipoAccion,
          mensaje: accion.explicacion || 'No se indicó la mesa.',
          mensajeVoz: accion.mensajeVoz || '¿De qué mesa deseas consultar el estado?',
        };
      }

      const mesa = contexto.mesas.find(m => m.numeroMesa === accion.numeroMesa);
      if (!mesa) {
        return {
          exito: false,
          tipoAccion: accion.tipoAccion,
          mensaje: `La Mesa #${accion.numeroMesa} no existe.`,
          mensajeVoz: `No encontré la Mesa número ${accion.numeroMesa}.`,
        };
      }

      const totalConsumos = (mesa.consumos || []).reduce((acc: number, c: any) => acc + (c.total || 0), 0);
      const desc = mesa.estado === 'ocupado'
        ? `Mesa #${mesa.numeroMesa} ocupada (${mesa.modoJuego || 'Libre'}). Consumos acumulados: Q${totalConsumos.toFixed(2)}.`
        : `Mesa #${mesa.numeroMesa} disponible.`;

      return {
        exito: true,
        tipoAccion: accion.tipoAccion,
        mensaje: desc,
        mensajeVoz: accion.mensajeVoz || desc,
      };
    }

    case 'CONSULTA_GENERAL':
    default: {
      return {
        exito: true,
        tipoAccion: accion.tipoAccion,
        mensaje: accion.explicacion || accion.mensajeVoz,
        mensajeVoz: accion.mensajeVoz || 'Comando procesado.',
      };
    }
  }
}
