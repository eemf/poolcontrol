'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useFirebase } from '@/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import type { Pago } from '@/lib/tipos';
import { toDate } from '@/lib/firebase/servicios/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SurfaceCard } from '@/components/comunes';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CreditCard, X } from 'lucide-react';

interface HistorialPagosTarjetaProps {
  fechaInicioPeriodo: Date;
  onCerrar: () => void;
  sucursalId: string;
}

export function HistorialPagosTarjeta({
  fechaInicioPeriodo,
  onCerrar,
  sucursalId,
}: HistorialPagosTarjetaProps) {
  const { firestore } = useFirebase();
  const [pagosTarjeta, setPagosTarjeta] = useState<Pago[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firestore) return;
    setCargando(true);
    const q = query(
      collection(firestore, `sucursales/${sucursalId}/pagos`),
      where('fecha', '>=', fechaInicioPeriodo),
      where('metodoPago', '==', 'Tarjeta')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pagosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pago));
      const pagosFiltrados = pagosData.map(pago => ({
        ...pago,
        itemsSaldados: (pago.itemsSaldados || []).filter(item => !item.esVirtual)
      })).filter(pago => pago.itemsSaldados.length > 0);

      setPagosTarjeta(pagosFiltrados.sort((a, b) => toDate(b.fecha).getTime() - toDate(a.fecha).getTime()));
      setCargando(false);
    }, err => {
      console.error("Error cargando historial de tarjeta:", err);
      setError("No se pudo cargar el historial.");
      setCargando(false);
    });
    return () => unsubscribe();
  }, [firestore, fechaInicioPeriodo, sucursalId]);
  
  const totalGeneralTarjeta = useMemo(() => 
    pagosTarjeta.reduce((sum, pago) => 
      sum + (pago.itemsSaldados || []).reduce((itemSum, item) => itemSum + item.montoAplicado, 0)
    , 0)
  , [pagosTarjeta]);

  return (
    <SurfaceCard variant="surface" className="p-4 space-y-3">
      <div className="flex items-start justify-between pb-2 border-b border-app-border">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-sky-400" />
            Historial de Tarjeta (Consumos)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Total en período: <span className="font-bold text-sky-400 font-mono">Q{totalGeneralTarjeta.toFixed(2)}</span>
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onCerrar} className="rounded-full h-8 w-8 hover:bg-[#1d283a]">
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      <ScrollArea className="h-[55vh]">
        {cargando ? (
          <div className="flex justify-center items-center h-48">
            <Loader className="h-8 w-8 text-sky-400 animate-spin" />
          </div>
        ) : error ? (
          <p className="text-rose-400 text-center py-8 text-xs">{error}</p>
        ) : pagosTarjeta.length === 0 ? (
          <p className="text-muted-foreground text-center h-48 flex items-center justify-center text-xs">
            No hay pagos con tarjeta en este período.
          </p>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-2.5">
            {pagosTarjeta.map(pago => (
              <AccordionItem value={pago.id} key={pago.id} className="border border-app-border rounded-xl bg-[#1d283a] overflow-hidden">
                <AccordionTrigger className="p-3.5 hover:no-underline text-sm hover:bg-[#283244]/50">
                  <div className="grid grid-cols-[1fr,auto] sm:grid-cols-[auto,1fr,auto] gap-x-3 items-center w-full text-left">
                    <div className="hidden sm:block bg-sky-500/10 text-sky-400 p-2 rounded-full row-span-2">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <p className="font-bold text-slate-100 truncate text-sm">{pago.clienteNombre}</p>
                    <p className="font-bold text-sky-400 text-base text-right font-mono">
                      Q{(pago.itemsSaldados || []).reduce((acc, item) => acc + item.montoAplicado, 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">Pago #{pago.idPago} / Venta #{pago.idVenta}</p>
                    <p className="text-xs text-muted-foreground text-right">{format(toDate(pago.fecha), "dd MMM, hh:mm a", { locale: es })}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-3.5 pt-0 border-t border-app-border/40">
                  <h4 className="font-semibold text-xs mb-2 text-slate-300 pt-2">Artículos Pagados</h4>
                  <div className="divide-y divide-app-border/40">
                    {(pago.itemsSaldados || []).map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 text-xs">
                        <p className="font-medium text-slate-200">
                          {item.cantidad ? `${item.cantidad}x ` : ''}{item.nombreProducto}
                        </p>
                        <p className="font-semibold text-sky-400 font-mono">+ Q{item.montoAplicado.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </ScrollArea>
    </SurfaceCard>
  );
}
