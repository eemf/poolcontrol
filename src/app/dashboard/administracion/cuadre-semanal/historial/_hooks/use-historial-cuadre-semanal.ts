'use client'

import { useState, useMemo, useEffect } from 'react'
import { collection, query, orderBy, where } from 'firebase/firestore'
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase'
import { useSucursal } from '@/hooks/use-sucursal'
import type { CuadreSemanal } from '@/lib/tipos'

type CuadreSemanalConId = CuadreSemanal & { id: string }

export function useHistorialCuadreSemanal() {
  const { firestore } = useFirebase()
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal()

  const [filtro, setFiltro] = useState('')
  const [mostrarTodos, setMostrarTodos] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null)

  const cuadresQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null
    const baseQuery = collection(firestore, `sucursales/${sucursalId}/cuadre_semanal`)
    if (mostrarTodos) {
      return query(baseQuery, orderBy('fecha', 'desc'))
    } else {
      return query(baseQuery, where('estadoMensual', '==', 'pendiente'), orderBy('fecha', 'desc'))
    }
  }, [firestore, sucursalId, mostrarTodos])

  const { data: cuadres, isLoading, error } = useCollection<CuadreSemanal>(cuadresQuery)

  const cuadresConId = useMemo((): CuadreSemanalConId[] => {
    return (cuadres || []).map(c => ({ ...c, id: c.id }))
  }, [cuadres])

  const cuadresFiltrados = useMemo(() => {
    if (!filtro) return cuadresConId
    const filtroLower = filtro.toLowerCase()
    return cuadresConId.filter(
      c => String(c.idCuadreSemanal).includes(filtroLower) || c.observaciones.toLowerCase().includes(filtroLower)
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

  useEffect(() => {
    setCurrentPage(1)
  }, [filtro, itemsPerPage, mostrarTodos])

  const cargando = isLoading || isLoadingSucursal

  return {
    firestore,
    sucursalId,
    cargando,
    error,
    filtro,
    setFiltro,
    mostrarTodos,
    setMostrarTodos,
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
