'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  CreditCard, 
  Coins, 
  CheckCircle, 
  Gift, 
  AlertTriangle, 
  Coins as CoinsIcon, 
  Loader2, 
  X, 
  Trash2,
  CheckCircle2,
  History
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogClose 
} from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { InputNumero } from '@/components/ui/input-numero';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
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
    manejarConfirmarEliminarCliente: () => void;
    confirmarPasarACredito: (v: Venta) => void;
    procederAGuardarVenta: () => void;
    confirmarConsumoInterno: () => void;
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
      <Dialog open={state.dialogoPagoAbierto} onOpenChange={actions.setDialogoPagoAbierto}>
        <DialogContent className="p-0 sm:max-w-md rounded-2xl overflow-hidden font-body border-none shadow-2xl flex flex-col h-[85vh] sm:h-[650px] gap-0">
          
          {/* Encabezado con Total Unificado */}
          <div className="p-6 bg-primary/5 text-center space-y-4 border-b border-primary/10 shrink-0">
            <div className="flex justify-center gap-2">
              <DialogTitle asChild>
                <Badge className="bg-primary/10 text-primary border-none font-bold text-[11px] h-6 rounded-full px-4">
                  {esVentaCredito ? `Liquidar Crédito: ${state.ventaParaPagar?.nombreCliente}` : `Cuenta de ${state.ventaParaPagar?.nombreCliente}`}
                </Badge>
              </DialogTitle>
              {state.incluirCreditoEnPago && (
                <Badge className="bg-orange-100 text-orange-700 border-none font-bold text-[10px] h-6 rounded-full px-3">
                  Incluye Deuda
                </Badge>
              )}
            </div>
            <div className="space-y-0.5">
              <p className="text-5xl font-bold text-blue-500 tabular-nums tracking-tighter">
                Q{state.montoAPagarDialogo.toFixed(2)}
              </p>
              <p className="text-[11px] font-semibold text-muted-foreground">Total a Liquidar</p>
            </div>
          </div>
          
          {/* Cuerpo con Ítems y Bloque de Deuda Histórica */}
          <div className="flex-1 min-h-0 bg-background p-4 sm:p-6 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 h-full -mr-2 pr-4">
              <div className="space-y-6">
                
                {/* SECCIÓN: VENTA ACTUAL */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="font-bold text-xs text-muted-foreground tracking-widest">
                      {esVentaCredito ? 'Artículos en Deuda' : 'Venta del Turno'}
                    </h3>
                    {!esVentaCredito && itemsPendientes.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="select-all-items"
                          checked={todosSeleccionados}
                          onCheckedChange={(checked) => toggleSeleccionarTodo(checked as boolean)}
                          className="h-4 w-4 rounded-sm"
                        />
                        <Label htmlFor="select-all-items" className="text-[10px] font-bold text-muted-foreground cursor-pointer">
                          Todos
                        </Label>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    {itemsPendientes.map(detalle => (
                      <div 
                        key={detalle.idDetalle} 
                        className={cn(
                          "flex justify-between items-center py-2.5 border border-transparent transition-all px-4 rounded-xl group",
                          !esVentaCredito && (state.itemsSeleccionadosParaPagar.has(detalle.idDetalle) ? "bg-primary/5 border-primary/10" : "hover:bg-muted/5"),
                          !esVentaCredito && "cursor-pointer",
                          esVentaCredito && "opacity-80"
                        )}
                        onClick={esVentaCredito ? undefined : () => {
                          actions.setItemsSeleccionadosParaPagar((prev: Set<number>) => {
                            const newSet = new Set(prev);
                            if (newSet.has(detalle.idDetalle)) newSet.delete(detalle.idDetalle);
                            else newSet.add(detalle.idDetalle);
                            return newSet;
                          });
                        }}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {!esVentaCredito && (
                            <Checkbox 
                              className="rounded-md h-5 w-5" 
                              checked={state.itemsSeleccionadosParaPagar.has(detalle.idDetalle)}
                              onCheckedChange={() => {}} 
                            />
                          )}
                          <div className="flex flex-col min-w-0">
                            <Label className={cn("text-sm font-bold text-foreground/80 truncate", !esVentaCredito && "cursor-pointer")}>
                              {detalle.cantidad}x {detalle.nombreProducto}
                            </Label>
                            {detalle.saldo < detalle.subtotal && (
                              <span className="text-[9px] font-bold text-orange-600">Saldo: Q{detalle.saldo.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-foreground tabular-nums text-sm ml-2">Q{detalle.saldo.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECCIÓN: DEUDA HISTÓRICA (UNIFICADA) */}
                {tieneDeudaCredito && !esVentaCredito && (
                  <>
                    <Separator className="bg-muted-foreground/10" />
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-muted-foreground tracking-widest px-1">Deuda Histórica</p>
                      <div 
                        className={cn(
                          "flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer",
                          state.incluirCreditoEnPago ? "bg-orange-50 border-orange-400 ring-1 ring-orange-200" : "bg-card border-muted/60 hover:bg-muted/5"
                        )}
                        onClick={() => actions.setIncluirCreditoEnPago(!state.incluirCreditoEnPago)}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox checked={state.incluirCreditoEnPago} onCheckedChange={() => {}} className="h-5 w-5 rounded-md" />
                          <div>
                            <p className={cn("text-sm font-bold", state.incluirCreditoEnPago ? "text-orange-700" : "")}>Total Créditos</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <History className="h-3 w-3 text-muted-foreground" />
                              <p className="text-[10px] text-muted-foreground font-bold tracking-tight">Cierres anteriores</p>
                            </div>
                          </div>
                        </div>
                        <span className={cn("font-bold tabular-nums", state.incluirCreditoEnPago ? "text-orange-700" : "text-foreground")}>
                          Q{state.saldoCreditoCliente.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Footer: Acciones de Pago */}
          <DialogFooter className="p-4 sm:p-6 bg-muted/5 shrink-0 border-t border-muted-foreground/10">
            {state.vistaDialogo === 'pago' ? (
              <div className={cn("grid gap-3 w-full", esVentaCredito ? "grid-cols-2" : "grid-cols-3")}>
                {!esVentaCredito && (
                  <Button 
                    className="rounded-2xl h-16 flex-col bg-orange-600 hover:bg-orange-700 gap-1 font-bold text-[11px] shadow-md border-none text-white transition-transform active:scale-95"
                    onClick={() => actions.setDialogoAbonoAbierto(true)}
                    disabled={state.montoAPagarDialogo <= 0 || state.incluirCreditoEnPago}
                  >
                    <CoinsIcon className="h-5 w-5" /> Abono
                  </Button>
                )}
                <Button 
                  className="rounded-2xl h-16 flex-col bg-blue-600 hover:bg-blue-700 gap-1 font-bold text-[11px] shadow-md border-none text-white transition-transform active:scale-95" 
                  disabled={state.montoAPagarDialogo <= 0}
                  onClick={() => actions.setVistaDialogo('confirmarTarjeta')}
                >
                  <CreditCard className="h-5 w-5" /> Tarjeta
                </Button>
                <Button 
                  className="rounded-2xl h-16 flex-col bg-emerald-600 hover:bg-emerald-700 gap-1 font-bold text-[11px] shadow-md border-none text-white transition-transform active:scale-95" 
                  disabled={state.montoAPagarDialogo <= 0}
                  onClick={() => actions.procederConPago('Efectivo')}
                >
                  <CheckCircle className="h-5 w-5" /> Efectivo
                </Button>
              </div>
            ) : (
              <div className="space-y-4 w-full animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl">
                  <p className="text-sm font-bold text-blue-900 dark:text-blue-300">
                    Confirmar pago con tarjeta por <span className="text-lg">Q{state.montoAPagarDialogo.toFixed(2)}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 rounded-full h-11 font-bold" onClick={() => actions.setVistaDialogo('pago')}>Volver</Button>
                  <Button className="flex-1 rounded-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold" onClick={() => actions.procederConPago('Tarjeta')}>Confirmar</Button>
                </div>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={state.dialogoAbonoAbierto} onOpenChange={state.procesandoGuardado ? undefined : actions.setDialogoAbonoAbierto}>
        <DialogContent className="rounded-2xl font-body border-none shadow-2xl p-0 overflow-hidden max-w-sm">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="font-headline text-xl font-bold">Realizar un Abono</DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground">
              Monto parcial para {state.ventaParaPagar?.nombreCliente}.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 pt-2">
            <div className="rounded-2xl bg-muted/20 p-6 border border-muted/40 flex flex-col items-center">
              <Label htmlFor="monto-abono" className="text-[10px] font-bold tracking-widest text-muted-foreground mb-3">Monto a Recibir (Q)</Label>
              <InputNumero 
                id="monto-abono" 
                ref={refs.abonoInputRef}
                value={state.montoAbono} 
                onChange={(e) => actions.setMontoAbono(e.target.value === '' ? '' : Number(e.target.value))} 
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); actions.manejarConfirmarAbono(); } }}
                placeholder="0.00" 
                className="h-14 text-3xl font-bold text-center rounded-xl border-muted/40 bg-background tabular-nums text-primary"
                autoFocus
                onFocus={(e) => e.target.select()}
              />
            </div>
          </div>
          <DialogFooter className="p-6 bg-muted/5 sm:justify-between flex-col-reverse sm:flex-row gap-3">
            <Button type="button" variant="outline" onClick={() => actions.setDialogoAbonoAbierto(false)} className="rounded-full h-10 px-6 font-bold">Cancelar</Button>
            <Button type="button" onClick={actions.manejarConfirmarAbono} className="rounded-full h-10 px-8 font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md">
              Confirmar Abono
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Consumo Interno */}
      <Dialog open={state.dialogoConsumoInternoAbierto} onOpenChange={actions.setDialogoConsumoInternoAbierto}>
        <DialogContent className="rounded-2xl font-body border-none shadow-2xl p-0 overflow-hidden max-w-sm">
          <DialogHeader className="p-6 pb-2 border-none">
            <DialogTitle className="font-headline text-xl font-bold">Consumo Interno</DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground">Introduce el PIN del cliente autorizado.</DialogDescription>
          </DialogHeader>
          <div className="p-6 pt-2 space-y-6">
            <div className="flex items-center gap-4 p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl">
              <div className="h-10 w-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
                <Gift className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-orange-900 dark:text-orange-300 truncate">{state.ventaParaConsumo?.nombreCliente}</p>
                <p className="text-[10px] font-medium text-orange-700 dark:text-orange-400">Cortesía: Q{(state.ventaParaConsumo?.saldo ?? 0).toFixed(2)}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pin-consumo" className="text-center block text-[10px] font-bold tracking-widest text-muted-foreground">Pin de Autorización</Label>
              <Input 
                id="pin-consumo" 
                type="password" 
                value={state.pinConsumo} 
                onChange={(e) => actions.setPinConsumo(e.target.value)} 
                className="text-center rounded-xl h-12 text-2xl font-bold tracking-[0.5em] border-muted-foreground/20 bg-muted/5"
                placeholder="••••"
                maxLength={4}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); actions.confirmarConsumoInterno(); } }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="p-6 bg-muted/5 sm:justify-between flex-col-reverse sm:flex-row gap-3 border-none">
            <Button type="button" variant="outline" className="rounded-full h-10 font-bold" onClick={() => actions.setDialogoConsumoInternoAbierto(false)}>Cancelar</Button>
            <Button type="button" onClick={actions.confirmarConsumoInterno} className="rounded-full h-10 px-8 font-bold bg-orange-500 hover:bg-orange-600 text-white">Liquidar Cuenta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={state.alertaCancelarVentaAbierta} onOpenChange={actions.setAlertaCancelarVentaAbierta}>
        <AlertDialogContent className="rounded-2xl font-body border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-xl font-bold flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-500" /> ¿Descartar cambios?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium">
              Hay artículos nuevos en el carrito sin guardar. Si continúas, se perderán y volverán al stock automáticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="rounded-full h-10 px-6 font-bold">Permanecer</AlertDialogCancel>
            <AlertDialogAction onClick={actions.manejarConfirmarCancelacion} className="rounded-full h-10 px-8 font-bold bg-destructive text-white hover:bg-destructive/90">Sí, descartar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={state.alertaEliminarAbierta} onOpenChange={state.procesandoGuardado ? undefined : actions.setAlertaEliminarAbierta}>
        <AlertDialogContent className="rounded-3xl font-body border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-2xl font-bold text-destructive flex items-center gap-3">
              <Trash2 className="h-7 w-7" /> ¿Eliminar cliente?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-muted-foreground mt-2 leading-relaxed">
              Estás a punto de borrar permanentemente el registro de <span className="font-black text-foreground">"{state.clienteParaEliminar?.nombre}"</span>. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="rounded-full h-10 px-6 font-bold">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={actions.manejarConfirmarEliminarCliente} className="bg-destructive text-white hover:bg-destructive/90 rounded-full h-10 px-8 font-bold">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={state.alertaCreditoMonedasAbierta} onOpenChange={actions.setAlertaCreditoMonedasAbierta}>
        <AlertDialogContent className="rounded-3xl font-body border-none shadow-2xl">
            <AlertDialogHeader>
                <AlertDialogTitle className="font-headline text-xl font-bold flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-primary" /> Confirmar Crédito
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm font-medium mt-2">
                    ¿Deseas mover esta cuenta a crédito? Se sumará al contador de crédito en tu balance de caja.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6 flex-col sm:flex-row gap-3">
                <AlertDialogCancel className="rounded-full h-11 px-8 font-bold">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => state.ventaParaPagar && actions.confirmarPasarACredito(state.ventaParaPagar)} className="rounded-full h-11 px-10 font-bold bg-primary shadow-lg shadow-primary/20">Confirmar Crédito</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={state.alertaClienteConCreditoAbierta} onOpenChange={actions.setAlertaClienteConCreditoAbierta}>
        <AlertDialogContent className="rounded-3xl font-body border-none shadow-2xl">
            <AlertDialogHeader>
                <AlertDialogTitle className="font-headline text-xl font-bold flex items-center gap-3 text-orange-600">
                    <AlertTriangle className="h-6 w-6" /> Cliente con Deuda
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm font-medium mt-2">
                    Este cliente ya tiene una deuda activa. ¿Deseas abrir una nueva cuenta por separado o prefieres liquidar la deuda anterior primero?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
                <AlertDialogCancel className="rounded-full h-11 px-8 font-bold">Revisar Deuda</AlertDialogCancel>
                <AlertDialogAction onClick={actions.procederAGuardarVenta} className="rounded-full h-11 px-10 font-bold bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-500/20">Continuar Nueva Venta</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
