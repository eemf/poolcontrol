'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, LayoutGrid, Dices, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/comunes';

export function POSHeader() {
  return (
    <PageHeader
      title="Punto de Venta"
      description="Crea una nueva orden de venta y gestiona cuentas abiertas o créditos."
      icon={ShoppingCart}
      action={
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Button
            variant="secondary"
            size="icon"
            asChild
            className="rounded-full h-9 w-9 bg-[#283244] hover:bg-[#324157] text-slate-200 border border-[#324157] shadow-sm transition-colors"
            title="Sala de Juegos"
            aria-label="Sala de Juegos"
          >
            <Link href="/dashboard/mesas">
              <LayoutGrid className="h-4 w-4 text-sky-400" />
            </Link>
          </Button>

          <Button
            variant="secondary"
            size="icon"
            asChild
            className="rounded-full h-9 w-9 bg-[#283244] hover:bg-[#324157] text-slate-200 border border-[#324157] shadow-sm transition-colors"
            title="Tragamonedas"
            aria-label="Tragamonedas"
          >
            <Link href="/dashboard/gestion-tragamonedas">
              <Dices className="h-4 w-4 text-amber-400" />
            </Link>
          </Button>

          <Button
            variant="secondary"
            size="icon"
            asChild
            className="rounded-full h-9 w-9 bg-[#283244] hover:bg-[#324157] text-slate-200 border border-[#324157] shadow-sm transition-colors"
            title="Historial de Ventas"
            aria-label="Historial de Ventas"
          >
            <Link href="/dashboard/historial-ventas">
              <History className="h-4 w-4 text-emerald-400" />
            </Link>
          </Button>
        </div>
      }
    />
  );
}
