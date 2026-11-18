'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PillTabs, SurfaceCard } from '@/components/comunes';
import { 
  Coins, 
  ShoppingCart, 
  Trophy, 
  Loader2, 
  Landmark, 
  MinusCircle, 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Banknote,
  Search,
  X,
  SlidersHorizontal
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
  efectivoInicialMonedas?: number;
  efectivoAcumuladoMonedas: number;
  inicioPeriodo: Date;
  isLoading: boolean;
}

export function FlujoMonedas({ 
  lista, 
  monedasIniciales, 
  efectivoInicialMonedas = 0,
  inicioPeriodo, 
  isLoading 
}: FlujoMonedasProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filtroTexto, setFiltroTexto] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'ventas_despachos' | 'premios' | 'maquinas'>('todos');
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const tieneFiltrosActivos = tipoFiltro !== 'todos' || sortOrder !== 'desc';

  // Conteo de elementos por categoría
  const conteos = useMemo(() => {
    let ventasDespachos = 0;
    let premios = 0;
    let maquinas = 0;

    lista.forEach((m) => {
      if (
        m.tipo === 'venta_rapida' ||
        m.tipo === 'venta' ||
        m.tipo === 'abono' ||
        m.tipo === 'cobro' ||
        m.tipo === 'despacho' ||
        m.tipo === 'eliminacion'
      ) {
        ventasDespachos++;
      }
      if (m.tipo === 'premio') {
        premios++;
      }
      if (m.tipo === 'base' || m.tipo === 'extraccion' || m.tipo === 'ajuste') {
        maquinas++;
      }
    });

    return {
      todos: lista.length,
      ventasDespachos,
      premios,
      maquinas,
    };
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
        if (tipoFiltro === 'ventas_despachos') {
          return (
            m.tipo === 'venta_rapida' ||
            m.tipo === 'venta' ||
            m.tipo === 'abono' ||
            m.tipo === 'cobro' ||
            m.tipo === 'despacho' ||
            m.tipo === 'eliminacion'
          );
        }
        if (tipoFiltro === 'premios') {
          return m.tipo === 'premio';
        }
        if (tipoFiltro === 'maquinas') {
          return m.tipo === 'base' || m.tipo === 'extraccion' || m.tipo === 'ajuste';
        }
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
    <div className="space-y-4 outline-none animate-in fade-in-50 duration-300 font-body">
      {/* 1. Control de búsqueda con botón externo de opciones a la par */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 w-full">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              ref={searchInputRef}
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              placeholder="Buscar por cliente, descripción de premio o máquina..."
              className="pl-10 pr-9 rounded-full h-10 text-xs shadow-sm"
            />
            {filtroTexto && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setFiltroTexto('');
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                title="Limpiar búsqueda"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={() => setMostrarOpciones((prev) => !prev)}
            title={mostrarOpciones ? 'Ocultar opciones y orden' : 'Mostrar opciones y orden'}
            aria-label={mostrarOpciones ? 'Ocultar opciones y orden' : 'Mostrar opciones y orden'}
            className={cn(
              'h-10 w-10 sm:w-auto sm:px-3.5 rounded-full border text-xs font-semibold gap-1.5 shrink-0 transition-colors relative',
              mostrarOpciones
                ? 'bg-sky-600 border-sky-500 text-white hover:bg-sky-500 hover:text-white shadow-sm'
                : tieneFiltrosActivos
                ? 'bg-[#252526] border-sky-500/60 text-sky-400 hover:bg-[#313131] hover:text-sky-300'
                : 'bg-[#252526] border-[#2e2e2e] text-slate-300 hover:bg-[#313131] hover:text-white'
            )}
          >
            <SlidersHorizontal className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{mostrarOpciones ? 'Ocultar' : 'Opciones'}</span>
            {tieneFiltrosActivos && !mostrarOpciones && (
              <span className="sm:hidden absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-sky-400" />
            )}
          </Button>
        </div>

        {/* Opciones selector y ordenamiento desplegables */}
        {mostrarOpciones && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-0.5 animate-in fade-in-50 duration-200">
            <div className="flex-1 min-w-0">
              <PillTabs
                value={tipoFiltro}
                onValueChange={(val) => setTipoFiltro(val as 'todos' | 'ventas_despachos' | 'premios' | 'maquinas')}
                tabs={[
                  {
                    id: 'todos',
                    label: 'Todos',
                    count: conteos.todos,
                    badgeVariant: tipoFiltro === 'todos' ? 'amber' : 'slate',
                  },
                  {
                    id: 'ventas_despachos',
                    label: 'Ventas y Despachos',
                    count: conteos.ventasDespachos,
                    badgeVariant: tipoFiltro === 'ventas_despachos' ? 'amber' : 'slate',
                  },
                  {
                    id: 'premios',
                    label: 'Premios',
                    count: conteos.premios,
                    badgeVariant: tipoFiltro === 'premios' ? 'amber' : 'slate',
                  },
                  {
                    id: 'maquinas',
                    label: 'Máquinas',
                    count: conteos.maquinas,
                    badgeVariant: tipoFiltro === 'maquinas' ? 'amber' : 'slate',
                  },
                ]}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="h-10 sm:h-11 px-4 rounded-full text-xs bg-[#252526] border-[#2e2e2e] text-slate-200 hover:text-white hover:bg-[#313131] shrink-0 gap-1.5 font-semibold"
            >
              {sortOrder === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-sky-400" /> : <ArrowDown className="h-3.5 w-3.5 text-sky-400" />}
              <span>{sortOrder === 'asc' ? 'Antiguos primero' : 'Recientes primero'}</span>
            </Button>
          </div>
        )}
      </div>

      {/* 2. Contenedores individuales de monedas (Cards) */}
      <div className="space-y-2.5">
        {/* Fila de Apertura (orden ASC) */}
        {sortOrder === 'asc' && (
          <SurfaceCard
            variant="subcard"
            className="p-3.5 sm:p-4 flex items-center justify-between border-purple-500/30 bg-[#1e1e1e] transition-all gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="hidden sm:flex h-10 w-10 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 items-center justify-center shrink-0">
                <Coins className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm sm:text-base text-white flex items-center gap-2 flex-wrap">
                  <span>Apertura de monedas del período</span>
                  <Badge className="text-[10px] bg-purple-500/20 text-purple-300 border-none rounded-full px-2 py-0.5 flex items-center gap-1">
                    <Coins className="h-2.5 w-2.5 sm:hidden" />
                    <span>Apertura</span>
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
                  <Clock className="h-3 w-3 text-slate-500" /> {format(inicioPeriodo, "dd/MM/yyyy hh:mm a", { locale: es })}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-baseline justify-end gap-1.5">
                <span className="text-[11px] text-slate-400 font-medium">Efectivo:</span>
                <span className="text-sm sm:text-base font-bold text-emerald-400 tabular-nums">
                  Q{efectivoInicialMonedas.toFixed(2)}
                </span>
              </div>
              <p className="text-[10px] font-bold text-purple-300 tabular-nums mt-0.5">
                Stock: {monedasIniciales} monedas
              </p>
              <p className="text-[9px] text-slate-400 font-medium">Existencia y saldo inicial</p>
            </div>
          </SurfaceCard>
        )}

        {isLoading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
          </div>
        ) : listaFiltrada.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-slate-400 py-16 border-2 border-dashed border-[#2e2e2e] rounded-xl bg-[#252526]/40 p-4">
            <Coins className="h-10 w-10 mb-3 opacity-30 text-slate-500" />
            <p className="font-bold text-sm text-white">
              {filtroTexto ? "No se encontraron movimientos para esta búsqueda" : "No se registraron ventas ni premios en este turno"}
            </p>
            <p className="text-xs text-slate-400 mt-1">Los movimientos de fichas y tragamonedas aparecerán aquí.</p>
          </div>
        ) : (
          listaFiltrada.map((mov, idx) => {
            const getIcon = (isMini: boolean = false) => {
              const cls = isMini ? "h-2.5 w-2.5" : "h-4 w-4";
              if (mov.tipo === 'venta_rapida' || mov.tipo === 'venta') return <ShoppingCart className={cls} />;
              if (mov.tipo === 'despacho') return <ArrowDownRight className={cls} />;
              if (mov.tipo === 'eliminacion') return <ArrowUpRight className={cls} />;
              if (mov.tipo === 'abono' || mov.tipo === 'cobro') return <Banknote className={cls} />;
              if (mov.tipo === 'premio') return <Trophy className={cls} />;
              if (mov.tipo === 'base') return <Landmark className={cls} />;
              if (mov.tipo === 'extraccion') return <MinusCircle className={cls} />;
              return <Coins className={cls} />;
            };

            const getIconColor = () => {
              if (mov.tipo === 'venta_rapida' || mov.tipo === 'venta') return "bg-emerald-500/15 border-emerald-500/30 text-emerald-400";
              if (mov.tipo === 'despacho') return "bg-sky-500/15 border-sky-500/30 text-sky-400";
              if (mov.tipo === 'eliminacion') return "bg-amber-500/15 border-amber-500/30 text-amber-400";
              if (mov.tipo === 'abono' || mov.tipo === 'cobro') return "bg-emerald-500/15 border-emerald-500/30 text-emerald-300";
              if (mov.tipo === 'premio') return "bg-purple-500/15 border-purple-500/30 text-purple-400";
              if (mov.tipo === 'base') return "bg-indigo-500/15 border-indigo-500/30 text-indigo-300";
              if (mov.tipo === 'extraccion') return "bg-cyan-500/15 border-cyan-500/30 text-cyan-400";
              return "bg-slate-500/15 border-slate-500/30 text-slate-300";
            };

            const getBadgeLabel = () => {
              if (mov.tipo === 'venta_rapida' || mov.tipo === 'venta') return 'Venta rápida';
              if (mov.tipo === 'despacho') return 'Despacho a cuenta';
              if (mov.tipo === 'eliminacion') return 'Monedas devueltas';
              if (mov.tipo === 'abono' || mov.tipo === 'cobro') return 'Cobro / Abono';
              if (mov.tipo === 'premio') return 'Premio pagado';
              if (mov.tipo === 'base') return 'Base de máquina';
              if (mov.tipo === 'extraccion') return 'Extracción';
              if (mov.tipo === 'ajuste') return 'Ajuste manual';
              return 'Movimiento';
            };

            const esIngresoEfectivo = mov.monto > 0;

            return (
              <SurfaceCard 
                key={idx} 
                variant="surface"
                className="p-3.5 sm:p-4 flex items-center justify-between hover:border-[#383838] transition-all gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "hidden sm:flex h-10 w-10 rounded-full items-center justify-center shrink-0 border",
                    getIconColor()
                  )}>
                    {getIcon(false)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm sm:text-base text-white truncate max-w-[180px] sm:max-w-[280px]">
                        {mov.desc}
                      </span>
                      <Badge className={cn(
                        "text-[10px] font-semibold rounded-full px-2 py-0.5 border-none flex items-center gap-1",
                        getIconColor()
                      )}>
                        <span className="sm:hidden">{getIcon(true)}</span>
                        <span>{getBadgeLabel()}</span>
                      </Badge>
                      {mov.ref && (
                        <span className="text-[10px] text-slate-400 truncate hidden sm:inline font-medium">
                          Ref: {mov.ref}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-500" />
                        {format(toDate(mov.fecha), "hh:mm:ss a")}
                      </span>
                      <span>•</span>
                      <span className="hidden sm:inline">
                        {formatDistanceToNow(toDate(mov.fecha), { addSuffix: true, locale: es })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Importe e impacto en stock y efectivo */}
                <div className="text-right shrink-0">
                  <div className="flex items-baseline justify-end gap-1.5">
                    {mov.monto !== 0 ? (
                      <span className={cn(
                        "text-sm sm:text-base font-bold tabular-nums",
                        esIngresoEfectivo ? "text-emerald-400" : "text-amber-400"
                      )}>
                        {esIngresoEfectivo ? '+' : ''}Q{mov.monto.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">--</span>
                    )}
                  </div>

                  {/* Efectivo acumulado de monedas en el período */}
                  <p className="text-[10px] text-slate-400 tabular-nums mt-0.5 font-medium">
                    Efectivo en período: <span className={cn(
                      "font-bold",
                      (mov.cashAcumulado ?? 0) >= 0 ? "text-white" : "text-amber-400"
                    )}>
                      Q{(mov.cashAcumulado ?? 0).toFixed(2)}
                    </span>
                  </p>

                  {/* Stock acumulado de monedas */}
                  <p className="text-[10px] text-purple-300 tabular-nums font-medium">
                    Stock: <span className="font-bold">{mov.stockAcumulado} monedas</span>{' '}
                    {mov.tipo === 'abono' || mov.tipo === 'cobro' ? (
                      <span className="text-slate-400 font-normal">(Cobro sin salida de stock)</span>
                    ) : mov.tipo === 'despacho' || mov.tipo === 'venta_rapida' || mov.tipo === 'venta' || mov.tipo === 'base' ? (
                      <span className="text-amber-400 font-bold">(-{mov.cantidad})</span>
                    ) : (
                      <span className="text-emerald-400 font-bold">(+{mov.cantidad})</span>
                    )}
                  </p>
                </div>
              </SurfaceCard>
            );
          })
        )}

        {/* Fila de Apertura (orden DESC) */}
        {sortOrder === 'desc' && (
          <SurfaceCard
            variant="subcard"
            className="p-3.5 sm:p-4 flex items-center justify-between border-purple-500/30 bg-[#1e1e1e] transition-all gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="hidden sm:flex h-10 w-10 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 items-center justify-center shrink-0">
                <Coins className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm sm:text-base text-white flex items-center gap-2 flex-wrap">
                  <span>Apertura de monedas del período</span>
                  <Badge className="text-[10px] bg-purple-500/20 text-purple-300 border-none rounded-full px-2 py-0.5 flex items-center gap-1">
                    <Coins className="h-2.5 w-2.5 sm:hidden" />
                    <span>Apertura</span>
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
                  <Clock className="h-3 w-3 text-slate-500" /> {format(inicioPeriodo, "dd/MM/yyyy hh:mm a", { locale: es })}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-baseline justify-end gap-1.5">
                <span className="text-[11px] text-slate-400 font-medium">Efectivo:</span>
                <span className="text-sm sm:text-base font-bold text-emerald-400 tabular-nums">
                  Q{efectivoInicialMonedas.toFixed(2)}
                </span>
              </div>
              <p className="text-[10px] font-bold text-purple-300 tabular-nums mt-0.5">
                Stock: {monedasIniciales} monedas
              </p>
              <p className="text-[9px] text-slate-400 font-medium">Existencia y saldo inicial</p>
            </div>
          </SurfaceCard>
        )}
      </div>
    </div>
  );
}
