'use client';

import React from 'react';
import type { RegistroAuditoria } from '@/lib/tipos';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader } from '@/components/ui/loader';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { User, Clock, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  resolverMetaDispositivo, 
  extraerArticulosDeRegistro, 
  type ItemAuditoriaVisual 
} from '../_utils/auditoria-helpers';

interface AuditoriaDetalleDialogProps {
  registro: RegistroAuditoria | null;
  onClose: () => void;
  articulosRecuperados: ItemAuditoriaVisual[] | null;
  cargandoArticulos: boolean;
  userInfo: { nombre: string; email: string; rol: string };
  formatearFechaHora: (fecha: any) => string;
}

export function AuditoriaDetalleDialog({
  registro,
  onClose,
  articulosRecuperados,
  cargandoArticulos,
  userInfo,
  formatearFechaHora,
}: AuditoriaDetalleDialogProps) {
  if (!registro) return null;

  const equipoNombre = registro.nombreEquipo || 'Terminal POS';
  const modalDeviceMeta = resolverMetaDispositivo(
    registro.tipoDispositivo,
    registro.nombreEquipo,
    registro.detallesDispositivo?.so
  );
  const ModalDeviceIcon = modalDeviceMeta.icon;

  const itemsDirectos = extraerArticulosDeRegistro(registro);
  const itemsAVisualizar = itemsDirectos.length > 0 ? itemsDirectos : (articulosRecuperados || []);
  const esRecuperado = itemsDirectos.length === 0 && (articulosRecuperados || []).length > 0;
  const matchTituloVenta = (registro.titulo || '').match(/#(\d+)/);
  const idVentaRef = (registro.detalles as any)?.idVenta || (matchTituloVenta ? matchTituloVenta[1] : '');

  return (
    <Dialog open={!!registro} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg bg-app-surface border-app-border text-foreground">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs font-normal border-app-border">
              {registro.categoria}
            </Badge>
            <Badge variant="secondary" className="text-xs font-normal">
              {registro.accion}
            </Badge>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            {registro.titulo}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            ID del registro: {registro.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Cuadro de Información: Operador y Dispositivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Operador Responsable */}
            <div className="bg-[#1e1e1e] p-3 rounded-xl border border-app-border space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground tracking-wide flex items-center gap-1">
                <User className="h-3 w-3 text-sky-400" />
                Operador Responsable
              </span>
              <div className="flex items-center justify-between pt-0.5">
                <span className="font-semibold text-slate-100 text-sm">
                  {userInfo.nombre}
                </span>
                <Badge variant="outline" className="text-[10px] border-app-border">
                  {userInfo.rol}
                </Badge>
              </div>
              {userInfo.email && (
                <p className="text-xs text-muted-foreground">{userInfo.email}</p>
              )}
              <p className="text-[10px] text-muted-foreground/70 font-mono pt-0.5">
                ID: {registro.usuarioId}
              </p>
            </div>

            {/* Dispositivo / Estación (PC, Tablet, Teléfono) */}
            <div className="bg-[#1e1e1e] p-3 rounded-xl border border-app-border space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground tracking-wide flex items-center gap-1">
                  <ModalDeviceIcon className={cn("h-3 w-3", modalDeviceMeta.color)} />
                  Dispositivo de Registro
                </span>
                <Badge variant="outline" className={cn("text-[10px] px-1 py-0 h-4", modalDeviceMeta.badgeClass)}>
                  {modalDeviceMeta.label}
                </Badge>
              </div>
              <div className="pt-0.5">
                <span className="font-semibold text-slate-100 text-sm flex items-center gap-1.5">
                  {equipoNombre}
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {registro.detallesDispositivo?.so 
                    ? `${registro.detallesDispositivo.so} • ${registro.detallesDispositivo.navegador || 'Navegador Web'}` 
                    : 'Dispositivo detectado automáticamente'}
                  {registro.detallesDispositivo?.resolucion && (
                    <span className="text-[10px] text-muted-foreground/70 block mt-0.5 font-mono">
                      Pantalla: {registro.detallesDispositivo.resolucion}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Fecha y Hora Exacta */}
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Marca de tiempo exacta
            </span>
            <span className="font-medium text-slate-200">
              {formatearFechaHora(registro.fecha)}
            </span>
          </div>

          <Separator className="bg-app-border" />

          {/* Sección de Artículos y Cantidades Involucradas */}
          {(itemsAVisualizar.length > 0 || cargandoArticulos) && (
            <div className="space-y-2 rounded-xl border border-app-border bg-[#1e1e1e] p-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-sky-400" />
                  Artículos y Cantidades Involucradas ({itemsAVisualizar.length})
                </span>
                {esRecuperado && idVentaRef && (
                  <Badge variant="outline" className="text-[10px] text-sky-400 border-sky-400/30 bg-sky-400/5">
                    Recuperado de la venta #{idVentaRef}
                  </Badge>
                )}
              </div>

              {cargandoArticulos ? (
                <div className="flex items-center justify-center py-4 gap-2 text-xs text-muted-foreground">
                  <Loader className="h-4 w-4 animate-spin text-sky-400" />
                  Consultando artículos de la transacción...
                </div>
              ) : (
                <div className="space-y-1.5 pt-1">
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
                          "font-bold px-1.5 py-0.5 rounded border shrink-0 text-xs",
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
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-rose-500/50 text-rose-400 bg-rose-500/10 font-bold">
                            Eliminado
                          </Badge>
                        )}
                        {it.tipo === 'devuelto' && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-amber-400 text-amber-400">
                            Devuelto
                          </Badge>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        {it.subtotal !== undefined && it.subtotal > 0 ? (
                          <span className={cn(
                            "font-mono font-bold",
                            it.tipo === 'eliminado' ? "text-rose-400" : "text-slate-100"
                          )}>
                            {it.tipo === 'eliminado' ? '-' : ''}Q{it.subtotal.toFixed(2)}
                            {it.precioUnitario && it.cantidad > 1 && (
                              <span className="text-[10px] text-muted-foreground block font-normal">
                                Q{it.precioUnitario.toFixed(2)} c/u
                              </span>
                            )}
                          </span>
                        ) : it.precioUnitario !== undefined && it.precioUnitario > 0 ? (
                          <span className={cn(
                            "font-mono font-bold",
                            it.tipo === 'eliminado' ? "text-rose-400" : "text-slate-100"
                          )}>
                            {it.tipo === 'eliminado' ? '-' : ''}Q{(it.precioUnitario * (it.cantidad || 1)).toFixed(2)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Descripción */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground tracking-wide">
              Descripción
            </span>
            <p className="text-xs text-slate-200 bg-[#1e1e1e] p-2.5 rounded-lg border border-app-border leading-relaxed">
              {registro.descripcion}
            </p>
          </div>

          {/* Metadatos y Detalles Técnicos */}
          {registro.detalles && Object.keys(registro.detalles).length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground tracking-wide">
                Detalles Estructurados
              </span>
              <ScrollArea className="max-h-48 rounded-lg border border-app-border bg-[#1e1e1e] p-3">
                <div className="space-y-1.5">
                  {Object.entries(registro.detalles).map(([clave, valor]) => (
                    <div key={clave} className="flex flex-col text-xs pb-1 border-b border-app-border/40 last:border-b-0">
                      <span className="font-mono text-[11px] text-muted-foreground">{clave}:</span>
                      <span className="font-mono text-[11px] text-slate-200 font-medium break-all">
                        {typeof valor === 'object' ? JSON.stringify(valor, null, 2) : String(valor)}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
