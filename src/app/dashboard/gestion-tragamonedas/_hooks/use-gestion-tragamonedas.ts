'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import { useFirebase, useUser, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { useSucursal } from '@/hooks/use-sucursal';
import { useToast } from '@/hooks/use-toast';
import {
  anularTransaccionTragamonedas,
  registrarBaseTragamonedas,
  registrarExtraccionTragamonedas,
} from '@/lib/firebase/servicios';
import { toDate } from '@/lib/firebase/servicios/utils';
import type {
  HistorialTragamonedas as HistorialTipo,
  GeneralesTragamonedas,
  Generales,
} from '@/lib/tipos';

export type EstadoTragamonedas = 'activo' | 'mantenimiento' | 'inactivo';

export interface Tragamonedas {
  idTragamonedas: number;
  nombre: string;
  modelo?: string;
  estado: EstadoTragamonedas;
}

/**
 * Hook de operación diaria de máquinas tragamonedas (bases, extracciones, préstamos y anulaciones).
 */
export interface TragamonedasConDocId extends Tragamonedas {
  docId: string;
}

export type TipoOperacionMaquina = 'base' | 'extraccion';

export interface OperacionMaquinaActiva {
  tipo: TipoOperacionMaquina;
  maquina: TragamonedasConDocId;
}

