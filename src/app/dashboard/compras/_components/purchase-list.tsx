'use client';

import { SurfaceCard, PillTabs, Paginacion } from "@/components/comunes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ShoppingCart,
  Loader2,
  Truck,
  Edit,
  Trash2,
  Clock,
  Boxes,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Compra } from "@/lib/tipos";

type CompraConDocId = Compra & { docId: string };

interface PurchaseListProps {
  compras: CompraConDocId[];
  totalPendientes?: number;
  totalCompras?: number;
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  mostrarTodas: boolean;
  onMostrarTodasChange: (value: boolean) => void;
  onEdit: (compra: CompraConDocId) => void;
  onDelete: (compra: CompraConDocId) => void;
  totalItems: number;
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (size: number) => void;
  };
}

export function PurchaseList({
  compras,
  totalPendientes = 0,
  totalCompras = 0,
  isLoading,
  searchTerm,
  onSearchChange,
  mostrarTodas,
  onMostrarTodasChange,
  onEdit,
  onDelete,
  totalItems,
  pagination,
}: PurchaseListProps) {
  const renderBadgeEstado = (estado: string) => {
    switch (estado) {
      case 'Pagado':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[0.6875rem] font-semibold px-2.5 py-0.5">
            Pagado
          </Badge>
        );
      case 'Pendiente':
        return (
          <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[0.6875rem] font-semibold px-2.5 py-0.5">
            Pendiente
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="rounded-full text-[0.6875rem]">
            {estado}
          </Badge>
        );
    }
  };

  return (
    <SurfaceCard variant="panel" className="p-4 sm:p-5 space-y-4 font-body">
      {/* Barra superior unificada con PillTabs + buscador integrado */}
      <PillTabs
        value={mostrarTodas ? 'todas' : 'pendientes'}
        onValueChange={(val) => onMostrarTodasChange(val === 'todas')}
        searchValue={searchTerm}
        onSearchChange={onSearchChange}
        searchPlaceholder="Buscar por ID o proveedor..."
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
            id: 'todas',
            label: 'Todas',
            icon: Boxes,
            count: totalCompras,
            badgeVariant: 'sky',
          },
        ]}
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
          <span className="text-xs text-slate-400">Cargando compras...</span>
        </div>
      ) : compras.length > 0 ? (
        <Accordion type="single" collapsible className="w-full space-y-2.5">
          {compras.map((compra) => (
            <AccordionItem
              value={compra.docId}
              key={compra.docId}
              className="rounded-xl border border-[#2e2e2e] bg-[#252526] hover:border-[#383838] transition-all overflow-hidden shadow-sm"
            >
              <AccordionTrigger className="px-3.5 py-3 sm:px-4 sm:py-3.5 hover:no-underline hover:bg-[#2e2e2e]/30 transition-colors data-[state=open]:border-b data-[state=open]:border-[#2e2e2e]">
                <div className="flex-1 grid grid-cols-[1fr_auto] gap-3 sm:gap-4 items-center text-sm text-left pr-1.5 sm:pr-2.5">
                  <div className="flex flex-col items-start gap-1 min-w-0">
                    <p className="font-bold text-sm sm:text-base text-slate-100 truncate w-full">
                      #{compra.idCompra}. {compra.proveedorNombre}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[0.6875rem] text-slate-400 font-medium">
                      <Clock className="h-3 w-3 text-slate-500 shrink-0" />
                      {format(compra.fecha.toDate(), "dd/MM/yyyy • hh:mm a", { locale: es })}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                    <p className="font-bold text-base sm:text-lg text-emerald-400 leading-none tabular-nums">
                      Q{compra.montoTotal.toFixed(2)}
                    </p>
                    {renderBadgeEstado(compra.estado)}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-3.5 sm:p-4 bg-[#1e1e1e]">
                <div className="space-y-3.5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-xs text-slate-300 flex items-center gap-1.5">
                        <ShoppingCart className="h-3.5 w-3.5 text-sky-400" />
                        <span>Detalle de la compra</span>
                      </h4>
                      <span className="text-[0.6875rem] font-medium text-slate-400 tabular-nums">
                        {compra.items.length} {compra.items.length === 1 ? 'artículo' : 'artículos'}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {compra.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center bg-[#252526] border border-[#2e2e2e] p-2.5 rounded-xl text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-semibold text-slate-100 truncate">{item.nombreProducto}</p>
                            {item.tipo === 'producto' ? (
                              <p className="text-[0.625rem] text-slate-400 tabular-nums">
                                {item.cantidad} unidades &times; Q{item.costoUnitario.toFixed(2)}
                              </p>
                            ) : (
                              <p className="text-[0.625rem] text-slate-400">Gasto directo</p>
                            )}
                          </div>
                          <p className="font-bold text-sky-400 tabular-nums shrink-0">
                            Q{(item.cantidad * item.costoUnitario).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2.5 border-t border-[#2e2e2e]">
                    <Button
                      size="sm"
                      className="rounded-full h-8 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-sm flex items-center gap-1.5 transition-all"
                      onClick={() => onEdit(compra)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>Editar</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full h-8 px-4 text-xs font-semibold bg-rose-500/15 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/25 flex items-center gap-1.5 transition-all"
                      onClick={() => onDelete(compra)}
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
          <Truck className="h-10 w-10 mb-3 text-slate-500 opacity-50" />
          <p className="font-bold text-sm text-white">
            {searchTerm ? "Sin resultados" : (mostrarTodas ? "No hay compras registradas" : "Sin compras pendientes")}
          </p>
          <p className="text-xs max-w-xs mx-auto mt-1 text-slate-400">
            {searchTerm ? "Prueba con otros términos de búsqueda." : "Tus registros de compras a proveedores aparecerán aquí."}
          </p>
        </div>
      )}

      <Paginacion
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={totalItems}
        itemsPerPage={pagination.itemsPerPage}
        itemLabel="compras"
        onPageChange={pagination.onPageChange}
        onItemsPerPageChange={pagination.onItemsPerPageChange}
      />
    </SurfaceCard>
  );
}
