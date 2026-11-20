'use client'

import { useState, useEffect, useMemo, useCallback, FormEvent } from "react"
import { useFirebase, useUser, useCollection, useDoc, useMemoFirebase } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, query, runTransaction, orderBy } from "firebase/firestore"
import { useSucursal } from "@/hooks/use-sucursal"
import { useToast } from "@/hooks/use-toast"
import type { Producto, Preparacion } from "@/lib/tipos"
import { registrarAuditoria } from "@/lib/firebase/servicios"

export type ProductoConDocId = Producto & { docId: string }

export function useCatalogoProductos() {
  const { firestore } = useFirebase()
  const { user } = useUser()
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal()
  const { toast } = useToast()

  // Estados de UI
  const [isMounted, setIsMounted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState<string>("name-asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Estados de datos
  const [editingProduct, setEditingProduct] = useState<ProductoConDocId | null>(null)
  const [productToDelete, setProductToDelete] = useState<ProductoConDocId | null>(null)

  // Estados del formulario
  const [nombre, setNombre] = useState('')
  const [precioCompra, setPrecioCompra] = useState<number | ''>('')
  const [precioVenta, setPrecioVenta] = useState<number | ''>('')
  const [existencia, setExistencia] = useState<number | ''>('')
  const [existenciaMinima, setExistenciaMinima] = useState<number | ''>('')
  const [ubicacion, setUbicacion] = useState('')
  const [ubicacionFiltro, setUbicacionFiltro] = useState('todas')
  const [preparaciones, setPreparaciones] = useState<Preparacion[]>([])

  const resetForm = useCallback(() => {
    setNombre('')
    setPrecioCompra('')
    setPrecioVenta('')
    setExistencia('')
    setExistenciaMinima('')
    setUbicacion('')
    setPreparaciones([])
    setEditingProduct(null)
  }, [])

  // Consultas Firestore
  const productosQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null
    return query(collection(firestore, `sucursales/${sucursalId}/productos`), orderBy("nombre", "asc"))
  }, [firestore, sucursalId])

  const { data: rawProductos, isLoading: isLoadingProductos } = useCollection<Producto>(productosQuery)

  const generalesRef = useMemoFirebase(
    () => (firestore && sucursalId) ? doc(firestore, `sucursales/${sucursalId}/generales/actual`) : null,
    [firestore, sucursalId]
  )
  const { data: generalesData } = useDoc<{ ubicacionesProducto?: string[] }>(generalesRef)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (editingProduct) {
      setNombre(editingProduct.nombre)
      setPrecioCompra(editingProduct.precioCompra ?? '')
      setPrecioVenta(editingProduct.precioVenta ?? '')
      setExistencia(editingProduct.existencia ?? '')
      setExistenciaMinima(editingProduct.existenciaMinima ?? '')
      setUbicacion(editingProduct.ubicacion || '')
      setPreparaciones(editingProduct.preparaciones || [])
    } else if (!isModalOpen) {
      resetForm()
    }
  }, [editingProduct, isModalOpen, resetForm])

  const productosConDocId = useMemo((): ProductoConDocId[] => {
    return (rawProductos || []).map((p) => ({ ...p, docId: p.id } as ProductoConDocId))
  }, [rawProductos])

  const ubicacionesDisponibles = useMemo(() => {
    if (Array.isArray(generalesData?.ubicacionesProducto)) {
      return generalesData.ubicacionesProducto
    }
    const defaultSet = new Set(['Estantes', 'Refris', 'Congeladores', 'Mostrador', 'Bodega'])
    ;(rawProductos || []).forEach(p => {
      if (p.ubicacion && p.ubicacion.trim()) defaultSet.add(p.ubicacion.trim())
    })
    return Array.from(defaultSet)
  }, [generalesData, rawProductos])

  const agregarUbicacion = useCallback(async (nuevaUbicacion: string) => {
    const limpia = nuevaUbicacion.trim()
    if (!limpia || !firestore || !sucursalId) return
    const yaExiste = ubicacionesDisponibles.some(u => u.toLowerCase() === limpia.toLowerCase())
    if (yaExiste) {
      const existente = ubicacionesDisponibles.find(u => u.toLowerCase() === limpia.toLowerCase())!
      setUbicacion(existente)
      return
    }
    const nuevaLista = [...ubicacionesDisponibles, limpia]
    await setDoc(doc(firestore, `sucursales/${sucursalId}/generales/actual`), { ubicacionesProducto: nuevaLista }, { merge: true })
    setUbicacion(limpia)
    toast({ title: "Ubicación agregada", description: `"${limpia}" se añadió al listado.` })
  }, [firestore, sucursalId, ubicacionesDisponibles, toast])

  const eliminarUbicacion = useCallback(async (ubicacionAEliminar: string) => {
    if (!ubicacionAEliminar || !firestore || !sucursalId) return
    const nuevaLista = ubicacionesDisponibles.filter(u => u !== ubicacionAEliminar)
    await setDoc(doc(firestore, `sucursales/${sucursalId}/generales/actual`), { ubicacionesProducto: nuevaLista }, { merge: true })
    if (ubicacion === ubicacionAEliminar) setUbicacion('')
    toast({ title: "Ubicación eliminada", description: `"${ubicacionAEliminar}" fue removida del listado.` })
  }, [firestore, sucursalId, ubicacionesDisponibles, ubicacion, toast])

  const filteredProducts = useMemo(() => {
    let result = productosConDocId.filter(p => {
      const matchSearch = (p.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchUbicacion = ubicacionFiltro === 'todas' || (p.ubicacion || '').toLowerCase() === ubicacionFiltro.toLowerCase()
      return matchSearch && matchUbicacion
    })

    result.sort((a, b) => {
      if (sortOrder === 'name-asc') return a.nombre.localeCompare(b.nombre)
      if (sortOrder === 'name-desc') return b.nombre.localeCompare(a.nombre)
      if (sortOrder === 'stock-asc') return a.existencia - b.existencia
      if (sortOrder === 'stock-desc') return b.existencia - a.existencia
      return 0
    })

    return result
  }, [productosConDocId, searchTerm, sortOrder, ubicacionFiltro])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sortOrder, ubicacionFiltro, itemsPerPage])

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredProducts.slice(start, start + itemsPerPage)
  }, [filteredProducts, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!firestore || !user || !sucursalId || !nombre || precioVenta === '' || existencia === '') return
    setLoading(true)

    const busquedaTokens = nombre.toLowerCase().split(' ').filter(t => t.length > 0)
    const dataToSave = {
      nombre,
      codigoBusqueda: nombre.toLowerCase(),
      busquedaTokens,
      precioCompra: Number(precioCompra) || 0,
      precioVenta: Number(precioVenta),
      existencia: Number(existencia),
      existenciaMinima: Number(existenciaMinima) || 0,
      ubicacion: ubicacion.trim() || undefined,
      preparaciones
    }

    try {
      if (editingProduct) {
        await setDoc(doc(firestore, `sucursales/${sucursalId}/productos`, editingProduct.docId), dataToSave, { merge: true })
        await registrarAuditoria(firestore, sucursalId, {
          usuarioId: user.uid,
          usuarioNombre: user.displayName || user.email || 'Usuario',
          usuarioEmail: user.email || '',
          categoria: 'CATALOGO',
          accion: 'PRODUCTO_EDITAR',
          titulo: `Producto editado: ${nombre}`,
          descripcion: `Precio venta: Q${Number(precioVenta).toFixed(2)}, Existencia: ${existencia}, Ubicación: ${ubicacion || 'Ninguna'}`,
          detalles: {
            productoId: editingProduct.docId,
            nombre,
            precioVenta: Number(precioVenta),
            existencia: Number(existencia),
            ubicacion: ubicacion || null
          }
        })
      } else {
        await runTransaction(firestore, async (transaction) => {
          const corrRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, "productos")
          const corrSnap = await transaction.get(corrRef)
          const nuevoId = (corrSnap.data()?.correlativo || 0) + 1
          transaction.set(doc(firestore, `sucursales/${sucursalId}/productos`, nuevoId.toString()), { ...dataToSave, idProducto: nuevoId })
          transaction.set(corrRef, { correlativo: nuevoId }, { merge: true })

          registrarAuditoria(firestore, sucursalId, {
            usuarioId: user.uid,
            usuarioNombre: user.displayName || user.email || 'Usuario',
            usuarioEmail: user.email || '',
            categoria: 'CATALOGO',
            accion: 'PRODUCTO_CREAR',
            titulo: `Nuevo producto: ${nombre}`,
            descripcion: `Precio venta: Q${Number(precioVenta).toFixed(2)}, Existencia inicial: ${existencia}`,
            detalles: {
              idProducto: nuevoId,
              nombre,
              precioVenta: Number(precioVenta),
              existencia: Number(existencia),
              ubicacion: ubicacion || null
            }
          }, transaction)
        })
      }
      toast({ title: "Éxito", description: "Catálogo actualizado." })
      resetForm()
      setIsModalOpen(false)
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!firestore || !productToDelete || !sucursalId || !user) return
    setLoading(true)
    try {
      await deleteDoc(doc(firestore, `sucursales/${sucursalId}/productos`, productToDelete.docId))
      await registrarAuditoria(firestore, sucursalId, {
        usuarioId: user.uid,
        usuarioNombre: user.displayName || user.email || 'Usuario',
        usuarioEmail: user.email || '',
        categoria: 'CATALOGO',
        accion: 'PRODUCTO_ELIMINAR',
        titulo: `Producto eliminado: ${productToDelete.nombre}`,
        descripcion: `Producto eliminado del catálogo`,
        detalles: {
          productoId: productToDelete.docId,
          nombre: productToDelete.nombre
        }
      })
      toast({ title: "Éxito", description: "Producto eliminado." })
      setProductToDelete(null)
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const cargando = isLoadingProductos || isLoadingSucursal

  return {
    isMounted,
    cargando,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    ubicacionFiltro,
    setUbicacionFiltro,
    ubicacionesDisponibles,
    agregarUbicacion,
    eliminarUbicacion,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    totalItems: filteredProducts.length,
    paginatedProducts,
    productosConDocId,
    isModalOpen,
    setIsModalOpen,
    editingProduct,
    setEditingProduct,
    productToDelete,
    setProductToDelete,
    loading,
    form: {
      nombre, setNombre,
      precioCompra, setPrecioCompra,
      precioVenta, setPrecioVenta,
      existencia, setExistencia,
      existenciaMinima, setExistenciaMinima,
      ubicacion, setUbicacion,
      preparaciones, setPreparaciones
    },
    resetForm,
    handleSubmit,
    handleDelete,
  }
}
