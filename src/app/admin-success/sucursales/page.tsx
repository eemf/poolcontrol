'use client'

import { useState, useEffect, useMemo, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Loader2, Save, Trash2, Edit, PlusCircle, Building, Search, LogIn, SlidersHorizontal, LayoutGrid, ShoppingCart, Dices, Truck, Scale, Zap, MonitorCheck, Boxes, History, DollarSign, PiggyBank, BookUser, CalendarDays, Calendar, Settings, Contact, Package, Ghost, ShieldCheck, HandCoins, ExternalLink } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useFirebase, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login"
import { collection, doc, setDoc, deleteDoc, query, orderBy, runTransaction } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

const FEATURE_GROUPS = [
    {
        name: "Módulos Base",
        features: [
            { id: 'mesas', label: 'Control de Mesas', icon: LayoutGrid },
            { id: 'ventas', label: 'Punto de Venta', icon: ShoppingCart },
            { id: 'ventasRapidas', label: 'Ventas Rápidas (Comandos)', icon: Zap },
            { id: 'cierreCaja', label: 'Cierre de Caja', icon: Scale },
            { id: 'compras', label: 'Compras', icon: Truck },
            { id: 'tragamonedas', label: 'Tragamonedas (Operación)', icon: Dices },
        ]
    },
    {
        name: "Administración",
        features: [
            { id: 'adminMonitoreo', label: 'Monitoreo Período', icon: MonitorCheck },
            { id: 'adminInventario', label: 'Inventario (Admin)', icon: Boxes },
            { id: 'adminMovimientos', label: 'Movimiento de Producto', icon: History },
            { id: 'adminGastos', label: 'Gastos', icon: DollarSign },
            { id: 'adminCuadreTraga', label: 'Cuadre Tragamonedas', icon: PiggyBank },
            { id: 'adminCuentas', label: 'Cuentas Financieras', icon: BookUser },
            { id: 'adminCuadreSemanal', label: 'Cuadre Semanal', icon: CalendarDays },
            { id: 'adminCuadreMensual', label: 'Cuadre Mensual', icon: Calendar },
        ]
    },
    {
        name: "Configuraciones y Mantenimiento",
        features: [
            { id: 'configMesas', label: 'Config. Mesas', icon: Settings },
            { id: 'configTragamonedas', label: 'Config. Tragamonedas', icon: Dices },
            { id: 'mantClientes', label: 'Mantenimiento Clientes', icon: Contact },
            { id: 'mantProductos', label: 'Mantenimiento Productos', icon: Package },
            { id: 'mantProductosVirt', label: 'Mantenimiento Prod. Virtuales', icon: Ghost },
            { id: 'mantRoles', label: 'Mantenimiento Roles', icon: ShieldCheck },
            { id: 'mantPagos', label: 'Mantenimiento Pagos', icon: HandCoins },
        ]
    }
];

const ALL_FEATURES = FEATURE_GROUPS.flatMap(g => g.features);

type Sucursal = {
  idSucursal: number;
  nombre: string;
  direccion?: string;
  features?: { [key: string]: boolean };
};

type SucursalConDocId = Sucursal & { docId: string };

