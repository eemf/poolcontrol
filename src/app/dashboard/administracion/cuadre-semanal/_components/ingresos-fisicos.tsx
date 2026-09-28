'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Banknote, Dices } from "lucide-react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";

interface IngresosFisicosProps {
  items: any[];
  selectedEfectivo: Set<string>;
  selectedTragamonedas: Set<string>;
  onSelect: (id: string, isSelected: boolean, type: 'ingresoEfectivo' | 'ingresoTragamonedas') => void;
  onSelectAll: () => void;
}

export function IngresosFisicos({ items, selectedEfectivo, selectedTragamonedas, onSelect, onSelectAll }: IngresosFisicosProps) {
  if (items.length === 0) return null;

  const totalEfectivoCount = items.filter(i => i.tipoItem === 'caja').length;
  const totalTragamonedasCount = items.filter(i => i.tipoItem === 'tragamonedas').length;

  return (
    <Card 
      className="shadow-sm overflow-hidden font-body !bg-[#1d283a] border !border-[#324157]"
      style={{ backgroundColor: '#1d283a', borderColor: '#324157' }}
    >
      <CardHeader className="p-4 pb-2 bg-transparent">
        <CardTitle className="font-bold text-base sm:text-lg text-foreground">
          Ingresos del Período (Efectivo y Monedas)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-1 space-y-3">
        <div className="flex items-center p-2 border-b !border-[#324157]">
          <Checkbox 
            id="select-all-fisico" 
            checked={selectedEfectivo.size === totalEfectivoCount && selectedTragamonedas.size === totalTragamonedasCount} 
            onCheckedChange={onSelectAll}
          />
          <Label htmlFor="select-all-fisico" className="ml-3 flex-1 font-bold text-sm text-foreground cursor-pointer">
            Seleccionar Todos
          </Label>
        </div>
        {items.map((item: any) => {
          const isTraga = item.tipoItem === 'tragamonedas';
          const isSelected = isTraga ? selectedTragamonedas.has(item.id) : selectedEfectivo.has(item.id);
          const monto = isTraga ? item.gananciaATrasladar : item.totalLiquidado;
          const label = isTraga ? `Cierre Tragamonedas #${item.idCuadre}` : `Liquidación Caja #${item.idCuadre}`;
          const Icon = isTraga ? Dices : Banknote;
          const iconColor = isTraga ? "text-orange-400" : "text-emerald-400";
          const montoColor = isTraga ? "text-orange-400" : "text-primary";

          return (
            <div 
              key={`${item.tipoItem}-${item.id}`} 
              style={{ backgroundColor: '#283244', borderColor: '#324157' }}
              className="flex items-center p-3 border !border-[#324157] rounded-xl !bg-[#283244] hover:brightness-105 transition-all shadow-sm"
            >
              <Checkbox 
                id={`fisico-${item.tipoItem}-${item.id}`} 
                checked={isSelected} 
                onCheckedChange={(checked) => onSelect(item.id, !!checked, isTraga ? 'ingresoTragamonedas' : 'ingresoEfectivo')}
                className="shrink-0"
              />
              <Label htmlFor={`fisico-${item.tipoItem}-${item.id}`} className="ml-3 flex-1 cursor-pointer min-w-0">
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Icon className={cn("hidden sm:block h-5 w-5 shrink-0", iconColor)} />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-bold text-xs sm:text-sm text-foreground truncate">{label}</span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                        {format(item.fecha.toDate(), "dd MMM, yyyy '•' hh:mm a", { locale: es })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                    <p className={cn("font-bold text-sm sm:text-base whitespace-nowrap tabular-nums leading-tight", montoColor)}>
                      Q{monto.toFixed(2)}
                    </p>
                    <Badge className="h-4 text-[9px] font-semibold border-none bg-primary/20 text-primary px-1.5 py-0">
                      Pendiente
                    </Badge>
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
