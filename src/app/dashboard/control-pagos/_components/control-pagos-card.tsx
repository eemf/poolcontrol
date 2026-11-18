'use client';

import React from 'react';
import type { PagoVisual } from '../_hooks/use-control-pagos';
import { 
  AccordionItem, AccordionTrigger, AccordionContent 
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, User, Split, ReceiptText, ExternalLink, Banknote, CreditCard, Coins 
} from 'lucide-react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ControlPagosCardProps {
  pago: PagoVisual;
  operadorNombre: string;
  filtroTexto: string;
}

export function ControlPagosCard({
  pago,
  operadorNombre,
  filtroTexto,
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
        return 'bg-[#1e1e1e] text-slate-300 border-app-border';
    }
  };

  const getMetodoIcon = (metodo: string) => {
    switch (metodo) {
      case 'Efectivo':
        return (
          <div className="hidden sm:flex w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 items-center justify-center shrink-0">
            <Banknote className="h-4 w-4" />
          </div>
        );
      case 'Tarjeta':
        return (
          <div className="hidden sm:flex w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 items-center justify-center shrink-0">
            <CreditCard className="h-4 w-4" />
          </div>
        );
      case 'Consumo Interno':
        return (
          <div className="hidden sm:flex w-9 h-9 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-400 items-center justify-center shrink-0">
            <Coins className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="hidden sm:flex w-9 h-9 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-400 items-center justify-center shrink-0">
            <ReceiptText className="h-4 w-4" />
          </div>
        );
    }
  };

  return (
    <AccordionItem
      value={pago.id}
      className="border border-[#2e2e2e] rounded-xl bg-[#252526] hover:border-[#383838] transition-all overflow-hidden shadow-xs"
    >
      <AccordionTrigger className="p-3 sm:p-3.5 hover:no-underline font-body transition-colors hover:bg-[#2e2e2e]/30 data-[state=open]:border-b data-[state=open]:border-[#2e2e2e]">
        <div className="flex flex-1 items-center justify-between w-full pr-2 sm:pr-4 gap-3">
          {/* Icono identificativo (solo vista normal sm+) + Identificación */}
          <div className="flex items-center gap-0 sm:gap-3 min-w-0 text-left">
            {getMetodoIcon(pago.metodoPago)}

            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold tabular-nums text-xs sm:text-sm text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                  {pago.idsPagoTexto}
                </span>
                <span className="font-bold text-sm sm:text-base text-slate-100 truncate max-w-[160px] sm:max-w-[280px]">
                  {pago.clienteNombre}
                </span>

                {pago.esMultiventa ? (
                  <Badge className="bg-indigo-600 hover:bg-indigo-500 text-white border-none text-[10px] font-medium rounded-full flex items-center gap-1">
                    <Split className="h-3 w-3" />
                    Cubrió {pago.ventas.length} ventas ({pago.ventas.map(v => `#${v.idVenta}`).join(', ')})
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] font-medium border-app-border text-muted-foreground bg-[#1e1e1e] rounded-full hidden sm:inline-flex">
                    Venta #{pago.ventas[0]?.idVenta}
                  </Badge>
                )}
              </div>

              {/* Fecha, hora y operador */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1 text-slate-300">
                  <Clock className="h-3 w-3 text-sky-400 shrink-0" />
                  {format(pago.fecha, 'dd/MM/yyyy hh:mm:ss a')}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <User className="h-3 w-3 text-emerald-400 shrink-0" />
                  {operadorNombre}
                </span>
                <span className="hidden md:inline">•</span>
                <span className="text-muted-foreground hidden md:inline">
                  {formatDistanceToNow(pago.fecha, { addSuffix: true, locale: es })}
                </span>
              </div>
            </div>
          </div>

          {/* Monto pagado y método */}
          <div className="text-right flex flex-col items-end shrink-0 ml-2">
            <span className="font-bold tabular-nums text-emerald-400 text-base sm:text-lg leading-tight">
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

      <AccordionContent className="p-3.5 sm:p-4 bg-[#1e1e1e]">
        <div className="space-y-3.5">
          
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
                  <Badge key={v.idVenta} variant="outline" className="border-indigo-400/40 bg-indigo-900/30 text-white font-bold tabular-nums text-[10px] rounded-full">
                    Venta #{v.idVenta}: Q{v.montoPagadoVenta.toFixed(2)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Desglose directo por venta sin segundo contenedor redundante */}
          <div className="space-y-3">
            {pago.ventas.map((v, vIdx) => {
              const esVentaLiquidadaTotal = v.ventaTotal && Math.abs(v.montoPagadoVenta - v.ventaTotal) < 0.05;

              return (
                <div
                  key={v.idVenta}
                  className={cn(
                    'space-y-2.5',
                    vIdx > 0 && 'pt-3 border-t border-[#2e2e2e]'
                  )}
                >
                  {/* Encabezado limpio y ordenado de la Venta */}
                  <div className="space-y-1.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-2">
                    <div className="flex items-center justify-between sm:justify-start gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold tabular-nums text-xs text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                          Venta #{v.idVenta}
                        </span>
                        <Badge className={cn("text-[10px] font-semibold rounded-full px-2 h-5", esVentaLiquidadaTotal ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/15 text-amber-400 border border-amber-500/30")}>
                          {esVentaLiquidadaTotal ? 'Liquidada al 100%' : 'Abono'}
                        </Badge>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="sm:hidden h-7 text-[11px] font-medium text-sky-400 hover:text-white hover:bg-[#252526] px-2 rounded-full shrink-0"
                      >
                        <Link href={`/dashboard/historial-ventas?ventaId=${v.ventaDocId}`}>
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Ver Venta
                        </Link>
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-slate-200">
                        Cubierto: <span className="text-emerald-400 font-bold tabular-nums">Q{v.montoPagadoVenta.toFixed(2)}</span>
                      </span>
                      {v.ventaTotal && (
                        <span className="text-[11px] text-slate-400 tabular-nums">
                          (Total: Q{v.ventaTotal.toFixed(2)})
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="hidden sm:inline-flex h-7 text-[11px] font-medium text-sky-400 hover:text-white hover:bg-[#252526] px-2.5 rounded-full"
                      >
                        <Link href={`/dashboard/historial-ventas?ventaId=${v.ventaDocId}`}>
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Ver Venta #{v.idVenta}
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Artículos saldados directamente en tarjetas #252526 */}
                  <div className="space-y-1.5">
                    {v.itemsSaldados && v.itemsSaldados.length > 0 ? (
                      v.itemsSaldados.map((it, iIdx) => {
                        const coincide = qLower && (it.nombreProducto?.toLowerCase().includes(qLower) || it.idProducto?.toLowerCase().includes(qLower));

                        return (
                          <div
                            key={iIdx}
                            className={cn(
                              "flex justify-between items-center p-2.5 rounded-xl border text-xs transition-colors",
                              coincide
                                ? "bg-sky-500/15 border-sky-500 text-sky-200"
                                : "bg-[#252526] border-[#2e2e2e] text-slate-200"
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="font-bold text-slate-100 bg-[#1e1e1e] px-2 py-0.5 rounded-full text-[11px] border border-[#2e2e2e] tabular-nums shrink-0">
                                {it.cantidad || 1}x
                              </span>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-100 truncate text-xs flex items-center gap-1.5">
                                  <span>{it.nombreProducto}</span>
                                  {it.esVirtual && (
                                    <Badge variant="outline" className="text-[8px] px-1.5 py-0 h-3.5 border-purple-500/30 text-purple-400 bg-purple-500/10 rounded-full">
                                      Virtual
                                    </Badge>
                                  )}
                                </div>
                                {it.subtotalItem && (
                                  <span className="text-[10px] text-slate-400 tabular-nums">
                                    Subtotal: Q{it.subtotalItem.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-right flex flex-col items-end shrink-0 ml-2">
                              <span className="font-bold text-emerald-400 tabular-nums text-xs">
                                Q{(it.montoAplicado || 0).toFixed(2)}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Aplicado
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-2.5 text-center text-xs text-slate-400 bg-[#252526] border border-[#2e2e2e] rounded-xl">
                        Abono directo al saldo de la venta sin desglose de ítems.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
