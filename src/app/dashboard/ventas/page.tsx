'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { SurfaceCard } from '@/components/comunes';
import { POSHeader } from './_components/pos-header';
import { POSForm } from './_components/pos-form';
import { POSCart } from './_components/pos-cart';
import { POSAccounts } from './_components/pos-accounts';
import { POSDialogs } from './_components/pos-dialogs';
import { DialogoTrasladoCuenta } from './_components/dialogo-traslado-cuenta';
import { POSUltimaAccion } from './_components/pos-ultima-accion';
import { DialogoUltimosMovimientos } from './_components/dialogo-ultimos-movimientos';
import { useVentas } from './_hooks/use-ventas';

export default function PaginaVentasPOS() {
  const {
    isLoadingSucursal,
    ultimaAccion,
    ultimosMovimientos,
    dialogoMovimientosAbierto,
    setDialogoMovimientosAbierto,
    formProps,
    cartProps,
    accountsProps,
    dialogsProps,
    trasladoProps,
  } = useVentas();

  if (isLoadingSucursal) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-3 font-body pb-4">
      <div className="shrink-0 space-y-2.5">
        <POSHeader
          onOpenUltimosMovimientos={() => setDialogoMovimientosAbierto(true)}
          ultimaAccion={ultimaAccion}
        />
        <div className="lg:hidden">
          <POSUltimaAccion
            ultimaAccion={ultimaAccion}
            onOpenUltimosMovimientos={() => setDialogoMovimientosAbierto(true)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
        <div className="lg:col-span-3">
          <SurfaceCard variant="panel" className="w-full p-4 flex flex-col gap-3.5">
            <POSForm {...formProps} />
            <POSCart {...cartProps} />
          </SurfaceCard>
        </div>
        <div className="lg:col-span-2">
          <POSAccounts {...accountsProps} />
        </div>
      </div>
      <POSDialogs {...dialogsProps} />
      <DialogoTrasladoCuenta {...trasladoProps} />
      <DialogoUltimosMovimientos
        open={dialogoMovimientosAbierto}
        onOpenChange={setDialogoMovimientosAbierto}
        movimientos={ultimosMovimientos}
      />
    </div>
  );
}
