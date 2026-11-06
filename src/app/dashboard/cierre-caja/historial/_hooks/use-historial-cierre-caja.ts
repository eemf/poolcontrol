'use client'

import { useState, useMemo, useEffect } from 'react'
import { collection, query, orderBy, Timestamp } from 'firebase/firestore'
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase'
import { useSucursal } from '@/hooks/use-sucursal'
import type { CierreCaja } from '@/lib/tipos'

export const toDate = (fecha: any): Date => {
  if (fecha instanceof Timestamp) return fecha.toDate()
  if (fecha instanceof Date) return fecha
  if (typeof fecha === 'string') {
    const d = new Date(fecha)
    if (!isNaN(d.getTime())) return d
  }
  return new Date(0)
}

export function useHistorialCierreCaja() {
  const { firestore } = useFirebase()
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal()

  const [filtro, setFiltro] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [mostrarTodos, setMostrarTodos] = useState(false)

  const cierresQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null
    return query(collection(firestore, `sucursales/${sucursalId}/cierre_caja`), orderBy('fecha', 'desc'))
  }, [firestore, sucursalId])

  const { data: todosLosCierres, isLoading: isLoadingCierres, error } = useCollection<CierreCaja>(cierresQuery)

  const cierresFiltradosYMostrados = useMemo(() => {
    if (!todosLosCierres) return []

    let listaBase = todosLosCierres

    if (!mostrarTodos) {
      listaBase = todosLosCierres.filter(c => c.estadoEfectivo === 'pendiente' || (c.pagosTarjeta > 0 && c.estadoTarjeta === 'pendiente'))
    }

    if (!filtro) return listaBase

    const filtroLower = filtro.toLowerCase()
    return listaBase.filter(c =>
      String(c.idCuadre).includes(filtroLower) ||
      (c.observaciones && c.observaciones.toLowerCase().includes(filtroLower))
    )
  }, [todosLosCierres, mostrarTodos, filtro])

  const totalPages = Math.ceil(cierresFiltradosYMostrados.length / itemsPerPage) || 1

  const cierresPaginados = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return cierresFiltradosYMostrados.slice(startIndex, startIndex + itemsPerPage)
  }, [cierresFiltradosYMostrados, currentPage, itemsPerPage])

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage, filtro, mostrarTodos])

  const isLoading = isLoadingCierres || isLoadingSucursal

  return {
    isLoading,
    error,
    filtro,
    setFiltro,
    mostrarTodos,
    setMostrarTodos,
    currentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    cierresPaginados,
    handleNextPage,
    handlePreviousPage,
  }
}
