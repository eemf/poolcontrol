
'use client';

import {
  doc,
  runTransaction,
  Timestamp,
  Firestore,
  increment,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  DocumentReference,
} from 'firebase/firestore';
import type { Venta, Pago, Generales } from '@/lib/tipos';
import { registrarMovimientoInventario } from './historial-inventario';

/**
 * Anula una venta completa, devolviendo stock y ajustando balances de caja.
 */
export async function anularVentaCompleta(
  firestore: Firestore,
  sucursalId: string,
  ventaDocId: string,
  usuarioId: string
) {
  // Realizar lecturas no transaccionales primero para obtener los pagos asociados
  const paymentsQuery = query(
    collection(firestore, `sucursales/${sucursalId}/pagos`),
    where('ventaDocId', '==', ventaDocId)
  );
  const paymentsSnap = await getDocs(paymentsQuery);
  const payments = paymentsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Pago));

  return runTransaction(firestore, async (transaction) => {
    const ventaRef = doc(firestore, `sucursales/${sucursalId}/ventas`, ventaDocId);
    const generalesRef = doc(firestore, `sucursales/${sucursalId}/generales`, 'actual');
    const correlativoHistorialRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'historial_inventario');

    // 1. TODAS LAS LECTURAS AL PRINCIPIO
    const [ventaSnap, generalesSnap, corrHistorialSnap] = await Promise.all([
      transaction.get(ventaRef),
      transaction.get(generalesRef),
      transaction.get(correlativoHistorialRef)
    ]);

    if (!ventaSnap.exists()) throw new Error("La venta no existe.");
    const ventaData = ventaSnap.data() as Venta;

    // Recolectar referencias de stock para leerlas antes de cualquier escritura
    const stockRefs: DocumentReference[] = [];
    ventaData.detalles.forEach(item => {
      if (item.idProducto !== 'item-manual') {
        const coll = item.esVirtual ? 'productos_virtuales' : 'productos';
        stockRefs.push(doc(firestore, `sucursales/${sucursalId}/${coll}`, item.idProducto));
        
        if (!item.esVirtual && item.ingredientesConsumidos) {
          item.ingredientesConsumidos.forEach(ing => {
            stockRefs.push(doc(firestore, `sucursales/${sucursalId}/productos`, ing.productoId));
          });
        }
      }
    });

    // Eliminar duplicados y leer todos los documentos de stock requeridos de forma atómica
    const uniqueRefs = Array.from(new Map(stockRefs.map(r => [r.path, r])).values());
    const stockSnaps = await Promise.all(uniqueRefs.map(ref => transaction.get(ref)));
    const stockDocsMap = new Map(stockSnaps.map((snap, i) => [uniqueRefs[i].path, snap]));

    // 2. FASE DE PROCESAMIENTO (EN MEMORIA)
    let sigIdHistorial = (corrHistorialSnap.data()?.correlativo || 0) + 1;

    let revEfectivo = 0;
    let revMesas = 0;
    let revMonedasCash = 0;
    let revTarjetaTotal = 0;
    let revMonedasTarjeta = 0;

    for (const pago of payments) {
      if (pago.metodoPago === 'Consumo Interno') continue; // Cortesías no afectan dinero

      if (pago.metodoPago === 'Efectivo') {
        pago.itemsSaldados.forEach(item => {
          const detalle = ventaData.detalles.find(d => d.idDetalle === item.idDetalle);
          const esMesa = detalle?.idProducto.startsWith('mesa-') || detalle?.idProducto.startsWith('division-mesa-');

          if (item.esVirtual) revMonedasCash += item.montoAplicado;
          else if (esMesa) revMesas += item.montoAplicado;
          else revEfectivo += item.montoAplicado;
        });
      } else if (pago.metodoPago === 'Tarjeta') {
        revTarjetaTotal += pago.montoTotalPagado;
        pago.itemsSaldados.forEach(item => {
          if (item.esVirtual) revMonedasTarjeta += item.montoAplicado;
        });
      }
    }

    // 3. TODAS LAS ESCRITURAS AL FINAL
    
    // Si la venta estaba a crédito, debemos restar del contador de crédito lo que NO se pagó
    if (ventaData.estado === 'credito') {
        const saldoMonedasCredito = ventaData.detalles
            .filter(d => d.esVirtual)
            .reduce((acc, item) => acc + item.saldo, 0);
        
        if (saldoMonedasCredito > 0) {
            transaction.update(generalesRef, { totalMonedasCredito: increment(-saldoMonedasCredito) });
        }
    }

    transaction.update(generalesRef, {
      totalEfectivo: increment(-revEfectivo),
      totalMesas: increment(-revMesas),
      totalVentasMonedas: increment(-revMonedasCash),
      totalVentasTarjeta: increment(-revTarjetaTotal),
      totalMonedasTarjeta: increment(-revMonedasTarjeta),
      acumuladoMonedasTarjeta: increment(-revMonedasTarjeta),
    });

    // Revertir Inventario y registrar movimientos
    for (const item of ventaData.detalles) {
      if (item.idProducto !== 'item-manual') {
        const coll = item.esVirtual ? 'productos_virtuales' : 'productos';
        const prodRef = doc(firestore, `sucursales/${sucursalId}/${coll}`, item.idProducto);
        const prodSnap = stockDocsMap.get(prodRef.path);
        
        if (prodSnap?.exists()) {
          const exAnt = prodSnap.data().existencia || 0;
          const exNue = exAnt + item.cantidad;
          transaction.update(prodRef, { existencia: exNue });

          registrarMovimientoInventario(transaction, firestore, sucursalId, sigIdHistorial++, {
            productoId: item.idProducto,
            nombreProducto: item.nombreProducto,
            tipoMovimiento: 'Venta Anulada',
            cantidad: item.cantidad,
            existenciaAnterior: exAnt,
            existenciaNueva: exNue,
            referencia: `Anulación Venta #${ventaData.idVenta}`,
            usuarioId
          });
        }

        // Revertir Ingredientes
        if (!item.esVirtual && item.ingredientesConsumidos) {
          for (const ing of item.ingredientesConsumidos) {
            const ingRef = doc(firestore, `sucursales/${sucursalId}/productos`, ing.productoId);
            const ingSnap = stockDocsMap.get(ingRef.path);
            if (ingSnap?.exists()) {
              const exAntIng = ingSnap.data().existencia || 0;
              const exNueIng = exAntIng + (ing.cantidad * item.cantidad);
              transaction.update(ingRef, { existencia: exNueIng });

              registrarMovimientoInventario(transaction, firestore, sucursalId, sigIdHistorial++, {
                productoId: ing.productoId,
                nombreProducto: ingSnap.data().nombre,
                tipoMovimiento: 'Venta Anulada',
                cantidad: ing.cantidad * item.cantidad,
                existenciaAnterior: exAntIng,
                existenciaNueva: exNueIng,
                referencia: `Anulación Venta #${ventaData.idVenta}`,
                usuarioId
              });
            }
          }
        }
      }
    }

    // Eliminar Documentos de la venta y sus pagos
    paymentsSnap.docs.forEach(d => transaction.delete(d.ref));
    transaction.delete(ventaRef);
    transaction.set(correlativoHistorialRef, { correlativo: sigIdHistorial - 1 }, { merge: true });
  });
}

