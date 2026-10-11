'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Banknote, 
  Clock, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  ReceiptText, 
  Sparkles, 
  Filter, 
  Layers,
  ArrowUpRight
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

interface FlujoGavetaProps {
  resumen: {
    inicial: number;
    ventas: number;
    alquileres: number;
    totalGaveta: number;
  };
  flujo: any[];
  inicioPeriodo: Date;
}

export function FlujoGaveta({ resumen, flujo, inicioPeriodo }: FlujoGavetaProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filtroTexto, setFiltroTexto] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'consumo' | 'alquiler'>('todos');

  // Filtrado y ordenamiento de pagos
  const flujoFiltrado = useMemo(() => {
    let result = [...flujo];

    if (filtroTexto.trim()) {
      const q = filtroTexto.trim().toLowerCase();
      result = result.filter(p => {
        const cliente = (p.clienteNombre || '').toLowerCase();
        const idPago = String(p.idPago || '');
        const idVenta = String(p.idVenta || '');
        return cliente.includes(q) || idPago.includes(q) || idVenta.includes(q);
      });
    }

    if (tipoFiltro !== 'todos') {
      result = result.filter(p => {
        const tieneAlquiler = p.itemsSaldados?.some((it: any) => {
          const n = (it.nombreProducto || '').toLowerCase();
          const id = (it.idProducto || '').toLowerCase();
          return n.includes('mesa #') || n.includes('consola #') || id.startsWith('mesa-') || id.startsWith('division-mesa-');
        });

        if (tipoFiltro === 'alquiler') return tieneAlquiler;
        if (tipoFiltro === 'consumo') return !tieneAlquiler;
        return true;
      });
    }

    result.sort((a, b) => {
      const timeA = toDate(a.fecha).getTime();
      const timeB = toDate(b.fecha).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

    return result;
  }, [flujo, filtroTexto, tipoFiltro, sortOrder]);

  return (
    <div className="space-y-6 outline-none animate-in fade-in-50 duration-300">
      {/* 1. Tarjetas de métricas del flujo de gaveta */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Fondo Inicial */}
        <Card className="bg-[#283244] border-[#324157] shadow-sm rounded-xl overflow-hidden">
          <div className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">Fondo inicial</span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <Banknote className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
              Q{resumen.inicial.toFixed(2)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Efectivo base de apertura</p>
          </div>
        </Card>

        {/* Ventas de Consumo */}
        <Card className="bg-[#283244] border-[#324157] shadow-sm rounded-xl overflow-hidden">
          <div className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">Ventas de productos</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-1">
              +Q{resumen.ventas.toFixed(2)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Bebidas, snacks y mostrador</p>
          </div>
        </Card>

        {/* Alquileres de Mesas */}
        <Card className="bg-[#283244] border-[#324157] shadow-sm rounded-xl overflow-hidden">
          <div className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">Alquiler de mesas</span>
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black font-mono text-indigo-300 mt-1">
              +Q{resumen.alquileres.toFixed(2)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Mesas de billar y consolas</p>
          </div>
        </Card>

        {/* Total en Gaveta */}
        <Card className="bg-[#17202e] border-emerald-500/40 shadow-sm rounded-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full -mr-6 -mt-6 pointer-events-none" />
          <div className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-300">Total en gaveta</span>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[9px] px-1.5 py-0 rounded-full">
                Efectivo
              </Badge>
            </div>
            <p className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-1">
              Q{resumen.totalGaveta.toFixed(2)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Saldo acumulado físico</p>
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
            placeholder="Buscar por cliente, # comprobante o # venta..."
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
              onClick={() => setTipoFiltro('consumo')}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors",
                tipoFiltro === 'consumo' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-white"
              )}
            >
              Productos
            </button>
            <button
              onClick={() => setTipoFiltro('alquiler')}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors",
                tipoFiltro === 'alquiler' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-white"
              )}
            >
              Mesas
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

      {/* 3. Listado de movimientos de gaveta */}
      <Card className="border border-[#324157] bg-[#17202e] shadow-sm rounded-xl overflow-hidden">
        {/* Encabezado de la tabla */}
        <div className="p-3 sm:p-4 border-b border-[#324157] bg-[#17202e] flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ReceiptText className="h-4 w-4 text-primary" />
            <span className="font-bold text-white">Registro cronológico de cobros</span>
            <Badge className="bg-[#283244] text-white border-[#324157] font-mono text-[10px] rounded-full">
              {flujoFiltrado.length} movimiento{flujoFiltrado.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <span className="text-[11px] hidden sm:inline">Impacto en gaveta y fondo acumulado</span>
        </div>

        <ScrollArea className="h-[440px]">
          <div className="divide-y divide-[#324157]/60">
            {/* Fila de Apertura (si orden es ASC) */}
            {sortOrder === 'asc' && (
              <div className="p-3.5 sm:p-4 flex items-center justify-between bg-primary/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      Fondo inicial de caja (gaveta)
                      <Badge className="text-[9px] bg-primary/20 text-primary border-none rounded-full">Apertura</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Clock className="h-3 w-3" /> {format(inicioPeriodo, "dd/MM/yyyy hh:mm a", { locale: es })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black font-mono text-primary">
                    Q{resumen.inicial.toFixed(2)}
                  </span>
                  <p className="text-[10px] text-muted-foreground">Saldo inicial</p>
                </div>
              </div>
            )}

            {/* Listado dinámico de cobros */}
            {flujoFiltrado.length === 0 ? (
              <div className="p-16 text-center text-muted-foreground text-xs italic">
                {filtroTexto ? "No se encontraron cobros para esta búsqueda." : "Sin cobros en efectivo registrados en este turno."}
              </div>
            ) : (
              flujoFiltrado.map((pago, idx) => {
                const tieneAlquiler = pago.itemsSaldados?.some((it: any) => {
                  const n = (it.nombreProducto || '').toLowerCase();
                  const id = (it.idProducto || '').toLowerCase();
                  return n.includes('mesa #') || n.includes('consola #') || id.startsWith('mesa-') || id.startsWith('division-mesa-');
                });

                return (
                  <div 
                    key={pago.idPago || idx} 
                    className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-[#283244]/50 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs",
                        tieneAlquiler ? "bg-indigo-500/20 text-indigo-300" : "bg-emerald-500/20 text-emerald-400"
                      )}>
                        {tieneAlquiler ? <Layers className="h-4 w-4" /> : <Banknote className="h-4 w-4" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-white truncate max-w-[160px] sm:max-w-[260px]">
                            {pago.clienteNombre || 'Consumidor final'}
                          </span>
                          <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                            Pago #{pago.idPago}
                          </span>
                          {pago.idVenta && (
                            <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">
                              Venta #{pago.idVenta}
                            </span>
                          )}
                          <Badge className={cn(
                            "text-[9px] font-medium rounded-full px-1.5 py-0 border-none",
                            tieneAlquiler ? "bg-indigo-500/20 text-indigo-300" : "bg-emerald-500/20 text-emerald-400"
                          )}>
                            {tieneAlquiler ? 'Alquiler de mesa' : 'Consumo'}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-primary/70" />
                            {format(toDate(pago.fecha), "hh:mm:ss a")}
                          </span>
                          <span>•</span>
                          <span className="hidden sm:inline">
                            {formatDistanceToNow(toDate(pago.fecha), { addSuffix: true, locale: es })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Importes */}
                    <div className="text-right shrink-0">
                      <p className="text-sm sm:text-base font-black font-mono text-emerald-400 tabular-nums">
                        +Q{pago.montoConsumo.toFixed(2)}
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground tabular-nums">
                        Fondo: Q{pago.saldoAcumulado.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}

            {/* Fila de Apertura (si orden es DESC) */}
            {sortOrder === 'desc' && (
              <div className="p-3.5 sm:p-4 flex items-center justify-between bg-primary/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      Fondo inicial de caja (gaveta)
                      <Badge className="text-[9px] bg-primary/20 text-primary border-none rounded-full">Apertura</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Clock className="h-3 w-3" /> {format(inicioPeriodo, "dd/MM/yyyy hh:mm a", { locale: es })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black font-mono text-primary">
                    Q{resumen.inicial.toFixed(2)}
                  </span>
                  <p className="text-[10px] text-muted-foreground">Saldo inicial</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
