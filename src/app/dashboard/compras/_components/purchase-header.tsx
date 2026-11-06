'use client';

import { PageHeader } from "@/components/comunes";
import { Button } from "@/components/ui/button";
import { PlusCircle, Truck } from "lucide-react";

interface PurchaseHeaderProps {
  onNewPurchase: () => void;
}

export function PurchaseHeader({ onNewPurchase }: PurchaseHeaderProps) {
  return (
    <PageHeader
      title="Compras"
      description="Registro y recepción de compras a proveedores para alimentar inventario."
      icon={Truck}
      action={
        <Button
          onClick={onNewPurchase}
          className="w-full sm:w-auto rounded-full font-semibold h-9 px-4 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 flex items-center justify-center gap-1.5"
        >
          <PlusCircle className="h-4 w-4" />
          Nueva Compra
        </Button>
      }
    />
  );
}
