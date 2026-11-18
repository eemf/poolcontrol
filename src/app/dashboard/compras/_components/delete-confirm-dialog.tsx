'use client';

import { ModalConfirmacion } from '@/components/comunes';
import { Trash2 } from 'lucide-react';
import type { Compra } from '@/lib/tipos';

interface DeleteConfirmDialogProps {
  compra: (Compra & { docId: string }) | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  loading: boolean;
}

export function DeleteConfirmDialog({
  compra,
  isOpen,
  onOpenChange,
  onConfirm,
  loading,
}: DeleteConfirmDialogProps) {
  return (
    <ModalConfirmacion
      open={isOpen}
      onOpenChange={onOpenChange}
      tipo="destructivo"
      swalTipo="error"
      titulo="¿Eliminar registro?"
      subtitulo={`Esta acción es irreversible. Se borrará la Compra #${compra?.idCompra ?? ''} y se ajustará el stock de los productos involucrados automáticamente.`}
      textoCancelar="Volver"
      textoConfirmar="Confirmar Eliminación"
      iconoConfirmar={Trash2}
      procesando={loading}
      onConfirmar={onConfirm}
    />
  );
}
