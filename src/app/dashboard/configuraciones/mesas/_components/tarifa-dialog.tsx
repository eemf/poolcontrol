import { Dispatch, SetStateAction, FormEvent } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputNumero } from "@/components/ui/input-numero"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, PlusCircle, X, DollarSign } from "lucide-react"
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
      <DialogContent className="sm:max-w-md rounded-2xl bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 p-5 sm:p-6 shadow-2xl font-body flex flex-col max-h-[90vh]">
        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 gap-4">
          <DialogHeader className="shrink-0">
            <div className="flex items-center gap-3 pr-6">
              <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0">
                <DialogTitle className="font-headline text-lg font-bold text-slate-100 leading-tight truncate">
                  {editingTarifa ? "Editar Tarifa" : "Nueva Tarifa"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5 truncate">
                  Define el modelo de cobro y tiempos para tus estaciones de juego.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 space-y-3.5 p-1">
            <div className="space-y-1.5">
              <Label htmlFor="t-nombre" className="text-xs font-medium ml-1 text-slate-200 block">Nombre de la tarifa*</Label>
              <Input
                id="t-nombre"
                value={tarifaForm.nombre}
                onChange={e => setTarifaForm(p => ({ ...p, nombre: e.target.value }))}
                onClick={e => e.currentTarget.select()}
                required
                placeholder="Ej. Estándar Billar"
                className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-sm text-slate-100 placeholder:text-slate-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium ml-1 text-slate-200 block">Tipo de estación</Label>
                <Select
                  value={tarifaForm.tipoDeMesa}
                  onValueChange={(v: any) => setTarifaForm(p => ({ ...p, tipoDeMesa: v }))}
                >
                  <SelectTrigger className="rounded-full h-10 bg-[#252526] hover:bg-[#313131] border-[#2e2e2e] text-xs text-slate-100">
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
                <Label className="text-xs font-medium ml-1 text-slate-200 block">Cálculo</Label>
                <Select
                  value={tarifaForm.tipoDeCalculo}
                  onValueChange={(v: any) => setTarifaForm(p => ({ ...p, tipoDeCalculo: v }))}
                >
                  <SelectTrigger className="rounded-full h-10 bg-[#252526] hover:bg-[#313131] border-[#2e2e2e] text-xs text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 font-body">
                    <SelectItem value="Por minuto" className="text-xs">Por Minuto</SelectItem>
                    <SelectItem value="Por intervalo" className="text-xs">Por Intervalo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {tarifaForm.tipoDeMesa === 'Consola' && (
              <div className="space-y-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs font-semibold text-amber-400">Configuración de controles</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[0.6875rem] text-slate-300 ml-1">Controles base</Label>
                    <InputNumero
                      value={tarifaForm.controlesBase}
                      onChange={e => setTarifaForm(p => ({ ...p, controlesBase: Number(e.target.value) }))}
                      onClick={e => e.currentTarget.select()}
                      className="rounded-full h-9 text-center text-xs bg-[#252526] border-[#2e2e2e] text-slate-100 tabular-nums"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[0.6875rem] text-slate-300 ml-1">Extra por ctrl / hora</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 text-xs font-bold pointer-events-none">
                        Q
                      </span>
                      <InputNumero
                        step="0.01"
                        value={tarifaForm.costoControlExtra}
                        onChange={e => setTarifaForm(p => ({ ...p, costoControlExtra: Number(e.target.value) }))}
                        onClick={e => e.currentTarget.select()}
                        className="rounded-full h-9 pl-7 pr-3 text-xs bg-[#252526] border-[#2e2e2e] text-slate-100 tabular-nums"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tarifaForm.tipoDeCalculo === 'Por minuto' ? (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium ml-1 text-slate-200 block">Costo por minuto</Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400 text-xs font-bold pointer-events-none">
                    Q
                  </span>
                  <InputNumero
                    step="0.01"
                    value={tarifaForm.costoPorMinuto}
                    onChange={e => setTarifaForm(p => ({ ...p, costoPorMinuto: Number(e.target.value) }))}
                    onClick={e => e.currentTarget.select()}
                    className="rounded-full h-10 pl-8 pr-3 text-sm font-bold bg-[#252526] border-[#2e2e2e] text-sky-400 tabular-nums"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 rounded-xl border border-[#2e2e2e] p-3.5 bg-[#252526]">
                <Label className="text-xs font-semibold text-slate-200 block">Intervalos de precios</Label>
                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <Label className="text-[0.6875rem] text-slate-400 ml-1">Minutos</Label>
                    <InputNumero
                      value={nuevoIntervalo.duracionMinutos}
                      onChange={e => setNuevoIntervalo(p => ({ ...p, duracionMinutos: Number(e.target.value) }))}
                      onClick={e => e.currentTarget.select()}
                      className="rounded-full h-9 bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 text-xs tabular-nums"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-[0.6875rem] text-slate-400 ml-1">Precio (Q)</Label>
                    <InputNumero
                      step="0.01"
                      value={nuevoIntervalo.precio}
                      onChange={e => setNuevoIntervalo(p => ({ ...p, precio: Number(e.target.value) }))}
                      onClick={e => e.currentTarget.select()}
                      className="rounded-full h-9 bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 text-xs tabular-nums"
                    />
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    onClick={onAddIntervalo}
                    className="rounded-full h-9 w-9 bg-sky-600 hover:bg-sky-500 text-white shrink-0"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-1.5">
                  {(tarifaForm.intervalos || []).map((int, i) => (
                    <div key={i} className="flex items-center justify-between text-xs px-3 py-2 bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl">
                      <span className="font-medium text-slate-200 tabular-nums">{int.duracionMinutos} min por Q{int.precio.toFixed(2)}</span>
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

          <DialogFooter className="pt-2 shrink-0 flex-row items-center justify-between sm:justify-between gap-2 sm:space-x-0">
            <DialogClose asChild>
              <Button type="button" variant="secondary" className="rounded-full h-9 px-5 text-xs font-medium bg-[#252526] hover:bg-[#313131] border border-[#2e2e2e] text-slate-200">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading} className="rounded-full h-9 px-6 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {editingTarifa ? "Actualizar" : "Guardar Tarifa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
