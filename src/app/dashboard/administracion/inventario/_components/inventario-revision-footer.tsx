'use client';

import React from 'react';
import { Save, Loader2 } from 'lucide-react';
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
  hayCambiosPendientes: boolean;
}

export function InventarioRevisionFooter({
  observaciones,
  setObservaciones,
  confirmadoCheck,
  setConfirmadoCheck,
  onGuardar,
  procesando,
  hayCambiosPendientes,
}: InventarioRevisionFooterProps) {
  return (
    <div className="space-y-3.5 pt-4 border-t border-app-border">
      <div className="space-y-1.5">
        <Label htmlFor="observaciones" className="text-xs font-semibold text-slate-300 ml-1">
          Observaciones del ajuste
        </Label>
        <Textarea
          id="observaciones"
          placeholder="Describe cualquier novedad detectada en el conteo físico..."
          className="rounded-xl resize-none min-h-[80px] bg-app-surface border-app-border text-white text-xs placeholder:text-slate-400"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2 py-1">
        <Checkbox
          id="confirmar-aplicar"
          checked={confirmadoCheck}
          onCheckedChange={(checked) => setConfirmadoCheck(!!checked)}
          className="rounded-md border-app-border data-[state=checked]:bg-sky-500"
        />
        <Label htmlFor="confirmar-aplicar" className="text-xs cursor-pointer font-medium text-slate-200">
          Confirmo que deseo aplicar los cambios en el inventario
        </Label>
      </div>

      <Button
        onClick={onGuardar}
        disabled={procesando || !confirmadoCheck || !hayCambiosPendientes}
        className="w-full rounded-full font-semibold text-xs h-10 bg-sky-600 hover:bg-sky-500 text-white shadow-sm"
      >
        {procesando ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Aplicar Ajustes de Inventario
      </Button>
    </div>
  );
}
