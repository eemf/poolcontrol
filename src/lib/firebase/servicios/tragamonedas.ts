'use client';
import { doc, runTransaction, Timestamp, Firestore, collection, query, where, getDocs, limit, increment, DocumentSnapshot } from 'firebase/firestore';
import type { ProductoVirtual, Pago, HistorialTragamonedas } from '@/lib/tipos';
import { registrarMovimientoInventario } from './historial-inventario';
import { getFullGenerales } from './utils';

export async function registrarPagoPremioTragamonedas(firestore: Firestore, sucursalId: string, data: any, usuarioId: string) {
    const qMonedas = query(collection(firestore, `sucursales/${sucursalId}/productos_virtuales`), where("nombre", "==", "Monedas"), limit(1));
    const monedasSnap = await getDocs(qMonedas);
    if (monedasSnap.empty) throw new Error("Producto virtual 'Monedas' no encontrado.");
    const monedaDoc = monedasSnap.docs[0];

    return runTransaction(firestore, async (transaction) => {
        const corrHistorialRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'historial_tragamonedas');
        const corrHistorialInvRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'historial_inventario');
        const generalesRef = doc(firestore, `sucursales/${sucursalId}/generales`, 'actual');
        const maquinaGeneralesRef = doc(firestore, `sucursales/${sucursalId}/generales_tragamonedas`, data.maquinaId);
        
        const [maquinaDoc, corrHist, corrHistInv] = await Promise.all([transaction.get(maquinaGeneralesRef), transaction.get(corrHistorialRef), transaction.get(corrHistorialInvRef)]);
        const nuevoIdH = (corrHist.data()?.correlativo || 0) + 1;
        const nuevoIdHI = (corrHistInv.data()?.correlativo || 0) + 1;

        const baseHistorial = {
            id: nuevoIdH.toString(),
            maquinaId: data.maquinaId,
            sucursalId: sucursalId,
            fecha: Timestamp.now(),
        };

        if (data.tipoPago === 'total') {
            transaction.update(generalesRef, { totalVentasMonedas: increment(-data.monto) });
            transaction.update(monedaDoc.ref, { existencia: increment(data.monto) });
            transaction.set(doc(firestore, `sucursales/${sucursalId}/tragamonedas/${data.maquinaId}/historial`, nuevoIdH.toString()), { 
                ...baseHistorial,
                tipo: 'premio_total', 
                monto: data.monto, 
                descripcion: 'Premio total pagado', 
                metadata: { montoRestadoVentas: data.monto, montoSumadoExistencia: data.monto } 
            });
            registrarMovimientoInventario(transaction, firestore, sucursalId, nuevoIdHI, { productoId: monedaDoc.id, nombreProducto: 'Monedas', tipoMovimiento: 'Ajuste', cantidad: data.monto, existenciaAnterior: monedaDoc.data().existencia, existenciaNueva: monedaDoc.data().existencia + data.monto, referencia: `Premio Total - ${maquinaDoc.data()?.nombre}`, usuarioId });
        } else {
            transaction.update(generalesRef, { totalVentasMonedas: increment(-data.montoTotal) });
            transaction.update(monedaDoc.ref, { existencia: increment(data.montoPagado) });
            const deuda = data.montoTotal - data.montoPagado;
            transaction.update(maquinaGeneralesRef, { totalDeuda: increment(deuda) });
            transaction.set(doc(firestore, `sucursales/${sucursalId}/tragamonedas/${data.maquinaId}/historial`, nuevoIdH.toString()), { 
                ...baseHistorial,
                tipo: 'premio_parcial', 
                monto: data.montoTotal, 
                descripcion: `Premio parcial Q${data.montoTotal} (Pagado Q${data.montoPagado})`, 
                metadata: { montoRestadoVentas: data.montoTotal, montoSumadoExistencia: data.montoPagado, deudaGenerada: deuda } 
            });
            registrarMovimientoInventario(transaction, firestore, sucursalId, nuevoIdHI, { productoId: monedaDoc.id, nombreProducto: 'Monedas', tipoMovimiento: 'Ajuste', cantidad: data.montoPagado, existenciaAnterior: monedaDoc.data().existencia, existenciaNueva: monedaDoc.data().existencia + data.montoPagado, referencia: `Premio Parcial - ${maquinaDoc.data()?.nombre}`, usuarioId });
        }
        transaction.set(corrHistorialRef, { correlativo: nuevoIdH }, { merge: true });
        transaction.set(corrHistorialInvRef, { correlativo: nuevoIdHI }, { merge: true });
    });
}

