'use client';

import React from 'react';
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
import {
  AlertTriangle,
  ArrowRight,
  ArrowRightLeft,
  Coins,
  CreditCard,
  Loader2,
  Trash2,
} from 'lucide-react';
import type { VentaAgrupada, PagoConDocId } from '../_hooks/use-historial-ventas';
import { cn } from '@/lib/utils';

interface HistorialDialogsProps {
  ventaAAnular: VentaAgrupada | null;
  setVentaAAnular: (venta: VentaAgrupada | null) => void;
  pagoACambiar: { pago: PagoConDocId; ventaDocId: string } | null;
  setPagoACambiar: (data: { pago: PagoConDocId; ventaDocId: string } | null) => void;
  procesandoAccion: boolean;
  procesandoCambioMetodo: boolean;
  confirmarAnulacion: () => void;
  confirmarCambioMetodo: () => void;
}

export function HistorialDialogs({
  ventaAAnular,
  setVentaAAnular,
  pagoACambiar,
  setPagoACambiar,
  procesandoAccion,
  procesandoCambioMetodo,
  confirmarAnulacion,
  confirmarCambioMetodo,
}: HistorialDialogsProps) {
  const metodoActual = pagoACambiar?.pago.metodoPago;
  const nuevoMetodo = metodoActual === 'Efectivo' ? 'Tarjeta' : 'Efectivo';

  return (
    <>
      {/* Modal de Anulación de Venta */}
      <AlertDialog
        open={!!ventaAAnular}
        onOpenChange={(open) => !open && !procesandoAccion && setVentaAAnular(null)}
      >
        <AlertDialogContent className="rounded-2xl bg-[#1e1e1e] border border-[#2e2e2e] text-slate-100 p-5 max-w-md shadow-2xl space-y-3">
          <AlertDialogHeader className="space-y-2 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <AlertDialogTitle className="font-headline text-base font-bold text-slate-100 leading-tight">
                  ¿Anular Venta {ventaAAnular?.idVenta}?
                </AlertDialogTitle>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  Cliente: {ventaAAnular?.clienteNombre}
                </p>
              </div>
            </div>

            <AlertDialogDescription asChild>
              <div className="rounded-xl bg-[#252526] border border-[#2e2e2e] p-3.5 space-y-2 text-xs text-slate-300 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Monto cobrado a revertir:</span>
                  <span className="font-bold text-sm text-rose-400 tabular-nums">
                    Q{(ventaAAnular?.totalPagadoPeriodo || 0).toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#2e2e2e] text-[0.6875rem] text-slate-400 leading-relaxed">
                  Esta acción descontará los cobros registrados de la caja actual y devolverá al inventario las existencias de los productos consumidos.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex flex-row items-center justify-between gap-2 pt-1 sm:justify-between">
            <AlertDialogCancel
              disabled={procesandoAccion}
              className="mt-0 rounded-full h-9 px-4 text-xs font-medium bg-[#252526] hover:bg-[#2e2e2e] text-slate-200 border border-[#2e2e2e]"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarAnulacion}
              disabled={procesandoAccion}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-full h-9 px-5 text-xs shadow-md"
            >
              {procesandoAccion ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              )}
              Confirmar Anulación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Cambio de Método de Pago */}
      <AlertDialog
        open={!!pagoACambiar}
        onOpenChange={(open) => !open && !procesandoCambioMetodo && setPagoACambiar(null)}
      >
        <AlertDialogContent className="rounded-2xl bg-[#1e1e1e] border border-[#2e2e2e] text-slate-100 p-5 max-w-md shadow-2xl space-y-3">
          <AlertDialogHeader className="space-y-2 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <ArrowRightLeft className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <AlertDialogTitle className="font-headline text-base font-bold text-slate-100 leading-tight">
                  Cambiar Método de Pago
                </AlertDialogTitle>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  Pago {pagoACambiar?.pago.idPago} • {pagoACambiar?.pago.clienteNombre}
                </p>
              </div>
            </div>

            <AlertDialogDescription asChild>
              <div className="rounded-xl bg-[#252526] border border-[#2e2e2e] p-3.5 space-y-3 text-xs text-slate-300 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Monto del pago:</span>
                  <span className="font-bold text-sm text-emerald-400 tabular-nums">
                    Q{(pagoACambiar?.pago.montoTotalPagado || 0).toFixed(2)}
                  </span>
                </div>

                {/* Bloque Interior de Ruta: Método Actual -> Nuevo Método */}
                <div className="rounded-lg bg-[#1e1e1e] border border-[#2e2e2e] p-2.5 flex items-center justify-center gap-3">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 font-semibold px-2.5 py-1 rounded-full text-xs border',
                      metodoActual === 'Efectivo'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                    )}
                  >
                    {metodoActual === 'Efectivo' ? (
                      <Coins className="h-3.5 w-3.5" />
                    ) : (
                      <CreditCard className="h-3.5 w-3.5" />
                    )}
                    {metodoActual}
                  </span>

                  <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />

                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 font-semibold px-2.5 py-1 rounded-full text-xs border',
                      nuevoMetodo === 'Efectivo'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                    )}
                  >
                    {nuevoMetodo === 'Efectivo' ? (
                      <Coins className="h-3.5 w-3.5" />
                    ) : (
                      <CreditCard className="h-3.5 w-3.5" />
                    )}
                    {nuevoMetodo}
                  </span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex flex-row items-center justify-between gap-2 pt-1 sm:justify-between">
            <AlertDialogCancel
              disabled={procesandoCambioMetodo}
              className="mt-0 rounded-full h-9 px-4 text-xs font-medium bg-[#252526] hover:bg-[#2e2e2e] text-slate-200 border border-[#2e2e2e]"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarCambioMetodo}
              disabled={procesandoCambioMetodo}
              className="bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-full h-9 px-5 text-xs shadow-md"
            >
              {procesandoCambioMetodo ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <ArrowRightLeft className="mr-1.5 h-3.5 w-3.5" />
              )}
              Confirmar Cambio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

