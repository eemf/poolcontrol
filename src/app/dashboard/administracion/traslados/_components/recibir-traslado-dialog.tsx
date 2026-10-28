'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PackageCheck,
  CheckCircle2,
  Loader2,
  Building2,
  Calendar,
  User,
  Boxes,
  FileCheck2,
  ArrowRightLeft,
  Search,
  Check,
  Sparkles
} from 'lucide-react';
import type { TrasladoInterSucursal, ItemTraslado, Producto } from '@/lib/tipos';
import { recibirTrasladoInterSucursal } from '@/lib/firebase/servicios/traslados';
import { useFirebase, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  traslado: TrasladoInterSucursal | null;
  productosLocales?: Producto[];
  onSuccess?: () => void;
}

function SelectorProductoDestino({
  itemOriginal,
  selectedId,
  onChange,
  productosLocales,
}: {
  itemOriginal: ItemTraslado;
  selectedId: string;
  onChange: (id: string) => void;
  productosLocales: Producto[];
}) {
  const [filtro, setFiltro] = useState('');

  const productosFiltrados = useMemo(() => {
    if (!filtro.trim()) return productosLocales;
    const q = filtro.toLowerCase();
    return productosLocales.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        (p.idProducto && p.idProducto.toString().includes(q))
    );
  }, [productosLocales, filtro]);

  const productoSeleccionado = productosLocales.find((p) => p.id === selectedId);
  const isNuevo = selectedId === '__nuevo__';
  const esMismoNombre = productoSeleccionado?.nombre.trim().toLowerCase() === itemOriginal.nombreProducto.trim().toLowerCase();

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium flex items-center gap-1.5">
          <ArrowRightLeft className="h-3 w-3 text-primary" />
          Aumentar inventario en el producto local:
        </span>
        {isNuevo ? (
          <span className="text-[11px] text-amber-400 font-medium bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
            Se creará como nuevo
          </span>
        ) : (
          <span className="text-[11px] text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            Stock: {productoSeleccionado?.existencia ?? 0} ➔ {(productoSeleccionado?.existencia ?? 0) + itemOriginal.cantidad} uds
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        {productosLocales.length > 5 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Filtrar lista de productos locales..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-8 text-xs bg-[#131b26] border-[#2d3e55] text-white h-8 rounded-xl"
            />
          </div>
        )}

        <Select value={selectedId || '__nuevo__'} onValueChange={onChange}>
          <SelectTrigger className="w-full bg-[#182330] border-[#2d3e55] hover:bg-[#202e3f] text-white text-xs h-10 rounded-xl px-3 font-normal">
            <SelectValue placeholder="Seleccionar producto local..." />
          </SelectTrigger>
          <SelectContent className="bg-[#1b2533] border-[#2c3b4f] text-slate-100 max-h-64 rounded-xl z-50">
            <SelectItem value="__nuevo__" className="text-emerald-400 font-bold py-2 text-xs cursor-pointer">
              + Crear como producto nuevo (&quot;{itemOriginal.nombreProducto}&quot;)
            </SelectItem>
            <SelectSeparator className="bg-[#2d3e55]" />
            <SelectGroup>
              <SelectLabel className="text-[10px] text-slate-400 font-semibold px-2 py-1">
                Vincular a producto existente en esta sucursal:
              </SelectLabel>
              {productosFiltrados.length === 0 ? (
                <div className="py-2 px-3 text-xs text-slate-400 italic">
                  No se encontraron productos locales que coincidan.
                </div>
              ) : (
                productosFiltrados.map((prod) => (
                  <SelectItem key={prod.id} value={prod.id} className="py-2 text-xs cursor-pointer">
                    <div className="flex items-center justify-between w-full gap-4">
                      <span className="font-semibold text-white">{prod.nombre}</span>
                      <span className="text-[11px] text-slate-400">
                        (Stock actual: {prod.existencia ?? 0} | Costo: Q{(prod.precioCompra ?? 0).toFixed(2)})
                      </span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {!isNuevo && productoSeleccionado && (
        <p className="text-[11px] text-emerald-400/90 pl-1 flex items-center gap-1.5">
          <Check className="h-3 w-3 text-emerald-400" />
          Se sumarán {itemOriginal.cantidad} unidades a &quot;{productoSeleccionado.nombre}&quot; (Stock: {productoSeleccionado.existencia ?? 0} ➔ {(productoSeleccionado.existencia ?? 0) + itemOriginal.cantidad} uds)
          {!esMismoNombre && (
            <span className="text-primary font-normal text-[10px] bg-primary/10 border border-primary/20 px-1.5 py-0.2 rounded-md">
              (Origen: {itemOriginal.nombreProducto})
            </span>
          )}
        </p>
      )}
    </div>
  );
}

export function RecibirTrasladoDialog({
  open,
  onOpenChange,
  traslado,
  productosLocales = [],
  onSuccess,
}: Props) {
  const { firestore } = useFirebase();
  const { user, profile } = useUser();
  const { toast } = useToast();

  const [observaciones, setObservaciones] = useState('');
  const [isReceiving, setIsReceiving] = useState(false);
  const [mapeoProductos, setMapeoProductos] = useState<{ [index: number]: string }>({});

  // Inicializar el mapeo de productos al abrir el modal o si cambia el ID del traslado o llegan productos locales
  useEffect(() => {
    if (!open || !traslado) {
      setMapeoProductos({});
      return;
    }

    setMapeoProductos((prev) => {
      const inicial: { [index: number]: string } = {};
      traslado.items.forEach((it, idx) => {
        // Si el usuario ya seleccionó manualmente una opción en este diálogo, conservarla
        if (prev[idx] !== undefined) {
          inicial[idx] = prev[idx];
          return;
        }
        const match = productosLocales.find(
          (p) => p.nombre.trim().toLowerCase() === it.nombreProducto.trim().toLowerCase()
        );
        inicial[idx] = match ? match.id : '__nuevo__';
      });
      return inicial;
    });
  }, [open, traslado?.id, productosLocales]);

  if (!traslado) return null;

  const fechaEnvioTexto = traslado.fechaEnvio?.toDate
    ? format(traslado.fechaEnvio.toDate(), "dd 'de' MMMM, yyyy - hh:mm a", { locale: es })
    : 'Fecha no disponible';

  const handleConfirmarRecepcion = async () => {
    if (!firestore || !user || !traslado) return;

    setIsReceiving(true);
    try {
      const usuarioNombre = profile?.nombre || user.displayName || user.email || 'Usuario';
      await recibirTrasladoInterSucursal(
        firestore,
        traslado.id,
        user.uid,
        usuarioNombre,
        observaciones.trim() || undefined,
        mapeoProductos
      );

      toast({
        title: '¡Traslado Recibido con Éxito!',
        description: `Se ingresaron ${traslado.cantidadTotalItems} unidades al inventario local y se generó la compra de traslado por Q${traslado.costoTotalTraslado.toFixed(2)}.`,
      });

      setObservaciones('');
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      console.error('Error al recibir traslado:', err);
      toast({
        title: 'Error al recibir traslado',
        description: err.message || 'Ocurrió un error inesperado al procesar la recepción.',
        variant: 'destructive',
      });
    } finally {
      setIsReceiving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-4 sm:p-6 rounded-2xl font-body bg-[#1b2533] border-[#2c3b4f] text-slate-100">
        <DialogHeader className="space-y-1 pb-3 border-b border-[#2c3b4f]">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            Confirmar Recepción de Traslado #{traslado.idTraslado}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Revisa los productos recibidos y asócialos al catálogo de esta sucursal. Puedes sumarlos a productos existentes con otro nombre o crearlos como nuevos.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1">
          {/* Tarjeta de Metadatos del Traslado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#233144]/80 border border-[#2d3e55]">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                Sucursal emisora
              </span>
              <p className="text-sm font-bold text-white">{traslado.sucursalOrigenNombre}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-amber-400" />
                Fecha de envío
              </span>
              <p className="text-xs text-slate-200">{fechaEnvioTexto}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-sky-400" />
                Despachado por
              </span>
              <p className="text-xs text-slate-200">{traslado.usuarioEnvioNombre || 'Usuario Emisor'}</p>
            </div>
          </div>

          {/* Observaciones de envío si existen */}
          {traslado.observacionesEnvio && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
              <span className="font-semibold block mb-0.5 text-amber-300">Nota del emisor:</span>
              {traslado.observacionesEnvio}
            </div>
          )}

          {/* Detalle y Mapeo de Productos a Recibir */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Boxes className="h-4 w-4 text-emerald-400" />
                Mapeo de inventario entrante ({traslado.items.length} {traslado.items.length === 1 ? 'producto' : 'productos'})
              </span>
              <span className="text-xs text-slate-400">
                Total Unidades: <strong className="text-white">{traslado.cantidadTotalItems}</strong> | Total Costo: <strong className="text-emerald-400">Q{traslado.costoTotalTraslado.toFixed(2)}</strong>
              </span>
            </div>

            <div className="space-y-2.5">
              {traslado.items.map((it, idx) => {
                const selectedVal = mapeoProductos[idx] || '__nuevo__';
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-[#2d3e55] bg-[#182330] space-y-2.5 transition-colors hover:border-[#3b4f6b]"
                  >
                    {/* Fila superior: Información del producto enviado por el origen */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#253346]">
                      <div>
                        <span className="text-[11px] text-slate-400 font-medium">Producto recibido:</span>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          {it.nombreProducto}
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            +{it.cantidad} uds
                          </span>
                        </h4>
                      </div>

                      <div className="text-left sm:text-right text-xs">
                        <span className="text-slate-400">Costo Unitario: </span>
                        <strong className="text-slate-200">Q{it.costoUnitario.toFixed(2)}</strong>
                        <span className="mx-1 text-slate-600">|</span>
                        <span className="text-slate-400">Subtotal: </span>
                        <strong className="text-emerald-400">Q{it.costoTotal.toFixed(2)}</strong>
                      </div>
                    </div>

                    {/* Selector interactivo para mapear a producto local */}
                    <SelectorProductoDestino
                      itemOriginal={it}
                      selectedId={selectedVal}
                      onChange={(newId) =>
                        setMapeoProductos((prev) => ({
                          ...prev,
                          [idx]: newId,
                        }))
                      }
                      productosLocales={productosLocales}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Impacto Contable y Operativo */}
          <div className="p-3.5 rounded-xl bg-[#202d3e] border border-emerald-500/30 flex items-start gap-3">
            <FileCheck2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-semibold text-emerald-300 block flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Efectos automáticos de la recepción:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                <li>Se incrementará el inventario del producto local seleccionado para cada ítem.</li>
                <li>El historial de Kardex registrará tanto el nombre local como el nombre original del emisor para trazabilidad.</li>
                <li>
                  Se generará una cuenta por pagar / compra de <strong className="text-white">Q{traslado.costoTotalTraslado.toFixed(2)}</strong> a favor de <strong className="text-white">&quot;Traslado: {traslado.sucursalOrigenNombre}&quot;</strong> para liquidarse en el próximo Cuadre Semanal.
                </li>
              </ul>
            </div>
          </div>

          {/* Observaciones de Recepción */}
          <div className="space-y-1.5">
            <Label htmlFor="obsRecepcion" className="text-xs text-slate-400">
              Observaciones de recepción (Opcional)
            </Label>
            <Textarea
              id="obsRecepcion"
              placeholder="Ej: Todo recibido en perfecto estado y verificado físicamente..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="bg-[#182330] border-[#2d3e55] text-white text-xs rounded-2xl min-h-[60px] resize-none p-3"
            />
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-[#2c3b4f] flex flex-col sm:flex-row gap-2 justify-end items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isReceiving}
            className="border-[#2d3e55] text-slate-300 hover:bg-[#233144] rounded-full text-xs h-11 px-6 font-semibold w-full sm:w-auto"
          >
            Regresar
          </Button>
          <Button
            type="button"
            onClick={handleConfirmarRecepcion}
            disabled={isReceiving}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full text-xs h-11 px-6 shadow-md shadow-emerald-900/30 w-full sm:w-auto flex items-center gap-2"
          >
            {isReceiving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando ingreso...
              </>
            ) : (
              <>
                <PackageCheck className="h-4 w-4" />
                Confirmar e ingresar a inventario
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
