'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarDays, History, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SurfaceCard } from '@/components/comunes';
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

import { useCuadreSemanal } from './_hooks/use-cuadre-semanal';
import { EncabezadoSemanal } from './_components/encabezado-semanal';
import { IngresosFisicos } from './_components/ingresos-fisicos';
import { IngresosTarjeta } from './_components/ingresos-tarjeta';
import { ListaTrasladosCobro } from './_components/lista-traslados-cobro';
import { ListaCompras } from './_components/lista-compras';
import { ListaGastos } from './_components/lista-gastos';
import { BarraResumen } from './_components/barra-resumen';

export default function CuadreSemanalPage() {
  const {
    firestore,
    sucursalId,
    isLoading,
    hayDatosPendientes,
    ingresosFisicosPendientes,
    ingresosTarjetaPendientes,
    trasladosCobroPendientes,
    comprasPendientes,
    gastosPendientes,
    selectedIngresosEfectivo,
    selectedIngresosTarjeta,
    selectedIngresosTragamonedas,
    selectedIngresosTraslados,
    selectedCompras,
    selectedGastos,
    totalesCalculados,
    balanceALiquidar,
    setBalanceALiquidar,
    cuentaOrigenId,
    setCuentaOrigenId,
    cuentaDestinoId,
    setCuentaDestinoId,
    cuentas,
    isLoadingCuentas,
    observaciones,
    setObservaciones,
    isProcessing,
    isConfirmOpen,
    setIsConfirmOpen,
    handleSelect,
    handleSelectAllFisico,
    handleSelectAllTraslados,
    handleSelectAll,
    handleProcess,
  } = useCuadreSemanal();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 space-y-3 flex-col">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="text-xs text-slate-400">Cargando cuadre semanal...</span>
      </div>
    );
  }

  const hasAnySelected =
    Boolean(selectedIngresosEfectivo.size) ||
    Boolean(selectedIngresosTarjeta.size) ||
    Boolean(selectedIngresosTragamonedas.size) ||
    Boolean(selectedIngresosTraslados.size) ||
    Boolean(selectedCompras.size) ||
    Boolean(selectedGastos.size);

  return (
    <div className="space-y-4 font-body pb-10">
      <EncabezadoSemanal hayDatosPendientes={hayDatosPendientes} />

      {!hayDatosPendientes ? (
        <SurfaceCard variant="panel" className="p-12 text-center border-dashed border-[#2e2e2e] space-y-4">
          <CalendarDays className="h-12 w-12 mx-auto text-primary/40" />
          <div className="space-y-1">
            <p className="font-semibold text-lg text-white">No hay registros pendientes de procesar</p>
            <p className="text-xs text-slate-400">Todos los ingresos, egresos y traslados semanales están liquidados al día.</p>
          </div>
          <Link href="/dashboard/administracion/cuadre-semanal/historial" className="inline-block pt-1">
            <Button
              variant="outline"
              className="rounded-full px-6 font-semibold text-xs h-9 gap-2 border-[#2e2e2e] bg-[#252526] text-slate-200 hover:text-white"
            >
              <History className="h-3.5 w-3.5 text-primary" />
              Ver Historial de Cuadres Semanales
            </Button>
          </Link>
        </SurfaceCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <div className="lg:col-span-2 space-y-4">
            <IngresosFisicos
              items={ingresosFisicosPendientes}
              selectedEfectivo={selectedIngresosEfectivo}
              selectedTragamonedas={selectedIngresosTragamonedas}
              onSelect={handleSelect}
              onSelectAll={handleSelectAllFisico}
            />

            <IngresosTarjeta
              items={ingresosTarjetaPendientes}
              selected={selectedIngresosTarjeta}
              onSelect={(id, isSel) => handleSelect(id, isSel, 'ingresoTarjeta')}
              onSelectAll={() => handleSelectAll('ingresoTarjeta')}
              firestore={firestore}
              sucursalId={sucursalId!}
            />

            <ListaTrasladosCobro
              items={trasladosCobroPendientes}
              selected={selectedIngresosTraslados}
              onSelect={(id, isSel) => handleSelect(id, isSel, 'ingresoTraslado')}
              onSelectAll={handleSelectAllTraslados}
            />

            <ListaCompras
              items={comprasPendientes}
              selected={selectedCompras}
              onSelect={(id, isSel) => handleSelect(id, isSel, 'compra')}
              onSelectAll={() => handleSelectAll('compra')}
            />

            <ListaGastos
              items={gastosPendientes}
              selected={selectedGastos}
              onSelect={(id, isSel) => handleSelect(id, isSel, 'gasto')}
              onSelectAll={() => handleSelectAll('gasto')}
            />
          </div>

          <BarraResumen
            totals={totalesCalculados}
            balanceALiquidar={balanceALiquidar}
            setBalanceALiquidar={setBalanceALiquidar}
            cuentaOrigenId={cuentaOrigenId}
            setCuentaOrigenId={setCuentaOrigenId}
            cuentaDestinoId={cuentaDestinoId}
            setCuentaDestinoId={setCuentaDestinoId}
            cuentas={cuentas}
            isLoadingCuentas={isLoadingCuentas}
            observaciones={observaciones}
            setObservaciones={setObservaciones}
            isProcessing={isProcessing}
            onProcess={() => setIsConfirmOpen(true)}
            disabled={isProcessing || !hasAnySelected}
          />
        </div>
      )}

      {/* Modal de Confirmación */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="rounded-2xl font-body bg-[#1b2533] border-[#2c3b4f] text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-white">
              Confirmar Cuadre Semanal
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-300">
              Esta acción procesará los ítems seleccionados, actualizará su estado a liquidado y registrará los movimientos de balance correspondientes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-full h-9 px-6 font-semibold text-xs border-[#2e2e2e] bg-[#252526] text-slate-300 hover:text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleProcess}
              className="rounded-full h-9 px-6 font-semibold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
            >
              Sí, procesar cuadre
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
