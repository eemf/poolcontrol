
'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InputNumero } from "@/components/ui/input-numero";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { FileSignature, ArrowRight, Loader2 } from "lucide-react";

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
  disabled
}: SummarySidebarProps) {
  return (
    <div className="lg:col-span-1 space-y-4 sticky top-20">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <FileSignature className="h-5 w-5 text-primary"/>
            Resumen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-green-500/10 text-center border border-green-200">
            <p className="text-sm font-bold text-green-700">Total Ingresos</p>
            <p className="text-3xl font-bold text-green-700 whitespace-nowrap tabular-nums">Q{totals.ingresos.toFixed(2)}</p>
          </div>
          <div className="p-4 rounded-lg bg-red-500/10 text-center border border-red-200">
            <p className="text-sm font-bold text-red-700">Total Egresos</p>
            <p className="text-3xl font-bold text-red-700 whitespace-nowrap tabular-nums">- Q{totals.egresos.toFixed(2)}</p>
          </div>

          <div className="space-y-1 pt-4 border-t">
            <div className="flex justify-between items-center text-sm font-bold text-muted-foreground uppercase tracking-tighter">
              <span>Balance Neto Calculado</span>
              <span className="font-bold text-lg text-foreground whitespace-nowrap">Q{totals.balanceNeto.toFixed(2)}</span>
            </div>
          </div>

          <Separator className="my-2" />

          <div className="space-y-1">
            <Label htmlFor="balance-liquidar" className="text-base font-bold">Balance a Liquidar (Q)</Label>
            <InputNumero id="balance-liquidar" placeholder="0.00" value={balanceALiquidar} onChange={e => setBalanceALiquidar(Number(e.target.value))} className="h-12 text-lg text-center font-bold text-primary rounded-full" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cuenta-origen" className="text-base font-bold">Cuenta Origen</Label>
            <Select value={cuentaOrigenId} onValueChange={setCuentaOrigenId} disabled={isLoadingCuentas}>
              <SelectTrigger className="rounded-full"><SelectValue placeholder={isLoadingCuentas ? "Cargando..." : "Seleccionar origen..."}/></SelectTrigger>
              <SelectContent className="font-body">
                {(cuentas || []).map(c => (<SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="cuenta-destino" className="text-base font-bold">Cuenta Destino</Label>
            <Select value={cuentaDestinoId} onValueChange={setCuentaDestinoId}>
              <SelectTrigger className="rounded-full"><SelectValue placeholder={isLoadingCuentas ? "Cargando..." : "Seleccionar destino..."}/></SelectTrigger>
              <SelectContent className="font-body">
                {(cuentas || []).map(c => (<SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="observaciones" className="font-bold">Observaciones</Label>
            <Textarea id="observaciones" value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Añade notas sobre este cuadre..." className="rounded-xl"/>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full rounded-full h-11 font-bold shadow-lg shadow-primary/20" 
            disabled={disabled} 
            onClick={onProcess}
          >
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <ArrowRight className="mr-2 h-4 w-4"/>}
            Procesar Cuadre Semanal
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
