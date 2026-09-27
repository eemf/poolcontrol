'use client';

import { Button } from "@/components/ui/button";
import { PlusCircle, Truck } from "lucide-react";

interface PurchaseHeaderProps {
  onNewPurchase: () => void;
}

export function PurchaseHeader({ onNewPurchase }: PurchaseHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left font-body">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2 text-foreground">
          <Truck className="h-6 w-6 text-primary" />
          Registro de Compras
        </h1>
        <p className="text-muted-foreground hidden sm:block text-sm font-medium">
          Historial de compras a proveedores para alimentar el inventario.
        </p>
      </div>
      <Button onClick={onNewPurchase} className="w-full sm:w-auto rounded-full font-semibold h-11">
        <PlusCircle className="mr-2 h-4 w-4" />
        Nueva Compra
      </Button>
    </div>
  );
}
