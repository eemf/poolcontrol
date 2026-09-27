'use client'

import { useState, useEffect, useMemo, useCallback } from "react"
import { useFirebase, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, deleteDoc, query, runTransaction, orderBy } from "firebase/firestore"
import { useSucursal } from "@/hooks/use-sucursal"
import { useToast } from "@/hooks/use-toast"
import type { ProductoVirtual } from "@/lib/tipos"

// Componentes Refactorizados
import { EncabezadoProductosVirtuales } from "./_components/EncabezadoProductosVirtuales"
import { ListaProductosVirtuales } from "./_components/ListaProductosVirtuales"
import { ModalProductoVirtual } from "./_components/ModalProductoVirtual"
import { DialogoEliminarProductoVirtual } from "./_components/DialogoEliminarProductoVirtual"

type ProductoVirtualConDocId = ProductoVirtual & { docId: string };

export default function PaginaProductosVirtuales() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  const { toast } = useToast();

  // Estados de UI
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Estados de datos
  const [editingProduct, setEditingProduct] = useState<ProductoVirtualConDocId | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductoVirtualConDocId | null>(null);

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [precioVenta, setPrecioVenta] = useState<number | ''>('');
  const [categoria, setCategoria] = useState('Otros');
  const [existencia, setExistencia] = useState<number | ''>('');
  const [incluirEnPOS, setIncluirEnPOS] = useState(false);
  const [incluirEnCompras, setIncluirEnCompras] = useState(false);

  // Consultas
  const productosQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/productos_virtuales`), orderBy("idProductoVirtual", "asc"));
  }, [firestore, sucursalId]);

  const { data: rawProductos, isLoading: isLoadingProductos } = useCollection<ProductoVirtual>(productosQuery);

  const resetForm = useCallback(() => {
    setNombre('');
    setCodigoBusqueda('');
    setPrecioVenta('');
    setCategoria('Otros');
    setExistencia('');
    setIncluirEnPOS(false);
    setIncluirEnCompras(false);
    setEditingProduct(null);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (editingProduct) {
      setNombre(editingProduct.nombre);
      setCodigoBusqueda(editingProduct.codigoBusqueda || '');
      setPrecioVenta(editingProduct.precioVenta);
      setCategoria(editingProduct.categoria || 'Otros');
      setExistencia(editingProduct.existencia ?? '');
      setIncluirEnPOS(editingProduct.incluirEnPOS ?? false);
      setIncluirEnCompras(editingProduct.incluirEnCompras ?? false);
    } else {
      resetForm();
    }
  }, [editingProduct, resetForm]);

  const productosConDocId = useMemo((): ProductoVirtualConDocId[] => {
    return (rawProductos || []).map((p) => ({ ...p, docId: p.id } as ProductoVirtualConDocId));
  }, [rawProductos]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return productosConDocId.filter(p => 
      (p.nombre || '').toLowerCase().includes(term) ||
      (p.categoria || '').toLowerCase().includes(term)
    );
  }, [productosConDocId, searchTerm]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !sucursalId || !nombre || precioVenta === '') return;
    setLoading(true);

    const dataToSave = {
      nombre,
      codigoBusqueda: codigoBusqueda || nombre.toLowerCase(),
      precioVenta: Number(precioVenta),
      categoria,
      existencia: Number(existencia) || 0,
      incluirEnPOS,
      incluirEnCompras
    };

    try {
      if (editingProduct) {
        const ref = doc(firestore, `sucursales/${sucursalId}/productos_virtuales`, editingProduct.docId);
        await runTransaction(firestore, async (transaction) => {
            transaction.update(ref, dataToSave);
        });
      } else {
        await runTransaction(firestore, async (transaction) => {
          const corrRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, "productos_virtuales");
          const corrSnap = await transaction.get(corrRef);
          const nuevoId = (corrSnap.data()?.correlativo || 0) + 1;
          transaction.set(doc(firestore, `sucursales/${sucursalId}/productos_virtuales`, nuevoId.toString()), { ...dataToSave, idProductoVirtual: nuevoId });
          transaction.set(corrRef, { correlativo: nuevoId }, { merge: true });
        });
      }
      toast({ title: "Éxito", description: "Catálogo actualizado." });
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
      await deleteDoc(doc(firestore, `sucursales/${sucursalId}/productos_virtuales`, productToDelete.docId));
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
      <EncabezadoProductosVirtuales onNuevoProducto={() => { setEditingProduct(null); setIsModalOpen(true); }} />
      
      <ListaProductosVirtuales 
        productos={paginatedProducts}
        cargando={isLoadingProductos || isLoadingSucursal}
        terminoBusqueda={searchTerm}
        onSearchChange={setSearchTerm}
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

      <ModalProductoVirtual 
        abierto={isModalOpen || !!editingProduct}
        onClose={() => { setIsModalOpen(false); setEditingProduct(null); }}
        editando={!!editingProduct}
        onSubmit={handleSubmit}
        procesando={loading}
        form={{
          nombre, setNombre,
          codigoBusqueda, setCodigoBusqueda,
          precioVenta, setPrecioVenta,
          categoria, setCategoria,
          existencia, setExistencia,
          incluirEnPOS, setIncluirEnPOS,
          incluirEnCompras, setIncluirEnCompras
        }}
      />

      <DialogoEliminarProductoVirtual 
        producto={productToDelete}
        abierto={!!productToDelete}
        onOpenChange={(o) => !o && setProductToDelete(null)}
        onConfirmar={handleDelete}
        procesando={loading}
      />
    </div>
  );
}
