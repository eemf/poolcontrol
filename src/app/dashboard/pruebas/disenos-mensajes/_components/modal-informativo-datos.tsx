'use client';

import React from 'react';
import { 
  Info, CheckCircle2, ShieldCheck, ArrowRight, UserCheck, Clock, Layers 
} from 'lucide-react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ModalInformativoDatosProps {
  abierto?: boolean;
  onOpenChange?: (open: boolean) => void;
  modoPreview?: boolean;
}

export function ModalInformativoDatos({
  abierto = false,
  onOpenChange,
  modoPreview = false,
}: ModalInformativoDatosProps) {
  const checkpoints = [
    { texto: 'Fondo de apertura registrado en libro de caja', ok: true },
    { texto: 'Catálogos de productos y tarifas de mesas sincronizados', ok: true },
    { texto: 'Terminal de impresión POS vinculada y lista', ok: true },
  ];

  const contenido = (
    <div className="space-y-4 text-left">
      {/* Cabecera con Icono Antigravity Azul */}
      <div className="flex items-start gap-3 pt-1">
        <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0 shadow-inner">
          <Info className="h-6 w-6 stroke-[2.2]" />
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base sm:text-lg font-bold text-slate-100">
              Apertura de Turno Confirmada
            </h3>
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border-sky-500/30 font-semibold">
              Turno #48
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Has iniciado sesión operativa en la Sucursal Central Billares. Los datos han quedado asentados en el sistema.
          </p>
        </div>
      </div>

      {/* Cuadrícula de 4 Datos Clave en Sub-bloque Recesivo (#141414) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-[#141414] border border-app-border text-xs">
        <div className="p-2 rounded-lg bg-app-surface/60 border border-app-border/60">
          <span className="text-[10px] text-muted-foreground block font-medium">Operador:</span>
          <span className="font-bold text-slate-200 truncate block text-xs">Edil Monzón</span>
        </div>
        <div className="p-2 rounded-lg bg-app-surface/60 border border-app-border/60">
          <span className="text-[10px] text-muted-foreground block font-medium">Rol:</span>
          <span className="font-bold text-slate-200 truncate block text-xs">Administrador</span>
        </div>
        <div className="p-2 rounded-lg bg-app-surface/60 border border-app-border/60">
          <span className="text-[10px] text-muted-foreground block font-medium">Fondo Inicial:</span>
          <span className="font-bold text-emerald-400 tabular-nums text-xs">Q500.00</span>
        </div>
        <div className="p-2 rounded-lg bg-app-surface/60 border border-app-border/60">
          <span className="text-[10px] text-muted-foreground block font-medium">Hora Inicio:</span>
          <span className="font-bold text-slate-200 tabular-nums text-xs">17:42:00</span>
        </div>
      </div>

      {/* Lista de Checkpoints Verificados */}
      <div className="space-y-1.5 p-3 rounded-xl bg-app-panel border border-app-border text-xs">
        <span className="text-[11px] font-bold text-slate-300 block pb-1 border-b border-app-border/60">
          Comprobaciones previas al servicio:
        </span>
        {checkpoints.map((cp, idx) => (
          <div key={idx} className="flex items-center gap-2 text-slate-200 text-[11.5px] pt-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{cp.texto}</span>
          </div>
        ))}
      </div>

      {/* Botón de Confirmación en Píldora */}
      <div className="flex items-center justify-end gap-2.5 pt-2">
        <Button
          type="button"
          onClick={() => onOpenChange?.(false)}
          className="w-full sm:w-auto h-9 px-5 rounded-full text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-xs gap-1.5 transition-transform active:scale-95"
        >
          <span>Ir al Punto de Venta</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );

  if (modoPreview) {
    return (
      <div className="rounded-2xl bg-app-surface border border-app-border p-5 max-w-lg w-full mx-auto shadow-md">
        {contenido}
      </div>
    );
  }

  return (
    <Dialog open={abierto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-app-surface border-app-border p-5 sm:p-6 rounded-2xl">
        {contenido}
      </DialogContent>
    </Dialog>
  );
}

