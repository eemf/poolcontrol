'use client';

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  History,
  CheckCircle2,
  Zap,
  PlusCircle,
  CreditCard,
  Trash2,
  Gift,
  Clock,
  User,
  Layers,
  ShoppingCart,
} from 'lucide-react';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { es } from 'date-fns/locale';
import { PillTabs } from '@/components/comunes';
import type { MovimientoRecientePOS } from '../_types/movimiento-pos';

interface DialogoUltimosMovimientosProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movimientos: MovimientoRecientePOS[];
}

function esIdValido(id: any): string | null {
  if (id === null || id === undefined) return null;
  const str = String(id).trim();
  if (!str || str.toLowerCase() === 'undefined' || str.toLowerCase() === 'null' || str === '0') {
    return null;
  }
  return str;
}

export function DialogoUltimosMovimientos({
  open,
  onOpenChange,
  movimientos,
}: DialogoUltimosMovimientosProps) {
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'ventas' | 'cobros'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 280);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const conteoVentas = useMemo(
    () =>
      movimientos.filter((m) =>
        ['venta_rapida', 'venta_creada', 'productos_agregados', 'consumo_interno'].includes(m.tipo)
      ).length,
    [movimientos]
  );

  const conteoCobros = useMemo(
    () => movimientos.filter((m) => ['pago', 'abono', 'venta_rapida'].includes(m.tipo)).length,
    [movimientos]
  );

  const movimientosFiltrados = useMemo(() => {
    let lista = movimientos;

    if (filtroTipo === 'ventas') {
      lista = lista.filter((m) =>
        ['venta_rapida', 'venta_creada', 'productos_agregados', 'consumo_interno'].includes(m.tipo)
      );
    } else if (filtroTipo === 'cobros') {
      lista = lista.filter((m) => ['pago', 'abono', 'venta_rapida'].includes(m.tipo));
    }

    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      lista = lista.filter((m) => {
        const enTitulo = m.titulo?.toLowerCase().includes(q);
        const enDesc = m.descripcion?.toLowerCase().includes(q);
        const enCliente = m.clienteNombre?.toLowerCase().includes(q);
        const enVentaId = m.idVenta ? String(m.idVenta).includes(q) : false;
        const enItems = m.items?.some((i) => i.nombre.toLowerCase().includes(q));
        return enTitulo || enDesc || enCliente || enVentaId || enItems;
      });
    }

    return lista;
  }, [movimientos, filtroTipo, busqueda]);

  const renderBadgeTipo = (tipo: MovimientoRecientePOS['tipo']) => {
    switch (tipo) {
      case 'venta_rapida':
        return (
          <Badge className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-semibold h-5 rounded-full px-2 gap-1 shrink-0">
            <Zap className="h-3 w-3" />
            Venta Rápida
          </Badge>
        );
      case 'venta_creada':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold h-5 rounded-full px-2 gap-1 shrink-0">
            <CheckCircle2 className="h-3 w-3" />
            Cuenta Creada
          </Badge>
        );
      case 'productos_agregados':
        return (
          <Badge className="bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[10px] font-semibold h-5 rounded-full px-2 gap-1 shrink-0">
            <PlusCircle className="h-3 w-3" />
            Productos Agregados
          </Badge>
        );
      case 'pago':
      case 'abono':
        return (
          <Badge className="bg-teal-500/15 text-teal-300 border border-teal-500/30 text-[10px] font-semibold h-5 rounded-full px-2 gap-1 shrink-0">
            <CreditCard className="h-3 w-3" />
            {tipo === 'abono' ? 'Abono Registrado' : 'Cobro de Cuenta'}
          </Badge>
        );
      case 'item_eliminado':
        return (
          <Badge className="bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-semibold h-5 rounded-full px-2 gap-1 shrink-0">
            <Trash2 className="h-3 w-3" />
            Ítem Eliminado
          </Badge>
        );
      case 'consumo_interno':
        return (
          <Badge className="bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-semibold h-5 rounded-full px-2 gap-1 shrink-0">
            <Gift className="h-3 w-3" />
            Cortesía
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-700 text-slate-300 text-[10px] font-semibold h-5 rounded-full px-2">
            Operación
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-[94vw] max-w-xl bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 p-4 sm:p-5 rounded-2xl shadow-2xl font-body overflow-hidden flex flex-col max-h-[88vh]">
        {/* Cabecera del diálogo */}
        <DialogHeader className="text-left">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <History className="h-4.5 w-4.5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-100 leading-tight">
                Últimos Movimientos del Turno
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Auditoría inmediata de ventas, despachos y cobros registrados en el Punto de Venta.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Control Estándar: Buscador a la izquierda y Pestañas a la derecha */}
        <div className="pt-1">
          <PillTabs
            value={filtroTipo}
            onValueChange={(v) => {
              setFiltroTipo(v as 'todos' | 'ventas' | 'cobros');
              setTimeout(() => searchInputRef.current?.focus(), 20);
            }}
            searchValue={busqueda}
            onSearchChange={setBusqueda}
            searchPlaceholder="Buscar cliente, venta o producto..."
            searchInputRef={searchInputRef}
            tabs={[
              {
                id: 'todos',
                label: 'Todos',
                icon: Layers,
                count: movimientos.length,
                badgeVariant: filtroTipo === 'todos' ? 'amber' : 'sky',
              },
              {
                id: 'ventas',
                label: 'Ventas',
                icon: ShoppingCart,
                count: conteoVentas,
                badgeVariant: filtroTipo === 'ventas' ? 'amber' : 'sky',
              },
              {
                id: 'cobros',
                label: 'Cobros',
                icon: CreditCard,
                count: conteoCobros,
                badgeVariant: filtroTipo === 'cobros' ? 'amber' : 'sky',
              },
            ]}
          />
        </div>

        {/* Listado de movimientos con scroll fluido sin paginación */}
        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-0 sm:pr-1 max-h-[62vh] pt-1">
          {movimientosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 border border-dashed border-[#2e2e2e] rounded-xl bg-[#252526]/40 p-6">
              <Clock className="h-8 w-8 text-slate-500 mb-2" />
              <p className="text-sm font-semibold text-slate-200">
                {busqueda ? 'No se encontraron resultados' : 'No hay movimientos registrados'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 max-w-sm">
                {busqueda
                  ? 'Intenta con otro término de búsqueda o limpia el filtro.'
                  : 'Las ventas, adición de productos a cuentas y cobros de este turno aparecerán aquí.'}
              </p>
            </div>
          ) : (
            movimientosFiltrados.map((mov) => {
              const fecha = new Date(mov.fecha);
              const tiempoAtras = formatDistanceToNowStrict(fecha, { locale: es });
              const idVentaStr = esIdValido(mov.idVenta);
              const horaCorta = format(fecha, 'hh:mm a');

              return (
                <div
                  key={mov.id}
                  className="rounded-xl bg-[#252526] border border-[#2e2e2e] px-3 py-2.5 space-y-1 hover:border-[#383838] transition-colors"
                >
                  {/* Fila 1: Tipo + #Venta + Cliente | Monto Total a la derecha */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                      {renderBadgeTipo(mov.tipo)}

                      {idVentaStr && (
                        <span className="text-[11px] font-bold tabular-nums text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20 shrink-0">
                          #{idVentaStr}
                        </span>
                      )}

                      {mov.promocionNombre && (
                        <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
                          {mov.promocionNombre}
                        </span>
                      )}

                      {mov.clienteNombre && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-slate-100 truncate">
                          <User className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">{mov.clienteNombre}</span>
                        </span>
                      )}
                    </div>

                    {mov.montoTotal !== undefined && (
                      <span className="font-bold text-sm text-sky-400 tabular-nums shrink-0">
                        Q{mov.montoTotal.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Fila 2: Artículos en línea o descripción */}
                  {mov.items && mov.items.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-slate-200 leading-snug">
                      {mov.items.map((it, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1">
                          <strong className="text-sky-400 font-bold tabular-nums">{it.cantidad}x</strong>
                          <span>{it.nombre}</span>
                          {it.subtotal !== undefined && mov.items!.length > 1 && (
                            <span className="text-[11px] text-slate-400 tabular-nums">
                              (Q{it.subtotal.toFixed(2)})
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300 leading-snug line-clamp-2">
                      {mov.descripcion}
                    </p>
                  )}

                  {/* Fila 3: Metadatos compactos en una sola línea */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 flex-wrap">
                    <span className="text-sky-400 font-medium">Hace {tiempoAtras}</span>
                    <span className="tabular-nums text-slate-500">({horaCorta})</span>
                    {mov.metodoPago && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-300 font-medium">{mov.metodoPago}</span>
                      </>
                    )}
                    {mov.usuarioNombre && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span className="truncate max-w-[160px] sm:max-w-[240px]">
                          {mov.usuarioNombre}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pie del modal */}
        <div className="pt-1 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400 truncate">
            Mostrando <strong className="text-slate-200 font-bold">{movimientosFiltrados.length}</strong> operaciones del turno en tiempo real.
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="rounded-full h-9 px-5 text-xs font-medium border border-[#2e2e2e] bg-[#252526] hover:bg-[#313131] text-slate-200 shrink-0"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
