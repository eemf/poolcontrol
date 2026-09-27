'use client'

import { useState, useEffect, useMemo, useCallback } from "react"
import { useFirebase, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, query, runTransaction, orderBy } from "firebase/firestore"
import { useSucursal } from "@/hooks/use-sucursal"
import { useToast } from "@/hooks/use-toast"
import type { Rol } from "@/lib/tipos"

// Componentes Refactorizados
import { EncabezadoRoles } from "./_components/EncabezadoRoles"
import { ListaRoles } from "./_components/ListaRoles"
import { ModalRol } from "./_components/ModalRol"
import { DialogoEliminarRol } from "./_components/DialogoEliminarRol"

type RolConDocId = Rol & { docId: string };

export default function PaginaRoles() {
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
  const [editingRol, setEditingRol] = useState<RolConDocId | null>(null);
  const [rolToDelete, setRolToDelete] = useState<RolConDocId | null>(null);

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // Consultas
  const rolesQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/roles`), orderBy("idRol", "asc"));
  }, [firestore, sucursalId]);

  const { data: rawRoles, isLoading: isLoadingRoles, error } = useCollection<Rol>(rolesQuery);

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

  const filteredRoles = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return rolesConDocId.filter(r => 
      (r.nombre || '').toLowerCase().includes(term) ||
      (r.descripcion || '').toLowerCase().includes(term)
    );
  }, [rolesConDocId, searchTerm]);

  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRoles.slice(start, start + itemsPerPage);
  }, [filteredRoles, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !sucursalId || !nombre) return;
    setLoading(true);

    try {
      if (editingRol) {
        await setDoc(doc(firestore, `sucursales/${sucursalId}/roles`, editingRol.docId), {
          nombre, descripcion
        }, { merge: true });
      } else {
        await runTransaction(firestore, async (transaction) => {
          const corrRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, "roles");
          const corrSnap = await transaction.get(corrRef);
          const nuevoId = (corrSnap.data()?.correlativo || 0) + 1;
          transaction.set(doc(firestore, `sucursales/${sucursalId}/roles`, nuevoId.toString()), {
            idRol: nuevoId, nombre, descripcion, permisos: []
          });
          transaction.set(corrRef, { correlativo: nuevoId }, { merge: true });
        });
      }
      toast({ title: "Éxito", description: `Rol guardado correctamente.` });
      setIsModalOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!firestore || !rolToDelete || !sucursalId) return;
    setLoading(true);
    try {
      await deleteDoc(doc(firestore, `sucursales/${sucursalId}/roles`, rolToDelete.docId));
      toast({ title: "Éxito", description: "Rol eliminado." });
      setRolToDelete(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-6">
      <EncabezadoRoles onNuevoRol={() => { setEditingRol(null); setIsModalOpen(true); }} />
      
      <ListaRoles 
        roles={paginatedRoles}
        cargando={isLoadingRoles || isLoadingSucursal}
        terminoBusqueda={searchTerm}
        onSearchChange={setSearchTerm}
        onEditar={setEditingRol}
        onEliminar={setRolToDelete}
        paginacion={{
          paginaActual: currentPage,
          itemsPorPagina: itemsPerPage,
          totalPaginas: totalPages,
          onPaginaChange: setCurrentPage,
          onItemsPorPaginaChange: setItemsPerPage
        }}
      />

      <ModalRol 
        abierto={isModalOpen || !!editingRol}
        onClose={() => { setIsModalOpen(false); setEditingRol(null); }}
        editando={!!editingRol}
        onSubmit={handleSubmit}
        procesando={loading}
        form={{
          nombre, setNombre,
          descripcion, setDescripcion
        }}
      />

      <DialogoEliminarRol 
        rol={rolToDelete}
        abierto={!!rolToDelete}
        onOpenChange={(o) => !o && setRolToDelete(null)}
        onConfirmar={handleDelete}
        procesando={loading}
      />
    </div>
  );
}
