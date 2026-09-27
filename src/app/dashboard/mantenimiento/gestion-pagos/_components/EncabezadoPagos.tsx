'use client';

import { HandCoins } from "lucide-react";

export function EncabezadoPagos() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left font-body">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2 text-foreground">
          <HandCoins className="h-6 w-6 text-primary" />
          Gestión de Pagos
        </h1>
        <p className="text-sm text-muted-foreground hidden sm:block font-body">Consulta el registro de todas las transacciones de pago.</p>
      </div>
    </div>
  );
}
