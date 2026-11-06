import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { AlertTriangle, Eraser, Loader2 } from 'lucide-react'

interface DialogoConfirmarPurgaProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  desdeId: number | ''
  hastaId: number | ''
  procesando: boolean
  onConfirm: () => void
}

export function DialogoConfirmarPurga({
  open,
  onOpenChange,
  desdeId,
  hastaId,
  procesando,
  onConfirm
}: DialogoConfirmarPurgaProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl bg-[#1d283a] border-[#324157] text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold text-rose-400 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> ¿Confirmar purga de datos?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-slate-300 leading-relaxed">
            Estás a punto de borrar permanentemente las ventas desde el ID <strong className="text-white">#{desdeId}</strong> hasta el <strong className="text-white">#{hastaId}</strong>.
            <br /><br />
            Esta acción afectará directamente al historial financiero y no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t border-[#324157]">
          <AlertDialogCancel className="rounded-full border-[#324157] text-slate-300 hover:bg-[#283244]">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={procesando}
            className="rounded-full bg-rose-600 hover:bg-rose-500 font-bold text-white"
          >
            {procesando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eraser className="mr-2 h-4 w-4" />}
            Sí, Borrar Registros
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
