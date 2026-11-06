'use client';

import React from 'react';
import type { PagoVisual } from '../_hooks/use-control-pagos';
import { 
  AccordionItem, AccordionTrigger, AccordionContent 
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, User, Split, ReceiptText, ExternalLink, Printer 
} from 'lucide-react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ControlPagosCardProps {
  pago: PagoVisual;
  operadorNombre: string;
  filtroTexto: string;
  onImprimirTicket: (pago: PagoVisual) => void;
}

export function ControlPagosCard({
  pago,
  operadorNombre,
  filtroTexto,
  onImprimirTicket,
}: ControlPagosCardProps) {
  const qLower = filtroTexto.trim().toLowerCase();

  const getBadgeStyle = (metodo: string) => {
    switch (metodo) {
      case 'Efectivo':
        return 'bg-emerald-600/90 text-white';
      case 'Tarjeta':
        return 'bg-blue-600/90 text-white';
      case 'Consumo Interno':
        return 'bg-purple-600/90 text-white';
      default:
        return 'bg-[#1d283a] text-slate-300 border-app-border';
    }
  };

  return (
    <AccordionItem
      value={pago.id}
      className="border border-app-border rounded-xl bg-app-surface hover:border-sky-500/40 transition-all overflow-hidden shadow-xs"
    >
      <AccordionTrigger className="p-3.5 sm:p-4 hover:no-underline font-body transition-colors data-[state=open]:bg-[#1d283a]/60">
        <div className="flex flex-1 items-center justify-between w-full pr-2 sm:pr-4 gap-3">
          {/* Identificación: ID Pago, Cliente y Ventas */}
          <div className="min-w-0 text-left space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-xs sm:text-sm text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                {pago.idsPagoTexto}
              </span>
              <span className="font-bold text-sm sm:text-base text-slate-100 truncate max-w-[180px] sm:max-w-[280px]">
                {pago.clienteNombre}
              </span>

              {pago.esMultiventa ? (
                <Badge className="bg-indigo-600 hover:bg-indigo-500 text-white border-none text-[10px] font-medium rounded-full flex items-center gap-1">
                  <Split className="h-3 w-3" />
                  Cubrió {pago.ventas.length} ventas ({pago.ventas.map(v => `#${v.idVenta}`).join(', ')})
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] font-medium border-app-border text-muted-foreground bg-[#1d283a] rounded-full hidden sm:inline-flex">
                  Venta #{pago.ventas[0]?.idVenta}
                </Badge>
              )}
            </div>

            {/* Fecha, hora y operador */}
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="h-3 w-3 text-sky-400" />
                {format(pago.fecha, 'dd/MM/yyyy hh:mm:ss a')}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <User className="h-3 w-3 text-emerald-400" />
                {operadorNombre}
              </span>
              <span className="hidden md:inline">•</span>
              <span className="text-muted-foreground hidden md:inline">
                {formatDistanceToNow(pago.fecha, { addSuffix: true, locale: es })}
              </span>
            </div>
          </div>

          {/* Monto pagado y método */}
          <div className="text-right flex flex-col items-end shrink-0 ml-2">
            <span className="font-black text-emerald-400 font-mono text-base sm:text-lg leading-tight">
              Q{pago.montoTotalPagado.toFixed(2)}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge className={cn("h-5 text-[9.5px] font-medium rounded-full px-2", getBadgeStyle(pago.metodoPago))}>
                {pago.metodoPago}
              </Badge>
            </div>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4 pt-1">
        <div className="border-t border-app-border pt-4 mt-1 space-y-4">
          
          {/* Banner Multi-Venta */}
          {pago.esMultiventa && (
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300">
                  <Split className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Pago unificado de Q{pago.montoTotalPagado.toFixed(2)}</p>
                  <p className="text-[11px] text-indigo-300/80">
                    Este pago único se distribuyó entre {pago.ventas.length} ventas a crédito pendientes del cliente.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {pago.ventas.map(v => (
                  <Badge key={v.idVenta} variant="outline" className="border-indigo-400/40 bg-indigo-900/30 text-white font-mono text-[10px] rounded-full">
                    Venta #{v.idVenta}: Q{v.montoPagadoVenta.toFixed(2)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Desglose por venta */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
              <ReceiptText className="h-3.5 w-3.5 text-sky-400" />
              Distribución de ventas y artículos cubiertos
            </h4>

            <div className="space-y-3">
              {pago.ventas.map((v) => {
                const esVentaLiquidadaTotal = v.ventaTotal && Math.abs(v.montoPagadoVenta - v.ventaTotal) < 0.05;

                return (
                  <div key={v.idVenta} className="rounded-xl border border-app-border bg-[#1d283a] p-3.5 space-y-3">
                    {/* Encabezado de la Venta */}
                    <div className="flex items-center justify-between pb-2 border-b border-app-border/60 flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                          Venta #{v.idVenta}
                        </span>
                        <span className="text-xs font-medium text-slate-200">
                          Cubierto por este pago: <span className="text-emerald-400 font-bold font-mono">Q{v.montoPagadoVenta.toFixed(2)}</span>
                        </span>
                        {v.ventaTotal && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            (Total: Q{v.ventaTotal.toFixed(2)})
                          </span>
                        )}
                        <Badge className={cn("text-[9px] font-medium rounded-full px-2 h-4", esVentaLiquidadaTotal ? "bg-emerald-600 text-white" : "bg-amber-600 text-white")}>
                          {esVentaLiquidadaTotal ? 'Liquidada al 100%' : 'Abono'}
                        </Badge>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-7 text-[11px] font-medium text-sky-400 hover:text-white hover:bg-app-surface px-2.5 rounded-full"
                      >
                        <Link href={`/dashboard/historial-ventas?ventaId=${v.ventaDocId}`}>
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Ver Venta #{v.idVenta}
                        </Link>
                      </Button>
                    </div>

                    {/* Artículos saldados */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-medium text-muted-foreground block">
                        Artículos saldados en Venta #{v.idVenta}:
                      </span>
                      {v.itemsSaldados && v.itemsSaldados.length > 0 ? (
                        v.itemsSaldados.map((it, iIdx) => {
                          const coincide = qLower && (it.nombreProducto?.toLowerCase().includes(qLower) || it.idProducto?.toLowerCase().includes(qLower));

                          return (
                            <div
                              key={iIdx}
                              className={cn(
                                "flex justify-between items-center p-2.5 rounded-lg border text-xs transition-colors",
                                coincide
                                  ? "bg-sky-500/15 border-sky-500 text-sky-200"
                                  : "bg-app-surface border-app-border text-slate-200"
                              )}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="font-bold text-slate-100 bg-[#1d283a] px-2 py-0.5 rounded-full text-[11px] border border-app-border">
                                  {it.cantidad || 1}x
                                </span>
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-100 truncate text-xs flex items-center gap-1.5">
                                    <span>{it.nombreProducto}</span>
                                    {it.esVirtual && (
                                      <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 border-purple-500/30 text-purple-400 bg-purple-500/10">
                                        Virtual
                                      </Badge>
                                    )}
                                  </div>
                                  {it.subtotalItem && (
                                    <span className="text-[9.5px] text-muted-foreground font-mono">
                                      Subtotal: Q{it.subtotalItem.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-right flex flex-col items-end shrink-0 ml-2">
                                <span className="font-bold text-emerald-400 font-mono text-xs">
                                  Q{(it.montoAplicado || 0).toFixed(2)}
                                </span>
                                <span className="text-[9px] text-muted-foreground">
                                  Aplicado
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-2 text-center text-xs text-muted-foreground bg-app-surface/40 rounded-lg">
                          Abono directo al saldo de la venta sin desglose de ítems.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Botón Imprimir Comprobante */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-app-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onImprimirTicket(pago)}
              className="h-8 rounded-full text-xs font-medium bg-[#1d283a] border-app-border text-slate-100 hover:bg-app-surface gap-1.5"
            >
              <Printer className="h-3.5 w-3.5 text-sky-400" />
              <span>Imprimir comprobante unificado</span>
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
