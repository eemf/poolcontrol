'use client'

import { useMemo, useState } from "react"
import { PageHeader, PillTabs, SurfaceCard, BotonVolverArriba } from "@/components/comunes"
import { Button } from "@/components/ui/button"
import { LayoutGrid, DollarSign, PlusCircle, Loader2 } from "lucide-react"
import { useConfigMesas } from "./_hooks/use-config-mesas"
import { TarifaCard } from "./_components/tarifa-card"
import { MesaCard } from "./_components/mesa-card"
import { TarifaDialog } from "./_components/tarifa-dialog"
import { MesaDialog } from "./_components/mesa-dialog"
import { EliminarDialogs } from "./_components/eliminar-dialogs"

export default function PaginaConfiguracionMesasUnificada() {
  const [tab, setTab] = useState<'mesas' | 'tarifas'>('mesas')
  const [searchTerm, setSearchTerm] = useState('')
  const {
    isMounted,
    isGlobalLoading,
    loading,
    tarifasConDocId,
    mesasConDocId,
    isTarifaModalOpen,
    setIsTarifaModalOpen,
    isMesaModalOpen,
    setIsMesaModalOpen,
    tarifaToDelete,
    setTarifaToDelete,
    mesaToDelete,
    setMesaToDelete,
    editingTarifa,
    editingMesa,
    tarifaForm,
    setTarifaForm,
    mesaForm,
    setMesaForm,
    nuevoIntervalo,
    setNuevoIntervalo,
    handleTarifaSubmit,
    handleDeleteTarifa,
    handleAddIntervalo,
    handleRemoveIntervalo,
    handleMesaSubmit,
    handleDeleteMesa,
    abrirNuevaTarifa,
    abrirEditarTarifa,
    abrirNuevaMesa,
    abrirEditarMesa,
  } = useConfigMesas()

  const mesasFiltradas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return mesasConDocId
    return mesasConDocId.filter((m) => {
      const etiqueta = `${m.tipoDeMesa === 'Consola' ? 'Consola' : 'Mesa'} ${m.numeroMesa}`.toLowerCase()
      return etiqueta.includes(term) || (m.tipoDeMesa || '').toLowerCase().includes(term) || (m.estado || '').toLowerCase().includes(term)
    })
  }, [mesasConDocId, searchTerm])

  const tarifasFiltradas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return tarifasConDocId
    return tarifasConDocId.filter((t) =>
      (t.nombre || '').toLowerCase().includes(term) ||
      (t.tipoDeMesa || '').toLowerCase().includes(term) ||
      (t.tipoDeCalculo || '').toLowerCase().includes(term)
    )
  }, [tarifasConDocId, searchTerm])

  if (!isMounted) return null

  return (
    <div className="space-y-4 sm:space-y-6 pb-2">
      <PageHeader
        title="Configuración de Estaciones"
        description="Administra las tarifas y el inventario de estaciones (Mesas de Billar y Consolas)."
        icon={LayoutGrid}
        action={
          tab === 'mesas' ? (
            <Button
              onClick={abrirNuevaMesa}
              className="w-full sm:w-auto rounded-full h-9 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md flex items-center justify-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Nueva Estación
            </Button>
          ) : (
            <Button
              onClick={abrirNuevaTarifa}
              className="w-full sm:w-auto rounded-full h-9 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md flex items-center justify-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Nueva Tarifa
            </Button>
          )
        }
      />

      <SurfaceCard variant="panel" className="p-4 sm:p-5 space-y-4 font-body">
        <PillTabs
          value={tab}
          onValueChange={(val) => setTab(val as 'mesas' | 'tarifas')}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder={tab === 'mesas' ? "Buscar estación por número o tipo..." : "Buscar tarifa por nombre o tipo..."}
          tabs={[
            {
              id: 'mesas',
              label: 'Estaciones',
              icon: LayoutGrid,
              count: mesasConDocId.length,
              badgeVariant: tab === 'mesas' ? 'white' : 'sky',
            },
            {
              id: 'tarifas',
              label: 'Tarifas',
              icon: DollarSign,
              count: tarifasConDocId.length,
              badgeVariant: tab === 'tarifas' ? 'white' : 'amber',
            },
          ]}
        />

        {isGlobalLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-3 text-slate-400">
            <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
            <span className="text-xs">Cargando configuración...</span>
          </div>
        ) : tab === 'mesas' ? (
          mesasFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 border border-dashed border-[#2e2e2e] rounded-xl bg-[#252526]/50 px-4">
              <LayoutGrid className="h-10 w-10 text-slate-500 mb-3" />
              <p className="text-slate-200 font-semibold text-base">
                {searchTerm ? 'Sin resultados' : 'No hay estaciones registradas aún'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {searchTerm ? 'Prueba con otro término de búsqueda.' : 'Agrega tu primera mesa o consola para comenzar.'}
              </p>
              {!searchTerm && (
                <Button onClick={abrirNuevaMesa} className="rounded-full h-9 px-4 text-xs font-semibold mt-4 bg-sky-600 hover:bg-sky-500 text-white">
                  <PlusCircle className="mr-1.5 h-4 w-4" />
                  Añadir Primera Estación
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {mesasFiltradas.map((mesa) => (
                <MesaCard
                  key={mesa.docId}
                  mesa={mesa}
                  tarifas={tarifasConDocId}
                  onEdit={abrirEditarMesa}
                  onDelete={setMesaToDelete}
                />
              ))}
            </div>
          )
        ) : tarifasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 border border-dashed border-[#2e2e2e] rounded-xl bg-[#252526]/50 px-4">
            <DollarSign className="h-10 w-10 text-slate-500 mb-3" />
            <p className="text-slate-200 font-semibold text-base">
              {searchTerm ? 'Sin resultados' : 'No hay tarifas registradas aún'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {searchTerm ? 'Prueba con otro término de búsqueda.' : 'Crea tu primera tarifa para asignar a las estaciones.'}
            </p>
            {!searchTerm && (
              <Button onClick={abrirNuevaTarifa} className="rounded-full h-9 px-4 text-xs font-semibold mt-4 bg-sky-600 hover:bg-sky-500 text-white">
                <PlusCircle className="mr-1.5 h-4 w-4" />
                Añadir Primera Tarifa
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {tarifasFiltradas.map((tarifa) => (
              <TarifaCard
                key={tarifa.docId}
                tarifa={tarifa}
                onEdit={abrirEditarTarifa}
                onDelete={setTarifaToDelete}
              />
            ))}
          </div>
        )}
      </SurfaceCard>

      <TarifaDialog
        isOpen={isTarifaModalOpen}
        onOpenChange={setIsTarifaModalOpen}
        editingTarifa={editingTarifa}
        tarifaForm={tarifaForm}
        setTarifaForm={setTarifaForm}
        nuevoIntervalo={nuevoIntervalo}
        setNuevoIntervalo={setNuevoIntervalo}
        onAddIntervalo={handleAddIntervalo}
        onRemoveIntervalo={handleRemoveIntervalo}
        onSubmit={handleTarifaSubmit}
        loading={loading}
      />

      <MesaDialog
        isOpen={isMesaModalOpen}
        onOpenChange={setIsMesaModalOpen}
        editingMesa={editingMesa}
        mesaForm={mesaForm}
        setMesaForm={setMesaForm}
        tarifas={tarifasConDocId}
        onSubmit={handleMesaSubmit}
        loading={loading}
      />

      <EliminarDialogs
        tarifaToDelete={tarifaToDelete}
        mesaToDelete={mesaToDelete}
        onCancelTarifa={() => setTarifaToDelete(null)}
        onConfirmTarifa={handleDeleteTarifa}
        onCancelMesa={() => setMesaToDelete(null)}
        onConfirmMesa={handleDeleteMesa}
      />

      <BotonVolverArriba threshold={150} />
    </div>
  )
}
