
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Banknote, Dices } from "lucide-react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";

interface IncomePhysicalProps {
  items: any[];
  selectedEfectivo: Set<string>;
  selectedTragamonedas: Set<string>;
  onSelect: (id: string, isSelected: boolean, type: 'ingresoEfectivo' | 'ingresoTragamonedas') => void;
  onSelectAll: () => void;
}

export function IncomePhysical({ items, selectedEfectivo, selectedTragamonedas, onSelect, onSelectAll }: IncomePhysicalProps) {
  if (items.length === 0) return null;

  const totalEfectivoCount = items.filter(i => i.tipoItem === 'caja').length;
  const totalTragamonedasCount = items.filter(i => i.tipoItem === 'tragamonedas').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bold">Ingresos del Período (Efectivo y Tragamonedas)</CardTitle>
        <CardDescription>Selecciona los cierres de caja y máquinas que deseas liquidar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center p-2 border-b">
          <Checkbox 
            id="select-all-fisico" 
            checked={selectedEfectivo.size === totalEfectivoCount && selectedTragamonedas.size === totalTragamonedasCount} 
            onCheckedChange={onSelectAll}
          />
          <Label htmlFor="select-all-fisico" className="ml-4 flex-1 font-bold text-sm">Seleccionar Todos</Label>
        </div>
        {items.map((item: any) => {
          const isTraga = item.tipoItem === 'tragamonedas';
          const isSelected = isTraga ? selectedTragamonedas.has(item.id) : selectedEfectivo.has(item.id);
          const monto = isTraga ? item.gananciaATrasladar : item.totalLiquidado;
          const label = isTraga ? `Cierre Tragamonedas #${item.idCuadre}` : `Liquidación Caja #${item.idCuadre}`;
          const Icon = isTraga ? Dices : Banknote;
          const iconColor = isTraga ? "text-orange-500" : "text-green-500";
          const montoColor = isTraga ? "text-orange-600" : "text-primary";

          return (
            <div key={`${item.tipoItem}-${item.id}`} className="flex items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <Checkbox 
                id={`fisico-${item.tipoItem}-${item.id}`} 
                checked={isSelected} 
                onCheckedChange={(checked) => onSelect(item.id, !!checked, isTraga ? 'ingresoTragamonedas' : 'ingresoEfectivo')}
              />
              <Label htmlFor={`fisico-${item.tipoItem}-${item.id}`} className="ml-4 flex-1 cursor-pointer min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Icon className={cn("hidden sm:block h-6 w-6 shrink-0", iconColor)} />
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold">{label}</span>
                      <span className="text-xs text-muted-foreground">{format(item.fecha.toDate(), "dd MMM, yyyy 'a las' hh:mm a", { locale: es })}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <p className={cn("font-bold text-lg whitespace-nowrap", montoColor)}>Q{monto.toFixed(2)}</p>
                    <Badge className="h-5 text-[10px] font-bold border-none bg-muted text-muted-foreground uppercase">Pendiente</Badge>
                  </div>
                </div>
              </Label>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
