'use client';

import {
  collection,
  doc,
  addDoc,
  Timestamp,
  Firestore,
  Transaction,
} from 'firebase/firestore';
import type { RegistroAuditoria, CategoriaAuditoria, AccionAuditoria } from '@/lib/tipos';
import { validarSucursal } from './utils';

export interface RegistrarAuditoriaParams {
  usuarioId: string;
  usuarioNombre?: string;
  usuarioEmail?: string;
  usuarioRol?: string;
  categoria: CategoriaAuditoria;
  accion: AccionAuditoria;
  titulo: string;
  descripcion: string;
  detalles?: Record<string, any>;
  fecha?: Date | Timestamp;
}

/**
 * Registra un evento en la bitácora de auditoría de la sucursal.
 * Soporta ejecución independiente o dentro de una transacción activa.
 */
export async function registrarAuditoria(
  firestore: Firestore,
  sucursalId: string,
  params: RegistrarAuditoriaParams,
  transaction?: Transaction
) {
  try {
    const sid = validarSucursal(sucursalId);
    const auditoriaCol = collection(firestore, `sucursales/${sid}/auditoria`);
    
    // Sanitizar detalles para que no contengan valores undefined (incompatibles con Firestore)
    const detallesSanitizados: Record<string, any> = {};
    if (params.detalles) {
      for (const [k, v] of Object.entries(params.detalles)) {
        if (v !== undefined) {
          detallesSanitizados[k] = v;
        }
      }
    }

    const registro: Omit<RegistroAuditoria, 'id'> = {
      sucursalId: sid,
      fecha: params.fecha instanceof Timestamp ? params.fecha : (params.fecha instanceof Date ? Timestamp.fromDate(params.fecha) : Timestamp.now()),
      usuarioId: params.usuarioId || 'desconocido',
      usuarioNombre: params.usuarioNombre || 'Usuario del sistema',
      usuarioEmail: params.usuarioEmail || '',
      usuarioRol: params.usuarioRol || 'Operador',
      categoria: params.categoria,
      accion: params.accion,
      titulo: params.titulo,
      descripcion: params.descripcion,
      detalles: detallesSanitizados,
    };

    if (transaction) {
      const nuevoDocRef = doc(auditoriaCol);
      transaction.set(nuevoDocRef, registro);
      return nuevoDocRef.id;
    } else {
      const docRef = await addDoc(auditoriaCol, registro);
      return docRef.id;
    }
  } catch (error) {
    // Si falla el log de auditoría nunca debe romper la transacción principal
    console.error("Error al registrar auditoría:", error);
    return null;
  }
}

export interface FiltrosAuditoria {
  usuarioId?: string;
  categoria?: CategoriaAuditoria | 'TODAS';
  busqueda?: string;
  limite?: number;
}

