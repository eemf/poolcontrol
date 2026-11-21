import { Dispatch, SetStateAction } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from "@/components/ui/progress"
import { InputNumero } from '@/components/ui/input-numero'
import { Eraser, Loader2, CheckCircle2 } from 'lucide-react'

interface PanelConfiguracionRangoProps {
  desdeId: number | ''
  setDesdeId: Dispatch<SetStateAction<number | ''>>
  hastaId: number | ''
  setHastaId: Dispatch<SetStateAction<number | ''>>
  excluirCredito: boolean
  setExcluirCredito: Dispatch<SetStateAction<boolean>>
  excluirPendientes: boolean
  setExcluirPendientes: Dispatch<SetStateAction<boolean>>
  procesando: boolean
  progreso: number
  puedeEjecutar: boolean
  onEjecutarClick: () => void
  resultado: { total: number } | null
}

export function PanelConfiguracionRango({
  desdeId,
  setDesdeId,
  hastaId,
  setHastaId,
  excluirCredito,
  setExcluirCredito,
  excluirPendientes,
  setExcluirPendientes,
  procesando,
  progreso,
  puedeEjecutar,
  onEjecutarClick,
  resultado
}: PanelConfiguracionRangoProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-[#252526] border-[#2e2e2e] text-white shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-[#2e2e2e]">
          <CardTitle className="text-base font-bold text-white">Configurar Rango</CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Indica el intervalo de IDs de venta que deseas remover permanentemente.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="desde-id" className="text-xs font-semibold text-slate-300">
                Desde ID
              </Label>
              <InputNumero
                id="desde-id"
                placeholder="100"
                value={desdeId}
                onChange={e => setDesdeId(e.target.value === '' ? '' : Number(e.target.value))}
                className="rounded-full h-10 text-center font-bold bg-[#1e1e1e] border-[#2e2e2e] text-white"
                disabled={procesando}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hasta-id" className="text-xs font-semibold text-slate-300">
                Hasta ID
              </Label>
              <InputNumero
                id="hasta-id"
                placeholder="500"
                value={hastaId}
                onChange={e => setHastaId(e.target.value === '' ? '' : Number(e.target.value))}
                className="rounded-full h-10 text-center font-bold bg-[#1e1e1e] border-[#2e2e2e] text-white"
                disabled={procesando}
              />
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-[#2e2e2e]">
            <p className="text-xs font-bold text-slate-300">Reglas de Seguridad</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center space-x-3 p-3 rounded-xl border border-[#2e2e2e] bg-[#1e1e1e]">
                <Checkbox
                  id="excluir-credito"
                  checked={excluirCredito}
                  onCheckedChange={checked => setExcluirCredito(!!checked)}
                  disabled={procesando}
                />
                <Label htmlFor="excluir-credito" className="text-xs font-medium text-slate-300 cursor-pointer">
                  Excluir ventas a Crédito
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-xl border border-[#2e2e2e] bg-[#1e1e1e]">
                <Checkbox
                  id="excluir-pendientes"
                  checked={excluirPendientes}
                  onCheckedChange={checked => setExcluirPendientes(!!checked)}
                  disabled={procesando}
                />
                <Label htmlFor="excluir-pendientes" className="text-xs font-medium text-slate-300 cursor-pointer">
                  Excluir ventas Pendientes
                </Label>
              </div>
            </div>
          </div>

          {procesando && (
            <div className="space-y-2 pt-3 border-t border-[#2e2e2e] animate-in fade-in">
              <div className="flex justify-between items-center text-xs font-semibold text-sky-400">
                <span>Procesando eliminación...</span>
                <span>{progreso}%</span>
              </div>
              <Progress value={progreso} className="h-2 bg-[#1e1e1e]" />
              <p className="text-[0.6875rem] text-center text-slate-400 italic">
                Por favor, no cierres esta ventana hasta que el proceso finalice.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-[#1e1e1e]/60 border-t border-[#2e2e2e] p-3 flex justify-end">
          <Button
            variant="destructive"
            disabled={!puedeEjecutar || procesando}
            onClick={onEjecutarClick}
            className="rounded-full px-6 font-bold h-9 bg-rose-600 hover:bg-rose-500 text-white"
          >
            {procesando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eraser className="mr-2 h-4 w-4" />}
            Ejecutar Eliminación
          </Button>
        </CardFooter>
      </Card>

      {resultado !== null && (
        <div className="bg-[#1e1e1e] border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 duration-200">
          <div className="h-10 w-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-sm text-emerald-400">Proceso Finalizado</p>
            <p className="text-xs text-slate-300">
              Se han removido satisfactoriamente <strong className="text-white">{resultado.total}</strong> registros del sistema.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
