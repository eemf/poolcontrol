'use client';

import React from 'react';
import {
  Truck,
  ArrowLeftRight,
  PackageCheck,
  Plus,
  Search,
  Boxes,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader, PillTabs, SurfaceCard } from '@/components/comunes';
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
import { TrasladoCard } from './_components/traslado-card';
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
    pendientesRecibir,
    enviadosEnTransito,
    listaFiltrada,
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
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground">Cargando traslados de inventario...</span>
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full text-xs h-9 px-4 shadow-md shadow-primary/20 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Nuevo Traslado
            </Button>
          </PermissionGuard>
        }
      />

      {/* Contenedor Principal de Listado */}
      <SurfaceCard variant="panel">
        <div className="p-3 sm:p-4 border-b border-[#324157] bg-[#1d283a]">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Pestañas en píldora estándar */}
            <div className="w-full md:w-auto">
              <PillTabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as any)}
                listClassName="md:w-[420px]"
                tabs={[
                  {
                    id: 'pendientes',
                    label: 'Pendientes',
                    icon: PackageCheck,
                    count: pendientesRecibir.length,
                    badgeVariant: 'amber',
                  },
                  {
                    id: 'en_transito',
                    label: 'Enviados',
                    icon: Truck,
                    count: enviadosEnTransito.length,
                    badgeVariant: 'white',
                  },
                  {
                    id: 'todos',
                    label: 'Historial',
                    icon: Boxes,
                  },
                ]}
              />
            </div>

            {/* Buscador redondeado */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Buscar por #, sucursal, producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9 bg-[#283244] border-[#324157] text-white placeholder:text-slate-400 text-xs h-10 rounded-full focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-[#1d283a]">
          {listaFiltrada.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-400 text-xs">
              <Truck className="h-8 w-8 mx-auto text-slate-500 opacity-40 mb-2" />
              <span>No hay traslados en esta sección.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {listaFiltrada.map((traslado) => (
                <TrasladoCard
                  key={traslado.id}
                  traslado={traslado}
                  sucursalId={sucursalId}
                  onRecibir={setTrasladoParaRecibir}
                  onCancelar={setTrasladoParaCancelar}
                  onVerDetalle={setTrasladoParaDetalle}
                />
              ))}
            </div>
          )}
        </div>
      </SurfaceCard>

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
        <AlertDialogContent className="bg-[#1b2533] border-[#2c3b4f] text-slate-100 font-body">
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
              className="border-[#2d3e55] text-slate-300 hover:bg-[#233144] rounded-full text-xs h-9"
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
    </div>
  );
}
