'use client';

import { SurfaceCard, PillTabs, Paginacion } from "@/components/comunes";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowDown01, ArrowUp01, ArrowDownAZ, ArrowUpZA, Loader2, Edit, Trash2, Contact, Phone, CreditCard, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Cliente } from "@/lib/tipos";

type ClienteConDocId = Cliente & { docId: string };

interface ListaClientesProps {
  clientes: ClienteConDocId[];
  totalItems: number;
  cargando: boolean;
  terminoBusqueda: string;
  onSearchChange: (val: string) => void;
  orden: string;
  onSortOrderChange: (val: string) => void;
  onEditar: (cliente: ClienteConDocId) => void;
  onEliminar: (cliente: ClienteConDocId) => void;
  paginacion: {
    paginaActual: number;
    itemsPorPagina: number;
    totalPaginas: number;
    onPaginaChange: (pagina: number) => void;
    onItemsPorPaginaChange: (val: number) => void;
  };
}

export function ListaClientes({
  clientes,
  totalItems,
  cargando,
  terminoBusqueda,
  onSearchChange,
  orden,
  onSortOrderChange,
  onEditar,
  onEliminar,
  paginacion
}: ListaClientesProps) {
  const getBadgeClasses = (tipo: Cliente['tipoCliente']) => {
    switch (tipo) {
      case 'Cliente':
        return 'bg-sky-500/20 text-sky-300 border border-sky-500/30';
      case 'Proveedor':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      case 'Ambos':
        return 'bg-teal-500/20 text-teal-300 border border-teal-500/30';
      default:
        return 'bg-[#1e1e1e] text-slate-300 border border-[#2e2e2e]';
    }
  };

  return (
    <SurfaceCard variant="panel" className="p-4 sm:p-5 space-y-4 font-body">
      {/* Barra superior unificada con PillTabs + buscador integrado + botón Opciones en móvil */}
      <PillTabs
        value={orden}
        onValueChange={onSortOrderChange}
        searchValue={terminoBusqueda}
        onSearchChange={onSearchChange}
        searchPlaceholder="Buscar por nombre, tipo o ID..."
        collapsibleMobileTabs
        tabs={[
          { id: 'id-desc', label: 'ID Desc', icon: ArrowDown01 },
          { id: 'id-asc', label: 'ID Asc', icon: ArrowUp01 },
          { id: 'name-asc', label: 'A-Z', icon: ArrowDownAZ },
          { id: 'name-desc', label: 'Z-A', icon: ArrowUpZA },
        ]}
      />

      {cargando ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-3 text-slate-400">
          <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
          <span className="text-xs">Cargando clientes...</span>
        </div>
      ) : clientes.length > 0 ? (
        <Accordion type="single" collapsible className="w-full space-y-2.5">
          {clientes.map((cliente) => (
            <AccordionItem
              value={cliente.docId}
              key={cliente.docId}
              className="rounded-xl border border-[#2e2e2e] bg-[#252526] hover:border-[#383838] transition-all overflow-hidden shadow-sm"
            >
              <AccordionTrigger className="px-3.5 py-3 sm:px-4 sm:py-3.5 hover:no-underline hover:bg-[#2e2e2e]/30 transition-colors data-[state=open]:border-b data-[state=open]:border-[#2e2e2e]">
                <div className="flex-1 grid grid-cols-[1fr_auto] gap-3 items-center text-sm text-left pr-1.5 sm:pr-2.5">
                  <div className="flex flex-col items-start gap-1 min-w-0">
                    <p className="font-bold text-sm sm:text-base text-slate-100 truncate w-full">
                      #{cliente.idcliente}. {cliente.nombre}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-[0.6875rem] text-slate-400 font-medium truncate max-w-full">
                      <Phone className="h-3 w-3 text-slate-500 shrink-0" />
                      <span className="truncate">{cliente.telefono || 'Sin teléfono'}</span>
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                    <Badge className={cn('rounded-full text-[0.6875rem] font-semibold px-2.5 py-0.5', getBadgeClasses(cliente.tipoCliente))}>
                      {cliente.tipoCliente}
                    </Badge>
                    {cliente.permiteCredito !== false ? (
                      <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[0.625rem] font-semibold px-2 py-0.5">
                        Crédito activo
                      </Badge>
                    ) : (
                      <Badge className="bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full text-[0.625rem] font-semibold px-2 py-0.5">
                        Sin crédito
                      </Badge>
                    )}
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="p-3.5 sm:p-4 bg-[#1e1e1e]">
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="bg-[#252526] border border-[#2e2e2e] rounded-xl px-3 py-2.5 min-w-0">
                      <p className="text-[0.6875rem] text-slate-400 font-medium flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-sky-400 shrink-0" /> Teléfono
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-slate-100 mt-0.5 truncate">
                        {cliente.telefono || 'No registrado'}
                      </p>
                    </div>

                    <div className="bg-[#252526] border border-[#2e2e2e] rounded-xl px-3 py-2.5 min-w-0">
                      <p className="text-[0.6875rem] text-slate-400 font-medium flex items-center gap-1.5">
                        <CreditCard className="h-3 w-3 text-sky-400 shrink-0" /> Línea de Crédito
                      </p>
                      <p className={cn(
                        'text-xs sm:text-sm font-semibold mt-0.5',
                        cliente.permiteCredito !== false ? 'text-emerald-400' : 'text-rose-400'
                      )}>
                        {cliente.permiteCredito !== false ? 'Habilitada' : 'Bloqueada'}
                      </p>
                    </div>

                    <div className="bg-[#252526] border border-[#2e2e2e] rounded-xl px-3 py-2.5 min-w-0">
                      <p className="text-[0.6875rem] text-slate-400 font-medium flex items-center gap-1.5">
                        <ShieldCheck className="h-3 w-3 text-sky-400 shrink-0" /> Consumo Interno
                      </p>
                      <p className={cn(
                        'text-xs sm:text-sm font-semibold mt-0.5',
                        cliente.consumoInterno ? 'text-amber-300' : 'text-slate-400'
                      )}>
                        {cliente.consumoInterno
                          ? (cliente.pinConsumoInterno ? 'Habilitado (PIN)' : 'Habilitado')
                          : 'Deshabilitado'}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2.5 border-t border-[#2e2e2e]">
                    <Button
                      size="sm"
                      className="rounded-full h-8 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-sm flex items-center gap-1.5"
                      onClick={() => onEditar(cliente)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>Editar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full h-8 px-4 text-xs font-semibold bg-rose-500/15 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/25 flex items-center gap-1.5"
                      onClick={() => onEliminar(cliente)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Eliminar</span>
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="flex flex-col items-center justify-center text-center text-slate-400 h-64 border border-dashed border-[#2e2e2e] rounded-xl bg-[#252526] p-4">
          <Contact className="h-10 w-10 mb-3 text-slate-500 opacity-50" />
          <p className="font-bold text-sm text-white">
            {terminoBusqueda ? "Sin resultados" : "No hay clientes registrados"}
          </p>
          <p className="text-xs max-w-xs mx-auto mt-1 text-slate-400">
            {terminoBusqueda ? "Prueba con otros términos de búsqueda." : "Los registros aparecerán aquí."}
          </p>
        </div>
      )}

      <Paginacion
        currentPage={paginacion.paginaActual}
        totalPages={paginacion.totalPaginas}
        totalItems={totalItems}
        itemsPerPage={paginacion.itemsPorPagina}
        itemLabel="clientes"
        onPageChange={paginacion.onPaginaChange}
        onItemsPerPageChange={paginacion.onItemsPerPageChange}
      />
    </SurfaceCard>
  );
}
