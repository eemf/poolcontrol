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
import { Loader2, Timer, Check } from 'lucide-react';
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

interface TimeAdjustDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mesaParaAjuste: Mesa | null;
  tiempoParaAnadir: number;
  setTiempoParaAnadir: (min: number) => void;
  pagarTiempoAnadido: boolean;
  setPagarTiempoAnadido: (val: boolean) => void;
  onConfirm: () => void;
  processingAjuste: boolean;
}

export function TimeAdjustDialog({
  isOpen,
  onOpenChange,
  mesaParaAjuste,
  tiempoParaAnadir,
  setTiempoParaAnadir,
  pagarTiempoAnadido,
  setPagarTiempoAnadido,
  onConfirm,
  processingAjuste,
}: TimeAdjustDialogProps) {
  const isConsola = mesaParaAjuste?.tipoDeMesa === 'Consola';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 rounded-xl sm:rounded-lg font-body p-5 sm:p-6 flex flex-col max-h-[90vh] overflow-hidden shadow-2xl">
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
              <Timer className="w-5 h-5" />
            </div>
            <div className="text-left">
              <DialogTitle className="font-headline text-lg font-bold text-slate-100 leading-tight">
                Ajustar Tiempo: {isConsola ? 'Consola' : 'Mesa'} #{mesaParaAjuste?.numeroMesa}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                Añade tiempo extra a la sesión de juego actual.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 py-3 px-0.5 space-y-3">
          <Label className="text-xs font-medium text-slate-200 ml-1 block">
            Selecciona el Intervalo
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {intervalosDeTiempo.map((intervalo) => (
              <Button
                key={intervalo.minutos}
                type="button"
                onClick={() => setTiempoParaAnadir(intervalo.minutos)}
                className={cn(
                  'rounded-full h-9 font-semibold text-xs transition-all',
                  tiempoParaAnadir === intervalo.minutos
                    ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sm'
                    : 'bg-[#252526] hover:bg-[#2e2e2e] text-slate-200 border border-[#2e2e2e]'
                )}
              >
                {intervalo.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center space-x-2.5 p-3.5 bg-[#252526] rounded-xl border border-[#2e2e2e]">
            <Checkbox
              id="pagar-ajuste-contado"
              checked={pagarTiempoAnadido}
              onCheckedChange={(checked) => setPagarTiempoAnadido(checked as boolean)}
            />
            <Label
              htmlFor="pagar-ajuste-contado"
              className="text-xs font-semibold text-slate-200 cursor-pointer"
            >
              Pagado de Contado
            </Label>
          </div>
        </div>

        <DialogFooter className="pt-2 shrink-0 flex-row items-center justify-between sm:justify-between gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              className="rounded-full px-5 font-medium h-10 bg-[#252526] hover:bg-[#2e2e2e] text-slate-200 border border-[#2e2e2e]"
            >
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={processingAjuste}
            className="rounded-full px-6 font-semibold h-10 bg-sky-600 hover:bg-sky-500 text-white shadow-md"
          >
            {processingAjuste ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-1.5 h-4 w-4" />
            )}
            Confirmar Ajuste
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
