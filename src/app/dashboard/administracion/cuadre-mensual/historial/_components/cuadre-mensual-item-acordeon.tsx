'use client'

import { memo } from 'react'
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { format, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowRight, Clock } from 'lucide-react'
import { Firestore } from 'firebase/firestore'
import { CuadreMensualConId } from '../_hooks/use-historial-cuadre-mensual'
import { DetalleCuadresSemanales } from './detalle-cuadres-semanales'

interface CuadreMensualItemAcordeonProps {
  cuadre: CuadreMensualConId
  isOpen: boolean
  firestore: Firestore | null
  sucursalId: string | null
}

export const CuadreMensualItemAcordeon = memo(function CuadreMensualItemAcordeon({
  cuadre,
  isOpen,
  firestore,
  sucursalId,
}: CuadreMensualItemAcordeonProps) {
  const getPeriodoTexto = () => {
    if (cuadre.fechaPeriodo) {
      return format(cuadre.fechaPeriodo.toDate(), 'MMMM yyyy', { locale: es })
    }
    if (cuadre.mesCorrespondiente) {
      const parts = cuadre.mesCorrespondiente.split('-')
      if (parts.length === 2) {
        const y = parseInt(parts[0], 10)
        const m = parseInt(parts[1], 10) - 1
        if (!isNaN(y) && !isNaN(m)) {
          return format(new Date(y, m, 1), 'MMMM yyyy', { locale: es })
        }
      }
    }
    const fechaOriginal = cuadre.fecha.toDate()
    const fechaAjustada = new Date(fechaOriginal.getTime() - 5 * 60 * 60 * 1000)
    const fechaMes = fechaAjustada.getDate() <= 20 ? subMonths(fechaAjustada, 1) : fechaAjustada
    return format(fechaMes, 'MMMM yyyy', { locale: es })
  }

  const fecha = cuadre.fecha.toDate()

  return (
    <AccordionItem
      value={cuadre.id}
      className="rounded-xl border border-[#2e2e2e] bg-[#252526] hover:border-[#383838] transition-all overflow-hidden shadow-sm"
    >
      <AccordionTrigger className="px-3.5 py-3 sm:px-4 sm:py-3.5 hover:no-underline hover:bg-[#2e2e2e]/30 transition-colors data-[state=open]:border-b data-[state=open]:border-[#2e2e2e]">
        <div className="flex-1 grid grid-cols-[1fr_auto] gap-3 sm:gap-4 items-center text-sm text-left pr-1.5 sm:pr-2.5">
          <div className="flex flex-col items-start gap-1 min-w-0">
            <p className="font-bold text-sm sm:text-base text-slate-100 truncate w-full">
              #{cuadre.idCuadreMensual}. {format(fecha, "dd 'de' MMMM, yyyy", { locale: es })}
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
              <Clock className="h-3 w-3 text-slate-500 shrink-0" />
              {format(fecha, 'dd/MM/yyyy • hh:mm a', { locale: es })}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0 text-right">
            <p className="font-bold text-base sm:text-lg text-emerald-400 leading-none tabular-nums">
              Q{cuadre.resumen.balanceLiquidado.toFixed(2)}
            </p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30 capitalize">
              {getPeriodoTexto()}
            </span>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="p-3 sm:p-4 bg-[#1e1e1e]">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#252526] border border-[#2e2e2e] rounded-xl px-3 py-2 min-w-0">
              <p className="text-[11px] text-slate-400 font-medium truncate">Balance Neto</p>
              <p className="text-sm font-bold text-white tabular-nums mt-0.5 truncate">
                Q{cuadre.resumen.balanceNetoCalculado.toFixed(2)}
              </p>
            </div>
            <div className="bg-[#252526] border border-[#2e2e2e] rounded-xl px-3 py-2 min-w-0">
              <p className="text-[11px] text-sky-400 font-medium truncate">Balance Liquidado</p>
              <p className="text-sm font-bold text-sky-400 tabular-nums mt-0.5 truncate">
                Q{cuadre.resumen.balanceLiquidado.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 px-3 py-2 border border-[#2e2e2e] rounded-xl bg-[#252526] text-xs">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-slate-400 mr-1.5">Origen:</span>
              <span className="font-semibold text-slate-100 truncate">{cuadre.cuentas.origenNombre}</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <div className="min-w-0 flex-1 text-right">
              <span className="text-[10px] text-slate-400 mr-1.5">Destino:</span>
              <span className="font-semibold text-slate-100 truncate">{cuadre.cuentas.destinoNombre}</span>
            </div>
          </div>

          {isOpen && firestore && (
            <div className="border border-[#2e2e2e] bg-[#252526] p-3 rounded-xl">
              <DetalleCuadresSemanales
                ids={cuadre.idsCuadresProcesados}
                firestore={firestore}
                sucursalId={sucursalId}
              />
            </div>
          )}

          {cuadre.observaciones && (
            <div className="bg-[#252526] px-3 py-2 rounded-xl border border-[#2e2e2e] text-xs">
              <span className="font-semibold text-slate-300 mr-1.5">Observaciones:</span>
              <span className="text-slate-400">{cuadre.observaciones}</span>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
})
