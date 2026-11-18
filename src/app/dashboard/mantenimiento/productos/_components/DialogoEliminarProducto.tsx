'use client';

import { ModalConfirmacion } from '@/components/comunes';
import { Trash2 } from 'lucide-react';
import type { Producto } from '@/lib/tipos';

interface DialogoEliminarProductoProps {
  producto: (Producto & { docId: string }) | null;
  abierto: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmar: () => void | Promise<void>;
  procesando: boolean;
}

export function DialogoEliminarProducto({
  producto,
  abierto,
  onOpenChange,
  onConfirmar,
  procesando,
}: DialogoEliminarProductoProps) {
  return (
    <ModalConfirmacion
      open={abierto}
      onOpenChange={onOpenChange}
      tipo="destructivo"
      swalTipo="error"
      titulo="¿Estás seguro?"
      subtitulo={`Esta acción no se puede deshacer. Se eliminará permanentemente el producto "${producto?.nombre || ''}" del catálogo.`}
      textoCancelar="Cancelar"
      textoConfirmar="Eliminar permanentemente"
      iconoConfirmar={Trash2}
      procesando={procesando}
      onConfirmar={onConfirmar}
    />
  );
}
