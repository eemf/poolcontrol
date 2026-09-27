
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Truck } from "lucide-react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PurchasesListProps {
  items: any[];
  selected: Set<string>;
  onSelect: (id: string, isSelected: boolean) => void;
  onSelectAll: () => void;
}

export function PurchasesList({ items, selected, onSelect, onSelectAll }: PurchasesListProps) {
  if (items.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bold">Compras Pendientes</CardTitle>
        <CardDescription>Selecciona las compras que deseas marcar como pagadas en este cuadre.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center p-2 border-b">
            <Checkbox id="select-all-compras" checked={selected.size === items.length} onCheckedChange={onSelectAll} />
            <Label htmlFor="select-all-compras" className="ml-4 flex-1 font-bold text-sm">Seleccionar Todas</Label>
          </div>
          {items.map(compra => (
            <div key={compra.docId} className="flex items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <Checkbox id={`compra-${compra.docId}`} checked={selected.has(compra.docId)} onCheckedChange={(checked) => onSelect(compra.docId, !!checked)} />
              <Label htmlFor={`compra-${compra.docId}`} className="ml-4 flex-1 cursor-pointer min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Truck className="hidden sm:block h-6 w-6 text-muted-foreground shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold">Compra a {compra.proveedorNombre} #{compra.idCompra}</span>
                      <span className="text-xs text-muted-foreground">{format(compra.fecha.toDate(), "dd 'de' LLLL, yyyy", { locale: es })}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <p className="font-bold text-lg text-destructive whitespace-nowrap">- Q{compra.montoTotal.toFixed(2)}</p>
                    <Badge className="h-5 text-[10px] font-bold border-none bg-red-100 text-red-700 uppercase">Pendiente</Badge>
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
