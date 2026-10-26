'use client';

import {
  doc,
  runTransaction,
  Timestamp,
  Firestore,
  serverTimestamp,
  getDocs,
  collection,
  query,
  where
} from 'firebase/firestore';
import type { TrasladoInterSucursal, ItemTraslado, Producto, Compra } from '@/lib/tipos';
import { validarSucursal } from './utils';
import { registrarAuditoria } from './auditoria';
import { registrarMovimientoInventario } from './historial-inventario';

export interface InputItemTraslado {
  productoOrigenId: string;
  nombreProducto: string;
  cantidad: number;
  costoUnitario: number;
  precioVenta?: number;
}

export interface InputCrearTraslado {
  sucursalOrigenId: string;
  sucursalDestinoId: string;
  usuarioId: string;
  usuarioNombre: string;
  items: InputItemTraslado[];
  observacionesEnvio?: string;
}

/**
 * Registra y despacha un traslado de productos desde una sucursal origen hacia una sucursal destino.
 * Descuenta atómicamente el inventario de la sucursal origen y registra el movimiento de Kardex.
 */
export async function crearTrasladoInterSucursal(
  firestore: Firestore,
  data: InputCrearTraslado
): Promise<string> {
  const origenId = validarSucursal(data.sucursalOrigenId);
  const destinoId = validarSucursal(data.sucursalDestinoId);

  if (origenId === destinoId) {
    throw new Error('La sucursal de origen y destino no pueden ser la misma.');
  }

  if (!data.items || data.items.length === 0) {
    throw new Error('Debe incluir al menos un producto en el traslado.');
  }

  return runTransaction(firestore, async (transaction) => {
    // 1. FASE DE LECTURA (READS FIRST)
    const sucursalOrigenRef = doc(firestore, 'sucursales', origenId);
    const sucursalDestinoRef = doc(firestore, 'sucursales', destinoId);
    const corrTrasladosRef = doc(firestore, 'correlativos', 'traslados');
    const corrHistorialOrigenRef = doc(firestore, `sucursales/${origenId}/correlativos`, 'historial_inventario');

    // Referencias a los productos de origen
    const productRefs = data.items.map(it => doc(firestore, `sucursales/${origenId}/productos`, it.productoOrigenId));

    const [sucursalOrigenDoc, sucursalDestinoDoc, corrTrasladosDoc, corrHistorialDoc, ...productDocs] = await Promise.all([
      transaction.get(sucursalOrigenRef),
      transaction.get(sucursalDestinoRef),
      transaction.get(corrTrasladosRef),
      transaction.get(corrHistorialOrigenRef),
      ...productRefs.map(ref => transaction.get(ref))
    ]);

    if (!sucursalOrigenDoc.exists()) throw new Error('La sucursal de origen no existe.');
    if (!sucursalDestinoDoc.exists()) throw new Error('La sucursal de destino no existe.');

    const sucursalOrigenNombre = sucursalOrigenDoc.data()?.nombre || 'Sucursal Origen';
    const sucursalDestinoNombre = sucursalDestinoDoc.data()?.nombre || 'Sucursal Destino';

    // 2. FASE DE PROCESAMIENTO
    const nuevoIdTraslado = (corrTrasladosDoc.data()?.correlativo || 0) + 1;
    let sigIdHistorial = (corrHistorialDoc.data()?.correlativo || 0) + 1;

    let costoTotalTraslado = 0;
    let cantidadTotalItems = 0;
    const itemsProcesados: ItemTraslado[] = [];

    productDocs.forEach((pDoc, idx) => {
      const requestedItem = data.items[idx];
      if (!pDoc.exists()) {
        throw new Error(`El producto "${requestedItem.nombreProducto}" ya no existe en la sucursal de origen.`);
      }

      const pData = pDoc.data() as Producto;
      const stockActual = pData.existencia ?? 0;
      if (stockActual < requestedItem.cantidad) {
        throw new Error(
          `Stock insuficiente para "${pData.nombre}". Existencia disponible: ${stockActual}, solicitado para traslado: ${requestedItem.cantidad}.`
        );
      }

      const costoUnit = requestedItem.costoUnitario > 0 ? requestedItem.costoUnitario : (pData.precioCompra || 0);
      const costoTotalItem = costoUnit * requestedItem.cantidad;

      costoTotalTraslado += costoTotalItem;
      cantidadTotalItems += requestedItem.cantidad;

      itemsProcesados.push({
        productoOrigenId: requestedItem.productoOrigenId,
        nombreProducto: pData.nombre,
        cantidad: requestedItem.cantidad,
        costoUnitario: costoUnit,
        costoTotal: costoTotalItem,
        precioVenta: requestedItem.precioVenta ?? pData.precioVenta ?? 0
      });
    });

    // 3. FASE DE ESCRITURAS (WRITES LAST)
    // A. Descontar stock de origen y registrar Kardex de salida
    productDocs.forEach((pDoc, idx) => {
      const item = itemsProcesados[idx];
      const stockAnterior = pDoc.data()?.existencia || 0;
      const stockNuevo = stockAnterior - item.cantidad;

      transaction.update(pDoc.ref, { existencia: stockNuevo });

      registrarMovimientoInventario(transaction, firestore, origenId, sigIdHistorial++, {
        productoId: item.productoOrigenId,
        nombreProducto: item.nombreProducto,
        tipoMovimiento: 'Traslado Saliente',
        cantidad: -item.cantidad,
        existenciaAnterior: stockAnterior,
        existenciaNueva: stockNuevo,
        referencia: `Traslado #${nuevoIdTraslado} hacia ${sucursalDestinoNombre}`,
        usuarioId: data.usuarioId,
      });
    });

    // B. Crear documento de traslado en la colección global
    const trasladoRef = doc(firestore, 'traslados', nuevoIdTraslado.toString());
    const nuevoTraslado: Omit<TrasladoInterSucursal, 'id'> = {
      idTraslado: nuevoIdTraslado,
      sucursalOrigenId: origenId,
      sucursalOrigenNombre,
      sucursalDestinoId: destinoId,
      sucursalDestinoNombre,
      sucursalesIds: [origenId, destinoId],
      fechaEnvio: Timestamp.now(),
      usuarioEnvioId: data.usuarioId,
      usuarioEnvioNombre: data.usuarioNombre,
      estado: 'en_transito',
      items: itemsProcesados,
      costoTotalTraslado,
      cantidadTotalItems,
      observacionesEnvio: data.observacionesEnvio?.trim() || '',
      estadoLiquidacion: 'pendiente'
    };

    transaction.set(trasladoRef, nuevoTraslado);

    // C. Actualizar correlativos
    transaction.set(corrTrasladosRef, { correlativo: nuevoIdTraslado }, { merge: true });
    transaction.set(corrHistorialOrigenRef, { correlativo: sigIdHistorial - 1 }, { merge: true });

    // D. Registrar auditoría
    registrarAuditoria(firestore, origenId, {
      usuarioId: data.usuarioId,
      usuarioNombre: data.usuarioNombre,
      categoria: 'INVENTARIO',
      accion: 'TRASLADO_ENVIADO',
      titulo: `Traslado #${nuevoIdTraslado} enviado`,
      descripcion: `Envío de ${cantidadTotalItems} unidades (Costo: Q${costoTotalTraslado.toFixed(2)}) hacia ${sucursalDestinoNombre}`,
      detalles: {
        idTraslado: nuevoIdTraslado,
        destino: sucursalDestinoNombre,
        totalItems: cantidadTotalItems,
        costoTotal: costoTotalTraslado
      }
    }, transaction);

    return nuevoIdTraslado.toString();
  });
}

