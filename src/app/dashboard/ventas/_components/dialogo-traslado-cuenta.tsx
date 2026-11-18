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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AutocompleteInput, type AutocompleteOption } from '@/components/ui/autocomplete-input';
import { PillTabs, SurfaceCard, CountBadge } from '@/components/comunes';
import {
  ArrowRightLeft,
  User,
  Layers,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  Minus,
  Plus,
  Loader2,
  CheckSquare,
  ListFilter,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Venta, Cliente } from '@/lib/tipos';
import type { DestinoTraslado, ItemATrasladar } from '@/lib/firebase/servicios/ventas';

interface DialogoTrasladoCuentaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ventaOrigen: Venta | null;
  ventasPendientes: Venta[];
  clientes: Cliente[];
  onConfirmarTraslado: (datos: {
    ventaOrigenId: string;
    destino: DestinoTraslado;
    items: ItemATrasladar[];
  }) => Promise<void>;
  procesando: boolean;
}

export function DialogoTrasladoCuenta({
  open,
  onOpenChange,
  ventaOrigen,
  ventasPendientes,
  clientes,
  onConfirmarTraslado,
  procesando,
}: DialogoTrasladoCuentaProps) {
  // Estado de destino: 'existente' o 'nueva'
  const [tipoDestino, setTipoDestino] = useState<'existente' | 'nueva'>('existente');
  const [ventaDestinoId, setVentaDestinoId] = useState<string>('');
  const [clienteNuevoId, setClienteNuevoId] = useState<string>('');
  const clienteSearchInputRef = useRef<HTMLInputElement>(null);

  // Modo de traslado: 'todo' o 'parcial'
  const [modoTraslado, setModoTraslado] = useState<'todo' | 'parcial'>('todo');

  // Mapa de items y cantidades seleccionadas para traslado: idDetalle -> cantidad
  const [cantidadesSeleccionadas, setCantidadesSeleccionadas] = useState<Record<number, number>>({});

  // Cuentas destino elegibles (todas las pendientes excepto la de origen)
  const cuentasDestinoDisponibles = useMemo(() => {
    if (!ventaOrigen) return [];
    return ventasPendientes.filter((v) => v.id !== ventaOrigen.id && v.estado === 'Pendiente de pago');
  }, [ventasPendientes, ventaOrigen]);

  // Inicializar estado cuando se abre el diálogo
  useEffect(() => {
    if (open && ventaOrigen) {
      if (cuentasDestinoDisponibles.length > 0) {
        setTipoDestino('existente');
        setVentaDestinoId(cuentasDestinoDisponibles[0].id);
      } else {
        setTipoDestino('nueva');
        setVentaDestinoId('');
      }

      setModoTraslado('todo');
      setClienteNuevoId('');

      const inicial: Record<number, number> = {};
      ventaOrigen.detalles.forEach((det) => {
        if (det.estado !== 'Pagada' && det.saldo > 0) {
          inicial[det.idDetalle] = det.cantidad;
        }
      });
      setCantidadesSeleccionadas(inicial);
    }
  }, [open, ventaOrigen, cuentasDestinoDisponibles]);

  // Auto-foco en el buscador de cliente al activar la pestaña "Nueva Cuenta"
  useEffect(() => {
    if (open && tipoDestino === 'nueva') {
      const timer = setTimeout(() => {
        clienteSearchInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [open, tipoDestino]);

  // Venta destino seleccionada
  const ventaDestinoSeleccionada = useMemo(() => {
    return cuentasDestinoDisponibles.find((v) => v.id === ventaDestinoId);
  }, [cuentasDestinoDisponibles, ventaDestinoId]);

  // Cliente nuevo seleccionado
  const clienteNuevoSeleccionado = useMemo(() => {
    return clientes.find((c) => c.id === clienteNuevoId);
  }, [clientes, clienteNuevoId]);

  // Opciones de clientes para el AutocompleteInput (excluyendo al mismo cliente origen)
  const opcionesClientesDestino = useMemo<AutocompleteOption[]>(() => {
    return clientes
      .filter((c) => c.id !== ventaOrigen?.clienteId)
      .map((c) => ({
        value: c.id,
        label: c.nombre,
        description: c.telefono ? `Tel: ${c.telefono}` : undefined,
      }));
  }, [clientes, ventaOrigen?.clienteId]);

  // Items de la venta origen elegibles para traslado (pendientes de cobro)
  const itemsElegibles = useMemo(() => {
    if (!ventaOrigen) return [];
    return ventaOrigen.detalles.filter((d) => d.estado !== 'Pagada' && d.saldo > 0);
  }, [ventaOrigen]);

  // Manejo de cantidades en modo parcial
  const handleToggleItem = (idDetalle: number, maxCantidad: number) => {
    setCantidadesSeleccionadas((prev) => {
      const nuevo = { ...prev };
      if (nuevo[idDetalle] && nuevo[idDetalle] > 0) {
        delete nuevo[idDetalle];
      } else {
        nuevo[idDetalle] = maxCantidad;
      }
      return nuevo;
    });
  };

  const handleModificarCantidad = (idDetalle: number, delta: number, maxCantidad: number) => {
    setCantidadesSeleccionadas((prev) => {
      const actual = prev[idDetalle] || 0;
      const nuevoValor = Math.max(1, Math.min(maxCantidad, actual + delta));
      return {
        ...prev,
        [idDetalle]: nuevoValor,
      };
    });
  };

  // Cálculo de totales a trasladar
  const { montoATrasladar, itemsFinalesATrasladar } = useMemo(() => {
    if (!ventaOrigen) {
      return { montoATrasladar: 0, itemsFinalesATrasladar: [] };
    }

    const items: ItemATrasladar[] = [];
    let monto = 0;

    itemsElegibles.forEach((det) => {
      const cant = modoTraslado === 'todo' ? det.cantidad : cantidadesSeleccionadas[det.idDetalle] || 0;
      if (cant > 0) {
        const subtotal = Math.round(cant * det.precioUnitario * 100) / 100;
        monto += subtotal;
        items.push({ idDetalle: det.idDetalle, cantidad: cant });
      }
    });

    return {
      montoATrasladar: monto,
      itemsFinalesATrasladar: items,
    };
  }, [ventaOrigen, itemsElegibles, modoTraslado, cantidadesSeleccionadas]);

  // Validaciones
  const saldoOrigenActual = ventaOrigen?.saldo || 0;
  const saldoOrigenRestante = Math.max(0, saldoOrigenActual - montoATrasladar);
  const seEliminaOrigen =
    saldoOrigenRestante <= 0.001 || itemsFinalesATrasladar.length === itemsElegibles.length;

  const saldoDestinoActual =
    tipoDestino === 'existente' ? ventaDestinoSeleccionada?.saldo || 0 : 0;
  const saldoDestinoFinal = saldoDestinoActual + montoATrasladar;

  const puedeConfirmar =
    itemsFinalesATrasladar.length > 0 &&
    montoATrasladar > 0 &&
    (tipoDestino === 'existente' ? Boolean(ventaDestinoId) : Boolean(clienteNuevoId));

  const handleConfirmar = async () => {
    if (!puedeConfirmar || !ventaOrigen) return;

    let destino: DestinoTraslado;
    if (tipoDestino === 'existente') {
      destino = { tipo: 'existente', ventaId: ventaDestinoId };
    } else {
      destino = {
        tipo: 'nueva',
        clienteId: clienteNuevoSeleccionado!.id,
        nombreCliente: clienteNuevoSeleccionado!.nombre,
      };
    }

    await onConfirmarTraslado({
      ventaOrigenId: ventaOrigen.id,
      destino,
      items: itemsFinalesATrasladar,
    });
  };

  if (!ventaOrigen) return null;

  return (
    <Dialog open={open} onOpenChange={(val) => !procesando && onOpenChange(val)}>
      <DialogContent className="sm:max-w-xl w-[95vw] max-w-lg bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 p-4 sm:p-6 rounded-2xl shadow-2xl font-body overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera Estándar */}
        <DialogHeader className="space-y-1 pb-3 border-b border-[#2e2e2e] text-left shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-100 leading-tight">
                Traslado de Cuenta
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Traspasa toda la cuenta o productos específicos a otro cliente.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Contenido scrolleable (px-1.5 -mx-1.5 evita que bordes y anillos de foco se recorten en la orilla) */}
        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar px-1.5 py-2 -mx-1.5">
          {/* Ficha Cuenta Origen (SurfaceCard surface) */}
          <SurfaceCard
            variant="surface"
            className="p-3 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Cuenta de Origen
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <User className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                <span className="text-sm font-bold text-slate-100 truncate">
                  {ventaOrigen.nombreCliente}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  (#{ventaOrigen.idVenta})
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] text-slate-400 block">Saldo Actual</span>
              <span className="text-sm font-black text-amber-400 tabular-nums">
                Q{saldoOrigenActual.toFixed(2)}
              </span>
            </div>
          </SurfaceCard>

          {/* Paso 1: Selección de Destino con PillTabs oficial */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-200 block">
              1. ¿A quién se le transfiere la cuenta?
            </label>

            <PillTabs
              value={tipoDestino}
              onValueChange={(val) => setTipoDestino(val as 'existente' | 'nueva')}
              tabs={[
                {
                  id: 'existente',
                  label: 'Cuenta Activa',
                  icon: Layers,
                  count: cuentasDestinoDisponibles.length,
                },
                {
                  id: 'nueva',
                  label: 'Nueva Cuenta',
                  icon: UserPlus,
                },
              ]}
            />

            {/* Selector cuando es Cuenta Existente */}
            {tipoDestino === 'existente' && (
              <div>
                {cuentasDestinoDisponibles.length === 0 ? (
                  <SurfaceCard
                    variant="surface"
                    className="p-3 text-center text-xs text-slate-400 border-dashed"
                  >
                    No hay otras cuentas abiertas en este turno.{' '}
                    <button
                      type="button"
                      onClick={() => setTipoDestino('nueva')}
                      className="text-sky-400 hover:underline font-bold"
                    >
                      Crear nueva cuenta para el cliente
                    </button>
                  </SurfaceCard>
                ) : (
                  <Select value={ventaDestinoId} onValueChange={setVentaDestinoId}>
                    <SelectTrigger className="w-full h-10 rounded-full px-4 bg-[#252526] border-[#2e2e2e] text-slate-100 text-xs focus:ring-1 focus:ring-sky-500">
                      <SelectValue placeholder="Selecciona la cuenta de destino..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-200 rounded-xl shadow-2xl max-h-56">
                      {cuentasDestinoDisponibles.map((v) => (
                        <SelectItem
                          key={v.id}
                          value={v.id}
                          className="text-xs cursor-pointer py-2 focus:bg-[#252526]"
                        >
                          <div className="flex items-center justify-between w-full gap-4">
                            <span className="font-semibold text-slate-100">
                              {v.nombreCliente}{' '}
                              <span className="text-slate-400 font-normal font-mono">
                                (#{v.idVenta})
                              </span>
                            </span>
                            <span className="text-amber-400 font-bold tabular-nums">
                              Saldo: Q{v.saldo.toFixed(2)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Selector único cuando es Nueva Cuenta (mismo AutocompleteInput del POS, solo búsqueda) */}
            {tipoDestino === 'nueva' && (
              <div>
                <AutocompleteInput
                  id="traslado-cliente-search"
                  ref={clienteSearchInputRef}
                  options={opcionesClientesDestino}
                  value={clienteNuevoId}
                  onValueChange={setClienteNuevoId}
                  placeholder="Buscar cliente..."
                  icon={Search}
                  disabled={procesando}
                  onFocus={(e) => e.target.select()}
                />
              </div>
            )}
          </div>

          {/* Paso 2: Modo de Traslado con PillTabs oficial y SurfaceCard */}
          <div className="space-y-2.5 pt-2 border-t border-[#2e2e2e]">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-200">
                2. ¿Qué se va a trasladar?
              </label>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <span>Productos a trasladar:</span>
                <CountBadge count={itemsFinalesATrasladar.length} variant="sky" showZero />
              </div>
            </div>

            <PillTabs
              value={modoTraslado}
              onValueChange={(val) => setModoTraslado(val as 'todo' | 'parcial')}
              tabs={[
                {
                  id: 'todo',
                  label: 'Toda la Cuenta',
                  icon: CheckSquare,
                },
                {
                  id: 'parcial',
                  label: 'Elegir Productos',
                  icon: ListFilter,
                },
              ]}
            />

            {/* Listado de Productos en SurfaceCard estándar */}
            <SurfaceCard variant="surface" className="p-2.5">
              <div className="max-h-48 overflow-y-auto custom-scrollbar divide-y divide-[#2e2e2e] pr-1">
                {itemsElegibles.map((det) => {
                  const estaSeleccionado =
                    modoTraslado === 'todo' || Boolean(cantidadesSeleccionadas[det.idDetalle]);
                  const cantActual =
                    modoTraslado === 'todo'
                      ? det.cantidad
                      : cantidadesSeleccionadas[det.idDetalle] || 0;
                  const subtotalActual = cantActual * det.precioUnitario;

                  return (
                    <div
                      key={det.idDetalle}
                      onClick={
                        modoTraslado === 'parcial'
                          ? () => handleToggleItem(det.idDetalle, det.cantidad)
                          : undefined
                      }
                      className={cn(
                        'flex items-center justify-between py-2.5 px-2 transition-colors text-xs',
                        modoTraslado === 'parcial' && 'cursor-pointer hover:bg-[#1e1e1e]/60 rounded-lg',
                        !estaSeleccionado && 'opacity-55'
                      )}
                    >
                      {/* Checkbox estándar del sistema + Nombre */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {modoTraslado === 'parcial' && (
                          <Checkbox
                            checked={estaSeleccionado}
                            onCheckedChange={() => handleToggleItem(det.idDetalle, det.cantidad)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-100 truncate">
                            {modoTraslado === 'todo' ? `${det.cantidad}x ` : ''}
                            {det.nombreProducto}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Q{det.precioUnitario.toFixed(2)} c/u • Máx: {det.cantidad}
                          </p>
                        </div>
                      </div>

                      {/* Controles de Cantidad en Modo Parcial */}
                      <div
                        className="flex items-center gap-3 shrink-0 ml-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {modoTraslado === 'parcial' && estaSeleccionado && det.cantidad > 1 && (
                          <div className="flex items-center gap-1 bg-[#1e1e1e] border border-[#2e2e2e] rounded-full p-0.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleModificarCantidad(det.idDetalle, -1, det.cantidad)
                              }
                              disabled={cantActual <= 1}
                              className="h-6 w-6 rounded-full text-slate-300 hover:bg-[#313131] hover:text-white disabled:opacity-30"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-5 text-center font-bold text-slate-100 text-xs tabular-nums">
                              {cantActual}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleModificarCantidad(det.idDetalle, 1, det.cantidad)
                              }
                              disabled={cantActual >= det.cantidad}
                              className="h-6 w-6 rounded-full text-slate-300 hover:bg-[#313131] hover:text-white disabled:opacity-30"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        )}

                        {/* Subtotal */}
                        <span className="font-bold text-sky-400 tabular-nums min-w-[60px] text-right">
                          {estaSeleccionado ? `Q${subtotalActual.toFixed(2)}` : 'Q0.00'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SurfaceCard>
          </div>

          {/* Resumen de Impacto Financiero (SurfaceCard surface) */}
          <SurfaceCard variant="surface" className="p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-200">
              <span className="font-semibold">Monto total a trasladar:</span>
              <span className="text-sm font-black text-sky-400 tabular-nums">
                Q{montoATrasladar.toFixed(2)}
              </span>
            </div>

            <div className="pt-2 border-t border-[#2e2e2e] space-y-1.5 text-[11px]">
              {/* Impacto en Cuenta de Origen */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">
                  {ventaOrigen.nombreCliente} (Origen):
                </span>
                <span className="font-bold tabular-nums">
                  Q{saldoOrigenActual.toFixed(2)} ➔{' '}
                  <span className={seEliminaOrigen ? 'text-rose-400' : 'text-amber-400'}>
                    Q{saldoOrigenRestante.toFixed(2)}
                  </span>
                </span>
              </div>

              {seEliminaOrigen && (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1.5 rounded-lg">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                  <span>
                    La cuenta de <strong>{ventaOrigen.nombreCliente}</strong> quedará en Q0.00 y se{' '}
                    <strong>eliminará</strong>.
                  </span>
                </div>
              )}

              {/* Impacto en Cuenta de Destino */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">
                  {tipoDestino === 'existente'
                    ? `${ventaDestinoSeleccionada?.nombreCliente || 'Destino'} (Destino):`
                    : `${clienteNuevoSeleccionado?.nombre || 'Nuevo Cliente'} (Nueva cuenta):`}
                </span>
                <span className="font-bold text-emerald-400 tabular-nums">
                  {tipoDestino === 'existente'
                    ? `Q${saldoDestinoActual.toFixed(2)} ➔ Q${saldoDestinoFinal.toFixed(2)}`
                    : `Q${montoATrasladar.toFixed(2)}`}
                </span>
              </div>
            </div>
          </SurfaceCard>
        </div>

        {/* Pie de Modal: Cancelar a la izquierda y Confirmar a la derecha */}
        <DialogFooter className="pt-3 border-t border-[#2e2e2e] flex flex-row items-center justify-between sm:justify-between gap-2 shrink-0">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={procesando}
            className="rounded-full h-10 px-5 text-xs font-semibold bg-[#252526] hover:bg-[#2e2e2e] text-slate-200 border border-[#2e2e2e]"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            onClick={handleConfirmar}
            disabled={!puedeConfirmar || procesando}
            className="rounded-full h-10 px-5 text-xs font-semibold shadow-md"
          >
            {procesando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirmar Traslado</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
