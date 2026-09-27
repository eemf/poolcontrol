'use client';

import { Button } from "@/components/ui/button";
import { PlusCircle, Contact } from "lucide-react";

interface EncabezadoClientesProps {
  onNuevoCliente: () => void;
}

export function EncabezadoClientes({ onNuevoCliente }: EncabezadoClientesProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left font-body">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2 text-foreground">
          <Contact className="h-6 w-6 text-primary" />
          Gestión de Clientes
        </h1>
        <p className="text-sm text-muted-foreground hidden sm:block">Añade, edita y administra tus clientes y proveedores.</p>
      </div>
      <Button onClick={onNuevoCliente} className="w-full sm:w-auto rounded-full font-medium h-11">
        <PlusCircle className="mr-2 h-4 w-4" />
        Añadir Cliente
      </Button>
    </div>
  );
}
