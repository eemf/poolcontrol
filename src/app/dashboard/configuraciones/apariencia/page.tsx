'use client';

import { CheckCircle2, Eye, Loader2, Minus, Plus, RotateCcw, Save, Type } from 'lucide-react';
import { BotonVolverArriba, PageHeader, SurfaceCard } from '@/components/comunes';
import {
  FONT_SCALE_DEFAULT,
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
} from '@/components/comunes/user-font-scale-sync';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PRESETS_FUENTE, usePreferenciaFuente } from './_hooks/use-preferencia-fuente';

/**
 * Página de configuración personal de tamaño de fuente de la aplicación.
 * Cada usuario puede elegir un ajuste predefinido o configurar un porcentaje exacto.
 */
export default function PaginaTamanoFuente() {
  const {
    escala,
    escalaGuardada,
    hayCambios,
    guardando,
    actualizarEscala,
    guardarPreferencia,
    restablecerPreferencia,
  } = usePreferenciaFuente();

  return (
    <div className="space-y-6 font-body pb-8">
      <PageHeader
        title="Tamaño de Fuente"
        description="Personaliza el tamaño de texto de toda la aplicación según tu preferencia."
        icon={Type}
      />

      <SurfaceCard variant="panel" className="p-4 sm:p-5 space-y-5">
        {/* Opciones rápidas predefinidas */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-100">Tamaños predefinidos</h2>
              <p className="text-xs text-slate-400">
                Selecciona una opción rápida o ajusta el porcentaje manualmente abajo.
              </p>
            </div>
            <Badge className="rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 text-xs font-semibold px-3 py-0.5 tabular-nums">
              Actual: {escala}% ({((16 * escala) / 100).toFixed(1)}px)
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PRESETS_FUENTE.map((preset) => {
              const activo = escala === preset.escala;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => actualizarEscala(preset.escala)}
                  className={cn(
                    'rounded-2xl bg-[#252526] border p-4 text-left transition-colors flex flex-col justify-between gap-3',
                    activo
                      ? 'border-sky-500 bg-sky-500/[0.07]'
                      : 'border-[#2e2e2e] hover:border-[#3c3c3c] hover:bg-[#313131]'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-100">{preset.nombre}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'rounded-full text-[11px] font-semibold px-2.5 py-0.5 tabular-nums',
                        activo
                          ? 'bg-sky-600 text-white border-sky-500'
                          : 'bg-[#1e1e1e] border-[#2e2e2e] text-slate-300'
                      )}
                    >
                      {preset.escala}%
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">{preset.descripcion}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Control fino configurable */}
        <div className="rounded-2xl bg-[#252526] border border-[#2e2e2e] p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Ajuste personalizado</h3>
              <p className="text-xs text-slate-400">
                Desliza o usa los botones para elegir entre {FONT_SCALE_MIN}% y {FONT_SCALE_MAX}%.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={escala <= FONT_SCALE_MIN}
                onClick={() => actualizarEscala(escala - 2)}
                className="h-9 w-9 rounded-full bg-[#1e1e1e] border-[#2e2e2e] hover:bg-[#313131] text-slate-200"
                aria-label="Reducir tamaño de fuente"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="min-w-[4.25rem] text-center text-sm font-bold text-sky-400 tabular-nums">
                {escala}%
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={escala >= FONT_SCALE_MAX}
                onClick={() => actualizarEscala(escala + 2)}
                className="h-9 w-9 rounded-full bg-[#1e1e1e] border-[#2e2e2e] hover:bg-[#313131] text-slate-200"
                aria-label="Aumentar tamaño de fuente"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min={FONT_SCALE_MIN}
              max={FONT_SCALE_MAX}
              step={2}
              value={escala}
              onChange={(e) => actualizarEscala(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
              aria-label="Porcentaje de tamaño de fuente"
            />
            <div className="flex justify-between text-[11px] text-slate-400 tabular-nums">
              <span>{FONT_SCALE_MIN}% (Compacto)</span>
              <span>100% (Estándar)</span>
              <span>{FONT_SCALE_MAX}% (Máximo)</span>
            </div>
          </div>
        </div>

        {/* Vista previa en vivo */}
        <div className="rounded-2xl bg-[#252526] border border-[#2e2e2e] p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Eye className="h-4 w-4 text-sky-400" />
            <span>Vista previa en vivo</span>
          </div>

          <div className="rounded-xl bg-[#1e1e1e] border border-[#2e2e2e] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-100">Mesa #4 — Tiempo libre</span>
                <Badge className="rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                  Activa
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Ejemplo de texto descriptivo, importes y botones con tu escala actual ({escala}%).
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-lg font-bold text-sky-400 tabular-nums">Q125.00</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-600 px-4 h-9 text-xs font-semibold text-white">
                <CheckCircle2 className="h-4 w-4" />
                Cobrar
              </span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            disabled={guardando || (escala === FONT_SCALE_DEFAULT && escalaGuardada === FONT_SCALE_DEFAULT)}
            onClick={restablecerPreferencia}
            className="h-9 rounded-full px-5 bg-[#252526] border-[#2e2e2e] hover:bg-[#313131] text-slate-200 font-semibold text-xs"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restablecer (100%)
          </Button>

          <Button
            type="button"
            disabled={guardando || !hayCambios}
            onClick={() => guardarPreferencia()}
            className="h-9 rounded-full px-6 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs"
          >
            {guardando ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar preferencia
          </Button>
        </div>
      </SurfaceCard>

      <BotonVolverArriba threshold={150} />
    </div>
  );
}

