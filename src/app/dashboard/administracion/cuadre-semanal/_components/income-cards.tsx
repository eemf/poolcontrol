'use client';

import { collection, query, where, Timestamp } from 'firebase/firestore';
import { useCollection, useMemoFirebase } from '@/firebase';
import type { Pago } from '@/lib/tipos';
import { toDate } from '@/lib/firebase/servicios/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CreditCard, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Componente interno para mostrar el desglose de ventas con tarjeta de un cierre específico.
 * Se monta únicamente al expandir el acordeón para evitar lecturas innecesarias.
 */
const DetalleVentasTarjeta = ({
  firestore,
  sucursalId,
  inicio,
  fin,
}: {
  firestore: any;
  sucursalId: string;
  inicio: Timestamp;
  fin: Timestamp;
}) => {
  const q = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(
      collection(firestore, `sucursales/${sucursalId}/pagos`),
      where('fecha', '>=', inicio),
      where('fecha', '<=', fin),
      where('metodoPago', '==', 'Tarjeta')
    );
  }, [firestore, sucursalId, inicio, fin]);

  const { data: pagos, isLoading } = useCollection<Pago>(q);

  if (isLoading) {
    return (
      <div className="flex justify-center p-2">
        <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
      </div>
    );
  }
  if (!pagos || pagos.length === 0) {
    return (
      <p className="text-xs text-slate-400 italic text-center p-2">
        Sin detalles de ventas con tarjeta.
      </p>
    );
  }

  return (
    <div className="space-y-1.5 p-2.5 bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl mt-1">
      <p className="text-[0.6875rem] font-semibold text-slate-400 mb-1 px-1">
        Desglose de ventas con tarjeta
      </p>
      {pagos.map((pago) => (
        <div
          key={pago.id}
          className="flex justify-between items-center text-xs px-2 py-1.5 border-b border-[#2e2e2e] last:border-0 hover:bg-[#252526] transition-colors rounded-md"
        >
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-slate-200 truncate">
              Venta #{pago.idVenta} — {pago.clienteNombre}
            </span>
            <span className="text-[0.625rem] text-slate-400">
              {format(toDate(pago.fecha), 'hh:mm a')}
            </span>
          </div>
          <span className="font-bold text-sky-400 ml-2 tabular-nums">
            Q{pago.montoTotalPagado.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
};

interface IncomeCardsProps {
  items: any[];
  selected: Set<string>;
  onSelect: (id: string, isSelected: boolean) => void;
  onSelectAll: () => void;
  firestore: any;
  sucursalId: string;
}

/**
 * Lista acordeón de cierres con ingresos por tarjeta pendientes de liquidar.
 */
export function IncomeCards({
  items,
  selected,
  onSelect,
  onSelectAll,
  firestore,
  sucursalId,
}: IncomeCardsProps) {
  if (items.length === 0) return null;

  return (
    <Card className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-100">
      <CardHeader>
        <CardTitle className="font-bold text-slate-100">Ingresos por Tarjeta</CardTitle>
        <CardDescription className="text-slate-400">
          Selecciona los cierres que contienen ingresos por tarjeta a procesar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Selección masiva de cierres por tarjeta */}
          <div className="flex items-center p-2 border-b border-[#2e2e2e]">
            <Checkbox
              id="select-all-tarjeta"
              checked={selected.size === items.length}
              onCheckedChange={onSelectAll}
            />
            <Label htmlFor="select-all-tarjeta" className="ml-4 flex-1 font-bold text-sm text-slate-200">
              Seleccionar Todos
            </Label>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-2">
            {items.map((cierre) => (
              <AccordionItem
                value={cierre.id}
                key={cierre.id}
                className="rounded-xl bg-[#252526] border border-[#2e2e2e] overflow-hidden border-b transition-colors hover:border-[#3c3c3c]"
              >
                <div className="flex items-center px-3 h-auto">
                  <Checkbox
                    id={`cierre-tarjeta-${cierre.id}`}
                    checked={selected.has(cierre.id)}
                    onCheckedChange={(checked) => onSelect(cierre.id, !!checked)}
                    className="z-10"
                  />
                  <AccordionTrigger className="flex-1 hover:no-underline py-3 px-3">
                    <div className="flex items-center justify-between w-full pr-2">
                      <div className="flex items-center gap-3 min-w-0 flex-1 text-left">
                        <div className="hidden sm:flex h-9 w-9 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 items-center justify-center shrink-0">
                          <CreditCard className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-sm sm:text-base leading-tight text-slate-100">
                            Pagos con Tarjeta (Cierre #{cierre.idCuadre})
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5 text-slate-400">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs font-medium">
                              {format(cierre.fecha.toDate(), 'dd MMM, yyyy', { locale: es })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-1 ml-4 pr-1">
                        <p className="font-bold text-base sm:text-lg text-sky-400 whitespace-nowrap tabular-nums leading-none">
                          Q{cierre.pagosTarjeta.toFixed(2)}
                        </p>
                        <Badge className="h-5 rounded-full text-[0.625rem] font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30 mt-1">
                          Pendiente
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                </div>
                <AccordionContent className="px-4 pb-4">
                  <DetalleVentasTarjeta
                    firestore={firestore}
                    sucursalId={sucursalId}
                    inicio={cierre.inicioDelPeriodo}
                    fin={cierre.fecha}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}
