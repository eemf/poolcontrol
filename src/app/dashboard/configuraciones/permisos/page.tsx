'use client'

import { useState, useCallback, useMemo } from "react"
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, doc, setDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShieldCheck, Users } from "lucide-react"
import { useSucursal } from "@/hooks/use-sucursal"
import { useToast } from "@/hooks/use-toast"
import type { Rol, UsuarioSucursal } from "@/lib/tipos"
import { Card } from "@/components/ui/card"

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

  const eliminarRol = useCallback(async (rolId: string) => {
    if (!confirm("¿Deseas eliminar este rol?")) return;
    try {
      await deleteDoc(doc(firestore, `sucursales/${sucursalId}/roles`, rolId));
      toast({ title: "Éxito", description: "El rol ha sido eliminado." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }, [firestore, sucursalId, toast]);

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
    <div className="space-y-6">
      <EncabezadoPermisos 
        onNuevoRol={() => { 
          resetForm();
          setIsRolModalOpen(true); 
        }} 
      />

      <Card className="border rounded-lg bg-card shadow-sm overflow-hidden p-4 sm:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-full h-12 p-1 bg-muted/20 border-none mb-6 sm:mb-8">
            <TabsTrigger value="roles" className="rounded-full gap-2 font-bold text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-white">
              <ShieldCheck className="h-4 w-4 shrink-0" /> 
              <span className="hidden xs:inline">Roles de Usuario</span>
              <span className="xs:hidden">Roles</span>
            </TabsTrigger>
            <TabsTrigger value="usuarios" className="rounded-full gap-2 font-bold text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-white">
              <Users className="h-4 w-4 shrink-0" /> 
              <span className="hidden xs:inline">Personal de Sucursal</span>
              <span className="xs:hidden">Personal</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-0">
            <TabsContent value="roles" className="mt-0 outline-none">
              <ListadoRoles 
                roles={roles} 
                cargando={isLoadingRoles || isLoadingSucursal} 
                onEditar={abrirEditarRol}
                onEliminar={eliminarRol}
              />
            </TabsContent>

            <TabsContent value="usuarios" className="mt-0 outline-none">
              <SeccionPersonal 
                usuarios={usuarios} 
                roles={roles} 
                onToggleRol={toggleRolAUsuario}
                cargando={isLoadingUsuarios || isLoadingSucursal}
              />
            </TabsContent>
          </div>
        </Tabs>
      </Card>

      <ModalRol 
        abierto={isRolModalOpen || !!editingRol} 
        onClose={handleCloseModal} 
        editando={!!editingRol} 
        onSubmit={manejarGuardarRol} 
        procesando={loading}
        form={modalForm}
      />
    </div>
  )
}
