'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ShieldCheck, Save } from "lucide-react";
import { PERMISSIONS_GROUPS } from "@/lib/config/permisos";

interface ModalRolProps {
  abierto: boolean;
  onClose: () => void;
  editando: boolean;
  onSubmit: (e: React.FormEvent) => void;
  procesando: boolean;
  form: {
    nombre: string; setNombre: (v: string) => void;
    descripcion: string; setDescripcion: (v: string) => void;
    permisos: Set<string>; onTogglePermiso: (k: string) => void;
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
    <Dialog open={abierto} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-2xl bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 rounded-2xl p-5 sm:p-6 shadow-2xl font-body flex flex-col max-h-[90vh]">
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
                  Define las capacidades de acceso para este rol.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 space-y-5 p-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium ml-1 text-slate-200 block">Nombre del rol*</Label>
                <Input
                  value={form.nombre}
                  onChange={e => form.setNombre(e.target.value)}
                  onClick={e => e.currentTarget.select()}
                  required
                  placeholder="Ej: Cajero Principal"
                  className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-sm text-slate-100 placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium ml-1 text-slate-200 block">Descripción</Label>
                <Input
                  value={form.descripcion}
                  onChange={e => form.setDescripcion(e.target.value)}
                  onClick={e => e.currentTarget.select()}
                  placeholder="Ej: Encargado de ventas y caja"
                  className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-sm text-slate-100 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-3.5">
              <h3 className="font-semibold text-xs border-b border-[#2e2e2e] pb-2 text-sky-400 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Matriz de privilegios
              </h3>
              {PERMISSIONS_GROUPS.map(group => (
                <div key={group.groupName} className="space-y-3 p-4 rounded-xl bg-[#252526] border border-[#2e2e2e]">
                  <h4 className="text-xs font-bold text-slate-200 border-l-2 border-sky-500 pl-2">
                    {group.groupName}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {group.permissions.map(perm => (
                      <div
                        key={perm.key}
                        className="flex items-start space-x-3 bg-[#1e1e1e] p-3 rounded-xl border border-[#2e2e2e] transition-colors hover:border-sky-500/40 group"
                      >
                        <Checkbox
                          id={`perm-${perm.key}`}
                          checked={form.permisos.has(perm.key)}
                          onCheckedChange={() => form.onTogglePermiso(perm.key)}
                          className="mt-0.5 border-slate-500 data-[state=checked]:bg-sky-600 data-[state=checked]:border-sky-600"
                        />
                        <Label
                          htmlFor={`perm-${perm.key}`}
                          className="flex-1 space-y-1 text-left cursor-pointer"
                        >
                          <span className="text-xs sm:text-sm font-semibold leading-none text-slate-100 group-hover:text-sky-400 transition-colors block">
                            {perm.label}
                          </span>
                          <p className="text-[11px] text-slate-400 font-body leading-tight font-normal">
                            {perm.description}
                          </p>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
              className="rounded-full h-9 px-6 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md flex items-center gap-2"
            >
              {procesando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editando ? "Actualizar Rol" : "Guardar Rol"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
