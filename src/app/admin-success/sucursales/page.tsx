'use client'

import { PageHeader, SurfaceCard, PillTabs, ModalConfirmacion, BotonVolverArriba } from "@/components/comunes"
import { Button } from "@/components/ui/button"
import { Building, PlusCircle, Loader2, ShieldCheck, Trash2, Layers, Volume2, VolumeX } from "lucide-react"
import { useSucursalesAdmin } from "./_hooks/use-sucursales-admin"
import { ModalSucursal } from "./_components/ModalSucursal"
import { SucursalCard } from "./_components/SucursalCard"

export default function PaginaSucursales() {
  const {
    isMounted,
    isLoading,
    hasPermissionError,
    filteredSucursales,
    conteos,
    searchTerm,
    setSearchTerm,
    filtroVoz,
    setFiltroVoz,
    isModalOpen,
    editingSucursal,
    sucursalToDelete,
    setSucursalToDelete,
    formState,
    setFormState,
    loading,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleDeleteSucursal,
    handleLoginAsSucursal,
    handleToggleVoice,
  } = useSucursalesAdmin();

  if (!isMounted) return null;

  return (
    <div className="space-y-4 sm:space-y-6 font-body pb-4">
      <PageHeader
        title="Gestión de Sucursales"
        description="Añade, edita y administra las locaciones de tu negocio."
        icon={Building}
        action={
          !hasPermissionError ? (
            <Button
              onClick={() => handleOpenModal(null)}
              className="w-full sm:w-auto rounded-full h-9 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md flex items-center justify-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Añadir Sucursal
            </Button>
          ) : undefined
        }
      />

      <SurfaceCard variant="panel" className="p-4 sm:p-5 space-y-4">
        <PillTabs
          value={filtroVoz}
          onValueChange={(v) => setFiltroVoz(v as 'todas' | 'con-voz' | 'sin-voz')}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Buscar sucursal por nombre o dirección..."
          collapsibleMobileTabs
          tabs={[
            {
              id: 'todas',
              label: 'Todas',
              icon: Layers,
              count: conteos.todas,
              badgeVariant: filtroVoz === 'todas' ? 'white' : 'slate',
            },
            {
              id: 'con-voz',
              label: 'Con voz',
              icon: Volume2,
              count: conteos.conVoz,
              badgeVariant: filtroVoz === 'con-voz' ? 'white' : 'emerald',
            },
            {
              id: 'sin-voz',
              label: 'Sin voz',
              icon: VolumeX,
              count: conteos.sinVoz,
              badgeVariant: filtroVoz === 'sin-voz' ? 'white' : 'amber',
            },
          ]}
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-3 text-slate-400">
            <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
            <span className="text-xs">Cargando sucursales...</span>
          </div>
        ) : hasPermissionError ? (
          <div className="flex flex-col items-center justify-center text-center p-10 rounded-xl border border-dashed border-rose-500/30 bg-rose-500/10">
            <ShieldCheck className="h-10 w-10 mb-3 text-rose-400" />
            <p className="font-bold text-base text-rose-200">Acceso Denegado</p>
            <p className="text-xs text-rose-300/80 max-w-sm mt-1">
              No tienes los permisos necesarios para gestionar las sucursales del sistema.
            </p>
          </div>
        ) : filteredSucursales.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSucursales.map((sucursal) => (
              <SucursalCard
                key={sucursal.docId}
                sucursal={sucursal}
                onIngresar={handleLoginAsSucursal}
                onEditar={handleOpenModal}
                onEliminar={setSucursalToDelete}
                onToggleVoice={handleToggleVoice}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-12 border border-dashed border-[#2e2e2e] rounded-xl bg-[#252526]/50 px-4">
            <Building className="h-10 w-10 mb-3 text-slate-500" />
            <p className="font-semibold text-base text-slate-200">
              {searchTerm || filtroVoz !== 'todas' ? 'Sin resultados' : 'No hay sucursales'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {searchTerm || filtroVoz !== 'todas'
                ? 'Prueba ajustando los filtros o el término de búsqueda.'
                : "Haz clic en 'Añadir Sucursal' para registrar tu primera locación."}
            </p>
          </div>
        )}
      </SurfaceCard>

      <ModalSucursal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingSucursal={editingSucursal}
        formState={formState}
        setFormState={setFormState}
        onSubmit={handleSubmit}
        loading={loading}
      />

      <ModalConfirmacion
        open={!!sucursalToDelete}
        onOpenChange={(open) => !open && setSucursalToDelete(null)}
        tipo="destructivo"
        swalTipo="error"
        titulo="¿Eliminar sucursal?"
        subtitulo={`Esta acción es definitiva. Se borrarán permanentemente todos los datos de "${sucursalToDelete?.nombre || ''}", incluyendo inventarios, ventas y personal.`}
        textoCancelar="Volver"
        textoConfirmar="Sí, eliminar todo"
        iconoConfirmar={Trash2}
        procesando={loading}
        onConfirmar={handleDeleteSucursal}
      />

      <BotonVolverArriba threshold={150} />
    </div>
  )
}
