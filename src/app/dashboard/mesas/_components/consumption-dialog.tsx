'use client';

import React from 'react';
import type { Mesa, AutocompleteOption, Producto, Preparacion } from '@/lib/tipos';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { InputNumero } from '@/components/ui/input-numero';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Trash2, Save, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  preparacionSeleccionada,
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
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl font-body rounded-lg overflow-hidden border-muted/20 p-0 flex flex-col max-h-[90vh] gap-0 shadow-2xl">
        <DialogHeader className="p-6 pb-2 shrink-0 bg-background">
          <DialogTitle className="font-headline text-xl">Añadir Consumo: {isConsola ? 'Consola' : 'Mesa'} #{mesaParaConsumo?.numeroMesa}</DialogTitle>
          <DialogDescription className="hidden sm:block font-body text-xs">Gestiona el consumo de la sesión de forma rápida.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-muted/5">
          <div className="p-6 space-y-6">
            {/* Sección de entrada de datos */}
            <div className="rounded-lg border border-muted/40 p-4 bg-background shadow-sm">
              {isConsumoManual ? (
                <div className="grid grid-cols-12 gap-2 items-end animate-in fade-in slide-in-from-top-1">
                  <div className="col-span-12 sm:col-span-2 flex items-end gap-4">
                    <div className="flex-1 flex flex-col gap-1">
                      <Label htmlFor="item-manual-cant" className="text-[10px] font-bold ml-1">Cant.</Label>
                      <InputNumero 
                        id="item-manual-cant" 
                        ref={itemManualCantRef} 
                        value={cantidadConsumo} 
                        onChange={(e) => setCantidadConsumo(Number(e.target.value) || 1)} 
                        onFocus={(e) => e.target.select()}
                        className="rounded-full text-center h-10 px-1 border-muted-foreground/20"
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); itemManualDescRef.current?.focus(); } }} 
                      />
                    </div>
                    <div className="sm:hidden flex flex-col items-center gap-1 shrink-0">
                      <Label className="text-[10px] font-bold">Manual</Label>
                      <div className="flex items-center justify-center px-3 h-10 border rounded-full bg-muted/20">
                        <Switch checked={isConsumoManual} onCheckedChange={setIsConsumoManual} />
                      </div>
                    </div>
                  </div>
                  <div className="col-span-12 sm:col-span-4">
                    <Label htmlFor="item-manual-desc" className="text-[10px] font-bold ml-1">Descripción</Label>
                    <Input 
                      id="item-manual-desc" 
                      ref={itemManualDescRef} 
                      value={descripcionConsumoManual} 
                      onChange={(e) => setDescripcionConsumoManual(e.target.value)} 
                      onFocus={(e) => e.target.select()}
                      placeholder="Descripción..." 
                      className="rounded-full h-10 px-3 border-muted-foreground/20"
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); itemManualPrecioRef.current?.focus(); } }} 
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-3">
                    <Label htmlFor="item-manual-precio" className="text-[10px] font-bold ml-1">Precio (Q)</Label>
                    <InputNumero 
                      id="item-manual-precio" 
                      ref={itemManualPrecioRef} 
                      value={precioConsumoManual} 
                      onChange={(e) => setPrecioConsumoManual(e.target.value === '' ? '' : Number(e.target.value))} 
                      onFocus={(e) => e.target.select()}
                      placeholder="0.00" 
                      className="rounded-full text-center h-10 px-1 border-muted-foreground/20"
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); itemManualAddBtnRef.current?.focus(); } }} 
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-3">
                    <Button 
                      ref={itemManualAddBtnRef} 
                      onClick={onAddConsumo} 
                      disabled={!descripcionConsumoManual.trim() || !precioConsumoManual || Number(precioConsumoManual) <= 0 || !cantidadConsumo || Number(cantidadConsumo) <= 0} 
                      className="w-full rounded-full h-10 font-bold shadow-lg shadow-primary/20"
                    >
                      Añadir
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-12 gap-3 items-end animate-in fade-in slide-in-from-top-1">
                  <div className="col-span-12 sm:col-span-2 flex items-end gap-4">
                    <div className="flex-1 flex flex-col gap-1">
                      <Label htmlFor="cantidad-consumo" className="text-[10px] font-bold ml-1">Cant.</Label>
                      <InputNumero 
                        id="cantidad-consumo" 
                        ref={cantidadConsumoInputRef} 
                        value={cantidadConsumo} 
                        onChange={(e) => setCantidadConsumo(Number(e.target.value) || 1)} 
                        onFocus={(e) => e.target.select()} 
                        className="rounded-full text-center h-10 border-muted-foreground/20" 
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
                      <Label className="text-[10px] font-bold">Manual</Label>
                      <div className="flex items-center justify-center px-3 h-10 border rounded-full bg-muted/20">
                        <Switch checked={isConsumoManual} onCheckedChange={setIsConsumoManual} />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-12 sm:col-span-7">
                    <Label htmlFor="producto-consumo" className="text-[10px] font-bold ml-1">Producto</Label>
                    <AutocompleteInput 
                      id="producto-consumo" 
                      ref={productoInputRef} 
                      options={productosOptions} 
                      value={productoConsumoId} 
                      onValueChange={setProductoConsumoId} 
                      placeholder={isLoadingProductos ? "Cargando..." : "Buscar producto..."} 
                      disabled={isLoadingProductos || !mesaParaConsumo} 
                      onEnterKey={onProductoEnter} 
                      onFocus={(e) => e.target.select()} 
                      className="rounded-full h-10 border-muted-foreground/20"
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-3">
                    <Button 
                      ref={anadirConsumoButtonRef} 
                      onClick={onAddConsumo} 
                      disabled={!mesaParaConsumo || !productoConsumoId || procesandoAnadir || !cantidadConsumo || Number(cantidadConsumo) <= 0} 
                      className='w-full rounded-full h-10 font-bold shadow-lg shadow-primary/20'
                    >
                      {procesandoAnadir ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />} Añadir
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Sección de preparaciones si aplica */}
            {productoConsumoSeleccionado && 'preparaciones' in productoConsumoSeleccionado && productoConsumoSeleccionado.preparaciones && productoConsumoSeleccionado.preparaciones.length > 0 && (
              <div 
                ref={preparacionesContainerRef} 
                tabIndex={0} 
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg p-4 border border-primary/20 bg-background shadow-sm animate-in zoom-in-95 duration-200" 
                onKeyDown={(e) => { 
                  if (e.key === 'Enter') { 
                    e.preventDefault(); 
                    anadirConsumoButtonRef.current?.focus(); 
                  } 
                }}
              >
                <Label className="mb-3 block text-xs font-bold tracking-wider text-primary">Opciones de Preparación</Label>
                <RadioGroup 
                  defaultValue="base" 
                  className="flex flex-wrap gap-x-6 gap-y-3" 
                  onValueChange={(value) => setPreparacionSeleccionada(value === 'base' ? 'base' : (productoConsumoSeleccionado as Producto).preparaciones?.find(p => p.nombre === value) || null)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="base" id="prep-base" />
                    <Label htmlFor="prep-base" className="font-semibold text-sm cursor-pointer">Base (Q{(productoConsumoSeleccionado.precioVenta ?? 0).toFixed(2)})</Label>
                  </div>
                  {(productoConsumoSeleccionado as Producto).preparaciones.map((prep, index) => (
                    <div key={`${productoConsumoId}-prep-${index}`} className="flex items-center space-x-2">
                      <RadioGroupItem value={prep.nombre} id={`prep-${prep.nombre}`} />
                      <Label htmlFor={`prep-${prep.nombre}`} className="font-semibold text-sm cursor-pointer">{prep.nombre} (Q{prep.precioVenta.toFixed(2)})</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Listado del carrito temporal */}
            <div className="space-y-3">
              <div className="min-h-[200px] border border-muted/60 rounded-lg p-2 bg-background shadow-inner">
                {carritoConsumoTemporal.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-muted-foreground py-12 opacity-40">
                    <PlusCircle className="h-12 w-12 mb-2" />
                    <p className="text-sm font-medium">El consumo aparecerá aquí.</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-1">
                    {carritoConsumoTemporal.map((item, index) => (
                      <div key={item.id || index} className="group">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-all border border-transparent hover:border-muted/40">
                          <div className="min-w-0 flex-1 pr-4">
                            <p className="font-bold text-sm text-foreground truncate">{item.cantidad}x {item.nombreProducto}</p>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">Q{item.precioUnitario.toFixed(2)} c/u</p>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <p className="font-bold text-primary text-base">Q{item.total.toFixed(2)}</p>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive rounded-full hover:bg-destructive/10" onClick={() => onRemoveFromTempCart(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 bg-background shrink-0 flex-col-reverse sm:flex-row sm:justify-between gap-3">
          <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto rounded-full h-11 px-8 font-bold">Cancelar</Button>
          </DialogClose>
          <Button onClick={onSave} disabled={processingConsumption} className="w-full sm:w-auto rounded-full h-11 px-10 font-bold shadow-lg shadow-primary/20">
            {processingConsumption ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Guardar Consumo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
