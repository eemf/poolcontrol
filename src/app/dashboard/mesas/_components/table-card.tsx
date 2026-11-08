'use client';

import * as React from 'react';
import type { Mesa, Tarifa } from '@/lib/tipos';
import { CountBadge, SurfaceCard } from '@/components/comunes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Clock,
  Timer,
  MoreHorizontal,
  ShoppingBag,
  ArrowRightLeft,
  Square,
  Play,
  Trash2,
  Gamepad2,
  Dices,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toDate } from '@/lib/firebase/servicios/utils';
import MesaTemporizador from './temporizador';

const getFechaFormateada = (fecha: unknown): string => {
  if (!fecha) return 'Fecha inválida';
  const dateToFormat = toDate(fecha);
  return isNaN(dateToFormat.getTime()) ? 'Fecha inválida' : format(dateToFormat, 'hh:mm:ss a');
};

const formatMinutesToTime = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m > 0 ? `${m}m` : ''}`.trim();
};

interface TableCardProps {
  mesa: Mesa;
  tarifaMesa?: Tarifa;
  costoAlquilerReal: number;
  onAction: (table: Mesa, action: 'iniciar' | 'cobrar') => void;
  onConsumo: (table: Mesa) => void;
  onTraslado: (table: Mesa) => void;
  onAjusteTiempo: (table: Mesa) => void;
  onEliminarConsumo: (mesaId: string, consumoId: string) => void;
  serverOffset?: number;
}

export function TableCard({
  mesa,
  tarifaMesa,
  costoAlquilerReal,
  onAction,
  onConsumo,
  onTraslado,
  onAjusteTiempo,
  onEliminarConsumo,
  serverOffset = 0,
}: TableCardProps) {
  const isOcupada = mesa.estado === 'ocupado';
  const isConsola = mesa.tipoDeMesa === 'Consola';
  const [menuOpen, setMenuOpen] = React.useState(false);

  // Cálculo de advertencia de tiempo agotado sincronizado con el servidor
  const ahoraSincronizada = Date.now() + serverOffset;
  let showTimeUpWarning = false;
  if (isOcupada && mesa.modoJuego === 'definido' && mesa.horaInicio && mesa.tiempoDefinido) {
    const fechaFinMillis = toDate(mesa.horaInicio).getTime() + mesa.tiempoDefinido * 1000;
    showTimeUpWarning = ahoraSincronizada > fechaFinMillis;
  }

  const totalConsumo = (mesa.consumos || []).reduce((acc: number, item: any) => acc + item.total, 0);
  const totalAPagar = costoAlquilerReal + totalConsumo;

  const tiempoDefinidoOriginal = (mesa.tiempoDefinido ?? 0) / 60;
  const tiempoAjustePagado = (mesa.ajustesDeTiempo || [])
    .filter((a: any) => a.pagado)
    .reduce((acc: number, a: any) => acc + a.minutosAgregados, 0);
  const tiempoAjustePendiente = (mesa.ajustesDeTiempo || [])
    .filter((a: any) => !a.pagado)
    .reduce((acc: number, a: any) => acc + a.minutosAgregados, 0);

  const cardClasses = cn(
    'p-4 flex flex-col justify-between min-h-[380px] font-body transition-all',
    {
      'border-rose-500/80': isOcupada && mesa.modoJuego === 'libre',
      'border-amber-500/80': isOcupada && mesa.modoJuego === 'definido' && !showTimeUpWarning,
      'border-yellow-400 animate-pulse ring-2 ring-yellow-400': isOcupada && showTimeUpWarning,
      'border-[#2e2e2e]': !isOcupada,
    }
  );

  const cantidadConsumos = mesa.consumos?.length ?? 0;

  return (
    <SurfaceCard variant="panel" className={cardClasses}>
      {/* Cabecera de la Estación */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center shrink-0 border',
                isOcupada
                  ? 'bg-sky-500/15 border-sky-500/30 text-sky-400'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              )}
            >
              {isConsola ? <Gamepad2 className="h-4 w-4" /> : <Dices className="h-4 w-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 leading-tight">
                {isConsola ? `Consola ${mesa.numeroMesa}` : `Mesa ${mesa.numeroMesa}`}
              </h3>
              <p className="text-xs text-slate-400">
                {mesa.tipoDeMesa} • {tarifaMesa?.nombre || 'Sin tarifa'}
              </p>
            </div>
          </div>

          {isOcupada && (
            <div className="flex items-center flex-wrap gap-2 mt-1.5">
              <span
                className={cn(
                  'text-xs font-semibold inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border',
                  mesa.modoJuego === 'definido'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                )}
              >
                {mesa.modoJuego === 'definido' ? (
                  <Timer className="h-3 w-3 text-amber-300" />
                ) : (
                  <Clock className="h-3 w-3 text-sky-300" />
                )}
                {mesa.modoJuego === 'definido' ? 'Tiempo Definido' : 'Tiempo Libre'}
              </span>
              {isConsola && mesa.numControles && mesa.numControles > 0 && (
                <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full h-5 px-2 text-[11px] font-semibold">
                  <Users className="h-3 w-3 mr-1" /> {mesa.numControles} Ctrl.
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Menú de Acciones Secundarias */}
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-[#252526] hover:bg-[#2e2e2e] text-slate-300 border border-[#2e2e2e]"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-52 p-1.5 bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 rounded-2xl shadow-2xl"
          >
            <div className="flex flex-col gap-1 font-body">
              <Button
                variant="ghost"
                className="w-full justify-start h-9 rounded-full text-xs font-semibold text-slate-200 hover:bg-[#252526] hover:text-white"
                onClick={() => {
                  setMenuOpen(false);
                  onConsumo(mesa);
                }}
                disabled={!isOcupada}
              >
                <ShoppingBag className="mr-2 h-4 w-4 text-sky-400" /> Añadir Consumo
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start h-9 rounded-full text-xs font-semibold text-slate-200 hover:bg-[#252526] hover:text-white"
                onClick={() => {
                  setMenuOpen(false);
                  onTraslado(mesa);
                }}
                disabled={!isOcupada}
              >
                <ArrowRightLeft className="mr-2 h-4 w-4 text-amber-400" /> Trasladar Estación
              </Button>
              {mesa.modoJuego === 'definido' && (
                <Button
                  variant="ghost"
                  className="w-full justify-start h-9 rounded-full text-xs font-semibold text-slate-200 hover:bg-[#252526] hover:text-white"
                  onClick={() => {
                    setMenuOpen(false);
                    onAjusteTiempo(mesa);
                  }}
                  disabled={!isOcupada}
                >
                  <Timer className="mr-2 h-4 w-4 text-emerald-400" /> Ajustar Tiempo
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Contenido Central */}
      <div className="flex-grow flex flex-col justify-center items-center gap-3 my-4">
        {isOcupada ? (
          <>
            <div className="text-center w-full space-y-2">
              <p className="text-xs font-medium text-slate-400">
                {mesa.modoJuego === 'libre' ? 'Tiempo Transcurrido' : 'Tiempo Restante'}
              </p>
              <div className="text-4xl font-bold font-headline tabular-nums text-slate-100">
                <MesaTemporizador
                  horaInicio={mesa.horaInicio}
                  horaFin={mesa.horaFin}
                  modoJuego={mesa.modoJuego}
                  estado={mesa.estado}
                  tiempoDefinido={mesa.tiempoDefinido}
                  serverOffset={serverOffset}
                />
              </div>

              {showTimeUpWarning && (
                <p className="text-xs font-bold text-yellow-400 animate-bounce">
                  ¡Tiempo Agotado!
                </p>
              )}

              {mesa.modoJuego === 'definido' && (
                <div className="text-xs text-slate-300 mt-1 space-y-1">
                  {tiempoDefinidoOriginal > 0 && (
                    <div className="flex items-center justify-center gap-1.5">
                      <span>
                        Definido:{' '}
                        <span className="font-bold text-slate-100">
                          {formatMinutesToTime(tiempoDefinidoOriginal)}
                        </span>
                      </span>
                      {mesa.alquilerPagado ? (
                        <Badge className="text-[10px] px-2 h-4 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                          Pagado
                        </Badge>
                      ) : (
                        <Badge className="text-[10px] px-2 h-4 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                          Pendiente
                        </Badge>
                      )}
                    </div>
                  )}
                  {tiempoAjustePagado > 0 && (
                    <div className="flex items-center justify-center gap-1.5">
                      <span>
                        Ajuste pagado:{' '}
                        <span className="font-bold text-slate-100">
                          {formatMinutesToTime(tiempoAjustePagado)}
                        </span>
                      </span>
                      <Badge className="text-[10px] px-2 h-4 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                        Pagado
                      </Badge>
                    </div>
                  )}
                  {tiempoAjustePendiente > 0 && (
                    <div className="flex items-center justify-center gap-1.5">
                      <span>
                        Ajuste pendiente:{' '}
                        <span className="font-bold text-slate-100">
                          {formatMinutesToTime(tiempoAjustePendiente)}
                        </span>
                      </span>
                      <Badge className="text-[10px] px-2 h-4 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                        Pendiente
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Bloque Interior Unificado (#252526 con borde #2e2e2e) */}
              <SurfaceCard variant="surface" className="mt-3 p-3 space-y-2.5 text-center">
                <div>
                  <p className="text-xs font-medium text-slate-400">Total a Pagar</p>
                  <p className="text-2xl font-bold text-sky-400 tabular-nums tracking-tight">
                    Q{totalAPagar.toFixed(2)}
                  </p>
                </div>

                <div className="grid grid-cols-2 divide-x divide-[#2e2e2e] pt-2.5 border-t border-[#2e2e2e]">
                  <div className="px-2">
                    <p className="text-[11px] font-medium text-slate-400">Alquiler</p>
                    <p className="text-sm font-bold text-slate-100 tabular-nums">
                      Q{costoAlquilerReal.toFixed(2)}
                    </p>
                  </div>
                  <div className="px-2">
                    <p className="text-[11px] font-medium text-slate-400">Consumo</p>
                    <p className="text-sm font-bold text-slate-100 tabular-nums">
                      Q{totalConsumo.toFixed(2)}
                    </p>
                  </div>
                </div>

                {cantidadConsumos > 0 && (
                  <Accordion type="single" collapsible className="w-full pt-2 border-t border-[#2e2e2e]">
                    <AccordionItem value="consumos" className="border-none">
                      <AccordionTrigger className="text-xs font-semibold text-slate-300 hover:text-white hover:no-underline py-1 px-2 rounded-full justify-center gap-2 transition-colors">
                        <span>Ver Consumos</span>
                        <CountBadge count={cantidadConsumos} variant="amber" />
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-0">
                        <div className="max-h-32 overflow-y-auto custom-scrollbar divide-y divide-[#2e2e2e] text-xs text-left pr-1">
                          {mesa.consumos?.map((item: any, index: number) => (
                            <div
                              key={item.id || index}
                              className="flex justify-between items-center py-2 first:pt-1 last:pb-0 gap-2"
                            >
                              <div className="flex items-start gap-2 min-w-0">
                                <ShoppingBag className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-100 truncate leading-tight">
                                    {item.cantidad}x {item.nombreProducto}
                                  </p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    {getFechaFormateada(item.fechaAgregado)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-bold text-xs text-sky-400 tabular-nums">
                                  Q{item.total.toFixed(2)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 rounded-full bg-rose-500/15 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                                  onClick={() => onEliminarConsumo(mesa.id, item.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </SurfaceCard>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in duration-300">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
              {isConsola ? <Gamepad2 className="h-8 w-8" /> : <Play className="h-8 w-8" />}
            </div>
            <p className="text-lg font-bold text-emerald-400">Disponible</p>
            <p className="text-xs text-slate-400 mt-1 px-4 leading-relaxed">
              Estación libre para asignar una nueva sesión de juego.
            </p>
          </div>
        )}
      </div>

      {/* Pie de Tarjeta con Acción Principal en Píldora */}
      <div>
        <Button
          onClick={() => onAction(mesa, isOcupada ? 'cobrar' : 'iniciar')}
          className={cn(
            'w-full font-semibold h-10 rounded-full shadow-md transition-all',
            isOcupada
              ? 'bg-rose-600 hover:bg-rose-500 text-white'
              : 'bg-sky-600 hover:bg-sky-500 text-white'
          )}
        >
          {isOcupada ? (
            <Square className="mr-2 h-4 w-4" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          {isOcupada ? 'Finalizar y Cobrar' : 'Iniciar Tiempo'}
        </Button>
      </div>
    </SurfaceCard>
  );
}
