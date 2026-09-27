'use client';

import { Button } from "@/components/ui/button";
import { PlusCircle, Ghost } from "lucide-react";

interface EncabezadoProductosVirtualesProps {
  onNuevoProducto: () => void;
}

export function EncabezadoProductosVirtuales({ onNuevoProducto }: EncabezadoProductosVirtualesProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left font-body">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2 text-foreground">
          <Ghost className="h-6 w-6 text-primary" />
          Productos Virtuales
        </h1>
        <p className="text-sm text-muted-foreground hidden sm:block font-body">Gestiona servicios o productos que no consumen inventario físico.</p>
      </div>
      <Button onClick={onNuevoProducto} className="w-full sm:w-auto rounded-full font-medium h-11">
        <PlusCircle className="mr-2 h-4 w-4" />
        Añadir Producto
      </Button>
    </div>
  );
}
