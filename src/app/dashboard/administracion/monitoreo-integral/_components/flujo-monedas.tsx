'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Coins, ShoppingCart, Trophy, Loader2, Landmark, MinusCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';

/** Helper para conversión de fechas segura */
const toDate = (fecha: any): Date => {
  if (fecha instanceof Timestamp) return fecha.toDate();
  if (fecha instanceof Date) return fecha;
  if (typeof fecha === 'string') {
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(0);
};

interface FlujoMonedasProps {
  lista: any[];
  ventaNetaPeriodo: number;
  monedasIniciales: number;
  efectivoAcumuladoMonedas: number;
  inicioPeriodo: Date;
  isLoading: boolean;
}

export function FlujoMonedas({ lista, ventaNetaPeriodo, monedasIniciales, efectivoAcumuladoMonedas, inicioPeriodo, isLoading }: FlujoMonedasProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const listaOrdenada = useMemo(() => {
    const sorted = [...lista].sort((a, b) => {
      const timeA = toDate(a.fecha).getTime();
      const timeB = toDate(b.fecha).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });
    return sorted;
  }, [lista, sortOrder]);

  // Calcular la existencia final basándose en el rastro de la lista
  const existenciaFinal = useMemo(() => {
    if (!lista || lista.length === 0) return monedasIniciales;
    // Buscamos el último registro cronológicamente
    const sortedChronologically = [...lista].sort((a, b) => toDate(a.fecha).getTime() - toDate(b.fecha).getTime());
    return sortedChronologically[sortedChronologically.length - 1].stockAcumulado;
  }, [lista, monedasIniciales]);

  return (
    <div className="space-y-6 outline-none animate-in fade-in duration-500">
      {/* Tarjetas de Métricas de Monedas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-rose-900 border-none rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 text-center">
            <p className="text-[10px] font-bold text-rose-100/60 mb-1">Existencia Inicial</p>
            <p className="text-3xl font-black font-headline text-white">{monedasIniciales}</p>
          </div>
        </Card>
        <Card className="bg-indigo-700 border-none rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 text-center">
            <p className="text-[10px] font-bold text-indigo-100 mb-1">Venta Neta Monedas</p>
            <p className="text-3xl font-black text-white font-headline tabular-nums">Q{ventaNetaPeriodo.toFixed(2)}</p>
          </div>
        </Card>
        <Card className="bg-teal-700 border-none rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 text-center">
            <p className="text-[10px] font-bold text-teal-100 mb-1">Existencia Final</p>
            <p className="text-3xl font-black text-white font-headline">{existenciaFinal}</p>
          </div>
        </Card>
      </div>

      {/* Tabla de Auditoría de Monedas */}
      <Card className="border shadow-md rounded-lg overflow-hidden border-muted-foreground/10 bg-[hsl(219,26%,21%)]">
        <div className="bg-black/20 p-4 border-b border-white/5 text-[10px] font-bold text-muted-foreground grid grid-cols-12 gap-4 uppercase tracking-tighter">
          <div className="col-span-5 text-left">Movimiento / Detalle</div>
          <div className="col-span-2 text-center">Efectivo (Q)</div>
          <div className="col-span-3 text-center">Existencia</div>
          <div className="col-span-2 text-right">
            <button 
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-1.5 ml-auto hover:text-primary transition-colors"
            >
              Hora
              {sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            </button>
          </div>
        </div>
        <ScrollArea className="h-[400px]">
          <div className="divide-y divide-white/5">
            {/* Fila de Apertura Monedas */}
            {sortOrder === 'asc' && (
              <div className="grid grid-cols-12 gap-4 p-4 items-center bg-primary/[0.08]">
                <div className="col-span-5 text-left">
                  <p className="font-black text-sm text-primary font-headline">Apertura Del Período</p>
                  <p className="text-[10px] font-bold text-muted-foreground/60">Saldo base tras el inicio del turno de caja</p>
                </div>
                <div className="col-span-2 text-center">
                  <span className="font-bold text-xs text-muted-foreground/40 tabular-nums">Q0.00</span>
                </div>
                <div className="col-span-3 text-center">
                  <p className="font-black text-primary text-xl tabular-nums">{monedasIniciales}</p>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-[10px] font-bold text-muted-foreground/40">{format(inicioPeriodo, "hh:mm a")}</span>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : lista.length === 0 ? (
              <div className="p-20 text-center text-muted-foreground/40 italic text-sm">No se registraron movimientos en este lapso.</div>
            ) : (
              listaOrdenada.map((mov, idx) => {
                const getIcon = () => {
                    if (mov.tipo === 'venta') return <ShoppingCart className="h-5 w-5"/>;
                    if (mov.tipo === 'premio') return <Trophy className="h-5 w-5"/>;
                    if (mov.tipo === 'base') return <Landmark className="h-5 w-5"/>;
                    if (mov.tipo === 'extraccion') return <MinusCircle className="h-5 w-5"/>;
                    return <Coins className="h-5 w-5"/>;
                };

                const getIconColor = () => {
                    if (mov.tipo === 'venta') return "bg-emerald-500/20 text-emerald-400";
                    if (mov.tipo === 'premio') return "bg-amber-500/20 text-amber-400";
                    if (mov.tipo === 'base') return "bg-emerald-500/10 text-emerald-500";
                    if (mov.tipo === 'extraccion') return "bg-blue-500/20 text-blue-400";
                    return "bg-muted text-muted-foreground";
                };

                const esGastoEfectivo = mov.monto < 0;
                const esIngresoEfectivo = mov.monto > 0;
                
                const esGastoStock = (mov.tipo === 'venta' || mov.tipo === 'base');
                const esIngresoStock = (mov.tipo === 'premio' || mov.tipo === 'extraccion');

                return (
                  <div key={idx} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.03] transition-colors group">
                    <div className="col-span-5 flex items-center gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm",
                        getIconColor()
                      )}>
                        {getIcon()}
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="font-bold text-sm truncate text-white/90">{mov.desc}</p>
                        <p className="text-[10px] font-bold text-muted-foreground/60 truncate opacity-70 mt-0.5">{mov.ref}</p>
                      </div>
                    </div>
                    <div className="col-span-2 text-center">
                      {mov.monto !== 0 ? (
                        <>
                            <p className={cn("text-base font-black tabular-nums", esIngresoEfectivo ? "text-emerald-400" : "text-rose-400")}>
                                {esIngresoEfectivo ? '+' : ''}{mov.monto.toFixed(2)}
                            </p>
                            <p className="text-[9px] font-bold text-muted-foreground/40 tabular-nums mt-0.5">Saldo: Q{mov.cashAcumulado.toFixed(2)}</p>
                        </>
                      ) : (
                        <span className="text-muted-foreground/20 font-bold">--</span>
                      )}
                    </div>
                    <div className="col-span-3 text-center">
                      <p className={cn("text-base font-black tabular-nums", esIngresoStock ? "text-emerald-400" : "text-rose-400")}>
                        {esIngresoStock ? '+' : '-'}{mov.cantidad}
                      </p>
                      <p className="text-[9px] font-bold text-muted-foreground/40 tabular-nums mt-0.5">Stock: {mov.stockAcumulado}</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-[10px] font-bold text-muted-foreground/40 tabular-nums">{format(toDate(mov.fecha), "hh:mm a")}</span>
                    </div>
                  </div>
                );
              })
            )}

            {sortOrder === 'desc' && (
              <div className="grid grid-cols-12 gap-4 p-4 items-center bg-primary/[0.08]">
                <div className="col-span-5 text-left">
                  <p className="font-black text-sm text-primary font-headline">Apertura Del Período</p>
                  <p className="text-[10px] font-bold text-muted-foreground/60">Saldo base tras el inicio del turno de caja</p>
                </div>
                <div className="col-span-2 text-center">
                  <span className="font-bold text-xs text-muted-foreground/40 tabular-nums">Q0.00</span>
                </div>
                <div className="col-span-3 text-center">
                  <p className="font-black text-primary text-xl tabular-nums">{monedasIniciales}</p>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-[10px] font-bold text-muted-foreground/40">{format(inicioPeriodo, "hh:mm a")}</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
