
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
      <DialogContent className="sm:max-w-2xl rounded-3xl p-0 overflow-hidden text-foreground border-none shadow-2xl flex flex-col max-h-[90vh] gap-0">
        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0">
          <DialogHeader className="p-6 pb-4 shrink-0 bg-background">
            <DialogTitle className="font-headline text-xl">{editando ? "Editar Rol" : "Nuevo Rol"}</DialogTitle>
            <DialogDescription className="text-xs font-body">Define las capacidades de acceso para este rol.</DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto bg-muted/5">
            <div className="space-y-8 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold tracking-widest text-muted-foreground ml-1">Nombre del Rol*</Label>
                  <Input value={form.nombre} onChange={e => form.setNombre(e.target.value)} required placeholder="Ej: Cajero Principal" className="rounded-full h-11 border-muted-foreground/20 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold tracking-widest text-muted-foreground ml-1">Descripción</Label>
                  <Input value={form.descripcion} onChange={e => form.setDescripcion(e.target.value)} placeholder="Ej: Encargado de ventas y caja" className="rounded-full h-11 border-muted-foreground/20 focus:ring-primary" />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-bold text-xs border-b pb-2 text-primary tracking-widest flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Matriz de Privilegios
                </h3>
                {PERMISSIONS_GROUPS.map(group => (
                  <div key={group.groupName} className="space-y-4 p-5 rounded-2xl bg-muted/20 border border-muted/40 shadow-sm">
                    <h4 className="text-[10px] font-black text-muted-foreground tracking-widest border-l-2 border-primary/40 pl-2">{group.groupName}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {group.permissions.map(perm => (
                        <div 
                          key={perm.key} 
                          className="flex items-start space-x-3 bg-background p-4 rounded-xl border border-muted/40 shadow-sm transition-all hover:border-primary/30 group relative" 
                        >
                          <Checkbox 
                            id={`perm-${perm.key}`} 
                            checked={form.permisos.has(perm.key)} 
                            onCheckedChange={() => form.onTogglePermiso(perm.key)}
                            className="mt-0.5"
                          />
                          <Label 
                            htmlFor={`perm-${perm.key}`} 
                            className="flex-1 space-y-1 text-left cursor-pointer"
                          >
                            <span className="text-sm font-bold leading-none group-hover:text-primary transition-colors block">{perm.label}</span>
                            <p className="text-[10px] text-muted-foreground font-body leading-tight opacity-80 font-normal">{perm.description}</p>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-background shrink-0 sm:justify-between flex flex-col-reverse sm:flex-row gap-3">
            <DialogClose asChild>
              <button type="button" className="rounded-full border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-8 font-bold w-full sm:w-auto">Cancelar</button>
            </DialogClose>
            <button type="submit" disabled={procesando} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-12 font-bold w-full sm:w-auto shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
              {procesando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editando ? "Actualizar Rol" : "Guardar Rol"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
