import { Dispatch, SetStateAction, FormEvent } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save } from "lucide-react"
import { MesaConDocId, TarifaConDocId, Mesa } from "../_types/mesas-config-types"

interface MesaDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingMesa: MesaConDocId | null
  mesaForm: Omit<Mesa, 'estado'>
  setMesaForm: Dispatch<SetStateAction<Omit<Mesa, 'estado'>>>
  tarifas: TarifaConDocId[]
  onSubmit: (e: FormEvent) => void
  loading: boolean
}

export function MesaDialog({
  isOpen,
  onOpenChange,
  editingMesa,
  mesaForm,
  setMesaForm,
  tarifas,
  onSubmit,
  loading
}: MesaDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-[#1d283a] border-[#324157] text-white">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">
              {editingMesa ? "Editar Estación" : "Nueva Estación"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Registra o ajusta una estación de juego (mesa de billar o consola).
            </DialogDescription>
          </DialogHeader>

          <div className="py-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="m-numero" className="text-xs font-semibold text-slate-300">Número de Estación*</Label>
              <Input
                id="m-numero"
                type="number"
                value={mesaForm.numeroMesa || ''}
                onChange={e => setMesaForm(p => ({ ...p, numeroMesa: Number(e.target.value) }))}
                disabled={!!editingMesa}
                required
                className="rounded-full text-center text-lg font-bold bg-[#283244] border-[#324157] text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300">Tipo de Estación</Label>
                <Select
                  value={mesaForm.tipoDeMesa}
                  onValueChange={(v: any) => setMesaForm(p => ({ ...p, tipoDeMesa: v }))}
                >
                  <SelectTrigger className="rounded-full bg-[#283244] border-[#324157] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#283244] border-[#324157] text-white">
                    <SelectItem value="Billar Pool">Pool</SelectItem>
                    <SelectItem value="Carambola">Carambola</SelectItem>
                    <SelectItem value="Consola">Videojuegos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300">Tarifa Asignada*</Label>
                <Select
                  value={mesaForm.tarifaId}
                  onValueChange={v => setMesaForm(p => ({ ...p, tarifaId: v }))}
                >
                  <SelectTrigger className="rounded-full bg-[#283244] border-[#324157] text-white">
                    <SelectValue placeholder="Elegir..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#283244] border-[#324157] text-white">
                    {tarifas.map(t => (
                      <SelectItem key={t.docId} value={t.docId}>{t.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-2 border-t border-[#324157]">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="rounded-full w-full sm:w-auto border-[#324157] text-slate-300 hover:bg-[#283244]">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading} className="rounded-full w-full sm:w-auto font-bold bg-sky-600 hover:bg-sky-500 text-white">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {editingMesa ? "Actualizar" : "Guardar Estación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
