
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
    if (!pagos || pagos.length === 0) return <p className="text-[10px] text-muted-foreground italic text-center p-2">Sin detalles de ventas con tarjeta.</p>;

    return (
        <div className="space-y-1.5 p-2 bg-muted/20 rounded-xl mt-1">
            <p className="text-[9px] font-bold text-muted-foreground mb-1 px-1">Desglose de Ventas con Tarjeta</p>
            {pagos.map(pago => (
                <div key={pago.id} className="flex justify-between items-center text-[10px] px-2 py-1.5 border-b border-muted-foreground/10 last:border-0 hover:bg-background/40 transition-colors rounded-md">
                    <div className="flex flex-col min-w-0 text-left">
                        <span className="font-bold text-foreground/80 truncate">Venta #{pago.idVenta} — {pago.clienteNombre}</span>
                        <span className="text-[8px] text-muted-foreground font-medium">{format(toDate(pago.fecha), 'hh:mm a')}</span>
                    </div>
                    <span className="font-bold text-blue-600 ml-2">Q{pago.montoTotalPagado.toFixed(2)}</span>
                </div>
            ))}
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
      className="shadow-sm overflow-hidden font-body !bg-[#1d283a] border !border-[#324157]"
      style={{ backgroundColor: '#1d283a', borderColor: '#324157' }}
    >
      <CardHeader className="p-4 pb-2 bg-transparent">
        <CardTitle className="font-bold text-base sm:text-lg text-foreground">Ingresos por Tarjeta</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-1">
        <div className="space-y-3">
          <div className="flex items-center p-2 border-b !border-[#324157]">
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
                style={{ backgroundColor: '#283244', borderColor: '#324157' }}
                className="border-b-0 rounded-xl border !border-[#324157] !bg-[#283244] hover:brightness-105 transition-all overflow-hidden mb-2 shadow-sm relative"
              >
                {/* Checkbox anclado a la cabecera del acordeón */}
                <div className="absolute left-3 top-6 -translate-y-1/2 z-20 flex items-center justify-center">
                  <Checkbox 
                    id={`cierre-tarjeta-${cierre.id}`} 
                    checked={selected.has(cierre.id)} 
                    onCheckedChange={(checked) => onSelect(cierre.id, !!checked)}
                  />
                </div>

                <AccordionTrigger className="pl-10 pr-3 hover:no-underline py-3 w-full">
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
                          <span className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">
                            {format(cierre.fecha.toDate(), "dd MMM, yyyy", { locale: es })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                      <p className="font-bold text-xs sm:text-sm text-blue-400 whitespace-nowrap tabular-nums leading-tight">
                        Q{cierre.pagosTarjeta.toFixed(2)}
                      </p>
                      <Badge className="h-4 text-[9px] font-semibold border-none bg-blue-500/20 text-blue-300 px-1.5 py-0">
                        Pendiente
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-3 pb-3">
                  <div className="pt-2 border-t !border-[#324157]">
                    <DetalleVentasTarjeta 
                      firestore={firestore} 
                      sucursalId={sucursalId} 
                      inicio={cierre.inicioDelPeriodo} 
                      fin={cierre.fecha} 
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}
