'use client'

import { PageHeader } from "@/components/comunes/page-header"
import { SurfaceCard } from "@/components/comunes/surface-card"
import { Button } from "@/components/ui/button"
import { LayoutGrid, PlusCircle, Loader2 } from "lucide-react"
import { useConfigMesas } from "../_hooks/use-config-mesas"
import { MesaCard } from "../_components/mesa-card"
import { MesaDialog } from "../_components/mesa-dialog"
import { EliminarDialogs } from "../_components/eliminar-dialogs"

export default function PaginaInventarioMesas() {
  const {
    isMounted,
    isGlobalLoading,
    loading,
    tarifasConDocId,
    mesasConDocId,
    isMesaModalOpen,
    setIsMesaModalOpen,
    mesaToDelete,
    setMesaToDelete,
    editingMesa,
    mesaForm,
    setMesaForm,
    handleMesaSubmit,
    handleDeleteMesa,
    abrirNuevaMesa,
    abrirEditarMesa,
  } = useConfigMesas()

  if (!isMounted) return null

  return (
    <div className="space-y-6 pb-2">
      <PageHeader
        title="Inventario de Estaciones"
        description="Añade o edita las mesas de billar y consolas de juego de tu local."
        icon={LayoutGrid}
        action={
          <Button
            onClick={abrirNuevaMesa}
            size="sm"
            className="rounded-full bg-sky-600 hover:bg-sky-500 text-white font-bold h-9"
          >
            <PlusCircle className="mr-1.5 h-4 w-4" />
            Nueva Estación
          </Button>
        }
      />

      {isGlobalLoading ? (
        <div className="flex items-center justify-center h-64 text-slate-400">
          <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
        </div>
      ) : (
        <SurfaceCard variant="panel" className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#2e2e2e]">
            <div>
              <h2 className="text-base font-bold text-white">Estaciones Registradas</h2>
              <p className="text-xs text-slate-400">Catálogo de mesas activas con su tarifa vinculada.</p>
            </div>
          </div>

          {mesasConDocId.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-[#2e2e2e] rounded-xl bg-[#252526]/40">
              <p className="text-slate-400 text-sm">No hay estaciones registradas aún.</p>
              <Button
                onClick={abrirNuevaMesa}
                size="sm"
                className="rounded-full mt-3 bg-sky-600 hover:bg-sky-500 text-white font-bold"
              >
                <PlusCircle className="mr-1.5 h-4 w-4" />
                Añadir Primera Estación
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mesasConDocId.map((mesa) => (
                <MesaCard
                  key={mesa.docId}
                  mesa={mesa}
                  tarifas={tarifasConDocId}
                  onEdit={abrirEditarMesa}
                  onDelete={setMesaToDelete}
                />
              ))}
            </div>
          )}
        </SurfaceCard>
      )}

      <MesaDialog
        isOpen={isMesaModalOpen}
        onOpenChange={setIsMesaModalOpen}
        editingMesa={editingMesa}
        mesaForm={mesaForm}
        setMesaForm={setMesaForm}
        tarifas={tarifasConDocId}
        onSubmit={handleMesaSubmit}
        loading={loading}
      />

      <EliminarDialogs
        tarifaToDelete={null}
        mesaToDelete={mesaToDelete}
        onCancelTarifa={() => {}}
        onConfirmTarifa={() => {}}
        onCancelMesa={() => setMesaToDelete(null)}
        onConfirmMesa={handleDeleteMesa}
      />
    </div>
  )
}
