'use client';

import { Button } from "@/components/ui/button";
import { DollarSign, PlusCircle } from "lucide-react";

interface EncabezadoGastosProps {
  onNuevoGasto: () => void;
}

export function EncabezadoGastos({ onNuevoGasto }: EncabezadoGastosProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-body">
      <div className="w-full sm:w-auto text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2 text-foreground">
          <DollarSign className="h-6 w-6 text-primary" />
          Registro de Gastos
        </h1>
        <p className="text-xs text-muted-foreground sm:block hidden font-medium">
          Historial de gastos varios del negocio.
        </p>
      </div>
      <Button onClick={onNuevoGasto} className="w-full sm:w-auto rounded-full font-semibold h-11">
        <PlusCircle className="mr-2 h-4 w-4" />
        Nuevo Gasto
      </Button>
    </div>
  );
}
