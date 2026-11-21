'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ExpensesListProps {
  items: any[];
  selected: Set<string>;
  onSelect: (id: string, isSelected: boolean) => void;
  onSelectAll: () => void;
}

/**
 * Lista de gastos pendientes seleccionables para liquidar dentro del cuadre semanal.
 */
export function ExpensesList({ items, selected, onSelect, onSelectAll }: ExpensesListProps) {
  if (items.length === 0) return null;

  return (
    <Card className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-100">
      <CardHeader>
        <CardTitle className="font-bold text-slate-100">Gastos Pendientes</CardTitle>
        <CardDescription className="text-slate-400">
          Selecciona los gastos que deseas marcar como pagados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Control maestro para seleccionar o deseleccionar todos los gastos */}
          <div className="flex items-center p-2 border-b border-[#2e2e2e]">
            <Checkbox
              id="select-all-gastos"
              checked={selected.size === items.length}
              onCheckedChange={onSelectAll}
            />
            <Label htmlFor="select-all-gastos" className="ml-4 flex-1 font-bold text-sm text-slate-200">
              Seleccionar Todos
            </Label>
          </div>

          {items.map((gasto) => (
            <div
              key={gasto.docId}
              className="flex items-center p-3 rounded-xl bg-[#252526] border border-[#2e2e2e] hover:bg-[#313131] transition-colors"
            >
              <Checkbox
                id={`gasto-${gasto.docId}`}
                checked={selected.has(gasto.docId)}
                onCheckedChange={(checked) => onSelect(gasto.docId, !!checked)}
              />
              <Label htmlFor={`gasto-${gasto.docId}`} className="ml-4 flex-1 cursor-pointer min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="hidden sm:flex h-9 w-9 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 items-center justify-center shrink-0">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-slate-100 truncate">
                        {gasto.descripcion} #{gasto.idGasto}
                      </span>
                      <span className="text-xs text-slate-400 font-medium capitalize">
                        {gasto.categoria} — {format(gasto.fecha.toDate(), 'dd/MM/yyyy', { locale: es })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <p className="font-bold text-base sm:text-lg text-rose-400 whitespace-nowrap tabular-nums">
                      - Q{gasto.monto.toFixed(2)}
                    </p>
                    <Badge className="h-5 rounded-full text-[0.625rem] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 capitalize">
                      {gasto.estado}
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
