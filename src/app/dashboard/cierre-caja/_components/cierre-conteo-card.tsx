'use client';

import React from 'react';
import { SurfaceCard } from '@/components/comunes';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { InputNumero } from '@/components/ui/input-numero';
import { History } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
  toggleHistorial: (tipo: 'efectivo' | 'tarjeta' | 'monedas') => void;
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
  toggleHistorial,
  efectivoFinalInputRef,
}: CierreConteoCardProps) {
  return (
    <SurfaceCard variant="surface" className="p-5 space-y-5">
      <div>
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-sky-600 text-white text-xs font-black">1</span>
          Conteo y Separación
        </h2>
        {fechaInicioPeriodo && (
          <p className="text-xs text-muted-foreground mt-1">
            Período actual desde: {format(fechaInicioPeriodo, "dd 'de' MMMM, yyyy 'a las' hh:mm a", { locale: es })}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {/* Total Venta Monedas */}
        <div className="p-4 bg-[#1d283a] rounded-xl text-center border border-amber-500/30">
          <div className="flex justify-center items-center gap-2">
            <Label className="text-xs font-semibold text-amber-400">Total Venta Monedas</Label>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-amber-400 hover:bg-app-surface rounded-full"
              title="Ver historial de monedas"
              onClick={() => toggleHistorial('monedas')}
            >
              <History className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="text-3xl font-black text-amber-400 font-mono mt-1">Q{netoMonedasPeriodo.toFixed(2)}</p>
        </div>
        
        {/* Total Pagado con Tarjeta */}
        {totalPagosTarjeta > 0 && (
          <div className="p-4 bg-[#1d283a] rounded-xl text-center border border-sky-500/30">
            <div className="flex justify-center items-center gap-2">
              <Label className="text-xs font-semibold text-sky-400">Total Pagado con Tarjeta</Label>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-sky-400 hover:bg-app-surface rounded-full"
                title="Ver historial de pagos con tarjeta"
                onClick={() => toggleHistorial('tarjeta')}
              >
                <History className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-3xl font-black text-sky-400 font-mono mt-1">Q{totalPagosTarjeta.toFixed(2)}</p>
            <div className="text-xs text-muted-foreground mt-1 font-mono">
              <span>Ventas: Q{totalVentasTarjeta.toFixed(2)}</span>
              <span className="mx-1.5">+</span>
              <span>Monedas: Q{totalMonedasTarjeta.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Total Efectivo Esperado */}
        <div className="p-4 bg-[#1d283a] rounded-xl text-center border-2 border-dashed border-sky-500/40 space-y-3">
          <div>
            <div className="flex justify-center items-center gap-2">
              <Label className="text-xs font-semibold text-slate-200">Total Efectivo Esperado</Label>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-sky-400 hover:bg-app-surface rounded-full"
                title="Ver historial de efectivo"
                onClick={() => toggleHistorial('efectivo')}
              >
                <History className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-3xl font-black text-emerald-400 font-mono mt-1">Q{efectivoEnCaja.toFixed(2)}</p>
          </div>
          <div className="text-xs text-muted-foreground pt-2 border-t border-app-border/60 space-y-1 font-mono">
            <div className="flex justify-between px-2"><span>Efectivo Inicial:</span> <span className="font-medium text-slate-300">Q{(estadoCaja?.efectivoInicial || 0).toFixed(2)}</span></div>
            <div className="flex justify-between px-2"><span>Alquiler Mesas:</span> <span className="font-medium text-slate-300">Q{(estadoCaja?.totalMesas || 0).toFixed(2)}</span></div>
            <div className="flex justify-between px-2"><span>Total Ventas:</span> <span className="font-medium text-slate-300">Q{(estadoCaja?.totalEfectivo || 0).toFixed(2)}</span></div>
          </div>
        </div>

        {/* Total Físico Contado */}
        <div className="space-y-1.5">
          <Label htmlFor="efectivo-final" className="text-xs font-semibold text-slate-200">Total Físico en Caja</Label>
          <InputNumero 
            ref={efectivoFinalInputRef} 
            id="efectivo-final" 
            placeholder="0" 
            value={efectivoFinalContado} 
            onChange={e => setEfectivoFinalContado(Number(e.target.value))} 
            className="h-11 text-lg text-center font-bold font-mono bg-[#1d283a] border-app-border rounded-full" 
          />
        </div>

        {/* Diferencia */}
        {typeof efectivoFinalContado === 'number' && efectivoFinalContado > 0 && (
          <div className={`p-3.5 rounded-xl text-center border ${diferencia === 0 ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/30 border-rose-500/40 text-rose-300'}`}>
            <Label className="text-xs font-semibold">Diferencia (Sobrante / Faltante)</Label>
            <p className="text-2xl font-black font-mono mt-0.5">Q{diferencia.toFixed(2)}</p>
          </div>
        )}
      </div>
    </SurfaceCard>
  );
}
