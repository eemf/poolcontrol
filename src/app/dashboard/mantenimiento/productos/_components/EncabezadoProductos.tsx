'use client'

import { PageHeader } from "@/components/comunes"
import { Button } from "@/components/ui/button"
import { PlusCircle, Package } from "lucide-react"

interface EncabezadoProductosProps {
  onNuevoProducto: () => void
}

export function EncabezadoProductos({ onNuevoProducto }: EncabezadoProductosProps) {
  return (
    <PageHeader
      title="Gestión de Productos"
      description="Administra el catálogo de inventario de productos y recetas de preparación."
      icon={Package}
      action={
        <Button
          onClick={onNuevoProducto}
          className="w-full sm:w-auto rounded-full h-9 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md flex items-center justify-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Añadir Producto
        </Button>
      }
    />
  )
}
