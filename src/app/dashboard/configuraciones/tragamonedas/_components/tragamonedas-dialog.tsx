import { FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dices, Loader2, Save } from 'lucide-react';
import { TragamonedasConDocId, EstadoTragamonedas } from '../_hooks/use-config-tragamonedas';

interface TragamonedasDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingMaquina: TragamonedasConDocId | null;
  formState: {
    nombre: string;
    modelo?: string;
    estado: EstadoTragamonedas;
  };
  onFormChange: (field: 'nombre' | 'modelo' | 'estado', value: any) => void;
  onSubmit: (e: FormEvent) => void;
  loading: boolean;
}

export function TragamonedasDialog({
  isOpen,
  onOpenChange,
  editingMaquina,
  formState,
  onFormChange,
  onSubmit,
  loading,
}: TragamonedasDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw] rounded-2xl bg-[#1e1e1e] border border-[#2e2e2e] text-slate-100 p-5 sm:p-6 shadow-2xl font-body">
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader className="pb-3 border-b border-[#2e2e2e] text-left">
            <div className="flex items-center gap-3 pr-6">
              <div className="h-10 w-10 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                <Dices className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="font-headline text-base sm:text-lg font-bold text-slate-100 leading-tight">
                  {editingMaquina ? 'Editar Máquina' : 'Nueva Máquina'}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5">
                  {editingMaquina
                    ? 'Actualiza la información técnica de la máquina tragamonedas.'
                    : 'Crea una nueva máquina para el inventario de la sucursal.'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="nombre" className="text-xs font-semibold text-slate-200">
                Nombre Identificador *
              </Label>
              <Input
                id="nombre"
                value={formState.nombre}
                onChange={(e) => onFormChange('nombre', e.target.value)}
                required
                className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-slate-100 text-xs"
                placeholder="Ej: Máquina 01"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="modelo" className="text-xs font-semibold text-slate-200">
                  Modelo / Juego
                </Label>
                <Input
                  id="modelo"
                  value={formState.modelo}
                  onChange={(e) => onFormChange('modelo', e.target.value)}
                  className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-slate-100 text-xs"
                  placeholder="Ej: Cherry Master"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="estado" className="text-xs font-semibold text-slate-200">
                  Estado Operativo
                </Label>
                <Select
                  value={formState.estado}
                  onValueChange={(v: EstadoTragamonedas) => onFormChange('estado', v)}
                >
                  <SelectTrigger className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-slate-100 text-xs focus:ring-1 focus:ring-sky-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-200 rounded-xl shadow-2xl text-xs">
                    <SelectItem value="activo" className="text-xs cursor-pointer focus:bg-[#252526]">
                      Activo
                    </SelectItem>
                    <SelectItem
                      value="mantenimiento"
                      className="text-xs cursor-pointer focus:bg-[#252526]"
                    >
                      Mantenimiento
                    </SelectItem>
                    <SelectItem
                      value="inactivo"
                      className="text-xs cursor-pointer focus:bg-[#252526]"
                    >
                      Inactivo
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-[#2e2e2e] flex flex-row items-center justify-between sm:justify-between gap-2 sm:space-x-0">
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="rounded-full h-10 px-5 text-xs font-semibold bg-[#252526] hover:bg-[#2e2e2e] border border-[#2e2e2e] text-slate-200"
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full h-10 px-5 text-xs font-semibold shadow-md"
            >
              {loading ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-1.5 h-4 w-4" />
              )}
              {editingMaquina ? 'Actualizar' : 'Guardar Máquina'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