export async function registrarBaseTragamonedas(firestore: Firestore, sucursalId: string, maquinaId: string, montoBase: number, usuarioId: string) {
    const qMonedas = query(collection(firestore, `sucursales/${sucursalId}/productos_virtuales`), where("nombre", "==", "Monedas"), limit(1));
    const monedasSnap = await getDocs(qMonedas);
    if (monedasSnap.empty) throw new Error("Producto virtual 'Monedas' no encontrado.");
    const monedaDoc = monedasSnap.docs[0];

    return runTransaction(firestore, async (transaction) => {
        const maquinaRef = doc(firestore, `sucursales/${sucursalId}/generales_tragamonedas`, maquinaId);
        const corrHRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'historial_tragamonedas');
        const corrHIRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'historial_inventario');
        const [maquinaDoc, corrH, corrHI] = await Promise.all([transaction.get(maquinaRef), transaction.get(corrHRef), transaction.get(corrHIRef)]);
        const nuevoIdH = (corrH.data()?.correlativo || 0) + 1;
        const nuevoIdHI = (corrHI.data()?.correlativo || 0) + 1;

        transaction.update(monedaDoc.ref, { existencia: increment(-montoBase) });
        transaction.update(maquinaRef, { totalBase: increment(montoBase) });
        transaction.set(doc(firestore, `sucursales/${sucursalId}/tragamonedas/${maquinaId}/historial`, nuevoIdH.toString()), { 
            id: nuevoIdH.toString(), 
            maquinaId, 
            sucursalId: sucursalId, 
            fecha: Timestamp.now(), 
            tipo: 'base', 
            monto: montoBase, 
            descripcion: 'Se agregó base', 
            metadata: { montoBase, montoRestadoExistencia: montoBase } 
        });
        registrarMovimientoInventario(transaction, firestore, sucursalId, nuevoIdHI, { productoId: monedaDoc.id, nombreProducto: 'Monedas', tipoMovimiento: 'Ajuste', cantidad: -montoBase, existenciaAnterior: monedaDoc.data().existencia, existenciaNueva: (monedaDoc.data().existencia || 0) - montoBase, referencia: `Base enviada a - ${maquinaDoc.data()?.nombre}`, usuarioId });
        transaction.set(corrHRef, { correlativo: nuevoIdH }, { merge: true });
        transaction.set(corrHIRef, { correlativo: nuevoIdHI }, { merge: true });
    });
}

export async function registrarExtraccionTragamonedas(firestore: Firestore, sucursalId: string, maquinaId: string, montoExtraido: number, usuarioId: string) {
    const qMonedas = query(collection(firestore, `sucursales/${sucursalId}/productos_virtuales`), where("nombre", "==", "Monedas"), limit(1));
    const monedasSnap = await getDocs(qMonedas);
    if (monedasSnap.empty) throw new Error("Producto virtual 'Monedas' no encontrado.");
    const monedaDoc = monedasSnap.docs[0];

    return runTransaction(firestore, async (transaction) => {
        const maquinaRef = doc(firestore, `sucursales/${sucursalId}/generales_tragamonedas`, maquinaId);
        const corrHRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'historial_tragamonedas');
        const corrHIRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'historial_inventario');
        const [maquinaDoc, corrH, corrHI] = await Promise.all([transaction.get(maquinaRef), transaction.get(corrHRef), transaction.get(corrHIRef)]);
        const maquinaData = maquinaDoc.data();
        const nuevoIdH = (corrH.data()?.correlativo || 0) + 1;
        const nuevoIdHI = (corrHI.data()?.correlativo || 0) + 1;

        let rem = montoExtraido, dSal = Math.min(rem, maquinaData?.totalDeuda || 0); rem -= dSal;
        let bSal = Math.min(rem, maquinaData?.totalBase || 0); rem -= bSal;
        
        transaction.update(maquinaRef, { totalDeuda: increment(-dSal), totalBase: increment(-bSal), totalExtraccion: increment(rem) });
        transaction.update(monedaDoc.ref, { existencia: increment(montoExtraido) });
        
        transaction.set(doc(firestore, `sucursales/${sucursalId}/tragamonedas/${maquinaId}/historial`, nuevoIdH.toString()), { 
            id: nuevoIdH.toString(), 
            maquinaId, 
            sucursalId: sucursalId, 
            fecha: Timestamp.now(), 
            tipo: 'extraccion', 
            monto: montoExtraido, 
            descripcion: `Extracción (Deuda: Q${dSal}, Base: Q${bSal}, Neta: Q${rem})`, 
            metadata: { deudaSaldada: dSal, baseSaldada: bSal, extraccionNeta: rem, montoSumadoExistencia: montoExtraido } 
        });
        
        registrarMovimientoInventario(transaction, firestore, sucursalId, nuevoIdHI, { productoId: monedaDoc.id, nombreProducto: 'Monedas', tipoMovimiento: 'Ajuste', cantidad: montoExtraido, existenciaAnterior: monedaDoc.data().existencia, existenciaNueva: (monedaDoc.data().existencia || 0) + montoExtraido, referencia: `Extracción desde - ${maquinaDoc.data()?.nombre}`, usuarioId });
        transaction.set(corrHRef, { correlativo: nuevoIdH }, { merge: true });
        transaction.set(corrHIRef, { correlativo: nuevoIdHI }, { merge: true });
    });
}

