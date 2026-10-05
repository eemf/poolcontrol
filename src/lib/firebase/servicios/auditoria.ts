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
import { obtenerNombreEquipo } from '@/lib/utils/dispositivo';

export interface RegistrarAuditoriaParams {
  usuarioId: string;
  usuarioNombre?: string;
  usuarioEmail?: string;
  usuarioRol?: string;
  nombreEquipo?: string;
  categoria: CategoriaAuditoria;
  accion: AccionAuditoria;
  titulo: string;
  descripcion: string;
  detalles?: Record<string, any>;
  fecha?: Date | Timestamp;
}

// Cache en memoria para resolver nombres de usuario en transacciones donde no se pueden hacer lecturas
export const cacheUsuariosAuditoria = new Map<string, { nombre: string; email?: string; rol?: string }>();

function esNombreUsuarioLegible(nom?: string, uid?: string): boolean {
  if (!nom) return false;
  const trimmed = nom.trim();
  if (trimmed === '' || trimmed === 'Usuario del sistema' || trimmed === 'desconocido') return false;
  if (uid && trimmed === uid) return false;
  // Si parece un UID crudo de Firebase (ej: 25+ caracteres alfanuméricos continuos sin espacio)
  if (trimmed.length >= 20 && !trimmed.includes(' ') && !trimmed.includes('@')) return false;
  return true;
}

export function registrarCacheUsuario(uid: string, info: { nombre?: string; email?: string; rol?: string }) {
  if (uid) {
    const nombreLegible = esNombreUsuarioLegible(info?.nombre, uid) 
      ? info.nombre! 
      : (info?.email && info.email.includes('@') ? info.email.split('@')[0] : 'Operador');

    cacheUsuariosAuditoria.set(uid, {
      nombre: nombreLegible,
      email: info?.email || '',
      rol: info?.rol || 'Operador',
    });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('poolcontrol_user_uid', uid);
        localStorage.setItem('poolcontrol_user_nombre', nombreLegible);
        if (info?.email) localStorage.setItem('poolcontrol_user_email', info.email);
        if (info?.rol) localStorage.setItem('poolcontrol_user_rol', info.rol);
      } catch {}
    }
  }
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
    
    // Si viene información de usuario válida, guardarla en el caché
    if (params.usuarioId && esNombreUsuarioLegible(params.usuarioNombre, params.usuarioId)) {
      cacheUsuariosAuditoria.set(params.usuarioId, {
        nombre: params.usuarioNombre!,
        email: params.usuarioEmail || '',
        rol: params.usuarioRol || 'Operador',
      });
    }

    // 1. Resolver el nombre de usuario de manera priorizada y limpia
    const usuarioEnCache = params.usuarioId ? cacheUsuariosAuditoria.get(params.usuarioId) : undefined;
    let finalUsuarioNombre: string | undefined = undefined;

    if (esNombreUsuarioLegible(params.usuarioNombre, params.usuarioId)) {
      finalUsuarioNombre = params.usuarioNombre!;
    } else if (usuarioEnCache && esNombreUsuarioLegible(usuarioEnCache.nombre, params.usuarioId)) {
      finalUsuarioNombre = usuarioEnCache.nombre;
    } else if (typeof window !== 'undefined') {
      try {
        const localUid = localStorage.getItem('poolcontrol_user_uid');
        const localNombre = localStorage.getItem('poolcontrol_user_nombre');
        if (localNombre && esNombreUsuarioLegible(localNombre, params.usuarioId) && (!params.usuarioId || params.usuarioId === localUid)) {
          finalUsuarioNombre = localNombre;
        }
      } catch {}
    }

    // Si aún no hay nombre legible, intentar deducir desde el correo electrónico
    const finalUsuarioEmail = params.usuarioEmail || usuarioEnCache?.email || (typeof window !== 'undefined' ? localStorage.getItem('poolcontrol_user_email') || '' : '');
    if (!finalUsuarioNombre && finalUsuarioEmail && finalUsuarioEmail.includes('@')) {
      const parteCorreo = finalUsuarioEmail.split('@')[0];
      finalUsuarioNombre = parteCorreo.charAt(0).toUpperCase() + parteCorreo.slice(1);
    }

    if (!finalUsuarioNombre) {
      finalUsuarioNombre = 'Operador';
    }

    const finalUsuarioRol = (params.usuarioRol && params.usuarioRol !== 'Operador')
      ? params.usuarioRol
      : (usuarioEnCache?.rol || (typeof window !== 'undefined' ? localStorage.getItem('poolcontrol_user_rol') || 'Operador' : 'Operador'));

    // 2. Resolver el nombre del equipo o estación de trabajo
    const finalNombreEquipo = params.nombreEquipo || obtenerNombreEquipo();

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
      usuarioNombre: finalUsuarioNombre,
      usuarioEmail: finalUsuarioEmail,
      usuarioRol: finalUsuarioRol,
      nombreEquipo: finalNombreEquipo,
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

