'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  Archive, History, AlertTriangle, Play, Loader2 
} from 'lucide-react';
import { PageHeader, SurfaceCard } from '@/components/comunes';
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
import { HistorialPagosEfectivo } from './_components/historial-pagos-efectivo';
import { HistorialPagosTarjeta } from './_components/historial-pagos-tarjeta';
import { HistorialMonedas } from './_components/historial-monedas';
import { CierreConteoCard } from './_components/cierre-conteo-card';
import { CierreLiquidacionCard } from './_components/cierre-liquidacion-card';

export default function PaginaCierreCaja() {
  const {
    sucursalId,
    estadoCaja,
    cargando,
    cuentasData,
    cuentasPendientes,
    mesasActivas,
    hayVentasPendientes,
    hayMesasActivas,
    hayOperacionesPendientes,
    fechaInicioPeriodo,
    historialVisible,
    setHistorialVisible,
    toggleHistorial,
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
      <div className="space-y-6 max-w-lg mx-auto py-8">
        <PageHeader
          title="Inicialización de Caja"
          description="Inicializa los fondos para comenzar a operar en esta sucursal."
          icon={Play}
        />
        <SurfaceCard variant="surface" className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="monto-apertura" className="text-xs font-semibold text-slate-200">
              Fondo de Caja (Efectivo Q)
            </Label>
            <InputNumero 
              id="monto-apertura" 
              placeholder="0.00" 
              value={montoApertura} 
              onChange={e => setMontoApertura(e.target.value === '' ? '' : Number(e.target.value))} 
              className="h-12 text-xl text-center font-bold font-mono bg-[#1d283a] border-app-border rounded-full" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monedas-apertura" className="text-xs font-semibold text-slate-200">
              Existencia Inicial de Monedas
            </Label>
            <InputNumero 
              id="monedas-apertura" 
              placeholder="0" 
              value={existenciaMonedasInit} 
              onChange={e => setExistenciaMonedasInit(e.target.value === '' ? '' : Number(e.target.value))} 
              className="h-12 text-xl text-center font-bold font-mono bg-[#1d283a] border-app-border rounded-full" 
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
          <Button variant="outline" asChild className="rounded-full h-8 px-4 text-xs border-app-border">
            <Link href="/dashboard/cierre-caja/historial">
              <History className="mr-1.5 h-3.5 w-3.5 text-sky-400" />
              Historial de Cierres
            </Link>
          </Button>
        }
      />

      {/* Alertas de Operaciones Pendientes */}
      {hayOperacionesPendientes && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            Operaciones pendientes de resolver antes del cierre
          </div>
          <ul className="list-disc list-inside space-y-1 pl-1">
            {hayVentasPendientes && (
              <li>Hay {cuentasPendientes.length} cuenta(s) en Punto de Venta pendientes de pago o crédito.</li>
            )}
            {hayMesasActivas && (
              <li>Hay {mesasActivas.length} mesa(s) de billar o consolas actualmente en juego.</li>
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
          toggleHistorial={toggleHistorial}
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

      {/* Historiales Desplegables */}
      <div className="mt-4">
        {historialVisible === 'efectivo' && fechaInicioPeriodo && sucursalId && (
          <HistorialPagosEfectivo 
            fechaInicioPeriodo={fechaInicioPeriodo} 
            onCerrar={() => setHistorialVisible(null)} 
            sucursalId={sucursalId} 
          />
        )}
        {historialVisible === 'tarjeta' && fechaInicioPeriodo && sucursalId && (
          <HistorialPagosTarjeta 
            fechaInicioPeriodo={fechaInicioPeriodo} 
            onCerrar={() => setHistorialVisible(null)} 
            sucursalId={sucursalId} 
          />
        )}
        {historialVisible === 'monedas' && fechaInicioPeriodo && sucursalId && (
          <HistorialMonedas 
            fechaInicioPeriodo={fechaInicioPeriodo} 
            onCerrar={() => setHistorialVisible(null)} 
            sucursalId={sucursalId} 
          />
        )}
      </div>

      {/* Modal de Confirmación de Cierre */}
      <AlertDialog open={alertaAbierta} onOpenChange={setAlertaAbierta}>
        <AlertDialogContent className="bg-app-surface border-app-border text-foreground rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-slate-100 text-base">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Confirmar Cierre de Caja
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Estás a punto de finalizar el período actual. Esta acción guardará un registro histórico y reiniciará los totales para el siguiente turno. ¿Estás seguro?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-between">
            <AlertDialogCancel disabled={procesandoCierre} className="rounded-full bg-[#1d283a] border-app-border text-slate-200 text-xs h-8">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={manejarCierre} 
              disabled={procesandoCierre} 
              className="rounded-full bg-sky-600 hover:bg-sky-500 text-white font-bold gap-2 text-xs h-8"
            >
              {procesandoCierre && <Loader className="h-4 w-4 animate-spin" />}
              Sí, Realizar Cierre
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
