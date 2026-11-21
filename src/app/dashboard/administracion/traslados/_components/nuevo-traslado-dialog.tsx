'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SurfaceCard } from '@/components/comunes';
import { AutocompleteInput, AutocompleteOption } from '@/components/ui/autocomplete-input';
import {
  Truck,
  PlusCircle,
  Trash2,
  Loader2,
  PackageCheck,
  History,
  Tag,
  Search,
  ShoppingCart,
} from 'lucide-react';
import type { Sucursal, Producto, Compra } from '@/lib/tipos';
import { InputItemTraslado, crearTrasladoInterSucursal } from '@/lib/firebase/servicios/traslados';
import { useFirebase, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const toDate = (fecha: any): Date => {
  if (!fecha) return new Date();
  if (typeof fecha?.toDate === 'function') return fecha.toDate();
  if (fecha instanceof Date) return fecha;
  if (typeof fecha === 'string' || typeof fecha === 'number') {
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sucursalOrigenId: string;
  sucursalOrigenNombre: string;
  sucursales: Sucursal[];
  productosOrigen: Producto[];
  comprasOrigen?: Compra[];
  onSuccess?: () => void;
}

interface ItemEnEdicion extends InputItemTraslado {
  existenciaDisponible: number;
}

export function NuevoTrasladoDialog({
  open,
  onOpenChange,
  sucursalOrigenId,
  sucursalOrigenNombre,
  sucursales,
  productosOrigen,
  comprasOrigen = [],
  onSuccess,
}: Props) {
  const { firestore } = useFirebase();
  const { user, profile } = useUser();
  const { toast } = useToast();

  const [sucursalDestinoId, setSucursalDestinoId] = useState<string>('');
  const [items, setItems] = useState<ItemEnEdicion[]>([]);
  const [observaciones, setObservaciones] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selector temporal para añadir producto
  const [selectedProductoId, setSelectedProductoId] = useState<string>('');
  const [cantidadInput, setCantidadInput] = useState<string>('1');
  const [costoInput, setCostoInput] = useState<string>('');
  const [isAddingItem, setIsAddingItem] = useState(false);

  const productoInputRef = useRef<HTMLInputElement>(null);
  const cantidadInputRef = useRef<HTMLInputElement>(null);
  const costoInputRef = useRef<HTMLInputElement>(null);
  const addItemButtonRef = useRef<HTMLButtonElement>(null);

  const controlsDisabled = !sucursalDestinoId;

  const focusAndSelect = (ref: React.RefObject<HTMLInputElement | null>) => {
    setTimeout(() => {
      ref.current?.focus();
      ref.current?.select();
    }, 20);
  };

  // Sucursales destino disponibles (excluyendo la sucursal activa)
  const sucursalesDestino = useMemo(() => {
    return sucursales.filter((s) => s.id !== sucursalOrigenId);
  }, [sucursales, sucursalOrigenId]);

  // Opciones para el buscador tipo POS con existencia > 0
  const opcionesProductos: AutocompleteOption[] = useMemo(() => {
    return productosOrigen
      .filter((p) => (p.existencia ?? 0) > 0)
      .map((p) => {
        const stock = p.existencia ?? 0;
        const precioBase = p.precioCompra ?? 0;
        const codigo = p.codigoBusqueda ? ` | Cód: ${p.codigoBusqueda}` : '';
        return {
          value: p.id,
          label: p.nombre,
          description: `Stock disponible: ${stock}${codigo} | Costo base: Q${precioBase.toFixed(2)}`,
          badge: `${stock} uds`,
        };
      });
  }, [productosOrigen]);

  const productoSeleccionado = useMemo(() => {
    return productosOrigen.find((p) => p.id === selectedProductoId);
  }, [productosOrigen, selectedProductoId]);

  // Historial de compras para el producto seleccionado
  const historialCompras = useMemo(() => {
    if (!selectedProductoId || !comprasOrigen || comprasOrigen.length === 0) return [];

    const prod = productosOrigen.find((p) => p.id === selectedProductoId);
    if (!prod) return [];

    const list: {
      idCompra: number;
      fecha: Date;
      costoUnitario: number;
      cantidad: number;
      proveedorNombre?: string;
    }[] = [];

    const costosVistos = new Set<number>();

    for (const c of comprasOrigen) {
      const item = c.items?.find(
        (i) => i.tipo === 'producto' && (i.productoId === selectedProductoId || i.nombreProducto.trim().toLowerCase() === prod.nombre.trim().toLowerCase())
      );

      if (item && typeof item.costoUnitario === 'number' && item.costoUnitario > 0) {
        list.push({
          idCompra: c.idCompra,
          fecha: toDate(c.fecha),
          costoUnitario: item.costoUnitario,
          cantidad: item.cantidad,
          proveedorNombre: c.proveedorNombre || undefined,
        });
        costosVistos.add(item.costoUnitario);
      }
    }

    // Si el precio de compra del producto no está en las compras registradas, añadirlo como opción
    if (prod.precioCompra && prod.precioCompra > 0 && !costosVistos.has(prod.precioCompra)) {
      list.push({
        idCompra: 0,
        fecha: new Date(),
        costoUnitario: prod.precioCompra,
        cantidad: 0,
        proveedorNombre: 'Precio base de catálogo',
      });
    }

    return list.slice(0, 5);
  }, [selectedProductoId, comprasOrigen, productosOrigen]);

  // Al seleccionar producto en el buscador, autocompletar con el último precio de compra registrado
  useEffect(() => {
    if (selectedProductoId) {
      if (historialCompras.length > 0) {
        setCostoInput(historialCompras[0].costoUnitario.toString());
      } else {
        const prod = productosOrigen.find((p) => p.id === selectedProductoId);
        setCostoInput(prod?.precioCompra ? prod.precioCompra.toString() : '');
      }
      setCantidadInput('1');
    } else {
      setCostoInput('');
      setCantidadInput('1');
    }
  }, [selectedProductoId, historialCompras, productosOrigen]);

  // Limpiar campos al abrir el diálogo
  useEffect(() => {
    if (open) {
      setSelectedProductoId('');
      setCantidadInput('1');
      setCostoInput('');
      setItems([]);
      setObservaciones('');
    }
  }, [open]);

  const handleAddItem = () => {
    if (isAddingItem || controlsDisabled) return;

    const cant = Number(cantidadInput);
    if (isNaN(cant) || cant <= 0) {
      focusAndSelect(cantidadInputRef);
      return;
    }

    if (!productoSeleccionado) {
      focusAndSelect(productoInputRef);
      return;
    }

    const stockDisponible = productoSeleccionado.existencia ?? 0;
    const yaAgregado = items.find((it) => it.productoOrigenId === productoSeleccionado.id)?.cantidad ?? 0;

    if (cant + yaAgregado > stockDisponible) {
      toast({
        title: 'Stock insuficiente',
        description: `Solo hay ${stockDisponible} unidades disponibles de "${productoSeleccionado.nombre}".`,
        variant: 'destructive',
      });
      focusAndSelect(cantidadInputRef);
      return;
    }

    const costo = costoInput !== '' && Number(costoInput) >= 0 ? Number(costoInput) : (productoSeleccionado.precioCompra ?? 0);

    setItems((prev) => {
      const idx = prev.findIndex((it) => it.productoOrigenId === productoSeleccionado.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          cantidad: updated[idx].cantidad + cant,
          costoUnitario: costo,
        };
        return updated;
      }
      return [
        ...prev,
        {
          productoOrigenId: productoSeleccionado.id,
          nombreProducto: productoSeleccionado.nombre,
          cantidad: cant,
          costoUnitario: costo,
          precioVenta: productoSeleccionado.precioVenta,
          existenciaDisponible: stockDisponible,
        },
      ];
    });

    setIsAddingItem(true);
    setSelectedProductoId('');
    setCantidadInput('1');
    setCostoInput('');
    focusAndSelect(cantidadInputRef);
    setTimeout(() => setIsAddingItem(false), 250);
  };

  const handleRemoveItem = (productoOrigenId: string) => {
    setItems((prev) => prev.filter((it) => it.productoOrigenId !== productoOrigenId));
  };

  const totalCosto = useMemo(() => {
    return items.reduce((acc, it) => acc + it.cantidad * it.costoUnitario, 0);
  }, [items]);

  const totalCantidad = useMemo(() => {
    return items.reduce((acc, it) => acc + it.cantidad, 0);
  }, [items]);

  const handleSubmit = async () => {
    if (!firestore || !user) return;
    if (!sucursalDestinoId) {
      toast({ title: 'Falta destino', description: 'Debes seleccionar la sucursal de destino.', variant: 'destructive' });
      return;
    }
    if (items.length === 0) {
      toast({ title: 'Sin productos', description: 'Agrega al menos un producto al traslado.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const usuarioNombre = profile?.nombre || user.displayName || user.email || 'Usuario';
      await crearTrasladoInterSucursal(firestore, {
        sucursalOrigenId,
        sucursalDestinoId,
        usuarioId: user.uid,
        usuarioNombre,
        items: items.map((it) => ({
          productoOrigenId: it.productoOrigenId,
          nombreProducto: it.nombreProducto,
          cantidad: it.cantidad,
          costoUnitario: it.costoUnitario,
          precioVenta: it.precioVenta,
        })),
        observacionesEnvio: observaciones.trim() || undefined,
      });

      toast({
        title: '¡Traslado Despachado!',
        description: `Se descontaron ${totalCantidad} unidades de origen y el traslado se encuentra en tránsito.`,
      });

      // Limpiar estado
      setSucursalDestinoId('');
      setItems([]);
      setObservaciones('');
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      console.error('Error al crear traslado:', err);
      toast({
        title: 'Error al despachar traslado',
        description: err.message || 'Ocurrió un error inesperado.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 rounded-2xl overflow-visible p-5 sm:p-6 shadow-2xl font-body flex flex-col max-h-[90vh]">
        <div className="flex flex-col flex-1 min-h-0 overflow-visible gap-4">
          <DialogHeader className="shrink-0">
            <div className="flex items-center gap-3 pr-6">
              <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0">
                <DialogTitle className="font-headline text-lg font-bold text-slate-100 leading-tight truncate">
                  Nuevo Traslado
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5 truncate">
                  Desde {sucursalOrigenNombre || 'Sucursal actual'} hacia otra sucursal.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col flex-1 min-h-0 space-y-3.5 overflow-y-auto p-1">
            {/* Sucursal Destino y Monto Total en la misma fila */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex-1 min-w-0 sm:max-w-lg">
                <Select
                  value={sucursalDestinoId}
                  onValueChange={(val) => {
                    setSucursalDestinoId(val);
                    if (val) {
                      setTimeout(() => {
                        cantidadInputRef.current?.focus();
                        cantidadInputRef.current?.select();
                      }, 100);
                    }
                  }}
                >
                  <SelectTrigger className="h-10 rounded-full px-4 text-sm bg-[#252526] border-[#2e2e2e] hover:bg-[#313131]">
                    <SelectValue placeholder="Seleccionar sucursal de destino..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sucursalesDestino.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-xs">
                        {s.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-baseline justify-center sm:justify-end gap-2 shrink-0 sm:text-right px-1 sm:px-0">
                <span className="text-xs font-medium text-slate-400">Monto Total</span>
                <span className="text-2xl font-bold text-sky-400 tabular-nums leading-tight">
                  Q{totalCosto.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Sección de entrada de artículos */}
            <div className={cn("space-y-2 transition-opacity", controlsDisabled && "opacity-50")}>
              <div className="flex flex-col lg:flex-row items-end gap-2.5">
                <div className="w-full lg:w-24 space-y-1 shrink-0">
                  <Label htmlFor="cantidad" className="text-xs font-medium ml-1 text-slate-200 block">
                    Cantidad
                  </Label>
                  <Input
                    id="cantidad"
                    ref={cantidadInputRef}
                    type="number"
                    min="1"
                    max={productoSeleccionado?.existencia ?? 99999}
                    placeholder="1"
                    value={cantidadInput}
                    onChange={(e) => setCantidadInput(e.target.value)}
                    onClick={(e) => e.currentTarget.select()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        focusAndSelect(productoInputRef);
                      }
                    }}
                    disabled={controlsDisabled}
                    className="text-center h-10 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div className="flex-grow space-y-1 w-full">
                  <div className="flex items-center justify-between px-1">
                    <Label htmlFor="producto-search" className="text-xs font-medium text-slate-200 block">
                      Producto
                    </Label>
                    {productoSeleccionado && (
                      <span className="text-[0.6875rem] font-semibold text-sky-400">
                        Stock: {productoSeleccionado.existencia ?? 0} uds
                      </span>
                    )}
                  </div>
                  <AutocompleteInput
                    id="producto-search"
                    ref={productoInputRef}
                    options={opcionesProductos}
                    value={selectedProductoId}
                    onValueChange={(val) => {
                      setSelectedProductoId(val);
                      if (val) focusAndSelect(costoInputRef);
                    }}
                    placeholder="Buscar producto..."
                    onEnterKey={() => focusAndSelect(costoInputRef)}
                    onClick={(e) => e.currentTarget.select()}
                    disabled={controlsDisabled}
                    icon={Search}
                  />
                </div>

                {/* Precio + Botón Añadir en la misma fila */}
                <div className="flex items-end gap-2.5 w-full lg:w-auto shrink-0">
                  <div className="flex-1 lg:w-28 space-y-1">
                    <Label htmlFor="costo" className="text-xs font-medium ml-1 text-slate-200 block">
                      Precio
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400 text-xs font-bold pointer-events-none">
                        Q
                      </span>
                      <Input
                        id="costo"
                        ref={costoInputRef}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={costoInput}
                        onChange={(e) => setCostoInput(e.target.value)}
                        onClick={(e) => e.currentTarget.select()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addItemButtonRef.current?.focus();
                          }
                        }}
                        disabled={controlsDisabled}
                        className="w-full px-8 text-center h-10 font-bold text-sm tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    ref={addItemButtonRef}
                    onClick={handleAddItem}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddItem();
                      }
                    }}
                    disabled={controlsDisabled || isAddingItem}
                    className="rounded-full h-10 px-5 sm:px-6 font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md shrink-0"
                  >
                    {isAddingItem ? (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <PlusCircle className="mr-1.5 h-4 w-4" />
                    )}
                    Añadir
                  </Button>
                </div>
              </div>

              {/* Historial de precios compacto */}
              {selectedProductoId && (
                <SurfaceCard variant="surface" className="p-2.5 flex flex-wrap items-center gap-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                    <History className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                    <span className="text-[0.6875rem] font-semibold text-slate-200">
                      Historial de precios:
                    </span>
                  </div>

                  {historialCompras.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {historialCompras.map((item, idx) => {
                        const isSelected = costoInput !== '' && Number(costoInput) === item.costoUnitario;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setCostoInput(item.costoUnitario.toString());
                              focusAndSelect(costoInputRef);
                            }}
                            title={`Aplicar costo Q${item.costoUnitario.toFixed(2)} (${item.proveedorNombre || 'Compra previa'})`}
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all cursor-pointer',
                              isSelected
                                ? 'bg-sky-600 text-white border-sky-500 shadow-sm font-bold'
                                : 'bg-[#1e1e1e] hover:bg-[#313131] border-[#2e2e2e] text-slate-200'
                            )}
                          >
                            <span className={cn('text-xs font-bold tabular-nums', isSelected ? 'text-white' : 'text-sky-400')}>
                              Q{item.costoUnitario.toFixed(2)}
                            </span>
                            <span className={cn('text-[0.625rem]', isSelected ? 'text-white/90' : 'text-slate-400')}>
                              {item.idCompra > 0 ? format(item.fecha, 'dd/MM/yy') : 'Catálogo'}
                            </span>
                            {idx === 0 && (
                              <span
                                className={cn(
                                  'text-[0.5625rem] font-bold px-1.5 py-0.5 rounded-full',
                                  isSelected ? 'bg-white/25 text-white' : 'bg-sky-500/15 text-sky-400'
                                )}
                              >
                                Última
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-[0.6875rem] text-slate-400 flex items-center gap-1">
                      <Tag className="h-3 w-3 opacity-60" />
                      Sin historial registrado. Se utilizará el costo actual del producto.
                    </span>
                  )}
                </SurfaceCard>
              )}
            </div>

            {/* Listado de ítems cargados */}
            <SurfaceCard variant="surface" className="max-h-[200px] overflow-y-auto custom-scrollbar p-2">
              {items.length > 0 ? (
                <div className="divide-y divide-[#2e2e2e]">
                  {items.map((it) => (
                    <div key={it.productoOrigenId} className="flex items-center justify-between py-2.5 px-2 text-sm">
                      <div className="min-w-0 flex-1 pr-3">
                        <p className="font-semibold text-slate-100 truncate text-sm">{it.nombreProducto}</p>
                        <p className="text-xs text-slate-400 tabular-nums">
                          {it.cantidad} unidades &times; Q{it.costoUnitario.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <p className="font-semibold text-slate-100 text-sm tabular-nums">
                          Q{(it.cantidad * it.costoUnitario).toFixed(2)}
                        </p>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          disabled={controlsDisabled}
                          onClick={() => handleRemoveItem(it.productoOrigenId)}
                          className="h-8 w-8 rounded-full bg-rose-500/15 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/25 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400 gap-2">
                  <ShoppingCart className="h-9 w-9 text-slate-500 stroke-[1.75]" />
                  <p className="text-sm font-medium">Aún no has agregado productos</p>
                </div>
              )}
            </SurfaceCard>

            {/* Observaciones */}
            <div className="space-y-1">
              <Label htmlFor="obsEnvio" className="text-xs font-medium ml-1 text-slate-300 block">
                Observaciones (opcional)
              </Label>
              <Textarea
                id="obsEnvio"
                placeholder="Ej: Reabastecimiento o motivo del traslado..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                disabled={controlsDisabled}
                className="bg-[#252526] border-[#2e2e2e] text-slate-100 text-xs rounded-2xl min-h-[52px] resize-none p-3"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 shrink-0 flex-row items-center justify-between sm:justify-between gap-2 sm:space-x-0">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-full h-9 px-5 text-xs font-medium bg-[#252526] hover:bg-[#313131] text-slate-200 border border-[#2e2e2e]"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || items.length === 0 || !sucursalDestinoId}
              className="rounded-full h-9 px-6 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Despachando...
                </>
              ) : (
                <>
                  <PackageCheck className="mr-2 h-4 w-4" />
                  Despachar Traslado
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