export default function PaginaSucursales() {
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sucursalToDelete, setSucursalToDelete] = useState<SucursalConDocId | null>(null);
  const [editingSucursal, setEditingSucursal] = useState<SucursalConDocId | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { auth, firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const [formState, setFormState] = useState({
    nombre: '',
    direccion: '',
    features: ALL_FEATURES.reduce((acc, f) => ({ ...acc, [f.id]: true }), {} as { [key: string]: boolean }),
  });

  const sucursalQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'sucursales'), orderBy("idSucursal", "asc"));
  }, [firestore, user]);

  const { data: sucursales, isLoading: isLoadingSucurles, error } = useCollection<Sucursal>(sucursalQuery);

  const resetForm = () => {
    setFormState({
        nombre: '',
        direccion: '',
        features: ALL_FEATURES.reduce((acc, f) => ({ ...acc, [f.id]: true }), {}),
    });
    setEditingSucursal(null);
  };
  
  useEffect(() => {
    if (editingSucursal) {
        setFormState({
            nombre: editingSucursal.nombre,
            direccion: editingSucursal.direccion || '',
            features: editingSucursal.features || ALL_FEATURES.reduce((acc, f) => ({ ...acc, [f.id]: true }), {}),
        });
    } else {
        resetForm();
    }
  }, [editingSucursal]);


  useEffect(() => {
    setIsMounted(true);
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);
  
  const handleOpenModal = (sucursal: SucursalConDocId | null) => {
    setEditingSucursal(sucursal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingSucursal(null);
    setIsModalOpen(false);
    resetForm();
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !formState.nombre) return;
    setLoading(true);

    try {
        if (editingSucursal) {
            const dataToUpdate: Partial<Sucursal> = { 
                nombre: formState.nombre, 
                direccion: formState.direccion,
                features: formState.features,
            };
            const sucursalRef = doc(firestore, 'sucursales', editingSucursal.docId);
            await setDoc(sucursalRef, dataToUpdate, { merge: true });
        } else {
            await runTransaction(firestore, async (transaction) => {
                const correlativoRef = doc(firestore, "correlativos", "sucursales");
                const correlativoDoc = await transaction.get(correlativoRef);

                let nuevoCorrelativo = 1;
                if (correlativoDoc.exists() && correlativoDoc.data()?.correlativo) {
                    nuevoCorrelativo = correlativoDoc.data().correlativo + 1;
                }
                
                const nuevaSucursalRef = doc(firestore, 'sucursales', nuevoCorrelativo.toString());
                
                const finalData: Sucursal = {
                    idSucursal: nuevoCorrelativo,
                    nombre: formState.nombre,
                    direccion: formState.direccion,
                    features: formState.features,
                };
                
                transaction.set(nuevaSucursalRef, finalData);
                transaction.set(correlativoRef, { correlativo: nuevoCorrelativo });
            });
        }
        handleCloseModal();
    } catch (error) {
        console.error("Error guardando sucursal:", error);
    } finally {
        setLoading(false);
    }
  }

  const handleDeleteSucursal = async () => {
    if (!firestore || !sucursalToDelete) return;
    
    const sucursalRef = doc(firestore, 'sucursales', sucursalToDelete.docId);
    try {
        await deleteDoc(sucursalRef);
    } catch(error) {
        console.error("Error eliminando sucursal:", error);
    } finally {
        setSucursalToDelete(null);
    }
  }
  
  const handleLoginAsSucursal = (sucursal: SucursalConDocId) => {
    localStorage.setItem('selectedSucursalId', sucursal.docId);
    router.push('/dashboard');
  };

  const sucursalesConDocId = useMemo((): SucursalConDocId[] => {
    return (sucursales || []).map((s) => ({
      ...s,
      docId: s.id, 
    }));
  }, [sucursales]);

  const filteredSucursales = useMemo(() => {
    return sucursalesConDocId.filter(s => 
        (s.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.direccion || '').toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [sucursalesConDocId, searchTerm]);

  if (!isMounted) {
    return null;
  }
  
  const hasPermissionError = error && error.message.includes("Missing or insufficient permissions");

  return (
    <div className="space-y-6 font-body">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
                <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2 text-foreground">
                    <Building className="h-6 w-6 text-primary" />
                    Gestión de Sucursales
                </h1>
                <p className="text-sm text-muted-foreground font-body">Añade, edita y administra las locaciones de tu negocio.</p>
            </div>
             { !hasPermissionError && (
                <Button onClick={() => handleOpenModal(null)} className="font-bold w-full sm:w-auto rounded-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Sucursal
                </Button>
            )}
        </div>
        
        <div className="space-y-4">
            <div className="relative max-w-md mx-auto sm:mx-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Buscar sucursal..."
                    className="pl-9 h-10 rounded-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {isLoadingSucurles || isUserLoading ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : hasPermissionError ? (
                <Card className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed bg-destructive/5 border-destructive/20">
                    <ShieldCheck className="h-12 w-12 mb-4 text-destructive opacity-50" />
                    <p className="font-bold text-lg font-headline text-destructive">Acceso Denegado</p>
                    <p className="text-sm text-muted-foreground max-w-sm">No tienes los permisos necesarios para gestionar las sucursales del sistema.</p>
                </Card>
            ) : filteredSucursales.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSucursales.map((sucursal) => (
                        <Card key={sucursal.docId} className="flex flex-col font-body transition-all hover:shadow-md border-muted/60">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <Building className="h-6 w-6 text-primary" />
                                    <CardTitle className="font-headline">{sucursal.nombre}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <CardDescription className="font-body text-xs mb-4">
                                    ID #{sucursal.idSucursal} • {sucursal.direccion || 'Sin dirección registrada'}
                                </CardDescription>
                                
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    <TooltipProvider>
                                        {ALL_FEATURES.slice(0, 10).map(f => {
                                            const isActive = sucursal.features?.[f.id] !== false;
                                            if (!isActive) return null;
                                            return (
                                                <Tooltip key={f.id}>
                                                    <TooltipTrigger asChild>
                                                        <div className="h-7 w-7 rounded-lg bg-primary/5 text-primary flex items-center justify-center border border-primary/10">
                                                            <f.icon className="h-3.5 w-3.5" />
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">
                                                        <p className="text-[10px] font-bold uppercase tracking-widest">{f.label}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )
                                        })}
                                        {Object.values(sucursal.features || {}).filter(v => v).length > 10 && (
                                            <Badge variant="secondary" className="h-7 text-[10px] rounded-lg">...</Badge>
                                        )}
                                    </TooltipProvider>
                                </div>
                            </CardContent>
                            <CardFooter className="flex gap-2 p-4 border-t bg-muted/5">
                                <Button onClick={() => handleLoginAsSucursal(sucursal)} className="flex-1 font-bold rounded-full">
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Ingresar
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => handleOpenModal(sucursal)} className="h-10 w-10 rounded-full">
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full" onClick={() => { setSucursalToDelete(sucursal) }}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                 </div>
            ) : (
                <Card className="flex flex-col items-center justify-center text-center p-16 border-2 border-dashed bg-muted/5 border-muted/60">
                    <Building className="h-12 w-12 mb-4 text-primary/30" />
                    <p className="font-bold text-lg font-headline">No hay sucursales</p>
                    <p className="text-sm text-muted-foreground">Haz clic en 'Añadir Sucursal' para registrar tu primera locación.</p>
                </Card>
            )}
        </div>

        <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
            <DialogContent className="sm:max-w-2xl p-0 overflow-hidden text-foreground border-none shadow-2xl rounded-3xl">
                <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
                    <DialogHeader className="p-8 bg-background border-b shrink-0">
                        <DialogTitle className="font-headline text-2xl">{editingSucursal ? "Editar Sucursal" : "Nueva Sucursal"}</DialogTitle>
                        <DialogDescription className="text-sm font-body">
                            Configura los datos y módulos operativos activos para este local.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-y-auto min-h-0 bg-muted/5">
                        <div className="p-8 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Nombre Comercial*</Label>
                                    <Input value={formState.nombre} onChange={(e) => setFormState(p => ({...p, nombre: e.target.value}))} placeholder="Ej: Pool Centro" required className="rounded-full h-12" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Ubicación / Dirección</Label>
                                    <Input value={formState.direccion} onChange={(e) => setFormState(p => ({...p, direccion: e.target.value}))} placeholder="Ej: 5ta Avenida 12-30 Zona 1" className="rounded-full h-12" />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 border-b pb-3">
                                    <SlidersHorizontal className="h-4 w-4"/> Módulos y Funcionalidades
                                </Label>
                                
                                {FEATURE_GROUPS.map((group) => (
                                    <div key={group.name} className="space-y-3">
                                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-2 border-l-2 border-primary/30">{group.name}</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-background p-4 rounded-3xl border border-muted/60 shadow-sm">
                                            {group.features.map((feature) => (
                                                <div key={feature.id} className="flex items-center justify-between p-2 px-3 rounded-2xl hover:bg-muted/30 transition-colors group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                            <feature.icon className="h-4 w-4" />
                                                        </div>
                                                        <Label htmlFor={`feature-${feature.id}`} className="font-bold text-xs cursor-pointer">
                                                            {feature.label}
                                                        </Label>
                                                    </div>
                                                    <Switch
                                                        id={`feature-${feature.id}`}
                                                        checked={formState.features?.[feature.id] ?? false}
                                                        onCheckedChange={(checked) => {
                                                            const newFeatures = { ...formState.features, [feature.id]: checked };
                                                            setFormState(prev => ({...prev, features: newFeatures}));
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-8 border-t bg-background shrink-0 sm:justify-between flex flex-col-reverse sm:flex-row gap-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="h-12 px-10 font-bold rounded-full">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading} className="h-12 px-12 font-bold rounded-full shadow-lg shadow-primary/20">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {editingSucursal ? "Actualizar" : "Guardar Sucursal"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
        
        <AlertDialog open={!!sucursalToDelete} onOpenChange={(open) => !open && setSucursalToDelete(null)}>
            <AlertDialogContent className="font-body rounded-3xl border-none shadow-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-headline text-2xl text-destructive flex items-center gap-3">
                        <Trash2 className="h-7 w-7" /> ¿Eliminar sucursal?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm font-medium">
                        Esta acción es definitiva. Se borrarán permanentemente todos los datos de <span className="font-black text-foreground">"{sucursalToDelete?.nombre}"</span>, incluyendo inventarios, ventas y personal autorizado.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3 sm:gap-0 sm:justify-between flex flex-col-reverse sm:flex-row mt-6">
                    <AlertDialogCancel className="h-12 font-bold rounded-full px-8">Volver</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteSucursal} className="bg-destructive hover:bg-destructive/90 h-12 px-10 font-bold rounded-full shadow-lg shadow-destructive/20 text-white border-none">Sí, eliminar todo</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  )
}
