'use client';

import React from 'react';
import type { Mesa } from '@/lib/tipos';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajustar Tiempo para Mesa {mesaParaAjuste?.numeroMesa}</DialogTitle>
          <DialogDescription>Añade tiempo extra a la sesión de juego actual.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-sm">Selecciona cuánto tiempo deseas añadir:</p>
          <ScrollArea className="h-48">
            <div className="grid grid-cols-3 gap-2 p-1">
              {intervalosDeTiempo.map((intervalo) => (
                <Button key={intervalo.minutos} variant={tiempoParaAnadir === intervalo.minutos ? 'default' : 'outline'} onClick={() => setTiempoParaAnadir(intervalo.minutos)}>
                  {intervalo.label}
                </Button>
              ))}
            </div>
          </ScrollArea>
          <div className="flex items-center space-x-2 pt-4">
            <Checkbox id="pagar-ajuste-contado" checked={pagarTiempoAnadido} onCheckedChange={(checked) => setPagarTiempoAnadido(checked as boolean)} />
            <label htmlFor="pagar-ajuste-contado" className="text-sm font-medium">Pagado de Contado</label>
          </div>
          <p className="text-xs text-muted-foreground">Si no marcas "Pagar de Contado", el costo del tiempo adicional se cargará a la cuenta de la mesa para ser cobrado al final.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onConfirm} disabled={processingAjuste}>{processingAjuste && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirmar Ajuste</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
