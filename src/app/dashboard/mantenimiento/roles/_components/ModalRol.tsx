'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, ShieldCheck } from "lucide-react";

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
      <DialogContent className="sm:max-w-md bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 rounded-2xl p-5 sm:p-6 shadow-2xl font-body flex flex-col max-h-[90vh]">
        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 gap-4">
          <DialogHeader className="shrink-0">
            <div className="flex items-center gap-3 pr-6">
              <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0">
                <DialogTitle className="font-headline text-lg font-bold text-slate-100 leading-tight truncate">
                  {editando ? "Editar Rol" : "Nuevo Rol"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5 truncate">
                  Define las responsabilidades del puesto.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 space-y-3.5 p-1">
            <div className="space-y-1.5">
              <Label htmlFor="nombre" className="text-xs font-medium ml-1 text-slate-200 block">
                Nombre del rol*
              </Label>
              <Input
                id="nombre"
                value={form.nombre}
                onChange={(e) => form.setNombre(e.target.value)}
                onClick={(e) => e.currentTarget.select()}
                placeholder="Ej: Cajero"
                required
                className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-sm text-slate-100 placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="descripcion" className="text-xs font-medium ml-1 text-slate-200 block">
                Descripción (Opcional)
              </Label>
              <Textarea
                id="descripcion"
                value={form.descripcion}
                onChange={(e) => form.setDescripcion(e.target.value)}
                placeholder="Ej: Encargado de ventas y atención..."
                className="rounded-xl resize-none min-h-[110px] bg-[#252526] border-[#2e2e2e] text-sm text-slate-100 placeholder:text-slate-500"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 shrink-0 flex-row items-center justify-between sm:justify-between gap-2 sm:space-x-0">
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="rounded-full h-9 px-5 text-xs font-medium bg-[#252526] hover:bg-[#313131] text-slate-200 border border-[#2e2e2e]"
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={procesando}
              className="rounded-full h-9 px-6 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md"
            >
              {procesando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {editando ? "Actualizar" : "Guardar Rol"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
