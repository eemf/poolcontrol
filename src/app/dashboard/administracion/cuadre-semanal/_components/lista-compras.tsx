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
    <Card 
      className="shadow-sm overflow-hidden font-body !bg-[#1d283a] border !border-[#324157]"
      style={{ backgroundColor: '#1d283a', borderColor: '#324157' }}
    >
      <CardHeader className="p-4 pb-2 bg-transparent">
        <CardTitle className="font-bold text-base sm:text-lg text-foreground">Compras Pendientes</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-1">
        <div className="space-y-3">
          <div className="flex items-center p-2 border-b !border-[#324157]">
            <Checkbox 
              id="select-all-compras" 
              checked={selected.size === items.length && items.length > 0} 
              onCheckedChange={onSelectAll} 
            />
            <Label htmlFor="select-all-compras" className="ml-3 flex-1 font-bold text-sm text-foreground cursor-pointer">
              Seleccionar Todas
            </Label>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-2">
            {items.map(compra => (
              <AccordionItem 
                value={compra.docId} 
                key={compra.docId} 
                style={{ backgroundColor: '#283244', borderColor: '#324157' }}
                className="border-b-0 rounded-xl border !border-[#324157] !bg-[#283244] hover:brightness-105 transition-all overflow-hidden mb-2 shadow-sm relative"
              >
                {/* Checkbox anclado a la cabecera del acordeón */}
                <div className="absolute left-3 top-6 -translate-y-1/2 z-20 flex items-center justify-center">
                  <Checkbox 
                    id={`compra-${compra.docId}`} 
                    checked={selected.has(compra.docId)} 
                    onCheckedChange={(checked) => onSelect(compra.docId, !!checked)} 
                  />
                </div>

                <AccordionTrigger className="pl-10 pr-3 hover:no-underline py-3 w-full">
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-2 mr-2 text-left">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="hidden sm:flex h-8 w-8 rounded-full bg-primary/10 items-center justify-center shrink-0">
                        <Truck className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-bold text-xs sm:text-sm leading-tight text-foreground truncate">
                          Compra a {compra.proveedorNombre}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">
                            {format(compra.fecha.toDate(), "dd MMM, yyyy", { locale: es })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                      <p className="font-bold text-xs sm:text-sm text-rose-400 whitespace-nowrap tabular-nums leading-tight">
                        - Q{compra.montoTotal.toFixed(2)}
                      </p>
                      <Badge className="h-4 text-[9px] font-semibold border-none bg-rose-500/20 text-rose-300 px-1.5 py-0">
                        Pendiente
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-3 pb-3">
                  <div className="space-y-1.5 border-t !border-[#324157] pt-2.5 mt-1">
                    <p className="text-[9px] font-bold text-muted-foreground tracking-wider mb-1 px-1">Detalle de Artículos</p>
                    {compra.items?.map((subItem: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-[11px] bg-[#1d283a]/70 p-2.5 rounded-lg border !border-[#324157]">
                        <div className="flex flex-col min-w-0 flex-1 mr-2">
                          <span className="font-bold text-foreground/90 truncate">{subItem.nombreProducto}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {subItem.tipo === 'producto' ? `${subItem.cantidad} unidades × Q${subItem.costoUnitario.toFixed(2)}` : 'Gasto directo'}
                          </span>
                        </div>
                        <span className="font-bold text-foreground/80 shrink-0">Q{(subItem.cantidad * subItem.costoUnitario).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-end pt-1">
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
