'use client'

import { BotonVolverArriba } from "@/components/comunes"
import { EncabezadoUsuarios } from "./_components/EncabezadoUsuarios"
import { ListaUsuarios } from "./_components/ListaUsuarios"
import { ModalUsuario } from "./_components/ModalUsuario"
import { DialogoEliminarUsuario } from "./_components/DialogoEliminarUsuario"
import { DialogoCambiarPassword } from "@/components/usuarios/DialogoCambiarPassword"
import { useUsuariosSucursal } from "./_hooks/use-usuarios-sucursal"

export default function PaginaUsuariosSucursal() {
  const {
    isMounted,
    cargando,
    errorPermisos,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    totalItems,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    paginatedUsuarios,
    isModalOpen,
    setIsModalOpen,
    editingUser,
    setEditingUser,
    userToDelete,
    setUserToDelete,
    usuarioParaPassword,
    setUsuarioParaPassword,
    modalPasswordOpen,
    setModalPasswordOpen,
    loading,
    roles,
    form,
    resetForm,
    handleSubmit,
    handleDelete,
  } = useUsuariosSucursal()

  if (!isMounted) return null

  return (
    <div className="space-y-4 sm:space-y-6 pb-2">
      <EncabezadoUsuarios
        onNuevoUsuario={() => { resetForm(); setIsModalOpen(true); }}
        deshabilitado={errorPermisos}
      />

      <ListaUsuarios
        usuarios={paginatedUsuarios}
        totalItems={totalItems}
        cargando={cargando}
        terminoBusqueda={searchTerm}
        onSearchChange={setSearchTerm}
        orden={sortOrder}
        onSortOrderChange={setSortOrder}
        onEditar={setEditingUser}
        onEliminar={setUserToDelete}
        onCambiarPassword={(u) => {
          setUsuarioParaPassword(u)
          setModalPasswordOpen(true)
        }}
        errorPermisos={errorPermisos}
        paginacion={{
          paginaActual: currentPage,
          itemsPorPagina: itemsPerPage,
          totalPaginas: totalPages,
          onPaginaChange: setCurrentPage,
          onItemsPorPaginaChange: setItemsPerPage
        }}
      />

      <ModalUsuario
        abierto={isModalOpen || !!editingUser}
        onClose={() => { setIsModalOpen(false); setEditingUser(null); }}
        editando={!!editingUser}
        onSubmit={handleSubmit}
        procesando={loading}
        roles={roles || []}
        form={form}
      />

      <DialogoCambiarPassword
        usuario={usuarioParaPassword}
        abierto={modalPasswordOpen}
        onOpenChange={setModalPasswordOpen}
      />

      <DialogoEliminarUsuario
        usuario={userToDelete}
        abierto={!!userToDelete}
        onOpenChange={(o) => !o && setUserToDelete(null)}
        onConfirmar={handleDelete}
        procesando={loading}
      />

      <BotonVolverArriba threshold={150} />
    </div>
  )
}
