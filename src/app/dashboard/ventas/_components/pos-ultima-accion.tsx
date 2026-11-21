'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Zap, 
  PlusCircle, 
  CreditCard, 
  Trash2, 
  Clock, 
  History,
  Gift,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { es } from 'date-fns/locale';
import type { MovimientoRecientePOS } from '../_types/movimiento-pos';

interface POSUltimaAccionProps {
  ultimaAccion: MovimientoRecientePOS | null;
  onOpenUltimosMovimientos: () => void;
  enCabecera?: boolean;
}

/**
 * Valida que un idVenta sea un número o correlativo real,
 * descartando undefined, null, "undefined", "null" o cadenas vacías.
 */
function esIdVentaValido(id: any): string | null {
  if (id === null || id === undefined) return null;
  const str = String(id).trim();
  if (!str || str.toLowerCase() === 'undefined' || str.toLowerCase() === 'null' || str === '0') {
    return null;
  }
  return str;
}

export function POSUltimaAccion({
  ultimaAccion,
  onOpenUltimosMovimientos,
  enCabecera = false,
}: POSUltimaAccionProps) {
  // Estado para recalcular el tiempo relativo cada 10 segundos
  const [ahora, setAhora] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setAhora(Date.now());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  if (!ultimaAccion) {
    if (enCabecera) return null;
    return (
      <div className="rounded-xl border border-[#2e2e2e] bg-[#1e1e1e] p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-xs font-body transition-all">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-800/80 border border-[#2e2e2e] flex items-center justify-center shrink-0 text-slate-400">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">
              Punto de Venta Listo
            </p>
            <p className="text-[0.6875rem] text-slate-400 truncate">
              Aquí verás la confirmación de cada venta, cobro o producto agregado.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onOpenUltimosMovimientos}
          className="rounded-full h-8 px-3.5 text-xs font-semibold border-[#2e2e2e] bg-[#252526] hover:bg-[#2e2e2e] text-slate-200 shrink-0 gap-1.5 shadow-xs"
        >
          <History className="h-3.5 w-3.5 text-sky-400" />
          <span className="hidden sm:inline">Historial de Turno</span>
          <span className="sm:hidden">Turno</span>
        </Button>
      </div>
    );
  }

  // Configuración de icono y color según el tipo de acción
  let Icono = CheckCircle2;
  let colorBadge = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  let colorIcono = 'text-emerald-400';

  if (ultimaAccion.tipo === 'venta_rapida') {
    Icono = Zap;
    colorBadge = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    colorIcono = 'text-amber-400';
  } else if (ultimaAccion.tipo === 'productos_agregados') {
    Icono = PlusCircle;
    colorBadge = 'bg-sky-500/15 text-sky-300 border-sky-500/30';
    colorIcono = 'text-sky-400';
  } else if (ultimaAccion.tipo === 'pago' || ultimaAccion.tipo === 'abono') {
    Icono = CreditCard;
    colorBadge = 'bg-teal-500/15 text-teal-300 border-teal-500/30';
    colorIcono = 'text-teal-400';
  } else if (ultimaAccion.tipo === 'item_eliminado') {
    Icono = Trash2;
    colorBadge = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    colorIcono = 'text-rose-400';
  } else if (ultimaAccion.tipo === 'consumo_interno') {
    Icono = Gift;
    colorBadge = 'bg-purple-500/15 text-purple-300 border-purple-500/30';
    colorIcono = 'text-purple-400';
  }

  // 1. Extraer o validar folio de venta
  let idVentaValido = esIdVentaValido(ultimaAccion.idVenta);
  if (!idVentaValido && ultimaAccion.titulo) {
    const match = String(ultimaAccion.titulo).match(/#(\d+)/);
    if (match) {
      idVentaValido = match[1];
    }
  }

  // 2. Extraer o normalizar cliente para no duplicarlo
  let cliente = (ultimaAccion.clienteNombre || '').trim();
  if (!cliente && ultimaAccion.titulo) {
    const matchCli = String(ultimaAccion.titulo).match(/\(([^)]+)\)/);
    if (matchCli) {
      cliente = matchCli[1].trim();
    }
  }
  if (cliente.toLowerCase() === 'venta rápida' || cliente.toLowerCase() === 'venta rapida') {
    cliente = '';
  }

  // 3. Normalizar título de acción sin duplicar número de venta ni cliente
  let tituloLimpio = (ultimaAccion.titulo || '').trim();
  // Quitar #123 y paréntesis del título
  tituloLimpio = tituloLimpio
    .replace(/#\w+/g, '')
    .replace(/\s*\([^)]*\)\s*/g, '')
    .replace(/\s*de venta\s*$/i, '')
    .replace(/\s*a venta\s*$/i, '')
    .replace(/\s*en venta\s*$/i, '')
    .trim();

  // Si quedó genérico o vacío, usar título estándar legible
  if (!tituloLimpio || tituloLimpio.toLowerCase() === 'venta') {
    switch (ultimaAccion.tipo) {
      case 'venta_rapida':
        tituloLimpio = 'Venta Rápida';
        break;
      case 'productos_agregados':
        tituloLimpio = 'Productos Agregados';
        break;
      case 'venta_creada':
        tituloLimpio = 'Cuenta Creada';
        break;
      case 'pago':
        tituloLimpio = 'Cobro de Cuenta';
        break;
      case 'abono':
        tituloLimpio = 'Abono a Cuenta';
        break;
      case 'item_eliminado':
        tituloLimpio = 'Producto Eliminado';
        break;
      case 'consumo_interno':
        tituloLimpio = 'Consumo Interno';
        break;
      default:
        tituloLimpio = 'Venta';
    }
  }

  // Cálculo de tiempo transcurrido
  const fechaAccion = new Date(ultimaAccion.fecha);
  const diffSegundos = Math.max(0, Math.floor((ahora - fechaAccion.getTime()) / 1000));
  let tiempoRelativo = 'Hace un momento';

  if (diffSegundos < 60) {
    tiempoRelativo = `Hace ${diffSegundos <= 5 ? 'unos segundos' : `${diffSegundos}s`}`;
  } else {
    tiempoRelativo = `Hace ${formatDistanceToNowStrict(fechaAccion, { locale: es })}`;
  }

  const horaExacta = format(fechaAccion, 'hh:mm:ss a');

  if (enCabecera) {
    return (
      <button
        type="button"
        onClick={onOpenUltimosMovimientos}
        title="Clic para ver todos los últimos movimientos"
        className="flex items-center gap-2.5 rounded-full border border-sky-500/30 bg-[#1e1e1e] hover:bg-[#252526] px-3 py-1.5 text-left transition-colors w-auto max-w-[280px] xl:max-w-[360px] 2xl:max-w-[460px] cursor-pointer shadow-xs"
      >
        <div
          className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 ${colorBadge}`}
        >
          <Icono className={`w-3.5 h-3.5 ${colorIcono}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[0.6875rem] leading-tight">
            {idVentaValido && (
              <span className="font-bold tabular-nums text-sky-400 shrink-0">
                #{idVentaValido}
              </span>
            )}
            <span className="font-bold text-slate-100 truncate">
              {tituloLimpio}
            </span>
            {cliente && (
              <span className="text-slate-300 truncate max-w-[85px]">
                ({cliente})
              </span>
            )}
            <span className="text-slate-600 shrink-0">•</span>
            <span className="font-semibold text-sky-400 shrink-0">
              {tiempoRelativo}
            </span>
          </div>
          <p className="text-[0.65625rem] text-slate-400 truncate leading-tight mt-0.5">
            {ultimaAccion.descripcion}
          </p>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpenUltimosMovimientos}
      title="Clic para ver todos los últimos movimientos"
      className="w-full flex items-center justify-between gap-2.5 rounded-xl border border-sky-500/30 bg-[#1e1e1e] hover:bg-[#252526] px-3 py-2 text-left transition-colors shadow-xs font-body cursor-pointer"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div
          className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${colorBadge}`}
        >
          <Icono className={`w-4 h-4 ${colorIcono}`} />
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          {/* Fila 1: Número de venta, tipo, cliente y tiempo */}
          <div className="flex items-center gap-1.5 text-xs leading-tight min-w-0">
            {idVentaValido && (
              <span className="text-[0.6875rem] font-bold tabular-nums text-sky-400 shrink-0">
                #{idVentaValido}
              </span>
            )}
            <span className="font-bold text-slate-100 truncate">
              {tituloLimpio}
            </span>
            {cliente && (
              <span className="text-slate-300 truncate max-w-[90px]">
                ({cliente})
              </span>
            )}
            <span className="text-slate-600 shrink-0">•</span>
            <span className="font-semibold text-sky-400 text-[0.6875rem] shrink-0">
              {tiempoRelativo}
            </span>
          </div>

          {/* Fila 2: Descripción en una sola línea */}
          <p className="text-[0.6875rem] text-slate-400 truncate leading-tight">
            {ultimaAccion.descripcion}
          </p>
        </div>
      </div>

      <ArrowRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
    </button>
  );
}
