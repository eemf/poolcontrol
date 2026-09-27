'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";

interface ModalRolProps {
  abierto: boolean;
  onClose: () => void;
  editando: boolean;
  onSubmit: (e: React.FormEvent) => void;
  procesando: boolean;
  form: {
    nombre: string;
    setNombre: (v: string) => void;
    descripcion: string;
    setDescripcion: (v: string) => void;
  };
}

export function ModalRol({
  abierto,
  onClose,
  editando,
  onSubmit,
  procesando,
  form
}: ModalRolProps) {
  return (
    <Dialog open={abierto} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl font-body border-none shadow-2xl p-0 overflow-hidden">
        <form onSubmit={onSubmit} className="flex flex-col max-h-[90vh]">
          <DialogHeader className="p-6 pb-4 shrink-0 bg-background">
            <DialogTitle className="font-headline text-xl">{editando ? "Editar Rol" : "Nuevo Rol"}</DialogTitle>
            <DialogDescription className="text-xs font-body">Define las responsabilidades del puesto.</DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-5 p-6 pt-2">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-xs font-semibold text-muted-foreground ml-1">Nombre del rol*</Label>
                <Input id="nombre" value={form.nombre} onChange={(e) => form.setNombre(e.target.value)} placeholder="Ej: Cajero" required className="rounded-full h-11 border-muted-foreground/20" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion" className="text-xs font-semibold text-muted-foreground ml-1">Descripción (Opcional)</Label>
                <Textarea 
                  id="descripcion" 
                  value={form.descripcion} 
                  onChange={(e) => form.setDescripcion(e.target.value)} 
                  placeholder="Ej: Encargado de ventas y atención..." 
                  className="rounded-xl resize-none min-h-[120px] border-muted-foreground/20" 
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-4 bg-background shrink-0 flex-col-reverse sm:flex-row sm:justify-between gap-3">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="w-full sm:w-auto rounded-full h-11 px-8 font-semibold">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={procesando} className="w-full sm:w-auto rounded-full h-11 px-10 font-bold shadow-lg shadow-primary/20">
              {procesando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {editando ? "Actualizar" : "Guardar Rol"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
