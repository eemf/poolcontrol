'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, 
  ShoppingCart, 
  Trophy, 
  Loader2, 
  Landmark, 
  MinusCircle, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Clock, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';
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

interface FlujoMonedasProps {
  lista: any[];
  ventaNetaPeriodo: number;
  monedasIniciales: number;
  efectivoAcumuladoMonedas: number;
  inicioPeriodo: Date;
  isLoading: boolean;
}

export function FlujoMonedas({ 
  lista, 
  ventaNetaPeriodo, 
  monedasIniciales, 
  efectivoAcumuladoMonedas, 
  inicioPeriodo, 
  isLoading 
}: FlujoMonedasProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filtroTexto, setFiltroTexto] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'venta' | 'premio' | 'maquina'>('todos');

  // Existencia final calculada
  const existenciaFinal = useMemo(() => {
    if (!lista || lista.length === 0) return monedasIniciales;
    const sortedChronologically = [...lista].sort((a, b) => toDate(a.fecha).getTime() - toDate(b.fecha).getTime());
    return sortedChronologically[sortedChronologically.length - 1].stockAcumulado;
  }, [lista, monedasIniciales]);

  // Totales para métricas
  const estadisticas = useMemo(() => {
    let monedasVendidas = 0;
    let efectivoVentas = 0;
    let monedasPremios = 0;
    let efectivoPremios = 0;

    lista.forEach(m => {
      if (m.tipo === 'venta') {
        monedasVendidas += (m.cantidad || 0);
        efectivoVentas += (m.monto || 0);
      } else if (m.tipo === 'premio') {
        monedasPremios += (m.cantidad || 0);
        efectivoPremios += Math.abs(m.monto || 0);
      }
    });

    return { monedasVendidas, efectivoVentas, monedasPremios, efectivoPremios };
  }, [lista]);

  // Lista filtrada
  const listaFiltrada = useMemo(() => {
    let result = [...lista];

    if (filtroTexto.trim()) {
      const q = filtroTexto.trim().toLowerCase();
      result = result.filter(m => {
        const desc = (m.desc || '').toLowerCase();
        const ref = (m.ref || '').toLowerCase();
        return desc.includes(q) || ref.includes(q);
      });
    }

    if (tipoFiltro !== 'todos') {
      result = result.filter(m => {
        if (tipoFiltro === 'venta') return m.tipo === 'venta';
        if (tipoFiltro === 'premio') return m.tipo === 'premio';
        if (tipoFiltro === 'maquina') return m.tipo === 'base' || m.tipo === 'extraccion';
        return true;
      });
    }

    result.sort((a, b) => {
      const timeA = toDate(a.fecha).getTime();
      const timeB = toDate(b.fecha).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

    return result;
  }, [lista, filtroTexto, tipoFiltro, sortOrder]);

  return (
    <div className="space-y-6 outline-none animate-in fade-in-50 duration-300">
      {/* 1. Tarjetas de métricas de monedas y tragamonedas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Existencia Inicial */}
        <Card className="bg-[#283244] border-[#324157] shadow-sm rounded-xl overflow-hidden">
          <div className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">Existencia inicial</span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                <Coins className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
              {monedasIniciales}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Monedas al abrir turno</p>
          </div>
        </Card>

        {/* Monedas Vendidas */}
        <Card className="bg-[#283244] border-[#324157] shadow-sm rounded-xl overflow-hidden">
          <div className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">Venta de monedas</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <ShoppingCart className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-1">
              +Q{estadisticas.efectivoVentas.toFixed(2)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{estadisticas.monedasVendidas} monedas vendidas</p>
          </div>
        </Card>

        {/* Premios Pagados */}
        <Card className="bg-[#283244] border-[#324157] shadow-sm rounded-xl overflow-hidden">
          <div className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">Premios pagados</span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <Trophy className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black font-mono text-amber-400 mt-1">
              -Q{estadisticas.efectivoPremios.toFixed(2)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{estadisticas.monedasPremios} monedas canjeadas</p>
          </div>
        </Card>

        {/* Existencia Actual de Monedas */}
        <Card className="bg-[#17202e] border-purple-500/40 shadow-sm rounded-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full -mr-6 -mt-6 pointer-events-none" />
          <div className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-300">Stock actual en caja</span>
              <Badge className="bg-purple-500/20 text-purple-400 border-none text-[9px] px-1.5 py-0 rounded-full">
                Monedas
              </Badge>
            </div>
            <p className="text-xl sm:text-2xl font-black font-mono text-purple-300 mt-1">
              {existenciaFinal}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Neto período: <span className="text-emerald-400 font-bold font-mono">Q{ventaNetaPeriodo.toFixed(2)}</span>
            </p>
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
            placeholder="Buscar por cliente, descripción de premio o máquina..."
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
              onClick={() => setTipoFiltro('venta')}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors",
                tipoFiltro === 'venta' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-white"
              )}
            >
              Ventas
            </button>
            <button
              onClick={() => setTipoFiltro('premio')}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors",
                tipoFiltro === 'premio' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-white"
              )}
            >
              Premios
            </button>
            <button
              onClick={() => setTipoFiltro('maquina')}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors",
                tipoFiltro === 'maquina' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-white"
              )}
            >
              Máquinas
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

      {/* 3. Listado de movimientos de monedas */}
      <Card className="border border-[#324157] bg-[#17202e] shadow-sm rounded-xl overflow-hidden">
        {/* Encabezado */}
        <div className="p-3 sm:p-4 border-b border-[#324157] bg-[#17202e] flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-purple-400" />
            <span className="font-bold text-white">Auditoría de monedas y tragamonedas</span>
            <Badge className="bg-[#283244] text-white border-[#324157] font-mono text-[10px] rounded-full">
              {listaFiltrada.length} movimiento{listaFiltrada.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <span className="text-[11px] hidden sm:inline">Rastro de efectivo y existencia física</span>
        </div>

        <ScrollArea className="h-[440px]">
          <div className="divide-y divide-[#324157]/60">
            {/* Fila de Apertura (orden ASC) */}
            {sortOrder === 'asc' && (
              <div className="p-3.5 sm:p-4 flex items-center justify-between bg-purple-500/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                    <Coins className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      Apertura de monedas del período
                      <Badge className="text-[9px] bg-purple-500/20 text-purple-300 border-none rounded-full">Apertura</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Clock className="h-3 w-3" /> {format(inicioPeriodo, "dd/MM/yyyy hh:mm a", { locale: es })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black font-mono text-purple-300">
                    {monedasIniciales} monedas
                  </span>
                  <p className="text-[10px] text-muted-foreground">Existencia inicial</p>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center p-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : listaFiltrada.length === 0 ? (
              <div className="p-16 text-center text-muted-foreground text-xs italic">
                {filtroTexto ? "No se encontraron movimientos para esta búsqueda." : "No se registraron ventas ni premios en este turno."}
              </div>
            ) : (
              listaFiltrada.map((mov, idx) => {
                const getIcon = () => {
                  if (mov.tipo === 'venta') return <ShoppingCart className="h-4 w-4" />;
                  if (mov.tipo === 'premio') return <Trophy className="h-4 w-4" />;
                  if (mov.tipo === 'base') return <Landmark className="h-4 w-4" />;
                  if (mov.tipo === 'extraccion') return <MinusCircle className="h-4 w-4" />;
                  return <Coins className="h-4 w-4" />;
                };

                const getIconColor = () => {
                  if (mov.tipo === 'venta') return "bg-emerald-500/20 text-emerald-400";
                  if (mov.tipo === 'premio') return "bg-amber-500/20 text-amber-400";
                  if (mov.tipo === 'base') return "bg-indigo-500/20 text-indigo-300";
                  if (mov.tipo === 'extraccion') return "bg-blue-500/20 text-blue-400";
                  return "bg-purple-500/20 text-purple-400";
                };

                const getBadgeLabel = () => {
                  if (mov.tipo === 'venta') return 'Venta de monedas';
                  if (mov.tipo === 'premio') return 'Premio pagado';
                  if (mov.tipo === 'base') return 'Base de máquina';
                  if (mov.tipo === 'extraccion') return 'Extracción';
                  return 'Movimiento';
                };

                const esIngresoEfectivo = mov.monto > 0;
                const esGastoEfectivo = mov.monto < 0;

                return (
                  <div 
                    key={idx} 
                    className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-[#283244]/50 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs",
                        getIconColor()
                      )}>
                        {getIcon()}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-white truncate max-w-[180px] sm:max-w-[280px]">
                            {mov.desc}
                          </span>
                          <Badge className={cn(
                            "text-[9px] font-medium rounded-full px-1.5 py-0 border-none",
                            getIconColor()
                          )}>
                            {getBadgeLabel()}
                          </Badge>
                          {mov.ref && (
                            <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
                              Ref: {mov.ref}
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

                    {/* Importe e impacto en stock */}
                    <div className="text-right shrink-0">
                      {mov.monto !== 0 ? (
                        <p className={cn(
                          "text-sm sm:text-base font-black font-mono tabular-nums",
                          esIngresoEfectivo ? "text-emerald-400" : "text-amber-400"
                        )}>
                          {esIngresoEfectivo ? '+' : ''}Q{mov.monto.toFixed(2)}
                        </p>
                      ) : (
                        <p className="text-sm font-mono text-muted-foreground">--</p>
                      )}
                      <p className="text-[10px] font-mono text-purple-300 tabular-nums">
                        Stock: {mov.stockAcumulado} monedas ({mov.tipo === 'venta' || mov.tipo === 'base' ? '-' : '+'}{mov.cantidad})
                      </p>
                    </div>
                  </div>
                );
              })
            )}

            {/* Fila de Apertura (orden DESC) */}
            {sortOrder === 'desc' && (
              <div className="p-3.5 sm:p-4 flex items-center justify-between bg-purple-500/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                    <Coins className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      Apertura de monedas del período
                      <Badge className="text-[9px] bg-purple-500/20 text-purple-300 border-none rounded-full">Apertura</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Clock className="h-3 w-3" /> {format(inicioPeriodo, "dd/MM/yyyy hh:mm a", { locale: es })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black font-mono text-purple-300">
                    {monedasIniciales} monedas
                  </span>
                  <p className="text-[10px] text-muted-foreground">Existencia inicial</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
