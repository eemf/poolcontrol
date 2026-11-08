'use client';

import React from 'react';
import type { PagoVisual } from '../_hooks/use-control-pagos';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ReceiptText, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ControlPagosTicketDialogProps {
  pago: PagoVisual | null;
  onClose: () => void;
  sucursalNombre?: string;
  operadorNombre: string;
}

export function ControlPagosTicketDialog({
  pago,
  onClose,
  sucursalNombre,
  operadorNombre,
}: ControlPagosTicketDialogProps) {
  if (!pago) return null;

  return (
    <Dialog open={!!pago} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-app-surface border-app-border text-foreground p-6 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-slate-100">
              <ReceiptText className="h-5 w-5 text-sky-400" />
              Comprobante de Pago
            </DialogTitle>
            <Badge className="text-[10px] font-medium rounded-full bg-sky-600 text-white">
              {pago.metodoPago}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Comprobante oficial de cobro y liquidación.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2 text-xs">
          {/* Encabezado del Ticket */}
          <div className="bg-[#1e1e1e] p-4 rounded-xl border border-app-border text-center space-y-1">
            <h3 className="font-bold text-sm text-slate-100">
              {sucursalNombre || 'Pool Control'}
            </h3>
            <p className="text-[11px] text-muted-foreground font-mono">
              Comprobante {pago.idsPagoTexto}
            </p>
            <div className="text-[10px] text-muted-foreground pt-1 border-t border-app-border mt-1">
              {format(pago.fecha, "dd 'de' MMMM, yyyy - hh:mm:ss a", { locale: es })}
            </div>
          </div>

          {/* Datos de la Operación */}
          <div className="space-y-1.5 bg-[#1e1e1e] p-3 rounded-xl border border-app-border">
            <div className="flex justify-between py-1 border-b border-app-border/40">
              <span className="text-muted-foreground font-medium">Cliente:</span>
              <span className="font-bold text-slate-100">{pago.clienteNombre}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-app-border/40">
              <span className="text-muted-foreground font-medium">Ventas cubiertas:</span>
              <span className="font-mono font-bold text-sky-400">
                {pago.ventas.map(v => `#${v.idVenta}`).join(', ')}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-app-border/40">
              <span className="text-muted-foreground font-medium">Operador / Cajero:</span>
              <span className="font-bold text-emerald-400">{operadorNombre}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground font-medium">Método de pago:</span>
              <span className="font-bold text-slate-100">{pago.metodoPago}</span>
            </div>
          </div>

          {/* Desglose por Ventas en el Ticket */}
          <div className="space-y-2">
            <p className="text-[10px] font-medium text-muted-foreground">
              Distribución en ventas y artículos
            </p>
            <div className="max-h-[180px] overflow-y-auto space-y-2 pr-1">
              {pago.ventas.map((v) => (
                <div key={v.idVenta} className="p-2.5 rounded-xl bg-[#1e1e1e] border border-app-border space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-100 pb-1 border-b border-app-border/60">
                    <span className="text-sky-400 font-mono">Venta #{v.idVenta}</span>
                    <span className="text-emerald-400 font-mono">Q{v.montoPagadoVenta.toFixed(2)}</span>
                  </div>
                  <div className="space-y-1">
                    {v.itemsSaldados?.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px] text-muted-foreground">
                        <span>{it.cantidad || 1}x {it.nombreProducto}</span>
                        <span className="font-mono text-slate-300">Q{(it.montoAplicado || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Destacado */}
          <div className="flex justify-between items-center bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl">
            <span className="font-bold text-sm text-slate-100">Monto total pagado:</span>
            <span className="font-black text-lg text-emerald-400 font-mono">
              Q{pago.montoTotalPagado.toFixed(2)}
            </span>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-full bg-[#1e1e1e] border-app-border text-slate-200 hover:bg-app-surface"
          >
            Cerrar
          </Button>

          <Button
            size="sm"
            onClick={() => window.print()}
            className="rounded-full bg-sky-600 text-white hover:bg-sky-500 font-bold gap-2"
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
