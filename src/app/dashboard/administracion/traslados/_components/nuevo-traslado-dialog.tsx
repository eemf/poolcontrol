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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AutocompleteInput, AutocompleteOption } from '@/components/ui/autocomplete-input';
import {
  Truck,
  PlusCircle,
  Trash2,
  AlertCircle,
  Loader2,
  PackageCheck,
  Building2,
  Boxes,
  History,
  Tag
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

  const productoInputRef = useRef<HTMLInputElement>(null);
  const cantidadInputRef = useRef<HTMLInputElement>(null);
  const costoInputRef = useRef<HTMLInputElement>(null);
  const addItemButtonRef = useRef<HTMLButtonElement>(null);

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
    if (!productoSeleccionado) {
      toast({ title: 'Atención', description: 'Selecciona un producto para agregar.', variant: 'destructive' });
      return;
    }

    const cant = Number(cantidadInput);
    if (isNaN(cant) || cant <= 0) {
      toast({ title: 'Cantidad inválida', description: 'La cantidad debe ser mayor a 0.', variant: 'destructive' });
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
      return;
    }

    const costo = Number(costoInput) >= 0 ? Number(costoInput) : (productoSeleccionado.precioCompra ?? 0);

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

    // Resetear formulario de ítem
    setSelectedProductoId('');
    setCantidadInput('1');
    setCostoInput('');
    setTimeout(() => {
      productoInputRef.current?.focus();
    }, 50);
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
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-4 sm:p-6 rounded-2xl font-body bg-[#1b2533] border-[#2c3b4f] text-slate-100">
        <DialogHeader className="space-y-1 pb-3 border-b border-[#2c3b4f]">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
            <Truck className="h-5 w-5 text-primary" />
            Nuevo traslado de inventario
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Despacha productos hacia otra sucursal. El stock se descontará inmediatamente de origen y quedará en tránsito hasta que el destino lo confirme.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1">
          {/* Encabezado de Sucursales (Origen -> Destino) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#233144]/80 border border-[#2d3e55]">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 ml-1">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                Sucursal de origen (emisora)
              </Label>
              <div className="px-4 rounded-full bg-[#182330] border border-[#2d3e55] font-semibold text-sm text-white flex items-center h-11">
                {sucursalOrigenNombre || 'Sucursal actual'}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 ml-1">
                <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                Sucursal de destino (receptora) *
              </Label>
              <Select value={sucursalDestinoId} onValueChange={setSucursalDestinoId}>
                <SelectTrigger className="bg-[#182330] border-[#2d3e55] text-white h-11 rounded-full px-4 text-sm focus:ring-primary">
                  <SelectValue placeholder="Selecciona la sucursal..." />
                </SelectTrigger>
                <SelectContent className="bg-[#182330] border-[#2d3e55] text-white">
                  {sucursalesDestino.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-xs">
                      {s.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selector y agregado de productos */}
          <div className="space-y-3 p-4 rounded-2xl bg-[#233144]/80 border border-[#2d3e55]">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 ml-1">
                <Boxes className="h-4 w-4 text-primary" />
                Agregar producto al traslado
              </Label>
              {productoSeleccionado && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs rounded-full px-3 py-1 font-semibold">
                  Stock disponible: {productoSeleccionado.existencia ?? 0} uds
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
              <div className="sm:col-span-6 space-y-1.5">
                <Label htmlFor="producto-search" className="text-xs font-medium text-slate-400 ml-1">
                  Producto de origen
                </Label>
                <AutocompleteInput
                  id="producto-search"
                  ref={productoInputRef}
                  options={opcionesProductos}
                  value={selectedProductoId}
                  onValueChange={setSelectedProductoId}
                  placeholder="Buscar producto por nombre o código..."
                  onEnterKey={() => cantidadInputRef.current?.focus()}
                  onFocus={(e) => e.target.select()}
                  className="rounded-full h-11 border-[#2d3e55] bg-[#182330] text-sm text-white px-4"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="cantidad" className="text-xs font-medium text-slate-400 ml-1">
                  Cantidad
                </Label>
                <Input
                  id="cantidad"
                  ref={cantidadInputRef}
                  type="number"
                  min="1"
                  max={productoSeleccionado?.existencia ?? 99999}
                  value={cantidadInput}
                  onChange={(e) => setCantidadInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      costoInputRef.current?.focus();
                    }
                  }}
                  className="bg-[#182330] border-[#2d3e55] text-white h-11 rounded-full text-sm text-center font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="costo" className="text-xs font-medium text-slate-400 ml-1">
                  Costo unitario
                </Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                    Q
                  </span>
                  <Input
                    id="costo"
                    ref={costoInputRef}
                    type="number"
                    step="0.01"
                    min="0"
                    value={costoInput}
                    onChange={(e) => setCostoInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItemButtonRef.current?.focus();
                      }
                    }}
                    className="w-full pl-8 bg-[#182330] border-[#2d3e55] text-white h-11 rounded-full text-sm font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <Button
                  type="button"
                  ref={addItemButtonRef}
                  onClick={handleAddItem}
                  disabled={!selectedProductoId}
                  className="w-full rounded-full h-11 px-6 font-bold shadow-md shadow-primary/20 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="h-4 w-4" />
                  Agregar
                </Button>
              </div>
            </div>

            {/* Historial de precios de compra */}
            {selectedProductoId && (
              <div className="pt-2.5 border-t border-[#2d3e55]/60 flex flex-wrap items-center gap-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                  <History className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-xs font-semibold text-slate-300">
                    Historial de precios de compra:
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
                            costoInputRef.current?.focus();
                          }}
                          title={`Aplicar costo Q${item.costoUnitario.toFixed(2)} (${item.proveedorNombre || 'Compra previa'})`}
                          className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer',
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm ring-1 ring-primary/40 font-bold'
                              : 'bg-[#182330] hover:bg-[#202d3e] border-[#2d3e55] hover:border-primary/40 text-slate-200'
                          )}
                        >
                          <span className={cn('text-xs font-bold', isSelected ? 'text-white' : 'text-emerald-400')}>
                            Q{item.costoUnitario.toFixed(2)}
                          </span>
                          <span className={cn('text-[10px]', isSelected ? 'text-primary-foreground/90' : 'text-slate-400')}>
                            {item.idCompra > 0 ? format(item.fecha, 'dd/MM/yy') : 'Catálogo'}
                          </span>
                          {idx === 0 && (
                            <span
                              className={cn(
                                'text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                                isSelected ? 'bg-white/25 text-white' : 'bg-primary/20 text-primary-foreground'
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
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Tag className="h-3 w-3 opacity-60" />
                    Sin historial de compras registrado. Se utilizará el costo actual del producto.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Tabla de ítems en el traslado */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-300">
                Productos a trasladar ({items.length})
              </span>
              <span className="text-xs text-slate-400">
                Total unidades: <strong className="text-white">{totalCantidad}</strong> | Total costo: <strong className="text-emerald-400">Q{totalCosto.toFixed(2)}</strong>
              </span>
            </div>

            <div className="rounded-2xl border border-[#2d3e55] overflow-hidden bg-[#182330]">
              <Table>
                <TableHeader className="bg-[#202d3e] text-slate-300">
                  <TableRow className="border-[#2d3e55] hover:bg-transparent">
                    <TableHead className="text-slate-300 text-xs py-2.5">Producto</TableHead>
                    <TableHead className="text-slate-300 text-xs text-center py-2.5">Cantidad</TableHead>
                    <TableHead className="text-slate-300 text-xs text-right py-2.5">Costo unitario</TableHead>
                    <TableHead className="text-slate-300 text-xs text-right py-2.5">Subtotal</TableHead>
                    <TableHead className="w-12 py-2.5 text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow className="border-[#2d3e55]">
                      <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-400">
                        Aún no has agregado productos a este traslado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((it) => (
                      <TableRow key={it.productoOrigenId} className="border-[#2d3e55] hover:bg-[#233144]">
                        <TableCell className="py-2.5 text-xs font-medium text-white">
                          {it.nombreProducto}
                        </TableCell>
                        <TableCell className="py-2.5 text-xs text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {it.cantidad}
                          </span>
                        </TableCell>
                        <TableCell className="py-2.5 text-xs text-right text-slate-300">
                          Q{it.costoUnitario.toFixed(2)}
                        </TableCell>
                        <TableCell className="py-2.5 text-xs text-right font-bold text-emerald-400">
                          Q{(it.cantidad * it.costoUnitario).toFixed(2)}
                        </TableCell>
                        <TableCell className="py-2.5 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(it.productoOrigenId)}
                            className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-1.5">
            <Label htmlFor="obsEnvio" className="text-xs text-slate-400 ml-1">
              Observaciones o motivo del traslado (opcional)
            </Label>
            <Textarea
              id="obsEnvio"
              placeholder="Ej: Reabastecimiento de urgencia, traslado temporal de bebidas..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="bg-[#182330] border-[#2d3e55] text-white text-xs rounded-2xl min-h-[64px] resize-none p-3"
            />
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-[#2c3b4f] flex flex-col sm:flex-row gap-2 justify-between items-center">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>El costo de traslado quedará registrado para la liquidación semanal del receptor.</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="border-[#2d3e55] text-slate-300 hover:bg-[#233144] rounded-full text-xs h-11 px-6 font-semibold flex-1 sm:flex-initial"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || items.length === 0 || !sucursalDestinoId}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full text-xs h-11 px-6 shadow-md shadow-primary/20 flex-1 sm:flex-initial flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Despachando...
                </>
              ) : (
                <>
                  <PackageCheck className="h-4 w-4" />
                  Despachar traslado (Q{totalCosto.toFixed(2)})
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
