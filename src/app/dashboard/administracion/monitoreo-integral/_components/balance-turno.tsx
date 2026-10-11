'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Banknote, 
  Coins, 
  ShoppingCart, 
  Trophy, 
  Scale, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Clock, 
  ReceiptText,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BalanceTurnoProps {
  resumenGaveta: {
    inicial: number;
    ventas: number;
    alquileres: number;
    totalGaveta: number;
  };
  flujoMonedas: {
    lista: any[];
    ventaNetaPeriodo: number;
  };
  monedasIniciales: number;
  monedasFinales: number;
  esTurnoAbierto: boolean;
  duracionTexto?: string;
}

export function BalanceTurno({
  resumenGaveta,
  flujoMonedas,
  monedasIniciales,
  monedasFinales,
  esTurnoAbierto,
  duracionTexto,
}: BalanceTurnoProps) {
  // Cálculos de desglose de monedas
  const totalVentaMonedas = flujoMonedas.lista
    .filter(m => m.tipo === 'venta')
    .reduce((acc, m) => acc + (m.monto || 0), 0);

  const totalPremiosPagados = Math.abs(
    flujoMonedas.lista
      .filter(m => m.tipo === 'premio')
      .reduce((acc, m) => acc + (m.monto || 0), 0)
  );

  const totalMonedasVendidas = flujoMonedas.lista
    .filter(m => m.tipo === 'venta')
    .reduce((acc, m) => acc + (m.cantidad || 0), 0);

  const totalMonedasPremios = flujoMonedas.lista
    .filter(m => m.tipo === 'premio')
    .reduce((acc, m) => acc + (m.cantidad || 0), 0);

  // Total teórico esperado en caja física (Gaveta + Neto de Monedas)
  const totalEfectivoCaja = resumenGaveta.totalGaveta + flujoMonedas.ventaNetaPeriodo;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Banner de estado contable */}
      <div className="p-4 rounded-2xl bg-[#17202e] border border-[#324157] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-white flex items-center gap-2">
              Conciliación contable del período
              <Badge className={cn(
                "text-[10px] font-medium rounded-full px-2 py-0 border-none",
                esTurnoAbierto ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
              )}>
                {esTurnoAbierto ? 'Turno en curso' : 'Turno cerrado'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cálculo acumulado de ingresos, premios pagados y arqueo esperado en caja.
            </p>
          </div>
        </div>

        {duracionTexto && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-[#283244] px-3 py-1.5 rounded-full border border-[#324157]">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>{duracionTexto}</span>
          </div>
        )}
      </div>

      {/* Grid de 3 pilares del balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pilar 1: Gaveta de Efectivo */}
        <Card className="bg-[#283244] border-[#324157] shadow-sm rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#324157] bg-[#17202e]/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">Gaveta de consumo</span>
            </div>
            <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
              Efectivo
            </Badge>
          </div>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Fondo inicial en caja:</span>
              <span className="font-mono font-medium text-white">Q{resumenGaveta.inicial.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-emerald-400" /> Ventas de productos:
              </span>
              <span className="font-mono font-medium text-emerald-400">+Q{resumenGaveta.ventas.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-blue-400" /> Alquiler de mesas y consolas:
              </span>
              <span className="font-mono font-medium text-blue-400">+Q{resumenGaveta.alquileres.toFixed(2)}</span>
            </div>

            <div className="pt-2 border-t border-[#324157] flex justify-between items-center">
              <span className="text-xs font-bold text-white">Subtotal gaveta:</span>
              <span className="text-base font-black font-mono text-emerald-400">
                Q{resumenGaveta.totalGaveta.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Pilar 2: Flujo de Monedas */}
        <Card className="bg-[#283244] border-[#324157] shadow-sm rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#324157] bg-[#17202e]/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-bold text-white">Flujo de monedas</span>
            </div>
            <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400 bg-purple-500/10">
              Tragamonedas
            </Badge>
          </div>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-emerald-400" /> Venta de monedas:
              </span>
              <span className="font-mono font-medium text-emerald-400">+Q{totalVentaMonedas.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <ArrowDownRight className="h-3 w-3 text-amber-400" /> Premios pagados:
              </span>
              <span className="font-mono font-medium text-amber-400">-Q{totalPremiosPagados.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Monedas despachadas:</span>
              <span className="font-mono font-medium text-white">{totalMonedasVendidas} uds.</span>
            </div>

            <div className="pt-2 border-t border-[#324157] flex justify-between items-center">
              <span className="text-xs font-bold text-white">Neto de monedas:</span>
              <span className={cn(
                "text-base font-black font-mono",
                flujoMonedas.ventaNetaPeriodo >= 0 ? "text-purple-300" : "text-amber-400"
              )}>
                {flujoMonedas.ventaNetaPeriodo >= 0 ? '+' : ''}Q{flujoMonedas.ventaNetaPeriodo.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Pilar 3: Arqueo Teórico Total */}
        <Card className="bg-[#17202e] border-primary/30 shadow-md rounded-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-28 h-28 bg-primary/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
          <div className="p-4 border-b border-[#324157] bg-primary/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-white">Arqueo físico esperado</span>
            </div>
            <Badge className="text-[10px] bg-primary text-primary-foreground border-none">
              Total esperado
            </Badge>
          </div>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Efectivo gaveta:</span>
              <span className="font-mono font-medium text-white">Q{resumenGaveta.totalGaveta.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Efectivo neto monedas:</span>
              <span className="font-mono font-medium text-white">
                {flujoMonedas.ventaNetaPeriodo >= 0 ? '+' : ''}Q{flujoMonedas.ventaNetaPeriodo.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Monedas en existencia:</span>
              <span className="font-mono font-bold text-purple-300">{monedasFinales} unidades</span>
            </div>

            <div className="pt-2 border-t border-[#324157] flex justify-between items-center">
              <span className="text-xs font-bold text-white">Total efectivo en caja:</span>
              <span className="text-lg font-black font-mono text-emerald-400">
                Q{totalEfectivoCaja.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tarjeta de resumen de inventario físico y monedas */}
      <div className="p-4 rounded-xl bg-[#283244] border border-[#324157] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="p-2">
          <p className="text-[11px] text-muted-foreground">Fondo inicial</p>
          <p className="text-base font-bold font-mono text-white mt-0.5">Q{resumenGaveta.inicial.toFixed(2)}</p>
        </div>
        <div className="p-2">
          <p className="text-[11px] text-muted-foreground">Recaudación neta</p>
          <p className="text-base font-bold font-mono text-emerald-400 mt-0.5">
            +Q{(resumenGaveta.ventas + resumenGaveta.alquileres + flujoMonedas.ventaNetaPeriodo).toFixed(2)}
          </p>
        </div>
        <div className="p-2">
          <p className="text-[11px] text-muted-foreground">Monedas iniciales</p>
          <p className="text-base font-bold font-mono text-white mt-0.5">{monedasIniciales} uds.</p>
        </div>
        <div className="p-2">
          <p className="text-[11px] text-muted-foreground">Monedas actuales</p>
          <p className="text-base font-bold font-mono text-purple-300 mt-0.5">{monedasFinales} uds.</p>
        </div>
      </div>
    </div>
  );
}
