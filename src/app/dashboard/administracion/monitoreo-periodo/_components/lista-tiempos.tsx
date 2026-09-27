'use client';

import React, { useMemo } from 'react';
import type { Pago } from '@/lib/tipos';
import { 
  Clock, 
  Gamepad2, 
  Dices,
  Loader2,
  CreditCard,
  Coins
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

const toDate = (fecha: any): Date => {
  if (fecha instanceof Timestamp) return fecha.toDate();
  if (fecha instanceof Date) return fecha;
  if (typeof fecha === 'string') {
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(0);
};

interface ListaTiemposProps {
  pagos: Pago[];
  isLoading: boolean;
}

export function ListaTiempos({ pagos, isLoading }: ListaTiemposProps) {
  const resumen = useMemo(() => {
    const mapeo: { [key: string]: { label: string, total: number, sesiones: any[], isConsola: boolean } } = {};

    pagos.forEach(pago => {
      pago.itemsSaldados.forEach(item => {
        const nombre = item.nombreProducto;
        // Detectar si es tiempo de mesa o consola (automático o manual)
        const isMesa = nombre.includes('Mesa #');
        const isConsola = nombre.includes('Consola #');

        if (isMesa || isConsola) {
          // Extraer número
          const match = nombre.match(/#(\d+)/);
          const numero = match ? match[1] : '0';
          const key = `${isConsola ? 'Consola' : 'Mesa'}-${numero}`;

          if (!mapeo[key]) {
            mapeo[key] = {
              label: `${isConsola ? 'Consola' : 'Mesa'} #${numero}`,
              total: 0,
              sesiones: [],
              isConsola
            };
          }

          mapeo[key].total += item.montoAplicado;
          mapeo[key].sesiones.push({
            id: `${pago.id}-${item.idDetalle}`,
            descripcion: nombre,
            monto: item.montoAplicado,
            fecha: toDate(pago.fecha),
            cliente: pago.clienteNombre,
            metodo: pago.metodoPago
          });
        }
      });
    });

    return Object.values(mapeo).sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
  }, [pagos]);

  const totalGeneral = useMemo(() => resumen.reduce((acc, r) => acc + r.total, 0), [resumen]);

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 font-body">
      <div className="text-center p-6 bg-sky-500/5 rounded-xl border border-sky-500/10 transition-all">
        <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-widest">Total Ingresos Alquiler (Efectivo + Tarjeta)</p>
        <p className="text-4xl font-black text-sky-600 dark:text-sky-400">Q{totalGeneral.toFixed(2)}</p>
      </div>

      {resumen.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg bg-card-foreground/5">
          <Clock className="h-12 w-12 mb-4 opacity-20" />
          <p className="font-semibold text-lg text-foreground">No se registraron tiempos</p>
          <p className="text-xs">No se encontraron cobros de mesa o consola en este período.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resumen.map((item) => (
            <Card key={item.label} className="border-muted/60 rounded-xl bg-card transition-all overflow-hidden shadow-sm">
              <CardHeader className="p-4 border-b border-muted/40 bg-muted/5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {item.isConsola ? (
                      <Gamepad2 className="h-5 w-5 text-sky-600" />
                    ) : (
                      <Dices className="h-5 w-5 text-sky-600" />
                    )}
                    <CardTitle className="text-base font-bold text-foreground">{item.label}</CardTitle>
                  </div>
                  <Badge className="bg-sky-600 text-white border-none font-bold rounded-full">Q{item.total.toFixed(2)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-muted/40">
                  {item.sesiones.sort((a, b) => b.fecha.getTime() - a.fecha.getTime()).map((sesion) => (
                    <div key={sesion.id} className="p-3 hover:bg-muted/10 transition-colors">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-foreground leading-tight truncate flex items-center gap-1.5">
                            {sesion.descripcion}
                            {sesion.metodo === 'Tarjeta' ? (
                              <CreditCard className="h-2.5 w-2.5 text-blue-500" />
                            ) : (
                              <Coins className="h-2.5 w-2.5 text-emerald-500" />
                            )}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                            {sesion.cliente} • {format(sesion.fecha, 'hh:mm a', { locale: es })}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-sky-600 dark:text-sky-400 shrink-0">Q{sesion.monto.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