export function useGestionTragamonedas() {
  const [isMounted, setIsMounted] = useState(false);
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  const { toast } = useToast();

  // Estado para modal de Historial
  const [maquinaSeleccionada, setMaquinaSeleccionada] = useState<TragamonedasConDocId | null>(null);

  // Estado unificado para modal de Base / Extracción (1 sola instancia en toda la página)
  const [operacionActiva, setOperacionActiva] = useState<OperacionMaquinaActiva | null>(null);
  const [procesandoOperacion, setProcesandoOperacion] = useState(false);

  // Estado para confirmación de Anulación
  const [itemParaAnular, setItemParaAnular] = useState<HistorialTipo | null>(null);
  const [procesandoAnulacion, setProcesandoAnulacion] = useState(false);
  const maquinaIdParaAnular = useRef<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Seguridad para restaurar pointer-events del body al cerrar modales
  useEffect(() => {
    const hayModalAbierto = Boolean(itemParaAnular || maquinaSeleccionada || operacionActiva);
    const cleanupBody = () => {
      if (!hayModalAbierto) {
        document.body.style.pointerEvents = 'auto';
        document.body.style.overflow = 'auto';
      }
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const pointerEvents = document.body.style.pointerEvents;
          if (pointerEvents === 'none' && !hayModalAbierto) {
            document.body.style.pointerEvents = 'auto';
          }
        }
      });
    });

    observer.observe(document.body, { attributes: true });
    cleanupBody();

    return () => {
      observer.disconnect();
      document.body.style.pointerEvents = 'auto';
    };
  }, [itemParaAnular, maquinaSeleccionada, operacionActiva]);

  // 1. Consulta única de catálogo de máquinas tragamonedas
  const tragamonedasQuery = useMemoFirebase(() => {
    if (!firestore || !user || !sucursalId) return null;
    return query(
      collection(firestore, `sucursales/${sucursalId}/tragamonedas`),
      orderBy('idTragamonedas', 'asc')
    );
  }, [firestore, user, sucursalId]);

  const {
    data: maquinas,
    isLoading: isLoadingMaquinas,
    error,
  } = useCollection<Tragamonedas>(tragamonedasQuery);

  // 2. Consulta única de métricas generales de todas las máquinas (evita N+1 listeners en cada MaquinaCard)
  const generalesTragamonedasQuery = useMemoFirebase(() => {
    if (!firestore || !user || !sucursalId) return null;
    return collection(firestore, `sucursales/${sucursalId}/generales_tragamonedas`);
  }, [firestore, user, sucursalId]);

  const { data: listaGeneralesMaquinas, isLoading: isLoadingGeneralesMaquinas } =
    useCollection<GeneralesTragamonedas>(generalesTragamonedasQuery);

  const mapaGeneralesMaquinas = useMemo(() => {
    const mapa: Record<string, GeneralesTragamonedas> = {};
    (listaGeneralesMaquinas || []).forEach((item) => {
      const docId = (item as any).id || item.idMaquina;
      if (docId) {
        mapa[String(docId)] = item;
      }
    });
    return mapa;
  }, [listaGeneralesMaquinas]);

  // 3. Consulta única de estado de caja actual para conocer fechaInicioPeriodo de inmediato al abrir historial
  const generalesCajaRef = useMemoFirebase(() => {
    if (!firestore || !user || !sucursalId) return null;
    return doc(firestore, `sucursales/${sucursalId}/generales/actual`);
  }, [firestore, user, sucursalId]);

  const { data: estadoCaja } = useDoc<Generales>(generalesCajaRef);

  const fechaInicioPeriodo = useMemo(() => {
    if (!estadoCaja?.fechaInicioPeriodo) return null;
    return toDate(estadoCaja.fechaInicioPeriodo);
  }, [estadoCaja?.fechaInicioPeriodo]);

  const maquinasConDocId = useMemo((): TragamonedasConDocId[] => {
    return (maquinas || []).map((m) => ({
      ...m,
      docId: (m as any).id || String(m.idTragamonedas),
    }));
  }, [maquinas]);

  // Handlers de Base y Extracción centralizados
  const handleAbrirOperacion = useCallback(
    (tipo: TipoOperacionMaquina, maquina: TragamonedasConDocId) => {
      setOperacionActiva({ tipo, maquina });
    },
    []
  );

  const handleCerrarOperacion = useCallback(() => {
    if (!procesandoOperacion) {
      setOperacionActiva(null);
    }
  }, [procesandoOperacion]);

  const handleConfirmarOperacion = useCallback(
    async (monto: number) => {
      if (!firestore || !sucursalId || !user || !operacionActiva) return;
      if (isNaN(monto) || monto <= 0) {
        toast({
          title: 'Atención',
          description: 'El monto ingresado debe ser mayor a cero.',
          variant: 'destructive',
        });
        return;
      }

      setProcesandoOperacion(true);
      const { tipo, maquina } = operacionActiva;

      try {
        if (tipo === 'base') {
          await registrarBaseTragamonedas(firestore, sucursalId, maquina.docId, monto, user.uid);
          toast({
            title: 'Base Registrada',
            description: `Base de Q${monto.toFixed(2)} agregada a ${maquina.nombre}.`,
          });
        } else {
          await registrarExtraccionTragamonedas(
            firestore,
            sucursalId,
            maquina.docId,
            monto,
            user.uid
          );
          toast({
            title: 'Extracción Registrada',
            description: `Extracción de Q${monto.toFixed(2)} procesada en ${maquina.nombre}.`,
          });
        }
        setOperacionActiva(null);
      } catch (err: any) {
        console.error(`Error registrando ${tipo}:`, err);
        toast({
          title: 'Error',
          description: err.message || `No se pudo registrar la ${tipo}.`,
          variant: 'destructive',
        });
      } finally {
        setProcesandoOperacion(false);
      }
    },
    [firestore, sucursalId, user, operacionActiva, toast]
  );

  // Handlers de Anulación
  const handleSolicitarAnulacion = useCallback((item: HistorialTipo, maquinaId: string) => {
    maquinaIdParaAnular.current = maquinaId;
    setItemParaAnular(item);
  }, []);

  const handleConfirmarAnulacion = useCallback(async () => {
    if (!firestore || !sucursalId || !itemParaAnular || !maquinaIdParaAnular.current || !user) {
      return;
    }

    const currentItem = itemParaAnular;
    const currentMaquinaId = maquinaIdParaAnular.current;
    const userId = user.uid;

    setItemParaAnular(null);
    document.body.style.pointerEvents = 'auto';
    document.body.style.overflow = 'auto';

    setTimeout(async () => {
      setProcesandoAnulacion(true);
      try {
        await anularTransaccionTragamonedas(
          firestore,
          sucursalId,
          currentMaquinaId,
          currentItem.id,
          userId
        );
        toast({
          title: 'Transacción Anulada',
          description: 'La transacción ha sido revertida correctamente.',
        });
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'No se pudo anular la transacción.',
          variant: 'destructive',
        });
      } finally {
        setProcesandoAnulacion(false);
        document.body.style.pointerEvents = 'auto';
      }
    }, 100);
  }, [firestore, sucursalId, itemParaAnular, user, toast]);

  const isLoading = isLoadingMaquinas || isUserLoading || isLoadingSucursal;

  return {
    isMounted,
    user,
    sucursalId,
    isLoading,
    isLoadingGeneralesMaquinas,
    error,
    maquinasConDocId,
    mapaGeneralesMaquinas,
    fechaInicioPeriodo,
    maquinaSeleccionada,
    setMaquinaSeleccionada,
    operacionActiva,
    procesandoOperacion,
    handleAbrirOperacion,
    handleCerrarOperacion,
    handleConfirmarOperacion,
    itemParaAnular,
    setItemParaAnular,
    procesandoAnulacion,
    handleSolicitarAnulacion,
    handleConfirmarAnulacion,
  };
}
