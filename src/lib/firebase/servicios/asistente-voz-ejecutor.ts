/**
 * @fileOverview Ejecutor centralizado y transaccional para comandos de voz de Pool Control.
 * Optimizado, simplificado y modularizado sin pérdida de funcionalidad.
 */

import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  runTransaction,
  Timestamp,
  updateDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { validarSucursal, toDate } from './utils';
import type {
  Mesa,
  Producto,
  ProductoVirtual,
  Tarifa,
  GeneralesTragamonedas,
  DetalleVenta,
  Venta,
} from '@/lib/tipos';
import {
  iniciarSesion,
  ajustarTiempoDefinido,
  trasladarMesa,
  procesarVentaTiempoDeMesa,
  pasarACuenta,
  eliminarConsumoMesa,
  procesarPagoDivision,
} from './mesas';
import { guardarCliente } from './clientes';
import { procesarVentaRapidaConId } from './ventas';
import { registrarAbonoACuenta, registrarAbonoGeneral } from './pagos';
import {
  registrarBaseTragamonedas,
  registrarExtraccionTragamonedas,
  registrarPagoPremioTragamonedas,
} from './tragamonedas';
import { registrarAuditoria } from './auditoria';
import type { AsistenteVozOutput } from '@/ai/flows/asistente-voz';

export interface AccionConfirmable {
  tipo: 'CREAR_CLIENTE_Y_CARGAR_CONSUMO' | 'CREAR_CLIENTE_Y_PASAR_MESA';
  nombreCliente: string;
  detalles?: string;
  datos: any;
}

export interface ResultadoEjecucionVoz {
  exito: boolean;
  tipoAccion: string;
  mensaje: string;
  mensajeVoz: string;
  deshacer?: () => Promise<void>;
  requiereConfirmacion?: boolean;
  accionConfirmable?: AccionConfirmable;
  motorUtilizado?: 'api_groq' | 'motor_local';
}

const ESTADO_MESA_DISPONIBLE = {
  estado: 'disponible',
  horaInicio: null,
  horaFin: null,
  modoJuego: null,
  tiempoDefinido: null,
  alquilerPagado: false,
  montoACobrar: null,
  clienteId: null,
  nombreCliente: null,
  consumos: [],
  ajustesDeTiempo: [],
  alarmaAck: false,
  numControles: 0,
  idVentaPrepagada: null,
};

// ==========================================
// HELPERS DE CÁLCULO Y RESOLUCIÓN
// ==========================================

