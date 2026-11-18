'use client';

import React from 'react';
import Link from 'next/link';
import {
  Dices,
  ShoppingCart,
  LayoutGrid,
  AlertTriangle,
  Loader2,
  Undo2,
} from 'lucide-react';
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
import { PageHeader, SurfaceCard } from '@/components/comunes';
import { PremioForm } from './_components/premio-form';
import { MaquinaCard } from './_components/maquina-card';
import { ModalOperacionMaquina } from './_components/modal-operacion-maquina';
import { HistorialModal } from './_components/historial-modal';
import { useGestionTragamonedas } from './_hooks/use-gestion-tragamonedas';

export default function PaginaGestionTragamonedas() {
  const {
    isMounted,
    user,
    sucursalId,
    isLoading,
    isLoadingGeneralesMaquinas,
    error,
    maquinasConDocId,
    mapaGeneralesMaquinas,
    fechaInicioPeriodo,
    maquinaSeleccionada,
    setMaquinaSeleccionada,
    operacionActiva,
    procesandoOperacion,
    handleAbrirOperacion,
    handleCerrarOperacion,
    handleConfirmarOperacion,
    itemParaAnular,
    setItemParaAnular,
    procesandoAnulacion,
    handleSolicitarAnulacion,
    handleConfirmarAnulacion,
  } = useGestionTragamonedas();

  if (!isMounted) return null;

  return (
    <div className="space-y-6 font-body">
      <PageHeader
        title="Gestión de Tragamonedas"
        description="Visualiza el estado de las máquinas y registra premios, bases o extracciones."
        icon={Dices}
        action={
          <div className="flex items-center justify-end gap-2 shrink-0">
            <Button
              variant="secondary"
              asChild
              className="rounded-full h-9 w-9 sm:w-auto p-0 sm:px-3.5 bg-[#252526] hover:bg-[#2e2e2e] text-slate-200 border border-[#2e2e2e] shadow-sm transition-colors text-xs font-semibold gap-1.5 inline-flex items-center justify-center"
              title="Ventas"
              aria-label="Ventas"
            >
              <Link href="/dashboard/ventas">
                <ShoppingCart className="h-4 w-4 text-sky-400 shrink-0" />
                <span className="hidden sm:inline">Ventas</span>
              </Link>
            </Button>
            <Button
              variant="secondary"
              asChild
              className="rounded-full h-9 w-9 sm:w-auto p-0 sm:px-3.5 bg-[#252526] hover:bg-[#2e2e2e] text-slate-200 border border-[#2e2e2e] shadow-sm transition-colors text-xs font-semibold gap-1.5 inline-flex items-center justify-center"
              title="Sala de Juegos"
              aria-label="Sala de Juegos"
            >
              <Link href="/dashboard/mesas">
                <LayoutGrid className="h-4 w-4 text-sky-400 shrink-0" />
                <span className="hidden sm:inline">Sala de Juegos</span>
              </Link>
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
        </div>
      ) : error ? (
        <SurfaceCard
          variant="panel"
          className="p-8 text-center text-rose-400 border border-rose-500/30"
        >
          <Dices className="h-10 w-10 mx-auto mb-2 opacity-80" />
          <h3 className="text-base font-bold">Acceso Denegado</h3>
          <p className="text-xs text-slate-400 mt-1">
            No tienes los permisos requeridos para gestionar las máquinas tragamonedas.
          </p>
        </SurfaceCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sucursalId && user && (
            <PremioForm
              maquinas={maquinasConDocId}
              sucursalId={sucursalId}
              usuarioId={user.uid}
            />
          )}

          {maquinasConDocId.length > 0 ? (
            maquinasConDocId.map(
              (maquina) =>
                sucursalId &&
                user && (
                  <MaquinaCard
                    key={maquina.docId}
                    maquina={maquina}
                    generales={mapaGeneralesMaquinas[maquina.docId]}
                    isLoadingGenerales={isLoadingGeneralesMaquinas}
                    onAbrirOperacion={handleAbrirOperacion}
                    onVerHistorial={setMaquinaSeleccionada}
                  />
                )
            )
          ) : (
            <div className="col-span-full">
              <SurfaceCard variant="panel" className="p-8 text-center text-slate-400">
                <Dices className="h-10 w-10 mx-auto mb-2 text-sky-400/50" />
                <h3 className="text-sm font-bold text-slate-200">No hay máquinas registradas</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Configura tus máquinas tragamonedas en el módulo de{' '}
                  <Link
                    href="/dashboard/configuraciones/tragamonedas"
                    className="text-sky-400 hover:underline font-semibold"
                  >
                    Configuraciones
                  </Link>
                  .
                </p>
              </SurfaceCard>
            </div>
          )}
        </div>
      )}

      {/* Modal Único Centralizado para Carga de Base o Extracción */}
      <ModalOperacionMaquina
        operacion={operacionActiva}
        generales={
          operacionActiva ? mapaGeneralesMaquinas[operacionActiva.maquina.docId] : undefined
        }
        procesando={procesandoOperacion}
        onClose={handleCerrarOperacion}
        onConfirmar={handleConfirmarOperacion}
      />

      {/* Modal de Historial siempre montado para preservar la animación estándar de apertura/cierre */}
      <HistorialModal
        maquinaId={maquinaSeleccionada?.docId || ''}
        maquinaNombre={maquinaSeleccionada?.nombre || ''}
        isOpen={Boolean(maquinaSeleccionada && sucursalId)}
        onClose={() => setMaquinaSeleccionada(null)}
        sucursalId={sucursalId || ''}
        fechaInicioPeriodo={fechaInicioPeriodo}
        onAnular={(item) => {
          if (maquinaSeleccionada) {
            handleSolicitarAnulacion(item, maquinaSeleccionada.docId);
          }
        }}
      />

      {/* Modal Estándar de Confirmación: Anular Transacción */}
      <AlertDialog
        open={!!itemParaAnular}
        onOpenChange={(open) => {
          if (!open && !procesandoAnulacion) setItemParaAnular(null);
        }}
      >
        <AlertDialogContent
          className="sm:max-w-sm w-[95vw] rounded-2xl font-body bg-[#1e1e1e] border border-[#2e2e2e] text-slate-100 p-5 sm:p-6 gap-4 shadow-2xl"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="text-left min-w-0">
                <AlertDialogTitle className="font-headline text-base sm:text-lg font-bold text-slate-100 leading-tight">
                  ¿Anular Transacción?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Esta acción revertirá los montos en la máquina y ajustará el inventario de monedas.
                  Esta operación no se puede deshacer.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="pt-3 border-t border-[#2e2e2e] flex flex-row items-center justify-between sm:justify-between gap-2 sm:space-x-0">
            <AlertDialogCancel
              disabled={procesandoAnulacion}
              className="mt-0 rounded-full h-10 px-5 text-xs font-semibold bg-[#252526] hover:bg-[#2e2e2e] border-[#2e2e2e] text-slate-200"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmarAnulacion}
              disabled={procesandoAnulacion}
              className="rounded-full h-10 px-5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md"
            >
              {procesandoAnulacion ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Anulando...
                </>
              ) : (
                <>
                  <Undo2 className="mr-1.5 h-4 w-4" />
                  Confirmar Anulación
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
