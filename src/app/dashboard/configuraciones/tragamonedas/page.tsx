'use client'

import { PageHeader } from "@/components/comunes/page-header"
import { SurfaceCard } from "@/components/comunes/surface-card"
import { Button } from "@/components/ui/button"
import { Dices, PlusCircle, Loader2 } from "lucide-react"
import { useConfigTragamonedas } from "./_hooks/use-config-tragamonedas"
import { TragamonedasCard } from "./_components/tragamonedas-card"
import { TragamonedasDialog } from "./_components/tragamonedas-dialog"
import { EliminarMaquinaDialog } from "./_components/eliminar-maquina-dialog"

export default function PaginaConfiguracionTragamonedas() {
  const {
    isMounted,
    isLoading,
    error,
    maquinasConDocId,
    isModalOpen,
    setIsModalOpen,
    maquinaToDelete,
    setMaquinaToDelete,
    editingMaquina,
    loading,
    formState,
    handleOpenModal,
    handleCloseModal,
    handleFormChange,
    handleSubmit,
    handleDeleteMaquina,
  } = useConfigTragamonedas()

  if (!isMounted) return null

  if (error) {
    return (
      <div className="text-center text-rose-400 p-6 bg-[#1e1e1e] rounded-xl border border-rose-500/30">
        <p>No tienes los permisos necesarios para realizar estas operaciones.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-2">
      <PageHeader
        title="Configuración de Tragamonedas"
        description="Administra el inventario de máquinas tragamonedas de tu negocio."
        icon={Dices}
        action={
          <Button
            onClick={() => handleOpenModal(null)}
            size="sm"
            className="rounded-full bg-sky-600 hover:bg-sky-500 text-white font-bold h-9 shadow-sm"
          >
            <PlusCircle className="mr-1.5 h-4 w-4" />
            Nueva Máquina
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-slate-400">
          <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
        </div>
      ) : (
        <SurfaceCard variant="panel" className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#2e2e2e]">
            <div>
              <h2 className="text-base font-bold text-white">Inventario de Máquinas</h2>
              <p className="text-xs text-slate-400">Total de máquinas registradas en la sucursal actual.</p>
            </div>
          </div>

          {maquinasConDocId.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-slate-400 h-64 border-2 border-dashed border-[#2e2e2e] rounded-xl bg-[#252526]/40">
              <Dices className="h-12 w-12 mb-3 text-slate-500" />
              <p className="font-semibold text-base text-white">No hay máquinas registradas</p>
              <Button
                onClick={() => handleOpenModal(null)}
                size="sm"
                className="rounded-full mt-3 bg-sky-600 hover:bg-sky-500 text-white font-bold"
              >
                <PlusCircle className="mr-1.5 h-4 w-4" />
                Añadir Primera Máquina
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {maquinasConDocId.map((maquina) => (
                <TragamonedasCard
                  key={maquina.docId}
                  maquina={maquina}
                  onEdit={handleOpenModal}
                  onDelete={setMaquinaToDelete}
                />
              ))}
            </div>
          )}
        </SurfaceCard>
      )}

      {/* Modal de Creación/Edición */}
      <TragamonedasDialog
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingMaquina={editingMaquina}
        formState={formState}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        loading={loading}
      />

      {/* Modal de Eliminación */}
      <EliminarMaquinaDialog
        maquinaToDelete={maquinaToDelete}
        onCancel={() => setMaquinaToDelete(null)}
        onConfirm={handleDeleteMaquina}
      />
    </div>
  )
}
