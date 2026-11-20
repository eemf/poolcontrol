'use client';

import { useState, useMemo, useEffect } from 'react';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { useSucursal } from '@/hooks/use-sucursal';
import type { CuadreMensual } from '@/lib/tipos';

export type CuadreMensualConId = CuadreMensual & { id: string };

const LIMITE_INICIAL_HISTORIAL = 50;

/**
 * Hook para consultar y paginar el historial de cuadres mensuales de la sucursal.
 * Limita la lectura inicial a 50 registros recientes con carga incremental bajo demanda.
 */
export function useHistorialCuadreMensual() {
  const { firestore } = useFirebase();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  const [filtro, setFiltro] = useState('');
  const [limiteRegistros, setLimiteRegistros] = useState(LIMITE_INICIAL_HISTORIAL);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null);

  // Acota la lectura inicial en Firestore para evitar descargas innecesarias en historiales antiguos
  const cuadresQuery = useMemoFirebase(
    () =>
      firestore && sucursalId
        ? query(
            collection(firestore, `sucursales/${sucursalId}/cuadre_mensual`),
            orderBy('fecha', 'desc'),
            limit(limiteRegistros)
          )
        : null,
    [firestore, sucursalId, limiteRegistros]
  );

  const { data: cuadres, isLoading, error } = useCollection<CuadreMensual>(cuadresQuery);

  // Filtra por correlativo mensual u observaciones
  const cuadresFiltrados = useMemo(() => {
    const lista = (cuadres || []) as CuadreMensualConId[];
    const q = filtro.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter(
      (c) =>
        String(c.idCuadreMensual).includes(q) || c.observaciones?.toLowerCase().includes(q)
    );
  }, [cuadres, filtro]);

  const totalPages = Math.max(1, Math.ceil(cuadresFiltrados.length / itemsPerPage));
  const cuadresPaginados = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return cuadresFiltrados.slice(start, start + itemsPerPage);
  }, [cuadresFiltrados, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtro, itemsPerPage]);

  const hayMasRegistros = (cuadres?.length || 0) >= limiteRegistros;
  const cargarMas = () => setLimiteRegistros((prev) => prev + LIMITE_INICIAL_HISTORIAL);

  return {
    firestore,
    sucursalId,
    cargando: isLoading || isLoadingSucursal,
    error,
    filtro,
    setFiltro,
    totalItems: cuadresFiltrados.length,
    cuadresPaginados,
    openAccordionId,
    setOpenAccordionId,
    hayMasRegistros,
    cargarMas,
    pagination: {
      currentPage,
      itemsPerPage,
      totalPages,
      onPageChange: setCurrentPage,
      onItemsPerPageChange: setItemsPerPage,
    },
  };
}
