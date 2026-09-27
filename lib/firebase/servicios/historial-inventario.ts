
'use client';
import { doc, Timestamp, Firestore, Transaction } from 'firebase/firestore';
import type { HistorialInventario } from '@/lib/tipos';

export async function registrarMovimientoInventario(
    transaction: Transaction,
    firestore: Firestore,
    sucursalId: string,
    data: Omit<HistorialInventario, 'id' | 'idHistorial' | 'fecha'>
) {
    const correlativoRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'historial_inventario');
    const correlativoDoc = await transaction.get(correlativoRef);
    const nuevoId = (correlativoDoc.data()?.correlativo || 0) + 1;

    const historialRef = doc(firestore, `sucursales/${sucursalId}/historial_inventario`, nuevoId.toString());

    const historialData: Omit<HistorialInventario, 'id'> = {
        ...data,
        idHistorial: nuevoId,
        fecha: Timestamp.now(),
    };

    transaction.set(historialRef, historialData);
    transaction.set(correlativoRef, { correlativo: nuevoId }, { merge: true });
}

    