'use client';

import React from 'react';
import { PageHeader, SurfaceCard, PillTabs, BotonVolverArriba } from '@/components/comunes';
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
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { useMonitoreoIntegral, toDate } from './_hooks/use-monitoreo-integral';
import { FlujoGaveta } from './_components/flujo-gaveta';
import { FlujoMonedas } from './_components/flujo-monedas';
import { KardexInventario } from './_components/kardex-inventario';

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
    productos,
    duracionPeriodoTexto,
    isLoading,
    isLoadingTraga,
    isLoadingPagos,
    isLoadingInventario,
  } = useMonitoreoIntegral();

  if (isLoading || !configPeriodo) {
    return (
      <div className="flex flex-col justify-center items-center h-80 space-y-3 font-body">
        <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
        <span className="text-xs text-slate-400">Sincronizando monitoreo del turno...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 sm:space-y-3.5 font-body pb-2">
      {/* 1. Cabecera Estandarizada con Selector de Turno */}
      <PageHeader
        title="Monitoreo Integral de Turno"
        description={`Apertura: ${format(configPeriodo.inicio, 'dd MMM, hh:mm a', { locale: es })}${
          duracionPeriodoTexto ? ` • ${duracionPeriodoTexto}` : ''
        }`}
        icon={MonitorCheck}
        action={
          <div className="w-full sm:w-64 shrink-0">
            <Select value={periodoId} onValueChange={setPeriodoId}>
              <SelectTrigger className="rounded-full h-9 border-[#2e2e2e] bg-[#252526] text-white text-xs font-semibold focus:ring-1 focus:ring-sky-500 shadow-sm px-3.5">
                <div className="flex items-center gap-2 min-w-0 truncate">
                  <Clock className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                  <SelectValue placeholder="Seleccionar turno..." />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-white max-h-[320px] font-body">
                <SelectItem value="actual" className="font-bold text-sky-400 text-xs">
                  Turno actual
                </SelectItem>
                {cierres && cierres.length > 0 && (
                  <>
                    <Separator className="my-1.5 bg-[#2e2e2e]" />
                    <p className="px-2 py-1 text-[10px] font-semibold text-slate-400">Turnos anteriores</p>
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
        }
      />

      {/* 2. Pestañas Principales (Excluidas del contenedor principal) */}
      <PillTabs
        value={tabActiva}
        onValueChange={setTabActiva}
        tabs={[
          { id: 'gaveta', label: 'Flujo de Gaveta', icon: Banknote },
          { id: 'monedas', label: 'Flujo de Monedas', icon: Coins },
          { id: 'inventario', label: 'Kardex Inventario', icon: PackageSearch },
        ]}
      />

      {/* 3. Contenedor Principal */}
      <SurfaceCard variant="panel" className="p-4 sm:p-5 space-y-4">
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
            productos={productos || []}
            inicioPeriodo={configPeriodo.inicio}
            isLoading={isLoadingInventario}
          />
        )}
      </SurfaceCard>

      <BotonVolverArriba />
    </div>
  );
}
