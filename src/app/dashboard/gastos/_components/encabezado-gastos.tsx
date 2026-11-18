'use client';

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/comunes";
import { DollarSign, PlusCircle } from "lucide-react";

interface EncabezadoGastosProps {
  onNuevoGasto: () => void;
}

export function EncabezadoGastos({ onNuevoGasto }: EncabezadoGastosProps) {
  return (
    <PageHeader
      title="Registro de Gastos"
      description="Historial de gastos varios del negocio."
      icon={DollarSign}
      action={
        <Button
          onClick={onNuevoGasto}
          className="w-full sm:w-auto rounded-full h-9 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md flex items-center justify-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Nuevo Gasto
        </Button>
      }
    />
  );
}
