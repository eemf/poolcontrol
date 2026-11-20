'use client';

import { BotonVolverArriba } from '@/components/comunes';
import { EncabezadoGastos } from './_components/encabezado-gastos';
import { ListaGastos } from './_components/lista-gastos';
import { ModalGasto } from './_components/modal-gasto';
import { DialogoEliminarGasto } from './_components/dialogo-eliminar-gasto';
import { useGastos } from './_hooks/use-gastos';

/**
 * Página de administración de gastos operativos de la sucursal.
 */
export default function PaginaGastos() {
  const {
    isModalOpen,
    setIsModalOpen,
    loading,
    mostrarTodos,
    setMostrarTodos,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    editingGasto,
    gastoToDelete,
    setGastoToDelete,
    descripcion,
    setDescripcion,
    monto,
    setMonto,
    paginatedGastos,
    totalItems,
    totalPendientes,
    totalTodos,
    cargando,
    handleOpenEdit,
    handleNuevoGasto,
    handleSubmit,
    handleDelete,
  } = useGastos();

  return (
    <div className="space-y-4 font-body pb-10">
      <EncabezadoGastos onNuevoGasto={handleNuevoGasto} />

      <ListaGastos
        gastos={paginatedGastos}
        totalItems={totalItems}
        totalPendientes={totalPendientes}
        totalTodos={totalTodos}
        cargando={cargando}
        terminoBusqueda={searchTerm}
        onTerminoBusquedaChange={setSearchTerm}
        mostrarTodos={mostrarTodos}
        onMostrarTodosChange={setMostrarTodos}
        onEditar={handleOpenEdit}
        onEliminar={setGastoToDelete}
        paginacion={{
          paginaActual: currentPage,
          itemsPorPagina: itemsPerPage,
          totalPaginas: totalPages,
          onPaginaChange: setCurrentPage,
          onItemsPorPaginaChange: setItemsPerPage,
        }}
      />

      <ModalGasto
        abierto={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editando={!!editingGasto}
        onSubmit={handleSubmit}
        procesando={loading}
        descripcion={descripcion}
        setDescripcion={setDescripcion}
        monto={monto}
        setMonto={setMonto}
      />

      <DialogoEliminarGasto
        gasto={gastoToDelete}
        abierto={!!gastoToDelete}
        onOpenChange={(o) => !o && setGastoToDelete(null)}
        onConfirmar={handleDelete}
        procesando={loading}
      />

      <BotonVolverArriba />
    </div>
  );
}
