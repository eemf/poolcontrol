
'use client'

import { useState, useMemo, useEffect } from 'react';
import { collection, query, orderBy, doc, getDoc, Firestore, where } from 'firebase/firestore';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import type { CuadreSemanal } from '@/lib/tipos';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History, Search, Loader2, ChevronLeft, ChevronRight, FileText, ArrowRight, ArrowDown, ArrowUp, ArrowLeft } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useSucursal } from '@/hooks/use-sucursal';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

type CuadreSemanalConId = CuadreSemanal & { id: string };

const DetalleRegistrosProcesados = ({ ids, firestore, sucursalId, tipo, titulo }: { ids: string[], firestore: Firestore, sucursalId: string | null, tipo: 'movimiento' | 'compra' | 'gasto' | 'tragamonedas', titulo: string }) => {
    const [detalles, setDetalles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!ids || ids.length === 0 || !sucursalId) {
            setDetalles([]);
            return;
        }

        const fetchDetalles = async () => {
            setIsLoading(true);
            const detallesPromises = ids.map(id => {
                let collectionName = '';
                switch (tipo) {
                    case 'movimiento': collectionName = 'cierre_caja'; break;
                    case 'compra': collectionName = 'compras'; break;
                    case 'gasto': collectionName = 'gastos'; break;
                    case 'tragamonedas': collectionName = 'cuadre_tragamonedas'; break;
                }
                const docRef = doc(firestore, `sucursales/${sucursalId}/${collectionName}`, id);
                return getDoc(docRef);
            });
            
            const docsSnapshots = await Promise.all(detallesPromises);
            const fetchedDetalles = docsSnapshots
                .filter(docSnap => docSnap.exists())
                .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

            setDetalles(fetchedDetalles);
            setIsLoading(false);
        };

        fetchDetalles();
    }, [ids, firestore, tipo, sucursalId]);

    if (!ids || ids.length === 0) return null;

    return (
        <div>
            <h4 className="font-semibold mb-2 text-sm">{titulo} ({ids.length})</h4>
            {isLoading ? <div className="flex justify-center p-2"><Loader2 className="h-4 w-4 animate-spin"/></div> 
            : (
                <div className="space-y-2">
                    {detalles.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-xs p-2.5 !bg-[#1d283a] rounded-lg border !border-[#324157]">
                            <div>
                                <p className="font-semibold text-foreground truncate max-w-40">
                                    {tipo === 'movimiento' ? `Cierre Caja #${item.idCuadre}` : 
                                     tipo === 'tragamonedas' ? `Cierre Tragamonedas #${item.idCuadre}` :
                                     item.descripcion || item.proveedorNombre || `ID: ${item.id}`}
                                </p>
                                <p className="text-muted-foreground text-[11px]">{format(item.fecha.toDate(), "dd/MM/yy hh:mm a", { locale: es })}</p>
                            </div>
                            <p className="font-bold text-foreground">Q{((item.totalLiquidado ?? item.pagosTarjeta ?? item.monto ?? item.montoTotal ?? item.gananciaATrasladar) ?? 0).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function HistorialCuadresSemanalesPage() {
    const { firestore } = useFirebase();
    const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
    
    const [filtro, setFiltro] = useState('');
    const [mostrarTodos, setMostrarTodos] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [openAccordionId, setOpenAccordionId] = useState<string | null>(null);

    const cuadresQuery = useMemoFirebase(() => {
        if (!firestore || !sucursalId) return null;
        
        const baseQuery = collection(firestore, `sucursales/${sucursalId}/cuadre_semanal`);
        
        if (mostrarTodos) {
            return query(baseQuery, orderBy('fecha', 'desc'));
        } else {
            return query(baseQuery, where('estadoMensual', '==', 'pendiente'), orderBy('fecha', 'desc'));
        }
    }, [firestore, sucursalId, mostrarTodos]);

    const { data: cuadres, isLoading, error } = useCollection<CuadreSemanal>(cuadresQuery);
    
    const cuadresConId = useMemo((): CuadreSemanalConId[] => {
        return (cuadres || []).map(c => ({ ...c, id: c.id }));
    }, [cuadres]);
    
    const cuadresFiltrados = useMemo(() => {
        if (!filtro) return cuadresConId;
        const filtroLower = filtro.toLowerCase();
        return cuadresConId.filter(c => String(c.idCuadreSemanal).includes(filtroLower) || c.observaciones.toLowerCase().includes(filtroLower));
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
    }, [filtro, itemsPerPage, mostrarTodos]);

    if (error) return <div className="text-center text-red-500 p-4"><p>Error al cargar el historial de cuadres: {error.message}</p></div>;

    const cargando = isLoading || isLoadingSucursal;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className='w-full text-center sm:text-left'>
                    <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2 text-foreground">
                        <History className="h-6 w-6 text-primary"/>
                        Historial de cuadres semanales
                    </h1>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                        Consulta los registros de cierres anteriores.
                    </p>
                </div>
                <Button variant="outline" asChild className="rounded-full h-10 px-6 shrink-0 w-full sm:w-auto">
                    <Link href="/dashboard/administracion/cuadre-semanal">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Link>
                </Button>
            </div>

            <Card 
                className="shadow-sm overflow-hidden font-body !bg-[#1d283a] border !border-[#324157]"
                style={{ backgroundColor: '#1d283a', borderColor: '#324157' }}
            >
                <CardHeader className="p-4 bg-transparent border-b !border-[#324157]">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Buscar por ID..."
                                className="pl-9 rounded-full h-10 border-[#324157] bg-[#283244] text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                                value={filtro}
                                onChange={(e) => setFiltro(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex items-center justify-center gap-3 px-4 h-10 border !border-[#324157] rounded-full bg-[#283244] shrink-0 w-full sm:w-auto">
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
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed !border-[#324157] rounded-xl bg-[#283244]/40">
                            <FileText className="h-12 w-12 mb-4 text-primary/30" />
                            <p className="font-semibold text-lg text-foreground">{filtro ? "No se encontraron registros" : (mostrarTodos ? "No hay cuadres registrados" : "No hay cuadres pendientes")}</p>
                        </div>
                    ) : (
                        <Accordion type="single" collapsible className="w-full space-y-3" onValueChange={(value) => setOpenAccordionId(value || null)}>
                             {cuadresPaginados.map(cuadre => (
                                <AccordionItem 
                                    value={cuadre.id} 
                                    key={cuadre.id} 
                                    style={{ backgroundColor: '#283244', borderColor: '#324157' }}
                                    className="border !border-[#324157] rounded-xl !bg-[#283244] overflow-hidden shadow-sm transition-all hover:brightness-105"
                                >
                                    <AccordionTrigger className="p-4 hover:no-underline transition-colors">
                                        <div className="flex flex-1 items-center justify-between w-full pr-2">
                                            <div className="flex flex-col text-left min-w-0">
                                                <p className="font-bold text-sm sm:text-base text-foreground leading-tight">
                                                    #{cuadre.idCuadreSemanal}. {format(cuadre.fecha.toDate(), "dd 'de' LLLL, yyyy", { locale: es })}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-medium text-muted-foreground tracking-tight">
                                                        {format(cuadre.fecha.toDate(), "hh:mm a", { locale: es })}
                                                    </span>
                                                    <span className="text-muted-foreground/30">•</span>
                                                    <Badge className={cn(
                                                        "rounded-full border-0 px-2 h-4 text-[9px] font-bold",
                                                        cuadre.estadoMensual === 'procesado' 
                                                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                                                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                                    )}>
                                                        {cuadre.estadoMensual === 'procesado' ? 'Procesado' : 'Pendiente'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-base sm:text-xl font-bold text-primary leading-none">
                                                    Q{cuadre.resumen.balanceLiquidado.toFixed(2)}
                                                </p>
                                                <p className="text-[9px] text-muted-foreground font-semibold tracking-wider mt-1">Balance Liquidado</p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="p-4 pt-0">
                                        <div className="border-t !border-[#324157] pt-6 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Card className="text-center !bg-[#1d283a]/80 !border-[#324157]">
                                                    <CardHeader className="pb-2"><p className="text-[10px] font-bold text-muted-foreground tracking-wide">Balance Neto</p></CardHeader>
                                                    <CardContent><p className="text-2xl font-bold text-foreground">Q{cuadre.resumen.balanceNetoCalculado.toFixed(2)}</p></CardContent>
                                                </Card>
                                                <Card className="text-center !bg-[#1d283a]/80 !border-primary/40">
                                                    <CardHeader className="pb-2"><p className="text-[10px] font-bold text-primary tracking-wide">Balance Liquidado</p></CardHeader>
                                                    <CardContent><p className="text-2xl font-bold text-primary">Q{cuadre.resumen.balanceLiquidado.toFixed(2)}</p></CardContent>
                                                </Card>
                                            </div>
                                            <div className="flex items-center justify-center gap-4 text-center p-4 border !border-[#324157] rounded-xl !bg-[#1d283a]/80 shadow-sm">
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-bold text-muted-foreground tracking-tight">Origen</p>
                                                    <p className="font-semibold text-sm text-foreground">{cuadre.cuentas.origenNombre}</p>
                                                </div>
                                                <ArrowRight className="h-5 w-5 text-muted-foreground/40 shrink-0"/>
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-bold text-muted-foreground tracking-tight">Destino</p>
                                                    <p className="font-semibold text-sm text-foreground">{cuadre.cuentas.destinoNombre}</p>
                                                </div>
                                            </div>

                                            {openAccordionId === cuadre.id && firestore && (
                                                <Card className="!border-[#324157] shadow-none !bg-[#1d283a]/50 p-4 rounded-xl">
                                                    <CardHeader className="p-0 pb-3"><p className="text-sm font-bold font-headline text-foreground">Registros Procesados</p></CardHeader>
                                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 p-0">
                                                        <div className="space-y-4">
                                                            <h4 className="text-[11px] font-bold text-emerald-400 flex items-center gap-2 tracking-wide"><ArrowUp size={14}/>Ingresos (Q{(cuadre.resumen.totalIngresosEfectivo + cuadre.resumen.totalIngresosTarjeta + (cuadre.resumen.totalIngresosTragamonedas || 0)).toFixed(2)})</h4>
                                                            <div className="space-y-4 border-l-2 !border-emerald-500/30 pl-4 ml-1">
                                                                <DetalleRegistrosProcesados ids={cuadre.idsProcesados.ingresosEfectivo} firestore={firestore} sucursalId={sucursalId} tipo="movimiento" titulo="Cajas (Efectivo)" />
                                                                <DetalleRegistrosProcesados ids={cuadre.idsProcesados.ingresosTarjeta} firestore={firestore} sucursalId={sucursalId} tipo="movimiento" titulo="Cajas (Tarjeta)" />
                                                                <DetalleRegistrosProcesados ids={cuadre.idsProcesados.ingresosTragamonedas || []} firestore={firestore} sucursalId={sucursalId} tipo="tragamonedas" titulo="Tragamonedas" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <h4 className="text-[11px] font-bold text-rose-400 flex items-center gap-2 tracking-wide"><ArrowDown size={14}/>Egresos (-Q{(cuadre.resumen.totalCompras + cuadre.resumen.totalGastos).toFixed(2)})</h4>
                                                            <div className="space-y-4 border-l-2 !border-rose-500/30 pl-4 ml-1">
                                                                <DetalleRegistrosProcesados ids={cuadre.idsProcesados.compras} firestore={firestore} sucursalId={sucursalId} tipo="compra" titulo="Compras Pagadas"/>
                                                                <DetalleRegistrosProcesados ids={cuadre.idsProcesados.gastos} firestore={firestore} sucursalId={sucursalId} tipo="gasto" titulo="Gastos Pagados" />
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )}

                                            {cuadre.observaciones && (
                                                <div className="mt-4">
                                                    <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-2">Observaciones:</p>
                                                    <div className="!bg-[#1d283a]/60 p-3 rounded-lg border border-dashed !border-[#324157] italic text-xs text-muted-foreground leading-relaxed">
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
                <CardFooter className="flex flex-col items-center gap-4 border-t !border-[#324157] p-4 sm:flex-row sm:justify-between bg-transparent">
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
