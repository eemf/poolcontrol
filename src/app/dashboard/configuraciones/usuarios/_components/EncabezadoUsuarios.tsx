'use client'

import { PageHeader } from "@/components/comunes/page-header"
import { Button } from "@/components/ui/button"
import { PlusCircle, UserCheck } from "lucide-react"

interface EncabezadoUsuariosProps {
  onNuevoUsuario: () => void
  deshabilitado?: boolean
}

export function EncabezadoUsuarios({ onNuevoUsuario, deshabilitado }: EncabezadoUsuariosProps) {
  return (
    <PageHeader
      title="Gestión de Usuarios"
      description="Administra el personal y colaboradores con acceso al sistema en esta sucursal."
      icon={UserCheck}
      action={
        !deshabilitado ? (
          <Button
            onClick={onNuevoUsuario}
            className="w-full sm:w-auto rounded-full h-9 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md flex items-center justify-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Nuevo Usuario
          </Button>
        ) : undefined
      }
    />
  )
}
