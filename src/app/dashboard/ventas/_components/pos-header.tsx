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
      <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
        <Button 
          variant="outline" 
          className="w-10 h-10 p-0 sm:w-auto sm:h-10 sm:px-4 sm:py-2 rounded-full shrink-0" 
          asChild
        >
          <Link href="/dashboard/mesas" title="Sala de Juegos" aria-label="Sala de Juegos">
            <LayoutGrid className="h-4 w-4 sm:mr-2 shrink-0" />
            <span className="hidden sm:inline">Sala de Juegos</span>
          </Link>
        </Button>
        <Button 
          variant="outline" 
          className="w-10 h-10 p-0 sm:w-auto sm:h-10 sm:px-4 sm:py-2 rounded-full shrink-0" 
          asChild
        >
          <Link href="/dashboard/gestion-tragamonedas" title="Tragamonedas" aria-label="Tragamonedas">
            <Dices className="h-4 w-4 sm:mr-2 shrink-0" />
            <span className="hidden sm:inline">Tragamonedas</span>
          </Link>
        </Button>
        <Button 
          variant="outline" 
          className="w-10 h-10 p-0 sm:w-auto sm:h-10 sm:px-4 sm:py-2 rounded-full shrink-0" 
          asChild
        >
          <Link href="/dashboard/historial-ventas" title="Historial" aria-label="Historial">
            <History className="h-4 w-4 sm:mr-2 shrink-0" />
            <span className="hidden sm:inline">Historial</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
