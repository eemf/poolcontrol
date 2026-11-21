'use client';

import React, { useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SurfaceCard } from "@/components/comunes";
import { Trash2, ShoppingCart, ReceiptText, BadgeCheck, BadgeHelp, PieChart, Clock, Percent } from 'lucide-react';
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-x-2 gap-y-1 text-xs text-muted-foreground ml-7">
          <span className="text-xs">{item.cantidad} &times; Q{(item.precioUnitario ?? 0).toFixed(2)}</span>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {getFechaFormateada(item.fechaAgregado)}
          </div>
          {item.promocionAplicada && (
            <Badge className="w-fit rounded-full text-[0.625rem] font-semibold px-2 py-0 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 gap-1">
              <Percent className="h-2.5 w-2.5" />
              {item.promocionAplicada.nombre}
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <SurfaceCard
      variant="surface"
      className="overflow-y-auto custom-scrollbar p-2 max-h-[380px] lg:max-h-[calc(100vh-17.5rem)]"
    >
      {carrito.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-7 text-center text-slate-400 gap-2.5">
          <ShoppingCart className="h-10 w-10 text-slate-500 stroke-[1.75]" />
          <p className="text-sm font-medium">
            {clienteSeleccionadoId ? 'Añade productos al carrito.' : 'Selecciona un cliente para empezar.'}
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
                  <div className="text-right">
                    {item.promocionAplicada && item.precioOriginal !== undefined && (
                      <div className="text-[0.6875rem] text-slate-500 line-through tabular-nums leading-none mb-0.5">
                        Q{(item.precioOriginal * item.cantidad).toFixed(2)}
                      </div>
                    )}
                    <div className={`font-medium text-sm tabular-nums ${item.promocionAplicada ? 'text-emerald-400 font-semibold' : 'text-slate-100'}`}>
                      Q{item.subtotal.toFixed(2)}
                    </div>
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
