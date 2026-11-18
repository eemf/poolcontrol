'use client';

import React, { useState } from 'react';
import { 
  X, RefreshCw, XCircle, AlertOctagon, CheckCircle, Info 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { VarianteMensaje } from './diseno-acento-lateral';

interface DisenoBannerInlineProps {
  variante?: VarianteMensaje;
  titulo?: string;
  descripcion?: string;
  severidad?: string;
  textoAccion?: string;
  onAccion?: () => void;
  permiteCerrar?: boolean;
}

const CONFIG_BANNER = {
  error: {
    borde: 'border-rose-500/40 hover:border-rose-500/60',
    bgIcono: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    icono: XCircle,
    colorTexto: 'text-rose-300',
    badgeClase: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    botonAccion: 'bg-rose-600 hover:bg-rose-500 text-white',
    tituloDefecto: 'Fallo al procesar cobro electrónico',
    descDefecto: 'La pasarela bancaria rechazó la transacción por tiempo de espera excedido.',
    severidadDefecto: 'Error Crítico',
    iconoAccion: RefreshCw,
    textoAccionDefecto: 'Reintentar Transacción',
  },
  advertencia: {
    borde: 'border-amber-500/40 hover:border-amber-500/60',
    bgIcono: 'bg-amber-400/20 text-amber-400 border-amber-400/30',
    icono: AlertOctagon,
    colorTexto: 'text-amber-300',
    badgeClase: 'bg-amber-400 text-slate-950 font-black',
    botonAccion: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold',
    tituloDefecto: 'Cierre de turno pendiente de validación',
    descDefecto: 'El supervisor aún no ha verificado el arqueo físico del turno anterior.',
    severidadDefecto: 'Pendiente',
    iconoAccion: RefreshCw,
    textoAccionDefecto: 'Validar Turno',
  },
  exito: {
    borde: 'border-emerald-500/40 hover:border-emerald-500/60',
    bgIcono: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icono: CheckCircle,
    colorTexto: 'text-emerald-300',
    badgeClase: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    botonAccion: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    tituloDefecto: 'Dispositivo sincronizado correctamente',
    descDefecto: 'La terminal de ventas Samsung Tab A9 sincronizó todos los catálogos.',
    severidadDefecto: 'En Línea',
    iconoAccion: CheckCircle,
    textoAccionDefecto: 'Ver Estado',
  },
  info: {
    borde: 'border-sky-500/40 hover:border-sky-500/60',
    bgIcono: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    icono: Info,
    colorTexto: 'text-sky-300',
    badgeClase: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    botonAccion: 'bg-sky-600 hover:bg-sky-500 text-white',
    tituloDefecto: 'Actualización disponible en segundo plano',
    descDefecto: 'Nueva compilación Build 75 lista para ser aplicada al sistema.',
    severidadDefecto: 'Actualización',
    iconoAccion: RefreshCw,
    textoAccionDefecto: 'Actualizar',
  },
};

export function DisenoBannerInline({
  variante = 'error',
  titulo,
  descripcion,
  severidad,
  textoAccion,
  onAccion,
  permiteCerrar = true,
}: DisenoBannerInlineProps) {
  const [visible, setVisible] = useState(true);
  const cfg = CONFIG_BANNER[variante];
  const Icono = cfg.icono;
  const IconoAccion = cfg.iconoAccion;

  if (!visible) {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#1e1e1e] border border-dashed border-app-border text-xs text-muted-foreground">
        <span>Banner de notificación cerrado.</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setVisible(true)}
          className="h-7 px-3 rounded-full text-xs text-sky-400 hover:bg-[#252526]"
        >
          Restaurar Vista
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative rounded-2xl bg-app-surface border p-3 sm:px-4 transition-all shadow-md",
      cfg.borde
    )}>
      <div className="flex items-center justify-between gap-3 flex-col sm:flex-row">
        
        {/* Lado izquierdo: Icono de alarma + Contenido en línea */}
        <div className="flex items-center gap-3 min-w-0 flex-1 w-full sm:w-auto">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border relative",
            cfg.bgIcono
          )}>
            <Icono className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-current animate-pulse" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs sm:text-sm text-slate-100">
                {titulo || cfg.tituloDefecto}
              </span>
              <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4 font-semibold rounded-full", cfg.badgeClase)}>
                {severidad || cfg.severidadDefecto}
              </Badge>
            </div>
            <p className="text-[11.5px] text-muted-foreground truncate max-w-full">
              {descripcion || cfg.descDefecto}
            </p>
          </div>
        </div>

        {/* Lado derecho: Acción rápida + Botón cerrar */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center w-full sm:w-auto justify-end pt-1 sm:pt-0">
          <Button
            size="sm"
            onClick={onAccion}
            className={cn("h-8 px-3 rounded-full text-xs gap-1.5 font-medium shadow-xs", cfg.botonAccion)}
          >
            <IconoAccion className="h-3.5 w-3.5" />
            <span>{textoAccion || cfg.textoAccionDefecto}</span>
          </Button>

          {permiteCerrar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setVisible(false)}
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-[#313131]"
              title="Cerrar notificación"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}

