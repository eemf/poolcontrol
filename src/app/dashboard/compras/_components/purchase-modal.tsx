'use client';

import { useState, useMemo, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { Badge } from "@/components/ui/badge";
import { SurfaceCard } from "@/components/comunes";
import { Loader2, PlusCircle, Trash2, ShoppingCart, Save, History, Tag, Truck, Search } from "lucide-react";
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
  const [isAddingItem, setIsAddingItem] = useState(false);

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
    }, 20);
  };

  const handleAddItem = () => {
    if (isAddingItem || controlsDisabled) return;
    if (isGastoManualMode) {
      if (!gastoManualNombre.trim()) {
        focusAndSelect(gastoManualInputRef);
        return;
      }
      if (costoUnitario === "" || Number(costoUnitario) <= 0) {
        focusAndSelect(costoUnitarioInputRef);
        return;
      }
      setItemsEnCompra([...itemsEnCompra, { tipo: 'gasto', nombreProducto: gastoManualNombre.trim(), cantidad: 1, costoUnitario: Number(costoUnitario) }]);
    } else {
      if (!cantidad || Number(cantidad) <= 0) {
        focusAndSelect(cantidadInputRef);
        return;
      }
      if (!productoSeleccionadoId) {
        focusAndSelect(productoInputRef);
        return;
      }
      if (costoUnitario === "" || Number(costoUnitario) < 0) {
        focusAndSelect(costoUnitarioInputRef);
        return;
      }
      const prod = productos.find(p => p.docId === productoSeleccionadoId);
      if (!prod) {
        focusAndSelect(productoInputRef);
        return;
      }
      setItemsEnCompra([...itemsEnCompra, { tipo: 'producto', productoId: prod.docId, nombreProducto: prod.nombre, cantidad: Number(cantidad), costoUnitario: Number(costoUnitario) }]);
    }
    setIsAddingItem(true);
    setProductoSeleccionadoId(''); setGastoManualNombre(''); setCantidad(1); setCostoUnitario(""); setIsGastoManualMode(false);
    focusAndSelect(cantidadInputRef);
    setTimeout(() => setIsAddingItem(false), 250);
  };

  const controlsDisabled = !proveedorSeleccionadoId;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F6' && isOpen && !controlsDisabled) {
        event.preventDefault();
        setIsGastoManualMode(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, controlsDisabled]);

  const prevGastoModeRef = useRef(isGastoManualMode);
  useEffect(() => {
    if (prevGastoModeRef.current === isGastoManualMode) return;
    prevGastoModeRef.current = isGastoManualMode;
    if (controlsDisabled) return;
    if (isGastoManualMode) focusAndSelect(gastoManualInputRef);
    else focusAndSelect(productoInputRef);
  }, [isGastoManualMode, controlsDisabled]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 rounded-2xl overflow-visible p-5 sm:p-6 shadow-2xl font-body flex flex-col max-h-[90vh]">
        <form onSubmit={onSubmit} className="flex flex-col max-md:flex-none flex-1 min-h-0 overflow-visible gap-4">
          <DialogHeader className="shrink-0">
            <div className="flex items-center gap-3 pr-6">
              <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0">
                <DialogTitle className="font-headline text-lg font-bold text-slate-100 leading-tight truncate">
                  {isEditing ? 'Editar Compra' : 'Nueva Compra'}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5 truncate">
                  Añade los detalles para actualizar el inventario.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col max-md:flex-none flex-1 min-h-0 space-y-3.5">
            {/* Sección Proveedor y Monto Total en la misma fila */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex-1 min-w-0 sm:max-w-lg">
                <AutocompleteInput
                  placeholder="Buscar proveedor..."
                  options={proveedorOptions}
                  value={proveedorSeleccionadoId}
                  onValueChange={(val) => {
                    setProveedorSeleccionadoId(val);
                    if (val) focusAndSelect(cantidadInputRef);
                  }}
                  onCreateNew={onCrearProveedor}
                  onEnterKey={() => focusAndSelect(cantidadInputRef)}
                  onClick={(e) => e.currentTarget.select()}
                  icon={Search}
                  className="shadow-none"
                />
              </div>

              <div className="flex items-baseline justify-center sm:justify-end gap-2 shrink-0 sm:text-right px-1 sm:px-0">
                <span className="text-xs font-medium text-slate-400">Monto Total</span>
                <span className="text-2xl font-bold text-sky-400 tabular-nums leading-tight">
                  Q{montoTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Sección de entrada de artículos (compacta en móvil) */}
            <div className={cn("space-y-2 transition-opacity", controlsDisabled && "opacity-50")}>
              <div className="flex flex-col lg:flex-row items-end gap-2.5">
                <div className="flex items-end gap-2.5 w-full lg:w-auto shrink-0">
                  <div className="flex-1 lg:w-24 space-y-1">
                    <Label htmlFor="cantidad" className="text-xs font-medium ml-1 text-slate-200 block">
                      Cantidad
                    </Label>
                    <Input
                      id="cantidad"
                      ref={cantidadInputRef}
                      type="number"
                      placeholder="1"
                      value={cantidad}
                      onChange={(e) => setCantidad(e.target.value === '' ? '' : Number(e.target.value))}
                      onClick={(e) => e.currentTarget.select()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (isGastoManualMode) focusAndSelect(gastoManualInputRef);
                          else focusAndSelect(productoInputRef);
                        }
                      }}
                      min="1"
                      disabled={controlsDisabled}
                      className="text-center h-10 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="lg:hidden space-y-1 shrink-0">
                    <Label className="text-xs font-medium ml-1 text-slate-200 block">
                      Modo
                    </Label>
                    <div className="flex items-center gap-2 pl-3 pr-1.5 h-10 rounded-full bg-[#252526] border border-[#2e2e2e]">
                      <span className="text-[0.6875rem] font-medium text-slate-300 select-none">
                        {isGastoManualMode ? 'Gasto' : 'Normal'}
                      </span>
                      <Switch
                        checked={isGastoManualMode}
                        onCheckedChange={setIsGastoManualMode}
                        disabled={controlsDisabled}
                        className="data-[state=checked]:bg-sky-600 data-[state=unchecked]:bg-sky-600/30 border border-sky-500/40 [&>span]:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-grow space-y-1 w-full">
                  <Label className="text-xs font-medium ml-1 text-slate-200 block">
                    {isGastoManualMode ? 'Concepto o gasto' : 'Producto'}
                  </Label>
                  {isGastoManualMode ? (
                    <Input
                      ref={gastoManualInputRef}
                      placeholder="Describir gasto manual..."
                      value={gastoManualNombre}
                      onChange={(e) => setGastoManualNombre(e.target.value)}
                      onClick={(e) => e.currentTarget.select()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          focusAndSelect(costoUnitarioInputRef);
                        }
                      }}
                      disabled={controlsDisabled}
                      className="h-10 text-sm"
                    />
                  ) : (
                    <AutocompleteInput
                      placeholder="Buscar producto..."
                      options={productoOptions}
                      value={productoSeleccionadoId}
                      onValueChange={(val) => {
                        setProductoSeleccionadoId(val);
                        if (val) focusAndSelect(costoUnitarioInputRef);
                      }}
                      ref={productoInputRef}
                      onEnterKey={() => focusAndSelect(costoUnitarioInputRef)}
                      onClick={(e) => e.currentTarget.select()}
                      disabled={controlsDisabled}
                      icon={Search}
                    />
                  )}
                </div>

                {/* Precio unitario + Botón Añadir en la misma fila en móvil y escritorio */}
                <div className="flex items-end gap-2.5 w-full lg:w-auto shrink-0">
                  <div className="flex-1 lg:w-28 space-y-1">
                    <Label htmlFor="costoUnitario" className="text-xs font-medium ml-1 text-slate-200 block">
                      Precio
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400 text-xs font-bold pointer-events-none">
                        Q
                      </span>
                      <Input
                        id="costoUnitario"
                        ref={costoUnitarioInputRef}
                        type="number"
                        className="w-full px-8 text-center h-10 font-bold text-sm tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0.00"
                        value={costoUnitario}
                        onChange={(e) => setCostoUnitario(e.target.value === '' ? '' : Number(e.target.value))}
                        onClick={(e) => e.currentTarget.select()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addItemButtonRef.current?.focus();
                          }
                        }}
                        min="0"
                        step="0.01"
                        disabled={controlsDisabled}
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    ref={addItemButtonRef}
                    onClick={handleAddItem}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddItem();
                      }
                    }}
                    disabled={controlsDisabled || isAddingItem}
                    className="rounded-full h-10 px-5 sm:px-6 font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md shrink-0"
                  >
                    {isAddingItem ? (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <PlusCircle className="mr-1.5 h-4 w-4" />
                    )}
                    Añadir
                  </Button>
                </div>
              </div>
              <p className="hidden lg:block text-[0.625rem] text-slate-400 text-center">
                Presiona F6 para alternar entre producto y gasto directo
              </p>

              {/* Historial de precios compacto */}
              {productoSeleccionadoId && !isGastoManualMode && (
                <SurfaceCard variant="surface" className="p-2.5 flex flex-wrap items-center gap-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                    <History className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                    <span className="text-[0.6875rem] font-semibold text-slate-200">
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
                                ? "bg-sky-600 text-white border-sky-500 shadow-sm font-bold"
                                : "bg-[#1e1e1e] hover:bg-[#313131] border-[#2e2e2e] text-slate-200"
                            )}
                          >
                            <span className={cn("text-xs font-bold tabular-nums", isSelected ? "text-white" : "text-sky-400")}>
                              Q{item.costoUnitario.toFixed(2)}
                            </span>
                            <span className={cn("text-[0.625rem]", isSelected ? "text-white/90" : "text-slate-400")}>
                              {format(item.fecha, "dd/MM/yy")}
                            </span>
                            {idx === 0 && (
                              <span className={cn(
                                "text-[0.5625rem] font-bold px-1.5 py-0.5 rounded-full",
                                isSelected ? "bg-white/25 text-white" : "bg-sky-500/15 text-sky-400"
                              )}>
                                Última
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-[0.6875rem] text-slate-400 flex items-center gap-1">
                      <Tag className="h-3 w-3 opacity-60" />
                      {proveedorSeleccionadoId
                        ? "Sin compras previas de este producto con este proveedor."
                        : "Selecciona un proveedor para consultar su historial de precios."}
                    </span>
                  )}
                </SurfaceCard>
              )}
            </div>

            {/* Listado de ítems cargados */}
            <SurfaceCard variant="surface" className="max-h-[220px] overflow-y-auto custom-scrollbar p-2">
              {itemsEnCompra.length > 0 ? (
                <div className="divide-y divide-[#2e2e2e]">
                  {itemsEnCompra.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2.5 px-2 text-sm">
                      <div className="min-w-0 flex-1 pr-3">
                        <p className="font-semibold text-slate-100 truncate text-sm">{item.nombreProducto}</p>
                        {item.tipo === 'producto' ? (
                          <p className="text-xs text-slate-400 tabular-nums">
                            {item.cantidad} unidades &times; Q{item.costoUnitario.toFixed(2)}
                          </p>
                        ) : (
                          <Badge className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold text-[0.625rem] h-5 rounded-full">
                            Gasto directo
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <p className="font-semibold text-slate-100 text-sm tabular-nums">
                          Q{(item.cantidad * item.costoUnitario).toFixed(2)}
                        </p>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          disabled={controlsDisabled}
                          className="h-8 w-8 rounded-full bg-rose-500/15 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/25 transition-colors"
                          onClick={() => setItemsEnCompra(itemsEnCompra.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-7 text-center text-slate-400 gap-2.5">
                  <ShoppingCart className="h-10 w-10 text-slate-500 stroke-[1.75]" />
                  <p className="text-sm font-medium">El carrito está vacío</p>
                </div>
              )}
            </SurfaceCard>
          </div>

          <DialogFooter className="pt-2 shrink-0 flex-row items-center justify-between sm:justify-between gap-2 sm:space-x-0">
            <Button
              type="button"
              variant="secondary"
              className="rounded-full h-9 px-5 text-xs font-medium bg-[#252526] hover:bg-[#313131] text-slate-200 border border-[#2e2e2e]"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || controlsDisabled || itemsEnCompra.length === 0}
              className="rounded-full h-9 px-6 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isEditing ? 'Actualizar Compra' : 'Finalizar Registro'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
