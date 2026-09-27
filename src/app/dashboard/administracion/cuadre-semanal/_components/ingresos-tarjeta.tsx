
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
    <Card className="border-muted/60 shadow-sm overflow-hidden font-body">
      <CardHeader className="p-4 bg-muted/5 border-b">
        <CardTitle className="font-bold text-lg">Ingresos por Tarjeta</CardTitle>
        <CardDescription className="text-xs">Selecciona los cierres que contienen ingresos por tarjeta a procesar.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-3">
          <div className="flex items-center p-2 border-b">
            <Checkbox 
              id="select-all-tarjeta" 
              checked={selected.size === items.length && items.length > 0} 
              onCheckedChange={onSelectAll}
            />
            <Label htmlFor="select-all-tarjeta" className="ml-4 flex-1 font-bold text-sm">Seleccionar Todos</Label>
          </div>
          <Accordion type="single" collapsible className="w-full space-y-2">
            {items.map(cierre => (
              <AccordionItem 
                value={cierre.id} 
                key={cierre.id} 
                className="relative border rounded-lg bg-card-foreground/5 overflow-hidden border-b-0 shadow-sm transition-all hover:border-primary/20 mb-2"
              >
                {/* Checkbox posicionado absolutamente para no romper el flujo del trigger */}
                <div className="absolute left-4 top-7 -translate-y-1/2 z-20 flex items-center justify-center">
                  <Checkbox 
                    id={`cierre-tarjeta-${cierre.id}`} 
                    checked={selected.has(cierre.id)} 
                    onCheckedChange={(checked) => onSelect(cierre.id, !!checked)}
                  />
                </div>

                <AccordionTrigger className="pl-14 pr-4 hover:no-underline py-4 w-full">
                  <div className="flex-1 flex items-center justify-between gap-4 mr-2">
                    <div className="flex items-center gap-3 min-w-0 text-left">
                      <div className="hidden sm:flex h-9 w-9 rounded-full bg-blue-500/10 items-center justify-center shrink-0">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm sm:text-base leading-tight text-foreground">
                          Pagos con Tarjeta (Cierre #{cierre.idCuadre})
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                            {format(cierre.fecha.toDate(), "dd MMM, yyyy", { locale: es })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <p className="font-bold text-base sm:text-lg text-blue-600 whitespace-nowrap tabular-nums leading-none">
                        Q{cierre.pagosTarjeta.toFixed(2)}
                      </p>
                      <Badge className="h-4 text-[8px] font-bold border-none bg-blue-100 text-blue-700">
                        Pendiente
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-4 pb-4">
                  <div className="pl-10">
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
