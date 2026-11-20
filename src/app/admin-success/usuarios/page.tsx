'use client'

import { PageHeader, ModalConfirmacion, BotonVolverArriba } from "@/components/comunes"
import { Button } from "@/components/ui/button"
import { UserCheck, PlusCircle, Trash2 } from "lucide-react"
import { DialogoCambiarPassword } from "@/components/usuarios/DialogoCambiarPassword"
import { useUsuariosMaestro } from "./_hooks/use-usuarios-maestro"
import { ListaUsuariosMaestro } from "./_components/ListaUsuariosMaestro"
import { ModalUsuarioMaestro } from "./_components/ModalUsuarioMaestro"

export default function PaginaUsuariosMaestro() {
  const {
    isMounted,
    isLoading,
    isLoadingSucursales,
    isLoadingRoles,
    sucursales,
    roles,
    selectedSucursalId,
    setSelectedSucursalId,
    selectedSucursalNombre,
    filteredUsuarios,
    conteos,
    searchTerm,
    setSearchTerm,
    filtroAcceso,
    setFiltroAcceso,
    isModalOpen,
    editingUser,
    userToDelete,
    setUserToDelete,
    usuarioParaPassword,
    setUsuarioParaPassword,
    modalPasswordOpen,
    setModalPasswordOpen,
    loading,
    form,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleDeleteUser,
  } = useUsuariosMaestro()

  if (!isMounted) return null

  return (
    <div className="space-y-4 sm:space-y-6 font-body pb-4">
      <PageHeader
        title="Gestión de Usuarios (Maestro)"
        description="Administra el personal con acceso al sistema de todas las sucursales."
        icon={UserCheck}
        action={
          selectedSucursalId ? (
            <Button
              onClick={() => handleOpenModal(null)}
              className="w-full sm:w-auto rounded-full h-9 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md flex items-center justify-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Añadir Usuario
            </Button>
          ) : undefined
        }
      />

      <ListaUsuariosMaestro
        usuarios={filteredUsuarios}
        sucursales={sucursales}
        selectedSucursalId={selectedSucursalId}
        selectedSucursalNombre={selectedSucursalNombre}
        onSucursalChange={setSelectedSucursalId}
        isLoadingSucursales={isLoadingSucursales}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filtroAcceso={filtroAcceso}
        onFiltroAccesoChange={setFiltroAcceso}
        conteos={conteos}
        onEditar={handleOpenModal}
        onEliminar={setUserToDelete}
        onCambiarPassword={(u) => {
          setUsuarioParaPassword(u)
          setModalPasswordOpen(true)
        }}
      />

      <ModalUsuarioMaestro
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingUser={editingUser}
        selectedSucursalId={selectedSucursalId}
        sucursales={sucursales}
        roles={roles}
        isLoadingRoles={isLoadingRoles}
        loading={loading}
        onSubmit={handleSubmit}
        form={form}
      />

      <ModalConfirmacion
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
        tipo="destructivo"
        swalTipo="error"
        titulo="¿Eliminar usuario?"
        subtitulo={`Esta acción eliminará a "${userToDelete?.nombre || ''}" de la sucursal seleccionada. Su cuenta de autenticación global no será eliminada.`}
        textoCancelar="Cancelar"
        textoConfirmar="Sí, eliminar"
        iconoConfirmar={Trash2}
        procesando={loading}
        onConfirmar={handleDeleteUser}
      />

      <DialogoCambiarPassword
        usuario={usuarioParaPassword}
        abierto={modalPasswordOpen}
        onOpenChange={setModalPasswordOpen}
      />

      <BotonVolverArriba threshold={150} />
    </div>
  )
}
