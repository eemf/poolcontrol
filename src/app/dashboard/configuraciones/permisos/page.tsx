'use client'

import { useState, useCallback, useMemo } from "react"
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, doc, setDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"
import { ShieldCheck, Users, Trash2 } from "lucide-react"
import { useSucursal } from "@/hooks/use-sucursal"
import { useToast } from "@/hooks/use-toast"
import type { Rol, UsuarioSucursal } from "@/lib/tipos"
import { SurfaceCard, PillTabs, ModalConfirmacion, BotonVolverArriba } from "@/components/comunes"

// Componentes refactorizados
import { EncabezadoPermisos } from "./_components/EncabezadoPermisos"
import { ListadoRoles } from "./_components/ListadoRoles"
import { SeccionPersonal } from "./_components/SeccionPersonal"
import { ModalRol } from "./_components/ModalRol"

export default function PaginaGestionPermisos() {
  const { firestore } = useFirebase();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("roles");
  const [isRolModalOpen, setIsRolModalOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [rolToDelete, setRolToDelete] = useState<Rol | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados Form Rol
  const [rolNombre, setRolNombre] = useState("");
  const [rolDesc, setRolDesc] = useState("");
  const [rolPermisos, setRolPermisos] = useState<Set<string>>(new Set());

  // Consultas
  const rolesQuery = useMemoFirebase(() =>
    sucursalId ? query(collection(firestore, `sucursales/${sucursalId}/roles`), orderBy("nombre")) : null
  , [firestore, sucursalId]);

  const usuariosQuery = useMemoFirebase(() =>
    sucursalId ? query(collection(firestore, `sucursales/${sucursalId}/usuarios`), orderBy("nombre")) : null
  , [firestore, sucursalId]);

  const { data: roles, isLoading: isLoadingRoles } = useCollection<Rol>(rolesQuery);
  const { data: usuarios, isLoading: isLoadingUsuarios } = useCollection<UsuarioSucursal>(usuariosQuery);

  const resetForm = useCallback(() => {
    setRolNombre("");
    setRolDesc("");
    setRolPermisos(new Set());
    setEditingRol(null);
  }, []);

  const togglePermiso = useCallback((key: string) => {
    setRolPermisos(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

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
          permisos: Array.from(rolPermisos)
        });
      } else {
        const nuevoRolRef = doc(collection(firestore, `sucursales/${sucursalId}/roles`));
        await setDoc(nuevoRolRef, {
          nombre: rolNombre,
          descripcion: rolDesc,
          permisos: Array.from(rolPermisos)
        });
      }
      toast({ title: "Éxito", description: "Rol guardado correctamente." });
      setIsRolModalOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const abrirEditarRol = useCallback((rol: Rol) => {
    setEditingRol(rol);
    setRolNombre(rol.nombre);
    setRolDesc(rol.descripcion || "");
    setRolPermisos(new Set(rol.permisos || []));
    setIsRolModalOpen(true);
  }, []);

  const confirmarEliminarRol = useCallback(async () => {
    if (!firestore || !sucursalId || !rolToDelete) return;
    setLoading(true);
    try {
      await deleteDoc(doc(firestore, `sucursales/${sucursalId}/roles`, (rolToDelete as any).id));
      toast({ title: "Éxito", description: "El rol ha sido eliminado." });
      setRolToDelete(null);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [firestore, sucursalId, rolToDelete, toast]);

  const toggleRolAUsuario = useCallback(async (usuarioUid: string, rolId: string, currentRoles: string[]) => {
    if (!firestore || !sucursalId) return;
    const userRef = doc(firestore, `sucursales/${sucursalId}/usuarios`, usuarioUid);
    const hasRol = currentRoles?.includes(rolId);

    try {
      await updateDoc(userRef, {
        roles: hasRol ? arrayRemove(rolId) : arrayUnion(rolId)
      });
      toast({ title: "Información Actualizada", description: "Los roles del usuario han sido actualizados." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }, [firestore, sucursalId, toast]);

  const modalForm = useMemo(() => ({
    nombre: rolNombre,
    setNombre: setRolNombre,
    descripcion: rolDesc,
    setDescripcion: setRolDesc,
    permisos: rolPermisos,
    onTogglePermiso: togglePermiso
  }), [rolNombre, rolDesc, rolPermisos, togglePermiso]);

  const handleCloseModal = useCallback(() => {
    setIsRolModalOpen(false);
    resetForm();
  }, [resetForm]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <EncabezadoPermisos
        onNuevoRol={() => {
          resetForm();
          setIsRolModalOpen(true);
        }}
      />

      <SurfaceCard variant="panel" className="p-4 sm:p-5 space-y-4 font-body">
        <PillTabs
          value={activeTab}
          onValueChange={setActiveTab}
          tabs={[
            {
              id: "roles",
              label: "Roles de Usuario",
              icon: ShieldCheck,
              count: roles?.length || 0,
              badgeVariant: activeTab === "roles" ? "white" : "sky",
            },
            {
              id: "usuarios",
              label: "Personal de Sucursal",
              icon: Users,
              count: usuarios?.length || 0,
              badgeVariant: activeTab === "usuarios" ? "white" : "slate",
            },
          ]}
        />

        {activeTab === "roles" ? (
          <ListadoRoles
            roles={roles}
            cargando={isLoadingRoles || isLoadingSucursal}
            onEditar={abrirEditarRol}
            onEliminar={setRolToDelete}
          />
        ) : (
          <SeccionPersonal
            usuarios={usuarios}
            roles={roles}
            onToggleRol={toggleRolAUsuario}
            cargando={isLoadingUsuarios || isLoadingSucursal}
          />
        )}
      </SurfaceCard>

      <ModalRol
        abierto={isRolModalOpen || !!editingRol}
        onClose={handleCloseModal}
        editando={!!editingRol}
        onSubmit={manejarGuardarRol}
        procesando={loading}
        form={modalForm}
      />

      <ModalConfirmacion
        open={!!rolToDelete}
        onOpenChange={(o) => !o && setRolToDelete(null)}
        tipo="destructivo"
        swalTipo="error"
        titulo="¿Eliminar rol?"
        subtitulo={`Esta acción eliminará el rol "${rolToDelete?.nombre || ''}" y sus permisos asociados en esta sucursal.`}
        textoCancelar="Cancelar"
        textoConfirmar="Sí, eliminar"
        iconoConfirmar={Trash2}
        procesando={loading}
        onConfirmar={confirmarEliminarRol}
      />

      <BotonVolverArriba threshold={150} />
    </div>
  )
}
