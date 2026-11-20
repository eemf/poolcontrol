'use client';

import { BotonVolverArriba } from '@/components/comunes';
import { EncabezadoProductosVirtuales } from './_components/EncabezadoProductosVirtuales';
import { ListaProductosVirtuales } from './_components/ListaProductosVirtuales';
import { ModalProductoVirtual } from './_components/ModalProductoVirtual';
import { DialogoEliminarProductoVirtual } from './_components/DialogoEliminarProductoVirtual';
import { useProductosVirtuales } from './_hooks/use-productos-virtuales';

/**
 * Página de mantenimiento del catálogo de productos virtuales de la sucursal.
 */
export default function PaginaProductosVirtuales() {
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
    editingProduct,
    setEditingProduct,
    productToDelete,
    setProductToDelete,
    paginatedProducts,
    totalItems,
    cargando,
    form,
    handleSubmit,
    handleDelete,
  } = useProductosVirtuales();

  if (!isMounted) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <EncabezadoProductosVirtuales
        onNuevoProducto={() => {
          setEditingProduct(null);
          setIsModalOpen(true);
        }}
      />

      <ListaProductosVirtuales
        productos={paginatedProducts}
        totalItems={totalItems}
        cargando={cargando}
        terminoBusqueda={searchTerm}
        onSearchChange={setSearchTerm}
        orden={sortOrder}
        onSortOrderChange={setSortOrder}
        onEditar={setEditingProduct}
        onEliminar={setProductToDelete}
        paginacion={{
          paginaActual: currentPage,
          itemsPorPagina: itemsPerPage,
          totalPaginas: totalPages,
          onPaginaChange: setCurrentPage,
          onItemsPorPaginaChange: setItemsPerPage,
        }}
      />

      <ModalProductoVirtual
        abierto={isModalOpen || !!editingProduct}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        editando={!!editingProduct}
        onSubmit={handleSubmit}
        procesando={loading}
        form={form}
      />

      <DialogoEliminarProductoVirtual
        producto={productToDelete}
        abierto={!!productToDelete}
        onOpenChange={(o) => !o && setProductToDelete(null)}
        onConfirmar={handleDelete}
        procesando={loading}
      />

      <BotonVolverArriba threshold={150} />
    </div>
  );
}
