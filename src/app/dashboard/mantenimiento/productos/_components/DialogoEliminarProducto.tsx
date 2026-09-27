'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";
import type { Producto } from "@/lib/tipos";

interface DialogoEliminarProductoProps {
  producto: (Producto & { docId: string }) | null;
  abierto: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmar: () => void;
  procesando: boolean;
}

export function DialogoEliminarProducto({
  producto,
  abierto,
  onOpenChange,
  onConfirmar,
  procesando
}: DialogoEliminarProductoProps) {
  return (
    <AlertDialog open={abierto} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-3xl font-body border-none shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-headline text-xl text-destructive flex items-center gap-2">
            <Trash2 className="h-6 w-6" /> ¿Estás seguro?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            Esta acción no se puede deshacer. Se eliminará permanentemente el producto
            <span className="font-bold text-foreground"> "{producto?.nombre}"</span> del catálogo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-4">
          <AlertDialogCancel className="rounded-full h-11 px-8 font-semibold">Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => { e.preventDefault(); onConfirmar(); }} 
            disabled={procesando} 
            className="bg-destructive hover:bg-destructive/90 rounded-full h-11 px-10 font-bold"
          >
            {procesando ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4" />}
            Eliminar permanentemente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
