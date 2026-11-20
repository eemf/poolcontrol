'use client'

import { useMemo, useState } from "react"
import { PageHeader, SurfaceCard, PillTabs, BotonVolverArriba } from "@/components/comunes"
import { Button } from "@/components/ui/button"
import { Dices, PlusCircle, Loader2, Layers, CheckCircle2, Wrench, Ban } from "lucide-react"
import { useConfigTragamonedas } from "./_hooks/use-config-tragamonedas"
import { TragamonedasCard } from "./_components/tragamonedas-card"
import { TragamonedasDialog } from "./_components/tragamonedas-dialog"
import { EliminarMaquinaDialog } from "./_components/eliminar-maquina-dialog"

/**
 * Página de configuración de máquinas tragamonedas de la sucursal.
 * Permite filtrar por estado, buscar por nombre o modelo y administrar altas, ediciones y bajas.
 */
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

  const [estadoFiltro, setEstadoFiltro] = useState<'todas' | 'activo' | 'mantenimiento' | 'inactivo'>('todas')
  const [searchTerm, setSearchTerm] = useState('')

  // Filtrado combinado por estado operativo y término de búsqueda
  const maquinasFiltradas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return maquinasConDocId.filter((m) => {
      const matchEstado = estadoFiltro === 'todas' || m.estado === estadoFiltro
      const matchTerm =
        !term ||
        (m.nombre || '').toLowerCase().includes(term) ||
        (m.modelo || '').toLowerCase().includes(term)
      return matchEstado && matchTerm
    })
  }, [maquinasConDocId, estadoFiltro, searchTerm])

  const conteos = useMemo(() => ({
    todas: maquinasConDocId.length,
    activo: maquinasConDocId.filter((m) => m.estado === 'activo').length,
    mantenimiento: maquinasConDocId.filter((m) => m.estado === 'mantenimiento').length,
    inactivo: maquinasConDocId.filter((m) => m.estado === 'inactivo').length,
  }), [maquinasConDocId])

  if (!isMounted) return null

  if (error) {
    return (
      <div className="text-center text-rose-300 p-6 bg-[#1e1e1e] rounded-xl border border-rose-500/30">
        <p className="text-sm font-medium">No tienes los permisos necesarios para realizar estas operaciones.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-2">
      <PageHeader
        title="Configuración de Tragamonedas"
        description="Administra el inventario de máquinas tragamonedas de tu negocio."
        icon={Dices}
        action={
          <Button
            onClick={() => handleOpenModal(null)}
            className="w-full sm:w-auto rounded-full h-9 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md flex items-center justify-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Nueva Máquina
          </Button>
        }
      />

      <SurfaceCard variant="panel" className="p-4 sm:p-5 space-y-4 font-body">
        <PillTabs
          value={estadoFiltro}
          onValueChange={(v) => setEstadoFiltro(v as 'todas' | 'activo' | 'mantenimiento' | 'inactivo')}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Buscar máquina por nombre o modelo..."
          collapsibleMobileTabs
          tabs={[
            { id: 'todas', label: 'Todas', icon: Layers, count: conteos.todas, badgeVariant: estadoFiltro === 'todas' ? 'white' : 'slate' },
            { id: 'activo', label: 'Activas', icon: CheckCircle2, count: conteos.activo, badgeVariant: estadoFiltro === 'activo' ? 'white' : 'emerald' },
            { id: 'mantenimiento', label: 'Mant.', icon: Wrench, count: conteos.mantenimiento, badgeVariant: estadoFiltro === 'mantenimiento' ? 'white' : 'amber' },
            { id: 'inactivo', label: 'Inactivas', icon: Ban, count: conteos.inactivo, badgeVariant: estadoFiltro === 'inactivo' ? 'white' : 'slate' },
          ]}
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-3 text-slate-400">
            <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
            <span className="text-xs">Cargando máquinas...</span>
          </div>
        ) : maquinasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-slate-400 py-12 border border-dashed border-[#2e2e2e] rounded-xl bg-[#252526]/50 px-4">
            <Dices className="h-10 w-10 mb-3 text-slate-500" />
            <p className="font-semibold text-base text-slate-200">
              {searchTerm || estadoFiltro !== 'todas' ? 'Sin resultados' : 'No hay máquinas registradas'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {searchTerm || estadoFiltro !== 'todas'
                ? 'Prueba ajustando el filtro o el término de búsqueda.'
                : 'Agrega tu primera máquina tragamonedas al inventario.'}
            </p>
            {!searchTerm && estadoFiltro === 'todas' && (
              <Button
                onClick={() => handleOpenModal(null)}
                className="rounded-full h-9 px-4 text-xs font-semibold mt-4 bg-sky-600 hover:bg-sky-500 text-white"
              >
                <PlusCircle className="mr-1.5 h-4 w-4" />
                Añadir Primera Máquina
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {maquinasFiltradas.map((maquina) => (
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

      <TragamonedasDialog
        isOpen={isModalOpen}
        onOpenChange={(open) => !open ? handleCloseModal() : setIsModalOpen(true)}
        editingMaquina={editingMaquina}
        formState={formState}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        loading={loading}
      />

      <EliminarMaquinaDialog
        maquinaToDelete={maquinaToDelete}
        onCancel={() => setMaquinaToDelete(null)}
        onConfirm={handleDeleteMaquina}
      />

      <BotonVolverArriba threshold={150} />
    </div>
  )
}
