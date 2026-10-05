
'use client'

import { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { 
  Archive, 
  DollarSign, 
  Dices, 
  Home, 
  Loader2, 
  Clock,
  BarChartHorizontal,
  Coins,
  CalendarDays,
  Gamepad2,
  Banknote,
  Timer,
  Trophy,
  TrendingUp,
  ShieldAlert
} from "lucide-react"
import { useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase'
import { collection, query, where, orderBy, Timestamp, doc } from 'firebase/firestore'
import { useSucursal } from '@/hooks/use-sucursal'
import { usePermissions } from '@/hooks/use-permissions'
import type { Mesa, Venta, Producto, Generales, CierreCaja, CuadreMensual } from '@/lib/tipos'
import { format, startOfDay, subDays, isSameDay, subMonths, startOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip,
} from "recharts"
import { cn } from '@/lib/utils'
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const toDate = (fecha: any): Date => {
  if (fecha instanceof Timestamp) return fecha.toDate();
  if (fecha instanceof Date) return fecha;
  if (typeof fecha === 'string') {
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(0);
};

export default function DashboardPage() {
  const { firestore } = useFirebase();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  const { hasPermission, isLoading: isLoadingPerms } = usePermissions();

  // Memos estables para fechas
  const hace7Dias = useMemo(() => startOfDay(subDays(new Date(), 6)), []);
  const hace7Meses = useMemo(() => startOfMonth(subMonths(new Date(), 6)), []);
  const inicioMes = useMemo(() => startOfMonth(new Date()), []);

  // --- CONSULTAS ---

  const mesasQuery = useMemoFirebase(() => 
    (firestore && sucursalId) ? collection(firestore, `sucursales/${sucursalId}/mesas_de_billar`) : null
  , [firestore, sucursalId]);
  const { data: mesas } = useCollection<Mesa>(mesasQuery);

  const ventasSemanaQuery = useMemoFirebase(() => 
    (firestore && sucursalId) ? query(
      collection(firestore, `sucursales/${sucursalId}/ventas`),
      where('fecha', '>=', Timestamp.fromDate(hace7Dias)),
      orderBy('fecha', 'desc')
    ) : null
  , [firestore, sucursalId, hace7Dias]);
  const { data: ventasSemana } = useCollection<Venta>(ventasSemanaQuery);

  const ventasMesQuery = useMemoFirebase(() => 
    (firestore && sucursalId) ? query(
      collection(firestore, `sucursales/${sucursalId}/ventas`),
      where('fecha', '>=', Timestamp.fromDate(inicioMes)),
      orderBy('fecha', 'desc')
    ) : null
  , [firestore, sucursalId, inicioMes]);
  const { data: ventasMes } = useCollection<Venta>(ventasMesQuery);

  const productosQuery = useMemoFirebase(() => 
    (firestore && sucursalId) ? collection(firestore, `sucursales/${sucursalId}/productos`) : null
  , [firestore, sucursalId]);
  const { data: productos } = useCollection<Producto>(productosQuery);

  const cierresSemanaQuery = useMemoFirebase(() => 
    (firestore && sucursalId) ? query(
      collection(firestore, `sucursales/${sucursalId}/cierre_caja`),
      where('fecha', '>=', Timestamp.fromDate(hace7Dias)),
      orderBy('fecha', 'asc')
    ) : null
  , [firestore, sucursalId, hace7Dias]);
  const { data: cierresSemana } = useCollection<CierreCaja>(cierresSemanaQuery);

  const cierresMensualesQuery = useMemoFirebase(() => 
    (firestore && sucursalId) ? query(
      collection(firestore, `sucursales/${sucursalId}/cuadre_mensual`),
      where('fecha', '>=', Timestamp.fromDate(hace7Meses)),
      orderBy('fecha', 'asc')
    ) : null
  , [firestore, sucursalId, hace7Meses]);
  const { data: cierresMensuales } = useCollection<CuadreMensual>(cierresMensualesQuery);

  const generalesRef = useMemoFirebase(() => 
    (firestore && sucursalId) ? doc(firestore, `sucursales/${sucursalId}/generales/actual`) : null
  , [firestore, sucursalId]);
  const { data: estadoCaja } = useDoc<Generales>(generalesRef);

  // --- FILTRADO Y CÁLCULOS ---

  const metrics = useMemo(() => {
    const mesasBillar = mesas?.filter(m => m.tipoDeMesa !== 'Consola') || [];
    const totalBillar = mesasBillar.length;
    const ocupadasBillar = mesasBillar.filter(m => m.estado === 'ocupado').length;
    const percBillar = totalBillar > 0 ? Math.round((ocupadasBillar / totalBillar) * 100) : 0;

    const consolas = mesas?.filter(m => m.tipoDeMesa === 'Consola') || [];
    const totalConsola = consolas.length;
    const ocupadasConsola = consolas.filter(m => m.estado === 'ocupado').length;
    const percConsola = totalConsola > 0 ? Math.round((ocupadasConsola / totalConsola) * 100) : 0;

    const efInicial = estadoCaja?.efectivoInicial || 0;
    const vtasEfe = estadoCaja?.totalEfectivo || 0;
    const alqMesas = estadoCaja?.totalMesas || 0;
    const totalVendidoHoy = efInicial + vtasEfe + alqMesas;

    const listaBajoStock = productos?.filter(p => p.existencia <= (p.existenciaMinima || 0)) || [];
    const bajoStockCount = listaBajoStock.length;

    return { 
      totalBillar, ocupadasBillar, percBillar,
      totalConsola, ocupadasConsola, percConsola,
      totalVendidoHoy, bajoStock: bajoStockCount,
      productosBajoStock: listaBajoStock,
      efInicial, vtasEfe, alqMesas
    };
  }, [mesas, estadoCaja, productos]);

  const getTopStation = (ventas: Venta[]) => {
    const totals: Record<string, number> = {};
    ventas.forEach(v => {
      v.detalles.forEach(det => {
        const esTiempo = det.idProducto?.startsWith('mesa-') || det.idProducto?.startsWith('division-mesa-') || det.idProducto?.startsWith('mesa-ajuste-');
        if (esTiempo) {
          const match = det.nombreProducto.match(/(Mesa|Consola)\s+#\d+/i);
          const name = match ? match[0] : det.nombreProducto;
          totals[name] = (totals[name] || 0) + det.subtotal;
        }
      });
    });
    
    let top = { name: 'Sin registros', total: 0 };
    Object.entries(totals).forEach(([name, total]) => {
      if (total > top.total) top = { name, total };
    });
    return top;
  };

  const topTurno = useMemo(() => {
    if (!ventasSemana || !estadoCaja?.fechaInicioPeriodo) return { name: 'Sin registros', total: 0 };
    const inicio = toDate(estadoCaja.fechaInicioPeriodo);
    const vTurno = ventasSemana.filter(v => toDate(v.fecha) >= inicio);
    return getTopStation(vTurno);
  }, [ventasSemana, estadoCaja]);

  const topSemana = useMemo(() => getTopStation(ventasSemana || []), [ventasSemana]);
  const topMes = useMemo(() => getTopStation(ventasMes || []), [ventasMes]);

  const chartDataSemanal = useMemo(() => {
    const dias = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return {
        fecha: d,
        label: format(d, 'eee', { locale: es }),
        efectivo: 0,
        tarjeta: 0,
        monedas: 0
      };
    });

    if (!cierresSemana) return dias;

    cierresSemana.forEach(c => {
      const fechaCierreOriginal = toDate(c.fecha);
      const fechaAjustada = new Date(fechaCierreOriginal.getTime() - (5 * 60 * 60 * 1000));
      const diaEncontrado = dias.find(d => isSameDay(d.fecha, fechaAjustada));
      if (diaEncontrado) {
        diaEncontrado.efectivo += (c.totalLiquidado || 0);
        diaEncontrado.tarjeta += (c.pagosTarjeta || 0);
        diaEncontrado.monedas += (c.snapshotMonedas?.totalMonedasNetoPeriodo || 0);
      }
    });

    return dias;
  }, [cierresSemana]);

  const chartDataEstaciones = useMemo(() => {
    const dias = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return {
        fecha: d,
        label: format(d, 'eee', { locale: es }),
        Mesas: 0,
        Consolas: 0
      };
    });

    if (!ventasSemana) return dias;

    ventasSemana.forEach(v => {
      const fechaVenta = toDate(v.fecha);
      const diaEncontrado = dias.find(d => isSameDay(d.fecha, fechaVenta));
      if (diaEncontrado) {
        v.detalles.forEach(det => {
          const esTiempo = det.idProducto?.startsWith('mesa-') || det.idProducto?.startsWith('division-mesa-') || det.idProducto?.startsWith('mesa-ajuste-');
          if (esTiempo) {
            if (det.nombreProducto.toLowerCase().includes('consola')) {
              diaEncontrado.Consolas += det.subtotal;
            } else {
              diaEncontrado.Mesas += det.subtotal;
            }
          }
        });
      }
    });

    return dias;
  }, [ventasSemana]);

  const chartDataMensual = useMemo(() => {
    const meses = Array.from({ length: 6 }, (_, i) => {
      const d = startOfMonth(subMonths(new Date(), 5 - i));
      return {
        fecha: d,
        label: format(d, 'MMM', { locale: es }),
        efectivo: 0,
        tarjeta: 0
      };
    });

    if (!cierresMensuales) return meses;

    // Determina el mes que representa cada cuadre mensual respetando el orden cronológico
    // y contemplando que los cierres pueden realizarse en una fecha corrida del siguiente mes.
    const getMesCorrespondiente = (c: CuadreMensual): Date => {
      if (c.fechaPeriodo) {
        return startOfMonth(toDate(c.fechaPeriodo));
      }
      if (c.mesCorrespondiente) {
        const parts = c.mesCorrespondiente.split('-');
        if (parts.length === 2) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          if (!isNaN(y) && !isNaN(m)) {
            return new Date(y, m, 1);
          }
        }
      }

      const fechaCierreOriginal = toDate(c.fecha);
      const fechaAjustada = new Date(fechaCierreOriginal.getTime() - (5 * 60 * 60 * 1000));
      
      // Si el cuadre se ejecutó en los primeros 20 días del mes,
      // corresponde al mes anterior (ej. cierre de septiembre realizado los primeros días de octubre).
      if (fechaAjustada.getDate() <= 20) {
        return startOfMonth(subMonths(fechaAjustada, 1));
      }
      return startOfMonth(fechaAjustada);
    };

    cierresMensuales.forEach(c => {
      const mesTarget = getMesCorrespondiente(c);
      
      const mesEncontrado = meses.find(m => 
        m.fecha.getMonth() === mesTarget.getMonth() && 
        m.fecha.getFullYear() === mesTarget.getFullYear()
      );
      if (mesEncontrado) {
        const totalTarjeta = c.resumen?.totalIngresosTarjeta || 0;
        const totalLiquidado = c.resumen?.balanceLiquidado || 0;
        
        mesEncontrado.tarjeta += totalTarjeta;
        mesEncontrado.efectivo += Math.max(0, totalLiquidado - totalTarjeta);
      }
    });

    return meses;
  }, [cierresMensuales]);

  if (isLoadingSucursal || isLoadingPerms) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Validación estricta de permisos para evitar carga visual innecesaria
  if (!hasPermission('dashboard.ver')) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-6">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-black font-headline mb-2">Acceso restringido</h1>
        <p className="text-muted-foreground max-w-sm mb-8 text-sm">
          No tienes los privilegios necesarios para visualizar el tablero de control de esta sucursal. 
          Por favor, selecciona un módulo diferente en el menú lateral.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-body animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className='w-full text-center sm:text-left'>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2 text-foreground">
              <Home className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Resumen de Sucursal
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block font-body">Control operativo y financiero del turno actual.</p>
        </div>
      </div>

      {/* MÉTRICAS DE HOY */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-muted/60 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/5 p-4">
            <CardTitle className="text-xs font-bold text-muted-foreground">Ocupación de Sala</CardTitle>
            <div className="flex gap-1.5 text-primary">
                <Dices className="h-4 w-4" />
                <Gamepad2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-4 space-y-4">
            <div className="space-y-1">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Mesas</span>
                    <span className="text-xs sm:text-sm font-black tabular-nums">{metrics.ocupadasBillar} / {metrics.totalBillar}</span>
                </div>
                <Progress value={metrics.percBillar} className="h-1.5" />
            </div>
            <div className="space-y-1">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Consolas</span>
                    <span className="text-xs sm:text-sm font-black tabular-nums">{metrics.ocupadasConsola} / {metrics.totalConsola}</span>
                </div>
                <Progress value={metrics.percConsola} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted/60 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/5 p-4">
            <CardTitle className="text-xs font-bold text-muted-foreground">Ventas de Hoy</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="p-4 pt-4">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 tabular-nums">Q{metrics.totalVendidoHoy.toFixed(2)}</div>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                <span>Efectivo Inicial</span>
                <span className="font-bold text-foreground">Q{metrics.efInicial.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                <span>Ventas Efectivo</span>
                <span className="font-bold text-foreground">Q{metrics.vtasEfe.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                <span>Alquiler de Mesas</span>
                <span className="font-bold text-foreground">Q{metrics.alqMesas.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "border-muted/60 shadow-sm overflow-hidden",
          metrics.bajoStock > 0 ? "border-amber-200 bg-amber-50/30" : ""
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/5 p-4">
            <CardTitle className="text-xs font-bold text-muted-foreground">Alertas de Stock</CardTitle>
            <Archive className={cn("h-4 w-4", metrics.bajoStock > 0 ? "text-amber-500" : "text-muted-foreground")} />
          </CardHeader>
          <CardContent className="p-4 pt-4">
            <div className={cn("text-2xl sm:text-3xl font-black tabular-nums", metrics.bajoStock > 0 ? "text-amber-600" : "text-foreground")}>
              {metrics.bajoStock}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground tracking-tight mt-1 flex items-center gap-1">
              {metrics.bajoStock > 0 ? "Productos para reabastecimiento" : "Inventario óptimo"}
            </p>
            
            {metrics.bajoStock > 0 && (
              <div className="mt-4 space-y-1.5 max-h-[120px] overflow-y-auto pr-1 hide-scrollbar">
                {metrics.productosBajoStock.map((p) => (
                  <div key={p.id} className="flex justify-between items-center text-[10px] bg-background/50 p-1.5 rounded-lg border border-amber-200/50">
                    <span className="font-bold truncate max-w-[120px]">{p.nombre}</span>
                    <Badge variant="outline" className="h-4 px-1 text-[9px] font-black border-amber-500 text-amber-700 bg-amber-100/50">
                      {p.existencia} / {p.existenciaMinima || 0}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* RENDIMIENTO SEMANAL */}
      <div className="grid grid-cols-1">
        <Card className="border-muted/60 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/5 border-b pb-4 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <BarChartHorizontal className="h-5 w-5 text-primary" />
                  Rendimiento Semanal
                </CardTitle>
                <CardDescription className="text-xs">Ingresos liquidados (Últimos 7 días)</CardDescription>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary" /><span className="text-[10px] font-bold text-muted-foreground">Efectivo</span></div>
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-chart-2" /><span className="text-[10px] font-bold text-muted-foreground">Tarjeta</span></div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:pt-6">
            <div className="h-[220px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataSemanal}>
                  <XAxis dataKey="label" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} className="font-bold" />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `Q${v}`} className="font-mono" />
                  <RechartsTooltip 
                    cursor={{fill: 'rgba(0,0,0,0.05)'}}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg shadow-xl p-2 sm:p-3 space-y-1.5 font-body">
                            <p className="text-[10px] font-bold text-muted-foreground capitalize border-b pb-1">{format(data.fecha, 'dd MMMM', { locale: es })}</p>
                            <div className="space-y-1 pt-1">
                              <div className="flex justify-between gap-4 text-[10px]">
                                <span className="font-medium text-muted-foreground">Efectivo:</span>
                                <span className="font-bold text-primary">Q{data.efectivo.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between gap-4 text-[10px]">
                                <span className="font-medium text-muted-foreground">Tarjeta:</span>
                                <span className="font-bold text-chart-2">Q{data.tarjeta.toFixed(2)}</span>
                              </div>
                              <Separator className="my-1" />
                              <div className="flex justify-between gap-4 text-[11px]">
                                <span className="font-bold">Total:</span>
                                <span className="font-black">Q{(data.efectivo + data.tarjeta).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="efectivo" stackId="a" fill="hsl(var(--primary))" />
                  <Bar dataKey="tarjeta" stackId="a" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RENDIMIENTO POR ESTACIÓN Y MEJORES ESTACIONES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-muted/60 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/5 border-b pb-4 p-4">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-sm sm:text-base font-bold">Rendimiento por Estación</CardTitle>
                <CardDescription className="text-[10px]">Ingresos por tipo de juego (Últimos 7 días)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:pt-6">
            <div className="h-[200px] sm:h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataEstaciones}>
                  <XAxis dataKey="label" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} className="font-bold" />
                  <YAxis stroke="#888888" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `Q${v}`} className="font-mono" />
                  <RechartsTooltip 
                    cursor={{fill: 'rgba(0,0,0,0.05)'}}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg shadow-xl p-2 space-y-1 font-body">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase border-b pb-1">{format(data.fecha, 'dd MMM', { locale: es })}</p>
                            <div className="flex justify-between gap-4 text-[10px] pt-1">
                              <span className="font-bold text-primary">Mesas:</span>
                              <span className="font-black">Q{(data.Mesas || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between gap-4 text-[10px]">
                              <span className="font-bold text-accent-foreground">Consolas:</span>
                              <span className="font-black">Q{(data.Consolas || 0).toFixed(2)}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="Mesas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Consolas" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted/60 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/5 border-b pb-4 p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <div>
                <CardTitle className="text-sm sm:text-base font-bold">Mejores Estaciones</CardTitle>
                <CardDescription className="text-[10px]">Mayor facturación acumulada</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">En el turno</p>
                  <p className="text-sm font-bold text-foreground">{topTurno.name}</p>
                  <p className="text-xs font-black text-primary">Q{topTurno.total.toFixed(2)}</p>
                </div>
              </div>
              <Separator className="opacity-50" />
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CalendarDays className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Esta semana</p>
                  <p className="text-sm font-bold text-foreground">{topSemana.name}</p>
                  <p className="text-xs font-black text-emerald-600">Q{topSemana.total.toFixed(2)}</p>
                </div>
              </div>
              <Separator className="opacity-50" />
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Este mes</p>
                  <p className="text-sm font-bold text-foreground">{topMes.name}</p>
                  <p className="text-xs font-black text-indigo-600">Q{topMes.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ESTADÍSTICA DE MONEDAS Y RENDIMIENTO MENSUAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-muted/60 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/5 border-b pb-4 p-4">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-500" />
              <div>
                <CardTitle className="text-sm sm:text-base font-bold">Rendimiento de Monedas</CardTitle>
                <CardDescription className="text-[10px]">Venta neta diaria (Últimos 7 días)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:pt-6">
            <div className="h-[200px] sm:h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataSemanal}>
                  <XAxis dataKey="label" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} className="font-bold" />
                  <YAxis stroke="#888888" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `Q${v}`} className="font-mono" />
                  <RechartsTooltip 
                    cursor={{fill: 'rgba(0,0,0,0.05)'}}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg shadow-xl p-2 space-y-1 font-body">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase border-b pb-1">{format(data.fecha, 'dd MMM', { locale: es })}</p>
                            <div className="flex justify-between gap-4 text-[10px] pt-1">
                              <span className="font-bold text-amber-600">Monedas:</span>
                              <span className="font-black">Q{(data.monedas || 0).toFixed(2)}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="monedas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted/60 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/5 border-b pb-4 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-sm sm:text-base font-bold">Rendimiento Mensual</CardTitle>
                  <CardDescription className="text-[10px]">Balance liquidado (Últimos 6 meses)</CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-primary" /><span className="text-[9px] font-bold text-muted-foreground">Efectivo</span></div>
                <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-chart-2" /><span className="text-[9px] font-bold text-muted-foreground">Tarjeta</span></div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:pt-6">
            <div className="h-[200px] sm:h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataMensual}>
                  <XAxis dataKey="label" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} className="font-bold" />
                  <YAxis stroke="#888888" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `Q${v}`} className="font-mono" />
                  <RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border rounded-lg shadow-xl p-2 space-y-1 font-body">
                          <p className="text-[10px] font-bold text-muted-foreground capitalize border-b pb-1">{format(data.fecha, 'MMMM yyyy', { locale: es })}</p>
                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between gap-4 text-[9px]">
                                <span className="font-medium text-muted-foreground">Efectivo:</span>
                                <span className="font-bold text-primary">Q{data.efectivo.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between gap-4 text-[9px]">
                                <span className="font-medium text-muted-foreground">Tarjeta:</span>
                                <span className="font-bold text-chart-2">Q{data.tarjeta.toFixed(2)}</span>
                            </div>
                            <Separator className="my-1" />
                            <div className="text-[10px] font-bold text-right text-foreground">Total: Q{(data.efectivo + data.tarjeta).toFixed(2)}</div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Bar dataKey="efectivo" stackId="a" fill="hsl(var(--primary))" />
                  <Bar dataKey="tarjeta" stackId="a" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
