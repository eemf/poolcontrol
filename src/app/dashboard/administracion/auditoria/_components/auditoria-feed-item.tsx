'use client';

import React, { useMemo } from 'react';
import type { RegistroAuditoria } from '@/lib/tipos';
import { 
  AccordionItem, AccordionTrigger, AccordionContent 
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { 
  User, Clock, Package, ShieldCheck, Loader2, FileText, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  CATEGORIAS_CONFIG, 
  resolverMetaDispositivo, 
  extraerArticulosDeRegistro,
  type ItemAuditoriaVisual 
} from '../_utils/auditoria-helpers';

interface AuditoriaFeedItemProps {
  registro: RegistroAuditoria;
  userInfo: { nombre: string; email: string; rol: string };
  horaRelativa: string;
  fechaHora: string;
  onExpand?: () => void;
  articulosRecuperados?: ItemAuditoriaVisual[] | null;
  cargandoArticulos?: boolean;
  formatearFechaHora: (fecha: any) => string;
}

export function AuditoriaFeedItem({
  registro,
  userInfo,
  horaRelativa,
  fechaHora,
  onExpand,
  articulosRecuperados,
  cargandoArticulos,
  formatearFechaHora,
}: AuditoriaFeedItemProps) {
  const catConfig = CATEGORIAS_CONFIG[registro.categoria] || {
    label: registro.categoria,
    color: 'text-foreground',
    badgeClass: 'bg-muted text-foreground',
    icon: ShieldCheck,
  };
  const IconComponent = catConfig.icon;
  const equipoNombre = registro.nombreEquipo || 'Terminal POS';

  const deviceMeta = resolverMetaDispositivo(
    registro.tipoDispositivo,
    registro.nombreEquipo,
    registro.detallesDispositivo?.so
  );
  const DeviceIcon = deviceMeta.icon;

  const itemsDirectos = extraerArticulosDeRegistro(registro);
  const itemsAVisualizar = itemsDirectos.length > 0 ? itemsDirectos : (articulosRecuperados || []);
  const esRecuperado = itemsDirectos.length === 0 && (articulosRecuperados || []).length > 0;
  const matchTituloVenta = (registro.titulo || '').match(/#(\d+)/);
  const idVentaRef = (registro.detalles as any)?.idVenta || (matchTituloVenta ? matchTituloVenta[1] : '');

  // Detección inteligente de método de pago y monto total
  const metodoPagoDetectado = (registro.detalles as any)?.metodoPago || 
    (registro.detalles as any)?.metodo ||
    (registro.descripcion.match(/\((Efectivo|Tarjeta|Consumo Interno|Crédito)\)/i)?.[1]);

  const totalDetectado = (registro.detalles as any)?.total !== undefined 
    ? Number((registro.detalles as any).total) 
    : (registro.detalles as any)?.monto !== undefined
    ? Number((registro.detalles as any).monto)
    : itemsAVisualizar.length > 0
    ? itemsAVisualizar.reduce((acc, it) => acc + (it.subtotal || 0), 0)
    : undefined;

  // Filtrar claves internas redundantes para no repetir información en metadatos
  const clavesIgnoradas = new Set([
    'items', 'itemsAgregados', 'itemsEliminados', 'articulos', 
    'producto', 'nombreProducto', 'cantidad', 'precio', 'precioUnitario', 
    'total', 'subtotal', 'esVirtual', 'idVenta', 'ventaId', 'metodoPago', 
    'metodo', 'usuarioId', 'nombreEquipo', 'tipoDispositivo', 'fecha'
  ]);

  const metadatosRelevantes = useMemo(() => {
    if (!registro.detalles || typeof registro.detalles !== 'object') return [];
    return Object.entries(registro.detalles).filter(([k, v]) => {
      if (clavesIgnoradas.has(k)) return false;
      if (v === null || v === undefined || v === '') return false;
      return true;
    });
  }, [registro.detalles]);

  // Si la descripción solo repite el nombre del producto y el total que ya están en los artículos, no la duplicamos
  const esDescripcionRedundante = itemsAVisualizar.length > 0 && 
    itemsAVisualizar.some(it => registro.descripcion.toLowerCase().includes(it.nombre.toLowerCase()));
  const mostrarDescripcion = itemsAVisualizar.length === 0 || !esDescripcionRedundante;

  return (
    <AccordionItem
      value={registro.id}
      className="border border-[#2e2e2e] rounded-xl bg-[#252526] hover:border-[#383838] transition-all overflow-hidden shadow-xs"
    >
      <AccordionTrigger
        onClick={onExpand}
        className="p-3 sm:p-3.5 hover:no-underline font-body transition-colors hover:bg-[#2e2e2e]/30 data-[state=open]:border-b data-[state=open]:border-[#2e2e2e]"
      >
        <div className="flex flex-1 items-center justify-between w-full pr-2 sm:pr-4 gap-2.5 sm:gap-4 min-w-0">
          
          {/* Columna Izquierda: Identificación y Detalle Conciso */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 text-left flex-1">
            {/* Icono temático (visible en sm+, oculto en móvil) */}
            <div className={cn("hidden sm:flex w-9 h-9 rounded-full items-center justify-center shrink-0 border", catConfig.badgeClass)}>
              <IconComponent className="h-4.5 w-4.5" />
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              {/* Fila 1: Título a la izquierda y badge de tipo a la derecha en móvil (en línea en sm+) */}
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <span className="font-bold text-xs sm:text-sm text-slate-100 truncate min-w-0 sm:max-w-[280px]">
                  {registro.titulo}
                </span>
                <Badge variant="outline" className={cn("text-[9.5px] px-2 py-0 h-4.5 font-medium rounded-full shrink-0", catConfig.badgeClass)}>
                  {catConfig.label}
                </Badge>
                <span className="hidden sm:inline text-[11px] text-muted-foreground shrink-0">
                  • {horaRelativa}
                </span>
              </div>

              {/* Fila 2: Resumen legible */}
              <p className="text-[11px] sm:text-xs text-slate-300 sm:text-muted-foreground line-clamp-1">
                {registro.descripcion}
              </p>

              {/* Fila 3 (solo móvil): Operador y tiempo relativo limpio sin puntos huérfanos ni rol redundante */}
              <div className="flex sm:hidden items-center justify-between gap-2 text-[11px] text-slate-400 pt-0.5">
                <span className="inline-flex items-center gap-1 text-slate-300 font-medium truncate min-w-0">
                  <User className="h-3 w-3 text-sky-400 shrink-0" />
                  <span className="truncate">{userInfo.nombre}</span>
                </span>
                <span className="text-[10.5px] text-slate-400 shrink-0">
                  {horaRelativa}
                </span>
              </div>
            </div>
          </div>

          {/* Columna Derecha (en sm+): Operador, Dispositivo y Fecha/Hora exacta */}
          <div className="hidden sm:flex flex-col items-end justify-center shrink-0 space-y-1 text-right">
            {/* Operador y Rol */}
            <div className="flex items-center justify-end gap-1.5 text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1">
                <User className="h-3 w-3 text-sky-400" />
                {userInfo.nombre}
              </span>
              {userInfo.rol && (
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-3.5 text-muted-foreground border-app-border rounded-full">
                  {userInfo.rol}
                </Badge>
              )}
            </div>

            {/* Dispositivo / Terminal */}
            <div className="flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 bg-[#1e1e1e] border border-app-border px-2 py-0.5 rounded-full text-slate-200">
                <DeviceIcon className={cn("h-3 w-3 shrink-0", deviceMeta.color)} />
                <span>{equipoNombre}</span>
                <span className="text-[10px] text-muted-foreground">
                  ({deviceMeta.label})
                </span>
              </span>
            </div>

            {/* Fecha y Hora exacta */}
            <div className="flex items-center justify-end gap-1 text-[10.5px] text-muted-foreground tabular-nums">
              <Clock className="h-2.5 w-2.5 text-muted-foreground/70" />
              <span>{fechaHora}</span>
            </div>
          </div>

        </div>
      </AccordionTrigger>

      {/* Contenido Expandido: Paleta oficial 3 capas sin negros */}
      <AccordionContent className="p-3.5 sm:p-4 bg-[#1e1e1e]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs">
          
          {/* Bloque 1: Detalle de la Operación (Artículos y/o Observaciones Reales) */}
          <div className="bg-[#252526] p-3 sm:p-3.5 rounded-xl border border-[#2e2e2e] space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#2e2e2e]">
              <span className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-sky-400" />
                Detalle de la Operación
              </span>
              {idVentaRef && (
                <Badge variant="outline" className="text-[10px] rounded-full border-sky-500/30 text-sky-400 bg-sky-500/10 font-medium">
                  Venta #{idVentaRef}
                </Badge>
              )}
            </div>

            {/* Listado de Artículos (si existen) */}
            {(itemsAVisualizar.length > 0 || cargandoArticulos) ? (
              cargandoArticulos ? (
                <div className="flex items-center justify-center py-3 gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
                  <span>Consultando artículos...</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {itemsAVisualizar.map((it, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg border text-xs",
                        it.tipo === 'eliminado'
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                          : "bg-app-surface border-app-border text-slate-200"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn(
                          "font-bold px-2 py-0.5 rounded-full border shrink-0 text-xs tabular-nums",
                          it.tipo === 'eliminado'
                            ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                            : "bg-sky-500/10 text-sky-400 border-sky-500/20"
                        )}>
                          {it.tipo === 'eliminado' ? `-${it.cantidad}x` : (it.cantidad > 0 ? `${it.cantidad}x` : `${it.cantidad}`)}
                        </span>
                        <span className="font-semibold truncate">
                          {it.nombre}
                        </span>
                        {it.tipo === 'eliminado' && (
                          <Badge variant="outline" className="text-[8.5px] px-1.5 py-0 h-4 border-rose-500/50 text-rose-400 bg-rose-500/10 font-bold rounded-full">
                            Eliminado
                          </Badge>
                        )}
                        {it.tipo === 'devuelto' && (
                          <Badge variant="outline" className="text-[8.5px] px-1.5 py-0 h-4 border-amber-400 text-amber-400 rounded-full">
                            Devuelto
                          </Badge>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        {it.subtotal !== undefined && it.subtotal > 0 ? (
                          <span className={cn(
                            "tabular-nums font-bold",
                            it.tipo === 'eliminado' ? "text-rose-400" : "text-emerald-400"
                          )}>
                            {it.tipo === 'eliminado' ? '-' : ''}Q{it.subtotal.toFixed(2)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}

                  {/* Resumen de Total y Método de Pago sin redundancias */}
                  <div className="flex items-center justify-between pt-2 border-t border-app-border/40 text-xs">
                    <div className="flex items-center gap-1.5">
                      {metodoPagoDetectado && (
                        <Badge variant="outline" className="rounded-full text-[10px] bg-app-surface border-app-border text-slate-300">
                          Método: <strong className="text-sky-400 ml-1">{metodoPagoDetectado}</strong>
                        </Badge>
                      )}
                    </div>
                    {totalDetectado !== undefined && totalDetectado > 0 && (
                      <div className="text-right">
                        <span className="text-muted-foreground mr-1.5">Total:</span>
                        <span className="font-bold tabular-nums text-emerald-400 text-sm">
                          Q{totalDetectado.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            ) : null}

            {/* Observación o Motivo Real (solo si no duplica la lista de artículos) */}
            {mostrarDescripcion && (
              <div className="pt-1">
                <span className="text-[11px] text-muted-foreground block mb-1 font-medium">
                  Observación / Motivo:
                </span>
                <p className="p-2.5 rounded-lg bg-[#1e1e1e] border border-[#2e2e2e] text-slate-200 leading-relaxed text-xs">
                  {registro.descripcion}
                </p>
              </div>
            )}
          </div>

          {/* Bloque 2: Trazabilidad Completa (Quién, Dónde y Cuándo) */}
          <div className="bg-[#252526] p-3 sm:p-3.5 rounded-xl border border-[#2e2e2e] space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#2e2e2e]">
              <span className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Trazabilidad y Seguridad
              </span>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                ID Evento: {registro.id?.slice(0, 8)}...
              </span>
            </div>

            {/* Operador y Dispositivo en cuadrícula de 2 columnas interna */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Responsable */}
              <div className="p-2.5 rounded-lg bg-[#1e1e1e] border border-[#2e2e2e] space-y-1">
                <span className="text-[10.5px] font-medium text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3 text-sky-400" /> Operador Responsable
                </span>
                <div className="flex items-center justify-between gap-1 pt-0.5">
                  <span className="font-bold text-slate-100 truncate text-xs">
                    {userInfo.nombre}
                  </span>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-3.5 rounded-full border-[#2e2e2e] text-muted-foreground shrink-0">
                    {userInfo.rol || 'Operador'}
                  </Badge>
                </div>
              </div>

              {/* Terminal / Dispositivo */}
              <div className="p-2.5 rounded-lg bg-[#1e1e1e] border border-[#2e2e2e] space-y-1">
                <span className="text-[10.5px] font-medium text-muted-foreground flex items-center gap-1">
                  <DeviceIcon className={cn("h-3 w-3 shrink-0", deviceMeta.color)} /> Terminal / Equipo
                </span>
                <div className="flex items-center justify-between gap-1 pt-0.5">
                  <span className="font-bold text-slate-100 truncate text-xs">
                    {equipoNombre}
                  </span>
                  <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-3.5 rounded-full shrink-0", deviceMeta.badgeClass)}>
                    {deviceMeta.label}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Marca de tiempo exacta y Entorno */}
            <div className="p-2.5 rounded-lg bg-[#1e1e1e] border border-[#2e2e2e] flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                <Clock className="h-3.5 w-3.5 text-amber-400" /> Registro exacto
              </span>
              <span className="font-bold tabular-nums text-slate-200 text-xs">
                {formatearFechaHora(registro.fecha)}
              </span>
            </div>

            {/* Parámetros específicos relevantes (filtrando volcados JSON crudos) */}
            {metadatosRelevantes.length > 0 && (
              <div className="pt-1 border-t border-[#2e2e2e]">
                <span className="text-[10.5px] text-muted-foreground block mb-1.5 font-medium">
                  Parámetros adicionales:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {metadatosRelevantes.map(([clave, valor]) => (
                    <span
                      key={clave}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1e1e1e] border border-[#2e2e2e] text-[10.5px]"
                    >
                      <span className="text-muted-foreground capitalize">{clave}:</span>
                      <strong className="text-slate-200 tabular-nums">
                        {typeof valor === 'object' ? JSON.stringify(valor) : String(valor)}
                      </strong>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
