
'use client';

import { doc, updateDoc, Timestamp, Firestore } from 'firebase/firestore';
import type { Suscripcion } from '@/lib/tipos';

/**
 * @fileOverview Servicios para la gestión de suscripciones desde el Dashboard Maestro.
 */

export async function actualizarSuscripcionSucursal(
    firestore: Firestore,
    sucursalId: string,
    data: Partial<Suscripcion>
) {
    const sucursalRef = doc(firestore, 'sucursales', sucursalId);
    
    // Si se está actualizando la suscripción completa
    const updateData: any = {};
    Object.entries(data).forEach(([key, value]) => {
        updateData[`suscripcion.${key}`] = value;
    });

    // Registrar siempre el momento del cambio
    updateData['suscripcion.ultimoPago'] = Timestamp.now();

    await updateDoc(sucursalRef, updateData);
}

export async function suspenderSucursalManual(
    firestore: Firestore,
    sucursalId: string,
    suspendida: boolean,
    motivo: 'administrativo' | 'tecnico' = 'administrativo'
) {
    const sucursalRef = doc(firestore, 'sucursales', sucursalId);
    await updateDoc(sucursalRef, {
        'suscripcion.estado': suspendida ? 'suspendido' : 'activo',
        'suscripcion.motivoSuspension': motivo
    });
}
