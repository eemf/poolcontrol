'use client'

import { PageHeader } from "@/components/comunes/page-header"
import { SurfaceCard } from "@/components/comunes/surface-card"
import { Button } from "@/components/ui/button"
import { DollarSign, PlusCircle, Loader2 } from "lucide-react"
import { useConfigMesas } from "../_hooks/use-config-mesas"
import { TarifaCard } from "../_components/tarifa-card"
import { TarifaDialog } from "../_components/tarifa-dialog"
import { EliminarDialogs } from "../_components/eliminar-dialogs"

export default function PaginaTarifas() {
  const {
    isMounted,
    isGlobalLoading,
    loading,
    tarifasConDocId,
    isTarifaModalOpen,
    setIsTarifaModalOpen,
    tarifaToDelete,
    setTarifaToDelete,
    editingTarifa,
    tarifaForm,
    setTarifaForm,
    nuevoIntervalo,
    setNuevoIntervalo,
    handleTarifaSubmit,
    handleDeleteTarifa,
    handleAddIntervalo,
    handleRemoveIntervalo,
    abrirNuevaTarifa,
    abrirEditarTarifa,
  } = useConfigMesas()

  if (!isMounted) return null

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Gestión de Tarifas"
        description="Crea y administra los precios y modelos de cobro para las estaciones de juego."
        icon={DollarSign}
        action={
          <Button onClick={abrirNuevaTarifa} size="sm" className="rounded-full bg-sky-600 hover:bg-sky-500 text-white font-bold h-9">
            <PlusCircle className="mr-1.5 h-4 w-4" />
            Nueva Tarifa
          </Button>
        }
      />

      {isGlobalLoading ? (
        <div className="flex items-center justify-center h-64 text-slate-400">
          <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
        </div>
      ) : (
        <SurfaceCard variant="panel" className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#324157]">
            <div>
              <h2 className="text-base font-bold text-white">Tarifas Registradas</h2>
              <p className="text-xs text-slate-400">Modelos de cobro por minuto, intervalos o con soporte de consolas.</p>
            </div>
          </div>

          {tarifasConDocId.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-[#324157] rounded-xl bg-[#283244]/40">
              <p className="text-slate-400 text-sm">No hay tarifas registradas aún.</p>
              <Button onClick={abrirNuevaTarifa} size="sm" className="rounded-full mt-3 bg-sky-600 hover:bg-sky-500 text-white">
                <PlusCircle className="mr-1.5 h-4 w-4" />
                Añadir Primera Tarifa
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tarifasConDocId.map((tarifa) => (
                <TarifaCard
                  key={tarifa.docId}
                  tarifa={tarifa}
                  onEdit={abrirEditarTarifa}
                  onDelete={setTarifaToDelete}
                />
              ))}
            </div>
          )}
        </SurfaceCard>
      )}

      <TarifaDialog
        isOpen={isTarifaModalOpen}
        onOpenChange={setIsTarifaModalOpen}
        editingTarifa={editingTarifa}
        tarifaForm={tarifaForm}
        setTarifaForm={setTarifaForm}
        nuevoIntervalo={nuevoIntervalo}
        setNuevoIntervalo={setNuevoIntervalo}
        onAddIntervalo={handleAddIntervalo}
        onRemoveIntervalo={handleRemoveIntervalo}
        onSubmit={handleTarifaSubmit}
        loading={loading}
      />

      <EliminarDialogs
        tarifaToDelete={tarifaToDelete}
        mesaToDelete={null}
        onCancelTarifa={() => setTarifaToDelete(null)}
        onConfirmTarifa={handleDeleteTarifa}
        onCancelMesa={() => {}}
        onConfirmMesa={() => {}}
      />
    </div>
  )
}
