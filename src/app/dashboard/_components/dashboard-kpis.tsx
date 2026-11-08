'use client';

import React from 'react';
import { 
  Dices, Gamepad2, DollarSign, Archive 
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SurfaceCard } from "@/components/comunes";
import { cn } from "@/lib/utils";
import type { Producto } from "@/lib/tipos";

interface DashboardMetrics {
  totalBillar: number;
  ocupadasBillar: number;
  percBillar: number;
  totalConsola: number;
  ocupadasConsola: number;
  percConsola: number;
  totalVendidoHoy: number;
  bajoStock: number;
  productosBajoStock: Producto[];
  efInicial: number;
  vtasEfe: number;
  alqMesas: number;
}

interface DashboardKPIsProps {
  metrics: DashboardMetrics;
}

export function DashboardKPIs({ metrics }: DashboardKPIsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Ocupación de Sala */}
      <SurfaceCard variant="panel" className="p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2 border-b border-app-border">
          <span className="text-xs font-semibold text-muted-foreground">Ocupación de Sala</span>
          <div className="flex gap-1.5 text-sky-400">
            <Dices className="h-4 w-4" />
            <Gamepad2 className="h-4 w-4" />
          </div>
        </div>
        <div className="pt-3 space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">Mesas de Billar</span>
              <span className="font-mono font-bold text-slate-100">{metrics.ocupadasBillar} / {metrics.totalBillar}</span>
            </div>
            <Progress value={metrics.percBillar} className="h-2 bg-[#252526]" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">Consolas de Videojuegos</span>
              <span className="font-mono font-bold text-slate-100">{metrics.ocupadasConsola} / {metrics.totalConsola}</span>
            </div>
            <Progress value={metrics.percConsola} className="h-2 bg-[#252526]" />
          </div>
        </div>
      </SurfaceCard>

      {/* Ventas de Hoy */}
      <SurfaceCard variant="panel" className="p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2 border-b border-app-border">
          <span className="text-xs font-semibold text-muted-foreground">Ventas del Turno</span>
          <DollarSign className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="pt-3 space-y-2">
          <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400">
            Q{metrics.totalVendidoHoy.toFixed(2)}
          </div>
          <div className="space-y-1 pt-1 border-t border-app-border">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Efectivo Inicial:</span>
              <span className="font-mono font-semibold text-slate-200">Q{metrics.efInicial.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Ventas en Efectivo:</span>
              <span className="font-mono font-semibold text-slate-200">Q{metrics.vtasEfe.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Alquiler de Estaciones:</span>
              <span className="font-mono font-semibold text-slate-200">Q{metrics.alqMesas.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </SurfaceCard>

      {/* Alertas de Stock */}
      <SurfaceCard 
        variant="panel" 
        className={cn(
          "p-4 flex flex-col justify-between",
          metrics.bajoStock > 0 ? "border-amber-500/40 bg-amber-950/10" : ""
        )}
      >
        <div className="flex items-center justify-between pb-2 border-b border-app-border">
          <span className="text-xs font-semibold text-muted-foreground">Alertas de Stock</span>
          <Archive className={cn("h-4 w-4", metrics.bajoStock > 0 ? "text-amber-400" : "text-muted-foreground")} />
        </div>
        <div className="pt-3 space-y-2">
          <div className={cn("text-2xl sm:text-3xl font-mono font-bold", metrics.bajoStock > 0 ? "text-amber-400" : "text-slate-100")}>
            {metrics.bajoStock}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.bajoStock > 0 ? "Productos requieren reabastecimiento" : "Inventario en niveles óptimos"}
          </p>

          {metrics.bajoStock > 0 && (
            <div className="mt-2 space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
              {metrics.productosBajoStock.map((p) => (
                <div key={p.id} className="flex justify-between items-center text-xs bg-[#252526] p-1.5 rounded-lg border border-app-border">
                  <span className="font-medium text-slate-200 truncate max-w-[130px]">{p.nombre}</span>
                  <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-bold border-amber-500/40 text-amber-400 bg-amber-500/10 rounded-full">
                    {p.existencia} / {p.existenciaMinima || 0}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </SurfaceCard>
    </div>
  );
}