/**
 * Cambia el método de pago de una transacción y ajusta los balances de caja y monedas.
 */
export async function cambiarMetodoPago(
  firestore: Firestore,
  sucursalId: string,
  pagoDocId: string,
  nuevoMetodo: 'Efectivo' | 'Tarjeta'
) {
  // Realizar lecturas no transaccionales previas para obtener el contexto necesario
  const pagoRefPrev = doc(firestore, `sucursales/${sucursalId}/pagos`, pagoDocId);
  const pagoSnapPrev = await getDoc(pagoRefPrev);
  if (!pagoSnapPrev.exists()) throw new Error("El pago no existe.");
  const pDataPrev = pagoSnapPrev.data() as Pago;
  
  if (pDataPrev.metodoPago === 'Consumo Interno') {
      throw new Error("No se puede cambiar el método de pago de un consumo interno.");
  }

  const ventaDocId = pDataPrev.ventaDocId;

  const paymentsQuery = query(
    collection(firestore, `sucursales/${sucursalId}/pagos`),
    where('ventaDocId', '==', ventaDocId)
  );
  const paymentsSnap = await getDocs(paymentsQuery);

  return runTransaction(firestore, async (transaction) => {
    const pRef = doc(firestore, `sucursales/${sucursalId}/pagos`, pagoDocId);
    const generalesRef = doc(firestore, `sucursales/${sucursalId}/generales`, 'actual');
    const ventaRef = doc(firestore, `sucursales/${sucursalId}/ventas`, ventaDocId);

    // 1. LECTURAS AL PRINCIPIO
    const [pSnap, gSnap, vSnap] = await Promise.all([
      transaction.get(pRef),
      transaction.get(generalesRef),
      transaction.get(ventaRef)
    ]);

    if (!pSnap.exists()) throw new Error("El pago no existe.");
    if (!vSnap.exists()) throw new Error("La venta asociada no existe.");
    
    const pData = pSnap.data() as Pago;
    const vData = vSnap.data() as Venta;
    const metodoAnterior = pData.metodoPago;

    if (metodoAnterior === nuevoMetodo) return;

    // 2. PROCESAMIENTO
    let montoMonedas = 0;
    let montoConsumo = 0;
    let montoMesas = 0;

    pData.itemsSaldados.forEach(item => {
      const detalle = vData.detalles.find(d => d.idDetalle === item.idDetalle);
      const esMesa = detalle?.idProducto.startsWith('mesa-') || detalle?.idProducto.startsWith('division-mesa-');

      if (item.esVirtual) montoMonedas += item.montoAplicado;
      else if (esMesa) montoMesas += item.montoAplicado;
      else montoConsumo += item.montoAplicado;
    });

    // 3. ESCRITURAS AL FINAL
    if (nuevoMetodo === 'Tarjeta') {
      // Ajuste de balances de Efectivo a Tarjeta
      transaction.update(generalesRef, {
        totalEfectivo: increment(-montoConsumo),
        totalMesas: increment(-montoMesas),
        totalVentasMonedas: increment(-montoMonedas),
        totalVentasTarjeta: increment(pData.montoTotalPagado),
        totalMonedasTarjeta: increment(montoMonedas),
        acumuladoMonedasTarjeta: increment(montoMonedas)
      });
    } else {
      // Ajuste de balances de Tarjeta a Efectivo
      transaction.update(generalesRef, {
        totalVentasTarjeta: increment(-pData.montoTotalPagado),
        totalMonedasTarjeta: increment(-montoMonedas),
        acumuladoMonedasTarjeta: increment(-montoMonedas),
        totalEfectivo: increment(montoConsumo),
        totalMesas: increment(montoMesas),
        totalVentasMonedas: increment(montoMonedas)
      });
    }

    transaction.update(pRef, { metodoPago: nuevoMetodo });

    // Sincronizar el metodoPago consolidado de la venta basándose en todos sus pagos
    const allPayments = paymentsSnap.docs.map(d => d.id === pagoDocId ? { ...d.data(), metodoPago: nuevoMetodo } : d.data()) as Pago[];
    const metodos = new Set(allPayments.map(p => p.metodoPago));
    let metodoFinal: string = 'Mixto';
    if (metodos.size === 1) metodoFinal = metodos.values().next().value;
    
    transaction.update(ventaRef, { metodoPago: metodoFinal });
  });
}
