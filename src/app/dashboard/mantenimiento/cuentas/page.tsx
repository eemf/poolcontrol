'use client'

import React from 'react'
import { PageHeader } from '@/components/comunes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BookUser, PlusCircle, Search, Loader2 } from 'lucide-react'
import { useMantenimientoCuentas } from './_hooks/use-mantenimiento-cuentas'
import { CuentaCard } from './_components/cuenta-card'
import { ModalCuenta } from './_components/modal-cuenta'
import { DialogoEliminarCuenta } from './_components/dialogo-eliminar-cuenta'

export default function CuentasPage() {
  const {
    cuentas,
    filteredCuentas,
    isLoading,
    isLoadingSucursal,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    setIsModalOpen,
    editingCuenta,
    cuentaToDelete,
    setCuentaToDelete,
    formState,
    setFormState,
    loading,
    handleOpenModal,
    handleSubmit,
    handleDelete,
  } = useMantenimientoCuentas()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cuentas Financieras"
        description="Administra las cuentas de efectivo y bancarias de tu negocio."
        icon={BookUser}
        action={
          <Button
            onClick={() => handleOpenModal(null)}
            className="rounded-full h-9 px-4 bg-sky-600 hover:bg-sky-500 text-white font-medium shadow-sm transition-all text-xs"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Cuenta
          </Button>
        }
      />

      {/* Barra de Filtro y Búsqueda */}
      <div className="bg-[#1e1e1e] p-3.5 rounded-2xl border border-[#2e2e2e] shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nombre o tipo..."
            className="pl-10 rounded-full h-9 bg-[#252526] border-[#2e2e2e] text-white placeholder:text-slate-400 text-xs focus:ring-1 focus:ring-sky-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid de Cuentas */}
      {isLoading || isLoadingSucursal ? (
        <div className="flex flex-col items-center justify-center h-52 bg-[#1e1e1e] rounded-2xl border border-[#2e2e2e]">
          <Loader2 className="h-8 w-8 animate-spin text-sky-400 mb-2" />
          <span className="text-xs text-slate-400">Cargando cuentas...</span>
        </div>
      ) : filteredCuentas.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-[#1e1e1e] border border-dashed border-[#2e2e2e] rounded-2xl">
          <BookUser className="h-12 w-12 text-slate-500 mb-3 opacity-60" />
          <h3 className="font-semibold text-slate-200 text-sm">
            {searchTerm ? 'No se encontraron resultados' : 'No hay cuentas registradas'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {searchTerm
              ? 'Intenta con otro término de búsqueda.'
              : 'Agrega tu primera cuenta bancaria o de efectivo para comenzar el control de saldos.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCuentas.map((cuenta) => (
            <CuentaCard
              key={cuenta.id}
              cuenta={cuenta}
              onEdit={handleOpenModal}
              onDelete={setCuentaToDelete}
            />
          ))}
        </div>
      )}

      {/* Modales */}
      <ModalCuenta
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingCuenta={editingCuenta}
        formState={formState}
        setFormState={setFormState}
        onSubmit={handleSubmit}
        loading={loading}
      />

      <DialogoEliminarCuenta
        cuentaToDelete={cuentaToDelete}
        onClose={() => setCuentaToDelete(null)}
        onConfirm={handleDelete}
        loading={loading}
      />
    </div>
  )
}
