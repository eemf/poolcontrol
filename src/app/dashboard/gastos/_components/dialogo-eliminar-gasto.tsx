'use client';

import { ModalConfirmacion } from '@/components/comunes';
import { Trash2 } from 'lucide-react';
import type { Gasto } from '@/lib/tipos';

interface DialogoEliminarGastoProps {
  gasto: (Gasto & { docId: string }) | null;
  abierto: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmar: () => void | Promise<void>;
  procesando: boolean;
}

export function DialogoEliminarGasto({
  gasto,
  abierto,
  onOpenChange,
  onConfirmar,
  procesando,
}: DialogoEliminarGastoProps) {
  return (
    <ModalConfirmacion
      open={abierto}
      onOpenChange={onOpenChange}
      tipo="destructivo"
      swalTipo="error"
      titulo="¿Confirmas la eliminación?"
      subtitulo={`Esta acción es permanente. El gasto "${gasto?.descripcion || ''}" será borrado del historial.`}
      textoCancelar="Cancelar"
      textoConfirmar="Sí, Eliminar"
      iconoConfirmar={Trash2}
      procesando={procesando}
      onConfirmar={onConfirmar}
    />
  );
}
