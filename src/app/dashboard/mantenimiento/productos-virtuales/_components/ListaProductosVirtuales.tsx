'use client';

import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Edit, Trash2, ChevronLeft, ChevronRight, Ghost, Info, Eye, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProductoVirtual } from "@/lib/tipos";

type ProductoVirtualConDocId = ProductoVirtual & { docId: string };

interface ListaProductosVirtualesProps {
  productos: ProductoVirtualConDocId[];
  cargando: boolean;
  terminoBusqueda: string;
  onSearchChange: (val: string) => void;
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
  cargando,
  terminoBusqueda,
  onSearchChange,
  onEditar,
  onEliminar,
  paginacion
}: ListaProductosVirtualesProps) {
  return (
    <Card className="border rounded-lg transition-all bg-card-foreground/5 shadow-sm font-body overflow-hidden">
      <CardHeader className="p-4">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o categoría..."
            className="pl-9 rounded-full h-10 border-muted-foreground/20"
            value={terminoBusqueda}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {cargando ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : productos.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-2 mt-2">
            {productos.map((producto) => (
              <AccordionItem 
                value={producto.docId} 
                key={producto.docId} 
                className="border-b-0 rounded-lg border bg-card-foreground/5 hover:bg-muted/50 transition-all overflow-hidden mb-2"
              >
                <AccordionTrigger className="px-4 py-4 hover:no-underline font-body">
                  <div className="flex flex-1 items-center justify-between pr-4 text-left">
                    <div className="min-w-0">
                      <p className="font-bold text-base text-foreground truncate">{producto.nombre}</p>
                      <p className="text-[10px] font-medium text-muted-foreground tracking-tight mt-0.5">{producto.categoria || 'Sin categoría'}</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-lg font-bold text-primary">Q{producto.precioVenta.toFixed(2)}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="border-t pt-4 mt-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                          <Info className="h-3.5 w-3.5" /> Configuración técnica
                        </h4>
                        <div className="space-y-2 pl-5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Código:</span>
                            <span className="text-xs font-bold">{producto.codigoBusqueda || 'No definido'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Existencia:</span>
                            <Badge variant="outline" className="font-bold h-5 text-[10px] px-2">{producto.existencia ?? 0}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                          <Eye className="h-3.5 w-3.5" /> Visibilidad en módulos
                        </h4>
                        <div className="flex flex-wrap gap-2 pl-5">
                          {producto.incluirEnPOS && (
                            <Badge className="bg-emerald-500 text-white border-none font-bold text-[9px] h-5 rounded-full px-2">
                              <ShoppingCart className="h-2.5 w-2.5 mr-1" /> POS
                            </Badge>
                          )}
                          {producto.incluirEnCompras && (
                            <Badge className="bg-blue-500 text-white border-none font-bold text-[9px] h-5 rounded-full px-2">
                              Compras
                            </Badge>
                          )}
                          {!producto.incluirEnPOS && !producto.incluirEnCompras && (
                            <span className="text-xs text-muted-foreground italic">No visible en módulos externos</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-dashed border-muted-foreground/20">
                      <Button 
                        size="sm" 
                        className="rounded-full h-9 px-5 font-bold text-xs bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
                        onClick={() => onEditar(producto)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar <span className="hidden sm:inline">Registro</span>
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
            ))}
          </Accordion>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-lg bg-muted/5 m-2">
            <Ghost className="h-12 w-12 mb-4 text-primary/30" />
            <p className="font-semibold text-lg">{terminoBusqueda ? "Sin resultados" : "No hay productos virtuales"}</p>
            <p className="text-xs mt-1">Registra servicios o ítems sin stock físico.</p>
          </div>
        )}
      </CardContent>
      {paginacion.totalPaginas > 1 && (
        <CardFooter className="flex flex-col items-center gap-4 p-4 sm:flex-row sm:justify-between">
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
