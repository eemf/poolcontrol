'use client'

import { SurfaceCard, PillTabs, Paginacion } from '@/components/comunes'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Percent,
  Layers,
  CheckCircle2,
  PauseCircle,
  Loader2,
  Edit,
  Trash2,
  Package,
  Clock,
  Tag,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TipoPromocion } from '@/lib/tipos'
import type { PromocionConDocId, ProductoElegiblePromo } from '../_hooks/use-promociones'

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

interface ListaPromocionesProps {
  promociones: PromocionConDocId[]
  totalItems: number
  cargando: boolean
  conteos: { todas: number; activas: number; inactivas: number }
  searchTerm: string
  onSearchChange: (val: string) => void
  filtroEstado: 'todas' | 'activas' | 'inactivas'
  onFiltroEstadoChange: (val: 'todas' | 'activas' | 'inactivas') => void
  filtroTipo: 'todos' | TipoPromocion
  onFiltroTipoChange: (val: 'todos' | TipoPromocion) => void
  mapaProductos: Map<string, ProductoElegiblePromo>
  onToggleActiva: (promo: PromocionConDocId) => void
  onEditar: (promo: PromocionConDocId) => void
  onEliminar: (promo: PromocionConDocId) => void
  paginacion: {
    paginaActual: number
    itemsPorPagina: number
    totalPaginas: number
    onPaginaChange: (p: number) => void
    onItemsPorPaginaChange: (n: number) => void
  }
}

function resumenRegla(promo: PromocionConDocId): string {
  switch (promo.tipo) {
    case 'nxm':
      return `${promo.cantidadLleva || 2}x${promo.cantidadPaga || 1} (Lleva ${promo.cantidadLleva || 2}, paga ${promo.cantidadPaga || 1})`
    case 'precio_especial':
      return `Precio especial: Q${Number(promo.precioPromocion || 0).toFixed(2)} c/u`
    case 'combo':
      return `Combo: ${promo.cantidadRequerida || 2} unidades por Q${Number(promo.precioPaquete || 0).toFixed(2)}`
    case 'porcentaje':
      return `${Number(promo.porcentajeDescuento || 0)}% de descuento`
    default:
      return 'Promoción'
  }
}

function etiquetaTipo(tipo: TipoPromocion): string {
  switch (tipo) {
    case 'nxm':
      return 'NxM (2x1)'
    case 'precio_especial':
      return 'Precio especial'
    case 'combo':
      return 'Combo'
    case 'porcentaje':
      return 'Porcentaje'
  }
}

