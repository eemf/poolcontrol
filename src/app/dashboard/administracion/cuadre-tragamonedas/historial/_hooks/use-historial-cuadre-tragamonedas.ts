'use client';

import { useState, useMemo, useEffect } from 'react';
import { collection, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { useSucursal } from '@/hooks/use-sucursal';
import type { CuadreTragamonedas } from '@/lib/tipos';

export type CuadreConId = CuadreTragamonedas & { id: string };

const LIMITE_INICIAL_HISTORIAL = 50;

/** Convierte fechas Timestamp, Date o ISO string a objeto Date seguro. */
export const toDate = (fecha: any): Date => {
  if (fecha instanceof Timestamp) return fecha.toDate();
  if (fecha instanceof Date) return fecha;
  if (typeof fecha === 'string') {
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(0);
};

/**
 * Hook para consultar y paginar el historial de cuadres de tragamonedas.
 * Acota la lectura inicial a los últimos 50 registros con carga incremental bajo demanda.
 */
export function useHistorialCuadreTragamonedas() {
  const { firestore } = useFirebase();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();

  const [filtro, setFiltro] = useState('');
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [limiteRegistros, setLimiteRegistros] = useState(LIMITE_INICIAL_HISTORIAL);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Limita la consulta por fecha descendente para evitar lecturas masivas en historiales largos
  const cuadresQuery = useMemoFirebase(
    () =>
      firestore && sucursalId
        ? query(
            collection(firestore, `sucursales/${sucursalId}/cuadre_tragamonedas`),
            orderBy('fecha', 'desc'),
            limit(limiteRegistros)
          )
        : null,
    [firestore, sucursalId, limiteRegistros]
  );

  const { data: cuadres, isLoading, error } = useCollection<CuadreTragamonedas>(cuadresQuery);

  // Filtra por estado pendiente/todos y número de cuadre
  const { totalPendientes, totalTodos, cuadresFiltrados } = useMemo(() => {
    const lista = (cuadres || []) as CuadreConId[];
    const q = filtro.trim().toLowerCase();
    let pendientes = 0;
    const filtrados: CuadreConId[] = [];

    for (const c of lista) {
      if (c.estado === 'pendiente') pendientes++;
      if (!mostrarTodos && c.estado !== 'pendiente') continue;
      if (q && !String(c.idCuadre).includes(q)) continue;
      filtrados.push(c);
    }

    return { totalPendientes: pendientes, totalTodos: lista.length, cuadresFiltrados: filtrados };
  }, [cuadres, mostrarTodos, filtro]);

  const totalPages = Math.max(1, Math.ceil(cuadresFiltrados.length / itemsPerPage));
  const cuadresPaginados = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return cuadresFiltrados.slice(start, start + itemsPerPage);
  }, [cuadresFiltrados, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, filtro, mostrarTodos]);

  const hayMasRegistros = (cuadres?.length || 0) >= limiteRegistros;
  const cargarMas = () => setLimiteRegistros((prev) => prev + LIMITE_INICIAL_HISTORIAL);

  return {
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
