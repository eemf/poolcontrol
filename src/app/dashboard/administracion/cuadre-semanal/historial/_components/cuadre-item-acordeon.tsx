'use client'

import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowRight, ArrowDown, ArrowUp } from 'lucide-react'
import { Firestore } from 'firebase/firestore'
import { CuadreSemanal } from '@/lib/tipos'
import { DetalleRegistrosProcesados } from './detalle-registros-procesados'

type CuadreSemanalConId = CuadreSemanal & { id: string }

interface CuadreItemAcordeonProps {
  cuadre: CuadreSemanalConId
  isOpen: boolean
  firestore: Firestore | null
  sucursalId: string | null
}

export function CuadreItemAcordeon({
  cuadre,
  isOpen,
  firestore,
  sucursalId
}: CuadreItemAcordeonProps) {
  const totalIngresos = (
    cuadre.resumen.totalIngresosEfectivo +
    cuadre.resumen.totalIngresosTarjeta +
    (cuadre.resumen.totalIngresosTragamonedas || 0) +
    (cuadre.resumen.totalIngresosTraslados || 0)
  )
  const totalEgresos = cuadre.resumen.totalCompras + cuadre.resumen.totalGastos

  return (
    <AccordionItem
      value={cuadre.id}
      className="border border-[#2e2e2e] rounded-xl bg-[#252526] overflow-hidden shadow-sm transition-all hover:border-slate-500"
    >
      <AccordionTrigger className="p-4 hover:no-underline transition-colors text-white">
        <div className="flex flex-1 items-center justify-between w-full pr-2">
          <div className="flex flex-col text-left min-w-0">
            <p className="font-bold text-sm sm:text-base text-white leading-tight">
              #{cuadre.idCuadreSemanal}. {format(cuadre.fecha.toDate(), "dd 'de' LLLL, yyyy", { locale: es })}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-medium text-slate-400">
                {format(cuadre.fecha.toDate(), "hh:mm a", { locale: es })}
              </span>
              <span className="text-slate-500">•</span>
              <Badge
                className={
                  cuadre.estadoMensual === 'procesado'
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0 text-[10px] font-semibold"
                    : "bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full px-2 py-0 text-[10px] font-semibold"
                }
              >
                {cuadre.estadoMensual === 'procesado' ? 'Procesado' : 'Pendiente'}
              </Badge>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-base sm:text-xl font-bold text-sky-400 leading-none">
              Q{cuadre.resumen.balanceLiquidado.toFixed(2)}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Balance Liquidado</p>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="p-4 pt-0">
        <div className="border-t border-[#2e2e2e] pt-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card className="text-center bg-[#1e1e1e] border-[#2e2e2e]">
              <CardHeader className="pb-1">
                <p className="text-xs font-medium text-slate-400">Balance Neto</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">
                  Q{cuadre.resumen.balanceNetoCalculado.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center bg-[#1e1e1e] border-sky-500/40">
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

          <div className="flex items-center justify-center gap-4 text-center p-3.5 border border-[#2e2e2e] rounded-xl bg-[#1e1e1e]">
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
            <Card className="border-[#2e2e2e] bg-[#1e1e1e]/70 p-4 rounded-xl">
              <CardHeader className="p-0 pb-3">
                <p className="text-sm font-bold text-white">Registros Procesados</p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-0">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <ArrowUp size={14} /> Ingresos (Q{totalIngresos.toFixed(2)})
                  </h4>
                  <div className="space-y-3 border-l-2 border-emerald-500/30 pl-3 ml-1">
                    <DetalleRegistrosProcesados ids={cuadre.idsProcesados.ingresosEfectivo} firestore={firestore} sucursalId={sucursalId} tipo="movimiento" titulo="Cajas (Efectivo)" />
                    <DetalleRegistrosProcesados ids={cuadre.idsProcesados.ingresosTarjeta} firestore={firestore} sucursalId={sucursalId} tipo="movimiento" titulo="Cajas (Tarjeta)" />
                    <DetalleRegistrosProcesados ids={cuadre.idsProcesados.ingresosTragamonedas || []} firestore={firestore} sucursalId={sucursalId} tipo="tragamonedas" titulo="Tragamonedas" />
                    <DetalleRegistrosProcesados ids={cuadre.idsProcesados.ingresosTraslados || []} firestore={firestore} sucursalId={sucursalId} tipo="traslado" titulo="Cobros por Traslados" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <ArrowDown size={14} /> Egresos (-Q{totalEgresos.toFixed(2)})
                  </h4>
                  <div className="space-y-3 border-l-2 border-rose-500/30 pl-3 ml-1">
                    <DetalleRegistrosProcesados ids={cuadre.idsProcesados.compras} firestore={firestore} sucursalId={sucursalId} tipo="compra" titulo="Compras Pagadas" />
                    <DetalleRegistrosProcesados ids={cuadre.idsProcesados.gastos} firestore={firestore} sucursalId={sucursalId} tipo="gasto" titulo="Gastos Pagados" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {cuadre.observaciones && (
            <div className="mt-3">
              <p className="text-xs font-medium text-slate-400 mb-1.5">Observaciones:</p>
              <div className="bg-[#1e1e1e] p-3 rounded-lg border border-dashed border-[#2e2e2e] text-xs text-slate-300 italic leading-relaxed">
                "{cuadre.observaciones}"
              </div>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
