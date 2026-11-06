
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
    <div className="space-y-3.5">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
          <div className="text-left sm:text-right flex-shrink-0">
            <p className="text-xs font-medium text-slate-400 leading-tight">Total Venta</p>
            <p className="text-2xl sm:text-3xl font-bold text-sky-400 tabular-nums leading-tight">
              Q{state.totalVentaActiva.toFixed(2)}
            </p>
          </div>
          <Button
            onClick={actions.manejarGuardarVenta}
            disabled={state.puedeOperar || state.procesandoGuardado}
            className="rounded-full h-10 px-6 font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md"
          >
            {state.procesandoGuardado ? <Loader /> : <Save className="mr-1.5 h-4 w-4" />}
            Guardar (F3)
          </Button>
        </div>
      </div>

      {state.clienteSeleccionadoId && (
        <div className="pt-3 border-t border-[#324157] space-y-2">
          {state.mostrarItemManual ? (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
              <div className="grid grid-cols-12 gap-2.5 items-end">
                <div className="col-span-12 sm:col-span-2 flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="item-manual-cant" className="text-xs font-medium text-slate-200 ml-1 block">
                      Cant.
                    </Label>
                    <InputNumero
                      id="item-manual-cant"
                      ref={refs.itemManualCantRef}
                      value={state.cantidadItemManual}
                      onChange={(e) => actions.setCantidadItemManual(Number(e.target.value) || 1)}
                      onFocus={(e) => e.target.select()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          refs.itemManualDescRef.current?.focus();
                        }
                      }}
                      className="text-center h-10 px-2"
                    />
                  </div>
                  <div className="sm:hidden flex flex-col items-center gap-1 shrink-0">
                    <Label className="text-xs font-medium text-slate-200">Manual</Label>
                    <div className="flex items-center justify-center px-3 h-10 border border-[#324157] rounded-full bg-[#283244]">
                      <Switch checked={state.mostrarItemManual} onCheckedChange={actions.setMostrarItemManual} />
                    </div>
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-4 space-y-1">
                  <Label htmlFor="item-manual-desc" className="text-xs font-medium text-slate-200 ml-1 block">
                    Descripción
                  </Label>
                  <Input
                    id="item-manual-desc"
                    ref={refs.itemManualDescRef}
                    value={state.descripcionItemManual}
                    onChange={(e) => actions.setDescripcionItemManual(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="Descripción..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        refs.itemManualPrecioRef.current?.focus();
                      }
                    }}
                  />
                </div>
                <div className="col-span-6 sm:col-span-3 space-y-1">
                  <Label htmlFor="item-manual-precio" className="text-xs font-medium text-slate-200 ml-1 block">
                    Precio (Q)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-sky-400">
                      Q
                    </span>
                    <InputNumero
                      id="item-manual-precio"
                      ref={refs.itemManualPrecioRef}
                      value={state.precioUnitarioItemManual}
                      onChange={(e) =>
                        actions.setPrecioUnitarioItemManual(
                          e.target.value === '' ? '' : Number(e.target.value)
                        )
                      }
                      onFocus={(e) => e.target.select()}
                      placeholder="0.00"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (
                            state.descripcionItemManual.trim() &&
                            state.precioUnitarioItemManual &&
                            Number(state.precioUnitarioItemManual) > 0 &&
                            state.cantidadItemManual &&
                            Number(state.cantidadItemManual) > 0
                          ) {
                            actions.manejarAnadirItemManual();
                          } else {
                            refs.itemManualAddBtnRef.current?.focus();
                          }
                        }
                      }}
                      className="pl-7 pr-3 h-10"
                    />
                  </div>
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <Button
                    ref={refs.itemManualAddBtnRef}
                    type="button"
                    onClick={actions.manejarAnadirItemManual}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        actions.manejarAnadirItemManual();
                      }
                    }}
                    disabled={
                      !state.descripcionItemManual ||
                      !state.precioUnitarioItemManual ||
                      Number(state.precioUnitarioItemManual) <= 0
                    }
                    className="w-full h-10 font-semibold rounded-full bg-sky-600 hover:bg-sky-500 text-white shadow-md"
                  >
                    <PlusCircle className="mr-1.5 h-4 w-4" />
                    Agregar
                  </Button>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 text-center">
                Presiona F6 para salir del modo manual
              </p>
            </div>
          ) : (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
              <div className="grid grid-cols-12 gap-2.5 items-end">
                <div className="col-span-12 sm:col-span-2 flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="cantidad" className="text-xs font-medium text-slate-200 ml-1 block">
                      Cant.
                    </Label>
                    <InputNumero
                      id="cantidad"
                      ref={refs.cantidadInputRef}
                      value={state.cantidad}
                      onChange={(e) =>
                        actions.setCantidad(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                      }
                      onFocus={(e) => e.target.select()}
                      className="text-center h-10 px-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          refs.productoInputRef.current?.focus();
                        }
                      }}
                    />
                  </div>
                  <div className="sm:hidden flex flex-col items-center gap-1 shrink-0">
                    <Label className="text-xs font-medium text-slate-200">Manual</Label>
                    <div className="flex items-center justify-center px-3 h-10 border border-[#324157] rounded-full bg-[#283244]">
                      <Switch
                        id="item-manual-switch-on"
                        checked={state.mostrarItemManual}
                        onCheckedChange={actions.setMostrarItemManual}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-7 space-y-1">
                  <Label htmlFor="producto-search" className="text-xs font-medium text-slate-200 ml-1 block">
                    Producto
                  </Label>
                  <AutocompleteInput
                    id="producto-search"
                    ref={refs.productoInputRef}
                    options={state.opcionesProductos}
                    value={state.productoSeleccionadoId}
                    onValueChange={actions.setProductoSeleccionadoId}
                    placeholder={state.cargando ? 'Cargando...' : 'Buscar producto...'}
                    disabled={state.cargando}
                    onEnterKey={actions.onProductoEnter}
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                <div className="col-span-12 sm:col-span-3">
                  <Button
                    ref={refs.anadirButtonRef}
                    type="button"
                    onClick={actions.manejarAnadirProducto}
                    disabled={
                      !state.productoSeleccionadoId ||
                      state.procesandoAnadir ||
                      !state.cantidad ||
                      Number(state.cantidad) <= 0
                    }
                    className="w-full rounded-full h-10 font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md"
                  >
                    {state.procesandoAnadir ? <Loader /> : <PlusCircle className="mr-1.5 h-4 w-4" />}
                    Agregar
                  </Button>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 text-center">
                Presiona F6 para agregar un ítem manual
              </p>
            </div>
          )}

          {state.productoSeleccionado &&
            'preparaciones' in state.productoSeleccionado &&
            state.productoSeleccionado.preparaciones &&
            state.productoSeleccionado.preparaciones.length > 0 && (
              <div
                ref={refs.preparacionesContainerRef}
                tabIndex={0}
                className="mt-1 focus:outline-none focus:ring-1 focus:ring-sky-500 rounded-md p-2 bg-muted/5 border border-dashed border-[#324157]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    refs.anadirButtonRef.current?.focus();
                  }
                }}
              >
                <Label className="text-xs font-semibold ml-1 text-slate-100">Preparación</Label>
                <RadioGroup
                  defaultValue="base"
                  className="flex flex-wrap gap-x-6 gap-y-2 mt-2"
                  onValueChange={(value) =>
                    actions.setPreparacionSeleccionada(
                      value === 'base'
                        ? 'base'
                        : (state.productoSeleccionado as Producto).preparaciones?.find(
                            (p) => p.nombre === value
                          ) || null
                    )
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="base" id="prep-base" />
                    <Label htmlFor="prep-base" className="font-normal cursor-pointer text-sm text-slate-100">
                      Vender como base (Q{(state.productoSeleccionado.precioVenta ?? 0).toFixed(2)})
                    </Label>
                  </div>
                  {(state.productoSeleccionado as Producto).preparaciones.map((prep, index) => (
                    <div
                      key={`${state.productoSeleccionadoId}-prep-${index}`}
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
      )}
    </div>
  );
}
