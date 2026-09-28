'use client';

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Search, Truck, Loader2, ShoppingCart, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import type { Compra } from "@/lib/tipos";

type CompraConDocId = Compra & { docId: string };

interface PurchaseListProps {
  compras: CompraConDocId[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  mostrarTodas: boolean;
  onMostrarTodasChange: (val: boolean) => void;
  onEdit: (compra: CompraConDocId) => void;
  onDelete: (compra: CompraConDocId) => void;
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (val: number) => void;
  };
}

export function PurchaseList({
  compras,
  isLoading,
  searchTerm,
  onSearchChange,
  mostrarTodas,
  onMostrarTodasChange,
  onEdit,
  onDelete,
  pagination
}: PurchaseListProps) {
  const getStatusBadgeClassName = (estado: string) => {
    switch (estado) {
      case 'Pagado': return 'bg-emerald-600 text-white border-none shadow-sm';
      case 'Pendiente': return 'bg-amber-500 text-white border-none shadow-sm';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Card 
      className="shadow-sm overflow-hidden font-body !bg-[#1d283a] border !border-[#324157]"
      style={{ backgroundColor: '#1d283a', borderColor: '#324157' }}
    >
      <CardHeader className="p-4 border-b !border-[#324157] bg-transparent">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-grow w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por ID o proveedor..."
              className="pl-9 rounded-full h-10 border-muted-foreground/20"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-center gap-3 px-4 h-10 border rounded-full bg-background shrink-0 w-full sm:w-auto">
            <span className={cn("text-xs font-medium transition-colors", !mostrarTodas ? "text-primary font-bold" : "text-muted-foreground")}>
              Pendientes
            </span>
            <Switch id="mostrar-todas" checked={mostrarTodas} onCheckedChange={onMostrarTodasChange} />
            <span className={cn("text-xs font-medium transition-colors", mostrarTodas ? "text-primary font-bold" : "text-muted-foreground")}>
              Todos
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : compras.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-2 pt-2">
            {compras.map((compra) => (
              <AccordionItem
                value={compra.docId}
                key={compra.docId}
                style={{ backgroundColor: '#283244', borderColor: '#324157' }}
                className="border-b-0 rounded-xl border !border-[#324157] !bg-[#283244] hover:brightness-105 transition-all overflow-hidden mb-2 shadow-sm"
              >
                <AccordionTrigger className="px-4 py-4 hover:no-underline">
                  <div className="flex-1 grid grid-cols-[1fr_auto] sm:grid-cols-3 gap-4 items-center text-sm text-left text-foreground">
                    <div className="flex flex-col items-start min-w-0">
                      <p className="font-bold text-base sm:text-lg truncate w-full">
                        #{compra.idCompra}. {compra.proveedorNombre}
                      </p>
                      <Badge variant="outline" className={cn("mt-1 text-[10px] font-semibold h-5 rounded-full px-2 border-none", getStatusBadgeClassName(compra.estado))}>
                        {compra.estado}
                      </Badge>
                    </div>
                    <div className="hidden sm:block text-center">
                      <p className="font-semibold text-xs text-muted-foreground">{format(compra.fecha.toDate(), "dd MMM, yyyy", { locale: es })}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">{format(compra.fecha.toDate(), "hh:mm a", { locale: es })}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-lg sm:text-xl text-primary leading-none">Q{compra.montoTotal.toFixed(2)}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold mt-1">{compra.items.length} artículos</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="border-t pt-4 mt-2 space-y-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-xs text-muted-foreground flex items-center gap-2">
                        <ShoppingCart className="h-3.5 w-3.5" /> Detalle de la compra
                      </h4>
                      <div className="space-y-2">
                        {compra.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center bg-background/50 p-3 rounded-xl text-sm border border-muted/40">
                            <div>
                              <p className="font-bold text-foreground">{item.nombreProducto}</p>
                              {item.tipo === 'producto' ? (
                                <p className="text-[10px] text-muted-foreground font-medium">{item.cantidad} unidades &times; Q{item.costoUnitario.toFixed(2)}</p>
                              ) : (
                                <p className="text-[10px] text-muted-foreground font-medium">Gasto directo</p>
                              )}
                            </div>
                            <p className="font-bold text-foreground/80">Q{(item.cantidad * item.costoUnitario).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-dashed">
                      <Button className="rounded-full h-9 px-5 font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-sm" onClick={() => onEdit(compra)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                      <Button variant="destructive" className="rounded-full h-9 px-5 font-semibold shadow-sm" onClick={() => onDelete(compra)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-3xl bg-muted/5 m-4">
            <Truck className="h-12 w-12 mb-4 text-primary/20" />
            <p className="font-bold text-lg">
              {searchTerm ? "Sin resultados" : (mostrarTodas ? "No hay registros" : "Sin compras pendientes")}
            </p>
            <p className="text-sm max-w-xs mx-auto mt-1">
              {searchTerm ? "Prueba con otros términos de búsqueda." : "Tus registros de compras aparecerán aquí."}
            </p>
          </div>
        )}
      </CardContent>
      {pagination.totalPages > 1 && (
        <CardFooter className="flex flex-col items-center gap-4 border-t !border-[#324157] p-4 sm:flex-row sm:justify-between bg-transparent font-body">
          <div className="flex items-center space-x-2">
            <p className="text-xs font-medium text-muted-foreground">Filas por página</p>
            <Select
              value={`${pagination.itemsPerPage}`}
              onValueChange={(value) => pagination.onItemsPerPageChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px] rounded-full text-xs">
                <SelectValue placeholder={pagination.itemsPerPage} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-full items-center justify-center space-x-2 sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(Math.max(1, pagination.currentPage - 1))}
              disabled={pagination.currentPage === 1}
              className="h-8 px-3 rounded-full"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="text-xs">Anterior</span>
            </Button>
            <div className="flex-shrink-0 text-xs font-semibold text-muted-foreground tracking-tighter px-2">
              Pág. {pagination.currentPage} de {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
              disabled={pagination.currentPage === pagination.totalPages}
              className="h-8 px-3 rounded-full"
            >
              <span className="text-xs">Siguiente</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
