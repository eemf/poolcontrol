'use client'

import { PageHeader } from '@/components/comunes/page-header'
import { SurfaceCard } from '@/components/comunes/surface-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Accordion } from '@/components/ui/accordion'
import { History, Search, Loader2, ChevronLeft, ChevronRight, FileText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
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
    currentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    cuadresPaginados,
    openAccordionId,
    setOpenAccordionId,
    handleNextPage,
    handlePreviousPage,
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
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Historial de Cuadres Mensuales"
        description="Consulta los registros de cierres mensuales anteriores y su desglose semanal."
        icon={History}
        action={
          <Button variant="outline" asChild className="rounded-full h-9 px-5 border-[#2e2e2e] text-white hover:bg-[#252526] w-full sm:w-auto">
            <Link href="/dashboard/administracion/cuadre-mensual">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
        }
      />

      <SurfaceCard variant="panel" className="space-y-4">
        {/* Barra de Búsqueda */}
        <div className="pb-3 border-b border-[#2e2e2e]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por ID de cuadre u observación..."
              className="pl-10 rounded-full h-10 border-[#2e2e2e] bg-[#252526] text-white placeholder:text-slate-400 focus-visible:ring-sky-500"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
        </div>

        {/* Listado y Acordeón */}
        {cargando ? (
          <div className="flex justify-center items-center h-64 text-slate-400">
            <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
          </div>
        ) : cuadresPaginados.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-slate-400 h-64 border-2 border-dashed border-[#2e2e2e] rounded-xl bg-[#252526]/40">
            <FileText className="h-12 w-12 mb-3 text-slate-500" />
            <p className="font-semibold text-base text-white">
              {filtro ? "No se encontraron registros" : "No hay cuadres mensuales registrados"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {filtro ? "Intenta con otro término de búsqueda." : "Los cierres completados aparecerán aquí."}
            </p>
          </div>
        ) : (
          <Accordion
            type="single"
            collapsible
            className="w-full space-y-2"
            value={openAccordionId || undefined}
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

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center gap-3 border-t border-[#2e2e2e] pt-4 sm:flex-row sm:justify-between">
            <div className="flex items-center space-x-2">
              <p className="text-xs font-medium text-slate-400">Filas por página</p>
              <Select
                value={`${itemsPerPage}`}
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
                <SelectTrigger className="h-8 w-[70px] rounded-full text-xs bg-[#252526] border-[#2e2e2e] text-white">
                  <SelectValue placeholder={itemsPerPage} />
                </SelectTrigger>
                <SelectContent className="bg-[#252526] border-[#2e2e2e] text-white">
                  {[10, 30, 50, 100].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex w-full items-center justify-between sm:justify-center space-x-2 sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="h-8 px-3 rounded-full border-[#2e2e2e] text-slate-300 hover:bg-[#252526]"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline text-xs ml-1 font-semibold">Anterior</span>
              </Button>
              <div className="text-xs font-semibold text-slate-400 px-2">
                Página {currentPage} de {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="h-8 px-3 rounded-full border-[#2e2e2e] text-slate-300 hover:bg-[#252526]"
              >
                <span className="hidden sm:inline text-xs mr-1 font-semibold">Siguiente</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </SurfaceCard>
    </div>
  )
}
