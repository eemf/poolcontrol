'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InputNumero } from "@/components/ui/input-numero";
import { Loader2, Save, PlusCircle } from "lucide-react";

interface ModalGastoProps {
  abierto: boolean;
  onClose: () => void;
  editando: boolean;
  onSubmit: (e: React.FormEvent) => void;
  procesando: boolean;
  descripcion: string;
  setDescripcion: (val: string) => void;
  monto: number | '';
  setMonto: (val: number | '') => void;
}

export function ModalGasto({
  abierto,
  onClose,
  editando,
  onSubmit,
  procesando,
  descripcion,
  setDescripcion,
  monto,
  setMonto
}: ModalGastoProps) {
  return (
    <Dialog open={abierto} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full rounded-2xl font-body border-none shadow-2xl">
        <form onSubmit={onSubmit}>
          <DialogHeader className="p-2">
            <DialogTitle className="font-headline text-xl">{editando ? 'Editar Gasto' : 'Nuevo Gasto'}</DialogTitle>
            <DialogDescription className="text-xs">Registra un gasto para mantener el balance financiero.</DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="descripcion" className="text-xs font-semibold text-muted-foreground ml-1">Descripción</Label>
              <Textarea 
                id="descripcion" 
                value={descripcion} 
                onChange={(e) => setDescripcion(e.target.value)} 
                placeholder="Ej: Pago de servicio de luz" 
                required 
                className="rounded-xl resize-none min-h-[100px] border-muted-foreground/20" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monto" className="text-xs font-semibold text-muted-foreground ml-1">Monto (Q)</Label>
              <InputNumero 
                id="monto" 
                value={monto} 
                onChange={(e) => setMonto(e.target.value === '' ? '' : Number(e.target.value))} 
                placeholder="0.00" 
                required 
                min="0.01" 
                step="0.01" 
                className="h-12 text-lg text-center font-bold rounded-full border-muted-foreground/20" 
                onFocus={(e) => e.target.select()} 
              />
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-3">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="w-full sm:w-auto rounded-full h-11 px-8 font-semibold">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={procesando} className="w-full sm:w-auto rounded-full h-11 px-10 font-bold shadow-lg shadow-primary/20">
              {procesando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {editando ? 'Actualizar' : 'Guardar Gasto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
