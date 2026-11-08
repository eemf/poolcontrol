'use client';

import React, { useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/comunes";
import { Trash2, ShoppingCart, ReceiptText, BadgeCheck, BadgeHelp, PieChart, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { DetalleVenta } from "@/lib/tipos";

const toDate = (fecha: any): Date => {
  if (fecha instanceof Timestamp) return fecha.toDate();
  if (fecha instanceof Date) return fecha;
  if (typeof fecha === 'string') {
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(0);
};

interface POSCartProps {
  carrito: DetalleVenta[];
  clienteSeleccionadoId: string;
  manejarEliminarDelCarrito: (index: number) => void;
}

export function POSCart({ carrito, clienteSeleccionadoId, manejarEliminarDelCarrito }: POSCartProps) {
  const getFechaFormateada = useCallback((fecha: any) => {
    if (!fecha) return '...';
    return format(toDate(fecha), 'hh:mm:ss a');
  }, []);

  const renderizarItemVenta = (item: DetalleVenta) => {
    const isPaid = item.estado === 'Pagada';
    const isPartiallyPaid = item.saldo < item.subtotal && item.saldo > 0.001;
    
    let Icono, color;
    if (isPaid) { Icono = BadgeCheck; color = 'text-green-500'; }
    else if (isPartiallyPaid) { Icono = PieChart; color = 'text-amber-500'; }
    else { Icono = BadgeHelp; color = 'text-red-500'; }
    
    const esItemManual = item.idProducto === 'item-manual';

    return (
      <div className="flex-1">
        <div className="flex items-center gap-2">
            {esItemManual ? <ReceiptText className="h-5 w-5 text-indigo-500 flex-shrink-0" /> : <Icono className={`h-5 w-5 ${color} flex-shrink-0`} />}
            <p className={`font-semibold leading-tight text-sm ${isPaid ? 'line-through text-muted-foreground' : ''}`}>{item.nombreProducto}</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-x-2 text-xs text-muted-foreground ml-7">
            <span className="text-xs">{item.cantidad} &times; Q{(item.precioUnitario ?? 0).toFixed(2)}</span>
            <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {getFechaFormateada(item.fechaAgregado)}
            </div>
        </div>
      </div>
    );
  };

  return (
    <SurfaceCard
      variant="surface"
      className="min-h-[200px] max-h-[380px] overflow-y-auto custom-scrollbar p-2"
    >
      {carrito.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full py-10">
          <ShoppingCart className="h-12 w-12 mb-4" />
          <p className="font-medium">
            {clienteSeleccionadoId ? 'Añade productos al carrito' : 'Selecciona un cliente para empezar.'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#2e2e2e]">
          {carrito.map((item, index) => {
            const tieneAbono = item.estado === 'Pagada' || item.saldo < item.subtotal;
            return (
              <div key={item.idDetalle || index} className="flex items-center gap-4 py-3 px-2">
                <div className="flex-1 min-w-0">
                  {renderizarItemVenta(item)}
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2.5">
                  <div className="font-medium text-sm text-slate-100 tabular-nums">
                    Q{item.subtotal.toFixed(2)}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-rose-500/15 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/25 transition-colors disabled:opacity-40"
                    onClick={() => manejarEliminarDelCarrito(index)}
                    disabled={tieneAbono}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SurfaceCard>
  );
}
