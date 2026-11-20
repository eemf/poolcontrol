'use client'

import { memo } from 'react'
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowRight, ArrowDown, ArrowUp, Clock } from 'lucide-react'
import { Firestore } from 'firebase/firestore'
import { CuadreSemanalConId } from '../_hooks/use-historial-cuadre-semanal'
import { DetalleRegistrosProcesados } from './detalle-registros-procesados'

interface CuadreItemAcordeonProps {
  cuadre: CuadreSemanalConId
  isOpen: boolean
  firestore: Firestore | null
  sucursalId: string | null
}

export const CuadreItemAcordeon = memo(function CuadreItemAcordeon({
  cuadre,
  isOpen,
  firestore,
  sucursalId,
}: CuadreItemAcordeonProps) {
  const totalIngresos = (
    cuadre.resumen.totalIngresosEfectivo +
    cuadre.resumen.totalIngresosTarjeta +
    (cuadre.resumen.totalIngresosTragamonedas || 0) +
    (cuadre.resumen.totalIngresosTraslados || 0)
  )
  const totalEgresos = cuadre.resumen.totalCompras + cuadre.resumen.totalGastos
  const fecha = cuadre.fecha.toDate()

  const kpis = [
    { label: 'Ingresos', value: `Q${totalIngresos.toFixed(2)}`, valueClass: 'text-emerald-400' },
    { label: 'Egresos', value: `-Q${totalEgresos.toFixed(2)}`, valueClass: 'text-rose-400' },
    { label: 'Balance Neto', value: `Q${cuadre.resumen.balanceNetoCalculado.toFixed(2)}`, valueClass: 'text-white' },
    { label: 'Liquidado', value: `Q${cuadre.resumen.balanceLiquidado.toFixed(2)}`, valueClass: 'text-sky-400' },
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
              #{cuadre.idCuadreSemanal}. {format(fecha, "dd 'de' MMMM, yyyy", { locale: es })}
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
            <Badge
              className={
                cuadre.estadoMensual === 'procesado'
                  ? 'rounded-full border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-500/20 text-emerald-300'
                  : 'rounded-full border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-semibold bg-amber-500/20 text-amber-300'
              }
            >
              {cuadre.estadoMensual === 'procesado' ? 'Procesado' : 'Pendiente'}
            </Badge>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="p-3 sm:p-4 bg-[#1e1e1e]">
        <div className="space-y-3">
          {/* Resumen compacto de 4 KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {kpis.map(({ label, value, valueClass }) => (
              <div key={label} className="bg-[#252526] border border-[#2e2e2e] rounded-xl px-3 py-2 min-w-0">
                <p className="text-[11px] text-slate-400 font-medium truncate">{label}</p>
                <p className={`text-sm font-bold tabular-nums mt-0.5 truncate ${valueClass}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Ruta de cuentas compacta */}
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

          {/* Registros procesados compactos */}
          {isOpen && firestore && (
            <div className="border border-[#2e2e2e] bg-[#252526] p-3 rounded-xl space-y-2.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 px-0.5">
                    <ArrowUp size={13} /> Ingresos (Q{totalIngresos.toFixed(2)})
                  </h4>
                  <div className="space-y-2">
                    <DetalleRegistrosProcesados ids={cuadre.idsProcesados.ingresosEfectivo} firestore={firestore} sucursalId={sucursalId} tipo="movimiento" titulo="Cajas (Efectivo)" />
                    <DetalleRegistrosProcesados ids={cuadre.idsProcesados.ingresosTarjeta} firestore={firestore} sucursalId={sucursalId} tipo="movimiento" titulo="Cajas (Tarjeta)" campoMonto="pagosTarjeta" />
                    <DetalleRegistrosProcesados ids={cuadre.idsProcesados.ingresosTragamonedas || []} firestore={firestore} sucursalId={sucursalId} tipo="tragamonedas" titulo="Tragamonedas" />
                    <DetalleRegistrosProcesados ids={cuadre.idsProcesados.ingresosTraslados || []} firestore={firestore} sucursalId={sucursalId} tipo="traslado" titulo="Traslados" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5 px-0.5">
                    <ArrowDown size={13} /> Egresos (-Q{totalEgresos.toFixed(2)})
                  </h4>
                  <div className="space-y-2">
                    <DetalleRegistrosProcesados ids={cuadre.idsProcesados.compras} firestore={firestore} sucursalId={sucursalId} tipo="compra" titulo="Compras Pagadas" />
                    <DetalleRegistrosProcesados ids={cuadre.idsProcesados.gastos} firestore={firestore} sucursalId={sucursalId} tipo="gasto" titulo="Gastos Pagados" />
                  </div>
                </div>
              </div>
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
