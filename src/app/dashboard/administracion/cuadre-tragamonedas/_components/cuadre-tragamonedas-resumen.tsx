import { Dispatch, SetStateAction } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { InputNumero } from "@/components/ui/input-numero"
import { Calculator, Banknote, FileCog, Loader2 } from "lucide-react"
import { Cuenta } from "@/lib/tipos"

interface CuadreTragamonedasResumenProps {
  resumen: {
    totalManual: number
    totalBase: number
    totalDeuda: number
    totalExtraccionNeta: number
    totalExtraido: number
    totalNeto: number
  }
  porcentajeGanancia: number
  gananciaEstimada: number
  existenciaSiguiente: number | ''
  setExistenciaSiguiente: Dispatch<SetStateAction<number | ''>>
  efectivoSiguientePeriodo: number | ''
  setEfectivoSiguientePeriodo: Dispatch<SetStateAction<number | ''>>
  gananciaATrasladar: number | ''
  setGananciaATrasladar: Dispatch<SetStateAction<number | ''>>
  cuentaDestinoId: string
  setCuentaDestinoId: Dispatch<SetStateAction<string>>
  cuentas: Cuenta[]
  observaciones: string
  setObservaciones: Dispatch<SetStateAction<string>>
  onFinalizarClick: () => void
  procesando: boolean
}

export function CuadreTragamonedasResumen({
  resumen,
  porcentajeGanancia,
  gananciaEstimada,
  existenciaSiguiente,
  setExistenciaSiguiente,
  efectivoSiguientePeriodo,
  setEfectivoSiguientePeriodo,
  gananciaATrasladar,
  setGananciaATrasladar,
  cuentaDestinoId,
  setCuentaDestinoId,
  cuentas,
  observaciones,
  setObservaciones,
  onFinalizarClick,
  procesando
}: CuadreTragamonedasResumenProps) {
  return (
    <Card className="bg-[#283244] border-[#324157] text-white shadow-sm sticky top-20">
      <CardHeader className="pb-3 border-b border-[#324157]">
        <CardTitle className="text-base font-bold text-white flex items-center gap-2">
          <Calculator className="h-5 w-5 text-sky-400" /> Resumen y Cierre
        </CardTitle>
        <CardDescription className="text-xs text-slate-400">
          Define la base para el siguiente período y traslada las ganancias calculadas.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-b-0">
            <div className="p-4 rounded-xl bg-[#1d283a] border border-[#324157] text-center">
              <p className="text-xs font-medium text-slate-400">
                Ganancia Estimada ({porcentajeGanancia}%)
              </p>
              <p className="text-3xl font-black text-sky-400 my-1">
                Q{gananciaEstimada.toFixed(2)}
              </p>
              <AccordionTrigger className="text-xs text-slate-400 justify-center hover:no-underline py-1 gap-1">
                Ver detalle del cálculo
              </AccordionTrigger>
            </div>
            <AccordionContent className="text-xs text-slate-300 space-y-1.5 pt-3 px-1">
              <div className="flex justify-between font-semibold border-b border-[#324157] pb-1.5">
                <span>Total Neto:</span> <span className="text-white">Q{resumen.totalNeto.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Manual:</span> <span>Q{resumen.totalManual.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>+ Total Extr. Neta:</span> <span>Q{resumen.totalExtraccionNeta.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-[#324157] pt-1.5 text-white">
                <span>= Total Extraído:</span> <span>Q{resumen.totalExtraido.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span>- Total Base Devuelta:</span> <span>Q{resumen.totalBase.toFixed(2)}</span>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-300">Monedas Sig. Período (Q)</Label>
            <InputNumero
              value={existenciaSiguiente}
              onChange={(e) => setExistenciaSiguiente(e.target.value)}
              placeholder="0"
              className="text-center bg-[#1d283a] border-[#324157] text-white rounded-full h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-300">Efectivo Sig. Período (Q)</Label>
            <InputNumero
              value={efectivoSiguientePeriodo}
              onChange={(e) => setEfectivoSiguientePeriodo(e.target.value)}
              placeholder="0.00"
              className="text-center bg-[#1d283a] border-[#324157] text-white rounded-full h-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-300">Ganancia a Trasladar a Cuenta (Q)</Label>
          <InputNumero
            value={gananciaATrasladar}
            onChange={(e) => setGananciaATrasladar(e.target.value)}
            placeholder="0.00"
            className="text-center bg-[#1d283a] border-[#324157] text-white rounded-full h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Banknote className="h-4 w-4 text-emerald-400" /> Cuenta Destino para Traslado
          </Label>
          <Select value={cuentaDestinoId} onValueChange={setCuentaDestinoId}>
            <SelectTrigger className="rounded-full bg-[#1d283a] border-[#324157] text-white h-10">
              <SelectValue placeholder="Seleccione la cuenta..." />
            </SelectTrigger>
            <SelectContent className="bg-[#1d283a] border-[#324157] text-white">
              {cuentas.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.nombre} (Q{c.saldo.toFixed(2)})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-300">Notas Adicionales (Opcional)</Label>
          <Textarea
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            placeholder="Ej: Cuadre semanal de máquinas..."
            className="bg-[#1d283a] border-[#324157] text-white rounded-xl text-xs resize-none"
            rows={3}
          />
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t border-[#324157]">
        <Button
          className="w-full rounded-full bg-sky-600 hover:bg-sky-500 text-white font-bold h-10"
          onClick={onFinalizarClick}
          disabled={procesando}
        >
          {procesando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileCog className="mr-2 h-4 w-4" />}
          Finalizar y Procesar Cuadre
        </Button>
      </CardFooter>
    </Card>
  )
}
