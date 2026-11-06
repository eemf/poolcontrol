'use client';

import React from 'react';
import type { Mesa } from '@/lib/tipos';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Clock, Timer, Play, Users, Gamepad2, Dices } from 'lucide-react';
import { cn } from '@/lib/utils';

const intervalosDeTiempo = [
  { label: '30 min', minutos: 30 },
  { label: '1 hora', minutos: 60 },
  { label: '1h 30m', minutos: 90 },
  { label: '2 horas', minutos: 120 },
  { label: '2h 30m', minutos: 150 },
  { label: '3 horas', minutos: 180 },
  { label: '3h 30m', minutos: 210 },
  { label: '4 horas', minutos: 240 },
  { label: '4h 30m', minutos: 270 },
];

interface StartSessionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTable: Mesa | null;
  modoJuego: 'libre' | 'definido';
  setModoJuego: (modo: 'libre' | 'definido') => void;
  selectedInterval: number;
  setSelectedInterval: (val: number) => void;
  pagadoDeContado: boolean;
  setPagadoDeContado: (val: boolean) => void;
  onStart: () => void;
  numControles: number;
  setNumControles: (val: number) => void;
}

export function StartSessionDialog({
  isOpen,
  onOpenChange,
  selectedTable,
  modoJuego,
  setModoJuego,
  selectedInterval,
  setSelectedInterval,
  pagadoDeContado,
  setPagadoDeContado,
  onStart,
  numControles,
  setNumControles,
}: StartSessionDialogProps) {
  const isConsola = selectedTable?.tipoDeMesa === 'Consola';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#1d283a] border-[#324157] text-slate-100 rounded-xl sm:rounded-lg font-body p-5 sm:p-6 flex flex-col max-h-[90vh] overflow-hidden shadow-2xl">
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-3 pr-6">
            <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
              {isConsola ? <Gamepad2 className="w-5 h-5" /> : <Dices className="w-5 h-5" />}
            </div>
            <div className="text-left min-w-0">
              <DialogTitle className="font-headline text-base sm:text-lg font-bold text-slate-100 leading-tight truncate">
                Iniciar Sesión: {isConsola ? 'Consola' : 'Mesa'} #{selectedTable?.numeroMesa}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5 truncate">
                Selecciona el modo de juego para comenzar.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 py-3 px-0.5 space-y-4">
          {isConsola && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-200 ml-1 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-amber-400" /> Cantidad de Controles
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <Button
                    key={n}
                    type="button"
                    onClick={() => setNumControles(n)}
                    className={cn(
                      'rounded-full font-semibold h-9 transition-all',
                      numControles === n
                        ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sm'
                        : 'bg-[#283244] hover:bg-[#324157] text-slate-200 border border-[#324157]'
                    )}
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Selección de Modo de Juego */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setModoJuego('libre')}
              className={cn(
                'flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all',
                modoJuego === 'libre'
                  ? 'border-sky-500 bg-sky-500/15 text-sky-400 shadow-sm'
                  : 'border-[#324157] bg-[#283244] text-slate-300 hover:bg-[#324157]/60'
              )}
            >
              <Clock className="h-5 w-5" />
              <span className="font-semibold text-xs">Tiempo Libre</span>
            </button>
            <button
              type="button"
              onClick={() => setModoJuego('definido')}
              className={cn(
                'flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all',
                modoJuego === 'definido'
                  ? 'border-sky-500 bg-sky-500/15 text-sky-400 shadow-sm'
                  : 'border-[#324157] bg-[#283244] text-slate-300 hover:bg-[#324157]/60'
              )}
            >
              <Timer className="h-5 w-5" />
              <span className="font-semibold text-xs">Tiempo Definido</span>
            </button>
          </div>

          {/* Contenedor con transición suave para mostrar y ocultar los intervalos */}
          <div
            aria-hidden={modoJuego !== 'definido'}
            className={cn(
              'grid transition-all duration-300 ease-in-out',
              modoJuego === 'definido'
                ? 'grid-rows-[1fr] opacity-100 !mt-4'
                : 'grid-rows-[0fr] opacity-0 !mt-0 pointer-events-none'
            )}
          >
            <div className="overflow-hidden px-0.5 -mx-0.5 pb-0.5">
              <div className="space-y-3 pt-3 border-t border-[#324157]">
                <Label className="text-xs font-medium text-slate-200 ml-1 block">
                  Selecciona el Intervalo
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {intervalosDeTiempo.map((intervalo) => (
                    <Button
                      key={intervalo.minutos}
                      type="button"
                      tabIndex={modoJuego === 'definido' ? 0 : -1}
                      onClick={() => setSelectedInterval(intervalo.minutos)}
                      className={cn(
                        'rounded-full h-9 font-semibold text-xs transition-all',
                        selectedInterval === intervalo.minutos
                          ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sm'
                          : 'bg-[#283244] hover:bg-[#324157] text-slate-200 border border-[#324157]'
                      )}
                    >
                      {intervalo.label}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center space-x-2.5 p-3.5 bg-[#283244] rounded-xl border border-[#324157]">
                  <Checkbox
                    id="pagado-contado"
                    tabIndex={modoJuego === 'definido' ? 0 : -1}
                    checked={pagadoDeContado}
                    onCheckedChange={(checked) => setPagadoDeContado(checked as boolean)}
                  />
                  <Label
                    htmlFor="pagado-contado"
                    className="text-xs font-semibold text-slate-200 cursor-pointer"
                  >
                    Pagado de Contado
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2 shrink-0 flex-row items-center justify-between sm:justify-between gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              className="rounded-full px-5 font-medium h-10 bg-[#283244] hover:bg-[#324157] text-slate-200 border border-[#324157]"
            >
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={onStart}
            className="rounded-full px-6 font-semibold h-10 bg-sky-600 hover:bg-sky-500 text-white shadow-md"
          >
            <Play className="mr-1.5 h-4 w-4" />
            Iniciar Juego
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
