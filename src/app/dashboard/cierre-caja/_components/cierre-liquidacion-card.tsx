'use client';

import React from 'react';
import { SurfaceCard } from '@/components/comunes';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { InputNumero } from '@/components/ui/input-numero';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Wallet } from 'lucide-react';
import type { Cuenta } from '@/lib/tipos';

interface CierreLiquidacionCardProps {
  cajaSiguienteTurno: number | '';
  setCajaSiguienteTurno: (val: number | '') => void;
  efectivoFinalContado: number | '';
  retiro: number;
  cuentaDestinoId: string;
  setCuentaDestinoId: (id: string) => void;
  cuentasData?: Cuenta[] | null;
  observaciones: string;
  setObservaciones: (val: string) => void;
  onConfirmar: () => void;
  hayOperacionesPendientes: boolean;
}

export function CierreLiquidacionCard({
  cajaSiguienteTurno,
  setCajaSiguienteTurno,
  efectivoFinalContado,
  retiro,
  cuentaDestinoId,
  setCuentaDestinoId,
  cuentasData,
  observaciones,
  setObservaciones,
  onConfirmar,
  hayOperacionesPendientes,
}: CierreLiquidacionCardProps) {
  return (
    <SurfaceCard variant="panel" className="p-5 space-y-5 font-body">
      <div className="flex items-center gap-3 pb-3 border-b border-[#2e2e2e]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
          <Wallet className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-white font-headline leading-tight">
            2. Cierre y Liquidación
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            Define el fondo para el próximo turno y la cuenta destino.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="caja-siguiente" className="text-xs font-semibold text-slate-200 block">
            Efectivo para el Siguiente Período
          </Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-sky-400 select-none">
              Q
            </span>
            <InputNumero
              id="caja-siguiente"
              placeholder="0.00"
              value={cajaSiguienteTurno}
              onChange={e => setCajaSiguienteTurno(e.target.value === '' ? '' : Number(e.target.value))}
              className="h-10 pl-9 pr-4 text-sm text-center font-bold tabular-nums rounded-full"
            />
          </div>
        </div>

        {typeof efectivoFinalContado === 'number' && typeof cajaSiguienteTurno === 'number' && (
          <SurfaceCard variant="surface" className="p-4 text-center space-y-1 border-sky-500/30">
            <Label className="text-xs font-semibold text-slate-300 block">Total a Liquidar</Label>
            <p className="text-3xl font-black text-sky-400 tabular-nums tracking-tight">
              Q{retiro.toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-400">
              (Total Físico Contado − Efectivo Siguiente Período)
            </p>
          </SurfaceCard>
        )}

        <div className="space-y-2">
          <Label htmlFor="cuenta-destino" className="text-xs font-semibold text-slate-200 block">
            Cuenta Destino de la Liquidación
          </Label>
          <Select value={cuentaDestinoId} onValueChange={setCuentaDestinoId}>
            <SelectTrigger id="cuenta-destino" className="h-10 text-xs font-medium rounded-full px-4">
              <SelectValue placeholder="Seleccione la cuenta destino..." />
            </SelectTrigger>
            <SelectContent className="font-body">
              {(cuentasData || []).map(c => (
                <SelectItem key={c.id} value={c.id} className="text-xs font-medium">
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="observaciones" className="text-xs font-semibold text-slate-200 block">
            Observaciones del Cierre
          </Label>
          <Textarea
            id="observaciones"
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            placeholder="Ej: Cierre de turno sin novedades..."
            className="text-xs rounded-xl min-h-[84px]"
          />
        </div>

        <Button
          className="w-full mt-2 h-10 rounded-full text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md gap-2"
          onClick={onConfirmar}
          disabled={typeof efectivoFinalContado !== 'number' || typeof cajaSiguienteTurno !== 'number' || hayOperacionesPendientes}
        >
          <CheckCircle2 className="h-4 w-4" />
          Finalizar y Registrar Cierre
        </Button>
      </div>
    </SurfaceCard>
  );
}
