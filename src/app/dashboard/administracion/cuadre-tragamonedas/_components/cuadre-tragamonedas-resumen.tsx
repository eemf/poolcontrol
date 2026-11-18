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
    <Card className="bg-[#1e1e1e] border-[#2e2e2e] text-white shadow-sm sticky top-20 rounded-xl">
      <CardHeader className="pb-3.5 border-b border-[#2e2e2e]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="font-headline text-base font-bold text-slate-100 leading-tight">
              Resumen y Cierre
            </CardTitle>
            <CardDescription className="text-xs text-slate-400 mt-0.5 leading-snug">
              Define la base para el siguiente período y traslada las ganancias calculadas.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-b-0">
            <div className="p-4 rounded-xl bg-[#252526] border border-[#2e2e2e] text-center">
              <p className="text-xs font-medium text-slate-400">
                Ganancia Estimada ({porcentajeGanancia}%)
              </p>
              <p className="text-3xl font-black text-sky-400 my-1 tabular-nums">
                Q{gananciaEstimada.toFixed(2)}
              </p>
              <AccordionTrigger className="text-xs text-slate-400 justify-center hover:no-underline py-1 gap-1">
                Ver detalle del cálculo
              </AccordionTrigger>
            </div>
            <AccordionContent className="text-xs text-slate-300 space-y-1.5 pt-3 px-1">
              <div className="flex justify-between font-semibold border-b border-[#2e2e2e] pb-1.5">
                <span>Total Neto:</span> <span className="text-white">Q{resumen.totalNeto.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Manual:</span> <span>Q{resumen.totalManual.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>+ Total Extr. Neta:</span> <span>Q{resumen.totalExtraccionNeta.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-[#2e2e2e] pt-1.5 text-white">
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
            <Label className="text-xs font-semibold text-slate-300 ml-1">Monedas Sig. Período</Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400 text-xs font-bold pointer-events-none">
                Q
              </span>
              <InputNumero
                value={existenciaSiguiente}
                onChange={(e) => setExistenciaSiguiente(e.target.value)}
                onClick={(e) => e.currentTarget.select()}
                onFocus={(e) => e.target.select()}
                placeholder="0"
                className="px-8 text-center font-bold bg-[#252526] border-[#2e2e2e] text-white rounded-full h-10"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-300 ml-1">Efectivo Sig. Período</Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400 text-xs font-bold pointer-events-none">
                Q
              </span>
              <InputNumero
                value={efectivoSiguientePeriodo}
                onChange={(e) => setEfectivoSiguientePeriodo(e.target.value)}
                onClick={(e) => e.currentTarget.select()}
                onFocus={(e) => e.target.select()}
                placeholder="0.00"
                className="px-8 text-center font-bold bg-[#252526] border-[#2e2e2e] text-white rounded-full h-10"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-300 ml-1">Ganancia a Trasladar a Cuenta</Label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400 text-xs font-bold pointer-events-none">
              Q
            </span>
            <InputNumero
              value={gananciaATrasladar}
              onChange={(e) => setGananciaATrasladar(e.target.value)}
              onClick={(e) => e.currentTarget.select()}
              onFocus={(e) => e.target.select()}
              placeholder="0.00"
              className="px-8 text-center font-bold bg-[#252526] border-[#2e2e2e] text-white rounded-full h-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 ml-1">
            <Banknote className="h-4 w-4 text-emerald-400" /> Cuenta Destino para Traslado
          </Label>
          <Select value={cuentaDestinoId} onValueChange={setCuentaDestinoId}>
            <SelectTrigger className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] hover:bg-[#313131]">
              <SelectValue placeholder="Seleccione la cuenta..." />
            </SelectTrigger>
            <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-white">
              {cuentas.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.nombre} (Q{c.saldo.toFixed(2)})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-300 ml-1">Notas Adicionales (Opcional)</Label>
          <Textarea
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            placeholder="Ej: Cuadre semanal de máquinas..."
            className="bg-[#252526] border-[#2e2e2e] text-white rounded-2xl text-xs resize-none p-3"
            rows={3}
          />
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-[#2e2e2e]">
        <Button
          className="w-full rounded-full bg-sky-600 hover:bg-sky-500 text-white font-semibold h-10"
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
