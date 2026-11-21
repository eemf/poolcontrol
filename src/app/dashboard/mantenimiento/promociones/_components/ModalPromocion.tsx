'use client'

import { Dispatch, FormEvent, SetStateAction, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InputNumero } from '@/components/ui/input-numero'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Loader2, Percent, Save, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TipoPromocion } from '@/lib/tipos'
import type { FormPromocionState, ProductoElegiblePromo } from '../_hooks/use-promociones'

const DIAS_SEMANA = [
  { id: 0, label: 'Dom' },
  { id: 1, label: 'Lun' },
  { id: 2, label: 'Mar' },
  { id: 3, label: 'Mié' },
  { id: 4, label: 'Jue' },
  { id: 5, label: 'Vie' },
  { id: 6, label: 'Sáb' },
]

interface ModalPromocionProps {
  abierto: boolean
  onClose: () => void
  editando: boolean
  onSubmit: (e: FormEvent) => void
  procesando: boolean
  form: FormPromocionState
  setForm: Dispatch<SetStateAction<FormPromocionState>>
  productosElegibles: ProductoElegiblePromo[]
  cargandoProductos: boolean
}

export function ModalPromocion({
  abierto,
  onClose,
  editando,
  onSubmit,
  procesando,
  form,
  setForm,
  productosElegibles,
  cargandoProductos,
}: ModalPromocionProps) {
  const [busquedaProducto, setBusquedaProducto] = useState('')

  const productosFiltrados = useMemo(() => {
    const term = busquedaProducto.trim().toLowerCase()
    if (!term) return productosElegibles
    return productosElegibles.filter((p) => p.nombre.toLowerCase().includes(term))
  }, [productosElegibles, busquedaProducto])

  const toggleProducto = (id: string) => {
    setForm((prev) => {
      const existe = prev.productosIds.includes(id)
      return {
        ...prev,
        productosIds: existe
          ? prev.productosIds.filter((pid) => pid !== id)
          : [...prev.productosIds, id],
      }
    })
  }

  const toggleDia = (dia: number) => {
    setForm((prev) => {
      const existe = prev.diasSemana.includes(dia)
      return {
        ...prev,
        diasSemana: existe
          ? prev.diasSemana.filter((d) => d !== dia)
          : [...prev.diasSemana, dia].sort((a, b) => a - b),
      }
    })
  }

  return (
    <Dialog open={abierto} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 rounded-2xl p-5 sm:p-6 shadow-2xl font-body flex flex-col max-h-[90vh]">
        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 gap-4">
          <DialogHeader className="shrink-0">
            <div className="flex items-center gap-3 pr-6">
              <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <Percent className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0">
                <DialogTitle className="font-headline text-lg font-bold text-slate-100 leading-tight truncate">
                  {editando ? 'Editar Promoción' : 'Nueva Promoción'}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5 truncate">
                  Aplica ofertas sin modificar el precio del catálogo ni el descuento real de stock.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 space-y-4 p-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="promo-nombre" className="text-xs font-medium ml-1 text-slate-200 block">
                  Nombre de la promoción*
                </Label>
                <Input
                  id="promo-nombre"
                  value={form.nombre}
                  onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                  onClick={(e) => e.currentTarget.select()}
                  required
                  placeholder="Ej: Cervezas 2x1"
                  className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-sm text-slate-100 placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium ml-1 text-slate-200 block">
                  Tipo de promoción*
                </Label>
                <Select
                  value={form.tipo}
                  onValueChange={(v) => setForm((p) => ({ ...p, tipo: v as TipoPromocion }))}
                >
                  <SelectTrigger className="rounded-full h-10 bg-[#252526] hover:bg-[#313131] border-[#2e2e2e] text-xs text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 font-body">
                    <SelectItem value="nxm" className="text-xs">NxM (2x1, 3x2, etc.)</SelectItem>
                    <SelectItem value="precio_especial" className="text-xs">Precio especial por unidad</SelectItem>
                    <SelectItem value="combo" className="text-xs">Combo / Paquete por cantidad</SelectItem>
                    <SelectItem value="porcentaje" className="text-xs">Descuento porcentual (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="promo-desc" className="text-xs font-medium ml-1 text-slate-200 block">
                Descripción (opcional)
              </Label>
              <Input
                id="promo-desc"
                value={form.descripcion}
                onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                placeholder="Ej: Aplica los fines de semana en cervezas nacionales"
                className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-sm text-slate-100 placeholder:text-slate-500"
              />
            </div>

            {/* Regla dinámica según tipo */}
            <div className="p-3.5 rounded-xl bg-[#252526] border border-[#2e2e2e] space-y-3">
              {form.tipo === 'nxm' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium ml-1 text-slate-200 block">
                        Cantidad que lleva (N)*
                      </Label>
                      <InputNumero
                        value={form.cantidadLleva}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            cantidadLleva: e.target.value === '' ? '' : Number(e.target.value),
                          }))
                        }
                        onClick={(e) => e.currentTarget.select()}
                        min="2"
                        placeholder="2"
                        className="rounded-full h-10 text-center font-bold bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 tabular-nums"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium ml-1 text-slate-200 block">
                        Cantidad que paga (M)*
                      </Label>
                      <InputNumero
                        value={form.cantidadPaga}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            cantidadPaga: e.target.value === '' ? '' : Number(e.target.value),
                          }))
                        }
                        onClick={(e) => e.currentTarget.select()}
                        min="1"
                        placeholder="1"
                        className="rounded-full h-10 text-center font-bold bg-[#1e1e1e] border-[#2e2e2e] text-sky-400 tabular-nums"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="space-y-0.5 pr-3">
                      <Label htmlFor="combinable-switch" className="text-xs font-semibold text-slate-200 cursor-pointer">
                        Combinable entre productos seleccionados
                      </Label>
                      <p className="text-[0.6875rem] text-slate-400">
                        Ej. llevar 1 cerveza + 1 cerveza distinta y aplicar 2x1.
                      </p>
                    </div>
                    <Switch
                      id="combinable-switch"
                      checked={form.combinable}
                      onCheckedChange={(v) => setForm((p) => ({ ...p, combinable: v }))}
                      className="data-[state=checked]:bg-sky-600 data-[state=unchecked]:bg-[#313131]"
                    />
                  </div>
                </>
              )}

              {form.tipo === 'precio_especial' && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium ml-1 text-slate-200 block">
                    Precio promocional por unidad*
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 text-xs font-bold pointer-events-none">
                      Q
                    </span>
                    <InputNumero
                      step="0.01"
                      min="0"
                      value={form.precioPromocion}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          precioPromocion: e.target.value === '' ? '' : Number(e.target.value),
                        }))
                      }
                      onClick={(e) => e.currentTarget.select()}
                      placeholder="10.00"
                      className="rounded-full h-10 pl-8 pr-3 bg-[#1e1e1e] border-[#2e2e2e] text-sm font-bold text-emerald-400 tabular-nums"
                    />
                  </div>
                </div>
              )}

              {form.tipo === 'combo' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium ml-1 text-slate-200 block">
                      Cantidad requerida*
                    </Label>
                    <InputNumero
                      min="2"
                      value={form.cantidadRequerida}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          cantidadRequerida: e.target.value === '' ? '' : Number(e.target.value),
                        }))
                      }
                      onClick={(e) => e.currentTarget.select()}
                      placeholder="2"
                      className="rounded-full h-10 text-center font-bold bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 tabular-nums"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium ml-1 text-slate-200 block">
                      Precio del paquete*
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 text-xs font-bold pointer-events-none">
                        Q
                      </span>
                      <InputNumero
                        step="0.01"
                        min="0"
                        value={form.precioPaquete}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            precioPaquete: e.target.value === '' ? '' : Number(e.target.value),
                          }))
                        }
                        onClick={(e) => e.currentTarget.select()}
                        placeholder="20.00"
                        className="rounded-full h-10 pl-8 pr-3 bg-[#1e1e1e] border-[#2e2e2e] text-sm font-bold text-emerald-400 tabular-nums"
                      />
                    </div>
                  </div>
                </div>
              )}

              {form.tipo === 'porcentaje' && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium ml-1 text-slate-200 block">
                    Porcentaje de descuento (%)*
                  </Label>
                  <InputNumero
                    min="1"
                    max="100"
                    value={form.porcentajeDescuento}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        porcentajeDescuento: e.target.value === '' ? '' : Number(e.target.value),
                      }))
                    }
                    onClick={(e) => e.currentTarget.select()}
                    placeholder="15"
                    className="rounded-full h-10 text-center font-bold bg-[#1e1e1e] border-[#2e2e2e] text-sky-400 tabular-nums"
                  />
                </div>
              )}
            </div>

            {/* Selector múltiple de productos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium ml-1 text-slate-200">
                  Productos aplicables*
                </Label>
                <Badge className="rounded-full text-[0.625rem] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30 tabular-nums">
                  {form.productosIds.length} seleccionados
                </Badge>
              </div>

              <div className="rounded-xl border border-[#2e2e2e] bg-[#252526] p-3 space-y-2.5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    value={busquedaProducto}
                    onChange={(e) => setBusquedaProducto(e.target.value)}
                    placeholder="Filtrar productos..."
                    className="rounded-full h-9 pl-8 text-xs bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 placeholder:text-slate-500"
                  />
                </div>

                <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                  {cargandoProductos ? (
                    <div className="flex items-center justify-center py-6 text-slate-400 text-xs gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
                      Cargando productos...
                    </div>
                  ) : productosFiltrados.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">
                      No se encontraron productos.
                    </p>
                  ) : (
                    productosFiltrados.map((prod) => {
                      const marcado = form.productosIds.includes(prod.id)
                      return (
                        <label
                          key={prod.id}
                          className={cn(
                            'flex items-center justify-between gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-colors text-xs',
                            marcado
                              ? 'bg-sky-600/15 border-sky-500/40 text-slate-100'
                              : 'bg-[#1e1e1e] border-[#2e2e2e] text-slate-300 hover:border-[#383838]'
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Checkbox
                              checked={marcado}
                              onCheckedChange={() => toggleProducto(prod.id)}
                              className="border-slate-500 data-[state=checked]:bg-sky-600 data-[state=checked]:border-sky-600"
                            />
                            <span className="font-medium truncate">{prod.nombre}</span>
                          </div>
                          <span className="text-[0.6875rem] font-semibold text-emerald-400 tabular-nums shrink-0">
                            Q{prod.precioVenta.toFixed(2)}
                          </span>
                        </label>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Vigencia opcional */}
            <div className="rounded-xl border border-[#2e2e2e] bg-[#252526] p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 pr-3">
                  <Label htmlFor="vigencia-switch" className="text-xs sm:text-sm font-semibold text-slate-100 cursor-pointer">
                    Limitar por días u horario
                  </Label>
                  <p className="text-[0.6875rem] text-slate-400">
                    Opcional: ideal para promociones de fin de semana o Happy Hour.
                  </p>
                </div>
                <Switch
                  id="vigencia-switch"
                  checked={form.usarVigencia}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, usarVigencia: v }))}
                  className="data-[state=checked]:bg-sky-600 data-[state=unchecked]:bg-[#313131]"
                />
              </div>

              {form.usarVigencia && (
                <div className="space-y-3 pt-2 border-t border-[#2e2e2e]">
                  <div className="space-y-1.5">
                    <Label className="text-[0.6875rem] text-slate-300 ml-1 block">
                      Días activos (vacío = todos los días)
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {DIAS_SEMANA.map((d) => {
                        const activo = form.diasSemana.includes(d.id)
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => toggleDia(d.id)}
                            className={cn(
                              'h-8 px-3 rounded-full text-xs font-semibold border transition-colors',
                              activo
                                ? 'bg-sky-600 text-white border-sky-500'
                                : 'bg-[#1e1e1e] text-slate-300 border-[#2e2e2e] hover:bg-[#313131]'
                            )}
                          >
                            {d.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[0.6875rem] text-slate-300 ml-1 block">Hora inicio</Label>
                      <Input
                        type="time"
                        value={form.horaInicio}
                        onChange={(e) => setForm((p) => ({ ...p, horaInicio: e.target.value }))}
                        className="rounded-full h-9 bg-[#1e1e1e] border-[#2e2e2e] text-xs text-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[0.6875rem] text-slate-300 ml-1 block">Hora fin</Label>
                      <Input
                        type="time"
                        value={form.horaFin}
                        onChange={(e) => setForm((p) => ({ ...p, horaFin: e.target.value }))}
                        className="rounded-full h-9 bg-[#1e1e1e] border-[#2e2e2e] text-xs text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[#2e2e2e] px-3.5 py-3 bg-[#252526]">
              <div className="space-y-0.5 pr-3">
                <Label htmlFor="activa-switch" className="text-xs sm:text-sm font-semibold text-slate-100 cursor-pointer">
                  Promoción activa
                </Label>
                <p className="text-[0.6875rem] text-slate-400">Habilitar inmediatamente en Punto de Venta</p>
              </div>
              <Switch
                id="activa-switch"
                checked={form.activa}
                onCheckedChange={(v) => setForm((p) => ({ ...p, activa: v }))}
                className="data-[state=checked]:bg-sky-600 data-[state=unchecked]:bg-[#313131]"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 shrink-0 flex-row items-center justify-between sm:justify-between gap-2 sm:space-x-0">
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="rounded-full h-9 px-5 text-xs font-medium bg-[#252526] hover:bg-[#313131] text-slate-200 border border-[#2e2e2e]"
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={procesando}
              className="rounded-full h-9 px-6 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md"
            >
              {procesando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {editando ? 'Actualizar' : 'Guardar Promoción'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

