import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"

interface CuadreConfirmacionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  procesando: boolean
}

export function CuadreConfirmacionDialog({
  open,
  onOpenChange,
  onConfirm,
  procesando
}: CuadreConfirmacionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl bg-[#1e1e1e] border-[#2e2e2e] text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Confirmar Cierre de Tragamonedas</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300 text-xs leading-relaxed">
            Esta acción registrará un cuadre histórico y reiniciará los totales de base, deuda y extracción de todas las máquinas en la sucursal actual. ¿Estás seguro de continuar?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 pt-2">
          <AlertDialogCancel disabled={procesando} className="rounded-full h-9 bg-[#252526] border-[#2e2e2e] text-slate-200 hover:bg-[#313131] text-xs">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={procesando}
            className="rounded-full h-9 bg-sky-600 hover:bg-sky-500 font-semibold text-white text-xs"
          >
            {procesando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sí, Finalizar Cuadre
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
