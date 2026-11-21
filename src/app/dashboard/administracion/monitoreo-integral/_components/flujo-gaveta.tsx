'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PillTabs, SurfaceCard } from '@/components/comunes';
import { 
  Banknote, 
  Clock, 
  ArrowUp, 
  ArrowDown, 
  ReceiptText, 
  Layers,
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
    let mesas = 0;
    let productos = 0;
    flujo.forEach((p) => {
      const tieneAlquiler = p.itemsSaldados?.some((it: any) => {
        const n = (it.nombreProducto || '').toLowerCase();
        const id = (it.idProducto || '').toLowerCase();
        return (
          n.includes('mesa #') ||
          n.includes('consola #') ||
          id.startsWith('mesa-') ||
          id.startsWith('division-mesa-')
        );
      });
      if (tieneAlquiler) mesas++;
      else productos++;
    });
    return {
      todos: flujo.length,
      productos,
      mesas,
    };
  }, [flujo]);

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
              placeholder="Buscar por cliente, # comprobante o # venta..."
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
                onValueChange={(val) => setTipoFiltro(val as 'todos' | 'consumo' | 'alquiler')}
                tabs={[
                  {
                    id: 'todos',
                    label: 'Todos',
                    count: conteos.todos,
                    badgeVariant: tipoFiltro === 'todos' ? 'amber' : 'slate',
                  },
                  {
                    id: 'consumo',
                    label: 'Productos',
                    count: conteos.productos,
                    badgeVariant: tipoFiltro === 'consumo' ? 'amber' : 'slate',
                  },
                  {
                    id: 'alquiler',
                    label: 'Mesas',
                    count: conteos.mesas,
                    badgeVariant: tipoFiltro === 'alquiler' ? 'amber' : 'slate',
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

      {/* 2. Contenedores individuales de cobros (Cards) */}
      <div className="space-y-2.5">
        {/* Apertura (si orden es ASC) */}
        {sortOrder === 'asc' && (
          <SurfaceCard
            variant="subcard"
            className="p-3.5 sm:p-4 flex items-center justify-between border-sky-500/30 bg-[#1e1e1e] transition-all gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="hidden sm:flex h-10 w-10 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 items-center justify-center shrink-0">
                <Banknote className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm sm:text-base text-white flex items-center gap-2 flex-wrap">
                  <span>Fondo inicial de caja (gaveta)</span>
                  <Badge className="text-[0.625rem] bg-sky-500/20 text-sky-300 border-none rounded-full px-2 py-0.5 flex items-center gap-1">
                    <Banknote className="h-2.5 w-2.5 sm:hidden" />
                    <span>Apertura</span>
                  </Badge>
                </div>
                <p className="text-[0.6875rem] text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
                  <Clock className="h-3 w-3 text-slate-500" /> {format(inicioPeriodo, "dd/MM/yyyy hh:mm a", { locale: es })}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm sm:text-base font-bold text-sky-400 tabular-nums">
                Q{resumen.inicial.toFixed(2)}
              </span>
              <p className="text-[0.625rem] text-slate-400 font-medium mt-0.5">Saldo inicial</p>
            </div>
          </SurfaceCard>
        )}

        {/* Listado dinámico de cobros en tarjetas individuales */}
        {flujoFiltrado.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-slate-400 py-16 border-2 border-dashed border-[#2e2e2e] rounded-xl bg-[#252526]/40 p-4">
            <ReceiptText className="h-10 w-10 mb-3 opacity-30 text-slate-500" />
            <p className="font-bold text-sm text-white">
              {filtroTexto ? "No se encontraron cobros para esta búsqueda" : "Sin cobros en efectivo registrados en este turno"}
            </p>
            <p className="text-xs text-slate-400 mt-1">Los cobros registrados en el punto de venta aparecerán aquí.</p>
          </div>
        ) : (
          flujoFiltrado.map((pago, idx) => {
            const tieneAlquiler = pago.itemsSaldados?.some((it: any) => {
              const n = (it.nombreProducto || '').toLowerCase();
              const id = (it.idProducto || '').toLowerCase();
              return n.includes('mesa #') || n.includes('consola #') || id.startsWith('mesa-') || id.startsWith('division-mesa-');
            });

            return (
              <SurfaceCard 
                key={pago.idPago || idx} 
                variant="surface"
                className="p-3.5 sm:p-4 flex items-center justify-between hover:border-[#383838] transition-all gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "hidden sm:flex h-10 w-10 rounded-full items-center justify-center shrink-0 border",
                    tieneAlquiler 
                      ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300" 
                      : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  )}>
                    {tieneAlquiler ? <Layers className="h-4 w-4" /> : <Banknote className="h-4 w-4" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm sm:text-base text-white truncate max-w-[160px] sm:max-w-[280px]">
                        {pago.clienteNombre || 'Consumidor final'}
                      </span>
                      <span className="text-[0.625rem] font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20 tabular-nums">
                        Pago #{pago.idPago}
                      </span>
                      {pago.idVenta && (
                        <span className="text-[0.625rem] text-slate-400 font-medium hidden sm:inline tabular-nums">
                          Venta #{pago.idVenta}
                        </span>
                      )}
                      <Badge className={cn(
                        "text-[0.625rem] font-semibold rounded-full px-2 py-0.5 border-none flex items-center gap-1",
                        tieneAlquiler ? "bg-indigo-500/20 text-indigo-300" : "bg-emerald-500/20 text-emerald-400"
                      )}>
                        <span className="sm:hidden">
                          {tieneAlquiler ? <Layers className="h-2.5 w-2.5" /> : <Banknote className="h-2.5 w-2.5" />}
                        </span>
                        <span>{tieneAlquiler ? 'Alquiler de mesa' : 'Consumo'}</span>
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-[0.6875rem] text-slate-400 mt-1 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-500" />
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
                  <p className="text-sm sm:text-base font-bold text-emerald-400 tabular-nums">
                    +Q{pago.montoConsumo.toFixed(2)}
                  </p>
                  <p className="text-[0.625rem] text-slate-400 tabular-nums font-medium mt-0.5">
                    Fondo: Q{pago.saldoAcumulado.toFixed(2)}
                  </p>
                </div>
              </SurfaceCard>
            );
          })
        )}

        {/* Apertura (si orden es DESC) */}
        {sortOrder === 'desc' && (
          <SurfaceCard
            variant="subcard"
            className="p-3.5 sm:p-4 flex items-center justify-between border-sky-500/30 bg-[#1e1e1e] transition-all gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="hidden sm:flex h-10 w-10 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 items-center justify-center shrink-0">
                <Banknote className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm sm:text-base text-white flex items-center gap-2 flex-wrap">
                  <span>Fondo inicial de caja (gaveta)</span>
                  <Badge className="text-[0.625rem] bg-sky-500/20 text-sky-300 border-none rounded-full px-2 py-0.5 flex items-center gap-1">
                    <Banknote className="h-2.5 w-2.5 sm:hidden" />
                    <span>Apertura</span>
                  </Badge>
                </div>
                <p className="text-[0.6875rem] text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
                  <Clock className="h-3 w-3 text-slate-500" /> {format(inicioPeriodo, "dd/MM/yyyy hh:mm a", { locale: es })}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm sm:text-base font-bold text-sky-400 tabular-nums">
                Q{resumen.inicial.toFixed(2)}
              </span>
              <p className="text-[0.625rem] text-slate-400 font-medium mt-0.5">Saldo inicial</p>
            </div>
          </SurfaceCard>
        )}
      </div>
    </div>
  );
}
