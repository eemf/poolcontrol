'use client'

import { PageHeader, SurfaceCard, PillTabs, Paginacion, BotonVolverArriba } from '@/components/comunes'
import { Accordion } from '@/components/ui/accordion'
import { History, Loader2, FileText, Clock, Layers } from 'lucide-react'
import { useHistorialCierreCaja } from './_hooks/use-historial-cierre-caja'
import { CierreCajaItemAcordeon } from './_components/cierre-caja-item-acordeon'

export default function HistorialCierresCajaPage() {
  const {
    isLoading,
    error,
    filtro,
    setFiltro,
    mostrarTodos,
    setMostrarTodos,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    totalPages,
    totalPendientes,
    totalCargados,
    cierresPaginados,
  } = useHistorialCierreCaja()

  if (error) {
    return (
      <div className="text-center text-rose-400 p-6 bg-[#1e1e1e] rounded-xl border border-rose-500/30 font-body">
        <p className="font-bold">Error al cargar el historial:</p>
        <p className="text-xs mt-1">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-2 font-body">
      <PageHeader
        title="Historial de Cierres de Caja"
        description="Consulta los registros de cierres, filtrando entre pendientes y el historial completo."
        icon={History}
        backHref="/dashboard/cierre-caja"
      />

      <SurfaceCard variant="panel" className="p-4 sm:p-5 space-y-4">
        {/* Barra Superior Unificada: Buscador a la izquierda y Pestañas a la derecha */}
        <div className="w-full">
          <PillTabs
            value={mostrarTodos ? 'todos' : 'pendientes'}
            onValueChange={(v) => setMostrarTodos(v === 'todos')}
            searchValue={filtro}
            onSearchChange={setFiltro}
            searchPlaceholder="Buscar por # de cierre, usuario u observación..."
            autoFocusSearch={true}
            collapsibleMobileTabs
            tabs={[
              {
                id: 'pendientes',
                label: 'Pendientes',
                icon: Clock,
                count: totalPendientes,
                badgeVariant: 'amber',
              },
              {
                id: 'todos',
                label: 'Todos los Registros',
                icon: Layers,
                count: mostrarTodos ? totalCargados : undefined,
                badgeVariant: 'amber',
              },
            ]}
          />
        </div>

        {/* Listado y Acordeón */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64 text-slate-400">
            <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
          </div>
        ) : cierresPaginados.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-slate-400 h-64 border-2 border-dashed border-[#2e2e2e] rounded-xl bg-[#252526] p-4">
            <FileText className="h-12 w-12 mb-3 text-slate-500" />
            <p className="font-semibold text-sm text-white">
              {filtro
                ? 'No se encontraron resultados'
                : mostrarTodos
                  ? 'No hay cierres registrados'
                  : 'No hay cierres pendientes de liquidar'}
            </p>
            {!mostrarTodos && !filtro && (
              <p className="text-xs text-slate-400 mt-1">
                Selecciona la pestaña &ldquo;Todos los Registros&rdquo; para consultar cierres procesados anteriormente.
              </p>
            )}
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-2.5">
            {cierresPaginados.map(cierre => (
              <CierreCajaItemAcordeon key={cierre.id} cierre={cierre} />
            ))}
          </Accordion>
        )}

        {/* Paginación Estándar */}
        <Paginacion
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          itemLabel="cierres"
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </SurfaceCard>

      <BotonVolverArriba />
    </div>
  )
}
