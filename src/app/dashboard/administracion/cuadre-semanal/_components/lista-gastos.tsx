'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ListaGastosProps {
  items: any[];
  selected: Set<string>;
  onSelect: (id: string, isSelected: boolean) => void;
  onSelectAll: () => void;
}

export function ListaGastos({ items, selected, onSelect, onSelectAll }: ListaGastosProps) {
  if (items.length === 0) return null;

  return (
    <Card 
      className="shadow-sm overflow-hidden font-body !bg-[#1d283a] border !border-[#324157]"
      style={{ backgroundColor: '#1d283a', borderColor: '#324157' }}
    >
      <CardHeader className="p-4 pb-2 bg-transparent">
        <CardTitle className="font-bold text-base sm:text-lg text-foreground">Gastos Pendientes</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-1">
        <div className="space-y-3">
          <div className="flex items-center p-2 border-b !border-[#324157]">
            <Checkbox id="select-all-gastos" checked={selected.size === items.length && items.length > 0} onCheckedChange={onSelectAll} />
            <Label htmlFor="select-all-gastos" className="ml-3 flex-1 font-bold text-sm text-foreground cursor-pointer">Seleccionar Todos</Label>
          </div>
          {items.map(gasto => (
            <div 
              key={gasto.docId} 
              style={{ backgroundColor: '#283244', borderColor: '#324157' }}
              className="flex items-center p-3 border !border-[#324157] rounded-xl !bg-[#283244] hover:brightness-105 transition-all shadow-sm"
            >
              <Checkbox 
                id={`gasto-${gasto.docId}`} 
                checked={selected.has(gasto.docId)} 
                onCheckedChange={(checked) => onSelect(gasto.docId, !!checked)} 
                className="shrink-0"
              />
              <Label htmlFor={`gasto-${gasto.docId}`} className="ml-3 flex-1 cursor-pointer min-w-0">
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <DollarSign className="hidden sm:block h-5 w-5 text-rose-400 shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-bold text-xs sm:text-sm text-foreground truncate">{gasto.descripcion} #{gasto.idGasto}</span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">
                        {gasto.categoria} • {format(gasto.fecha.toDate(), "dd MMM, yyyy", { locale: es })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                    <p className="font-bold text-xs sm:text-sm text-rose-400 whitespace-nowrap tabular-nums leading-tight">
                      - Q{gasto.monto.toFixed(2)}
                    </p>
                    <Badge className="h-4 text-[9px] font-semibold border-none bg-rose-500/20 text-rose-300 px-1.5 py-0">
                      Pendiente
                    </Badge>
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
