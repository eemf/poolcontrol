
'use client'

import { useState, useEffect, useMemo, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Loader2, Save, Trash2, Edit, PlusCircle, LayoutGrid } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useFirebase, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSucursal } from "@/hooks/use-sucursal"

type Mesa = {
  numeroMesa: number;
  tipoDeMesa: "Carambola" | "Billar Pool";
  tarifaId: string;
  estado: "disponible" | "ocupado" | "mantenimiento";
};

type Tarifa = {
  idTarifa: number;
  nombre: string;
}

type MesaConDocId = Mesa & { docId: string };
type TarifaConDocId = Tarifa & { docId: string };

const initialFormState: Omit<Mesa, 'estado'> = {
  numeroMesa: 0,
  tipoDeMesa: 'Billar Pool',
  tarifaId: '',
};

export default function PaginaInventarioMesas() {
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mesaToDelete, setMesaToDelete] = useState<MesaConDocId | null>(null);
  const [editingMesa, setEditingMesa] = useState<MesaConDocId | null>(null);
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();

  const [formState, setFormState] = useState(initialFormState);
  
  const mesasQuery = useMemoFirebase(() => {
    if (!firestore || !user || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/mesas_de_billar`), orderBy("numeroMesa", "asc"));
  }, [firestore, user, sucursalId]);

  const tarifasQuery = useMemoFirebase(() => {
    if (!firestore || !user || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/tarifas`), orderBy("nombre", "asc"));
  }, [firestore, user, sucursalId]);

  const { data: mesas, isLoading: isLoadingMesas, error: errorMesas } = useCollection<Mesa>(mesasQuery);
  const { data: tarifas, isLoading: isLoadingTarifas } = useCollection<Tarifa>(tarifasQuery);

  const resetForm = () => {
    setFormState(initialFormState);
    setEditingMesa(null);
  };
  
  useEffect(() => {
    if (editingMesa) {
      setFormState({
        numeroMesa: editingMesa.numeroMesa,
        tipoDeMesa: editingMesa.tipoDeMesa,
        tarifaId: editingMesa.tarifaId,
      });
    } else {
      resetForm();
    }
  }, [editingMesa]);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const handleOpenModal = (mesa: MesaConDocId | null) => {
    setEditingMesa(mesa);
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
    if (!firestore || !user || !sucursalId || !formState.numeroMesa || !formState.tarifaId) {
        toast({ title: "Error", description: "El número de mesa y la tarifa son obligatorios.", variant: "destructive" });
        return;
    }
    setLoading(true);

    const docId = formState.numeroMesa.toString();

    const dataToSave: Mesa = {
      ...formState,
      estado: editingMesa ? editingMesa.estado : 'disponible', // Preserve existing state or default to 'disponible'
    };

    try {
        const mesaRef = doc(firestore, `sucursales/${sucursalId}/mesas_de_billar`, docId);
        
        // No need for transaction for correlativo as numeroMesa is the ID and is manually entered.
        await setDoc(mesaRef, dataToSave, { merge: true });

        toast({ title: "Éxito", description: `Mesa ${editingMesa ? 'actualizada' : 'creada'} correctamente.` });
        handleCloseModal();
    } catch (error: any) {
        console.error("Error guardando mesa:", error);
        toast({ title: "Error", description: error.message || "No se pudo guardar la mesa.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }

  const handleDeleteMesa = async () => {
    if (!firestore || !mesaToDelete || !sucursalId) return;
    
    const mesaRef = doc(firestore, `sucursales/${sucursalId}/mesas_de_billar`, mesaToDelete.docId);
    try {
        await deleteDoc(mesaRef);
        toast({ title: "Éxito", description: "Mesa eliminada correctamente." });
    } catch(error: any) {
        console.error("Error eliminando mesa:", error);
        toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
        setMesaToDelete(null);
    }
  }
  
  const mesasConDocId = useMemo((): MesaConDocId[] => {
    return (mesas || []).map((m) => ({ ...m, docId: m.id }));
  }, [mesas]);

  const tarifasConDocId = useMemo((): TarifaConDocId[] => {
    return (tarifas || []).map((t) => ({ ...t, docId: t.id }));
  }, [tarifas]);

  if (!isMounted) return null;
  
  const isLoading = isLoadingMesas || isUserLoading || isLoadingSucursal;

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <div className="flex items-center gap-2">
                    <LayoutGrid className="h-6 w-6" />
                    <h1 className="text-2xl font-bold tracking-tight">Inventario de Mesas</h1>
                </div>
                <p className="text-muted-foreground">Añade o edita las mesas de billar de tu local.</p>
            </div>
             <Button onClick={() => handleOpenModal(null)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Mesa
            </Button>
        </div>
        
        {isLoading ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        ) : errorMesas ? (
            <div className="flex flex-col items-center justify-center text-center text-destructive h-64 border-2 border-dashed border-destructive/50 rounded-lg bg-destructive/10">
                <LayoutGrid className="h-12 w-12 mb-4" />
                <p className="font-semibold text-lg">Acceso Denegado</p>
                <p className="text-sm max-w-sm">No tienes permisos para ver el inventario de mesas. Contacta al administrador.</p>
            </div>
        ) : mesasConDocId.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mesasConDocId.map((mesa) => {
                    const tarifaAsignada = tarifasConDocId.find(t => t.docId === mesa.tarifaId);
                    return (
                        <Card key={mesa.docId} className="flex flex-col">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">Mesa {mesa.numeroMesa}</CardTitle>
                                        <CardDescription>{mesa.tipoDeMesa}</CardDescription>
                                    </div>
                                    <Badge variant="secondary">{mesa.estado}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-3">
                                <div className="text-sm">
                                    <p className="text-muted-foreground">Tarifa Asignada</p>
                                    <p className="font-medium">{tarifaAsignada?.nombre || 'No asignada'}</p>
                                </div>
                            </CardContent>
                            <CardContent className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal(mesa)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setMesaToDelete(mesa)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    )
                })}
             </div>
        ) : (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-lg">
                <LayoutGrid className="h-12 w-12 mb-4 text-primary/50" />
                <p className="font-semibold text-lg">No hay mesas registradas</p>
                <p className="text-sm">Haz clic en 'Añadir Mesa' para empezar.</p>
            </div>
        )}

        <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
            <DialogContent className="sm:max-w-md">
                 <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{editingMesa ? "Editar Mesa" : "Nueva Mesa"}</DialogTitle>
                        <DialogDescription>
                            {editingMesa ? "Actualiza la información de la mesa." : "Crea una nueva mesa en tu inventario."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="numeroMesa">Número de Mesa</Label>
                            <Input id="numeroMesa" type="number" value={formState.numeroMesa} onChange={(e) => handleFormChange('numeroMesa', Number(e.target.value))} required disabled={!!editingMesa} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tipoDeMesa">Tipo de Mesa</Label>
                                <Select value={formState.tipoDeMesa} onValueChange={(v: Mesa['tipoDeMesa']) => handleFormChange('tipoDeMesa', v)}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Billar Pool">Billar Pool</SelectItem>
                                        <SelectItem value="Carambola">Carambola</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="tarifaId">Tarifa Asignada</Label>
                                <Select value={formState.tarifaId} onValueChange={(v) => handleFormChange('tarifaId', v)} disabled={isLoadingTarifas}>
                                    <SelectTrigger><SelectValue placeholder={isLoadingTarifas ? "Cargando..." : "Selecciona una tarifa"} /></SelectTrigger>
                                    <SelectContent>
                                        {(tarifasConDocId || []).map(t => (
                                            <SelectItem key={t.docId} value={t.docId}>{t.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {editingMesa ? "Actualizar" : "Guardar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
        
        <AlertDialog open={!!mesaToDelete} onOpenChange={(open) => !open && setMesaToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente la <span className="font-bold">Mesa {mesaToDelete?.numeroMesa}</span>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteMesa} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  )
}
