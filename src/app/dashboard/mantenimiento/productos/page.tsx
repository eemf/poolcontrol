'use client'

import { BotonVolverArriba } from "@/components/comunes"
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
    agregarUbicacion,
    eliminarUbicacion,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    totalItems,
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
    <div className="space-y-4 font-body pb-10">
      <EncabezadoProductos onNuevoProducto={() => { resetForm(); setIsModalOpen(true); }} />

      <ListaProductos
        productos={paginatedProducts}
        totalItems={totalItems}
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
        ubicacionesDisponibles={ubicacionesDisponibles}
        onAgregarUbicacion={agregarUbicacion}
        onEliminarUbicacion={eliminarUbicacion}
        form={form}
      />

      <DialogoEliminarProducto
        producto={productToDelete}
        abierto={!!productToDelete}
        onOpenChange={(o) => !o && setProductToDelete(null)}
        onConfirmar={handleDelete}
        procesando={loading}
      />

      <BotonVolverArriba />
    </div>
  )
}
