'use client';

import React from 'react';
import { PageHeader, SurfaceCard, PillTabs } from '@/components/comunes';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  MonitorCheck,
  Clock,
  Loader2,
  PackageSearch,
  Coins,
  Banknote,
  Scale,
  DollarSign,
  Download,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

import { useMonitoreoIntegral, toDate } from './_hooks/use-monitoreo-integral';
import { FlujoGaveta } from './_components/flujo-gaveta';
import { FlujoMonedas } from './_components/flujo-monedas';
import { KardexInventario } from './_components/kardex-inventario';
import { BalanceTurno } from './_components/balance-turno';

export default function PaginaMonitoreoIntegral() {
  const {
    periodoId,
    setPeriodoId,
    tabActiva,
    setTabActiva,
    cierres,
    configPeriodo,
    resumenGaveta,
    flujoGavetaList,
    flujoMonedasObj,
    inventario,
    duracionPeriodoTexto,
    totalEfectivoCaja,
    exportarReporteCSV,
    isLoading,
    isLoadingTraga,
    isLoadingPagos,
    isLoadingInventario,
  } = useMonitoreoIntegral();

  if (isLoading || !configPeriodo) {
    return (
      <div className="flex flex-col justify-center items-center h-80 space-y-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="text-xs text-slate-400">Sincronizando monitoreo del turno...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-body pb-10">
      {/* 1. Cabecera Estandarizada con Selector de Turno */}
      <PageHeader
        title="Monitoreo Integral de Turno"
        description={`Apertura: ${format(configPeriodo.inicio, 'dd MMM, hh:mm a', { locale: es })}${
          duracionPeriodoTexto ? ` • ${duracionPeriodoTexto}` : ''
        }`}
        icon={MonitorCheck}
        action={
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="w-full sm:w-64">
              <Select value={periodoId} onValueChange={setPeriodoId}>
                <SelectTrigger className="rounded-full h-9 border-[#2e2e2e] bg-[#252526] text-white text-xs font-semibold focus:ring-primary shadow-sm">
                  <Clock className="h-3.5 w-3.5 text-primary mr-1.5 shrink-0" />
                  <SelectValue placeholder="Seleccionar turno..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-white max-h-[320px]">
                  <SelectItem value="actual" className="font-bold text-primary text-xs">
                    Turno actual (abierto)
                  </SelectItem>
                  {cierres && cierres.length > 0 && (
                    <>
                      <Separator className="my-1.5 bg-[#2e2e2e]" />
                      <p className="px-2 py-1 text-[10px] font-medium text-slate-400">Turnos anteriores</p>
                      {cierres.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="text-xs">
                          Turno #{c.idCuadre} — {format(toDate(c.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={exportarReporteCSV}
              className="rounded-full h-9 px-3.5 text-xs font-semibold border-[#2e2e2e] bg-[#252526] text-slate-200 hover:text-white shrink-0 w-full sm:w-auto"
            >
              <Download className="h-3.5 w-3.5 mr-1.5 text-primary" />
              <span>Exportar CSV</span>
            </Button>
          </div>
        }
      />

      {/* 2. Tarjetas Ejecutivas de Métricas Relevantes (3 KPI Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {/* Total Efectivo Esperado en Caja (KPI Principal) */}
        <SurfaceCard variant="surface" className="p-4 relative overflow-hidden">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-bold text-white">Total efectivo esperado</span>
            <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-white tabular-nums">
            Q{totalEfectivoCaja.toFixed(2)}
          </div>
          <p className="text-[11px] text-primary font-medium mt-1">
            Arqueo físico teórico total
          </p>
        </SurfaceCard>

        {/* Efectivo en Gaveta */}
        <SurfaceCard variant="surface" className="p-4 relative overflow-hidden">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-semibold text-slate-400">Efectivo en gaveta</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Banknote className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-emerald-400 tabular-nums">
            Q{resumenGaveta.totalGaveta.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Fondo Q{resumenGaveta.inicial.toFixed(0)} + Cobros Q{(resumenGaveta.ventas + resumenGaveta.alquileres).toFixed(0)}
          </p>
        </SurfaceCard>

        {/* Flujo Neto de Monedas */}
        <SurfaceCard variant="surface" className="p-4 relative overflow-hidden">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-semibold text-slate-400">Flujo neto monedas</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div
            className={cn(
              'text-2xl md:text-3xl font-black tabular-nums',
              flujoMonedasObj.ventaNetaPeriodo >= 0 ? 'text-purple-300' : 'text-amber-400'
            )}
          >
            {flujoMonedasObj.ventaNetaPeriodo >= 0 ? '+' : ''}Q{flujoMonedasObj.ventaNetaPeriodo.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Monedas vendidas vs premios
          </p>
        </SurfaceCard>
      </div>

      {/* 3. Contenedor Unificado con Pestañas Estándar */}
      <SurfaceCard variant="panel">
        <div className="p-2 sm:p-3 border-b border-[#2e2e2e] bg-[#1e1e1e]">
          <PillTabs
            value={tabActiva}
            onValueChange={setTabActiva}
            tabs={[
              { id: 'gaveta', label: 'Flujo de Gaveta', icon: Banknote },
              { id: 'monedas', label: 'Flujo de Monedas', icon: Coins },
              { id: 'inventario', label: 'Kardex Inventario', icon: PackageSearch },
              { id: 'balance', label: 'Balance General', icon: Scale },
            ]}
          />
        </div>

        <div className="p-3 sm:p-5 bg-[#1e1e1e]">
          {tabActiva === 'gaveta' && (
            <FlujoGaveta
              resumen={resumenGaveta}
              flujo={flujoGavetaList}
              inicioPeriodo={configPeriodo.inicio}
            />
          )}

          {tabActiva === 'monedas' && (
            <FlujoMonedas
              lista={flujoMonedasObj.lista}
              ventaNetaPeriodo={flujoMonedasObj.ventaNetaPeriodo}
              monedasIniciales={configPeriodo.monedasIniciales}
              efectivoInicialMonedas={configPeriodo.efectivoInicialMonedas || 0}
              efectivoAcumuladoMonedas={configPeriodo.efectivoAcumuladoMonedas || 0}
              inicioPeriodo={configPeriodo.inicio}
              isLoading={isLoadingTraga || isLoadingPagos}
            />
          )}

          {tabActiva === 'inventario' && (
            <KardexInventario
              inventario={inventario || []}
              isLoading={isLoadingInventario}
            />
          )}

          {tabActiva === 'balance' && (
            <BalanceTurno
              resumenGaveta={resumenGaveta}
              flujoMonedas={flujoMonedasObj}
              monedasIniciales={configPeriodo.monedasIniciales}
              monedasFinales={flujoMonedasObj.stockFinal}
              esTurnoAbierto={configPeriodo.esTurnoAbierto}
              duracionTexto={duracionPeriodoTexto}
            />
          )}
        </div>
      </SurfaceCard>
    </div>
  );
}
