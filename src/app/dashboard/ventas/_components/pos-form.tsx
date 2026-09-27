
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, PlusCircle, XCircle } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import { InputNumero } from '@/components/ui/input-numero';
import { Loader } from '@/components/ui/loader';
import { cn } from '@/lib/utils';
import type { AutocompleteOption } from '@/components/ui/autocomplete-input';
import type { Producto, Preparacion } from '@/lib/tipos';

interface POSFormProps {
  refs: {
    clienteInputRef: React.RefObject<HTMLInputElement>;
    cantidadInputRef: React.RefObject<HTMLInputElement>;
    productoInputRef: React.RefObject<HTMLInputElement>;
    itemManualCantRef: React.RefObject<HTMLInputElement>;
    itemManualDescRef: React.RefObject<HTMLInputElement>;
    itemManualPrecioRef: React.RefObject<HTMLInputElement>;
    itemManualAddBtnRef: React.RefObject<HTMLButtonElement>;
    anadirButtonRef: React.RefObject<HTMLButtonElement>;
    preparacionesContainerRef: React.RefObject<HTMLDivElement>;
  };
  state: {
    clienteSeleccionadoId: string;
    productoSeleccionadoId: string;
    cantidad: number | '';
    mostrarItemManual: boolean;
    descripcionItemManual: string;
    precioUnitarioItemManual: number | '';
    cantidadItemManual: number | '';
    preparacionSeleccionada: Preparacion | 'base' | null;
    productoSeleccionado: any;
    cargando: boolean;
    procesandoGuardado: boolean;
    procesandoAnadir: boolean;
    isMobile: boolean;
    totalVentaActiva: number;
    opcionesClientes: AutocompleteOption[];
    opcionesProductos: AutocompleteOption[];
    puedeOperar: boolean;
  };
  actions: {
    manejarSeleccionCliente: (id: string) => void;
    manejarCrearCliente: (nombre: string) => Promise<string | null>;
    manejarAbrirAlertaEliminar: (option: AutocompleteOption) => void;
    setMostrarItemManual: (val: boolean) => void;
    setCantidadItemManual: (val: number | '') => void;
    setDescripcionItemManual: (val: string) => void;
    setPrecioUnitarioItemManual: (val: number | '') => void;
    setCantidad: (val: number | '') => void;
    setProductoSeleccionadoId: (val: string) => void;
    setPreparacionSeleccionada: (val: Preparacion | 'base' | null) => void;
    manejarAnadirProducto: () => void;
    manejarAnadirItemManual: () => void;
    manejarGuardarVenta: () => void;
    onProductoEnter: () => void;
  };
}

