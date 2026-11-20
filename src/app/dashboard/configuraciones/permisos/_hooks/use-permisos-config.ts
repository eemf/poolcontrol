'use client';

import { useState, useCallback, useMemo } from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import {
  collection,
  query,
  orderBy,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { useSucursal } from '@/hooks/use-sucursal';
import { useToast } from '@/hooks/use-toast';
import type { Rol, UsuarioSucursal } from '@/lib/tipos';

/**
 * Hook de estado y operaciones Firestore para la gestión de roles y permisos de sucursal.
 * Centraliza el CRUD de roles y la asignación de roles a cada usuario.
 */
export function usePermisosConfig() {
  const { firestore } = useFirebase();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('roles');
  const [isRolModalOpen, setIsRolModalOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [rolToDelete, setRolToDelete] = useState<Rol | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados del formulario de rol
  const [rolNombre, setRolNombre] = useState('');
  const [rolDesc, setRolDesc] = useState('');
  const [rolPermisos, setRolPermisos] = useState<Set<string>>(new Set());

  // Consultas aisladas por sucursal
  const rolesQuery = useMemoFirebase(
    () =>
      firestore && sucursalId
        ? query(collection(firestore, `sucursales/${sucursalId}/roles`), orderBy('nombre'))
        : null,
    [firestore, sucursalId]
  );

  const usuariosQuery = useMemoFirebase(
    () =>
      firestore && sucursalId
        ? query(collection(firestore, `sucursales/${sucursalId}/usuarios`), orderBy('nombre'))
        : null,
    [firestore, sucursalId]
  );

  const { data: roles, isLoading: isLoadingRoles } = useCollection<Rol>(rolesQuery);
  const { data: usuarios, isLoading: isLoadingUsuarios } =
    useCollection<UsuarioSucursal>(usuariosQuery);

  const resetForm = useCallback(() => {
    setRolNombre('');
    setRolDesc('');
    setRolPermisos(new Set());
    setEditingRol(null);
  }, []);

  const togglePermiso = useCallback((key: string) => {
    setRolPermisos((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  /** Crea o actualiza un rol con su conjunto de permisos dentro de la sucursal activa. */
  const manejarGuardarRol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !sucursalId || !rolNombre) return;
    setLoading(true);

    try {
      if (editingRol) {
        const rolRef = doc(firestore, `sucursales/${sucursalId}/roles`, (editingRol as any).id);
        await updateDoc(rolRef, {
          nombre: rolNombre,
          descripcion: rolDesc,
          permisos: Array.from(rolPermisos),
        });
      } else {
        const nuevoRolRef = doc(collection(firestore, `sucursales/${sucursalId}/roles`));
        await setDoc(nuevoRolRef, {
          nombre: rolNombre,
          descripcion: rolDesc,
          permisos: Array.from(rolPermisos),
        });
      }
      toast({ title: 'Éxito', description: 'Rol guardado correctamente.' });
      setIsRolModalOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const abrirNuevoRol = useCallback(() => {
    resetForm();
    setIsRolModalOpen(true);
  }, [resetForm]);

  const abrirEditarRol = useCallback((rol: Rol) => {
    setEditingRol(rol);
    setRolNombre(rol.nombre);
    setRolDesc(rol.descripcion || '');
    setRolPermisos(new Set(rol.permisos || []));
    setIsRolModalOpen(true);
  }, []);

  const confirmarEliminarRol = useCallback(async () => {
    if (!firestore || !sucursalId || !rolToDelete) return;
    setLoading(true);
    try {
      await deleteDoc(doc(firestore, `sucursales/${sucursalId}/roles`, (rolToDelete as any).id));
      toast({ title: 'Éxito', description: 'El rol ha sido eliminado.' });
      setRolToDelete(null);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [firestore, sucursalId, rolToDelete, toast]);

  /** Asigna o remueve atómicamente un rol en el documento del usuario. */
  const toggleRolAUsuario = useCallback(
    async (usuarioUid: string, rolId: string, currentRoles: string[]) => {
      if (!firestore || !sucursalId) return;
      const userRef = doc(firestore, `sucursales/${sucursalId}/usuarios`, usuarioUid);
      const hasRol = currentRoles?.includes(rolId);

      try {
        await updateDoc(userRef, {
          roles: hasRol ? arrayRemove(rolId) : arrayUnion(rolId),
        });
        toast({
          title: 'Información Actualizada',
          description: 'Los roles del usuario han sido actualizados.',
        });
      } catch (e: any) {
        toast({ title: 'Error', description: e.message, variant: 'destructive' });
      }
    },
    [firestore, sucursalId, toast]
  );

  const modalForm = useMemo(
    () => ({
      nombre: rolNombre,
      setNombre: setRolNombre,
      descripcion: rolDesc,
      setDescripcion: setRolDesc,
      permisos: rolPermisos,
      onTogglePermiso: togglePermiso,
    }),
    [rolNombre, rolDesc, rolPermisos, togglePermiso]
  );

  const handleCloseModal = useCallback(() => {
    setIsRolModalOpen(false);
    resetForm();
  }, [resetForm]);

  return {
    activeTab,
    setActiveTab,
    roles,
    usuarios,
    cargandoRoles: isLoadingRoles || isLoadingSucursal,
    cargandoUsuarios: isLoadingUsuarios || isLoadingSucursal,
    isRolModalOpen,
    editingRol,
    rolToDelete,
    setRolToDelete,
    loading,
    modalForm,
    abrirNuevoRol,
    abrirEditarRol,
    manejarGuardarRol,
    confirmarEliminarRol,
    toggleRolAUsuario,
    handleCloseModal,
  };
}

