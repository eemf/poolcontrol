'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { useSucursal } from '@/hooks/use-sucursal';
import type { AjusteInventario } from '@/lib/tipos';

export type AjusteConId = AjusteInventario & { id: string };

export function useHistorialAjustes() {
  const { firestore } = useFirebase();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  const [filtro, setFiltro] = useState('');
  const [openItem, setOpenItem] = useState<string | undefined>(undefined);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const ajustesQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(
      collection(firestore, `sucursales/${sucursalId}/ajustes_inventario`),
      orderBy('fecha', 'desc')
    );
  }, [firestore, sucursalId]);

  const { data: ajustes, isLoading: cargandoAjustes, error } = useCollection<AjusteInventario>(ajustesQuery);

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
  };
}

