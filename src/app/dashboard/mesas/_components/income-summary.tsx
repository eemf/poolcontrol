'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { useFirebase, useDoc } from '@/firebase';
import type { Generales, Venta, DetalleVenta } from '@/lib/tipos';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChartHorizontal, Loader2, Clock, History, CheckCircle2, CreditCard } from 'lucide-react';
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

export function IncomeSummary({ generalesRef, sucursalId }: { generalesRef: any, sucursalId: string | null }) {
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

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const mapeoPorMesa: { [key: number]: ResumenPorMesa } = {};

      querySnapshot.forEach((docSnap) => {
        const venta = docSnap.data() as Venta;
        const fechaPago = toDate(venta.fecha);

        venta.detalles.forEach((detalle: DetalleVenta) => {
          const esTiempoMesa = detalle.idProducto && (
            detalle.idProducto.startsWith('mesa-') || 
            detalle.idProducto.startsWith('mesa-ajuste-') || 
            detalle.idProducto.startsWith('division-mesa-') ||
            detalle.nombreProducto.includes('Mesa #') ||
            detalle.nombreProducto.includes('Consola #')
          );
          
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
                  sesiones: []
                };
              }
              
              mapeoPorMesa[numeroMesa].total += montoCobrado;
              mapeoPorMesa[numeroMesa].sesiones.push({
                id: `${docSnap.id}-${detalle.idDetalle}`,
                tiempo,
                costo: montoCobrado,
                fecha: fechaPago,
                metodoPago: detalle.metodoPago || 'Efectivo',
                metadata: detalle.metadata
              });
            }
          }
        });
      });

      const resumenArray = Object.values(mapeoPorMesa)
        .sort((a, b) => a.numeroMesa - b.numeroMesa);

      resumenArray.forEach(r => {
        r.sesiones.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
      });

      setResumen(resumenArray);
      setCargandoResumen(false);
    }, (error) => {
      console.error('[ResumenSalaDeJuegos] Error fetching summary:', error);
      setCargandoResumen(false);
    });

    return () => unsubscribe();
  }, [firestore, estadoCaja?.fechaInicioPeriodo, sucursalId]);

  const totalGeneral = resumen.reduce((acc, mesa) => acc + mesa.total, 0);

  return (
    <Card className="border-muted/60 shadow-sm overflow-hidden font-body">
      <CardHeader className="bg-muted/5 border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <BarChartHorizontal className="h-5 w-5 text-primary" />
          Ingresos: Sala de Juegos
        </CardTitle>
        <CardDescription className="text-xs">Desglose de pagos (Efectivo + Tarjeta)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {cargandoResumen ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="text-center p-4 bg-primary/5 rounded-xl border border-primary/10">
              <p className="text-base font-bold text-muted-foreground mb-1">Total Consolidado</p>
              <p className="text-4xl font-bold text-primary">Q{totalGeneral.toFixed(2)}</p>
            </div>
            
            {resumen.length === 0 ? (
               <div className="text-center text-muted-foreground py-12 flex flex-col items-center gap-2">
                  <History className="h-8 w-8 opacity-20" />
                  <p className="text-sm italic">Sin cobros registrados en este turno.</p>
               </div>
            ) : (
                <div className="space-y-8">
                    {resumen.map(({ numeroMesa, tipoDeMesa, total, sesiones }) => (
                        <div key={numeroMesa} className="space-y-3">
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-sm font-bold text-muted-foreground tracking-tight">
                                    <span className="text-foreground">{tipoDeMesa} #{numeroMesa}</span>
                                    <span className="text-primary font-bold">Q{total.toFixed(2)}</span>
                                </div>
                                <Progress value={totalGeneral > 0 ? (total / totalGeneral) * 100 : 0} className="h-2" />
                            </div>
                            
                            <div className="space-y-0.5">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight flex items-center gap-1.5 mb-2 pl-1">
                                    <Clock className="h-3 w-3" /> Desglose de Sesiones
                                </h4>
                                <div className="divide-y divide-muted-foreground/10 border-t border-muted-foreground/10">
                                    {sesiones.map((sesion, idx) => (
                                        <div key={sesion.id} className="flex justify-between items-center py-2.5 px-1 hover:bg-muted/30 transition-colors">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-foreground leading-tight flex items-center gap-2">
                                                    {sesion.tiempo}
                                                    <span className="text-[10px] text-muted-foreground font-medium lowercase">
                                                      {format(sesion.fecha, "dd/MM", { locale: es })}
                                                    </span>
                                                    {sesion.metodoPago === 'Tarjeta' && (
                                                      <CreditCard className="h-3 w-3 text-sky-500" />
                                                    )}
                                                </p>
                                                {sesion.metadata && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        <Badge variant="outline" className="text-[8px] h-4 px-1 font-bold border-muted-foreground/30 text-muted-foreground">
                                                            {sesion.metadata.modo === 'definido' ? 'Definido' : 'Libre'}
                                                        </Badge>
                                                        {sesion.metadata.pagadoContado && <Badge className="text-[8px] h-4 px-1 bg-emerald-500 text-white border-none font-bold">Contado</Badge>}
                                                        {sesion.metadata.tipo === 'ajuste' && <Badge className="text-[8px] h-4 px-1 bg-amber-500 text-white border-none font-bold">Ajuste</Badge>}
                                                        <div className="flex items-center gap-1 ml-1 text-[9px] font-bold text-muted-foreground/70 uppercase">
                                                            <span>{sesion.metadata.horaInicio ? format(toDate(sesion.metadata.horaInicio), 'hh:mm a') : '--:--'}</span>
                                                            <span>-</span>
                                                            <span>{sesion.metadata.horaFin ? format(toDate(sesion.metadata.horaFin), 'hh:mm a') : (sesion.metadata.pagadoContado ? 'Prep.' : '--:--')}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right ml-2 shrink-0">
                                                <p className={cn(
                                                    "text-sm font-bold",
                                                    sesion.costo > 0 ? "text-primary" : "text-muted-foreground opacity-60"
                                                )}>
                                                    Q{sesion.costo.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
