'use client'

import { BotonVolverArriba, PageHeader, SurfaceCard } from '@/components/comunes'
import { Eraser, Loader2, ShieldAlert } from 'lucide-react'
import { useEliminacionVentas } from './_hooks/use-eliminacion-ventas'
import { PanelConfiguracionRango } from './_components/panel-configuracion-rango'
import { PanelAdvertenciasVentas } from './_components/panel-advertencias-ventas'
import { DialogoConfirmarPurga } from './_components/dialogo-confirmar-purga'

/**
 * Página de mantenimiento y depuración de registros de ventas por rango de identificación.
 * Requiere permiso explícito (`reportes.eliminar_rango` o `ventas.eliminar_rango`).
 */
export default function PaginaMantenimientoVentas() {
  const {
    cargandoPermisos,
    tienePermiso,
    desdeId,
    setDesdeId,
    hastaId,
    setHastaId,
    excluirCredito,
    setExcluirCredito,
    excluirPendientes,
    setExcluirPendientes,
    procesando,
    progreso,
    confirmacionAbierta,
    setConfirmacionAbierta,
    resultado,
    puedeEjecutar,
    manejarEliminacion,
  } = useEliminacionVentas()

  if (cargandoPermisos) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-sky-400 h-10 w-10" />
      </div>
    )
  }

  if (!tienePermiso) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <ShieldAlert className="h-12 w-12 text-rose-500 mb-4" />
        <h1 className="text-xl font-bold text-white">Acceso no autorizado</h1>
        <p className="text-sm text-slate-400 max-w-sm mt-1">
          No tienes los privilegios necesarios para realizar tareas de eliminación masiva de registros.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-2 max-w-5xl mx-auto">
      <PageHeader
        title="Mantenimiento de Ventas"
        description="Borrado masivo de registros por rango de identificación con reglas de protección."
        icon={Eraser}
      />

      <SurfaceCard variant="panel" className="p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2">
            <PanelConfiguracionRango
              desdeId={desdeId}
              setDesdeId={setDesdeId}
              hastaId={hastaId}
              setHastaId={setHastaId}
              excluirCredito={excluirCredito}
              setExcluirCredito={setExcluirCredito}
              excluirPendientes={excluirPendientes}
              setExcluirPendientes={setExcluirPendientes}
              procesando={procesando}
              progreso={progreso}
              puedeEjecutar={puedeEjecutar}
              onEjecutarClick={() => setConfirmacionAbierta(true)}
              resultado={resultado}
            />
          </div>

          <div className="md:col-span-1">
            <PanelAdvertenciasVentas />
          </div>
        </div>
      </SurfaceCard>

      <DialogoConfirmarPurga
        open={confirmacionAbierta}
        onOpenChange={setConfirmacionAbierta}
        desdeId={desdeId}
        hastaId={hastaId}
        procesando={procesando}
        onConfirm={manejarEliminacion}
      />

      <BotonVolverArriba threshold={150} />
    </div>
  )
}
