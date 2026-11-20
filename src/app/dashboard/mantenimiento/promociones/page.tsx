'use client'

import { Trash2 } from 'lucide-react'
import { ModalConfirmacion, BotonVolverArriba } from '@/components/comunes'
import { usePromociones } from './_hooks/use-promociones'
import { EncabezadoPromociones } from './_components/EncabezadoPromociones'
import { ListaPromociones } from './_components/ListaPromociones'
import { ModalPromocion } from './_components/ModalPromocion'

/**
 * Página de mantenimiento de promociones, combos y descuentos por volumen de la sucursal.
 */
export default function PaginaPromociones() {
  const {
    isMounted,
    cargando,
    cargandoProductos,
    promociones,
    totalItems,
    conteos,
    searchTerm,
    setSearchTerm,
    filtroEstado,
    setFiltroEstado,
    filtroTipo,
    setFiltroTipo,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    productosElegibles,
    mapaProductos,
    isModalOpen,
    editingPromo,
    promoToDelete,
    setPromoToDelete,
    loading,
    form,
    setForm,
    abrirNuevaPromocion,
    abrirEditarPromocion,
    cerrarModal,
    handleSubmit,
    handleToggleActiva,
    handleDelete,
  } = usePromociones()

  if (!isMounted) return null

  return (
    <div className="space-y-4 sm:space-y-6 pb-2">
      <EncabezadoPromociones onNuevaPromocion={abrirNuevaPromocion} />

      <ListaPromociones
        promociones={promociones}
        totalItems={totalItems}
        cargando={cargando}
        conteos={conteos}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filtroEstado={filtroEstado}
        onFiltroEstadoChange={setFiltroEstado}
        filtroTipo={filtroTipo}
        onFiltroTipoChange={setFiltroTipo}
        mapaProductos={mapaProductos}
        onToggleActiva={handleToggleActiva}
        onEditar={abrirEditarPromocion}
        onEliminar={setPromoToDelete}
        paginacion={{
          paginaActual: currentPage,
          itemsPorPagina: itemsPerPage,
          totalPaginas: totalPages,
          onPaginaChange: setCurrentPage,
          onItemsPorPaginaChange: setItemsPerPage,
        }}
      />

      <ModalPromocion
        abierto={isModalOpen}
        onClose={cerrarModal}
        editando={!!editingPromo}
        onSubmit={handleSubmit}
        procesando={loading}
        form={form}
        setForm={setForm}
        productosElegibles={productosElegibles}
        cargandoProductos={cargandoProductos}
      />

      <ModalConfirmacion
        open={!!promoToDelete}
        onOpenChange={(o) => !o && setPromoToDelete(null)}
        tipo="destructivo"
        swalTipo="error"
        titulo="¿Eliminar promoción?"
        subtitulo={`Se eliminará permanentemente "${promoToDelete?.nombre || ''}". Los precios del catálogo no se verán afectados.`}
        textoCancelar="Cancelar"
        textoConfirmar="Sí, eliminar"
        iconoConfirmar={Trash2}
        procesando={loading}
        onConfirmar={handleDelete}
      />

      <BotonVolverArriba threshold={150} />
    </div>
  )
}

