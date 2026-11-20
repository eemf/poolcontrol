'use client';

import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, PlusCircle, Utensils, Trash2, Edit, X, MapPin, Package, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
    ubicacion: string; setUbicacion: (v: string) => void;
    preparaciones: Preparacion[]; setPreparaciones: (v: Preparacion[]) => void;
  };
  productosParaIngredientes: (Producto & { docId: string })[];
  ubicacionesDisponibles: string[];
  onAgregarUbicacion: (nombre: string) => Promise<void>;
  onEliminarUbicacion: (nombre: string) => Promise<void>;
}

export function ModalProducto({
  abierto,
  onClose,
  editando,
  onSubmit,
  procesando,
  form,
  productosParaIngredientes,
  ubicacionesDisponibles,
  onAgregarUbicacion,
  onEliminarUbicacion
}: ModalProductoProps) {
  const [nuevaPrep, setNuevaPrep] = useState({ nombre: '', precioVenta: '' as number | '', ingredientes: [] as Ingrediente[] });
  const [idxEdicionPrep, setIdxEdicionPrep] = useState<number | null>(null);
  const [ingSelecId, setIngSelecId] = useState('');
  const [cantIng, setCantIng] = useState<number | ''>(1);
  const [agregandoUbicacion, setAgregandoUbicacion] = useState(false);
  const [nuevaUbicacion, setNuevaUbicacion] = useState('');

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
      <DialogContent className="sm:max-w-xl bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 rounded-2xl p-5 sm:p-6 shadow-2xl font-body flex flex-col max-h-[90vh]">
        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 gap-4">
          <DialogHeader className="shrink-0">
            <div className="flex items-center gap-3 pr-6">
              <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0">
                <DialogTitle className="font-headline text-lg font-bold text-slate-100 leading-tight truncate">
                  {editando ? "Editar Producto" : "Nuevo Producto"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5 truncate">
                  Configura los datos base y preparaciones del producto.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 space-y-4 p-1">
            {/* Sección Datos Base */}
            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="nombre" className="text-xs font-medium ml-1 text-slate-200 block">
                  Nombre del producto*
                </Label>
                <Input
                  id="nombre"
                  value={form.nombre}
                  onChange={e => form.setNombre(e.target.value)}
                  onClick={e => e.currentTarget.select()}
                  placeholder="Ej: Coca-Cola 600ml"
                  required
                  className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="precioCompra" className="text-xs font-medium ml-1 text-slate-200 block">
                    Precio compra
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400 text-xs font-bold pointer-events-none">
                      Q
                    </span>
                    <Input
                      id="precioCompra"
                      type="number"
                      value={form.precioCompra}
                      onChange={e => form.setPrecioCompra(e.target.value === '' ? '' : Number(e.target.value))}
                      onClick={e => e.currentTarget.select()}
                      step="0.01"
                      placeholder="0.00"
                      className="rounded-full h-10 px-8 text-center font-bold text-sm tabular-nums bg-[#252526] border-[#2e2e2e] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="precioVenta" className="text-xs font-medium ml-1 text-slate-200 block">
                    Precio venta*
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400 text-xs font-bold pointer-events-none">
                      Q
                    </span>
                    <Input
                      id="precioVenta"
                      type="number"
                      value={form.precioVenta}
                      onChange={e => form.setPrecioVenta(e.target.value === '' ? '' : Number(e.target.value))}
                      onClick={e => e.currentTarget.select()}
                      required
                      step="0.01"
                      placeholder="0.00"
                      className="rounded-full h-10 px-8 text-center font-bold text-sm tabular-nums text-sky-400 bg-[#252526] border-[#2e2e2e] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="existencia" className="text-xs font-medium ml-1 text-slate-200 block">
                    Existencia*
                  </Label>
                  <Input
                    id="existencia"
                    type="number"
                    value={form.existencia}
                    onChange={e => form.setExistencia(e.target.value === '' ? '' : Number(e.target.value))}
                    onClick={e => e.currentTarget.select()}
                    required
                    placeholder="0"
                    className="rounded-full h-10 text-center font-bold text-sm tabular-nums bg-[#252526] border-[#2e2e2e] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="existenciaMinima" className="text-xs font-medium ml-1 text-slate-200 block">
                    Mínimo sugerido
                  </Label>
                  <Input
                    id="existenciaMinima"
                    type="number"
                    value={form.existenciaMinima}
                    onChange={e => form.setExistenciaMinima(e.target.value === '' ? '' : Number(e.target.value))}
                    onClick={e => e.currentTarget.select()}
                    placeholder="0"
                    className="rounded-full h-10 text-center font-bold text-sm tabular-nums bg-[#252526] border-[#2e2e2e] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              {/* Ubicación / Organización física */}
              <div className="space-y-1.5">
                <Label htmlFor="ubicacion" className="text-xs font-medium ml-1 text-slate-200 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-sky-400" /> Ubicación / Almacenamiento
                </Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={form.ubicacion || '__none__'}
                    onValueChange={(val) => form.setUbicacion(val === '__none__' ? '' : val)}
                  >
                    <SelectTrigger id="ubicacion" className="flex-1 rounded-full h-10 bg-[#252526] border-[#2e2e2e] hover:bg-[#313131] text-sm">
                      <SelectValue placeholder="Seleccionar ubicación..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 font-body">
                      <SelectItem value="__none__" className="text-xs text-slate-400">Sin asignar</SelectItem>
                      {ubicacionesDisponibles.map((u) => (
                        <SelectItem key={u} value={u} className="text-xs">{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setAgregandoUbicacion((prev) => !prev)}
                    className="rounded-full h-10 px-3.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shrink-0"
                    title="Agregar nueva ubicación"
                  >
                    <PlusCircle className="h-4 w-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">Agregar</span>
                  </Button>

                  {form.ubicacion && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => onEliminarUbicacion(form.ubicacion)}
                      className="h-10 w-10 rounded-full bg-rose-500/15 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/25 shrink-0"
                      title={`Eliminar "${form.ubicacion}" del listado`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {agregandoUbicacion && (
                  <div className="flex items-center gap-2 pt-1.5 animate-in fade-in duration-150">
                    <Input
                      placeholder="Nombre de nueva ubicación..."
                      value={nuevaUbicacion}
                      onChange={e => setNuevaUbicacion(e.target.value)}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (!nuevaUbicacion.trim()) return;
                          await onAgregarUbicacion(nuevaUbicacion);
                          setNuevaUbicacion('');
                          setAgregandoUbicacion(false);
                        }
                      }}
                      className="flex-1 rounded-full h-9 text-xs bg-[#252526] border-[#2e2e2e]"
                      autoFocus
                    />
                    <Button
                      type="button"
                      size="icon"
                      onClick={async () => {
                        if (!nuevaUbicacion.trim()) return;
                        await onAgregarUbicacion(nuevaUbicacion);
                        setNuevaUbicacion('');
                        setAgregandoUbicacion(false);
                      }}
                      className="h-9 w-9 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
                      title="Guardar ubicación"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setNuevaUbicacion('');
                        setAgregandoUbicacion(false);
                      }}
                      className="h-9 w-9 rounded-full bg-[#252526] hover:bg-[#313131] text-slate-300 border border-[#2e2e2e] shrink-0"
                      title="Cancelar"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Sección Preparaciones */}
            <div className="space-y-3 pt-2 border-t border-[#2e2e2e]">
              <h3 className="font-semibold text-xs text-sky-400 flex items-center gap-1.5">
                <Utensils className="h-3.5 w-3.5" /> Preparaciones y Recetas
              </h3>

              <div className="space-y-3 p-3.5 rounded-xl bg-[#252526] border border-[#2e2e2e]">
                <p className="text-xs font-semibold text-slate-300">
                  {idxEdicionPrep !== null ? 'Editando preparación' : 'Añadir nueva variante'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-slate-300 ml-1">Nombre</Label>
                    <Input
                      placeholder="Ej: Con clamato"
                      value={nuevaPrep.nombre}
                      onChange={e => setNuevaPrep(p => ({ ...p, nombre: e.target.value }))}
                      onClick={e => e.currentTarget.select()}
                      className="rounded-full h-9 text-xs bg-[#1e1e1e] border-[#2e2e2e]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-slate-300 ml-1">Precio venta</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400 text-[11px] font-bold pointer-events-none">
                        Q
                      </span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={nuevaPrep.precioVenta}
                        onChange={e => setNuevaPrep(p => ({ ...p, precioVenta: e.target.value === '' ? '' : Number(e.target.value) }))}
                        onClick={e => e.currentTarget.select()}
                        className="rounded-full h-9 px-7 text-xs text-center font-bold bg-[#1e1e1e] border-[#2e2e2e] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-medium text-slate-300 ml-1">Ingredientes que descuenta</Label>
                  <div className="flex gap-2">
                    <Select value={ingSelecId} onValueChange={setIngSelecId}>
                      <SelectTrigger className="rounded-full h-9 text-xs flex-1 bg-[#1e1e1e] border-[#2e2e2e] hover:bg-[#313131]">
                        <SelectValue placeholder="Producto..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 font-body">
                        {productosParaIngredientes.map(p => (
                          <SelectItem key={p.docId} value={p.docId} className="text-xs">{p.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      className="w-16 rounded-full h-9 text-center text-xs bg-[#1e1e1e] border-[#2e2e2e] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={cantIng}
                      onChange={e => setCantIng(e.target.value === '' ? '' : Number(e.target.value))}
                      onClick={e => e.currentTarget.select()}
                    />
                    <Button
                      type="button"
                      size="icon"
                      onClick={anadirIngrediente}
                      className="h-9 w-9 rounded-full shrink-0 bg-sky-600 hover:bg-sky-500 text-white"
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {nuevaPrep.ingredientes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {nuevaPrep.ingredientes.map((ing, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="rounded-full h-6 pl-2.5 pr-1 gap-1 text-[11px] font-medium bg-[#1e1e1e] text-slate-200 border border-[#2e2e2e]"
                      >
                        {ing.nombreProducto} x {ing.cantidad}
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-4 w-4 p-0 rounded-full hover:bg-rose-500/20 text-rose-400"
                          onClick={() => setNuevaPrep(p => ({ ...p, ingredientes: p.ingredientes.filter((_, idx) => idx !== i) }))}
                        >
                          <X className="h-2.5 w-2.5" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    className="flex-1 rounded-full h-9 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white"
                    onClick={anadirOActualizarPrep}
                  >
                    {idxEdicionPrep !== null ? (
                      <><Edit className="mr-1.5 h-3.5 w-3.5" />Actualizar</>
                    ) : (
                      <><PlusCircle className="mr-1.5 h-3.5 w-3.5" />Añadir Variante</>
                    )}
                  </Button>
                  {idxEdicionPrep !== null && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={resetFormPrep}
                      className="rounded-full h-9 px-4 text-xs font-medium bg-[#1e1e1e] hover:bg-[#313131] text-slate-200 border border-[#2e2e2e]"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>

              {form.preparaciones.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-300 ml-1">Listado de variantes</Label>
                  <div className="rounded-xl border border-[#2e2e2e] bg-[#252526] divide-y divide-[#2e2e2e] overflow-hidden">
                    {form.preparaciones.map((prep, idx) => (
                      <div key={idx} className="flex items-center justify-between px-3 py-2.5">
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-xs sm:text-sm text-slate-100 truncate">{prep.nombre}</p>
                          <p className="text-xs font-bold text-sky-400 tabular-nums">Q{prep.precioVenta.toFixed(2)}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-slate-300 hover:bg-[#313131] hover:text-white"
                            onClick={() => {
                              setIdxEdicionPrep(idx);
                              setNuevaPrep({ nombre: prep.nombre, precioVenta: prep.precioVenta, ingredientes: prep.ingredientes || [] });
                            }}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-rose-500/15 text-rose-400 hover:bg-rose-600 hover:text-white"
                            onClick={() => form.setPreparaciones(form.preparaciones.filter((_, i) => i !== idx))}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2 shrink-0 flex-row items-center justify-between sm:justify-between gap-2 sm:space-x-0">
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="rounded-full h-9 px-5 text-xs font-medium bg-[#252526] hover:bg-[#313131] text-slate-200 border border-[#2e2e2e]"
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={procesando}
              className="rounded-full h-9 px-6 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md"
            >
              {procesando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {editando ? "Actualizar catálogo" : "Guardar producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
