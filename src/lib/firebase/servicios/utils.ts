
'use client';
import { doc, Firestore, Timestamp } from 'firebase/firestore';
import type { Generales } from '@/lib/tipos';

/**
 * Convierte cualquier formato de fecha (Timestamp, Date, String, Number) 
 * a un objeto Date de JavaScript de forma robusta.
 */
export const toDate = (fecha: any): Date => {
  if (!fecha) return new Date(0);
  
  if (fecha instanceof Date) return fecha;

  if (typeof fecha.toDate === 'function') return fecha.toDate();
  if (fecha instanceof Timestamp) return fecha.toDate();
  
  if (fecha && typeof fecha === 'object' && 'seconds' in fecha) {
    const seconds = Number(fecha.seconds);
    const nanoseconds = Number(fecha.nanoseconds || 0);
    if (!isNaN(seconds)) {
      return new Date(seconds * 1000 + nanoseconds / 1000000);
    }
  }
  
  if (typeof fecha === 'string' || typeof fecha === 'number') {
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) return d;
  }
  
  return new Date(0);
};

/**
 * Valida que el ID de sucursal esté presente antes de operaciones de base de datos.
 * Implementación de la Capa B de seguridad (Aislamiento Lógico).
 */
export function validarSucursal(sucursalId: string | null | undefined): string {
    if (!sucursalId) {
        throw new Error("Inconsistencia de seguridad: No se ha detectado una sucursal activa para realizar esta operación.");
    }
    return sucursalId;
}

/**
 * Obtiene el siguiente número correlativo para una entidad específica.
 */
export async function getNextCorrelative(
  transaction: any,
  firestore: Firestore,
  sucursalId: string,
  entity: string
): Promise<number> {
  const correlativoRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, entity);
  const correlativoDoc = await transaction.get(correlativoRef);
  let nextId = 1;
  if (correlativoDoc.exists()) {
    nextId = (correlativoDoc.data().correlativo || 0) + 1;
  }
  return nextId;
}

/**
 * Garantiza que el objeto de generales tenga todos los campos definidos con valores por defecto.
 */
export const getFullGenerales = (data: Partial<Generales> | undefined): Generales => {
    return {
        totalEfectivo: data?.totalEfectivo ?? 0,
        efectivoInicial: data?.efectivoInicial ?? 0,
        totalMesas: data?.totalMesas ?? 0,
        totalVentasTarjeta: data?.totalVentasTarjeta ?? 0,
        totalVentasMonedas: data?.totalVentasMonedas ?? 0,
        fechaInicioPeriodo: data?.fechaInicioPeriodo ?? Timestamp.now(),
        monedasIniciales: data?.monedasIniciales ?? 0,
        monedasTurnoAbierto: data?.monedasTurnoAbierto ?? data?.monedasIniciales ?? 0,
        efectivoAcumuladoMonedas: data?.efectivoAcumuladoMonedas ?? 0,
        acumuladoMonedasTarjeta: data?.acumuladoMonedasTarjeta ?? 0,
        totalMonedasCredito: data?.totalMonedasCredito ?? 0,
        totalMonedasTarjeta: data?.totalMonedasTarjeta ?? 0,
        fechacuadretragamonedas: data?.fechacuadretragamonedas ?? Timestamp.now(),
        porcentajetragamonedas: data?.porcentajetragamonedas ?? 100,
    };
};
