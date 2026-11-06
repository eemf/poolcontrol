'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader, SurfaceCard } from '@/components/comunes';
import { PermissionGuard } from '@/components/permission-guard';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
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
import {
  Boxes,
  Search,
  AlertTriangle,
  ClipboardCheck,
  History,
  ArrowLeft,
  ArrowLeftRight,
  Loader2,
} from 'lucide-react';

import { useInventario } from './_hooks/use-inventario';
import { InventarioItemCard } from './_components/inventario-item-card';
import { InventarioRevisionItem } from './_components/inventario-revision-item';
import { InventarioFiltros } from './_components/inventario-filtros';
import { InventarioRevisionFooter } from './_components/inventario-revision-footer';
import { InventarioPaginacion } from './_components/inventario-paginacion';

export default function PaginaInventario() {
  const {
    isLoading,
    isRevisionMode,
    setIsRevisionMode,
    productosAjuste,
    paginatedProductos,
    ubicacionesDisponibles,
    filtro,
    setFiltro,
    orden,
    setOrden,
    ubicacionFiltro,
    setUbicacionFiltro,
    observaciones,
    setObservaciones,
    confirmadoCheck,
    setConfirmadoCheck,
    alertaGuardado,
    setAlertaGuardado,
    procesando,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    handleExistenciaFisicaChange,
    handleKeyDown,
    manejarGuardarAjuste,
  } = useInventario();

  const hayCambiosPendientes = productosAjuste.some(
    (p) => p.existenciaFisica !== '' && p.existenciaFisica !== p.existencia
  );

  return (
    <div className="space-y-4 font-body pb-10">
      <PageHeader
        title={isRevisionMode ? 'Revisión Física de Inventario' : 'Inventario de Productos'}
        description={
          isRevisionMode
            ? 'Ingresa el conteo físico real para generar ajustes automáticos de stock.'
            : 'Consulta de existencias, stock mínimo y ubicaciones por producto.'
        }
        icon={Boxes}
        action={
          !isRevisionMode ? (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                asChild
                className="rounded-full font-semibold text-xs h-9 px-3.5 border-app-border bg-app-surface text-slate-200 hover:text-white"
              >
                <Link href="/dashboard/administracion/inventario/historial">
                  <History className="mr-1.5 h-3.5 w-3.5 text-sky-400" />
                  Historial
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="rounded-full font-semibold text-xs h-9 px-3.5 border-app-border bg-app-surface text-slate-200 hover:text-white"
              >
                <Link href="/dashboard/administracion/traslados">
                  <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5 text-sky-400" />
                  Traslados
                </Link>
              </Button>
              <PermissionGuard permission="inventario.revisar">
                <Button
                  onClick={() => setIsRevisionMode(true)}
                  className="rounded-full font-semibold text-xs h-9 px-4 bg-sky-600 hover:bg-sky-500 text-white shadow-sm"
                >
                  <ClipboardCheck className="mr-1.5 h-4 w-4" />
                  Hacer Revisión
                </Button>
              </PermissionGuard>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setIsRevisionMode(false)}
                className="flex-1 sm:w-auto rounded-full font-semibold text-xs h-9 px-4 border-app-border bg-app-surface text-slate-200 hover:text-white"
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Regresar
              </Button>
            </div>
          )
        }
      />

      <SurfaceCard variant="panel">
        <InventarioFiltros
          filtro={filtro}
          setFiltro={setFiltro}
          ubicacionFiltro={ubicacionFiltro}
          setUbicacionFiltro={setUbicacionFiltro}
          orden={orden}
          setOrden={setOrden}
          ubicacionesDisponibles={ubicacionesDisponibles}
        />

        <CardContent className="p-3 sm:p-4 bg-[#1d283a]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
              <span className="text-xs text-slate-400">Cargando inventario...</span>
            </div>
          ) : !isRevisionMode ? (
            <div className="space-y-2.5">
              {paginatedProductos.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center text-slate-400 h-64 border border-dashed border-app-border rounded-xl bg-[#283244]/40 p-4">
                  <Search className="h-10 w-10 mb-3 opacity-30 text-slate-500" />
                  <p className="font-bold text-sm text-white">No se encontraron productos</p>
                  <p className="text-xs mt-1">Intenta con otro término o filtro de ubicación.</p>
                </div>
              ) : (
                paginatedProductos.map((p) => (
                  <InventarioItemCard key={p.id} producto={p} />
                ))
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-2.5">
                {paginatedProductos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center text-slate-400 py-12">
                    <p className="text-sm">No se encontraron productos para revisar.</p>
                  </div>
                ) : (
                  paginatedProductos.map((p, index) => (
                    <InventarioRevisionItem
                      key={p.id}
                      producto={p}
                      index={index}
                      onChange={handleExistenciaFisicaChange}
                      onKeyDown={handleKeyDown}
                    />
                  ))
                )}
              </div>

              <InventarioRevisionFooter
                observaciones={observaciones}
                setObservaciones={setObservaciones}
                confirmadoCheck={confirmadoCheck}
                setConfirmadoCheck={setConfirmadoCheck}
                onGuardar={() => setAlertaGuardado(true)}
                procesando={procesando}
                hayCambiosPendientes={hayCambiosPendientes}
              />
            </div>
          )}
        </CardContent>

        <InventarioPaginacion
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
        />
      </SurfaceCard>

      <AlertDialog open={alertaGuardado} onOpenChange={setAlertaGuardado}>
        <AlertDialogContent className="bg-app-surface border-app-border text-slate-100 font-body rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-semibold flex items-center gap-2 text-amber-400 text-base">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              ¿Confirmar Ajustes de Inventario?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-300">
              Esta acción actualizará permanentemente las existencias en el sistema basándose en tu conteo físico. Se generará un registro auditable en el historial de inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-between">
            <AlertDialogCancel className="font-medium rounded-full text-xs h-8 border-app-border bg-app-surface text-slate-300 hover:text-white">
              Volver a Revisar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={manejarGuardarAjuste}
              className="bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-full text-xs h-8"
            >
              Sí, Aplicar Cambios
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
