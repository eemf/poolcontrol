'use client';

import { BotonVolverArriba } from '@/components/comunes';
import { EncabezadoRoles } from './_components/EncabezadoRoles';
import { ListaRoles } from './_components/ListaRoles';
import { ModalRol } from './_components/ModalRol';
import { DialogoEliminarRol } from './_components/DialogoEliminarRol';
import { useRoles } from './_hooks/use-roles';

/**
 * Página de mantenimiento de roles de usuario de la sucursal.
 */
export default function PaginaRoles() {
  const {
    isMounted,
    isModalOpen,
    setIsModalOpen,
    loading,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    editingRol,
    setEditingRol,
    rolToDelete,
    setRolToDelete,
    paginatedRoles,
    totalItems,
    cargando,
    form,
    handleSubmit,
    handleDelete,
  } = useRoles();

  if (!isMounted) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <EncabezadoRoles
        onNuevoRol={() => {
          setEditingRol(null);
          setIsModalOpen(true);
        }}
      />

      <ListaRoles
        roles={paginatedRoles}
        totalItems={totalItems}
        cargando={cargando}
        terminoBusqueda={searchTerm}
        onSearchChange={setSearchTerm}
        orden={sortOrder}
        onSortOrderChange={setSortOrder}
        onEditar={setEditingRol}
        onEliminar={setRolToDelete}
        paginacion={{
          paginaActual: currentPage,
          itemsPorPagina: itemsPerPage,
          totalPaginas: totalPages,
          onPaginaChange: setCurrentPage,
          onItemsPorPaginaChange: setItemsPerPage,
        }}
      />

      <ModalRol
        abierto={isModalOpen || !!editingRol}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRol(null);
        }}
        editando={!!editingRol}
        onSubmit={handleSubmit}
        procesando={loading}
        form={form}
      />

      <DialogoEliminarRol
        rol={rolToDelete}
        abierto={!!rolToDelete}
        onOpenChange={(o) => !o && setRolToDelete(null)}
        onConfirmar={handleDelete}
        procesando={loading}
      />

      <BotonVolverArriba threshold={150} />
    </div>
  );
}
