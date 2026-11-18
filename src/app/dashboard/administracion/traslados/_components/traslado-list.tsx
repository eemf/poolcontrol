'use client';

import React from 'react';
import type { TrasladoInterSucursal } from '@/lib/tipos';
import type { TabTraslado } from '../_hooks/use-traslados';
import { SurfaceCard, PillTabs, Paginacion } from '@/components/comunes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Truck,
  PackageCheck,
  Boxes,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Undo2,
  Eye,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TrasladoListProps {
  traslados: TrasladoInterSucursal[];
  totalItems: number;
  sucursalId: string | null;
  activeTab: TabTraslado;
  onTabChange: (tab: TabTraslado) => void;
  pendientesCount: number;
  enviadosCount: number;
  historialCount: number;
  busqueda: string;
  onBusquedaChange: (val: string) => void;
  onRecibir: (traslado: TrasladoInterSucursal) => void;
  onCancelar: (traslado: TrasladoInterSucursal) => void;
  onVerDetalle: (traslado: TrasladoInterSucursal) => void;
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (size: number) => void;
  };
}

export function TrasladoList({
  traslados,
  totalItems,
  sucursalId,
  activeTab,
  onTabChange,
  pendientesCount,
  enviadosCount,
  historialCount,
  busqueda,
  onBusquedaChange,
  onRecibir,
  onCancelar,
  onVerDetalle,
  pagination,
}: TrasladoListProps) {
  const renderBadgeEstado = (estado: string) => {
    switch (estado) {
      case 'en_transito':
        return (
          <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full flex items-center gap-1 w-fit text-[11px] font-semibold px-2.5 py-0.5">
            <Clock className="h-3 w-3" />
            <span>En Tránsito</span>
          </Badge>
        );
      case 'recibido':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1 w-fit text-[11px] font-semibold px-2.5 py-0.5">
            <CheckCircle2 className="h-3 w-3" />
            <span>Recibido</span>
          </Badge>
        );
      case 'cancelado':
        return (
          <Badge className="bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full flex items-center gap-1 w-fit text-[11px] font-semibold px-2.5 py-0.5">
            <XCircle className="h-3 w-3" />
            <span>Cancelado</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="rounded-full text-[11px]">
            {estado}
          </Badge>
        );
    }
  };

  return (
    <SurfaceCard variant="panel" className="p-4 sm:p-5 space-y-4 font-body">
      {/* Barra superior unificada con PillTabs + buscador integrado + menú móvil Opciones */}
      <PillTabs
        value={activeTab}
        onValueChange={(v) => onTabChange(v as TabTraslado)}
        searchValue={busqueda}
        onSearchChange={onBusquedaChange}
        searchPlaceholder="Buscar por #, sucursal o producto..."
        collapsibleMobileTabs
        tabs={[
          {
            id: 'pendientes',
            label: 'Pendientes',
            icon: PackageCheck,
            count: pendientesCount,
            badgeVariant: 'amber',
          },
          {
            id: 'en_transito',
            label: 'Enviados',
            icon: Truck,
            count: enviadosCount,
            badgeVariant: 'white',
          },
          {
            id: 'todos',
            label: 'Historial',
            icon: Boxes,
            count: historialCount,
            badgeVariant: 'sky',
          },
        ]}
      />

      {traslados.length > 0 ? (
        <Accordion type="single" collapsible className="w-full space-y-2.5">
          {traslados.map((traslado) => {
            const esDestino = traslado.sucursalDestinoId === sucursalId;
            const esOrigen = traslado.sucursalOrigenId === sucursalId;
            const puedeRecibir = esDestino && traslado.estado === 'en_transito';
            const puedeCancelar = esOrigen && traslado.estado === 'en_transito';
            const fechaStr = traslado.fechaEnvio?.toDate
              ? format(traslado.fechaEnvio.toDate(), 'dd/MM/yyyy • hh:mm a', { locale: es })
              : 'N/A';

            return (
              <AccordionItem
                value={traslado.id}
                key={traslado.id}
                className="rounded-xl border border-[#2e2e2e] bg-[#252526] hover:border-[#383838] transition-all overflow-hidden shadow-sm"
              >
                <AccordionTrigger className="px-3.5 py-3 sm:px-4 sm:py-3.5 hover:no-underline hover:bg-[#2e2e2e]/30 transition-colors data-[state=open]:border-b data-[state=open]:border-[#2e2e2e]">
                  <div className="flex-1 grid grid-cols-[1fr_auto] gap-3 sm:gap-4 items-center text-sm text-left pr-1.5 sm:pr-2.5">
                    <div className="flex flex-col items-start gap-1 min-w-0">
                      <p className="font-bold text-sm sm:text-base text-slate-100 truncate w-full">
                        #TR-{traslado.idTraslado} • {traslado.sucursalOrigenNombre} → {traslado.sucursalDestinoNombre}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                        <Clock className="h-3 w-3 text-slate-500 shrink-0" />
                        {fechaStr}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                      <p className="font-bold text-base sm:text-lg text-emerald-400 leading-none tabular-nums">
                        Q{(traslado.costoTotalTraslado || 0).toFixed(2)}
                      </p>
                      {renderBadgeEstado(traslado.estado)}
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="p-3.5 sm:p-4 bg-[#1e1e1e]">
                  <div className="space-y-3.5">
                    {/* Ruta de Envío */}
                    <div className="p-2.5 rounded-xl bg-[#252526] border border-[#2e2e2e] flex items-center justify-between text-xs gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-slate-400 block font-medium">Origen</span>
                        <span className={`font-semibold truncate block ${esOrigen ? 'text-sky-400' : 'text-slate-200'}`}>
                          {traslado.sucursalOrigenNombre}
                        </span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 shrink-0 mx-1" />
                      <div className="flex-1 min-w-0 text-right">
                        <span className="text-[10px] text-slate-400 block font-medium">Destino</span>
                        <span className={`font-semibold truncate block ${esDestino ? 'text-emerald-400' : 'text-slate-200'}`}>
                          {traslado.sucursalDestinoNombre}
                        </span>
                      </div>
                    </div>

                    {/* Detalle de productos */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold text-xs text-slate-300 flex items-center gap-1.5">
                          <Boxes className="h-3.5 w-3.5 text-sky-400" />
                          <span>Productos trasladados</span>
                        </h4>
                        <span className="text-[11px] font-medium text-slate-400 tabular-nums">
                          {traslado.cantidadTotalItems} uds ({traslado.items?.length || 0}{' '}
                          {(traslado.items?.length || 0) === 1 ? 'artículo' : 'artículos'})
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {traslado.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center bg-[#252526] border border-[#2e2e2e] p-2.5 rounded-xl text-xs"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="font-semibold text-slate-100 truncate">{item.nombreProducto}</p>
                              <p className="text-[10px] text-slate-400 tabular-nums">
                                {item.cantidad} unidades &times; Q{item.costoUnitario.toFixed(2)}
                              </p>
                            </div>
                            <p className="font-bold text-sky-400 tabular-nums shrink-0">
                              Q{(item.costoTotal ?? item.cantidad * item.costoUnitario).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-wrap justify-end gap-2 pt-2.5 border-t border-[#2e2e2e]">
                      {puedeRecibir && (
                        <Button
                          size="sm"
                          onClick={() => onRecibir(traslado)}
                          className="rounded-full h-8 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 transition-all"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Recibir</span>
                        </Button>
                      )}

                      {puedeCancelar && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onCancelar(traslado)}
                          className="rounded-full h-8 px-4 text-xs font-semibold bg-rose-500/15 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/25 flex items-center gap-1.5 transition-all"
                        >
                          <Undo2 className="h-3.5 w-3.5" />
                          <span>Cancelar</span>
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onVerDetalle(traslado)}
                        className="rounded-full h-8 px-4 text-xs font-semibold bg-[#252526] border-[#2e2e2e] text-slate-200 hover:bg-[#313131] flex items-center gap-1.5 transition-all"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Ver Detalle</span>
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      ) : (
        <div className="flex flex-col items-center justify-center text-center text-slate-400 h-64 border border-dashed border-[#2e2e2e] rounded-xl bg-[#252526] p-4">
          <Truck className="h-10 w-10 mb-3 text-slate-500 opacity-50" />
          <p className="font-bold text-sm text-white">
            {busqueda ? 'Sin resultados' : 'No hay traslados en esta sección'}
          </p>
          <p className="text-xs max-w-xs mx-auto mt-1 text-slate-400">
            {busqueda
              ? 'Prueba con otros términos de búsqueda.'
              : 'Los traslados entre sucursales aparecerán aquí.'}
          </p>
        </div>
      )}

      <Paginacion
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={totalItems}
        itemsPerPage={pagination.itemsPerPage}
        itemLabel="traslados"
        onPageChange={pagination.onPageChange}
        onItemsPerPageChange={pagination.onItemsPerPageChange}
      />
    </SurfaceCard>
  );
}

