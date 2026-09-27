
'use client'

import { useState, useMemo, useEffect } from 'react';
import { collection, query, orderBy, where, doc, Timestamp, increment } from 'firebase/firestore';
import { useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import type { HistorialInventario, Generales, CierreCaja } from '@/lib/tipos';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History, Search, Loader2, ChevronLeft, ChevronRight, FileText, ArrowDown, ArrowUp, ArrowUpDown, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useSucursal } from '@/hooks/use-sucursal';
import { Separator } from '@/components/ui/separator';

type SortConfig = {
  key: keyof HistorialInventario | 'fecha';
  direction: 'asc' | 'desc';
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

export default function PaginaMovimientoProductos() {
  const { firestore } = useFirebase();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  const [filtro, setFiltro] = useState('');
  const [periodoFiltro, setPeriodoFiltro] = useState<string>('actual');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'fecha', direction: 'desc' });

  const generalesRef = useMemoFirebase(() => 
    firestore && sucursalId ? doc(firestore, `sucursales/${sucursalId}/generales/actual`) : null
  , [firestore, sucursalId]);
  const { data: estadoCaja, isLoading: cargandoEstadoCaja } = useDoc<Generales>(generalesRef);
  
  const fechaInicioPeriodo = useMemo(() => {
    if (!estadoCaja?.fechaInicioPeriodo) return null;
    return toDate(estadoCaja.fechaInicioPeriodo);
  }, [estadoCaja?.fechaInicioPeriodo]);

  const cierresQuery = useMemoFirebase(() => 
    (firestore && sucursalId) ? query(collection(firestore, `sucursales/${sucursalId}/cierre_caja`), orderBy('fecha', 'desc')) : null
  , [firestore, sucursalId]);
  const { data: cierres } = useCollection<CierreCaja>(cierresQuery);

  const movimientosQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId || (periodoFiltro === 'actual' && cargandoEstadoCaja)) return null;
    
    const baseQuery = collection(firestore, `sucursales/${sucursalId}/historial_inventario`);
    
    if (periodoFiltro === 'todos') {
      return query(baseQuery, orderBy('fecha', 'desc'));
    } 
    
    if (periodoFiltro === 'actual') {
      if (!fechaInicioPeriodo) return null; 
      return query(baseQuery, where('fecha', '>=', Timestamp.fromDate(fechaInicioPeriodo)), orderBy('fecha', 'desc'));
    }

    const cierre = cierres?.find(c => c.id === periodoFiltro);
    if (!cierre) return null;
    return query(
      baseQuery, 
      where('fecha', '>=', cierre.inicioDelPeriodo), 
      where('fecha', '<=', cierre.fecha),
      orderBy('fecha', 'desc')
    );
  }, [firestore, sucursalId, periodoFiltro, fechaInicioPeriodo, cargandoEstadoCaja, cierres]);

  const { data: movimientos, isLoading: isLoadingMovimientos, error } = useCollection<HistorialInventario>(movimientosQuery);

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const movimientosFiltrados = useMemo(() => {
    if (!movimientos) return [];
    
    let result = [...movimientos];
    
    if (filtro) {
      const filtroLower = filtro.toLowerCase();
      result = result.filter(m => 
        m.nombreProducto.toLowerCase().includes(filtroLower) ||
        m.tipoMovimiento.toLowerCase().includes(filtroLower) ||
        m.referencia.toLowerCase().includes(filtroLower)
      );
    }

    result.sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];

      if (valA instanceof Timestamp && valB instanceof Timestamp) {
        return sortConfig.direction === 'asc' 
          ? valA.toMillis() - valB.toMillis() 
          : valB.toMillis() - valA.toMillis();
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortConfig.direction === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
      }

      return 0;
    });
    
    return result;
  }, [movimientos, filtro, sortConfig]);
  
  const totalPages = Math.ceil(movimientosFiltrados.length / itemsPerPage);

  const movimientosPaginados = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return movimientosFiltrados.slice(startIndex, startIndex + itemsPerPage);
  }, [movimientosFiltrados, currentPage, itemsPerPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, filtro, periodoFiltro]);

  const renderCantidad = (cantidad: number) => {
    if (cantidad === 0) return <span className="font-bold text-muted-foreground">{cantidad}</span>;
    const icono = cantidad > 0 ? <ArrowUp size={14}/> : <ArrowDown size={14}/>;
    const color = cantidad > 0 ? "text-emerald-600" : "text-destructive";
    const signo = cantidad > 0 ? "+" : "";

    return (
        <span className={cn("font-black flex items-center gap-1", color)}>
            {icono} {signo}{cantidad}
        </span>
    );
  }

  const renderTipoMovimiento = (tipo: HistorialInventario['tipoMovimiento']) => {
    let style = "bg-muted text-muted-foreground border-none font-bold";
    if (tipo === 'Venta') style = "bg-primary/10 text-primary border-none font-bold";
    if (tipo === 'Venta Anulada') style = "bg-destructive/10 text-destructive border-none font-bold";
    if (tipo === 'Compra') style = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-none font-bold";
    if (tipo === 'Ajuste') style = "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-none font-bold";
    
    return <Badge className={cn("text-[10px] rounded-full px-2.5 h-5", style)}>{tipo}</Badge>;
  }
  
  if (error) return <div className="text-center text-destructive p-4 font-body font-bold"><p>Error al cargar el historial: {error.message}</p></div>;

  const isLoading = isLoadingSucursal || isLoadingMovimientos || (periodoFiltro === 'actual' && cargandoEstadoCaja);

  const SortHeader = ({ label, sortKey, align = 'left' }: { label: string, sortKey: SortConfig['key'], align?: 'left' | 'center' | 'right' }) => (
    <TableHead 
      className={cn("cursor-pointer hover:bg-muted/50 transition-colors", align === 'center' && "text-center", align === 'right' && "text-right")}
      onClick={() => handleSort(sortKey)}
    >
      <div className={cn("flex items-center gap-2", align === 'center' && "justify-center", align === 'right' && "justify-end")}>
        <span className="font-bold text-muted-foreground text-[11px] tracking-tight">{label}</span>
        <ArrowUpDown className={cn("h-3 w-3 opacity-30", sortConfig.key === sortKey && "opacity-100 text-primary")} />
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-6 font-body max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className='w-full text-center sm:text-left'>
          <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2 text-foreground">
            <History className="h-6 w-6 text-primary"/>
            Movimiento de Productos
          </h1>
          <p className="text-sm text-muted-foreground hidden sm:block font-medium">
            Consulta el rastro detallado de entradas y salidas del inventario físico.
          </p>
        </div>
      </div>
      
      <Card className="border-muted/60 shadow-sm overflow-hidden rounded-2xl">
        <CardHeader className="p-5 bg-muted/5 border-b">
          <div className="flex flex-col md:flex-row gap-5 justify-between items-center">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por producto o referencia..."
                className="pl-10 rounded-full h-11 border-muted-foreground/20 bg-background"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Label htmlFor="periodo-select" className="text-[11px] font-bold text-muted-foreground hidden sm:block shrink-0">Período de Auditoría</Label>
              <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
                <SelectTrigger id="periodo-select" className="w-full sm:w-[280px] rounded-full h-11 border-muted-foreground/20 bg-background">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Seleccionar período" />
                  </div>
                </SelectTrigger>
                <SelectContent className="font-body max-h-[300px] rounded-xl shadow-2xl border-none">
                  <SelectItem value="actual" className="font-bold text-primary">Turno Actual (Abierto)</SelectItem>
                  <SelectItem value="todos">Todos los registros</SelectItem>
                  {cierres && cierres.length > 0 && (
                    <>
                      <Separator className="my-2" />
                      <p className="px-2 py-1 text-[10px] font-bold text-muted-foreground pl-4">Turnos Cerrados</p>
                      {cierres.map(c => (
                        <SelectItem key={c.id} value={c.id} className="text-xs font-medium">
                          Turno #{c.idCuadre} — {format(toDate(c.fecha), 'dd/MM/yy HH:mm')}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-80"><Loader2 className="h-10 w-10 animate-spin text-primary"/></div>
          ) : movimientosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-80 bg-muted/5 p-6">
                <FileText className="h-16 w-16 mb-4 text-primary/10" />
                <p className="font-bold text-lg text-foreground/80">{filtro ? "Sin resultados" : "No hay movimientos registrados"}</p>
                <p className="text-sm mt-1 font-medium">Los movimientos de stock para el período seleccionado aparecerán aquí.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/10 border-b">
                  <TableRow className="hover:bg-transparent border-none">
                    <SortHeader label="Fecha / Hora" sortKey="fecha" />
                    <SortHeader label="Producto / Detalle" sortKey="nombreProducto" />
                    <SortHeader label="Tipo" sortKey="tipoMovimiento" />
                    <TableHead className="font-bold text-[11px] text-muted-foreground">Referencia</TableHead>
                    <SortHeader label="Movimiento" sortKey="cantidad" align="center" />
                    <TableHead className="text-right font-bold text-[11px] text-muted-foreground pr-8">Auditoría Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="font-body">
                  {movimientosPaginados.map(m => (
                    <TableRow key={m.id} className="hover:bg-muted/10 transition-colors border-b last:border-0 border-muted-foreground/10">
                      <TableCell className="py-4">
                        <div className="flex flex-col min-w-[120px]">
                            <span className="font-bold text-foreground/90 text-sm leading-none">{format(toDate(m.fecha), "dd 'de' MMMM", { locale: es })}</span>
                            <span className="text-[10px] font-medium text-muted-foreground mt-1.5">{format(toDate(m.fecha), "hh:mm a", { locale: es })}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-muted/30 flex items-center justify-center text-primary/40">
                                <History className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-black text-sm text-foreground leading-tight truncate">{m.nombreProducto}</p>
                                <p className="text-[10px] font-bold text-muted-foreground truncate opacity-70">Inventario físico</p>
                            </div>
                        </div>
                      </TableCell>
                      <TableCell>{renderTipoMovimiento(m.tipoMovimiento)}</TableCell>
                      <TableCell>
                        <span className="text-[11px] font-bold text-muted-foreground/80 tracking-tight leading-none px-2.5 py-1 bg-muted/40 rounded-md border border-muted-foreground/10">
                            {m.referencia}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex items-center justify-center p-1 px-3 rounded-full border border-muted-foreground/10 bg-background min-w-[80px]">
                            {renderCantidad(m.cantidad)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-2">
                                <span className="font-black text-base text-primary tabular-nums tracking-tighter">{m.existenciaNueva}</span>
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground/60 tabular-nums uppercase">Antes: {m.existenciaAnterior}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        {totalPages > 1 && (
            <CardFooter className="flex flex-col items-center gap-4 border-t p-4 sm:flex-row sm:justify-between bg-muted/5">
                <div className="flex items-center space-x-2">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase">Filas por Página</p>
                    <Select
                        value={`${itemsPerPage}`}
                        onValueChange={(value) => setItemsPerPage(Number(value))}
                    >
                        <SelectTrigger className="h-8 w-[75px] rounded-full text-xs font-bold border-muted-foreground/20 bg-background">
                            <SelectValue placeholder={itemsPerPage} />
                        </SelectTrigger>
                        <SelectContent side="top" className="font-body rounded-xl border-none shadow-xl">
                            {[10, 20, 50, 100].map((pageSize) => (
                            <SelectItem key={pageSize} value={`${pageSize}`} className="font-medium">
                                {pageSize}
                            </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex w-full items-center justify-between sm:justify-center space-x-3 sm:w-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="h-9 px-4 rounded-full border-muted-foreground/20 bg-background font-bold text-xs"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Anterior
                    </Button>
                    <div className="flex-shrink-0 text-[11px] font-black text-muted-foreground px-2">
                        Página {currentPage} de {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="h-9 px-4 rounded-full border-muted-foreground/20 bg-background font-bold text-xs"
                    >
                        Siguiente
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
