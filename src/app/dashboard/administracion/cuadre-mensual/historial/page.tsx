
'use client'

import { useState, useMemo, useEffect } from 'react';
import { collection, query, orderBy, doc, getDoc, Firestore } from 'firebase/firestore';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import type { CuadreMensual, CuadreSemanal } from '@/lib/tipos';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History, Search, Loader2, ChevronLeft, ChevronRight, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { useSucursal } from '@/hooks/use-sucursal';

type CuadreMensualConId = CuadreMensual & { id: string };
type CuadreSemanalConId = CuadreSemanal & { id: string };

const DetalleCuadresSemanalesProcesados = ({ ids, firestore, sucursalId }: { ids: string[], firestore: Firestore, sucursalId: string | null }) => {
    const [detalles, setDetalles] = useState<CuadreSemanalConId[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (ids.length === 0 || !sucursalId) {
            setDetalles([]);
            return;
        }

        const fetchDetalles = async () => {
            setIsLoading(true);
            const detallesPromises = ids.map(id => {
                const docRef = doc(firestore, `sucursales/${sucursalId}/cuadre_semanal`, id);
                return getDoc(docRef);
            });
            
            const docsSnapshots = await Promise.all(detallesPromises);
            const fetchedDetalles = docsSnapshots
                .filter(docSnap => docSnap.exists())
                .map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as CuadreSemanalConId));

            setDetalles(fetchedDetalles);
            setIsLoading(false);
        };

        fetchDetalles();
    }, [ids, firestore, sucursalId]);

    if (ids.length === 0) return null;

    return (
        <div>
            <h4 className="font-semibold mb-2 text-sm">Cuadres Semanales Incluidos ({ids.length})</h4>
            {isLoading ? <div className="flex justify-center p-2"><Loader2 className="h-4 w-4 animate-spin"/></div> 
            : (
                <div className="space-y-2">
                    {detalles.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-xs p-2 bg-muted/50 rounded-md">
                            <div>
                                <p className="font-medium truncate max-w-40">Cuadre Semanal #{item.idCuadreSemanal}</p>
                                <p className="text-muted-foreground">{format(item.fecha.toDate(), "dd/MM/yy hh:mm a", { locale: es })}</p>
                            </div>
                            <p className="font-semibold">Q{(item.resumen.balanceLiquidado ?? 0).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function HistorialCuadresMensualesPage() {
    const { firestore } = useFirebase();
    const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
    const [filtro, setFiltro] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [openAccordionId, setOpenAccordionId] = useState<string | null>(null);

    const cuadresQuery = useMemoFirebase(() => {
        if (!firestore || !sucursalId) return null;
        return query(collection(firestore, `sucursales/${sucursalId}/cuadre_mensual`), orderBy('fecha', 'desc'));
    }, [firestore, sucursalId]);

    const { data: cuadres, isLoading, error } = useCollection<CuadreMensual>(cuadresQuery);
    
    const cuadresConId = useMemo((): CuadreMensualConId[] => {
        return (cuadres || []).map(c => ({ ...c, id: c.id }));
    }, [cuadres]);
    
    const cuadresFiltrados = useMemo(() => {
        if (!filtro) return cuadresConId;
        const filtroLower = filtro.toLowerCase();
        return cuadresConId.filter(c => String(c.idCuadreMensual).includes(filtroLower) || c.observaciones.toLowerCase().includes(filtroLower));
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

    if (isLoading || isLoadingSucursal) return <div className="flex justify-center items-center h-64"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
    if (error) return <div className="text-center text-red-500 p-4"><p>Error al cargar el historial de cuadres: {error.message}</p></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className='w-full text-center sm:text-left'>
                    <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2 text-foreground">
                        <History className="h-6 w-6 text-primary"/>
                        Historial de cuadres mensuales
                    </h1>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                        Consulta los registros de cierres mensuales anteriores.
                    </p>
                </div>
                <Button variant="outline" asChild className="rounded-full h-10 px-6 shrink-0 w-full sm:w-auto">
                    <Link href="/dashboard/administracion/cuadre-mensual">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar por ID de cuadre u observación..."
                            className="pl-9 rounded-full h-10"
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {cuadresPaginados.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-lg">
                            <FileText className="h-12 w-12 mb-4 text-primary/50" />
                            <p className="font-semibold text-lg">{filtro ? "No se encontraron registros" : "No hay cuadres mensuales registrados"}</p>
                            <p className="text-sm">{filtro ? "Intenta con otra búsqueda." : "Los cuadres completados aparecerán aquí."}</p>
                        </div>
                    ) : (
                        <Accordion type="single" collapsible className="w-full space-y-3" onValueChange={(value) => setOpenAccordionId(value || null)}>
                             {cuadresPaginados.map(cuadre => (
                                <AccordionItem value={cuadre.id} key={cuadre.id} className="border rounded-xl bg-card overflow-hidden shadow-sm border-muted/40 transition-all hover:border-primary/30">
                                    <AccordionTrigger className="p-4 hover:no-underline transition-colors data-[state=open]:bg-primary/[0.02]">
                                        <div className="flex flex-1 items-center justify-between w-full pr-2">
                                            <div className="flex flex-col text-left min-w-0">
                                                <p className="font-bold text-sm sm:text-base text-foreground leading-tight">
                                                    #{cuadre.idCuadreMensual}. {format(cuadre.fecha.toDate(), "dd 'de' MMMM, yyyy", { locale: es })}
                                                </p>
                                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight mt-1">
                                                    {format(cuadre.fecha.toDate(), "hh:mm a", { locale: es })}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-base sm:text-xl font-bold text-primary leading-none">
                                                    Q{cuadre.resumen.balanceLiquidado.toFixed(2)}
                                                </p>
                                                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Balance Liquidado</p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="p-4 pt-0">
                                        <div className="border-t pt-6 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Card className="text-center bg-muted/10 border-muted/40 shadow-none">
                                                    <CardHeader className="pb-2"><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Balance Neto</p></CardHeader>
                                                    <CardContent><p className="text-2xl font-bold">Q{cuadre.resumen.balanceNetoCalculado.toFixed(2)}</p></CardContent>
                                                </Card>
                                                <Card className="text-center bg-primary/5 border-primary/20 shadow-none">
                                                    <CardHeader className="pb-2"><p className="text-[10px] font-bold text-primary uppercase tracking-widest">Balance Liquidado</p></CardHeader>
                                                    <CardContent><p className="text-2xl font-bold text-primary">Q{cuadre.resumen.balanceLiquidado.toFixed(2)}</p></CardContent>
                                                </Card>
                                            </div>
                                            <div className="flex items-center justify-center gap-4 text-center p-4 border rounded-xl bg-background shadow-sm border-muted/40">
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Origen</p>
                                                    <p className="font-semibold text-sm">{cuadre.cuentas.origenNombre}</p>
                                                </div>
                                                <ArrowRight className="h-5 w-5 text-muted-foreground/40 shrink-0"/>
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Destino</p>
                                                    <p className="font-semibold text-sm">{cuadre.cuentas.destinoNombre}</p>
                                                </div>
                                            </div>

                                            {openAccordionId === cuadre.id && firestore && (
                                                <Card className="border-muted/40 shadow-none bg-transparent">
                                                    <CardHeader className="px-0"><p className="text-sm font-bold font-headline">Desglose de Cuadres Semanales</p></CardHeader>
                                                    <CardContent className="px-0">
                                                        <DetalleCuadresSemanalesProcesados ids={cuadre.idsCuadresProcesados} firestore={firestore} sucursalId={sucursalId}/>
                                                    </CardContent>
                                                </Card>
                                            )}

                                            {cuadre.observaciones && (
                                                <div className="mt-4">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Observaciones:</p>
                                                    <div className="bg-muted/30 p-3 rounded-lg border border-dashed border-muted-foreground/20 italic text-xs text-muted-foreground leading-relaxed">
                                                        "{cuadre.observaciones}"
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
                                {[10, 30, 50, 100].map((pageSize) => (
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