/**
 * Confirma la recepción de un traslado en la sucursal de destino.
 * Incrementa el inventario en destino (creando el producto si aún no existe),
 * registra el Kardex de entrada, y genera la cuenta por pagar/compra inter-sucursal.
 */
export async function recibirTrasladoInterSucursal(
  firestore: Firestore,
  trasladoId: string,
  usuarioId: string,
  usuarioNombre: string,
  observacionesRecepcion?: string,
  mapeoProductosDestino?: { [itemIndex: number]: string }
): Promise<void> {
  return runTransaction(firestore, async (transaction) => {
    // 1. FASE DE LECTURA
    const trasladoRef = doc(firestore, 'traslados', trasladoId);
    const trasladoDoc = await transaction.get(trasladoRef);

    if (!trasladoDoc.exists()) throw new Error('El traslado no existe.');
    const trasladoData = trasladoDoc.data() as TrasladoInterSucursal;

    if (trasladoData.estado !== 'en_transito') {
      throw new Error(`Este traslado ya fue ${trasladoData.estado === 'recibido' ? 'recibido anteriormente' : 'cancelado'}.`);
    }

    const destinoId = trasladoData.sucursalDestinoId;
    const origenNombre = trasladoData.sucursalOrigenNombre;

    const corrHistorialDestinoRef = doc(firestore, `sucursales/${destinoId}/correlativos`, 'historial_inventario');
    const corrComprasDestinoRef = doc(firestore, `sucursales/${destinoId}/correlativos`, 'compras');
    const corrProductosDestinoRef = doc(firestore, `sucursales/${destinoId}/correlativos`, 'productos');

    const [corrHistorialDoc, corrComprasDoc, corrProductosDoc] = await Promise.all([
      transaction.get(corrHistorialDestinoRef),
      transaction.get(corrComprasDestinoRef),
      transaction.get(corrProductosDestinoRef)
    ]);

    // Leer catálogo completo de la sucursal destino para verificar productos existentes
    const qProductosDestino = query(collection(firestore, `sucursales/${destinoId}/productos`));
    const productosDestinoSnap = await getDocs(qProductosDestino);
    const productosDestinoMap = new Map<string, { docId: string; data: Producto }>();
    const productosDestinoById = new Map<string, { docId: string; data: Producto }>();

    productosDestinoSnap.docs.forEach(d => {
      const prod = d.data() as Producto;
      productosDestinoById.set(d.id, { docId: d.id, data: prod });
      // Indexar por nombre en minúsculas para coincidencia limpia
      productosDestinoMap.set(prod.nombre.trim().toLowerCase(), { docId: d.id, data: prod });
      if (prod.codigoBusqueda) {
        productosDestinoMap.set(prod.codigoBusqueda.trim().toLowerCase(), { docId: d.id, data: prod });
      }
    });

    // 2. FASE DE PROCESAMIENTO
    let sigIdHistorial = (corrHistorialDoc.data()?.correlativo || 0) + 1;
    const nuevoIdCompra = (corrComprasDoc.data()?.correlativo || 0) + 1;
    let sigIdProducto = (corrProductosDoc.data()?.correlativo || 0) + 1;

    const itemsActualizados = [...trasladoData.items];

    // 3. FASE DE ESCRITURAS
    // A. Actualizar o crear productos en sucursal destino y registrar Kardex de entrada
    for (let i = 0; i < itemsActualizados.length; i++) {
      const item = itemsActualizados[i];
      const targetIdExplicito = mapeoProductosDestino?.[i];

      let existingProduct: { docId: string; data: Producto } | undefined;

      if (targetIdExplicito && targetIdExplicito !== '__nuevo__') {
        existingProduct = productosDestinoById.get(targetIdExplicito);
      } else if (!targetIdExplicito) {
        // Coincidencia automática por nombre o código
        const matchKey = item.nombreProducto.trim().toLowerCase();
        existingProduct = productosDestinoMap.get(matchKey);
      }

      let targetProductRef: any;
      let stockAnterior = 0;
      let stockNuevo = 0;
      let nombreProductoLocal = item.nombreProducto;

      if (existingProduct) {
        targetProductRef = doc(firestore, `sucursales/${destinoId}/productos`, existingProduct.docId);
        stockAnterior = existingProduct.data.existencia || 0;
        stockNuevo = stockAnterior + item.cantidad;
        nombreProductoLocal = existingProduct.data.nombre;

        transaction.update(targetProductRef, {
          existencia: stockNuevo,
          precioCompra: item.costoUnitario > 0 ? item.costoUnitario : existingProduct.data.precioCompra
        });

        itemsActualizados[i].productoDestinoId = existingProduct.docId;
        itemsActualizados[i].nombreProductoDestino = existingProduct.data.nombre;
      } else {
        // El producto no existía en la sucursal de destino: crearlo automáticamente
        const nuevoDocId = sigIdProducto.toString();
        targetProductRef = doc(firestore, `sucursales/${destinoId}/productos`, nuevoDocId);
        stockAnterior = 0;
        stockNuevo = item.cantidad;

        const nuevoProducto: Producto = {
          id: nuevoDocId,
          idProducto: sigIdProducto,
          nombre: item.nombreProducto,
          precioCompra: item.costoUnitario,
          precioVenta: item.precioVenta && item.precioVenta > 0 ? item.precioVenta : Math.round(item.costoUnitario * 1.3),
          existencia: stockNuevo,
          ubicacion: 'General'
        };

        transaction.set(targetProductRef, nuevoProducto);
        itemsActualizados[i].productoDestinoId = nuevoDocId;
        itemsActualizados[i].nombreProductoDestino = item.nombreProducto;
        sigIdProducto++;
      }

      // Registrar movimiento de Kardex en destino usando el nombre local
      const refKardex = nombreProductoLocal.trim().toLowerCase() !== item.nombreProducto.trim().toLowerCase()
        ? `Traslado #${trasladoData.idTraslado} (${item.nombreProducto}) desde ${origenNombre}`
        : `Traslado #${trasladoData.idTraslado} desde ${origenNombre}`;

      registrarMovimientoInventario(transaction, firestore, destinoId, sigIdHistorial++, {
        productoId: targetProductRef.id,
        nombreProducto: nombreProductoLocal,
        tipoMovimiento: 'Traslado Entrante',
        cantidad: item.cantidad,
        existenciaAnterior: stockAnterior,
        existenciaNueva: stockNuevo,
        referencia: refKardex,
        usuarioId,
      });
    }

    // B. Generar la cuenta por pagar / compra inter-sucursal en la sucursal destino
    const compraRef = doc(firestore, `sucursales/${destinoId}/compras`, nuevoIdCompra.toString());
    const compraInterSucursal: Compra = {
      id: nuevoIdCompra.toString(),
      idCompra: nuevoIdCompra,
      sucursalId: destinoId,
      fecha: Timestamp.now(),
      proveedorNombre: `Traslado: ${origenNombre}`,
      items: itemsActualizados.map(it => ({
        tipo: 'producto',
        productoId: it.productoDestinoId,
        nombreProducto: it.nombreProductoDestino || it.nombreProducto,
        cantidad: it.cantidad,
        costoUnitario: it.costoUnitario
      })),
      montoTotal: trasladoData.costoTotalTraslado,
      usuarioId,
      estado: 'Pendiente'
    };
    transaction.set(compraRef, compraInterSucursal);

    // C. Actualizar estado del documento de traslado
    transaction.update(trasladoRef, {
      estado: 'recibido',
      fechaRecepcion: Timestamp.now(),
      usuarioRecepcionId: usuarioId,
      usuarioRecepcionNombre: usuarioNombre,
      observacionesRecepcion: observacionesRecepcion?.trim() || '',
      idCompraGeneradaDestino: nuevoIdCompra.toString(),
      items: itemsActualizados
    });

    // D. Actualizar correlativos en sucursal destino
    transaction.set(corrHistorialDestinoRef, { correlativo: sigIdHistorial - 1 }, { merge: true });
    transaction.set(corrComprasDestinoRef, { correlativo: nuevoIdCompra }, { merge: true });
    if (sigIdProducto > ((corrProductosDoc.data()?.correlativo || 0) + 1)) {
      transaction.set(corrProductosDestinoRef, { correlativo: sigIdProducto - 1 }, { merge: true });
    }

    // E. Registrar auditoría en destino
    registrarAuditoria(firestore, destinoId, {
      usuarioId,
      usuarioNombre,
      categoria: 'INVENTARIO',
      accion: 'TRASLADO_RECIBIDO',
      titulo: `Traslado #${trasladoData.idTraslado} recibido`,
      descripcion: `Ingreso de ${trasladoData.cantidadTotalItems} unidades desde ${origenNombre}. Compra #${nuevoIdCompra} generada por Q${trasladoData.costoTotalTraslado.toFixed(2)}`,
      detalles: {
        idTraslado: trasladoData.idTraslado,
        origen: origenNombre,
        idCompraGenerada: nuevoIdCompra,
        costoTotal: trasladoData.costoTotalTraslado
      }
    }, transaction);
  });
}

