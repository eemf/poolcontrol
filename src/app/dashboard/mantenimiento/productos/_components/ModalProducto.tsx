'use client';

import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, PlusCircle, Utensils, Trash2, Edit, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Producto, Preparacion, Ingrediente } from "@/lib/tipos";

interface ModalProductoProps {
  abierto: boolean;
  onClose: () => void;
  editando: boolean;
  onSubmit: (e: React.FormEvent) => void;
  procesando: boolean;
  form: {
    nombre: string; setNombre: (v: string) => void;
    precioCompra: number | ''; setPrecioCompra: (v: number | '') => void;
    precioVenta: number | ''; setPrecioVenta: (v: number | '') => void;
    existencia: number | ''; setExistencia: (v: number | '') => void;
    existenciaMinima: number | ''; setExistenciaMinima: (v: number | '') => void;
    preparaciones: Preparacion[]; setPreparaciones: (v: Preparacion[]) => void;
  };
  productosParaIngredientes: (Producto & { docId: string })[];
}

export function ModalProducto({
  abierto,
  onClose,
  editando,
  onSubmit,
  procesando,
  form,
  productosParaIngredientes
}: ModalProductoProps) {
  const [nuevaPrep, setNuevaPrep] = useState({ nombre: '', precioVenta: '' as number | '', ingredientes: [] as Ingrediente[] });
  const [idxEdicionPrep, setIdxEdicionPrep] = useState<number | null>(null);
  const [ingSelecId, setIngSelecId] = useState('');
  const [cantIng, setCantIng] = useState<number | ''>(1);

  const resetFormPrep = useCallback(() => {
    setNuevaPrep({ nombre: '', precioVenta: '', ingredientes: [] });
    setIdxEdicionPrep(null);
    setIngSelecId('');
    setCantIng(1);
  }, []);

  const anadirIngrediente = () => {
    if (!ingSelecId || !cantIng || Number(cantIng) <= 0) return;
    const prod = productosParaIngredientes.find(p => p.docId === ingSelecId);
    if (!prod) return;

    setNuevaPrep(prev => ({
      ...prev,
      ingredientes: [...prev.ingredientes, { productoId: ingSelecId, nombreProducto: prod.nombre, cantidad: Number(cantIng) }]
    }));
    setIngSelecId(''); setCantIng(1);
  };

  const anadirOActualizarPrep = () => {
    if (!nuevaPrep.nombre || nuevaPrep.precioVenta === '' || Number(nuevaPrep.precioVenta) <= 0) return;
    const item: Preparacion = {
      nombre: nuevaPrep.nombre,
      precioVenta: Number(nuevaPrep.precioVenta),
      ingredientes: nuevaPrep.ingredientes
    };

    if (idxEdicionPrep !== null) {
      const lista = [...form.preparaciones];
      lista[idxEdicionPrep] = item;
      form.setPreparaciones(lista);
    } else {
      form.setPreparaciones([...form.preparaciones, item]);
    }
    resetFormPrep();
  };

  return (
    <Dialog open={abierto} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl rounded-2xl font-body border-none shadow-2xl p-0 overflow-hidden">
        <form onSubmit={onSubmit} className="flex flex-col max-h-[90vh]">
          <DialogHeader className="p-6 pb-4 shrink-0 bg-background">
            <DialogTitle className="font-headline text-xl">{editando ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
            <DialogDescription className="text-xs font-body">Configura los datos base y preparaciones del producto.</DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-8 p-6 pt-2">
              {/* Sección Datos Base */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-xs font-semibold text-muted-foreground ml-1">Nombre del producto*</Label>
                  <Input id="nombre" value={form.nombre} onChange={e => form.setNombre(e.target.value)} required className="rounded-full h-11 border-muted-foreground/20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground ml-1">Precio compra</Label>
                    <Input type="number" value={form.precioCompra} onChange={e => form.setPrecioCompra(e.target.value === '' ? '' : Number(e.target.value))} step="0.01" className="rounded-full h-11 text-center" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground ml-1">Precio venta*</Label>
                    <Input type="number" value={form.precioVenta} onChange={e => form.setPrecioVenta(e.target.value === '' ? '' : Number(e.target.value))} required step="0.01" className="rounded-full h-11 text-center font-bold text-primary" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground ml-1">Existencia*</Label>
                    <Input type="number" value={form.existencia} onChange={e => form.setExistencia(e.target.value === '' ? '' : Number(e.target.value))} required className="rounded-full h-11 text-center" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground ml-1">Mínimo sugerido</Label>
                    <Input type="number" value={form.existenciaMinima} onChange={e => form.setExistenciaMinima(e.target.value === '' ? '' : Number(e.target.value))} className="rounded-full h-11 text-center" />
                  </div>
                </div>
              </div>

              {/* Sección Preparaciones */}
              <div className="space-y-6 pt-4">
                <h3 className="font-bold text-xs border-b pb-2 text-primary uppercase tracking-widest flex items-center gap-2">
                  <Utensils className="h-4 w-4" /> Preparaciones y Recetas
                </h3>
                
                <div className="space-y-4 p-5 rounded-2xl bg-muted/20 border border-muted/40 shadow-sm">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest border-l-2 border-primary/40 pl-2">
                    {idxEdicionPrep !== null ? 'Editando preparación' : 'Añadir nueva variante'}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold ml-1">Nombre</Label>
                      <Input placeholder="Ej: Con clamato" value={nuevaPrep.nombre} onChange={e => setNuevaPrep(p => ({...p, nombre: e.target.value}))} className="rounded-full h-9 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold ml-1">Precio venta</Label>
                      <Input type="number" placeholder="Q0.00" value={nuevaPrep.precioVenta} onChange={e => setNuevaPrep(p => ({...p, precioVenta: e.target.value === '' ? '' : Number(e.target.value)}))} className="rounded-full h-9 text-xs text-center" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold ml-1">Ingredientes que descuenta</Label>
                    <div className="flex gap-2">
                      <Select value={ingSelecId} onValueChange={setIngSelecId}>
                        <SelectTrigger className="rounded-full h-9 text-xs flex-1"><SelectValue placeholder="Producto..." /></SelectTrigger>
                        <SelectContent className="font-body">
                          {productosParaIngredientes.map(p => <SelectItem key={p.docId} value={p.docId}>{p.nombre}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Input type="number" className="w-16 rounded-full h-9 text-center text-xs" value={cantIng} onChange={e => setCantIng(e.target.value === '' ? '' : Number(e.target.value))} />
                      <Button type="button" size="icon" onClick={anadirIngrediente} className="h-9 w-9 rounded-full shrink-0"><PlusCircle className="h-4 w-4"/></Button>
                    </div>
                  </div>

                  {nuevaPrep.ingredientes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {nuevaPrep.ingredientes.map((ing, i) => (
                        <Badge key={i} variant="secondary" className="rounded-full h-6 pl-2 pr-1 gap-1 text-[10px] font-medium bg-background border-muted/60">
                          {ing.nombreProducto} x {ing.cantidad}
                          <Button type="button" variant="ghost" className="h-4 w-4 p-0 rounded-full hover:bg-destructive/10 text-destructive" onClick={() => setNuevaPrep(p => ({...p, ingredientes: p.ingredientes.filter((_, idx) => idx !== i)}))}>
                            <X className="h-2.5 w-2.5" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button type="button" className="flex-1 rounded-full h-9 text-xs font-bold" onClick={anadirOActualizarPrep}>
                      {idxEdicionPrep !== null ? <><Edit className="mr-2 h-3.5 w-3.5"/>Actualizar</> : <><PlusCircle className="mr-2 h-3.5 w-3.5"/>Añadir Variante</>}
                    </Button>
                    {idxEdicionPrep !== null && (
                      <Button type="button" variant="outline" onClick={resetFormPrep} className="rounded-full h-9 text-xs font-bold">Cancelar</Button>
                    )}
                  </div>
                </div>

                {form.preparaciones.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Listado de variantes</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {form.preparaciones.map((prep, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-background border border-muted/40 rounded-xl shadow-sm">
                          <div>
                            <p className="font-bold text-sm text-primary">{prep.nombre}</p>
                            <p className="text-[10px] font-black text-muted-foreground uppercase">Q{prep.precioVenta.toFixed(2)}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => { setIdxEdicionPrep(idx); setNuevaPrep({ nombre: prep.nombre, precioVenta: prep.precioVenta, ingredientes: prep.ingredientes || [] }); }}>
                              <Edit className="h-3.5 w-3.5"/>
                            </Button>
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive" onClick={() => form.setPreparaciones(form.preparaciones.filter((_, i) => i !== idx))}>
                              <Trash2 className="h-3.5 w-3.5"/>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-4 bg-background shrink-0 flex-col-reverse sm:flex-row sm:justify-between gap-3">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="w-full sm:w-auto rounded-full h-11 px-8 font-semibold">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={procesando} className="w-full sm:w-auto rounded-full h-11 px-10 font-bold shadow-lg shadow-primary/20">
              {procesando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {editando ? "Actualizar catálogo" : "Guardar producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
