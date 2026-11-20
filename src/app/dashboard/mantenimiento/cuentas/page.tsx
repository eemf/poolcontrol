'use client'

import React, { useMemo, useState } from 'react'
import { PageHeader, SurfaceCard, PillTabs, BotonVolverArriba } from '@/components/comunes'
import { Button } from '@/components/ui/button'
import { BookUser, PlusCircle, Loader2, Banknote, Landmark, Layers } from 'lucide-react'
import { useMantenimientoCuentas } from './_hooks/use-mantenimiento-cuentas'
import { CuentaCard } from './_components/cuenta-card'
import { ModalCuenta } from './_components/modal-cuenta'
import { DialogoEliminarCuenta } from './_components/dialogo-eliminar-cuenta'

export default function CuentasPage() {
  const {
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

  const [tipoFiltro, setTipoFiltro] = useState<'todas' | 'Efectivo' | 'Bancaria'>('todas')

  const cuentasVisibles = useMemo(() => {
    if (tipoFiltro === 'todas') return filteredCuentas
    return filteredCuentas.filter((c) => c.tipo === tipoFiltro)
  }, [filteredCuentas, tipoFiltro])

  const conteos = useMemo(() => ({
    todas: filteredCuentas.length,
    efectivo: filteredCuentas.filter((c) => c.tipo === 'Efectivo').length,
    bancaria: filteredCuentas.filter((c) => c.tipo === 'Bancaria').length,
  }), [filteredCuentas])

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Cuentas Financieras"
        description="Administra las cuentas de efectivo y bancarias de tu negocio."
        icon={BookUser}
        action={
          <Button
            onClick={() => handleOpenModal(null)}
            className="w-full sm:w-auto rounded-full h-9 px-4 bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-md transition-all text-xs flex items-center justify-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Nueva Cuenta
          </Button>
        }
      />

      <SurfaceCard variant="panel" className="p-4 sm:p-5 space-y-4 font-body">
        <PillTabs
          value={tipoFiltro}
          onValueChange={(v) => setTipoFiltro(v as 'todas' | 'Efectivo' | 'Bancaria')}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Buscar por nombre o tipo..."
          collapsibleMobileTabs
          tabs={[
            { id: 'todas', label: 'Todas', icon: Layers, count: conteos.todas, badgeVariant: tipoFiltro === 'todas' ? 'white' : 'slate' },
            { id: 'Efectivo', label: 'Efectivo', icon: Banknote, count: conteos.efectivo, badgeVariant: tipoFiltro === 'Efectivo' ? 'white' : 'emerald' },
            { id: 'Bancaria', label: 'Bancaria', icon: Landmark, count: conteos.bancaria, badgeVariant: tipoFiltro === 'Bancaria' ? 'white' : 'sky' },
          ]}
        />

        {isLoading || isLoadingSucursal ? (
          <div className="flex flex-col items-center justify-center h-52 space-y-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
            <span className="text-xs">Cargando cuentas...</span>
          </div>
        ) : cuentasVisibles.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-10 bg-[#252526]/50 border border-dashed border-[#2e2e2e] rounded-xl">
            <BookUser className="h-10 w-10 text-slate-500 mb-3" />
            <h3 className="font-semibold text-slate-200 text-base">
              {searchTerm || tipoFiltro !== 'todas' ? 'No se encontraron resultados' : 'No hay cuentas registradas'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              {searchTerm || tipoFiltro !== 'todas'
                ? 'Prueba ajustando el filtro o el término de búsqueda.'
                : 'Agrega tu primera cuenta bancaria o de efectivo para comenzar el control de saldos.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {cuentasVisibles.map((cuenta) => (
              <CuentaCard
                key={cuenta.id}
                cuenta={cuenta}
                onEdit={handleOpenModal}
                onDelete={setCuentaToDelete}
              />
            ))}
          </div>
        )}
      </SurfaceCard>

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

      <BotonVolverArriba threshold={150} />
    </div>
  )
}
