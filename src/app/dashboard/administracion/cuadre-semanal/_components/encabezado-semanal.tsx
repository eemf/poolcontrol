'use client';

import { Button } from "@/components/ui/button";
import { CalendarDays, History } from "lucide-react";
import Link from "next/link";

interface EncabezadoSemanalProps {
  hayDatosPendientes: boolean;
}

export function EncabezadoSemanal({ hayDatosPendientes }: EncabezadoSemanalProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2 text-foreground">
          <CalendarDays className="h-6 w-6 text-primary" />
          Cuadre Semanal
        </h1>
        <p className="text-sm text-muted-foreground hidden sm:block">Consolida los ingresos y egresos pendientes para generar un reporte.</p>
      </div>
      <Link href="/dashboard/administracion/cuadre-semanal/historial" className="w-full sm:w-auto">
        <Button variant="outline" className="w-full sm:w-auto rounded-full h-10 px-6 font-bold shadow-xs">
          <History className="mr-2 h-4 w-4" /> 
          Historial
        </Button>
      </Link>
    </div>
  );
}
