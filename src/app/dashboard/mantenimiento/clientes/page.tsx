'use client';

import { BotonVolverArriba } from '@/components/comunes';
import { EncabezadoClientes } from './_components/encabezado-clientes';
import { ListaClientes } from './_components/lista-clientes';
import { ModalCliente } from './_components/modal-cliente';
import { DialogoEliminarCliente } from './_components/dialogo-eliminar-cliente';
import { useClientes } from './_hooks/use-clientes';

/**
 * Página de mantenimiento de clientes y proveedores de la sucursal.
 */
export default function PaginaClientes() {
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
    editingCustomer,
    setEditingCustomer,
    customerToDelete,
    setCustomerToDelete,
    formData,
    setFormData,
    paginatedCustomers,
    totalItems,
    cargando,
    handleSubmit,
    handleDelete,
  } = useClientes();

  if (!isMounted) return null;

  return (
    <div className="space-y-4 font-body pb-10">
      <EncabezadoClientes
        onNuevoCliente={() => {
          setEditingCustomer(null);
          setIsModalOpen(true);
        }}
      />

      <ListaClientes
        clientes={paginatedCustomers}
        totalItems={totalItems}
        cargando={cargando}
        terminoBusqueda={searchTerm}
        onSearchChange={setSearchTerm}
        orden={sortOrder}
        onSortOrderChange={setSortOrder}
        onEditar={setEditingCustomer}
        onEliminar={setCustomerToDelete}
        paginacion={{
          paginaActual: currentPage,
          itemsPorPagina: itemsPerPage,
          totalPaginas: totalPages,
          onPaginaChange: setCurrentPage,
          onItemsPorPaginaChange: setItemsPerPage,
        }}
      />

      <ModalCliente
        abierto={isModalOpen || !!editingCustomer}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
        }}
        editando={!!editingCustomer}
        onSubmit={handleSubmit}
        procesando={loading}
        form={{
          ...formData,
          setNombre: (v) => setFormData((prev) => ({ ...prev, nombre: v })),
          setTelefono: (v) => setFormData((prev) => ({ ...prev, telefono: v })),
          setTipoCliente: (v) => setFormData((prev) => ({ ...prev, tipoCliente: v })),
          setConsumoInterno: (v) => setFormData((prev) => ({ ...prev, consumoInterno: v })),
          setPinConsumoInterno: (v) =>
            setFormData((prev) => ({ ...prev, pinConsumoInterno: v })),
          setPermiteCredito: (v) => setFormData((prev) => ({ ...prev, permiteCredito: v })),
        }}
      />

      <DialogoEliminarCliente
        cliente={customerToDelete}
        abierto={!!customerToDelete}
        onOpenChange={(o) => !o && setCustomerToDelete(null)}
        onConfirmar={handleDelete}
        procesando={loading}
      />

      <BotonVolverArriba />
    </div>
  );
}
