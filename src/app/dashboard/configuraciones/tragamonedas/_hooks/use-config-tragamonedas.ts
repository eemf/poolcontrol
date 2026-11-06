'use client'

import { useState, useEffect, useMemo, FormEvent } from "react"
import { useFirebase, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, query, runTransaction, orderBy, Timestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { useSucursal } from "@/hooks/use-sucursal"

export type EstadoTragamonedas = "activo" | "mantenimiento" | "inactivo"

export type Tragamonedas = {
  idTragamonedas: number
  nombre: string
  modelo?: string
  estado: EstadoTragamonedas
}

export type TragamonedasConDocId = Tragamonedas & { docId: string }

export const initialFormState: Omit<Tragamonedas, 'idTragamonedas'> = {
  nombre: '',
  modelo: '',
  estado: 'activo',
}

export function useConfigTragamonedas() {
  const [isMounted, setIsMounted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [maquinaToDelete, setMaquinaToDelete] = useState<TragamonedasConDocId | null>(null)
  const [editingMaquina, setEditingMaquina] = useState<TragamonedasConDocId | null>(null)
  const [loading, setLoading] = useState(false)
  const [formState, setFormState] = useState(initialFormState)

  const { toast } = useToast()
  const { firestore } = useFirebase()
  const { user, isUserLoading } = useUser()
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal()

  const tragamonedasQuery = useMemoFirebase(() => {
    if (!firestore || !user || !sucursalId) return null
    return query(collection(firestore, `sucursales/${sucursalId}/tragamonedas`), orderBy("idTragamonedas", "asc"))
  }, [firestore, user, sucursalId])

  const { data: maquinas, isLoading: isLoadingMaquinas, error } = useCollection<Tragamonedas>(tragamonedasQuery)

  const resetForm = () => {
    setFormState(initialFormState)
    setEditingMaquina(null)
  }

  useEffect(() => {
    if (editingMaquina) {
      setFormState({
        nombre: editingMaquina.nombre,
        modelo: editingMaquina.modelo || '',
        estado: editingMaquina.estado,
      })
    } else {
      resetForm()
    }
  }, [editingMaquina])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleOpenModal = (maquina: TragamonedasConDocId | null = null) => {
    setEditingMaquina(maquina)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const handleFormChange = (field: keyof typeof formState, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!firestore || !user || !sucursalId || !formState.nombre) {
      toast({ title: "Error", description: "El nombre de la máquina es obligatorio.", variant: "destructive" })
      return
    }
    setLoading(true)

    const dataToSave = {
      nombre: formState.nombre,
      modelo: formState.modelo,
      estado: formState.estado,
    }

    try {
      const basePath = `sucursales/${sucursalId}`
      if (editingMaquina) {
        const maquinaRef = doc(firestore, `${basePath}/tragamonedas`, editingMaquina.docId)
        await setDoc(maquinaRef, { ...dataToSave, idTragamonedas: editingMaquina.idTragamonedas }, { merge: true })
      } else {
        await runTransaction(firestore, async (transaction) => {
          const correlativoRef = doc(firestore, `${basePath}/correlativos`, "tragamonedas")
          const correlativoDoc = await transaction.get(correlativoRef)

          let nuevoCorrelativo = 1
          if (correlativoDoc.exists() && correlativoDoc.data()?.correlativo) {
            nuevoCorrelativo = correlativoDoc.data().correlativo + 1
          }

          const nuevaMaquinaRef = doc(firestore, `${basePath}/tragamonedas`, nuevoCorrelativo.toString())
          const finalData = { ...dataToSave, idTragamonedas: nuevoCorrelativo }

          transaction.set(nuevaMaquinaRef, finalData)
          transaction.set(correlativoRef, { correlativo: nuevoCorrelativo }, { merge: true })

          const generalesRef = doc(firestore, `${basePath}/generales_tragamonedas`, nuevoCorrelativo.toString())
          const generalesData = {
            id: nuevoCorrelativo.toString(),
            idTragamonedas: nuevoCorrelativo.toString(),
            nombre: formState.nombre,
            totalPremios: 0,
            totalExtraccion: 0,
            totalDeuda: 0,
            totalBase: 0,
            fechaActualizacion: Timestamp.now(),
          }
          transaction.set(generalesRef, generalesData)
        })
      }
      toast({ title: "Éxito", description: `Máquina ${editingMaquina ? 'actualizada' : 'creada'} correctamente.` })
      handleCloseModal()
    } catch (error: any) {
      console.error("Error guardando máquina:", error)
      toast({ title: "Error", description: error.message || "No se pudo guardar la máquina.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMaquina = async () => {
    if (!firestore || !maquinaToDelete || !sucursalId) return

    const maquinaRef = doc(firestore, `sucursales/${sucursalId}/tragamonedas`, maquinaToDelete.docId)
    try {
      await deleteDoc(maquinaRef)
      toast({ title: "Éxito", description: "Máquina eliminada correctamente." })
    } catch (error: any) {
      console.error("Error eliminando máquina:", error)
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setMaquinaToDelete(null)
    }
  }

  const maquinasConDocId = useMemo((): TragamonedasConDocId[] => {
    return (maquinas || []).map((m) => ({ ...m, docId: m.id }))
  }, [maquinas])

  const isLoading = isLoadingMaquinas || isUserLoading || isLoadingSucursal

  return {
    isMounted,
    isLoading,
    error,
    maquinasConDocId,
    isModalOpen,
    setIsModalOpen,
    maquinaToDelete,
    setMaquinaToDelete,
    editingMaquina,
    loading,
    formState,
    handleOpenModal,
    handleCloseModal,
    handleFormChange,
    handleSubmit,
    handleDeleteMaquina,
  }
}
