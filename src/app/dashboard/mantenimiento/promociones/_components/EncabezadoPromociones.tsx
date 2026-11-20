'use client'

import { PageHeader } from '@/components/comunes'
import { Button } from '@/components/ui/button'
import { Percent, PlusCircle } from 'lucide-react'

interface EncabezadoPromocionesProps {
  onNuevaPromocion: () => void
}

export function EncabezadoPromociones({ onNuevaPromocion }: EncabezadoPromocionesProps) {
  return (
    <PageHeader
      title="Gestión de Promociones"
      description="Configura ofertas 2x1, precios especiales, combos y descuentos sin alterar el catálogo."
      icon={Percent}
      action={
        <Button
          onClick={onNuevaPromocion}
          className="w-full sm:w-auto rounded-full h-9 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md flex items-center justify-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Nueva Promoción
        </Button>
      }
    />
  )
}

