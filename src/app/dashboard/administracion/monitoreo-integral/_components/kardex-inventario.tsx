'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PackageSearch, 
  Search, 
  History, 
  Loader2, 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Boxes,
  RotateCcw
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
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

interface KardexInventarioProps {
  inventario: any[] | null;
  isLoading: boolean;
}

export function KardexInventario({ inventario, isLoading }: KardexInventarioProps) {
  const [filtroTexto, setFiltroTexto] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'ventas' | 'entradas' | 'ajustes'>('todos');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Estadísticas del inventario en este período
  const estadisticas = useMemo(() => {
    if (!inventario) return { total: 0, entradas: 0, salidas: 0 };
    let entradas = 0;
    let salidas = 0;

    inventario.forEach(item => {
      const cant = Number(item.cantidad) || 0;
      if (cant > 0) entradas += cant;
      else if (cant < 0) salidas += Math.abs(cant);
    });

    return {
      total: inventario.length,
      entradas,
      salidas
    };
  }, [inventario]);

  const inventarioProcesado = useMemo(() => {
    if (!inventario) return [];
    let result = [...inventario];

    if (filtroTexto.trim()) {
      const q = filtroTexto.trim().toLowerCase();
      result = result.filter(item => 
        (item.nombreProducto || '').toLowerCase().includes(q) ||
        (item.tipoMovimiento || '').toLowerCase().includes(q) ||
        (item.referencia || '').toLowerCase().includes(q)
      );
    }

    if (tipoFiltro !== 'todos') {
      result = result.filter(item => {
        const tipo = (item.tipoMovimiento || '').toLowerCase();
        const cant = Number(item.cantidad) || 0;
        if (tipoFiltro === 'ventas') return tipo.includes('venta') || cant < 0;
        if (tipoFiltro === 'entradas') return cant > 0 || tipo.includes('entrada') || tipo.includes('compra');
        if (tipoFiltro === 'ajustes') return tipo.includes('ajuste');
        return true;
      });
    }

    result.sort((a, b) => {
      const timeA = toDate(a.fecha).getTime();
      const timeB = toDate(b.fecha).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

    return result;
  }, [inventario, filtroTexto, tipoFiltro, sortOrder]);

  return (
    <div className="space-y-6 outline-none animate-in fade-in-50 duration-300">
      {/* 1. Tarjetas de métricas del inventario */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Movimientos */}
        <Card className="bg-[#283244] border-[#324157] shadow-sm rounded-xl overflow-hidden">
          <div className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">Movimientos registrados</span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <Boxes className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
              {estadisticas.total}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Operaciones de stock</p>
          </div>
        </Card>

        {/* Salidas / Ventas */}
        <Card className="bg-[#283244] border-[#324157] shadow-sm rounded-xl overflow-hidden">
          <div className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">Unidades despachadas</span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <ArrowDownRight className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black font-mono text-amber-400 mt-1">
              -{estadisticas.salidas}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Ventas y consumo del local</p>
          </div>
        </Card>

        {/* Entradas */}
        <Card className="bg-[#283244] border-[#324157] shadow-sm rounded-xl overflow-hidden">
          <div className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">Unidades ingresadas</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-1">
              +{estadisticas.entradas}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Reposiciones y compras</p>
          </div>
        </Card>

        {/* Balance Neto */}
        <Card className="bg-[#17202e] border-primary/40 shadow-sm rounded-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-6 -mt-6 pointer-events-none" />
          <div className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-primary">Balance neto de stock</span>
              <Badge className="bg-primary/20 text-primary border-none text-[9px] px-1.5 py-0 rounded-full">
                Kardex
              </Badge>
            </div>
            <p className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
              {estadisticas.entradas - estadisticas.salidas > 0 ? '+' : ''}{estadisticas.entradas - estadisticas.salidas}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Variación neta en unidades</p>
          </div>
        </Card>
      </div>

      {/* 2. Barra de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary pointer-events-none" />
          <Input 
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            placeholder="Buscar por producto, referencia o motivo..."
            className="pl-10 pr-9 h-10 rounded-full bg-[#283244] border-[#324157] text-white placeholder:text-muted-foreground/70 focus-visible:ring-primary text-xs"
          />
          {filtroTexto && (
            <button
              onClick={() => setFiltroTexto('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filtros de tipo y orden */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-between sm:justify-end">
          <div className="flex items-center p-1 bg-[#283244] border border-[#324157] rounded-full text-xs">
            <button
              onClick={() => setTipoFiltro('todos')}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors",
                tipoFiltro === 'todos' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-white"
              )}
            >
              Todos
            </button>
            <button
              onClick={() => setTipoFiltro('ventas')}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors",
                tipoFiltro === 'ventas' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-white"
              )}
            >
              Ventas
            </button>
            <button
              onClick={() => setTipoFiltro('entradas')}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors",
                tipoFiltro === 'entradas' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-white"
              )}
            >
              Entradas
            </button>
            <button
              onClick={() => setTipoFiltro('ajustes')}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors",
                tipoFiltro === 'ajustes' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-white"
              )}
            >
              Ajustes
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="h-9 px-3 rounded-full text-xs bg-[#283244] border-[#324157] text-white hover:bg-[#324157] shrink-0 gap-1"
          >
            {sortOrder === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-primary" />}
            <span className="hidden sm:inline">{sortOrder === 'asc' ? 'Antiguos primero' : 'Recientes primero'}</span>
          </Button>
        </div>
      </div>

      {/* 3. Listado de movimientos de inventario */}
      <Card className="border border-[#324157] bg-[#17202e] shadow-sm rounded-xl overflow-hidden">
        {/* Encabezado */}
        <div className="p-3 sm:p-4 border-b border-[#324157] bg-[#17202e] flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <PackageSearch className="h-4 w-4 text-primary" />
            <span className="font-bold text-white">Kardex de movimientos físicos</span>
            <Badge className="bg-[#283244] text-white border-[#324157] font-mono text-[10px] rounded-full">
              {inventarioProcesado.length} registro{inventarioProcesado.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <span className="text-[11px] hidden sm:inline">Auditoría de existencias por producto</span>
        </div>

        <ScrollArea className="h-[440px]">
          <div className="divide-y divide-[#324157]/60">
            {isLoading ? (
              <div className="flex justify-center p-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : inventarioProcesado.length === 0 ? (
              <div className="p-16 text-center text-muted-foreground text-xs italic">
                {filtroTexto ? "No se encontraron movimientos para esta búsqueda." : "No hay movimientos de inventario físico registrados en este turno."}
              </div>
            ) : (
              inventarioProcesado.map((mov, idx) => {
                const cantidad = Number(mov.cantidad) || 0;
                const esEntrada = cantidad > 0;

                return (
                  <div 
                    key={idx} 
                    className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-[#283244]/50 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs",
                        esEntrada ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                      )}>
                        {esEntrada ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-white truncate max-w-[180px] sm:max-w-[280px]">
                            {mov.nombreProducto || 'Producto'}
                          </span>
                          <Badge variant="outline" className={cn(
                            "text-[9px] font-medium rounded-full px-1.5 py-0",
                            esEntrada ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" : "border-amber-500/40 text-amber-400 bg-amber-500/10"
                          )}>
                            {mov.tipoMovimiento || (esEntrada ? 'Entrada' : 'Salida')}
                          </Badge>
                          {mov.referencia && (
                            <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
                              Ref: {mov.referencia}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-primary/70" />
                            {format(toDate(mov.fecha), "hh:mm:ss a")}
                          </span>
                          <span>•</span>
                          <span className="hidden sm:inline">
                            {formatDistanceToNow(toDate(mov.fecha), { addSuffix: true, locale: es })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Variación y Saldo de Stock */}
                    <div className="text-right shrink-0">
                      <p className={cn(
                        "text-sm sm:text-base font-black font-mono tabular-nums",
                        esEntrada ? "text-emerald-400" : "text-amber-400"
                      )}>
                        {esEntrada ? `+${cantidad}` : cantidad}
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground tabular-nums">
                        Stock final: <span className="text-white font-bold">{mov.existenciaNueva ?? '--'}</span>
                        {mov.existenciaAnterior !== undefined && (
                          <span className="opacity-60 hidden sm:inline"> (Antes: {mov.existenciaAnterior})</span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
