'use client'

import { useState, useMemo, useEffect } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { History, Search, Loader2, ChevronLeft, ChevronRight, FileText, ArrowLeft, Banknote, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import type { CierreCaja } from '@/lib/tipos';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSucursal } from '@/hooks/use-sucursal';
import { Separator } from '@/components/ui/separator';
import { cn } from "@/lib/utils";
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

export default function HistorialCierresCajaPage() {
    const { firestore } = useFirebase();
    const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
    
    const [filtro, setFiltro] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [mostrarTodos, setMostrarTodos] = useState(false);

    const cierresQuery = useMemoFirebase(() => {
        if (!firestore || !sucursalId) return null;
        return query(collection(firestore, `sucursales/${sucursalId}/cierre_caja`), orderBy('fecha', 'desc'));
    }, [firestore, sucursalId]);

    const { data: todosLosCierres, isLoading: isLoadingCierres, error } = useCollection<CierreCaja>(cierresQuery);

    const cierresFiltradosYMostrados = useMemo(() => {
        if (!todosLosCierres) return [];

        let listaBase = todosLosCierres;

        if (!mostrarTodos) {
            listaBase = todosLosCierres.filter(c => c.estadoEfectivo === 'pendiente' || (c.pagosTarjeta > 0 && c.estadoTarjeta === 'pendiente'));
        }

        if (!filtro) return listaBase;

        const filtroLower = filtro.toLowerCase();
        return listaBase.filter(c => 
            String(c.idCuadre).includes(filtroLower) ||
            (c.observaciones && c.observaciones.toLowerCase().includes(filtroLower))
        );
    }, [todosLosCierres, mostrarTodos, filtro]);

    const totalPages = Math.ceil(cierresFiltradosYMostrados.length / itemsPerPage);

    const cierresPaginados = useMemo(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return cierresFiltradosYMostrados.slice(startIndex, startIndex + itemsPerPage);
    }, [cierresFiltradosYMostrados, currentPage, itemsPerPage]);
  
    const handleNextPage = () => {
      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };
  
    const handlePreviousPage = () => {
      if (currentPage > 1) setCurrentPage(currentPage - 1);
    };
    
    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage, filtro, mostrarTodos]);
    
    const isLoading = isLoadingCierres || isLoadingSucursal;

    if (error) return (
        <div className="text-center text-red-500 p-4 bg-red-100/50 rounded-lg font-body">
            <p className="font-bold">Error al cargar el historial:</p>
            <p className="text-xs">{error.message}</p>
        </div>
    );

    const getStatusBadge = (status?: 'procesado' | 'pendiente') => {
        if (status === 'procesado') {
            return <Badge className="bg-emerald-600 text-white border-none shadow-sm font-bold h-6 rounded-full px-3">Procesado</Badge>
        }
        return <Badge className="bg-amber-500 text-white border-none shadow-sm font-bold h-6 rounded-full px-3">Pendiente</Badge>
    }

    return (
        <div className="space-y-6 font-body">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-full sm:auto text-center sm:text-left">
                    <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2 text-foreground">
                        <History className="h-6 w-6 text-primary"/>
                        Historial Cierres de Caja
                    </h1>
                     <p className="text-muted-foreground text-sm hidden sm:block font-body">Consulta los registros de cierres, filtrando entre pendientes y el historial completo.</p>
                </div>
                <Link href="/dashboard/cierre-caja">
                    <Button variant="outline" className="rounded-full h-10 px-6 font-body">
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        Regresar
                    </Button>
                </Link>
            </div>

            <Card className="border-border bg-card shadow-sm overflow-hidden">
                <CardHeader className="p-4 pb-1">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full sm:flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Buscar por ID u observación..."
                                className="pl-9 rounded-full h-10 border-muted-foreground/20 bg-background"
                                value={filtro}
                                onChange={(e) => setFiltro(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center justify-center gap-3 px-4 h-10 border rounded-full bg-background shrink-0 w-full sm:w-auto">
                            <span className={cn("text-[11px] font-bold transition-colors", !mostrarTodos ? "text-primary" : "text-muted-foreground")}>Turno Actual</span>
                            <Switch
                                id="mostrar-todos"
                                checked={mostrarTodos}
                                onCheckedChange={setMostrarTodos}
                            />
                             <span className={cn("text-[11px] font-bold transition-colors", mostrarTodos ? "text-primary" : "text-muted-foreground")}>Todos</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-1 pb-1">
                    {isLoading ? (
                         <div className="flex justify-center items-center h-64"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
                    ) : cierresPaginados.length === 0 ? (
                         <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-3xl bg-muted/5 m-2">
                            <FileText className="h-12 w-12 mb-4 text-primary/30" />
                            <p className="font-bold text-lg">{filtro ? "No se encontraron resultados" : (mostrarTodos ? "No hay cierres registrados" : "¡Excelente! No hay cierres pendientes.")}</p>
                        </div>
                    ) : (
                        <Accordion type="single" collapsible className="w-full space-y-2">
                             {cierresPaginados.map(cierre => (
                                <AccordionItem value={cierre.id} key={cierre.id} className="border border-border rounded-lg bg-card-foreground/5 overflow-hidden mb-2 shadow-sm">
                                    <AccordionTrigger className="p-4 hover:no-underline data-[state=open]:border-b border-muted-foreground/10 transition-none">
                                       <div className="flex justify-between items-center w-full">
                                            <div className="text-left min-w-0 flex-1">
                                                <p className="font-bold text-sm text-foreground truncate">{format(toDate(cierre.fecha), "dd 'de' LLLL", { locale: es })}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground">{format(toDate(cierre.fecha), "hh:mm a", { locale: es })}</p>
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-1 shrink-0 ml-4">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <span className="hidden sm:inline text-[10px] font-bold text-muted-foreground">Liquidado</span>
                                                    <Banknote className="h-3.5 w-3.5 text-primary/70 sm:hidden" />
                                                    <span className="text-sm sm:text-base font-bold text-primary tabular-nums">Q{(cierre.totalLiquidado ?? 0).toFixed(2)}</span>
                                                </div>
                                                {(cierre.pagosTarjeta ?? 0) > 0 && (
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <span className="hidden sm:inline text-[10px] font-bold text-muted-foreground">Tarjeta</span>
                                                        <CreditCard className="h-3.5 w-3.5 text-sky-500/70 sm:hidden" />
                                                        <span className="text-sm sm:text-base font-bold text-sky-500 dark:text-sky-400 tabular-nums">Q{(cierre.pagosTarjeta ?? 0).toFixed(2)}</span>
                                                    </div>
                                                )}
                                            </div>
                                       </div>
                                    </AccordionTrigger>
                                     <AccordionContent className="p-4 pt-0 bg-transparent">
                                        <div className="space-y-6 pt-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm font-body">
                                                <div className="space-y-2">
                                                    <h4 className="font-bold text-[11px] text-primary mb-2">Ingresos Del Período</h4>
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between items-center"><span className="text-muted-foreground font-medium text-xs">Efectivo Inicial:</span><span className="font-bold">Q{cierre.efectivoInicial.toFixed(2)}</span></div>
                                                        <div className="flex justify-between items-center"><span className="text-muted-foreground font-medium text-xs">Venta Mesas:</span><span className="font-bold">Q{cierre.totalIngresoMesas.toFixed(2)}</span></div>
                                                        <div className="flex justify-between items-center"><span className="text-muted-foreground font-medium text-xs">Venta Consumo:</span><span className="font-bold">Q{cierre.totalVentaConsumo.toFixed(2)}</span></div>
                                                    </div>
                                                    <Separator className="my-2 border-dashed" />
                                                    <div className="flex justify-between items-center font-bold text-sky-500 dark:text-sky-400"><span>Efectivo Esperado:</span><span>Q{cierre.efectivoEsperado.toFixed(2)}</span></div>
                                                </div>

                                                <div className="space-y-2">
                                                    <h4 className="font-bold text-[11px] text-primary mb-2">Totales Y Conteo</h4>
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between items-center"><span className="text-muted-foreground font-medium text-xs">Efectivo Contado:</span><span className="font-bold">Q{cierre.efectivoFinalContado.toFixed(2)}</span></div>
                                                        <div className="flex justify-between items-center"><span className="text-muted-foreground font-medium text-xs">Pagos Con Tarjeta:</span><span className="font-bold text-sky-500">Q{cierre.pagosTarjeta.toFixed(2)}</span></div>
                                                        <div className="flex justify-between items-center"><span className="text-muted-foreground font-medium text-xs">Venta Monedas (Neto):</span><span className="font-bold">Q{cierre.totalVentaMonedas.toFixed(2)}</span></div>
                                                    </div>
                                                    <Separator className="my-2 border-dashed" />
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between items-center"><span className="text-muted-foreground font-medium text-xs">Diferencia:</span><span className={`font-bold ${cierre.diferencia >= 0 ? "text-primary" : "text-destructive"}`}>Q{cierre.diferencia.toFixed(2)}</span></div>
                                                        <div className="flex justify-between items-center font-semibold text-primary"><span className="text-muted-foreground font-medium text-xs">Caja Siguiente Turno:</span><span>Q{cierre.cajaSiguienteTurno.toFixed(2)}</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <Separator className="border-dashed border-muted-foreground/20" />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 font-body">
                                                <div className="space-y-2 text-sm">
                                                    <h4 className="font-bold text-[11px] text-primary mb-2">Resumen De Monedas</h4>
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between items-center"><span className="text-muted-foreground font-medium text-xs">Existencia Registrada:</span><span className="font-bold">{cierre.snapshotMonedas.existencia}</span></div>
                                                        <div className="flex justify-between items-center"><span className="text-muted-foreground font-medium text-xs">Venta Neta Período:</span><span className="font-bold">Q{cierre.snapshotMonedas.totalMonedasNetoPeriodo.toFixed(2)}</span></div>
                                                        <div className="flex justify-between items-center"><span className="text-muted-foreground font-medium text-xs">Efectivo Acumulado:</span><span className="font-bold">Q{cierre.snapshotMonedas.efectivoAcumulado.toFixed(2)}</span></div>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <h4 className="font-bold text-[11px] text-muted-foreground uppercase tracking-widest">Estado Del Cierre</h4>
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center justify-between p-2.5 bg-muted/20 rounded-xl text-sm border border-muted-foreground/10">
                                                            <span className="font-bold text-foreground/80 text-xs">
                                                                Liquidación Efectivo
                                                            </span>
                                                            {getStatusBadge(cierre.estadoEfectivo)}
                                                        </div>
                                                        {cierre.pagosTarjeta > 0 && (
                                                            <div className="flex items-center justify-between p-2.5 bg-muted/20 rounded-xl text-sm border border-muted-foreground/10">
                                                                <span className="font-bold text-foreground/80 text-xs">
                                                                    Pagos Con Tarjeta
                                                                </span>
                                                                {getStatusBadge(cierre.estadoTarjeta)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {cierre.observaciones && (
                                                <div className="mt-4 pt-4 border-t border-dashed border-muted-foreground/20 font-body">
                                                    <h4 className="font-bold text-[11px] text-muted-foreground mb-2">Observaciones Del Cajero</h4>
                                                    <div className="bg-muted/30 p-4 rounded-xl border border-muted-foreground/10 italic text-xs text-muted-foreground leading-relaxed">
                                                        "{cierre.observaciones}"
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                     </AccordionContent>
                                </AccordionItem>
                             ))}
                        </Accordion>
                    )}
                </CardContent>
                {totalPages > 1 && (
                 <CardFooter className="flex flex-col items-center gap-2 p-3 sm:flex-row sm:justify-between bg-muted/5 font-body">
                    <div className="flex items-center space-x-2">
                        <p className="text-[11px] font-bold text-muted-foreground">Filas por página</p>
                        <Select
                            value={`${itemsPerPage}`}
                            onValueChange={(value) => setItemsPerPage(Number(value))}
                        >
                            <SelectTrigger className="h-8 w-[70px] rounded-full text-xs font-bold border-muted-foreground/20">
                                <SelectValue placeholder={itemsPerPage} />
                            </SelectTrigger>
                            <SelectContent side="top" className="font-body">
                                {[10, 20, 50, 100].map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                    {pageSize}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex w-full items-center justify-between sm:justify-center space-x-2 sm:w-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="h-8 px-2.5 rounded-full border-muted-foreground/20"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="hidden sm:inline text-xs font-bold ml-1">Anterior</span>
                        </Button>
                        <div className="flex-shrink-0 text-xs font-black text-muted-foreground px-2">
                            Pág. {currentPage} de {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="h-8 px-2.5 rounded-full border-muted-foreground/20"
                        >
                            <span className="hidden sm:inline text-xs font-bold mr-1">Siguiente</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardFooter>
            )}
            </Card>
        </div>
    );
}
