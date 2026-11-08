import { Dispatch, SetStateAction, FormEvent } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Save, PlusCircle, X } from "lucide-react"
import { TarifaConDocId, Intervalo, Tarifa } from "../_types/mesas-config-types"

interface TarifaDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingTarifa: TarifaConDocId | null
  tarifaForm: Omit<Tarifa, 'idTarifa'>
  setTarifaForm: Dispatch<SetStateAction<Omit<Tarifa, 'idTarifa'>>>
  nuevoIntervalo: Intervalo
  setNuevoIntervalo: Dispatch<SetStateAction<Intervalo>>
  onAddIntervalo: () => void
  onRemoveIntervalo: (index: number) => void
  onSubmit: (e: FormEvent) => void
  loading: boolean
}

export function TarifaDialog({
  isOpen,
  onOpenChange,
  editingTarifa,
  tarifaForm,
  setTarifaForm,
  nuevoIntervalo,
  setNuevoIntervalo,
  onAddIntervalo,
  onRemoveIntervalo,
  onSubmit,
  loading
}: TarifaDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-[#1e1e1e] border-[#2e2e2e] text-white">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">
              {editingTarifa ? "Editar Tarifa" : "Nueva Tarifa"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Define el modelo de cobro y tiempos para tus estaciones de juego.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] my-4 pr-3">
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="t-nombre" className="text-xs font-semibold text-slate-300">Nombre de la Tarifa*</Label>
                <Input
                  id="t-nombre"
                  value={tarifaForm.nombre}
                  onChange={e => setTarifaForm(p => ({ ...p, nombre: e.target.value }))}
                  required
                  placeholder="Ej. Estándar Billar"
                  className="rounded-full bg-[#252526] border-[#2e2e2e] text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300">Tipo de Estación</Label>
                  <Select
                    value={tarifaForm.tipoDeMesa}
                    onValueChange={(v: any) => setTarifaForm(p => ({ ...p, tipoDeMesa: v }))}
                  >
                    <SelectTrigger className="rounded-full bg-[#252526] border-[#2e2e2e] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#252526] border-[#2e2e2e] text-white">
                      <SelectItem value="Billar Pool">Pool</SelectItem>
                      <SelectItem value="Carambola">Carambola</SelectItem>
                      <SelectItem value="Consola">Videojuegos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300">Cálculo</Label>
                  <Select
                    value={tarifaForm.tipoDeCalculo}
                    onValueChange={(v: any) => setTarifaForm(p => ({ ...p, tipoDeCalculo: v }))}
                  >
                    <SelectTrigger className="rounded-full bg-[#252526] border-[#2e2e2e] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#252526] border-[#2e2e2e] text-white">
                      <SelectItem value="Por minuto">Por Minuto</SelectItem>
                      <SelectItem value="Por intervalo">Por Intervalo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {tarifaForm.tipoDeMesa === 'Consola' && (
                <div className="space-y-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs font-bold text-amber-400">Configuración de Controles</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-300">Controles Base</Label>
                      <Input
                        type="number"
                        value={tarifaForm.controlesBase}
                        onChange={e => setTarifaForm(p => ({ ...p, controlesBase: Number(e.target.value) }))}
                        className="rounded-full text-center bg-[#252526] border-[#2e2e2e] text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-300">Extra por Ctrl / Hora</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={tarifaForm.costoControlExtra}
                        onChange={e => setTarifaForm(p => ({ ...p, costoControlExtra: Number(e.target.value) }))}
                        className="rounded-full text-center bg-[#252526] border-[#2e2e2e] text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {tarifaForm.tipoDeCalculo === 'Por minuto' ? (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300">Costo por Minuto (Q)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={tarifaForm.costoPorMinuto}
                    onChange={e => setTarifaForm(p => ({ ...p, costoPorMinuto: Number(e.target.value) }))}
                    className="rounded-full text-center font-bold bg-[#252526] border-[#2e2e2e] text-white"
                  />
                </div>
              ) : (
                <div className="space-y-3 rounded-xl border border-[#2e2e2e] p-3.5 bg-[#252526]/50">
                  <Label className="text-xs font-bold text-slate-300">Intervalos de Precios</Label>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-1">
                      <Label className="text-[11px] text-slate-400">Minutos</Label>
                      <Input
                        type="number"
                        value={nuevoIntervalo.duracionMinutos}
                        onChange={e => setNuevoIntervalo(p => ({ ...p, duracionMinutos: Number(e.target.value) }))}
                        className="rounded-full h-8 bg-[#1e1e1e] border-[#2e2e2e] text-white text-xs"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-[11px] text-slate-400">Precio (Q)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={nuevoIntervalo.precio}
                        onChange={e => setNuevoIntervalo(p => ({ ...p, precio: Number(e.target.value) }))}
                        className="rounded-full h-8 bg-[#1e1e1e] border-[#2e2e2e] text-white text-xs"
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      onClick={onAddIntervalo}
                      className="rounded-full h-8 w-8 bg-sky-600 hover:bg-sky-500 text-white shrink-0"
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-1.5">
                    {(tarifaForm.intervalos || []).map((int, i) => (
                      <div key={i} className="flex items-center justify-between text-xs p-2 bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg">
                        <span className="font-medium text-slate-200">{int.duracionMinutos} min por Q{int.precio.toFixed(2)}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-full"
                          onClick={() => onRemoveIntervalo(i)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-2 border-t border-[#2e2e2e]">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="rounded-full w-full sm:w-auto border-[#2e2e2e] text-slate-300 hover:bg-[#252526]">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading} className="rounded-full w-full sm:w-auto font-bold bg-sky-600 hover:bg-sky-500 text-white">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {editingTarifa ? "Actualizar" : "Guardar Tarifa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
