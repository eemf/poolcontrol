'use client';

import React from 'react';
import {
  PageHeader,
  SurfaceCard,
  Paginacion,
  BotonVolverArriba,
} from '@/components/comunes';
import { Input } from '@/components/ui/input';
import { Accordion } from '@/components/ui/accordion';
import {
  History,
  Search,
  Loader2,
  FileText,
  X,
} from 'lucide-react';

import { useHistorialAjustes } from './_hooks/use-historial-ajustes';
import { AjusteInventarioAcordeon } from './_components/ajuste-inventario-acordeon';

export default function PaginaHistorialAjustes() {
  const {
    isLoading,
    error,
    filtro,
    setFiltro,
    limpiarFiltro,
    openItem,
    setOpenItem,
    searchInputRef,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    totalPages,
    paginatedAjustes,
  } = useHistorialAjustes();

  if (error) {
    return (
      <div className="text-center text-rose-400 p-6 bg-[#1e1e1e] rounded-xl border border-rose-500/30 font-body">
        <p className="font-bold">Error al cargar el historial:</p>
        <p className="text-xs mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-2 font-body">
      <PageHeader
        title="Historial de Revisiones"
        description="Consulta los registros de ajustes realizados al inventario físico."
        icon={History}
        backHref="/dashboard/administracion/inventario"
      />

      <SurfaceCard variant="panel" className="p-4 sm:p-5 space-y-4">
        {/* Buscador Estándar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            ref={searchInputRef}
            autoFocus
            placeholder="Buscar por # de ajuste, producto u observación..."
            className="pl-10 pr-9 rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-xs text-white placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-sky-500"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && filtro) {
                e.preventDefault();
                limpiarFiltro();
              }
            }}
          />
          {filtro && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={limpiarFiltro}
              aria-label="Limpiar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Listado de Revisiones */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
            <span className="text-xs text-slate-400">Cargando historial de revisiones...</span>
          </div>
        ) : paginatedAjustes.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-slate-400 h-64 border-2 border-dashed border-[#2e2e2e] rounded-xl bg-[#252526]/40 p-4">
            <FileText className="h-10 w-10 mb-3 opacity-30 text-slate-500" />
            <p className="font-bold text-sm text-white">
              {filtro ? 'No se encontraron registros' : 'No hay ajustes registrados'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Los ajustes guardados durante las revisiones físicas aparecerán aquí.
            </p>
          </div>
        ) : (
          <Accordion
            type="single"
            collapsible
            className="w-full space-y-2.5"
            value={openItem}
            onValueChange={setOpenItem}
          >
            {paginatedAjustes.map((ajuste) => (
              <AjusteInventarioAcordeon key={ajuste.id} ajuste={ajuste} />
            ))}
          </Accordion>
        )}

        {/* Paginación Estándar */}
        <Paginacion
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          pageSizeOptions={[10, 20, 50, 100]}
          itemLabel="revisión"
          itemLabelPlural="revisiones"
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </SurfaceCard>

      <BotonVolverArriba />
    </div>
  );
}
