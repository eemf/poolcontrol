'use client';

import { SurfaceCard } from "@/components/comunes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InputNumero } from "@/components/ui/input-numero";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileSignature, ArrowRight, Loader2 } from "lucide-react";

interface BarraResumenProps {
  totals: {
    ingresos: number;
    egresos: number;
    balanceNeto: number;
  };
  balanceALiquidar: number | '';
  setBalanceALiquidar: (val: number) => void;
  cuentaOrigenId: string;
  setCuentaOrigenId: (val: string) => void;
  cuentaDestinoId: string;
  setCuentaDestinoId: (val: string) => void;
  cuentas: any[];
  isLoadingCuentas: boolean;
  observaciones: string;
  setObservaciones: (val: string) => void;
  isProcessing: boolean;
  onProcess: () => void;
  disabled: boolean;
}

export function BarraResumen({
  totals,
  balanceALiquidar,
  setBalanceALiquidar,
  cuentaOrigenId,
  setCuentaOrigenId,
  cuentaDestinoId,
  setCuentaDestinoId,
  cuentas,
  isLoadingCuentas,
  observaciones,
  setObservaciones,
  isProcessing,
  onProcess,
  disabled
}: BarraResumenProps) {
  return (
    <div className="lg:col-span-1 sticky top-20">
      <SurfaceCard variant="panel" className="overflow-hidden font-body">
        <div className="p-4 border-b border-[#2e2e2e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
              <FileSignature className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-headline text-base font-bold text-slate-100 leading-tight">
                Resumen y Liquidación
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                Totales seleccionados y cuentas de traslado.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3.5">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-[#252526] border border-[#2e2e2e] text-center">
              <p className="text-[0.6875rem] font-medium text-emerald-400">Total Ingresos</p>
              <p className="text-lg font-bold text-emerald-400 tabular-nums mt-0.5">
                Q{totals.ingresos.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#252526] border border-[#2e2e2e] text-center">
              <p className="text-[0.6875rem] font-medium text-rose-400">Total Egresos</p>
              <p className="text-lg font-bold text-rose-400 tabular-nums mt-0.5">
                - Q{totals.egresos.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="px-3.5 py-2.5 rounded-xl bg-[#252526] border border-[#2e2e2e] flex justify-between items-center">
            <span className="text-xs font-medium text-slate-400">Balance Neto Calculado</span>
            <span className="font-bold text-base text-sky-400 tabular-nums">
              Q{totals.balanceNeto.toFixed(2)}
            </span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="balance-liquidar" className="text-xs font-medium ml-1 text-slate-200 block">
              Balance a Liquidar
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400 text-xs font-bold pointer-events-none">
                Q
              </span>
              <InputNumero
                id="balance-liquidar"
                placeholder="0.00"
                value={balanceALiquidar}
                onChange={e => setBalanceALiquidar(Number(e.target.value))}
                onClick={e => e.currentTarget.select()}
                onFocus={e => e.target.select()}
                className="w-full px-8 h-10 text-center font-bold text-sm tabular-nums text-sky-400 rounded-full bg-[#252526] border-[#2e2e2e]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cuenta-origen" className="text-xs font-medium ml-1 text-slate-200 block">
              Cuenta Origen
            </Label>
            <Select value={cuentaOrigenId} onValueChange={setCuentaOrigenId} disabled={isLoadingCuentas}>
              <SelectTrigger id="cuenta-origen" className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] hover:bg-[#313131] text-xs">
                <SelectValue placeholder={isLoadingCuentas ? "Cargando..." : "Seleccionar origen..."} />
              </SelectTrigger>
              <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 font-body">
                {(cuentas || []).map(c => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">{c.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cuenta-destino" className="text-xs font-medium ml-1 text-slate-200 block">
              Cuenta Destino
            </Label>
            <Select value={cuentaDestinoId} onValueChange={setCuentaDestinoId} disabled={isLoadingCuentas}>
              <SelectTrigger id="cuenta-destino" className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] hover:bg-[#313131] text-xs">
                <SelectValue placeholder={isLoadingCuentas ? "Cargando..." : "Seleccionar destino..."} />
              </SelectTrigger>
              <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 font-body">
                {(cuentas || []).map(c => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">{c.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observaciones" className="text-xs font-medium ml-1 text-slate-200 block">
              Observaciones (Opcional)
            </Label>
            <Textarea
              id="observaciones"
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              placeholder="Añade notas sobre este cuadre..."
              className="bg-[#252526] border-[#2e2e2e] text-slate-100 rounded-2xl text-xs resize-none p-3 min-h-[72px]"
            />
          </div>
        </div>

        <div className="p-4 pt-3 border-t border-[#2e2e2e]">
          <Button
            className="w-full rounded-full h-10 font-semibold text-xs bg-sky-600 hover:bg-sky-500 text-white shadow-md"
            disabled={disabled}
            onClick={onProcess}
          >
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
            Procesar Cuadre Semanal
          </Button>
        </div>
      </SurfaceCard>
    </div>
  );
}
