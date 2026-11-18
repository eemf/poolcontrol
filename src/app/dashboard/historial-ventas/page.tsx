'use client';

import React from 'react';
import {
  History,
  Loader2,
  Clock,
  Layers,
} from 'lucide-react';
import { Accordion } from '@/components/ui/accordion';
import { PageHeader, PillTabs, SurfaceCard, Paginacion, BotonVolverArriba } from '@/components/comunes';
import { HistorialVentaItem } from './_components/historial-venta-item';
import { HistorialDialogs } from './_components/historial-dialogs';
import { useHistorialVentas } from './_hooks/use-historial-ventas';

export default function HistorialVentasPage() {
  const {
    filtro,
    setFiltro,
    mostrarTodas,
    setMostrarTodas,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    ventasAgrupadas,
    ventasPaginadas,
    ventaAAnular,
    setVentaAAnular,
    pagoACambiar,
    setPagoACambiar,
    procesandoAccion,
    procesandoCambioMetodo,
    confirmarAnulacion,
    confirmarCambioMetodo,
    isLoading,
    errorPagos,
  } = useHistorialVentas();

  if (errorPagos) {
    return (
      <div className="text-center text-rose-400 p-4">
        {errorPagos.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historial de Ventas"
        description="Consulta y administra el registro consolidado de cobros y abonos por turno."
        icon={History}
        backHref="/dashboard/ventas"
      />

      <SurfaceCard variant="panel" className="p-4 sm:p-5 space-y-4">
        {/* Barra Superior con Pestañas y Buscador a 100% de ancho sin saltos de fila */}
        <div className="w-full">
          <PillTabs
            value={mostrarTodas ? 'todos' : 'turno'}
            onValueChange={(val) => setMostrarTodas(val === 'todos')}
            searchValue={filtro}
            onSearchChange={setFiltro}
            searchPlaceholder="Buscar por # de venta, pago o cliente..."
            collapsibleMobileTabs
            tabs={[
              {
                id: 'turno',
                label: 'Turno Actual',
                icon: Clock,
                count: !mostrarTodas ? ventasAgrupadas.length : undefined,
                badgeVariant: 'white',
              },
              {
                id: 'todos',
                label: 'Todos los Turnos',
                icon: Layers,
                count: mostrarTodas ? ventasAgrupadas.length : undefined,
                badgeVariant: 'white',
              },
            ]}
          />
        </div>

        {/* Listado de Ventas Agrupadas */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
          </div>
        ) : ventasPaginadas.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-slate-400 h-64 border-2 border-dashed rounded-xl border-[#2e2e2e] bg-[#252526] p-4">
            <div className="w-12 h-12 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-3">
              <History className="h-6 w-6" />
            </div>
            <p className="font-bold text-sm text-slate-200">
              {filtro
                ? 'No se encontraron resultados'
                : mostrarTodas
                ? 'No hay cobros registrados'
                : 'No hay cobros en el turno actual'}
            </p>
            {!mostrarTodas && !filtro && (
              <p className="text-xs text-slate-400 mt-1">
                Selecciona la pestaña &ldquo;Todos los Turnos&rdquo; para consultar turnos anteriores.
              </p>
            )}
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-2.5">
            {ventasPaginadas.map((venta) => (
              <HistorialVentaItem
                key={venta.ventaDocId}
                venta={venta}
                onAnular={setVentaAAnular}
                onCambiarMetodo={(pago, vId) => setPagoACambiar({ pago, ventaDocId: vId })}
              />
            ))}
          </Accordion>
        )}

        {/* Pie de Paginación Estándar */}
        {ventasAgrupadas.length > 0 && (
          <Paginacion
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={ventasAgrupadas.length}
            itemsPerPage={itemsPerPage}
            itemLabel="ventas"
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        )}
      </SurfaceCard>

      {/* Botón Flotante Estándar Volver Arriba */}
      <BotonVolverArriba />

      {/* Modales de Confirmación Estandarizados */}
      <HistorialDialogs
        ventaAAnular={ventaAAnular}
        setVentaAAnular={setVentaAAnular}
        pagoACambiar={pagoACambiar}
        setPagoACambiar={setPagoACambiar}
        procesandoAccion={procesandoAccion}
        procesandoCambioMetodo={procesandoCambioMetodo}
        confirmarAnulacion={confirmarAnulacion}
        confirmarCambioMetodo={confirmarCambioMetodo}
      />
    </div>
  );
}