export function ListaPromociones({
  promociones,
  totalItems,
  cargando,
  conteos,
  searchTerm,
  onSearchChange,
  filtroEstado,
  onFiltroEstadoChange,
  filtroTipo,
  onFiltroTipoChange,
  mapaProductos,
  onToggleActiva,
  onEditar,
  onEliminar,
  paginacion,
}: ListaPromocionesProps) {
  const tipoSelect = (className?: string) => (
    <Select value={filtroTipo} onValueChange={(v) => onFiltroTipoChange(v as 'todos' | TipoPromocion)}>
      <SelectTrigger
        className={cn(
          'rounded-full h-10 sm:h-11 border-[#2e2e2e] bg-[#252526] hover:bg-[#313131] text-xs text-slate-100 shrink-0',
          className
        )}
      >
        <div className="flex items-center gap-2 truncate">
          <Tag className="h-3.5 w-3.5 text-sky-400 shrink-0" />
          <SelectValue placeholder="Tipo..." />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 font-body">
        <SelectItem value="todos" className="text-xs">Todos los tipos</SelectItem>
        <SelectItem value="nxm" className="text-xs">NxM (2x1, 3x2)</SelectItem>
        <SelectItem value="precio_especial" className="text-xs">Precio especial</SelectItem>
        <SelectItem value="combo" className="text-xs">Combo / Paquete</SelectItem>
        <SelectItem value="porcentaje" className="text-xs">Porcentaje (%)</SelectItem>
      </SelectContent>
    </Select>
  )

  return (
    <SurfaceCard variant="panel" className="p-4 sm:p-5 space-y-4 font-body">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="flex-1 min-w-0">
          <PillTabs
            value={filtroEstado}
            onValueChange={(v) => onFiltroEstadoChange(v as 'todas' | 'activas' | 'inactivas')}
            searchValue={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder="Buscar promoción o producto..."
            collapsibleMobileTabs
            hasActiveExtraFilter={filtroTipo !== 'todos'}
            mobileExtraContent={tipoSelect('w-full')}
            tabs={[
              {
                id: 'todas',
                label: 'Todas',
                icon: Layers,
                count: conteos.todas,
                badgeVariant: filtroEstado === 'todas' ? 'white' : 'slate',
              },
              {
                id: 'activas',
                label: 'Activas',
                icon: CheckCircle2,
                count: conteos.activas,
                badgeVariant: filtroEstado === 'activas' ? 'white' : 'emerald',
              },
              {
                id: 'inactivas',
                label: 'Pausadas',
                icon: PauseCircle,
                count: conteos.inactivas,
                badgeVariant: filtroEstado === 'inactivas' ? 'white' : 'amber',
              },
            ]}
          />
        </div>

        <div className="hidden sm:block shrink-0">
          {tipoSelect('w-[190px]')}
        </div>
      </div>

      {cargando ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-3 text-slate-400">
          <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
          <span className="text-xs">Cargando promociones...</span>
        </div>
      ) : promociones.length > 0 ? (
        <Accordion type="single" collapsible className="w-full space-y-2.5">
          {promociones.map((promo) => {
            const productosNombres = (promo.productosIds || []).map(
              (id) => mapaProductos.get(id)?.nombre || `Producto #${id}`
            )
            const dias = promo.vigencia?.diasSemana || []
            const tieneHorario = Boolean(promo.vigencia?.horaInicio && promo.vigencia?.horaFin)

            return (
              <AccordionItem
                value={promo.docId}
                key={promo.docId}
                className="rounded-xl border border-[#2e2e2e] hover:border-[#383838] bg-[#252526] transition-all overflow-hidden shadow-sm"
              >
                <AccordionTrigger className="px-3.5 py-3 sm:px-4 sm:py-3.5 hover:no-underline hover:bg-[#2e2e2e]/30 transition-colors data-[state=open]:border-b data-[state=open]:border-[#2e2e2e]">
                  <div className="flex-1 flex items-center justify-between gap-3 text-left pr-1.5 sm:pr-2.5 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          'h-9 w-9 rounded-full flex items-center justify-center shrink-0 border',
                          promo.activa
                            ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                            : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                        )}
                      >
                        <Percent className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm sm:text-base text-slate-100 truncate">
                          {promo.nombre}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[0.6875rem] text-slate-400 font-medium mt-0.5">
                          <span className="text-sky-400 font-semibold">{resumenRegla(promo)}</span>
                          <span>•</span>
                          <span className="tabular-nums">
                            {productosNombres.length}{' '}
                            {productosNombres.length === 1 ? 'producto' : 'productos'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge className="hidden sm:inline-flex rounded-full text-[0.625rem] font-semibold px-2.5 py-0.5 bg-[#1e1e1e] text-slate-300 border border-[#2e2e2e]">
                        {etiquetaTipo(promo.tipo)}
                      </Badge>
                      <Badge
                        className={cn(
                          'rounded-full text-[0.625rem] font-semibold px-2.5 py-0.5',
                          promo.activa
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                        )}
                      >
                        {promo.activa ? 'Activa' : 'Pausada'}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="p-3.5 sm:p-4 bg-[#1e1e1e]">
                  <div className="space-y-3.5">
                    {promo.descripcion && (
                      <p className="text-xs text-slate-300 bg-[#252526] border border-[#2e2e2e] rounded-xl px-3 py-2.5">
                        {promo.descripcion}
                      </p>
                    )}

                    {(dias.length > 0 || tieneHorario || promo.combinable) && (
                      <div className="flex flex-wrap items-center gap-2 bg-[#252526] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-xs text-slate-300">
                        <Clock className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                        {dias.length > 0 && (
                          <span>Días: {dias.map((d) => DIAS_SEMANA[d]).join(', ')}</span>
                        )}
                        {tieneHorario && (
                          <span>
                            Horario: {promo.vigencia?.horaInicio} - {promo.vigencia?.horaFin}
                          </span>
                        )}
                        {promo.combinable && (
                          <Badge className="rounded-full text-[0.625rem] bg-sky-500/15 text-sky-300 border border-sky-500/30">
                            Combinable entre productos
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5 text-sky-400" />
                        Productos incluidos ({productosNombres.length})
                      </h4>
                      <div className="flex flex-wrap gap-1.5 bg-[#252526] border border-[#2e2e2e] rounded-xl p-3">
                        {productosNombres.map((nombreProd, idx) => (
                          <Badge
                            key={idx}
                            className="rounded-full text-[0.6875rem] font-medium bg-[#1e1e1e] text-slate-200 border border-[#2e2e2e] px-2.5 py-0.5"
                          >
                            {nombreProd}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#2e2e2e]">
                      <div className="flex items-center gap-2.5">
                        <Switch
                          checked={promo.activa}
                          onCheckedChange={() => onToggleActiva(promo)}
                          className="data-[state=checked]:bg-sky-600 data-[state=unchecked]:bg-[#313131]"
                        />
                        <span className="text-xs font-medium text-slate-300">
                          {promo.activa ? 'Promoción activa en POS' : 'Promoción pausada'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 ml-auto">
                        <Button
                          size="sm"
                          className="rounded-full h-8 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-sm"
                          onClick={() => onEditar(promo)}
                        >
                          <Edit className="mr-1.5 h-3.5 w-3.5" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          className="rounded-full h-8 px-4 text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 shadow-sm"
                          onClick={() => onEliminar(promo)}
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      ) : (
        <div className="flex flex-col items-center justify-center text-center text-slate-400 h-64 rounded-xl border border-dashed border-[#2e2e2e] bg-[#252526]/50 p-6">
          <Percent className="h-10 w-10 mb-3 text-slate-500" />
          <p className="font-semibold text-base text-slate-200">
            {searchTerm || filtroEstado !== 'todas' || filtroTipo !== 'todos'
              ? 'Sin resultados'
              : 'No hay promociones registradas'}
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {searchTerm || filtroEstado !== 'todas' || filtroTipo !== 'todos'
              ? 'Prueba ajustando los filtros o el término de búsqueda.'
              : 'Crea tu primera promoción (2x1, precio especial, combo o porcentaje).'}
          </p>
        </div>
      )}

      {totalItems > 0 && (
        <Paginacion
          currentPage={paginacion.paginaActual}
          totalPages={paginacion.totalPaginas}
          totalItems={totalItems}
          itemsPerPage={paginacion.itemsPorPagina}
          onPageChange={paginacion.onPaginaChange}
          onItemsPorPaginaChange={paginacion.onItemsPorPaginaChange}
        />
      )}
    </SurfaceCard>
  )
}

