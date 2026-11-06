import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import { TarifaConDocId, MesaConDocId } from "../_types/mesas-config-types"

interface EliminarDialogsProps {
  tarifaToDelete: TarifaConDocId | null
  mesaToDelete: MesaConDocId | null
  onCancelTarifa: () => void
  onConfirmTarifa: () => void
  onCancelMesa: () => void
  onConfirmMesa: () => void
}

export function EliminarDialogs({
  tarifaToDelete,
  mesaToDelete,
  onCancelTarifa,
  onConfirmTarifa,
  onCancelMesa,
  onConfirmMesa
}: EliminarDialogsProps) {
  return (
    <>
      <AlertDialog open={!!tarifaToDelete} onOpenChange={o => !o && onCancelTarifa()}>
        <AlertDialogContent className="rounded-2xl bg-[#1d283a] border-[#324157] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-400 flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> ¿Eliminar tarifa?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Esta acción es permanente y la tarifa "{tarifaToDelete?.nombre}" dejará de estar disponible para las estaciones asignadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-full border-[#324157] text-slate-300 hover:bg-[#283244]" onClick={onCancelTarifa}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmTarifa} className="bg-rose-600 hover:bg-rose-500 rounded-full font-bold text-white">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!mesaToDelete} onOpenChange={o => !o && onCancelMesa()}>
        <AlertDialogContent className="rounded-2xl bg-[#1d283a] border-[#324157] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-400 flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> ¿Eliminar estación?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Se eliminará la estación {mesaToDelete?.numeroMesa} de tu inventario. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-full border-[#324157] text-slate-300 hover:bg-[#283244]" onClick={onCancelMesa}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmMesa} className="bg-rose-600 hover:bg-rose-500 rounded-full font-bold text-white">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
