'use client';

import React from 'react';
import { BillingDialog } from './billing-dialog';
import { ConsumptionDialog } from './consumption-dialog';
import { TransferDialog } from './transfer-dialog';
import { TimeAdjustDialog } from './time-adjust-dialog';
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
import { Trash2, Loader2 } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { guardarCliente } from '@/lib/firebase/servicios';
import type { UseMesasReturn } from '../_hooks/use-mesas';

interface MesasDialogsProps {
  mesas: UseMesasReturn;
  iMobile: boolean;
}

export function MesasDialogs({ mesas, iMobile }: MesasDialogsProps) {
  const { firestore } = useFirebase();

  const {
    isCobroModalOpen,
    setIsCobroModalOpen,
    tableToCharge,
    setTableToCharge,
    tiempoJugadoFinal,
    totalAPagarModal,
    editableCost,
    setEditableCost,
    consumoFijoModal,
    isEditingCost,
    setIsEditingCost,
    activeTab,
    setActiveTab,
    processingCharge,
    handleFinalizarSinCosto,
    handleProcederConPago,
    handlePasarACuenta,
    clientesOptions,
    clienteInputRef,
    currentDivisionStep,
    setCurrentDivisionStep,
    numeroDePartes,
    setNumeroDePartes,
    montoPorParte,
    handlePagoDivisionLocal,
    divisionClienteId,
    setDivisionClienteId,
    procesandoDivision,
    isConsumoModalOpen,
    setIsConsumoModalOpen,
    handleCancelConsumo,
    mesaParaConsumo,
    isConsumoManual,
    setIsConsumoManual,
    cantidadConsumo,
    setCantidadConsumo,
    descripcionConsumoManual,
    setDescripcionConsumoManual,
    precioConsumoManual,
    setPrecioConsumoManual,
    productoConsumoId,
    setProductoConsumoId,
    productosOptions,
    isLoading,
    productoConsumoSeleccionado,
    preparacionSeleccionada,
    setPreparacionSeleccionada,
    carritoConsumoTemporal,
    handleAddConsumo,
    handleRemoveFromTempCart,
    handleSaveConsumo,
    processingConsumption,
    procesandoAnadir,
    cantidadConsumoInputRef,
    productoInputRef,
    itemManualCantRef,
    itemManualDescRef,
    itemManualPrecioRef,
    itemManualAddBtnRef,
    anadirConsumoButtonRef,
    preparacionesContainerRef,
    handleProductoEnter,
    isTrasladoModalOpen,
    setIsTrasladoModalOpen,
    mesaParaTraslado,
    mesaDestinoId,
    setMesaDestinoId,
    mesasData,
    handleConfirmarTraslado,
    processingTraslado,
    isAjusteTiempoModalOpen,
    setIsAjusteTiempoModalOpen,
    mesaParaAjuste,
    tiempoParaAnadir,
    setTiempoParaAnadir,
    pagarTiempoAnadido,
    setPagarTiempoAnadido,
    handleConfirmarAjusteTiempo,
    processingAjuste,
    confirmarEliminarConsumo,
    setConfirmarEliminarConsumo,
    handleConfirmarEliminarConsumoPersistido,
    procesandoEliminacionConsumo,
    sucursalId,
  } = mesas;

  const mesasDisponibles = (mesasData || []).filter((m) => m.estado === 'disponible');

  return (
    <>
      <BillingDialog
        isOpen={isCobroModalOpen}
        onOpenChange={(o) => {
          setIsCobroModalOpen(o);
          if (!o) {
            setNumeroDePartes(null);
            setCurrentDivisionStep(null);
          }
        }}
        tableToCharge={tableToCharge}
        setTableToCharge={setTableToCharge}
        tiempoJugadoFinal={tiempoJugadoFinal}
        totalAPagarModal={totalAPagarModal}
        editableCost={editableCost}
        setEditableCost={setEditableCost}
        consumoFijoModal={consumoFijoModal}
        isEditingCost={isEditingCost}
        setIsEditingCost={setIsEditingCost}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        processingCharge={processingCharge}
        onFinalizarSinCosto={handleFinalizarSinCosto}
        onProcederConPago={handleProcederConPago}
        onPasarACuenta={handlePasarACuenta}
        clientesOptions={clientesOptions}
        clienteInputRef={clienteInputRef as any}
        manejarCrearCliente={async (nombre) => {
          if (!firestore || !sucursalId) return null;
          const docRef = await guardarCliente(firestore, sucursalId, { nombre });
          return (docRef as any)?.id || null;
        }}
        currentDivisionStep={currentDivisionStep}
        setCurrentDivisionStep={setCurrentDivisionStep}
        numeroDePartes={numeroDePartes}
        setNumeroDePartes={setNumeroDePartes}
        montoPorParte={montoPorParte}
        onPagoDivision={handlePagoDivisionLocal}
        divisionClienteId={divisionClienteId}
        setDivisionClienteId={setDivisionClienteId}
        procesandoDivision={procesandoDivision}
      />

      <ConsumptionDialog
        isOpen={isConsumoModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCancelConsumo();
            setIsConsumoModalOpen(false);
          } else {
            setIsConsumoModalOpen(true);
          }
        }}
        mesaParaConsumo={mesaParaConsumo}
        isConsumoManual={isConsumoManual}
        setIsConsumoManual={setIsConsumoManual}
        cantidadConsumo={cantidadConsumo}
        setCantidadConsumo={setCantidadConsumo}
        descripcionConsumoManual={descripcionConsumoManual}
        setDescripcionConsumoManual={setDescripcionConsumoManual}
        precioConsumoManual={precioConsumoManual}
        setPrecioConsumoManual={setPrecioConsumoManual}
        productoConsumoId={productoConsumoId}
        setProductoConsumoId={setProductoConsumoId}
        productosOptions={productosOptions}
        isLoadingProductos={isLoading}
        productoConsumoSeleccionado={productoConsumoSeleccionado}
        preparacionSeleccionada={preparacionSeleccionada}
        setPreparacionSeleccionada={setPreparacionSeleccionada}
        carritoConsumoTemporal={carritoConsumoTemporal}
        onAddConsumo={handleAddConsumo}
        onRemoveFromTempCart={handleRemoveFromTempCart}
        onSave={handleSaveConsumo}
        processingConsumption={processingConsumption}
        procesandoAnadir={procesandoAnadir}
        cantidadConsumoInputRef={cantidadConsumoInputRef as any}
        productoInputRef={productoInputRef as any}
        itemManualCantRef={itemManualCantRef as any}
        itemManualDescRef={itemManualDescRef as any}
        itemManualPrecioRef={itemManualPrecioRef as any}
        itemManualAddBtnRef={itemManualAddBtnRef as any}
        anadirConsumoButtonRef={anadirConsumoButtonRef as any}
        preparacionesContainerRef={preparacionesContainerRef as any}
        onProductoEnter={handleProductoEnter}
        isMobile={iMobile}
      />

      <TransferDialog
        isOpen={isTrasladoModalOpen}
        onOpenChange={setIsTrasladoModalOpen}
        mesaParaTraslado={mesaParaTraslado}
        mesaDestinoId={mesaDestinoId}
        setMesaDestinoId={setMesaDestinoId}
        mesasDisponibles={mesasDisponibles}
        onConfirm={handleConfirmarTraslado}
        processingTraslado={processingTraslado}
      />

      <TimeAdjustDialog
        isOpen={isAjusteTiempoModalOpen}
        onOpenChange={setIsAjusteTiempoModalOpen}
        mesaParaAjuste={mesaParaAjuste}
        tiempoParaAnadir={tiempoParaAnadir}
        setTiempoParaAnadir={setTiempoParaAnadir}
        pagarTiempoAnadido={pagarTiempoAnadido}
        setPagarTiempoAnadido={setPagarTiempoAnadido}
        onConfirm={handleConfirmarAjusteTiempo}
        processingAjuste={processingAjuste}
      />

      {/* Confirmación Eliminar Consumo Guardado */}
      <AlertDialog
        open={!!confirmarEliminarConsumo}
        onOpenChange={(o) => {
          if (!o) setConfirmarEliminarConsumo(null);
          if (!o && typeof document !== 'undefined') {
            setTimeout(() => {
              document.body.style.pointerEvents = '';
            }, 50);
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-sm rounded-xl sm:rounded-lg bg-[#1d283a] border border-[#324157] text-slate-100 p-5 gap-3.5 shadow-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="text-left min-w-0">
                <AlertDialogTitle className="font-headline text-base font-bold text-slate-100 leading-tight">
                  ¿Eliminar Consumo?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-[11px] text-slate-400 mt-0.5 truncate">
                  {confirmarEliminarConsumo?.tipoDeMesa === 'Consola' ? 'Consola' : 'Mesa'} #
                  {confirmarEliminarConsumo?.numeroMesa} • Confirma la eliminación
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="rounded-lg bg-[#283244] border border-[#324157] p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-100 truncate">
                  {confirmarEliminarConsumo?.nombre}
                </p>
                {confirmarEliminarConsumo?.cantidad !== undefined && (
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {confirmarEliminarConsumo.cantidad} &times; Q
                    {Number(confirmarEliminarConsumo.precioUnitario ?? 0).toFixed(2)} c/u
                  </p>
                )}
              </div>
              {confirmarEliminarConsumo?.total !== undefined && (
                <span className="text-xs font-bold text-sky-400 tabular-nums shrink-0 mt-0.5">
                  Q{Number(confirmarEliminarConsumo.total || 0).toFixed(2)}
                </span>
              )}
            </div>

            <div className="pt-2 border-t border-[#324157] text-[11px] text-slate-300 leading-snug">
              {confirmarEliminarConsumo?.idProducto !== 'item-manual' ? (
                <span>
                  Se devolverá{' '}
                  <strong className="text-slate-100">
                    {confirmarEliminarConsumo?.cantidad ?? 1}{' '}
                    {(confirmarEliminarConsumo?.cantidad ?? 1) === 1 ? 'unidad' : 'unidades'}
                  </strong>{' '}
                  al stock de inventario.
                </span>
              ) : (
                <span>Se descontará este cargo manual del total de la estación.</span>
              )}
            </div>
          </div>

          <AlertDialogFooter className="flex-row items-center justify-between sm:justify-between gap-2 pt-0.5">
            <AlertDialogCancel className="mt-0 rounded-full h-9 px-4 text-xs font-medium bg-[#283244] hover:bg-[#324157] border-[#324157] text-slate-200">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmarEliminarConsumoPersistido();
              }}
              disabled={procesandoEliminacionConsumo}
              className="bg-rose-600 hover:bg-rose-500 text-white rounded-full h-9 px-5 text-xs font-semibold shadow-md"
            >
              {procesandoEliminacionConsumo ? (
                <Loader2 className="animate-spin mr-1.5 h-3.5 w-3.5" />
              ) : (
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              )}
              Sí, Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
