'use client';

import React from 'react';
import Link from 'next/link';
import {
  PageHeader,
  SurfaceCard,
  Paginacion,
  BotonVolverArriba,
} from '@/components/comunes';
import { PermissionGuard } from '@/components/permission-guard';
import { Button } from '@/components/ui/button';
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
  Loader2,
} from 'lucide-react';

import { useInventario } from './_hooks/use-inventario';
import { InventarioItemCard } from './_components/inventario-item-card';
import { InventarioRevisionItem } from './_components/inventario-revision-item';
import { InventarioFiltros } from './_components/inventario-filtros';
import { InventarioRevisionFooter } from './_components/inventario-revision-footer';

export default function PaginaInventario() {
  const {
    isLoading,
    error,
    isRevisionMode,
    iniciarModoRevision,
    salirModoRevision,
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
    totalItems,
    totalPages,
    totalModificados,
    handleExistenciaFisicaChange,
    handleKeyDown,
    manejarGuardarAjuste,
  } = useInventario();

  if (error) {
    return (
      <div className="text-center text-rose-400 p-6 bg-[#1e1e1e] rounded-xl border border-rose-500/30 font-body">
        <p className="font-bold">Error al cargar el inventario:</p>
        <p className="text-xs mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-2 font-body">
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
            <div className="flex items-center justify-end gap-2 shrink-0">
              <Button
                variant="secondary"
                asChild
                className="rounded-full h-9 w-9 sm:w-auto p-0 sm:px-3.5 font-semibold text-xs border border-[#2e2e2e] bg-[#252526] text-slate-200 hover:bg-[#313131] hover:text-white gap-1.5 inline-flex items-center justify-center"
                title="Historial de Inventario"
                aria-label="Historial de Inventario"
              >
                <Link href="/dashboard/administracion/inventario/historial">
                  <History className="h-4 w-4 text-sky-400 shrink-0" />
                  <span className="hidden sm:inline">Historial</span>
                </Link>
              </Button>
              <PermissionGuard permission="inventario.revisar">
                <Button
                  onClick={iniciarModoRevision}
                  className="rounded-full h-9 w-9 sm:w-auto p-0 sm:px-4 font-semibold text-xs bg-sky-600 hover:bg-sky-500 text-white shadow-sm gap-1.5 inline-flex items-center justify-center"
                  title="Hacer Revisión"
                  aria-label="Hacer Revisión"
                >
                  <ClipboardCheck className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">Hacer Revisión</span>
                </Button>
              </PermissionGuard>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2 shrink-0">
              <Button
                variant="secondary"
                onClick={salirModoRevision}
                className="rounded-full h-8 sm:h-9 px-3 sm:px-3.5 bg-[#252526] hover:bg-[#2e2e2e] text-slate-200 hover:text-white border border-[#2e2e2e] shadow-sm transition-colors text-xs font-semibold gap-1.5 inline-flex items-center"
                title="Regresar al inventario"
              >
                <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-400 shrink-0" />
                <span>Regresar</span>
              </Button>
            </div>
          )
        }
      />

      <SurfaceCard variant="panel" className="p-4 sm:p-5 space-y-4">
        <InventarioFiltros
          filtro={filtro}
          setFiltro={setFiltro}
          ubicacionFiltro={ubicacionFiltro}
          setUbicacionFiltro={setUbicacionFiltro}
          orden={orden}
          setOrden={setOrden}
          ubicacionesDisponibles={ubicacionesDisponibles}
          isLoading={isLoading}
          isRevisionMode={isRevisionMode}
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
            <span className="text-xs text-slate-400">Cargando inventario...</span>
          </div>
        ) : !isRevisionMode ? (
          <div className="space-y-2.5">
            {paginatedProductos.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center text-slate-400 h-64 border-2 border-dashed border-[#2e2e2e] rounded-xl bg-[#252526]/40 p-4">
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
                <div className="flex flex-col items-center justify-center text-center text-slate-400 h-64 border-2 border-dashed border-[#2e2e2e] rounded-xl bg-[#252526]/40 p-4">
                  <Search className="h-10 w-10 mb-3 opacity-30 text-slate-500" />
                  <p className="font-bold text-sm text-white">No se encontraron productos para revisar</p>
                  <p className="text-xs mt-1">Intenta con otro término o filtro de ubicación.</p>
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
              totalProductos={productosAjuste.length}
              totalModificados={totalModificados}
            />
          </div>
        )}

        <Paginacion
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          pageSizeOptions={[10, 20, 50, 100]}
          itemLabel="producto"
          itemLabelPlural="productos"
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </SurfaceCard>

      <AlertDialog open={alertaGuardado} onOpenChange={setAlertaGuardado}>
        <AlertDialogContent className="bg-[#252526] border-[#2e2e2e] text-slate-100 font-body rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-semibold flex items-center gap-2 text-amber-400 text-base">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              ¿Confirmar Ajustes de Inventario?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-300">
              Esta acción guardará la revisión de los {productosAjuste.length} productos del inventario
              {totalModificados > 0
                ? ` y aplicará ajustes de stock en ${totalModificados} ${totalModificados === 1 ? 'producto' : 'productos'}.`
                : ' sin diferencias de stock.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-between">
            <AlertDialogCancel className="font-medium rounded-full text-xs h-8 border-[#2e2e2e] bg-[#252526] text-slate-300 hover:bg-[#313131] hover:text-white">
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

      <BotonVolverArriba />
    </div>
  );
}
