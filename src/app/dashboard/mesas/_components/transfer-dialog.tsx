'use client';

import React from 'react';
import type { Mesa } from '@/lib/tipos';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trasladar Mesa {mesaParaTraslado?.numeroMesa}</DialogTitle>
          <DialogDescription>Selecciona una mesa disponible para mover la sesión actual.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="mesa-destino">Mesa de Destino</Label>
          <Select value={mesaDestinoId} onValueChange={setMesaDestinoId}>
            <SelectTrigger id="mesa-destino"><SelectValue placeholder="Seleccionar mesa..." /></SelectTrigger>
            <SelectContent>
              {mesasDisponibles.map(mesa => (<SelectItem key={mesa.id} value={mesa.id}>Mesa {mesa.numeroMesa}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onConfirm} disabled={!mesaDestinoId || processingTraslado}>{processingTraslado && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirmar Traslado</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
