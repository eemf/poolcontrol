'use client'

import { useState, useMemo } from 'react'
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

  const cuadresQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null
    return query(collection(firestore, `sucursales/${sucursalId}/cuadre_mensual`), orderBy('fecha', 'desc'))
  }, [firestore, sucursalId])

  const { data: cuadres, isLoading, error } = useCollection<CuadreMensual>(cuadresQuery)

  const cuadresConId = useMemo((): CuadreMensualConId[] => {
    return (cuadres || []).map(c => ({ ...c, id: c.id }))
  }, [cuadres])

  const cuadresFiltrados = useMemo(() => {
    if (!filtro) return cuadresConId
    const filtroLower = filtro.toLowerCase()
    return cuadresConId.filter(
      c => String(c.idCuadreMensual).includes(filtroLower) || c.observaciones.toLowerCase().includes(filtroLower)
    )
  }, [cuadresConId, filtro])

  const totalPages = Math.ceil(cuadresFiltrados.length / itemsPerPage) || 1

  const cuadresPaginados = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return cuadresFiltrados.slice(startIndex, startIndex + itemsPerPage)
  }, [cuadresFiltrados, currentPage, itemsPerPage])

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const cargando = isLoading || isLoadingSucursal

  return {
    firestore,
    sucursalId,
    cargando,
    error,
    filtro,
    setFiltro,
    currentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    cuadresPaginados,
    openAccordionId,
    setOpenAccordionId,
    handleNextPage,
    handlePreviousPage,
  }
}
