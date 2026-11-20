'use client'

import { PageHeader, SurfaceCard, Paginacion, BotonVolverArriba } from '@/components/comunes'
import { Input } from '@/components/ui/input'
import { Accordion } from '@/components/ui/accordion'
import { History, Search, Loader2, FileText, X } from 'lucide-react'
import { useHistorialCuadreMensual } from './_hooks/use-historial-cuadre-mensual'
import { CuadreMensualItemAcordeon } from './_components/cuadre-mensual-item-acordeon'

export default function HistorialCuadresMensualesPage() {
  const {
    firestore,
    sucursalId,
    cargando,
    error,
    filtro,
    setFiltro,
    totalItems,
    cuadresPaginados,
    openAccordionId,
    setOpenAccordionId,
    pagination,
  } = useHistorialCuadreMensual()

  if (error) {
    return (
      <div className="text-center text-rose-400 p-6 bg-[#1e1e1e] rounded-xl border border-rose-500/30">
        <p className="font-bold">Error al cargar el historial de cuadres:</p>
        <p className="text-xs mt-1">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 font-body pb-10">
      <PageHeader
        title="Historial de Cuadres Mensuales"
        description="Consulta los registros de cierres mensuales anteriores y su desglose semanal."
        icon={History}
        backHref="/dashboard/administracion/cuadre-mensual"
      />

      <SurfaceCard variant="panel" className="p-4 sm:p-5 space-y-4">
        {/* Buscador estándar en píldora con botón X de limpieza */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Buscar por ID de cuadre u observación..."
            className="pl-10 pr-10 rounded-full h-10 border-[#2e2e2e] bg-[#252526] text-slate-100 placeholder:text-slate-400 text-xs sm:text-sm"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
          {filtro && (
            <button
              type="button"
              aria-label="Limpiar búsqueda"
              onClick={() => setFiltro('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {cargando ? (
          <div className="flex flex-col justify-center items-center h-64 space-y-3 text-slate-400">
            <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
            <span className="text-xs">Cargando historial...</span>
          </div>
        ) : cuadresPaginados.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-slate-400 h-64 border border-dashed border-[#2e2e2e] rounded-xl bg-[#252526] p-4">
            <FileText className="h-10 w-10 mb-3 text-slate-500 opacity-50" />
            <p className="font-bold text-sm text-white">
              {filtro ? 'Sin resultados' : 'No hay cuadres mensuales registrados'}
            </p>
            <p className="text-xs max-w-xs mx-auto mt-1 text-slate-400">
              {filtro ? 'Intenta con otro término de búsqueda.' : 'Los cierres mensuales completados aparecerán aquí.'}
            </p>
          </div>
        ) : (
          <Accordion
            type="single"
            collapsible
            className="w-full space-y-2.5"
            value={openAccordionId ?? ''}
            onValueChange={(val) => setOpenAccordionId(val || null)}
          >
            {cuadresPaginados.map(cuadre => (
              <CuadreMensualItemAcordeon
                key={cuadre.id}
                cuadre={cuadre}
                isOpen={openAccordionId === cuadre.id}
                firestore={firestore}
                sucursalId={sucursalId}
              />
            ))}
          </Accordion>
        )}

        <Paginacion
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={totalItems}
          itemsPerPage={pagination.itemsPerPage}
          itemLabel="cuadres"
          onPageChange={pagination.onPageChange}
          onItemsPerPageChange={pagination.onItemsPerPageChange}
        />
      </SurfaceCard>

      <BotonVolverArriba />
    </div>
  )
}
