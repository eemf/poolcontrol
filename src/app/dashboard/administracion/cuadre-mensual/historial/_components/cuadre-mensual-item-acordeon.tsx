import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { format, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowRight } from 'lucide-react'
import { Firestore } from 'firebase/firestore'
import type { CuadreMensual } from '@/lib/tipos'
import { DetalleCuadresSemanales } from './detalle-cuadres-semanales'

type CuadreMensualConId = CuadreMensual & { id: string }

interface CuadreMensualItemAcordeonProps {
  cuadre: CuadreMensualConId
  isOpen: boolean
  firestore: Firestore | null
  sucursalId: string | null
}

export function CuadreMensualItemAcordeon({
  cuadre,
  isOpen,
  firestore,
  sucursalId
}: CuadreMensualItemAcordeonProps) {
  const getPeriodoTexto = () => {
    if (cuadre.fechaPeriodo) {
      return format(cuadre.fechaPeriodo.toDate(), "MMMM yyyy", { locale: es })
    }
    if (cuadre.mesCorrespondiente) {
      const parts = cuadre.mesCorrespondiente.split('-')
      if (parts.length === 2) {
        const y = parseInt(parts[0], 10)
        const m = parseInt(parts[1], 10) - 1
        if (!isNaN(y) && !isNaN(m)) {
          return format(new Date(y, m, 1), "MMMM yyyy", { locale: es })
        }
      }
    }
    const fechaOriginal = cuadre.fecha.toDate()
    const fechaAjustada = new Date(fechaOriginal.getTime() - (5 * 60 * 60 * 1000))
    const fechaMes = fechaAjustada.getDate() <= 20 ? subMonths(fechaAjustada, 1) : fechaAjustada
    return format(fechaMes, "MMMM yyyy", { locale: es })
  }

  return (
    <AccordionItem
      value={cuadre.id}
      className="border border-[#324157] rounded-xl bg-[#283244] overflow-hidden mb-3 shadow-sm transition-all hover:border-slate-500"
    >
      <AccordionTrigger className="p-4 hover:no-underline text-white">
        <div className="flex flex-1 items-center justify-between w-full pr-2">
          <div className="flex flex-col text-left min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-sm sm:text-base text-white leading-tight">
                #{cuadre.idCuadreMensual}. {format(cuadre.fecha.toDate(), "dd 'de' MMMM, yyyy", { locale: es })}
              </p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30 capitalize">
                Período: {getPeriodoTexto()}
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 mt-1">
              {format(cuadre.fecha.toDate(), "hh:mm a", { locale: es })}
            </p>
          </div>
          <div className="text-right shrink-0 ml-4">
            <p className="text-base sm:text-xl font-bold text-sky-400 leading-none">
              Q{cuadre.resumen.balanceLiquidado.toFixed(2)}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Balance Liquidado</p>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="p-4 pt-0">
        <div className="border-t border-[#324157] pt-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card className="text-center bg-[#1d283a] border-[#324157]">
              <CardHeader className="pb-1">
                <p className="text-xs font-medium text-slate-400">Balance Neto</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">
                  Q{cuadre.resumen.balanceNetoCalculado.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center bg-[#1d283a] border-sky-500/40">
              <CardHeader className="pb-1">
                <p className="text-xs font-medium text-sky-400">Balance Liquidado</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-sky-400">
                  Q{cuadre.resumen.balanceLiquidado.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-center gap-4 text-center p-3.5 border border-[#324157] rounded-xl bg-[#1d283a]">
            <div className="flex-1">
              <p className="text-xs text-slate-400">Origen</p>
              <p className="font-semibold text-sm text-white">{cuadre.cuentas.origenNombre}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-500 shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-slate-400">Destino</p>
              <p className="font-semibold text-sm text-white">{cuadre.cuentas.destinoNombre}</p>
            </div>
          </div>

          {isOpen && firestore && (
            <Card className="border-[#324157] bg-[#1d283a]/70 p-4 rounded-xl">
              <CardHeader className="p-0 pb-3">
                <p className="text-sm font-bold text-white">Desglose de Cuadres Semanales</p>
              </CardHeader>
              <CardContent className="p-0">
                <DetalleCuadresSemanales
                  ids={cuadre.idsCuadresProcesados}
                  firestore={firestore}
                  sucursalId={sucursalId}
                />
              </CardContent>
            </Card>
          )}

          {cuadre.observaciones && (
            <div className="mt-3">
              <p className="text-xs font-medium text-slate-400 mb-1.5">Observaciones:</p>
              <div className="bg-[#1d283a] p-3 rounded-lg border border-dashed border-[#324157] italic text-xs text-slate-300 leading-relaxed">
                "{cuadre.observaciones}"
              </div>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
