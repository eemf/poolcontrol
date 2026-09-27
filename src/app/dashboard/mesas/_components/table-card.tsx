'use client';

import * as React from 'react';
import { Timestamp } from 'firebase/firestore';
import type { Mesa, Tarifa } from '@/lib/tipos';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Clock, Timer, MoreHorizontal, ShoppingBag, ArrowRightLeft, Square, Play, Trash2, Gamepad2, Dices, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
  serverOffset = 0
}: TableCardProps) {
  const isOcupada = mesa.estado === 'ocupado';
  const isConsola = mesa.tipoDeMesa === 'Consola';
  
  // FUENTE DE VERDAD: Calculation logic for warnings
  const ahoraSincronizada = Date.now() + serverOffset;
  let showTimeUpWarning = false;
  if (isOcupada && mesa.modoJuego === 'definido' && mesa.horaInicio && mesa.tiempoDefinido) {
      const fechaFinMillis = toDate(mesa.horaInicio).getTime() + (mesa.tiempoDefinido * 1000);
      showTimeUpWarning = ahoraSincronizada > fechaFinMillis;
  }
  
  const totalConsumo = (mesa.consumos || []).reduce((acc: number, item: any) => acc + item.total, 0);
  const totalAPagar = costoAlquilerReal + totalConsumo;

  const tiempoDefinidoOriginal = (mesa.tiempoDefinido ?? 0) / 60;
  const tiempoAjustePagado = (mesa.ajustesDeTiempo || []).filter((a: any) => a.pagado).reduce((acc: number, a: any) => acc + a.minutosAgregados, 0);
  const tiempoAjustePendiente = (mesa.ajustesDeTiempo || []).filter((a: any) => !a.pagado).reduce((acc: number, a: any) => acc + a.minutosAgregados, 0);

  const cardClasses = cn("transition-all flex flex-col min-h-[380px] font-body", {
    "border-destructive": isOcupada && mesa.modoJuego === 'libre',
    "border-amber-500": isOcupada && mesa.modoJuego === 'definido' && !showTimeUpWarning,
    "border-yellow-400 animate-pulse ring-2 ring-yellow-400": isOcupada && showTimeUpWarning,
    "border-muted/60 opacity-90": !isOcupada
  });

  return (
    <Card className={cardClasses}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg font-medium font-headline">
            <div className="flex items-center gap-2">
              {isConsola ? <Gamepad2 className="h-5 w-5 text-primary" /> : <Dices className="h-5 w-5 text-primary" />}
              {isConsola ? `Consola ${mesa.numeroMesa}` : `Mesa ${mesa.numeroMesa}`}
            </div>
          </CardTitle>
          <CardDescription className="text-xs font-body">{mesa.tipoDeMesa} - {tarifaMesa?.nombre || 'Sin tarifa'}</CardDescription>
          {isOcupada && (
            <div className="flex flex-col items-start gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1 font-body">
                  {mesa.modoJuego === 'definido' ? <Timer className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                  {mesa.modoJuego === 'definido' ? 'Tiempo definido' : 'Tiempo libre'}
                </span>
                {isConsola && mesa.numControles && mesa.numControles > 0 && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-none h-4 px-1.5 text-[9px] font-black uppercase">
                    <Users className="h-2 w-2 mr-1" /> {mesa.numControles} Ctrl.
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-1">
            <div className="flex flex-col gap-1 font-body">
              <Button variant="ghost" className="w-full justify-start text-xs font-bold" onClick={() => onConsumo(mesa)} disabled={!isOcupada}>
                <ShoppingBag className="mr-2 h-4 w-4" /> Añadir consumo
              </Button>
              <Button variant="ghost" className="w-full justify-start text-xs font-bold" onClick={() => onTraslado(mesa)} disabled={!isOcupada}>
                <ArrowRightLeft className="mr-2 h-4 w-4" /> Trasladar estación
              </Button>
              {mesa.modoJuego === 'definido' && (
                <Button variant="ghost" className="w-full justify-start text-xs font-bold" onClick={() => onAjusteTiempo(mesa)} disabled={!isOcupada}>
                  <Timer className="mr-2 h-4 w-4" /> Ajustar tiempo
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-center items-center gap-2">
        {isOcupada ? (
          <>
            <div className="text-center w-full">
              <p className="text-sm text-muted-foreground font-body">
                {mesa.modoJuego === 'libre' ? 'Tiempo transcurrido' : 'Tiempo restante'}
              </p>
              <div className="text-4xl font-bold font-headline tabular-nums text-foreground">
                <MesaTemporizador 
                  horaInicio={mesa.horaInicio} 
                  horaFin={mesa.horaFin} 
                  modoJuego={mesa.modoJuego} 
                  estado={mesa.estado} 
                  tiempoDefinido={mesa.tiempoDefinido} 
                  serverOffset={serverOffset}
                />
              </div>
              <div className="min-h-0 flex items-center justify-center">
                {showTimeUpWarning && (
                  <p className="text-[10px] font-bold text-yellow-400 font-body animate-bounce">
                    ¡Tiempo agotado!
                  </p>
                )}
              </div>
              {mesa.modoJuego === 'definido' && (
                <div className="text-xs text-muted-foreground mt-0.5 space-y-1 font-body">
                  {tiempoDefinidoOriginal > 0 && 
                    <div className='flex items-center justify-center gap-1.5'>
                      <span>Definido: <span className="font-bold">{formatMinutesToTime(tiempoDefinidoOriginal)}</span></span>
                      {mesa.alquilerPagado ? (
                        <Badge className='text-[10px] px-1.5 h-4 bg-green-100 text-green-800 border-none font-bold'>Pagado</Badge>
                      ) : (
                        <Badge variant="outline" className='text-[10px] px-1.5 h-4 border-amber-500 text-amber-500 font-bold'>Pendiente</Badge>
                      )}
                    </div>
                  }
                  {tiempoAjustePagado > 0 && (
                    <div className='flex items-center justify-center gap-1.5'>
                      <span>Ajuste pagado: <span className="font-bold">{formatMinutesToTime(tiempoAjustePagado)}</span></span>
                      <Badge className='text-[10px] px-1.5 h-4 bg-green-100 text-green-800 border-none font-bold'>Pagado</Badge>
                    </div>
                  )}
                  {tiempoAjustePendiente > 0 && (
                    <div className='flex items-center justify-center gap-1.5'>
                      <span>Ajuste pendiente: <span className="font-bold">{formatMinutesToTime(tiempoAjustePendiente)}</span></span>
                      <Badge variant="outline" className='text-[10px] px-1.5 h-4 border-amber-500 text-amber-500 font-bold'>Pendiente</Badge>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-2 space-y-2 pt-2 border-t font-body">
                <div className="p-2 rounded-lg bg-primary/10 col-span-2">
                  <p className="text-sm font-bold text-primary/80">Total a pagar</p>
                  <p className="text-2xl font-bold text-primary">Q{totalAPagar.toFixed(2)}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-xs font-bold text-muted-foreground">Alquiler</p>
                    <p className="text-sm font-bold text-primary">Q{costoAlquilerReal.toFixed(2)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-xs font-bold text-muted-foreground">Consumo</p>
                    <p className="text-sm font-bold text-primary">Q{totalConsumo.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
            {(mesa.consumos?.length ?? 0) > 0 && (
              <Accordion type="single" collapsible className="w-full font-body">
                <AccordionItem value="consumos" className="border-none">
                  <AccordionTrigger className="text-[11px] font-bold text-muted-foreground hover:no-underline p-0 justify-center">
                    Ver {mesa.consumos?.length} consumo(s)
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <ScrollArea className="h-32">
                      <div className="space-y-2 text-xs p-2">
                        {mesa.consumos?.map((item: any, index: number) => (
                          <div key={item.id || index}>
                            <div className="flex justify-between items-center group">
                              <div className="flex items-start gap-2">
                                <ShoppingBag className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <p className="font-semibold leading-tight">{item.cantidad}x {item.nombreProducto}</p>
                                  <p className="text-[10px] text-muted-foreground">{getFechaFormateada(item.fechaAgregado)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-sm">Q{item.total.toFixed(2)}</span>
                                <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onEliminarConsumo(mesa.id, item.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            {index < (mesa.consumos?.length ?? 0) - 1 && <Separator className="my-2" />}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in duration-500 font-body">
            <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 shadow-inner">
              {isConsola ? <Gamepad2 className="h-10 w-10" /> : <Play className="h-10 w-10" />}
            </div>
            <p className="text-xl font-bold text-emerald-600">Disponible</p>
            <p className="text-xs text-muted-foreground mt-1 px-4 leading-relaxed font-medium">
              Esta estación se encuentra libre para ser asignada a una nueva sesión de juego.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={() => onAction(mesa, isOcupada ? 'cobrar' : 'iniciar')} variant={isOcupada ? 'destructive' : 'default'} className='w-full font-bold h-11 rounded-full shadow-lg shadow-primary/10 font-body'>
          {isOcupada ? <Square className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          {isOcupada ? 'Finalizar y cobrar' : 'Iniciar tiempo'}
        </Button>
      </CardFooter>
    </Card>
  );
}
