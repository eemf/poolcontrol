'use client'

import { useState, useMemo, FormEvent } from 'react'
import { collection, query, orderBy } from 'firebase/firestore'
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase'
import { guardarCuenta, eliminarCuenta } from '@/lib/firebase/servicios/cuentas'
import { useToast } from '@/hooks/use-toast'
import { useSucursal } from '@/hooks/use-sucursal'
import type { Cuenta } from '@/lib/tipos'

export type CuentaConId = Cuenta & { id: string }

/**
 * Hook de gestión CRUD para las cuentas financieras (Efectivo / Bancaria) de la sucursal.
 */
export function useMantenimientoCuentas() {
  const { firestore } = useFirebase()
  const { user } = useUser()
  const { toast } = useToast()
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCuenta, setEditingCuenta] = useState<CuentaConId | null>(null)
  const [cuentaToDelete, setCuentaToDelete] = useState<CuentaConId | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [formState, setFormState] = useState<{
    nombre: string
    tipo: 'Efectivo' | 'Bancaria'
    saldo: number | ''
  }>({
    nombre: '',
    tipo: 'Efectivo',
    saldo: 0,
  })

  const cuentasQuery = useMemoFirebase(() => {
    if (!firestore || !user || !sucursalId) return null
    return query(collection(firestore, `sucursales/${sucursalId}/cuentas`), orderBy('nombre'))
  }, [firestore, user, sucursalId])

  const { data: cuentasData, isLoading, error } = useCollection<Cuenta>(cuentasQuery)

  const cuentas: CuentaConId[] = useMemo(() =>
    (cuentasData || []).map(c => ({ ...c, id: c.id }))
  , [cuentasData])

  const filteredCuentas = useMemo(() => {
    if (!searchTerm) return cuentas
    const lowerCaseSearch = searchTerm.toLowerCase()
    return cuentas.filter(c =>
      c.nombre.toLowerCase().includes(lowerCaseSearch) ||
      c.tipo.toLowerCase().includes(lowerCaseSearch)
    )
  }, [cuentas, searchTerm])

  const handleOpenModal = (cuenta: CuentaConId | null = null) => {
    if (cuenta) {
      setEditingCuenta(cuenta)
      setFormState({ nombre: cuenta.nombre, tipo: cuenta.tipo, saldo: cuenta.saldo })
    } else {
      setEditingCuenta(null)
      setFormState({ nombre: '', tipo: 'Efectivo', saldo: 0 })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!firestore || !sucursalId) return
    if (!formState.nombre || formState.saldo === '') {
      toast({ title: "Error", description: "El nombre y el saldo son obligatorios.", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      await guardarCuenta(
        firestore,
        sucursalId,
        { ...formState, saldo: Number(formState.saldo) },
        editingCuenta?.id
      )
      toast({ title: "Éxito", description: `Cuenta ${editingCuenta ? 'actualizada' : 'creada'} correctamente.` })
      setIsModalOpen(false)
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "No se pudo guardar la cuenta.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!firestore || !cuentaToDelete || !sucursalId) return
    setLoading(true)
    try {
      await eliminarCuenta(firestore, sucursalId, cuentaToDelete.id)
      toast({ title: "Éxito", description: "La cuenta ha sido eliminada." })
      setCuentaToDelete(null)
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "No se pudo eliminar la cuenta.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const cargando = isLoading || isLoadingSucursal

  return {
    cargando,
    error,
    searchTerm,
    setSearchTerm,
    filteredCuentas,
    isModalOpen,
    setIsModalOpen,
    editingCuenta,
    cuentaToDelete,
    setCuentaToDelete,
    loading,
    formState,
    setFormState,
    handleOpenModal,
    handleSubmit,
    handleDelete,
  }
}
