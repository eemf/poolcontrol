'use client';

import React from 'react';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/permission-guard';
import {
  Coins,
  CreditCard,
  Trash2,
  ArrowRightLeft,
  CalendarDays,
  Gift,
  ShoppingBag,
  Receipt,
  User,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';
import type { VentaAgrupada, PagoConDocId } from '../_hooks/use-historial-ventas';
import { cn } from '@/lib/utils';

interface HistorialVentaItemProps {
  venta: VentaAgrupada;
  onAnular: (venta: VentaAgrupada) => void;
  onCambiarMetodo: (pago: PagoConDocId, ventaDocId: string) => void;
}

const toDate = (fecha: any): Date => {
  if (fecha instanceof Timestamp) return fecha.toDate();
  if (fecha instanceof Date) return fecha;
  if (typeof fecha === 'string') {
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(0);
};

export function HistorialVentaItem({
  venta,
  onAnular,
  onCambiarMetodo,
}: HistorialVentaItemProps) {
  const {
    ventaDocId,
    idVenta,
    clienteNombre,
    totalPagadoPeriodo,
    ventaTotal,
    saldoActual,
    pagos,
    ultimoTurnoLabel,
    ventaOriginal,
  } = venta;

  const esConsumoInterno =
    ventaOriginal?.metodoPago === 'Consumo Interno' ||
    pagos.every((p) => p.metodoPago === 'Consumo Interno');

  const fechaUltimoPago = pagos[0]?.fecha;
  const esVentaLiquidada = saldoActual <= 0.01;

  // Lista de artículos consumidos en la venta
  const articulosConsumidos =
    ventaOriginal?.detalles && ventaOriginal.detalles.length > 0
      ? ventaOriginal.detalles
      : null;

  return (
    <AccordionItem
      value={ventaDocId}
      className="border border-[#324157] rounded-xl overflow-hidden bg-[#283244] shadow-sm transition-colors"
    >
      {/* Encabezado Principal Compacto y Organizado */}
      <AccordionTrigger className="px-3.5 py-2.5 sm:px-4 sm:py-3 hover:no-underline hover:bg-[#324157]/30 transition-colors data-[state=open]:border-b data-[state=open]:border-[#324157]">
        <div className="flex flex-col w-full pr-2 sm:pr-3 gap-1.5 text-left">
          {/* Fila 1: Cliente y badges a la izquierda / Estado y Total a la derecha */}
          <div className="flex items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <User className="h-4 w-4 text-sky-400 shrink-0" />
              <span className="font-bold text-sm sm:text-base leading-tight text-slate-100 truncate">
                {clienteNombre}
              </span>
              {esConsumoInterno && (
                <Badge className="bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-semibold h-4.5 rounded-full px-2 shrink-0 inline-flex items-center gap-1">
                  <Gift className="h-2.5 w-2.5" />
                  Cortesía
                </Badge>
              )}
              {ultimoTurnoLabel && ultimoTurnoLabel === 'Turno actual' && (
                <Badge className="bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[10px] font-medium h-4.5 rounded-full px-2 shrink-0">
                  Turno Actual
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {esVentaLiquidada ? (
                <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] sm:text-[11px] font-semibold h-5 rounded-full px-2 inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Pagada
                </Badge>
              ) : (
                <Badge className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] sm:text-[11px] font-semibold h-5 rounded-full px-2 inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Pendiente: Q{saldoActual.toFixed(2)}
                </Badge>
              )}
              <span
                className={cn(
                  'font-bold text-sm sm:text-base tabular-nums',
                  esVentaLiquidada ? 'text-emerald-400' : 'text-slate-100'
                )}
              >
                Q{ventaTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Fila 2: Folio de venta y fecha a la izquierda / Monto abonado a la derecha si no está saldada */}
          <div className="flex items-center justify-between text-xs text-slate-400 gap-2 w-full pt-0.5">
            <div className="flex items-center gap-2 min-w-0 truncate text-[11px]">
              <span className="font-mono bg-[#1d283a] px-2 py-0.5 rounded-full border border-[#324157] text-[10px] font-bold text-sky-400 shrink-0">
                Venta {idVenta}
              </span>
              {fechaUltimoPago && (
                <span className="flex items-center gap-1 truncate text-slate-400">
                  <CalendarDays className="h-3 w-3 text-slate-500 shrink-0" />
                  {format(toDate(fechaUltimoPago), 'dd/MM/yyyy • hh:mm a', { locale: es })}
                </span>
              )}
            </div>

            {!esVentaLiquidada && totalPagadoPeriodo > 0 && (
              <span className="text-[11px] font-semibold text-emerald-400 tabular-nums shrink-0">
                Abonado: Q{totalPagadoPeriodo.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </AccordionTrigger>

      {/* Contenido Expandido: Dos Bloques Limpios Sin Duplicidad */}
      <AccordionContent className="p-3.5 sm:p-4 bg-[#1d283a] space-y-3.5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {/* Bloque 1: Artículos Consumidos con indicación directa de pago */}
          <div className="p-3.5 rounded-xl bg-[#283244] border border-[#324157] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#324157]">
                <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5 text-sky-400" />
                  Artículos Consumidos
                </h4>
                <span className="text-[11px] text-slate-400">
                  {articulosConsumidos ? articulosConsumidos.length : 1} producto(s)
                </span>
              </div>

              <div className="divide-y divide-[#324157]/40 my-1 text-xs">
                {articulosConsumidos ? (
                  articulosConsumidos.map((det, idx) => {
                    const subtotal = det.subtotal || det.precioUnitario * det.cantidad;
                    const saldo = typeof det.saldo === 'number' ? det.saldo : (esVentaLiquidada ? 0 : subtotal);
                    const pagado = Math.max(0, subtotal - saldo);
                    const estaSaldado = saldo <= 0.01;
                    const tieneAbonoParcial = pagado > 0.01 && !estaSaldado;

                    // Identificar qué pago(s) y montos cubrieron este artículo
                    const pagosArticulo = pagos
                      .map((p) => {
                        const item = p.itemsSaldados?.find(
                          (it) =>
                            (it.idDetalle && it.idDetalle === det.idDetalle) ||
                            it.nombreProducto === det.nombreProducto
                        );
                        if (!item || (item.montoAplicado ?? 0) <= 0) return null;
                        return {
                          idPago: p.idPago,
                          monto: item.montoAplicado,
                        };
                      })
                      .filter(Boolean) as { idPago: number; monto: number }[];

                    const pagosTexto =
                      pagosArticulo.length > 1
                        ? pagosArticulo.map((p) => `Pago ${p.idPago}: Q${p.monto.toFixed(2)}`).join(' + ')
                        : pagosArticulo.length === 1
                        ? `Pago ${pagosArticulo[0].idPago}: Q${pagosArticulo[0].monto.toFixed(2)}`
                        : null;

                    return (
                      <div key={idx} className="py-2.5 flex items-center justify-between gap-2">
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="truncate text-slate-200 font-medium">
                            <strong className="text-sky-400 mr-1.5">{det.cantidad}x</strong>
                            {det.nombreProducto}
                          </span>

                          <div className="flex items-center gap-1 text-[11px] mt-0.5 flex-wrap">
                            {estaSaldado ? (
                              <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 shrink-0" />
                                Pagado {pagosTexto ? `(${pagosTexto})` : 'completo'}
                              </span>
                            ) : tieneAbonoParcial ? (
                              <span className="text-amber-300 font-medium inline-flex items-center gap-1">
                                <Clock className="h-3 w-3 shrink-0" />
                                Abonado Q{pagado.toFixed(2)} {pagosTexto ? `(${pagosTexto})` : ''} • Debe Q{saldo.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-slate-400">
                                Sin abonar (Debe Q{subtotal.toFixed(2)})
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="font-bold text-slate-100 tabular-nums shrink-0 text-xs sm:text-sm">
                          Q{subtotal.toFixed(2)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-2.5 text-xs text-slate-300">
                    Consumo registrado en la venta
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2.5 border-t border-[#324157] flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Total Consumo:</span>
              <span className="font-bold text-slate-100 text-sm tabular-nums">
                Q{ventaTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Bloque 2: Comprobantes de Pago Directos (Sin repetir lista de productos) */}
          <div className="p-3.5 rounded-xl bg-[#283244] border border-[#324157] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#324157]">
                <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Receipt className="h-3.5 w-3.5 text-emerald-400" />
                  Historial de Pagos y Abonos
                </h4>
                <span className="text-[11px] text-slate-400">
                  {pagos.length} {pagos.length === 1 ? 'pago' : 'pagos'}
                </span>
              </div>

              <div className="divide-y divide-[#324157]/40 my-1 text-xs">
                {pagos.map((pago) => {
                  const esPagoCortesia = pago.metodoPago === 'Consumo Interno';
                  const esEfectivo = pago.metodoPago === 'Efectivo';
                  const esAbonoCompartido =
                    pago.totalOperacion && pago.totalOperacion > pago.montoTotalPagado;

                  return (
                    <div key={pago.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-200">
                            Pago {pago.idPago}
                          </span>

                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px] h-5 px-2 rounded-full font-medium border inline-flex items-center gap-1',
                              esPagoCortesia
                                ? 'border-purple-500/30 text-purple-300 bg-purple-500/15'
                                : esEfectivo
                                ? 'border-amber-500/30 text-amber-300 bg-amber-500/15'
                                : 'border-sky-500/30 text-sky-300 bg-sky-500/15'
                            )}
                          >
                            {esPagoCortesia ? (
                              <Gift className="h-2.5 w-2.5" />
                            ) : esEfectivo ? (
                              <Coins className="h-2.5 w-2.5" />
                            ) : (
                              <CreditCard className="h-2.5 w-2.5" />
                            )}
                            {esPagoCortesia ? 'Cortesía' : pago.metodoPago}
                          </Badge>

                          {esAbonoCompartido && (
                            <span className="text-[10px] text-amber-300/90 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-medium">
                              Parte de abono Q{(pago.totalOperacion || 0).toFixed(2)}
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-slate-400 mt-0.5">
                          {format(toDate(pago.fecha), 'dd/MM/yyyy hh:mm a', { locale: es })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-emerald-400 text-sm sm:text-base tabular-nums">
                          Q{pago.montoTotalPagado.toFixed(2)}
                        </span>

                        {!esPagoCortesia && (
                          <PermissionGuard permission="ventas.anular">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => onCambiarMetodo(pago, ventaDocId)}
                              className={cn(
                                'h-6 rounded-full px-2.5 text-[10px] font-semibold border transition-colors',
                                esEfectivo
                                  ? 'bg-sky-500/15 hover:bg-sky-500 text-sky-300 hover:text-slate-950 border-sky-500/30'
                                  : 'bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border-amber-500/30'
                              )}
                            >
                              <ArrowRightLeft className="h-2.5 w-2.5 mr-1" />
                              {esEfectivo ? 'A Tarjeta' : 'A Efectivo'}
                            </Button>
                          </PermissionGuard>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Balance Financiero Final */}
            <div className="pt-2.5 border-t border-[#324157] space-y-1 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-medium">Total Cobrado:</span>
                <span className="font-bold text-emerald-400 tabular-nums">
                  Q{totalPagadoPeriodo.toFixed(2)}
                </span>
              </div>
              {!esVentaLiquidada ? (
                <div className="flex justify-between items-center text-amber-300 font-semibold">
                  <span>Resta por Pagar:</span>
                  <span className="tabular-nums">Q{saldoActual.toFixed(2)}</span>
                </div>
              ) : (
                <div className="flex justify-between items-center text-emerald-400 font-semibold">
                  <span>Balance:</span>
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Cuenta Saldada
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Acciones Generales de la Venta */}
        <div className="flex justify-end pt-2 border-t border-[#324157]">
          <PermissionGuard permission="ventas.anular">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onAnular(venta)}
              className="h-8 rounded-full px-3.5 text-xs font-semibold bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-colors shadow-sm"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Anular Venta Completa
            </Button>
          </PermissionGuard>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
