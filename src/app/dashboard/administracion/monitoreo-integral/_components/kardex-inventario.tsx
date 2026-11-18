'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PillTabs, SurfaceCard } from '@/components/comunes';
import { 
  PackageSearch, 
  Loader2, 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  RotateCcw,
  Search,
  X,
  SlidersHorizontal
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
  productos?: any[];
  inicioPeriodo: Date;
  isLoading: boolean;
}

export function KardexInventario({ 
  inventario, 
  productos, 
  inicioPeriodo, 
  isLoading 
}: KardexInventarioProps) {
  const [filtroTexto, setFiltroTexto] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'ventas' | 'entradas' | 'eliminados' | 'ajustes'>('todos');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const tieneFiltrosActivos = tipoFiltro !== 'todos' || sortOrder !== 'desc';

  // Cálculo de la existencia inicial de cada producto al inicio del período
  const aperturasPorProducto = useMemo(() => {
    const map = new Map<string, {
      productoId: string;
      nombreProducto: string;
      existenciaInicial: number;
      fecha: Date;
    }>();

    // 1. Extraer del primer movimiento cronológico de cada producto en el historial del período
    if (inventario && inventario.length > 0) {
      const cronologico = [...inventario].sort((a, b) => {
        return toDate(a.fecha).getTime() - toDate(b.fecha).getTime();
      });

      cronologico.forEach((item) => {
        const key = item.productoId || item.nombreProducto;
        if (!key) return;

        if (!map.has(key)) {
          map.set(key, {
            productoId: item.productoId || '',
            nombreProducto: item.nombreProducto || 'Producto',
            existenciaInicial: item.existenciaAnterior !== undefined ? Number(item.existenciaAnterior) : 0,
            fecha: inicioPeriodo,
          });
        }
      });
    }

    // 2. Si se busca un producto en el catálogo y no tuvo movimientos en este turno
    if (productos && productos.length > 0 && filtroTexto.trim()) {
      const q = filtroTexto.trim().toLowerCase();
      productos.forEach((p) => {
        const nombre = p.nombre || '';
        if (nombre.toLowerCase().includes(q)) {
          const key = p.id || p.nombre;
          if (!map.has(key)) {
            map.set(key, {
              productoId: p.id,
              nombreProducto: p.nombre,
              existenciaInicial: Number(p.existencia) || 0,
              fecha: inicioPeriodo,
            });
          }
        }
      });
    }

    let aperturas = Array.from(map.values());

    if (filtroTexto.trim()) {
      const q = filtroTexto.trim().toLowerCase();
      aperturas = aperturas.filter(a => a.nombreProducto.toLowerCase().includes(q));
    }

    aperturas.sort((a, b) => a.nombreProducto.localeCompare(b.nombreProducto));
    return aperturas;
  }, [inventario, productos, inicioPeriodo, filtroTexto]);

  // Estadísticas del inventario en este período
  const estadisticas = useMemo(() => {
    if (!inventario) return { total: 0, entradas: 0, salidas: 0, eliminados: 0, ajustes: 0, unidadesEliminadas: 0 };
    let entradas = 0;
    let salidas = 0;
    let eliminados = 0;
    let ajustes = 0;
    let unidadesEliminadas = 0;

    inventario.forEach(item => {
      const cant = Number(item.cantidad) || 0;
      const tipo = (item.tipoMovimiento || '').toLowerCase();
      const ref = (item.referencia || '').toLowerCase();
      const esElim = tipo.includes('elimin') || tipo.includes('anula') || ref.includes('elimin') || ref.includes('anula');

      if (esElim) {
        eliminados++;
        unidadesEliminadas += Math.abs(cant);
      } else if (tipo.includes('ajuste')) {
        ajustes++;
      } else if (tipo.includes('venta') || cant < 0) {
        salidas++;
      } else if (cant > 0 || tipo.includes('entrada') || tipo.includes('compra')) {
        entradas++;
      }
    });

    return {
      total: inventario.length,
      entradas,
      salidas,
      eliminados,
      ajustes,
      unidadesEliminadas
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
        const ref = (item.referencia || '').toLowerCase();
        const esElim = tipo.includes('elimin') || tipo.includes('anula') || ref.includes('elimin') || ref.includes('anula');

        if (tipoFiltro === 'eliminados') return esElim;
        if (tipoFiltro === 'ventas') return (tipo.includes('venta') && !esElim) || (cant < 0 && !esElim);
        if (tipoFiltro === 'entradas') return (cant > 0 || tipo.includes('entrada') || tipo.includes('compra')) && !esElim;
        if (tipoFiltro === 'ajustes') return tipo.includes('ajuste') && !esElim;
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

  const mostrarAperturas = (tipoFiltro === 'todos' || filtroTexto.trim().length > 0) && aperturasPorProducto.length > 0;

  // Total de unidades vendidas en el período para la búsqueda actual (ej. "cocacola")
  const resumenVentasBusqueda = useMemo(() => {
    const q = filtroTexto.trim().toLowerCase();
    if (!q || !inventario) return null;
    let unidadesVendidas = 0;
    let operacionesVenta = 0;

    inventario.forEach((item) => {
      const nombre = (item.nombreProducto || '').toLowerCase();
      const tipo = (item.tipoMovimiento || '').toLowerCase();
      const ref = (item.referencia || '').toLowerCase();
      const matches = nombre.includes(q) || tipo.includes(q) || ref.includes(q);
      if (!matches) return;

      const cant = Number(item.cantidad) || 0;
      const esElim = tipo.includes('elimin') || tipo.includes('anula') || ref.includes('elimin') || ref.includes('anula');
      const esAjuste = tipo.includes('ajuste');
      const esVenta = !esElim && !esAjuste && (tipo.includes('venta') || cant < 0);

      if (esVenta) {
        unidadesVendidas += Math.abs(cant);
        operacionesVenta++;
      }
    });

    return {
      unidadesVendidas,
      operacionesVenta,
      existenciaInicialUnica: aperturasPorProducto.length === 1 ? aperturasPorProducto[0].existenciaInicial : null,
      productoUnico: aperturasPorProducto.length === 1 ? aperturasPorProducto[0].nombreProducto : null,
    };
  }, [filtroTexto, inventario, aperturasPorProducto]);

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
              placeholder="Buscar por producto, referencia o motivo..."
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
                onValueChange={(val) => setTipoFiltro(val as 'todos' | 'ventas' | 'entradas' | 'eliminados' | 'ajustes')}
                tabs={[
                  {
                    id: 'todos',
                    label: 'Todos',
                    count: estadisticas.total,
                    badgeVariant: tipoFiltro === 'todos' ? 'amber' : 'slate',
                  },
                  {
                    id: 'ventas',
                    label: 'Ventas',
                    count: estadisticas.salidas,
                    badgeVariant: tipoFiltro === 'ventas' ? 'amber' : 'slate',
                  },
                  {
                    id: 'entradas',
                    label: 'Entradas',
                    count: estadisticas.entradas,
                    badgeVariant: tipoFiltro === 'entradas' ? 'amber' : 'slate',
                  },
                  {
                    id: 'eliminados',
                    label: 'Eliminados',
                    count: estadisticas.eliminados,
                    badgeVariant: tipoFiltro === 'eliminados' ? 'amber' : 'slate',
                  },
                  {
                    id: 'ajustes',
                    label: 'Ajustes',
                    count: estadisticas.ajustes,
                    badgeVariant: tipoFiltro === 'ajustes' ? 'amber' : 'slate',
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

      {/* Resumen rápido de unidades vendidas al buscar un producto */}
      {resumenVentasBusqueda && (
        <SurfaceCard
          variant="surface"
          className="px-3.5 py-2.5 border-sky-500/30 flex flex-wrap items-center justify-between gap-2 text-xs"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-slate-300 font-medium truncate">
              {resumenVentasBusqueda.productoUnico
                ? resumenVentasBusqueda.productoUnico
                : `Resultados para "${filtroTexto.trim()}"`}
            </span>
            {resumenVentasBusqueda.existenciaInicialUnica !== null && (
              <span className="text-[11px] text-slate-400 tabular-nums shrink-0">
                • Inicial: <strong className="text-slate-200">{resumenVentasBusqueda.existenciaInicialUnica}</strong>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-slate-400">Vendidas en el período:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 font-black tabular-nums">
              {resumenVentasBusqueda.unidadesVendidas} uds.
            </span>
          </div>
        </SurfaceCard>
      )}

      {/* 2. Contenedores individuales de movimientos (Cards) */}
      <div className="space-y-2.5">
        {isLoading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
          </div>
        ) : inventarioProcesado.length === 0 && (!mostrarAperturas || aperturasPorProducto.length === 0) ? (
          <div className="flex flex-col items-center justify-center text-center text-slate-400 py-16 border-2 border-dashed border-[#2e2e2e] rounded-xl bg-[#252526]/40 p-4">
            <PackageSearch className="h-10 w-10 mb-3 opacity-30 text-slate-500" />
            <p className="font-bold text-sm text-white">
              {filtroTexto ? "No se encontraron movimientos para esta búsqueda" : "No hay movimientos de inventario físico registrados en este turno"}
            </p>
            <p className="text-xs text-slate-400 mt-1">Los movimientos del kardex aparecerán aquí.</p>
          </div>
        ) : (
          <>
            {/* Si el orden es Antiguos primero, la apertura del período se muestra al inicio de la lista */}
            {sortOrder === 'asc' && mostrarAperturas && (
              <div className="space-y-2.5">
                {aperturasPorProducto.map((apertura) => (
                  <SurfaceCard 
                    key={`apertura-${apertura.productoId || apertura.nombreProducto}`} 
                    variant="subcard"
                    className="p-3.5 sm:p-4 flex items-center justify-between border-sky-500/30 bg-[#1e1e1e] hover:border-sky-500/50 transition-all gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="hidden sm:flex h-10 w-10 rounded-full items-center justify-center shrink-0 border bg-sky-500/15 border-sky-500/30 text-sky-400">
                        <PackageSearch className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm sm:text-base text-white truncate max-w-[180px] sm:max-w-[280px]">
                            {apertura.nombreProducto}
                          </span>
                          <Badge variant="outline" className="text-[10px] font-bold rounded-full px-2 py-0.5 border border-sky-500/40 text-sky-400 bg-sky-500/10 flex items-center gap-1">
                            <PackageSearch className="h-2.5 w-2.5 sm:hidden" />
                            <span>Apertura</span>
                          </Badge>
                          <span className="text-[10px] truncate hidden sm:inline font-medium text-slate-400">
                            Inicio de turno
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-500" />
                            {format(toDate(apertura.fecha), "hh:mm:ss a")}
                          </span>
                          <span>•</span>
                          <span>
                            {format(toDate(apertura.fecha), "dd MMM yyyy", { locale: es })}
                          </span>
                          <span>•</span>
                          <span className="text-sky-300 font-medium">Existencia inicial</span>
                        </div>
                      </div>
                    </div>

                    {/* Existencia al Abrir */}
                    <div className="text-right shrink-0">
                      <p className="text-sm sm:text-base font-bold tabular-nums text-sky-400">
                        {apertura.existenciaInicial} uds
                      </p>
                      <p className="text-[10px] text-slate-400 tabular-nums font-medium mt-0.5">
                        Existencia al abrir
                      </p>
                    </div>
                  </SurfaceCard>
                ))}
              </div>
            )}

            {/* Si no hay movimientos posteriores pero sí apertura */}
            {inventarioProcesado.length === 0 && mostrarAperturas && (
              <p className="text-xs text-slate-400 text-center py-4 italic">
                Sin movimientos posteriores registrados en este turno.
              </p>
            )}

            {inventarioProcesado.map((mov, idx) => {
            const cantidad = Number(mov.cantidad) || 0;
            const esEntrada = cantidad > 0;
            const tipoLower = (mov.tipoMovimiento || '').toLowerCase();
            const refLower = (mov.referencia || '').toLowerCase();
            const esEliminado = tipoLower.includes('elimin') || tipoLower.includes('anula') || refLower.includes('elimin') || refLower.includes('anula');

            return (
              <SurfaceCard 
                key={idx} 
                variant="surface"
                className={cn(
                  "p-3.5 sm:p-4 flex items-center justify-between hover:border-[#383838] transition-all gap-3",
                  esEliminado && "bg-rose-950/10 border-rose-500/20 hover:border-rose-500/40"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "hidden sm:flex h-10 w-10 rounded-full items-center justify-center shrink-0 border",
                    esEliminado
                      ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                      : esEntrada 
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" 
                      : "bg-amber-500/15 border-amber-500/30 text-amber-400"
                  )}>
                    {esEliminado ? (
                      <RotateCcw className="h-4 w-4" />
                    ) : esEntrada ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm sm:text-base text-white truncate max-w-[180px] sm:max-w-[280px]">
                        {mov.nombreProducto || 'Producto'}
                      </span>
                      <Badge variant="outline" className={cn(
                        "text-[10px] font-semibold rounded-full px-2 py-0.5 border flex items-center gap-1",
                        esEliminado
                          ? "border-rose-500/40 text-rose-400 bg-rose-500/10 font-bold"
                          : esEntrada 
                          ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" 
                          : "border-amber-500/40 text-amber-400 bg-amber-500/10"
                      )}>
                        <span className="sm:hidden">
                          {esEliminado ? (
                            <RotateCcw className="h-2.5 w-2.5" />
                          ) : esEntrada ? (
                            <ArrowUpRight className="h-2.5 w-2.5" />
                          ) : (
                            <ArrowDownRight className="h-2.5 w-2.5" />
                          )}
                        </span>
                        <span>{mov.tipoMovimiento || (esEliminado ? 'Producto Eliminado' : (esEntrada ? 'Entrada' : 'Salida'))}</span>
                      </Badge>
                      {mov.referencia && (
                        <span className={cn(
                          "text-[10px] truncate hidden sm:inline font-medium",
                          esEliminado ? "text-rose-300/80" : "text-slate-400"
                        )}>
                          Ref: {mov.referencia}
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
                      {esEliminado && (
                        <>
                          <span>•</span>
                          <span className="text-rose-400 font-medium">Reingresado por eliminación</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Variación y Saldo de Stock */}
                <div className="text-right shrink-0">
                  <p className={cn(
                    "text-sm sm:text-base font-bold tabular-nums",
                    esEliminado ? "text-rose-400" : (esEntrada ? "text-emerald-400" : "text-amber-400")
                  )}>
                    {esEntrada ? `+${cantidad}` : cantidad}
                  </p>
                  <p className="text-[10px] text-slate-400 tabular-nums font-medium mt-0.5">
                    Stock final: <span className="text-white font-bold">{mov.existenciaNueva ?? '--'}</span>
                    {mov.existenciaAnterior !== undefined && (
                      <span className="opacity-60 hidden sm:inline"> (Antes: {mov.existenciaAnterior})</span>
                    )}
                  </p>
                </div>
              </SurfaceCard>
            );
          })}

          {/* Si el orden es Recientes primero, la apertura del período se muestra al final de la lista */}
          {sortOrder === 'desc' && mostrarAperturas && (
            <div className="space-y-2.5">
              {aperturasPorProducto.map((apertura) => (
                <SurfaceCard 
                  key={`apertura-fin-${apertura.productoId || apertura.nombreProducto}`} 
                  variant="subcard"
                  className="p-3.5 sm:p-4 flex items-center justify-between border-sky-500/30 bg-[#1e1e1e] hover:border-sky-500/50 transition-all gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="hidden sm:flex h-10 w-10 rounded-full items-center justify-center shrink-0 border bg-sky-500/15 border-sky-500/30 text-sky-400">
                      <PackageSearch className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm sm:text-base text-white truncate max-w-[180px] sm:max-w-[280px]">
                          {apertura.nombreProducto}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-bold rounded-full px-2 py-0.5 border border-sky-500/40 text-sky-400 bg-sky-500/10 flex items-center gap-1">
                          <PackageSearch className="h-2.5 w-2.5 sm:hidden" />
                          <span>Apertura</span>
                        </Badge>
                        <span className="text-[10px] truncate hidden sm:inline font-medium text-slate-400">
                          Inicio de turno
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-500" />
                          {format(toDate(apertura.fecha), "hh:mm:ss a")}
                        </span>
                        <span>•</span>
                        <span>
                          {format(toDate(apertura.fecha), "dd MMM yyyy", { locale: es })}
                        </span>
                        <span>•</span>
                        <span className="text-sky-300 font-medium">Existencia inicial</span>
                      </div>
                    </div>
                  </div>

                  {/* Existencia al Abrir */}
                  <div className="text-right shrink-0">
                    <p className="text-sm sm:text-base font-bold tabular-nums text-sky-400">
                      {apertura.existenciaInicial} uds
                    </p>
                    <p className="text-[10px] text-slate-400 tabular-nums font-medium mt-0.5">
                      Existencia al abrir
                    </p>
                  </div>
                </SurfaceCard>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  </div>
);
}
