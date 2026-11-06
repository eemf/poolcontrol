'use client';

import { useState, useEffect, useMemo, useRef } from "react";
import { collection, query, orderBy } from "firebase/firestore";
import { useFirebase, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { useSucursal } from "@/hooks/use-sucursal";
import { useToast } from "@/hooks/use-toast";
import { anularTransaccionTragamonedas } from "@/lib/firebase/servicios";
import type { HistorialTragamonedas as HistorialTipo } from "@/lib/tipos";

export type EstadoTragamonedas = "activo" | "mantenimiento" | "inactivo";

export interface Tragamonedas {
  idTragamonedas: number;
  nombre: string;
  modelo?: string;
  estado: EstadoTragamonedas;
}

export interface TragamonedasConDocId extends Tragamonedas {
  docId: string;
}

export function useGestionTragamonedas() {
  const [isMounted, setIsMounted] = useState(false);
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  const { toast } = useToast();

  const [maquinaSeleccionada, setMaquinaSeleccionada] = useState<TragamonedasConDocId | null>(null);
  const [itemParaAnular, setItemParaAnular] = useState<HistorialTipo | null>(null);
  const [procesandoAnulacion, setProcesandoAnulacion] = useState(false);

  const maquinaIdParaAnular = useRef<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Seguridad para restaurar pointer-events del body al cerrar modales
  useEffect(() => {
    const cleanupBody = () => {
      if (!itemParaAnular && !maquinaSeleccionada) {
        document.body.style.pointerEvents = 'auto';
        document.body.style.overflow = 'auto';
      }
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const pointerEvents = document.body.style.pointerEvents;
          if (pointerEvents === 'none' && !itemParaAnular && !maquinaSeleccionada) {
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
  }, [itemParaAnular, maquinaSeleccionada]);

  const tragamonedasQuery = useMemoFirebase(() => {
    if (!firestore || !user || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/tragamonedas`), orderBy("idTragamonedas", "asc"));
  }, [firestore, user, sucursalId]);

  const { data: maquinas, isLoading: isLoadingMaquinas, error } = useCollection<Tragamonedas>(tragamonedasQuery);

  const maquinasConDocId = useMemo((): TragamonedasConDocId[] => {
    return (maquinas || []).map((m) => ({ ...m, docId: (m as any).id || String(m.idTragamonedas) }));
  }, [maquinas]);

  const handleSolicitarAnulacion = (item: HistorialTipo, maquinaId: string) => {
    maquinaIdParaAnular.current = maquinaId;
    setItemParaAnular(item);
  };

  const handleConfirmarAnulacion = async () => {
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
        await anularTransaccionTragamonedas(firestore, sucursalId, currentMaquinaId, currentItem.id, userId);
        toast({ title: "Transacción Anulada", description: "La transacción ha sido revertida correctamente." });
      } catch (error: any) {
        toast({ title: "Error", description: error.message || "No se pudo anular la transacción.", variant: "destructive" });
      } finally {
        setProcesandoAnulacion(false);
        document.body.style.pointerEvents = 'auto';
      }
    }, 100);
  };

  const isLoading = isLoadingMaquinas || isUserLoading || isLoadingSucursal;

  return {
    isMounted,
    user,
    sucursalId,
    isLoading,
    error,
    maquinasConDocId,
    maquinaSeleccionada,
    setMaquinaSeleccionada,
    itemParaAnular,
    setItemParaAnular,
    procesandoAnulacion,
    handleSolicitarAnulacion,
    handleConfirmarAnulacion,
  };
}
