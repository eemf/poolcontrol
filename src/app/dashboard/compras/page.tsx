'use client';

import React from 'react';
import { BotonVolverArriba } from '@/components/comunes';
import { useCompras } from './_hooks/use-compras';
import { PurchaseHeader } from './_components/purchase-header';
import { PurchaseList } from './_components/purchase-list';
import { PurchaseModal } from './_components/purchase-modal';
import { DeleteConfirmDialog } from './_components/delete-confirm-dialog';

export default function PaginaCompras() {
  const {
    isLoading,
    loading,
    isModalOpen,
    setIsModalOpen,
    editingCompra,
    compraToDelete,
    setCompraToDelete,
    proveedorSeleccionadoId,
    setProveedorSeleccionadoId,
    itemsEnCompra,
    setItemsEnCompra,
    searchTerm,
    setSearchTerm,
    mostrarTodas,
    setMostrarTodas,
    totalPendientes,
    totalCompras,
    paginatedCompras,
    filteredCompras,
    proveedores,
    productosConDocId,
    comprasConDocId,
    pagination,
    handleNew,
    handleEdit,
    handleCrearProveedor,
    handleSubmit,
    handleDeleteConfirm,
  } = useCompras();

  return (
    <div className="space-y-4 font-body pb-2">
      <PurchaseHeader onNewPurchase={handleNew} />

      <PurchaseList
        compras={paginatedCompras}
        totalPendientes={totalPendientes}
        totalCompras={totalCompras}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        mostrarTodas={mostrarTodas}
        onMostrarTodasChange={setMostrarTodas}
        onEdit={handleEdit}
        onDelete={setCompraToDelete}
        totalItems={filteredCompras.length}
        pagination={pagination}
      />

      <PurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isEditing={!!editingCompra}
        onSubmit={handleSubmit}
        loading={loading}
        proveedorSeleccionadoId={proveedorSeleccionadoId}
        setProveedorSeleccionadoId={setProveedorSeleccionadoId}
        itemsEnCompra={itemsEnCompra}
        setItemsEnCompra={setItemsEnCompra}
        proveedorOptions={proveedores.map((p) => ({ value: p.docId, label: p.nombre }))}
        productoOptions={productosConDocId.map((p) => ({
          value: p.docId,
          label: p.nombre,
          description: `Stock: ${p.existencia}`,
        }))}
        productos={productosConDocId}
        compras={comprasConDocId}
        editingCompraId={editingCompra?.docId}
        onCrearProveedor={handleCrearProveedor}
      />

      <DeleteConfirmDialog
        compra={compraToDelete}
        isOpen={!!compraToDelete}
        onOpenChange={(o) => !o && setCompraToDelete(null)}
        onConfirm={handleDeleteConfirm}
        loading={loading}
      />

      <BotonVolverArriba />
    </div>
  );
}
