'use client';

import { useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirebase, useMemoFirebase, useUser } from '@/firebase';
import { useSucursal } from '@/hooks/use-sucursal';

export const FONT_SCALE_MIN = 90;
export const FONT_SCALE_MAX = 130;
export const FONT_SCALE_DEFAULT = 100;

export function clampFontScale(value: number): number {
  if (!Number.isFinite(value)) return FONT_SCALE_DEFAULT;
  return Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, Math.round(value)));
}

export function getFontScaleStorageKey(uid?: string | null): string {
  return uid ? `poolcontrol_font_scale_${uid}` : 'poolcontrol_font_scale_default';
}

/**
 * Aplica la escala de fuente porcentual sobre el elemento raíz `<html>` (base 16px = 100%).
 * Al escalar `rem`, toda la tipografía y controles de Tailwind se ajustan proporcionalmente.
 */
export function applyFontScale(percent: number): void {
  if (typeof document === 'undefined') return;
  const clamped = clampFontScale(percent);
  const px = Math.round((16 * clamped) / 100);
  document.documentElement.style.fontSize = `${px}px`;
}

/**
 * Sincronizador global de preferencia de tamaño de fuente por usuario.
 * Aplica de inmediato el valor en caché local y lo sincroniza con Firestore al iniciar sesión.
 */
export function UserFontScaleSync() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { sucursalId } = useSucursal();

  // 1. Aplicación instantánea desde localStorage por UID (evita parpadeo al cargar)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw =
      localStorage.getItem(getFontScaleStorageKey(user?.uid)) ||
      localStorage.getItem(getFontScaleStorageKey(null));
    const parsed = raw ? Number(raw) : FONT_SCALE_DEFAULT;
    applyFontScale(parsed);
  }, [user?.uid]);

  // 2. Sincronización desde el documento del usuario en la sucursal activa
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !sucursalId || !user?.uid) return null;
    return doc(firestore, `sucursales/${sucursalId}/usuarios`, user.uid);
  }, [firestore, sucursalId, user?.uid]);

  const { data: userData } = useDoc<{ preferencias?: { escalaFuente?: number } }>(userDocRef);

  useEffect(() => {
    const escalaRemota = userData?.preferencias?.escalaFuente;
    if (typeof escalaRemota === 'number' && Number.isFinite(escalaRemota)) {
      const clamped = clampFontScale(escalaRemota);
      applyFontScale(clamped);
      if (typeof window !== 'undefined' && user?.uid) {
        localStorage.setItem(getFontScaleStorageKey(user.uid), String(clamped));
      }
    }
  }, [userData?.preferencias?.escalaFuente, user?.uid]);

  return null;
}

