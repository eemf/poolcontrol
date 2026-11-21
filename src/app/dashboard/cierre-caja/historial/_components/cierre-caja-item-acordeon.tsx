import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Archive,
  Banknote,
  CreditCard,
  Calculator,
  Wallet,
  Coins,
  ArrowRight,
  User,
  Clock,
  MessageSquare,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toDate } from '../_hooks/use-historial-cierre-caja'
import type { CierreCaja } from '@/lib/tipos'

interface CierreCajaItemAcordeonProps {
  cierre: CierreCaja
}

export function CierreCajaItemAcordeon({ cierre }: CierreCajaItemAcordeonProps) {
  const tienePendiente =
    cierre.estadoEfectivo === 'pendiente' ||
    ((cierre.pagosTarjeta ?? 0) > 0 && cierre.estadoTarjeta === 'pendiente')

  const getStatusBadge = (status?: 'procesado' | 'pendiente') => {
    if (status === 'procesado') {
      return (
        <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold h-6 rounded-full px-2.5 text-[0.6875rem]">
          Procesado
        </Badge>
      )
    }
    return (
      <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold h-6 rounded-full px-2.5 text-[0.6875rem]">
        Pendiente
      </Badge>
    )
  }

  const fechaFin = toDate(cierre.fecha)
  const fechaInicio = cierre.inicioDelPeriodo ? toDate(cierre.inicioDelPeriodo) : null
  const inicioValido = fechaInicio && !isNaN(fechaInicio.getTime()) && fechaInicio.getTime() > 0

  return (
    <AccordionItem
      value={cierre.id}
      className="border border-[#2e2e2e] rounded-xl bg-[#252526] overflow-hidden shadow-sm transition-all hover:border-[#383838] font-body"
    >
      <AccordionTrigger className="px-3.5 py-3 sm:px-4 sm:py-3.5 hover:no-underline text-white hover:bg-[#2e2e2e]/30 transition-colors data-[state=open]:border-b data-[state=open]:border-[#2e2e2e]">
        <div className="grid grid-cols-[1fr_auto] gap-2.5 sm:gap-4 items-center w-full pr-1.5 sm:pr-2.5 text-left">
          {/* Izquierda: Identidad del Cierre (Icono oculto en móvil, visible en sm+) */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400">
              <Archive className="h-4 w-4" />
            </div>

            <div className="flex flex-col justify-between gap-1.5 min-w-0 flex-1">
              {/* Fila 1: Fecha y Folio */}
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-sm sm:text-base text-white leading-tight truncate">
                  {format(fechaFin, "dd 'de' LLLL, yyyy", { locale: es })}
                </p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.625rem] font-bold bg-[#1e1e1e] text-sky-400 border border-[#2e2e2e] tabular-nums shrink-0">
                  Cierre #{cierre.idCuadre}
                </span>
              </div>

              {/* Fila 2: Rango horario del turno */}
              <div className="flex items-center gap-1.5 text-[0.6875rem] font-medium text-slate-400 truncate">
                <Clock className="h-3 w-3 text-slate-500 shrink-0" />
                <span className="truncate">
                  {inicioValido
                    ? `${format(fechaInicio!, 'dd/MM hh:mm a', { locale: es })} ➔ ${format(fechaFin, 'hh:mm a', { locale: es })}`
                    : format(fechaFin, 'hh:mm a', { locale: es })}
                </span>
              </div>

              {/* Fila 3: Usuario / Cajero */}
              {cierre.usuarioNombre && (
                <div className="flex items-center gap-1.5 text-[0.6875rem] font-medium text-slate-300 truncate">
                  <User className="h-3 w-3 text-sky-400/80 shrink-0" />
                  <span className="truncate">{cierre.usuarioNombre}</span>
                </div>
              )}
            </div>
          </div>

          {/* Derecha: Totales principales y Estado */}
          <div className="flex flex-col justify-between items-end gap-1 shrink-0 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <span className="hidden sm:inline text-xs font-medium text-slate-400">Liquidado:</span>
              <Banknote className="h-3.5 w-3.5 text-sky-400 sm:hidden shrink-0" />
              <span className="text-sm sm:text-base font-black text-sky-400 tabular-nums tracking-tight">
                Q{(cierre.totalLiquidado ?? 0).toFixed(2)}
              </span>
            </div>

            {(cierre.pagosTarjeta ?? 0) > 0 && (
              <div className="flex items-center justify-end gap-1.5">
                <span className="hidden sm:inline text-xs font-medium text-slate-400">Tarjeta:</span>
                <CreditCard className="h-3 w-3 text-sky-300 sm:hidden shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-sky-300 tabular-nums">
                  Q{(cierre.pagosTarjeta ?? 0).toFixed(2)}
                </span>
              </div>
            )}

            <div className="mt-0.5">
              {tienePendiente ? (
                <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold h-5 rounded-full px-2 text-[0.625rem]">
                  Pendiente
                </Badge>
              ) : (
                <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold h-5 rounded-full px-2 text-[0.625rem]">
                  Procesado
                </Badge>
              )}
            </div>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="p-3.5 sm:p-4 bg-[#1e1e1e]">
        <div className="space-y-3.5">
          {/* Franja Superior: Resumen Rápido en 4 KPIs (oculta en móvil para ahorrar espacio) */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
            <div className="p-2.5 sm:p-3 rounded-xl bg-[#252526] border border-[#2e2e2e]">
              <p className="text-[0.6875rem] font-medium text-slate-400 truncate">1. Efectivo Esperado</p>
              <p className="text-sm sm:text-lg font-black text-emerald-400 tabular-nums tracking-tight mt-0.5">
                Q{cierre.efectivoEsperado.toFixed(2)}
              </p>
              <p className="text-[0.625rem] text-slate-500 mt-0.5 truncate">Calculado en sistema</p>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-[#252526] border border-[#2e2e2e]">
              <div className="flex items-center justify-between gap-1">
                <p className="text-[0.6875rem] font-medium text-slate-400 truncate">2. Efectivo Contado</p>
                <span
                  className={`text-[0.625rem] font-bold px-1.5 py-0.5 rounded-full tabular-nums shrink-0 ${
                    cierre.diferencia === 0
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : cierre.diferencia > 0
                        ? 'bg-sky-500/15 text-sky-400'
                        : 'bg-rose-500/15 text-rose-400'
                  }`}
                >
                  {cierre.diferencia === 0
                    ? 'Exacto'
                    : `${cierre.diferencia > 0 ? '+' : ''}Q${cierre.diferencia.toFixed(2)}`}
                </span>
              </div>
              <p className="text-sm sm:text-lg font-black text-white tabular-nums tracking-tight mt-0.5">
                Q{cierre.efectivoFinalContado.toFixed(2)}
              </p>
              <p className="text-[0.625rem] text-slate-500 mt-0.5 truncate">Arqueo físico en caja</p>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-[#252526] border border-[#2e2e2e]">
              <p className="text-[0.6875rem] font-medium text-slate-400 truncate">3. Fondo Sig. Turno</p>
              <p className="text-sm sm:text-lg font-black text-slate-200 tabular-nums tracking-tight mt-0.5">
                Q{cierre.cajaSiguienteTurno.toFixed(2)}
              </p>
              <p className="text-[0.625rem] text-slate-500 mt-0.5 truncate">Se quedó en caja</p>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-[#252526] border border-sky-500/30">
              <p className="text-[0.6875rem] font-semibold text-sky-400 truncate">4. Efectivo Liquidado</p>
              <p className="text-sm sm:text-lg font-black text-sky-400 tabular-nums tracking-tight mt-0.5">
                Q{(cierre.totalLiquidado ?? 0).toFixed(2)}
              </p>
              <p className="text-[0.625rem] text-slate-400 mt-0.5 truncate">Contado − Sig. Turno</p>
            </div>
          </div>

          {/* Desglose Paso a Paso en 3 Columnas Claras */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs">
            {/* Bloque 1: Origen del Efectivo y Arqueo */}
            <div className="p-3.5 bg-[#252526] rounded-xl border border-[#2e2e2e] flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Calculator className="h-4 w-4 shrink-0" />
                  <h4>1. Origen del Efectivo (Arqueo)</h4>
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">+ Fondo Inicial:</span>
                    <span className="font-bold text-white tabular-nums">Q{cierre.efectivoInicial.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">+ Alquiler de Mesas:</span>
                    <span className="font-bold text-white tabular-nums">Q{cierre.totalIngresoMesas.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">+ Ventas en Efectivo:</span>
                    <span className="font-bold text-white tabular-nums">Q{cierre.totalVentaConsumo.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-2.5 border-t border-[#2e2e2e]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-semibold">= Efectivo Esperado:</span>
                  <span className="font-black text-emerald-400 tabular-nums">Q{cierre.efectivoEsperado.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Efectivo Físico Contado:</span>
                  <span className="font-bold text-white tabular-nums">Q{cierre.efectivoFinalContado.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-400">Diferencia de Caja:</span>
                  <span
                    className={`font-black tabular-nums ${
                      cierre.diferencia === 0
                        ? 'text-emerald-400'
                        : cierre.diferencia > 0
                          ? 'text-sky-400'
                          : 'text-rose-400'
                    }`}
                  >
                    {cierre.diferencia === 0
                      ? 'Q0.00 (Exacto)'
                      : `${cierre.diferencia > 0 ? '+Q' : '-Q'}${Math.abs(cierre.diferencia).toFixed(2)} (${
                          cierre.diferencia > 0 ? 'Sobrante' : 'Faltante'
                        })`}
                  </span>
                </div>
              </div>
            </div>

            {/* Bloque 2: Liquidación y Estado de Entrega */}
            <div className="p-3.5 bg-[#252526] rounded-xl border border-[#2e2e2e] flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sky-400 font-bold">
                  <Wallet className="h-4 w-4 shrink-0" />
                  <h4>2. Liquidación y Estado</h4>
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Efectivo Físico Contado:</span>
                    <span className="font-bold text-white tabular-nums">Q{cierre.efectivoFinalContado.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">− Fondo Siguiente Turno:</span>
                    <span className="font-bold text-slate-300 tabular-nums">-Q{cierre.cajaSiguienteTurno.toFixed(2)}</span>
                  </div>
                  <Separator className="my-1.5 border-[#2e2e2e]" />
                  <div className="flex justify-between items-center">
                    <span className="text-sky-400 font-bold">= Efectivo a Liquidar:</span>
                    <span className="font-black text-sky-400 tabular-nums">
                      Q{(cierre.totalLiquidado ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#2e2e2e]">
                <div className="flex items-center justify-between p-2 bg-[#1e1e1e] rounded-lg border border-[#2e2e2e]">
                  <div>
                    <p className="font-semibold text-slate-200">Entrega Efectivo</p>
                    <p className="text-[0.6875rem] font-bold text-sky-400 tabular-nums">
                      Q{(cierre.totalLiquidado ?? 0).toFixed(2)}
                    </p>
                  </div>
                  {getStatusBadge(cierre.estadoEfectivo)}
                </div>

                {cierre.pagosTarjeta > 0 ? (
                  <div className="flex items-center justify-between p-2 bg-[#1e1e1e] rounded-lg border border-[#2e2e2e]">
                    <div>
                      <p className="font-semibold text-slate-200">Cobros con Tarjeta</p>
                      <p className="text-[0.6875rem] font-bold text-sky-300 tabular-nums">
                        Q{cierre.pagosTarjeta.toFixed(2)}
                      </p>
                    </div>
                    {getStatusBadge(cierre.estadoTarjeta)}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-[#1e1e1e] rounded-lg border border-[#2e2e2e]">
                    <span className="text-slate-400 font-medium">Cobros con Tarjeta</span>
                    <span className="text-[0.6875rem] font-semibold text-slate-500 tabular-nums">Q0.00</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bloque 3: Control de Monedas (Tragamonedas) */}
            <div className="p-3.5 bg-[#252526] rounded-xl border border-[#2e2e2e] flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Coins className="h-4 w-4 shrink-0" />
                  <h4>3. Control de Monedas</h4>
                </div>
                <div className="space-y-2 text-slate-300">
                  <div className="p-2.5 rounded-lg bg-[#1e1e1e] border border-[#2e2e2e] flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Existencia en Caja:</span>
                    <span className="inline-flex items-center gap-1.5 font-bold text-white tabular-nums">
                      {typeof cierre.snapshotMonedas?.existenciaAlInicio === 'number' && (
                        <>
                          <span className="text-slate-400">{cierre.snapshotMonedas.existenciaAlInicio}</span>
                          <ArrowRight className="h-3 w-3 text-amber-400" />
                        </>
                      )}
                      <span className="text-amber-400">{cierre.snapshotMonedas?.existencia ?? 0} monedas</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center px-1">
                    <span className="text-slate-400">Venta Neta del Turno:</span>
                    <span className="font-bold text-amber-400 tabular-nums">
                      Q{(cierre.totalVentaMonedas ?? cierre.snapshotMonedas?.totalMonedasNetoPeriodo ?? 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center px-1">
                    <span className="text-slate-400">Efectivo Acumulado:</span>
                    <span className="font-bold text-white tabular-nums">
                      Q{(cierre.snapshotMonedas?.efectivoAcumulado ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[0.6875rem] text-slate-400 leading-relaxed">
                El efectivo de monedas se gestiona en su propio fondo acumulado hasta realizar el cuadre de tragamonedas.
              </div>
            </div>
          </div>

          {cierre.observaciones && (
            <div className="p-3.5 bg-[#252526] rounded-xl border border-dashed border-[#2e2e2e] text-xs flex items-start gap-2.5">
              <MessageSquare className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-300 mb-0.5">Observaciones del Cajero</h4>
                <p className="italic text-slate-400 leading-relaxed">&ldquo;{cierre.observaciones}&rdquo;</p>
              </div>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
