'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";
import type { Rol } from "@/lib/tipos";

interface DialogoEliminarRolProps {
  rol: (Rol & { docId: string }) | null;
  abierto: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmar: () => void;
  procesando: boolean;
}

export function DialogoEliminarRol({
  rol,
  abierto,
  onOpenChange,
  onConfirmar,
  procesando
}: DialogoEliminarRolProps) {
  return (
    <AlertDialog open={abierto} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl font-body bg-[#1e1e1e] border border-[#2e2e2e] text-slate-100 shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-headline text-lg sm:text-xl text-rose-400 flex items-center gap-2">
            <Trash2 className="h-5 w-5" /> ¿Confirmas la eliminación?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs sm:text-sm text-slate-400">
            Esta acción es definitiva. El rol
            <span className="font-bold text-slate-100"> &quot;{rol?.nombre}&quot;</span> será eliminado de los registros de la sucursal.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-2.5 pt-4">
          <AlertDialogCancel className="rounded-full h-9 px-6 text-xs font-semibold bg-[#252526] hover:bg-[#313131] text-slate-200 border border-[#2e2e2e]">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => { e.preventDefault(); onConfirmar(); }}
            disabled={procesando}
            className="bg-rose-600 hover:bg-rose-500 text-white rounded-full h-9 px-6 text-xs font-semibold"
          >
            {procesando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Sí, Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
