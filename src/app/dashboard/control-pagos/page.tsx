'use client';

import React from 'react';
import { PageHeader, SurfaceCard, Paginacion, BotonVolverArriba } from '@/components/comunes';
import { ReceiptText, Loader2, Clock } from 'lucide-react';
import { Accordion } from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toDate } from '@/lib/firebase/servicios/utils';
import { useControlPagos, type PeriodoTipo } from './_hooks/use-control-pagos';
import { ControlPagosFiltros } from './_components/control-pagos-filtros';
import { ControlPagosCard } from './_components/control-pagos-card';

export default function PaginaControlPagos() {
  const {
    isLoadingSucursal,
    cargandoEstadoCaja,
    cargandoPagos,
    filtroTexto,
    setFiltroTexto,
    mostrarFiltros,
    setMostrarFiltros,
    periodoFiltro,
    setPeriodoFiltro,
    metodoFiltro,
    setMetodoFiltro,
    operadorFiltro,
    setOperadorFiltro,
    tipoCoberturaFiltro,
    setTipoCoberturaFiltro,
    fechaInicioPers,
    setFechaInicioPers,
    fechaFinPers,
    setFechaFinPers,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    pagosFiltrados,
    paginatedPagos,
    filtrosActivosCount,
    operadoresDisponibles,
    cierres,
    resolverNombreOperador,
  } = useControlPagos();

  const isLoading = isLoadingSucursal || cargandoEstadoCaja || cargandoPagos;

  return (
    <div className="space-y-3.5">
      {/* 1. Encabezado Estándar PageHeader con Selector de Turno */}
      <PageHeader
        title="Control de Pagos"
        description="Auditoría financiera de pagos, abonos, métodos de cobro y artículos cubiertos."
        icon={ReceiptText}
        action={
          <div className="w-full sm:w-64 shrink-0">
            <Select value={periodoFiltro} onValueChange={(v) => setPeriodoFiltro(v as PeriodoTipo)}>
              <SelectTrigger className="rounded-full h-9 border-[#2e2e2e] bg-[#252526] text-white text-xs font-semibold focus:ring-1 focus:ring-sky-500 shadow-sm px-3.5">
                <div className="flex items-center gap-2 min-w-0 truncate">
                  <Clock className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                  <SelectValue placeholder="Seleccionar turno..." />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-white max-h-[340px] font-body">
                <SelectItem value="actual" className="font-bold text-sky-400 text-xs">
                  Turno actual
                </SelectItem>
                {cierres && cierres.length > 0 && (
                  <>
                    <Separator className="my-1.5 bg-[#2e2e2e]" />
                    <p className="px-2 py-1 text-[0.625rem] font-semibold text-slate-400">
                      Turnos anteriores
                    </p>
                    {cierres.slice(0, 15).map((c) => (
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

      {/* 2. Contenedor Principal Unificado (Buscador, Preferencias/Filtros, Lista y Paginación) */}
      <SurfaceCard variant="panel" className="p-3.5 sm:p-4 space-y-3.5">
        {/* Barra de Búsqueda y Preferencias/Filtros integrados directamente en el panel */}
        <ControlPagosFiltros
          filtroTexto={filtroTexto}
          setFiltroTexto={setFiltroTexto}
          mostrarFiltros={mostrarFiltros}
          setMostrarFiltros={setMostrarFiltros}
          filtrosActivosCount={filtrosActivosCount}
          periodoFiltro={periodoFiltro}
          setPeriodoFiltro={setPeriodoFiltro}
          metodoFiltro={metodoFiltro}
          setMetodoFiltro={setMetodoFiltro}
          operadorFiltro={operadorFiltro}
          setOperadorFiltro={setOperadorFiltro}
          tipoCoberturaFiltro={tipoCoberturaFiltro}
          setTipoCoberturaFiltro={setTipoCoberturaFiltro}
          fechaInicioPers={fechaInicioPers}
          setFechaInicioPers={setFechaInicioPers}
          fechaFinPers={fechaFinPers}
          setFechaFinPers={setFechaFinPers}
          operadoresDisponibles={operadoresDisponibles}
          cierres={cierres}
        />

        {/* Lista de Pagos */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
            <p className="text-xs font-semibold">Cargando pagos y transacciones...</p>
          </div>
        ) : pagosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 border border-dashed border-[#2e2e2e] rounded-xl bg-[#252526] my-2">
            <div className="w-14 h-14 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400 mb-3">
              <ReceiptText className="h-7 w-7" />
            </div>
            <h3 className="font-bold text-base text-slate-100">No se encontraron pagos</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              {filtroTexto 
                ? `No hay registros coincidentes con "${filtroTexto}" en este período.`
                : 'No se registran pagos en el período seleccionado.'}
            </p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-2.5">
            {paginatedPagos.map((pago) => (
              <ControlPagosCard
                key={pago.id}
                pago={pago}
                operadorNombre={resolverNombreOperador(pago.usuarioId)}
                filtroTexto={filtroTexto}
              />
            ))}
          </Accordion>
        )}

        {/* Paginación Estándar */}
        {!isLoading && pagosFiltrados.length > 0 && (
          <div className="pt-2 border-t border-[#2e2e2e]">
            <Paginacion
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={pagosFiltrados.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              pageSizeOptions={[10, 15, 25, 50, 100]}
              itemLabel="pago"
              itemLabelPlural="pagos"
            />
          </div>
        )}
      </SurfaceCard>

      {/* Control Estándar para Regresar al Inicio */}
      <BotonVolverArriba threshold={150} />
    </div>
  );
}
