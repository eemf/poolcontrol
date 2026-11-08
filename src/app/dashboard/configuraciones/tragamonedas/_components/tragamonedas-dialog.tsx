import { FormEvent } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save } from "lucide-react"
import { TragamonedasConDocId, EstadoTragamonedas } from "../_hooks/use-config-tragamonedas"

interface TragamonedasDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingMaquina: TragamonedasConDocId | null
  formState: {
    nombre: string
    modelo?: string
    estado: EstadoTragamonedas
  }
  onFormChange: (field: "nombre" | "modelo" | "estado", value: any) => void
  onSubmit: (e: FormEvent) => void
  loading: boolean
}

export function TragamonedasDialog({
  isOpen,
  onOpenChange,
  editingMaquina,
  formState,
  onFormChange,
  onSubmit,
  loading
}: TragamonedasDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-[#1e1e1e] border-[#2e2e2e] text-white">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">
              {editingMaquina ? "Editar Máquina" : "Nueva Máquina"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              {editingMaquina
                ? "Actualiza la información técnica de la máquina tragamonedas."
                : "Crea una nueva máquina para el inventario de la sucursal."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nombre" className="text-xs font-semibold text-slate-300">Nombre Identificador*</Label>
              <Input
                id="nombre"
                value={formState.nombre}
                onChange={(e) => onFormChange('nombre', e.target.value)}
                required
                className="rounded-full bg-[#252526] border-[#2e2e2e] text-white"
                placeholder="Ej: Máquina 01"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="modelo" className="text-xs font-semibold text-slate-300">Modelo / Juego</Label>
                <Input
                  id="modelo"
                  value={formState.modelo}
                  onChange={(e) => onFormChange('modelo', e.target.value)}
                  className="rounded-full bg-[#252526] border-[#2e2e2e] text-white"
                  placeholder="Ej: Cherry Master"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="estado" className="text-xs font-semibold text-slate-300">Estado Operativo</Label>
                <Select
                  value={formState.estado}
                  onValueChange={(v: EstadoTragamonedas) => onFormChange('estado', v)}
                >
                  <SelectTrigger className="rounded-full bg-[#252526] border-[#2e2e2e] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#252526] border-[#2e2e2e] text-white">
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-2 border-t border-[#2e2e2e]">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="rounded-full w-full sm:w-auto border-[#2e2e2e] text-slate-300 hover:bg-[#252526]">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full w-full sm:w-auto font-bold bg-sky-600 hover:bg-sky-500 text-white"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {editingMaquina ? "Actualizar" : "Guardar Máquina"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
