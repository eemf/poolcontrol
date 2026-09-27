
'use client';
import { doc, Timestamp, Firestore, Transaction } from 'firebase/firestore';
import type { HistorialInventario } from '@/lib/tipos';

/**
 * Prepara los datos para un nuevo registro de historial y lo añade a una transacción de Firestore.
 * NO confirma la transacción. La confirmación debe ser manejada por la función que la llama.
 * 
 * @param transaction La transacción de Firestore en la que se ejecutarán las operaciones.
 * @param firestore La instancia de Firestore.
 * @param sucursalId El ID de la sucursal.
 * @param nuevoId El ID numérico correlativo para el nuevo registro de historial.
 * @param data Los datos del movimiento de inventario a registrar.
 */
export function registrarMovimientoInventario(
    transaction: Transaction,
    firestore: Firestore,
    sucursalId: string,
    nuevoId: number,
    data: Omit<HistorialInventario, 'id' | 'idHistorial' | 'fecha' | 'sucursalId'>
) {
    const historialRef = doc(firestore, `sucursales/${sucursalId}/historial_inventario`, nuevoId.toString());

    const historialData: Omit<HistorialInventario, 'id'> = {
        ...data,
        idHistorial: nuevoId,
        sucursalId: sucursalId,
        fecha: Timestamp.now(),
        verificado: true // Marcamos como verificado ya que se está guardando dentro de una transacción atómica
    };

    transaction.set(historialRef, historialData);
    // La actualización del correlativo se debe hacer en la transacción principal que llama a esta función.
}
