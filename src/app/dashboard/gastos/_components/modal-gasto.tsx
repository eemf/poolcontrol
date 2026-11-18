'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, Loader2, Save } from "lucide-react";

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
      <DialogContent className="sm:max-w-md bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 rounded-2xl p-5 sm:p-6 shadow-2xl font-body">
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-3 pr-6">
              <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0">
                <DialogTitle className="font-headline text-lg font-bold text-slate-100 leading-tight truncate">
                  {editando ? 'Editar Gasto' : 'Nuevo Gasto'}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5 truncate">
                  Registra un gasto para mantener el balance financiero.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3.5 p-1">
            <div className="space-y-1.5">
              <Label htmlFor="descripcion" className="text-xs font-medium ml-1 text-slate-200 block">
                Descripción
              </Label>
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                onClick={(e) => e.currentTarget.select()}
                placeholder="Ej: Pago de servicio de luz"
                required
                className="bg-[#252526] border-[#2e2e2e] text-slate-100 text-sm rounded-2xl resize-none min-h-[100px] p-3"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="monto" className="text-xs font-medium ml-1 text-slate-200 block">
                Monto
              </Label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400 text-xs font-bold pointer-events-none">
                  Q
                </span>
                <Input
                  id="monto"
                  type="number"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value === '' ? '' : Number(e.target.value))}
                  onClick={(e) => e.currentTarget.select()}
                  onFocus={(e) => e.target.select()}
                  placeholder="0.00"
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full px-8 h-10 text-center font-bold text-sm tabular-nums rounded-full bg-[#252526] border-[#2e2e2e] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 flex-row items-center justify-between sm:justify-between gap-2 sm:space-x-0">
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
              {editando ? 'Actualizar' : 'Guardar Gasto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
