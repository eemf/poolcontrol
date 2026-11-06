'use client'

import { PageHeader } from '@/components/comunes/page-header'
import { SurfaceCard } from '@/components/comunes/surface-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Accordion } from '@/components/ui/accordion'
import { Switch } from '@/components/ui/switch'
import { History, Search, Loader2, ChevronLeft, ChevronRight, FileText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
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
    currentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    cuadresPaginados,
    openAccordionId,
    setOpenAccordionId,
    handleNextPage,
    handlePreviousPage,
  } = useHistorialCuadreSemanal()

  if (error) {
    return (
      <div className="text-center text-rose-400 p-6 bg-[#1d283a] rounded-xl border border-rose-500/30">
        <p>Error al cargar el historial de cuadres: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Historial de Cuadres Semanales"
        description="Consulta los registros de cierres semanales y liquidaciones anteriores."
        icon={History}
        action={
          <Button variant="outline" asChild className="rounded-full h-9 px-5 border-[#324157] text-white hover:bg-[#283244] w-full sm:w-auto">
            <Link href="/dashboard/administracion/cuadre-semanal">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
        }
      />

      <SurfaceCard variant="panel" className="space-y-4">
        {/* Barra de Filtros */}
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center pb-3 border-b border-[#324157]">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por ID u observaciones..."
              className="pl-10 rounded-full h-10 border-[#324157] bg-[#283244] text-white placeholder:text-slate-400 focus-visible:ring-sky-500"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-center gap-3 px-4 h-10 border border-[#324157] rounded-full bg-[#283244] shrink-0 w-full sm:w-auto">
            <span className={cn("text-xs font-semibold transition-colors", !mostrarTodos ? "text-sky-400" : "text-slate-400")}>
              Pendientes
            </span>
            <Switch
              id="mostrar-todos-switch"
              checked={mostrarTodos}
              onCheckedChange={setMostrarTodos}
            />
            <span className={cn("text-xs font-semibold transition-colors", mostrarTodos ? "text-sky-400" : "text-slate-400")}>
              Todos
            </span>
          </div>
        </div>

        {/* Listado y Acordeón */}
        {cargando ? (
          <div className="flex justify-center items-center h-64 text-slate-400">
            <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
          </div>
        ) : cuadresPaginados.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-slate-400 h-64 border-2 border-dashed border-[#324157] rounded-xl bg-[#283244]/40">
            <FileText className="h-12 w-12 mb-3 text-slate-500" />
            <p className="font-semibold text-base text-white">
              {filtro ? "No se encontraron registros" : (mostrarTodos ? "No hay cuadres registrados" : "No hay cuadres pendientes")}
            </p>
          </div>
        ) : (
          <Accordion
            type="single"
            collapsible
            className="w-full space-y-3"
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

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center gap-3 border-t border-[#324157] pt-4 sm:flex-row sm:justify-between">
            <div className="flex items-center space-x-2">
              <p className="text-xs font-medium text-slate-400">Filas por página</p>
              <Select
                value={`${itemsPerPage}`}
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
                <SelectTrigger className="h-8 w-[70px] rounded-full text-xs bg-[#283244] border-[#324157] text-white">
                  <SelectValue placeholder={itemsPerPage} />
                </SelectTrigger>
                <SelectContent className="bg-[#283244] border-[#324157] text-white">
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
                className="h-8 px-3 rounded-full border-[#324157] text-slate-300 hover:bg-[#283244]"
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
                className="h-8 px-3 rounded-full border-[#324157] text-slate-300 hover:bg-[#283244]"
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
