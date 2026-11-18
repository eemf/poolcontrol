import { memo } from 'react'
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Target, ArrowRightLeft, Clock, Landmark, Wallet, Trophy, Banknote } from 'lucide-react'
import { CuadreConId, toDate } from '../_hooks/use-historial-cuadre-tragamonedas'

interface CuadreTragamonedasItemAcordeonProps {
  cuadre: CuadreConId
}

export const CuadreTragamonedasItemAcordeon = memo(function CuadreTragamonedasItemAcordeon({
  cuadre,
}: CuadreTragamonedasItemAcordeonProps) {
  const fecha = toDate(cuadre.fecha)
  const kpis = [
    { label: 'Manual', valor: cuadre.resumen?.totalManual || 0, icon: Banknote, labelClass: 'text-slate-400', iconClass: 'text-sky-400', valueClass: 'text-white' },
    { label: 'Base', valor: cuadre.resumen?.totalBase || 0, icon: Landmark, labelClass: 'text-slate-400', iconClass: 'text-slate-300', valueClass: 'text-white' },
    { label: 'Deuda', valor: cuadre.resumen?.totalDeuda || 0, icon: Wallet, labelClass: 'text-rose-400', iconClass: 'text-rose-400', valueClass: 'text-rose-400' },
    { label: 'Extracción Neta', valor: cuadre.resumen?.totalExtraccionNeta || 0, icon: Trophy, labelClass: 'text-emerald-400', iconClass: 'text-emerald-400', valueClass: 'text-emerald-400' },
  ]

  return (
    <AccordionItem
      value={cuadre.id}
      className="rounded-xl border border-[#2e2e2e] bg-[#252526] hover:border-[#383838] transition-all overflow-hidden shadow-sm"
    >
      <AccordionTrigger className="px-3.5 py-3 sm:px-4 sm:py-3.5 hover:no-underline hover:bg-[#2e2e2e]/30 transition-colors data-[state=open]:border-b data-[state=open]:border-[#2e2e2e]">
        <div className="flex-1 grid grid-cols-[1fr_auto] gap-3 sm:gap-4 items-center text-sm text-left pr-1.5 sm:pr-2.5">
          <div className="flex flex-col items-start gap-1 min-w-0">
            <p className="font-bold text-sm sm:text-base text-slate-100 truncate w-full">
              #{cuadre.idCuadre}. {format(fecha, "dd 'de' MMMM, yyyy", { locale: es })}
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
              <Clock className="h-3 w-3 text-slate-500 shrink-0" />
              {format(fecha, 'dd/MM/yyyy • hh:mm a', { locale: es })}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0 text-right">
            <p className="font-bold text-base sm:text-lg text-emerald-400 leading-none tabular-nums">
              Q{(cuadre.gananciaATrasladar || 0).toFixed(2)}
            </p>
            <Badge
              className={
                cuadre.estado === 'procesado'
                  ? 'rounded-full border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-500/20 text-emerald-300'
                  : 'rounded-full border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-semibold bg-amber-500/20 text-amber-300'
              }
            >
              {cuadre.estado === 'procesado' ? 'Procesado' : 'Pendiente'}
            </Badge>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="p-3.5 sm:p-4 bg-[#1e1e1e]">
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {kpis.map(({ label, valor, icon: Icon, labelClass, iconClass, valueClass }) => (
              <div key={label} className="bg-[#252526] border border-[#2e2e2e] rounded-xl px-3 py-2.5 min-w-0">
                <p className={`text-[11px] font-medium flex items-center gap-1 ${labelClass}`}>
                  <Icon className={`h-3 w-3 shrink-0 ${iconClass}`} /> {label}
                </p>
                <p className={`text-sm font-bold tabular-nums mt-0.5 ${valueClass}`}>
                  Q{valor.toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
            <div className="lg:col-span-7 space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 px-0.5">
                <Target className="h-3.5 w-3.5 text-sky-400" />
                <span>Rendimiento por Máquina</span>
              </h4>
              <div className="rounded-xl border border-[#2e2e2e] bg-[#252526] divide-y divide-[#2e2e2e] overflow-hidden">
                {cuadre.maquinas?.map((m: any) => (
                  <div
                    key={m.id}
                    className="px-3 py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-[#313131] transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-100 truncate">{m.nombre}</p>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-slate-400 mt-0.5 tabular-nums">
                        <span>Manual: Q{m.montoManual.toFixed(2)}</span>
                        <span className={m.deuda > 0 ? 'text-rose-400' : ''}>
                          Deuda: Q{m.deuda.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-sm text-emerald-400 tabular-nums shrink-0">
                      Q{m.extraccion.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 px-0.5">
                <ArrowRightLeft className="h-3.5 w-3.5 text-sky-400" />
                <span>Siguiente Turno y Traslado</span>
              </h4>
              <div className="rounded-xl border border-[#2e2e2e] bg-[#252526] p-3 space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Existencia Monedas</span>
                  <span className="font-semibold text-slate-100 tabular-nums">
                    Q{cuadre.existenciaSiguiente.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Efectivo Acumulado</span>
                  <span className="font-semibold text-slate-100 tabular-nums">
                    Q{cuadre.efectivoAcumuladoSiguiente.toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#2e2e2e] flex justify-between items-center">
                  <span className="font-semibold text-sky-400">Monto Trasladado</span>
                  <span className="text-lg font-bold text-sky-400 tabular-nums">
                    Q{cuadre.gananciaATrasladar.toFixed(2)}
                  </span>
                </div>
              </div>

              {cuadre.observaciones && (
                <div className="rounded-xl border border-[#2e2e2e] bg-[#252526] p-3 text-xs space-y-1">
                  <span className="font-semibold text-slate-300 block">Notas del Cierre</span>
                  <p className="text-slate-400 leading-relaxed">{cuadre.observaciones}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
})
