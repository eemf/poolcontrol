'use client'

import { PageHeader } from "@/components/comunes/page-header"
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
          size="sm"
          className="rounded-full bg-sky-600 hover:bg-sky-500 text-white font-bold h-9 shadow-sm"
        >
          <PlusCircle className="mr-1.5 h-4 w-4" />
          Añadir Producto
        </Button>
      }
    />
  )
}
