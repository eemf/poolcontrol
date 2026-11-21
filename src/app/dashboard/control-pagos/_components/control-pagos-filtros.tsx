'use client';

import React, { useRef, useEffect } from 'react';
import type { CierreCaja, PeriodoTipo } from '../_hooks/use-control-pagos';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Search, SlidersHorizontal, Calendar, CreditCard, User, Split, X 
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toDate } from '@/lib/firebase/servicios/utils';

interface ControlPagosFiltrosProps {
  filtroTexto: string;
  setFiltroTexto: (v: string) => void;
  mostrarFiltros: boolean;
  setMostrarFiltros: (v: boolean | ((p: boolean) => boolean)) => void;
  filtrosActivosCount: number;
  periodoFiltro: PeriodoTipo;
  setPeriodoFiltro: (v: PeriodoTipo) => void;
  metodoFiltro: string;
  setMetodoFiltro: (v: string) => void;
  operadorFiltro: string;
  setOperadorFiltro: (v: string) => void;
  tipoCoberturaFiltro: string;
  setTipoCoberturaFiltro: (v: string) => void;
  fechaInicioPers: string;
  setFechaInicioPers: (v: string) => void;
  fechaFinPers: string;
  setFechaFinPers: (v: string) => void;
  operadoresDisponibles: Array<{ uid: string; nombre: string }>;
  cierres?: CierreCaja[];
  totalPagosFiltrados?: number;
}

export function ControlPagosFiltros({
  filtroTexto,
  setFiltroTexto,
  mostrarFiltros,
  setMostrarFiltros,
  filtrosActivosCount,
  periodoFiltro,
  setPeriodoFiltro,
  metodoFiltro,
  setMetodoFiltro,
  operadorFiltro,
  setOperadorFiltro,
  tipoCoberturaFiltro,
  setTipoCoberturaFiltro,
  fechaInicioPers,
  setFechaInicioPers,
  fechaFinPers,
  setFechaFinPers,
  operadoresDisponibles,
  cierres,
}: ControlPagosFiltrosProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Autofoco al montar la vista
  useEffect(() => {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 40);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-3 pb-3 border-b border-[#2e2e2e]">
      {/* Buscador con botón X interno y botón de Filtros externo a la par */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            ref={searchInputRef}
            placeholder="Buscar por cliente, # comprobante, # venta, producto o cajero..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && filtroTexto) {
                e.preventDefault();
                setFiltroTexto('');
              }
            }}
            className="pl-10 pr-9 h-10 text-xs sm:text-sm rounded-full"
          />
          {filtroTexto && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setFiltroTexto('');
                searchInputRef.current?.focus();
              }}
              aria-label="Limpiar búsqueda"
              title="Limpiar búsqueda"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={() => setMostrarFiltros((prev) => !prev)}
          className={`h-10 px-3 sm:px-3.5 text-xs font-semibold rounded-full border gap-1.5 shrink-0 transition-colors ${
            mostrarFiltros
              ? 'bg-sky-600 border-sky-500 text-white hover:bg-sky-500 hover:text-white shadow-sm'
              : filtrosActivosCount > 0
              ? 'bg-[#252526] border-sky-500/60 text-sky-400 hover:bg-[#313131] hover:text-sky-300'
              : 'bg-[#252526] border-[#2e2e2e] text-slate-300 hover:text-white hover:bg-[#313131]'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">{mostrarFiltros ? 'Ocultar' : 'Opciones'}</span>
          {filtrosActivosCount > 0 && (
            <span className="min-w-[18px] h-[18px] rounded-full bg-amber-400 text-slate-950 font-black text-[0.625rem] inline-flex items-center justify-center px-1">
              {filtrosActivosCount}
            </span>
          )}
        </Button>
      </div>

      {/* Panel colapsable de preferencias y filtros avanzados (o rango personalizado visible si está activo) */}
      {(mostrarFiltros || periodoFiltro === 'personalizado') && (
        <div className="p-3 rounded-xl bg-[#1e1e1e] border border-[#2e2e2e] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Período */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300 flex items-center gap-1">
              <Calendar className="h-3 w-3 text-sky-400" /> Período
            </label>
            <Select value={periodoFiltro} onValueChange={(v) => setPeriodoFiltro(v as PeriodoTipo)}>
              <SelectTrigger className="h-9 text-xs rounded-full">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="actual">Turno actual</SelectItem>
                <SelectItem value="hoy">Hoy</SelectItem>
                <SelectItem value="ayer">Ayer</SelectItem>
                <SelectItem value="7dias">Últimos 7 días</SelectItem>
                <SelectItem value="mes">Este mes</SelectItem>
                <SelectItem value="todos">Todo el historial</SelectItem>
                <SelectItem value="personalizado">Rango personalizado</SelectItem>
                {cierres && cierres.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-[0.625rem] font-bold text-slate-400 border-t border-[#2e2e2e] mt-1">
                      Turnos Anteriores
                    </div>
                    {cierres.slice(0, 10).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        Turno #{c.idCuadre} ({format(toDate(c.fecha), 'dd/MM/yy HH:mm', { locale: es })})
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Rango Personalizado */}
          {periodoFiltro === 'personalizado' && (
            <div className="sm:col-span-2 grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Desde</label>
                <Input
                  type="date"
                  value={fechaInicioPers}
                  onChange={(e) => setFechaInicioPers(e.target.value)}
                  className="h-9 text-xs rounded-full"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Hasta</label>
                <Input
                  type="date"
                  value={fechaFinPers}
                  onChange={(e) => setFechaFinPers(e.target.value)}
                  className="h-9 text-xs rounded-full"
                />
              </div>
            </div>
          )}

          {/* Método de Pago */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300 flex items-center gap-1">
              <CreditCard className="h-3 w-3 text-sky-400" /> Método de Pago
            </label>
            <Select value={metodoFiltro} onValueChange={setMetodoFiltro}>
              <SelectTrigger className="h-9 text-xs rounded-full">
                <SelectValue placeholder="Método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los métodos</SelectItem>
                <SelectItem value="Efectivo">Efectivo</SelectItem>
                <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                <SelectItem value="Consumo Interno">Consumo Interno</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Operador / Cajero */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300 flex items-center gap-1">
              <User className="h-3 w-3 text-sky-400" /> Operador / Cajero
            </label>
            <Select value={operadorFiltro} onValueChange={setOperadorFiltro}>
              <SelectTrigger className="h-9 text-xs rounded-full">
                <SelectValue placeholder="Operador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los operadores</SelectItem>
                {operadoresDisponibles.map((op) => (
                  <SelectItem key={op.uid} value={op.uid}>
                    {op.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Cobertura */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300 flex items-center gap-1">
              <Split className="h-3 w-3 text-sky-400" /> Tipo de Cobro
            </label>
            <Select value={tipoCoberturaFiltro} onValueChange={setTipoCoberturaFiltro}>
              <SelectTrigger className="h-9 text-xs rounded-full">
                <SelectValue placeholder="Cobertura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="completo">Saldado 100%</SelectItem>
                <SelectItem value="abono">Abono parcial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
