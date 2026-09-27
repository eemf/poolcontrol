
'use client'

import { useMemo } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useFirebase, useDoc, useMemoFirebase, useCollection } from '@/firebase'
import { collection, doc, query, where } from 'firebase/firestore'
import type { Generales, ProductoVirtual, GeneralesTragamonedas } from '@/lib/tipos'
import { Coins, CreditCard, CircleDollarSign, Landmark, Banknote, Wallet, Dices, HandCoins } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import QuickDispatchInput from '../quick-dispatch-input'
import { cn } from '@/lib/utils';

const sucursalId = '1';

function CashDisplay() {
    const { firestore } = useFirebase();

    const generalesRef = useMemoFirebase(() =>
        firestore ? doc(firestore, `sucursales/${sucursalId}/generales/actual`) : null
    , [firestore]);
    
    const monedaVirtualQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(
          collection(firestore, `sucursales/${sucursalId}/productos_virtuales`),
          where("nombre", "==", "Monedas")
        );
    }, [firestore]);

    const generalesTragamonedasQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, `sucursales/${sucursalId}/generales_tragamonedas`));
    }, [firestore]);


    const { data: monedaVirtualData, isLoading: isLoadingMonedas } = useCollection<ProductoVirtual>(monedaVirtualQuery);
    const { data: estadoCaja, isLoading: cargandoContext } = useDoc<Generales>(generalesRef);
    const { data: generalesTragamonedas, isLoading: isLoadingGeneralesTragamonedas } = useCollection<GeneralesTragamonedas>(generalesTragamonedasQuery);

    const monedaVirtual = useMemo(() => (monedaVirtualData && monedaVirtualData.length > 0) ? monedaVirtualData[0] : null, [monedaVirtualData]);

    const { totalDeuda, totalBase, totalExtraccion } = useMemo(() => {
        if (!generalesTragamonedas) {
            return { totalDeuda: 0, totalBase: 0, totalExtraccion: 0 };
        }
        return generalesTragamonedas.reduce((acc, maquina) => {
            acc.totalDeuda += maquina.totalDeuda || 0;
            acc.totalBase += maquina.totalBase || 0;
            acc.totalExtraccion += maquina.totalExtraccion || 0;
            return acc;
        }, { totalDeuda: 0, totalBase: 0, totalExtraccion: 0 });
    }, [generalesTragamonedas]);


    if (cargandoContext || isLoadingMonedas || isLoadingGeneralesTragamonedas) {
        return (
            <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
            </div>
        )
    }

    const {
        totalVentasMonedas = 0,
        efectivoAcumuladoMonedas = 0,
        monedasIniciales = 0,
        totalMonedasCredito = 0,
        acumuladoMonedasTarjeta = 0,
    } = estadoCaja || {};
    
    const totalEfectivo = (estadoCaja?.efectivoInicial || 0) + (estadoCaja?.totalEfectivo || 0) + (estadoCaja?.totalMesas || 0);
    const totalVentasTarjeta = (estadoCaja?.totalVentasTarjeta || 0);
    
    return (
        <div 
          className={cn("flex items-center justify-center gap-2 text-xs overflow-x-auto hide-scrollbar")}
        >
            <div className="flex-shrink-0 flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 font-semibold">
                <Dices className="h-3.5 w-3.5 text-orange-500" />
                <span>{monedaVirtual?.existencia ?? 0}</span>
                {totalDeuda > 0 && (
                    <span className="text-destructive font-bold">
                        + {totalDeuda.toFixed(0)} Deuda
                    </span>
                )}
                {totalBase > 0 && (
                    <span className="text-blue-600 font-bold">
                        + {totalBase.toFixed(0)} Base
                    </span>
                )}
                <span className="text-muted-foreground mx-1">/</span>
                <span>{monedasIniciales}</span>
                {totalExtraccion > 0 && (
                    <span className="text-green-600 font-bold">
                        + {totalExtraccion.toFixed(0)} Ext.
                    </span>
                )}
            </div>
             <div className="flex-shrink-0 flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1">
                <Coins className="h-3.5 w-3.5 text-green-600" />
                <div>
                    <span className="font-semibold">Q{totalVentasMonedas.toFixed(0)}</span> / Q{efectivoAcumuladoMonedas.toFixed(0)}
                    {totalMonedasCredito > 0 && (
                        <span className="ml-1 text-blue-600 font-bold">+ Q{totalMonedasCredito.toFixed(0)} Créd</span>
                    )}
                </div>
            </div>
             {totalEfectivo > 0 && (
                <div className="flex-shrink-0 flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1">
                    <Banknote className="h-3.5 w-3.5 text-teal-600" />
                    <span className="font-semibold">Q{totalEfectivo.toFixed(2)}</span>
                </div>
             )}
             {totalVentasTarjeta > 0 && (
                 <div className="flex-shrink-0 flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1">
                    <CreditCard className="h-3.5 w-3.5 text-indigo-600" />
                    <span className="font-semibold">Q{totalVentasTarjeta.toFixed(2)}</span>
                </div>
            )}
        </div>
    );
}

export function Header() {
  return (
    <header className="flex h-auto flex-col md:flex-row md:h-14 items-center justify-between gap-3 border-b bg-card/80 p-3 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex-1 md:flex-initial pl-2">
        <div className="hidden md:flex">
          <CashDisplay />
        </div>
      </div>
      <div className="flex-grow flex justify-center md:hidden">
         <CashDisplay />
      </div>
      <div className="w-full md:w-auto md:flex">
        <QuickDispatchInput />
      </div>
    </header>
  )
}