export async function anularTransaccionTragamonedas(firestore: Firestore, sucursalId: string, maquinaId: string, historialId: string, usuarioId: string) {
    const qMonedas = query(collection(firestore, `sucursales/${sucursalId}/productos_virtuales`), where("nombre", "==", "Monedas"), limit(1));
    const monedasSnap = await getDocs(qMonedas);
    const monedaDoc = monedasSnap.docs[0];

    return runTransaction(firestore, async (transaction) => {
        const histRef = doc(firestore, `sucursales/${sucursalId}/tragamonedas/${maquinaId}/historial`, historialId);
        const [histDoc, corrHI] = await Promise.all([transaction.get(histRef), transaction.get(doc(firestore, `sucursales/${sucursalId}/correlativos`, 'historial_inventario'))]);
        if (!histDoc.exists()) throw new Error("Historial no encontrado.");
        const data = histDoc.data(), meta = data.metadata || {}, sigHI = (corrHI.data()?.correlativo || 0) + 1;
        const maquinaRef = doc(firestore, `sucursales/${sucursalId}/generales_tragamonedas`, maquinaId);
        const generalesRef = doc(firestore, `sucursales/${sucursalId}/generales`, 'actual');
        const mDoc = await transaction.get(maquinaRef);

        if (data.tipo === 'extraccion') {
            transaction.update(maquinaRef, { totalDeuda: increment(meta.deudaSaldada || 0), totalBase: increment(meta.baseSaldada || 0), totalExtraccion: increment(-(meta.extraccionNeta || 0)) });
            transaction.update(monedaDoc.ref, { existencia: increment(-data.monto) });
            registrarMovimientoInventario(transaction, firestore, sucursalId, sigHI, { productoId: monedaDoc.id, nombreProducto: 'Monedas', tipoMovimiento: 'Ajuste', cantidad: -data.monto, existenciaAnterior: monedaDoc.data().existencia, existenciaNueva: (monedaDoc.data().existencia || 0) - data.monto, referencia: `Anulación Extracción - ${mDoc.data()?.nombre}`, usuarioId });
        } else if (data.tipo === 'premio_total') {
            transaction.update(generalesRef, { totalVentasMonedas: increment(data.monto) });
            transaction.update(monedaDoc.ref, { existencia: increment(-data.monto) });
            registrarMovimientoInventario(transaction, firestore, sucursalId, sigHI, { productoId: monedaDoc.id, nombreProducto: 'Monedas', tipoMovimiento: 'Ajuste', cantidad: -data.monto, existenciaAnterior: monedaDoc.data().existencia, existenciaNueva: (monedaDoc.data().existencia || 0) - data.monto, referencia: `Anulación Premio - ${mDoc.data()?.nombre}`, usuarioId });
        } else if (data.tipo === 'premio_parcial') {
            transaction.update(generalesRef, { totalVentasMonedas: increment(data.monto) });
            transaction.update(monedaDoc.ref, { existencia: increment(-meta.montoSumadoExistencia) });
            transaction.update(maquinaRef, { totalDeuda: increment(-meta.deudaGenerada) });
            registrarMovimientoInventario(transaction, firestore, sucursalId, sigHI, { productoId: monedaDoc.id, nombreProducto: 'Monedas', tipoMovimiento: 'Ajuste', cantidad: -meta.montoSumadoExistencia, existenciaAnterior: monedaDoc.data().existencia, existenciaNueva: (monedaDoc.data().existencia || 0) - meta.montoSumadoExistencia, referencia: `Anulación Premio - ${mDoc.data()?.nombre}`, usuarioId });
        } else if (data.tipo === 'base') {
            transaction.update(maquinaRef, { totalBase: increment(-data.monto) });
            transaction.update(monedaDoc.ref, { existencia: increment(data.monto) });
            registrarMovimientoInventario(transaction, firestore, sucursalId, sigHI, { productoId: monedaDoc.id, nombreProducto: 'Monedas', tipoMovimiento: 'Ajuste', cantidad: data.monto, existenciaAnterior: monedaDoc.data().existencia, existenciaNueva: (monedaDoc.data().existencia || 0) + data.monto, referencia: `Anulación Base - ${mDoc.data()?.nombre}`, usuarioId });
        }
        transaction.delete(histRef);
        transaction.set(doc(firestore, `sucursales/${sucursalId}/correlativos`, 'historial_inventario'), { correlativo: sigHI }, { merge: true });
    });
}
