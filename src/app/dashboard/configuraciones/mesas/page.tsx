
'use client'

import { useState, useEffect, useMemo, FormEvent, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Loader2, Save, Trash2, Edit, PlusCircle, LayoutGrid, DollarSign, Timer, Trash, X, Sliders, Gamepad2, Users } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useFirebase, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, query, runTransaction, orderBy } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSucursal } from "@/hooks/use-sucursal"
import { cn } from "@/lib/utils"

// --- Tipos ---

type Intervalo = {
  duracionMinutos: number;
  precio: number;
};

type Tarifa = {
  idTarifa: number;
  nombre: string;
  tipoDeMesa: "Carambola" | "Billar Pool" | "Consola";
  tipoDeCalculo: "Por minuto" | "Por intervalo";
  costoPorMinuto?: number;
  intervalos?: Intervalo[];
  esDefault?: boolean;
  controlesBase?: number;
  costoControlExtra?: number;
};

type Mesa = {
  numeroMesa: number;
  tipoDeMesa: "Carambola" | "Billar Pool" | "Consola";
  tarifaId: string;
  estado: "disponible" | "ocupado" | "mantenimiento";
};

type TarifaConDocId = Tarifa & { docId: string };
type MesaConDocId = Mesa & { docId: string };

const initialTarifaForm: Omit<Tarifa, 'idTarifa'> = {
  nombre: '',
  tipoDeMesa: 'Billar Pool',
  tipoDeCalculo: 'Por minuto',
  costoPorMinuto: 0,
  intervalos: [],
  esDefault: false,
  controlesBase: 2,
  costoControlExtra: 0,
};

const initialMesaForm: Omit<Mesa, 'estado'> = {
  numeroMesa: 0,
  tipoDeMesa: 'Billar Pool',
  tarifaId: '',
};

