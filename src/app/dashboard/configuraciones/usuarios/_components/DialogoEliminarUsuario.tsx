'use client';

import { ModalConfirmacion } from '@/components/comunes';
import { Trash2 } from 'lucide-react';
import type { UsuarioSucursal } from '@/lib/tipos';

interface DialogoEliminarUsuarioProps {
  usuario: (UsuarioSucursal & { docId: string }) | null;
  abierto: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmar: () => void | Promise<void>;
  procesando: boolean;
}

export function DialogoEliminarUsuario({
  usuario,
  abierto,
  onOpenChange,
  onConfirmar,
  procesando,
}: DialogoEliminarUsuarioProps) {
  return (
    <ModalConfirmacion
      open={abierto}
      onOpenChange={onOpenChange}
      tipo="destructivo"
      swalTipo="error"
      titulo="¿Estás seguro?"
      subtitulo={`Esta acción eliminará al usuario "${usuario?.nombre || ''}" de la base de datos de esta sucursal. Su cuenta de autenticación global no será eliminada.`}
      textoCancelar="Cancelar"
      textoConfirmar="Sí, eliminar"
      iconoConfirmar={Trash2}
      procesando={procesando}
      onConfirmar={onConfirmar}
    />
  );
}
