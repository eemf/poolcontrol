'use client';

import { Button } from "@/components/ui/button";
import { ShoppingCart, LayoutGrid, Dices, History } from 'lucide-react';
import Link from 'next/link';

export function POSHeader() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className='flex flex-col w-full text-center sm:text-left'>
        <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2">
          <ShoppingCart className="h-6 w-6"/>
          <span>Punto de Venta</span>
        </h1>
        <p className="text-xs text-muted-foreground hidden sm:block">
          Crea una nueva orden de venta.
        </p>
      </div>
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 w-full sm:w-auto">
        <Button variant="outline" asChild>
          <Link href="/dashboard/mesas">
            <LayoutGrid className="mr-2 h-4 w-4" />
            Sala de Juegos
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/gestion-tragamonedas">
            <Dices className="mr-2 h-4 w-4" />
            Tragamonedas
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/historial-ventas">
            <History className="mr-2 h-4 w-4" />
            Historial
          </Link>
        </Button>
      </div>
    </div>
  );
}
