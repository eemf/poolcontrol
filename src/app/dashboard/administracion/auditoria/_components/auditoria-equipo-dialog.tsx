'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { SUGERENCIAS_EQUIPOS, type InfoDispositivo } from '@/lib/utils/dispositivo';

interface AuditoriaEquipoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  infoDispositivo: InfoDispositivo;
  nombreEquipo: string;
  inputNombreEquipo: string;
  setInputNombreEquipo: (v: string) => void;
  onGuardar: (nombre?: string) => void;
  metaDispositivo: {
    icon: React.ElementType;
    label: string;
    badgeClass: string;
    color: string;
  };
}

export function AuditoriaEquipoDialog({
  open,
  onOpenChange,
  infoDispositivo,
  inputNombreEquipo,
  setInputNombreEquipo,
  onGuardar,
  metaDispositivo,
}: AuditoriaEquipoDialogProps) {
  const CurrentDeviceIcon = metaDispositivo.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-app-surface border-app-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <CurrentDeviceIcon className={`h-5 w-5 ${metaDispositivo.color}`} />
            Identificar este {metaDispositivo.label}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Asigna un nombre descriptivo a este dispositivo (por ejemplo: &quot;Tablet Mesas 1&quot;, &quot;Caja Principal&quot;, &quot;Celular Edil&quot;). Este nombre quedará grabado en todas las transacciones y auditorías que se efectúen desde aquí.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Hardware detectado */}
          <div className="bg-[#1e1e1e] p-3 rounded-xl border border-app-border space-y-1 text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <CurrentDeviceIcon className={`h-4 w-4 ${metaDispositivo.color}`} />
              Hardware detectado en este dispositivo:
            </span>
            <div className="flex flex-wrap items-center gap-1.5 text-muted-foreground pt-0.5">
              <Badge variant="secondary" className="text-[11px] font-medium">
                {metaDispositivo.label}
              </Badge>
              <span>•</span>
              <span>{infoDispositivo.so}</span>
              <span>•</span>
              <span>{infoDispositivo.navegador}</span>
              {infoDispositivo.resolucion && (
                <>
                  <span>•</span>
                  <span className="font-mono text-[10px]">{infoDispositivo.resolucion}</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-200">
              Nombre para este dispositivo
            </label>
            <Input
              placeholder="Ej. Tablet Mesas 1, Caja Mostrador, Celular Admin..."
              value={inputNombreEquipo}
              onChange={(e) => setInputNombreEquipo(e.target.value)}
              className="text-sm h-9 bg-[#1e1e1e] border-app-border rounded-full px-4"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Sugerencias rápidas recomendadas:</span>
            <div className="flex flex-wrap gap-1.5">
              {SUGERENCIAS_EQUIPOS.map((sug) => (
                <Button
                  key={sug}
                  type="button"
                  variant={inputNombreEquipo === sug ? 'secondary' : 'outline'}
                  size="sm"
                  className="h-7 text-xs font-normal rounded-full border-app-border"
                  onClick={() => setInputNombreEquipo(sug)}
                >
                  {sug}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-app-border"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={() => onGuardar()}
            disabled={!inputNombreEquipo.trim()}
            className="gap-1.5 rounded-full"
          >
            <Check className="h-4 w-4" />
            Guardar Identificador
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
