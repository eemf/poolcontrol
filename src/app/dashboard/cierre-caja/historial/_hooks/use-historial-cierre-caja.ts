'use client'

import { useState, useMemo, useEffect } from 'react'
import { collection, query, orderBy, limit, Timestamp } from 'firebase/firestore'
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

  // Por defecto carga únicamente los cierres recientes para mostrar los pendientes rápido;
  // al seleccionar "Todos los Registros", realiza la consulta completa.
  const cierresQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null
    const baseRef = collection(firestore, `sucursales/${sucursalId}/cierre_caja`)
    if (!mostrarTodos) {
      return query(baseRef, orderBy('fecha', 'desc'), limit(30))
    }
    return query(baseRef, orderBy('fecha', 'desc'))
  }, [firestore, sucursalId, mostrarTodos])

  const { data: todosLosCierres, isLoading: isLoadingCierres, error } = useCollection<CierreCaja>(cierresQuery)

  const cierresPendientes = useMemo(() => {
    if (!todosLosCierres) return []
    return todosLosCierres.filter(
      c => c.estadoEfectivo === 'pendiente' || (c.pagosTarjeta > 0 && c.estadoTarjeta === 'pendiente')
    )
  }, [todosLosCierres])

  const cierresFiltradosYMostrados = useMemo(() => {
    if (!todosLosCierres) return []

    const listaBase = mostrarTodos ? todosLosCierres : cierresPendientes
    const q = filtro.trim().toLowerCase()
    if (!q) return listaBase

    return listaBase.filter(
      c =>
        String(c.idCuadre).includes(q) ||
        (c.observaciones && c.observaciones.toLowerCase().includes(q)) ||
        (c.usuarioNombre && c.usuarioNombre.toLowerCase().includes(q))
    )
  }, [todosLosCierres, cierresPendientes, mostrarTodos, filtro])

  const totalItems = cierresFiltradosYMostrados.length
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1

  const cierresPaginados = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return cierresFiltradosYMostrados.slice(startIndex, startIndex + itemsPerPage)
  }, [cierresFiltradosYMostrados, currentPage, itemsPerPage])

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
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    totalPages,
    totalPendientes: cierresPendientes.length,
    totalCargados: todosLosCierres?.length || 0,
    cierresPaginados,
  }
}
