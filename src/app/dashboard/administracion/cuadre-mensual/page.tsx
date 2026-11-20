'use client';

import React from 'react';
import Link from 'next/link';
import { FileSignature, History, Loader2, Check } from "lucide-react";
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { PageHeader, SurfaceCard, BotonVolverArriba } from '@/components/comunes';
import { useCuadreMensual } from './_hooks/use-cuadre-mensual';
import { CuadreMensualLista } from './_components/cuadre-mensual-lista';
import { CuadreMensualResumen } from './_components/cuadre-mensual-resumen';

export default function CuadreMensualPage() {
  const {
    cargando,
    error,
    cuadresSemanales,
    cuentas,
    selectedCuadres,
    handleSelectCuadre,
    handleSelectAll,
    resumenMensual,
    balanceALiquidar,
    setBalanceALiquidar,
    cuentaOrigenId,
    setCuentaOrigenId,
    cuentaDestinoId,
    setCuentaDestinoId,
    observaciones,
    setObservaciones,
    isProcessing,
    isConfirmOpen,
    setIsConfirmOpen,
    handleProcess,
  } = useCuadreMensual();

  if (error) {
    return (
      <SurfaceCard variant="panel" className="p-8 text-center text-rose-400 border border-rose-500/30">
        <FileSignature className="h-10 w-10 mx-auto mb-2 opacity-80" />
        <h3 className="text-base font-bold">Error de Acceso</h3>
        <p className="text-xs text-muted-foreground mt-1">
          No se pudieron cargar los cierres semanales. Revisa tus permisos administrativos.
        </p>
      </SurfaceCard>
    );
  }

  return (
    <div className="space-y-4 font-body pb-10">
      <PageHeader
        title="Cuadre Mensual"
        description="Consolida y liquida los cierres semanales pendientes para generar el balance contable mensual."
        icon={FileSignature}
        action={
          <Button
            variant="secondary"
            asChild
            className="w-full sm:w-auto rounded-full h-9 px-4 text-xs font-semibold border border-[#2e2e2e] bg-[#252526] hover:bg-[#313131] text-slate-200 transition-colors"
          >
            <Link href="/dashboard/administracion/cuadre-mensual/historial" className="flex items-center justify-center gap-2">
              <History className="h-4 w-4 text-emerald-400" />
              <span>Historial</span>
            </Link>
          </Button>
        }
      />

      {cargando ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <CuadreMensualLista
              cargando={cargando}
              cuadresSemanales={cuadresSemanales}
              selectedCuadres={selectedCuadres}
              onSelectCuadre={handleSelectCuadre}
              onSelectAll={handleSelectAll}
            />
          </div>
          <div>
            <CuadreMensualResumen
              resumen={resumenMensual}
              cuentas={cuentas}
              cuentaOrigenId={cuentaOrigenId}
              setCuentaOrigenId={setCuentaOrigenId}
              cuentaDestinoId={cuentaDestinoId}
              setCuentaDestinoId={setCuentaDestinoId}
              balanceALiquidar={balanceALiquidar}
              setBalanceALiquidar={setBalanceALiquidar}
              observaciones={observaciones}
              setObservaciones={setObservaciones}
              selectedCount={selectedCuadres.size}
              onOpenConfirm={() => setIsConfirmOpen(true)}
            />
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="rounded-2xl font-body bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 p-5 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Check className="h-4 w-4 text-sky-400" />
              ¿Confirmar Cuadre Mensual?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-300">
              Se procesarán {selectedCuadres.size} cuadre(s) semanales por un balance a liquidar de Q{Number(balanceALiquidar || 0).toFixed(2)}. Esta acción transferirá fondos entre cuentas y marcará los períodos como cerrados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 sm:justify-between mt-3">
            <AlertDialogCancel
              disabled={isProcessing}
              className="rounded-full h-9 px-5 text-xs font-semibold border-[#2e2e2e] bg-[#252526] text-slate-200 hover:bg-[#313131]"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleProcess}
              disabled={isProcessing}
              className="bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-full h-9 px-6 text-xs shadow-md"
            >
              {isProcessing ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}
              Confirmar y Guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BotonVolverArriba />
    </div>
  );
}
