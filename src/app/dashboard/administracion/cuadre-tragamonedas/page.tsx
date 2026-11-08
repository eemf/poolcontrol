'use client'

import { PageHeader } from "@/components/comunes/page-header"
import { Button } from "@/components/ui/button"
import { PiggyBank, History, Loader2 } from "lucide-react"
import Link from "next/link"
import { useCuadreTragamonedasCierre } from "./_hooks/use-cuadre-tragamonedas-cierre"
import { MaquinaCuadreCard } from "./_components/maquina-cuadre-card"
import { CuadreTragamonedasResumen } from "./_components/cuadre-tragamonedas-resumen"
import { CuadreConfirmacionDialog } from "./_components/cuadre-confirmacion-dialog"

export default function PaginaCuadreTragamonedas() {
  const {
    isLoading,
    maquinasConGenerales,
    montosManuales,
    handleMontoManualChange,
    resumen,
    porcentajeGanancia,
    gananciaEstimada,
    existenciaSiguiente,
    setExistenciaSiguiente,
    efectivoSiguientePeriodo,
    setEfectivoSiguientePeriodo,
    gananciaATrasladar,
    setGananciaATrasladar,
    cuentaDestinoId,
    setCuentaDestinoId,
    cuentas,
    observaciones,
    setObservaciones,
    alertaAbierta,
    setAlertaAbierta,
    procesando,
    handleFinalizarCuadre,
  } = useCuadreTragamonedasCierre()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Cuadre de Tragamonedas"
        description="Control y cierre de las operaciones de las máquinas tragamonedas."
        icon={PiggyBank}
        action={
          <Button variant="outline" asChild className="rounded-full h-9 px-5 border-[#2e2e2e] text-white hover:bg-[#252526] w-full sm:w-auto">
            <Link href="/dashboard/administracion/cuadre-tragamonedas/historial">
              <History className="mr-2 h-4 w-4" />
              Historial
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Listado de Máquinas */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {maquinasConGenerales.map(maquina => (
            <MaquinaCuadreCard
              key={maquina.id}
              maquina={maquina}
              montoManual={montosManuales[maquina.id] ?? ''}
              onMontoManualChange={handleMontoManualChange}
            />
          ))}
        </div>

        {/* Panel Lateral de Resumen y Cierre */}
        <div className="lg:col-span-1">
          <CuadreTragamonedasResumen
            resumen={resumen}
            porcentajeGanancia={porcentajeGanancia}
            gananciaEstimada={gananciaEstimada}
            existenciaSiguiente={existenciaSiguiente}
            setExistenciaSiguiente={setExistenciaSiguiente}
            efectivoSiguientePeriodo={efectivoSiguientePeriodo}
            setEfectivoSiguientePeriodo={setEfectivoSiguientePeriodo}
            gananciaATrasladar={gananciaATrasladar}
            setGananciaATrasladar={setGananciaATrasladar}
            cuentaDestinoId={cuentaDestinoId}
            setCuentaDestinoId={setCuentaDestinoId}
            cuentas={cuentas}
            observaciones={observaciones}
            setObservaciones={setObservaciones}
            onFinalizarClick={() => setAlertaAbierta(true)}
            procesando={procesando}
          />
        </div>
      </div>

      {/* Modal de Confirmación */}
      <CuadreConfirmacionDialog
        open={alertaAbierta}
        onOpenChange={setAlertaAbierta}
        onConfirm={handleFinalizarCuadre}
        procesando={procesando}
      />
    </div>
  )
}
