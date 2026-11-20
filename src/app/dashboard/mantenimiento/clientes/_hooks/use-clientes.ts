'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  runTransaction,
  orderBy,
} from 'firebase/firestore';
import { useSucursal } from '@/hooks/use-sucursal';
import { useToast } from '@/hooks/use-toast';
import type { Cliente } from '@/lib/tipos';

export type ClienteConDocId = Cliente & { docId: string };

/**
 * Hook de gestión CRUD para el catálogo de clientes y proveedores de la sucursal.
 * Garantiza la existencia del cliente base "Venta Rápida" (id 0) y maneja correlativos atómicos.
 */
export function useClientes() {
  const { firestore } = useFirebase();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  const { toast } = useToast();

  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<string>('id-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [editingCustomer, setEditingCustomer] = useState<ClienteConDocId | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<ClienteConDocId | null>(null);

  // Estado unificado del formulario para evitar múltiples re-renders al editar
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    tipoCliente: 'Cliente' as Cliente['tipoCliente'],
    consumoInterno: false,
    pinConsumoInterno: '',
    permiteCredito: true,
  });

  // Consulta ordenada dinámicamente según el selector activo
  const customersQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    const [field, direction] = sortOrder.split('-');
    const firestoreField = field === 'id' ? 'idcliente' : 'nombre';
    return query(
      collection(firestore, `sucursales/${sucursalId}/clientes`),
      orderBy(firestoreField, direction as 'asc' | 'desc')
    );
  }, [firestore, sucursalId, sortOrder]);

  const { data: customers, isLoading: isLoadingCustomers } =
    useCollection<Cliente>(customersQuery);

  // Asegura la existencia del cliente genérico "Venta Rápida" (id 0) en la sucursal
  useEffect(() => {
    setIsMounted(true);
    const ensureDefault = async () => {
      if (!firestore || !sucursalId || isLoadingCustomers) return;
      if (customers && !customers.some((c) => c.id === '0')) {
        await setDoc(doc(firestore, `sucursales/${sucursalId}/clientes`, '0'), {
          idcliente: 0,
          nombre: 'Venta Rápida',
          tipoCliente: 'Cliente',
          consumoInterno: false,
          permiteCredito: false,
        });
      }
    };
    ensureDefault();
  }, [firestore, sucursalId, customers, isLoadingCustomers]);

  const resetForm = useCallback(() => {
    setFormData({
      nombre: '',
      telefono: '',
      tipoCliente: 'Cliente',
      consumoInterno: false,
      pinConsumoInterno: '',
      permiteCredito: true,
    });
    setEditingCustomer(null);
  }, []);

  useEffect(() => {
    if (editingCustomer) {
      setFormData({
        nombre: editingCustomer.nombre,
        telefono: editingCustomer.telefono || '',
        tipoCliente: editingCustomer.tipoCliente,
        consumoInterno: editingCustomer.consumoInterno || false,
        pinConsumoInterno: editingCustomer.pinConsumoInterno || '',
        permiteCredito: editingCustomer.permiteCredito !== false,
      });
    } else if (!isModalOpen) {
      resetForm();
    }
  }, [editingCustomer, isModalOpen, resetForm]);

  const clientesConDocId = useMemo((): ClienteConDocId[] => {
    return (customers || []).map((c) => ({ ...c, docId: c.id } as ClienteConDocId));
  }, [customers]);

  // Excluye el cliente genérico (id 0) del listado editable y aplica búsqueda
  const filteredCustomers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return clientesConDocId.filter(
      (c) =>
        c.idcliente !== 0 &&
        (c.nombre.toLowerCase().includes(term) ||
          c.tipoCliente.toLowerCase().includes(term) ||
          String(c.idcliente).includes(term))
    );
  }, [clientesConDocId, searchTerm]);

  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(start, start + itemsPerPage);
  }, [filteredCustomers, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOrder, itemsPerPage]);

  /** Crea un cliente nuevo con correlativo atómico o actualiza uno existente. */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !sucursalId || !formData.nombre) return;
    setLoading(true);

    try {
      if (editingCustomer) {
        await setDoc(
          doc(firestore, `sucursales/${sucursalId}/clientes`, editingCustomer.docId),
          {
            ...formData,
            pinConsumoInterno: formData.consumoInterno ? formData.pinConsumoInterno : '',
          },
          { merge: true }
        );
      } else {
        await runTransaction(firestore, async (transaction) => {
          const corrRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'clientes');
          const corrSnap = await transaction.get(corrRef);
          const nuevoId = (corrSnap.data()?.correlativo || 0) + 1;
          transaction.set(
            doc(firestore, `sucursales/${sucursalId}/clientes`, nuevoId.toString()),
            {
              ...formData,
              idcliente: nuevoId,
              pinConsumoInterno: formData.consumoInterno ? formData.pinConsumoInterno : '',
            }
          );
          transaction.set(corrRef, { correlativo: nuevoId }, { merge: true });
        });
      }
      toast({ title: 'Éxito', description: 'Registro guardado.' });
      setIsModalOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  /** Elimina un cliente o proveedor de la sucursal. */
  const handleDelete = async () => {
    if (!firestore || !customerToDelete || !sucursalId) return;
    setLoading(true);
    try {
      await deleteDoc(
        doc(firestore, `sucursales/${sucursalId}/clientes`, customerToDelete.docId)
      );
      toast({ title: 'Éxito', description: 'Cliente eliminado.' });
      setCustomerToDelete(null);
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
    editingCustomer,
    setEditingCustomer,
    customerToDelete,
    setCustomerToDelete,
    formData,
    setFormData,
    paginatedCustomers,
    totalItems: filteredCustomers.length,
    cargando: isLoadingCustomers || isLoadingSucursal,
    handleSubmit,
    handleDelete,
  };
}

