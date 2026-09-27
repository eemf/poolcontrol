'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import type { Compra } from "@/lib/tipos";

interface DeleteConfirmDialogProps {
  compra: (Compra & { docId: string }) | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
}

export function DeleteConfirmDialog({
  compra,
  isOpen,
  onOpenChange,
  onConfirm,
  loading
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-3xl font-body border-none shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl text-destructive flex items-center gap-2 font-headline">
            <Trash2 className="h-6 w-6" /> ¿Eliminar registro?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            Esta acción es irreversible. Se borrará la <span className="font-bold text-foreground">Compra #{compra?.idCompra}</span> y se ajustará el stock de los productos involucrados automáticamente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="rounded-full h-11 px-8 font-semibold">Volver</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={loading} className="bg-destructive hover:bg-destructive/90 rounded-full h-11 px-10 font-bold">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Confirmar Eliminación
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
