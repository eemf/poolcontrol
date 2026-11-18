'use client';

import React from 'react';
import { Save, Loader2 } from 'lucide-react';
import { CountBadge } from '@/components/comunes';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface InventarioRevisionFooterProps {
  observaciones: string;
  setObservaciones: (v: string) => void;
  confirmadoCheck: boolean;
  setConfirmadoCheck: (v: boolean) => void;
  onGuardar: () => void;
  procesando: boolean;
  totalProductos: number;
  totalModificados: number;
}

export function InventarioRevisionFooter({
  observaciones,
  setObservaciones,
  confirmadoCheck,
  setConfirmadoCheck,
  onGuardar,
  procesando,
  totalProductos,
  totalModificados,
}: InventarioRevisionFooterProps) {
  return (
    <div className="space-y-3.5 pt-4 border-t border-[#2e2e2e]">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#252526] border border-[#2e2e2e] text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <span>Productos en revisión:</span>
          <CountBadge count={totalProductos} variant="sky" />
        </div>
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <span>Con diferencia:</span>
          <CountBadge count={totalModificados} variant={totalModificados > 0 ? 'amber' : 'emerald'} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="observaciones" className="text-xs font-semibold text-slate-300 ml-1">
          Observaciones de la revisión
        </Label>
        <Textarea
          id="observaciones"
          placeholder="Describe cualquier novedad detectada en el conteo físico..."
          className="rounded-xl resize-none min-h-[80px] text-xs"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2 py-1">
        <Checkbox
          id="confirmar-aplicar"
          checked={confirmadoCheck}
          onCheckedChange={(checked) => setConfirmadoCheck(!!checked)}
          className="rounded-md border-[#2e2e2e] data-[state=checked]:bg-sky-500"
        />
        <Label htmlFor="confirmar-aplicar" className="text-xs cursor-pointer font-medium text-slate-200">
          Confirmo que deseo guardar la revisión y aplicar los ajustes de inventario
        </Label>
      </div>

      <Button
        onClick={onGuardar}
        disabled={procesando || !confirmadoCheck}
        className="w-full rounded-full font-semibold text-xs h-10 bg-sky-600 hover:bg-sky-500 text-white shadow-sm"
      >
        {procesando ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Guardar Revisión de Inventario
      </Button>
    </div>
  );
}
