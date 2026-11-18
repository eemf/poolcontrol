import React from 'react';
import type { ProductoConAjuste } from '../_hooks/use-inventario';
import { SurfaceCard } from '@/components/comunes';
import { InputNumero } from '@/components/ui/input-numero';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InventarioRevisionItemProps {
  producto: ProductoConAjuste;
  index: number;
  onChange: (productoId: string, valor: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
}

export function InventarioRevisionItem({
  producto,
  index,
  onChange,
  onKeyDown,
}: InventarioRevisionItemProps) {
  const tieneValor = producto.existenciaFisica !== '';
  const tieneModificacion = tieneValor && producto.diferencia !== 0;

  return (
    <SurfaceCard
      variant="surface"
      className={cn(
        'p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-all',
        tieneModificacion
          ? producto.diferencia > 0
            ? 'border-emerald-500/40 bg-emerald-500/5'
            : 'border-rose-500/40 bg-rose-500/5'
          : tieneValor && 'border-sky-500/40 bg-sky-500/5'
      )}
    >
      <div className="flex-1 min-w-0">
        <span className="font-semibold text-sm sm:text-base text-white truncate block">
          {producto.nombre}
        </span>
        <div className="flex items-center gap-2 mt-1">
          {producto.ubicacion && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-400 truncate">
              <MapPin className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{producto.ubicacion}</span>
            </span>
          )}
          {tieneModificacion && (
            <span
              className={cn(
                'inline-flex items-center h-5 px-2 rounded-full text-[10px] font-bold tabular-nums whitespace-nowrap shrink-0',
                producto.diferencia > 0
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              )}
            >
              Dif: {producto.diferencia > 0 ? `+${producto.diferencia}` : producto.diferencia}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 ml-2">
        <InputNumero
          data-index={index}
          value={producto.existenciaFisica}
          onChange={(e) => onChange(producto.id, e.target.value)}
          onKeyDown={(e) => onKeyDown(e, index)}
          className="h-9 w-20 sm:w-24 text-center font-bold text-sm tabular-nums rounded-full bg-[#1e1e1e] border-[#2e2e2e] text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-sky-500"
          placeholder={String(producto.existencia ?? 0)}
          onFocus={(e) => e.target.select()}
        />
        <span className="text-xs sm:text-sm font-medium text-slate-400 tabular-nums min-w-[36px]">
          / {producto.existencia ?? 0}
        </span>
      </div>
    </SurfaceCard>
  );
}
