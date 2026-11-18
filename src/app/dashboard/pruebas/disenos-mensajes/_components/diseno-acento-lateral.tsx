'use client';

import React from 'react';
import { 
  CheckCircle2, AlertTriangle, XCircle, Info, ArrowRight, Copy, Check 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type VarianteMensaje = 'exito' | 'advertencia' | 'error' | 'info';

interface DisenoAcentoLateralProps {
  variante?: VarianteMensaje;
  titulo?: string;
  descripcion?: string;
  etiqueta?: string;
  tiempo?: string;
  textoAccion?: string;
  onAccion?: () => void;
  mostrarCopiador?: boolean;
}

const CONFIG_VARIANTES = {
  exito: {
    bordeLateral: 'border-l-emerald-500',
    icono: CheckCircle2,
    colorIcono: 'text-emerald-400',
    bgIcono: 'bg-emerald-500/10 border-emerald-500/20',
    badgeClase: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    botonClase: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    tituloDefecto: 'Operación Registrada con Éxito',
    descDefecto: 'La venta #209 fue liquidada correctamente y los comprobantes fueron enviados al sistema.',
    etiquetaDefecto: 'Completado',
  },
  advertencia: {
    bordeLateral: 'border-l-amber-500',
    icono: AlertTriangle,
    colorIcono: 'text-amber-400',
    bgIcono: 'bg-amber-500/10 border-amber-500/20',
    badgeClase: 'bg-amber-400 text-slate-950 font-black border-amber-500/40',
    botonClase: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold',
    tituloDefecto: 'Advertencia de Límite de Stock',
    descDefecto: 'El artículo Cerveza Corona cuenta con 4 unidades restantes, por debajo del mínimo de seguridad.',
    etiquetaDefecto: 'Atención Requerida',
  },
  error: {
    bordeLateral: 'border-l-rose-500',
    icono: XCircle,
    colorIcono: 'text-rose-400',
    bgIcono: 'bg-rose-500/10 border-rose-500/20',
    badgeClase: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    botonClase: 'bg-rose-600 hover:bg-rose-500 text-white',
    tituloDefecto: 'Error en la Sincronización',
    descDefecto: 'No se pudo conectar con el servicio de impresión remota. Por favor verifica la red local.',
    etiquetaDefecto: 'Fallo Crítico',
  },
  info: {
    bordeLateral: 'border-l-sky-500',
    icono: Info,
    colorIcono: 'text-sky-400',
    bgIcono: 'bg-sky-500/10 border-sky-500/20',
    badgeClase: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    botonClase: 'bg-sky-600 hover:bg-sky-500 text-white',
    tituloDefecto: 'Nuevo Período Aperturado',
    descDefecto: 'El turno del operador Edil Monzón fue iniciado a las 08:00 AM con un fondo inicial de Q500.00.',
    etiquetaDefecto: 'Informativo',
  },
};

export function DisenoAcentoLateral({
  variante = 'exito',
  titulo,
  descripcion,
  etiqueta,
  tiempo = 'Hace 2 min',
  textoAccion = 'Ver Detalle',
  onAccion,
  mostrarCopiador = true,
}: DisenoAcentoLateralProps) {
  const [copiado, setCopiado] = React.useState(false);
  const cfg = CONFIG_VARIANTES[variante];
  const Icono = cfg.icono;

  const copiarCodigo = () => {
    navigator.clipboard.writeText(`border-l-4 ${cfg.bordeLateral} bg-app-surface border border-app-border rounded-xl`);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className={cn(
      "relative rounded-xl bg-app-surface border border-app-border border-l-4 p-4 transition-all shadow-sm",
      cfg.bordeLateral,
      "hover:border-slate-600/50"
    )}>
      <div className="flex items-start justify-between gap-3 flex-col sm:flex-row">
        
        {/* Lado izquierdo: Icono circular + Textos */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center shrink-0 border mt-0.5",
            cfg.bgIcono
          )}>
            <Icono className={cn("h-4.5 w-4.5", cfg.colorIcono)} />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-slate-100">
                {titulo || cfg.tituloDefecto}
              </span>
              <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 rounded-full", cfg.badgeClase)}>
                {etiqueta || cfg.etiquetaDefecto}
              </Badge>
              {tiempo && (
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  • {tiempo}
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed pr-2">
              {descripcion || cfg.descDefecto}
            </p>
          </div>
        </div>

        {/* Lado derecho: Acciones en píldora */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0">
          {mostrarCopiador && (
            <Button
              variant="ghost"
              size="sm"
              onClick={copiarCodigo}
              className="h-8 px-2.5 rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-[#313131]"
              title="Copiar patrón de clases"
            >
              {copiado ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          )}

          <Button
            size="sm"
            onClick={onAccion}
            className={cn("h-8 px-3 rounded-full text-xs gap-1.5 transition-colors shadow-xs", cfg.botonClase)}
          >
            <span>{textoAccion}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

      </div>
    </div>
  );
}

