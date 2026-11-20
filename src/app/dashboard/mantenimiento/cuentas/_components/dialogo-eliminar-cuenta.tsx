'use client'

import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertTriangle, Loader2 } from 'lucide-react'
import type { CuentaConId } from '../_hooks/use-mantenimiento-cuentas'

interface DialogoEliminarCuentaProps {
  cuentaToDelete: CuentaConId | null
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}

export function DialogoEliminarCuenta({
  cuentaToDelete,
  onClose,
  onConfirm,
  loading,
}: DialogoEliminarCuentaProps) {
  return (
    <AlertDialog open={!!cuentaToDelete} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="bg-[#1e1e1e] border border-[#2e2e2e] text-slate-100 max-w-md rounded-2xl font-body shadow-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-bold text-slate-100">
                ¿Eliminar esta cuenta?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400 text-xs mt-1">
                Esta acción no se puede deshacer. Se eliminará permanentemente la cuenta{' '}
                <strong className="text-slate-200">&quot;{cuentaToDelete?.nombre}&quot;</strong>.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 gap-2">
          <AlertDialogCancel
            onClick={onClose}
            disabled={loading}
            className="rounded-full h-9 px-5 text-xs font-medium bg-[#252526] hover:bg-[#313131] border-[#2e2e2e] text-slate-200"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="rounded-full h-9 px-5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirmar Eliminación
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
