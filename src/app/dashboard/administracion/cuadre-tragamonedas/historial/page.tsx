
'use client'

import { useState, useMemo, useEffect } from 'react';
import { collection, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History, Search, Loader2, ChevronLeft, ChevronRight, FileText, ArrowLeft, Clock, Banknote, Target, Wallet, Landmark, Dices, Award, Square } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { useSucursal } from '@/hooks/use-sucursal';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { CuadreTragamonedas } from '@/lib/tipos';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type CuadreConId = CuadreTragamonedas & { id: string };

const toDate = (fecha: any): Date => {
  if (fecha instanceof Timestamp) return fecha.toDate();
  if (fecha instanceof Date) return fecha;
  if (typeof fecha === 'string') {
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(0);
};

export default function HistorialCuadresTragamonedasPage() {
    const { firestore } = useFirebase();
    const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
    
    const [filtro, setFiltro] = useState('');
    const [mostrarTodos, setMostrarTodos] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const cuadresQuery = useMemoFirebase(() => {
        if (!firestore || !sucursalId) return null;
        
        const baseQuery = collection(firestore, `sucursales/${sucursalId}/cuadre_tragamonedas`);
        
        if (mostrarTodos) {
            return query(baseQuery, orderBy('fecha', 'desc'));
        } else {
            return query(baseQuery, where('estado', '==', 'pendiente'), orderBy('fecha', 'desc'));
        }
    }, [firestore, sucursalId, mostrarTodos]);

    const { data: cuadres, isLoading, error } = useCollection<CuadreTragamonedas>(cuadresQuery);
    
    const cuadresConId = useMemo((): CuadreConId[] => {
        return (cuadres || []).map(c => ({ ...c, id: c.id }));
    }, [cuadres]);
    
    const cuadresFiltrados = useMemo(() => {
        if (!filtro) return cuadresConId;
        const filtroLower = filtro.toLowerCase();
        return cuadresConId.filter(c => String(c.idCuadre).includes(filtroLower));
    }, [cuadresConId, filtro]);

    const totalPages = Math.ceil(cuadresFiltrados.length / itemsPerPage);

    const cuadresPaginados = useMemo(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return cuadresFiltrados.slice(startIndex, startIndex + itemsPerPage);
    }, [cuadresFiltrados, currentPage, itemsPerPage]);
  
    const handleNextPage = () => {
      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };
  
    const handlePreviousPage = () => {
      if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    useEffect(() => {
      setCurrentPage(1);
    }, [itemsPerPage, filtro, mostrarTodos]);

    if (error) return <div className="text-center text-red-500 p-4 font-body"><p>Error al cargar el historial: {error.message}</p></div>;

    const cargando = isLoading || isLoadingSucursal;

    return (
        <div className="space-y-6 font-body max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className='w-full text-center sm:text-left'>
                    <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2 text-foreground">
                        <History className="h-6 w-6 text-primary"/>
                        Historial de cuadres
                    </h1>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                        Registro y auditoría de cierres de máquinas tragamonedas.
                    </p>
                </div>
                <Button variant="outline" asChild className="rounded-full h-10 px-6 shrink-0 w-full sm:w-auto">
                    <Link href="/dashboard/administracion/cuadre-tragamonedas">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Link>
                </Button>
            </div>

            <Card className="shadow-sm border-muted/40 overflow-hidden">
                <CardHeader className="p-4 border-b bg-muted/5">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Buscar por ID..."
                                className="pl-9 rounded-full h-10 border-muted/60"
                                value={filtro}
                                onChange={(e) => setFiltro(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex items-center justify-center gap-3 px-4 h-10 border rounded-full bg-background shrink-0 w-full sm:w-auto">
                            <span className={cn("text-[11px] font-bold transition-colors", !mostrarTodos ? "text-primary" : "text-muted-foreground")}>Pendientes</span>
                            <Switch
                                id="mostrar-todos-switch"
                                checked={mostrarTodos}
                                onCheckedChange={setMostrarTodos}
                            />
                            <span className={cn("text-[11px] font-bold transition-colors", mostrarTodos ? "text-primary" : "text-muted-foreground")}>Todos</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                    {cargando ? (
                        <div className="flex justify-center items-center h-64"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
                    ) : cuadresPaginados.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-lg bg-muted/5">
                            <FileText className="h-12 w-12 mb-4 text-primary/20" />
                            <p className="font-semibold text-lg">{filtro ? "No se encontraron registros" : (mostrarTodos ? "No hay cuadres registrados" : "No hay cuadres pendientes")}</p>
                        </div>
                    ) : (
                        <Accordion type="single" collapsible className="w-full space-y-3">
                             {cuadresPaginados.map(cuadre => (
                                <AccordionItem value={cuadre.id} key={cuadre.id} className="border rounded-xl bg-card overflow-hidden shadow-sm border-muted/40 transition-all hover:border-primary/30">
                                    <AccordionTrigger className="p-4 hover:no-underline transition-colors data-[state=open]:bg-primary/[0.02]">
                                        <div className="flex flex-1 items-center justify-between w-full pr-2">
                                            <div className="flex flex-col text-left min-w-0">
                                                <p className="font-bold text-sm sm:text-base text-foreground leading-tight">
                                                    #{cuadre.idCuadre}. {format(toDate(cuadre.fecha), "dd 'de' MMMM, yyyy", { locale: es })}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                                                        {format(toDate(cuadre.fecha), "hh:mm a", { locale: es })}
                                                    </span>
                                                    <span className="text-muted-foreground/30">•</span>
                                                    <Badge className={cn(
                                                        "rounded-full border-0 px-2 h-4 text-[9px] font-bold uppercase",
                                                        cuadre.estado === 'procesado' 
                                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                                                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                    )}>
                                                        {cuadre.estado}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-base sm:text-xl font-bold text-primary leading-none">
                                                    Q{(cuadre.gananciaATrasladar || 0).toFixed(2)}
                                                </p>
                                                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Ganancia Neta</p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="p-4 pt-0">
                                        <div className="border-t pt-6 space-y-8">
                                            {/* Resumen de Bloques */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="bg-muted/30 p-4 rounded-xl text-center border border-muted/20">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Manual</p>
                                                    <p className="text-lg font-bold">Q{(cuadre.resumen?.totalManual || 0).toFixed(2)}</p>
                                                </div>
                                                <div className="bg-muted/30 p-4 rounded-xl text-center border border-muted/20">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Base</p>
                                                    <p className="text-lg font-bold">Q{(cuadre.resumen?.totalBase || 0).toFixed(2)}</p>
                                                </div>
                                                <div className="bg-muted/30 p-4 rounded-xl text-center border border-muted/20">
                                                    <p className="text-[10px] font-bold text-destructive uppercase tracking-widest mb-1">Deuda</p>
                                                    <p className="text-lg font-bold text-destructive">Q{(cuadre.resumen?.totalDeuda || 0).toFixed(2)}</p>
                                                </div>
                                                <div className="bg-muted/30 p-4 rounded-xl text-center border border-muted/20">
                                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Ext. Neta</p>
                                                    <p className="text-lg font-bold text-emerald-600">Q{(cuadre.resumen?.totalExtraccionNeta || 0).toFixed(2)}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                {/* Rendimiento por Máquina */}
                                                <div className="space-y-4">
                                                    <h4 className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-2">
                                                        <Target className="h-3.5 w-3.5" /> Rendimiento por máquina
                                                    </h4>
                                                    <div className="border rounded-xl overflow-hidden bg-background shadow-sm">
                                                        <div className="grid grid-cols-2 p-3 bg-muted/30 border-b text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                            <span>Máquina</span>
                                                            <span className="text-right">Extracciones</span>
                                                        </div>
                                                        <div className="divide-y">
                                                            {cuadre.maquinas?.map((m: any) => (
                                                                <div key={m.id} className="p-3 flex justify-between items-center hover:bg-muted/5 transition-colors">
                                                                    <span className="font-bold text-sm text-foreground">{m.nombre}</span>
                                                                    <div className="text-right">
                                                                        <p className="text-emerald-600 font-bold text-sm">Q{m.extraccion.toFixed(2)}</p>
                                                                        <p className="text-[10px] text-muted-foreground font-medium">
                                                                            Man: Q{m.montoManual.toFixed(0)} | Deu: Q{m.deuda.toFixed(0)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Preparación Turno Sig. */}
                                                <div className="space-y-4">
                                                    <h4 className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-2">
                                                        <Square className="h-3.5 w-3.5" /> Preparación turno sig.
                                                    </h4>
                                                    <Card className="p-6 border-primary/20 bg-primary/[0.02] shadow-inner space-y-4">
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-muted-foreground font-medium">Existencia Monedas:</span>
                                                            <span className="font-bold text-foreground">Q{cuadre.existenciaSiguiente.toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-muted-foreground font-medium">Efectivo Acumulado:</span>
                                                            <span className="font-bold text-foreground">Q{cuadre.efectivoAcumuladoSiguiente.toFixed(2)}</span>
                                                        </div>
                                                        <Separator className="bg-primary/10" />
                                                        <div className="flex justify-between items-center pt-2">
                                                            <span className="text-xs font-black text-primary uppercase tracking-tighter">Monto trasladado:</span>
                                                            <span className="text-3xl font-black text-primary">Q{cuadre.gananciaATrasladar.toFixed(2)}</span>
                                                        </div>
                                                    </Card>

                                                    {cuadre.observaciones && (
                                                        <div className="mt-4">
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Notas del cierre:</p>
                                                            <div className="bg-muted/40 p-3 rounded-lg border border-dashed border-muted-foreground/30 italic text-xs text-muted-foreground leading-relaxed">
                                                                "{cuadre.observaciones}"
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                             ))}
                        </Accordion>
                    )}
                </CardContent>
                
                {totalPages > 1 && (
                    <CardFooter className="flex flex-col items-center gap-4 border-t p-4 sm:flex-row sm:justify-between bg-muted/5">
                        <div className="flex items-center space-x-2">
                            <p className="text-[11px] sm:text-xs font-medium text-muted-foreground">Filas por página</p>
                            <Select
                                value={`${itemsPerPage}`}
                                onValueChange={(value) => setItemsPerPage(Number(value))}
                            >
                                <SelectTrigger className="h-8 w-[65px] rounded-full text-[11px] sm:text-xs">
                                    <SelectValue placeholder={itemsPerPage} />
                                </SelectTrigger>
                                <SelectContent side="top">
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
                                className="h-8 px-2 sm:px-3 rounded-full"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="hidden sm:inline text-xs ml-1 font-bold">Anterior</span>
                            </Button>
                            <div className="flex-shrink-0 text-[11px] sm:text-xs font-bold text-muted-foreground px-1 sm:px-2">
                                Pág. {currentPage} de {totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="h-8 px-2 sm:px-3 rounded-full"
                            >
                                <span className="hidden sm:inline text-xs mr-1 font-bold">Siguiente</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
