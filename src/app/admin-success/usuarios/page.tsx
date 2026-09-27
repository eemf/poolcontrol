
'use client'

import { useState, useEffect, useMemo, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Loader2, Save, Trash2, Edit, PlusCircle, Search, UserCheck, ShieldCheck } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useFirebase, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, query, runTransaction, orderBy, writeBatch } from "firebase/firestore"
import { initializeApp, deleteApp } from "firebase/app"
import { getAuth, createUserWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth"
import { firebaseConfig } from "@/firebase/config"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"

type Usuario = {
  authUid: string;
  nombre: string;
  email: string;
  rol: string;
  sucursalId: string;
  roles?: string[];
  accesoGlobal?: boolean;
};

type Rol = {
  idRol: number;
  nombre: string;
  descripcion?: string;
};

type Sucursal = {
    id: string;
    idSucursal: number;
    nombre: string;
};

type UsuarioConDocId = Usuario & { docId: string };

export default function PaginaUsuarios() {
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UsuarioConDocId | null>(null);
  const [editingUser, setEditingUser] = useState<UsuarioConDocId | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const { auth, firestore } = useFirebase();
  const { user: currentUser, isUserLoading } = useUser();
  
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('');
  const [accesoGlobal, setAccesoGlobal] = useState(false);
  const [selectedSucursalId, setSelectedSucursalId] = useState('');

  const sucursalesQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'sucursales'), orderBy("nombre", "asc"));
  }, [firestore]);

  const usuariosQuery = useMemoFirebase(() => {
    if (!firestore || !currentUser || !selectedSucursalId) return null;
    return query(collection(firestore, `sucursales/${selectedSucursalId}/usuarios`), orderBy("nombre", "asc"));
  }, [firestore, currentUser, selectedSucursalId]);

  const rolesQuery = useMemoFirebase(() => {
    if (!firestore || !selectedSucursalId) return null;
    return query(collection(firestore, `sucursales/${selectedSucursalId}/roles`), orderBy("nombre", "asc"));
  }, [firestore, selectedSucursalId]);

  const { data: usuarios, isLoading: isLoadingUsuarios } = useCollection<Usuario>(usuariosQuery);
  const { data: sucursales, isLoading: isLoadingSucursales } = useCollection<Sucursal>(sucursalesQuery);
  const { data: roles, isLoading: isLoadingRoles } = useCollection<Rol>(rolesQuery);

  const resetForm = () => {
    setNombre('');
    setEmail('');
    setPassword('');
    setRol('');
    setAccesoGlobal(false);
    setEditingUser(null);
  };
  
  useEffect(() => {
    if (editingUser) {
        setNombre(editingUser.nombre);
        setEmail(editingUser.email);
        setAccesoGlobal(editingUser.accesoGlobal || false);
        const initialRolId = editingUser.roles && editingUser.roles.length > 0 
          ? editingUser.roles[0] 
          : (roles?.find(r => r.nombre === editingUser.rol) as any)?.id || '';
        setRol(initialRolId);
        setPassword('');
    } else {
        resetForm();
    }
  }, [editingUser, roles]);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const handleOpenModal = (user: UsuarioConDocId | null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingUser(null);
    setIsModalOpen(false);
    resetForm();
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!firestore || !currentUser || !nombre || !email || !rol || !selectedSucursalId || (!editingUser && !password)) {
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
        const secondaryApp = initializeApp(firebaseConfig, 'SecondaryAdminCreation');
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
        const userInSucursalRef = doc(firestore, 'sucursales', selectedSucursalId, 'usuarios', editingUser.authUid);
        const userAuthLookupRef = doc(firestore, 'user_auth_lookup', editingUser.authUid);
        
        const dataToUpdate = { 
          nombre, 
          rol: roleName,
          roles: [rol],
          accesoGlobal
        };
        batch.update(userInSucursalRef, dataToUpdate);
        batch.update(userAuthLookupRef, { nombre, rol: roleName, sucursalId: selectedSucursalId, accesoGlobal });
      } else {
        const userInSucursalRef = doc(firestore, 'sucursales', selectedSucursalId, 'usuarios', finalAuthUid);
        const userAuthLookupRef = doc(firestore, 'user_auth_lookup', finalAuthUid);
        
        const finalData = {
            authUid: finalAuthUid,
            nombre,
            email,
            rol: roleName,
            sucursalId: selectedSucursalId,
            roles: [rol],
            accesoGlobal
        };
        const lookupData = { nombre, email, rol: roleName, sucursalId: selectedSucursalId, accesoGlobal };
        
        batch.set(userInSucursalRef, finalData);
        batch.set(userAuthLookupRef, lookupData);
      }
      
      await batch.commit();
      toast({ title: "Éxito", description: `Usuario ${editingUser ? 'actualizado' : 'creado'} correctamente.` });
      handleCloseModal();
    } catch (error: any) {
        console.error("Error guardando usuario:", error);
        if (error.code === 'auth/email-already-in-use') {
            toast({ 
              variant: "destructive",
              title: "Error", 
              description: "Este correo ya está en uso globalmente.",
            });
        } else {
            toast({ title: "Error", description: error.message || "No se pudo guardar el usuario.", variant: "destructive" });
        }
    } finally {
        setLoading(false);
    }
  }

  const handleDeleteUser = async () => {
    if (!firestore || !userToDelete) return;
    
    const batch = writeBatch(firestore);
    const userInSucursalRef = doc(firestore, 'sucursales', userToDelete.sucursalId, 'usuarios', userToDelete.authUid);
    const userAuthLookupRef = doc(firestore, 'user_auth_lookup', userToDelete.authUid);

    batch.delete(userInSucursalRef);
    batch.delete(userAuthLookupRef);

    try {
        await batch.commit();
        toast({ title: "Éxito", description: "Usuario eliminado del sistema." });
    } catch(error: any) {
        console.error("Error eliminando usuario:", error);
        toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
        setUserToDelete(null);
    }
  }
  
  const usuariosConDocId = useMemo((): UsuarioConDocId[] => {
    return (usuarios || []).map((u) => ({
      ...u,
      docId: u.authUid,
    }));
  }, [usuarios]);

  const filteredUsuarios = useMemo(() => {
    if (!searchTerm) return usuariosConDocId;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return usuariosConDocId.filter(u => 
        (u.nombre || '').toLowerCase().includes(lowerCaseSearch) ||
        (u.email || '').toLowerCase().includes(lowerCaseSearch) ||
        (u.rol || '').toLowerCase().includes(lowerCaseSearch)
    ) || [];
  }, [usuariosConDocId, searchTerm]);

  const getRolBadge = (rol: string) => {
    const r = rol.toLowerCase();
    if (r === 'admin') return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200';
    if (r === 'cajero') return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200';
    return 'bg-secondary text-secondary-foreground';
  }

  if (!isMounted) {
    return null;
  }
  
  const isLoading = isUserLoading || isLoadingSucursales;

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
                <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2 text-foreground">
                    <UserCheck className="h-6 w-6 text-primary" />
                    Gestión de Usuarios (Maestro)
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block font-body">Administra el personal con acceso al sistema de todas las sucursales.</p>
            </div>
            { selectedSucursalId && (
              <Button onClick={() => handleOpenModal(null)} className="rounded-full w-full sm:w-auto font-medium">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Añadir Usuario
              </Button>
            )}
        </div>
        
        <Card className="shadow-sm border-muted/60">
            <CardHeader className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-grow">
                        <Label htmlFor="sucursal-selector" className="text-xs font-semibold ml-1">Seleccionar Sucursal</Label>
                        <Select value={selectedSucursalId} onValueChange={setSelectedSucursalId} disabled={isLoadingSucursales}>
                            <SelectTrigger id="sucursal-selector" className="rounded-full">
                                <SelectValue placeholder={isLoadingSucursales ? "Cargando..." : "Elige una sucursal"} />
                            </SelectTrigger>
                            <SelectContent className="font-body">
                                {(sucursales || []).map(s => <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-grow">
                        <Label htmlFor="search-input" className="text-xs font-semibold ml-1">Buscar en sucursal</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                id="search-input"
                                placeholder="Buscar por nombre, email o rol..."
                                className="pl-9 rounded-full h-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                disabled={!selectedSucursalId}
                            />
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
            {isLoadingUsuarios ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : !selectedSucursalId ? (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-lg bg-muted/5">
                    <UserCheck className="h-12 w-12 mb-4 text-primary/30" />
                    <p className="font-semibold text-lg">Selecciona una sucursal</p>
                    <p className="text-xs">Elige una sucursal para ver y administrar sus usuarios.</p>
                </div>
            ) : filteredUsuarios.length > 0 ? (
                 <div className="space-y-2 pt-2">
                    {filteredUsuarios.map((usuario) => (
                        <div key={usuario.docId} className="flex flex-col sm:flex-row items-start sm:items-center p-4 border rounded-xl bg-background hover:bg-muted/50 transition-colors shadow-sm">
                           <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                                <div className="sm:col-span-2">
                                    <p className="font-bold text-foreground truncate flex items-center gap-2">
                                      {usuario.nombre}
                                      {usuario.accesoGlobal && <ShieldCheck className="h-3.5 w-3.5 text-primary" title="Acceso Global" />}
                                    </p>
                                    <p className="text-muted-foreground text-xs font-body">{usuario.email}</p>
                                </div>
                                <div className="flex sm:justify-center">
                                    <Badge variant={'outline'} className={cn('font-body rounded-full px-3 text-[10px] uppercase tracking-wider', getRolBadge(usuario.rol))}>{usuario.rol}</Badge>
                                </div>
                            </div>
                           <div className="flex items-center gap-2 shrink-0 pt-4 sm:pt-0 sm:ml-auto">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleOpenModal(usuario)}>
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Editar</span>
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive rounded-full" onClick={() => { setUserToDelete(usuario) }}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Eliminar</span>
                                </Button>
                           </div>
                        </div>
                    ))}
                 </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-lg bg-muted/5">
                    <UserCheck className="h-12 w-12 mb-4 text-primary/30" />
                    <p className="font-semibold text-lg">
                        {searchTerm ? "No se encontraron resultados" : "No hay usuarios registrados en esta sucursal"}
                    </p>
                    <p className="text-xs">
                        {searchTerm ? "Intenta con otra búsqueda." : "Haz clic en 'Añadir Usuario' para empezar."}
                    </p>
                </div>
            )}
            </CardContent>
        </Card>

        <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
            <DialogContent className="sm:max-w-md rounded-2xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="font-headline">{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
                        <DialogDescription className="font-body text-xs">
                            {editingUser ? "Actualiza la información del usuario." : "Crea una nueva cuenta de acceso al sistema."}
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-auto my-4">
                        <div className="space-y-4 px-6 py-4 font-body">
                            <div className="space-y-2">
                                <Label htmlFor="nombre" className="text-xs font-semibold ml-1">Nombre Completo*</Label>
                                <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="rounded-full" placeholder="Ej: Samuel L." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-semibold ml-1">Correo Electrónico*</Label>
                                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={!!editingUser} className="rounded-full" placeholder="email@sucursal.com" />
                            </div>
                            {!editingUser && (
                                <div className="space-y-2">
                                    <Label htmlFor="password" title="Mínimo 6 caracteres" className="text-xs font-semibold ml-1">Contraseña*</Label>
                                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="rounded-full" placeholder="••••••" />
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="rol" className="text-xs font-semibold ml-1">Rol Asignado*</Label>
                                <Select value={rol} onValueChange={(value) => setRol(value)} disabled={isLoadingRoles || !selectedSucursalId}>
                                    <SelectTrigger className="rounded-full">
                                        <SelectValue placeholder={!selectedSucursalId ? "Selecciona una sucursal primero" : (isLoadingRoles ? "Cargando..." : "Selecciona un rol")} />
                                    </SelectTrigger>
                                    <SelectContent className="font-body">
                                        {roles && roles.length > 0 ? (
                                            roles.map(r => (
                                                <SelectItem key={r.idRol} value={(r as any).id}>{r.nombre}</SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="no-roles" disabled>No hay roles definidos</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-4 mt-4 border-t border-dashed">
                                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/20">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="acceso-global" className="font-bold flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4 text-primary" /> Acceso Global
                                        </Label>
                                        <p className="text-[10px] text-muted-foreground font-medium">Permitir saltar entre sucursales</p>
                                    </div>
                                    <Switch
                                        id="acceso-global"
                                        checked={accesoGlobal}
                                        onCheckedChange={setAccesoGlobal}
                                    />
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-3 sm:gap-2 px-6 pb-6">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="w-full sm:w-auto rounded-full">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading} className="w-full sm:w-auto rounded-full font-bold">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {editingUser ? "Actualizar" : "Guardar Usuario"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
        
        <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
            <AlertDialogContent className="rounded-2xl font-body">
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-headline">¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm">
                        Esta acción eliminará al usuario <span className="font-bold text-foreground">"{userToDelete?.nombre}"</span> de la base de datos de la sucursal seleccionada.
                        Su cuenta de autenticación global NO será eliminada.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90 rounded-full font-bold">Sí, eliminar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  )
}
