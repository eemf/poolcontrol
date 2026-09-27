
'use client'

import { useState, useEffect, useMemo, useCallback } from "react"
import { useFirebase, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, query, writeBatch, orderBy } from "firebase/firestore"
import { initializeApp, deleteApp } from "firebase/app"
import { getAuth, createUserWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth"
import { firebaseConfig } from "@/firebase/config"
import { useToast } from "@/hooks/use-toast"
import { useSucursal } from "@/hooks/use-sucursal"
import type { UsuarioSucursal, Rol } from "@/lib/tipos"

// Componentes Refactorizados
import { EncabezadoUsuarios } from "./_components/EncabezadoUsuarios"
import { ListaUsuarios } from "./_components/ListaUsuarios"
import { ModalUsuario } from "./_components/ModalUsuario"
import { DialogoEliminarUsuario } from "./_components/DialogoEliminarUsuario"

type UsuarioConDocId = UsuarioSucursal & { docId: string };

export default function PaginaUsuariosSucursal() {
  const { auth, firestore } = useFirebase();
  const { user: currentUser, isUserLoading } = useUser();
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
  const [editingUser, setEditingUser] = useState<UsuarioConDocId | null>(null);
  const [userToDelete, setUserToDelete] = useState<UsuarioConDocId | null>(null);

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('');

  // Consultas
  const usuariosQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/usuarios`), orderBy("nombre", "asc"));
  }, [firestore, sucursalId]);

  const rolesQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/roles`), orderBy("nombre", "asc"));
  }, [firestore, sucursalId]);

  const { data: rawUsuarios, isLoading: isLoadingUsuarios, error: errorUsuarios } = useCollection<UsuarioSucursal>(usuariosQuery);
  const { data: roles, isLoading: isLoadingRoles } = useCollection<Rol>(rolesQuery);

  const resetForm = useCallback(() => {
    setNombre('');
    setEmail('');
    setPassword('');
    setRol('');
    setEditingUser(null);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (editingUser) {
      setNombre(editingUser.nombre);
      setEmail(editingUser.email);
      const initialRolId = editingUser.roles && editingUser.roles.length > 0 
        ? editingUser.roles[0] 
        : (roles?.find(r => r.nombre === editingUser.rol) as any)?.id || '';
      
      setRol(initialRolId);
      setPassword('');
    } else {
      resetForm();
    }
  }, [editingUser, resetForm, roles]);

  const usuariosConDocId = useMemo((): UsuarioConDocId[] => {
    return (rawUsuarios || []).map((u) => ({ ...u, docId: u.authUid } as UsuarioConDocId));
  }, [rawUsuarios]);

  const filteredUsuarios = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return usuariosConDocId.filter(u => 
      (u.nombre || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      (u.rol || '').toLowerCase().includes(term)
    );
  }, [usuariosConDocId, searchTerm]);

  const paginatedUsuarios = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsuarios.slice(start, start + itemsPerPage);
  }, [filteredUsuarios, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !sucursalId || !nombre || !email || !rol || (!editingUser && !password)) {
      toast({ title: "Error", description: "Todos los campos son obligatorios.", variant: "destructive" });
      return;
    };
    if (!editingUser && password.length < 6) {
      toast({ title: "Error", description: "La contraseña debe tener al menos 6 caracteres.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      let finalAuthUid = '';

      if (editingUser) {
        finalAuthUid = editingUser.authUid;
      } else {
        const secondaryApp = initializeApp(firebaseConfig, 'SecondaryUserCreation');
        const secondaryAuth = getAuth(secondaryApp);
        
        try {
          const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
          finalAuthUid = userCredential.user.uid;
          await firebaseSignOut(secondaryAuth);
        } finally {
          await deleteApp(secondaryApp);
        }
      }

      const batch = writeBatch(firestore);
      const selectedRole = roles?.find(r => (r as any).id === rol);
      const roleName = selectedRole?.nombre || 'Sin Rol';

      if (editingUser) {
        const userInSucursalRef = doc(firestore, 'sucursales', sucursalId, 'usuarios', editingUser.authUid);
        const userAuthLookupRef = doc(firestore, 'user_auth_lookup', editingUser.authUid);
        
        const dataToUpdate = { 
            nombre, 
            rol: roleName,
            roles: [rol] 
        };
        batch.update(userInSucursalRef, dataToUpdate);
        batch.update(userAuthLookupRef, { nombre, rol: roleName, sucursalId });
      } else {
        const userInSucursalRef = doc(firestore, 'sucursales', sucursalId, 'usuarios', finalAuthUid);
        const userAuthLookupRef = doc(firestore, 'user_auth_lookup', finalAuthUid);
        
        const finalData = {
          authUid: finalAuthUid,
          nombre,
          email,
          rol: roleName,
          sucursalId: sucursalId,
          roles: [rol] 
        };
        const lookupData = { nombre, email, rol: roleName, sucursalId: sucursalId };

        batch.set(userInSucursalRef, finalData);
        batch.set(userAuthLookupRef, lookupData);
      }
      
      await batch.commit();
      toast({ title: "Éxito", description: `Usuario ${editingUser ? 'actualizado' : 'creado'} correctamente.` });
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Error guardando usuario:", error);
      if (error.code === 'auth/email-already-in-use') {
        toast({ 
          variant: "destructive",
          title: "Correo ya registrado", 
          description: "Este email ya existe en la base de datos global. Contacta al Administrador Maestro.", 
        });
      } else {
        toast({ title: "Error", description: error.message || "No se pudo guardar el usuario.", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!firestore || !userToDelete || !sucursalId) return;
    setLoading(true);
    try {
      const batch = writeBatch(firestore);
      const userInSucursalRef = doc(firestore, 'sucursales', sucursalId, 'usuarios', userToDelete.authUid);
      const userAuthLookupRef = doc(firestore, 'user_auth_lookup', userToDelete.authUid);

      batch.delete(userInSucursalRef);
      batch.delete(userAuthLookupRef);

      await batch.commit();
      toast({ title: "Éxito", description: "Usuario eliminado de la sucursal." });
      setUserToDelete(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-6">
      <EncabezadoUsuarios 
        onNuevoUsuario={() => { resetForm(); setIsModalOpen(true); }} 
        deshabilitado={!!(errorUsuarios && errorUsuarios.message.includes("Missing or insufficient permissions"))}
      />
      
      <ListaUsuarios 
        usuarios={paginatedUsuarios}
        cargando={isLoadingUsuarios || isUserLoading || isLoadingSucursal}
        terminoBusqueda={searchTerm}
        onSearchChange={setSearchTerm}
        onEditar={setEditingUser}
        onEliminar={setUserToDelete}
        errorPermisos={!!(errorUsuarios && errorUsuarios.message.includes("Missing or insufficient permissions"))}
        paginacion={{
          paginaActual: currentPage,
          itemsPorPagina: itemsPerPage,
          totalPaginas: totalPages,
          onPaginaChange: setCurrentPage,
          onItemsPorPaginaChange: setItemsPerPage
        }}
      />

      <ModalUsuario 
        abierto={isModalOpen || !!editingUser}
        onClose={() => { setIsModalOpen(false); setEditingUser(null); }}
        editando={!!editingUser}
        onSubmit={handleSubmit}
        procesando={loading}
        roles={roles || []}
        form={{
          nombre, setNombre,
          email, setEmail,
          rol, setRol,
          password, setPassword
        }}
      />

      <DialogoEliminarUsuario 
        usuario={userToDelete}
        abierto={!!userToDelete}
        onOpenChange={(o) => !o && setUserToDelete(null)}
        onConfirmar={handleDelete}
        procesando={loading}
      />
    </div>
  );
}
