'use client';

import React from 'react';
import type { CierreCaja, PeriodoTipo } from '../_hooks/use-control-pagos';
import { SurfaceCard } from '@/components/comunes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Search, SlidersHorizontal, RotateCcw, Calendar, CreditCard, User, Split 
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
  totalPagosFiltrados: number;
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
  totalPagosFiltrados,
}: ControlPagosFiltrosProps) {
  const resetearFiltros = () => {
    setFiltroTexto('');
    setPeriodoFiltro('actual');
    setMetodoFiltro('todos');
    setOperadorFiltro('todos');
    setTipoCoberturaFiltro('todos');
    setFechaInicioPers('');
    setFechaFinPers('');
  };

  return (
    <SurfaceCard variant="surface" className="p-3.5 space-y-3">
      {/* Buscador inteligente */}
      <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, # comprobante, # venta, producto o cajero..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            className="pl-9 pr-28 h-10 text-sm bg-[#1d283a] border-app-border rounded-full"
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Button
              variant={mostrarFiltros ? "default" : "ghost"}
              size="sm"
              onClick={() => setMostrarFiltros((prev) => !prev)}
              className={`h-7 px-2.5 text-xs rounded-full gap-1.5 ${
                mostrarFiltros 
                  ? "bg-sky-600 text-white hover:bg-sky-700" 
                  : "text-muted-foreground hover:text-foreground hover:bg-[#283244]"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filtros</span>
              {filtrosActivosCount > 0 && (
                <span className="min-w-[18px] h-4.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] inline-flex items-center justify-center px-1">
                  {filtrosActivosCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="px-3 py-1.5 text-xs text-slate-300 bg-[#1d283a] border-app-border rounded-full font-medium">
            {totalPagosFiltrados} {totalPagosFiltrados === 1 ? 'resultado' : 'resultados'}
          </Badge>

          {(filtrosActivosCount > 0 || filtroTexto) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetearFiltros}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground rounded-full"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Panel colapsable de filtros avanzados */}
      {mostrarFiltros && (
        <div className="pt-2 border-t border-app-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Período */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300 flex items-center gap-1">
              <Calendar className="h-3 w-3 text-sky-400" /> Período
            </label>
            <Select value={periodoFiltro} onValueChange={(v) => setPeriodoFiltro(v as PeriodoTipo)}>
              <SelectTrigger className="h-8 text-xs bg-[#1d283a] border-app-border rounded-full">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent className="bg-app-surface border-app-border text-foreground">
                <SelectItem value="actual">🟢 Turno Actual (En curso)</SelectItem>
                <SelectItem value="hoy">Hoy</SelectItem>
                <SelectItem value="ayer">Ayer</SelectItem>
                <SelectItem value="7dias">Últimos 7 días</SelectItem>
                <SelectItem value="mes">Este mes</SelectItem>
                <SelectItem value="todos">Todo el historial</SelectItem>
                <SelectItem value="personalizado">Rango personalizado</SelectItem>
                {cierres && cierres.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground border-t border-app-border mt-1">
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
                  className="h-8 text-xs bg-[#1d283a] border-app-border rounded-full"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Hasta</label>
                <Input
                  type="date"
                  value={fechaFinPers}
                  onChange={(e) => setFechaFinPers(e.target.value)}
                  className="h-8 text-xs bg-[#1d283a] border-app-border rounded-full"
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
              <SelectTrigger className="h-8 text-xs bg-[#1d283a] border-app-border rounded-full">
                <SelectValue placeholder="Método" />
              </SelectTrigger>
              <SelectContent className="bg-app-surface border-app-border text-foreground">
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
              <SelectTrigger className="h-8 text-xs bg-[#1d283a] border-app-border rounded-full">
                <SelectValue placeholder="Operador" />
              </SelectTrigger>
              <SelectContent className="bg-app-surface border-app-border text-foreground">
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
              <SelectTrigger className="h-8 text-xs bg-[#1d283a] border-app-border rounded-full">
                <SelectValue placeholder="Cobertura" />
              </SelectTrigger>
              <SelectContent className="bg-app-surface border-app-border text-foreground">
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="completo">Saldado 100%</SelectItem>
                <SelectItem value="abono">Abono parcial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </SurfaceCard>
  );
}
