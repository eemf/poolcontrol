'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import type { HistorialInventario } from '@/lib/tipos';
import { 
  PackageSearch, 
  Coins, 
  Search, 
  Loader2, 
  ArrowUp, 
  ArrowDown, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const toDate = (fecha: any): Date => {
  if (fecha instanceof Timestamp) return fecha.toDate();
  if (fecha instanceof Date) return fecha;
  if (typeof fecha === 'string') {
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(0);
};

interface ListaInventarioProps {
  movimientos: HistorialInventario[];
  isLoading: boolean;
  snapshotMonedas: any | null;
}

export function ListaInventario({ movimientos, isLoading, snapshotMonedas }: ListaInventarioProps) {
  const [filtro, setFiltro] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredMovimientos = useMemo(() => {
    let result = movimientos;
    
    if (filtro) {
      const f = filtro.toLowerCase();
      result = result.filter(m => 
        m.nombreProducto.toLowerCase().includes(f) || 
        m.tipoMovimiento.toLowerCase().includes(f) ||
        m.referencia.toLowerCase().includes(f)
      );
    }
    return result;
  }, [movimientos, filtro]);

  const totalPages = Math.ceil(filteredMovimientos.length / itemsPerPage);
  const paginatedMovimientos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMovimientos.slice(start, start + itemsPerPage);
  }, [filteredMovimientos, currentPage, itemsPerPage]);

  useEffect(() => { setCurrentPage(1); }, [filtro, itemsPerPage]);

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;
  
  return (
    <div className="space-y-4">
      {snapshotMonedas && (
        <Card className="bg-amber-50/50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800 overflow-hidden rounded-lg">
          <CardHeader className="p-3 pb-1.5">
            <CardTitle className="text-[10px] sm:text-xs font-bold flex items-center gap-2 text-amber-700 dark:text-amber-400 tracking-wide">
              <Coins className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Balance de monedas en cierre
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 grid grid-cols-3 gap-2 text-center">
            <div className='flex flex-col justify-center'>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium leading-tight mb-1">Existencia<br/>final</p>
              <p className="text-[11px] sm:text-sm font-bold">{snapshotMonedas.existencia}</p>
            </div>
            <div className="border-x flex flex-col justify-center">
              <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium leading-tight mb-1">Venta<br/>neta</p>
              <p className="text-[11px] sm:text-sm font-bold text-emerald-600">Q{snapshotMonedas.totalMonedasNetoPeriodo.toFixed(2)}</p>
            </div>
            <div className='flex flex-col justify-center'>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium leading-tight mb-1">Efectivo<br/>acumulado</p>
              <p className="text-[11px] sm:text-sm font-bold text-primary">Q{snapshotMonedas.efectivoAcumulado.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por producto, tipo o referencia..." 
            className="pl-9 h-10 rounded-full"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
      </div>

      {filteredMovimientos.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg bg-card-foreground/5">
          <PackageSearch className="h-10 w-10 mb-3 opacity-20" />
          <p className="font-semibold text-sm sm:text-base text-foreground">No se encontraron movimientos</p>
          <p className="text-[10px] sm:text-xs">Intenta con otro término de búsqueda.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {paginatedMovimientos.sort((a,b) => toDate(b.fecha).getTime() - toDate(a.fecha).getTime()).map((mov, idx) => {
              const esEntrada = mov.cantidad > 0;
              return (
                <div key={idx} className={cn("flex items-center gap-2.5 p-2.5 border rounded-lg transition-all bg-card-foreground/5 shadow-sm")}>
                  <div className={cn(
                    "hidden sm:flex h-9 w-9 rounded-full items-center justify-center flex-shrink-0",
                    esEntrada ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                  )}>
                    {esEntrada ? <ArrowUp className="h-4 w-4"/> : <ArrowDown className="h-4 w-4"/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[11px] sm:text-sm truncate text-foreground leading-none text-left font-body">{mov.nombreProducto}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <Badge variant="secondary" className="text-[8px] sm:text-[9px] font-bold tracking-wider h-4 px-1.5 leading-none">{mov.tipoMovimiento}</Badge>
                      <span className="text-[8px] sm:text-[9px] text-muted-foreground truncate font-medium">Ref: {mov.referencia}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[9px] sm:text-[10px] font-medium text-muted-foreground">
                      <span className="flex items-center gap-1 shrink-0">Antes: <span className="text-foreground font-semibold">{mov.existenciaAnterior}</span></span>
                      <ArrowRight className="h-2 w-2 opacity-50 shrink-0" />
                      <span className="flex items-center gap-1 shrink-0">Después: <span className="font-bold text-foreground">{mov.existenciaNueva}</span></span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1 shrink-0">
                    <p className={cn("font-bold text-xs sm:text-base tabular-nums leading-none", esEntrada ? "text-emerald-600" : "text-destructive")}>
                      {esEntrada ? '+' : ''}{mov.cantidad}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium tabular-nums opacity-80">
                      {format(toDate(mov.fecha), "hh:mm a", { locale: es })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 mt-4 border-t bg-muted/5 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">Filas por pág.</p>
              <Select value={String(itemsPerPage)} onValueChange={(v) => setItemsPerPage(Number(v))}>
                <SelectTrigger className="h-8 w-[70px] rounded-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 30, 50, 100].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-full items-center justify-center space-x-2 sm:w-auto">
              <Button variant="outline" size="sm" className="px-2.5 sm:px-4 rounded-full" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="sm:hidden text-[10px]">Ant.</span>
                <span className="hidden sm:inline text-xs">Anterior</span>
              </Button>
              <div className="flex-shrink-0 text-[10px] sm:text-xs font-bold text-muted-foreground tracking-widest px-1">
                Página {currentPage} de {totalPages || 1}
              </div>
              <Button variant="outline" size="sm" className="px-2.5 sm:px-4 rounded-full" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                <span className="hidden sm:inline text-xs">Siguiente</span>
                <span className="sm:hidden text-[10px]">Sig.</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
