'use client'

import { useState, useMemo, useEffect } from 'react'
import { collection, query, orderBy } from 'firebase/firestore'
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase'
import { useSucursal } from '@/hooks/use-sucursal'
import type { CuadreSemanal } from '@/lib/tipos'

export type CuadreSemanalConId = CuadreSemanal & { id: string }

export function useHistorialCuadreSemanal() {
  const { firestore } = useFirebase()
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal()

  const [filtro, setFiltro] = useState('')
  const [mostrarTodos, setMostrarTodos] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null)

  const cuadresQuery = useMemoFirebase(
    () => (firestore && sucursalId)
      ? query(collection(firestore, `sucursales/${sucursalId}/cuadre_semanal`), orderBy('fecha', 'desc'))
      : null,
    [firestore, sucursalId]
  )

  const { data: cuadres, isLoading, error } = useCollection<CuadreSemanal>(cuadresQuery)

  const { totalPendientes, totalTodos, cuadresFiltrados } = useMemo(() => {
    const lista = (cuadres || []) as CuadreSemanalConId[]
    const q = filtro.trim().toLowerCase()
    let pendientes = 0
    const filtrados: CuadreSemanalConId[] = []

    for (const c of lista) {
      if (c.estadoMensual === 'pendiente') pendientes++
      if (!mostrarTodos && c.estadoMensual !== 'pendiente') continue
      if (q) {
        const matchId = String(c.idCuadreSemanal).includes(q)
        const matchObs = c.observaciones?.toLowerCase().includes(q)
        if (!matchId && !matchObs) continue
      }
      filtrados.push(c)
    }

    return { totalPendientes: pendientes, totalTodos: lista.length, cuadresFiltrados: filtrados }
  }, [cuadres, mostrarTodos, filtro])

  const totalPages = Math.max(1, Math.ceil(cuadresFiltrados.length / itemsPerPage))
  const cuadresPaginados = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return cuadresFiltrados.slice(start, start + itemsPerPage)
  }, [cuadresFiltrados, currentPage, itemsPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [filtro, itemsPerPage, mostrarTodos])

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
    pagination: {
      currentPage,
      itemsPerPage,
      totalPages,
      onPageChange: setCurrentPage,
      onItemsPerPageChange: setItemsPerPage,
    },
  }
}
