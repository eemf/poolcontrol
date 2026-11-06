'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, onSnapshot, collectionGroup } from 'firebase/firestore';
import type { Pago, HistorialTragamonedas } from '@/lib/tipos';
import { toDate } from '@/lib/firebase/servicios/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SurfaceCard } from '@/components/comunes';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Coins, CreditCard, Trophy, X } from 'lucide-react';

interface HistorialMonedasProps {
  fechaInicioPeriodo: Date;
  onCerrar: () => void;
  sucursalId: string;
}

export function HistorialMonedas({
  fechaInicioPeriodo,
  onCerrar,
  sucursalId,
}: HistorialMonedasProps) {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  
  const [ventasMonedas, setVentasMonedas] = useState<Pago[]>([]);
  const [pagosPremios, setPagosPremios] = useState<HistorialTragamonedas[]>([]);
  const [cargandoPagos, setCargandoPagos] = useState(true);
  const [cargandoPremios, setCargandoPremios] = useState(true);
  const [errorPremios, setErrorPremios] = useState<string | null>(null);

  useEffect(() => {
    if (!firestore) return;
    setCargandoPagos(true);
    const qPagos = query(
      collection(firestore, `sucursales/${sucursalId}/pagos`), 
      where('fecha', '>=', fechaInicioPeriodo)
    );
    const unsubPagos = onSnapshot(qPagos, (snapshot) => {
      const pagosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pago));
      const pagosMonedasFiltrados = pagosData
        .map(pago => ({
          ...pago,
          itemsSaldados: (pago.itemsSaldados || []).filter(item => item.esVirtual)
        }))
        .filter(pago => pago.itemsSaldados.length > 0);
      setVentasMonedas(pagosMonedasFiltrados);
      setCargandoPagos(false);
    }, err => {
      console.error("Error cargando historial de monedas (pagos):", err);
      setCargandoPagos(false);
    });
    return () => unsubPagos();
  }, [firestore, fechaInicioPeriodo, sucursalId]);

  useEffect(() => {
    if (!firestore) return;
    setCargandoPremios(true);
    setErrorPremios(null);
    const qPremios = query(
      collectionGroup(firestore, 'historial'), 
      where('sucursalId', '==', sucursalId), 
      where('fecha', '>=', fechaInicioPeriodo), 
      where('tipo', 'in', ['premio_total', 'premio_parcial'])
    );
    const unsubPremios = onSnapshot(qPremios, (snapshot) => {
      const premiosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HistorialTragamonedas));
      setPagosPremios(premiosData);
      setCargandoPremios(false);
    }, err => {
      console.error("Error cargando historial de premios:", err);
      setErrorPremios("No se pudieron cargar los premios.");
      if (err.code === 'failed-precondition') {
        toast({
          title: "Error de Permisos",
          description: "No se pudo cargar el historial de premios. Es posible que falte un índice en Firestore.",
          variant: "destructive",
        });
      }
      setCargandoPremios(false);
    });
    return () => unsubPremios();
  }, [firestore, fechaInicioPeriodo, toast, sucursalId]);

  const { historialCombinado, balanceTotal } = useMemo(() => {
    const ventas = ventasMonedas.map(pago => ({
      id: `pago-${pago.id}`,
      fecha: pago.fecha,
      tipo: 'venta_moneda' as const,
      monto: (pago.itemsSaldados || []).reduce((sum, item) => sum + item.montoAplicado, 0),
      data: pago,
    }));
    const premios = pagosPremios.map(premio => ({
      id: `premio-${premio.id}`,
      fecha: premio.fecha,
      tipo: 'pago_premio' as const,
      monto: premio.monto,
      data: premio,
    }));

    const historial = [...ventas, ...premios].sort((a, b) => toDate(b.fecha).getTime() - toDate(a.fecha).getTime());
    const balance = historial.reduce((sum, item) => {
      return item.tipo === 'venta_moneda' ? sum + item.monto : sum - item.monto;
    }, 0);

    return { historialCombinado: historial, balanceTotal: balance };
  }, [ventasMonedas, pagosPremios]);

  const cargando = cargandoPagos || cargandoPremios;

  return (
    <SurfaceCard variant="surface" className="p-4 space-y-3">
      <div className="flex items-start justify-between pb-2 border-b border-app-border">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-400" />
            Historial de Venta de Monedas
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Balance neto del período: <span className="font-bold text-amber-400 font-mono">Q{balanceTotal.toFixed(2)}</span>
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
        ) : errorPremios ? (
          <p className="text-rose-400 text-center py-8 text-xs">{errorPremios}</p>
        ) : historialCombinado.length === 0 ? (
          <p className="text-muted-foreground text-center h-48 flex items-center justify-center text-xs">
            No hay movimientos de monedas en este período.
          </p>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-2.5">
            {historialCombinado.map(item => {
              if (item.tipo === 'venta_moneda') {
                const pago = item.data as Pago;
                return (
                  <AccordionItem value={item.id} key={item.id} className="border border-app-border rounded-xl bg-[#1d283a] overflow-hidden">
                    <AccordionTrigger className="p-3.5 hover:no-underline text-sm hover:bg-[#283244]/50">
                      <div className="grid grid-cols-[1fr,auto] sm:grid-cols-[auto,1fr,auto] gap-x-3 items-center w-full text-left">
                        <div className={`hidden sm:block p-2 rounded-full row-span-2 ${pago.metodoPago === 'Efectivo' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-sky-500/10 text-sky-400'}`}>
                          {pago.metodoPago === 'Efectivo' ? <Coins className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                        </div>
                        <p className="font-bold text-slate-100 truncate text-sm">{pago.clienteNombre}</p>
                        <p className="font-bold text-amber-400 text-base text-right font-mono">+ Q{item.monto.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Pago #{pago.idPago} / Venta #{pago.idVenta}</p>
                        <p className="text-xs text-muted-foreground text-right">{format(toDate(pago.fecha), "dd MMM, hh:mm a", { locale: es })}</p>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-3.5 pt-0 border-t border-app-border/40">
                      <h4 className="font-semibold text-xs mb-2 text-slate-300 pt-2">Ítems Virtuales Pagados</h4>
                      <div className="divide-y divide-app-border/40">
                        {(pago.itemsSaldados || []).map((it, index) => (
                          <div key={index} className="flex justify-between items-center py-2 text-xs">
                            <p className="font-medium text-slate-200">
                              {it.cantidad ? `${it.cantidad}x ` : ''}{it.nombreProducto}
                            </p>
                            <p className="font-semibold text-amber-400 font-mono">+ Q{it.montoAplicado.toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              } else if (item.tipo === 'pago_premio') {
                const premio = item.data as HistorialTragamonedas;
                return (
                  <div key={item.id} className="border border-app-border rounded-xl overflow-hidden p-3.5 bg-[#1d283a]">
                    <div className="grid grid-cols-[1fr,auto] sm:grid-cols-[auto,1fr,auto] gap-x-3 items-center w-full text-left">
                      <div className="hidden sm:block bg-rose-500/10 text-rose-400 p-2 rounded-full row-span-2">
                        <Trophy className="h-4 w-4" />
                      </div>
                      <p className="font-bold text-slate-100 truncate text-sm">Pago de Premio</p>
                      <p className="font-bold text-rose-400 text-base text-right font-mono">- Q{item.monto.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground truncate">{premio.descripcion}</p>
                      <p className="text-xs text-muted-foreground text-right">{format(toDate(item.fecha), "dd MMM, hh:mm a", { locale: es })}</p>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </Accordion>
        )}
      </ScrollArea>
    </SurfaceCard>
  );
}
