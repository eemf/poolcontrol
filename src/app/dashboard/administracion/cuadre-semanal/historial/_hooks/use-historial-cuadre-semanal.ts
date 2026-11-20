'use client';

import { useState, useMemo, useEffect } from 'react';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { useSucursal } from '@/hooks/use-sucursal';
import type { CuadreSemanal } from '@/lib/tipos';

export type CuadreSemanalConId = CuadreSemanal & { id: string };

const LIMITE_INICIAL_HISTORIAL = 50;

/**
 * Hook para consultar y paginar el historial de cuadres semanales de la sucursal.
 * Limita la lectura inicial a 50 registros recientes con carga incremental bajo demanda.
 */
export function useHistorialCuadreSemanal() {
  const { firestore } = useFirebase();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();

  const [filtro, setFiltro] = useState('');
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [limiteRegistros, setLimiteRegistros] = useState(LIMITE_INICIAL_HISTORIAL);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null);

  // Consulta acotada por fecha descendente para evitar leer todo el histórico en la carga inicial
  const cuadresQuery = useMemoFirebase(
    () =>
      firestore && sucursalId
        ? query(
            collection(firestore, `sucursales/${sucursalId}/cuadre_semanal`),
            orderBy('fecha', 'desc'),
            limit(limiteRegistros)
          )
        : null,
    [firestore, sucursalId, limiteRegistros]
  );

  const { data: cuadres, isLoading, error } = useCollection<CuadreSemanal>(cuadresQuery);

  // Filtra por estado mensual (pendiente vs todos) y término de búsqueda
  const { totalPendientes, totalTodos, cuadresFiltrados } = useMemo(() => {
    const lista = (cuadres || []) as CuadreSemanalConId[];
    const q = filtro.trim().toLowerCase();
    let pendientes = 0;
    const filtrados: CuadreSemanalConId[] = [];

    for (const c of lista) {
      if (c.estadoMensual === 'pendiente') pendientes++;
      if (!mostrarTodos && c.estadoMensual !== 'pendiente') continue;
      if (q) {
        const matchId = String(c.idCuadreSemanal).includes(q);
        const matchObs = c.observaciones?.toLowerCase().includes(q);
        if (!matchId && !matchObs) continue;
      }
      filtrados.push(c);
    }

    return { totalPendientes: pendientes, totalTodos: lista.length, cuadresFiltrados: filtrados };
  }, [cuadres, mostrarTodos, filtro]);

  const totalPages = Math.max(1, Math.ceil(cuadresFiltrados.length / itemsPerPage));
  const cuadresPaginados = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return cuadresFiltrados.slice(start, start + itemsPerPage);
  }, [cuadresFiltrados, currentPage, itemsPerPage]);

  // Reinicia a la página 1 cuando cambia cualquier criterio de filtrado
  useEffect(() => {
    setCurrentPage(1);
  }, [filtro, itemsPerPage, mostrarTodos]);

  const hayMasRegistros = (cuadres?.length || 0) >= limiteRegistros;
  const cargarMas = () => setLimiteRegistros((prev) => prev + LIMITE_INICIAL_HISTORIAL);

  return {
    firestore,
    sucursalId,
    cargando: isLoading || isLoadingSucursal,
    error,
    filtro,
    setFiltro,
    mostrarTodos,
    setMostrarTodos,
    totalPendientes,
    totalTodos,
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