function calcularCostoAlquiler(segundos: number, tarifa: Tarifa, numControles: number = 0): number {
  if (!tarifa) return 0;
  const tarifaPorHoraTotal = (tarifa.precioBasePorHora || 0) + (numControles * (tarifa.costoControlExtraPorHora || 0));

  if (tarifa.tipoDeCalculo === 'Por hora') {
    const minutos = Math.ceil(segundos / 60);
    return Math.ceil(minutos / 60) * tarifaPorHoraTotal;
  }
  if (tarifa.tipoDeCalculo === 'Por fracción') {
    const minutos = Math.ceil(segundos / 60);
    return Math.ceil(minutos / 30) * (tarifaPorHoraTotal / 2);
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

function calcularCostoAlquilerMesa(mesa: Mesa, tarifas: Tarifa[], serverOffset: number = 0): number {
  const costoAjustes = (mesa.ajustesDeTiempo || [])
    .filter((a: any) => !a.pagado)
    .reduce((acc: number, a: any) => acc + (a.monto || 0), 0);

  if (mesa.alquilerPagado) return costoAjustes;

  let costoBase = 0;
  if (mesa.modoJuego === 'libre') {
    const tarifa = tarifas.find(t => t.id === mesa.tarifaId) || tarifas[0];
    const ms = mesa.horaInicio ? Math.max(0, (Date.now() + serverOffset) - toDate(mesa.horaInicio).getTime()) : 0;
    costoBase = calcularCostoAlquiler(Math.floor(ms / 1000), tarifa, mesa.numControles || 0);
  } else {
    costoBase = mesa.montoACobrar || 0;
  }
  return costoBase + costoAjustes;
}

function buscarProducto(
  termino: string,
  productos: (Producto | ProductoVirtual)[]
): (Producto | ProductoVirtual) | null {
  if (!termino || !productos.length) return null;
  const tNorm = termino.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  const porCodigo = productos.find(p => p.codigoBusqueda && p.codigoBusqueda.toLowerCase().trim() === tNorm);
  if (porCodigo) return porCodigo;

  const exacto = productos.find(p => p.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim() === tNorm);
  if (exacto) return exacto;

  const tSingular = tNorm.endsWith('s') ? tNorm.replace(/(?:es|s)$/, '') : tNorm;
  const porInicio = productos.find(p => {
    const pNorm = p.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    return pNorm.startsWith(tNorm) || pNorm.startsWith(tSingular);
  });
  if (porInicio) return porInicio;

  const contiene = productos.find(p => {
    const pNorm = p.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    return pNorm.includes(tNorm) || tNorm.includes(pNorm);
  });
  if (contiene) return contiene;

  const palabras = tNorm.split(/\s+/).filter(w => w.length > 2);
  const porTokens = productos.find(p => {
    const pNorm = p.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return palabras.some(w => pNorm.includes(w));
  });
  return porTokens || null;
}

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

function calcularDistanciaLevenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}

interface ClienteEncontrado {
  id: string;
  nombre: string;
}

async function buscarCliente(
  firestore: Firestore,
  sid: string,
  nombreBuscado: string
): Promise<ClienteEncontrado | null> {
  const normBuscado = nombreBuscado.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  if (!normBuscado) return null;

  const clSnap = await getDocs(collection(firestore, `sucursales/${sid}/clientes`));
  const clientes = clSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

  const exacto = clientes.find(c => (c.nombre || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim() === normBuscado);
  if (exacto) return { id: exacto.id, nombre: exacto.nombre };

  const porPalabra = clientes.find(c => {
    const palabras = (c.nombre || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().split(/\s+/);
    return palabras.includes(normBuscado);
  });
  if (porPalabra) return { id: porPalabra.id, nombre: porPalabra.nombre };

  const contiene = clientes.find(c => {
    const n = (c.nombre || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    return n.includes(normBuscado) || normBuscado.includes(n);
  });
  if (contiene) return { id: contiene.id, nombre: contiene.nombre };

  let mejorCoincidencia: { id: string; nombre: string; dist: number } | null = null;
  for (const c of clientes) {
    const n = (c.nombre || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const d = calcularDistanciaLevenshtein(normBuscado, n);
    if (d <= 2 && (!mejorCoincidencia || d < mejorCoincidencia.dist)) {
      mejorCoincidencia = { id: c.id, nombre: c.nombre, dist: d };
    }
  }
  if (mejorCoincidencia) return { id: mejorCoincidencia.id, nombre: mejorCoincidencia.nombre };

  // Buscar también en ventas pendientes de pago por si el cliente tiene cuenta abierta
  try {
    const qVentas = query(
      collection(firestore, `sucursales/${sid}/ventas`),
      where('estado', '==', 'Pendiente de pago')
    );
    const snapVentas = await getDocs(qVentas);
    for (const vDoc of snapVentas.docs) {
      const data = vDoc.data();
      const n = (data.nombreCliente || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      if (n === normBuscado || n.split(/\s+/).includes(normBuscado) || n.includes(normBuscado) || normBuscado.includes(n)) {
        return { id: data.clienteId || vDoc.id, nombre: data.nombreCliente };
      }
    }
  } catch (errV) {
    console.warn('Error buscando cliente en ventas pendientes:', errV);
  }

  return null;
}

async function buscarVentaPendienteDeCliente(
  firestore: Firestore,
  sid: string,
  clienteId?: string,
  nombreCliente?: string
) {
  if (clienteId) {
    const qVentas = query(
      collection(firestore, `sucursales/${sid}/ventas`),
      where('clienteId', '==', clienteId),
      where('estado', '==', 'Pendiente de pago')
    );
    const snap = await getDocs(qVentas);
    if (!snap.empty) return snap.docs[0];
  }
  if (!nombreCliente) return null;

  const normBuscado = nombreCliente.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const qVentas = query(
    collection(firestore, `sucursales/${sid}/ventas`),
    where('estado', '==', 'Pendiente de pago')
  );
  const snapVentas = await getDocs(qVentas);
  for (const vDoc of snapVentas.docs) {
    const data = vDoc.data();
    const n = (data.nombreCliente || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    if (n === normBuscado || n.split(/\s+/).includes(normBuscado) || n.includes(normBuscado) || normBuscado.includes(n)) {
      return vDoc;
    }
  }
  return null;
}

async function obtenerEstadoDeudaCliente(
  firestore: Firestore,
  sid: string,
  clienteId: string,
  nombreCliente: string
) {
  const ventaAbiertaDoc = await buscarVentaPendienteDeCliente(firestore, sid, clienteId, nombreCliente);
  const deudaVentaAbierta = ventaAbiertaDoc ? ((ventaAbiertaDoc.data() as Venta).saldo || 0) : 0;
  const consumosAbiertosCount = ventaAbiertaDoc ? ((ventaAbiertaDoc.data() as Venta).detalles?.length || 0) : 0;

  const qCredito = query(
    collection(firestore, `sucursales/${sid}/ventas`),
    where('clienteId', '==', clienteId),
    where('estado', '==', 'credito')
  );
  const creditSnap = await getDocs(qCredito);
  let creditDocs = creditSnap.docs;

  if (creditDocs.length === 0 && nombreCliente) {
    const qCreditoNom = query(
      collection(firestore, `sucursales/${sid}/ventas`),
      where('nombreCliente', '==', nombreCliente),
      where('estado', '==', 'credito')
    );
    const snapNom = await getDocs(qCreditoNom);
    creditDocs = snapNom.docs;
  }

  const creditDocsValidos = creditDocs.filter(d => {
    if (ventaAbiertaDoc && d.id === ventaAbiertaDoc.id) return false;
    return ((d.data() as Venta).saldo || 0) > 0;
  });

  const deudaCreditos = creditDocsValidos.reduce((acc, d) => acc + ((d.data() as Venta).saldo || 0), 0);
  const consumosCreditosCount = creditDocsValidos.reduce((acc, d) => acc + ((d.data() as Venta).detalles?.length || 0), 0);

  return {
    ventaAbiertaDoc,
    deudaVentaAbierta,
    creditDocsValidos,
    deudaCreditos,
    deudaTotal: deudaVentaAbierta + deudaCreditos,
    totalConsumosCount: consumosAbiertosCount + consumosCreditosCount,
  };
}

interface ItemResuelto {
  productoId: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  totalItem: number;
  esVirtual: boolean;
  productoOriginal: Producto | ProductoVirtual;
}

function resolverItemsPedido(
  items: Array<{ nombreProducto?: string; cantidad?: number }> | undefined,
  nombreProductoFallback: string | undefined,
  cantidadFallback: number | undefined,
  catalogo: (Producto | ProductoVirtual)[]
): {
  items: ItemResuelto[];
  noEncontrados: string[];
  total: number;
  resumen: string;
} {
  const itemsEntrada = (items && items.length > 0)
    ? items
    : (nombreProductoFallback ? [{ nombreProducto: nombreProductoFallback, cantidad: cantidadFallback || 1 }] : []);

  if (itemsEntrada.length === 0) {
    return { items: [], noEncontrados: [], total: 0, resumen: '' };
  }

  const itemsResueltos: ItemResuelto[] = [];
  const noEncontrados: string[] = [];

  for (const it of itemsEntrada) {
    const prod = buscarProducto(it.nombreProducto || '', catalogo);
    if (!prod) {
      noEncontrados.push(it.nombreProducto || 'desconocido');
    } else {
      const cantidad = Math.max(1, Math.floor(it.cantidad || 1));
      const esVirtual = 'esVirtual' in prod ? !!(prod as any).esVirtual : false;
      const precioUnitario = 'precioVenta' in prod ? (prod as Producto).precioVenta : (prod as any).precio || 0;
      itemsResueltos.push({
        productoId: prod.id,
        nombreProducto: prod.nombre,
        cantidad,
        precioUnitario,
        totalItem: precioUnitario * cantidad,
        esVirtual,
        productoOriginal: prod,
      });
    }
  }

  const total = itemsResueltos.reduce((acc, curr) => acc + curr.totalItem, 0);
  const resumen = itemsResueltos.map(i => `${i.cantidad}x ${i.nombreProducto}`).join(', ');

  return { items: itemsResueltos, noEncontrados, total, resumen };
}

function obtenerMesaContexto(
  numeroMesa: number | undefined,
  mesas: Mesa[],
  tipoAccion: string,
  requiereOcupada = false
): { mesa?: Mesa; error?: ResultadoEjecucionVoz } {
  if (!numeroMesa) {
    return {
      error: {
        exito: false,
        tipoAccion,
        mensaje: 'No se indicó el número de mesa.',
        mensajeVoz: '¿A qué número de mesa te refieres?',
      },
    };
  }
  const mesa = mesas.find(m => m.numeroMesa === numeroMesa);
  if (!mesa) {
    return {
      error: {
        exito: false,
        tipoAccion,
        mensaje: `La Mesa #${numeroMesa} no existe.`,
        mensajeVoz: `No encontré la Mesa ${numeroMesa}.`,
      },
    };
  }
  if (requiereOcupada && mesa.estado !== 'ocupado') {
    return {
      error: {
        exito: false,
        tipoAccion,
        mensaje: `La Mesa #${numeroMesa} no está ocupada.`,
        mensajeVoz: `La Mesa ${numeroMesa} no tiene una sesión activa.`,
      },
    };
  }
  return { mesa };
}

async function aplicarConsumosAVentaCliente(
  firestore: Firestore,
  sid: string,
  usuarioId: string,
  clienteId: string,
  nombreCliente: string,
  items: ItemResuelto[],
  totalConsumo: number,
  resumenProductos: string,
  ventaExistenteDoc?: any
) {
  await runTransaction(firestore, async (transaction) => {
    const corrVentaRef = doc(firestore, `sucursales/${sid}/correlativos`, 'ventas');
    const corrDetalleRef = doc(firestore, `sucursales/${sid}/correlativos`, 'ventas_detalles');
    const [corrVentaDoc, corrDetalleDoc, vDoc] = await Promise.all([
      transaction.get(corrVentaRef),
      transaction.get(corrDetalleRef),
      ventaExistenteDoc ? transaction.get(ventaExistenteDoc.ref) : Promise.resolve(null),
    ]);

    let correlativoDetalleActual = corrDetalleDoc.data()?.correlativo || 0;
    const nuevosDetalles: DetalleVenta[] = [];

    for (const it of items) {
      correlativoDetalleActual++;
      nuevosDetalles.push({
        idDetalle: correlativoDetalleActual,
        idProducto: it.productoId,
        nombreProducto: it.nombreProducto,
        cantidad: it.cantidad,
        precioUnitario: it.precioUnitario,
        subtotal: it.totalItem,
        saldo: it.totalItem,
        pagadoEfectivo: 0,
        pagadoTarjeta: 0,
        metodoPago: null,
        estado: 'Pendiente de pago',
        fechaAgregado: Timestamp.now(),
        esVirtual: it.esVirtual,
      });

      if (!it.esVirtual) {
        transaction.update(doc(firestore, `sucursales/${sid}/productos`, it.productoId), {
          existencia: increment(-it.cantidad),
        });
      }
    }

    if (ventaExistenteDoc && vDoc && vDoc.exists()) {
      const vData = vDoc.data() as Venta;
      transaction.update(ventaExistenteDoc.ref, {
        detalles: [...(vData.detalles || []), ...nuevosDetalles] as any,
        total: (vData.total || 0) + totalConsumo,
        saldo: (vData.saldo || 0) + totalConsumo,
      });
    } else {
      const siguienteIdVenta = (corrVentaDoc.data()?.correlativo || 0) + 1;
      const nuevaVentaDoc = doc(firestore, `sucursales/${sid}/ventas`, siguienteIdVenta.toString());
      transaction.set(nuevaVentaDoc, {
        idVenta: siguienteIdVenta,
        sucursalId: sid,
        fecha: serverTimestamp(),
        clienteId,
        nombreCliente,
        total: totalConsumo,
        saldo: totalConsumo,
        tipoVenta: 'POS',
        metodoPago: null,
        estado: 'Pendiente de pago',
        detalles: nuevosDetalles,
      });
      transaction.set(corrVentaRef, { correlativo: siguienteIdVenta }, { merge: true });
    }

    transaction.set(corrDetalleRef, { correlativo: correlativoDetalleActual }, { merge: true });

    registrarAuditoria(firestore, sid, {
      usuarioId,
      categoria: 'ventas',
      accion: 'credito_otorgado',
      titulo: `Consumo agregado a cuenta: ${nombreCliente}`,
      descripcion: `Productos: ${resumenProductos} (Total: Q${totalConsumo.toFixed(2)})`,
      detalles: { clienteId, nombre: nombreCliente, total: totalConsumo },
    }, transaction);
  });
}

// ==========================================
// ACCIONES CONFIRMADAS
// ==========================================

export async function ejecutarAccionConfirmada(
  firestore: Firestore,
  sucursalId: string,
  usuarioId: string,
  accionConfirmable: AccionConfirmable
): Promise<ResultadoEjecucionVoz> {
  const sid = validarSucursal(sucursalId);

  if (accionConfirmable.tipo === 'CREAR_CLIENTE_Y_CARGAR_CONSUMO') {
    const { nombreCliente, datos } = accionConfirmable;
    const nuevoCliente = await guardarCliente(firestore, sid, {
      nombre: nombreCliente,
      tipoCliente: 'Cliente',
      permiteCredito: true,
    });

    const itemsAProcesar: ItemResuelto[] = datos.items && datos.items.length > 0 ? datos.items : [datos];
    const totalConsumo = itemsAProcesar.reduce((acc, curr) => acc + curr.totalItem, 0);
    const resumenTexto = itemsAProcesar.map(i => `${i.cantidad}x ${i.nombreProducto}`).join(', ');

    await aplicarConsumosAVentaCliente(
      firestore,
      sid,
      usuarioId,
      nuevoCliente.id,
      nuevoCliente.nombre,
      itemsAProcesar,
      totalConsumo,
      resumenTexto
    );

    return {
      exito: true,
      tipoAccion: 'AGREGAR_CONSUMO_CUENTA',
      mensaje: `Cliente "${nombreCliente}" creado con éxito y ${resumenTexto} cargado a su cuenta.`,
      mensajeVoz: `Listo, creé al cliente ${nombreCliente} y cargué los consumos a su cuenta.`,
    };
  }

  if (accionConfirmable.tipo === 'CREAR_CLIENTE_Y_PASAR_MESA') {
    const { nombreCliente, datos } = accionConfirmable;
    const nuevoCliente = await guardarCliente(firestore, sid, {
      nombre: nombreCliente,
      tipoCliente: 'Cliente',
      permiteCredito: true,
    });

    await pasarACuenta(
      firestore,
      sid,
      usuarioId,
      datos.mesa,
      datos.costoAlquiler,
      datos.costoConsumo,
      nuevoCliente.id,
      0
    );

    return {
      exito: true,
      tipoAccion: 'PASAR_MESA_A_CUENTA',
      mensaje: `Cliente "${nombreCliente}" creado con éxito y cuenta de Mesa #${datos.mesa.numeroMesa} transferida.`,
      mensajeVoz: `Listo, creé al cliente ${nombreCliente} y pasé la cuenta de la mesa a su nombre.`,
    };
  }

  return {
    exito: false,
    tipoAccion: 'CONFIRMACION',
    mensaje: 'Tipo de acción confirmable no reconocido.',
    mensajeVoz: 'No se pudo procesar la confirmación.',
  };
}

// ==========================================
// MOTOR PRINCIPAL DE EJECUCIÓN
// ==========================================

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

  const ejecutarInterno = async (): Promise<ResultadoEjecucionVoz> => {
    switch (accion.tipoAccion) {
      // 1. INICIAR MESA
      case 'INICIAR_MESA': {
        const { mesa, error } = obtenerMesaContexto(accion.numeroMesa, contexto.mesas, accion.tipoAccion);
        if (error || !mesa) return error!;

        if (mesa.estado === 'ocupado') {
          return {
            exito: false,
            tipoAccion: accion.tipoAccion,
            mensaje: `La Mesa #${accion.numeroMesa} ya se encuentra ocupada.`,
            mensajeVoz: `La Mesa ${accion.numeroMesa} ya está ocupada.`,
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
        const esContado = accion.pagadoDeContado === true;

        await iniciarSesion({
          firestore,
          sucursalId: sid,
          usuarioId,
          mesaId: mesa.id,
          numeroMesa: mesa.numeroMesa,
          modoJuego: modo,
          pagadoDeContado: esContado,
          duracionDefinida: duracion,
          tarifa,
          numControles: 0,
          serverOffset: 0,
        });

        const detalleContado = esContado ? ' (Pagado de Contado)' : '';
        return {
          exito: true,
          tipoAccion: accion.tipoAccion,
          mensaje: `Mesa #${mesa.numeroMesa} iniciada en modo ${modo === 'libre' ? 'Libre' : `Definido (${duracion} min)`}${detalleContado}.`,
          mensajeVoz: accion.mensajeVoz || (esContado
            ? `Listo, inicié ${duracion} minutos pagados de contado en la Mesa ${mesa.numeroMesa}.`
            : `Listo, se inició la Mesa ${mesa.numeroMesa}.`),
        };
      }

      // 2. AJUSTAR TIEMPO MESA
      case 'AJUSTAR_TIEMPO_MESA': {
        const { mesa, error } = obtenerMesaContexto(accion.numeroMesa, contexto.mesas, accion.tipoAccion, true);
        if (error || !mesa) return error!;

        const minutos = accion.minutosDefinidos || 30;
        await ajustarTiempoDefinido(firestore, sid, usuarioId, mesa.id, minutos, false, 0);

        return {
          exito: true,
          tipoAccion: accion.tipoAccion,
          mensaje: `Se agregaron +${minutos} minutos a la Mesa #${mesa.numeroMesa}.`,
          mensajeVoz: accion.mensajeVoz || `Listo, agregué ${minutos} minutos a la Mesa ${mesa.numeroMesa}.`,
        };
      }

      // 3. TRASLADAR MESA
      case 'TRASLADAR_MESA': {
        const { mesa: origen, error: errOrigen } = obtenerMesaContexto(accion.numeroMesa, contexto.mesas, accion.tipoAccion, true);
        if (errOrigen || !origen) return errOrigen!;

        const { mesa: destino, error: errDestino } = obtenerMesaContexto(accion.numeroMesaDestino, contexto.mesas, accion.tipoAccion);
        if (errDestino || !destino) return errDestino!;

        if (destino.estado !== 'disponible') {
          return {
            exito: false,
            tipoAccion: accion.tipoAccion,
            mensaje: `Mesa de destino #${destino.numeroMesa} no está libre.`,
            mensajeVoz: `La Mesa ${destino.numeroMesa} no está disponible.`,
          };
        }

        await trasladarMesa(firestore, sid, origen.id, destino.id, usuarioId);

        return {
          exito: true,
          tipoAccion: accion.tipoAccion,
          mensaje: `Mesa #${origen.numeroMesa} trasladada con éxito a Mesa #${destino.numeroMesa}.`,
          mensajeVoz: accion.mensajeVoz || `Listo, trasladé la Mesa ${origen.numeroMesa} a la Mesa ${destino.numeroMesa}.`,
        };
      }

      // 4. COBRAR MESA
      case 'COBRAR_MESA': {
        const { mesa, error } = obtenerMesaContexto(accion.numeroMesa, contexto.mesas, accion.tipoAccion, true);
        if (error || !mesa) return error!;

        const costoAlquiler = calcularCostoAlquilerMesa(mesa, contexto.tarifas);
        const totalConsumo = (mesa.consumos || []).reduce((acc: number, c: any) => acc + (c.total || 0), 0);
        const metodo = accion.metodoPago || 'Efectivo';

        await procesarVentaTiempoDeMesa(firestore, sid, mesa, usuarioId, costoAlquiler, metodo, 0);

        let msgVoz = accion.mensajeVoz;
        if (mesa.alquilerPagado) {
          msgVoz = totalConsumo > 0
            ? `Listo, el tiempo de la Mesa ${mesa.numeroMesa} ya estaba pagado. Se cobraron Q${totalConsumo.toFixed(2)} de consumos en ${metodo}. Mesa liberada.`
            : `Listo, la Mesa ${mesa.numeroMesa} ya estaba pagada de contado. Sesión finalizada y mesa libre.`;
        } else {
          msgVoz = msgVoz || `Listo, cobré y cerré la Mesa ${mesa.numeroMesa} en ${metodo}.`;
        }

        return {
          exito: true,
          tipoAccion: accion.tipoAccion,
          mensaje: mesa.alquilerPagado
            ? `Mesa #${mesa.numeroMesa} finalizada (Prepagada${totalConsumo > 0 ? `, consumos Q${totalConsumo.toFixed(2)} cobrados` : ''}).`
            : `Mesa #${mesa.numeroMesa} cobrada y cerrada exitosamente (${metodo}).`,
          mensajeVoz: msgVoz,
        };
      }

      // 5. PASAR MESA A CUENTA
      case 'PASAR_MESA_A_CUENTA': {
        if (!accion.nombreCliente) {
          return { exito: false, tipoAccion: accion.tipoAccion, mensaje: 'Cliente no especificado.', mensajeVoz: '¿A qué cliente deseas cargar la mesa?' };
        }
        const { mesa, error } = obtenerMesaContexto(accion.numeroMesa, contexto.mesas, accion.tipoAccion, true);
        if (error || !mesa) return error!;

        const clienteEncontrado = await buscarCliente(firestore, sid, accion.nombreCliente);
        const costoAlquiler = calcularCostoAlquilerMesa(mesa, contexto.tarifas);
        const costoConsumo = (mesa.consumos || []).reduce((acc: number, c: any) => acc + (c.total || 0), 0);

        if (!clienteEncontrado) {
          return {
            exito: false,
            tipoAccion: accion.tipoAccion,
            requiereConfirmacion: true,
            accionConfirmable: {
              tipo: 'CREAR_CLIENTE_Y_PASAR_MESA',
              nombreCliente: accion.nombreCliente,
              detalles: `Se registrará al cliente y se transferirá la cuenta de la Mesa #${mesa.numeroMesa} (Alquiler: Q${costoAlquiler.toFixed(2)}, Consumos: Q${costoConsumo.toFixed(2)}).`,
              datos: { mesa, costoAlquiler, costoConsumo },
            },
            mensaje: `El cliente "${accion.nombreCliente}" no está registrado. Di "sí" o confirma para crearlo.`,
            mensajeVoz: `El cliente ${accion.nombreCliente} no existe en la base de datos. ¿Deseas crearlo y pasarle la cuenta?`,
          };
        }

        await pasarACuenta(firestore, sid, usuarioId, mesa, costoAlquiler, costoConsumo, clienteEncontrado.id, 0);

        return {
          exito: true,
          tipoAccion: accion.tipoAccion,
          mensaje: `Cuenta de Mesa #${mesa.numeroMesa} cargada a ${clienteEncontrado.nombre}.`,
          mensajeVoz: accion.mensajeVoz || `Listo, cargué la cuenta de la Mesa ${mesa.numeroMesa} a ${clienteEncontrado.nombre}.`,
        };
      }

      // 6. DIVIDIR CUENTA DE MESA
      case 'DIVIDIR_CUENTA_MESA': {
        const { mesa, error } = obtenerMesaContexto(accion.numeroMesa, contexto.mesas, accion.tipoAccion, true);
        if (error || !mesa) return error!;

        const costoAlquiler = calcularCostoAlquilerMesa(mesa, contexto.tarifas);
        const costoConsumo = (mesa.consumos || []).reduce((acc: number, c: any) => acc + (c.total || 0), 0);
        const totalGeneral = Number((costoAlquiler + costoConsumo).toFixed(2));
        const metodo = accion.metodoPago || 'Efectivo';
        const partes = Math.max(2, Math.min(20, accion.numeroPartes || 2));

        const mesaRef = doc(firestore, `sucursales/${sid}/mesas_de_billar`, mesa.id);

        if (totalGeneral <= 0) {
          await updateDoc(mesaRef, ESTADO_MESA_DISPONIBLE);
          return {
            exito: true,
            tipoAccion: accion.tipoAccion,
            mensaje: `La Mesa #${mesa.numeroMesa} ya estaba pagada de contado. Mesa liberada.`,
            mensajeVoz: `La Mesa ${mesa.numeroMesa} ya estaba pagada de contado. Sesión finalizada y mesa libre.`,
          };
        }

        const montoBase = Math.floor((totalGeneral / partes) * 100) / 100;
        for (let i = 0; i < partes; i++) {
          const montoEstaParte = (i === partes - 1)
            ? Number((totalGeneral - (montoBase * (partes - 1))).toFixed(2))
            : montoBase;
          await procesarPagoDivision(firestore, sid, usuarioId, mesa.numeroMesa, montoEstaParte, metodo, null, `Parte ${i + 1}/${partes}`);
        }

        if (mesa.idVentaPrepagada) {
          try {
            const ventaPreRef = doc(firestore, `sucursales/${sid}/ventas`, mesa.idVentaPrepagada);
            const ventaPreSnap = await getDoc(ventaPreRef);
            if (ventaPreSnap.exists()) {
              const vData = ventaPreSnap.data() as Venta;
              const detallesActualizados = (vData.detalles || []).map(d => {
                if (d.idProducto === `mesa-${mesa.id}`) {
                  return { ...d, metadata: { ...d.metadata, horaFin: Timestamp.now() } };
                }
                return d;
              });
              await updateDoc(ventaPreRef, { detalles: detallesActualizados });
            }
          } catch (ePre) {
            console.warn('No se pudo actualizar venta prepagada:', ePre);
          }
        }

        await updateDoc(mesaRef, ESTADO_MESA_DISPONIBLE);

        await registrarAuditoria(firestore, sid, {
          usuarioId,
          categoria: 'mesas',
          accion: 'mesa_cobrada',
          titulo: `Mesa #${mesa.numeroMesa} cobrada con división (${partes} partes)`,
          descripcion: `Total Q${totalGeneral.toFixed(2)} dividido en ${partes} partes (${metodo})`,
          detalles: { mesaId: mesa.id, numeroMesa: mesa.numeroMesa, total: totalGeneral, partes, metodoPago: metodo },
        });

        const montoPromedio = (totalGeneral / partes).toFixed(2);
        return {
          exito: true,
          tipoAccion: accion.tipoAccion,
          mensaje: `Mesa #${mesa.numeroMesa} dividida en ${partes} partes de ~Q${montoPromedio} cobrada (${metodo}).`,
          mensajeVoz: accion.mensajeVoz || `Listo, cobré y dividí la cuenta de la Mesa ${mesa.numeroMesa} en ${partes} partes de Q${montoPromedio} en ${metodo}. Mesa liberada.`,
        };
      }

      // 7. AGREGAR CONSUMO A MESA
      case 'AGREGAR_CONSUMO_MESA': {
        const { mesa, error } = obtenerMesaContexto(accion.numeroMesa, contexto.mesas, accion.tipoAccion, true);
        if (error || !mesa) return error!;

        const resolucion = resolverItemsPedido(accion.items, accion.nombreProducto, accion.cantidad, contexto.productos);
        if (resolucion.items.length === 0) {
          return { exito: false, tipoAccion: accion.tipoAccion, mensaje: 'No se especificó qué producto agregar.', mensajeVoz: '¿Qué producto deseas agregar a la mesa?' };
        }
        if (resolucion.noEncontrados.length > 0) {
          return {
            exito: false,
            tipoAccion: accion.tipoAccion,
            mensaje: `No se encontraron: ${resolucion.noEncontrados.join(', ')}.`,
            mensajeVoz: `No encontré ${resolucion.noEncontrados.join(', ')} en el catálogo.`,
          };
        }

        await runTransaction(firestore, async (transaction) => {
          const mesaRef = doc(firestore, `sucursales/${sid}/mesas_de_billar`, mesa.id);
          const mesaDoc = await transaction.get(mesaRef);
          if (!mesaDoc.exists() || mesaDoc.data()?.estado !== 'ocupado') throw new Error('Mesa no disponible');

          const consumosActuales = mesaDoc.data()?.consumos || [];
          const nuevosConsumos = resolucion.items.map(it => ({
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            idProducto: it.productoId,
            nombreProducto: it.nombreProducto,
            cantidad: it.cantidad,
            precioUnitario: it.precioUnitario,
            total: it.totalItem,
            fechaAgregado: Timestamp.now(),
            esVirtual: it.esVirtual,
          }));

          transaction.update(mesaRef, { consumos: [...consumosActuales, ...nuevosConsumos] });

          for (const it of resolucion.items) {
            if (!it.esVirtual) {
              transaction.update(doc(firestore, `sucursales/${sid}/productos`, it.productoId), {
                existencia: increment(-it.cantidad),
              });
            }
          }

          registrarAuditoria(firestore, sid, {
            usuarioId,
            categoria: 'mesas',
            accion: 'mesa_consumo_agregado',
            titulo: `Consumo por Voz en Mesa #${mesa.numeroMesa}`,
            descripcion: `Agregado: ${resolucion.resumen} (Total: Q${resolucion.total.toFixed(2)})`,
            detalles: { mesaId: mesa.id, numeroMesa: mesa.numeroMesa, total: resolucion.total },
          }, transaction);
        });

        return {
          exito: true,
          tipoAccion: accion.tipoAccion,
          mensaje: `Se cargaron ${resolucion.resumen} a la Mesa #${mesa.numeroMesa}.`,
          mensajeVoz: accion.mensajeVoz || `Listo, agregué ${resolucion.resumen} a la Mesa ${mesa.numeroMesa}.`,
        };
      }

      // 8. ELIMINAR CONSUMO DE MESA
      case 'ELIMINAR_CONSUMO_MESA': {
        const { mesa, error } = obtenerMesaContexto(accion.numeroMesa, contexto.mesas, accion.tipoAccion, true);
        if (error || !mesa) return error!;

        const prodBuscado = accion.nombreProducto?.toLowerCase().trim() || '';
        const item = (mesa.consumos || []).find((c: any) => c.nombreProducto.toLowerCase().includes(prodBuscado));

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

      // 9. VENTA RÁPIDA (POS)
      case 'VENTA_RAPIDA': {
        const resolucion = resolverItemsPedido(accion.items, accion.nombreProducto, accion.cantidad, contexto.productos);
        if (resolucion.items.length === 0) {
          return { exito: false, tipoAccion: accion.tipoAccion, mensaje: 'No se especificó qué producto vender.', mensajeVoz: '¿Qué producto deseas vender?' };
        }
        if (resolucion.noEncontrados.length > 0) {
          return {
            exito: false,
            tipoAccion: accion.tipoAccion,
            mensaje: `Producto no encontrado: ${resolucion.noEncontrados.join(', ')}.`,
            mensajeVoz: `No encontré ${resolucion.noEncontrados.join(', ')} en el catálogo.`,
          };
        }

        const metodo = accion.metodoPago || 'Efectivo';
        for (const it of resolucion.items) {
          await procesarVentaRapidaConId(
            firestore,
            sid,
            usuarioId,
            { cantidad: it.cantidad, nombreProducto: it.nombreProducto },
            it.productoId,
            it.productoOriginal as any,
            it.esVirtual,
            metodo
          );
        }

        return {
          exito: true,
          tipoAccion: accion.tipoAccion,
          mensaje: `Venta rápida de ${resolucion.resumen} procesada (${metodo}).`,
          mensajeVoz: accion.mensajeVoz || `Listo, registré la venta de ${resolucion.resumen} en ${metodo}.`,
        };
      }

      // 10. AGREGAR CONSUMO A CUENTA DE CLIENTE
      case 'AGREGAR_CONSUMO_CUENTA': {
        let nomC = accion.nombreCliente?.trim();
        if (!nomC) {
          try {
            const qVentasPendientes = query(
              collection(firestore, `sucursales/${sid}/ventas`),
              where('estado', '==', 'Pendiente de pago')
            );
            const snapPendientes = await getDocs(qVentasPendientes);
            if (snapPendientes.size === 1) {
              const vData = snapPendientes.docs[0].data();
              if (vData.nombreCliente) {
                nomC = vData.nombreCliente;
              }
            }
          } catch (ePend) {
            console.warn('Error verificando cuenta pendiente única:', ePend);
          }
        }

        if (!nomC) {
          return { exito: false, tipoAccion: accion.tipoAccion, mensaje: 'Cliente no especificado.', mensajeVoz: '¿A qué cliente deseas cargar el consumo?' };
        }

        const resolucion = resolverItemsPedido(accion.items, accion.nombreProducto, accion.cantidad, contexto.productos);
        if (resolucion.items.length === 0) {
          return { exito: false, tipoAccion: accion.tipoAccion, mensaje: 'No se especificó qué producto agregar.', mensajeVoz: '¿Qué producto deseas cargar a la cuenta?' };
        }
        if (resolucion.noEncontrados.length > 0) {
          return {
            exito: false,
            tipoAccion: accion.tipoAccion,
            mensaje: `No se encontraron: ${resolucion.noEncontrados.join(', ')}.`,
            mensajeVoz: `No encontré ${resolucion.noEncontrados.join(', ')} en el catálogo.`,
          };
        }

        const clienteEncontrado = await buscarCliente(firestore, sid, nomC);
        if (!clienteEncontrado) {
          return {
            exito: false,
            tipoAccion: accion.tipoAccion,
            requiereConfirmacion: true,
            accionConfirmable: {
              tipo: 'CREAR_CLIENTE_Y_CARGAR_CONSUMO',
              nombreCliente: nomC,
              detalles: `Se registrará al cliente y se cargará: ${resolucion.resumen} (Total: Q${resolucion.total.toFixed(2)}).`,
              datos: { items: resolucion.items, ...resolucion.items[0] },
            },
            mensaje: `El cliente "${nomC}" no está registrado. Di "sí" o confirma para crearlo.`,
            mensajeVoz: `El cliente ${nomC} no existe en la base de datos. ¿Deseas crearlo y cargarle el pedido?`,
          };
        }

        const ventaExistenteDoc = await buscarVentaPendienteDeCliente(firestore, sid, clienteEncontrado.id, clienteEncontrado.nombre);

        await aplicarConsumosAVentaCliente(
          firestore,
          sid,
          usuarioId,
          clienteEncontrado.id,
          clienteEncontrado.nombre,
          resolucion.items,
          resolucion.total,
          resolucion.resumen,
          ventaExistenteDoc
        );

        return {
          exito: true,
          tipoAccion: accion.tipoAccion,
          mensaje: `Se cargaron ${resolucion.resumen} a la cuenta de ${clienteEncontrado.nombre} (${ventaExistenteDoc ? 'agregado a cuenta abierta' : 'nueva cuenta creada'}).`,
          mensajeVoz: accion.mensajeVoz || `Listo, cargué ${resolucion.resumen} a la cuenta de ${clienteEncontrado.nombre}.`,
        };
      }

      // 11. COBRAR CUENTA DE CLIENTE
      case 'COBRAR_CUENTA_CLIENTE': {
        const nomC = accion.nombreCliente?.toLowerCase().trim();
        if (!nomC) {
          return { exito: false, tipoAccion: accion.tipoAccion, mensaje: 'Cliente no especificado.', mensajeVoz: '¿La cuenta de qué cliente deseas cobrar?' };
        }

        const clienteEncontrado = await buscarCliente(firestore, sid, nomC);
        const nombreMostrar = clienteEncontrado?.nombre || accion.nombreCliente;
        if (!clienteEncontrado) {
          return {
            exito: false,
            tipoAccion: accion.tipoAccion,
            mensaje: `No se encontró al cliente "${nombreMostrar}" en la base de datos.`,
            mensajeVoz: `No encontré al cliente ${nombreMostrar} en la base de datos.`,
          };
        }

        const infoDeuda = await obtenerEstadoDeudaCliente(firestore, sid, clienteEncontrado.id, clienteEncontrado.nombre);
        if (infoDeuda.deudaTotal <= 0) {
          return {
            exito: false,
            tipoAccion: accion.tipoAccion,
            mensaje: `No hay cuentas ni créditos pendientes de pago para "${nombreMostrar}".`,
            mensajeVoz: `No encontré ninguna deuda pendiente para ${nombreMostrar}.`,
          };
        }

        const metodo = accion.metodoPago || 'Efectivo';

        if (accion.cobrarTodo) {
          // Cobrar el consolidado total de cuentas y créditos
          await registrarAbonoGeneral(firestore, sid, usuarioId, {
            clienteId: clienteEncontrado.id,
            montoAbono: infoDeuda.deudaTotal,
            ventaPrincipalId: infoDeuda.ventaAbiertaDoc ? infoDeuda.ventaAbiertaDoc.id : null,
            metodoDePago: metodo,
          });

          return {
            exito: true,
            tipoAccion: accion.tipoAccion,
            mensaje: `La deuda total de ${clienteEncontrado.nombre} fue cobrada en ${metodo} (Total: Q${infoDeuda.deudaTotal.toFixed(2)}). Todas sus cuentas y créditos quedaron saldados.`,
            mensajeVoz: accion.mensajeVoz || `Listo, cobré el total de la cuenta de ${clienteEncontrado.nombre} por Q${infoDeuda.deudaTotal.toFixed(2)} en ${metodo}.`,
          };
        } else {
          // Cobrar estrictamente la cuenta actual abierta
          if (!infoDeuda.ventaAbiertaDoc || infoDeuda.deudaVentaAbierta <= 0) {
            if (infoDeuda.deudaCreditos > 0) {
              return {
                exito: false,
                tipoAccion: accion.tipoAccion,
                mensaje: `${clienteEncontrado.nombre} no tiene cuenta actual abierta, pero tiene Q${infoDeuda.deudaCreditos.toFixed(2)} en créditos pendientes. Para cobrar toda la deuda di: "cobra el total de la cuenta de ${clienteEncontrado.nombre}".`,
                mensajeVoz: `${clienteEncontrado.nombre} no tiene cuenta actual abierta, pero tiene créditos pendientes por Q${infoDeuda.deudaCreditos.toFixed(2)}. Si deseas cobrar todo di 'cobra el total de la cuenta'.`,
              };
            }
            return {
              exito: false,
              tipoAccion: accion.tipoAccion,
              mensaje: `${clienteEncontrado.nombre} no tiene cuenta pendiente de pago en este momento.`,
              mensajeVoz: `${clienteEncontrado.nombre} no tiene cuenta pendiente en este momento.`,
            };
          }

          const montoActual = infoDeuda.deudaVentaAbierta;
          await registrarAbonoACuenta(firestore, sid, infoDeuda.ventaAbiertaDoc.id, montoActual, usuarioId, metodo);

          const msjCreditos = infoDeuda.deudaCreditos > 0
            ? ` Le quedan Q${infoDeuda.deudaCreditos.toFixed(2)} en créditos pendientes.`
            : '';

          return {
            exito: true,
            tipoAccion: accion.tipoAccion,
            mensaje: `La cuenta actual de ${clienteEncontrado.nombre} fue cobrada en ${metodo} (Total: Q${montoActual.toFixed(2)}).${msjCreditos}`,
            mensajeVoz: accion.mensajeVoz || `Listo, cobré la cuenta actual de ${clienteEncontrado.nombre} por Q${montoActual.toFixed(2)} en ${metodo}.${msjCreditos}`,
          };
        }
      }

      // 12. ABONAR A CUENTA DE CLIENTE
      case 'ABONAR_CUENTA_CLIENTE': {
        const nomC = accion.nombreCliente?.toLowerCase().trim();
        if (!nomC) {
          return { exito: false, tipoAccion: accion.tipoAccion, mensaje: 'Cliente no especificado.', mensajeVoz: '¿A qué cliente deseas abonar?' };
        }

        const monto = accion.monto;
        if (!monto || monto <= 0) {
          return { exito: false, tipoAccion: accion.tipoAccion, mensaje: 'Monto de abono no válido.', mensajeVoz: '¿De cuánto es el abono que deseas realizar?' };
        }

        const clienteEncontrado = await buscarCliente(firestore, sid, nomC);
        const nombreMostrar = clienteEncontrado?.nombre || accion.nombreCliente;
        if (!clienteEncontrado) {
          return {
            exito: false,
            tipoAccion: accion.tipoAccion,
            mensaje: `No se encontró al cliente "${nombreMostrar}" en la base de datos.`,
            mensajeVoz: `No encontré al cliente ${nombreMostrar} en la base de datos.`,
          };
        }

        const infoDeuda = await obtenerEstadoDeudaCliente(firestore, sid, clienteEncontrado.id, clienteEncontrado.nombre);
        if (infoDeuda.deudaTotal <= 0) {
          return {
            exito: false,
            tipoAccion: accion.tipoAccion,
            mensaje: `El cliente ${clienteEncontrado.nombre} no tiene saldo pendiente por pagar.`,
            mensajeVoz: `${clienteEncontrado.nombre} no tiene saldo pendiente en este momento.`,
          };
        }

        if (monto > infoDeuda.deudaTotal + 0.05) {
          const detalleDeuda = infoDeuda.deudaVentaAbierta > 0 && infoDeuda.deudaCreditos > 0
            ? ` (Cuenta actual: Q${infoDeuda.deudaVentaAbierta.toFixed(2)}, Créditos: Q${infoDeuda.deudaCreditos.toFixed(2)})`
            : '';
          return {
            exito: false,
            tipoAccion: accion.tipoAccion,
            mensaje: `El abono de Q${monto.toFixed(2)} es mayor a la deuda total de Q${infoDeuda.deudaTotal.toFixed(2)} de ${clienteEncontrado.nombre}${detalleDeuda}.`,
            mensajeVoz: `El abono de Q${monto.toFixed(2)} supera la deuda total de Q${infoDeuda.deudaTotal.toFixed(2)} de ${clienteEncontrado.nombre}.`,
          };
        }

        const metodo = accion.metodoPago || 'Efectivo';

        // Abono en cascada: primero a la cuenta abierta, el excedente a los créditos más antiguos
        await registrarAbonoGeneral(firestore, sid, usuarioId, {
          clienteId: clienteEncontrado.id,
          montoAbono: monto,
          ventaPrincipalId: infoDeuda.ventaAbiertaDoc ? infoDeuda.ventaAbiertaDoc.id : null,
          metodoDePago: metodo,
        });

        const saldoRestante = Math.max(0, infoDeuda.deudaTotal - monto);
        return {
          exito: true,
          tipoAccion: accion.tipoAccion,
          mensaje: saldoRestante <= 0.01
            ? `Se abonaron Q${monto.toFixed(2)} a ${clienteEncontrado.nombre} (${metodo}). Deuda saldada por completo.`
            : `Se abonaron Q${monto.toFixed(2)} a ${clienteEncontrado.nombre} (${metodo}). Saldo total restante: Q${saldoRestante.toFixed(2)}.`,
          mensajeVoz: accion.mensajeVoz || (saldoRestante <= 0.01
            ? `Listo, registré el abono de Q${monto.toFixed(2)} a la cuenta de ${clienteEncontrado.nombre}. La deuda quedó totalmente saldada.`
            : `Listo, aboné Q${monto.toFixed(2)} a ${clienteEncontrado.nombre}. Saldo total restante: Q${saldoRestante.toFixed(2)}.`),
        };
      }

      // 13. CONSULTAR CUENTA DE CLIENTE
      case 'CONSULTAR_CUENTA_CLIENTE': {
        const nomC = accion.nombreCliente?.toLowerCase().trim();
        if (!nomC) {
          return { exito: false, tipoAccion: accion.tipoAccion, mensaje: 'Cliente no especificado.', mensajeVoz: '¿La cuenta de qué cliente deseas consultar?' };
        }

        const clienteEncontrado = await buscarCliente(firestore, sid, nomC);
        const nombreMostrar = clienteEncontrado?.nombre || accion.nombreCliente;
        if (!clienteEncontrado) {
          return {
            exito: false,
            tipoAccion: accion.tipoAccion,
            mensaje: `No se encontró al cliente "${nombreMostrar}" en la base de datos.`,
            mensajeVoz: `No encontré al cliente ${nombreMostrar} en la base de datos.`,
          };
        }

        const infoDeuda = await obtenerEstadoDeudaCliente(firestore, sid, clienteEncontrado.id, clienteEncontrado.nombre);
        if (infoDeuda.deudaTotal <= 0) {
          return {
            exito: true,
            tipoAccion: accion.tipoAccion,
            mensaje: `${clienteEncontrado.nombre} no tiene saldos pendientes de pago.`,
            mensajeVoz: `${clienteEncontrado.nombre} no tiene saldo pendiente en este momento.`,
          };
        }

        const detalleTexto = infoDeuda.deudaVentaAbierta > 0 && infoDeuda.deudaCreditos > 0
          ? ` (Cuenta actual: Q${infoDeuda.deudaVentaAbierta.toFixed(2)}, Créditos: Q${infoDeuda.deudaCreditos.toFixed(2)})`
          : '';

        return {
          exito: true,
          tipoAccion: accion.tipoAccion,
          mensaje: `Deuda total de ${clienteEncontrado.nombre}: Q${infoDeuda.deudaTotal.toFixed(2)}${detalleTexto} con ${infoDeuda.totalConsumosCount} consumos.`,
          mensajeVoz: `La deuda total de ${clienteEncontrado.nombre} es de Q${infoDeuda.deudaTotal.toFixed(2)}.`,
        };
      }

      // 14. TRAGAMONEDAS: BASE / EXTRACCIÓN / PREMIO
      case 'TRAGAMONEDAS_BASE':
      case 'TRAGAMONEDAS_EXTRACCION':
      case 'TRAGAMONEDAS_PREMIO': {
        const maquina = buscarMaquinaEnContexto(accion.maquinaNombre, contexto.maquinas);
        if (!maquina) {
          return { exito: false, tipoAccion: accion.tipoAccion, mensaje: 'No hay máquinas registradas.', mensajeVoz: 'No encontré máquinas registradas.' };
        }

        if (accion.tipoAccion === 'TRAGAMONEDAS_BASE') {
          const montoBase = accion.monto || 50;
          await registrarBaseTragamonedas(firestore, sid, maquina.id, montoBase, usuarioId);
          return {
            exito: true,
            tipoAccion: accion.tipoAccion,
            mensaje: `Se agregaron Q${montoBase} de base a ${maquina.nombre}.`,
            mensajeVoz: accion.mensajeVoz || `Listo, registré Q${montoBase} de base en la ${maquina.nombre}.`,
          };
        } else if (accion.tipoAccion === 'TRAGAMONEDAS_EXTRACCION') {
          const montoExtraccion = accion.monto || 50;
          await registrarExtraccionTragamonedas(firestore, sid, maquina.id, montoExtraccion, usuarioId);
          return {
            exito: true,
            tipoAccion: accion.tipoAccion,
            mensaje: `Se extrajeron Q${montoExtraccion} de ${maquina.nombre}.`,
            mensajeVoz: accion.mensajeVoz || `Listo, registré extracción de Q${montoExtraccion} en la ${maquina.nombre}.`,
          };
        } else {
          const montoPremio = accion.monto || 20;
          await registrarPagoPremioTragamonedas(firestore, sid, { maquinaId: maquina.id, tipoPago: 'total', monto: montoPremio }, usuarioId);
          return {
            exito: true,
            tipoAccion: accion.tipoAccion,
            mensaje: `Se registró premio pagado por Q${montoPremio} en ${maquina.nombre}.`,
            mensajeVoz: accion.mensajeVoz || `Listo, registré el premio de Q${montoPremio} en la ${maquina.nombre}.`,
          };
        }
      }

      // 15. CONSULTAR TRAGAMONEDAS
      case 'CONSULTAR_TRAGAMONEDAS': {
        const maquinas = contexto.maquinas || [];
        const totalBase = maquinas.reduce((acc, m) => acc + (m.totalBase || 0), 0);
        const totalExt = maquinas.reduce((acc, m) => acc + (m.totalExtraccion || 0), 0);
        const totalDeuda = maquinas.reduce((acc, m) => acc + (m.totalDeuda || 0), 0);

        return {
          exito: true,
          tipoAccion: accion.tipoAccion,
          mensaje: `Hay ${maquinas.length} máquinas: Base total Q${totalBase.toFixed(0)}, Extracciones Q${totalExt.toFixed(0)}, Deuda Q${totalDeuda.toFixed(0)}.`,
          mensajeVoz: `Tienes ${maquinas.length} máquinas con Q${totalBase.toFixed(0)} de base y Q${totalExt.toFixed(0)} de extracciones acumuladas.`,
        };
      }

      // 16. CONSULTAR ESTADO DE MESA
      case 'CONSULTAR_ESTADO_MESA': {
        if (accion.numeroMesa) {
          const { mesa, error } = obtenerMesaContexto(accion.numeroMesa, contexto.mesas, accion.tipoAccion);
          if (error || !mesa) return error!;

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

      // 17. NO ENTENDIDO
      case 'NO_ENTENDIDO': {
        return {
          exito: false,
          tipoAccion: 'NO_ENTENDIDO',
          mensaje: 'Comando no reconocido.',
          mensajeVoz: 'Comando no reconocido.',
        };
      }

      // 18. CONSULTA GENERAL / DEFAULT
      case 'CONSULTA_GENERAL':
      default: {
        const texto = accion.mensajeVoz || accion.explicacion || '';
        const esNoReconocido = !texto || /no reconocido|no entend/i.test(texto);
        if (esNoReconocido) {
          return {
            exito: false,
            tipoAccion: accion.tipoAccion || 'NO_ENTENDIDO',
            mensaje: 'Comando no reconocido.',
            mensajeVoz: 'Comando no reconocido.',
          };
        }
        return {
          exito: true,
          tipoAccion: accion.tipoAccion,
          mensaje: accion.explicacion || accion.mensajeVoz,
          mensajeVoz: accion.mensajeVoz || 'Entendido.',
        };
      }
    }
  };

  try {
    const resultado = await ejecutarInterno();
    if (accion.motorUtilizado) {
      resultado.motorUtilizado = accion.motorUtilizado;
    }
    return resultado;
  } catch (err: any) {
    console.error('Error al ejecutar acción de voz:', err);
    return {
      exito: false,
      tipoAccion: accion.tipoAccion,
      mensaje: err?.message || 'Error al ejecutar la acción.',
      mensajeVoz: 'Ocurrió un error al procesar el comando.',
      motorUtilizado: accion.motorUtilizado,
    };
  }
}
