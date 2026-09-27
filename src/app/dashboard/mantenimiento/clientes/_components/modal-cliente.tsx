
'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/switch"; // Fix import to shadcn/ui dialog correctly below
import { Dialog as DialogBase, DialogContent as DialogContentBase, DialogDescription as DialogDescriptionBase, DialogHeader as DialogHeaderBase, DialogTitle as DialogTitleBase, DialogFooter as DialogFooterBase, DialogClose as DialogCloseBase } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, CreditCard } from "lucide-react";
import type { Cliente } from "@/lib/tipos";

interface ModalClienteProps {
  abierto: boolean;
  onClose: () => void;
  editando: boolean;
  onSubmit: (e: React.FormEvent) => void;
  procesando: boolean;
  form: {
    nombre: string;
    setNombre: (v: string) => void;
    telefono: string;
    setTelefono: (v: string) => void;
    tipoCliente: Cliente['tipoCliente'];
    setTipoCliente: (v: Cliente['tipoCliente']) => void;
    consumoInterno: boolean;
    setConsumoInterno: (v: boolean) => void;
    pinConsumoInterno: string;
    setPinConsumoInterno: (v: string) => void;
    permiteCredito: boolean;
    setPermiteCredito: (v: boolean) => void;
  };
}

export function ModalCliente({
  abierto,
  onClose,
  editando,
  onSubmit,
  procesando,
  form
}: ModalClienteProps) {
  return (
    <DialogBase open={abierto} onOpenChange={(o) => !o && onClose()}>
      <DialogContentBase className="sm:max-w-md rounded-2xl font-body border-none shadow-2xl p-0 overflow-hidden">
        <form onSubmit={onSubmit} className="flex flex-col max-h-[90vh]">
          <DialogHeaderBase className="p-6 pb-4 shrink-0 bg-background">
            <DialogTitleBase className="font-headline text-xl">{editando ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitleBase>
            <DialogDescriptionBase className="text-xs font-body">Completa los datos del cliente o proveedor.</DialogDescriptionBase>
          </DialogHeaderBase>
          
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-5 p-6 pt-2">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-xs font-semibold text-muted-foreground ml-1">Nombre Completo*</Label>
                <Input id="nombre" value={form.nombre} onChange={(e) => form.setNombre(e.target.value)} placeholder="Ej: Juan Pérez" required className="rounded-full h-11 border-muted-foreground/20" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono" className="text-xs font-semibold text-muted-foreground ml-1">Teléfono (Opcional)</Label>
                <Input id="telefono" value={form.telefono} onChange={(e) => form.setTelefono(e.target.value)} placeholder="Ej: 55 1234 5678" className="rounded-full h-11 border-muted-foreground/20" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipoCliente" className="text-xs font-semibold text-muted-foreground ml-1">Tipo de Registro*</Label>
                <Select value={form.tipoCliente} onValueChange={(value: Cliente['tipoCliente']) => form.setTipoCliente(value)}>
                  <SelectTrigger className="rounded-full h-11 border-muted-foreground/20">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent className="font-body">
                    <SelectItem value="Cliente">Cliente</SelectItem>
                    <SelectItem value="Proveedor">Proveedor</SelectItem>
                    <SelectItem value="Ambos">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                  <div className="flex flex-row items-center justify-between rounded-2xl border border-muted-foreground/20 p-4 bg-background shadow-sm">
                    <div className="space-y-0.5">
                      <Label htmlFor="credito-switch" className="text-sm font-bold flex items-center gap-2">
                        <CreditCard className="h-3.5 w-3.5 text-primary" /> Permitir Crédito
                      </Label>
                      <p className="text-[10px] text-muted-foreground font-medium tracking-tight">Habilitar paso a cuentas por cobrar</p>
                    </div>
                    <Switch
                      id="credito-switch"
                      checked={form.permiteCredito}
                      onCheckedChange={form.setPermiteCredito}
                    />
                  </div>

                  <div className="flex flex-row items-center justify-between rounded-2xl border border-muted-foreground/20 p-4 bg-background shadow-sm">
                    <div className="space-y-0.5">
                      <Label htmlFor="consumo-interno-switch" className="text-sm font-bold">Consumo Interno</Label>
                      <p className="text-[10px] text-muted-foreground font-medium tracking-tight">Personal autorizado</p>
                    </div>
                    <Switch
                      id="consumo-interno-switch"
                      checked={form.consumoInterno}
                      onCheckedChange={form.setConsumoInterno}
                    />
                  </div>
              </div>

              {form.consumoInterno && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label htmlFor="pin" className="text-xs font-semibold text-muted-foreground ml-1">PIN de Seguridad (4 dígitos)</Label>
                  <Input 
                    id="pin" 
                    type="password" 
                    value={form.pinConsumoInterno} 
                    onChange={(e) => form.setPinConsumoInterno(e.target.value)} 
                    placeholder="••••" 
                    maxLength={4} 
                    className="rounded-full text-center h-11 border-muted-foreground/20 tracking-[1em] font-bold" 
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooterBase className="p-6 pt-4 bg-background shrink-0 flex-col-reverse sm:flex-row sm:justify-between gap-3">
            <DialogCloseBase asChild>
              <Button type="button" variant="outline" className="w-full sm:w-auto rounded-full h-11 px-8 font-semibold">Cancelar</Button>
            </DialogCloseBase>
            <Button type="submit" disabled={procesando} className="w-full sm:w-auto rounded-full h-11 px-10 font-bold shadow-lg shadow-primary/20">
              {procesando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {editando ? "Actualizar" : "Guardar Cliente"}
            </Button>
          </DialogFooterBase>
        </form>
      </DialogContentBase>
    </DialogBase>
  );
}
