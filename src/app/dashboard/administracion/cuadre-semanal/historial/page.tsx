'use client'

import { PageHeader, SurfaceCard, PillTabs, Paginacion, BotonVolverArriba } from '@/components/comunes'
import { Accordion } from '@/components/ui/accordion'
import { History, Loader2, FileText, Clock, Boxes } from 'lucide-react'
import { useHistorialCuadreSemanal } from './_hooks/use-historial-cuadre-semanal'
import { CuadreItemAcordeon } from './_components/cuadre-item-acordeon'

export default function HistorialCuadresSemanalesPage() {
  const {
    firestore,
    sucursalId,
    cargando,
    error,
    filtro,
    setFiltro,
    mostrarTodos,
    setMostrarTodos,
    totalPendientes,
    totalTodos,
    totalItems,
    cuadresPaginados,
    openAccordionId,
    setOpenAccordionId,
    pagination,
  } = useHistorialCuadreSemanal()

  if (error) {
    return (
      <div className="text-center text-rose-400 p-6 bg-[#1e1e1e] rounded-xl border border-rose-500/30">
        <p>Error al cargar el historial de cuadres: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 font-body pb-10">
      <PageHeader
        title="Historial de Cuadres Semanales"
        description="Consulta los registros de cierres semanales y liquidaciones anteriores."
        icon={History}
        backHref="/dashboard/administracion/cuadre-semanal"
      />

      <SurfaceCard variant="panel" className="p-4 sm:p-5 space-y-4">
        <PillTabs
          value={mostrarTodos ? 'todos' : 'pendientes'}
          onValueChange={(val) => setMostrarTodos(val === 'todos')}
          searchValue={filtro}
          onSearchChange={setFiltro}
          searchPlaceholder="Buscar por ID u observaciones..."
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
              label: 'Todos',
              icon: Boxes,
              count: totalTodos,
              badgeVariant: 'sky',
            },
          ]}
        />

        {cargando ? (
          <div className="flex flex-col justify-center items-center h-64 space-y-3 text-slate-400">
            <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
            <span className="text-xs">Cargando historial...</span>
          </div>
        ) : cuadresPaginados.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-slate-400 h-64 border border-dashed border-[#2e2e2e] rounded-xl bg-[#252526] p-4">
            <FileText className="h-10 w-10 mb-3 text-slate-500 opacity-50" />
            <p className="font-bold text-sm text-white">
              {filtro ? 'Sin resultados' : (mostrarTodos ? 'No hay cuadres registrados' : 'No hay cuadres pendientes')}
            </p>
            <p className="text-xs max-w-xs mx-auto mt-1 text-slate-400">
              {filtro ? 'Prueba con otro ID u observación.' : 'Los cierres semanales aparecerán aquí.'}
            </p>
          </div>
        ) : (
          <Accordion
            type="single"
            collapsible
            className="w-full space-y-2.5"
            value={openAccordionId || undefined}
            onValueChange={(val) => setOpenAccordionId(val || null)}
          >
            {cuadresPaginados.map(cuadre => (
              <CuadreItemAcordeon
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
