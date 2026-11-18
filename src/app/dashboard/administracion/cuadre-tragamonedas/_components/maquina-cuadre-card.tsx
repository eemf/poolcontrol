import { memo } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { InputNumero } from "@/components/ui/input-numero"
import { Landmark, Wallet, Trophy } from "lucide-react"

interface MaquinaCuadreCardProps {
  maquina: any
  montoManual: number | ''
  onMontoManualChange: (id: string, valor: string) => void
}

export const MaquinaCuadreCard = memo(function MaquinaCuadreCard({
  maquina,
  montoManual,
  onMontoManualChange
}: MaquinaCuadreCardProps) {
  const manual = Number(montoManual || 0)
  const extraccionNeta = maquina.totalExtraccion || 0
  const base = maquina.totalBase || 0
  const deuda = maquina.totalDeuda || 0
  const totalExtraidoMaquina = manual + extraccionNeta - base - deuda

  return (
    <Card className="flex flex-col bg-[#1e1e1e] border-[#2e2e2e] text-white shadow-sm hover:border-[#383838] transition-colors rounded-xl overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-white">{maquina.nombre}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3 flex-grow">
        <div className="space-y-1.5">
          <Label htmlFor={`manual-${maquina.id}`} className="text-xs font-semibold text-slate-300 ml-1">
            Extraído Manual
          </Label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400 text-xs font-bold pointer-events-none">
              Q
            </span>
            <InputNumero
              id={`manual-${maquina.id}`}
              value={montoManual}
              onChange={(e) => onMontoManualChange(maquina.id, e.target.value)}
              onClick={(e) => e.currentTarget.select()}
              onFocus={(e) => e.target.select()}
              placeholder="0.00"
              className="px-8 text-center font-bold bg-[#252526] border-[#2e2e2e] text-white rounded-full h-10"
            />
          </div>
        </div>

        <div className="text-xs space-y-1.5 pt-1">
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Landmark className="h-3.5 w-3.5 text-sky-400" /> Base Registrada
            </span>
            <span className="font-semibold text-white">Q{base.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5 text-rose-400">
              <Wallet className="h-3.5 w-3.5" /> Deuda Registrada
            </span>
            <span className="font-semibold text-rose-400">Q{deuda.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Trophy className="h-3.5 w-3.5" /> Extracción Neta Registrada
            </span>
            <span className="font-semibold text-emerald-400">Q{extraccionNeta.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-3 bg-[#252526] border-t border-[#2e2e2e] rounded-b-xl">
        <div className="w-full text-center">
          <p className="text-xs font-medium text-slate-400">Total Extraído de Máquina</p>
          <p className="text-lg font-bold text-emerald-400 mt-0.5 tabular-nums">Q{totalExtraidoMaquina.toFixed(2)}</p>
        </div>
      </CardFooter>
    </Card>
  )
})
