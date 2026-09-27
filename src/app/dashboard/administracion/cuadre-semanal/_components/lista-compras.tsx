'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Truck, ShoppingCart, Clock, ChevronRight } from "lucide-react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface ListaComprasProps {
  items: any[];
  selected: Set<string>;
  onSelect: (id: string, isSelected: boolean) => void;
  onSelectAll: () => void;
}

export function ListaCompras({ items, selected, onSelect, onSelectAll }: ListaComprasProps) {
  if (items.length === 0) return null;

  return (
    <Card className="border-muted/60 shadow-sm overflow-hidden font-body">
      <CardHeader className="p-4 bg-muted/5 border-b">
        <CardTitle className="font-bold text-lg text-foreground">Compras Pendientes</CardTitle>
        <CardDescription className="text-xs">Selecciona las compras que deseas marcar como pagadas en este cuadre.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-3">
          <div className="flex items-center p-2 border-b">
            <Checkbox 
              id="select-all-compras" 
              checked={selected.size === items.length && items.length > 0} 
              onCheckedChange={onSelectAll} 
            />
            <Label htmlFor="select-all-compras" className="ml-4 flex-1 font-bold text-sm">Seleccionar Todas</Label>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-2">
            {items.map(compra => (
              <AccordionItem 
                value={compra.docId} 
                key={compra.docId} 
                className="relative border rounded-lg bg-card-foreground/5 overflow-hidden border-b-0 shadow-sm transition-all hover:border-primary/20 mb-2"
              >
                {/* Checkbox con posicionamiento absoluto para no romper el flex del trigger */}
                <div className="absolute left-4 top-7 -translate-y-1/2 z-20 flex items-center justify-center">
                  <Checkbox 
                    id={`compra-${compra.docId}`} 
                    checked={selected.has(compra.docId)} 
                    onCheckedChange={(checked) => onSelect(compra.docId, !!checked)} 
                  />
                </div>

                <AccordionTrigger className="pl-14 pr-4 hover:no-underline py-4 w-full">
                  <div className="flex-1 flex items-center justify-between gap-4 mr-2 text-left">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="hidden sm:flex h-9 w-9 rounded-full bg-primary/10 items-center justify-center shrink-0">
                        <Truck className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm sm:text-base leading-tight text-foreground truncate">
                          Compra a {compra.proveedorNombre}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                            {format(compra.fecha.toDate(), "dd 'de' LLLL, yyyy", { locale: es })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <p className="font-bold text-base sm:text-lg text-destructive whitespace-nowrap tabular-nums leading-none">
                        - Q{compra.montoTotal.toFixed(2)}
                      </p>
                      <Badge className="h-4 text-[8px] font-bold border-none bg-red-100 text-red-700">
                        Pendiente
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-4 pb-4">
                  <div className="pl-10 space-y-2 border-t border-muted/40 pt-3 mt-1">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Detalle de Artículos</p>
                    {compra.items?.map((subItem: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-[11px] bg-background/40 p-2 rounded-lg border border-muted/40">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground/80">{subItem.nombreProducto}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {subItem.tipo === 'producto' ? `${subItem.cantidad} unidades × Q${subItem.costoUnitario.toFixed(2)}` : 'Gasto directo'}
                          </span>
                        </div>
                        <span className="font-bold text-foreground/70 ml-2">Q{(subItem.cantidad * subItem.costoUnitario).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-end pt-2">
                       <span className="text-[9px] font-bold text-muted-foreground">ID Registro: #{compra.idCompra}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}
