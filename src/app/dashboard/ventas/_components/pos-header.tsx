'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, LayoutGrid, Dices, History, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/comunes';
import { POSUltimaAccion } from './pos-ultima-accion';
import type { MovimientoRecientePOS } from '../_types/movimiento-pos';

interface POSHeaderProps {
  onOpenUltimosMovimientos?: () => void;
  ultimaAccion?: MovimientoRecientePOS | null;
}

export function POSHeader({ onOpenUltimosMovimientos, ultimaAccion = null }: POSHeaderProps) {
  return (
    <PageHeader
      title="Punto de Venta"
      description="Crea una nueva orden de venta y gestiona cuentas abiertas o créditos."
      icon={ShoppingCart}
      action={
        <div className="flex items-center gap-2 shrink-0">
          {/* Última operación integrada entre el título y los botones en escritorio */}
          {onOpenUltimosMovimientos && (
            <div className="hidden lg:flex items-center mr-1">
              <POSUltimaAccion
                ultimaAccion={ultimaAccion}
                onOpenUltimosMovimientos={onOpenUltimosMovimientos}
                enCabecera
              />
            </div>
          )}

          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenUltimosMovimientos && (
              <Button
                type="button"
                variant="secondary"
                onClick={onOpenUltimosMovimientos}
                className="rounded-full h-9 w-9 xl:w-auto p-0 xl:px-3.5 bg-[#252526] hover:bg-[#313131] text-slate-200 border border-[#2e2e2e] shadow-sm transition-colors text-xs font-semibold gap-1.5 inline-flex items-center justify-center"
                title="Últimos Movimientos del Turno"
                aria-label="Últimos Movimientos del Turno"
              >
                <Clock className="h-4 w-4 text-sky-400 shrink-0" />
                <span className="hidden xl:inline">Movimientos</span>
              </Button>
            )}

            <Button
              variant="secondary"
              asChild
              className="rounded-full h-9 w-9 xl:w-auto p-0 xl:px-3.5 bg-[#252526] hover:bg-[#313131] text-slate-200 border border-[#2e2e2e] shadow-sm transition-colors text-xs font-semibold gap-1.5 inline-flex items-center justify-center"
              title="Sala de Juegos (Mesas)"
              aria-label="Sala de Juegos (Mesas)"
            >
              <Link href="/dashboard/mesas">
                <LayoutGrid className="h-4 w-4 text-sky-400 shrink-0" />
                <span className="hidden xl:inline">Mesas</span>
              </Link>
            </Button>

            <Button
              variant="secondary"
              asChild
              className="rounded-full h-9 w-9 xl:w-auto p-0 xl:px-3.5 bg-[#252526] hover:bg-[#313131] text-slate-200 border border-[#2e2e2e] shadow-sm transition-colors text-xs font-semibold gap-1.5 inline-flex items-center justify-center"
              title="Tragamonedas"
              aria-label="Tragamonedas"
            >
              <Link href="/dashboard/gestion-tragamonedas">
                <Dices className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="hidden xl:inline">Tragamonedas</span>
              </Link>
            </Button>

            {/* Historial mantiene diseño compacto de solo icono */}
            <Button
              variant="secondary"
              size="icon"
              asChild
              className="rounded-full h-9 w-9 p-0 bg-[#252526] hover:bg-[#313131] text-slate-200 border border-[#2e2e2e] shadow-sm transition-colors"
              title="Historial de Ventas"
              aria-label="Historial de Ventas"
            >
              <Link href="/dashboard/historial-ventas">
                <History className="h-4 w-4 text-emerald-400" />
              </Link>
            </Button>
          </div>
        </div>
      }
    />
  );
}
