import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Target, Square } from 'lucide-react'
import { CuadreConId, toDate } from '../_hooks/use-historial-cuadre-tragamonedas'

interface CuadreTragamonedasItemAcordeonProps {
  cuadre: CuadreConId
}

export function CuadreTragamonedasItemAcordeon({ cuadre }: CuadreTragamonedasItemAcordeonProps) {
  return (
    <AccordionItem
      value={cuadre.id}
      className="border border-[#324157] rounded-xl bg-[#283244] overflow-hidden mb-3 shadow-sm transition-all hover:border-slate-500"
    >
      <AccordionTrigger className="p-4 hover:no-underline text-white">
        <div className="flex flex-1 items-center justify-between w-full pr-2">
          <div className="flex flex-col text-left min-w-0">
            <p className="font-bold text-sm sm:text-base text-white leading-tight">
              #{cuadre.idCuadre}. {format(toDate(cuadre.fecha), "dd 'de' MMMM, yyyy", { locale: es })}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-medium text-slate-400">
                {format(toDate(cuadre.fecha), "hh:mm a", { locale: es })}
              </span>
              <span className="text-slate-500">•</span>
              <Badge
                className={
                  cuadre.estado === 'procesado'
                    ? "rounded-full border border-emerald-500/30 px-2.5 h-5 text-[10px] font-semibold bg-emerald-500/15 text-emerald-400"
                    : "rounded-full border border-amber-500/30 px-2.5 h-5 text-[10px] font-semibold bg-amber-500/15 text-amber-400"
                }
              >
                {cuadre.estado === 'procesado' ? 'Procesado' : 'Pendiente'}
              </Badge>
            </div>
          </div>
          <div className="text-right shrink-0 ml-4">
            <p className="text-base sm:text-xl font-bold text-sky-400 leading-none">
              Q{(cuadre.gananciaATrasladar || 0).toFixed(2)}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Ganancia Neta</p>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="p-4 pt-0">
        <div className="border-t border-[#324157] pt-5 space-y-6">
          {/* Resumen de Bloques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#1d283a] p-3 rounded-xl text-center border border-[#324157]">
              <p className="text-xs font-medium text-slate-400 mb-0.5">Manual</p>
              <p className="text-base font-bold text-white">Q{(cuadre.resumen?.totalManual || 0).toFixed(2)}</p>
            </div>
            <div className="bg-[#1d283a] p-3 rounded-xl text-center border border-[#324157]">
              <p className="text-xs font-medium text-slate-400 mb-0.5">Base</p>
              <p className="text-base font-bold text-white">Q{(cuadre.resumen?.totalBase || 0).toFixed(2)}</p>
            </div>
            <div className="bg-[#1d283a] p-3 rounded-xl text-center border border-[#324157]">
              <p className="text-xs font-medium text-rose-400 mb-0.5">Deuda</p>
              <p className="text-base font-bold text-rose-400">Q{(cuadre.resumen?.totalDeuda || 0).toFixed(2)}</p>
            </div>
            <div className="bg-[#1d283a] p-3 rounded-xl text-center border border-[#324157]">
              <p className="text-xs font-medium text-emerald-400 mb-0.5">Extracción Neta</p>
              <p className="text-base font-bold text-emerald-400">Q{(cuadre.resumen?.totalExtraccionNeta || 0).toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rendimiento por Máquina */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                <Target className="h-4 w-4" /> Rendimiento por Máquina
              </h4>
              <div className="border border-[#324157] rounded-xl overflow-hidden bg-[#1d283a]">
                <div className="grid grid-cols-2 p-2.5 bg-[#283244] border-b border-[#324157] text-[11px] font-semibold text-slate-300">
                  <span>Máquina</span>
                  <span className="text-right">Extracciones</span>
                </div>
                <div className="divide-y divide-[#324157]">
                  {cuadre.maquinas?.map((m: any) => (
                    <div key={m.id} className="p-2.5 flex justify-between items-center text-xs hover:bg-[#283244]/50 transition-colors">
                      <span className="font-semibold text-white">{m.nombre}</span>
                      <div className="text-right">
                        <p className="text-emerald-400 font-bold">Q{m.extraccion.toFixed(2)}</p>
                        <p className="text-[10px] text-slate-400">
                          Man: Q{m.montoManual.toFixed(0)} | Deu: Q{m.deuda.toFixed(0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Preparación Turno Sig. */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                <Square className="h-4 w-4" /> Preparación Turno Siguiente
              </h4>
              <Card className="p-4 border-[#324157] bg-[#1d283a] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Existencia Monedas:</span>
                  <span className="font-bold text-white">Q{cuadre.existenciaSiguiente.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Efectivo Acumulado:</span>
                  <span className="font-bold text-white">Q{cuadre.efectivoAcumuladoSiguiente.toFixed(2)}</span>
                </div>
                <Separator className="border-[#324157]" />
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs font-semibold text-sky-400">Monto Trasladado:</span>
                  <span className="text-2xl font-black text-sky-400">Q{cuadre.gananciaATrasladar.toFixed(2)}</span>
                </div>
              </Card>

              {cuadre.observaciones && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-slate-400 mb-1">Notas del Cierre:</p>
                  <div className="bg-[#1d283a] p-3 rounded-xl border border-dashed border-[#324157] italic text-xs text-slate-300 leading-relaxed">
                    "{cuadre.observaciones}"
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