/**
 * Cancela un traslado en tránsito y reintegra el stock a la sucursal de origen.
 */
export async function cancelarTrasladoInterSucursal(
  firestore: Firestore,
  trasladoId: string,
  usuarioId: string,
  usuarioNombre: string,
  motivoCancelacion?: string
): Promise<void> {
  return runTransaction(firestore, async (transaction) => {
    const trasladoRef = doc(firestore, 'traslados', trasladoId);
    const trasladoDoc = await transaction.get(trasladoRef);

    if (!trasladoDoc.exists()) throw new Error('El traslado no existe.');
    const trasladoData = trasladoDoc.data() as TrasladoInterSucursal;

    if (trasladoData.estado !== 'en_transito') {
      throw new Error(`Solo se pueden cancelar traslados en tránsito. El estado actual es "${trasladoData.estado}".`);
    }

    const origenId = trasladoData.sucursalOrigenId;
    const corrHistorialOrigenRef = doc(firestore, `sucursales/${origenId}/correlativos`, 'historial_inventario');

    const productRefs = trasladoData.items.map(it => doc(firestore, `sucursales/${origenId}/productos`, it.productoOrigenId));

    const [corrHistorialDoc, ...productDocs] = await Promise.all([
      transaction.get(corrHistorialOrigenRef),
      ...productRefs.map(ref => transaction.get(ref))
    ]);

    let sigIdHistorial = (corrHistorialDoc.data()?.correlativo || 0) + 1;

    // Reintegrar stock a la sucursal de origen
    productDocs.forEach((pDoc, idx) => {
      const item = trasladoData.items[idx];
      if (pDoc.exists()) {
        const stockAnt = pDoc.data()?.existencia || 0;
        const stockNue = stockAnt + item.cantidad;

        transaction.update(pDoc.ref, { existencia: stockNue });

        registrarMovimientoInventario(transaction, firestore, origenId, sigIdHistorial++, {
          productoId: item.productoOrigenId,
          nombreProducto: item.nombreProducto,
          tipoMovimiento: 'Traslado Cancelado',
          cantidad: item.cantidad,
          existenciaAnterior: stockAnt,
          existenciaNueva: stockNue,
          referencia: `Cancelación Traslado #${trasladoData.idTraslado}`,
          usuarioId,
        });
      }
    });

    transaction.update(trasladoRef, {
      estado: 'cancelado',
      observacionesRecepcion: motivoCancelacion ? `Cancelado: ${motivoCancelacion}` : 'Cancelado por el usuario',
      fechaRecepcion: Timestamp.now(),
      usuarioRecepcionId: usuarioId,
      usuarioRecepcionNombre: usuarioNombre
    });

    transaction.set(corrHistorialOrigenRef, { correlativo: sigIdHistorial - 1 }, { merge: true });

    registrarAuditoria(firestore, origenId, {
      usuarioId,
      usuarioNombre,
      categoria: 'INVENTARIO',
      accion: 'TRASLADO_CANCELADO',
      titulo: `Traslado #${trasladoData.idTraslado} cancelado`,
      descripcion: `Stock reintegrado a origen. Motivo: ${motivoCancelacion || 'Cancelado por usuario'}`,
      detalles: {
        idTraslado: trasladoData.idTraslado,
        motivo: motivoCancelacion
      }
    }, transaction);
  });
}
