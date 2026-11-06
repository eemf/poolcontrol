'use client';

import React from 'react';
import { Home, Loader2, ShieldAlert } from 'lucide-react';
import { PageHeader, SurfaceCard } from '@/components/comunes';
import { useDashboard } from './_hooks/use-dashboard';
import { DashboardKPIs } from './_components/dashboard-kpis';
import { DashboardTopStations } from './_components/dashboard-top-stations';
import { DashboardCharts } from './_components/dashboard-charts';

export default function DashboardPage() {
  const {
    isLoading,
    tienePermiso,
    metrics,
    topTurno,
    topSemana,
    topMes,
    chartDataSemanal,
    chartDataEstaciones,
    chartDataMensual,
  } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
      </div>
    );
  }

  if (!tienePermiso) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center p-6 text-center animate-in fade-in duration-300">
        <div className="h-16 w-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 mb-4 border border-rose-500/20">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold mb-1 text-slate-100">Acceso Restringido</h1>
        <p className="text-muted-foreground max-w-sm text-xs">
          No tienes los privilegios necesarios para visualizar el tablero de control de esta sucursal.
          Por favor, selecciona un módulo diferente en el menú lateral.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Resumen de Sucursal"
        description="Control operativo, financiero y métricas de rendimiento del turno actual."
        icon={Home}
      />

      {/* Tarjetas Principales de KPIs */}
      <DashboardKPIs metrics={metrics} />

      {/* Gráficos de Rendimiento y Top Estaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardCharts
            chartDataSemanal={chartDataSemanal}
            chartDataEstaciones={chartDataEstaciones}
            chartDataMensual={chartDataMensual}
          />
        </div>
        <div>
          <DashboardTopStations
            topTurno={topTurno}
            topSemana={topSemana}
            topMes={topMes}
          />
        </div>
      </div>
    </div>
  );
}
