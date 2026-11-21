'use client';

import React from 'react';
import Link from 'next/link';
import { FileSignature, ArrowRight, History, CalendarRange } from "lucide-react";
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SurfaceCard } from '@/components/comunes';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { CuadreSemanalConId } from '../_hooks/use-cuadre-mensual';

interface CuadreMensualListaProps {
  cargando: boolean;
  cuadresSemanales: CuadreSemanalConId[] | null;
  selectedCuadres: Set<string>;
  onSelectCuadre: (id: string, isSelected: boolean) => void;
  onSelectAll: () => void;
}

export function CuadreMensualLista({
  cuadresSemanales,
  selectedCuadres,
  onSelectCuadre,
  onSelectAll,
}: CuadreMensualListaProps) {
  return (
    <SurfaceCard variant="panel" className="p-4 space-y-3 font-body">
      <div className="pb-2.5 border-b border-[#2e2e2e]">
        <h3 className="font-bold text-base sm:text-lg text-slate-100 flex items-center gap-2">
          <CalendarRange className="h-5 w-5 text-sky-400 shrink-0" />
          Cuadres Semanales Pendientes
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Selecciona los cortes semanales que deseas incluir en este cierre mensual.
        </p>
      </div>

      {!cuadresSemanales || cuadresSemanales.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center text-slate-400 p-8 border border-dashed rounded-xl border-[#2e2e2e] bg-[#252526] space-y-3">
          <FileSignature className="h-10 w-10 text-sky-400/50" />
          <div className="space-y-1">
            <p className="font-semibold text-sm text-slate-100">No hay cuadres semanales pendientes</p>
            <p className="text-xs text-slate-400">
              Completa un cuadre semanal para que aparezca en este listado o consulta el historial.
            </p>
          </div>
          <Button
            variant="secondary"
            asChild
            className="rounded-full px-5 h-9 text-xs font-semibold border border-[#2e2e2e] bg-[#1e1e1e] hover:bg-[#313131] text-slate-200"
          >
            <Link href="/dashboard/administracion/cuadre-mensual/historial" className="flex items-center gap-2">
              <History className="h-4 w-4 text-emerald-400" />
              <span>Ver Historial</span>
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="flex items-center p-2 border-b border-[#2e2e2e]">
            <Checkbox
              id="select-all-cuadres"
              checked={selectedCuadres.size === cuadresSemanales.length && cuadresSemanales.length > 0}
              onCheckedChange={onSelectAll}
            />
            <Label htmlFor="select-all-cuadres" className="ml-3 flex-1 font-bold text-sm text-slate-100 cursor-pointer">
              Seleccionar Todos ({selectedCuadres.size}/{cuadresSemanales.length})
            </Label>
          </div>

          <div className="space-y-2">
            {cuadresSemanales.map((cuadre) => (
              <div
                key={cuadre.id}
                className="flex items-center p-3 rounded-xl bg-[#252526] border border-[#2e2e2e] hover:bg-[#313131]/60 transition-colors shadow-sm"
              >
                <Checkbox
                  id={`cuadre-${cuadre.id}`}
                  checked={selectedCuadres.has(cuadre.id)}
                  onCheckedChange={(checked) => onSelectCuadre(cuadre.id, !!checked)}
                  className="shrink-0"
                />
                <Label htmlFor={`cuadre-${cuadre.id}`} className="ml-3 flex-1 cursor-pointer min-w-0">
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <CalendarRange className="hidden sm:block h-5 w-5 text-sky-400 shrink-0" />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-bold text-xs sm:text-sm text-slate-100 truncate">
                          #{cuadre.idCuadreSemanal} • {format(cuadre.fecha.toDate(), "dd 'de' MMMM, yyyy", { locale: es })}
                        </span>
                        <span className="text-[0.625rem] sm:text-xs text-slate-400 font-medium flex items-center gap-1 truncate mt-0.5">
                          <span className="truncate">{cuadre.cuentas.origenNombre}</span>
                          <ArrowRight className="h-3 w-3 shrink-0" />
                          <span className="truncate">{cuadre.cuentas.destinoNombre}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                      <p className="font-bold text-sm sm:text-base text-emerald-400 whitespace-nowrap tabular-nums leading-tight">
                        Q{cuadre.resumen.balanceLiquidado.toFixed(2)}
                      </p>
                      <Badge className="rounded-full text-[0.625rem] font-semibold border border-amber-500/30 bg-amber-500/20 text-amber-300 px-2 py-0.5">
                        Pendiente
                      </Badge>
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}
    </SurfaceCard>
  );
}
