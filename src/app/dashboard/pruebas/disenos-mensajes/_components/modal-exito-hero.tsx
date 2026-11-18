'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, Printer, ArrowRight, Sparkles, Check 
} from 'lucide-react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ModalExitoHeroProps {
  abierto?: boolean;
  onOpenChange?: (open: boolean) => void;
  modoPreview?: boolean;
}

export function ModalExitoHero({
  abierto = false,
  onOpenChange,
  modoPreview = false,
}: ModalExitoHeroProps) {
  const [imprimiendo, setImprimiendo] = useState(false);

  const contenido = (
    <div className="flex flex-col items-center text-center space-y-4">
      {/* Icono Heroico Superior con Aura */}
      <div className="relative mt-2">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.25)] animate-in zoom-in-50 duration-300">
          <CheckCircle2 className="h-9 w-9 stroke-[2.2]" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-app-surface border border-emerald-500/50 flex items-center justify-center text-emerald-300 shadow-sm">
          <Sparkles className="h-3 w-3" />
        </div>
      </div>

      {/* Títulos y Badge */}
      <div className="space-y-1">
        <div className="flex items-center justify-center gap-2">
          <h3 className="text-lg sm:text-xl font-bold text-slate-100">
            ¡Venta Cobrada con Éxito!
          </h3>
        </div>
        <Badge variant="outline" className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-semibold">
          Comprobante Electrónico #209
        </Badge>
        <p className="text-xs text-muted-foreground pt-1 max-w-sm mx-auto">
          La transacción fue asentada en caja y el inventario de bebidas fue actualizado en tiempo real.
        </p>
      </div>

      {/* Caja Inset (#141414) con Datos Clave de la Transacción */}
      <div className="w-full p-3.5 rounded-2xl bg-[#141414] border border-app-border space-y-2 text-left">
        <div className="flex items-center justify-between pb-2 border-b border-app-border/60 text-xs">
          <span className="text-muted-foreground">Monto Liquidado:</span>
          <span className="text-base font-black text-emerald-400 tabular-nums">Q520.00</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div>
            <span className="text-[10.5px] text-muted-foreground block">Método de Pago:</span>
            <span className="font-semibold text-slate-200">Efectivo (Gaveta)</span>
          </div>
          <div>
            <span className="text-[10.5px] text-muted-foreground block">Cajero:</span>
            <span className="font-semibold text-slate-200 truncate block">Edil Monzón</span>
          </div>
          <div>
            <span className="text-[10.5px] text-muted-foreground block">Artículos:</span>
            <span className="font-semibold text-slate-200">4 unidades</span>
          </div>
          <div>
            <span className="text-[10.5px] text-muted-foreground block">Hora de Registro:</span>
            <span className="font-semibold text-slate-200 tabular-nums">17:40:15</span>
          </div>
        </div>
      </div>

      {/* Botones de Acción en Píldora */}
      <div className="w-full flex flex-col sm:flex-row items-center gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setImprimiendo(true);
            setTimeout(() => setImprimiendo(false), 1500);
          }}
          className="w-full sm:flex-1 h-9 rounded-full text-xs border-app-border text-slate-200 hover:bg-[#313131] gap-1.5"
        >
          <Printer className="h-3.5 w-3.5 text-sky-400" />
          <span>{imprimiendo ? 'Imprimiendo...' : 'Imprimir Ticket'}</span>
        </Button>

        <Button
          type="button"
          onClick={() => onOpenChange?.(false)}
          className="w-full sm:flex-1 h-9 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs gap-1.5 transition-transform active:scale-95"
        >
          <Check className="h-4 w-4" />
          <span>Aceptar y Nueva Venta</span>
        </Button>
      </div>
    </div>
  );

  if (modoPreview) {
    return (
      <div className="rounded-2xl bg-app-surface border border-app-border p-5 max-w-md w-full mx-auto shadow-md">
        {contenido}
      </div>
    );
  }

  return (
    <Dialog open={abierto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-app-surface border-app-border p-5 sm:p-6 rounded-2xl">
        {contenido}
      </DialogContent>
    </Dialog>
  );
}

