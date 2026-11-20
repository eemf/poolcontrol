'use client';

import { PageHeader } from "@/components/comunes";
import { Button } from "@/components/ui/button";
import { PlusCircle, ShieldCheck } from "lucide-react";

interface EncabezadoRolesProps {
  onNuevoRol: () => void;
}

export function EncabezadoRoles({ onNuevoRol }: EncabezadoRolesProps) {
  return (
    <PageHeader
      title="Gestión de Roles"
      description="Define los roles y permisos para el personal de esta sucursal."
      icon={ShieldCheck}
      action={
        <Button
          onClick={onNuevoRol}
          className="w-full sm:w-auto rounded-full h-9 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md flex items-center justify-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Añadir Rol
        </Button>
      }
    />
  );
}
