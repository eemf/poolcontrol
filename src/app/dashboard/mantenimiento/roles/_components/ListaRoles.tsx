'use client';

import { SurfaceCard, PillTabs, Paginacion } from "@/components/comunes";
import { ArrowDownAZ, ArrowUpZA, ArrowDown01, ArrowUp01, Loader2, Edit, Trash2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Rol } from "@/lib/tipos";

type RolConDocId = Rol & { docId: string };

interface ListaRolesProps {
  roles: RolConDocId[];
  totalItems: number;
  cargando: boolean;
  terminoBusqueda: string;
  onSearchChange: (val: string) => void;
  orden: string;
  onSortOrderChange: (val: string) => void;
  onEditar: (rol: RolConDocId) => void;
  onEliminar: (rol: RolConDocId) => void;
  paginacion: {
    paginaActual: number;
    itemsPorPagina: number;
    totalPaginas: number;
    onPaginaChange: (pagina: number) => void;
    onItemsPorPaginaChange: (val: number) => void;
  };
}

export function ListaRoles({
  roles,
  totalItems,
  cargando,
  terminoBusqueda,
  onSearchChange,
  orden,
  onSortOrderChange,
  onEditar,
  onEliminar,
  paginacion
}: ListaRolesProps) {
  return (
    <SurfaceCard variant="panel" className="p-4 sm:p-5 space-y-4 font-body">
      <PillTabs
        value={orden}
        onValueChange={onSortOrderChange}
        searchValue={terminoBusqueda}
        onSearchChange={onSearchChange}
        searchPlaceholder="Buscar por nombre o descripción..."
        collapsibleMobileTabs
        tabs={[
          { id: 'id-asc', label: 'Más antiguo', icon: ArrowUp01 },
          { id: 'id-desc', label: 'Más reciente', icon: ArrowDown01 },
          { id: 'name-asc', label: 'A-Z', icon: ArrowDownAZ },
          { id: 'name-desc', label: 'Z-A', icon: ArrowUpZA },
        ]}
      />

      {cargando ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-3 text-slate-400">
          <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
          <span className="text-xs">Cargando roles...</span>
        </div>
      ) : roles.length > 0 ? (
        <div className="space-y-2.5">
          {roles.map((rol) => (
            <div
              key={rol.docId}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border border-[#2e2e2e] hover:border-[#383838] bg-[#252526] transition-all shadow-sm"
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                <div className="h-9 w-9 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0 mt-0.5 sm:mt-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm sm:text-base text-slate-100 truncate">{rol.nombre}</p>
                    <span className="text-[11px] font-medium text-slate-400 tabular-nums shrink-0">
                      #{rol.idRol}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 sm:truncate">
                    {rol.descripcion || 'Sin descripción'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#2e2e2e]">
                <Button
                  size="sm"
                  className="rounded-full h-8 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-sm"
                  onClick={() => onEditar(rol)}
                >
                  <Edit className="mr-1.5 h-3.5 w-3.5" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  className="rounded-full h-8 px-4 text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 shadow-sm"
                  onClick={() => onEliminar(rol)}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center text-slate-400 h-64 rounded-xl border border-dashed border-[#2e2e2e] bg-[#252526]/50 p-6">
          <ShieldCheck className="h-10 w-10 mb-3 text-slate-500" />
          <p className="font-semibold text-base text-slate-200">
            {terminoBusqueda ? "Sin resultados" : "No hay roles registrados"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {terminoBusqueda ? "Prueba ajustando el término de búsqueda." : "Crea tu primer rol para asignar permisos."}
          </p>
        </div>
      )}

      {totalItems > 0 && (
        <Paginacion
          currentPage={paginacion.paginaActual}
          totalPages={paginacion.totalPaginas}
          totalItems={totalItems}
          itemsPerPage={paginacion.itemsPorPagina}
          onPageChange={paginacion.onPaginaChange}
          onItemsPerPageChange={paginacion.onItemsPorPaginaChange}
        />
      )}
    </SurfaceCard>
  );
}
