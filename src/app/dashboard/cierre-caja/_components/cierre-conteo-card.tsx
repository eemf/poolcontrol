'use client';

import React from 'react';
import { SurfaceCard } from '@/components/comunes';
import { Label } from '@/components/ui/label';
import { InputNumero } from '@/components/ui/input-numero';
import { Calculator, Coins, CreditCard, Banknote } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Generales } from '@/lib/tipos';

interface CierreConteoCardProps {
  fechaInicioPeriodo: Date | null;
  netoMonedasPeriodo: number;
  totalPagosTarjeta: number;
  totalVentasTarjeta: number;
  totalMonedasTarjeta: number;
  efectivoEnCaja: number;
  estadoCaja?: Generales | null;
  efectivoFinalContado: number | '';
  setEfectivoFinalContado: (val: number | '') => void;
  diferencia: number;
  efectivoFinalInputRef: React.RefObject<HTMLInputElement | null>;
}

export function CierreConteoCard({
  fechaInicioPeriodo,
  netoMonedasPeriodo,
  totalPagosTarjeta,
  totalVentasTarjeta,
  totalMonedasTarjeta,
  efectivoEnCaja,
  estadoCaja,
  efectivoFinalContado,
  setEfectivoFinalContado,
  diferencia,
  efectivoFinalInputRef,
}: CierreConteoCardProps) {
  return (
    <SurfaceCard variant="panel" className="p-5 space-y-5 font-body">
      <div className="flex items-center gap-3 pb-3 border-b border-[#2e2e2e]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400">
          <Calculator className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-white font-headline leading-tight">
            1. Conteo y Separación
          </h2>
          {fechaInicioPeriodo && (
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              Período desde: {format(fechaInicioPeriodo, "dd 'de' MMMM, yyyy • hh:mm a", { locale: es })}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3.5">
        {/* Total Venta Monedas */}
        <SurfaceCard variant="surface" className="p-4 text-center border-amber-500/30 space-y-1.5">
          <div className="flex justify-center items-center gap-1.5 text-xs font-semibold text-amber-400">
            <Coins className="h-3.5 w-3.5" />
            <span>Total Venta Monedas</span>
          </div>
          <p className="text-3xl font-black text-amber-400 tabular-nums tracking-tight">
            Q{netoMonedasPeriodo.toFixed(2)}
          </p>
        </SurfaceCard>

        {/* Total Pagado con Tarjeta */}
        {totalPagosTarjeta > 0 && (
          <SurfaceCard variant="surface" className="p-4 text-center border-sky-500/30 space-y-2.5">
            <div className="flex justify-center items-center gap-1.5 text-xs font-semibold text-sky-400">
              <CreditCard className="h-3.5 w-3.5" />
              <span>Total Pagado con Tarjeta</span>
            </div>
            <p className="text-3xl font-black text-sky-400 tabular-nums tracking-tight">
              Q{totalPagosTarjeta.toFixed(2)}
            </p>
            <div className="px-3 py-2 rounded-xl bg-[#1e1e1e] border border-[#2e2e2e] flex items-center justify-center gap-3 text-xs text-slate-300">
              <span>
                Ventas: <strong className="font-bold text-white tabular-nums">Q{totalVentasTarjeta.toFixed(2)}</strong>
              </span>
              <span className="text-slate-500">•</span>
              <span>
                Monedas: <strong className="font-bold text-white tabular-nums">Q{totalMonedasTarjeta.toFixed(2)}</strong>
              </span>
            </div>
          </SurfaceCard>
        )}

        {/* Total Efectivo Esperado */}
        <SurfaceCard variant="surface" className="p-4 text-center border-emerald-500/30 space-y-3">
          <div>
            <div className="flex justify-center items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <Banknote className="h-3.5 w-3.5" />
              <span>Total Efectivo Esperado</span>
            </div>
            <p className="text-3xl font-black text-emerald-400 tabular-nums tracking-tight mt-1">
              Q{efectivoEnCaja.toFixed(2)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#1e1e1e] border border-[#2e2e2e] space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Efectivo Inicial:</span>
              <span className="font-bold text-slate-200 tabular-nums">
                Q{(estadoCaja?.efectivoInicial || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Alquiler de Mesas:</span>
              <span className="font-bold text-slate-200 tabular-nums">
                Q{(estadoCaja?.totalMesas || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Ventas en Efectivo:</span>
              <span className="font-bold text-slate-200 tabular-nums">
                Q{(estadoCaja?.totalEfectivo || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </SurfaceCard>

        {/* Total Físico Contado */}
        <div className="space-y-2 pt-1">
          <Label htmlFor="efectivo-final" className="text-xs font-semibold text-slate-200 block">
            Total Físico en Caja
          </Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-sky-400 select-none">
              Q
            </span>
            <InputNumero
              ref={efectivoFinalInputRef}
              id="efectivo-final"
              autoFocus
              placeholder="0.00"
              value={efectivoFinalContado}
              onChange={e => setEfectivoFinalContado(e.target.value === '' ? '' : Number(e.target.value))}
              className="h-10 pl-9 pr-4 text-sm text-center font-bold tabular-nums rounded-full"
            />
          </div>
        </div>

        {/* Diferencia */}
        {typeof efectivoFinalContado === 'number' && (
          <div
            className={cn(
              "p-3.5 rounded-xl text-center border transition-colors",
              diferencia === 0
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : diferencia > 0
                  ? "bg-sky-500/10 border-sky-500/30 text-sky-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            )}
          >
            <Label className="text-xs font-semibold block">
              Diferencia ({diferencia === 0 ? 'Cuadre Exacto' : diferencia > 0 ? 'Sobrante' : 'Faltante'})
            </Label>
            <p className="text-2xl font-black tabular-nums tracking-tight mt-0.5">
              {diferencia > 0 ? '+' : ''}Q{diferencia.toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </SurfaceCard>
  );
}
