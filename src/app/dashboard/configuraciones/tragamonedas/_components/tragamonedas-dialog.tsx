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
      <DialogContent className="sm:max-w-md rounded-2xl bg-[#1e1e1e] border border-[#2e2e2e] text-slate-100 p-5 sm:p-6 shadow-2xl font-body flex flex-col max-h-[90vh]">
        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 gap-4">
          <DialogHeader className="shrink-0">
            <div className="flex items-center gap-3 pr-6">
              <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <Dices className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0">
                <DialogTitle className="font-headline text-lg font-bold text-slate-100 leading-tight truncate">
                  {editingMaquina ? 'Editar Máquina' : 'Nueva Máquina'}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5 truncate">
                  {editingMaquina
                    ? 'Actualiza la información técnica de la máquina.'
                    : 'Crea una nueva máquina para el inventario.'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 space-y-3.5 p-1">
            <div className="space-y-1.5">
              <Label htmlFor="nombre" className="text-xs font-medium ml-1 text-slate-200 block">
                Nombre identificador*
              </Label>
              <Input
                id="nombre"
                value={formState.nombre}
                onChange={(e) => onFormChange('nombre', e.target.value)}
                onClick={(e) => e.currentTarget.select()}
                required
                className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-sm text-slate-100 placeholder:text-slate-500"
                placeholder="Ej: Máquina 01"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="modelo" className="text-xs font-medium ml-1 text-slate-200 block">
                  Modelo / Juego
                </Label>
                <Input
                  id="modelo"
                  value={formState.modelo}
                  onChange={(e) => onFormChange('modelo', e.target.value)}
                  onClick={(e) => e.currentTarget.select()}
                  className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-sm text-slate-100 placeholder:text-slate-500"
                  placeholder="Ej: Cherry Master"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="estado" className="text-xs font-medium ml-1 text-slate-200 block">
                  Estado operativo
                </Label>
                <Select
                  value={formState.estado}
                  onValueChange={(v: EstadoTragamonedas) => onFormChange('estado', v)}
                >
                  <SelectTrigger className="rounded-full h-10 bg-[#252526] hover:bg-[#313131] border-[#2e2e2e] text-slate-100 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 font-body">
                    <SelectItem value="activo" className="text-xs">
                      Activo
                    </SelectItem>
                    <SelectItem value="mantenimiento" className="text-xs">
                      Mantenimiento
                    </SelectItem>
                    <SelectItem value="inactivo" className="text-xs">
                      Inactivo
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 shrink-0 flex-row items-center justify-between sm:justify-between gap-2 sm:space-x-0">
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="rounded-full h-9 px-5 text-xs font-medium bg-[#252526] hover:bg-[#313131] border border-[#2e2e2e] text-slate-200"
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full h-9 px-6 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md"
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
