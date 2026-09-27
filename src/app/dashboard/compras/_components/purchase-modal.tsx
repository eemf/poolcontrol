'use client';

import { useState, useMemo, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { Badge } from "@/components/ui/badge";
import { Loader2, PlusCircle, Trash2, ShoppingCart, Save } from "lucide-react";
import type { ItemCompra, Cliente, Producto } from "@/lib/tipos";

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

  useEffect(() => {
    if (productoSeleccionadoId && !isGastoManualMode) {
      const producto = productos.find(p => p.docId === productoSeleccionadoId);
      if (producto) setCostoUnitario(producto.precioCompra ?? "");
    } else {
      setCostoUnitario("");
    }
  }, [productoSeleccionadoId, productos, isGastoManualMode]);

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
      <DialogContent className="max-w-4xl w-full rounded-3xl overflow-hidden p-0 border-none shadow-2xl font-body flex flex-col max-h-[90vh]">
        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <DialogHeader className="p-8 pb-4 bg-background shrink-0 space-y-1">
            <DialogTitle className="font-headline text-2xl font-bold tracking-tight">{isEditing ? 'Editar Compra' : 'Nueva Compra'}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">Añade los detalles para actualizar el inventario.</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="px-8 py-4 space-y-10">
              {/* Sección Proveedor y Total */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-6">
                <div className="w-full sm:w-1/2 space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground ml-1">Proveedor autorizado</Label>
                  <AutocompleteInput
                    placeholder="Buscar proveedor..."
                    options={proveedorOptions}
                    value={proveedorSeleccionadoId}
                    onValueChange={setProveedorSeleccionadoId}
                    onCreateNew={onCrearProveedor}
                    onEnterKey={() => focusAndSelect(cantidadInputRef)}
                    className="rounded-full h-12 border-muted-foreground/20 bg-muted/5 focus:bg-background transition-all"
                  />
                </div>
                <div className="text-left sm:text-right bg-primary/5 p-5 rounded-3xl border border-primary/10 min-w-[200px]">
                  <p className="text-[11px] font-bold text-primary mb-1">Monto total</p>
                  <p className="text-4xl font-black text-primary">Q{montoTotal.toFixed(2)}</p>
                </div>
              </div>

              {/* Sección de entrada de artículos */}
              <div className="space-y-4">
                <Label className="text-[11px] font-bold text-muted-foreground ml-1">Agregar artículos</Label>
                <div className="flex flex-col lg:flex-row items-end gap-3 bg-muted/10 p-5 rounded-[2rem] border border-muted/40 shadow-sm">
                  <div className="flex items-end gap-3 w-full sm:w-auto">
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
                        className="text-center rounded-full h-11 border-muted-foreground/20 bg-background"
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
                        className="rounded-full h-11 border-muted-foreground/20 bg-background"
                      />
                    ) : (
                      <AutocompleteInput
                        placeholder="Buscar producto..."
                        options={productoOptions}
                        value={productoSeleccionadoId}
                        onValueChange={setProductoSeleccionadoId}
                        ref={productoInputRef}
                        onEnterKey={() => focusAndSelect(costoUnitarioInputRef)}
                        className="rounded-full h-11 border-muted-foreground/20 bg-background"
                      />
                    )}
                  </div>
                  <div className="w-full sm:w-auto space-y-1">
                    <Label htmlFor="costoUnitario" className="text-[10px] font-bold ml-1 text-muted-foreground">P. unit.</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground text-xs font-bold">Q</span>
                      <Input
                        id="costoUnitario"
                        ref={costoUnitarioInputRef}
                        type="number"
                        className="w-full sm:w-32 pl-8 rounded-full h-11 font-bold border-muted-foreground/20 bg-background"
                        placeholder="0.00"
                        value={costoUnitario}
                        onChange={(e) => setCostoUnitario(e.target.value === '' ? '' : Number(e.target.value))}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItemButtonRef.current?.focus(); } }}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <Button type="button" ref={addItemButtonRef} onClick={handleAddItem} className="w-full lg:w-auto rounded-full h-11 px-8 font-bold shadow-lg shadow-primary/20">
                    <PlusCircle className="mr-2 h-4 w-4" /> Añadir
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge variant="outline" className="text-[10px] font-bold bg-background">F6: Alternar modo</Badge>
                    <p className="text-[10px] font-medium text-muted-foreground opacity-70">Usa F6 para cambiar entre producto y gasto libre</p>
                </div>
              </div>

              {/* Listado de ítems cargados */}
              <div className="space-y-4">
                <Label className="text-[11px] font-bold text-muted-foreground ml-1">Artículos en esta compra</Label>
                <div className="min-h-[200px] border border-muted/60 rounded-[2rem] p-3 bg-background shadow-inner">
                  {itemsEnCompra.length > 0 ? (
                    <div className="space-y-2">
                      {itemsEnCompra.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted/20 p-4 rounded-2xl text-sm transition-colors hover:bg-muted/30 group">
                          <div className="min-w-0 flex-1 pr-4">
                            <p className="font-bold text-foreground truncate text-base">{item.nombreProducto}</p>
                            {item.tipo === 'producto' ? (
                              <p className="text-[10px] text-muted-foreground font-medium">{item.cantidad} unidades &times; Q{(item.costoUnitario).toFixed(2)}</p>
                            ) : (
                              <Badge className="bg-indigo-500/10 text-indigo-600 border-none font-bold text-[9px] h-5 rounded-full">Gasto directo</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-6 shrink-0">
                            <p className="font-black text-foreground text-lg tabular-nums">Q{(item.cantidad * item.costoUnitario).toFixed(2)}</p>
                            <Button type="button" size="icon" variant="ghost" className="h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setItemsEnCompra(itemsEnCompra.filter((_, i) => i !== index))}>
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full py-16 opacity-30">
                      <ShoppingCart className="h-16 w-16 mb-4" />
                      <p className="font-bold text-base">El carrito está vacío</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 bg-background shrink-0 flex-col-reverse sm:flex-row sm:justify-between gap-4">
            <Button type="button" variant="outline" className="rounded-full h-12 px-10 font-bold" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading || itemsEnCompra.length === 0} className="rounded-full h-12 px-12 font-bold text-sm shadow-xl shadow-primary/20">
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              {isEditing ? 'Actualizar Compra' : 'Finalizar Registro'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
