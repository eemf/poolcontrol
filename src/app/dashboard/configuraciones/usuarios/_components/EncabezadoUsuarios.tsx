'use client';

import { Button } from "@/components/ui/button";
import { PlusCircle, UserCheck } from "lucide-react";

interface EncabezadoUsuariosProps {
  onNuevoUsuario: () => void;
  deshabilitado?: boolean;
}

export function EncabezadoUsuarios({ onNuevoUsuario, deshabilitado }: EncabezadoUsuariosProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left font-body">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2 text-foreground">
          <UserCheck className="h-6 w-6 text-primary" />
          Gestión de usuarios
        </h1>
        <p className="text-sm text-muted-foreground hidden sm:block">Administra el personal con acceso al sistema para esta sucursal.</p>
      </div>
      {!deshabilitado && (
        <Button onClick={onNuevoUsuario} className="rounded-full w-full sm:w-auto font-medium h-11">
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir usuario
        </Button>
      )}
    </div>
  );
}
