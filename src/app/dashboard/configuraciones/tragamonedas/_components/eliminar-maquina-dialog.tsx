import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { TragamonedasConDocId } from '../_hooks/use-config-tragamonedas';

interface EliminarMaquinaDialogProps {
  maquinaToDelete: TragamonedasConDocId | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function EliminarMaquinaDialog({
  maquinaToDelete,
  onCancel,
  onConfirm,
}: EliminarMaquinaDialogProps) {
  return (
    <AlertDialog open={!!maquinaToDelete} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="sm:max-w-sm w-[95vw] rounded-2xl bg-[#1e1e1e] border border-[#2e2e2e] text-slate-100 p-5 sm:p-6 gap-4 shadow-2xl font-body">
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <Trash2 className="h-5 w-5" />
            </div>
            <div className="text-left min-w-0">
              <AlertDialogTitle className="font-headline text-base sm:text-lg font-bold text-slate-100 leading-tight">
                ¿Eliminar Máquina?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-slate-400 mt-1 leading-relaxed">
                Esta acción es permanente. Se eliminará la máquina{' '}
                <strong className="font-semibold text-slate-100">
                  &quot;{maquinaToDelete?.nombre}&quot;
                </strong>{' '}
                del inventario de la sucursal.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="pt-3 border-t border-[#2e2e2e] flex flex-row items-center justify-between sm:justify-between gap-2 sm:space-x-0">
          <AlertDialogCancel
            className="mt-0 rounded-full h-10 px-5 text-xs font-semibold bg-[#252526] hover:bg-[#2e2e2e] border border-[#2e2e2e] text-slate-200"
            onClick={onCancel}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-rose-600 hover:bg-rose-500 rounded-full h-10 px-5 text-xs font-semibold text-white shadow-md"
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Eliminar Máquina
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
