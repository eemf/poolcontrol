
'use client';

import { Button } from "@/components/ui/button";
import { PlusCircle, ShieldCheck } from "lucide-react";

interface EncabezadoPermisosProps {
  onNuevoRol: () => void;
}

export function EncabezadoPermisos({ onNuevoRol }: EncabezadoPermisosProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left font-body">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2 text-foreground">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Configuración de Permisos
        </h1>
        <p className="text-sm text-muted-foreground hidden sm:block font-body">Administra las capacidades de acceso por roles y usuarios.</p>
      </div>
      <button onClick={onNuevoRol} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-bold h-11 px-8 w-full sm:w-auto">
        <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Rol
      </button>
    </div>
  );
}
