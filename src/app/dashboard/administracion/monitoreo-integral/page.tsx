
'use client';

import { useState, useMemo } from 'react';
import { collection, query, orderBy, doc, Timestamp, where, collectionGroup } from 'firebase/firestore';
import { useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import type { CierreCaja, Generales, Pago, HistorialInventario, HistorialTragamonedas } from '@/lib/tipos';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    MonitorCheck, 
    Clock, 
    Loader2, 
    PackageSearch, 
    Coins,
    Banknote
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useSucursal } from '@/hooks/use-sucursal';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Subcomponentes modulares
import { FlujoGaveta } from './_components/flujo-gaveta';
import { FlujoMonedas } from './_components/flujo-monedas';
import { KardexInventario } from './_components/kardex-inventario';

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

export default function PaginaMonitoreoIntegral() {
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
                fin: null, // Indicar que no hay fin para permitir tiempo real
                esTurnoAbierto: true,
                monedasIniciales: turnoActual.monedasTurnoAbierto || turnoActual.monedasIniciales || 0,
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
            monedasIniciales: cierre.snapshotMonedas?.existenciaAlInicio || cierre.snapshotMonedas?.existencia || 0,
            efectivoInicial: cierre.efectivoInicial || 0,
            efectivoAcumuladoMonedas: cierre.snapshotMonedas?.efectivoAcumulado || 0
        };
    }, [periodoId, turnoActual, cierres]);

    // 4. Consultas de movimientos filtradas por el período
    // CRÍTICO: Si fin es null (turno abierto), no incluimos el filtro superior para permitir actualizaciones en vivo
    const pagosQuery = useMemoFirebase(() => {
        if (!firestore || !sucursalId || !configPeriodo) return null;
        const baseRef = collection(firestore, `sucursales/${sucursalId}/pagos`);
        if (configPeriodo.fin) {
            return query(
                baseRef,
                where('fecha', '>=', configPeriodo.inicio),
                where('fecha', '<=', configPeriodo.fin),
                orderBy('fecha', 'asc')
            );
        }
        return query(
            baseRef,
            where('fecha', '>=', configPeriodo.inicio),
            orderBy('fecha', 'asc')
        );
    }, [firestore, sucursalId, configPeriodo]);
    const { data: pagos, isLoading: isLoadingPagos } = useCollection<Pago>(pagosQuery);

    const inventarioQuery = useMemoFirebase(() => {
        if (!firestore || !sucursalId || !configPeriodo) return null;
        const baseRef = collection(firestore, `sucursales/${sucursalId}/historial_inventario`);
        if (configPeriodo.fin) {
            return query(
                baseRef,
                where('fecha', '>=', configPeriodo.inicio),
                where('fecha', '<=', configPeriodo.fin),
                orderBy('fecha', 'asc')
            );
        }
        return query(
            baseRef,
            where('fecha', '>=', configPeriodo.inicio),
            orderBy('fecha', 'asc')
        );
    }, [firestore, sucursalId, configPeriodo]);
    const { data: inventario, isLoading: isLoadingInventario } = useCollection<HistorialInventario>(inventarioQuery);

    const tragamonedasQuery = useMemoFirebase(() => {
        if (!firestore || !sucursalId || !configPeriodo) return null;
        const baseRef = collectionGroup(firestore, 'historial');
        if (configPeriodo.fin) {
            return query(
                baseRef,
                where('sucursalId', '==', sucursalId),
                where('fecha', '>=', configPeriodo.inicio),
                where('fecha', '<=', configPeriodo.fin),
                orderBy('fecha', 'asc')
            );
        }
        return query(
            baseRef,
            where('sucursalId', '==', sucursalId),
            where('fecha', '>=', configPeriodo.inicio),
            orderBy('fecha', 'asc')
        );
    }, [firestore, sucursalId, configPeriodo]);
    const { data: movTraga, isLoading: isLoadingTraga } = useCollection<HistorialTragamonedas>(tragamonedasQuery);

    // --- CÁLCULOS ---

    const resumenGaveta = useMemo(() => {
        const stats = { 
            inicial: configPeriodo?.efectivoInicial || 0, 
            ventas: 0, 
            alquileres: 0, 
            totalGaveta: 0 
        };
        if (!pagos || !configPeriodo) {
            stats.totalGaveta = stats.inicial;
            return stats;
        }

        pagos.forEach(p => {
            if (p.metodoPago !== 'Efectivo') return;
            p.itemsSaldados.forEach(item => {
                if (item.esVirtual) return;

                const name = (item.nombreProducto || '').toLowerCase();
                const id = (item.idProducto || '').toLowerCase();
                
                const esAlquiler = name.includes('mesa #') || 
                                  name.includes('consola #') || 
                                  id.startsWith('mesa-') || 
                                  id.startsWith('division-mesa-') || 
                                  id.startsWith('mesa-ajuste-');

                if (esAlquiler) {
                    stats.alquileres += item.montoAplicado;
                } else {
                    stats.ventas += item.montoAplicado;
                }
            });
        });

        stats.totalGaveta = stats.inicial + stats.ventas + stats.alquileres;
        return stats;
    }, [pagos, configPeriodo]);

    const flujoGavetaList = useMemo(() => {
        if (!pagos || !configPeriodo) return [];
        let saldo = configPeriodo.efectivoInicial;
        return pagos.map(p => {
            const monto = p.itemsSaldados.filter(i => !i.esVirtual).reduce((acc, i) => acc + i.montoAplicado, 0);
            if (monto > 0) saldo += monto;
            return { ...p, montoConsumo: monto, saldoAcumulado: saldo };
        }).filter(p => p.montoConsumo > 0);
    }, [pagos, configPeriodo]);

    const flujoMonedasObj = useMemo(() => {
        if (!configPeriodo) return { lista: [], ventaNetaPeriodo: 0 };
        const lista: any[] = [];
        let stock = configPeriodo.monedasIniciales;
        let cash = 0; 
        let ventaNetaPeriodo = 0;

        const ventas = (pagos || []).map(p => {
            const m = p.itemsSaldados.filter(i => i.esVirtual).reduce((acc, i) => acc + i.montoAplicado, 0);
            const cant = p.itemsSaldados.filter(i => i.esVirtual).reduce((acc, i) => acc + (i.cantidad || 0), 0);
            return m > 0 ? { tipo: 'venta', fecha: p.fecha, monto: m, cantidad: cant, desc: `Venta De Monedas (Venta #${p.idVenta})`, ref: p.clienteNombre } : null;
        }).filter(Boolean);

        const tragamonedasMovs = (movTraga || []).map(p => {
            if (p.tipo.startsWith('premio')) {
                return { tipo: 'premio', fecha: p.fecha, monto: -p.monto, cantidad: p.monto, desc: p.descripcion, ref: 'Tragamonedas' };
            }
            if (p.tipo === 'base') {
                return { tipo: 'base', fecha: p.fecha, monto: 0, cantidad: p.monto, desc: 'Envío De Base A Máquina', ref: 'Tragamonedas' };
            }
            if (p.tipo === 'extraccion') {
                return { tipo: 'extraccion', fecha: p.fecha, monto: 0, cantidad: p.monto, desc: 'Extracción De Máquina', ref: 'Tragamonedas' };
            }
            return null;
        }).filter(Boolean);

        const consolidado = [...ventas, ...tragamonedasMovs].sort((a,b) => toDate(a.fecha).getTime() - toDate(b.fecha).getTime());

        consolidado.forEach(mov => {
            if (mov.tipo === 'venta') {
                cash += mov.monto;
                stock -= mov.cantidad;
                ventaNetaPeriodo += mov.monto;
            } else if (mov.tipo === 'premio') {
                cash += mov.monto; 
                stock += mov.cantidad;
                ventaNetaPeriodo += mov.monto;
            } else if (mov.tipo === 'base') {
                stock -= mov.cantidad;
            } else if (mov.tipo === 'extraccion') {
                stock += mov.cantidad;
            }
            lista.push({ ...mov, stockAcumulado: stock, cashAcumulado: cash });
        });

        return { lista, ventaNetaPeriodo };
    }, [pagos, movTraga, configPeriodo]);

    const isLoading = isLoadingSucursal || isLoadingTurno;

    if (isLoading) {
        return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>;
    }

    if (!configPeriodo) return null;

    return (
        <div className="space-y-6 font-body max-w-6xl mx-auto">
            {/* ENCABEZADO Y SELECTOR */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="flex flex-col w-full">
                    <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2 text-foreground">
                        <MonitorCheck className="h-6 w-6 text-primary" />
                        Monitoreo Integral Del Período
                    </h1>
                    <p className="text-sm text-muted-foreground hidden sm:block font-body">Auditoría detallada de efectivo, monedas e inventario por turno operativo.</p>
                </div>

                <div className="w-full md:max-w-xs space-y-1.5 shrink-0">
                    <Label className="text-[10px] font-bold text-muted-foreground ml-1 font-body uppercase tracking-widest">Seleccionar Turno</Label>
                    <Select value={periodoId} onValueChange={setPeriodoId}>
                        <SelectTrigger className="rounded-full h-11 border-muted-foreground/20 bg-card shadow-sm">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                <SelectValue placeholder="Cargando períodos..." />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="font-body max-h-[300px]">
                            <SelectItem value="actual" className="font-bold text-primary">Turno Actual (Abierto)</SelectItem>
                            <Separator className="my-1" />
                            {cierres?.map(c => (
                                <SelectItem key={c.id} value={c.id} className="text-xs">
                                    Turno #{c.idCuadre} — {format(toDate(c.fecha), "dd/MM/yy HH:mm", { locale: es })}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <Card className="bg-card rounded-lg border shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Tabs defaultValue="monedas" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 h-14 p-1.5 bg-muted/20 rounded-none border-b border-muted-foreground/10">
                            <TabsTrigger 
                                value="gaveta" 
                                className="font-bold text-xs sm:text-sm gap-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                            >
                                <Banknote className="h-4 w-4" /> Flujo De Gaveta
                            </TabsTrigger>
                            <TabsTrigger 
                                value="monedas" 
                                className="font-bold text-xs sm:text-sm gap-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                            >
                                <Coins className="h-4 w-4" /> Flujo De Monedas
                            </TabsTrigger>
                            <TabsTrigger 
                                value="inventario" 
                                className="font-bold text-xs sm:text-sm gap-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                            >
                                <PackageSearch className="h-4 w-4" /> Kardex Inventario
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="gaveta" className="p-4 sm:p-6">
                            <FlujoGaveta 
                                resumen={resumenGaveta} 
                                flujo={flujoGavetaList} 
                                inicioPeriodo={configPeriodo.inicio} 
                            />
                        </TabsContent>

                        <TabsContent value="monedas" className="p-4 sm:p-6">
                            <FlujoMonedas 
                                lista={flujoMonedasObj.lista} 
                                ventaNetaPeriodo={flujoMonedasObj.ventaNetaPeriodo} 
                                monedasIniciales={configPeriodo.monedasIniciales} 
                                efectivoAcumuladoMonedas={0} 
                                inicioPeriodo={configPeriodo.inicio} 
                                isLoading={isLoadingTraga || isLoadingPagos} 
                            />
                        </TabsContent>

                        <TabsContent value="inventario" className="p-0">
                            <KardexInventario 
                                inventario={inventario} 
                                isLoading={isLoadingInventario} 
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
