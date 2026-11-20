'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
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
import type { Rol } from '@/lib/tipos';

export type RolConDocId = Rol & { docId: string };

/**
 * Hook de gestión CRUD para el catálogo de roles de la sucursal.
 */
export function useRoles() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  const { toast } = useToast();

  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('id-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [editingRol, setEditingRol] = useState<RolConDocId | null>(null);
  const [rolToDelete, setRolToDelete] = useState<RolConDocId | null>(null);

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const rolesQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/roles`), orderBy('idRol', 'asc'));
  }, [firestore, sucursalId]);

  const { data: rawRoles, isLoading: isLoadingRoles } = useCollection<Rol>(rolesQuery);

  const resetForm = useCallback(() => {
    setNombre('');
    setDescripcion('');
    setEditingRol(null);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (editingRol) {
      setNombre(editingRol.nombre);
      setDescripcion(editingRol.descripcion || '');
    } else {
      resetForm();
    }
  }, [editingRol, resetForm]);

  const rolesConDocId = useMemo((): RolConDocId[] => {
    return (rawRoles || []).map((r) => ({ ...r, docId: r.id } as RolConDocId));
  }, [rawRoles]);

  // Filtra por nombre o descripción y aplica el ordenamiento seleccionado
  const filteredRoles = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const filtered = rolesConDocId.filter(
      (r) =>
        (r.nombre || '').toLowerCase().includes(term) ||
        (r.descripcion || '').toLowerCase().includes(term)
    );
    return filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'name-asc':
          return (a.nombre || '').localeCompare(b.nombre || '');
        case 'name-desc':
          return (b.nombre || '').localeCompare(a.nombre || '');
        case 'id-desc':
          return (b.idRol || 0) - (a.idRol || 0);
        case 'id-asc':
        default:
          return (a.idRol || 0) - (b.idRol || 0);
      }
    });
  }, [rolesConDocId, searchTerm, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOrder]);

  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRoles.slice(start, start + itemsPerPage);
  }, [filteredRoles, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / itemsPerPage));

  /** Crea un rol nuevo con correlativo atómico o actualiza uno existente. */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !sucursalId || !nombre) return;
    setLoading(true);

    try {
      if (editingRol) {
        await setDoc(
          doc(firestore, `sucursales/${sucursalId}/roles`, editingRol.docId),
          { nombre, descripcion },
          { merge: true }
        );
      } else {
        await runTransaction(firestore, async (transaction) => {
          const corrRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'roles');
          const corrSnap = await transaction.get(corrRef);
          const nuevoId = (corrSnap.data()?.correlativo || 0) + 1;
          transaction.set(
            doc(firestore, `sucursales/${sucursalId}/roles`, nuevoId.toString()),
            { idRol: nuevoId, nombre, descripcion, permisos: [] }
          );
          transaction.set(corrRef, { correlativo: nuevoId }, { merge: true });
        });
      }
      toast({ title: 'Éxito', description: 'Rol guardado correctamente.' });
      setIsModalOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  /** Elimina el rol seleccionado de la sucursal. */
  const handleDelete = async () => {
    if (!firestore || !rolToDelete || !sucursalId) return;
    setLoading(true);
    try {
      await deleteDoc(doc(firestore, `sucursales/${sucursalId}/roles`, rolToDelete.docId));
      toast({ title: 'Éxito', description: 'Rol eliminado.' });
      setRolToDelete(null);
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
    editingRol,
    setEditingRol,
    rolToDelete,
    setRolToDelete,
    paginatedRoles,
    totalItems: filteredRoles.length,
    cargando: isLoadingRoles || isLoadingSucursal,
    form: {
      nombre,
      setNombre,
      descripcion,
      setDescripcion,
    },
    handleSubmit,
    handleDelete,
  };
}

