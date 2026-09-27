'use client';

import { useState, useMemo } from 'react';
import { collection, query, orderBy, doc, Timestamp, where } from 'firebase/firestore';
import { useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import type { CierreCaja, Generales, Pago, HistorialInventario } from '@/lib/tipos';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
    Timer
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useSucursal } from '@/hooks/use-sucursal';
import { ScrollArea } from '@/components/ui/scroll-area';

// Importación de componentes refactorizados
import { ListaPagos } from './_components/lista-pagos';
import { ListaInventario } from './_components/lista-inventario';
import { ListaTiempos } from './_components/lista-tiempos';

const toDate = (fecha: any): Date => {
  if (fecha instanceof Timestamp) return fecha.toDate();
  if (fecha instanceof Date) return fecha;
  if (typeof fecha === 'string') {
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(0);
};

export default function PaginaMonitoreoPeriodo() {
    const { firestore } = useFirebase();
    const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
    
    const [periodoSeleccionadoId, setPeriodoSeleccionadoId] = useState<string>('actual');

    // 1. Obtener cierres de caja (períodos pasados)
    const cierresQuery = useMemoFirebase(() => {
        if (!firestore || !sucursalId) return null;
        return query(collection(firestore, `sucursales/${sucursalId}/cierre_caja`), orderBy('fecha', 'desc'));
    }, [firestore, sucursalId]);
    const { data: cierres, isLoading: isLoadingCierres } = useCollection<CierreCaja>(cierresQuery);

    // 2. Obtener turno actual para definir rango
    const generalesRef = useMemoFirebase(() => 
        firestore && sucursalId ? doc(firestore, `sucursales/${sucursalId}/generales/actual`) : null
    , [firestore, sucursalId]);
    const { data: turnoActual, isLoading: isLoadingTurnoActual } = useDoc<Generales>(generalesRef);

    // 3. Definir el rango de tiempo del período seleccionado
    const periodoActualConfig = useMemo(() => {
        if (periodoSeleccionadoId === 'actual') {
            if (!turnoActual) return null;
            return {
                label: 'Turno abierto',
                inicio: toDate(turnoActual.fechaInicioPeriodo),
                fin: new Date(),
                esTurnoAbierto: true,
                totalLiquidado: 0,
                snapshotMonedas: null
            };
        }
        const cierre = cierres?.find(c => c.id === periodoSeleccionadoId);
        if (!cierre) return null;
        return {
            label: `Turno #${cierre.idCuadre}`,
            inicio: toDate(cierre.inicioDelPeriodo),
            fin: toDate(cierre.fecha),
            esTurnoAbierto: false,
            totalLiquidado: cierre.totalLiquidado,
            snapshotMonedas: cierre.snapshotMonedas
        };
    }, [periodoSeleccionadoId, turnoActual, cierres]);

    // 4. Consultar datos filtrados por el rango del período
    const pagosQuery = useMemoFirebase(() => {
        if (!firestore || !sucursalId || !periodoActualConfig) return null;
        return query(
            collection(firestore, `sucursales/${sucursalId}/pagos`),
            where('fecha', '>=', periodoActualConfig.inicio),
            where('fecha', '<=', periodoActualConfig.fin),
            orderBy('fecha', 'desc')
        );
    }, [firestore, sucursalId, periodoActualConfig]);
    const { data: pagos, isLoading: isLoadingPagos } = useCollection<Pago>(pagosQuery);

    const inventarioQuery = useMemoFirebase(() => {
        if (!firestore || !sucursalId || !periodoActualConfig) return null;
        return query(
            collection(firestore, `sucursales/${sucursalId}/historial_inventario`),
            where('fecha', '>=', periodoActualConfig.inicio),
            where('fecha', '<=', periodoActualConfig.fin),
            orderBy('fecha', 'desc')
        );
    }, [firestore, sucursalId, periodoActualConfig]);
    const { data: inventario, isLoading: isLoadingInventario } = useCollection<HistorialInventario>(inventarioQuery);

    const isLoading = isLoadingSucursal || isLoadingCierres || isLoadingTurnoActual;

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 font-body">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className='flex flex-col w-full text-center sm:text-left'>
                    <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2 text-foreground">
                        <MonitorCheck className="h-6 w-6 text-primary" />
                        Monitoreo por período
                    </h1>
                    <p className="text-xs text-muted-foreground hidden sm:block font-body">
                        Auditoría detallada de operaciones por turnos de caja.
                    </p>
                </div>
            </div>

            <Card className="overflow-hidden border border-border bg-card-foreground/5 rounded-lg shadow-sm">
                <CardHeader className="bg-muted/10 p-4 sm:p-6 pb-6 border-b border-border/60">
                    <div className="space-y-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="selector-periodo" className="text-xs font-medium text-muted-foreground ml-1">Seleccionar período</Label>
                            <Select value={periodoSeleccionadoId} onValueChange={setPeriodoSeleccionadoId}>
                                <SelectTrigger id="selector-periodo" className="h-10 rounded-full font-semibold text-primary border-input">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <SelectValue placeholder="Cargando turnos..." />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl font-body">
                                    <SelectItem value="actual" className="font-semibold text-emerald-600">
                                        Turno abierto (actual)
                                    </SelectItem>
                                    {(cierres || []).map(c => (
                                        <SelectItem key={c.id} value={c.id} className="font-medium">
                                            Turno #{c.idCuadre} — {format(toDate(c.fecha), "dd/MM/yy hh:mm a")}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {periodoActualConfig && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1 p-2.5 rounded-lg bg-card-foreground/5 border border-border/60 shadow-sm transition-all">
                                    <p className="text-[10px] font-medium text-muted-foreground text-left font-body">Apertura del período</p>
                                    <p className="text-xs sm:text-sm font-bold truncate flex items-center gap-2 text-foreground font-body">
                                        <CalendarDays className="h-3.5 w-3.5 text-primary shrink-0" />
                                        {format(periodoActualConfig.inicio, "dd/MM/yy, hh:mm a", { locale: es })}
                                    </p>
                                </div>
                                <div className="space-y-1 p-2.5 rounded-lg bg-card-foreground/5 border border-border/60 shadow-sm transition-all">
                                    <p className="text-[10px] font-medium text-muted-foreground text-left font-body">
                                        {periodoActualConfig.esTurnoAbierto ? 'Estado actual' : 'Cierre del período'}
                                    </p>
                                    {periodoActualConfig.esTurnoAbierto ? (
                                        <div className="flex">
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 font-bold text-[10px] h-5 px-2.5 leading-none">Abierto</Badge>
                                        </div>
                                    ) : (
                                        <p className="text-xs sm:text-sm font-bold truncate flex items-center gap-2 text-foreground font-body">
                                            <CalendarDays className="h-3.5 w-3.5 text-primary shrink-0" />
                                            {format(periodoActualConfig.fin, "dd/MM/yy, hh:mm a", { locale: es })}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <Tabs defaultValue="ventas" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 rounded-none border-b border-border/60 bg-muted/30 h-11 p-0">
                            <TabsTrigger 
                                value="ventas" 
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full gap-1.5 font-bold text-xs sm:text-sm text-muted-foreground data-[state=active]:text-foreground font-body"
                            >
                                <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="truncate">Ventas y pagos</span>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="tiempos" 
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full gap-1.5 font-bold text-xs sm:text-sm text-muted-foreground data-[state=active]:text-foreground font-body"
                            >
                                <Timer className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="truncate">Tiempos de juego</span>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="inventario" 
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full gap-1.5 font-bold text-xs sm:text-sm text-muted-foreground data-[state=active]:text-foreground font-body"
                            >
                                <PackageSearch className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="truncate">Mov. inventario</span>
                            </TabsTrigger>
                        </TabsList>

                        <ScrollArea className="h-[65vh]">
                            <div className="p-3 sm:p-6">
                                <TabsContent value="ventas" className="mt-0 outline-none">
                                    <ListaPagos pagos={pagos || []} isLoading={isLoadingPagos} />
                                </TabsContent>
                                <TabsContent value="tiempos" className="mt-0 outline-none">
                                    <ListaTiempos pagos={pagos || []} isLoading={isLoadingPagos} />
                                </TabsContent>
                                <TabsContent value="inventario" className="mt-0 outline-none">
                                    <ListaInventario 
                                        movimientos={inventario || []} 
                                        isLoading={isLoadingInventario} 
                                        snapshotMonedas={periodoActualConfig?.snapshotMonedas}
                                    />
                                </TabsContent>
                            </div>
                        </ScrollArea>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
