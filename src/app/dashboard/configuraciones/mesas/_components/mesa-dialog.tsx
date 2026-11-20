import { Dispatch, SetStateAction, FormEvent } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { InputNumero } from "@/components/ui/input-numero"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, LayoutGrid } from "lucide-react"
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
      <DialogContent className="sm:max-w-md rounded-2xl bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 p-5 sm:p-6 shadow-2xl font-body flex flex-col max-h-[90vh]">
        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 gap-4">
          <DialogHeader className="shrink-0">
            <div className="flex items-center gap-3 pr-6">
              <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0">
                <DialogTitle className="font-headline text-lg font-bold text-slate-100 leading-tight truncate">
                  {editingMesa ? "Editar Estación" : "Nueva Estación"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5 truncate">
                  Registra o ajusta una estación de juego (mesa de billar o consola).
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 space-y-3.5 p-1">
            <div className="space-y-1.5">
              <Label htmlFor="m-numero" className="text-xs font-medium ml-1 text-slate-200 block">Número de estación*</Label>
              <InputNumero
                id="m-numero"
                value={mesaForm.numeroMesa || ''}
                onChange={e => setMesaForm(p => ({ ...p, numeroMesa: Number(e.target.value) }))}
                onClick={e => e.currentTarget.select()}
                disabled={!!editingMesa}
                required
                className="rounded-full h-10 text-center text-sm font-bold bg-[#252526] border-[#2e2e2e] text-slate-100 disabled:opacity-60 tabular-nums"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium ml-1 text-slate-200 block">Tipo de estación</Label>
                <Select
                  value={mesaForm.tipoDeMesa}
                  onValueChange={(v: any) => setMesaForm(p => ({ ...p, tipoDeMesa: v }))}
                >
                  <SelectTrigger className="rounded-full h-10 bg-[#252526] hover:bg-[#313131] border-[#2e2e2e] text-slate-100 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 font-body">
                    <SelectItem value="Billar Pool" className="text-xs">Pool</SelectItem>
                    <SelectItem value="Carambola" className="text-xs">Carambola</SelectItem>
                    <SelectItem value="Consola" className="text-xs">Videojuegos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium ml-1 text-slate-200 block">Tarifa asignada*</Label>
                <Select
                  value={mesaForm.tarifaId}
                  onValueChange={v => setMesaForm(p => ({ ...p, tarifaId: v }))}
                >
                  <SelectTrigger className="rounded-full h-10 bg-[#252526] hover:bg-[#313131] border-[#2e2e2e] text-slate-100 text-xs">
                    <SelectValue placeholder="Elegir..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 font-body">
                    {tarifas.map(t => (
                      <SelectItem key={t.docId} value={t.docId} className="text-xs">{t.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 shrink-0 flex-row items-center justify-between sm:justify-between gap-2 sm:space-x-0">
            <DialogClose asChild>
              <Button type="button" variant="secondary" className="rounded-full h-9 px-5 text-xs font-medium bg-[#252526] hover:bg-[#313131] border border-[#2e2e2e] text-slate-200">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading} className="rounded-full h-9 px-6 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {editingMesa ? "Actualizar" : "Guardar Estación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
