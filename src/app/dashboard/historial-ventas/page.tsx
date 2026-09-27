
'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, doc, Timestamp, orderBy, where } from 'firebase/firestore';
import { useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import type { Pago, Generales, CierreCaja, Venta } from '@/lib/tipos';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { History, Search, Coins, CreditCard, Loader2, ChevronLeft, ChevronRight, CheckCircle2, ArrowLeft, Trash2, ArrowRightLeft, AlertTriangle, CalendarDays } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSucursal } from '@/hooks/use-sucursal';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { anularVentaCompleta, cambiarMetodoPago } from '@/lib/firebase/servicios/ventas-historial';
import { useToast } from '@/hooks/use-toast';
import { PermissionGuard } from '@/components/permission-guard';

type PagoConDocId = Pago & { id: string; turnoLabel?: string };

type VentaAgrupada = {
    ventaDocId: string;
    idVenta: number;
    clienteNombre: string;
    totalPagadoPeriodo: number;
    ultimoTurnoLabel?: string;
    pagos: PagoConDocId[];
    ventaOriginal?: Venta;
};

const toDate = (fecha: any): Date => {
  if (fecha instanceof Timestamp) return fecha.toDate();
  if (fecha instanceof Date) return fecha;
  if (typeof fecha === 'string') {
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(0);
};

export default function HistorialVentasPage() {
    const { firestore, user } = useFirebase();
    const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
    const { toast } = useToast();
    
    const [filtro, setFiltro] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [mostrarTodas, setMostrarTodas] = useState(false);

    // Estados para acciones
    const [ventaAAnular, setVentaAAnular] = useState<VentaAgrupada | null>(null);
    const [pagoACambiar, setPagoACambiar] = useState<{ pago: PagoConDocId, ventaDocId: string } | null>(null);
    const [procesandoAccion, setProcesandoAnulacion] = useState(false);
    const [procesandoCambioMetodo, setProcesandoCambioMetodo] = useState(false);
    
    const generalesRef = useMemoFirebase(() => 
        firestore && sucursalId ? doc(firestore, `sucursales/${sucursalId}/generales/actual`) : null, 
    [firestore, sucursalId]);
    const { data: estadoCaja, isLoading: cargandoEstadoCaja } = useDoc<Generales>(generalesRef);
    
    const fechaInicioPeriodo = useMemo(() => {
        if (!estadoCaja?.fechaInicioPeriodo) return null;
        return toDate(estadoCaja.fechaInicioPeriodo);
    }, [estadoCaja?.fechaInicioPeriodo]);

    const cierresQuery = useMemoFirebase(() => {
        if (!firestore || !sucursalId || !mostrarTodas) return null;
        return query(collection(firestore, `sucursales/${sucursalId}/cierre_caja`), orderBy('fecha', 'desc'));
    }, [firestore, sucursalId, mostrarTodas]);
    const { data: cierresData } = useCollection<CierreCaja>(cierresQuery);

    const pagosQuery = useMemoFirebase(() => {
        if (!firestore || !sucursalId) return null;
        
        const baseQuery = collection(firestore, `sucursales/${sucursalId}/pagos`);
        
        if (!mostrarTodas) {
            if (!fechaInicioPeriodo) return null;
            return query(
                baseQuery,
                where('fecha', '>=', Timestamp.fromDate(fechaInicioPeriodo)),
                orderBy('fecha', 'desc')
            );
        }
        
        return query(baseQuery, orderBy('fecha', 'desc'));
    }, [firestore, sucursalId, mostrarTodas, fechaInicioPeriodo]);
    const { data: pagosData, isLoading: cargandoPagos, error: errorPagos } = useCollection<Pago>(pagosQuery);

    // Estrategia para evitar índice compuesto or() - Dividir en consultas simples
    const ventasTurnoQuery = useMemoFirebase(() => {
        if (!firestore || !sucursalId || mostrarTodas || !fechaInicioPeriodo) return null;
        return query(
            collection(firestore, `sucursales/${sucursalId}/ventas`),
            where('fecha', '>=', Timestamp.fromDate(fechaInicioPeriodo))
        );
    }, [firestore, sucursalId, mostrarTodas, fechaInicioPeriodo]);

    const ventasCreditoQuery = useMemoFirebase(() => {
        if (!firestore || !sucursalId || mostrarTodas) return null;
        return query(
            collection(firestore, `sucursales/${sucursalId}/ventas`),
            where('estado', '==', 'credito')
        );
    }, [firestore, sucursalId, mostrarTodas]);

    const ventasTodasQuery = useMemoFirebase(() => {
        if (!firestore || !sucursalId || !mostrarTodas) return null;
        return query(collection(firestore, `sucursales/${sucursalId}/ventas`), orderBy('fecha', 'desc'));
    }, [firestore, sucursalId, mostrarTodas]);

    const { data: vTurno } = useCollection<Venta>(ventasTurnoQuery);
    const { data: vCredito } = useCollection<Venta>(ventasCreditoQuery);
    const { data: vTodas } = useCollection<Venta>(ventasTodasQuery);

    const ventasOriginales = useMemo(() => {
        if (mostrarTodas) return vTodas || [];
        if (!vTurno && !vCredito) return [];
        const merged = [...(vTurno || []), ...(vCredito || [])];
        // Eliminar duplicados por ID (una venta a crédito iniciada en este turno aparecería en ambos)
        const unique = Array.from(new Map(merged.map(v => [v.id, v])).values());
        return unique;
    }, [vTurno, vCredito, vTodas, mostrarTodas]);
    
    const ventasAgrupadas = useMemo((): VentaAgrupada[] => {
        if (!pagosData) return [];

        const groups = new Map<string, VentaAgrupada>();
        
        const pagosConTurno = pagosData.map(pago => {
            const fechaPago = toDate(pago.fecha);
            let turnoLabel = 'Anterior';

            if (fechaInicioPeriodo && fechaPago >= fechaInicioPeriodo) {
                turnoLabel = 'Turno actual';
            } else if (cierresData) {
                const cierreAsociado = cierresData.find(c => {
                    const fin = toDate(c.fecha);
                    const inicio = toDate(c.inicioDelPeriodo);
                    return fechaPago >= inicio && fechaPago <= fin;
                });
                if (cierreAsociado) {
                    turnoLabel = `Turno #${cierreAsociado.idCuadre}`;
                }
            }

            return { ...pago, id: (pago as any).id, turnoLabel } as PagoConDocId;
        });

        for (const pago of pagosConTurno) {
            if (!pago.ventaDocId) continue;

            const esTurnoActual = pago.turnoLabel === 'Turno actual';
            if (!mostrarTodas && !esTurnoActual) continue;

            if (!groups.has(pago.ventaDocId)) {
                groups.set(pago.ventaDocId, {
                    ventaDocId: pago.ventaDocId,
                    idVenta: pago.idVenta,
                    clienteNombre: pago.clienteNombre,
                    totalPagadoPeriodo: 0,
                    pagos: [],
                    ventaOriginal: ventasOriginales?.find(v => v.id === pago.ventaDocId)
                });
            }
            
            const group = groups.get(pago.ventaDocId)!;
            
            const passFiltro = !filtro || 
                (pago.clienteNombre || '').toLowerCase().includes(filtro.toLowerCase()) ||
                String(pago.idVenta).includes(filtro) ||
                String(pago.idPago).includes(filtro);

            if (passFiltro) {
                group.pagos.push(pago);
                group.totalPagadoPeriodo += (pago.montoTotalPagado || 0);
            }
        }
        
        let result = Array.from(groups.values()).filter(v => v.pagos.length > 0);

        result.forEach(venta => {
             venta.pagos.sort((a,b) => toDate(b.fecha).getTime() - toDate(a.fecha).getTime());
             venta.ultimoTurnoLabel = venta.pagos[0]?.turnoLabel;
        });
        
        result.sort((a,b) => {
            const fechaA = toDate(a.pagos[0]?.fecha);
            const fechaB = toDate(b.pagos[0]?.fecha);
            return fechaB.getTime() - fechaA.getTime();
        });
        
        return result;
    }, [pagosData, filtro, fechaInicioPeriodo, mostrarTodas, cierresData, ventasOriginales]);


    const totalPages = Math.ceil(ventasAgrupadas.length / itemsPerPage);

    const ventasPaginadas = useMemo(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return ventasAgrupadas.slice(startIndex, startIndex + itemsPerPage);
    }, [ventasAgrupadas, currentPage, itemsPerPage]);
  
    const handleNextPage = () => {
      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePreviousPage = () => {
      if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    useEffect(() => {
      setCurrentPage(1);
    }, [itemsPerPage, filtro, mostrarTodas]);

    // Handlers para acciones
    const confirmarAnulacion = async () => {
        if (!firestore || !sucursalId || !ventaAAnular || !user) return;
        setProcesandoAnulacion(true);
        try {
            await anularVentaCompleta(firestore, sucursalId, ventaAAnular.ventaDocId, user.uid);
            toast({ title: "Éxito", description: `La venta #${ventaAAnular.idVenta} ha sido anulada.` });
            setVentaAAnular(null);
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        } finally {
            setProcesandoAnulacion(false);
        }
    };

    const confirmarCambioMetodo = async () => {
        if (!firestore || !sucursalId || !pagoACambiar) return;
        const nuevoMetodo = pagoACambiar.pago.metodoPago === 'Efectivo' ? 'Tarjeta' : 'Efectivo';
        setProcesandoCambioMetodo(true);
        try {
            await cambiarMetodoPago(firestore, sucursalId, pagoACambiar.pago.id, nuevoMetodo);
            toast({ title: "Método actualizado", description: `Ahora es ${nuevoMetodo}.` });
            pagoACambiar.pago.metodoPago = nuevoMetodo; // Actualización local optimista
            setPagoACambiar(null);
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        } finally {
            setProcesandoCambioMetodo(false);
        }
    };

    const isLoading = isLoadingSucursal || cargandoPagos || (mostrarTodas ? false : cargandoEstadoCaja);

    if (errorPagos) {
        return <div className="text-center text-red-500 p-4 font-body">{errorPagos.message}</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className='flex flex-col w-full text-center sm:text-left'>
                    <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2 text-foreground">
                        <History className="h-6 w-6 text-primary"/>
                        Historial de ventas
                    </h1>
                    <p className="text-xs text-muted-foreground hidden sm:block font-body">
                        Consulta y administra el registro de cobros por turno.
                    </p>
                </div>
                <Button variant="outline" asChild className="rounded-full h-10 px-6 shrink-0 w-full sm:w-auto font-body">
                    <Link href="/dashboard/ventas">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Regresar
                    </Link>
                </Button>
            </div>

            <Card className="font-body border-border bg-card shadow-sm">
                <CardHeader className="p-4 pb-4">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative flex-1 w-full">
                            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                                type="search"
                                placeholder="Buscar por ID o cliente..."
                                className="w-full h-10 pl-9 rounded-full border-muted-foreground/20"
                                value={filtro}
                                onChange={(e) => setFiltro(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center justify-center gap-3 px-4 h-10 border rounded-full bg-background shrink-0 w-full sm:w-auto">
                            <span className={cn("text-[11px] font-bold transition-colors", !mostrarTodas ? "text-primary" : "text-muted-foreground")}>
                                Turno Actual
                            </span>
                            <Switch
                                id="mostrar-todos-switch"
                                checked={mostrarTodas}
                                onCheckedChange={setMostrarTodas}
                            />
                            <span className={cn("text-[11px] font-bold transition-colors", mostrarTodas ? "text-primary" : "text-muted-foreground")}>
                                Todos
                            </span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                    ) : ventasPaginadas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-lg border-muted-foreground/20">
                            <History className="h-12 w-12 mb-4 text-primary/30" />
                            <p className="font-semibold text-lg font-headline">
                                {filtro ? "No se encontraron resultados" : (mostrarTodas ? "No hay pagos registrados" : "No hay pagos en el turno actual")}
                            </p>
                            {!mostrarTodas && <p className='text-xs mt-2'>Prueba activando "Todos" para ver historial pasado.</p>}
                        </div>
                    ) : (
                        <Accordion type="single" collapsible className="w-full space-y-2">
                             {ventasPaginadas.map(venta => {
                                const { ventaDocId, idVenta, clienteNombre, totalPagadoPeriodo, pagos, ultimoTurnoLabel, ventaOriginal } = venta;
                                
                                const esConsumoInterno = ventaOriginal?.metodoPago === 'Consumo Interno';
                                const fueCredito = ventaOriginal?.estado === 'credito' || ventaOriginal?.fueCredito;
                                const pagoEnEfectivo = pagos.filter(p => p.metodoPago === 'Efectivo').reduce((sum, p) => sum + p.montoTotalPagado, 0);
                                const pagoEnTarjeta = pagos.filter(p => p.metodoPago === 'Tarjeta').reduce((sum, p) => sum + p.montoTotalPagado, 0);
                                const fechaUltimoPago = pagos[0]?.fecha;

                                return (
                                <AccordionItem value={ventaDocId} key={ventaDocId} className="border-border rounded-lg overflow-hidden border-b-0 bg-card-foreground/5 mb-2 border shadow-sm">
                                    <AccordionTrigger className="p-3 sm:p-4 hover:no-underline transition-colors data-[state=open]:border-b border-muted-foreground/10">
                                        <div className="flex flex-col w-full pr-2 sm:pr-4 gap-1">
                                            <div className="flex items-center justify-between w-full">
                                                <div className='flex items-center gap-2 min-0 flex-1 overflow-hidden'>
                                                    <span className="font-bold text-sm sm:text-lg leading-tight text-foreground truncate">{clienteNombre}</span>
                                                    {esConsumoInterno && (
                                                        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-none font-bold uppercase text-[9px] h-5 rounded-full px-2 shrink-0">
                                                            Consumo
                                                        </Badge>
                                                    )}
                                                    {fueCredito && (
                                                        <Badge variant="outline" className={cn(
                                                          "font-bold uppercase text-[9px] h-5 rounded-full px-2 shrink-0 border-none",
                                                          ventaOriginal?.estado === 'credito' 
                                                            ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400" 
                                                            : "bg-muted text-muted-foreground opacity-70"
                                                        )}>
                                                            {ventaOriginal?.estado === 'credito' ? 'Cuenta a Crédito' : 'Crédito Liquidado'}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0 ml-4">
                                                    <div className="text-right">
                                                        {esConsumoInterno ? (
                                                            <p className="text-base sm:text-xl font-bold text-primary leading-none">Q0.00</p>
                                                        ) : (
                                                            <p className="text-base sm:text-xl font-bold text-primary leading-none">Q{totalPagadoPeriodo.toFixed(2)}</p>
                                                        )}
                                                    </div>
                                                    <PermissionGuard permission="ventas.anular">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div 
                                                                        role="button"
                                                                        onClick={(e) => { e.stopPropagation(); setVentaAAnular(venta); }}
                                                                        className="h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-all cursor-pointer shrink-0"
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="left">
                                                                    <p className="text-xs font-bold font-body">Anular venta completa</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </PermissionGuard>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between w-full flex-wrap gap-y-1">
                                                <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                                                    <span className="text-[11px] sm:text-sm font-medium text-muted-foreground text-left">Venta # {idVenta}</span>
                                                    
                                                    {ventaOriginal && (
                                                        <div className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-full border">
                                                            <CalendarDays className="h-2.5 w-2.5 text-muted-foreground" />
                                                            <span className="text-[9px] font-bold text-muted-foreground">
                                                                Original: {format(toDate(ventaOriginal.fecha), "dd/MM/yy")}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {!esConsumoInterno && (
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            {pagoEnEfectivo > 0 && (
                                                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 h-5 px-1.5 text-[9px] font-bold">
                                                                    <Coins className="h-2.5 w-2.5 mr-1" /> Q{pagoEnEfectivo.toFixed(2)}
                                                                </Badge>
                                                            )}
                                                            {pagoEnTarjeta > 0 && (
                                                                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 h-5 px-1.5 text-[10px] font-bold">
                                                                    <CreditCard className="h-2.5 w-2.5 mr-1" /> Q{pagoEnTarjeta.toFixed(2)}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    )}
                                                    {mostrarTodas && ultimoTurnoLabel && (
                                                        <Badge variant="secondary" className="h-5 px-1.5 text-[9px] font-bold shrink-0">{ultimoTurnoLabel}</Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-2">
                                                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter opacity-70">Último Pago:</span>
                                                    <span className="text-[9px] sm:text-xs text-foreground font-bold tabular-nums">
                                                        {fechaUltimoPago ? format(toDate(fechaUltimoPago), "dd/MM/yy, hh:mm a", { locale: es }) : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="p-2 sm:p-6 pt-4 bg-transparent">
                                        <div className="flex flex-col">
                                            <div className="space-y-8 relative before:absolute before:left-2.5 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-muted-foreground/15">
                                                {pagos.map((pago, idx) => {
                                                    const esUltimo = idx === 0;
                                                    const esPagoConsumoInterno = pago.metodoPago === 'Consumo Interno';

                                                    return (
                                                        <div key={pago.id} className="relative pl-7 sm:pl-10">
                                                            <div className={cn(
                                                                "absolute left-0 sm:left-1.5 top-1 h-5 w-5 rounded-full flex items-center justify-center z-10 shadow-sm border-2 border-background",
                                                                esUltimo ? "bg-primary" : "bg-muted-foreground/30"
                                                            )}>
                                                                {esUltimo ? <CheckCircle2 className="h-3 w-3 text-primary-foreground" /> : <div className="h-1.5 w-1.5 rounded-full bg-background" />}
                                                            </div>
                                                            
                                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                                    <div className="flex items-center gap-1.5 truncate">
                                                                        {esPagoConsumoInterno ? (
                                                                            <CheckCircle2 className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                                                                        ) : pago.metodoPago === 'Efectivo' ? (
                                                                            <Coins className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                                                        ) : (
                                                                            <CreditCard className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                                                        )}
                                                                        <span className={cn("font-bold text-[11px] sm:text-sm truncate", esUltimo ? "text-primary" : "text-muted-foreground")}>
                                                                            {esPagoConsumoInterno ? 'Consumo Interno' : `Pago de Q${pago.montoTotalPagado.toFixed(2)}`}
                                                                        </span>
                                                                        {fueCredito && !esPagoConsumoInterno && (
                                                                            <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-950/20 dark:text-orange-400 text-[8px] font-black h-4 px-1.5 ml-1 leading-none">
                                                                                Abono a Deuda
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    {!esPagoConsumoInterno && (
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <div 
                                                                                        role="button"
                                                                                        onClick={(e) => { e.stopPropagation(); setPagoACambiar({ pago, ventaDocId: venta.ventaDocId }); }}
                                                                                        className="h-5 w-5 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-all cursor-pointer shrink-0"
                                                                                    >
                                                                                        <ArrowRightLeft className="h-3 w-3" />
                                                                                    </div>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent side="top">
                                                                                    <p className="text-[10px] font-bold font-body">Cambiar método</p>
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    )}
                                                                </div>
                                                                <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground/80 tracking-tighter tabular-nums whitespace-nowrap">
                                                                    {format(toDate(pago.fecha), "dd/MM/yy, hh:mm a", { locale: es })}
                                                                </span>
                                                            </div>

                                                            <div className={cn(
                                                                "rounded-xl p-3 border shadow-sm transition-all",
                                                                esUltimo ? "bg-muted/30 border-primary/20" : "bg-muted/10 border-border/40"
                                                            )}>
                                                                {pago.itemsSaldados.map((item, i) => {
                                                                    const detalleOriginal = venta.ventaOriginal?.detalles.find(d => d.idDetalle === item.idDetalle);
                                                                    const horaAgregado = detalleOriginal ? format(toDate(detalleOriginal.fechaAgregado), 'hh:mm a') : '';

                                                                    return (
                                                                        <div key={i} className="flex justify-between text-[10px] sm:text-xs py-1.5 border-b last:border-0 border-border/30">
                                                                            <div className="flex items-center gap-2 text-left min-w-0 flex-1">
                                                                                <span className="text-muted-foreground font-medium truncate">
                                                                                    {item.cantidad ? `${item.cantidad}x ` : ''}{item.nombreProducto}
                                                                                </span>
                                                                                {horaAgregado && (
                                                                                    <span className="text-[9px] text-muted-foreground/40 font-bold shrink-0 tracking-tighter">
                                                                                        ({horaAgregado})
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <span className={cn("font-bold shrink-0 self-center ml-2", esUltimo ? "text-primary" : "text-foreground/80")}>
                                                                                + Q{esPagoConsumoInterno ? '0.00' : (item.montoAplicado || 0).toFixed(2)}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                             )})}
                        </Accordion>
                    )}
                </CardContent>
                {totalPages > 1 && (
                    <CardFooter className="flex flex-col items-center gap-2 pt-2 mt-1 bg-muted/5 p-4 rounded-xl sm:flex-row sm:justify-between">
                         <div className="flex items-center space-x-2">
                            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">Filas por pág.</p>
                            <Select value={`${itemsPerPage}`} onValueChange={(value) => { setItemsPerPage(Number(value)); }}>
                                <SelectTrigger className="h-8 w-[70px] rounded-full text-xs font-body border-muted-foreground/20 bg-background"><SelectValue placeholder={itemsPerPage} /></SelectTrigger>
                                <SelectContent side="top" className='font-body'>
                                    {[10, 30, 50, 100].map((pageSize) => (<SelectItem key={pageSize} value={`${pageSize}`}>{pageSize}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex w-full items-center justify-center space-x-2 sm:w-auto font-body">
                             <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1} className="px-2.5 sm:px-4 rounded-full border-muted-foreground/20 bg-background">
                                <ChevronLeft className="h-4 w-4 mr-1 sm:mr-2" />
                                <span className="sm:hidden text-[10px]">Ant.</span>
                                <span className="hidden sm:inline text-xs">Anterior</span>
                            </Button>
                             <div className="flex-shrink-0 text-[10px] sm:text-xs font-bold text-muted-foreground tracking-widest px-1">
                                Página {currentPage} de {totalPages}
                            </div>
                             <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages} className="px-2.5 sm:px-4 rounded-full border-muted-foreground/20 bg-background">
                                 <span className="hidden sm:inline text-xs">Siguiente</span>
                                 <span className="sm:hidden text-[10px]">Sig.</span>
                                 <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </CardFooter>
                )}
            </Card>

            {/* AlertDialog para Anulación */}
            <AlertDialog open={!!ventaAAnular} onOpenChange={(o) => !o && setVentaAAnular(null)}>
                <AlertDialogContent className='rounded-3xl font-body'>
                    <AlertDialogHeader>
                        <AlertDialogTitle className='flex items-center gap-2 text-destructive font-headline'>
                            <AlertTriangle className='h-6 w-6' /> ¿Anular venta completa?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Estás a punto de anular la <span className="font-bold text-foreground">venta #{ventaAAnular?.idVenta}</span>. 
                            Se devolverá el stock de todos los productos (incluyendo ingredientes) y se restarán los montos de caja y monedas (si aplica). 
                            Esta acción es definitiva.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className='rounded-full h-11 px-8'>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmarAnulacion} 
                            disabled={procesandoAccion}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full h-11 px-10 font-bold"
                        >
                            {procesandoAccion ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Trash2 className="mr-2 h-4 w-4" />}
                            Anular permanentemente
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* AlertDialog para Cambio de Método */}
            <AlertDialog open={!!pagoACambiar} onOpenChange={(o) => !o && setPagoACambiar(null)}>
                <AlertDialogContent className='rounded-3xl font-body'>
                    <AlertDialogHeader>
                        <AlertDialogTitle className='flex items-center gap-2 text-primary font-headline'>
                            <ArrowRightLeft className='h-6 w-6' /> Cambiar método de pago
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Deseas cambiar el método de pago de <span className="font-bold text-foreground">Q{pagoACambiar?.pago.montoTotalPagado.toFixed(2)}</span> de 
                            <span className="font-bold text-foreground"> {pagoACambiar?.pago.metodoPago}</span> a 
                            <span className="font-bold text-foreground"> {pagoACambiar?.pago.metodoPago === 'Efectivo' ? 'Tarjeta' : 'Efectivo'}</span>?
                            Se ajustarán los balances de caja automáticamente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className='rounded-full h-11 px-8'>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmarCambioMetodo} 
                            disabled={procesandoCambioMetodo}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-11 px-10 font-bold"
                        >
                            {procesandoCambioMetodo ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                            Confirmar cambio
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
