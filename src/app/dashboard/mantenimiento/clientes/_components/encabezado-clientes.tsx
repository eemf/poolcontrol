'use client';

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/comunes";
import { PlusCircle, Contact } from "lucide-react";

interface EncabezadoClientesProps {
  onNuevoCliente: () => void;
}

export function EncabezadoClientes({ onNuevoCliente }: EncabezadoClientesProps) {
  return (
    <PageHeader
      title="Gestión de Clientes"
      description="Añade, edita y administra tus clientes y proveedores."
      icon={Contact}
      action={
        <Button
          onClick={onNuevoCliente}
          className="w-full sm:w-auto rounded-full h-9 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md flex items-center justify-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Añadir Cliente
        </Button>
      }
    />
  );
}
