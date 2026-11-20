'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc, query, runTransaction, orderBy } from 'firebase/firestore';
import { useSucursal } from '@/hooks/use-sucursal';
import { useToast } from '@/hooks/use-toast';
import type { ProductoVirtual } from '@/lib/tipos';

export type ProductoVirtualConDocId = ProductoVirtual & { docId: string };

/**
 * Hook de gestión CRUD para productos virtuales (servicios, monedas, recargas) de la sucursal.
 */
export function useProductosVirtuales() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  const { toast } = useToast();

  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  const productosQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(
      collection(firestore, `sucursales/${sucursalId}/productos_virtuales`),
      orderBy('idProductoVirtual', 'asc')
    );
  }, [firestore, sucursalId]);

  const { data: rawProductos, isLoading: isLoadingProductos } =
    useCollection<ProductoVirtual>(productosQuery);

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

  // Filtra por nombre o categoría y aplica el ordenamiento elegido
  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const filtered = productosConDocId.filter(
      (p) =>
        (p.nombre || '').toLowerCase().includes(term) ||
        (p.categoria || '').toLowerCase().includes(term)
    );
    return filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'name-desc':
          return (b.nombre || '').localeCompare(a.nombre || '');
        case 'price-asc':
          return (a.precioVenta || 0) - (b.precioVenta || 0);
        case 'price-desc':
          return (b.precioVenta || 0) - (a.precioVenta || 0);
        case 'name-asc':
        default:
          return (a.nombre || '').localeCompare(b.nombre || '');
      }
    });
  }, [productosConDocId, searchTerm, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOrder]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));

  /** Crea un producto virtual con correlativo atómico o actualiza uno existente. */
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
      incluirEnCompras,
    };

    try {
      if (editingProduct) {
        const ref = doc(
          firestore,
          `sucursales/${sucursalId}/productos_virtuales`,
          editingProduct.docId
        );
        await runTransaction(firestore, async (transaction) => {
          transaction.update(ref, dataToSave);
        });
      } else {
        await runTransaction(firestore, async (transaction) => {
          const corrRef = doc(
            firestore,
            `sucursales/${sucursalId}/correlativos`,
            'productos_virtuales'
          );
          const corrSnap = await transaction.get(corrRef);
          const nuevoId = (corrSnap.data()?.correlativo || 0) + 1;
          transaction.set(
            doc(firestore, `sucursales/${sucursalId}/productos_virtuales`, nuevoId.toString()),
            { ...dataToSave, idProductoVirtual: nuevoId }
          );
          transaction.set(corrRef, { correlativo: nuevoId }, { merge: true });
        });
      }
      toast({ title: 'Éxito', description: 'Catálogo actualizado.' });
      setIsModalOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  /** Elimina un producto virtual del catálogo de la sucursal. */
  const handleDelete = async () => {
    if (!firestore || !productToDelete || !sucursalId) return;
    setLoading(true);
    try {
      await deleteDoc(
        doc(firestore, `sucursales/${sucursalId}/productos_virtuales`, productToDelete.docId)
      );
      toast({ title: 'Éxito', description: 'Producto eliminado.' });
      setProductToDelete(null);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return {
    isMounted,
    isModalOpen,
    setIsModalOpen,
    loading,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    editingProduct,
    setEditingProduct,
    productToDelete,
    setProductToDelete,
    paginatedProducts,
    totalItems: filteredProducts.length,
    cargando: isLoadingProductos || isLoadingSucursal,
    form: {
      nombre,
      setNombre,
      codigoBusqueda,
      setCodigoBusqueda,
      precioVenta,
      setPrecioVenta,
      categoria,
      setCategoria,
      existencia,
      setExistencia,
      incluirEnPOS,
      setIncluirEnPOS,
      incluirEnCompras,
      setIncluirEnCompras,
    },
    handleSubmit,
    handleDelete,
  };
}

