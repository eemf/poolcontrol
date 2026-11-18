'use client';

import { SurfaceCard, PillTabs, Paginacion } from "@/components/comunes";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Clock, Edit, Trash2, Boxes } from "lucide-react";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import type { Gasto } from "@/lib/tipos";

type GastoConDocId = Gasto & { docId: string };

interface ListaGastosProps {
  gastos: GastoConDocId[];
  totalItems: number;
  totalPendientes?: number;
  totalTodos?: number;
  cargando: boolean;
  terminoBusqueda: string;
  onTerminoBusquedaChange: (val: string) => void;
  mostrarTodos: boolean;
  onMostrarTodosChange: (val: boolean) => void;
  onEditar: (gasto: GastoConDocId) => void;
  onEliminar: (gasto: GastoConDocId) => void;
  paginacion: {
    paginaActual: number;
    itemsPorPagina: number;
    totalPaginas: number;
    onPaginaChange: (pagina: number) => void;
    onItemsPorPaginaChange: (val: number) => void;
  };
}

export function ListaGastos({
  gastos,
  totalItems,
  totalPendientes = 0,
  totalTodos = 0,
  cargando,
  terminoBusqueda,
  onTerminoBusquedaChange,
  mostrarTodos,
  onMostrarTodosChange,
  onEditar,
  onEliminar,
  paginacion
}: ListaGastosProps) {
  const renderBadgeEstado = (estado: string) => {
    if (estado === 'pendiente') {
      return (
        <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-semibold px-2.5 py-0.5">
          Pendiente
        </Badge>
      );
    }
    return (
      <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[11px] font-semibold px-2.5 py-0.5">
        Procesado
      </Badge>
    );
  };

  return (
    <SurfaceCard variant="panel" className="p-4 sm:p-5 space-y-4 font-body">
      <PillTabs
        value={mostrarTodos ? 'todos' : 'pendientes'}
        onValueChange={(val) => onMostrarTodosChange(val === 'todos')}
        searchValue={terminoBusqueda}
        onSearchChange={onTerminoBusquedaChange}
        searchPlaceholder="Buscar por descripción o ID..."
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
        <div className="flex flex-col items-center justify-center h-64 space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
          <span className="text-xs text-slate-400">Cargando gastos...</span>
        </div>
      ) : gastos.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center text-slate-400 h-64 border border-dashed border-[#2e2e2e] rounded-xl bg-[#252526] p-4">
          <FileText className="h-10 w-10 mb-3 text-slate-500 opacity-50" />
          <p className="font-bold text-sm text-white">
            {terminoBusqueda ? "Sin resultados" : (mostrarTodos ? "No hay gastos registrados" : "Sin gastos pendientes")}
          </p>
          <p className="text-xs max-w-xs mx-auto mt-1 text-slate-400">
            {terminoBusqueda ? "Prueba con otros términos de búsqueda." : "Los gastos registrados aparecerán aquí."}
          </p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-2.5">
          {gastos.map((gasto) => (
            <AccordionItem
              value={gasto.docId}
              key={gasto.docId}
              className="rounded-xl border border-[#2e2e2e] bg-[#252526] hover:border-[#383838] transition-all overflow-hidden shadow-sm"
            >
              <AccordionTrigger className="px-3.5 py-3 sm:px-4 sm:py-3.5 hover:no-underline hover:bg-[#2e2e2e]/30 transition-colors data-[state=open]:border-b data-[state=open]:border-[#2e2e2e]">
                <div className="flex-1 grid grid-cols-[1fr_auto] gap-3 sm:gap-4 items-center text-sm text-left pr-1.5 sm:pr-2.5">
                  <div className="flex flex-col items-start gap-1 min-w-0">
                    <p className="font-bold text-sm sm:text-base text-slate-100 truncate w-full">
                      #{gasto.idGasto}. {gasto.descripcion}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                      <Clock className="h-3 w-3 text-slate-500 shrink-0" />
                      {format(gasto.fecha.toDate(), "dd/MM/yyyy • hh:mm a", { locale: es })}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                    <span className="font-bold text-base sm:text-lg text-emerald-400 leading-none tabular-nums">
                      Q{gasto.monto.toFixed(2)}
                    </span>
                    {renderBadgeEstado(gasto.estado)}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-3.5 sm:p-4 bg-[#1e1e1e]">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    className="rounded-full h-8 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-sm flex items-center gap-1.5 transition-all"
                    onClick={() => onEditar(gasto)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Editar</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full h-8 px-4 text-xs font-semibold bg-rose-500/15 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/25 flex items-center gap-1.5 transition-all"
                    onClick={() => onEliminar(gasto)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Eliminar</span>
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <Paginacion
        currentPage={paginacion.paginaActual}
        totalPages={paginacion.totalPaginas}
        totalItems={totalItems}
        itemsPerPage={paginacion.itemsPorPagina}
        itemLabel="gastos"
        onPageChange={paginacion.onPaginaChange}
        onItemsPerPageChange={paginacion.onItemsPorPaginaChange}
      />
    </SurfaceCard>
  );
}
