'use client'

import { useMemo, useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useFirebase, useDoc, useMemoFirebase, useCollection, useUser } from '@/firebase'
import { collection, doc, query, where, orderBy } from 'firebase/firestore'
import type { Generales, ProductoVirtual, GeneralesTragamonedas, Sucursal, Mesa, Tarifa, Producto, Cliente } from '@/lib/tipos'
import { Coins, CreditCard, Banknote, Dices, Menu, LogOut, Building2, ChevronDown, Mic, Sparkles } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import QuickDispatchInput from './quick-dispatch-input'
import VoiceAssistantDialog from './voice-assistant-dialog'
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useSucursal } from '@/hooks/use-sucursal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserNav } from './user-nav';
import { appVersion } from '@/lib/version';
import Link from 'next/link';

function CashDisplay({ features }: { features?: { [key: string]: boolean } }) {
    const { firestore } = useFirebase();
    const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();

    const generalesRef = useMemoFirebase(() =>
        (firestore && sucursalId) ? doc(firestore, `sucursales/${sucursalId}/generales/actual`) : null
    , [firestore, sucursalId]);
    
    const monedaVirtualQuery = useMemoFirebase(() => {
        if (!firestore || !sucursalId) return null;
        return query(
          collection(firestore, `sucursales/${sucursalId}/productos_virtuales`),
          where("nombre", "==", "Monedas")
        );
    }, [firestore, sucursalId]);

    const generalesTragamonedasQuery = useMemoFirebase(() => {
        if (!firestore || !sucursalId) return null;
        return query(collection(firestore, `sucursales/${sucursalId}/generales_tragamonedas`));
    }, [firestore, sucursalId]);


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


    if (cargandoContext || isLoadingMonedas || isLoadingGeneralesTragamonedas || isLoadingSucursal) {
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
    
    // MOSTRAR SOLO CONSUMOS Y TIEMPOS (Excluye monedas por tarjeta ya que están en la otra tarjeta)
    const totalVentasTarjeta = (estadoCaja?.totalVentasTarjeta || 0);
    
    const cardClasses = "flex-shrink-0 flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-0.5 dark:bg-slate-700 dark:shadow-lg";

    // Solo mostrar datos de monedas si el módulo de tragamonedas está activo
    const showSlotMachineData = features?.tragamonedas !== false;

    return (
        <div 
          className={cn("flex items-center justify-start md:justify-center gap-2 text-xs overflow-x-auto hide-scrollbar")}
        >
            {showSlotMachineData && (
                <>
                    <div className={cn(cardClasses, "font-semibold")}>
                        <Dices className="h-3.5 w-3.5 text-orange-500" />
                        <div>
                            <span>{monedaVirtual?.existencia ?? 0}</span>
                            {totalDeuda > 0 && (
                                <span className="text-destructive ml-1">
                                    {' '}+ {totalDeuda.toFixed(0)} Deuda
                                </span>
                            )}
                            {totalBase > 0 && (
                                <span className="text-blue-600 ml-1">
                                    {' '}+ {totalBase.toFixed(0)} Base
                                </span>
                            )}
                            <span className="text-muted-foreground"> / </span>
                            <span>{monedasIniciales}</span>
                            {totalExtraccion > 0 && (
                                <span className="text-green-600 ml-1">
                                    {' '}+ {totalExtraccion.toFixed(0)} Ext.
                                </span>
                            )}
                        </div>
                    </div>
                    <div className={cn(cardClasses)}>
                        <Coins className="h-3.5 w-3.5 text-green-600" />
                        <div>
                            <span className="font-bold">Q{totalVentasMonedas.toFixed(0)}</span> / <span>Q{efectivoAcumuladoMonedas.toFixed(0)}</span>
                            {totalMonedasCredito > 0 && (
                                <span className="ml-1 text-blue-600">+ Q{totalMonedasCredito.toFixed(0)} Créd</span>
                            )}
                            {acumuladoMonedasTarjeta > 0 && (
                                <span className="ml-1 text-indigo-600">+ Q{acumuladoMonedasTarjeta.toFixed(0)} Tarj.</span>
                            )}
                        </div>
                    </div>
                </>
            )}
             {totalEfectivo > 0 && (
                <div className={cn(cardClasses, "font-semibold")}>
                    <Banknote className="h-3.5 w-3.5 text-teal-600" />
                    <span>Q{totalEfectivo.toFixed(2)}</span>
                </div>
             )}
             {totalVentasTarjeta > 0 && (
                 <div className={cn(cardClasses, "font-semibold")}>
                    < CreditCard className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Q{totalVentasTarjeta.toFixed(2)}</span>
                </div>
            )}
        </div>
    );
}

export function Header() {
  const { firestore } = useFirebase();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  const { isAdmin } = useUser();
  const router = useRouter();
  const [voiceDialogOpen, setVoiceDialogOpen] = useState(false);

  const sucursalRef = useMemoFirebase(() => 
    (firestore && sucursalId) ? doc(firestore, 'sucursales', sucursalId) : null,
    [firestore, sucursalId]
  );
  const { data: sucursalData, isLoading: isLoadingSucursalData } = useDoc<Sucursal>(sucursalRef);

  const mesasQuery = useMemoFirebase(() => 
    (firestore && sucursalId) ? collection(firestore, `sucursales/${sucursalId}/mesas_de_billar`) : null,
    [firestore, sucursalId]
  );
  const { data: mesasData } = useCollection<Mesa>(mesasQuery);

  const productosQuery = useMemoFirebase(() => 
    (firestore && sucursalId) ? collection(firestore, `sucursales/${sucursalId}/productos`) : null,
    [firestore, sucursalId]
  );
  const { data: productosData } = useCollection<Producto>(productosQuery);

  const tarifasQuery = useMemoFirebase(() => 
    (firestore && sucursalId) ? collection(firestore, `sucursales/${sucursalId}/tarifas`) : null,
    [firestore, sucursalId]
  );
  const { data: tarifasData } = useCollection<Tarifa>(tarifasQuery);

  const clientesQuery = useMemoFirebase(() => 
    (firestore && sucursalId) ? collection(firestore, `sucursales/${sucursalId}/clientes`) : null,
    [firestore, sucursalId]
  );
  const { data: clientesData } = useCollection<Cliente>(clientesQuery);

  const maquinasQuery = useMemoFirebase(() => 
    (firestore && sucursalId) ? collection(firestore, `sucursales/${sucursalId}/generales_tragamonedas`) : null,
    [firestore, sucursalId]
  );
  const { data: maquinasData } = useCollection<GeneralesTragamonedas>(maquinasQuery);
  
  const showQuickDispatch = !isLoadingSucursalData && sucursalData?.features?.ventasRapidas !== false;

  const handleExitImpersonation = () => {
    localStorage.removeItem('selectedSucursalId');
    router.push('/admin-success');
  };

  return (
    <header className="flex h-auto flex-col md:flex-row md:h-14 items-center justify-between gap-1 border-b bg-card/80 p-1 md:p-3 backdrop-blur-sm sticky top-0 z-40">
      
      {/* Desktop View */}
      <div className="hidden md:flex items-center justify-start gap-4">
        {/* Title */}
        <div className="flex items-center gap-3">
          <Dices className="h-8 w-8 text-primary shrink-0" />
          <div className="flex flex-col">
            <h2 className="text-lg font-headline font-bold leading-none text-foreground">Pool Control</h2>
            <Link href="/dashboard/configuraciones/acerca-de">
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5 hover:text-primary hover:underline transition-colors cursor-pointer" title="Ver historial de versiones publicadas">
                v{appVersion.version} (b{appVersion.build})
              </p>
            </Link>
          </div>
        </div>
        <div className="h-8 w-px bg-border" />
        
        {/* Cash Display */}
        <div className="flex items-center gap-4">
          {isLoadingSucursal || isLoadingSucursalData ? (
              <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-28 rounded-full" />
                  <Skeleton className="h-6 w-28 rounded-full" />
              </div>
          ) : sucursalId ? (
              <CashDisplay features={sucursalData?.features} />
          ) : null}
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2">
        {showQuickDispatch && <QuickDispatchInput />}

        {sucursalId && sucursalData?.features?.asistenteVoz !== false && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setVoiceDialogOpen(true)}
                  className="h-8 w-8 rounded-full border-blue-500/30 hover:border-blue-400 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 shrink-0 aspect-square shadow-sm cursor-pointer"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Asistente de Voz Inteligente</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        <div className="flex items-center gap-2 ml-2">
            <UserNav />
            {isAdmin && sucursalId && (
                <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                    <Button 
                        onClick={handleExitImpersonation} 
                        variant="destructive" 
                        size="icon"
                        className="h-8 w-8 rounded-full p-0 flex-shrink-0 flex items-center justify-center aspect-square"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                    <p>Salir al Panel Maestro</p>
                    </TooltipContent>
                </Tooltip>
                </TooltipProvider>
            )}
        </div>
      </div>

      {/* Mobile View */}
      <div className="w-full flex flex-col gap-1 md:hidden">
        {isLoadingSucursal || isLoadingSucursalData ? (
            <div className="flex justify-center items-center h-8">
                <Skeleton className="h-6 w-48 rounded-full" />
            </div>
        ) : sucursalId ? (
             <div className='w-full flex flex-col gap-1.5 p-1'>
                <CashDisplay features={sucursalData?.features} />
            </div>
        ) : null}
        
        <div className="flex w-full items-center gap-2">
          <SidebarTrigger variant="outline" size="icon" className="h-8 w-8 rounded-full shrink-0">
              <Menu className="h-4 w-4" />
          </SidebarTrigger>
          <div className='flex-grow'>
              {showQuickDispatch && <QuickDispatchInput />}
          </div>
          {sucursalId && sucursalData?.features?.asistenteVoz !== false && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setVoiceDialogOpen(true)}
              className="h-8 w-8 rounded-full border-blue-500/30 hover:border-blue-400 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 shrink-0 aspect-square cursor-pointer"
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}
          <UserNav />
           {isAdmin && sucursalId && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleExitImpersonation} 
                    variant="destructive" 
                    size="icon"
                    className="h-8 w-8 rounded-full p-0 flex-shrink-0 flex items-center justify-center aspect-square"
                  >
                      <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Panel Maestro</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Diálogo del Asistente de Voz */}
      <VoiceAssistantDialog
        open={voiceDialogOpen}
        onOpenChange={setVoiceDialogOpen}
        mesas={mesasData || []}
        productos={productosData || []}
        tarifas={tarifasData || []}
        clientes={clientesData?.map(c => c.nombre) || []}
        maquinas={maquinasData || []}
      />
    </header>
  )
}