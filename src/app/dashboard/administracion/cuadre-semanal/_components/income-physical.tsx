'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Banknote, Dices } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface IncomePhysicalProps {
  items: any[];
  selectedEfectivo: Set<string>;
  selectedTragamonedas: Set<string>;
  onSelect: (
    id: string,
    isSelected: boolean,
    type: 'ingresoEfectivo' | 'ingresoTragamonedas'
  ) => void;
  onSelectAll: () => void;
}

/**
 * Lista de cierres físicos pendientes (efectivo de caja y ganancias de tragamonedas)
 * disponibles para liquidar en el cuadre semanal.
 */
export function IncomePhysical({
  items,
  selectedEfectivo,
  selectedTragamonedas,
  onSelect,
  onSelectAll,
}: IncomePhysicalProps) {
  if (items.length === 0) return null;

  const totalEfectivoCount = items.filter((i) => i.tipoItem === 'caja').length;
  const totalTragamonedasCount = items.filter((i) => i.tipoItem === 'tragamonedas').length;

  return (
    <Card className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-100">
      <CardHeader>
        <CardTitle className="font-bold text-slate-100">
          Ingresos del Período (Efectivo y Tragamonedas)
        </CardTitle>
        <CardDescription className="text-slate-400">
          Selecciona los cierres de caja y máquinas que deseas liquidar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Control maestro para seleccionar todos los cierres físicos */}
        <div className="flex items-center p-2 border-b border-[#2e2e2e]">
          <Checkbox
            id="select-all-fisico"
            checked={
              selectedEfectivo.size === totalEfectivoCount &&
              selectedTragamonedas.size === totalTragamonedasCount
            }
            onCheckedChange={onSelectAll}
          />
          <Label htmlFor="select-all-fisico" className="ml-4 flex-1 font-bold text-sm text-slate-200">
            Seleccionar Todos
          </Label>
        </div>

        {items.map((item: any) => {
          const isTraga = item.tipoItem === 'tragamonedas';
          const isSelected = isTraga
            ? selectedTragamonedas.has(item.id)
            : selectedEfectivo.has(item.id);
          const monto = isTraga ? item.gananciaATrasladar : item.totalLiquidado;
          const label = isTraga
            ? `Cierre Tragamonedas #${item.idCuadre}`
            : `Liquidación Caja #${item.idCuadre}`;
          const Icon = isTraga ? Dices : Banknote;

          return (
            <div
              key={`${item.tipoItem}-${item.id}`}
              className="flex items-center p-3 rounded-xl bg-[#252526] border border-[#2e2e2e] hover:bg-[#313131] transition-colors"
            >
              <Checkbox
                id={`fisico-${item.tipoItem}-${item.id}`}
                checked={isSelected}
                onCheckedChange={(checked) =>
                  onSelect(item.id, !!checked, isTraga ? 'ingresoTragamonedas' : 'ingresoEfectivo')
                }
              />
              <Label
                htmlFor={`fisico-${item.tipoItem}-${item.id}`}
                className="ml-4 flex-1 cursor-pointer min-w-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={cn(
                        'hidden sm:flex h-9 w-9 rounded-full border items-center justify-center shrink-0',
                        isTraga
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                          : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-slate-100 truncate">{label}</span>
                      <span className="text-xs text-slate-400">
                        {format(item.fecha.toDate(), "dd MMM, yyyy 'a las' hh:mm a", { locale: es })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <p
                      className={cn(
                        'font-bold text-base sm:text-lg whitespace-nowrap tabular-nums',
                        isTraga ? 'text-amber-400' : 'text-emerald-400'
                      )}
                    >
                      Q{monto.toFixed(2)}
                    </p>
                    <Badge className="h-5 rounded-full text-[10px] font-semibold bg-[#1e1e1e] text-slate-300 border border-[#2e2e2e]">
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
