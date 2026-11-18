'use client';

import React from 'react';
import { 
  AlertTriangle, ShieldAlert, ArrowLeft, Trash2, AlertCircle 
} from 'lucide-react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ModalAdvertenciaRiesgoProps {
  abierto?: boolean;
  onOpenChange?: (open: boolean) => void;
  modoPreview?: boolean;
}

export function ModalAdvertenciaRiesgo({
  abierto = false,
  onOpenChange,
  modoPreview = false,
}: ModalAdvertenciaRiesgoProps) {
  const contenido = (
    <div className="space-y-4 text-left">
      {/* Cabecera con Icono Ámbar y Títulos */}
      <div className="flex items-start gap-3 pt-1">
        <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
          <AlertTriangle className="h-6 w-6 stroke-[2.2]" />
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base sm:text-lg font-bold text-slate-100">
              ¿Confirmas la Anulación de la Venta?
            </h3>
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black border-amber-500/40">
              Acción Irreversible
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Estás a punto de anular la transacción #193 correspondiente a la Mesa de Billar #4.
          </p>
        </div>
      </div>

      {/* Caja de Impacto y Consecuencias en Fondo Recesivo */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2 text-xs">
        <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
          <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
          Impacto en las operaciones del turno actual:
        </span>
        <ul className="space-y-1.5 pl-5 list-disc text-slate-300 text-[11.5px]">
          <li>
            Se deducirán <strong className="text-amber-300 font-bold">Q120.00</strong> del total recaudado en efectivo de la caja.
          </li>
          <li>
            Se reintegrarán automáticamente <strong className="text-slate-100 font-semibold">2x Cervezas Modelo</strong> al inventario activo.
          </li>
          <li>
            El evento quedará registrado en la <strong className="text-slate-100 font-semibold">Auditoría de Operaciones</strong> con tu usuario.
          </li>
        </ul>
      </div>

      {/* Motivo de la Anulación */}
      <div className="p-3 rounded-xl bg-[#141414] border border-app-border text-xs flex items-center justify-between">
        <span className="text-muted-foreground">Motivo seleccionado:</span>
        <span className="font-semibold text-slate-200">Error en digitación de mesa</span>
      </div>

      {/* Botones de Acción en Píldora */}
      <div className="flex items-center justify-end gap-2.5 pt-2 flex-col-reverse sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange?.(false)}
          className="w-full sm:w-auto h-9 px-4 rounded-full text-xs border-app-border text-slate-300 hover:bg-[#313131] gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Cancelar y Volver</span>
        </Button>

        <Button
          type="button"
          onClick={() => {
            alert("Operación de anulación confirmada.");
            onOpenChange?.(false);
          }}
          className="w-full sm:w-auto h-9 px-5 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs gap-1.5 transition-transform active:scale-95"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Sí, Anular Venta</span>
        </Button>
      </div>
    </div>
  );

  if (modoPreview) {
    return (
      <div className="rounded-2xl bg-app-surface border border-app-border border-t-4 border-t-amber-500 p-5 max-w-lg w-full mx-auto shadow-md">
        {contenido}
      </div>
    );
  }

  return (
    <Dialog open={abierto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-app-surface border-app-border border-t-4 border-t-amber-500 p-5 sm:p-6 rounded-2xl">
        {contenido}
      </DialogContent>
    </Dialog>
  );
}

