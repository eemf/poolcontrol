'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  ArrowUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion } from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader, PillTabs, SurfaceCard } from '@/components/comunes';
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
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    ventasAgrupadas,
    ventasPaginadas,
    handleNextPage,
    handlePreviousPage,
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

  const [mostrarVolverArriba, setMostrarVolverArriba] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setMostrarVolverArriba(window.scrollY > 250);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
          <div className="flex flex-col items-center justify-center text-center text-slate-400 h-64 border-2 border-dashed rounded-xl border-[#2e2e2e] bg-[#252526]/30 p-4">
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

        {/* Pie de Paginación y Selector de Filas */}
        {ventasAgrupadas.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#2e2e2e] text-xs text-slate-400">
            <div className="flex items-center justify-center sm:justify-start gap-3 w-full sm:w-auto text-center">
              <span className="inline-flex items-center leading-none text-slate-300">
                Página <strong className="text-white mx-1">{currentPage}</strong> de{' '}
                <strong className="text-white mx-1">{totalPages || 1}</strong> ({ventasAgrupadas.length}{' '}
                {ventasAgrupadas.length === 1 ? 'venta' : 'ventas'})
              </span>

              <div className="flex items-center gap-1.5 pl-3 border-l border-[#2e2e2e]">
                <span className="hidden sm:inline text-slate-400 text-xs">Mostrar:</span>
                <Select
                  value={String(itemsPerPage)}
                  onValueChange={(val) => setItemsPerPage(Number(val))}
                >
                  <SelectTrigger className="h-7 w-[88px] rounded-full border-[#2e2e2e] bg-[#252526] text-slate-200 text-xs font-semibold focus:ring-1 focus:ring-sky-500 px-2.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-200 rounded-xl shadow-xl">
                    <SelectItem value="10" className="text-xs rounded-lg cursor-pointer">
                      10 filas
                    </SelectItem>
                    <SelectItem value="20" className="text-xs rounded-lg cursor-pointer">
                      20 filas
                    </SelectItem>
                    <SelectItem value="50" className="text-xs rounded-lg cursor-pointer">
                      50 filas
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="h-8 rounded-full px-3.5 text-xs font-medium bg-[#252526] hover:bg-[#2e2e2e] text-slate-200 border border-[#2e2e2e]"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="h-8 rounded-full px-3.5 text-xs font-medium bg-[#252526] hover:bg-[#2e2e2e] text-slate-200 border border-[#2e2e2e]"
                >
                  Siguiente
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </SurfaceCard>

      {/* Botón Flotante Volver Arriba */}
      {mostrarVolverArriba && (
        <Button
          type="button"
          onClick={scrollToTop}
          size="icon"
          aria-label="Volver arriba"
          className="fixed bottom-6 right-5 sm:bottom-8 sm:right-8 z-40 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/25 border border-sky-300/30 transition-all duration-200 animate-in fade-in zoom-in-75 cursor-pointer"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

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
