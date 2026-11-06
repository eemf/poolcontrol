import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import { TragamonedasConDocId } from "../_hooks/use-config-tragamonedas"

interface EliminarMaquinaDialogProps {
  maquinaToDelete: TragamonedasConDocId | null
  onCancel: () => void
  onConfirm: () => void
}

export function EliminarMaquinaDialog({
  maquinaToDelete,
  onCancel,
  onConfirm
}: EliminarMaquinaDialogProps) {
  return (
    <AlertDialog open={!!maquinaToDelete} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="rounded-2xl bg-[#1d283a] border-[#324157] text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-rose-400 flex items-center gap-2">
            <Trash2 className="h-5 w-5" /> ¿Eliminar máquina tragamonedas?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300">
            Esta acción es permanente. Se eliminará la máquina <span className="font-bold text-white">"{maquinaToDelete?.nombre}"</span> del inventario de la sucursal.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="rounded-full border-[#324157] text-slate-300 hover:bg-[#283244]" onClick={onCancel}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-rose-600 hover:bg-rose-500 rounded-full font-bold text-white">
            Eliminar Máquina
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
