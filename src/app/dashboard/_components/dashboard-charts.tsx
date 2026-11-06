'use client';

import React from 'react';
import { 
  BarChartHorizontal, Timer, Coins, CalendarDays 
} from "lucide-react";
import { 
  Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip 
} from "recharts";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SurfaceCard } from "@/components/comunes";
import { Separator } from "@/components/ui/separator";

interface ChartItemSemanal {
  fecha: Date;
  label: string;
  efectivo: number;
  tarjeta: number;
  monedas: number;
}

interface ChartItemEstaciones {
  fecha: Date;
  label: string;
  Mesas: number;
  Consolas: number;
}

interface ChartItemMensual {
  fecha: Date;
  label: string;
  efectivo: number;
  tarjeta: number;
}

interface DashboardChartsProps {
  chartDataSemanal: ChartItemSemanal[];
  chartDataEstaciones: ChartItemEstaciones[];
  chartDataMensual: ChartItemMensual[];
}

export function DashboardCharts({
  chartDataSemanal,
  chartDataEstaciones,
  chartDataMensual,
}: DashboardChartsProps) {
  return (
    <div className="space-y-6">
      {/* Rendimiento Semanal */}
      <SurfaceCard variant="panel" className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-app-border gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <BarChartHorizontal className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Rendimiento Semanal</h3>
              <p className="text-[11px] text-muted-foreground">Ingresos liquidados (Últimos 7 días)</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-sky-500" />
              <span className="text-slate-300">Efectivo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              <span className="text-slate-300">Tarjeta</span>
            </div>
          </div>
        </div>

        <div className="h-[220px] sm:h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartDataSemanal}>
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `Q${v}`} />
              <RechartsTooltip
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ChartItemSemanal;
                    return (
                      <div className="bg-[#283244] border border-app-border rounded-xl shadow-xl p-3 space-y-1.5 text-xs">
                        <p className="font-semibold text-slate-300 border-b border-app-border pb-1">
                          {format(data.fecha, 'dd MMMM', { locale: es })}
                        </p>
                        <div className="space-y-1 pt-0.5">
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Efectivo:</span>
                            <span className="font-mono font-bold text-sky-400">Q{data.efectivo.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Tarjeta:</span>
                            <span className="font-mono font-bold text-indigo-400">Q{data.tarjeta.toFixed(2)}</span>
                          </div>
                          <Separator className="my-1 border-app-border" />
                          <div className="flex justify-between gap-4 font-bold">
                            <span className="text-slate-200">Total:</span>
                            <span className="font-mono text-emerald-400">Q{(data.efectivo + data.tarjeta).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="efectivo" stackId="a" fill="#0284c7" />
              <Bar dataKey="tarjeta" stackId="a" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SurfaceCard>

      {/* Rendimiento por Estación */}
      <SurfaceCard variant="panel" className="p-4 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-app-border">
          <div className="p-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Timer className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Rendimiento por Estación</h3>
            <p className="text-[11px] text-muted-foreground">Facturación por tipo de estación (Últimos 7 días)</p>
          </div>
        </div>

        <div className="h-[200px] sm:h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartDataEstaciones}>
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `Q${v}`} />
              <RechartsTooltip
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ChartItemEstaciones;
                    return (
                      <div className="bg-[#283244] border border-app-border rounded-xl shadow-xl p-2.5 space-y-1 text-xs">
                        <p className="font-semibold text-slate-300 border-b border-app-border pb-1">
                          {format(data.fecha, 'dd MMM', { locale: es })}
                        </p>
                        <div className="flex justify-between gap-4 pt-0.5">
                          <span className="text-sky-400 font-medium">Mesas:</span>
                          <span className="font-mono font-bold text-slate-100">Q{(data.Mesas || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-purple-400 font-medium">Consolas:</span>
                          <span className="font-mono font-bold text-slate-100">Q{(data.Consolas || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="Mesas" fill="#0284c7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Consolas" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SurfaceCard>

      {/* Fila Dual: Monedas y Mensual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monedas */}
        <SurfaceCard variant="panel" className="p-4 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-app-border">
            <div className="p-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Coins className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Rendimiento de Monedas</h3>
              <p className="text-[11px] text-muted-foreground">Flujo neto por día (Últimos 7 días)</p>
            </div>
          </div>

          <div className="h-[180px] sm:h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataSemanal}>
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `Q${v}`} />
                <RechartsTooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as ChartItemSemanal;
                      return (
                        <div className="bg-[#283244] border border-app-border rounded-xl shadow-xl p-2.5 text-xs">
                          <p className="font-semibold text-slate-300 border-b border-app-border pb-1">
                            {format(data.fecha, 'dd MMM', { locale: es })}
                          </p>
                          <div className="flex justify-between gap-4 pt-1">
                            <span className="text-amber-400 font-medium">Monedas Netas:</span>
                            <span className="font-mono font-bold text-slate-100">Q{(data.monedas || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="monedas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>

        {/* Mensual */}
        <SurfaceCard variant="panel" className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-app-border gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400">
                <CalendarDays className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Rendimiento Mensual</h3>
                <p className="text-[11px] text-muted-foreground">Balance liquidado (Últimos 6 meses)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-sky-500" />
                <span className="text-slate-300">Efectivo</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                <span className="text-slate-300">Tarjeta</span>
              </div>
            </div>
          </div>

          <div className="h-[180px] sm:h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataMensual}>
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `Q${v}`} />
                <RechartsTooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as ChartItemMensual;
                      return (
                        <div className="bg-[#283244] border border-app-border rounded-xl shadow-xl p-2.5 text-xs space-y-1">
                          <p className="font-semibold text-slate-300 border-b border-app-border pb-1">
                            {format(data.fecha, 'MMMM yyyy', { locale: es })}
                          </p>
                          <div className="space-y-0.5 pt-0.5">
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">Efectivo:</span>
                              <span className="font-mono font-bold text-sky-400">Q{data.efectivo.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">Tarjeta:</span>
                              <span className="font-mono font-bold text-indigo-400">Q{data.tarjeta.toFixed(2)}</span>
                            </div>
                            <Separator className="my-1 border-app-border" />
                            <div className="flex justify-between gap-4 font-bold text-slate-200">
                              <span>Total:</span>
                              <span className="font-mono text-emerald-400">Q{(data.efectivo + data.tarjeta).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="efectivo" stackId="a" fill="#0284c7" />
                <Bar dataKey="tarjeta" stackId="a" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}
