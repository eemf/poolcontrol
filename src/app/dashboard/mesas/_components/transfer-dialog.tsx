'use client';

import React from 'react';
import type { Mesa } from '@/lib/tipos';
import { ModalConfirmacion } from '@/components/comunes';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowRightLeft } from 'lucide-react';

interface TransferDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mesaParaTraslado: Mesa | null;
  mesaDestinoId: string;
  setMesaDestinoId: (id: string) => void;
  mesasDisponibles: Mesa[];
  onConfirm: () => void | Promise<void>;
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
    <ModalConfirmacion
      open={isOpen}
      onOpenChange={onOpenChange}
      tipo="normal"
      swalTipo="question"
      titulo={`Trasladar ${isConsola ? 'Consola' : 'Mesa'} #${mesaParaTraslado?.numeroMesa}`}
      subtitulo="Selecciona una estación disponible para mover la sesión actual con sus consumos."
      textoCancelar="Cancelar"
      textoConfirmar="Confirmar Traslado"
      iconoConfirmar={ArrowRightLeft}
      procesando={processingTraslado}
      confirmDisabled={!mesaDestinoId}
      onConfirmar={onConfirm}
    >
      <div className="space-y-1.5 text-left">
        <Label htmlFor="mesa-destino" className="text-[0.6875rem] font-semibold text-slate-300 ml-1">
          Estación de Destino
        </Label>
        <Select value={mesaDestinoId} onValueChange={setMesaDestinoId}>
          <SelectTrigger id="mesa-destino" className="h-9 text-xs rounded-full px-3.5">
            <SelectValue placeholder="Seleccionar estación disponible..." />
          </SelectTrigger>
          <SelectContent className="bg-[#252526] border-[#2e2e2e]">
            {mesasDisponibles.map((mesa) => (
              <SelectItem key={mesa.id} value={mesa.id} className="text-xs">
                {mesa.tipoDeMesa === 'Consola' ? 'Consola' : 'Mesa'} #{mesa.numeroMesa} ({mesa.tipoDeMesa})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </ModalConfirmacion>
  );
}
