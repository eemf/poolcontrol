'use client'

import { useState, useMemo, useEffect } from 'react'
import { collection, query, orderBy } from 'firebase/firestore'
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase'
import { useSucursal } from '@/hooks/use-sucursal'
import type { CuadreMensual } from '@/lib/tipos'

export type CuadreMensualConId = CuadreMensual & { id: string }

export function useHistorialCuadreMensual() {
  const { firestore } = useFirebase()
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal()
  const [filtro, setFiltro] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null)

  const cuadresQuery = useMemoFirebase(
    () => (firestore && sucursalId)
      ? query(collection(firestore, `sucursales/${sucursalId}/cuadre_mensual`), orderBy('fecha', 'desc'))
      : null,
    [firestore, sucursalId]
  )

  const { data: cuadres, isLoading, error } = useCollection<CuadreMensual>(cuadresQuery)

  const cuadresFiltrados = useMemo(() => {
    const lista = (cuadres || []) as CuadreMensualConId[]
    const q = filtro.trim().toLowerCase()
    if (!q) return lista
    return lista.filter(
      c => String(c.idCuadreMensual).includes(q) || c.observaciones?.toLowerCase().includes(q)
    )
  }, [cuadres, filtro])

  const totalPages = Math.max(1, Math.ceil(cuadresFiltrados.length / itemsPerPage))
  const cuadresPaginados = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return cuadresFiltrados.slice(start, start + itemsPerPage)
  }, [cuadresFiltrados, currentPage, itemsPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [filtro, itemsPerPage])

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
    pagination: {
      currentPage,
      itemsPerPage,
      totalPages,
      onPageChange: setCurrentPage,
      onItemsPerPageChange: setItemsPerPage,
    },
  }
}
