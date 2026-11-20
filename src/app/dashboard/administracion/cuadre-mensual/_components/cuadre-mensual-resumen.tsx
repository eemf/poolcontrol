'use client';

import React from 'react';
import { SurfaceCard } from '@/components/comunes';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { InputNumero } from '@/components/ui/input-numero';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, FileSignature } from 'lucide-react';
import type { Cuenta } from '@/lib/tipos';

interface ResumenData {
  cantidad: number;
  totalIngresosEfectivo: number;
  totalIngresosTarjeta: number;
  totalCompras: number;
  totalGastos: number;
  balanceNeto: number;
  balanceLiquidado: number;
}

interface CuadreMensualResumenProps {
  resumen: ResumenData;
  cuentas: Cuenta[] | null;
  cuentaOrigenId: string;
  setCuentaOrigenId: (id: string) => void;
  cuentaDestinoId: string;
  setCuentaDestinoId: (id: string) => void;
  balanceALiquidar: number | '';
  setBalanceALiquidar: (val: number | '') => void;
  observaciones: string;
  setObservaciones: (val: string) => void;
  selectedCount: number;
  onOpenConfirm: () => void;
}

export function CuadreMensualResumen({
  resumen,
  cuentas,
  cuentaOrigenId,
  setCuentaOrigenId,
  cuentaDestinoId,
  setCuentaDestinoId,
  balanceALiquidar,
  setBalanceALiquidar,
  observaciones,
  setObservaciones,
  selectedCount,
  onOpenConfirm,
}: CuadreMensualResumenProps) {
  const totalIngresos = resumen.totalIngresosEfectivo + resumen.totalIngresosTarjeta;
  const totalEgresos = resumen.totalCompras + resumen.totalGastos;

  return (
    <div className="sticky top-20">
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
                {selectedCount} {selectedCount === 1 ? 'cuadre seleccionado' : 'cuadres seleccionados'}.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3.5">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-[#252526] border border-[#2e2e2e] text-center">
              <p className="text-[11px] font-medium text-emerald-400">Total Ingresos</p>
              <p className="text-lg font-bold text-emerald-400 tabular-nums mt-0.5">
                Q{totalIngresos.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#252526] border border-[#2e2e2e] text-center">
              <p className="text-[11px] font-medium text-rose-400">Total Egresos</p>
              <p className="text-lg font-bold text-rose-400 tabular-nums mt-0.5">
                - Q{totalEgresos.toFixed(2)}
              </p>
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="detalle" className="border border-[#2e2e2e] rounded-xl bg-[#252526] overflow-hidden">
              <AccordionTrigger className="px-3.5 py-2.5 hover:no-underline hover:bg-[#313131]/50 transition-colors data-[state=open]:border-b data-[state=open]:border-[#2e2e2e]">
                <div className="flex-1 flex items-center justify-between gap-2 pr-2 text-left">
                  <div className="min-w-0">
                    <span className="text-xs font-medium text-slate-300 block">Balance Neto Calculado</span>
                    <span className="text-[10px] text-slate-400">Ver detalle del cálculo</span>
                  </div>
                  <span className="font-bold text-base text-sky-400 tabular-nums shrink-0">
                    Q{resumen.balanceNeto.toFixed(2)}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3.5 py-2.5 bg-[#252526] space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Ingresos en Efectivo</span>
                  <span className="font-semibold text-slate-200 tabular-nums">
                    Q{resumen.totalIngresosEfectivo.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Ingresos en Tarjeta</span>
                  <span className="font-semibold text-slate-200 tabular-nums">
                    Q{resumen.totalIngresosTarjeta.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-rose-400">
                  <span>Compras de Mercadería</span>
                  <span className="font-semibold tabular-nums">
                    - Q{resumen.totalCompras.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-rose-400">
                  <span>Gastos Operativos</span>
                  <span className="font-semibold tabular-nums">
                    - Q{resumen.totalGastos.toFixed(2)}
                  </span>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

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
                onChange={(e) => setBalanceALiquidar(e.target.value === '' ? '' : Number(e.target.value))}
                onClick={(e) => e.currentTarget.select()}
                onFocus={(e) => e.target.select()}
                className="w-full px-8 h-10 text-center font-bold text-sm tabular-nums text-sky-400 rounded-full bg-[#252526] border-[#2e2e2e]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cuenta-origen" className="text-xs font-medium ml-1 text-slate-200 block">
              Cuenta Origen
            </Label>
            <Select value={cuentaOrigenId} onValueChange={setCuentaOrigenId}>
              <SelectTrigger id="cuenta-origen" className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] hover:bg-[#313131] text-xs">
                <SelectValue placeholder="Seleccionar cuenta..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 font-body">
                {(cuentas || []).map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cuenta-destino" className="text-xs font-medium ml-1 text-slate-200 block">
              Cuenta Destino
            </Label>
            <Select value={cuentaDestinoId} onValueChange={setCuentaDestinoId}>
              <SelectTrigger id="cuenta-destino" className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] hover:bg-[#313131] text-xs">
                <SelectValue placeholder="Seleccionar cuenta..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 font-body">
                {(cuentas || []).map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">
                    {c.nombre}
                  </SelectItem>
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
              rows={2}
              placeholder="Notas adicionales sobre este cierre mensual..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="bg-[#252526] border-[#2e2e2e] text-slate-100 rounded-2xl text-xs resize-none p-3 min-h-[72px]"
            />
          </div>
        </div>

        <div className="p-4 pt-3 border-t border-[#2e2e2e]">
          <Button
            onClick={onOpenConfirm}
            disabled={selectedCount === 0 || !cuentaOrigenId || !cuentaDestinoId}
            className="w-full rounded-full h-10 font-semibold text-xs bg-sky-600 hover:bg-sky-500 text-white shadow-md"
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Procesar Cuadre Mensual
          </Button>
        </div>
      </SurfaceCard>
    </div>
  );
}
