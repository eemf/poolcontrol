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
            size="sm"
            className="rounded-full bg-sky-600 hover:bg-sky-500 text-white font-bold h-9 shadow-sm"
          >
            <PlusCircle className="mr-1.5 h-4 w-4" />
            Nuevo Usuario
          </Button>
        ) : undefined
      }
    />
  )
}
