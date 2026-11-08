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
  const tieneCambio = producto.existenciaFisica !== '';

  return (
    <SurfaceCard
      variant="surface"
      className={cn(
        'p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-all',
        tieneCambio && 'border-primary/60 bg-primary/10'
      )}
    >
      <div className="flex-1 min-w-0">
        <span className="font-semibold text-sm sm:text-base text-white truncate block">
          {producto.nombre}
        </span>
        {producto.ubicacion && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary mt-0.5">
            <MapPin className="h-2.5 w-2.5" />
            {producto.ubicacion}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-4">
        <InputNumero
          data-index={index}
          value={producto.existenciaFisica}
          onChange={(e) => onChange(producto.id, e.target.value)}
          onKeyDown={(e) => onKeyDown(e, index)}
          className="h-9 w-20 sm:w-24 text-center font-bold text-sm rounded-full bg-[#1e1e1e] border-[#2e2e2e] text-white focus-visible:ring-1 focus-visible:ring-primary"
          placeholder="0"
          onFocus={(e) => e.target.select()}
        />
        <span className="text-xs sm:text-sm font-medium text-slate-400">
          / {producto.existencia}
        </span>
      </div>
    </SurfaceCard>
  );
}
