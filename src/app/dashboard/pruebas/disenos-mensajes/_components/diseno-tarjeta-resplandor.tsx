'use client';

import React from 'react';
import { 
  AlertTriangle, ShieldAlert, Sparkles, CheckCircle2, Clock, ArrowUpRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { VarianteMensaje } from './diseno-acento-lateral';

interface DisenoTarjetaResplandorProps {
  variante?: VarianteMensaje;
  titulo?: string;
  descripcion?: string;
  valoresClave?: Array<{ label: string; valor: string }>;
  textoBotonPrimario?: string;
  textoBotonSecundario?: string;
  onAccionPrimaria?: () => void;
  onAccionSecundaria?: () => void;
}

const CONFIG_GLOW = {
  advertencia: {
    fondo: 'from-amber-500/15 via-[#22211c] to-app-surface',
    borde: 'border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.08)]',
    icono: AlertTriangle,
    colorIcono: 'text-amber-400',
    bgIcono: 'bg-amber-400/20 border-amber-400/30 text-amber-300',
    badgeClase: 'bg-amber-400 text-slate-950 font-black',
    botonPrimario: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold',
    tituloDefecto: 'Alerta Preventiva de Caja',
    descDefecto: 'El saldo acumulado en efectivo excede el límite de custodia sugerido (Q3,500.00). Se sugiere realizar un retiro de resguardo.',
    etiquetaDefecto: 'Custodia Activa',
    valoresDefecto: [
      { label: 'Efectivo en Gaveta', valor: 'Q4,250.00' },
      { label: 'Límite Máximo', valor: 'Q3,500.00' },
      { label: 'Excedente', valor: '+Q750.00' }
    ]
  },
  exito: {
    fondo: 'from-emerald-500/15 via-[#1b2520] to-app-surface',
    borde: 'border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.08)]',
    icono: CheckCircle2,
    colorIcono: 'text-emerald-400',
    bgIcono: 'bg-emerald-400/20 border-emerald-400/30 text-emerald-300',
    badgeClase: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold',
    botonPrimario: 'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold',
    tituloDefecto: 'Cuadre Diario Balanceado al 100%',
    descDefecto: 'Todas las transacciones de ventas, tragamonedas y gastos coinciden exactamente con los comprobantes físicos.',
    etiquetaDefecto: 'Cero Discrepancias',
    valoresDefecto: [
      { label: 'Ingresos Totales', valor: 'Q8,940.00' },
      { label: 'Gastos Registrados', valor: 'Q1,200.00' },
      { label: 'Diferencia', valor: 'Q0.00' }
    ]
  },
  error: {
    fondo: 'from-rose-500/15 via-[#281b1d] to-app-surface',
    borde: 'border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.08)]',
    icono: ShieldAlert,
    colorIcono: 'text-rose-400',
    bgIcono: 'bg-rose-400/20 border-rose-400/30 text-rose-300',
    badgeClase: 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold',
    botonPrimario: 'bg-rose-600 hover:bg-rose-500 text-white font-semibold',
    tituloDefecto: 'Discrepancia en Arqueo Físico',
    descDefecto: 'Se registró una diferencia negativa entre el conteo de billetes y el saldo computarizado del turno.',
    etiquetaDefecto: 'Revisión Inmediata',
    valoresDefecto: [
      { label: 'Esperado en Sistema', valor: 'Q2,150.00' },
      { label: 'Contado en Gaveta', valor: 'Q2,030.00' },
      { label: 'Faltante Detectado', valor: '-Q120.00' }
    ]
  },
  info: {
    fondo: 'from-sky-500/15 via-[#1b2229] to-app-surface',
    borde: 'border-sky-500/40 shadow-[0_0_15px_rgba(14,165,233,0.08)]',
    icono: Sparkles,
    colorIcono: 'text-sky-400',
    bgIcono: 'bg-sky-400/20 border-sky-400/30 text-sky-300',
    badgeClase: 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-bold',
    botonPrimario: 'bg-sky-600 hover:bg-sky-500 text-white font-semibold',
    tituloDefecto: 'Copia de Seguridad Realizada',
    descDefecto: 'Los registros de transacciones e inventario fueron respaldados en la nube institucional de forma cifrada.',
    etiquetaDefecto: 'Nube Sincronizada',
    valoresDefecto: [
      { label: 'Registros Respaldados', valor: '1,420 items' },
      { label: 'Duración', valor: '1.2s' },
      { label: 'Estado', valor: 'Integridad OK' }
    ]
  }
};

export function DisenoTarjetaResplandor({
  variante = 'advertencia',
  titulo,
  descripcion,
  valoresClave,
  textoBotonPrimario = 'Gestionar Ahora',
  textoBotonSecundario = 'Posponer 15 min',
  onAccionPrimaria,
  onAccionSecundaria,
}: DisenoTarjetaResplandorProps) {
  const cfg = CONFIG_GLOW[variante];
  const Icono = cfg.icono;
  const items = valoresClave || cfg.valoresDefecto;

  return (
    <div className={cn(
      "relative rounded-2xl bg-gradient-to-r border p-4 sm:p-5 transition-all overflow-hidden",
      cfg.fondo,
      cfg.borde
    )}>
      <div className="flex flex-col gap-4">
        
        {/* Fila Superior: Icono con Glow + Título y Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-inner",
              cfg.bgIcono
            )}>
              <Icono className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-sm sm:text-base text-slate-100">
                  {titulo || cfg.tituloDefecto}
                </h4>
                <Badge className={cn("text-[10px] px-2 py-0.5 rounded-full border", cfg.badgeClase)}>
                  {cfg.etiquetaDefecto}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground pt-0.5">
                {descripcion || cfg.descDefecto}
              </p>
            </div>
          </div>
        </div>

        {/* Bloque Recesivo Inset con Métricas Destacadas */}
        {items && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#141414] border border-app-border">
            {items.map((item, idx) => (
              <div key={idx} className="flex flex-col px-2 py-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  {item.label}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-100 tabular-nums pt-0.5">
                  {item.valor}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Fila Inferior: Botones de Acción Táctiles */}
        <div className="flex items-center justify-end gap-2.5 pt-1 flex-wrap">
          {textoBotonSecundario && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAccionSecundaria}
              className="h-8 px-3 rounded-full text-xs border-app-border text-slate-300 hover:bg-[#313131]"
            >
              <Clock className="h-3 w-3 mr-1.5 text-muted-foreground" />
              {textoBotonSecundario}
            </Button>
          )}

          <Button
            size="sm"
            onClick={onAccionPrimaria}
            className={cn("h-8 px-4 rounded-full text-xs gap-1.5 transition-transform active:scale-95", cfg.botonPrimario)}
          >
            <span>{textoBotonPrimario}</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>

      </div>
    </div>
  );
}

