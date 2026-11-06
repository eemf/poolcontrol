'use client';

import React from 'react';
import type { RegistroAuditoria } from '@/lib/tipos';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Eye, ChevronRight, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  CATEGORIAS_CONFIG, 
  resolverMetaDispositivo, 
  extraerArticulosDeRegistro 
} from '../_utils/auditoria-helpers';

interface AuditoriaFeedItemProps {
  registro: RegistroAuditoria;
  userInfo: { nombre: string; email: string; rol: string };
  horaRelativa: string;
  fechaHora: string;
  onSelect: (registro: RegistroAuditoria) => void;
}

export function AuditoriaFeedItem({
  registro,
  userInfo,
  horaRelativa,
  fechaHora,
  onSelect,
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
  const itemsCard = extraerArticulosDeRegistro(registro);

  return (
    <div
      onClick={() => onSelect(registro)}
      className="group p-3.5 bg-app-surface hover:bg-[#324157]/40 transition-colors border border-app-border rounded-xl shadow-xs cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div className="flex items-start gap-3.5 min-w-0">
        {/* Ícono de categoría */}
        <div className={cn("p-2 rounded-lg shrink-0 border", catConfig.badgeClass)}>
          <IconComponent className="h-4 w-4" />
        </div>

        {/* Contenido principal */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-sm text-foreground">
              {registro.titulo}
            </span>
            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4 font-medium", catConfig.badgeClass)}>
              {catConfig.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              • {horaRelativa}
            </span>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2">
            {registro.descripcion}
          </p>

          {/* Chips de productos y cantidades involucrados */}
          {itemsCard.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {itemsCard.slice(0, 3).map((it, idx) => (
                <span
                  key={idx}
                  className={cn(
                    "inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium border",
                    it.tipo === 'eliminado'
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      : it.tipo === 'devuelto'
                      ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                      : "bg-[#1d283a] text-slate-200 border-app-border"
                  )}
                >
                  <span className={cn(
                    "font-bold",
                    it.tipo === 'eliminado' ? "text-rose-400" : "text-sky-400"
                  )}>
                    {it.tipo === 'eliminado' ? `-${it.cantidad}x` : (it.cantidad > 0 ? `${it.cantidad}x` : `${it.cantidad}`)}
                  </span>
                  <span className="truncate max-w-[150px]">{it.nombre}</span>
                  {it.tipo === 'eliminado' && (
                    <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 border-rose-500/40 text-rose-400 font-bold">
                      Eliminado
                    </Badge>
                  )}
                  {it.subtotal !== undefined && it.subtotal > 0 ? (
                    <span className="text-slate-400 font-mono text-[10px]">
                      (Q{it.subtotal.toFixed(2)})
                    </span>
                  ) : null}
                </span>
              ))}
              {itemsCard.length > 3 && (
                <span className="text-[10px] text-muted-foreground self-center font-medium">
                  +{itemsCard.length - 3} más
                </span>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground pt-0.5">
            {/* Usuario con nombre real */}
            <span className="font-medium text-slate-200 flex items-center gap-1.5">
              <User className="h-3 w-3 text-muted-foreground" />
              {userInfo.nombre}
            </span>

            {/* Rol */}
            {userInfo.rol && (
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-3.5 text-muted-foreground border-app-border">
                {userInfo.rol}
              </Badge>
            )}

            {/* Identificación de Computadora, Tablet o Teléfono */}
            <span className="flex items-center gap-1.5 text-muted-foreground font-medium bg-[#1d283a] px-2 py-0.5 rounded-full border border-app-border text-[11px]">
              <DeviceIcon className={cn("h-3 w-3 shrink-0", deviceMeta.color)} />
              <span className="text-slate-200 font-medium">{equipoNombre}</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                ({deviceMeta.label})
              </span>
            </span>

            <span>•</span>
            <span>{fechaHora}</span>
          </div>
        </div>
      </div>

      {/* Botón de inspeccionar */}
      <div className="flex items-center justify-end gap-2 shrink-0 self-end sm:self-center">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-muted-foreground group-hover:text-foreground group-hover:bg-[#1d283a] rounded-full"
        >
          <Eye className="h-3.5 w-3.5 mr-1" />
          Detalles
          <ChevronRight className="h-3.5 w-3.5 ml-0.5 opacity-60" />
        </Button>
      </div>
    </div>
  );
}
