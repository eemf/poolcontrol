'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InputNumero } from '@/components/ui/input-numero';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { FileSignature, ArrowRight, Loader2 } from 'lucide-react';

interface SummarySidebarProps {
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

/**
 * Panel lateral de resumen para confirmar el cuadre semanal,
 * seleccionando cuentas de origen/destino y monto a liquidar.
 */
export function SummarySidebar({
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
  disabled,
}: SummarySidebarProps) {
  return (
    <div className="lg:col-span-1 space-y-4 sticky top-20">
      <Card className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-slate-100">
            <div className="h-8 w-8 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
              <FileSignature className="h-4 w-4" />
            </div>
            Resumen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 text-center border border-emerald-500/30">
            <p className="text-xs font-semibold text-emerald-400">Total Ingresos</p>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-400 whitespace-nowrap tabular-nums">
              Q{totals.ingresos.toFixed(2)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-rose-500/10 text-center border border-rose-500/30">
            <p className="text-xs font-semibold text-rose-400">Total Egresos</p>
            <p className="text-2xl sm:text-3xl font-bold text-rose-400 whitespace-nowrap tabular-nums">
              - Q{totals.egresos.toFixed(2)}
            </p>
          </div>

          <div className="space-y-1 pt-3 border-t border-[#2e2e2e]">
            <div className="flex justify-between items-center text-sm font-semibold text-slate-400">
              <span>Balance Neto Calculado</span>
              <span className="font-bold text-lg text-slate-100 whitespace-nowrap tabular-nums">
                Q{totals.balanceNeto.toFixed(2)}
              </span>
            </div>
          </div>

          <Separator className="my-2 bg-[#2e2e2e]" />

          <div className="space-y-1.5">
            <Label htmlFor="balance-liquidar" className="text-xs font-semibold text-slate-300">
              Balance a Liquidar (Q)
            </Label>
            <InputNumero
              id="balance-liquidar"
              placeholder="0.00"
              value={balanceALiquidar}
              onChange={(e) => setBalanceALiquidar(Number(e.target.value))}
              className="h-11 text-lg text-center font-bold text-sky-400 bg-[#252526] border-[#2e2e2e] rounded-full"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cuenta-origen" className="text-xs font-semibold text-slate-300">
              Cuenta Origen
            </Label>
            <Select
              value={cuentaOrigenId}
              onValueChange={setCuentaOrigenId}
              disabled={isLoadingCuentas}
            >
              <SelectTrigger className="rounded-full h-9 bg-[#252526] border-[#2e2e2e] text-slate-100">
                <SelectValue
                  placeholder={isLoadingCuentas ? 'Cargando...' : 'Seleccionar origen...'}
                />
              </SelectTrigger>
              <SelectContent className="bg-[#252526] border-[#2e2e2e] text-slate-100">
                {(cuentas || []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cuenta-destino" className="text-xs font-semibold text-slate-300">
              Cuenta Destino
            </Label>
            <Select value={cuentaDestinoId} onValueChange={setCuentaDestinoId}>
              <SelectTrigger className="rounded-full h-9 bg-[#252526] border-[#2e2e2e] text-slate-100">
                <SelectValue
                  placeholder={isLoadingCuentas ? 'Cargando...' : 'Seleccionar destino...'}
                />
              </SelectTrigger>
              <SelectContent className="bg-[#252526] border-[#2e2e2e] text-slate-100">
                {(cuentas || []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observaciones" className="text-xs font-semibold text-slate-300">
              Observaciones
            </Label>
            <Textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Añade notas sobre este cuadre..."
              className="rounded-xl bg-[#252526] border-[#2e2e2e] text-slate-100 placeholder:text-slate-500"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full rounded-full h-9 font-semibold bg-sky-600 hover:bg-sky-500 text-white"
            disabled={disabled}
            onClick={onProcess}
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-4 w-4" />
            )}
            Procesar Cuadre Semanal
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
