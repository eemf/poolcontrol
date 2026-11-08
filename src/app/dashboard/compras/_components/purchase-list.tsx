'use client';

import {
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { SurfaceCard, PillTabs } from "@/components/comunes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  ShoppingCart,
  Loader2,
  Truck,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Boxes,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  pagination,
}: PurchaseListProps) {
  const renderBadgeEstado = (estado: string) => {
    switch (estado) {
      case 'Pagado':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[11px] font-semibold px-2.5 py-0.5">
            Pagado
          </Badge>
        );
      case 'Pendiente':
        return (
          <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-semibold px-2.5 py-0.5">
            Pendiente
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="rounded-full text-[11px]">
            {estado}
          </Badge>
        );
    }
  };

  return (
    <SurfaceCard variant="panel" className="font-body">
      <div className="p-3 sm:p-4 border-b border-[#2e2e2e] bg-[#1e1e1e]">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Pestañas de filtrado con PillTabs estándar */}
          <div className="w-full md:w-auto">
            <PillTabs
              value={mostrarTodas ? 'todas' : 'pendientes'}
              onValueChange={(val) => onMostrarTodasChange(val === 'todas')}
              listClassName="md:w-[320px]"
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
                  badgeVariant: 'white',
                },
              ]}
            />
          </div>

          {/* Buscador redondeado */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Buscar por ID o proveedor..."
              className="pl-9 bg-[#252526] border-[#2e2e2e] text-white placeholder:text-slate-400 text-xs h-10 rounded-full focus-visible:ring-1 focus-visible:ring-primary"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      <CardContent className="p-3 sm:p-4 bg-[#1e1e1e]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <span className="text-xs text-slate-400">Cargando compras...</span>
          </div>
        ) : compras.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-2.5">
            {compras.map((compra) => (
              <AccordionItem
                value={compra.docId}
                key={compra.docId}
                className="border-b-0 rounded-xl border border-[#2e2e2e] bg-[#252526] hover:border-slate-500/60 transition-all overflow-hidden shadow-sm"
              >
                <AccordionTrigger className="px-4 py-3.5 hover:no-underline">
                  <div className="flex-1 grid grid-cols-[1fr_auto] sm:grid-cols-3 gap-4 items-center text-sm text-left">
                    <div className="flex flex-col items-start min-w-0">
                      <p className="font-bold text-sm sm:text-base text-white truncate w-full">
                        #{compra.idCompra}. {compra.proveedorNombre}
                      </p>
                      <div className="mt-1">
                        {renderBadgeEstado(compra.estado)}
                      </div>
                    </div>
                    <div className="hidden sm:block text-center">
                      <p className="font-semibold text-xs text-slate-300">
                        {format(compra.fecha.toDate(), "dd MMM, yyyy", { locale: es })}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {format(compra.fecha.toDate(), "hh:mm a", { locale: es })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-base sm:text-lg text-emerald-400 leading-none">
                        Q{compra.montoTotal.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">
                        {compra.items.length} artículos
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="border-t border-[#2e2e2e] pt-3.5 mt-1 space-y-4">
                    <div className="space-y-2.5">
                      <h4 className="font-semibold text-xs text-slate-300 flex items-center gap-1.5">
                        <ShoppingCart className="h-3.5 w-3.5 text-primary" />
                        <span>Detalle de la compra</span>
                      </h4>
                      <div className="space-y-1.5">
                        {compra.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center bg-[#1e1e1e] border border-[#2e2e2e] p-2.5 rounded-xl text-xs"
                          >
                            <div>
                              <p className="font-semibold text-white">{item.nombreProducto}</p>
                              {item.tipo === 'producto' ? (
                                <p className="text-[10px] text-slate-400">
                                  {item.cantidad} unidades &times; Q{item.costoUnitario.toFixed(2)}
                                </p>
                              ) : (
                                <p className="text-[10px] text-slate-400">Gasto directo</p>
                              )}
                            </div>
                            <p className="font-bold text-slate-200">
                              Q{(item.cantidad * item.costoUnitario).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-[#2e2e2e]">
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
                        variant="outline"
                        className="rounded-full h-8 px-4 text-xs font-semibold border-rose-500/40 text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 flex items-center gap-1.5 transition-all"
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
          <div className="flex flex-col items-center justify-center text-center text-slate-400 h-64 border border-dashed border-[#2e2e2e] rounded-xl bg-[#252526]/40 p-4">
            <Truck className="h-10 w-10 mb-3 text-slate-500 opacity-40" />
            <p className="font-bold text-sm text-white">
              {searchTerm ? "Sin resultados" : (mostrarTodas ? "No hay compras registradas" : "Sin compras pendientes")}
            </p>
            <p className="text-xs max-w-xs mx-auto mt-1 text-slate-400">
              {searchTerm ? "Prueba con otros términos de búsqueda." : "Tus registros de compras a proveedores aparecerán aquí."}
            </p>
          </div>
        )}
      </CardContent>

      {pagination.totalPages > 1 && (
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#2e2e2e] p-3 sm:p-4 bg-[#1e1e1e]">
          <div className="flex items-center space-x-2">
            <p className="text-xs font-medium text-slate-400">Filas por página</p>
            <Select
              value={`${pagination.itemsPerPage}`}
              onValueChange={(value) => pagination.onItemsPerPageChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px] rounded-full text-xs bg-[#252526] border-[#2e2e2e] text-white">
                <SelectValue placeholder={pagination.itemsPerPage} />
              </SelectTrigger>
              <SelectContent side="top" className="bg-[#1e1e1e] border-[#2e2e2e] text-white">
                {[10, 20, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(Math.max(1, pagination.currentPage - 1))}
              disabled={pagination.currentPage === 1}
              className="h-8 px-3 rounded-full text-xs border-[#2e2e2e] bg-[#252526] text-slate-300 hover:text-white"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              <span>Anterior</span>
            </Button>
            <div className="text-xs font-semibold text-slate-300 px-2">
              Pág. {pagination.currentPage} de {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
              disabled={pagination.currentPage === pagination.totalPages}
              className="h-8 px-3 rounded-full text-xs border-[#2e2e2e] bg-[#252526] text-slate-300 hover:text-white"
            >
              <span>Siguiente</span>
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </CardFooter>
      )}
    </SurfaceCard>
  );
}
