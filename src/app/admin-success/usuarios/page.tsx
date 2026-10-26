
'use client'

import { useState, useEffect, useMemo, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Loader2, Save, Trash2, Edit, PlusCircle, Search, UserCheck, ShieldCheck, KeyRound, Building2, ArrowLeftRight, Check } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { DialogoCambiarPassword } from "@/components/usuarios/DialogoCambiarPassword"
import { cambiarPasswordUsuario } from "@/lib/firebase/servicios/usuarios-auth"

type Usuario = {
  authUid: string;
  nombre: string;
  email: string;
  rol: string;
  sucursalId: string;
  roles?: string[];
  accesoGlobal?: boolean;
  sucursalesPermitidas?: string[];
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
  const [usuarioParaPassword, setUsuarioParaPassword] = useState<UsuarioConDocId | null>(null);
  const [modalPasswordOpen, setModalPasswordOpen] = useState(false);
  
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
  const [sucursalesPermitidas, setSucursalesPermitidas] = useState<string[]>([]);
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

  const selectedSucursalNombre = useMemo(() => {
    return sucursales?.find(s => s.id === selectedSucursalId)?.nombre || '';
  }, [sucursales, selectedSucursalId]);

  // Autoseleccionar la primera sucursal si aún no se ha seleccionado ninguna
  useEffect(() => {
    if (sucursales && sucursales.length > 0) {
      setSelectedSucursalId(prev => prev || sucursales[0].id);
    }
  }, [sucursales]);

  const resetForm = () => {
    setNombre('');
    setEmail('');
    setPassword('');
    setRol('');
    setAccesoGlobal(false);
    setSucursalesPermitidas([]);
    setEditingUser(null);
  };
  
  useEffect(() => {
    if (editingUser) {
        setNombre(editingUser.nombre || '');
        setEmail(editingUser.email || '');
        setAccesoGlobal(editingUser.accesoGlobal || false);
        if (editingUser.sucursalesPermitidas && editingUser.sucursalesPermitidas.length > 0) {
          setSucursalesPermitidas(editingUser.sucursalesPermitidas);
        } else if (editingUser.accesoGlobal) {
          setSucursalesPermitidas((sucursales || []).map(s => s.id));
        } else {
          setSucursalesPermitidas(selectedSucursalId ? [selectedSucursalId] : []);
        }
        const initialRolId = editingUser.roles && editingUser.roles.length > 0 
          ? editingUser.roles[0] 
          : (roles?.find(r => r.nombre === editingUser.rol) as any)?.id || '';
        setRol(initialRolId);
        setPassword('');
    }
  }, [editingUser]);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const handleOpenModal = (user: UsuarioConDocId | null) => {
    if (user) {
      setEditingUser(user);
    } else {
      resetForm();
      if (selectedSucursalId) {
        setSucursalesPermitidas([selectedSucursalId]);
      }
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

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

      const finalSucursalesPermitidas = accesoGlobal
        ? Array.from(new Set([...(sucursalesPermitidas.length > 0 ? sucursalesPermitidas : (sucursales || []).map(s => s.id)), selectedSucursalId]))
        : [];

      if (editingUser) {
        const userInSucursalRef = doc(firestore, 'sucursales', selectedSucursalId, 'usuarios', editingUser.authUid);
        const userAuthLookupRef = doc(firestore, 'user_auth_lookup', editingUser.authUid);
        
        const dataToUpdate = { 
          nombre, 
          rol: roleName,
          roles: [rol],
          accesoGlobal,
          sucursalesPermitidas: finalSucursalesPermitidas
        };
        batch.update(userInSucursalRef, dataToUpdate);
        batch.update(userAuthLookupRef, {
          nombre,
          rol: roleName,
          sucursalId: selectedSucursalId,
          accesoGlobal,
          sucursalesPermitidas: finalSucursalesPermitidas
        });

        // Si se suministró una nueva contraseña al editar
        if (password.trim()) {
          if (password.length < 6) {
            toast({ title: "Error", description: "La nueva contraseña debe tener al menos 6 caracteres.", variant: "destructive" });
            setLoading(false);
            return;
          }
          const resPassword = await cambiarPasswordUsuario({
            authUid: editingUser.authUid,
            email: editingUser.email,
            nuevaPassword: password,
            currentUser,
            auth,
          });
          if (!resPassword.ok) {
            toast({
              variant: "destructive",
              title: "Aviso de contraseña",
              description: resPassword.message,
            });
          } else {
            toast({
              title: "Contraseña actualizada",
              description: `Se actualizó la contraseña para ${editingUser.nombre}.`,
            });
          }
        }
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
            accesoGlobal,
            sucursalesPermitidas: finalSucursalesPermitidas
        };
        const lookupData = {
          nombre,
          email,
          rol: roleName,
          sucursalId: selectedSucursalId,
          accesoGlobal,
          sucursalesPermitidas: finalSucursalesPermitidas
        };
        
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
                        <div key={usuario.docId} className="flex flex-col p-4 border rounded-xl bg-background hover:bg-muted/40 transition-all shadow-sm space-y-3">
                           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-bold text-foreground text-sm truncate">{usuario.nombre}</p>
                                  <Badge variant={'outline'} className={cn('font-body rounded-full px-2.5 py-0.5 text-[10px] tracking-wider', getRolBadge(usuario.rol))}>
                                    {usuario.rol}
                                  </Badge>
                                  {usuario.accesoGlobal ? (
                                    <Badge className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1">
                                      <ArrowLeftRight className="h-3 w-3" />
                                      Cambio de Sucursales Activo
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-muted-foreground text-[10px] border-border/60">
                                      Solo sucursal base
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-muted-foreground text-xs font-body mt-0.5">{usuario.email}</p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-full text-foreground hover:bg-primary/10" 
                                    title="Modificar contraseña"
                                    onClick={() => { setUsuarioParaPassword(usuario); setModalPasswordOpen(true); }}
                                >
                                    <KeyRound className="h-4 w-4 text-primary" />
                                    <span className="sr-only">Cambiar contraseña</span>
                                </Button>
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

                           {/* Sección visible de sucursales autorizadas */}
                           <div className="p-2.5 rounded-lg bg-muted/20 border border-border/50 flex flex-wrap items-center gap-1.5 text-xs">
                             <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mr-1">
                               <Building2 className="h-3.5 w-3.5 text-primary" />
                               Sucursales que puede ver en la opción:
                             </span>
                             {(() => {
                               if (!usuario.accesoGlobal) {
                                 const sucBase = sucursales?.find(s => s.id === usuario.sucursalId);
                                 return (
                                   <Badge variant="outline" className="bg-background text-muted-foreground border-border/60 text-[10px]">
                                     Únicamente sucursal base ({sucBase?.nombre || selectedSucursalNombre})
                                   </Badge>
                                 );
                               }

                               const permitidas = usuario.sucursalesPermitidas;
                               const esTodas = !permitidas || permitidas.length === 0 || permitidas.length >= (sucursales || []).length;

                               if (esTodas) {
                                 return (
                                   <div className="flex items-center gap-1.5 flex-wrap">
                                     <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] font-bold">
                                       Todas las sucursales ({sucursales?.length || 0})
                                     </Badge>
                                     {(sucursales || []).map(s => (
                                       <span key={s.id} className="text-[10px] text-muted-foreground bg-background px-2 py-0.5 rounded border border-border/40">
                                         {s.nombre}
                                       </span>
                                     ))}
                                   </div>
                                 );
                               }

                               return permitidas.map((sId) => {
                                 const suc = sucursales?.find(s => s.id === sId);
                                 const esBase = sId === usuario.sucursalId;
                                 return (
                                   <Badge
                                     key={sId}
                                     variant="outline"
                                     className={cn(
                                       "text-[10px] font-medium flex items-center gap-1",
                                       esBase ? "border-primary/40 text-primary bg-primary/10 font-bold" : "border-border/60 text-foreground bg-background"
                                     )}
                                   >
                                     {suc?.nombre || `Sucursal ${sId}`}
                                     {esBase && <span className="text-[8px] bg-primary text-primary-foreground px-1 rounded-sm">Base</span>}
                                   </Badge>
                                 );
                               });
                             })()}
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
                            {editingUser ? (
                                <div className="space-y-1.5">
                                    <Label htmlFor="password" title="Mínimo 6 caracteres" className="text-xs font-semibold ml-1">Nueva Contraseña (opcional)</Label>
                                    <Input 
                                      id="password" 
                                      type="password" 
                                      value={password} 
                                      onChange={(e) => setPassword(e.target.value)} 
                                      className="rounded-full" 
                                      placeholder="Dejar en blanco para no modificar"
                                      autoComplete="new-password"
                                    />
                                    <p className="text-[10px] text-muted-foreground ml-1">
                                      Solo ingresa una contraseña si deseas actualizar la actual de este usuario.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="password" title="Mínimo 6 caracteres" className="text-xs font-semibold ml-1">Contraseña*</Label>
                                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="rounded-full" placeholder="••••••" autoComplete="new-password" />
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

                            <div className="pt-4 mt-4 border-t border-dashed space-y-3">
                                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/20">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="acceso-global" className="font-bold flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4 text-primary" /> Acceso Multi-sucursal (Cambio de Sucursales)
                                        </Label>
                                        <p className="text-[10px] text-muted-foreground font-medium">Permite al usuario visualizar y saltar entre distintas sucursales</p>
                                    </div>
                                    <Switch
                                        id="acceso-global"
                                        checked={accesoGlobal}
                                        onCheckedChange={(checked) => {
                                          setAccesoGlobal(checked);
                                          if (checked && sucursalesPermitidas.length === 0) {
                                            setSucursalesPermitidas((sucursales || []).map(s => s.id));
                                          }
                                        }}
                                    />
                                </div>

                                {accesoGlobal && (
                                  <div className="p-4 bg-muted/20 rounded-2xl border border-border/60 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                          <Building2 className="h-3.5 w-3.5 text-primary" />
                                          Sucursales que podrá ver en su opción
                                        </Label>
                                        <p className="text-[10px] text-muted-foreground">
                                          Selecciona las sucursales a las que este usuario tendrá permiso de cambiar.
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          className="h-6 text-[10px] px-2.5 rounded-full"
                                          onClick={() => setSucursalesPermitidas((sucursales || []).map(s => s.id))}
                                        >
                                          Todas
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 text-[10px] px-2 text-muted-foreground"
                                          onClick={() => setSucursalesPermitidas(selectedSucursalId ? [selectedSucursalId] : [])}
                                        >
                                          Solo base
                                        </Button>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-48 overflow-y-auto pr-1">
                                      {(sucursales || []).map((s) => {
                                        const isChecked = sucursalesPermitidas.includes(s.id);
                                        const isBase = s.id === selectedSucursalId;
                                        return (
                                          <button
                                            type="button"
                                            key={s.id}
                                            onClick={() => {
                                              setSucursalesPermitidas(prev => 
                                                prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]
                                              );
                                            }}
                                            className={cn(
                                              "flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-colors text-left w-full",
                                              isChecked
                                                ? "bg-primary/10 border-primary/30 text-foreground font-medium"
                                                : "bg-background border-border/50 text-muted-foreground hover:bg-muted/40"
                                            )}
                                          >
                                            <div className={cn(
                                              "h-4 w-4 rounded flex items-center justify-center border transition-colors shrink-0",
                                              isChecked ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40 bg-transparent"
                                            )}>
                                              {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                                            </div>
                                            <div className="min-w-0 flex-1 truncate">
                                              <span className="truncate block">{s.nombre}</span>
                                              {isBase && <span className="text-[9px] text-primary font-semibold block">Sucursal Base</span>}
                                            </div>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
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

        <DialogoCambiarPassword 
            usuario={usuarioParaPassword}
            abierto={modalPasswordOpen}
            onOpenChange={setModalPasswordOpen}
        />
    </div>
  )
}
