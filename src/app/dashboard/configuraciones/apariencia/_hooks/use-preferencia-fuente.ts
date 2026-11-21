'use client';

import { useEffect, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { useDoc, useFirebase, useMemoFirebase, useUser } from '@/firebase';
import { useSucursal } from '@/hooks/use-sucursal';
import { useToast } from '@/hooks/use-toast';
import {
  applyFontScale,
  clampFontScale,
  FONT_SCALE_DEFAULT,
  getFontScaleStorageKey,
} from '@/components/comunes';

export interface PresetFuente {
  id: string;
  nombre: string;
  descripcion: string;
  escala: number;
}

export const PRESETS_FUENTE: PresetFuente[] = [
  { id: 'compacto', nombre: 'Compacto', descripcion: 'Más contenido en pantalla', escala: 94 },
  { id: 'normal', nombre: 'Normal', descripcion: 'Tamaño estándar del sistema', escala: 100 },
  { id: 'grande', nombre: 'Grande', descripcion: 'Lectura cómoda y descansada', escala: 112 },
  { id: 'extra', nombre: 'Extra grande', descripcion: 'Máxima legibilidad en textos', escala: 125 },
];

/**
 * Hook para gestionar la preferencia personal de tamaño de fuente de cada usuario.
 * Aplica vista previa inmediata y persiste el ajuste en `localStorage` y Firestore.
 */
export function usePreferenciaFuente() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { sucursalId } = useSucursal();
  const { toast } = useToast();

  const [escala, setEscalaState] = useState<number>(FONT_SCALE_DEFAULT);
  const [escalaGuardada, setEscalaGuardada] = useState<number>(FONT_SCALE_DEFAULT);
  const [guardando, setGuardando] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !sucursalId || !user?.uid) return null;
    return doc(firestore, `sucursales/${sucursalId}/usuarios`, user.uid);
  }, [firestore, sucursalId, user?.uid]);

  const { data: userData, isLoading } = useDoc<{ preferencias?: { escalaFuente?: number } }>(
    userDocRef
  );

  // Carga inicial desde caché local o valor remoto del usuario
  useEffect(() => {
    const remote = userData?.preferencias?.escalaFuente;
    if (typeof remote === 'number' && Number.isFinite(remote)) {
      const clamped = clampFontScale(remote);
      setEscalaState(clamped);
      setEscalaGuardada(clamped);
      applyFontScale(clamped);
      return;
    }

    if (typeof window !== 'undefined') {
      const raw =
        localStorage.getItem(getFontScaleStorageKey(user?.uid)) ||
        localStorage.getItem(getFontScaleStorageKey(null));
      if (raw) {
        const clamped = clampFontScale(Number(raw));
        setEscalaState(clamped);
        setEscalaGuardada(clamped);
        applyFontScale(clamped);
      }
    }
  }, [userData?.preferencias?.escalaFuente, user?.uid]);

  /** Actualiza la escala en tiempo real para previsualizar el cambio al instante. */
  const actualizarEscala = (nuevaEscala: number) => {
    const clamped = clampFontScale(nuevaEscala);
    setEscalaState(clamped);
    applyFontScale(clamped);
  };

  /** Guarda la preferencia del usuario en localStorage y en su documento de Firestore. */
  const guardarPreferencia = async (valorExplicit?: number) => {
    const valorFinal = clampFontScale(valorExplicit ?? escala);
    setGuardando(true);

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(getFontScaleStorageKey(user?.uid), String(valorFinal));
      }

      if (firestore && sucursalId && user?.uid) {
        try {
          await setDoc(
            doc(firestore, `sucursales/${sucursalId}/usuarios`, user.uid),
            { preferencias: { escalaFuente: valorFinal } },
            { merge: true }
          );
        } catch {
          // Perfiles sin permiso de escritura en usuarios conservan su preferencia en localStorage
        }
      }

      setEscalaState(valorFinal);
      setEscalaGuardada(valorFinal);
      applyFontScale(valorFinal);
      toast({
        title: 'Preferencia guardada',
        description: `El tamaño de fuente se ajustó al ${valorFinal}% para tu usuario.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error al guardar',
        description: error.message || 'No se pudo guardar la preferencia de fuente.',
        variant: 'destructive',
      });
    } finally {
      setGuardando(false);
    }
  };

  const restablecerPreferencia = () => guardarPreferencia(FONT_SCALE_DEFAULT);

  return {
    escala,
    escalaGuardada,
    hayCambios: escala !== escalaGuardada,
    guardando,
    isLoading,
    actualizarEscala,
    guardarPreferencia,
    restablecerPreferencia,
  };
}