export default function PaginaConfiguracionMesasUnificada() {
  const [isMounted, setIsMounted] = useState(false);
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  const { toast } = useToast();

  // --- Estados de Modales y Carga ---
  const [loading, setLoading] = useState(false);
  const [isTarifaModalOpen, setIsTarifaModalOpen] = useState(false);
  const [isMesaModalOpen, setIsMesaModalOpen] = useState(false);
  const [tarifaToDelete, setTarifaToDelete] = useState<TarifaConDocId | null>(null);
  const [mesaToDelete, setMesaToDelete] = useState<MesaConDocId | null>(null);
  const [editingTarifa, setEditingTarifa] = useState<TarifaConDocId | null>(null);
  const [editingMesa, setEditingMesa] = useState<MesaConDocId | null>(null);

  // --- Estados de Formularios ---
  const [tarifaForm, setTarifaForm] = useState(initialTarifaForm);
  const [mesaForm, setMesaForm] = useState(initialMesaForm);
  const [nuevoIntervalo, setNuevoIntervalo] = useState({ duracionMinutos: 60, precio: 10 });

  // --- Consultas Firestore ---
  const tarifasQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/tarifas`), orderBy("idTarifa", "asc"));
  }, [firestore, sucursalId]);

  const mesasQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/mesas_de_billar`), orderBy("numeroMesa", "asc"));
  }, [firestore, sucursalId]);

  const { data: tarifas, isLoading: isLoadingTarifas } = useCollection<Tarifa>(tarifasQuery);
  const { data: mesas, isLoading: isLoadingMesas } = useCollection<Mesa>(mesasQuery);

  const tarifasConDocId = useMemo(() => (tarifas || []).map(t => ({ ...t, docId: t.id })), [tarifas]);
  const mesasConDocId = useMemo(() => (mesas || []).map(m => ({ ...m, docId: m.id })), [mesas]);

  // --- Efectos ---
  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (editingTarifa) {
      setTarifaForm({
        nombre: editingTarifa.nombre,
        tipoDeMesa: editingTarifa.tipoDeMesa,
        tipoDeCalculo: editingTarifa.tipoDeCalculo,
        costoPorMinuto: editingTarifa.costoPorMinuto ?? 0,
        intervalos: editingTarifa.intervalos ?? [],
        esDefault: editingTarifa.esDefault ?? false,
        controlesBase: editingTarifa.controlesBase ?? 2,
        costoControlExtra: editingTarifa.costoControlExtra ?? 0,
      });
    } else {
      setTarifaForm(initialTarifaForm);
    }
  }, [editingTarifa]);

  useEffect(() => {
    if (editingMesa) {
      setMesaForm({
        numeroMesa: editingMesa.numeroMesa,
        tipoDeMesa: editingMesa.tipoDeMesa,
        tarifaId: editingMesa.tarifaId,
      });
    } else {
      setMesaForm(initialMesaForm);
    }
  }, [editingMesa]);

  // --- Lógica de Tarifas ---
  const handleTarifaSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!firestore || !sucursalId || !tarifaForm.nombre) return;
    setLoading(true);

    const dataToSave = {
      ...tarifaForm,
      costoPorMinuto: tarifaForm.tipoDeCalculo === 'Por minuto' ? Number(tarifaForm.costoPorMinuto) : 0,
      intervalos: tarifaForm.tipoDeCalculo === 'Por intervalo' ? tarifaForm.intervalos : [],
      controlesBase: tarifaForm.tipoDeMesa === 'Consola' ? Number(tarifaForm.controlesBase) : 0,
      costoControlExtra: tarifaForm.tipoDeMesa === 'Consola' ? Number(tarifaForm.costoControlExtra) : 0,
    };

    try {
      if (editingTarifa) {
        const tarifaRef = doc(firestore, `sucursales/${sucursalId}/tarifas`, editingTarifa.docId);
        await setDoc(tarifaRef, { ...dataToSave, idTarifa: editingTarifa.idTarifa }, { merge: true });
      } else {
        await runTransaction(firestore, async (transaction) => {
          const correlativoRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, "tarifas");
          const correlativoDoc = await transaction.get(correlativoRef);
          let nuevoCorrelativo = (correlativoDoc.exists() ? (correlativoDoc.data().correlativo || 0) : 0) + 1;
          const nuevaTarifaRef = doc(firestore, `sucursales/${sucursalId}/tarifas`, nuevoCorrelativo.toString());
          transaction.set(nuevaTarifaRef, { ...dataToSave, idTarifa: nuevoCorrelativo });
          transaction.set(correlativoRef, { correlativo: nuevoCorrelativo }, { merge: true });
        });
      }
      toast({ title: "Éxito", description: "Tarifa guardada correctamente." });
      setIsTarifaModalOpen(false);
      setEditingTarifa(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTarifa = async () => {
    if (!firestore || !tarifaToDelete || !sucursalId) return;
    try {
      await deleteDoc(doc(firestore, `sucursales/${sucursalId}/tarifas`, tarifaToDelete.docId));
      toast({ title: "Éxito", description: "Tarifa eliminada." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setTarifaToDelete(null);
    }
  };

  const handleAddIntervalo = () => {
    if (nuevoIntervalo.duracionMinutos > 0 && nuevoIntervalo.precio > 0) {
      setTarifaForm(prev => ({ ...prev, intervalos: [...(prev.intervalos || []), nuevoIntervalo] }));
      setNuevoIntervalo({ duracionMinutos: 60, precio: 10 });
    }
  };

  // --- Lógica de Mesas ---
  const handleMesaSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!firestore || !sucursalId || !mesaForm.numeroMesa || !mesaForm.tarifaId) {
      toast({ title: "Error", description: "Completa los campos obligatorios.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      const mesaRef = doc(firestore, `sucursales/${sucursalId}/mesas_de_billar`, mesaForm.numeroMesa.toString());
      const dataToSave = {
        ...mesaForm,
        estado: editingMesa ? editingMesa.estado : 'disponible',
      };
      await setDoc(mesaRef, dataToSave, { merge: true });
      toast({ title: "Éxito", description: "Estación guardada correctamente." });
      setIsMesaModalOpen(false);
      setEditingMesa(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMesa = async () => {
    if (!firestore || !mesaToDelete || !sucursalId) return;
    try {
      await deleteDoc(doc(firestore, `sucursales/${sucursalId}/mesas_de_billar`, mesaToDelete.docId));
      toast({ title: "Éxito", description: "Estación eliminada." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setMesaToDelete(null);
    }
  };

  if (!isMounted) return null;

  const isGlobalLoading = isLoadingTarifas || isLoadingMesas || isUserLoading || isLoadingSucursal;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-auto text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2 text-foreground">
            <LayoutGrid className="h-6 w-6 text-primary" />
            Configuración de Sala de Juegos
          </h1>
          <p className="text-xs text-muted-foreground hidden sm:block">Administra las tarifas y el inventario de estaciones (Mesas y Consolas).</p>
        </div>
      </div>

      {isGlobalLoading ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* SECCIÓN 1: TARIFAS */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold font-headline">Tarifas de Estaciones</h2>
              </div>
              <Button onClick={() => { setEditingTarifa(null); setIsTarifaModalOpen(true); }} size="sm" className="rounded-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Tarifa
              </Button>
            </div>

            {tarifasConDocId.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed rounded-xl bg-muted/5">
                <p className="text-muted-foreground text-sm">No hay tarifas registradas aún.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tarifasConDocId.map((tarifa) => (
                  <Card key={tarifa.docId} className="flex flex-col border-muted/60 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg font-bold">{tarifa.nombre}</CardTitle>
                          <CardDescription className="text-xs">{tarifa.tipoDeMesa}</CardDescription>
                        </div>
                        <Badge variant="secondary" className="text-[10px] uppercase">{tarifa.tipoDeCalculo}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      {tarifa.tipoDeCalculo === 'Por minuto' ? (
                        <div className="text-center p-4 bg-primary/5 rounded-xl">
                          <p className="text-3xl font-black text-primary">Q{(tarifa.costoPorMinuto || 0).toFixed(2)}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Precio por minuto</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {(tarifa.intervalos || []).map((int, i) => (
                            <div key={i} className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded-lg">
                              <span className="font-medium">{int.duracionMinutos} min</span>
                              <span className="font-bold text-primary">Q{int.precio.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {tarifa.tipoDeMesa === 'Consola' && (
                        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800 text-[11px]">
                          <p className="font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                            <Users className="h-3 w-3"/> Extras de Consola
                          </p>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Controles Base:</span>
                            <span className="font-bold">{tarifa.controlesBase}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Costo Ctrl. Extra (Hora):</span>
                            <span className="font-bold">Q{(tarifa.costoControlExtra || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="justify-end gap-2 border-t bg-muted/5 p-3">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => { setEditingTarifa(tarifa); setIsTarifaModalOpen(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive rounded-full" onClick={() => setTarifaToDelete(tarifa)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* SECCIÓN 2: INVENTARIO DE ESTACIONES */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold font-headline">Inventario de Estaciones</h2>
              </div>
              <Button onClick={() => { setEditingMesa(null); setIsMesaModalOpen(true); }} size="sm" className="rounded-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Estación
              </Button>
            </div>

            {mesasConDocId.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed rounded-xl bg-muted/5">
                <p className="text-muted-foreground text-sm">No hay estaciones en el inventario aún.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mesasConDocId.map((mesa) => {
                  const tarifa = tarifasConDocId.find(t => t.docId === mesa.tarifaId);
                  const isConsola = mesa.tipoDeMesa === 'Consola';
                  return (
                    <Card key={mesa.docId} className="flex flex-col border-muted/60 shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              {isConsola ? <Gamepad2 className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
                            </div>
                            <div>
                              <CardTitle className="text-lg font-bold">{isConsola ? 'Consola' : 'Mesa'} {mesa.numeroMesa}</CardTitle>
                              <CardDescription className="text-xs">{mesa.tipoDeMesa}</CardDescription>
                            </div>
                          </div>
                          <Badge variant={mesa.estado === 'disponible' ? 'outline' : 'default'} className="text-[10px] uppercase">{mesa.estado}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Tarifa Asignada</p>
                          <p className="text-sm font-semibold">{tarifa?.nombre || 'No asignada'}</p>
                        </div>
                      </CardContent>
                      <CardFooter className="justify-end gap-2 border-t bg-muted/5 p-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => { setEditingMesa(mesa); setIsMesaModalOpen(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive rounded-full" onClick={() => setMesaToDelete(mesa)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            )}
          </section>
        </>
      )}

      {/* --- Modales de Tarifas --- */}
      <Dialog open={isTarifaModalOpen} onOpenChange={setIsTarifaModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <form onSubmit={handleTarifaSubmit}>
            <DialogHeader>
              <DialogTitle className="font-headline">{editingTarifa ? "Editar Tarifa" : "Nueva Tarifa"}</DialogTitle>
              <DialogDescription className="text-xs">Define cómo se cobrará el tiempo en las estaciones.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh] my-4">
              <div className="space-y-4 px-6 py-4 font-body">
                <div className="space-y-2">
                  <Label htmlFor="t-nombre" className="text-xs font-semibold ml-1">Nombre de la Tarifa*</Label>
                  <Input id="t-nombre" value={tarifaForm.nombre} onChange={e => setTarifaForm(p => ({ ...p, nombre: e.target.value }))} required className="rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold ml-1">Tipo de Estación</Label>
                    <Select value={tarifaForm.tipoDeMesa} onValueChange={(v: any) => setTarifaForm(p => ({ ...p, tipoDeMesa: v }))}>
                      <SelectTrigger className="rounded-full"><SelectValue /></SelectTrigger>
                      <SelectContent className="font-body">
                        <SelectItem value="Billar Pool">Pool</SelectItem>
                        <SelectItem value="Carambola">Carambola</SelectItem>
                        <SelectItem value="Consola">Videojuegos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold ml-1">Cálculo</Label>
                    <Select value={tarifaForm.tipoDeCalculo} onValueChange={(v: any) => setTarifaForm(p => ({ ...p, tipoDeCalculo: v }))}>
                      <SelectTrigger className="rounded-full"><SelectValue /></SelectTrigger>
                      <SelectContent className="font-body">
                        <SelectItem value="Por minuto">Por Minuto</SelectItem>
                        <SelectItem value="Por intervalo">Por Intervalo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {tarifaForm.tipoDeMesa === 'Consola' && (
                  <div className="space-y-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                    <p className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-400 tracking-widest">Configuración de Controles</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs ml-1">Controles Base</Label>
                        <Input type="number" value={tarifaForm.controlesBase} onChange={e => setTarifaForm(p => ({ ...p, controlesBase: Number(e.target.value) }))} className="rounded-full text-center" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs ml-1">Extra por Ctrl/Hora</Label>
                        <Input type="number" step="0.01" value={tarifaForm.costoControlExtra} onChange={e => setTarifaForm(p => ({ ...p, costoControlExtra: Number(e.target.value) }))} className="rounded-full text-center" />
                      </div>
                    </div>
                  </div>
                )}

                {tarifaForm.tipoDeCalculo === 'Por minuto' ? (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold ml-1">Costo por Minuto (Q)</Label>
                    <Input type="number" step="0.01" value={tarifaForm.costoPorMinuto} onChange={e => setTarifaForm(p => ({ ...p, costoPorMinuto: Number(e.target.value) }))} className="rounded-full text-center font-bold" />
                  </div>
                ) : (
                  <div className="space-y-4 rounded-xl border p-4 bg-muted/10">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Intervalos de Precios</Label>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1 space-y-1">
                        <Label className="text-[10px] ml-1">Minutos</Label>
                        <Input type="number" value={nuevoIntervalo.duracionMinutos} onChange={e => setNuevoIntervalo(p => ({ ...p, duracionMinutos: Number(e.target.value) }))} className="rounded-full h-9" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-[10px] ml-1">Precio (Q)</Label>
                        <Input type="number" step="0.01" value={nuevoIntervalo.precio} onChange={e => setNuevoIntervalo(p => ({ ...p, precio: Number(e.target.value) }))} className="rounded-full h-9" />
                      </div>
                      <Button type="button" size="icon" onClick={handleAddIntervalo} className="rounded-full h-9 w-9"><PlusCircle className="h-4 w-4" /></Button>
                    </div>
                    <div className="space-y-2">
                      {(tarifaForm.intervalos || []).map((int, i) => (
                        <div key={i} className="flex items-center justify-between text-xs p-2 bg-background border rounded-lg shadow-sm">
                          <span className="font-medium">{int.duracionMinutos} min por Q{int.precio.toFixed(2)}</span>
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive rounded-full" onClick={() => setTarifaForm(p => ({ ...p, intervalos: (p.intervalos || []).filter((_, idx) => idx !== i) }))}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-3 px-6 pb-6">
              <DialogClose asChild><Button type="button" variant="outline" className="rounded-full w-full sm:w-auto">Cancelar</Button></DialogClose>
              <Button type="submit" disabled={loading} className="rounded-full w-full sm:w-auto font-bold">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {editingTarifa ? "Actualizar" : "Guardar Tarifa"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- Modales de Estaciones --- */}
      <Dialog open={isMesaModalOpen} onOpenChange={setIsMesaModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <form onSubmit={handleMesaSubmit}>
            <DialogHeader>
              <DialogTitle className="font-headline">{editingMesa ? "Editar Estación" : "Nueva Estación"}</DialogTitle>
              <DialogDescription className="text-xs">Añade o modifica una estación de juego en tu local.</DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-4 px-2 font-body">
              <div className="space-y-2">
                <Label htmlFor="m-numero" className="text-xs font-semibold ml-1">Número de Estación*</Label>
                <Input id="m-numero" type="number" value={mesaForm.numeroMesa || ''} onChange={e => setMesaForm(p => ({ ...p, numeroMesa: Number(e.target.value) }))} disabled={!!editingMesa} required className="rounded-full text-center text-lg font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold ml-1">Tipo de Estación</Label>
                  <Select value={mesaForm.tipoDeMesa} onValueChange={(v: any) => setMesaForm(p => ({ ...p, tipoDeMesa: v }))}>
                    <SelectTrigger className="rounded-full"><SelectValue /></SelectTrigger>
                    <SelectContent className="font-body">
                      <SelectItem value="Billar Pool">Pool</SelectItem>
                      <SelectItem value="Carambola">Carambola</SelectItem>
                      <SelectItem value="Consola">Videojuegos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold ml-1">Tarifa Asignada*</Label>
                  <Select value={mesaForm.tarifaId} onValueChange={v => setMesaForm(p => ({ ...p, tarifaId: v }))}>
                    <SelectTrigger className="rounded-full"><SelectValue placeholder="Elegir..." /></SelectTrigger>
                    <SelectContent className="font-body">
                      {tarifasConDocId.map(t => <SelectItem key={t.docId} value={t.docId}>{t.nombre}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-3 px-6 pb-6">
              <DialogClose asChild><Button type="button" variant="outline" className="rounded-full w-full sm:w-auto">Cancelar</Button></DialogClose>
              <Button type="submit" disabled={loading} className="rounded-full w-full sm:w-auto font-bold">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {editingMesa ? "Actualizar" : "Guardar Estación"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- Alertas de Eliminación --- */}
      <AlertDialog open={!!tarifaToDelete} onOpenChange={o => !o && setTarifaToDelete(null)}>
        <AlertDialogContent className="rounded-2xl font-body">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> ¿Eliminar tarifa?
            </AlertDialogTitle>
            <AlertDialogDescription>Esta acción es permanente y la tarifa "{tarifaToDelete?.nombre}" dejará de estar disponible para las estaciones.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTarifa} className="bg-destructive hover:bg-destructive/90 rounded-full font-bold">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!mesaToDelete} onOpenChange={o => !o && setMesaToDelete(null)}>
        <AlertDialogContent className="rounded-2xl font-body">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> ¿Eliminar estación?
            </AlertDialogTitle>
            <AlertDialogDescription>Se eliminará la estación {mesaToDelete?.numeroMesa} de tu inventario. Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMesa} className="bg-destructive hover:bg-destructive/90 rounded-full font-bold">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
