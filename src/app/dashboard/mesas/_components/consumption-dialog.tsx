'use client';

import React, { useState, useEffect } from 'react';
import type { Mesa, Producto, Preparacion } from '@/lib/tipos';
import type { AutocompleteOption } from '@/components/ui/autocomplete-input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { SurfaceCard } from '@/components/comunes';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { InputNumero } from '@/components/ui/input-numero';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  PlusCircle,
  Trash2,
  Save,
  Loader2,
  ShoppingBag,
  ShoppingCart,
  ReceiptText,
  BadgeHelp,
  Clock,
  Search,
} from 'lucide-react';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

const toDate = (fecha: any): Date => {
  if (fecha instanceof Timestamp) return fecha.toDate();
  if (fecha && typeof fecha.toDate === 'function') return fecha.toDate();
  if (fecha instanceof Date) return fecha;
  if (typeof fecha === 'string') {
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) return d;
  }
  if (fecha && typeof fecha.seconds === 'number') {
    return new Date(fecha.seconds * 1000);
  }
  return new Date(0);
};

interface ConsumptionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mesaParaConsumo: Mesa | null;
  isConsumoManual: boolean;
  setIsConsumoManual: (val: boolean) => void;
  cantidadConsumo: number | '';
  setCantidadConsumo: (val: number | '') => void;
  descripcionConsumoManual: string;
  setDescripcionConsumoManual: (val: string) => void;
  precioConsumoManual: number | '';
  setPrecioConsumoManual: (val: number | '') => void;
  productoConsumoId: string;
  setProductoConsumoId: (val: string) => void;
  productosOptions: AutocompleteOption[];
  isLoadingProductos: boolean;
  productoConsumoSeleccionado: any;
  preparacionSeleccionada: Preparacion | 'base' | null;
  setPreparacionSeleccionada: (val: Preparacion | 'base' | null) => void;
  carritoConsumoTemporal: any[];
  onAddConsumo: () => void;
  onRemoveFromTempCart: (id: string) => void;
  onSave: () => void;
  processingConsumption: boolean;
  procesandoAnadir: boolean;
  cantidadConsumoInputRef: React.RefObject<HTMLInputElement | null>;
  productoInputRef: React.RefObject<HTMLInputElement | null>;
  itemManualCantRef: React.RefObject<HTMLInputElement | null>;
  itemManualDescRef: React.RefObject<HTMLInputElement | null>;
  itemManualPrecioRef: React.RefObject<HTMLInputElement | null>;
  itemManualAddBtnRef: React.RefObject<HTMLButtonElement | null>;
  anadirConsumoButtonRef: React.RefObject<HTMLButtonElement | null>;
  preparacionesContainerRef: React.RefObject<HTMLDivElement | null>;
  onProductoEnter: () => void;
  isMobile: boolean;
}

