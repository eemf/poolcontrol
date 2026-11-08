'use client';

import * as React from 'react';
import Link from 'next/link';
import { Gamepad2, ShoppingCart, Dices } from 'lucide-react';
import { PageHeader } from '@/components/comunes';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { useIsMobile } from '@/hooks/use-mobile';

// Componentes modulares
import { IncomeSummary } from './_components/income-summary';
import { TableCard } from './_components/table-card';
import { StartSessionDialog } from './_components/start-session-dialog';
import { MesasDialogs } from './_components/mesas-dialogs';
import { useMesas } from './_hooks/use-mesas';

export default function PaginaMesas() {
  const iMobile = useIsMobile();
  const mesas = useMesas();

  const {
    sucursalId,
    generalesRef,
    isLoading,
    mesasData,
    selectedTable,
    isStartModalOpen,
    setIsStartModalOpen,
    modoJuego,
    setModoJuego,
    selectedInterval,
    setSelectedInterval,
    pagadoDeContado,
    setPagadoDeContado,
    numControles,
    setNumControles,
    handleOpenModal,
    handleStartTime,
    handleOpenConsumo,
    handleOpenTraslado,
    handleOpenAjusteTiempo,
    handleOpenEliminarConsumo,
    calcularCostoAlquilerReal,
    obtenerTarifaMesa,
    serverOffset,
  } = mesas;

  return (
    <div className="space-y-4 font-body pb-10">
      {/* Encabezado Oficial */}
      <PageHeader
        title="Control de Estaciones"
        description="Gestión en vivo de mesas de billar y consolas de videojuegos."
        icon={Gamepad2}
        action={
          <div className="flex items-center justify-center sm:justify-end gap-2">
            <Button
              variant="secondary"
              asChild
              className="rounded-full h-9 px-4 text-xs font-medium bg-[#252526] hover:bg-[#1e1e1e] text-slate-200 border border-[#2e2e2e]"
            >
              <Link href="/dashboard/ventas">
                <ShoppingCart className="mr-1.5 h-3.5 w-3.5 text-sky-400" />
                Punto de Venta
              </Link>
            </Button>
            <Button
              variant="secondary"
              asChild
              className="rounded-full h-9 px-4 text-xs font-medium bg-[#252526] hover:bg-[#1e1e1e] text-slate-200 border border-[#2e2e2e]"
            >
              <Link href="/dashboard/gestion-tragamonedas">
                <Dices className="mr-1.5 h-3.5 w-3.5 text-amber-400" />
                Tragamonedas
              </Link>
            </Button>
          </div>
        }
      />

      {/* Cuadrícula Principal: Mesas a la izquierda, Resumen de Ingresos a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Sección Principal de Estaciones */}
        <div className="lg:col-span-2 order-first">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader className="h-10 w-10 animate-spin text-sky-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              {mesasData?.map((mesa) => (
                <TableCard
                  key={mesa.id}
                  mesa={mesa}
                  tarifaMesa={obtenerTarifaMesa(mesa.tarifaId)}
                  costoAlquilerReal={calcularCostoAlquilerReal(mesa)}
                  onAction={handleOpenModal}
                  onConsumo={handleOpenConsumo}
                  onTraslado={handleOpenTraslado}
                  onAjusteTiempo={handleOpenAjusteTiempo}
                  onEliminarConsumo={handleOpenEliminarConsumo}
                  serverOffset={serverOffset || 0}
                />
              ))}
            </div>
          )}
        </div>

        {/* Panel Lateral de Resumen de Ingresos */}
        <div className="lg:col-span-1 order-last">
          <IncomeSummary generalesRef={generalesRef} sucursalId={sucursalId} />
        </div>
      </div>

      {/* Diálogo de Inicio de Sesión */}
      <StartSessionDialog
        isOpen={isStartModalOpen}
        onOpenChange={setIsStartModalOpen}
        selectedTable={selectedTable}
        modoJuego={modoJuego}
        setModoJuego={setModoJuego}
        selectedInterval={selectedInterval}
        setSelectedInterval={setSelectedInterval}
        pagadoDeContado={pagadoDeContado}
        setPagadoDeContado={setPagadoDeContado}
        onStart={handleStartTime}
        numControles={numControles}
        setNumControles={setNumControles}
      />

      {/* Diálogos Operativos (Cobro, Consumos, Traslados, Ajustes) */}
      <MesasDialogs mesas={mesas} iMobile={iMobile} />
    </div>
  );
}
