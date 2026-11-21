
'use client';

import { useMemo } from 'react';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { useCollection, useMemoFirebase } from '@/firebase';
import type { Pago } from '@/lib/tipos';
import { toDate } from '@/lib/firebase/servicios/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CreditCard, Clock, Loader2 } from "lucide-react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Componente interno para mostrar el desglose de ventas con tarjeta de un cierre específico.
 */
const DetalleVentasTarjeta = ({ firestore, sucursalId, inicio, fin }: { firestore: any, sucursalId: string, inicio: Timestamp, fin: Timestamp }) => {
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

    if (isLoading) return <div className="flex justify-center p-2"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>;
    if (!pagos || pagos.length === 0) return <p className="text-[0.625rem] text-muted-foreground italic text-center p-2">Sin detalles de ventas con tarjeta.</p>;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold text-xs text-slate-300 flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-sky-400" />
                    <span>Desglose de ventas con tarjeta</span>
                </h4>
                <span className="text-[0.6875rem] font-medium text-slate-400 tabular-nums">
                    {pagos.length} {pagos.length === 1 ? 'pago' : 'pagos'}
                </span>
            </div>
            <div className="space-y-1.5">
                {pagos.map(pago => (
                    <div key={pago.id} className="flex justify-between items-center bg-[#252526] border border-[#2e2e2e] p-2.5 rounded-xl text-xs">
                        <div className="min-w-0 pr-2">
                            <p className="font-semibold text-slate-100 truncate">Venta #{pago.idVenta} — {pago.clienteNombre}</p>
                            <p className="text-[0.625rem] text-slate-400">{format(toDate(pago.fecha), 'hh:mm a')}</p>
                        </div>
                        <p className="font-bold text-sky-400 tabular-nums shrink-0">Q{pago.montoTotalPagado.toFixed(2)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface IngresosTarjetaProps {
  items: any[];
  selected: Set<string>;
  onSelect: (id: string, isSelected: boolean) => void;
  onSelectAll: () => void;
  firestore: any;
  sucursalId: string;
}

export function IngresosTarjeta({ items, selected, onSelect, onSelectAll, firestore, sucursalId }: IngresosTarjetaProps) {
  if (items.length === 0) return null;

  return (
    <Card 
      className="shadow-sm overflow-hidden font-body !bg-[#1e1e1e] border !border-[#2e2e2e]"
      style={{ backgroundColor: '#1e1e1e', borderColor: '#2e2e2e' }}
    >
      <CardHeader className="p-4 pb-2 bg-transparent">
        <CardTitle className="font-bold text-base sm:text-lg text-foreground flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-sky-400 shrink-0" />
          Ingresos por Tarjeta
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-1">
        <div className="space-y-3">
          <div className="flex items-center p-2 border-b !border-[#2e2e2e]">
            <Checkbox 
              id="select-all-tarjeta" 
              checked={selected.size === items.length && items.length > 0} 
              onCheckedChange={onSelectAll} 
            />
            <Label htmlFor="select-all-tarjeta" className="ml-3 flex-1 font-bold text-sm text-foreground cursor-pointer">
              Seleccionar Todos
            </Label>
          </div>
          <Accordion type="single" collapsible className="w-full space-y-2">
            {items.map(cierre => (
              <AccordionItem 
                value={cierre.id} 
                key={cierre.id} 
                style={{ backgroundColor: '#252526', borderColor: '#2e2e2e' }}
                className="border-b-0 rounded-xl border !border-[#2e2e2e] !bg-[#252526] hover:brightness-105 transition-all overflow-hidden mb-2 shadow-sm relative"
              >
                {/* Checkbox centrado verticalmente en la cabecera del acordeón */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
                    <Checkbox 
                      id={`cierre-tarjeta-${cierre.id}`} 
                      checked={selected.has(cierre.id)} 
                      onCheckedChange={(checked) => onSelect(cierre.id, !!checked)}
                    />
                  </div>

                  <AccordionTrigger className="pl-10 pr-3 hover:no-underline py-3 w-full data-[state=open]:border-b data-[state=open]:border-[#2e2e2e]">
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-2 mr-2 text-left">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="hidden sm:flex h-8 w-8 rounded-full bg-blue-500/10 items-center justify-center shrink-0">
                        <CreditCard className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-bold text-xs sm:text-sm leading-tight text-foreground truncate">
                          Pagos Tarjeta (Cierre #{cierre.idCuadre})
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="text-[0.625rem] sm:text-xs text-muted-foreground font-medium truncate">
                            {format(cierre.fecha.toDate(), "dd MMM, yyyy", { locale: es })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                      <p className="font-bold text-xs sm:text-sm text-blue-400 whitespace-nowrap tabular-nums leading-tight">
                        Q{cierre.pagosTarjeta.toFixed(2)}
                      </p>
                      <Badge className="rounded-full text-[0.625rem] font-semibold border border-amber-500/30 bg-amber-500/20 text-amber-300 px-2 py-0.5">
                        Pendiente
                      </Badge>
                    </div>
                  </div>
                  </AccordionTrigger>
                </div>

                <AccordionContent className="p-3.5 sm:p-4 bg-[#1e1e1e]">
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
