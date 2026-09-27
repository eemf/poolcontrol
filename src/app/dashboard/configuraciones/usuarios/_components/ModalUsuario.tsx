
'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
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
      <DialogContent className="sm:max-w-md rounded-2xl font-body border-none shadow-2xl p-0 overflow-hidden flex flex-col max-h-[90vh] gap-0">
        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0">
          <DialogHeader className="p-6 pb-4 shrink-0 bg-background">
            <DialogTitle className="font-headline text-xl">{editando ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
            <DialogDescription className="text-xs font-body">
              {editando ? "Actualiza la información del usuario." : "Crea una nueva cuenta de acceso al sistema."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto bg-muted/5">
            <div className="space-y-5 p-6 pt-2">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-xs font-semibold text-muted-foreground ml-1">Nombre completo*</Label>
                <Input 
                  id="nombre" 
                  value={form.nombre} 
                  onChange={(e) => form.setNombre(e.target.value)} 
                  required 
                  placeholder="Ej: Samuel L." 
                  className="rounded-full h-11 border-muted-foreground/20" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground ml-1">Correo electrónico*</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={form.email} 
                  onChange={(e) => form.setEmail(e.target.value)} 
                  required 
                  disabled={editando} 
                  placeholder="email@sucursal.com" 
                  className="rounded-full h-11 border-muted-foreground/20" 
                />
              </div>
              {!editando && (
                <div className="space-y-2">
                  <Label htmlFor="password" title="Mínimo 6 caracteres" className="text-xs font-semibold text-muted-foreground ml-1">Contraseña*</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={form.password} 
                    onChange={(e) => form.setPassword(e.target.value)} 
                    required 
                    placeholder="••••••" 
                    className="rounded-full h-11 border-muted-foreground/20" 
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="rol" className="text-xs font-semibold text-muted-foreground ml-1">Rol asignado*</Label>
                <Select value={form.rol} onValueChange={(value) => form.setRol(value)}>
                  <SelectTrigger className="rounded-full h-11 border-muted-foreground/20">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent className="font-body">
                    {roles.length > 0 ? (
                      roles.map(r => <SelectItem key={r.idRol} value={(r as any).id}>{r.nombre}</SelectItem>)
                    ) : (
                      <SelectItem value="no-roles" disabled>No hay roles definidos</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-4 bg-background shrink-0 flex-col-reverse sm:flex-row sm:justify-between gap-3">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="w-full sm:w-auto rounded-full h-11 px-8 font-semibold">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={procesando} className="w-full sm:w-auto rounded-full h-11 px-10 font-bold shadow-lg shadow-primary/20">
              {procesando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {editando ? "Actualizar" : "Guardar usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
