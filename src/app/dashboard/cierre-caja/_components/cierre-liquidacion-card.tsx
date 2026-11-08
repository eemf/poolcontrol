'use client';

import React from 'react';
import { SurfaceCard } from '@/components/comunes';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { InputNumero } from '@/components/ui/input-numero';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    <SurfaceCard variant="surface" className="p-5 space-y-5">
      <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-sky-600 text-white text-xs font-black">2</span>
        Cierre y Liquidación
      </h2>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="caja-siguiente" className="text-xs font-semibold text-slate-200">
            Efectivo para el siguiente período
          </Label>
          <InputNumero 
            id="caja-siguiente" 
            placeholder="0" 
            value={cajaSiguienteTurno} 
            onChange={e => setCajaSiguienteTurno(Number(e.target.value))} 
            className="h-11 text-lg text-center font-bold font-mono bg-[#1e1e1e] border-app-border rounded-full" 
          />
        </div>

        {typeof efectivoFinalContado === 'number' && typeof cajaSiguienteTurno === 'number' && (
          <div className="p-4 rounded-xl bg-[#1e1e1e] border border-app-border text-center space-y-1">
            <Label className="text-xs font-semibold text-muted-foreground">Total a Liquidar</Label>
            <p className="text-3xl font-black text-sky-400 font-mono">Q{retiro.toFixed(2)}</p>
            <p className="text-[11px] text-muted-foreground">(Total Físico - Efectivo Siguiente)</p>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="cuenta-destino" className="text-xs font-semibold text-slate-200">
            Cuenta destino de la liquidación
          </Label>
          <Select value={cuentaDestinoId} onValueChange={setCuentaDestinoId}>
            <SelectTrigger className="h-11 text-xs bg-[#1e1e1e] border-app-border rounded-full text-slate-100">
              <SelectValue placeholder="Seleccione la cuenta destino..." />
            </SelectTrigger>
            <SelectContent className="bg-app-surface border-app-border text-foreground">
              {(cuentasData || []).map(c => (
                <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="observaciones" className="text-xs font-semibold text-slate-200">
            Observaciones
          </Label>
          <Textarea 
            id="observaciones" 
            value={observaciones} 
            onChange={e => setObservaciones(e.target.value)} 
            placeholder="Ej: Cierre de fin de semana..."
            className="bg-[#1e1e1e] border-app-border text-xs rounded-xl"
          />
        </div>

        <Button 
          className="w-full mt-4 h-11 rounded-full font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/20"
          size="lg" 
          onClick={onConfirmar} 
          disabled={typeof efectivoFinalContado !== 'number' || typeof cajaSiguienteTurno !== 'number' || hayOperacionesPendientes}
        >
          Finalizar y Registrar Cierre
        </Button>
      </div>
    </SurfaceCard>
  );
}
