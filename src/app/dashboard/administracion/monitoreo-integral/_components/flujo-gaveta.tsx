
'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Banknote, Clock, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
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

interface FlujoGavetaProps {
  resumen: {
    inicial: number;
    ventas: number;
    alquileres: number;
    totalGaveta: number;
  };
  flujo: any[];
  inicioPeriodo: Date;
}

export function FlujoGaveta({ resumen, flujo, inicioPeriodo }: FlujoGavetaProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const flujoOrdenado = useMemo(() => {
    const sorted = [...flujo].sort((a, b) => {
      const timeA = toDate(a.fecha).getTime();
      const timeB = toDate(b.fecha).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });
    return sorted;
  }, [flujo, sortOrder]);

  return (
    <div className="space-y-6 outline-none animate-in fade-in duration-500">
      {/* Tarjetas de Métricas con Colores Sólidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-rose-900 border-none shadow-sm rounded-lg overflow-hidden">
          <div className="p-4 text-center">
            <p className="text-[10px] font-bold text-rose-100/60 mb-1">Efectivo Inicial</p>
            <p className="text-xl font-black text-white tabular-nums">Q{resumen.inicial.toFixed(2)}</p>
          </div>
        </Card>
        <Card className="bg-emerald-700 border-none shadow-sm rounded-lg overflow-hidden">
          <div className="p-4 text-center">
            <p className="text-[10px] font-bold text-emerald-100 mb-1">Ventas Consumo</p>
            <p className="text-xl font-black text-white tabular-nums">Q{resumen.ventas.toFixed(2)}</p>
          </div>
        </Card>
        <Card className="bg-blue-700 border-none shadow-sm rounded-lg overflow-hidden">
          <div className="p-4 text-center">
            <p className="text-[10px] font-bold text-blue-100 mb-1">Total Alquileres</p>
            <p className="text-xl font-black text-white tabular-nums">Q{resumen.alquileres.toFixed(2)}</p>
          </div>
        </Card>
        <Card className="bg-amber-600 border-none shadow-sm rounded-lg overflow-hidden ring-2 ring-amber-500/20">
          <div className="p-4 text-center">
            <p className="text-[10px] font-bold text-amber-100 mb-1">Total En Gaveta</p>
            <p className="text-xl font-black text-white tabular-nums">Q{resumen.totalGaveta.toFixed(2)}</p>
          </div>
        </Card>
      </div>

      {/* Tabla de Movimientos con Fondo de Auditoría */}
      <Card className="border shadow-md rounded-lg overflow-hidden border-muted-foreground/10 bg-[hsl(219,26%,21%)]">
        <div className="bg-black/20 p-4 border-b border-white/5 text-[10px] font-bold text-muted-foreground grid grid-cols-12 gap-4 uppercase tracking-tighter">
          <div className="col-span-6 text-left">Cliente / Detalle De Pago</div>
          <div className="col-span-3 text-center">Monto Recibido</div>
          <div className="col-span-3 text-right">
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
            {/* Fila de Apertura Estática (Solo se muestra en orden ASC o al final en DESC) */}
            {sortOrder === 'asc' && (
              <div className="grid grid-cols-12 gap-4 p-4 items-center bg-primary/[0.08]">
                <div className="col-span-6 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary shadow-sm">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-sm text-primary font-headline">Fondo De Caja (Gaveta)</p>
                    <p className="text-[10px] font-bold text-white/40">Efectivo base al inicio del turno</p>
                  </div>
                </div>
                <div className="col-span-3 text-center">
                  <p className="font-black text-primary text-lg tabular-nums">Q{resumen.inicial.toFixed(2)}</p>
                </div>
                <div className="col-span-3 text-right">
                  <span className="text-[10px] font-bold text-white/20">{format(inicioPeriodo, "hh:mm a")}</span>
                </div>
              </div>
            )}

            {/* Listado de Pagos */}
            {flujo.length === 0 ? (
              <div className="p-20 text-center text-white/20 italic text-sm border-2 border-dashed border-white/5 m-4 rounded-xl">Sin cobros en efectivo registrados todavía.</div>
            ) : (
              flujoOrdenado.map((pago, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.03] transition-colors group">
                  <div className="col-span-6 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-sm transition-transform group-hover:scale-110">
                      <Banknote className="h-5 w-5"/>
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="font-bold text-sm truncate text-white/90">{pago.clienteNombre}</p>
                      <p className="text-[10px] font-bold text-muted-foreground/60 truncate opacity-70 mt-0.5">Pago #{pago.idPago} • Venta #{pago.idVenta}</p>
                    </div>
                  </div>
                  <div className="col-span-3 text-center">
                    <p className="text-base font-black text-primary tabular-nums">+ Q{pago.montoConsumo.toFixed(2)}</p>
                    <p className="text-[9px] font-bold text-muted-foreground/40 tabular-nums">Fondo: Q{pago.saldoAcumulado.toFixed(2)}</p>
                  </div>
                  <div className="col-span-3 text-right">
                    <span className="text-[10px] font-bold text-white/20 tabular-nums">{format(toDate(pago.fecha), "hh:mm a")}</span>
                  </div>
                </div>
              ))
            )}

            {sortOrder === 'desc' && (
              <div className="grid grid-cols-12 gap-4 p-4 items-center bg-primary/[0.08]">
                <div className="col-span-6 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary shadow-sm">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-sm text-primary font-headline">Fondo De Caja (Gaveta)</p>
                    <p className="text-[10px] font-bold text-white/40">Efectivo base al inicio del turno</p>
                  </div>
                </div>
                <div className="col-span-3 text-center">
                  <p className="font-black text-primary text-lg tabular-nums">Q{resumen.inicial.toFixed(2)}</p>
                </div>
                <div className="col-span-3 text-right">
                  <span className="text-[10px] font-bold text-white/20">{format(inicioPeriodo, "hh:mm a")}</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