export function ConsumptionDialog({
  isOpen,
  onOpenChange,
  mesaParaConsumo,
  isConsumoManual,
  setIsConsumoManual,
  cantidadConsumo,
  setCantidadConsumo,
  descripcionConsumoManual,
  setDescripcionConsumoManual,
  precioConsumoManual,
  setPrecioConsumoManual,
  productoConsumoId,
  setProductoConsumoId,
  productosOptions,
  isLoadingProductos,
  productoConsumoSeleccionado,
  setPreparacionSeleccionada,
  carritoConsumoTemporal,
  onAddConsumo,
  onRemoveFromTempCart,
  onSave,
  processingConsumption,
  procesandoAnadir,
  cantidadConsumoInputRef,
  productoInputRef,
  itemManualCantRef,
  itemManualDescRef,
  itemManualPrecioRef,
  itemManualAddBtnRef,
  anadirConsumoButtonRef,
  preparacionesContainerRef,
  onProductoEnter,
}: ConsumptionDialogProps) {
  const isConsola = mesaParaConsumo?.tipoDeMesa === 'Consola';
  const [itemAEliminar, setItemAEliminar] = useState<any | null>(null);
  const [eliminandoItem, setEliminandoItem] = useState(false);

  // Limpiar estado de confirmación al abrir/cerrar y asegurar que body no quede bloqueado
  useEffect(() => {
    if (!isOpen) {
      setItemAEliminar(null);
      setEliminandoItem(false);
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.pointerEvents = '';
      }
    };
  }, [isOpen]);

  const totalCarrito = carritoConsumoTemporal.reduce(
    (acc, item) => acc + (Number(item.total) || 0),
    0
  );

  const getFechaFormateada = (fecha: any) => {
    if (!fecha) return '...';
    return format(toDate(fecha), 'hh:mm:ss a');
  };

  const handleConfirmarEliminarItem = async () => {
    if (!itemAEliminar) return;
    setEliminandoItem(true);
    try {
      await onRemoveFromTempCart(itemAEliminar.id);
      setItemAEliminar(null);
    } finally {
      setEliminandoItem(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Si el sub-modal de confirmación está abierto, cerramos solo la confirmación y no el modal padre
        if (!open && itemAEliminar) {
          if (!eliminandoItem) setItemAEliminar(null);
          return;
        }
        onOpenChange(open);
      }}
    >
      <DialogContent
        onEscapeKeyDown={(e) => {
          if (itemAEliminar) {
            e.preventDefault();
            if (!eliminandoItem) setItemAEliminar(null);
          }
        }}
        className="sm:max-w-2xl font-body rounded-xl sm:rounded-lg overflow-visible bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 p-5 sm:p-6 flex flex-col max-h-[90vh] gap-4 shadow-2xl"
      >
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-between gap-4 pr-6">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0">
                <DialogTitle className="font-headline text-lg font-bold text-slate-100 leading-tight truncate">
                  Añadir Consumo: {isConsola ? 'Consola' : 'Mesa'} #{mesaParaConsumo?.numeroMesa}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5 truncate">
                  Agrega productos o cargos manuales a la sesión.
                </DialogDescription>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="text-xs font-medium text-slate-400 leading-tight">Total</p>
              <p className="text-2xl font-bold text-sky-400 tabular-nums leading-tight">
                Q{totalCarrito.toFixed(2)}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col min-h-0 space-y-3">
          {/* Sección de entrada de datos (fija, sin scroll, idéntica al POS) */}
          <div className="space-y-2 shrink-0">
            {isConsumoManual ? (
              <>
                <div className="grid grid-cols-12 gap-2.5 items-end animate-in fade-in slide-in-from-top-1">
                  <div className="col-span-12 sm:col-span-2 flex items-end gap-3">
                    <div className="flex-1 space-y-1">
                      <Label
                        htmlFor="item-manual-cant"
                        className="text-xs font-medium text-slate-200 ml-1 block"
                      >
                        Cant.
                      </Label>
                      <InputNumero
                        id="item-manual-cant"
                        ref={itemManualCantRef}
                        value={cantidadConsumo}
                        onChange={(e) => setCantidadConsumo(Number(e.target.value) || 1)}
                        onFocus={(e) => e.target.select()}
                        className="text-center h-10 px-2"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            itemManualDescRef.current?.focus();
                          }
                        }}
                      />
                    </div>
                    <div className="sm:hidden flex flex-col items-center gap-1 shrink-0">
                      <Label className="text-xs font-medium text-slate-200">Manual</Label>
                      <div className="flex items-center justify-center px-3 h-10 border border-[#2e2e2e] rounded-full bg-[#252526]">
                        <Switch checked={isConsumoManual} onCheckedChange={setIsConsumoManual} />
                      </div>
                    </div>
                  </div>
                  <div className="col-span-12 sm:col-span-4 space-y-1">
                    <Label
                      htmlFor="item-manual-desc"
                      className="text-xs font-medium text-slate-200 ml-1 block"
                    >
                      Descripción
                    </Label>
                    <Input
                      id="item-manual-desc"
                      ref={itemManualDescRef}
                      value={descripcionConsumoManual}
                      onChange={(e) => setDescripcionConsumoManual(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      placeholder="Descripción..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          itemManualPrecioRef.current?.focus();
                        }
                      }}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3 space-y-1">
                    <Label
                      htmlFor="item-manual-precio"
                      className="text-xs font-medium text-slate-200 ml-1 block"
                    >
                      Precio (Q)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-sky-400">
                        Q
                      </span>
                      <InputNumero
                        id="item-manual-precio"
                        ref={itemManualPrecioRef}
                        value={precioConsumoManual}
                        onChange={(e) =>
                          setPrecioConsumoManual(
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                        onFocus={(e) => e.target.select()}
                        placeholder="0.00"
                        className="pl-7 pr-3 h-10"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (
                              descripcionConsumoManual.trim() &&
                              precioConsumoManual &&
                              Number(precioConsumoManual) > 0 &&
                              cantidadConsumo &&
                              Number(cantidadConsumo) > 0
                            ) {
                              onAddConsumo();
                            } else {
                              itemManualAddBtnRef.current?.focus();
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <Button
                      ref={itemManualAddBtnRef}
                      type="button"
                      onClick={onAddConsumo}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          onAddConsumo();
                        }
                      }}
                      disabled={
                        !descripcionConsumoManual.trim() ||
                        !precioConsumoManual ||
                        Number(precioConsumoManual) <= 0 ||
                        !cantidadConsumo ||
                        Number(cantidadConsumo) <= 0
                      }
                      className="w-full rounded-full h-10 font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md"
                    >
                      <PlusCircle className="mr-1.5 h-4 w-4" /> Agregar
                    </Button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 text-center">
                  Presiona F6 para salir del modo manual
                </p>
              </>
            ) : (
              <>
                <div className="grid grid-cols-12 gap-2.5 items-end animate-in fade-in slide-in-from-top-1">
                  <div className="col-span-12 sm:col-span-2 flex items-end gap-3">
                    <div className="flex-1 space-y-1">
                      <Label
                        htmlFor="cantidad-consumo"
                        className="text-xs font-medium text-slate-200 ml-1 block"
                      >
                        Cant.
                      </Label>
                      <InputNumero
                        id="cantidad-consumo"
                        ref={cantidadConsumoInputRef}
                        value={cantidadConsumo}
                        onChange={(e) => setCantidadConsumo(Number(e.target.value) || 1)}
                        onFocus={(e) => e.target.select()}
                        className="text-center h-10 px-2"
                        disabled={!mesaParaConsumo}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            productoInputRef.current?.focus();
                          }
                        }}
                      />
                    </div>
                    <div className="sm:hidden flex flex-col items-center gap-1 shrink-0">
                      <Label className="text-xs font-medium text-slate-200">Manual</Label>
                      <div className="flex items-center justify-center px-3 h-10 border border-[#2e2e2e] rounded-full bg-[#252526]">
                        <Switch checked={isConsumoManual} onCheckedChange={setIsConsumoManual} />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-12 sm:col-span-7 space-y-1">
                    <Label
                      htmlFor="producto-consumo"
                      className="text-xs font-medium text-slate-200 ml-1 block"
                    >
                      Producto
                    </Label>
                    <AutocompleteInput
                      id="producto-consumo"
                      ref={productoInputRef}
                      options={productosOptions}
                      value={productoConsumoId}
                      onValueChange={setProductoConsumoId}
                      placeholder={isLoadingProductos ? 'Cargando...' : 'Buscar producto...'}
                      icon={Search}
                      disabled={isLoadingProductos || !mesaParaConsumo}
                      onEnterKey={onProductoEnter}
                      onFocus={(e) => e.target.select()}
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-3">
                    <Button
                      ref={anadirConsumoButtonRef}
                      type="button"
                      onClick={onAddConsumo}
                      disabled={
                        !mesaParaConsumo ||
                        !productoConsumoId ||
                        procesandoAnadir ||
                        !cantidadConsumo ||
                        Number(cantidadConsumo) <= 0
                      }
                      className="w-full rounded-full h-10 font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md"
                    >
                      {procesandoAnadir ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <PlusCircle className="mr-1.5 h-4 w-4" />
                      )}{' '}
                      Agregar
                    </Button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 text-center">
                  Presiona F6 para agregar un ítem manual
                </p>
              </>
            )}

            {/* Sección de preparaciones si aplica (estilo idéntico al POS de venta) */}
            {productoConsumoSeleccionado &&
              'preparaciones' in productoConsumoSeleccionado &&
              productoConsumoSeleccionado.preparaciones &&
              productoConsumoSeleccionado.preparaciones.length > 0 && (
                <div
                  ref={preparacionesContainerRef}
                  tabIndex={0}
                  className="mt-1 focus:outline-none focus:ring-1 focus:ring-sky-500 rounded-md p-2 bg-muted/5 border border-dashed border-[#2e2e2e]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      anadirConsumoButtonRef.current?.focus();
                    }
                  }}
                >
                  <Label className="text-xs font-semibold ml-1 text-slate-100">Preparación</Label>
                  <RadioGroup
                    defaultValue="base"
                    className="flex flex-wrap gap-x-6 gap-y-2 mt-2"
                    onValueChange={(value) =>
                      setPreparacionSeleccionada(
                        value === 'base'
                          ? 'base'
                          : (productoConsumoSeleccionado as Producto).preparaciones?.find(
                              (p) => p.nombre === value
                            ) || null
                      )
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="base" id="prep-base" />
                      <Label
                        htmlFor="prep-base"
                        className="font-normal cursor-pointer text-sm text-slate-100"
                      >
                        Vender como base (Q{(productoConsumoSeleccionado.precioVenta ?? 0).toFixed(2)})
                      </Label>
                    </div>
                    {(productoConsumoSeleccionado as Producto).preparaciones?.map((prep, index) => (
                      <div
                        key={`${productoConsumoId}-prep-${index}`}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem value={prep.nombre} id={`prep-${prep.nombre}`} />
                        <Label
                          htmlFor={`prep-${prep.nombre}`}
                          className="font-normal cursor-pointer text-sm text-slate-100"
                        >
                          {prep.nombre} (Q{prep.precioVenta.toFixed(2)})
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
          </div>

          {/* Listado del carrito temporal (scroll exclusivo en la lista con altura controlada) */}
          <SurfaceCard
            variant="surface"
            className="max-h-[240px] overflow-y-auto custom-scrollbar p-2"
          >
            {carritoConsumoTemporal.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-7 text-center text-slate-400 gap-2.5 h-full">
                <ShoppingCart className="h-10 w-10 text-slate-500 stroke-[1.75]" />
                <p className="text-sm font-medium">Añade productos al carrito.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#2e2e2e]">
                {carritoConsumoTemporal.map((item, index) => {
                  const esItemManual = item.idProducto === 'item-manual';
                  return (
                    <div key={item.id || index} className="flex items-center gap-4 py-3 px-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {esItemManual ? (
                              <ReceiptText className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                            ) : (
                              <BadgeHelp className="h-5 w-5 text-red-500 flex-shrink-0" />
                            )}
                            <p className="font-semibold leading-tight text-sm text-slate-100">
                              {item.nombreProducto}
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-x-2 text-xs text-muted-foreground ml-7">
                            <span className="text-xs">
                              {item.cantidad} &times; Q{Number(item.precioUnitario ?? 0).toFixed(2)}
                            </span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getFechaFormateada(item.fechaAgregado)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2.5">
                        <div className="font-medium text-sm text-slate-100 tabular-nums">
                          Q{Number(item.total || 0).toFixed(2)}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-rose-500/15 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/25 transition-colors"
                          onClick={() => setItemAEliminar(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SurfaceCard>
        </div>

        <DialogFooter className="pt-2 shrink-0 flex-row items-center justify-between sm:justify-between gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              className="rounded-full h-10 px-5 font-medium bg-[#252526] hover:bg-[#2e2e2e] text-slate-200 border border-[#2e2e2e]"
            >
              Cancelar
            </Button>
          </DialogClose>

          <Button
            type="button"
            onClick={onSave}
            disabled={processingConsumption}
            className="rounded-full h-10 px-6 font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md"
          >
            {processingConsumption ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar (F3)
          </Button>
        </DialogFooter>

        {/* Sub-modal interno de confirmación (compacto, informativo y con borde oficial) */}
        {itemAEliminar && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center rounded-xl sm:rounded-lg bg-black/75 backdrop-blur-[2px] p-4 animate-in fade-in duration-150"
            onClick={() => {
              if (!eliminandoItem) setItemAEliminar(null);
            }}
          >
            <div
              className="w-full max-w-sm rounded-xl sm:rounded-lg bg-[#1e1e1e] border border-[#2e2e2e] text-slate-100 p-5 shadow-2xl space-y-3.5 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <h3 className="font-headline text-base font-bold text-slate-100 leading-tight">
                    ¿Eliminar Producto?
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {isConsola ? 'Consola' : 'Mesa'} #{mesaParaConsumo?.numeroMesa} • Confirma la eliminación
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-[#252526] border border-[#2e2e2e] p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-100 truncate">
                      {itemAEliminar.nombreProducto}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <span>
                        {itemAEliminar.cantidad} &times; Q
                        {Number(itemAEliminar.precioUnitario ?? 0).toFixed(2)} c/u
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {getFechaFormateada(itemAEliminar.fechaAgregado)}
                      </span>
                    </p>
                  </div>
                  <span className="text-xs font-bold text-sky-400 tabular-nums shrink-0 mt-0.5">
                    Q{Number(itemAEliminar.total || 0).toFixed(2)}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#2e2e2e] text-[11px] text-slate-300 leading-snug">
                  {itemAEliminar.idProducto !== 'item-manual' ? (
                    <span>
                      Se devolverá{' '}
                      <strong className="text-slate-100">
                        {itemAEliminar.cantidad}{' '}
                        {itemAEliminar.cantidad === 1 ? 'unidad' : 'unidades'}
                      </strong>{' '}
                      al stock de inventario.
                    </span>
                  ) : (
                    <span>Se descontará este cargo manual del total de la estación.</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-0.5">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={eliminandoItem}
                  onClick={() => setItemAEliminar(null)}
                  className="rounded-full h-9 px-4 text-xs font-medium bg-[#252526] hover:bg-[#2e2e2e] text-slate-200 border border-[#2e2e2e]"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  disabled={eliminandoItem}
                  onClick={handleConfirmarEliminarItem}
                  className="rounded-full h-9 px-5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md"
                >
                  {eliminandoItem ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Sí, Eliminar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
