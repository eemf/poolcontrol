'use client';

import { PageHeader } from "@/components/comunes";
import { Button } from "@/components/ui/button";
import { PlusCircle, Ghost } from "lucide-react";

interface EncabezadoProductosVirtualesProps {
  onNuevoProducto: () => void;
}

export function EncabezadoProductosVirtuales({ onNuevoProducto }: EncabezadoProductosVirtualesProps) {
  return (
    <PageHeader
      title="Productos Virtuales"
      description="Gestiona servicios o productos que no consumen inventario físico."
      icon={Ghost}
      action={
        <Button
          onClick={onNuevoProducto}
          className="w-full sm:w-auto rounded-full h-9 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md flex items-center justify-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Añadir Producto
        </Button>
      }
    />
  );
}
