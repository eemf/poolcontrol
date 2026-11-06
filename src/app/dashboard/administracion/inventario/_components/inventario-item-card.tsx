import React from 'react';
import type { ProductoConAjuste } from '../_hooks/use-inventario';
import { SurfaceCard } from '@/components/comunes';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InventarioItemCardProps {
  producto: ProductoConAjuste;
}

export function InventarioItemCard({ producto }: InventarioItemCardProps) {
  const esStockBajo = producto.existenciaMinima !== undefined && producto.existencia <= producto.existenciaMinima;

  return (
    <SurfaceCard
      variant="surface"
      className={cn(
        'p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-all',
        esStockBajo && 'border-amber-500/50 bg-amber-500/5'
      )}
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm sm:text-base text-white truncate">
          {producto.nombre}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Badge
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[10px] font-bold border-none shadow-sm',
              esStockBajo ? 'bg-amber-400 text-slate-950' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            )}
          >
            {esStockBajo ? 'Bajo' : 'En stock'}
          </Badge>
          {producto.ubicacion && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#1d283a] border border-[#324157] text-[10px] font-semibold text-slate-300 rounded-full">
              <MapPin className="h-2.5 w-2.5 text-primary" />
              {producto.ubicacion}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right">
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-base sm:text-lg font-bold text-white tabular-nums">
              {producto.existencia}
            </span>
            <span className="text-slate-400 text-xs font-normal">/</span>
            <span className="text-slate-400 text-xs font-normal">
              {producto.existenciaMinima || 0}
            </span>
          </div>
          <p className="text-[10px] font-medium text-slate-400 leading-none mt-0.5">
            Stock / Mín.
          </p>
        </div>
      </div>
    </SurfaceCard>
  );
}
