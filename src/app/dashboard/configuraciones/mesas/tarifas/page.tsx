
'use client'

import { useState, useEffect, useMemo, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Loader2, Save, Trash2, Edit, PlusCircle, DollarSign, Search, Clock, Sliders, Trash, Timer } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useFirebase, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, query, runTransaction, orderBy, DocumentData } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSucursal } from "@/hooks/use-sucursal"

type Intervalo = {
  duracionMinutos: number;
  precio: number;
};

type Tarifa = {
  idTarifa: number;
  nombre: string;
  tipoDeMesa: "Carambola" | "Billar Pool";
  tipoDeCalculo: "Por minuto" | "Por intervalo";
  costoPorMinuto?: number;
  intervalos?: Intervalo[];
  esDefault?: boolean;
};

type TarifaConDocId = Tarifa & { docId: string };

const initialFormState: Omit<Tarifa, 'idTarifa'> = {
  nombre: '',
  tipoDeMesa: 'Billar Pool',
  tipoDeCalculo: 'Por minuto',
  costoPorMinuto: 0,
  intervalos: [],
  esDefault: false,
};

export default function PaginaTarifas() {
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tarifaToDelete, setTarifaToDelete] = useState<TarifaConDocId | null>(null);
  const [editingTarifa, setEditingTarifa] = useState<TarifaConDocId | null>(null);
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();

  const [formState, setFormState] = useState(initialFormState);
  const [nuevoIntervalo, setNuevoIntervalo] = useState({ duracionMinutos: 60, precio: 10 });
  
  const tarifasQuery = useMemoFirebase(() => {
    if (!firestore || !user || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/tarifas`), orderBy("idTarifa", "asc"));
  }, [firestore, user, sucursalId]);

  const { data: tarifas, isLoading: isLoadingTarifas, error } = useCollection<Tarifa>(tarifasQuery);

  const resetForm = () => {
    setFormState(initialFormState);
    setEditingTarifa(null);
    setNuevoIntervalo({ duracionMinutos: 60, precio: 10 });
  };
  
  useEffect(() => {
    if (editingTarifa) {
      setFormState({
        nombre: editingTarifa.nombre,
        tipoDeMesa: editingTarifa.tipoDeMesa,
        tipoDeCalculo: editingTarifa.tipoDeCalculo,
        costoPorMinuto: editingTarifa.costoPorMinuto ?? 0,
        intervalos: editingTarifa.intervalos ?? [],
        esDefault: editingTarifa.esDefault ?? false,
      });
    } else {
      resetForm();
    }
  }, [editingTarifa]);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const handleOpenModal = (tarifa: TarifaConDocId | null) => {
    setEditingTarifa(tarifa);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  }

  const handleFormChange = (field: keyof Omit<Tarifa, 'idTarifa'>, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleAddIntervalo = () => {
    if (nuevoIntervalo.duracionMinutos > 0 && nuevoIntervalo.precio > 0) {
      const intervalosActualizados = [...(formState.intervalos || []), nuevoIntervalo];
      handleFormChange('intervalos', intervalosActualizados);
      setNuevoIntervalo({ duracionMinutos: 60, precio: 10 });
    } else {
      toast({ title: "Error", description: "La duración y el precio del intervalo deben ser mayores a cero.", variant: "destructive" });
    }
  };

  const handleRemoveIntervalo = (index: number) => {
    const intervalosActualizados = (formState.intervalos || []).filter((_, i) => i !== index);
    handleFormChange('intervalos', intervalosActualizados);
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !sucursalId || !formState.nombre) {
        toast({ title: "Error", description: "El nombre de la tarifa es obligatorio.", variant: "destructive" });
        return;
    }
    setLoading(true);

    const baseData = {
        nombre: formState.nombre,
        tipoDeMesa: formState.tipoDeMesa,
        tipoDeCalculo: formState.tipoDeCalculo,
        esDefault: formState.esDefault,
    };

    let dataToSave: Partial<Tarifa>;

    if (formState.tipoDeCalculo === 'Por minuto') {
        dataToSave = {
            ...baseData,
            costoPorMinuto: Number(formState.costoPorMinuto) || 0,
        };
    } else {
        dataToSave = {
            ...baseData,
            intervalos: formState.intervalos || [],
        };
    }

    try {
        const basePath = `sucursales/${sucursalId}`;
        if (editingTarifa) {
            const tarifaRef = doc(firestore, `${basePath}/tarifas`, editingTarifa.docId);
            await setDoc(tarifaRef, { ...dataToSave, idTarifa: editingTarifa.idTarifa }, { merge: true });
        } else {
            await runTransaction(firestore, async (transaction) => {
                const correlativoRef = doc(firestore, `${basePath}/correlativos`, "tarifas");
                const correlativoDoc = await transaction.get(correlativoRef);
                
                let nuevoCorrelativo = 1;
                if (correlativoDoc.exists() && correlativoDoc.data()?.correlativo) {
                    nuevoCorrelativo = correlativoDoc.data().correlativo + 1;
                }

                const nuevaTarifaRef = doc(firestore, `${basePath}/tarifas`, nuevoCorrelativo.toString());
                const finalData = { ...dataToSave, idTarifa: nuevoCorrelativo };
                
                transaction.set(nuevaTarifaRef, finalData);
                transaction.set(correlativoRef, { correlativo: nuevoCorrelativo }, { merge: true });
            });
        }
        toast({ title: "Éxito", description: `Tarifa ${editingTarifa ? 'actualizada' : 'creada'} correctamente.` });
        handleCloseModal();
    } catch (error: any) {
        console.error("Error guardando tarifa:", error);
        toast({ title: "Error", description: error.message || "No se pudo guardar la tarifa.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }

  const handleDeleteTarifa = async () => {
    if (!firestore || !tarifaToDelete || !sucursalId) return;
    
    const tarifaRef = doc(firestore, `sucursales/${sucursalId}/tarifas`, tarifaToDelete.docId);
    try {
        await deleteDoc(tarifaRef);
        toast({ title: "Éxito", description: "Tarifa eliminada correctamente." });
    } catch(error: any) {
        console.error("Error eliminando tarifa:", error);
        toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
        setTarifaToDelete(null);
    }
  }
  
  const tarifasConDocId = useMemo((): TarifaConDocId[] => {
    return (tarifas || []).map((t) => ({ ...t, docId: t.id }));
  }, [tarifas]);

  if (!isMounted) return null;

  const isLoading = isLoadingTarifas || isUserLoading || isLoadingSucursal;

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <div className="flex items-center gap-2">
                    <DollarSign className="h-6 w-6" />
                    <h1 className="text-2xl font-bold tracking-tight">Gestión de Tarifas</h1>
                </div>
                <p className="text-muted-foreground">Crea y administra los precios para los diferentes tipos de mesa.</p>
            </div>
             <Button onClick={() => handleOpenModal(null)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Tarifa
            </Button>
        </div>
        
        {isLoading ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        ) : error ? (
            <div className="flex flex-col items-center justify-center text-center text-destructive h-64 border-2 border-dashed border-destructive/50 rounded-lg bg-destructive/10">
                <DollarSign className="h-12 w-12 mb-4" />
                <p className="font-semibold text-lg">Acceso Denegado</p>
                <p className="text-sm max-w-sm">No tienes permisos para ver las tarifas. Contacta al administrador.</p>
            </div>
        ) : tarifasConDocId.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tarifasConDocId.map((tarifa) => (
                    <Card key={tarifa.docId} className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-lg">{tarifa.nombre}</CardTitle>
                                    <CardDescription>{tarifa.tipoDeMesa}</CardDescription>
                                </div>
                                <Badge variant={tarifa.tipoDeCalculo === 'Por minuto' ? 'secondary' : 'outline'}>{tarifa.tipoDeCalculo}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-3">
                            {tarifa.tipoDeCalculo === 'Por minuto' ? (
                                <div className="text-center p-4 bg-muted/50 rounded-md">
                                    <p className="text-3xl font-bold">Q{(tarifa.costoPorMinuto || 0).toFixed(2)}</p>
                                    <p className="text-sm text-muted-foreground">por minuto</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {(tarifa.intervalos || []).map((int, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm bg-muted/50 p-2 rounded-md">
                                            <span>{int.duracionMinutos} min</span>
                                            <span className="font-semibold">Q{int.precio.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal(tarifa)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setTarifaToDelete(tarifa)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
             </div>
        ) : (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-lg">
                <DollarSign className="h-12 w-12 mb-4 text-primary/50" />
                <p className="font-semibold text-lg">No hay tarifas registradas</p>
                <p className="text-sm">Haz clic en 'Añadir Tarifa' para empezar.</p>
            </div>
        )}

        <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
            <DialogContent className="sm:max-w-md">
                 <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{editingTarifa ? "Editar Tarifa" : "Nueva Tarifa"}</DialogTitle>
                        <DialogDescription>
                            {editingTarifa ? "Actualiza la información de la tarifa." : "Crea una nueva tarifa para las mesas."}
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[60vh] my-4">
                        <div className="space-y-4 px-6 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="nombre">Nombre de la Tarifa</Label>
                                <Input id="nombre" value={formState.nombre} onChange={(e) => handleFormChange('nombre', e.target.value)} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tipoDeMesa">Tipo de Mesa</Label>
                                    <Select value={formState.tipoDeMesa} onValueChange={(v: Tarifa['tipoDeMesa']) => handleFormChange('tipoDeMesa', v)}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Billar Pool">Billar Pool</SelectItem>
                                            <SelectItem value="Carambola">Carambola</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tipoDeCalculo">Tipo de Cálculo</Label>
                                    <Select value={formState.tipoDeCalculo} onValueChange={(v: Tarifa['tipoDeCalculo']) => handleFormChange('tipoDeCalculo', v)}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Por minuto">Por minuto</SelectItem>
                                            <SelectItem value="Por intervalo">Por intervalo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {formState.tipoDeCalculo === 'Por minuto' && (
                                <div className="space-y-2">
                                    <Label htmlFor="costoPorMinuto">Costo por Minuto</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">Q</span>
                                        <Input id="costoPorMinuto" type="number" min="0" step="0.01" className="pl-7" value={formState.costoPorMinuto} onChange={(e) => handleFormChange('costoPorMinuto', e.target.value)} />
                                    </div>
                                </div>
                            )}

                            {formState.tipoDeCalculo === 'Por intervalo' && (
                                <div className="space-y-4 rounded-md border p-4">
                                    <h4 className="font-medium text-sm flex items-center gap-2"><Timer className="h-4 w-4"/>Intervalos de Precios</h4>
                                    <div className="flex items-end gap-2">
                                        <div className="grid flex-1 gap-2">
                                            <Label htmlFor="duracion" className="text-xs">Duración (min)</Label>
                                            <Input id="duracion" type="number" min="1" value={nuevoIntervalo.duracionMinutos} onChange={e => setNuevoIntervalo(p => ({...p, duracionMinutos: Number(e.target.value)}))} />
                                        </div>
                                        <div className="grid flex-1 gap-2">
                                            <Label htmlFor="precio" className="text-xs">Precio (Q)</Label>
                                            <Input id="precio" type="number" min="0" step="0.01" value={nuevoIntervalo.precio} onChange={e => setNuevoIntervalo(p => ({...p, precio: Number(e.target.value)}))} />
                                        </div>
                                        <Button type="button" size="icon" onClick={handleAddIntervalo}><PlusCircle className="h-4 w-4" /></Button>
                                    </div>
                                    <div className="space-y-2">
                                        {(formState.intervalos || []).map((intervalo, index) => (
                                            <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded-md">
                                                <span>{intervalo.duracionMinutos} min por Q{intervalo.precio.toFixed(2)}</span>
                                                <Button type="button" size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => handleRemoveIntervalo(index)}>
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {editingTarifa ? "Actualizar" : "Guardar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
        
        <AlertDialog open={!!tarifaToDelete} onOpenChange={(open) => !open && setTarifaToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente la tarifa <span className="font-bold">{tarifaToDelete?.nombre}</span>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteTarifa} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  )
}
