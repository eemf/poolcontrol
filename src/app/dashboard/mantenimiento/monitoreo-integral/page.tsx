'use client';

import { useState, useMemo } from 'react';
import { collection, query, orderBy, doc, Timestamp, where, collectionGroup } from 'firebase/firestore';
import { useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import type { CierreCaja, Generales, Pago, HistorialInventario, HistorialTragamonedas } from '@/lib/tipos';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
    MonitorCheck, 
    Clock, 
    ShoppingBag, 
    PackageSearch, 
    Loader2, 
    CalendarDays, 
    Coins,
    Banknote,
    ShoppingCart,
    Trophy,
    History,
    ArrowRight
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useSucursal } from '@/hooks/use-sucursal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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

export default function PaginaMonitoreoIntegralFuncional() {
    const { firestore } = useFirebase();
    const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
    
    const [periodoId, setPeriodoId] = useState<string>('actual');

    // 1. Obtener cierres pasados para el selector
    const cierresQuery = useMemoFirebase(() => {
        if (!firestore || !sucursalId) return null;
        return query(collection(firestore, `sucursales/${sucursalId}/cierre_caja`), orderBy('fecha', 'desc'));
    }, [firestore, sucursalId]);
    const { data: cierres } = useCollection<CierreCaja>(cierresQuery);

    // 2. Obtener estado de caja actual
    const generalesRef = useMemoFirebase(() => 
        firestore && sucursalId ? doc(firestore, `sucursales/${sucursalId}/generales/actual`) : null
    , [firestore, sucursalId]);
    const { data: turnoActual, isLoading: isLoadingTurno } = useDoc<Generales>(generalesRef);

    // 3. Configuración del rango del período seleccionado
    const configPeriodo = useMemo(() => {
        if (periodoId === 'actual') {
            if (!turnoActual) return null;
            return {
                label: 'Turno Actual',
                inicio: toDate(turnoActual.fechaInicioPeriodo),
                fin: new Date(),
                esTurnoAbierto: true,
                monedasIniciales: turnoActual.monedasIniciales || 0,
                efectivoInicial: turnoActual.efectivoInicial || 0,
                efectivoAcumuladoMonedas: turnoActual.efectivoAcumuladoMonedas || 0
            };
        }
        const cierre = cierres?.find(c => c.id === periodoId);
        if (!cierre) return null;
        return {
            label: `Turno #${cierre.idCuadre}`,
            inicio: toDate(cierre.inicioDelPeriodo),
            fin: toDate(cierre.fecha),
            esTurnoAbierto: false,
            monedasIniciales: cierre.snapshotMonedas?.existencia || 0,
            efectivoInicial: cierre.efectivoInicial || 0,
            efectivoAcumuladoMonedas: cierre.snapshotMonedas?.efectivoAcumulado || 0
        };
    }, [periodoId, turnoActual, cierres]);

    // 4. Consultas de movimientos filtradas por el período
    const pagosQuery = useMemoFirebase(() => {
        if (!firestore || !sucursalId || !configPeriodo) return null;
        return query(
            collection(firestore, `sucursales/${sucursalId}/pagos`),
            where('fecha', '>=', configPeriodo.inicio),
            where('fecha', '<=', configPeriodo.fin),
            orderBy('fecha', 'asc')
        );
    }, [firestore, sucursalId, configPeriodo]);
    const { data: pagos, isLoading: isLoadingPagos } = useCollection<Pago>(pagosQuery);

    const inventarioQuery = useMemoFirebase(() => {
        if (!firestore || !sucursalId || !configPeriodo) return null;
        return query(
            collection(firestore, `sucursales/${sucursalId}/historial_inventario`),
            where('fecha', '>=', configPeriodo.inicio),
            where('fecha', '<=', configPeriodo.fin),
            orderBy('fecha', 'asc')
        );
    }, [firestore, sucursalId, configPeriodo]);
    const { data: inventario, isLoading: isLoadingInventario } = useCollection<HistorialInventario>(inventarioQuery);

    const tragamonedasQuery = useMemoFirebase(() => {
        if (!firestore || !sucursalId || !configPeriodo) return null;
        return query(
            collectionGroup(firestore, 'historial'),
            where('sucursalId', '==', sucursalId),
            where('fecha', '>=', configPeriodo.inicio),
            where('fecha', '<=', configPeriodo.fin),
            orderBy('fecha', 'asc')
        );
    }, [firestore, sucursalId, configPeriodo]);
    const { data: movTraga, isLoading: isLoadingTraga } = useCollection<HistorialTragamonedas>(tragamonedasQuery);

    // --- CÁLCULOS DE FLUJO ---

    const flujoGaveta = useMemo(() => {
        if (!pagos || !configPeriodo) return [];
        let saldo = configPeriodo.efectivoInicial;
        return pagos.map(p => {
            const monto = p.itemsSaldados.filter(i => !i.esVirtual).reduce((acc, i) => acc + i.montoAplicado, 0);
            if (monto > 0) saldo += monto;
            return { ...p, montoConsumo: monto, saldoAcumulado: saldo };
        }).filter(p => p.montoConsumo > 0);
    }, [pagos, configPeriodo]);

    const flujoMonedas = useMemo(() => {
        if (!configPeriodo) return [];
        const lista: any[] = [];
        let stock = configPeriodo.monedasIniciales;
        let cash = configPeriodo.efectivoAcumuladoMonedas;

        // Mezclar ventas de monedas y premios
        const ventas = (pagos || []).map(p => {
            const m = p.itemsSaldados.filter(i => i.esVirtual).reduce((acc, i) => acc + i.montoAplicado, 0);
            const cant = p.itemsSaldados.filter(i => i.esVirtual).reduce((acc, i) => acc + (i.cantidad || 0), 0);
            return m > 0 ? { tipo: 'venta', fecha: p.fecha, monto: m, cantidad: cant, desc: `Venta de Monedas (Venta #${p.idVenta})`, ref: p.clienteNombre } : null;
        }).filter(Boolean);

        const premios = (movTraga || []).filter(m => m.tipo.startsWith('premio')).map(p => ({
            tipo: 'premio', fecha: p.fecha, monto: -p.monto, cantidad: p.monto, desc: p.descripcion, ref: 'Tragamonedas'
        }));

        const consolidado = [...ventas, ...premios].sort((a,b) => toDate(a.fecha).getTime() - toDate(b.fecha).getTime());

        consolidado.forEach(mov => {
            if (mov.tipo === 'venta') {
                cash += mov.monto;
                stock -= mov.cantidad;
            } else {
                cash += mov.monto; // El monto ya viene negativo
                stock += mov.cantidad;
            }
            lista.push({ ...mov, stockAcumulado: stock, cashAcumulado: cash });
        });

        return lista;
    }, [pagos, movTraga, configPeriodo]);

    const isLoading = isLoadingSucursal || isLoadingTurno;

    if (isLoading) {
        return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
    }

    return (
        <div className="space-y-6 font-body">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-full text-center sm:text-left">
                    <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2 text-foreground">
                        <MonitorCheck className="h-6 w-6 text-primary" />
                        Monitoreo Integral del Período
                    </h1>
                    <p className="text-sm text-muted-foreground hidden sm:block">Auditoría detallada de efectivo, monedas e inventario por turno.</p>
                </div>
            </div>

            {/* SELECTOR DE PERÍODO */}
            <Card className="border-muted/60 shadow-sm overflow-hidden rounded-2xl">
                <CardHeader className="bg-muted/5 p-4 sm:p-6 border-b">
                    <div className="flex flex-col md:flex-row gap-5 items-end">
                        <div className="w-full md:max-w-xs space-y-1.5">
                            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Seleccionar Turno</Label>
                            <Select value={periodoId} onValueChange={setPeriodoId}>
                                <SelectTrigger className="rounded-full h-11 border-muted-foreground/20 bg-background">
                                    <Clock className="mr-2 h-4 w-4 text-primary" />
                                    <SelectValue placeholder="Cargando períodos..." />
                                </SelectTrigger>
                                <SelectContent className="font-body max-h-[300px]">
                                    <SelectItem value="actual" className="font-bold text-primary">Turno Actual (Abierto)</SelectItem>
                                    <Separator className="my-1" />
                                    {cierres?.map(c => (
                                        <SelectItem key={c.id} value={c.id} className="text-xs">
                                            Turno #{c.idCuadre} — {format(toDate(c.fecha), "dd/MM/yy HH:mm")}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {configPeriodo && (
                            <div className="flex-1 grid grid-cols-2 gap-4">
                                <div className="p-2.5 rounded-xl bg-card border border-muted/60">
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Apertura</p>
                                    <p className="text-xs font-bold truncate flex items-center gap-1.5 mt-0.5">
                                        <CalendarDays className="h-3 w-3 text-primary" />
                                        {format(configPeriodo.inicio, "dd MMM, hh:mm a", { locale: es })}
                                    </p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-card border border-muted/60">
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Estado</p>
                                    {configPeriodo.esTurnoAbierto ? (
                                        <Badge className="bg-emerald-500 text-white border-none font-bold text-[9px] h-5 rounded-full px-2.5 mt-0.5">Activo</Badge>
                                    ) : (
                                        <p className="text-xs font-bold truncate flex items-center gap-1.5 mt-0.5">
                                            <CalendarDays className="h-3 w-3 text-primary" />
                                            {format(configPeriodo.fin, "dd MMM, hh:mm a", { locale: es })}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <Tabs defaultValue="monedas" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-muted/20 rounded-none border-b">
                            <TabsTrigger value="gaveta" className="font-bold text-xs gap-2 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary">
                                <Banknote className="h-4 w-4" /> Flujo de Gaveta
                            </TabsTrigger>
                            <TabsTrigger value="monedas" className="font-bold text-xs gap-2 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary">
                                <Coins className="h-4 w-4" /> Flujo de Monedas
                            </TabsTrigger>
                            <TabsTrigger value="inventario" className="font-bold text-xs gap-2 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary">
                                <PackageSearch className="h-4 w-4" /> Kardex Inventario
                            </TabsTrigger>
                        </TabsList>

                        {/* FLUJO DE MONEDAS (Propuesta Principal) */}
                        <TabsContent value="monedas" className="p-4 sm:p-8 space-y-8 outline-none animate-in fade-in duration-500">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Card className="bg-primary/5 border-primary/20 rounded-2xl shadow-sm">
                                    <div className="p-4">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Existencia Inicial</p>
                                        <p className="text-4xl font-black font-headline mt-1">{configPeriodo?.monedasIniciales}</p>
                                    </div>
                                </Card>
                                <Card className="bg-emerald-50 border-emerald-200 rounded-2xl shadow-sm">
                                    <div className="p-4">
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Efectivo Neto Monedas</p>
                                        <p className="text-4xl font-black text-emerald-600 font-headline mt-1">Q{flujoMonedas.length > 0 ? flujoMonedas[flujoMonedas.length - 1].cashAcumulado.toFixed(2) : '0.00'}</p>
                                    </div>
                                </Card>
                                <Card className="bg-muted/10 border-muted/60 rounded-2xl shadow-sm">
                                    <div className="p-4">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Existencia Actual</p>
                                        <p className="text-4xl font-black font-headline mt-1">{flujoMonedas.length > 0 ? flujoMonedas[flujoMonedas.length - 1].stockAcumulado : configPeriodo?.monedasIniciales}</p>
                                    </div>
                                </Card>
                            </div>

                            <Card className="border-muted/60 overflow-hidden shadow-md rounded-2xl bg-card">
                                <div className="bg-muted/5 p-4 border-b text-[10px] font-black tracking-widest text-muted-foreground grid grid-cols-12 gap-4 uppercase">
                                    <div className="col-span-5">Movimiento / Detalle</div>
                                    <div className="col-span-2 text-center">Efectivo (Q)</div>
                                    <div className="col-span-3 text-center">Existencia</div>
                                    <div className="col-span-2 text-right">Hora</div>
                                </div>
                                <ScrollArea className="h-[400px]">
                                    <div className="divide-y">
                                        {/* Fila de Apertura */}
                                        <div className="grid grid-cols-12 gap-4 p-5 items-center bg-primary/[0.04]">
                                            <div className="col-span-5">
                                                <p className="font-black text-sm text-primary font-headline">Apertura del Período</p>
                                                <p className="text-[10px] font-bold text-muted-foreground">Estado inicial tras el último cuadre de máquinas</p>
                                            </div>
                                            <div className="col-span-2 text-center">
                                                <span className="font-bold text-xs text-muted-foreground">Q{configPeriodo?.efectivoAcumuladoMonedas.toFixed(2)}</span>
                                            </div>
                                            <div className="col-span-3 text-center">
                                                <p className="font-black text-primary text-lg tabular-nums">{configPeriodo?.monedasIniciales}</p>
                                            </div>
                                            <div className="col-span-2 text-right">
                                                <span className="text-[10px] font-bold text-muted-foreground">{format(configPeriodo!.inicio, "hh:mm a")}</span>
                                            </div>
                                        </div>

                                        {isLoadingTraga || isLoadingPagos ? (
                                            <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                                        ) : flujoMonedas.length === 0 ? (
                                            <div className="p-20 text-center text-muted-foreground italic text-sm">No se registraron ventas ni premios en este lapso.</div>
                                        ) : (
                                            flujoMonedas.map((mov, idx) => (
                                                <div key={idx} className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-muted/5 transition-colors">
                                                    <div className="col-span-5 flex items-center gap-3">
                                                        <div className={cn(
                                                            "h-10 w-10 rounded-2xl flex items-center justify-center shrink-0",
                                                            mov.tipo === 'venta' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                                                        )}>
                                                            {mov.tipo === 'venta' ? <ShoppingCart className="h-5 w-5"/> : <Trophy className="h-5 w-5"/>}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-sm truncate">{mov.desc}</p>
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight truncate">{mov.ref}</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2 text-center">
                                                        <p className={cn("text-sm font-black tabular-nums", mov.monto > 0 ? "text-emerald-600" : "text-destructive")}>
                                                            {mov.monto > 0 ? '+' : ''}{mov.monto.toFixed(2)}
                                                        </p>
                                                        <p className="text-[9px] font-bold text-muted-foreground/60 tabular-nums">Saldo: Q{mov.cashAcumulado.toFixed(2)}</p>
                                                    </div>
                                                    <div className="col-span-3 text-center">
                                                        <p className={cn("text-sm font-black tabular-nums", mov.tipo === 'venta' ? "text-destructive" : "text-emerald-600")}>
                                                            {mov.tipo === 'venta' ? '-' : '+'}{mov.cantidad}
                                                        </p>
                                                        <p className="text-[9px] font-bold text-muted-foreground/60 tabular-nums">Stock: {mov.stockAcumulado}</p>
                                                    </div>
                                                    <div className="col-span-2 text-right">
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{format(toDate(mov.fecha), "hh:mm a")}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>
                            </Card>
                        </TabsContent>

                        {/* FLUJO DE GAVETA (Efectivo Consumo) */}
                        <TabsContent value="gaveta" className="p-4 sm:p-8 space-y-6 outline-none animate-in fade-in duration-500">
                             <div className="text-center p-6 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10">
                                <p className="text-[10px] font-black text-emerald-800/60 uppercase tracking-[0.3em] mb-2">Ingresos de Consumo / Alquiler</p>
                                <p className="text-5xl font-black text-emerald-600 font-headline tabular-nums">Q{flujoGaveta.length > 0 ? (flujoGaveta[flujoGaveta.length-1].saldoAcumulado - configPeriodo!.efectivoInicial).toFixed(2) : '0.00'}</p>
                            </div>

                            <Card className="border-muted/60 overflow-hidden shadow-md rounded-2xl">
                                <div className="bg-muted/5 p-4 border-b text-[10px] font-black tracking-widest text-muted-foreground grid grid-cols-12 gap-4 uppercase">
                                    <div className="col-span-6">Cliente / Detalle de Pago</div>
                                    <div className="col-span-3 text-center">Monto Recibido</div>
                                    <div className="col-span-3 text-right">Hora</div>
                                </div>
                                <ScrollArea className="h-[400px]">
                                    <div className="divide-y">
                                         <div className="grid grid-cols-12 gap-4 p-5 items-center bg-emerald-500/[0.04]">
                                            <div className="col-span-6">
                                                <p className="font-black text-sm text-emerald-600 font-headline">Fondo de Caja (Gaveta)</p>
                                                <p className="text-[10px] font-bold text-muted-foreground">Efectivo base al inicio del turno</p>
                                            </div>
                                            <div className="col-span-3 text-center">
                                                <p className="font-black text-emerald-600 text-lg tabular-nums">Q{configPeriodo?.efectivoInicial.toFixed(2)}</p>
                                            </div>
                                            <div className="col-span-3 text-right">
                                                <span className="text-[10px] font-bold text-muted-foreground">{format(configPeriodo!.inicio, "hh:mm a")}</span>
                                            </div>
                                        </div>

                                        {flujoGaveta.length === 0 ? (
                                             <div className="p-20 text-center text-muted-foreground italic text-sm">Sin cobros en efectivo registrados todavía.</div>
                                        ) : (
                                            flujoGaveta.map((pago, idx) => (
                                                <div key={idx} className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-muted/5 transition-colors">
                                                    <div className="col-span-6 flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                                            <Banknote className="h-5 w-5"/>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-sm truncate">{pago.clienteNombre}</p>
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight truncate">Pago #{pago.idPago} • Venta #{pago.idVenta}</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-3 text-center">
                                                        <p className="text-sm font-black text-emerald-600 tabular-nums">+ Q{pago.montoConsumo.toFixed(2)}</p>
                                                        <p className="text-[9px] font-bold text-muted-foreground/60 tabular-nums">Fondo: Q{pago.saldoAcumulado.toFixed(2)}</p>
                                                    </div>
                                                    <div className="col-span-3 text-right">
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{format(toDate(pago.fecha), "hh:mm a")}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>
                            </Card>
                        </TabsContent>

                        {/* KARDEX DE INVENTARIO */}
                        <TabsContent value="inventario" className="p-4 sm:p-8 space-y-6 outline-none animate-in fade-in duration-500">
                            <Card className="bg-primary/5 border-primary/10 rounded-3xl p-6 flex items-start gap-4">
                                <PackageSearch className="h-6 w-6 text-primary mt-1 shrink-0" />
                                <div>
                                    <h3 className="font-bold text-sm text-primary uppercase tracking-widest mb-1">Rastreo de Unidades Físicas</h3>
                                    <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                                        Este historial registra cada entrada y salida de productos que consumen stock real. A diferencia del flujo de efectivo, aquí auditamos la integridad física del inventario del local.
                                    </p>
                                </div>
                            </Card>

                            <Card className="border-muted/60 overflow-hidden shadow-sm rounded-2xl bg-card">
                                <div className="bg-muted/5 p-4 border-b text-[10px] font-black tracking-widest text-muted-foreground grid grid-cols-12 gap-4 uppercase">
                                    <div className="col-span-5">Producto / Evento</div>
                                    <div className="col-span-2 text-center">Entra</div>
                                    <div className="col-span-2 text-center">Sale</div>
                                    <div className="col-span-3 text-right">Saldo Final</div>
                                </div>
                                <ScrollArea className="h-[400px]">
                                    <div className="divide-y">
                                        {isLoadingInventario ? (
                                             <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                                        ) : !inventario || inventario.length === 0 ? (
                                            <div className="p-20 text-center text-muted-foreground italic text-sm">No hay movimientos de stock físico en este turno.</div>
                                        ) : (
                                            inventario.map((mov, idx) => (
                                                <div key={idx} className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-muted/5 transition-colors">
                                                    <div className="col-span-5 flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-2xl bg-muted/30 flex items-center justify-center text-primary/40">
                                                            <History className="h-5 w-5"/>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-xs truncate">{mov.nombreProducto}</p>
                                                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-tight truncate">{mov.tipoMovimiento} • {mov.referencia}</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2 text-center text-xs font-black text-emerald-600 tabular-nums">
                                                        {mov.cantidad > 0 ? `+${mov.cantidad}` : '--'}
                                                    </div>
                                                    <div className="col-span-2 text-center text-xs font-black text-destructive tabular-nums">
                                                        {mov.cantidad < 0 ? Math.abs(mov.cantidad) : '--'}
                                                    </div>
                                                    <div className="col-span-3 text-right flex flex-col items-end">
                                                        <span className="font-black text-sm text-primary tabular-nums">{mov.existenciaNueva}</span>
                                                        <span className="text-[8px] font-black text-muted-foreground uppercase opacity-40">Antes: {mov.existenciaAnterior}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
