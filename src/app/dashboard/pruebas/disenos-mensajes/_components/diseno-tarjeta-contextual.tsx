'use client';

import React from 'react';
import { 
  Info, Database, User, ShieldCheck, ExternalLink, Check, Clock 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { VarianteMensaje } from './diseno-acento-lateral';

interface DisenoTarjetaContextualProps {
  variante?: VarianteMensaje;
  titulo?: string;
  subtitulo?: string;
  detallesContexto?: Array<{ etiqueta: string; valor: string }>;
  enlaceGuia?: string;
  textoBoton?: string;
  onAccion?: () => void;
}

const CONFIG_CONTEXTUAL = {
  info: {
    borde: 'border-app-border hover:border-sky-500/40',
    colorAcento: 'text-sky-400',
    bgIcono: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
    badgeClase: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    botonClase: 'bg-sky-600 hover:bg-sky-500 text-white',
    tituloDefecto: 'Apertura de Período y Asignación de Turno',
    subtituloDefecto: 'Se ha inicializado un nuevo ciclo operativo para la sucursal Central Billares.',
    detallesDefecto: [
      { etiqueta: 'Operador Responsable', valor: 'Edil E. Monzón' },
      { etiqueta: 'Rol / Permiso', valor: 'Administrador Maestro' },
      { etiqueta: 'Turno ID', valor: '#TURNO-2026-11' },
      { etiqueta: 'Saldo Inicial de Caja', valor: 'Q500.00 Efectivo' },
    ]
  },
  exito: {
    borde: 'border-app-border hover:border-emerald-500/40',
    colorAcento: 'text-emerald-400',
    bgIcono: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    badgeClase: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    botonClase: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    tituloDefecto: 'Cierre de Caja Aprobado y Asentado',
    subtituloDefecto: 'El cuadre de turno fue verificado exitosamente y los balances se encuentran conciliados.',
    detallesDefecto: [
      { etiqueta: 'Total Recaudado', valor: 'Q4,820.00' },
      { etiqueta: 'Métodos Registrados', valor: 'Efectivo + Tarjeta' },
      { etiqueta: 'Auditoría', valor: 'Sin Diferencias' },
      { etiqueta: 'Correlativo', valor: '#CIERRE-489' },
    ]
  },
  advertencia: {
    borde: 'border-app-border hover:border-amber-500/40',
    colorAcento: 'text-amber-400',
    bgIcono: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    badgeClase: 'bg-amber-400 text-slate-950 font-bold',
    botonClase: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold',
    tituloDefecto: 'Mantenimiento Preventivo Sugerido',
    subtituloDefecto: 'Las mesas de billar #3 y #5 han acumulado más de 120 horas de juego continuo.',
    detallesDefecto: [
      { etiqueta: 'Área Afectada', valor: 'Sala Principal de Juegos' },
      { etiqueta: 'Última Revisión', valor: 'Hace 28 días' },
      { etiqueta: 'Condición Paño', valor: 'Desgaste Moderado' },
      { etiqueta: 'Prioridad', valor: 'Programar esta semana' },
    ]
  },
  error: {
    borde: 'border-app-border hover:border-rose-500/40',
    colorAcento: 'text-rose-400',
    bgIcono: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
    badgeClase: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    botonClase: 'bg-rose-600 hover:bg-rose-500 text-white',
    tituloDefecto: 'Bloqueo por Intento Fallido de Acceso',
    subtituloDefecto: 'Se registraron 3 intentos consecutivos con credenciales erróneas en la terminal POS.',
    detallesDefecto: [
      { etiqueta: 'IP / Terminal', valor: '192.168.1.45 (Tablet #2)' },
      { etiqueta: 'Hora del Evento', valor: '17:28:10' },
      { etiqueta: 'Estado de Seguridad', valor: 'Dispositivo en Espera' },
      { etiqueta: 'Protocolo', valor: 'Requiere Desbloqueo Admin' },
    ]
  }
};

export function DisenoTarjetaContextual({
  variante = 'info',
  titulo,
  subtitulo,
  detallesContexto,
  enlaceGuia = 'Ver documentación de auditoría',
  textoBoton = 'Entendido y Confirmar',
  onAccion,
}: DisenoTarjetaContextualProps) {
  const cfg = CONFIG_CONTEXTUAL[variante];
  const items = detallesContexto || cfg.detallesDefecto;

  return (
    <div className={cn(
      "rounded-2xl bg-app-panel border p-4 sm:p-5 transition-all shadow-sm space-y-3.5",
      cfg.borde
    )}>
      {/* Cabecera: Icono Antigravity + Títulos */}
      <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center shrink-0 border mt-0.5",
            cfg.bgIcono
          )}>
            <Info className="h-4.5 w-4.5" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-sm sm:text-base text-slate-100">
                {titulo || cfg.tituloDefecto}
              </h4>
              <Badge variant="outline" className={cn("text-[9.5px] px-2 py-0.5 rounded-full", cfg.badgeClase)}>
                Registro Operativo
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground pt-0.5">
              {subtitulo || cfg.subtituloDefecto}
            </p>
          </div>
        </div>

        <div className="text-[11px] text-muted-foreground flex items-center gap-1 shrink-0 self-end sm:self-start">
          <Clock className="h-3 w-3 text-sky-400" />
          <span className="tabular-nums">Sincronizado hoy</span>
        </div>
      </div>

      {/* Bloque Recesivo Inset Oficial (#141414) con Pares Clave/Valor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-3 rounded-xl bg-[#141414] border border-app-border text-xs">
        {items.map((item, idx) => (
          <div key={idx} className="p-2 rounded-lg bg-app-surface/60 border border-app-border/60 space-y-0.5">
            <span className="text-[10px] text-muted-foreground block font-medium">
              {item.etiqueta}:
            </span>
            <span className="font-bold text-slate-200 tabular-nums text-xs">
              {item.valor}
            </span>
          </div>
        ))}
      </div>

      {/* Pie de Acción: Enlace Auxiliar + Botón de Confirmación en Píldora */}
      <div className="flex items-center justify-between gap-3 pt-1 flex-col sm:flex-row">
        <button
          type="button"
          onClick={() => alert("Navegando a documentación")}
          className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1.5 transition-colors group cursor-pointer"
        >
          <span>{enlaceGuia}</span>
          <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <Button
          size="sm"
          onClick={onAccion}
          className={cn("h-8 px-4 rounded-full text-xs font-semibold shadow-xs transition-colors w-full sm:w-auto", cfg.botonClase)}
        >
          <Check className="h-3.5 w-3.5 mr-1.5" />
          {textoBoton}
        </Button>
      </div>
    </div>
  );
}

