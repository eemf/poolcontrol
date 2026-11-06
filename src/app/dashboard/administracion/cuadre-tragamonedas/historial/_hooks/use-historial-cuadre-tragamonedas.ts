'use client'

import { useState, useMemo, useEffect } from 'react'
import { collection, query, orderBy, where, Timestamp } from 'firebase/firestore'
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase'
import { useSucursal } from '@/hooks/use-sucursal'
import type { CuadreTragamonedas } from '@/lib/tipos'

export type CuadreConId = CuadreTragamonedas & { id: string }

export const toDate = (fecha: any): Date => {
  if (fecha instanceof Timestamp) return fecha.toDate()
  if (fecha instanceof Date) return fecha
  if (typeof fecha === 'string') {
    const d = new Date(fecha)
    if (!isNaN(d.getTime())) return d
  }
  return new Date(0)
}

export function useHistorialCuadreTragamonedas() {
  const { firestore } = useFirebase()
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal()

  const [filtro, setFiltro] = useState('')
  const [mostrarTodos, setMostrarTodos] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const cuadresQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null
    const baseQuery = collection(firestore, `sucursales/${sucursalId}/cuadre_tragamonedas`)
    if (mostrarTodos) {
      return query(baseQuery, orderBy('fecha', 'desc'))
    } else {
      return query(baseQuery, where('estado', '==', 'pendiente'), orderBy('fecha', 'desc'))
    }
  }, [firestore, sucursalId, mostrarTodos])

  const { data: cuadres, isLoading, error } = useCollection<CuadreTragamonedas>(cuadresQuery)

  const cuadresConId = useMemo((): CuadreConId[] => {
    return (cuadres || []).map(c => ({ ...c, id: c.id }))
  }, [cuadres])

  const cuadresFiltrados = useMemo(() => {
    if (!filtro) return cuadresConId
    const filtroLower = filtro.toLowerCase()
    return cuadresConId.filter(c => String(c.idCuadre).includes(filtroLower))
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
  }, [itemsPerPage, filtro, mostrarTodos])

  const cargando = isLoading || isLoadingSucursal

  return {
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
    handleNextPage,
    handlePreviousPage,
  }
}
