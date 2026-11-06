'use client'

import { EncabezadoProductos } from "./_components/EncabezadoProductos"
import { ListaProductos } from "./_components/ListaProductos"
import { ModalProducto } from "./_components/ModalProducto"
import { DialogoEliminarProducto } from "./_components/DialogoEliminarProducto"
import { useCatalogoProductos } from "./_hooks/use-catalogo-productos"

export default function PaginaCatalogoProductos() {
  const {
    isMounted,
    cargando,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    ubicacionFiltro,
    setUbicacionFiltro,
    ubicacionesDisponibles,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    paginatedProducts,
    productosConDocId,
    isModalOpen,
    setIsModalOpen,
    editingProduct,
    setEditingProduct,
    productToDelete,
    setProductToDelete,
    loading,
    form,
    resetForm,
    handleSubmit,
    handleDelete,
  } = useCatalogoProductos()

  if (!isMounted) return null

  return (
    <div className="space-y-6 pb-20">
      <EncabezadoProductos onNuevoProducto={() => { resetForm(); setIsModalOpen(true); }} />

      <ListaProductos
        productos={paginatedProducts}
        cargando={cargando}
        terminoBusqueda={searchTerm}
        onSearchChange={setSearchTerm}
        orden={sortOrder}
        onSortOrderChange={setSortOrder}
        ubicacionFiltro={ubicacionFiltro}
        onUbicacionFiltroChange={setUbicacionFiltro}
        ubicacionesDisponibles={ubicacionesDisponibles}
        onEditar={setEditingProduct}
        onEliminar={setProductToDelete}
        paginacion={{
          paginaActual: currentPage,
          itemsPorPagina: itemsPerPage,
          totalPaginas: totalPages,
          onPaginaChange: setCurrentPage,
          onItemsPorPaginaChange: setItemsPerPage
        }}
      />

      <ModalProducto
        abierto={isModalOpen || !!editingProduct}
        onClose={() => { setIsModalOpen(false); setEditingProduct(null); }}
        editando={!!editingProduct}
        onSubmit={handleSubmit}
        procesando={loading}
        productosParaIngredientes={productosConDocId}
        form={form}
      />

      <DialogoEliminarProducto
        producto={productToDelete}
        abierto={!!productToDelete}
        onOpenChange={(o) => !o && setProductToDelete(null)}
        onConfirmar={handleDelete}
        procesando={loading}
      />
    </div>
  )
}
