'use client';

import { ModalConfirmacion } from '@/components/comunes';
import { Trash2 } from 'lucide-react';
import type { Cliente } from '@/lib/tipos';

interface DialogoEliminarClienteProps {
  cliente: (Cliente & { docId: string }) | null;
  abierto: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmar: () => void | Promise<void>;
  procesando: boolean;
}

export function DialogoEliminarCliente({
  cliente,
  abierto,
  onOpenChange,
  onConfirmar,
  procesando,
}: DialogoEliminarClienteProps) {
  return (
    <ModalConfirmacion
      open={abierto}
      onOpenChange={onOpenChange}
      tipo="destructivo"
      swalTipo="error"
      titulo="¿Eliminar registro?"
      subtitulo={`Esta acción no se puede deshacer. Se eliminará permanentemente a "${cliente?.nombre || ''}" del sistema.`}
      textoCancelar="Cancelar"
      textoConfirmar="Sí, Eliminar"
      iconoConfirmar={Trash2}
      procesando={procesando}
      onConfirmar={onConfirmar}
    />
  );
}
