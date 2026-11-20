'use client';

import { PageHeader } from "@/components/comunes";
import { Button } from "@/components/ui/button";
import { PlusCircle, ShieldCheck } from "lucide-react";

interface EncabezadoPermisosProps {
  onNuevoRol: () => void;
}

export function EncabezadoPermisos({ onNuevoRol }: EncabezadoPermisosProps) {
  return (
    <PageHeader
      title="Configuración de Permisos"
      description="Administra las capacidades de acceso por roles y usuarios."
      icon={ShieldCheck}
      action={
        <Button
          onClick={onNuevoRol}
          className="w-full sm:w-auto rounded-full h-9 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md flex items-center justify-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Nuevo Rol
        </Button>
      }
    />
  );
}
