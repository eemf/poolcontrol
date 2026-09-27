'use client'

import { useState, useEffect, useMemo, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Loader2, Save, Trash2, Edit, PlusCircle, Dices } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useFirebase, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, query, runTransaction, orderBy, Timestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useSucursal } from "@/hooks/use-sucursal"
import { cn } from "@/lib/utils"

type EstadoTragamonedas = "activo" | "mantenimiento" | "inactivo";

type Tragamonedas = {
  idTragamonedas: number;
  nombre: string;
  modelo?: string;
  estado: EstadoTragamonedas;
};

type TragamonedasConDocId = Tragamonedas & { docId: string };

const initialFormState: Omit<Tragamonedas, 'idTragamonedas'> = {
  nombre: '',
  modelo: '',
  estado: 'activo',
};

export default function PaginaConfiguracionTragamonedas() {
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [maquinaToDelete, setMaquinaToDelete] = useState<TragamonedasConDocId | null>(null);
  const [editingMaquina, setEditingMaquina] = useState<TragamonedasConDocId | null>(null);
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();

  const [formState, setFormState] = useState(initialFormState);
  
  const tragamonedasQuery = useMemoFirebase(() => {
    if (!firestore || !user || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/tragamonedas`), orderBy("idTragamonedas", "asc"));
  }, [firestore, user, sucursalId]);

  const { data: maquinas, isLoading: isLoadingMaquinas, error } = useCollection<Tragamonedas>(tragamonedasQuery);

  const resetForm = () => {
    setFormState(initialFormState);
    setEditingMaquina(null);
  };
  
  useEffect(() => {
    if (editingMaquina) {
      setFormState({
        nombre: editingMaquina.nombre,
        modelo: editingMaquina.modelo || '',
        estado: editingMaquina.estado,
      });
    } else {
      resetForm();
    }
  }, [editingMaquina]);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const handleOpenModal = (maquina: TragamonedasConDocId | null) => {
    setEditingMaquina(maquina);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  }

  const handleFormChange = (field: keyof typeof formState, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !sucursalId || !formState.nombre) {
        toast({ title: "Error", description: "El nombre de la máquina es obligatorio.", variant: "destructive" });
        return;
    }
    setLoading(true);

    const dataToSave = {
        nombre: formState.nombre,
        modelo: formState.modelo,
        estado: formState.estado,
    };

    try {
        const basePath = `sucursales/${sucursalId}`;
        if (editingMaquina) {
            const maquinaRef = doc(firestore, `${basePath}/tragamonedas`, editingMaquina.docId);
            await setDoc(maquinaRef, { ...dataToSave, idTragamonedas: editingMaquina.idTragamonedas }, { merge: true });
        } else {
            await runTransaction(firestore, async (transaction) => {
                const correlativoRef = doc(firestore, `${basePath}/correlativos`, "tragamonedas");
                const correlativoDoc = await transaction.get(correlativoRef);
                
                let nuevoCorrelativo = 1;
                if (correlativoDoc.exists() && correlativoDoc.data()?.correlativo) {
                    nuevoCorrelativo = correlativoDoc.data().correlativo + 1;
                }

                const nuevaMaquinaRef = doc(firestore, `${basePath}/tragamonedas`, nuevoCorrelativo.toString());
                const finalData = { ...dataToSave, idTragamonedas: nuevoCorrelativo };
                
                transaction.set(nuevaMaquinaRef, finalData);
                transaction.set(correlativoRef, { correlativo: nuevoCorrelativo }, { merge: true });

                const generalesRef = doc(firestore, `${basePath}/generales_tragamonedas`, nuevoCorrelativo.toString());
                const generalesData = {
                  id: nuevoCorrelativo.toString(),
                  idTragamonedas: nuevoCorrelativo.toString(),
                  nombre: formState.nombre,
                  totalPremios: 0,
                  totalExtraccion: 0,
                  totalDeuda: 0,
                  totalBase: 0,
                  fechaActualizacion: Timestamp.now(),
                };
                transaction.set(generalesRef, generalesData);
            });
        }
        toast({ title: "Éxito", description: `Máquina ${editingMaquina ? 'actualizada' : 'creada'} correctamente.` });
        handleCloseModal();
    } catch (error: any) {
        console.error("Error guardando máquina:", error);
        toast({ title: "Error", description: error.message || "No se pudo guardar la máquina.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }

  const handleDeleteMaquina = async () => {
    if (!firestore || !maquinaToDelete || !sucursalId) return;
    
    const maquinaRef = doc(firestore, `sucursales/${sucursalId}/tragamonedas`, maquinaToDelete.docId);
    try {
        await deleteDoc(maquinaRef);
        toast({ title: "Éxito", description: "Máquina eliminada correctamente." });
    } catch(error: any) {
        console.error("Error eliminando máquina:", error);
        toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
        setMaquinaToDelete(null);
    }
  }
  
  const maquinasConDocId = useMemo((): TragamonedasConDocId[] => {
    return (maquinas || []).map((m) => ({ ...m, docId: m.id }));
  }, [maquinas]);

  const getStatusBadgeVariant = (estado: EstadoTragamonedas) => {
    switch (estado) {
        case 'activo': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
        case 'mantenimiento': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
        case 'inactivo': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
        default: return 'secondary';
    }
  }

  if (!isMounted) return null;
  
  const isLoading = isLoadingMaquinas || isUserLoading || isLoadingSucursal;

  return (
    <div className="space-y-6 font-body">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="w-full sm:w-auto">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Dices className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold tracking-tight font-headline text-foreground">Configuración de Tragamonedas</h1>
                </div>
                <p className="text-sm text-muted-foreground hidden sm:block font-body mt-1">Administra las máquinas tragamonedas de tu negocio.</p>
            </div>
             <Button onClick={() => handleOpenModal(null)} className="w-full sm:w-auto rounded-full font-bold h-11 shadow-lg shadow-primary/20">
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Máquina
            </Button>
        </div>
        
        {isLoading ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        ) : error ? (
            <div className="flex flex-col items-center justify-center text-center text-destructive h-64 border-2 border-dashed border-destructive/50 rounded-lg bg-destructive/10">
                <Dices className="h-12 w-12 mb-4" />
                <p className="font-semibold text-lg font-headline">Acceso Denegado</p>
                <p className="text-sm max-w-sm">No tienes los permisos necesarios para realizar estas operaciones.</p>
            </div>
        ) : maquinasConDocId.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {maquinasConDocId.map((maquina) => (
                    <Card key={maquina.docId} className="flex flex-col border bg-card-foreground/5 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden">
                        <CardHeader className="pb-3 bg-muted/10">
                            <div className="flex items-start justify-between">
                                <div className="min-w-0 flex-1">
                                    <CardTitle className="text-lg font-bold truncate text-foreground">{maquina.nombre}</CardTitle>
                                    <CardDescription className="text-xs font-medium truncate mt-0.5">{maquina.modelo || 'Sin modelo registrado'}</CardDescription>
                                </div>
                                <Badge className={cn("rounded-full border-none font-bold px-3 h-6 text-[10px] uppercase ml-2 shrink-0", getStatusBadgeVariant(maquina.estado))}>
                                  {maquina.estado}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow flex items-center justify-center py-8">
                            <div className="h-16 w-16 rounded-2xl bg-muted/20 flex items-center justify-center text-primary/20">
                                <Dices className="h-10 w-10" />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 p-4 bg-muted/5 border-t border-dashed">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-10 sm:h-9 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold px-5 w-full sm:w-auto shadow-sm" 
                                onClick={() => handleOpenModal(maquina)}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-10 sm:h-9 text-white bg-destructive hover:bg-destructive/90 rounded-full font-bold px-5 w-full sm:w-auto shadow-sm" 
                                onClick={() => setMaquinaToDelete(maquina)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
             </div>
        ) : (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-3xl bg-muted/5 m-2">
                <Dices className="h-12 w-12 mb-4 text-primary/30" />
                <p className="font-semibold text-lg font-headline">No hay máquinas registradas</p>
                <p className="text-xs mt-1 font-body">Haz clic en el botón superior para empezar.</p>
            </div>
        )}

        {/* Modal de Creación/Edición */}
        <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
            <DialogContent className="sm:max-w-md rounded-2xl font-body border-none shadow-2xl p-0 overflow-hidden">
                 <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
                    <DialogHeader className="p-6 pb-4 shrink-0 bg-background">
                        <DialogTitle className="font-headline text-xl">{editingMaquina ? "Editar Máquina" : "Nueva Máquina"}</DialogTitle>
                        <DialogDescription className="text-xs font-body">
                            {editingMaquina ? "Actualiza la información técnica de la máquina." : "Crea una nueva máquina para el inventario de la sucursal."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto min-h-0 bg-muted/5">
                        <div className="space-y-5 p-6 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="nombre" className="text-xs font-semibold text-muted-foreground ml-1">Nombre Identificador*</Label>
                                <Input id="nombre" value={formState.nombre} onChange={(e) => handleFormChange('nombre', e.target.value)} required className="rounded-full h-11 border-muted-foreground/20 focus:ring-primary" placeholder="Ej: Máquina 01" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="modelo" className="text-xs font-semibold text-muted-foreground ml-1">Modelo / Juego</Label>
                                    <Input id="modelo" value={formState.modelo} onChange={(e) => handleFormChange('modelo', e.target.value)} className="rounded-full h-11 border-muted-foreground/20 focus:ring-primary" placeholder="Ej: Cherry Master" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="estado" className="text-xs font-semibold text-muted-foreground ml-1">Estado Operativo</Label>
                                    <Select value={formState.estado} onValueChange={(v: EstadoTragamonedas) => handleFormChange('estado', v)}>
                                        <SelectTrigger className="rounded-full h-11 border-muted-foreground/20"><SelectValue/></SelectTrigger>
                                        <SelectContent className="font-body">
                                            <SelectItem value="activo">Activo</SelectItem>
                                            <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                                            <SelectItem value="inactivo">Inactivo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="p-6 pt-4 bg-background shrink-0 flex-col-reverse sm:flex-row sm:justify-between gap-3">
                        <DialogClose asChild><Button type="button" variant="outline" className="w-full sm:w-auto rounded-full h-11 px-8 font-semibold">Cancelar</Button></DialogClose>
                        <Button type="submit" disabled={loading} className="w-full sm:w-auto rounded-full h-11 px-10 font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {editingMaquina ? "Actualizar" : "Guardar Registro"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
        
        {/* Alerta de Eliminación */}
        <AlertDialog open={!!maquinaToDelete} onOpenChange={(open) => !open && setMaquinaToDelete(null)}>
            <AlertDialogContent className="rounded-3xl font-body border-none shadow-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-headline text-xl text-destructive flex items-center gap-2">
                        <Trash2 className="h-6 w-6" /> ¿Estás seguro?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm">
                        Esta acción no se puede deshacer. Se eliminará permanentemente la máquina <span className="font-bold text-foreground">"{maquinaToDelete?.nombre}"</span> del sistema de control.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-4">
                    <AlertDialogCancel className="rounded-full h-11 px-8 font-semibold">Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteMaquina} className="bg-destructive hover:bg-destructive/90 rounded-full h-11 px-10 font-bold shadow-sm">
                      Sí, eliminar registro
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  )
}
