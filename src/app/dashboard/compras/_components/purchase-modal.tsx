'use client';

import { useState, useMemo, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { Badge } from "@/components/ui/badge";
import { Loader2, PlusCircle, Trash2, ShoppingCart, Save, History, Calendar, Tag } from "lucide-react";
import type { ItemCompra, Cliente, Producto, Compra } from "@/lib/tipos";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const toDate = (fecha: any): Date => {
  if (!fecha) return new Date();
  if (typeof fecha?.toDate === 'function') return fecha.toDate();
  if (fecha instanceof Date) return fecha;
  if (typeof fecha === 'string' || typeof fecha === 'number') {
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
};

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  // State from parent
  proveedorSeleccionadoId: string;
  setProveedorSeleccionadoId: (val: string) => void;
  itemsEnCompra: ItemCompra[];
  setItemsEnCompra: (items: ItemCompra[]) => void;
  // Lookups
  proveedorOptions: { value: string; label: string }[];
  productoOptions: { value: string; label: string; description?: string }[];
  productos: (Producto & { docId: string })[];
  compras?: (Compra & { docId: string })[];
  editingCompraId?: string;
  onCrearProveedor: (nombre: string) => Promise<string | null | undefined | void>;
}

export function PurchaseModal({
  isOpen,
  onClose,
  isEditing,
  onSubmit,
  loading,
  proveedorSeleccionadoId,
  setProveedorSeleccionadoId,
  itemsEnCompra,
  setItemsEnCompra,
  proveedorOptions,
  productoOptions,
  productos,
  compras,
  editingCompraId,
  onCrearProveedor
}: PurchaseModalProps) {
  const [isGastoManualMode, setIsGastoManualMode] = useState(false);
  const [gastoManualNombre, setGastoManualNombre] = useState('');
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState('');
  const [cantidad, setCantidad] = useState<number | "">(1);
  const [costoUnitario, setCostoUnitario] = useState<number | "">("");

  const cantidadInputRef = useRef<HTMLInputElement>(null);
  const productoInputRef = useRef<HTMLInputElement>(null);
  const gastoManualInputRef = useRef<HTMLInputElement>(null);
  const costoUnitarioInputRef = useRef<HTMLInputElement>(null);
  const addItemButtonRef = useRef<HTMLButtonElement>(null);

  const montoTotal = useMemo(() => {
    return itemsEnCompra.reduce((total, item) => total + (item.costoUnitario * item.cantidad), 0);
  }, [itemsEnCompra]);

  // Historial de compras previas para el producto y proveedor seleccionados
  const historialCompras = useMemo(() => {
    if (!productoSeleccionadoId || isGastoManualMode || !compras || !proveedorSeleccionadoId) return [];

    const list: {
      idCompra: number;
      fecha: Date;
      costoUnitario: number;
      cantidad: number;
    }[] = [];

    for (const c of compras) {
      if (editingCompraId && c.docId === editingCompraId) continue;
      // Solo compras con el proveedor seleccionado
      if (c.proveedorId !== proveedorSeleccionadoId) continue;
      
      const item = c.items?.find(
        (i) => i.tipo === 'producto' && i.productoId === productoSeleccionadoId
      );

      if (item && item.costoUnitario !== undefined && item.costoUnitario !== null) {
        list.push({
          idCompra: c.idCompra,
          fecha: toDate(c.fecha),
          costoUnitario: item.costoUnitario,
          cantidad: item.cantidad,
        });
      }
    }

    return list.slice(0, 5);
  }, [productoSeleccionadoId, isGastoManualMode, compras, editingCompraId, proveedorSeleccionadoId]);

  // Al seleccionar un producto en el menú, autocompletar con el último precio de compra registrado
  useEffect(() => {
    if (productoSeleccionadoId && !isGastoManualMode) {
      if (historialCompras.length > 0) {
        setCostoUnitario(historialCompras[0].costoUnitario);
      } else {
        const producto = productos.find(p => p.docId === productoSeleccionadoId);
        setCostoUnitario(producto?.precioCompra ?? "");
      }
    } else if (!isGastoManualMode) {
      setCostoUnitario("");
    }
  }, [productoSeleccionadoId, isGastoManualMode, historialCompras, productos]);

  const focusAndSelect = (ref: React.RefObject<HTMLInputElement | null>) => {
    setTimeout(() => {
      ref.current?.focus();
      ref.current?.select();
    }, 0);
  };

  const handleAddItem = () => {
    if (isGastoManualMode) {
      if (!gastoManualNombre || costoUnitario === "" || Number(costoUnitario) <= 0) return;
      setItemsEnCompra([...itemsEnCompra, { tipo: 'gasto', nombreProducto: gastoManualNombre, cantidad: 1, costoUnitario: Number(costoUnitario) }]);
    } else {
      if (!productoSeleccionadoId || !cantidad || Number(cantidad) <= 0 || costoUnitario === "" || Number(costoUnitario) < 0) return;
      const prod = productos.find(p => p.docId === productoSeleccionadoId);
      if (!prod) return;
      setItemsEnCompra([...itemsEnCompra, { tipo: 'producto', productoId: prod.docId, nombreProducto: prod.nombre, cantidad: Number(cantidad), costoUnitario: Number(costoUnitario) }]);
    }
    setProductoSeleccionadoId(''); setGastoManualNombre(''); setCantidad(1); setCostoUnitario(""); setIsGastoManualMode(false);
    focusAndSelect(cantidadInputRef);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F6' && isOpen) {
        event.preventDefault();
        setIsGastoManualMode(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isGastoManualMode) focusAndSelect(gastoManualInputRef);
    else focusAndSelect(productoInputRef);
  }, [isGastoManualMode]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full rounded-2xl overflow-hidden p-0 border border-border/40 shadow-2xl font-body flex flex-col max-h-[92vh]">
        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2 bg-background shrink-0 space-y-0.5">
            <DialogTitle className="font-headline text-xl font-bold tracking-tight">{isEditing ? 'Editar Compra' : 'Nueva Compra'}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">Añade los detalles para actualizar el inventario.</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-3 space-y-3.5">
              {/* Sección Proveedor y Total (a la par, sin contenedor) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 max-w-lg">
                  <AutocompleteInput
                    placeholder="Buscar proveedor..."
                    options={proveedorOptions}
                    value={proveedorSeleccionadoId}
                    onValueChange={setProveedorSeleccionadoId}
                    onCreateNew={onCrearProveedor}
                    onEnterKey={() => focusAndSelect(cantidadInputRef)}
                    className="rounded-full h-11 text-sm border-muted-foreground/20 bg-muted/5 focus:bg-background transition-all"
                  />
                </div>
                <div className="flex items-baseline gap-2 shrink-0 sm:text-right">
                  <span className="text-xs font-semibold text-muted-foreground">Monto Total:</span>
                  <span className="text-2xl font-black text-primary tabular-nums">Q{montoTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Sección de entrada de artículos */}
              <div className="space-y-1">
                <div className="bg-muted/10 p-3.5 sm:p-4 rounded-xl border border-muted/40 shadow-sm space-y-2.5">
                  <div className="flex flex-col lg:flex-row items-end gap-2.5">
                    <div className="flex items-end gap-2.5 w-full sm:w-auto">
                      <div className="flex-1 sm:w-24">
                        <Label htmlFor="cantidad" className="text-[10px] font-bold ml-1 text-muted-foreground">Cant.</Label>
                        <Input
                          id="cantidad"
                          ref={cantidadInputRef}
                          type="number"
                          placeholder="1"
                          value={cantidad}
                          onChange={(e) => setCantidad(e.target.value === '' ? '' : Number(e.target.value))}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (isGastoManualMode) focusAndSelect(gastoManualInputRef); else focusAndSelect(productoInputRef); } }}
                          min="1"
                          className="text-center rounded-full h-11 border-muted-foreground/20 bg-background text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <div className="lg:hidden flex flex-col items-center space-y-1 pb-1">
                        <Label className="text-[10px] font-bold text-muted-foreground">Gasto</Label>
                        <Switch checked={isGastoManualMode} onCheckedChange={setIsGastoManualMode} />
                      </div>
                    </div>

                    <div className="flex-grow space-y-1 w-full">
                      <Label className="text-[10px] font-bold ml-1 text-muted-foreground">Producto o concepto de gasto</Label>
                      {isGastoManualMode ? (
                        <Input
                          ref={gastoManualInputRef}
                          placeholder="Describir gasto manual..."
                          value={gastoManualNombre}
                          onChange={(e) => setGastoManualNombre(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); focusAndSelect(costoUnitarioInputRef); } }}
                          className="rounded-full h-11 border-muted-foreground/20 bg-background text-sm"
                        />
                      ) : (
                        <AutocompleteInput
                          placeholder="Buscar producto..."
                          options={productoOptions}
                          value={productoSeleccionadoId}
                          onValueChange={setProductoSeleccionadoId}
                          ref={productoInputRef}
                          onEnterKey={() => focusAndSelect(costoUnitarioInputRef)}
                          className="rounded-full h-11 border-muted-foreground/20 bg-background text-sm"
                        />
                      )}
                    </div>
                    <div className="w-full sm:w-auto space-y-1">
                      <Label htmlFor="costoUnitario" className="text-[10px] font-bold ml-1 text-muted-foreground">P. unit.</Label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground text-xs font-bold">Q</span>
                        <Input
                          id="costoUnitario"
                          ref={costoUnitarioInputRef}
                          type="number"
                          className="w-full sm:w-28 pl-8 rounded-full h-11 font-bold border-muted-foreground/20 bg-background text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="0.00"
                          value={costoUnitario}
                          onChange={(e) => setCostoUnitario(e.target.value === '' ? '' : Number(e.target.value))}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItemButtonRef.current?.focus(); } }}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <Button type="button" ref={addItemButtonRef} onClick={handleAddItem} className="w-full lg:w-auto rounded-full h-11 px-8 font-bold shadow-md shadow-primary/20 shrink-0">
                      <PlusCircle className="mr-1.5 h-4 w-4" /> Añadir
                    </Button>
                  </div>

                  {/* Historial de precios compacto dentro del mismo contenedor */}
                  {productoSeleccionadoId && !isGastoManualMode && (
                    <div className="pt-2 border-t border-muted/30 flex flex-wrap items-center gap-1.5 animate-in fade-in duration-200">
                      <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                        <History className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-[11px] font-semibold text-foreground">
                          Historial del proveedor:
                        </span>
                      </div>

                      {historialCompras.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {historialCompras.map((item, idx) => {
                            const isSelected = costoUnitario !== "" && Number(costoUnitario) === item.costoUnitario;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setCostoUnitario(item.costoUnitario);
                                  focusAndSelect(costoUnitarioInputRef);
                                }}
                                title={`Aplicar Q${item.costoUnitario.toFixed(2)} (${item.cantidad} uds el ${format(item.fecha, "dd/MM/yyyy")})`}
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all cursor-pointer",
                                  isSelected
                                    ? "bg-primary text-primary-foreground border-primary shadow-sm ring-1 ring-primary/40 font-bold"
                                    : "bg-background/80 hover:bg-background border-muted/60 hover:border-primary/40 text-foreground"
                                )}
                              >
                                <span className={cn("text-xs font-black", isSelected ? "text-white" : "text-primary")}>
                                  Q{item.costoUnitario.toFixed(2)}
                                </span>
                                <span className={cn("text-[10px]", isSelected ? "text-primary-foreground/90" : "text-muted-foreground")}>
                                  {format(item.fecha, "dd/MM/yy")}
                                </span>
                                {idx === 0 && (
                                  <span className={cn(
                                    "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                                    isSelected ? "bg-white/25 text-white" : "bg-primary/10 text-primary"
                                  )}>
                                    Última
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Tag className="h-3 w-3 opacity-60" />
                          {proveedorSeleccionadoId
                            ? "Sin compras previas de este producto con este proveedor."
                            : "Selecciona un proveedor para consultar su historial de precios."}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[9px] font-bold bg-background rounded-full py-0.5 px-2">F6: Alternar modo</Badge>
                    <p className="text-[10px] font-medium text-muted-foreground opacity-70">Usa F6 para cambiar entre producto y gasto libre</p>
                </div>
              </div>

              {/* Listado de ítems cargados */}
              <div className="space-y-1">
                <div className="min-h-[140px] max-h-[220px] overflow-y-auto border border-muted/50 rounded-xl p-2 bg-background shadow-inner">
                  {itemsEnCompra.length > 0 ? (
                    <div className="space-y-1.5">
                      {itemsEnCompra.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted/20 hover:bg-muted/30 p-2.5 sm:px-3 rounded-lg text-sm transition-colors group">
                          <div className="min-w-0 flex-1 pr-3">
                            <p className="font-bold text-foreground truncate text-sm">{item.nombreProducto}</p>
                            {item.tipo === 'producto' ? (
                              <p className="text-[10px] text-muted-foreground font-medium">{item.cantidad} unidades &times; Q{(item.costoUnitario).toFixed(2)}</p>
                            ) : (
                              <Badge className="bg-indigo-500/10 text-indigo-600 border-none font-bold text-[9px] h-4 rounded">Gasto directo</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <p className="font-black text-foreground text-sm tabular-nums">Q{(item.cantidad * item.costoUnitario).toFixed(2)}</p>
                            <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setItemsEnCompra(itemsEnCompra.filter((_, i) => i !== index))}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-8 opacity-40">
                      <ShoppingCart className="h-10 w-10 mb-2" />
                      <p className="font-semibold text-sm">El carrito está vacío</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-background shrink-0 flex-col-reverse sm:flex-row sm:justify-between gap-3">
            <Button type="button" variant="outline" className="rounded-full h-11 px-8 font-semibold" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading || itemsEnCompra.length === 0} className="rounded-full h-11 px-10 font-bold text-sm shadow-md shadow-primary/20">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isEditing ? 'Actualizar Compra' : 'Finalizar Registro'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
