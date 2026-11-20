'use client'

import { useState, useEffect, useMemo, useCallback, FormEvent } from 'react'
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase'
import {
  collection,
  doc,
  query,
  orderBy,
  runTransaction,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { useSucursal } from '@/hooks/use-sucursal'
import { useToast } from '@/hooks/use-toast'
import type { Promocion, Producto, ProductoVirtual, TipoPromocion } from '@/lib/tipos'

export type PromocionConDocId = Promocion & { docId: string }

export interface ProductoElegiblePromo {
  id: string
  nombre: string
  precioVenta: number
  esVirtual?: boolean
}

/**
 * Hook de gestión CRUD para promociones de la sucursal (combos, paquetes y descuentos).
 * Sincroniza productos físicos y virtuales elegibles para armar promociones en POS.
 */
export interface FormPromocionState {
  nombre: string
  descripcion: string
  tipo: TipoPromocion
  activa: boolean
  cantidadLleva: number | ''
  cantidadPaga: number | ''
  combinable: boolean
  precioPromocion: number | ''
  cantidadRequerida: number | ''
  precioPaquete: number | ''
  porcentajeDescuento: number | ''
  productosIds: string[]
  usarVigencia: boolean
  diasSemana: number[]
  horaInicio: string
  horaFin: string
}

const FORM_INICIAL: FormPromocionState = {
  nombre: '',
  descripcion: '',
  tipo: 'nxm',
  activa: true,
  cantidadLleva: 2,
  cantidadPaga: 1,
  combinable: false,
  precioPromocion: '',
  cantidadRequerida: 2,
  precioPaquete: '',
  porcentajeDescuento: '',
  productosIds: [],
  usarVigencia: false,
  diasSemana: [],
  horaInicio: '18:00',
  horaFin: '22:00',
}

export function usePromociones() {
  const { firestore } = useFirebase()
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal()
  const { toast } = useToast()

  const [isMounted, setIsMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'activas' | 'inactivas'>('todas')
  const [filtroTipo, setFiltroTipo] = useState<'todos' | TipoPromocion>('todos')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<PromocionConDocId | null>(null)
  const [promoToDelete, setPromoToDelete] = useState<PromocionConDocId | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<FormPromocionState>(FORM_INICIAL)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const promosQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null
    return query(collection(firestore, `sucursales/${sucursalId}/promociones`), orderBy('idPromocion', 'desc'))
  }, [firestore, sucursalId])

  const productosQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null
    return query(collection(firestore, `sucursales/${sucursalId}/productos`), orderBy('nombre', 'asc'))
  }, [firestore, sucursalId])

  const virtualesQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null
    return query(collection(firestore, `sucursales/${sucursalId}/productos_virtuales`), orderBy('nombre', 'asc'))
  }, [firestore, sucursalId])

  const { data: rawPromos, isLoading: isLoadingPromos } = useCollection<Promocion>(promosQuery)
  const { data: rawProductos, isLoading: isLoadingProductos } = useCollection<Producto>(productosQuery)
  const { data: rawVirtuales, isLoading: isLoadingVirtuales } = useCollection<ProductoVirtual>(virtualesQuery)

  const promocionesConDocId = useMemo((): PromocionConDocId[] => {
    return (rawPromos || []).map((p) => ({ ...p, docId: p.id }))
  }, [rawPromos])

  const productosElegibles = useMemo((): ProductoElegiblePromo[] => {
    const fisicos: ProductoElegiblePromo[] = (rawProductos || []).map((p) => ({
      id: p.id,
      nombre: p.nombre,
      precioVenta: p.precioVenta || 0,
      esVirtual: false,
    }))
    const virtuales: ProductoElegiblePromo[] = (rawVirtuales || [])
      .filter((v) => v.incluirEnPOS)
      .map((v) => ({
        id: v.id,
        nombre: `${v.nombre} (Virtual)`,
        precioVenta: v.precioVenta || 0,
        esVirtual: true,
      }))
    return [...fisicos, ...virtuales].sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [rawProductos, rawVirtuales])

  const mapaProductos = useMemo(() => {
    const map = new Map<string, ProductoElegiblePromo>()
    productosElegibles.forEach((p) => map.set(p.id, p))
    return map
  }, [productosElegibles])

  const conteos = useMemo(() => ({
    todas: promocionesConDocId.length,
    activas: promocionesConDocId.filter((p) => p.activa).length,
    inactivas: promocionesConDocId.filter((p) => !p.activa).length,
  }), [promocionesConDocId])

  const filteredPromos = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return promocionesConDocId.filter((p) => {
      if (filtroEstado === 'activas' && !p.activa) return false
      if (filtroEstado === 'inactivas' && p.activa) return false
      if (filtroTipo !== 'todos' && p.tipo !== filtroTipo) return false
      if (!term) return true

      const matchNombre = (p.nombre || '').toLowerCase().includes(term)
      const matchDesc = (p.descripcion || '').toLowerCase().includes(term)
      const matchProd = (p.productosIds || []).some((pid) =>
        (mapaProductos.get(pid)?.nombre || '').toLowerCase().includes(term)
      )
      return matchNombre || matchDesc || matchProd
    })
  }, [promocionesConDocId, filtroEstado, filtroTipo, searchTerm, mapaProductos])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filtroEstado, filtroTipo])

  const paginatedPromos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredPromos.slice(start, start + itemsPerPage)
  }, [filteredPromos, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredPromos.length / itemsPerPage) || 1

  const resetForm = useCallback(() => {
    setForm(FORM_INICIAL)
    setEditingPromo(null)
  }, [])

  const abrirNuevaPromocion = useCallback(() => {
    resetForm()
    setIsModalOpen(true)
  }, [resetForm])

  const abrirEditarPromocion = useCallback((promo: PromocionConDocId) => {
    setEditingPromo(promo)
    const tieneVigencia = Boolean(
      promo.vigencia &&
        ((promo.vigencia.diasSemana && promo.vigencia.diasSemana.length > 0) ||
          (promo.vigencia.horaInicio && promo.vigencia.horaFin))
    )
    setForm({
      nombre: promo.nombre || '',
      descripcion: promo.descripcion || '',
      tipo: promo.tipo || 'nxm',
      activa: promo.activa ?? true,
      cantidadLleva: promo.cantidadLleva ?? 2,
      cantidadPaga: promo.cantidadPaga ?? 1,
      combinable: promo.combinable ?? false,
      precioPromocion: promo.precioPromocion ?? '',
      cantidadRequerida: promo.cantidadRequerida ?? 2,
      precioPaquete: promo.precioPaquete ?? '',
      porcentajeDescuento: promo.porcentajeDescuento ?? '',
      productosIds: promo.productosIds || [],
      usarVigencia: tieneVigencia,
      diasSemana: promo.vigencia?.diasSemana || [],
      horaInicio: promo.vigencia?.horaInicio || '18:00',
      horaFin: promo.vigencia?.horaFin || '22:00',
    })
    setIsModalOpen(true)
  }, [])

  const cerrarModal = useCallback(() => {
    setIsModalOpen(false)
    resetForm()
  }, [resetForm])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!firestore || !sucursalId) return

    const nombreTrim = form.nombre.trim()
    if (!nombreTrim) {
      toast({ title: 'Error', description: 'Ingresa un nombre para la promoción.', variant: 'destructive' })
      return
    }
    if (form.productosIds.length === 0) {
      toast({ title: 'Error', description: 'Selecciona al menos un producto aplicable.', variant: 'destructive' })
      return
    }

    if (form.tipo === 'nxm') {
      const lleva = Number(form.cantidadLleva)
      const paga = Number(form.cantidadPaga)
      if (!lleva || lleva <= 1 || !paga || paga <= 0 || paga >= lleva) {
        toast({
          title: 'Regla inválida',
          description: 'En promociones NxM, "Lleva" debe ser mayor que "Paga" (ej. 2 y 1).',
          variant: 'destructive',
        })
        return
      }
    } else if (form.tipo === 'precio_especial') {
      if (form.precioPromocion === '' || Number(form.precioPromocion) < 0) {
        toast({ title: 'Error', description: 'Ingresa un precio promocional válido.', variant: 'destructive' })
        return
      }
    } else if (form.tipo === 'combo') {
      if (!form.cantidadRequerida || Number(form.cantidadRequerida) <= 0 || form.precioPaquete === '' || Number(form.precioPaquete) < 0) {
        toast({ title: 'Error', description: 'Completa la cantidad y precio del combo.', variant: 'destructive' })
        return
      }
    } else if (form.tipo === 'porcentaje') {
      const pct = Number(form.porcentajeDescuento)
      if (!pct || pct <= 0 || pct > 100) {
        toast({ title: 'Error', description: 'El porcentaje debe estar entre 1 y 100.', variant: 'destructive' })
        return
      }
    }

    setLoading(true)
    try {
      const payload: Record<string, any> = {
        sucursalId,
        nombre: nombreTrim,
        descripcion: form.descripcion.trim(),
        tipo: form.tipo,
        activa: form.activa,
        productosIds: form.productosIds,
        cantidadLleva: form.tipo === 'nxm' ? Number(form.cantidadLleva) : null,
        cantidadPaga: form.tipo === 'nxm' ? Number(form.cantidadPaga) : null,
        combinable: form.tipo === 'nxm' ? form.combinable : false,
        precioPromocion: form.tipo === 'precio_especial' ? Number(form.precioPromocion) : null,
        cantidadRequerida: form.tipo === 'combo' ? Number(form.cantidadRequerida) : null,
        precioPaquete: form.tipo === 'combo' ? Number(form.precioPaquete) : null,
        porcentajeDescuento: form.tipo === 'porcentaje' ? Number(form.porcentajeDescuento) : null,
        vigencia: form.usarVigencia
          ? {
              diasSemana: form.diasSemana,
              horaInicio: form.horaInicio || null,
              horaFin: form.horaFin || null,
            }
          : null,
        fechaActualizacion: serverTimestamp(),
      }

      if (editingPromo) {
        const promoRef = doc(firestore, `sucursales/${sucursalId}/promociones`, editingPromo.docId)
        await updateDoc(promoRef, payload)
        toast({ title: 'Promoción actualizada', description: `"${nombreTrim}" se actualizó correctamente.` })
      } else {
        await runTransaction(firestore, async (transaction) => {
          const corrRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'promociones')
          const corrSnap = await transaction.get(corrRef)
          const nuevoId = (corrSnap.data()?.correlativo || 0) + 1
          const newRef = doc(firestore, `sucursales/${sucursalId}/promociones`, nuevoId.toString())
          transaction.set(newRef, {
            ...payload,
            idPromocion: nuevoId,
            fechaCreacion: serverTimestamp(),
          })
          transaction.set(corrRef, { correlativo: nuevoId }, { merge: true })
        })
        toast({ title: 'Promoción creada', description: `"${nombreTrim}" ya está disponible.` })
      }

      cerrarModal()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'No se pudo guardar la promoción.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActiva = useCallback(
    async (promo: PromocionConDocId) => {
      if (!firestore || !sucursalId) return
      try {
        const ref = doc(firestore, `sucursales/${sucursalId}/promociones`, promo.docId)
        await updateDoc(ref, {
          activa: !promo.activa,
          fechaActualizacion: serverTimestamp(),
        })
        toast({
          title: !promo.activa ? 'Promoción activada' : 'Promoción pausada',
          description: `"${promo.nombre}" ahora está ${!promo.activa ? 'activa' : 'pausada'}.`,
        })
      } catch (error: any) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' })
      }
    },
    [firestore, sucursalId, toast]
  )

  const handleDelete = async () => {
    if (!firestore || !sucursalId || !promoToDelete) return
    setLoading(true)
    try {
      await deleteDoc(doc(firestore, `sucursales/${sucursalId}/promociones`, promoToDelete.docId))
      toast({ title: 'Promoción eliminada', description: `"${promoToDelete.nombre}" fue eliminada.` })
      setPromoToDelete(null)
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return {
    isMounted,
    cargando: isLoadingSucursal || isLoadingPromos,
    cargandoProductos: isLoadingProductos || isLoadingVirtuales,
    promociones: paginatedPromos,
    totalItems: filteredPromos.length,
    conteos,
    searchTerm,
    setSearchTerm,
    filtroEstado,
    setFiltroEstado,
    filtroTipo,
    setFiltroTipo,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    productosElegibles,
    mapaProductos,
    isModalOpen,
    editingPromo,
    promoToDelete,
    setPromoToDelete,
    loading,
    form,
    setForm,
    abrirNuevaPromocion,
    abrirEditarPromocion,
    cerrarModal,
    handleSubmit,
    handleToggleActiva,
    handleDelete,
  }
}

