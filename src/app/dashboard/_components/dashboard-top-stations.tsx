'use client';

import React from 'react';
import { 
  Trophy, TrendingUp, CalendarDays, Clock 
} from "lucide-react";
import { SurfaceCard } from "@/components/comunes";
import { Separator } from "@/components/ui/separator";

interface TopStationInfo {
  name: string;
  total: number;
}

interface DashboardTopStationsProps {
  topTurno: TopStationInfo;
  topSemana: TopStationInfo;
  topMes: TopStationInfo;
}

export function DashboardTopStations({
  topTurno,
  topSemana,
  topMes
}: DashboardTopStationsProps) {
  return (
    <SurfaceCard variant="panel" className="p-4 flex flex-col justify-between">
      <div className="flex items-center gap-2 pb-3 border-b border-app-border">
        <div className="p-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <Trophy className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-100">Mejores Estaciones</h3>
          <p className="text-[0.6875rem] text-muted-foreground">Mayor facturación acumulada</p>
        </div>
      </div>

      <div className="pt-3 space-y-3">
        <div className="flex items-start gap-3 p-2 rounded-lg bg-[#252526] border border-app-border">
          <div className="h-8 w-8 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center shrink-0">
            <TrendingUp className="h-4 w-4 text-sky-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[0.625rem] font-medium text-muted-foreground">En el Turno Actual</p>
            <p className="text-xs font-bold text-slate-100 truncate">{topTurno.name}</p>
            <p className="text-xs font-mono font-bold text-sky-400">Q{topTurno.total.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-2 rounded-lg bg-[#252526] border border-app-border">
          <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <CalendarDays className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[0.625rem] font-medium text-muted-foreground">Esta Semana</p>
            <p className="text-xs font-bold text-slate-100 truncate">{topSemana.name}</p>
            <p className="text-xs font-mono font-bold text-emerald-400">Q{topSemana.total.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-2 rounded-lg bg-[#252526] border border-app-border">
          <div className="h-8 w-8 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Clock className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[0.625rem] font-medium text-muted-foreground">Este Mes</p>
            <p className="text-xs font-bold text-slate-100 truncate">{topMes.name}</p>
            <p className="text-xs font-mono font-bold text-indigo-400">Q{topMes.total.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
