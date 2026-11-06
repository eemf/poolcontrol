'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SurfaceCard } from '@/components/comunes';
import {
  CreditCard,
  Coins,
  CheckCircle,
  Gift,
  AlertTriangle,
  Loader2,
  Trash2,
  History,
  Check,
  FileClock,
  Sigma,
  User,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { InputNumero } from '@/components/ui/input-numero';
import { cn } from '@/lib/utils';
import type { Venta } from '@/lib/tipos';

interface POSDialogsProps {
  state: {
    dialogoPagoAbierto: boolean;
    vistaDialogo: 'pago' | 'confirmarTarjeta';
    dialogoAbonoAbierto: boolean;
    dialogoConsumoInternoAbierto: boolean;
    alertaCancelarVentaAbierta: boolean;
    alertaEliminarAbierta: boolean;
    alertaCreditoMonedasAbierta: boolean;
    alertaClienteConCreditoAbierta: boolean;
    ventaParaPagar: Venta | null;
    ventaParaConsumo: Venta | null;
    clienteParaEliminar: any;
    itemsSeleccionadosParaPagar: Set<number>;
    montoAbono: number | '';
    montoAPagarDialogo: number;
    pinConsumo: string;
    procesandoPagoCredito: boolean;
    procesandoGuardado: boolean;
    incluirCreditoEnPago: boolean;
    saldoCreditoCliente: number;
    alertaEliminarItemAbierta: boolean;
    itemParaEliminar: { item: any; index: number } | null;
    procesandoEliminarItem: boolean;
  };
  actions: {
    setDialogoPagoAbierto: (val: boolean) => void;
    setVistaDialogo: (val: 'pago' | 'confirmarTarjeta') => void;
    setDialogoAbonoAbierto: (val: boolean) => void;
    setDialogoConsumoInternoAbierto: (val: boolean) => void;
    setAlertaCancelarVentaAbierta: (val: boolean) => void;
    setAlertaEliminarAbierta: (val: boolean) => void;
    setAlertaCreditoMonedasAbierta: (val: boolean) => void;
    setAlertaClienteConCreditoAbierta: (val: boolean) => void;
    setItemsSeleccionadosParaPagar: (val: any) => void;
    setMontoAbono: (val: number | '') => void;
    setPinConsumo: (val: string) => void;
    setIncluirCreditoEnPago: (val: boolean) => void;
    manejarConfirmarAbono: () => void;
    procederConPago: (metodo: 'Efectivo' | 'Tarjeta') => void;
    manejarConfirmarCancelacion: () => void;
    manejarPermanecerEnVenta?: () => void;
    manejarConfirmarEliminarCliente: () => void;
    confirmarPasarACredito: (v: Venta) => void;
    procederAGuardarVenta: () => void;
    confirmarConsumoInterno: () => void;
    setAlertaEliminarItemAbierta: (val: boolean) => void;
    confirmarEliminarItem: () => void;
  };
  refs: {
    abonoInputRef: React.RefObject<HTMLInputElement | null>;
  };
}

export function POSDialogs({ state, actions, refs }: POSDialogsProps) {
  const esVentaCredito = state.ventaParaPagar?.estado === 'credito';
  const tieneDeudaCredito = state.saldoCreditoCliente > 0;

  const itemsPendientes = state.ventaParaPagar?.detalles.filter(d => d.estado !== 'Pagada') || [];
  const todosSeleccionados = itemsPendientes.length > 0 && state.itemsSeleccionadosParaPagar.size === itemsPendientes.length;

  const toggleSeleccionarTodo = (checked: boolean) => {
    if (checked) {
      const allIds = itemsPendientes.map(d => d.idDetalle);
      actions.setItemsSeleccionadosParaPagar(new Set(allIds));
    } else {
      actions.setItemsSeleccionadosParaPagar(new Set());
    }
  };

  return (
    <>
      {/* Diálogo de Pago Principal - Pago Unificado */}
      <Dialog
        open={state.dialogoPagoAbierto}
        onOpenChange={(open) => {
          if (state.procesandoGuardado) return;
          if (!open && state.dialogoAbonoAbierto) {
            actions.setDialogoAbonoAbierto(false);
            return;
          }
          if (!open && state.vistaDialogo === 'confirmarTarjeta') {
            actions.setVistaDialogo('pago');
            return;
          }
          actions.setDialogoPagoAbierto(open);
        }}
      >
        <DialogContent
          onPointerDownOutside={(e) => {
            if (state.procesandoGuardado) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (state.procesandoGuardado) {
              e.preventDefault();
              return;
            }
            if (state.dialogoAbonoAbierto) {
              e.preventDefault();
              actions.setDialogoAbonoAbierto(false);
              return;
            }
            if (state.vistaDialogo === 'confirmarTarjeta') {
              e.preventDefault();
              actions.setVistaDialogo('pago');
              return;
            }
          }}
          className="p-5 sm:p-6 sm:max-w-lg rounded-xl sm:rounded-lg overflow-hidden font-body bg-[#1d283a] border-[#324157] text-slate-100 shadow-2xl flex flex-col max-h-[90vh] gap-4"
        >
          <DialogHeader className="shrink-0">
            <div className="flex items-center justify-between gap-3 pr-6">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Coins className="w-5 h-5" />
                </div>
                <div className="text-left min-w-0">
                  <DialogTitle className="font-headline text-base sm:text-lg font-bold text-slate-100 leading-tight truncate">
                    {esVentaCredito
                      ? `Liquidar Crédito: ${state.ventaParaPagar?.nombreCliente}`
                      : `Cobro de Cuenta: ${state.ventaParaPagar?.nombreCliente}`}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-400 mt-0.5 truncate">
                    Selecciona los artículos a liquidar o registra un abono.
                  </DialogDescription>
                </div>
              </div>
              {state.incluirCreditoEnPago && (
                <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-[10px] h-5 rounded-full px-2.5 shrink-0">
                  Incluye Deuda
                </Badge>
              )}
            </div>
          </DialogHeader>

          {/* Total a Liquidar directo en el lienzo */}
          <div className="text-center py-0.5 shrink-0">
            <p className="text-xs font-medium text-slate-400 mb-0.5">Total a Liquidar</p>
            <p className="text-4xl sm:text-5xl font-bold text-sky-400 tabular-nums tracking-tight">
              Q{state.montoAPagarDialogo.toFixed(2)}
            </p>
          </div>

          {/* Lista de Artículos de la Cuenta */}
          <SurfaceCard variant="surface" className="p-3.5 space-y-2.5 flex flex-col min-h-0">
            <div className="flex items-center justify-between px-0.5 shrink-0">
              <span className="font-semibold text-xs text-slate-300">
                {esVentaCredito ? 'Artículos en Deuda' : 'Artículos de la Cuenta'}
              </span>
              {!esVentaCredito && itemsPendientes.length > 0 && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all-items"
                    checked={todosSeleccionados}
                    onCheckedChange={(checked) => toggleSeleccionarTodo(checked as boolean)}
                  />
                  <Label
                    htmlFor="select-all-items"
                    className="text-xs font-semibold text-slate-300 cursor-pointer"
                  >
                    Todos
                  </Label>
                </div>
              )}
            </div>

            <div className="max-h-[220px] overflow-y-auto custom-scrollbar divide-y divide-[#324157] pr-1">
              {itemsPendientes.map((detalle) => {
                const isSelected = state.itemsSeleccionadosParaPagar.has(detalle.idDetalle);
                return (
                  <div
                    key={detalle.idDetalle}
                    className={cn(
                      'flex justify-between items-center py-2.5 px-2 transition-colors',
                      !esVentaCredito && 'cursor-pointer hover:bg-[#1d283a]/60 rounded-lg',
                      esVentaCredito && 'opacity-90'
                    )}
                    onClick={
                      esVentaCredito
                        ? undefined
                        : () => {
                            actions.setItemsSeleccionadosParaPagar((prev: Set<number>) => {
                              const newSet = new Set(prev);
                              if (newSet.has(detalle.idDetalle)) newSet.delete(detalle.idDetalle);
                              else newSet.add(detalle.idDetalle);
                              return newSet;
                            });
                          }
                    }
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {!esVentaCredito && (
                        <Checkbox checked={isSelected} onCheckedChange={() => {}} />
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                          {detalle.cantidad}x {detalle.nombreProducto}
                        </span>
                        {detalle.saldo < detalle.subtotal && (
                          <span className="text-[10px] font-semibold text-amber-400">
                            Saldo parcial: Q{detalle.saldo.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-sky-400 tabular-nums text-xs sm:text-sm ml-2 shrink-0">
                      Q{detalle.saldo.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Opción integrada para incluir deuda histórica */}
            {tieneDeudaCredito && !esVentaCredito && (
              <div
                onClick={() => actions.setIncluirCreditoEnPago(!state.incluirCreditoEnPago)}
                className={cn(
                  'flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer mt-1',
                  state.incluirCreditoEnPago
                    ? 'bg-amber-500/15 border-amber-500/40'
                    : 'bg-[#1d283a] border-[#324157] hover:border-slate-500'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Checkbox checked={state.incluirCreditoEnPago} onCheckedChange={() => {}} />
                  <div>
                    <p
                      className={cn(
                        'text-xs font-bold leading-tight',
                        state.incluirCreditoEnPago ? 'text-amber-300' : 'text-slate-200'
                      )}
                    >
                      Incluir Total Créditos
                    </p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <History className="h-3 w-3 text-amber-400" /> Cierres anteriores
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    'font-bold tabular-nums text-sm',
                    state.incluirCreditoEnPago ? 'text-amber-300' : 'text-slate-200'
                  )}
                >
                  Q{state.saldoCreditoCliente.toFixed(2)}
                </span>
              </div>
            )}
          </SurfaceCard>

          {/* Pie de Modal con Botones Estándar en Píldora */}
          <DialogFooter className="pt-1 shrink-0">
            <div className="grid grid-cols-3 gap-2.5 w-full">
              <Button
                type="button"
                variant="secondary"
                className="rounded-full h-10 font-semibold text-xs bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 transition-colors"
                onClick={() => {
                  actions.setMontoAbono('');
                  actions.setDialogoAbonoAbierto(true);
                  setTimeout(() => {
                    refs.abonoInputRef.current?.focus();
                    refs.abonoInputRef.current?.select();
                  }, 60);
                }}
                disabled={state.montoAPagarDialogo <= 0 || state.procesandoGuardado}
              >
                <Coins className="mr-1.5 h-4 w-4" /> Abono
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="rounded-full h-10 font-semibold text-xs bg-[#283244] hover:bg-[#324157] text-slate-100 border border-[#324157]"
                disabled={state.montoAPagarDialogo <= 0 || state.procesandoGuardado}
                onClick={() => actions.setVistaDialogo('confirmarTarjeta')}
              >
                <CreditCard className="mr-1.5 h-4 w-4 text-sky-400" /> Tarjeta
              </Button>
              <Button
                type="button"
                className="rounded-full h-10 font-semibold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
                disabled={state.montoAPagarDialogo <= 0 || state.procesandoGuardado}
                onClick={() => actions.procederConPago('Efectivo')}
              >
                {state.procesandoGuardado ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-1.5 h-4 w-4" /> Efectivo
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>

          {/* Sub-modal interno: Confirmar Pago con Tarjeta */}
          {state.vistaDialogo === 'confirmarTarjeta' && (
            <div
              className="absolute inset-0 z-50 flex items-center justify-center rounded-xl sm:rounded-lg bg-black/75 backdrop-blur-[2px] p-4 animate-in fade-in duration-150"
              onClick={() => {
                if (!state.procesandoGuardado) actions.setVistaDialogo('pago');
              }}
            >
              <div
                className="w-full max-w-sm rounded-xl sm:rounded-lg bg-[#1d283a] border border-[#324157] text-slate-100 p-5 shadow-2xl space-y-3.5 animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <h3 className="font-headline text-base font-bold text-slate-100 leading-tight">
                      ¿Confirmar Pago con Tarjeta?
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {state.ventaParaPagar?.nombreCliente} • Verifica antes de procesar
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-[#283244] border border-[#324157] p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-300">
                      Monto a cobrar con tarjeta
                    </span>
                    <span className="text-sm font-bold text-sky-400 tabular-nums shrink-0">
                      Q{state.montoAPagarDialogo.toFixed(2)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#324157] text-[11px] text-slate-400 leading-snug">
                    El cobro se registrará como pago con tarjeta y no sumará al efectivo en caja.
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={state.procesandoGuardado}
                    onClick={() => actions.setVistaDialogo('pago')}
                    className="rounded-full h-9 px-4 text-xs font-medium bg-[#283244] hover:bg-[#324157] text-slate-200 border border-[#324157]"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    disabled={state.procesandoGuardado}
                    onClick={() => actions.procederConPago('Tarjeta')}
                    className="rounded-full h-9 px-5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md"
                  >
                    {state.procesandoGuardado ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Procesando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-1.5 h-3.5 w-3.5" /> Confirmar Pago
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Sub-modal interno: Realizar un Abono */}
          {state.dialogoAbonoAbierto && (() => {
            const saldoCuentaActual = esVentaCredito ? 0 : (state.ventaParaPagar?.saldo || 0);
            const saldoCredito = esVentaCredito
              ? (state.ventaParaPagar?.saldo || 0)
              : state.saldoCreditoCliente;
            const deudaTotal = saldoCuentaActual + saldoCredito;
            const abonoIngresado = Number(state.montoAbono) || 0;
            const saldoRestante = Math.max(0, deudaTotal - abonoIngresado);

            return (
              <div
                className="absolute inset-0 z-50 flex items-center justify-center rounded-xl sm:rounded-lg bg-black/75 backdrop-blur-[2px] p-4 animate-in fade-in duration-150"
                onClick={() => {
                  if (!state.procesandoGuardado) actions.setDialogoAbonoAbierto(false);
                }}
              >
                <div
                  className="w-full max-w-sm rounded-xl sm:rounded-lg bg-[#1d283a] border border-[#324157] text-slate-100 p-5 shadow-2xl space-y-3.5 animate-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div className="text-left min-w-0">
                      <h3 className="font-headline text-base font-bold text-slate-100 leading-tight">
                        Registrar Abono
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        Abono a la cuenta de {state.ventaParaPagar?.nombreCliente}
                      </p>
                    </div>
                  </div>

                  {/* Tarjeta Unificada de Desglose de Saldos */}
                  <div className="rounded-xl bg-[#283244] border border-[#324157] overflow-hidden">
                    {saldoCredito > 0 && !esVentaCredito ? (
                      <>
                        <div className="grid grid-cols-2 divide-x divide-[#324157]">
                          <div className="p-2.5 text-center space-y-0.5">
                            <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-slate-400">
                              <FileClock className="h-3 w-3 text-sky-400 shrink-0" />
                              <span>Cuenta Actual</span>
                            </div>
                            <p className="text-sm font-bold text-slate-100 tabular-nums">
                              Q{saldoCuentaActual.toFixed(2)}
                            </p>
                          </div>
                          <div className="p-2.5 text-center space-y-0.5">
                            <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-slate-400">
                              <CreditCard className="h-3 w-3 text-amber-400 shrink-0" />
                              <span>Crédito</span>
                            </div>
                            <p className="text-sm font-bold text-amber-400 tabular-nums">
                              Q{saldoCredito.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="px-3.5 py-2 border-t border-[#324157] bg-[#1d283a]/40 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Sigma className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <span className="text-xs font-bold text-slate-200">Deuda Total</span>
                          </div>
                          <span className="text-sm font-bold text-sky-400 tabular-nums">
                            Q{deudaTotal.toFixed(2)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="px-3.5 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {esVentaCredito ? (
                            <CreditCard className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          ) : (
                            <FileClock className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                          )}
                          <span className="text-xs font-semibold text-slate-300">
                            {esVentaCredito ? 'Saldo en Crédito' : 'Saldo de la Cuenta'}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-sky-400 tabular-nums">
                          Q{deudaTotal.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {abonoIngresado > 0 && (
                      <div className="px-3.5 py-1.5 border-t border-[#324157] bg-emerald-500/10 flex items-center justify-between text-xs animate-in fade-in duration-150">
                        <span className="font-medium text-emerald-300">Restante tras abono</span>
                        <span className="font-bold text-emerald-400 tabular-nums">
                          Q{saldoRestante.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Input de Tamaño Estándar */}
                  <div className="space-y-1.5">
                    <Label htmlFor="monto-abono" className="text-xs font-medium text-slate-300 ml-1 block">
                      Monto a Recibir (Q)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-sky-400 pointer-events-none">
                        Q
                      </span>
                      <InputNumero
                        id="monto-abono"
                        ref={refs.abonoInputRef}
                        value={state.montoAbono}
                        onChange={(e) =>
                          actions.setMontoAbono(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            actions.manejarConfirmarAbono();
                          }
                        }}
                        placeholder="0.00"
                        className="h-10 pl-8 pr-4 text-sm font-semibold text-center tabular-nums"
                        autoFocus
                        onFocus={(e) => e.target.select()}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={state.procesandoGuardado}
                      onClick={() => actions.setDialogoAbonoAbierto(false)}
                      className="rounded-full h-9 px-4 text-xs font-medium bg-[#283244] hover:bg-[#324157] text-slate-200 border border-[#324157]"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      onClick={actions.manejarConfirmarAbono}
                      disabled={!state.montoAbono || Number(state.montoAbono) <= 0 || state.procesandoGuardado}
                      className="rounded-full h-9 px-5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md"
                    >
                      {state.procesandoGuardado ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Check className="mr-1.5 h-3.5 w-3.5" />
                          Confirmar Abono
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Capa de Bloqueo y Animación de Carga al Procesar Pago */}
          {state.procesandoGuardado && (
            <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/75 backdrop-blur-[2px] rounded-xl sm:rounded-lg animate-in fade-in duration-150">
              <div className="p-5 rounded-2xl bg-[#1d283a] border border-[#324157] shadow-2xl flex flex-col items-center gap-3 text-center animate-in zoom-in-95 duration-150">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
                <div>
                  <h4 className="font-headline text-sm font-bold text-slate-100">
                    Procesando Pago...
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Registrando transacción y actualizando caja
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de Consumo Interno */}
      <Dialog
        open={state.dialogoConsumoInternoAbierto}
        onOpenChange={actions.setDialogoConsumoInternoAbierto}
      >
        <DialogContent className="sm:max-w-sm rounded-xl sm:rounded-lg font-body bg-[#1d283a] border-[#324157] text-slate-100 p-5 shadow-2xl gap-4">
          <DialogHeader>
            <div className="flex items-center gap-3 pr-6">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0">
                <DialogTitle className="font-headline text-base font-bold text-slate-100 leading-tight">
                  Consumo Interno
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5 truncate">
                  Introduce el PIN del cliente autorizado.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3.5">
            <div className="flex items-center justify-between gap-2 p-3 bg-[#283244] border border-[#324157] rounded-lg">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-100 truncate">
                  {state.ventaParaConsumo?.nombreCliente}
                </p>
                <p className="text-[11px] text-slate-400">Monto en cortesía</p>
              </div>
              <span className="text-sm font-bold text-amber-400 tabular-nums shrink-0">
                Q{(state.ventaParaConsumo?.saldo ?? 0).toFixed(2)}
              </span>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="pin-consumo"
                className="text-center block text-xs font-medium text-slate-300"
              >
                PIN de Autorización
              </Label>
              <Input
                id="pin-consumo"
                type="password"
                value={state.pinConsumo}
                onChange={(e) => actions.setPinConsumo(e.target.value)}
                className="text-center rounded-full h-11 text-xl font-bold tracking-[0.5em]"
                placeholder="••••"
                maxLength={4}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    actions.confirmarConsumoInterno();
                  }
                }}
                autoFocus
              />
            </div>
          </div>

          <DialogFooter className="flex-row items-center justify-between sm:justify-between gap-2 sm:space-x-0 pt-1">
            <Button
              type="button"
              variant="secondary"
              className="rounded-full h-9 px-4 text-xs font-medium bg-[#283244] hover:bg-[#324157] text-slate-200 border border-[#324157]"
              onClick={() => actions.setDialogoConsumoInternoAbierto(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={actions.confirmarConsumoInterno}
              className="rounded-full h-9 px-5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md"
            >
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Liquidar Cuenta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmación: ¿Descartar Cambios? */}
      <AlertDialog
        open={state.alertaCancelarVentaAbierta}
        onOpenChange={(abierta) => {
          if (!abierta) actions.manejarPermanecerEnVenta?.();
          actions.setAlertaCancelarVentaAbierta(abierta);
        }}
      >
        <AlertDialogContent className="sm:max-w-sm rounded-xl sm:rounded-lg font-body bg-[#1d283a] border border-[#324157] text-slate-100 p-5 gap-3.5 shadow-2xl">
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="text-left min-w-0">
                <AlertDialogTitle className="font-headline text-base font-bold text-slate-100 leading-tight">
                  ¿Descartar Cambios?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Se descartarán los artículos nuevos sin guardar y se devolverán automáticamente al
                  stock.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row items-center justify-between sm:justify-between gap-2 pt-1 sm:space-x-0">
            <AlertDialogCancel
              onClick={actions.manejarPermanecerEnVenta}
              className="mt-0 rounded-full h-9 px-4 text-xs font-medium bg-[#283244] hover:bg-[#324157] border-[#324157] text-slate-200"
            >
              Permanecer
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={actions.manejarConfirmarCancelacion}
              className="rounded-full h-9 px-5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md"
            >
              Sí, Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmación: ¿Eliminar Cliente? */}
      <AlertDialog
        open={state.alertaEliminarAbierta}
        onOpenChange={state.procesandoGuardado ? undefined : actions.setAlertaEliminarAbierta}
      >
        <AlertDialogContent className="sm:max-w-sm rounded-xl sm:rounded-lg font-body bg-[#1d283a] border border-[#324157] text-slate-100 p-5 gap-3.5 shadow-2xl">
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="text-left min-w-0">
                <AlertDialogTitle className="font-headline text-base font-bold text-slate-100 leading-tight">
                  ¿Eliminar Cliente?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Se borrará permanentemente el registro de{' '}
                  <strong className="text-slate-100 font-semibold">
                    {state.clienteParaEliminar?.nombre}
                  </strong>
                  . Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row items-center justify-between sm:justify-between gap-2 pt-1 sm:space-x-0">
            <AlertDialogCancel className="mt-0 rounded-full h-9 px-4 text-xs font-medium bg-[#283244] hover:bg-[#324157] border-[#324157] text-slate-200">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={actions.manejarConfirmarEliminarCliente}
              className="bg-rose-600 hover:bg-rose-500 text-white rounded-full h-9 px-5 text-xs font-semibold shadow-md"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Sí, Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmación: Confirmar Crédito */}
      <AlertDialog
        open={state.alertaCreditoMonedasAbierta}
        onOpenChange={actions.setAlertaCreditoMonedasAbierta}
      >
        <AlertDialogContent className="sm:max-w-sm rounded-2xl font-body bg-[#1d283a] border border-[#324157] text-slate-100 p-4 sm:p-5 gap-3 shadow-2xl">
          <AlertDialogHeader className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center shrink-0">
                <span className="absolute -inset-1 rounded-full bg-amber-400/25 animate-ping opacity-60" />
                <span className="absolute -inset-1.5 rounded-full bg-amber-500/15 animate-pulse" />
                <div className="relative w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10">
                  <CreditCard className="w-4 h-4 animate-pulse" />
                </div>
              </div>
              <div className="text-left min-w-0">
                <AlertDialogTitle className="font-headline text-base font-bold text-slate-100 leading-tight">
                  ¿Mover Cuenta a Crédito?
                </AlertDialogTitle>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  Autorización de traslado a cuentas por cobrar
                </p>
              </div>
            </div>

            <AlertDialogDescription asChild>
              <div className="space-y-2.5 text-left">
                {/* Resumen Compacto en 1 sola fila */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#283244] border border-[#324157]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <User className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-100 truncate">
                      {state.ventaParaPagar?.nombreCliente || 'Cliente'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="text-[11px] text-slate-400">Saldo:</span>
                    <span className="text-sm font-bold text-amber-400 tabular-nums">
                      Q{(state.ventaParaPagar?.saldo ?? state.ventaParaPagar?.total ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Explicación Compacta */}
                <p className="text-xs text-slate-300 leading-snug">
                  La cuenta se moverá a <strong className="text-amber-400 font-semibold">Créditos Activos</strong> para liquidación posterior.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row items-center justify-between sm:justify-between gap-2 pt-1 sm:space-x-0">
            <AlertDialogCancel className="mt-0 rounded-full h-9 px-4 text-xs font-medium bg-[#283244] hover:bg-[#324157] border-[#324157] text-slate-200">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                state.ventaParaPagar && actions.confirmarPasarACredito(state.ventaParaPagar)
              }
              className="rounded-full h-9 px-5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md inline-flex items-center gap-1.5 transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Confirmar Crédito
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmación: Cliente con Deuda */}
      <AlertDialog
        open={state.alertaClienteConCreditoAbierta}
        onOpenChange={actions.setAlertaClienteConCreditoAbierta}
      >
        <AlertDialogContent className="sm:max-w-sm rounded-xl sm:rounded-lg font-body bg-[#1d283a] border border-[#324157] text-slate-100 p-5 gap-3.5 shadow-2xl">
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="text-left min-w-0">
                <AlertDialogTitle className="font-headline text-base font-bold text-slate-100 leading-tight">
                  Cliente con Deuda Activa
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Este cliente ya tiene un crédito pendiente. ¿Deseas abrir una nueva cuenta por
                  separado?
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row items-center justify-between sm:justify-between gap-2 pt-1 sm:space-x-0">
            <AlertDialogCancel className="mt-0 rounded-full h-9 px-4 text-xs font-medium bg-[#283244] hover:bg-[#324157] border-[#324157] text-slate-200">
              Revisar Deuda
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={actions.procederAGuardarVenta}
              className="rounded-full h-9 px-5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md"
            >
              Continuar Venta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmación: ¿Eliminar Producto de la Venta? */}
      <AlertDialog
        open={state.alertaEliminarItemAbierta}
        onOpenChange={
          state.procesandoEliminarItem ? undefined : actions.setAlertaEliminarItemAbierta
        }
      >
        <AlertDialogContent className="sm:max-w-sm rounded-xl sm:rounded-lg font-body bg-[#1d283a] border border-[#324157] text-slate-100 p-5 gap-3.5 shadow-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="text-left min-w-0">
                <AlertDialogTitle className="font-headline text-base font-bold text-slate-100 leading-tight">
                  ¿Eliminar Producto?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-[11px] text-slate-400 mt-0.5 truncate">
                  Confirma la eliminación del artículo de la venta
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="rounded-lg bg-[#283244] border border-[#324157] p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-100 truncate">
                  {state.itemParaEliminar?.item.nombreProducto}
                </p>
                {state.itemParaEliminar?.item.cantidad !== undefined && (
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {state.itemParaEliminar.item.cantidad} &times; Q
                    {Number(state.itemParaEliminar.item.precioUnitario ?? 0).toFixed(2)} c/u
                  </p>
                )}
              </div>
              {state.itemParaEliminar?.item.subtotal !== undefined && (
                <span className="text-xs font-bold text-sky-400 tabular-nums shrink-0 mt-0.5">
                  Q{Number(state.itemParaEliminar.item.subtotal || 0).toFixed(2)}
                </span>
              )}
            </div>

            {state.itemParaEliminar?.item.idDetalle !== 0 && (
              <div className="pt-2 border-t border-[#324157] text-[11px] text-slate-300 leading-snug">
                {state.itemParaEliminar?.item.idProducto === 'item-manual' ||
                state.itemParaEliminar?.item.idProducto?.startsWith('mesa-') ||
                state.itemParaEliminar?.item.idProducto?.startsWith('division-mesa-')
                  ? 'El cargo se descontará inmediatamente del saldo de la cuenta.'
                  : 'Se reintegrará el stock al inventario y el movimiento quedará registrado en el Kardex.'}
              </div>
            )}
          </div>

          <AlertDialogFooter className="flex-row items-center justify-between sm:justify-between gap-2 pt-0.5 sm:space-x-0">
            <AlertDialogCancel
              disabled={state.procesandoEliminarItem}
              className="mt-0 rounded-full h-9 px-4 text-xs font-medium bg-[#283244] hover:bg-[#324157] border-[#324157] text-slate-200"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={actions.confirmarEliminarItem}
              disabled={state.procesandoEliminarItem}
              className="bg-rose-600 hover:bg-rose-500 text-white rounded-full h-9 px-5 text-xs font-semibold shadow-md"
            >
              {state.procesandoEliminarItem ? (
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
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
