'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useFirebase, useDoc } from '@/firebase';
import type { Generales, Venta, DetalleVenta } from '@/lib/tipos';
import { SurfaceCard, CountBadge } from '@/components/comunes';
import { Progress } from '@/components/ui/progress';
import { BarChartHorizontal, Loader2, History, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { toDate } from '@/lib/firebase/servicios/utils';

interface DetalleSesion {
  id: string;
  tiempo: string;
  costo: number;
  fecha: Date;
  metodoPago: string;
  metadata?: any;
}

interface ResumenPorMesa {
  numeroMesa: number;
  tipoDeMesa: string;
  total: number;
  sesiones: DetalleSesion[];
}

export function IncomeSummary({
  generalesRef,
  sucursalId,
}: {
  generalesRef: any;
  sucursalId: string | null;
}) {
  const { firestore } = useFirebase();
  const { data: estadoCaja } = useDoc<Generales>(generalesRef);
  const [resumen, setResumen] = useState<ResumenPorMesa[]>([]);
  const [cargandoResumen, setCargandoResumen] = useState(true);

  useEffect(() => {
    if (!firestore || !estadoCaja?.fechaInicioPeriodo || !sucursalId) {
      setCargandoResumen(false);
      return;
    }

    setCargandoResumen(true);
    const ventasRef = collection(firestore, `sucursales/${sucursalId}/ventas`);
    const q = query(ventasRef, where('fecha', '>=', estadoCaja.fechaInicioPeriodo));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const mapeoPorMesa: { [key: number]: ResumenPorMesa } = {};

        querySnapshot.forEach((docSnap) => {
          const venta = docSnap.data() as Venta;
          const fechaPago = toDate(venta.fecha);

          venta.detalles.forEach((detalle: DetalleVenta) => {
            const esTiempoMesa =
              detalle.idProducto &&
              (detalle.idProducto.startsWith('mesa-') ||
                detalle.idProducto.startsWith('mesa-ajuste-') ||
                detalle.idProducto.startsWith('division-mesa-') ||
                detalle.nombreProducto.includes('Mesa #') ||
                detalle.nombreProducto.includes('Consola #'));

            // Consideramos el monto pagado real (Efectivo + Tarjeta)
            const montoCobrado = (detalle.pagadoEfectivo || 0) + (detalle.pagadoTarjeta || 0);

            if (esTiempoMesa && montoCobrado > 0) {
              const numMesaMatch = detalle.nombreProducto.match(/#(\d+)/);
              const tiempoMatch = detalle.nombreProducto.match(/\(([^)]+)\)/);

              const numeroMesa = numMesaMatch ? parseInt(numMesaMatch[1], 10) : 0;
              const tiempo = tiempoMatch ? tiempoMatch[1] : 'Manual';

              if (numeroMesa > 0) {
                if (!mapeoPorMesa[numeroMesa]) {
                  mapeoPorMesa[numeroMesa] = {
                    numeroMesa,
                    tipoDeMesa: detalle.nombreProducto.includes('Consola') ? 'Consola' : 'Mesa',
                    total: 0,
                    sesiones: [],
                  };
                }

                mapeoPorMesa[numeroMesa].total += montoCobrado;
                mapeoPorMesa[numeroMesa].sesiones.push({
                  id: `${docSnap.id}-${detalle.idDetalle}`,
                  tiempo,
                  costo: montoCobrado,
                  fecha: fechaPago,
                  metodoPago: detalle.metodoPago || 'Efectivo',
                  metadata: detalle.metadata,
                });
              }
            }
          });
        });

        const resumenArray = Object.values(mapeoPorMesa).sort(
          (a, b) => a.numeroMesa - b.numeroMesa
        );

        resumenArray.forEach((r) => {
          r.sesiones.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
        });

        setResumen(resumenArray);
        setCargandoResumen(false);
      },
      (error) => {
        console.error('[ResumenSalaDeJuegos] Error fetching summary:', error);
        setCargandoResumen(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, estadoCaja?.fechaInicioPeriodo, sucursalId]);

  const totalGeneral = resumen.reduce((acc, mesa) => acc + mesa.total, 0);

  return (
    <SurfaceCard variant="panel" className="font-body">
      {/* Cabecera del Panel (sin línea divisoria) */}
      <div className="p-4 pb-0 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
          <BarChartHorizontal className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-100 leading-tight">
            Ingresos: Sala de Juegos
          </h3>
          <p className="text-xs text-slate-400">Desglose de pagos (Efectivo + Tarjeta)</p>
        </div>
      </div>

      {/* Cuerpo del Panel */}
      <div className="p-4 space-y-4">
        {cargandoResumen ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
          </div>
        ) : (
          <>
            <div className="text-center py-1">
              <p className="text-xs font-medium text-slate-400 mb-0.5">Total Consolidado</p>
              <p className="text-3xl font-bold text-sky-400 tabular-nums tracking-tight">
                Q{totalGeneral.toFixed(2)}
              </p>
            </div>

            {resumen.length === 0 ? (
              <div className="text-center text-slate-400 py-10 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-[#252526] border border-[#2e2e2e] flex items-center justify-center text-slate-500">
                  <History className="h-5 w-5" />
                </div>
                <p className="text-xs">Sin cobros registrados en este turno.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {resumen.map(({ numeroMesa, tipoDeMesa, total, sesiones }) => (
                  <SurfaceCard key={numeroMesa} variant="surface" className="p-3.5 space-y-2.5">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-slate-100 flex items-center gap-2">
                          {tipoDeMesa} #{numeroMesa}
                          <CountBadge count={sesiones.length} variant="sky" />
                        </span>
                        <span className="text-sky-400 font-bold tabular-nums">
                          Q{total.toFixed(2)}
                        </span>
                      </div>
                      <Progress
                        value={totalGeneral > 0 ? (total / totalGeneral) * 100 : 0}
                        className="h-1.5 bg-[#1e1e1e]"
                      />
                    </div>

                    <div className="divide-y divide-[#2e2e2e] pt-0.5">
                      {sesiones.map((sesion) => (
                        <div
                          key={sesion.id}
                          className="flex justify-between items-center py-2 first:pt-1 last:pb-0"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-100 leading-tight flex items-center gap-2">
                              {sesion.tiempo}
                              <span className="text-[10px] text-slate-400 font-medium">
                                {format(sesion.fecha, 'dd/MM', { locale: es })}
                              </span>
                              {sesion.metodoPago === 'Tarjeta' && (
                                <CreditCard className="h-3 w-3 text-sky-400" />
                              )}
                            </p>
                            {sesion.metadata && (
                              <div className="flex flex-wrap items-center gap-1 mt-1">
                                <Badge
                                  className={cn(
                                    'text-[10px] h-4 px-1.5 rounded-full font-semibold border',
                                    sesion.metadata.modo === 'definido'
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                      : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                                  )}
                                >
                                  {sesion.metadata.modo === 'definido' ? 'Definido' : 'Libre'}
                                </Badge>
                                {sesion.metadata.pagadoContado && (
                                  <Badge className="text-[10px] h-4 px-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                                    Contado
                                  </Badge>
                                )}
                                {sesion.metadata.tipo === 'ajuste' && (
                                  <Badge className="text-[10px] h-4 px-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                                    Ajuste
                                  </Badge>
                                )}
                                <div className="flex items-center gap-1 ml-1 text-[10px] font-medium text-slate-400">
                                  <span>
                                    {sesion.metadata.horaInicio
                                      ? format(toDate(sesion.metadata.horaInicio), 'hh:mm a')
                                      : '--:--'}
                                  </span>
                                  <span>-</span>
                                  <span>
                                    {sesion.metadata.horaFin
                                      ? format(toDate(sesion.metadata.horaFin), 'hh:mm a')
                                      : sesion.metadata.pagadoContado
                                      ? 'Prep.'
                                      : '--:--'}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-right ml-2 shrink-0">
                            <p
                              className={cn(
                                'text-xs font-bold tabular-nums',
                                sesion.costo > 0 ? 'text-sky-400' : 'text-slate-400'
                              )}
                            >
                              Q{sesion.costo.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SurfaceCard>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </SurfaceCard>
  );
}
