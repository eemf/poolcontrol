'use client';

import { PageHeader } from "@/components/comunes";
import { Button } from "@/components/ui/button";
import { CalendarDays, History } from "lucide-react";
import Link from "next/link";

interface EncabezadoSemanalProps {
  hayDatosPendientes?: boolean;
}

export function EncabezadoSemanal({ }: EncabezadoSemanalProps) {
  return (
    <PageHeader
      title="Cuadre Semanal"
      description="Consolidación y liquidación de ingresos, egresos y traslados pendientes."
      icon={CalendarDays}
      action={
        <Button
          variant="outline"
          asChild
          className="w-full sm:w-auto rounded-full h-9 px-4 text-xs font-semibold border-[#2e2e2e] bg-[#252526] text-slate-200 hover:text-white"
        >
          <Link href="/dashboard/administracion/cuadre-semanal/historial">
            <History className="mr-1.5 h-3.5 w-3.5 text-primary" />
            Historial
          </Link>
        </Button>
      }
    />
  );
}