export function POSForm({ refs, state, actions }: POSFormProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 w-full">
          <AutocompleteInput
            id="cliente-search"
            ref={refs.clienteInputRef}
            options={state.opcionesClientes}
            value={state.clienteSeleccionadoId}
            onValueChange={actions.manejarSeleccionCliente}
            placeholder="Buscar o crear cliente..."
            onCreateNew={actions.manejarCrearCliente}
            onOptionAction={actions.manejarAbrirAlertaEliminar}
            disabled={state.cargando}
            onFocus={(e) => e.target.select()}
            onEnterKey={() => refs.cantidadInputRef.current?.focus()}
          />
        </div>
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-4">
          <div className="text-center flex-shrink-0">
            <p className="text-sm text-muted-foreground font-body">Total Venta</p>
            <p className="text-3xl font-bold text-primary text-center">Q{state.totalVentaActiva.toFixed(2)}</p>
          </div>
          <Button onClick={actions.manejarGuardarVenta} size="lg" disabled={state.puedeOperar || state.procesandoGuardado} className="w-full sm:w-auto">
            {state.procesandoGuardado ? <Loader /> : <Save className="mr-2 h-4 w-4"/>}
            Guardar
          </Button>
        </div>
      </div>

      {state.clienteSeleccionadoId && (
        <div className="p-3 border rounded-lg space-y-2">
          {state.mostrarItemManual ? (
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row items-end gap-2">
                <div className="flex items-end gap-2 w-full sm:w-auto">
                  <div className="flex-1 sm:w-20 space-y-1">
                    <Label htmlFor="item-manual-cant" className="text-xs font-semibold ml-1">Cant.</Label>
                    <InputNumero 
                      id="item-manual-cant" 
                      ref={refs.itemManualCantRef} 
                      value={state.cantidadItemManual} 
                      onChange={(e) => actions.setCantidadItemManual(Number(e.target.value) || 1)} 
                      onFocus={(e) => e.target.select()} 
                      onKeyDown={(e) => { if (e.key === 'Enter') refs.itemManualDescRef.current?.focus(); }} 
                      className="text-center h-10" 
                    />
                  </div>
                  <div className="sm:hidden flex flex-col items-center gap-1 shrink-0">
                    <Label className="text-xs font-semibold ml-1">Manual</Label>
                    <div className="flex items-center justify-center px-3 h-10 border rounded-full bg-muted/20">
                      <Switch checked={state.mostrarItemManual} onCheckedChange={actions.setMostrarItemManual} />
                    </div>
                  </div>
                </div>
                <div className="flex-1 w-full space-y-1">
                  <Label htmlFor="item-manual-desc" className="text-xs font-semibold ml-1">Ítem Manual (Sin Inventario)</Label>
                  <Input 
                    id="item-manual-desc" 
                    ref={refs.itemManualDescRef} 
                    value={state.descripcionItemManual} 
                    onChange={e => actions.setDescripcionItemManual(e.target.value)} 
                    onFocus={(e) => e.target.select()} 
                    placeholder="Ej: Descorche..." 
                    onKeyDown={e => { if (e.key === 'Enter') refs.itemManualPrecioRef.current?.focus(); }} 
                    className="h-10 rounded-full"
                  />
                </div>
                <div className="w-full sm:w-32 space-y-1">
                  <Label htmlFor="item-manual-precio" className="text-xs font-semibold ml-1">Precio Unit. (Q)</Label>
                  <InputNumero 
                    id="item-manual-precio" 
                    ref={refs.itemManualPrecioRef} 
                    value={state.precioUnitarioItemManual} 
                    onChange={(e) => actions.setPrecioUnitarioItemManual(e.target.value === '' ? '' : Number(e.target.value))} 
                    onFocus={(e) => e.target.select()} 
                    placeholder="0.00" 
                    onKeyDown={e => { 
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        refs.itemManualAddBtnRef.current?.focus();
                      }
                    }} 
                    className="text-center h-10" 
                  />
                </div>
                <div className="w-full sm:w-auto">
                  <Button 
                    ref={refs.itemManualAddBtnRef} 
                    onClick={actions.manejarAnadirItemManual} 
                    disabled={!state.descripcionItemManual || !state.precioUnitarioItemManual || state.precioUnitarioItemManual <= 0}
                    className="w-full h-10 font-bold rounded-full"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar
                  </Button>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">Presiona F6 para salir del modo manual</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row items-start gap-2">
                <div className="flex items-start gap-2 w-full sm:w-auto">
                  <div className="flex flex-col gap-1 sm:w-20">
                    <Label htmlFor="cantidad" className="text-xs font-semibold ml-1">Cant.</Label>
                    <InputNumero
                      id="cantidad"
                      ref={refs.cantidadInputRef}
                      value={state.cantidad}
                      onChange={(e) => actions.setCantidad(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                      onFocus={(e) => e.target.select()}
                      className="text-center"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          refs.productoInputRef.current?.focus();
                        }
                      }}
                    />
                  </div>
                  <div className="sm:hidden flex flex-col items-center gap-1 shrink-0">
                    <Label className="text-xs font-semibold ml-1">Manual</Label>
                    <div className="flex items-center justify-center px-3 h-10 border rounded-full bg-muted/20">
                      <Switch id="item-manual-switch-on" checked={state.mostrarItemManual} onCheckedChange={actions.setMostrarItemManual} />
                    </div>
                  </div>
                </div>
                <div className="flex-1 w-full flex flex-col gap-1">
                  <Label htmlFor="producto-search" className="text-xs font-semibold ml-1">Producto</Label>
                  <AutocompleteInput id="producto-search" ref={refs.productoInputRef} options={state.opcionesProductos} value={state.productoSeleccionadoId} onValueChange={actions.setProductoSeleccionadoId} placeholder={state.cargando ? "Cargando..." : "Buscar producto..."} disabled={state.cargando} onEnterKey={actions.onProductoEnter} onFocus={(e) => e.target.select()}/>
                </div>
                <div className="flex-shrink-0 w-full sm:w-auto sm:pt-5">
                  <Button ref={refs.anadirButtonRef} onClick={actions.manejarAnadirProducto} disabled={!state.productoSeleccionadoId || state.procesandoAnadir || !state.cantidad || Number(state.cantidad) <= 0} className='w-full'>
                    {state.procesandoAnadir ? <Loader /> : <PlusCircle className="mr-2 h-4 w-4" />}
                    Agregar
                  </Button>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">Presiona F6 para agregar un ítem manual</p>
            </div>
          )}
          
          {state.productoSeleccionado && 'preparaciones' in state.productoSeleccionado && state.productoSeleccionado.preparaciones && state.productoSeleccionado.preparaciones.length > 0 && (
            <div
              ref={refs.preparacionesContainerRef}
              tabIndex={0}
              className="mt-1 focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-2 bg-muted/5 border border-dashed"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  refs.anadirButtonRef.current?.focus();
                }
              }}
            >
              <Label className="text-xs font-semibold ml-1">Preparación</Label>
              <RadioGroup
                defaultValue="base"
                className="flex flex-wrap gap-x-6 gap-y-2 mt-2"
                onValueChange={(value) => actions.setPreparacionSeleccionada(value === 'base' ? 'base' : (state.productoSeleccionado as Producto).preparaciones?.find(p => p.nombre === value) || null)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="base" id="prep-base" />
                  <Label htmlFor="prep-base" className="font-normal cursor-pointer text-sm">Vender como base (Q{(state.productoSeleccionado.precioVenta ?? 0).toFixed(2)})</Label>
                </div>
                {(state.productoSeleccionado as Producto).preparaciones.map((prep, index) => (
                  <div key={`${state.productoSeleccionadoId}-prep-${index}`} className="flex items-center space-x-2">
                    <RadioGroupItem value={prep.nombre} id={`prep-${prep.nombre}`}/>
                    <Label htmlFor={`prep-${prep.nombre}`} className="font-normal cursor-pointer text-sm">{prep.nombre} (Q{prep.precioVenta.toFixed(2)})</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
