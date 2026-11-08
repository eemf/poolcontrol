'use client';

import React from 'react';
import { PageHeader, SurfaceCard } from '@/components/comunes';
import { ReceiptText, Download, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion } from '@/components/ui/accordion';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { useControlPagos } from './_hooks/use-control-pagos';
import { ControlPagosMetricas } from './_components/control-pagos-metricas';
import { ControlPagosFiltros } from './_components/control-pagos-filtros';
import { ControlPagosCard } from './_components/control-pagos-card';
import { ControlPagosTicketDialog } from './_components/control-pagos-ticket-dialog';

export default function PaginaControlPagos() {
  const {
    isLoadingSucursal,
    cargandoEstadoCaja,
    cargandoPagos,
    sucursal,
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
    pagoSeleccionadoTicket,
    setPagoSeleccionadoTicket,
    pagosFiltrados,
    paginatedPagos,
    metricas,
    filtrosActivosCount,
    operadoresDisponibles,
    cierres,
    resolverNombreOperador,
    exportarCSV,
  } = useControlPagos();

  const isLoading = isLoadingSucursal || cargandoEstadoCaja || cargandoPagos;

  return (
    <div className="space-y-5">
      {/* 1. Encabezado Estándar PageHeader */}
      <PageHeader
        title="Control de Pagos"
        description="Auditoría financiera de pagos, abonos, métodos de cobro y artículos cubiertos."
        icon={ReceiptText}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={exportarCSV}
            disabled={pagosFiltrados.length === 0}
            className="h-9 px-4 text-xs font-semibold rounded-full bg-app-surface border-app-border text-slate-100 hover:bg-[#2e2e2e] gap-2 shadow-xs"
          >
            <Download className="h-4 w-4 text-sky-400" />
            <span>Exportar CSV</span>
          </Button>
        }
      />

      {/* 2. Tarjetas de Métricas Ejecutivas */}
      <ControlPagosMetricas metricas={metricas} />

      {/* 3. Barra de Búsqueda y Filtros */}
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
        totalPagosFiltrados={pagosFiltrados.length}
      />

      {/* 4. Lista Principal de Pagos */}
      <SurfaceCard variant="panel" className="p-4 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
            <p className="text-xs font-semibold">Cargando pagos y transacciones...</p>
          </div>
        ) : pagosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 border border-dashed border-app-border rounded-xl bg-app-surface/40 my-2">
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
                onImprimirTicket={setPagoSeleccionadoTicket}
              />
            ))}
          </Accordion>
        )}

        {/* Paginación */}
        {!isLoading && pagosFiltrados.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-app-border text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Registros por página:</span>
              <Select value={`${itemsPerPage}`} onValueChange={(v) => setItemsPerPage(Number(v))}>
                <SelectTrigger className="h-8 w-18 text-xs bg-app-surface border-app-border rounded-full text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-app-surface border-app-border text-foreground">
                  {[10, 15, 25, 50, 100].map((size) => (
                    <SelectItem key={size} value={`${size}`}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 rounded-full h-8 bg-app-surface border-app-border text-slate-200 hover:bg-[#2e2e2e]"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="text-xs">Anterior</span>
              </Button>

              <div className="text-xs font-bold text-slate-300 px-2">
                Página {currentPage} de {totalPages}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 rounded-full h-8 bg-app-surface border-app-border text-slate-200 hover:bg-[#2e2e2e]"
              >
                <span className="text-xs">Siguiente</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </SurfaceCard>

      {/* Modal de Comprobante / Ticket Imprimible */}
      <ControlPagosTicketDialog
        pago={pagoSeleccionadoTicket}
        onClose={() => setPagoSeleccionadoTicket(null)}
        sucursalNombre={sucursal?.nombre}
        operadorNombre={pagoSeleccionadoTicket ? resolverNombreOperador(pagoSeleccionadoTicket.usuarioId) : ''}
      />
    </div>
  );
}
