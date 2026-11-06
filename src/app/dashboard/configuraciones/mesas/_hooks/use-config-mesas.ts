'use client'

import { useState, useEffect, useMemo, FormEvent } from "react"
import { useFirebase, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, query, runTransaction, orderBy } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { useSucursal } from "@/hooks/use-sucursal"
import {
  Tarifa,
  Mesa,
  TarifaConDocId,
  MesaConDocId,
  initialTarifaForm,
  initialMesaForm,
  Intervalo
} from "../_types/mesas-config-types"

export function useConfigMesas() {
  const [isMounted, setIsMounted] = useState(false)
  const { firestore } = useFirebase()
  const { user, isUserLoading } = useUser()
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal()
  const { toast } = useToast()

  // Estados de Modales y Carga
  const [loading, setLoading] = useState(false)
  const [isTarifaModalOpen, setIsTarifaModalOpen] = useState(false)
  const [isMesaModalOpen, setIsMesaModalOpen] = useState(false)
  const [tarifaToDelete, setTarifaToDelete] = useState<TarifaConDocId | null>(null)
  const [mesaToDelete, setMesaToDelete] = useState<MesaConDocId | null>(null)
  const [editingTarifa, setEditingTarifa] = useState<TarifaConDocId | null>(null)
  const [editingMesa, setEditingMesa] = useState<MesaConDocId | null>(null)

  // Estados de Formularios
  const [tarifaForm, setTarifaForm] = useState(initialTarifaForm)
  const [mesaForm, setMesaForm] = useState(initialMesaForm)
  const [nuevoIntervalo, setNuevoIntervalo] = useState<Intervalo>({ duracionMinutos: 60, precio: 10 })

  // Consultas Firestore
  const tarifasQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null
    return query(collection(firestore, `sucursales/${sucursalId}/tarifas`), orderBy("idTarifa", "asc"))
  }, [firestore, sucursalId])

  const mesasQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null
    return query(collection(firestore, `sucursales/${sucursalId}/mesas_de_billar`), orderBy("numeroMesa", "asc"))
  }, [firestore, sucursalId])

  const { data: tarifas, isLoading: isLoadingTarifas } = useCollection<Tarifa>(tarifasQuery)
  const { data: mesas, isLoading: isLoadingMesas } = useCollection<Mesa>(mesasQuery)

  const tarifasConDocId = useMemo(() => (tarifas || []).map(t => ({ ...t, docId: t.id })), [tarifas])
  const mesasConDocId = useMemo(() => (mesas || []).map(m => ({ ...m, docId: m.id })), [mesas])

  // Efectos de inicialización y edición
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (editingTarifa) {
      setTarifaForm({
        nombre: editingTarifa.nombre,
        tipoDeMesa: editingTarifa.tipoDeMesa,
        tipoDeCalculo: editingTarifa.tipoDeCalculo,
        costoPorMinuto: editingTarifa.costoPorMinuto ?? 0,
        intervalos: editingTarifa.intervalos ?? [],
        esDefault: editingTarifa.esDefault ?? false,
        controlesBase: editingTarifa.controlesBase ?? 2,
        costoControlExtra: editingTarifa.costoControlExtra ?? 0,
      })
    } else {
      setTarifaForm(initialTarifaForm)
    }
  }, [editingTarifa])

  useEffect(() => {
    if (editingMesa) {
      setMesaForm({
        numeroMesa: editingMesa.numeroMesa,
        tipoDeMesa: editingMesa.tipoDeMesa,
        tarifaId: editingMesa.tarifaId,
      })
    } else {
      setMesaForm(initialMesaForm)
    }
  }, [editingMesa])

  // Lógica de Tarifas
  const handleTarifaSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!firestore || !sucursalId || !tarifaForm.nombre) return
    setLoading(true)

    const dataToSave = {
      ...tarifaForm,
      costoPorMinuto: tarifaForm.tipoDeCalculo === 'Por minuto' ? Number(tarifaForm.costoPorMinuto) : 0,
      intervalos: tarifaForm.tipoDeCalculo === 'Por intervalo' ? tarifaForm.intervalos : [],
      controlesBase: tarifaForm.tipoDeMesa === 'Consola' ? Number(tarifaForm.controlesBase) : 0,
      costoControlExtra: tarifaForm.tipoDeMesa === 'Consola' ? Number(tarifaForm.costoControlExtra) : 0,
    }

    try {
      if (editingTarifa) {
        const tarifaRef = doc(firestore, `sucursales/${sucursalId}/tarifas`, editingTarifa.docId)
        await setDoc(tarifaRef, { ...dataToSave, idTarifa: editingTarifa.idTarifa }, { merge: true })
      } else {
        await runTransaction(firestore, async (transaction) => {
          const correlativoRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, "tarifas")
          const correlativoDoc = await transaction.get(correlativoRef)
          let nuevoCorrelativo = (correlativoDoc.exists() ? (correlativoDoc.data().correlativo || 0) : 0) + 1
          const nuevaTarifaRef = doc(firestore, `sucursales/${sucursalId}/tarifas`, nuevoCorrelativo.toString())
          transaction.set(nuevaTarifaRef, { ...dataToSave, idTarifa: nuevoCorrelativo })
          transaction.set(correlativoRef, { correlativo: nuevoCorrelativo }, { merge: true })
        })
      }
      toast({ title: "Éxito", description: "Tarifa guardada correctamente." })
      setIsTarifaModalOpen(false)
      setEditingTarifa(null)
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTarifa = async () => {
    if (!firestore || !tarifaToDelete || !sucursalId) return
    try {
      await deleteDoc(doc(firestore, `sucursales/${sucursalId}/tarifas`, tarifaToDelete.docId))
      toast({ title: "Éxito", description: "Tarifa eliminada." })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setTarifaToDelete(null)
    }
  }

  const handleAddIntervalo = () => {
    if (nuevoIntervalo.duracionMinutos > 0 && nuevoIntervalo.precio > 0) {
      setTarifaForm(prev => ({ ...prev, intervalos: [...(prev.intervalos || []), nuevoIntervalo] }))
      setNuevoIntervalo({ duracionMinutos: 60, precio: 10 })
    }
  }

  const handleRemoveIntervalo = (index: number) => {
    setTarifaForm(prev => ({
      ...prev,
      intervalos: (prev.intervalos || []).filter((_, idx) => idx !== index)
    }))
  }

  // Lógica de Mesas
  const handleMesaSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!firestore || !sucursalId || !mesaForm.numeroMesa || !mesaForm.tarifaId) {
      toast({ title: "Error", description: "Completa los campos obligatorios.", variant: "destructive" })
      return
    }
    setLoading(true)

    try {
      const mesaRef = doc(firestore, `sucursales/${sucursalId}/mesas_de_billar`, mesaForm.numeroMesa.toString())
      const dataToSave = {
        ...mesaForm,
        estado: editingMesa ? editingMesa.estado : 'disponible',
      }
      await setDoc(mesaRef, dataToSave, { merge: true })
      toast({ title: "Éxito", description: "Estación guardada correctamente." })
      setIsMesaModalOpen(false)
      setEditingMesa(null)
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMesa = async () => {
    if (!firestore || !mesaToDelete || !sucursalId) return
    try {
      await deleteDoc(doc(firestore, `sucursales/${sucursalId}/mesas_de_billar`, mesaToDelete.docId))
      toast({ title: "Éxito", description: "Estación eliminada." })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setMesaToDelete(null)
    }
  }

  const abrirNuevaTarifa = () => {
    setEditingTarifa(null)
    setIsTarifaModalOpen(true)
  }

  const abrirEditarTarifa = (tarifa: TarifaConDocId) => {
    setEditingTarifa(tarifa)
    setIsTarifaModalOpen(true)
  }

  const abrirNuevaMesa = () => {
    setEditingMesa(null)
    setIsMesaModalOpen(true)
  }

  const abrirEditarMesa = (mesa: MesaConDocId) => {
    setEditingMesa(mesa)
    setIsMesaModalOpen(true)
  }

  const isGlobalLoading = isLoadingTarifas || isLoadingMesas || isUserLoading || isLoadingSucursal

  return {
    isMounted,
    isGlobalLoading,
    loading,
    tarifasConDocId,
    mesasConDocId,
    // Modales y handlers
    isTarifaModalOpen,
    setIsTarifaModalOpen,
    isMesaModalOpen,
    setIsMesaModalOpen,
    tarifaToDelete,
    setTarifaToDelete,
    mesaToDelete,
    setMesaToDelete,
    editingTarifa,
    editingMesa,
    // Formularios
    tarifaForm,
    setTarifaForm,
    mesaForm,
    setMesaForm,
    nuevoIntervalo,
    setNuevoIntervalo,
    // Acciones
    handleTarifaSubmit,
    handleDeleteTarifa,
    handleAddIntervalo,
    handleRemoveIntervalo,
    handleMesaSubmit,
    handleDeleteMesa,
    abrirNuevaTarifa,
    abrirEditarTarifa,
    abrirNuevaMesa,
    abrirEditarMesa,
  }
}
