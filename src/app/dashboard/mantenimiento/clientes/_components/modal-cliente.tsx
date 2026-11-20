'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, CreditCard, Contact } from "lucide-react";
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
    <Dialog open={abierto} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 rounded-2xl p-5 sm:p-6 shadow-2xl font-body flex flex-col max-h-[90vh]">
        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 gap-4">
          <DialogHeader className="shrink-0">
            <div className="flex items-center gap-3 pr-6">
              <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <Contact className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0">
                <DialogTitle className="font-headline text-lg font-bold text-slate-100 leading-tight truncate">
                  {editando ? "Editar Cliente" : "Nuevo Cliente"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5 truncate">
                  Completa los datos del cliente o proveedor.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 space-y-3.5 p-1">
            <div className="space-y-1.5">
              <Label htmlFor="nombre" className="text-xs font-medium ml-1 text-slate-200 block">
                Nombre Completo*
              </Label>
              <Input
                id="nombre"
                value={form.nombre}
                onChange={(e) => form.setNombre(e.target.value)}
                onClick={(e) => e.currentTarget.select()}
                placeholder="Ej: Juan Pérez"
                required
                className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="telefono" className="text-xs font-medium ml-1 text-slate-200 block">
                Teléfono (Opcional)
              </Label>
              <Input
                id="telefono"
                value={form.telefono}
                onChange={(e) => form.setTelefono(e.target.value)}
                onClick={(e) => e.currentTarget.select()}
                placeholder="Ej: 5512 3456"
                className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tipoCliente" className="text-xs font-medium ml-1 text-slate-200 block">
                Tipo de Registro*
              </Label>
              <Select value={form.tipoCliente} onValueChange={(value: Cliente['tipoCliente']) => form.setTipoCliente(value)}>
                <SelectTrigger id="tipoCliente" className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] hover:bg-[#313131] text-sm">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 font-body">
                  <SelectItem value="Cliente" className="text-xs">Cliente</SelectItem>
                  <SelectItem value="Proveedor" className="text-xs">Proveedor</SelectItem>
                  <SelectItem value="Ambos" className="text-xs">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="flex flex-row items-center justify-between rounded-xl border border-[#2e2e2e] p-3.5 bg-[#252526]">
                <div className="space-y-0.5 pr-3">
                  <Label htmlFor="credito-switch" className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-sky-400" /> Permitir Crédito
                  </Label>
                  <p className="text-[11px] text-slate-400">Habilitar paso a cuentas por cobrar</p>
                </div>
                <Switch
                  id="credito-switch"
                  checked={form.permiteCredito}
                  onCheckedChange={form.setPermiteCredito}
                  className="data-[state=checked]:bg-sky-600 data-[state=unchecked]:bg-sky-600/30 border border-sky-500/40 [&>span]:bg-white"
                />
              </div>

              <div className="flex flex-row items-center justify-between rounded-xl border border-[#2e2e2e] p-3.5 bg-[#252526]">
                <div className="space-y-0.5 pr-3">
                  <Label htmlFor="consumo-interno-switch" className="text-xs font-semibold text-slate-100">
                    Consumo Interno
                  </Label>
                  <p className="text-[11px] text-slate-400">Personal autorizado</p>
                </div>
                <Switch
                  id="consumo-interno-switch"
                  checked={form.consumoInterno}
                  onCheckedChange={form.setConsumoInterno}
                  className="data-[state=checked]:bg-sky-600 data-[state=unchecked]:bg-sky-600/30 border border-sky-500/40 [&>span]:bg-white"
                />
              </div>
            </div>

            {form.consumoInterno && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="pin" className="text-xs font-medium ml-1 text-slate-200 block">
                  PIN de Seguridad (4 dígitos)
                </Label>
                <Input
                  id="pin"
                  type="password"
                  value={form.pinConsumoInterno}
                  onChange={(e) => form.setPinConsumoInterno(e.target.value)}
                  onClick={(e) => e.currentTarget.select()}
                  placeholder="••••"
                  maxLength={4}
                  className="rounded-full text-center h-10 bg-[#252526] border-[#2e2e2e] tracking-[0.75em] font-bold text-sm"
                />
              </div>
            )}
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
              {editando ? "Actualizar" : "Guardar Cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
