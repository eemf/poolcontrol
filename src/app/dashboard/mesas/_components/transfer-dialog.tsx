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
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowRightLeft, Loader2 } from 'lucide-react';

interface TransferDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mesaParaTraslado: Mesa | null;
  mesaDestinoId: string;
  setMesaDestinoId: (id: string) => void;
  mesasDisponibles: Mesa[];
  onConfirm: () => void;
  processingTraslado: boolean;
}

export function TransferDialog({
  isOpen,
  onOpenChange,
  mesaParaTraslado,
  mesaDestinoId,
  setMesaDestinoId,
  mesasDisponibles,
  onConfirm,
  processingTraslado,
}: TransferDialogProps) {
  const isConsola = mesaParaTraslado?.tipoDeMesa === 'Consola';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#1d283a] border-[#324157] text-slate-100 rounded-xl sm:rounded-lg p-5 sm:p-6 font-body shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div className="text-left">
              <DialogTitle className="font-headline text-lg font-bold text-slate-100 leading-tight">
                Trasladar {isConsola ? 'Consola' : 'Mesa'} #{mesaParaTraslado?.numeroMesa}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                Selecciona una estación disponible para mover la sesión actual con sus consumos.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-3 space-y-2">
          <Label htmlFor="mesa-destino" className="text-xs font-medium text-slate-200 ml-1">
            Estación de Destino
          </Label>
          <Select value={mesaDestinoId} onValueChange={setMesaDestinoId}>
            <SelectTrigger id="mesa-destino">
              <SelectValue placeholder="Seleccionar estación disponible..." />
            </SelectTrigger>
            <SelectContent>
              {mesasDisponibles.map((mesa) => (
                <SelectItem key={mesa.id} value={mesa.id}>
                  {mesa.tipoDeMesa === 'Consola' ? 'Consola' : 'Mesa'} #{mesa.numeroMesa} (
                  {mesa.tipoDeMesa})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="pt-2 shrink-0 flex-row items-center justify-between sm:justify-between gap-2 sm:space-x-0">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="h-10 px-5 rounded-full font-medium bg-[#283244] hover:bg-[#324157] text-slate-200 border border-[#324157]"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={!mesaDestinoId || processingTraslado}
            className="h-10 px-6 rounded-full bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-md"
          >
            {processingTraslado && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Traslado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
