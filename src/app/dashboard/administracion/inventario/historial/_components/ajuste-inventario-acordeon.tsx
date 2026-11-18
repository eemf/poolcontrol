'use client';

import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import {
  Boxes,
  Clock,
  MessageSquare,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AjusteConId } from '../_hooks/use-historial-ajustes';

interface AjusteInventarioAcordeonProps {
  ajuste: AjusteConId;
}

export function AjusteInventarioAcordeon({ ajuste }: AjusteInventarioAcordeonProps) {
  const fechaAjuste = ajuste.fecha?.toDate ? ajuste.fecha.toDate() : new Date();
  const detalles = ajuste.detalles || [];
  const totalModificados = detalles.filter((d) => d.diferencia !== 0).length;

  const renderDiferencia = (diferencia: number) => {
    const esPositiva = diferencia > 0;
    const Icono = esPositiva ? ArrowUp : ArrowDown;

    return (
      <span
        className={cn(
          'font-black inline-flex items-center justify-center gap-0.5 tabular-nums text-xs',
          esPositiva ? 'text-emerald-400' : 'text-rose-400'
        )}
      >
        <Icono className="h-3.5 w-3.5 shrink-0" />
        {esPositiva ? '+' : ''}
        {diferencia}
      </span>
    );
  };

  return (
    <AccordionItem
      value={ajuste.id}
      className="border border-[#2e2e2e] rounded-xl transition-all overflow-hidden bg-[#252526] shadow-sm hover:border-[#383838]"
    >
      <AccordionTrigger className="px-3.5 py-3 sm:px-4 sm:py-3.5 hover:no-underline text-white hover:bg-[#313131]/50 transition-colors data-[state=open]:border-b data-[state=open]:border-[#2e2e2e]">
        <div className="grid grid-cols-[1fr_auto] gap-2.5 sm:gap-4 items-center w-full pr-1.5 sm:pr-2.5 text-left">
          {/* Columna 1: Ajuste # y Fecha + Hora */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400">
              <Boxes className="h-4 w-4" />
            </div>

            <div className="flex flex-col justify-between gap-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-white leading-tight tabular-nums">
                  Ajuste #{ajuste.idAjuste}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 font-medium truncate">
                <Clock className="h-3 w-3 text-slate-500 shrink-0" />
                <span className="sm:hidden truncate">
                  {format(fechaAjuste, 'dd/MM/yyyy • hh:mm a', { locale: es })}
                </span>
                <span className="hidden sm:inline truncate">
                  {format(fechaAjuste, "dd 'de' LLLL, yyyy • hh:mm a", { locale: es })}
                </span>
              </div>
            </div>
          </div>

          {/* Columna 2: Número de Productos */}
          <div className="flex flex-col items-end justify-center gap-1 shrink-0 text-right">
            <Badge className="font-bold rounded-full px-2.5 py-0.5 bg-sky-500/15 text-sky-400 border border-sky-500/30 inline-flex items-center gap-1 tabular-nums">
              <span className="text-xs">{detalles.length}</span>
              <span className="text-[11px] whitespace-nowrap">
                <span className="sm:hidden">{detalles.length === 1 ? 'prod.' : 'prods.'}</span>
                <span className="hidden sm:inline">
                  {detalles.length === 1 ? 'producto' : 'productos'}
                </span>
              </span>
            </Badge>
            {totalModificados > 0 ? (
              <span className="text-[10px] font-semibold text-amber-400 tabular-nums">
                {totalModificados} {totalModificados === 1 ? 'modificado' : 'modificados'}
              </span>
            ) : (
              <span className="text-[10px] font-medium text-emerald-400">
                Sin diferencias
              </span>
            )}
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="p-3.5 sm:p-4 bg-[#1e1e1e]">
        <div className="space-y-3.5">
          {ajuste.observaciones && (
            <div className="bg-[#252526] p-3 rounded-xl border border-dashed border-[#2e2e2e] flex items-start gap-2.5 text-xs">
              <MessageSquare className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-300 mb-0.5">Observaciones</p>
                <p className="text-slate-400 italic leading-relaxed">
                  &ldquo;{ajuste.observaciones}&rdquo;
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {detalles.map((detalle) => {
              const huboModificacion = detalle.diferencia !== 0;
              const existenciaSistema =
                detalle.existenciaSistema ?? detalle.existenciaFisica - detalle.diferencia;

              // Si NO hubo modificación, se muestra de forma normal (nombre y existencia)
              if (!huboModificacion) {
                return (
                  <div
                    key={detalle.productoId}
                    className="flex items-center justify-between px-3.5 py-2.5 bg-[#252526] rounded-xl border border-[#2e2e2e] text-xs"
                  >
                    <p className="font-semibold text-sm text-slate-200 truncate pr-3">
                      {detalle.nombreProducto}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0 text-right">
                      <span className="text-[11px] font-medium text-slate-400">
                        Existencia:
                      </span>
                      <span className="font-bold text-sm text-white tabular-nums">
                        {detalle.existenciaFisica}
                      </span>
                    </div>
                  </div>
                );
              }

              // Si SÍ hubo modificación, se muestran todos los detalles (Sistema, Físico y Diferencia)
              return (
                <div
                  key={detalle.productoId}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-xl border text-xs',
                    detalle.diferencia > 0
                      ? 'bg-emerald-500/5 border-emerald-500/30'
                      : 'bg-rose-500/5 border-rose-500/30'
                  )}
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="font-bold text-sm text-white truncate">
                      {detalle.nombreProducto}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] font-medium text-slate-300">
                      <span>
                        Sistema:{' '}
                        <strong className="font-bold text-slate-200 tabular-nums">
                          {existenciaSistema}
                        </strong>
                      </span>
                      <span className="text-slate-500">➔</span>
                      <span>
                        Físico:{' '}
                        <strong className="text-sky-400 font-bold tabular-nums">
                          {detalle.existenciaFisica}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-semibold text-slate-400 mb-1 text-center">
                      Diferencia
                    </p>
                    <div className="bg-[#1e1e1e] px-2.5 py-1 rounded-full border border-[#2e2e2e] min-w-[60px] text-center">
                      {renderDiferencia(detalle.diferencia)}
                    </div>
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

