'use client';

import React, { useState } from 'react';
import { 
  Play, RotateCcw, Smartphone, Monitor, CheckCircle2, AlertTriangle, XCircle, Info, Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DisenoAcentoLateral, type VarianteMensaje } from './diseno-acento-lateral';
import { DisenoTarjetaResplandor } from './diseno-tarjeta-resplandor';
import { DisenoBannerInline } from './diseno-banner-inline';
import { DisenoTarjetaContextual } from './diseno-tarjeta-contextual';
import { DisenoCalloutSugerencia } from './diseno-callout-sugerencia';

export function ProbadorInteractivo() {
  const { toast } = useToast();
  const [disenoActivo, setDisenoActivo] = useState<number>(1);
  const [varianteActiva, setVarianteActiva] = useState<VarianteMensaje>('exito');
  const [modoDispositivo, setModoDispositivo] = useState<'desktop' | 'mobile'>('desktop');
  const [contadorEjecuciones, setContadorEjecuciones] = useState<number>(1);

  const dispararNotificacion = () => {
    setContadorEjecuciones(prev => prev + 1);
    toast({
      title: `Diseño #${disenoActivo} disparado (${varianteActiva.toUpperCase()})`,
      description: "El mensaje ha sido renderizado en el simulador interactivo.",
    });
  };

  return (
    <div className="space-y-4">
      {/* Barra de Controles del Probador */}
      <div className="p-3.5 rounded-2xl bg-app-surface border border-app-border flex items-center justify-between gap-3 flex-wrap">
        
        {/* Selector de Diseño */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground mr-1">
            Diseño:
          </span>
          {[
            { num: 1, label: '1. Acento Lateral' },
            { num: 2, label: '2. Tarjeta Resplandor' },
            { num: 3, label: '3. Banner Inline' },
            { num: 4, label: '4. Contextual' },
            { num: 5, label: '5. Callout Sugerencia' },
          ].map(d => (
            <Button
              key={d.num}
              size="sm"
              variant={disenoActivo === d.num ? "default" : "outline"}
              onClick={() => setDisenoActivo(d.num)}
              className={`h-8 px-3 rounded-full text-xs font-medium ${
                disenoActivo === d.num 
                  ? "bg-sky-600 text-white hover:bg-sky-500" 
                  : "border-app-border text-slate-300 hover:bg-[#313131]"
              }`}
            >
              {d.label}
            </Button>
          ))}
        </div>

        {/* Selector de Severidad / Variante */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground mr-1">
            Variante:
          </span>
          {(['exito', 'advertencia', 'error', 'info'] as VarianteMensaje[]).map(v => (
            <Button
              key={v}
              size="sm"
              variant="outline"
              onClick={() => setVarianteActiva(v)}
              className={`h-7 px-2.5 rounded-full text-[11px] capitalize border-app-border ${
                varianteActiva === v 
                  ? "bg-slate-100 text-slate-950 font-bold" 
                  : "text-muted-foreground hover:text-foreground hover:bg-[#313131]"
              }`}
            >
              {v}
            </Button>
          ))}
        </div>

        {/* Selector de Simulación (Escritorio vs Móvil) */}
        <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-full border border-app-border">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setModoDispositivo('desktop')}
            className={`h-7 px-2.5 rounded-full text-xs gap-1 ${
              modoDispositivo === 'desktop' ? "bg-[#252526] text-sky-400" : "text-muted-foreground"
            }`}
          >
            <Monitor className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Escritorio</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setModoDispositivo('mobile')}
            className={`h-7 px-2.5 rounded-full text-xs gap-1 ${
              modoDispositivo === 'mobile' ? "bg-[#252526] text-sky-400" : "text-muted-foreground"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Móvil</span>
          </Button>
        </div>

      </div>

      {/* Caja de Renderizado / Simulador */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#121212] border border-app-border flex justify-center items-center min-h-[160px]">
        <div className={`w-full transition-all duration-300 ${
          modoDispositivo === 'mobile' ? "max-w-sm border-2 border-dashed border-app-border p-2 rounded-3xl" : "max-w-4xl"
        }`}>
          {disenoActivo === 1 && (
            <DisenoAcentoLateral 
              variante={varianteActiva}
              tiempo="Actualizado justo ahora"
              onAccion={dispararNotificacion}
            />
          )}

          {disenoActivo === 2 && (
            <DisenoTarjetaResplandor 
              variante={varianteActiva}
              onAccionPrimaria={dispararNotificacion}
            />
          )}

          {disenoActivo === 3 && (
            <DisenoBannerInline 
              variante={varianteActiva}
              onAccion={dispararNotificacion}
            />
          )}

          {disenoActivo === 4 && (
            <DisenoTarjetaContextual 
              variante={varianteActiva}
              onAccion={dispararNotificacion}
            />
          )}

          {disenoActivo === 5 && (
            <DisenoCalloutSugerencia 
              onAplicar={dispararNotificacion}
            />
          )}
        </div>
      </div>
    </div>
  );
}

