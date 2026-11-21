'use client';

import React from 'react';
import { SurfaceCard } from '@/components/comunes';
import { DollarSign, Wallet, CreditCard, ShoppingCart } from 'lucide-react';

interface ControlPagosMetricasProps {
  metricas: {
    totalRecaudado: number;
    totalEfectivo: number;
    totalTarjeta: number;
    totalConsumoInterno: number;
    totalComprobantes: number;
    totalArticulosCubiertos: number;
  };
}

export function ControlPagosMetricas({ metricas }: ControlPagosMetricasProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. Total Recaudado */}
      <SurfaceCard variant="surface" className="p-3.5 space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium">Total Recaudado</span>
          <div className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-400">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-slate-100 font-mono">
          Q{metricas.totalRecaudado.toFixed(2)}
        </div>
        <p className="text-[0.6875rem] text-muted-foreground">
          En {metricas.totalComprobantes} {metricas.totalComprobantes === 1 ? 'operación' : 'operaciones'}
        </p>
      </SurfaceCard>

      {/* 2. Cobros en Efectivo */}
      <SurfaceCard variant="surface" className="p-3.5 space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium">Efectivo</span>
          <div className="p-1.5 rounded-full bg-sky-500/10 text-sky-400">
            <Wallet className="h-4 w-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-slate-100 font-mono">
          Q{metricas.totalEfectivo.toFixed(2)}
        </div>
        <p className="text-[0.6875rem] text-muted-foreground">
          {metricas.totalRecaudado > 0 
            ? `${((metricas.totalEfectivo / metricas.totalRecaudado) * 100).toFixed(0)}% del total` 
            : '0%'}
        </p>
      </SurfaceCard>

      {/* 3. Cobros con Tarjeta */}
      <SurfaceCard variant="surface" className="p-3.5 space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium">Tarjeta</span>
          <div className="p-1.5 rounded-full bg-purple-500/10 text-purple-400">
            <CreditCard className="h-4 w-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-slate-100 font-mono">
          Q{metricas.totalTarjeta.toFixed(2)}
        </div>
        <p className="text-[0.6875rem] text-muted-foreground">
          {metricas.totalRecaudado > 0 
            ? `${((metricas.totalTarjeta / metricas.totalRecaudado) * 100).toFixed(0)}% del total` 
            : '0%'}
        </p>
      </SurfaceCard>

      {/* 4. Artículos Cubiertos */}
      <SurfaceCard variant="surface" className="p-3.5 space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium">Artículos Cubiertos</span>
          <div className="p-1.5 rounded-full bg-amber-500/10 text-amber-400">
            <ShoppingCart className="h-4 w-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-slate-100 font-mono">
          {metricas.totalArticulosCubiertos}
        </div>
        <p className="text-[0.6875rem] text-muted-foreground">
          Unidades saldadas en total
        </p>
      </SurfaceCard>
    </div>
  );
}
