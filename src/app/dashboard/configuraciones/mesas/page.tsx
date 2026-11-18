'use client'

import { useState } from "react"
import { PageHeader } from "@/components/comunes/page-header"
import { PillTabs } from "@/components/comunes/pill-tabs"
import { SurfaceCard } from "@/components/comunes/surface-card"
import { Button } from "@/components/ui/button"
import { LayoutGrid, DollarSign, PlusCircle, Loader2 } from "lucide-react"
import { useConfigMesas } from "./_hooks/use-config-mesas"
import { TarifaCard } from "./_components/tarifa-card"
import { MesaCard } from "./_components/mesa-card"
import { TarifaDialog } from "./_components/tarifa-dialog"
import { MesaDialog } from "./_components/mesa-dialog"
import { EliminarDialogs } from "./_components/eliminar-dialogs"

export default function PaginaConfiguracionMesasUnificada() {
  const [tab, setTab] = useState<'mesas' | 'tarifas'>('mesas')
  const {
    isMounted,
    isGlobalLoading,
    loading,
    tarifasConDocId,
    mesasConDocId,
    isTarifaModalOpen,
    setIsTarifaModalOpen,
    isMesaModalOpen,
    setIsMesaModalOpen,
    tarifaToDelete,
    setTarifaToDelete,
    mesaToDelete,
    setMesaToDelete,
    editingTarifa,
    editingMesa,
    tarifaForm,
    setTarifaForm,
    mesaForm,
    setMesaForm,
    nuevoIntervalo,
    setNuevoIntervalo,
    handleTarifaSubmit,
    handleDeleteTarifa,
    handleAddIntervalo,
    handleRemoveIntervalo,
    handleMesaSubmit,
    handleDeleteMesa,
    abrirNuevaTarifa,
    abrirEditarTarifa,
    abrirNuevaMesa,
    abrirEditarMesa,
  } = useConfigMesas()

  if (!isMounted) return null

  return (
    <div className="space-y-6 pb-2">
      <PageHeader
        title="Configuración de Estaciones"
        description="Administra las tarifas y el inventario de estaciones (Mesas de Billar y Consolas)."
        icon={LayoutGrid}
        action={
          <div className="flex items-center gap-2">
            {tab === 'mesas' ? (
              <Button onClick={abrirNuevaMesa} size="sm" className="rounded-full bg-sky-600 hover:bg-sky-500 text-white font-bold h-9">
                <PlusCircle className="mr-1.5 h-4 w-4" />
                Nueva Estación
              </Button>
            ) : (
              <Button onClick={abrirNuevaTarifa} size="sm" className="rounded-full bg-sky-600 hover:bg-sky-500 text-white font-bold h-9">
                <PlusCircle className="mr-1.5 h-4 w-4" />
                Nueva Tarifa
              </Button>
            )}
          </div>
        }
      />

      {/* Pestañas de Navegación Oficiales */}
      <PillTabs
        value={tab}
        onValueChange={(val) => setTab(val as 'mesas' | 'tarifas')}
        tabs={[
          {
            id: 'mesas',
            label: 'Estaciones',
            icon: LayoutGrid,
            count: mesasConDocId.length,
            badgeVariant: 'sky',
          },
          {
            id: 'tarifas',
            label: 'Tarifas',
            icon: DollarSign,
            count: tarifasConDocId.length,
            badgeVariant: 'amber',
          },
        ]}
      />

      {isGlobalLoading ? (
        <div className="flex items-center justify-center h-64 text-slate-400">
          <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
        </div>
      ) : tab === 'mesas' ? (
        <SurfaceCard variant="panel" className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#2e2e2e]">
            <div>
              <h2 className="text-base font-bold text-white">Inventario de Estaciones</h2>
              <p className="text-xs text-slate-400">Mesas de billar pool, carambola y consolas de videojuegos registradas.</p>
            </div>
          </div>

          {mesasConDocId.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-[#2e2e2e] rounded-xl bg-[#252526]/40">
              <p className="text-slate-400 text-sm">No hay estaciones registradas aún.</p>
              <Button onClick={abrirNuevaMesa} size="sm" className="rounded-full mt-3 bg-sky-600 hover:bg-sky-500 text-white">
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
      ) : (
        <SurfaceCard variant="panel" className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#2e2e2e]">
            <div>
              <h2 className="text-base font-bold text-white">Tarifas de Cobro</h2>
              <p className="text-xs text-slate-400">Reglas de facturación por minuto, intervalos y controles adicionales.</p>
            </div>
          </div>

          {tarifasConDocId.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-[#2e2e2e] rounded-xl bg-[#252526]/40">
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

      {/* Modales y Diálogos */}
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
        tarifaToDelete={tarifaToDelete}
        mesaToDelete={mesaToDelete}
        onCancelTarifa={() => setTarifaToDelete(null)}
        onConfirmTarifa={handleDeleteTarifa}
        onCancelMesa={() => setMesaToDelete(null)}
        onConfirmMesa={handleDeleteMesa}
      />
    </div>
  )
}
