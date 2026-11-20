'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { useSucursal } from '@/hooks/use-sucursal';
import type { AjusteInventario } from '@/lib/tipos';

export type AjusteConId = AjusteInventario & { id: string };

const LIMITE_INICIAL_HISTORIAL = 50;

/**
 * Hook para consultar y paginar el historial de ajustes de inventario de la sucursal.
 * Acota la lectura inicial a los últimos 50 ajustes con carga incremental bajo demanda.
 */
export function useHistorialAjustes() {
  const { firestore } = useFirebase();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  const [filtro, setFiltro] = useState('');
  const [limiteRegistros, setLimiteRegistros] = useState(LIMITE_INICIAL_HISTORIAL);
  const [openItem, setOpenItem] = useState<string | undefined>(undefined);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Limita la lectura por fecha descendente para evitar descargas masivas en historiales largos
  const ajustesQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(
      collection(firestore, `sucursales/${sucursalId}/ajustes_inventario`),
      orderBy('fecha', 'desc'),
      limit(limiteRegistros)
    );
  }, [firestore, sucursalId, limiteRegistros]);

  const {
    data: ajustes,
    isLoading: cargandoAjustes,
    error,
  } = useCollection<AjusteInventario>(ajustesQuery);

  const isLoading = isLoadingSucursal || cargandoAjustes;

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 40);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const ajustesConId = useMemo(
    (): AjusteConId[] => (ajustes || []).map((a) => ({ ...a, id: a.id })),
    [ajustes]
  );

  // Filtra por observaciones, ID de ajuste o nombre de producto incluido en el detalle
  const ajustesFiltrados = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    if (!q) return ajustesConId;
    return ajustesConId.filter(
      (a) =>
        (a.observaciones || '').toLowerCase().includes(q) ||
        String(a.idAjuste).includes(q) ||
        (a.detalles || []).some((d) =>
          (d.nombreProducto || '').toLowerCase().includes(q)
        )
    );
  }, [ajustesConId, filtro]);

  const totalItems = ajustesFiltrados.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedAjustes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return ajustesFiltrados.slice(startIndex, startIndex + itemsPerPage);
  }, [ajustesFiltrados, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtro, itemsPerPage]);

  const limpiarFiltro = () => {
    setFiltro('');
    searchInputRef.current?.focus();
  };

  const hayMasRegistros = (ajustes?.length || 0) >= limiteRegistros;
  const cargarMas = () => setLimiteRegistros((prev) => prev + LIMITE_INICIAL_HISTORIAL);

  return {
    isLoading,
    error,
    filtro,
    setFiltro,
    limpiarFiltro,
    openItem,
    setOpenItem,
    searchInputRef,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    totalPages,
    paginatedAjustes,
    hayMasRegistros,
    cargarMas,
  };
}
