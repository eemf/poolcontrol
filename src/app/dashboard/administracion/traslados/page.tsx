'use client';

import React from 'react';
import {
  ArrowLeftRight,
  Plus,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader, BotonVolverArriba } from '@/components/comunes';
import { PermissionGuard } from '@/components/permission-guard';
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

import { useTraslados } from './_hooks/use-traslados';
import { TrasladoList } from './_components/traslado-list';
import { NuevoTrasladoDialog } from './_components/nuevo-traslado-dialog';
import { RecibirTrasladoDialog } from './_components/recibir-traslado-dialog';
import { DetalleTrasladoDialog } from './_components/detalle-traslado-dialog';

export default function PaginaTraslados() {
  const {
    sucursalId,
    sucursalActiva,
    sucursales,
    productosOrigen,
    comprasOrigen,
    todosTraslados,
    pendientesRecibir,
    enviadosEnTransito,
    listaFiltrada,
    paginatedTraslados,
    pagination,
    activeTab,
    setActiveTab,
    busqueda,
    setBusqueda,
    isNuevoOpen,
    setIsNuevoOpen,
    trasladoParaRecibir,
    setTrasladoParaRecibir,
    trasladoParaDetalle,
    setTrasladoParaDetalle,
    trasladoParaCancelar,
    setTrasladoParaCancelar,
    isCancelling,
    handleConfirmarCancelacion,
    isLoading,
  } = useTraslados();

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-72 space-y-3">
        <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
        <span className="text-xs text-slate-400">Cargando traslados de inventario...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-body pb-10">
      {/* Cabecera Principal Estandarizada */}
      <PageHeader
        title="Traslados"
        description="Envío y recepción de inventario entre sucursales."
        icon={ArrowLeftRight}
        action={
          <PermissionGuard permission="inventario.ver">
            <Button
              onClick={() => setIsNuevoOpen(true)}
              className="bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-full text-xs h-9 px-4 shadow-md flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Nuevo Traslado
            </Button>
          </PermissionGuard>
        }
      />

      {/* Listado unificado con PillTabs, Buscador, Acordeones y Paginación */}
      <TrasladoList
        traslados={paginatedTraslados}
        totalItems={listaFiltrada.length}
        sucursalId={sucursalId}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendientesCount={pendientesRecibir.length}
        enviadosCount={enviadosEnTransito.length}
        historialCount={todosTraslados.length}
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        onRecibir={setTrasladoParaRecibir}
        onCancelar={setTrasladoParaCancelar}
        onVerDetalle={setTrasladoParaDetalle}
        pagination={pagination}
      />

      {/* Diálogo de Nuevo Traslado */}
      <NuevoTrasladoDialog
        open={isNuevoOpen}
        onOpenChange={setIsNuevoOpen}
        sucursalOrigenId={sucursalId || ''}
        sucursalOrigenNombre={sucursalActiva?.nombre || ''}
        sucursales={sucursales}
        productosOrigen={productosOrigen}
        comprasOrigen={comprasOrigen}
      />

      {/* Diálogo de Confirmar Recepción */}
      <RecibirTrasladoDialog
        open={!!trasladoParaRecibir}
        onOpenChange={(op) => !op && setTrasladoParaRecibir(null)}
        traslado={trasladoParaRecibir}
        productosLocales={productosOrigen}
      />

      {/* Diálogo de Detalle / Comprobante */}
      <DetalleTrasladoDialog
        open={!!trasladoParaDetalle}
        onOpenChange={(op) => !op && setTrasladoParaDetalle(null)}
        traslado={trasladoParaDetalle}
      />

      {/* Alerta de confirmación para Cancelar Traslado */}
      <AlertDialog
        open={!!trasladoParaCancelar}
        onOpenChange={(op) => !op && setTrasladoParaCancelar(null)}
      >
        <AlertDialogContent className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 font-body rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="h-5 w-5" />
              ¿Cancelar traslado #{trasladoParaCancelar?.idTraslado}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 text-xs">
              Esta acción revertirá el envío en tránsito. Las {trasladoParaCancelar?.cantidadTotalItems} unidades de los productos despachados se reintegrarán automáticamente al stock de esta sucursal ({trasladoParaCancelar?.sucursalOrigenNombre}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              disabled={isCancelling}
              className="bg-[#252526] border-[#2e2e2e] text-slate-200 hover:bg-[#313131] rounded-full text-xs h-9"
            >
              Regresar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmarCancelacion}
              disabled={isCancelling}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-full text-xs h-9"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  Cancelando...
                </>
              ) : (
                'Sí, Cancelar y Reintegrar Stock'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BotonVolverArriba />
    </div>
  );
}
