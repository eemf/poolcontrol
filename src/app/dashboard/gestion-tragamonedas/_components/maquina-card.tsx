'use client';

import React from 'react';
import {
  Gamepad2,
  Wallet,
  Landmark,
  Trophy,
  MinusCircle,
  History,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/permission-guard';
import { SurfaceCard } from '@/components/comunes';
import type { GeneralesTragamonedas } from '@/lib/tipos';
import type {
  TragamonedasConDocId,
  EstadoTragamonedas,
  TipoOperacionMaquina,
} from '../_hooks/use-gestion-tragamonedas';

interface MaquinaCardProps {
  maquina: TragamonedasConDocId;
  generales?: GeneralesTragamonedas;
  isLoadingGenerales?: boolean;
  onAbrirOperacion: (tipo: TipoOperacionMaquina, maquina: TragamonedasConDocId) => void;
  onVerHistorial: (maquina: TragamonedasConDocId) => void;
}

export const MaquinaCard = React.memo(function MaquinaCard({
  maquina,
  generales,
  isLoadingGenerales = false,
  onAbrirOperacion,
  onVerHistorial,
}: MaquinaCardProps) {
  const getStatusBadge = (estado: EstadoTragamonedas) => {
    switch (estado) {
      case 'activo':
        return (
          <Badge className="rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[0.625rem] font-semibold h-5 px-2.5">
            Activo
          </Badge>
        );
      case 'mantenimiento':
        return (
          <Badge className="rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[0.625rem] font-semibold h-5 px-2.5">
            Mantenimiento
          </Badge>
        );
      case 'inactivo':
        return (
          <Badge className="rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[0.625rem] font-semibold h-5 px-2.5">
            Inactivo
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="rounded-full text-[0.625rem] h-5 px-2.5">
            {estado}
          </Badge>
        );
    }
  };

  return (
    <SurfaceCard variant="panel" className="p-4 flex flex-col justify-between font-body">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#2e2e2e]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Gamepad2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-100 truncate">{maquina.nombre}</h3>
              {maquina.modelo && (
                <p className="text-[0.6875rem] text-slate-400 truncate">{maquina.modelo}</p>
              )}
            </div>
          </div>
          {getStatusBadge(maquina.estado)}
        </div>

        <div className="py-3">
          {isLoadingGenerales ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
            </div>
          ) : (
            <SurfaceCard variant="surface" className="p-3 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <Wallet className="h-3.5 w-3.5 text-rose-400" /> Deuda
                </span>
                <span className="font-bold text-rose-400 tabular-nums">
                  Q{(generales?.totalDeuda || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <Landmark className="h-3.5 w-3.5 text-sky-400" /> Base
                </span>
                <span className="font-bold text-slate-100 tabular-nums">
                  Q{(generales?.totalBase || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <Trophy className="h-3.5 w-3.5 text-emerald-400" /> Extracción
                </span>
                <span className="font-bold text-emerald-400 tabular-nums">
                  Q{(generales?.totalExtraccion || 0).toFixed(2)}
                </span>
              </div>
            </SurfaceCard>
          )}
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-[#2e2e2e]">
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="secondary"
            className="w-full rounded-full h-8 text-xs font-semibold bg-sky-500/15 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/30 transition-colors"
            onClick={() => onAbrirOperacion('base', maquina)}
          >
            <Landmark className="mr-1.5 h-3.5 w-3.5 shrink-0" />
            Base
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full rounded-full h-8 text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition-colors"
            onClick={() => onAbrirOperacion('extraccion', maquina)}
          >
            <MinusCircle className="mr-1.5 h-3.5 w-3.5 shrink-0" />
            Extracción
          </Button>
        </div>

        <PermissionGuard permission="tragamonedas.historial">
          <Button
            type="button"
            variant="secondary"
            className="w-full rounded-full h-8 text-xs font-semibold bg-[#252526] hover:bg-[#2e2e2e] border border-[#2e2e2e] text-slate-200 transition-colors"
            onClick={() => onVerHistorial(maquina)}
          >
            <History className="mr-1.5 h-3.5 w-3.5 text-sky-400 shrink-0" />
            Ver Historial
          </Button>
        </PermissionGuard>
      </div>
    </SurfaceCard>
  );
});
