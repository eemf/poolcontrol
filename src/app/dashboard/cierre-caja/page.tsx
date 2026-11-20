'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Archive, History, AlertTriangle, Play, Loader2, CheckCircle2
} from 'lucide-react';
import { PageHeader, SurfaceCard, BotonVolverArriba } from '@/components/comunes';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { InputNumero } from '@/components/ui/input-numero';
import { Loader } from '@/components/ui/loader';
import { useCierreCaja } from './_hooks/use-cierre-caja';
import { CierreConteoCard } from './_components/cierre-conteo-card';
import { CierreLiquidacionCard } from './_components/cierre-liquidacion-card';

export default function PaginaCierreCaja() {
  const {
    estadoCaja,
    cargando,
    cuentasData,
    cuentasPendientes,
    mesasActivas,
    hayVentasPendientes,
    hayMesasActivas,
    hayOperacionesPendientes,
    fechaInicioPeriodo,
    procesandoCierre,
    alertaAbierta,
    setAlertaAbierta,
    efectivoFinalContado,
    setEfectivoFinalContado,
    cajaSiguienteTurno,
    setCajaSiguienteTurno,
    cuentaDestinoId,
    setCuentaDestinoId,
    observaciones,
    setObservaciones,
    montoApertura,
    setMontoApertura,
    existenciaMonedasInit,
    setExistenciaMonedasInit,
    procesandoApertura,
    efectivoFinalInputRef,
    netoMonedasPeriodo,
    totalVentasTarjeta,
    totalMonedasTarjeta,
    totalPagosTarjeta,
    efectivoEnCaja,
    diferencia,
    retiro,
    manejarAperturaCaja,
    manejarCierre,
  } = useCierreCaja();

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-10 w-10 animate-spin text-sky-400" />
      </div>
    );
  }

  // Vista de Inicialización de Caja si la sucursal es nueva y no tiene período activo registrado
  if (!estadoCaja || !fechaInicioPeriodo) {
    return (
      <div className="space-y-6 max-w-lg mx-auto py-8 font-body">
        <PageHeader
          title="Inicialización de Caja"
          description="Inicializa los fondos para comenzar a operar en esta sucursal."
          icon={Play}
        />
        <SurfaceCard variant="panel" className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="monto-apertura" className="text-xs font-semibold text-slate-200 block">
              Fondo de Caja (Efectivo Inicial)
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-black text-slate-400 select-none">
                Q
              </span>
              <InputNumero
                id="monto-apertura"
                placeholder="0.00"
                value={montoApertura}
                onChange={e => setMontoApertura(e.target.value === '' ? '' : Number(e.target.value))}
                className="h-12 pl-9 pr-4 text-xl text-center font-black tabular-nums bg-[#252526] border-[#2e2e2e] text-white rounded-full focus-visible:ring-sky-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="monedas-apertura" className="text-xs font-semibold text-slate-200 block">
              Existencia Inicial de Monedas
            </Label>
            <InputNumero
              id="monedas-apertura"
              placeholder="0"
              value={existenciaMonedasInit}
              onChange={e => setExistenciaMonedasInit(e.target.value === '' ? '' : Number(e.target.value))}
              className="h-12 text-xl text-center font-black tabular-nums bg-[#252526] border-[#2e2e2e] text-white rounded-full focus-visible:ring-sky-500"
            />
          </div>
          <Button
            className="w-full h-11 rounded-full font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/20"
            size="lg"
            onClick={manejarAperturaCaja}
            disabled={procesandoApertura}
          >
            {procesandoApertura && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Inicializar Caja de Sucursal
          </Button>
        </SurfaceCard>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-body">
      <PageHeader
        title="Cierre de Caja"
        description="Consolida ingresos del período, arqueo físico y liquidación de turno."
        icon={Archive}
        action={
          <Button
            variant="secondary"
            asChild
            className="rounded-full h-9 px-3.5 text-xs font-semibold bg-[#252526] border border-[#2e2e2e] text-slate-200 hover:bg-[#313131] gap-1.5 inline-flex items-center justify-center shrink-0"
            title="Historial de Cierres"
            aria-label="Historial de Cierres"
          >
            <Link href="/dashboard/cierre-caja/historial">
              <History className="h-4 w-4 text-sky-400 shrink-0" />
              <span className="sm:hidden">Historial</span>
              <span className="hidden sm:inline">Historial de Cierres</span>
            </Link>
          </Button>
        }
      />

      {/* Alertas de Operaciones Pendientes */}
      {hayOperacionesPendientes && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Operaciones pendientes de resolver antes del cierre
          </div>
          <ul className="list-disc list-inside space-y-1 pl-1 font-medium">
            {hayVentasPendientes && (
              <li>
                Hay <strong className="font-bold tabular-nums">{cuentasPendientes.length}</strong> cuenta(s) en Punto de Venta pendientes de pago o crédito.
              </li>
            )}
            {hayMesasActivas && (
              <li>
                Hay <strong className="font-bold tabular-nums">{mesasActivas.length}</strong> mesa(s) de billar o consolas actualmente en juego.
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Cuadrícula de 2 Columnas de Cuadre */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <CierreConteoCard
          fechaInicioPeriodo={fechaInicioPeriodo}
          netoMonedasPeriodo={netoMonedasPeriodo}
          totalPagosTarjeta={totalPagosTarjeta}
          totalVentasTarjeta={totalVentasTarjeta}
          totalMonedasTarjeta={totalMonedasTarjeta}
          efectivoEnCaja={efectivoEnCaja}
          estadoCaja={estadoCaja}
          efectivoFinalContado={efectivoFinalContado}
          setEfectivoFinalContado={setEfectivoFinalContado}
          diferencia={diferencia}
          efectivoFinalInputRef={efectivoFinalInputRef}
        />

        <CierreLiquidacionCard
          cajaSiguienteTurno={cajaSiguienteTurno}
          setCajaSiguienteTurno={setCajaSiguienteTurno}
          efectivoFinalContado={efectivoFinalContado}
          retiro={retiro}
          cuentaDestinoId={cuentaDestinoId}
          setCuentaDestinoId={setCuentaDestinoId}
          cuentasData={cuentasData}
          observaciones={observaciones}
          setObservaciones={setObservaciones}
          onConfirmar={() => setAlertaAbierta(true)}
          hayOperacionesPendientes={hayOperacionesPendientes}
        />
      </div>

      {/* Modal de Confirmación de Cierre */}
      <AlertDialog open={alertaAbierta} onOpenChange={setAlertaAbierta}>
        <AlertDialogContent className="bg-[#1e1e1e] border-[#2e2e2e] text-white rounded-2xl max-w-md font-body p-6 gap-4">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="text-left">
                <AlertDialogTitle className="font-headline text-base font-bold text-white leading-tight">
                  Confirmar Cierre de Caja
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-slate-400 mt-0.5">
                  Revisa los totales antes de cerrar el período actual.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <SurfaceCard variant="subcard" className="p-3.5 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Efectivo Físico Contado:</span>
              <span className="font-bold text-white tabular-nums">
                Q{Number(efectivoFinalContado || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Fondo Siguiente Turno:</span>
              <span className="font-bold text-slate-200 tabular-nums">
                Q{Number(cajaSiguienteTurno || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[#2e2e2e]">
              <span className="text-sky-400 font-bold">Total a Liquidar:</span>
              <span className="text-base font-black text-sky-400 tabular-nums">
                Q{retiro.toFixed(2)}
              </span>
            </div>
          </SurfaceCard>

          <AlertDialogFooter className="flex-row items-center justify-between sm:justify-between gap-2 pt-2 border-t border-[#2e2e2e]">
            <AlertDialogCancel
              disabled={procesandoCierre}
              className="mt-0 rounded-full h-10 px-5 text-xs font-semibold bg-[#252526] border-[#2e2e2e] text-slate-200 hover:bg-[#313131] hover:text-white"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={manejarCierre}
              disabled={procesandoCierre}
              className="rounded-full h-10 px-5 bg-sky-600 hover:bg-sky-500 text-white font-bold gap-2 text-xs shadow-lg shadow-sky-600/20"
            >
              {procesandoCierre ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Confirmar Cierre
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BotonVolverArriba />
    </div>
  );
}
