'use client';

import React from 'react';
import { SurfaceCard } from '@/components/comunes';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { InputNumero } from '@/components/ui/input-numero';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Check, Loader2 } from 'lucide-react';
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
  return (
    <SurfaceCard variant="panel" className="p-4 space-y-4">
      <div className="pb-3 border-b border-app-border">
        <h3 className="text-sm font-bold text-slate-100">Resumen del Cierre Mensual</h3>
        <p className="text-[11px] text-muted-foreground">
          Consolidación financiera de los {selectedCount} cuadre(s) seleccionado(s).
        </p>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center text-muted-foreground">
          <span>Ingresos en Efectivo:</span>
          <span className="font-mono font-semibold text-slate-200">
            Q{resumen.totalIngresosEfectivo.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center text-muted-foreground">
          <span>Ingresos en Tarjeta:</span>
          <span className="font-mono font-semibold text-slate-200">
            Q{resumen.totalIngresosTarjeta.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center text-rose-400">
          <span>Compras de Mercadería:</span>
          <span className="font-mono font-semibold">
            -Q{resumen.totalCompras.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center text-rose-400">
          <span>Gastos Operativos:</span>
          <span className="font-mono font-semibold">
            -Q{resumen.totalGastos.toFixed(2)}
          </span>
        </div>
        <Separator className="border-app-border my-2" />
        <div className="flex justify-between items-center font-bold text-sm">
          <span className="text-slate-100">Balance Calculado:</span>
          <span className="font-mono text-emerald-400">
            Q{resumen.balanceNeto.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-app-border space-y-3">
        <div className="space-y-1">
          <Label htmlFor="balance-liquidar" className="text-xs text-slate-300">
            Balance a Liquidar (Q)
          </Label>
          <InputNumero
            id="balance-liquidar"
            placeholder="0.00"
            value={balanceALiquidar}
            onChange={(e) => setBalanceALiquidar(e.target.value === '' ? '' : Number(e.target.value))}
            className="rounded-full text-center h-9 bg-app-surface border-app-border font-mono font-bold text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-300">Cuenta de Origen</Label>
          <Select value={cuentaOrigenId} onValueChange={setCuentaOrigenId}>
            <SelectTrigger className="rounded-full h-9 bg-app-surface border-app-border text-xs">
              <SelectValue placeholder="Seleccionar cuenta..." />
            </SelectTrigger>
            <SelectContent className="bg-app-surface border-app-border text-xs">
              {(cuentas || []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-300">Cuenta de Destino</Label>
          <Select value={cuentaDestinoId} onValueChange={setCuentaDestinoId}>
            <SelectTrigger className="rounded-full h-9 bg-app-surface border-app-border text-xs">
              <SelectValue placeholder="Seleccionar cuenta..." />
            </SelectTrigger>
            <SelectContent className="bg-app-surface border-app-border text-xs">
              {(cuentas || []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="observaciones" className="text-xs text-slate-300">
            Observaciones (Opcional)
          </Label>
          <Textarea
            id="observaciones"
            rows={2}
            placeholder="Notas adicionales sobre este cierre mensual..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="rounded-xl bg-app-surface border-app-border text-xs resize-none"
          />
        </div>

        <Button
          onClick={onOpenConfirm}
          disabled={selectedCount === 0 || !cuentaOrigenId || !cuentaDestinoId}
          className="w-full rounded-full h-9 font-medium text-xs bg-sky-600 hover:bg-sky-500 text-white mt-2"
        >
          <Check className="h-4 w-4 mr-1.5" />
          Procesar Cuadre Mensual
        </Button>
      </div>
    </SurfaceCard>
  );
}
