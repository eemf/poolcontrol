'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, UserCheck } from "lucide-react";
import type { Rol } from "@/lib/tipos";

interface ModalUsuarioProps {
  abierto: boolean;
  onClose: () => void;
  editando: boolean;
  onSubmit: (e: React.FormEvent) => void;
  procesando: boolean;
  form: {
    nombre: string; setNombre: (v: string) => void;
    email: string; setEmail: (v: string) => void;
    rol: string; setRol: (v: string) => void;
    password: string; setPassword: (v: string) => void;
  };
  roles: Rol[];
}

export function ModalUsuario({
  abierto,
  onClose,
  editando,
  onSubmit,
  procesando,
  form,
  roles
}: ModalUsuarioProps) {
  return (
    <Dialog open={abierto} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 rounded-2xl p-5 sm:p-6 shadow-2xl font-body flex flex-col max-h-[90vh]">
        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 gap-4">
          <DialogHeader className="shrink-0">
            <div className="flex items-center gap-3 pr-6">
              <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0">
                <DialogTitle className="font-headline text-lg font-bold text-slate-100 leading-tight truncate">
                  {editando ? "Editar usuario" : "Nuevo usuario"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5 truncate">
                  {editando ? "Actualiza la información del usuario." : "Crea una nueva cuenta de acceso al sistema."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 space-y-3.5 p-1">
            <div className="space-y-1.5">
              <Label htmlFor="nombre" className="text-xs font-medium ml-1 text-slate-200 block">
                Nombre completo*
              </Label>
              <Input
                id="nombre"
                value={form.nombre}
                onChange={(e) => form.setNombre(e.target.value)}
                onClick={(e) => e.currentTarget.select()}
                required
                placeholder="Ej: Samuel L."
                className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-sm text-slate-100 placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium ml-1 text-slate-200 block">
                Correo electrónico*
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => form.setEmail(e.target.value)}
                required
                disabled={editando}
                placeholder="email@sucursal.com"
                className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-sm text-slate-100 placeholder:text-slate-500 disabled:opacity-60"
              />
            </div>

            {editando ? (
              <div className="space-y-1.5">
                <Label htmlFor="password" title="Mínimo 6 caracteres" className="text-xs font-medium ml-1 text-slate-200 block">
                  Nueva contraseña (opcional)
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => form.setPassword(e.target.value)}
                  placeholder="Dejar en blanco para no modificar"
                  className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-sm text-slate-100 placeholder:text-slate-500"
                  autoComplete="new-password"
                />
                <p className="text-[0.6875rem] text-slate-400 ml-1">
                  Solo ingresa una contraseña si deseas actualizar la actual de este usuario.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="password" title="Mínimo 6 caracteres" className="text-xs font-medium ml-1 text-slate-200 block">
                  Contraseña*
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => form.setPassword(e.target.value)}
                  required
                  placeholder="••••••"
                  className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-sm text-slate-100 placeholder:text-slate-500"
                  autoComplete="new-password"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="rol" className="text-xs font-medium ml-1 text-slate-200 block">
                Rol asignado*
              </Label>
              <Select value={form.rol} onValueChange={(value) => form.setRol(value)}>
                <SelectTrigger className="rounded-full h-10 bg-[#252526] hover:bg-[#313131] border-[#2e2e2e] text-sm text-slate-100">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent className="font-body bg-[#1e1e1e] border-[#2e2e2e] text-slate-100">
                  {roles.length > 0 ? (
                    roles.map(r => (
                      <SelectItem key={r.idRol} value={(r as any).id} className="text-xs">
                        {r.nombre}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-roles" disabled className="text-xs">
                      No hay roles definidos
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
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
              {editando ? "Actualizar" : "Guardar usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
