'use client';

import React, { useState } from 'react';
import { 
  Sparkles, Undo2, ArrowRight, Check, Lightbulb, Zap, HelpCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { VarianteMensaje } from './diseno-acento-lateral';

interface DisenoCalloutSugerenciaProps {
  variante?: VarianteMensaje | 'sugerencia';
  titulo?: string;
  descripcion?: string;
  consejoRapido?: string;
  textoAccion?: string;
  onAplicar?: () => void;
}

export function DisenoCalloutSugerencia({
  variante = 'sugerencia',
  titulo = 'Sugerencia de Optimización de Inventario',
  descripcion = 'Se identificaron 3 productos de baja rotación en los últimos 15 días. Puedes agruparlos en una promoción especial.',
  consejoRapido = 'Ahorro estimado en capital inmovilizado: ~Q420.00',
  textoAccion = 'Aplicar Sugerencia',
  onAplicar,
}: DisenoCalloutSugerenciaProps) {
  const [aplicado, setAplicado] = useState(false);

  const handleToggle = () => {
    setAplicado(prev => !prev);
    if (onAplicar) onAplicar();
  };

  return (
    <div className={cn(
      "relative rounded-2xl border p-4 sm:p-5 transition-all shadow-md overflow-hidden",
      "bg-gradient-to-r from-purple-500/15 via-[#1e1e1e] to-sky-500/10",
      aplicado ? "border-emerald-500/40" : "border-purple-500/30 hover:border-purple-500/50"
    )}>
      {/* Luz ambiental decorativa superior */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />

      <div className="flex items-start justify-between gap-3 flex-col md:flex-row">
        
        {/* Lado izquierdo: Icono de inteligencia / destello + Textos */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <div className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center shrink-0 border mt-0.5",
            aplicado 
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              : "bg-purple-500/20 text-purple-300 border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
          )}>
            {aplicado ? <Check className="h-4.5 w-4.5" /> : <Sparkles className="h-4.5 w-4.5" />}
          </div>

          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-slate-100">
                {titulo}
              </span>
              <Badge variant="outline" className={cn(
                "text-[9.5px] px-2 py-0.5 rounded-full",
                aplicado 
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  : "bg-purple-500/15 text-purple-300 border-purple-500/30"
              )}>
                {aplicado ? 'Acción Aplicada' : 'Sugerencia Inteligente'}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {descripcion}
            </p>

            {consejoRapido && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#141414] border border-app-border text-[11px] text-slate-300">
                <Lightbulb className="h-3 w-3 text-amber-400 shrink-0" />
                <span className="font-medium">{consejoRapido}</span>
              </div>
            )}
          </div>
        </div>

        {/* Lado derecho: Botón reversible con efecto Deshacer */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center pt-2 md:pt-0">
          {aplicado ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleToggle}
              className="h-8 px-3 rounded-full text-xs gap-1.5 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
            >
              <Undo2 className="h-3.5 w-3.5" />
              <span>Deshacer Cambio</span>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleToggle}
              className="h-8 px-4 rounded-full text-xs gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium shadow-sm active:scale-95 transition-transform"
            >
              <span>{textoAccion}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}

