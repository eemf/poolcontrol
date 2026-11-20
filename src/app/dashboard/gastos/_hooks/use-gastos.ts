'use client';

import { useState, useEffect, useMemo, FormEvent } from 'react';
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
import {
  collection,
  doc,
  runTransaction,
  query,
  orderBy,
  where,
  limit,
  Timestamp,
  deleteDoc,
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useSucursal } from '@/hooks/use-sucursal';
import type { Gasto as GastoType } from '@/lib/tipos';

export type GastoConDocId = GastoType & { docId: string };

const LIMITE_INICIAL_GASTOS = 50;

/**
 * Hook de gestión CRUD para los gastos operativos de la sucursal.
 * Optimiza Firestore cargando solo gastos pendientes por defecto o los últimos 50 históricos.
 */
export function useGastos() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  const { toast } = useToast();

  // Estados de control de UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [limiteGastos, setLimiteGastos] = useState(LIMITE_INICIAL_GASTOS);
  const [searchTerm, setSearchTerm] = useState('');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Estados para editar y eliminar
  const [editingGasto, setEditingGasto] = useState<GastoConDocId | null>(null);
  const [gastoToDelete, setGastoToDelete] = useState<GastoConDocId | null>(null);

  // Estados del formulario
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState<number | ''>('');

  // Consulta condicional: pendientes activos o últimos 50 gastos por fecha descendente
  const gastosQuery = useMemoFirebase(() => {
    if (!firestore || !user || !sucursalId) return null;
    const baseRef = collection(firestore, `sucursales/${sucursalId}/gastos`);
    return mostrarTodos
      ? query(baseRef, orderBy('fecha', 'desc'), limit(limiteGastos))
      : query(baseRef, where('estado', '==', 'pendiente'));
  }, [firestore, user, sucursalId, mostrarTodos, limiteGastos]);

  const { data: todosLosGastos, isLoading: isLoadingGastos } =
    useCollection<GastoType>(gastosQuery);

  // Ordena y filtra por término de búsqueda
  const gastosConDocId = useMemo((): GastoConDocId[] => {
    if (!todosLosGastos) return [];
    const base = [...todosLosGastos]
      .sort((a, b) => {
        const fa = a.fecha instanceof Timestamp ? a.fecha.toMillis() : 0;
        const fb = b.fecha instanceof Timestamp ? b.fecha.toMillis() : 0;
        return fb - fa;
      })
      .map((g) => ({ ...g, docId: g.id }));

    if (!searchTerm) return base;
    const f = searchTerm.toLowerCase();
    return base.filter(
      (g) => g.descripcion.toLowerCase().includes(f) || String(g.idGasto).includes(f)
    );
  }, [todosLosGastos, searchTerm]);

  const totalPendientes = useMemo(() => {
    return (todosLosGastos || []).filter((g) => g.estado === 'pendiente').length;
  }, [todosLosGastos]);

  const totalTodos = todosLosGastos?.length ?? 0;

  // Paginación en memoria
  const totalPages = Math.max(1, Math.ceil(gastosConDocId.length / itemsPerPage));
  const paginatedGastos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return gastosConDocId.slice(startIndex, startIndex + itemsPerPage);
  }, [gastosConDocId, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, mostrarTodos, itemsPerPage]);

  const handleOpenEdit = (gasto: GastoConDocId) => {
    setEditingGasto(gasto);
    setDescripcion(gasto.descripcion);
    setMonto(gasto.monto);
    setIsModalOpen(true);
  };

  const handleNuevoGasto = () => {
    setEditingGasto(null);
    setDescripcion('');
    setMonto('');
    setIsModalOpen(true);
  };

  /** Registra un gasto nuevo con correlativo atómico o actualiza uno existente. */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !sucursalId || !descripcion || !monto || Number(monto) <= 0) {
      toast({
        title: 'Error',
        description: 'Completa los campos obligatorios con montos válidos.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);

    try {
      await runTransaction(firestore, async (transaction) => {
        const dataToSave: Omit<GastoType, 'id' | 'idGasto' | 'fecha' | 'categoria'> = {
          descripcion,
          monto: Number(monto),
          usuarioId: user.uid,
          estado: 'pendiente',
        };

        if (editingGasto) {
          const gastoRef = doc(firestore, `sucursales/${sucursalId}/gastos`, editingGasto.docId);
          transaction.update(gastoRef, dataToSave);
        } else {
          const correlativoRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'gastos');
          const correlativoDoc = await transaction.get(correlativoRef);
          const nuevoIdGasto = (correlativoDoc.data()?.correlativo || 0) + 1;

          const nuevoGastoRef = doc(
            firestore,
            `sucursales/${sucursalId}/gastos`,
            nuevoIdGasto.toString()
          );

          const gastoCompleto: Omit<GastoType, 'id'> = {
            ...dataToSave,
            idGasto: nuevoIdGasto,
            fecha: Timestamp.now(),
          };

          transaction.set(nuevoGastoRef, gastoCompleto);
          transaction.set(correlativoRef, { correlativo: nuevoIdGasto }, { merge: true });
        }
      });

      toast({
        title: 'Éxito',
        description: `Gasto ${editingGasto ? 'actualizado' : 'registrado'} correctamente.`,
      });
      setIsModalOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  /** Elimina permanentemente un gasto pendiente de la sucursal. */
  const handleDelete = async () => {
    if (!firestore || !gastoToDelete || !sucursalId) return;
    setLoading(true);
    try {
      const gastoRef = doc(firestore, `sucursales/${sucursalId}/gastos`, gastoToDelete.docId);
      await deleteDoc(gastoRef);
      toast({ title: 'Éxito', description: 'Gasto eliminado.' });
      setGastoToDelete(null);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return {
    isModalOpen,
    setIsModalOpen,
    loading,
    mostrarTodos,
    setMostrarTodos,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    editingGasto,
    gastoToDelete,
    setGastoToDelete,
    descripcion,
    setDescripcion,
    monto,
    setMonto,
    paginatedGastos,
    totalItems: gastosConDocId.length,
    totalPendientes,
    totalTodos,
    cargando: isLoadingGastos || isLoadingSucursal,
    cargarMas: () => setLimiteGastos((prev) => prev + LIMITE_INICIAL_GASTOS),
    handleOpenEdit,
    handleNuevoGasto,
    handleSubmit,
    handleDelete,
  };
}

