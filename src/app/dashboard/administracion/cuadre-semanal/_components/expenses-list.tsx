
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ExpensesListProps {
  items: any[];
  selected: Set<string>;
  onSelect: (id: string, isSelected: boolean) => void;
  onSelectAll: () => void;
}

export function ExpensesList({ items, selected, onSelect, onSelectAll }: ExpensesListProps) {
  if (items.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bold">Gastos Pendientes</CardTitle>
        <CardDescription>Selecciona los gastos que deseas marcar como pagados.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center p-2 border-b">
            <Checkbox id="select-all-gastos" checked={selected.size === items.length} onCheckedChange={onSelectAll} />
            <Label htmlFor="select-all-gastos" className="ml-4 flex-1 font-bold text-sm">Seleccionar Todos</Label>
          </div>
          {items.map(gasto => (
            <div key={gasto.docId} className="flex items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <Checkbox id={`gasto-${gasto.docId}`} checked={selected.has(gasto.docId)} onCheckedChange={(checked) => onSelect(gasto.docId, !!checked)} />
              <Label htmlFor={`gasto-${gasto.docId}`} className="ml-4 flex-1 cursor-pointer min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <DollarSign className="hidden sm:block h-6 w-6 text-muted-foreground shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold">{gasto.descripcion} #{gasto.idGasto}</span>
                      <span className="text-xs text-muted-foreground uppercase font-medium tracking-tight">{gasto.categoria} — {format(gasto.fecha.toDate(), "dd/MM/yyyy", { locale: es })}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <p className="font-bold text-lg text-destructive whitespace-nowrap">- Q{gasto.monto.toFixed(2)}</p>
                    <Badge className="h-5 text-[10px] font-bold border-none bg-red-100 text-red-700 uppercase">{gasto.estado}</Badge>
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
