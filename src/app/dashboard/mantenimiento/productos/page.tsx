'use client'

import { useState, useEffect, useMemo, useCallback } from "react"
import { useFirebase, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, query, runTransaction, orderBy } from "firebase/firestore"
import { useSucursal } from "@/hooks/use-sucursal"
import { useToast } from "@/hooks/use-toast"
import type { Producto, Preparacion } from "@/lib/tipos"

// Componentes Refactorizados
import { EncabezadoProductos } from "./_components/EncabezadoProductos"
import { ListaProductos } from "./_components/ListaProductos"
import { ModalProducto } from "./_components/ModalProducto"
import { DialogoEliminarProducto } from "./_components/DialogoEliminarProducto"

type ProductoConDocId = Producto & { docId: string };

export default function PaginaCatalogoProductos() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  const { toast } = useToast();

  // Estados de UI
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<string>("name-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Estados de datos
  const [editingProduct, setEditingProduct] = useState<ProductoConDocId | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductoConDocId | null>(null);

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [precioCompra, setPrecioCompra] = useState<number | ''>('');
  const [precioVenta, setPrecioVenta] = useState<number | ''>('');
  const [existencia, setExistencia] = useState<number | ''>('');
  const [existenciaMinima, setExistenciaMinima] = useState<number | ''>('');
  const [preparaciones, setPreparaciones] = useState<Preparacion[]>([]);

  const resetForm = useCallback(() => {
    setNombre('');
    setPrecioCompra('');
    setPrecioVenta('');
    setExistencia('');
    setExistenciaMinima('');
    setPreparaciones([]);
    setEditingProduct(null);
  }, []);

  // Consultas
  const productosQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/productos`), orderBy("nombre", "asc"));
  }, [firestore, sucursalId]);

  const { data: rawProductos, isLoading: isLoadingProductos } = useCollection<Producto>(productosQuery);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (editingProduct) {
      setNombre(editingProduct.nombre);
      setPrecioCompra(editingProduct.precioCompra ?? '');
      setPrecioVenta(editingProduct.precioVenta ?? '');
      setExistencia(editingProduct.existencia ?? '');
      setExistenciaMinima(editingProduct.existenciaMinima ?? '');
      setPreparaciones(editingProduct.preparaciones || []);
    } else if (!isModalOpen) {
      resetForm();
    }
  }, [editingProduct, isModalOpen, resetForm]);

  const productosConDocId = useMemo((): ProductoConDocId[] => {
    return (rawProductos || []).map((p) => ({ ...p, docId: p.id } as ProductoConDocId));
  }, [rawProductos]);

  const filteredProducts = useMemo(() => {
    let result = productosConDocId.filter(p => 
      (p.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    result.sort((a, b) => {
      if (sortOrder === 'name-asc') return a.nombre.localeCompare(b.nombre);
      if (sortOrder === 'name-desc') return b.nombre.localeCompare(a.nombre);
      if (sortOrder === 'stock-asc') return a.existencia - b.existencia;
      if (sortOrder === 'stock-desc') return b.existencia - a.existencia;
      return 0;
    });

    return result;
  }, [productosConDocId, searchTerm, sortOrder]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !sucursalId || !nombre || precioVenta === '' || existencia === '') return;
    setLoading(true);

    const busquedaTokens = nombre.toLowerCase().split(' ').filter(t => t.length > 0);
    const dataToSave = {
      nombre,
      codigoBusqueda: nombre.toLowerCase(),
      busquedaTokens,
      precioCompra: Number(precioCompra) || 0,
      precioVenta: Number(precioVenta),
      existencia: Number(existencia),
      existenciaMinima: Number(existenciaMinima) || 0,
      preparaciones
    };

    try {
      if (editingProduct) {
        await setDoc(doc(firestore, `sucursales/${sucursalId}/productos`, editingProduct.docId), dataToSave, { merge: true });
      } else {
        await runTransaction(firestore, async (transaction) => {
          const corrRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, "productos");
          const corrSnap = await transaction.get(corrRef);
          const nuevoId = (corrSnap.data()?.correlativo || 0) + 1;
          transaction.set(doc(firestore, `sucursales/${sucursalId}/productos`, nuevoId.toString()), { ...dataToSave, idProducto: nuevoId });
          transaction.set(corrRef, { correlativo: nuevoId }, { merge: true });
        });
      }
      toast({ title: "Éxito", description: "Catálogo actualizado." });
      resetForm();
      setIsModalOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!firestore || !productToDelete || !sucursalId) return;
    setLoading(true);
    try {
      await deleteDoc(doc(firestore, `sucursales/${sucursalId}/productos`, productToDelete.docId));
      toast({ title: "Éxito", description: "Producto eliminado." });
      setProductToDelete(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-6">
      <EncabezadoProductos onNuevoProducto={() => { resetForm(); setIsModalOpen(true); }} />
      
      <ListaProductos 
        productos={paginatedProducts}
        cargando={isLoadingProductos || isLoadingSucursal}
        terminoBusqueda={searchTerm}
        onSearchChange={setSearchTerm}
        orden={sortOrder}
        onSortOrderChange={setSortOrder}
        onEditar={setEditingProduct}
        onEliminar={setProductToDelete}
        paginacion={{
          paginaActual: currentPage,
          itemsPorPagina: itemsPerPage,
          totalPaginas: totalPages,
          onPaginaChange: setCurrentPage,
          onItemsPorPaginaChange: setItemsPerPage
        }}
      />

      <ModalProducto 
        abierto={isModalOpen || !!editingProduct}
        onClose={() => { setIsModalOpen(false); setEditingProduct(null); }}
        editando={!!editingProduct}
        onSubmit={handleSubmit}
        procesando={loading}
        productosParaIngredientes={productosConDocId}
        form={{
          nombre, setNombre,
          precioCompra, setPrecioCompra,
          precioVenta, setPrecioVenta,
          existencia, setExistencia,
          existenciaMinima, setExistenciaMinima,
          preparaciones, setPreparaciones
        }}
      />

      <DialogoEliminarProducto 
        producto={productToDelete}
        abierto={!!productToDelete}
        onOpenChange={(o) => !o && setProductToDelete(null)}
        onConfirmar={handleDelete}
        procesando={loading}
      />
    </div>
  );
}
