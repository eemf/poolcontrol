'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { SurfaceCard } from '@/components/comunes';
import { POSHeader } from './_components/pos-header';
import { POSForm } from './_components/pos-form';
import { POSCart } from './_components/pos-cart';
import { POSAccounts } from './_components/pos-accounts';
import { POSDialogs } from './_components/pos-dialogs';
import { useVentas } from './_hooks/use-ventas';

export default function PaginaVentasPOS() {
  const {
    isLoadingSucursal,
    formProps,
    cartProps,
    accountsProps,
    dialogsProps
  } = useVentas();

  if (isLoadingSucursal) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4 font-body pb-10">
      <POSHeader />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
        <div className="lg:col-span-3">
          <SurfaceCard variant="panel" className="w-full p-4 space-y-4">
            <POSForm {...formProps} />
            <POSCart {...cartProps} />
          </SurfaceCard>
        </div>
        <div className="lg:col-span-2">
          <POSAccounts {...accountsProps} />
        </div>
      </div>
      <POSDialogs {...dialogsProps} />
    </div>
  );
}
