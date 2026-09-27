
'use client';

import { doc, runTransaction, Timestamp, Firestore } from 'firebase/firestore';
import { addMonths } from 'date-fns';
import type { PagoSuscripcion, Sucursal } from '@/lib/tipos';

/**
 * @fileOverview Servicio para registrar pagos de suscripción y actualizar vigencias de sucursales.
 */

export interface RegistrarPagoParams {
    sucursalId: string;
    monto: number;
    metodo: string;
    meses: number;
    usuarioId: string;
}

export async function registrarPagoSuscripcion(
    firestore: Firestore,
    params: RegistrarPagoParams
) {
    const { sucursalId, monto, metodo, meses, usuarioId } = params;

    return runTransaction(firestore, async (transaction) => {
        const sucursalRef = doc(firestore, 'sucursales', sucursalId);
        const correlativoRef = doc(firestore, 'correlativos', `pagos_suscripcion_${sucursalId}`);
        
        const [sucursalDoc, correlativoDoc] = await Promise.all([
            transaction.get(sucursalRef),
            transaction.get(correlativoRef)
        ]);

        if (!sucursalDoc.exists()) throw new Error("La sucursal no existe.");
        const sucursalData = sucursalDoc.data() as Sucursal;
        const subActual = sucursalData.suscripcion;

        if (!subActual) throw new Error("La sucursal no tiene una suscripción configurada.");

        // 1. Calcular nueva fecha de vencimiento
        const ahora = new Date();
        const vencimientoActual = subActual.fechaVencimiento.toDate();
        
        // Si ya está vencido, empezamos a contar desde hoy. Si no, extendemos la fecha actual.
        const baseDate = vencimientoActual > ahora ? vencimientoActual : ahora;
        const nuevoVencimiento = addMonths(baseDate, meses);

        // 2. Manejar correlativo
        const nuevoIdPago = (correlativoDoc.exists() ? (correlativoDoc.data()?.correlativo || 0) : 0) + 1;

        // 3. Crear registro de pago
        const pagoRef = doc(firestore, `sucursales/${sucursalId}/pagos_suscripcion`, nuevoIdPago.toString());
        const pagoData: PagoSuscripcion = {
            id: nuevoIdPago.toString(),
            idPago: nuevoIdPago,
            fecha: Timestamp.now(),
            monto,
            metodo,
            meses,
            planAlMomento: subActual.plan,
            vencimientoPrevio: subActual.fechaVencimiento,
            vencimientoNuevo: Timestamp.fromDate(nuevoVencimiento),
            usuarioId
        };

        // 4. Ejecutar escrituras
        transaction.set(pagoRef, pagoData);
        transaction.update(sucursalRef, {
            'suscripcion.estado': 'activo', // Reactivación automática al pagar
            'suscripcion.fechaVencimiento': Timestamp.fromDate(nuevoVencimiento),
            'suscripcion.ultimoPago': Timestamp.now(),
            'suscripcion.motivoSuspension': null // Limpiar suspensiones
        });
        transaction.set(correlativoRef, { correlativo: nuevoIdPago }, { merge: true });

        return { success: true, nuevoVencimiento };
    });
}
