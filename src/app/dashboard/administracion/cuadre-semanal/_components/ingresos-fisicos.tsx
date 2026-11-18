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
      className="shadow-sm overflow-hidden font-body !bg-[#1e1e1e] border !border-[#2e2e2e]"
      style={{ backgroundColor: '#1e1e1e', borderColor: '#2e2e2e' }}
    >
      <CardHeader className="p-4 pb-2 bg-transparent">
        <CardTitle className="font-bold text-base sm:text-lg text-foreground flex items-center gap-2">
          <Banknote className="h-5 w-5 text-emerald-400 shrink-0" />
          Ingresos del Período (Efectivo y Monedas)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-1 space-y-3">
        <div className="flex items-center p-2 border-b !border-[#2e2e2e]">
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
          const iconColor = isTraga ? "text-amber-400" : "text-emerald-400";
          const montoColor = isTraga ? "text-amber-400" : "text-sky-400";

          return (
            <div 
              key={`${item.tipoItem}-${item.id}`} 
              className="flex items-center p-3 border border-[#2e2e2e] rounded-xl bg-[#252526] hover:bg-[#313131]/60 transition-colors shadow-sm"
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
                    <Badge className="rounded-full text-[10px] font-semibold border border-amber-500/30 bg-amber-500/20 text-amber-300 px-2 py-0.5">
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
