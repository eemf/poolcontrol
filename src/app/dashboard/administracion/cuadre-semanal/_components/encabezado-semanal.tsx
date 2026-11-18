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
          variant="secondary"
          asChild
          className="w-full sm:w-auto rounded-full h-9 px-4 text-xs font-semibold border border-[#2e2e2e] bg-[#252526] hover:bg-[#313131] text-slate-200 transition-colors"
        >
          <Link href="/dashboard/administracion/cuadre-semanal/historial" className="flex items-center justify-center gap-2">
            <History className="h-4 w-4 text-emerald-400" />
            <span>Historial</span>
          </Link>
        </Button>
      }
    />
  );
}
