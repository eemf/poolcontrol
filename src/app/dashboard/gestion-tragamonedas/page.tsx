'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Dices, ShoppingCart, LayoutGrid, AlertTriangle, Loader2, Undo2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { PageHeader, SurfaceCard } from '@/components/comunes';
import { PremioForm } from './_components/premio-form';
import { MaquinaCard } from './_components/maquina-card';
import { HistorialModal } from './_components/historial-modal';
import { useGestionTragamonedas } from './_hooks/use-gestion-tragamonedas';

export default function PaginaGestionTragamonedas() {
  const {
    isMounted,
    user,
    sucursalId,
    isLoading,
    error,
    maquinasConDocId,
    maquinaSeleccionada,
    setMaquinaSeleccionada,
    itemParaAnular,
    setItemParaAnular,
    procesandoAnulacion,
    handleSolicitarAnulacion,
    handleConfirmarAnulacion,
  } = useGestionTragamonedas();

  if (!isMounted) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Tragamonedas"
        description="Visualiza el estado de las máquinas y registra premios, bases o extracciones."
        icon={Dices}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild className="rounded-full h-8 px-3 text-xs border-app-border">
              <Link href="/dashboard/ventas">
                <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                Ventas
              </Link>
            </Button>
            <Button variant="outline" asChild className="rounded-full h-8 px-3 text-xs border-app-border">
              <Link href="/dashboard/mesas">
                <LayoutGrid className="mr-1.5 h-3.5 w-3.5" />
                Sala de Juegos
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
        <SurfaceCard variant="panel" className="p-8 text-center text-rose-400 border border-rose-500/30">
          <Dices className="h-10 w-10 mx-auto mb-2 opacity-80" />
          <h3 className="text-base font-bold">Acceso Denegado</h3>
          <p className="text-xs text-muted-foreground mt-1">
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
            maquinasConDocId.map((maquina) => (
              sucursalId && user && (
                <MaquinaCard
                  key={maquina.docId}
                  maquina={maquina}
                  sucursalId={sucursalId}
                  usuarioId={user.uid}
                  onVerHistorial={setMaquinaSeleccionada}
                />
              )
            ))
          ) : (
            <div className="col-span-full">
              <SurfaceCard variant="panel" className="p-8 text-center text-muted-foreground">
                <Dices className="h-10 w-10 mx-auto mb-2 text-sky-400/50" />
                <h3 className="text-sm font-bold text-slate-200">No hay máquinas registradas</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Configura tus máquinas tragamonedas en el módulo de{' '}
                  <Link href="/dashboard/configuraciones/tragamonedas" className="text-sky-400 hover:underline">
                    Configuraciones
                  </Link>.
                </p>
              </SurfaceCard>
            </div>
          )}
        </div>
      )}

      {maquinaSeleccionada && sucursalId && (
        <HistorialModal
          maquinaId={maquinaSeleccionada.docId}
          maquinaNombre={maquinaSeleccionada.nombre}
          isOpen={!!maquinaSeleccionada}
          onClose={() => setMaquinaSeleccionada(null)}
          sucursalId={sucursalId}
          onAnular={(item) => handleSolicitarAnulacion(item, maquinaSeleccionada.docId)}
        />
      )}

      <AlertDialog
        open={!!itemParaAnular}
        onOpenChange={(open) => {
          if (!open) setItemParaAnular(null);
        }}
      >
        <AlertDialogContent
          className="rounded-2xl bg-app-surface border-app-border text-foreground p-5 max-w-md"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-400 text-base font-bold">
              <AlertTriangle className="h-5 w-5" />
              ¿Anular Transacción?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Esta acción revertirá los montos en la máquina y ajustará el inventario de monedas. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 sm:justify-between mt-3">
            <AlertDialogCancel
              disabled={procesandoAnulacion}
              className="rounded-full h-8 text-xs border-app-border"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmarAnulacion}
              disabled={procesandoAnulacion}
              className="bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-full h-8 text-xs"
            >
              {procesandoAnulacion ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Undo2 className="mr-1.5 h-3.5 w-3.5" />
              )}
              Confirmar Anulación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
