'use client';

import { SurfaceCard, PillTabs, Paginacion } from "@/components/comunes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowDownAZ, ArrowUpZA, ArrowDown01, ArrowUp01, Loader2, Edit, Trash2, Utensils, MapPin, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Producto } from "@/lib/tipos";

type ProductoConDocId = Producto & { docId: string };

interface ListaProductosProps {
  productos: ProductoConDocId[];
  totalItems: number;
  cargando: boolean;
  terminoBusqueda: string;
  onSearchChange: (val: string) => void;
  orden: string;
  onSortOrderChange: (val: string) => void;
  ubicacionFiltro: string;
  onUbicacionFiltroChange: (val: string) => void;
  ubicacionesDisponibles: string[];
  onEditar: (producto: ProductoConDocId) => void;
  onEliminar: (producto: ProductoConDocId) => void;
  paginacion: {
    paginaActual: number;
    itemsPorPagina: number;
    totalPaginas: number;
    onPaginaChange: (pagina: number) => void;
    onItemsPorPaginaChange: (val: number) => void;
  };
}

export function ListaProductos({
  productos,
  totalItems,
  cargando,
  terminoBusqueda,
  onSearchChange,
  orden,
  onSortOrderChange,
  ubicacionFiltro,
  onUbicacionFiltroChange,
  ubicacionesDisponibles,
  onEditar,
  onEliminar,
  paginacion
}: ListaProductosProps) {
  const ubicacionSelect = (className?: string) => (
    <Select value={ubicacionFiltro} onValueChange={onUbicacionFiltroChange}>
      <SelectTrigger className={cn("rounded-full h-10 sm:h-11 border-[#2e2e2e] bg-[#252526] hover:bg-[#313131] text-xs shrink-0", className)}>
        <div className="flex items-center gap-2 truncate">
          <MapPin className="h-3.5 w-3.5 text-sky-400 shrink-0" />
          <SelectValue placeholder="Ubicación..." />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 font-body">
        <SelectItem value="todas" className="text-xs">Todas las ubicaciones</SelectItem>
        {ubicacionesDisponibles.map((u) => (
          <SelectItem key={u} value={u} className="text-xs">{u}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <SurfaceCard variant="panel" className="p-4 sm:p-5 space-y-4 font-body">
      {/* Barra superior unificada: PillTabs con buscador + Opciones en móvil (incluye ubicación) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="flex-1 min-w-0">
          <PillTabs
            value={orden}
            onValueChange={onSortOrderChange}
            searchValue={terminoBusqueda}
            onSearchChange={onSearchChange}
            searchPlaceholder="Buscar producto por nombre..."
            collapsibleMobileTabs
            hasActiveExtraFilter={ubicacionFiltro !== 'todas'}
            mobileExtraContent={ubicacionSelect("w-full")}
            tabs={[
              { id: 'name-asc', label: 'A-Z', icon: ArrowDownAZ },
              { id: 'name-desc', label: 'Z-A', icon: ArrowUpZA },
              { id: 'stock-asc', label: 'Menor stock', icon: ArrowUp01 },
              { id: 'stock-desc', label: 'Mayor stock', icon: ArrowDown01 },
            ]}
          />
        </div>

        <div className="hidden sm:block shrink-0">
          {ubicacionSelect("w-[200px]")}
        </div>
      </div>

      {cargando ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-3 text-slate-400">
          <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
          <span className="text-xs">Cargando productos...</span>
        </div>
      ) : productos.length > 0 ? (
        <Accordion type="single" collapsible className="w-full space-y-2.5">
          {productos.map((producto) => {
            const stockMinimo = producto.existenciaMinima || 0;
            const stockBajo = producto.existencia <= stockMinimo;
            const numPrep = producto.preparaciones?.length || 0;

            return (
              <AccordionItem
                value={producto.docId}
                key={producto.docId}
                className={cn(
                  "rounded-xl border bg-[#252526] transition-all overflow-hidden shadow-sm",
                  stockBajo
                    ? "border-amber-500/40 hover:border-amber-500/60"
                    : "border-[#2e2e2e] hover:border-[#383838]"
                )}
              >
                <AccordionTrigger className="px-3.5 py-3 sm:px-4 sm:py-3.5 hover:no-underline hover:bg-[#2e2e2e]/30 transition-colors data-[state=open]:border-b data-[state=open]:border-[#2e2e2e]">
                  <div className="flex-1 grid grid-cols-[1fr_auto] gap-3 items-center text-sm text-left pr-1.5 sm:pr-2.5">
                    <div className="flex flex-col items-start gap-1 min-w-0">
                      <p className="font-bold text-sm sm:text-base text-slate-100 truncate w-full">
                        {producto.nombre}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-400 font-medium">
                        <span className={cn("tabular-nums", stockBajo ? "text-amber-300 font-semibold" : "")}>
                          Stock: {producto.existencia} / Mín: {stockMinimo}
                        </span>
                        {producto.ubicacion && (
                          <span className="inline-flex items-center gap-1 text-sky-400">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {producto.ubicacion}
                          </span>
                        )}
                        {numPrep > 0 && (
                          <span className="inline-flex items-center gap-1 text-slate-300">
                            <Utensils className="h-3 w-3 shrink-0" />
                            {numPrep} {numPrep === 1 ? 'prep.' : 'preps.'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                      <p className="font-bold text-base sm:text-lg text-emerald-400 leading-none tabular-nums">
                        Q{producto.precioVenta.toFixed(2)}
                      </p>
                      <Badge
                        className={cn(
                          "rounded-full text-[10px] font-semibold px-2 py-0.5",
                          stockBajo
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        )}
                      >
                        {stockBajo ? 'Stock bajo' : 'En stock'}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="p-3.5 sm:p-4 bg-[#1e1e1e]">
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="bg-[#252526] border border-[#2e2e2e] rounded-xl px-3 py-2.5">
                        <p className="text-[11px] text-slate-400 font-medium">Precio de compra</p>
                        <p className="text-sm font-bold text-slate-100 tabular-nums mt-0.5">
                          Q{producto.precioCompra.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-[#252526] border border-[#2e2e2e] rounded-xl px-3 py-2.5 min-w-0">
                        <p className="text-[11px] text-slate-400 font-medium">Código de búsqueda</p>
                        <p className="text-sm font-bold text-slate-100 truncate mt-0.5">
                          {producto.codigoBusqueda || 'N/A'}
                        </p>
                      </div>
                      <div className="bg-[#252526] border border-[#2e2e2e] rounded-xl px-3 py-2.5 min-w-0">
                        <p className="text-[11px] text-slate-400 font-medium">Ubicación</p>
                        <p className="text-sm font-bold text-sky-400 truncate mt-0.5">
                          {producto.ubicacion || 'Sin asignar'}
                        </p>
                      </div>
                    </div>

                    {numPrep > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <Utensils className="h-3.5 w-3.5 text-sky-400" />
                          <span>Preparaciones ({numPrep})</span>
                        </h4>
                        <div className="rounded-xl border border-[#2e2e2e] bg-[#252526] divide-y divide-[#2e2e2e] overflow-hidden">
                          {producto.preparaciones?.map((prep, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs px-3 py-2">
                              <span className="font-semibold text-slate-100 truncate pr-2">{prep.nombre}</span>
                              <span className="font-bold text-sky-400 tabular-nums shrink-0">
                                Q{prep.precioVenta.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2.5 border-t border-[#2e2e2e]">
                      <Button
                        size="sm"
                        className="rounded-full h-8 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-sm flex items-center gap-1.5"
                        onClick={() => onEditar(producto)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full h-8 px-4 text-xs font-semibold bg-rose-500/15 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/25 flex items-center gap-1.5"
                        onClick={() => onEliminar(producto)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Eliminar</span>
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      ) : (
        <div className="flex flex-col items-center justify-center text-center text-slate-400 h-64 border border-dashed border-[#2e2e2e] rounded-xl bg-[#252526] p-4">
          <Package className="h-10 w-10 mb-3 text-slate-500 opacity-50" />
          <p className="font-bold text-sm text-white">
            {terminoBusqueda ? "Sin resultados" : "No hay productos registrados"}
          </p>
          <p className="text-xs max-w-xs mx-auto mt-1 text-slate-400">
            {terminoBusqueda ? "Prueba con otros términos de búsqueda." : "Tus productos aparecerán aquí."}
          </p>
        </div>
      )}

      <Paginacion
        currentPage={paginacion.paginaActual}
        totalPages={paginacion.totalPaginas}
        totalItems={totalItems}
        itemsPerPage={paginacion.itemsPorPagina}
        itemLabel="productos"
        onPageChange={paginacion.onPaginaChange}
        onItemsPerPageChange={paginacion.onItemsPorPaginaChange}
      />
    </SurfaceCard>
  );
}
