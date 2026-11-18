'use client';

import React, { useState } from 'react';
import { 
  HelpCircle, Vault, Wallet, Truck, Check, ArrowRight 
} from 'lucide-react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ModalDecisionTarjetasProps {
  abierto?: boolean;
  onOpenChange?: (open: boolean) => void;
  modoPreview?: boolean;
}

export function ModalDecisionTarjetas({
  abierto = false,
  onOpenChange,
  modoPreview = false,
}: ModalDecisionTarjetasProps) {
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<'custodia' | 'gaveta' | 'proveedor'>('custodia');

  const opciones = [
    {
      id: 'custodia' as const,
      titulo: 'Retiro de Custodia a Caja Fuerte',
      desc: 'Transfiere Q1,000.00 al fondo seguro para reducir el riesgo en mostrador.',
      icono: Vault,
      badge: 'Recomendado',
      colorBadge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-bold',
    },
    {
      id: 'gaveta' as const,
      titulo: 'Mantener en Gaveta de Cobro',
      desc: 'Conserva el efectivo disponible para cambio y operaciones del turno.',
      icono: Wallet,
      badge: 'Bajo Control',
      colorBadge: 'bg-muted text-muted-foreground border-app-border',
    },
    {
      id: 'proveedor' as const,
      titulo: 'Aplicar a Pago de Compra',
      desc: 'Liquida directamente la factura pendiente de bebidas (Cervecería Nacional).',
      icono: Truck,
      badge: 'Gasto Directo',
      colorBadge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    },
  ];

  const contenido = (
    <div className="space-y-4 text-left">
      {/* Cabecera Interrogativa */}
      <div className="flex items-start gap-3 pt-1">
        <div className="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 shadow-inner">
          <HelpCircle className="h-6 w-6 stroke-[2.2]" />
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base sm:text-lg font-bold text-slate-100">
              Gestión de Excedente de Efectivo
            </h3>
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border-purple-500/30 font-semibold">
              Excedente +Q1,000
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            El saldo en mostrador supera el tope seguro. Selecciona la acción a ejecutar:
          </p>
        </div>
      </div>

      {/* Lista de Tarjetas Táctiles Seleccionables */}
      <div className="space-y-2">
        {opciones.map((op) => {
          const Icono = op.icono;
          const esActiva = opcionSeleccionada === op.id;

          return (
            <div
              key={op.id}
              onClick={() => setOpcionSeleccionada(op.id)}
              className={cn(
                "p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 text-xs relative",
                esActiva 
                  ? "bg-sky-500/10 border-sky-500 shadow-sm" 
                  : "bg-app-panel border-app-border hover:bg-[#252526] hover:border-slate-600"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border mt-0.5",
                esActiva 
                  ? "bg-sky-500/20 text-sky-400 border-sky-500/40" 
                  : "bg-[#141414] text-muted-foreground border-app-border"
              )}>
                <Icono className="h-4 w-4" />
              </div>

              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <span className={cn("font-bold text-xs sm:text-sm", esActiva ? "text-sky-300" : "text-slate-200")}>
                    {op.titulo}
                  </span>
                  <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4 rounded-full", op.colorBadge)}>
                    {op.badge}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {op.desc}
                </p>
              </div>

              {/* Indicador tipo Radio en píldora */}
              <div className={cn(
                "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-1",
                esActiva ? "border-sky-500 bg-sky-500 text-slate-950" : "border-app-border"
              )}>
                {esActiva && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Botones de Acción en Píldora */}
      <div className="flex items-center justify-end gap-2.5 pt-2 flex-col-reverse sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange?.(false)}
          className="w-full sm:w-auto h-9 px-4 rounded-full text-xs border-app-border text-slate-300 hover:bg-[#313131]"
        >
          Omitir por Ahora
        </Button>

        <Button
          type="button"
          onClick={() => {
            alert(`Acción confirmada: ${opcionSeleccionada.toUpperCase()}`);
            onOpenChange?.(false);
          }}
          className="w-full sm:w-auto h-9 px-5 rounded-full text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-xs gap-1.5 transition-transform active:scale-95"
        >
          <span>Confirmar Acción</span>
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

