'use client';

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ArrowUpDown, Loader2, Edit, Trash2, ChevronLeft, ChevronRight, Info, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Producto } from "@/lib/tipos";

type ProductoConDocId = Producto & { docId: string };

interface ListaProductosProps {
  productos: ProductoConDocId[];
  cargando: boolean;
  terminoBusqueda: string;
  onSearchChange: (val: string) => void;
  orden: string;
  onSortOrderChange: (val: string) => void;
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
  cargando,
  terminoBusqueda,
  onSearchChange,
  orden,
  onSortOrderChange,
  onEditar,
  onEliminar,
  paginacion
}: ListaProductosProps) {
  return (
    <Card className="border rounded-lg transition-all bg-card-foreground/5 shadow-sm font-body overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre..."
              className="pl-9 rounded-full h-10 border-muted-foreground/20"
              value={terminoBusqueda}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Select value={orden} onValueChange={onSortOrderChange}>
            <SelectTrigger className="w-full sm:w-[200px] rounded-full h-10 border-muted-foreground/20">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Ordenar por..." />
            </SelectTrigger>
            <SelectContent className="font-body">
              <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
              <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
              <SelectItem value="stock-asc">Stock (Menor a Mayor)</SelectItem>
              <SelectItem value="stock-desc">Stock (Mayor a Menor)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {cargando ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : productos.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-2 mt-2">
            {productos.map((producto) => {
              const stockMinimo = producto.existenciaMinima || 0;
              const stockBajo = producto.existencia <= stockMinimo;
              const numPrep = producto.preparaciones?.length || 0;

              return (
                <AccordionItem 
                  value={producto.docId} 
                  key={producto.docId} 
                  className={cn(
                    "border-b-0 rounded-lg border transition-all overflow-hidden mb-2",
                    stockBajo 
                      ? "bg-amber-50/50 border-amber-200 dark:bg-orange-900/10 dark:border-orange-800" 
                      : "bg-card-foreground/5 hover:bg-muted/50"
                  )}
                >
                  <AccordionTrigger className="px-4 py-4 hover:no-underline font-body">
                    <div className="flex flex-1 items-center justify-between pr-2">
                      <div className="flex flex-col items-start min-w-[100px] text-left">
                        <span className="font-bold text-base truncate w-full text-foreground">{producto.nombre}</span>
                        {numPrep > 0 && (
                          <div className="mt-1 px-2 py-0.5 bg-muted text-[9px] font-bold text-muted-foreground rounded-full leading-none">
                            {numPrep} prep.
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-center text-center">
                        <div className="text-sm font-bold leading-tight tabular-nums">
                          <span className="text-lg">{producto.existencia}</span>
                          <span className="text-muted-foreground font-normal mx-0.5">/</span>
                          <span className="text-muted-foreground font-normal">{stockMinimo}</span>
                        </div>
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter opacity-70">Stock / Mín.</span>
                      </div>

                      <div className="hidden sm:block">
                        <Badge className={cn(
                          "rounded-full px-3 h-5 text-[10px] font-bold border-none",
                          stockBajo ? "bg-orange-500 text-white" : "bg-emerald-500 text-white"
                        )}>
                          {stockBajo ? 'Bajo' : 'En stock'}
                        </Badge>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm sm:text-xl font-bold text-primary tabular-nums">Q{producto.precioVenta.toFixed(2)}</span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="border-t pt-4 mt-2 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <Info className="h-3.5 w-3.5" /> Detalles del producto
                          </h4>
                          <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-muted/40">
                            <div>
                              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Precio compra</p>
                              <p className="font-bold text-sm">Q{producto.precioCompra.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Cód. búsqueda</p>
                              <p className="font-bold text-sm truncate">{producto.codigoBusqueda || 'N/A'}</p>
                            </div>
                          </div>
                        </div>

                        {numPrep > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                              <Utensils className="h-3.5 w-3.5" /> Preparaciones
                            </h4>
                            <div className="space-y-2">
                              {producto.preparaciones?.map((prep, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs p-2 bg-muted/30 rounded-lg">
                                  <span className="font-bold">{prep.nombre}</span>
                                  <span className="font-bold text-primary">Q{prep.precioVenta.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t border-dashed border-muted-foreground/20">
                        <Button 
                          size="sm" 
                          className="rounded-full h-9 px-5 font-bold text-xs bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
                          onClick={() => onEditar(producto)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar <span className="hidden sm:inline">Producto</span>
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="rounded-full h-9 px-5 font-bold text-xs shadow-sm"
                          onClick={() => onEliminar(producto)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-lg bg-muted/5 m-2">
            <Info className="h-12 w-12 mb-4 text-primary/30" />
            <p className="font-semibold text-lg">{terminoBusqueda ? "Sin resultados" : "No hay productos registrados"}</p>
            <p className="text-xs mt-1">Añade tu primer artículo al catálogo.</p>
          </div>
        )}
      </CardContent>
      {paginacion.totalPaginas > 1 && (
        <CardFooter className="flex flex-col items-center gap-4 p-4 sm:flex-row sm:justify-between bg-muted/5">
          <div className="flex items-center space-x-2">
            <p className="text-xs font-medium text-muted-foreground">Filas por página</p>
            <Select value={`${paginacion.itemsPorPagina}`} onValueChange={(v) => paginacion.onItemsPorPaginaChange(Number(v))}>
              <SelectTrigger className="h-8 w-[70px] rounded-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>{pageSize}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-full items-center justify-center space-x-2 sm:w-auto">
            <Button variant="outline" size="sm" onClick={() => paginacion.onPaginaChange(paginacion.paginaActual - 1)} disabled={paginacion.paginaActual === 1} className="px-3 rounded-full h-8">
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="text-xs">Anterior</span>
            </Button>
            <div className="flex-shrink-0 text-xs font-bold text-muted-foreground px-2">
              Pág. {paginacion.paginaActual} de {paginacion.totalPaginas}
            </div>
            <Button variant="outline" size="sm" onClick={() => paginacion.onPaginaChange(paginacion.paginaActual + 1)} disabled={paginacion.paginaActual === paginacion.totalPaginas} className="px-3 rounded-full h-8">
              <span className="text-xs">Siguiente</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
