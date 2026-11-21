'use client';

import { SurfaceCard, PillTabs, Paginacion } from "@/components/comunes";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowDownAZ, ArrowUpZA, ArrowDown01, ArrowUp01, Loader2, Edit, Trash2, Ghost, ShoppingCart, PackageCheck, Tag } from "lucide-react";
import type { ProductoVirtual } from "@/lib/tipos";

type ProductoVirtualConDocId = ProductoVirtual & { docId: string };

interface ListaProductosVirtualesProps {
  productos: ProductoVirtualConDocId[];
  totalItems: number;
  cargando: boolean;
  terminoBusqueda: string;
  onSearchChange: (val: string) => void;
  orden: string;
  onSortOrderChange: (val: string) => void;
  onEditar: (producto: ProductoVirtualConDocId) => void;
  onEliminar: (producto: ProductoVirtualConDocId) => void;
  paginacion: {
    paginaActual: number;
    itemsPorPagina: number;
    totalPaginas: number;
    onPaginaChange: (pagina: number) => void;
    onItemsPorPaginaChange: (val: number) => void;
  };
}

export function ListaProductosVirtuales({
  productos,
  totalItems,
  cargando,
  terminoBusqueda,
  onSearchChange,
  orden,
  onSortOrderChange,
  onEditar,
  onEliminar,
  paginacion
}: ListaProductosVirtualesProps) {
  return (
    <SurfaceCard variant="panel" className="p-4 sm:p-5 space-y-4 font-body">
      <PillTabs
        value={orden}
        onValueChange={onSortOrderChange}
        searchValue={terminoBusqueda}
        onSearchChange={onSearchChange}
        searchPlaceholder="Buscar por nombre o categoría..."
        collapsibleMobileTabs
        tabs={[
          { id: 'name-asc', label: 'A-Z', icon: ArrowDownAZ },
          { id: 'name-desc', label: 'Z-A', icon: ArrowUpZA },
          { id: 'price-asc', label: 'Menor precio', icon: ArrowUp01 },
          { id: 'price-desc', label: 'Mayor precio', icon: ArrowDown01 },
        ]}
      />

      {cargando ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-3 text-slate-400">
          <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
          <span className="text-xs">Cargando productos virtuales...</span>
        </div>
      ) : productos.length > 0 ? (
        <Accordion type="single" collapsible className="w-full space-y-2.5">
          {productos.map((producto) => (
            <AccordionItem
              value={producto.docId}
              key={producto.docId}
              className="rounded-xl border border-[#2e2e2e] hover:border-[#383838] bg-[#252526] transition-all overflow-hidden shadow-sm"
            >
              <AccordionTrigger className="px-3.5 py-3 sm:px-4 sm:py-3.5 hover:no-underline hover:bg-[#2e2e2e]/30 transition-colors data-[state=open]:border-b data-[state=open]:border-[#2e2e2e]">
                <div className="flex-1 grid grid-cols-[1fr_auto] gap-3 items-center text-sm text-left pr-1.5 sm:pr-2.5">
                  <div className="flex flex-col items-start gap-1 min-w-0">
                    <p className="font-bold text-sm sm:text-base text-slate-100 truncate w-full">
                      {producto.nombre}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.6875rem] text-slate-400 font-medium">
                      <span className="inline-flex items-center gap-1 text-sky-400">
                        <Tag className="h-3 w-3 shrink-0" />
                        {producto.categoria || 'Sin categoría'}
                      </span>
                      <span className="tabular-nums">
                        Existencia: {producto.existencia ?? 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                    <p className="font-bold text-base sm:text-lg text-emerald-400 leading-none tabular-nums">
                      Q{producto.precioVenta.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-1">
                      {producto.incluirEnPOS && (
                        <Badge className="rounded-full text-[0.625rem] font-semibold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          POS
                        </Badge>
                      )}
                      {producto.incluirEnCompras && (
                        <Badge className="rounded-full text-[0.625rem] font-semibold px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          Compras
                        </Badge>
                      )}
                      {!producto.incluirEnPOS && !producto.incluirEnCompras && (
                        <Badge className="rounded-full text-[0.625rem] font-semibold px-2 py-0.5 bg-slate-500/20 text-slate-300 border border-slate-500/30">
                          Oculto
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="p-3.5 sm:p-4 bg-[#1e1e1e]">
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="bg-[#252526] border border-[#2e2e2e] rounded-xl px-3 py-2.5 min-w-0">
                      <p className="text-[0.6875rem] text-slate-400 font-medium">Código de búsqueda</p>
                      <p className="text-sm font-bold text-slate-100 truncate mt-0.5">
                        {producto.codigoBusqueda || 'No definido'}
                      </p>
                    </div>
                    <div className="bg-[#252526] border border-[#2e2e2e] rounded-xl px-3 py-2.5">
                      <p className="text-[0.6875rem] text-slate-400 font-medium">Existencia</p>
                      <p className="text-sm font-bold text-slate-100 tabular-nums mt-0.5">
                        {producto.existencia ?? 0}
                      </p>
                    </div>
                    <div className="bg-[#252526] border border-[#2e2e2e] rounded-xl px-3 py-2.5">
                      <p className="text-[0.6875rem] text-slate-400 font-medium">Visibilidad en módulos</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {producto.incluirEnPOS && (
                          <Badge className="rounded-full text-[0.625rem] font-semibold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <ShoppingCart className="h-2.5 w-2.5 mr-1" /> POS
                          </Badge>
                        )}
                        {producto.incluirEnCompras && (
                          <Badge className="rounded-full text-[0.625rem] font-semibold px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            <PackageCheck className="h-2.5 w-2.5 mr-1" /> Compras
                          </Badge>
                        )}
                        {!producto.incluirEnPOS && !producto.incluirEnCompras && (
                          <span className="text-xs text-slate-400 italic">No visible en módulos externos</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-[#2e2e2e]">
                    <Button
                      size="sm"
                      className="rounded-full h-8 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-sm"
                      onClick={() => onEditar(producto)}
                    >
                      <Edit className="mr-1.5 h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-full h-8 px-4 text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 shadow-sm"
                      onClick={() => onEliminar(producto)}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="flex flex-col items-center justify-center text-center text-slate-400 h-64 rounded-xl border border-dashed border-[#2e2e2e] bg-[#252526]/50 p-6">
          <Ghost className="h-10 w-10 mb-3 text-slate-500" />
          <p className="font-semibold text-base text-slate-200">
            {terminoBusqueda ? "Sin resultados" : "No hay productos virtuales"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {terminoBusqueda
              ? "Prueba ajustando el término de búsqueda."
              : "Registra servicios o ítems sin stock físico."}
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
