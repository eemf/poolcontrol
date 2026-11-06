'use client';

import React from 'react';
import Link from 'next/link';
import { FileSignature, ArrowRight, History } from "lucide-react";
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
  cargando,
  cuadresSemanales,
  selectedCuadres,
  onSelectCuadre,
  onSelectAll,
}: CuadreMensualListaProps) {
  return (
    <SurfaceCard variant="panel" className="p-4 space-y-4">
      <div className="pb-3 border-b border-app-border">
        <h3 className="text-sm font-bold text-slate-100">Cuadres Semanales Pendientes</h3>
        <p className="text-[11px] text-muted-foreground">
          Selecciona los cortes semanales que deseas incluir en este cierre mensual.
        </p>
      </div>

      {!cuadresSemanales || cuadresSemanales.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-xl border-app-border space-y-3">
          <FileSignature className="h-10 w-10 text-sky-400/50" />
          <div className="space-y-1">
            <p className="font-semibold text-sm text-slate-200">No hay cuadres semanales pendientes</p>
            <p className="text-xs text-muted-foreground">
              Completa un cuadre semanal para que aparezca en este listado o consulta el historial.
            </p>
          </div>
          <Button variant="outline" asChild className="rounded-full px-5 h-8 text-xs border-app-border">
            <Link href="/dashboard/administracion/cuadre-mensual/historial">
              <History className="h-3.5 w-3.5 mr-1.5" /> Ver Historial
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="flex items-center p-2.5 rounded-lg bg-[#283244] border border-app-border">
            <Checkbox
              id="select-all-cuadres"
              checked={selectedCuadres.size === cuadresSemanales.length && cuadresSemanales.length > 0}
              onCheckedChange={onSelectAll}
            />
            <Label htmlFor="select-all-cuadres" className="ml-3 font-semibold text-xs text-slate-200 cursor-pointer">
              Seleccionar Todos ({selectedCuadres.size}/{cuadresSemanales.length})
            </Label>
          </div>

          <div className="space-y-2">
            {cuadresSemanales.map((cuadre) => (
              <div
                key={cuadre.id}
                className="flex items-center p-3 rounded-xl bg-[#283244] border border-app-border hover:border-slate-500 transition-colors"
              >
                <Checkbox
                  id={`cuadre-${cuadre.id}`}
                  checked={selectedCuadres.has(cuadre.id)}
                  onCheckedChange={(checked) => onSelectCuadre(cuadre.id, !!checked)}
                />
                <Label htmlFor={`cuadre-${cuadre.id}`} className="ml-3 flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="font-bold text-xs sm:text-sm text-slate-100">
                        #{cuadre.idCuadreSemanal} • Cuadre del {format(cuadre.fecha.toDate(), "dd 'de' LLLL, yyyy", { locale: es })}
                      </span>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        {cuadre.cuentas.origenNombre} <ArrowRight className="inline h-3 w-3" /> {cuadre.cuentas.destinoNombre}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-sm sm:text-base text-emerald-400">
                        Q{cuadre.resumen.balanceLiquidado.toFixed(2)}
                      </p>
                      <Badge variant="outline" className="text-[10px] rounded-full border-sky-500/30 text-sky-400 bg-sky-500/10">
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
