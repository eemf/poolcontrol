import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Banknote, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toDate } from '../_hooks/use-historial-cierre-caja'
import type { CierreCaja } from '@/lib/tipos'

interface CierreCajaItemAcordeonProps {
  cierre: CierreCaja
}

export function CierreCajaItemAcordeon({ cierre }: CierreCajaItemAcordeonProps) {
  const getStatusBadge = (status?: 'procesado' | 'pendiente') => {
    if (status === 'procesado') {
      return (
        <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold h-6 rounded-full px-3 text-[11px]">
          Procesado
        </Badge>
      )
    }
    return (
      <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold h-6 rounded-full px-3 text-[11px]">
        Pendiente
      </Badge>
    )
  }

  return (
    <AccordionItem
      value={cierre.id}
      className="border border-[#2e2e2e] rounded-xl bg-[#252526] overflow-hidden mb-3 shadow-sm transition-all hover:border-slate-500"
    >
      <AccordionTrigger className="p-4 hover:no-underline text-white">
        <div className="flex justify-between items-center w-full pr-2">
          <div className="text-left min-w-0 flex-1">
            <p className="font-bold text-sm sm:text-base text-white truncate">
              {format(toDate(cierre.fecha), "dd 'de' LLLL, yyyy", { locale: es })}
            </p>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
              {format(toDate(cierre.fecha), "hh:mm a", { locale: es })}
            </p>
          </div>
          <div className="text-right flex flex-col items-end gap-1 shrink-0 ml-4">
            <div className="flex items-center justify-end gap-1.5">
              <span className="hidden sm:inline text-xs font-medium text-slate-400">Liquidado:</span>
              <Banknote className="h-3.5 w-3.5 text-sky-400 sm:hidden" />
              <span className="text-sm sm:text-base font-bold text-sky-400 tabular-nums">
                Q{(cierre.totalLiquidado ?? 0).toFixed(2)}
              </span>
            </div>
            {(cierre.pagosTarjeta ?? 0) > 0 && (
              <div className="flex items-center justify-end gap-1.5">
                <span className="hidden sm:inline text-xs font-medium text-slate-400">Tarjeta:</span>
                <CreditCard className="h-3.5 w-3.5 text-sky-400 sm:hidden" />
                <span className="text-xs sm:text-sm font-semibold text-sky-300 tabular-nums">
                  Q{(cierre.pagosTarjeta ?? 0).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="p-4 pt-0">
        <div className="space-y-5 pt-3 border-t border-[#2e2e2e]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs">
            {/* Columna 1: Ingresos del Período */}
            <div className="space-y-2 p-3 bg-[#1e1e1e] rounded-xl border border-[#2e2e2e]">
              <h4 className="font-bold text-xs text-sky-400 mb-2">Ingresos del Período</h4>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Efectivo Inicial:</span>
                  <span className="font-semibold text-white">Q{cierre.efectivoInicial.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Venta Mesas:</span>
                  <span className="font-semibold text-white">Q{cierre.totalIngresoMesas.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Venta Consumo:</span>
                  <span className="font-semibold text-white">Q{cierre.totalVentaConsumo.toFixed(2)}</span>
                </div>
              </div>
              <Separator className="my-2 border-[#2e2e2e]" />
              <div className="flex justify-between items-center font-bold text-sky-400">
                <span>Efectivo Esperado:</span>
                <span>Q{cierre.efectivoEsperado.toFixed(2)}</span>
              </div>
            </div>

            {/* Columna 2: Totales y Conteo */}
            <div className="space-y-2 p-3 bg-[#1e1e1e] rounded-xl border border-[#2e2e2e]">
              <h4 className="font-bold text-xs text-sky-400 mb-2">Totales y Conteo</h4>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Efectivo Contado:</span>
                  <span className="font-semibold text-white">Q{cierre.efectivoFinalContado.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Pagos con Tarjeta:</span>
                  <span className="font-semibold text-sky-300">Q{cierre.pagosTarjeta.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Venta Monedas (Neto):</span>
                  <span className="font-semibold text-white">Q{cierre.totalVentaMonedas.toFixed(2)}</span>
                </div>
              </div>
              <Separator className="my-2 border-[#2e2e2e]" />
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Diferencia:</span>
                  <span className={`font-bold ${cierre.diferencia >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    Q{cierre.diferencia.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center font-semibold text-sky-400 text-xs">
                  <span className="text-slate-400">Caja Siguiente Turno:</span>
                  <span>Q{cierre.cajaSiguienteTurno.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Resumen de Monedas */}
            <div className="space-y-2 p-3 bg-[#1e1e1e] rounded-xl border border-[#2e2e2e] text-xs">
              <h4 className="font-bold text-xs text-sky-400 mb-2">Resumen de Monedas</h4>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Existencia Registrada:</span>
                  <span className="font-semibold text-white">{cierre.snapshotMonedas.existencia}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Venta Neta Período:</span>
                  <span className="font-semibold text-white">Q{cierre.snapshotMonedas.totalMonedasNetoPeriodo.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Efectivo Acumulado:</span>
                  <span className="font-semibold text-white">Q{cierre.snapshotMonedas.efectivoAcumulado.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Estado del Cierre */}
            <div className="space-y-2 p-3 bg-[#1e1e1e] rounded-xl border border-[#2e2e2e] text-xs">
              <h4 className="font-bold text-xs text-slate-400 mb-2">Estado del Cierre</h4>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between p-2 bg-[#252526] rounded-lg border border-[#2e2e2e]">
                  <span className="font-medium text-slate-300">Liquidación Efectivo</span>
                  {getStatusBadge(cierre.estadoEfectivo)}
                </div>
                {cierre.pagosTarjeta > 0 && (
                  <div className="flex items-center justify-between p-2 bg-[#252526] rounded-lg border border-[#2e2e2e]">
                    <span className="font-medium text-slate-300">Pagos con Tarjeta</span>
                    {getStatusBadge(cierre.estadoTarjeta)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {cierre.observaciones && (
            <div className="p-3 bg-[#1e1e1e] rounded-xl border border-dashed border-[#2e2e2e] text-xs">
              <h4 className="font-bold text-slate-400 mb-1">Observaciones del Cajero</h4>
              <p className="italic text-slate-300 leading-relaxed">"{cierre.observaciones}"</p>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
