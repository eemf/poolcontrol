'use client';

import React, { useMemo } from 'react';
import { SurfaceCard, PillTabs } from '@/components/comunes';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from "@/components/ui/button";
import { 
  FileClock, 
  CreditCard, 
  Coins, 
  GlassWater, 
  Gift, 
  PencilIcon, 
  CheckCircle, 
  ReceiptText, 
  BadgeCheck, 
  BadgeHelp, 
  PieChart, 
  Clock, 
  User, 
  Sigma 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';
import type { Venta, DetalleVenta } from '@/lib/tipos';
import { PermissionGuard } from '@/components/permission-guard';
import { Separator } from '@/components/ui/separator';

const toDate = (fecha: any): Date => {
  if (fecha instanceof Timestamp) return fecha.toDate();
  if (fecha instanceof Date) return fecha;
  if (typeof fecha === 'string') {
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(0);
};

interface POSAccountsProps {
  state: {
    vistaCuentas: 'pendientes' | 'credito';
    filtroCuentas: string;
    ventasPendientes: Venta[];
    ventasACredito: Venta[];
    idVentaActiva: string | null;
    clientesConCreditoIds: Set<string>;
    clientesConConsumoInternoIds: Set<string>;
    procesandoCredito: string | null;
  };
  actions: {
    setVistaCuentas: (val: 'pendientes' | 'credito') => void;
    setFiltroCuentas: (val: string) => void;
    manejarClickEditar: (venta: Venta) => void;
    handleTap: (venta: Venta) => void;
    abrirDialogoConsumoInterno: (venta: Venta) => void;
    manejarClickPasarACredito: (venta: Venta) => void;
    abrirDialogoPago: (venta: Venta) => void;
  };
  refs: {
    filtroCuentasInputRef: React.RefObject<HTMLInputElement>;
  };
}

export function POSAccounts({ state, actions, refs }: POSAccountsProps) {
  const cuentasFiltradas = useMemo(() => {
    const listaAFiltrar = state.vistaCuentas === 'pendientes' ? state.ventasPendientes : state.ventasACredito;
    if (!state.filtroCuentas) return listaAFiltrar;
    const f = state.filtroCuentas.toLowerCase();
    return listaAFiltrar.filter(v => v.nombreCliente.toLowerCase().includes(f) || String(v.idVenta).includes(f));
  }, [state.vistaCuentas, state.ventasPendientes, state.ventasACredito, state.filtroCuentas]);

  const renderizarItemVenta = (item: DetalleVenta) => {
    const isPaid = item.estado === 'Pagada';
    const isPartiallyPaid = item.saldo < item.subtotal && item.saldo > 0.001;
    let Icono, color;
    if (isPaid) { Icono = BadgeCheck; color = 'text-green-500'; }
    else if (isPartiallyPaid) { Icono = PieChart; color = 'text-amber-500'; }
    else { Icono = BadgeHelp; color = 'text-red-500'; }
    const esItemManual = item.idProducto === 'item-manual';

    return (
      <div className="flex-1">
        <div className="flex items-center gap-2">
            {esItemManual ? <ReceiptText className="h-5 w-5 text-indigo-500 flex-shrink-0" /> : <Icono className={`h-5 w-5 ${color} flex-shrink-0`} />}
            <p className={`font-semibold leading-tight text-sm ${isPaid ? 'line-through text-muted-foreground' : ''}`}>{item.nombreProducto}</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-x-2 text-xs text-muted-foreground ml-7">
            <span className="text-xs">{item.cantidad} &times; Q{(item.precioUnitario ?? 0).toFixed(2)}</span>
            <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(toDate(item.fechaAgregado), 'hh:mm a')}
            </div>
        </div>
        {isPartiallyPaid && (
          <div className="text-xs font-bold text-muted-foreground ml-7 mt-0.5">
            Pendiente: Q{item.saldo.toFixed(2)}
          </div>
        )}
      </div>
    );
  };

  const resumenCredito = useMemo(() => {
    const totalGlobal = state.ventasACredito.reduce((acc, v) => acc + (v.saldo || 0), 0);
    const cantidadGlobal = state.ventasACredito.length;

    const textoFiltro = (state.filtroCuentas || '').trim().toLowerCase();
    const hayFiltro = textoFiltro.length > 0;

    if (!hayFiltro) {
      return {
        hayFiltro: false,
        titulo: 'Total Cuentas a Crédito',
        subtitulo: `${cantidadGlobal} ${cantidadGlobal === 1 ? 'cuenta registrada' : 'cuentas registradas'}`,
        monto: totalGlobal,
        deudaTotalGlobal: null,
      };
    }

    const totalFiltrado = cuentasFiltradas.reduce((acc, v) => acc + (v.saldo || 0), 0);
    const cantidadFiltrada = cuentasFiltradas.length;

    // Detectar si el filtro corresponde a un único cliente
    const nombresClientes = Array.from(new Set(cuentasFiltradas.map(v => v.nombreCliente).filter(Boolean)));
    const esClienteUnico = nombresClientes.length === 1;

    if (esClienteUnico) {
      const nombre = nombresClientes[0];
      const clienteId = cuentasFiltradas[0]?.clienteId;

      // Buscar si tiene saldo en cuenta actual pendiente
      const saldoPendienteActual = clienteId
        ? state.ventasPendientes.filter(v => v.clienteId === clienteId).reduce((acc, v) => acc + (v.saldo || 0), 0)
        : 0;

      return {
        hayFiltro: true,
        titulo: `Deuda de ${nombre}`,
        subtitulo: saldoPendienteActual > 0
          ? `${cantidadFiltrada} ${cantidadFiltrada === 1 ? 'crédito' : 'créditos'} (+ Q${saldoPendienteActual.toFixed(2)} cuenta actual)`
          : `${cantidadFiltrada} ${cantidadFiltrada === 1 ? 'cuenta a crédito' : 'cuentas a crédito'}`,
        monto: totalFiltrado,
        deudaTotalGlobal: saldoPendienteActual > 0 ? (totalFiltrado + saldoPendienteActual) : null,
      };
    }

    if (cantidadFiltrada > 0) {
      return {
        hayFiltro: true,
        titulo: `Total Filtrado (${nombresClientes.length} clientes)`,
        subtitulo: `${cantidadFiltrada} ${cantidadFiltrada === 1 ? 'cuenta encontrada' : 'cuentas encontradas'}`,
        monto: totalFiltrado,
        deudaTotalGlobal: null,
      };
    }

    return {
      hayFiltro: true,
      titulo: 'Sin coincidencias en crédito',
      subtitulo: `No se encontraron cuentas para "${state.filtroCuentas}"`,
      monto: 0,
      deudaTotalGlobal: null,
    };
  }, [state.ventasACredito, state.ventasPendientes, cuentasFiltradas, state.filtroCuentas]);

  return (
    <SurfaceCard variant="panel" className="w-full p-4 space-y-3.5 font-body">
      {/* Pestañas Oficiales con Lupa Expandible Integrada */}
      <PillTabs
        value={state.vistaCuentas}
        onValueChange={(value) => actions.setVistaCuentas(value as 'pendientes' | 'credito')}
        searchValue={state.filtroCuentas}
        onSearchChange={actions.setFiltroCuentas}
        searchPlaceholder="Buscar cuenta o cliente..."
        searchInputRef={refs.filtroCuentasInputRef}
        tabs={[
          {
            id: 'pendientes',
            label: 'Pendientes',
            icon: FileClock,
            count: state.ventasPendientes.length,
            badgeVariant: state.vistaCuentas === 'pendientes' ? 'amber' : 'sky',
          },
          {
            id: 'credito',
            label: 'Crédito',
            icon: CreditCard,
            count: state.ventasACredito.length,
            badgeVariant: state.vistaCuentas === 'credito' ? 'amber' : 'sky',
          },
        ]}
      />

      {/* Resumen de Total a Crédito / Deuda por Cliente */}
      {state.vistaCuentas === 'credito' && state.ventasACredito.length > 0 && (
        <SurfaceCard variant="surface" className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center shrink-0 border',
                resumenCredito.hayFiltro
                  ? 'bg-sky-500/15 border-sky-500/30 text-sky-400'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
              )}
            >
              {resumenCredito.hayFiltro ? (
                <User className="w-4 h-4" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-100 truncate">
                {resumenCredito.titulo}
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                {resumenCredito.subtitulo}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0 pl-2">
            <span className="text-base font-bold text-sky-400 tabular-nums tracking-tight">
              Q{resumenCredito.monto.toFixed(2)}
            </span>
            {resumenCredito.deudaTotalGlobal !== null && (
              <span className="text-[10px] text-slate-400 font-medium">
                Total:{' '}
                <span className="text-amber-400 font-bold tabular-nums">
                  Q{resumenCredito.deudaTotalGlobal.toFixed(2)}
                </span>
              </span>
            )}
          </div>
        </SurfaceCard>
      )}

      {cuentasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400 gap-2">
          <div className="w-12 h-12 rounded-full bg-[#252526] border border-[#2e2e2e] flex items-center justify-center text-slate-500">
            {state.vistaCuentas === 'pendientes' ? (
              <FileClock className="h-5 w-5" />
            ) : (
              <CreditCard className="h-5 w-5" />
            )}
          </div>
          <p className="text-xs">
            No hay cuentas {state.vistaCuentas === 'pendientes' ? 'pendientes' : 'a crédito'}.
          </p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-2.5">
          {cuentasFiltradas.map((venta) => {
            const tieneCredito = state.clientesConCreditoIds.has(venta.clienteId);
            const permiteConsumoInterno = state.clientesConConsumoInternoIds.has(venta.clienteId);
            const totalMonedas = venta.detalles
              .filter((d) => d.esVirtual)
              .reduce((acc, item) => acc + item.subtotal, 0);
            const saldoMonedas = venta.detalles
              .filter((d) => d.esVirtual)
              .reduce((acc, item) => acc + item.saldo, 0);
            const pagadoMonedas = totalMonedas - saldoMonedas;
            const totalConsumo = venta.detalles
              .filter((d) => !d.esVirtual)
              .reduce((acc, item) => acc + item.subtotal, 0);
            const saldoConsumo = venta.detalles
              .filter((d) => !d.esVirtual)
              .reduce((acc, item) => acc + item.saldo, 0);
            const pagadoConsumo = totalConsumo - saldoConsumo;
            const esVentaCredito = venta.estado === 'credito';

            // Lógica para mostrar totales cuando hay crédito asociado
            const mostrarDesgloseDeuda = state.vistaCuentas === 'pendientes' && tieneCredito;
            const saldoCredito = mostrarDesgloseDeuda
              ? state.ventasACredito
                  .filter((v) => v.clienteId === venta.clienteId)
                  .reduce((acc, v) => acc + v.saldo, 0)
              : 0;

            return (
              <AccordionItem
                value={venta.id}
                key={venta.id}
                className={cn(
                  'border rounded-xl transition-all overflow-hidden',
                  state.idVentaActiva === venta.id
                    ? 'border-sky-500 bg-sky-500/10'
                    : 'bg-[#252526] border-[#2e2e2e]'
                )}
              >
                <AccordionTrigger
                  className="p-3.5 hover:no-underline transition-colors"
                  onDoubleClick={esVentaCredito ? undefined : () => actions.manejarClickEditar(venta)}
                  handleTap={esVentaCredito ? undefined : () => actions.handleTap(venta)}
                >
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 w-full text-left pr-2">
                    <div className="col-span-2 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <User className="h-4 w-4 text-sky-400 shrink-0" />
                          <p className="text-sm font-bold text-slate-100 truncate leading-tight">
                            {venta.nombreCliente}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-sky-400 tabular-nums leading-tight shrink-0">
                          Q{venta.saldo.toFixed(2)}
                        </p>
                      </div>

                      {mostrarDesgloseDeuda && (
                        <>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <CreditCard className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                              <span className="text-xs font-semibold text-slate-300 leading-tight">
                                Crédito
                              </span>
                            </div>
                            <span className="text-xs font-bold text-amber-400 tabular-nums leading-tight">
                              Q{saldoCredito.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-end py-0.5">
                            <Separator className="w-16 bg-[#2e2e2e]" />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <Sigma className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              <span className="text-xs font-bold text-slate-100 leading-tight">
                                Total
                              </span>
                            </div>
                            <span className="text-sm font-bold text-emerald-400 tabular-nums leading-tight">
                              Q{(venta.saldo + saldoCredito).toFixed(2)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="col-span-1 flex flex-col text-xs text-slate-400 mt-0.5">
                      <span>Venta #{venta.idVenta}</span>
                      <span className="flex items-center gap-1 tabular-nums">
                        <Coins className="h-3 w-3 text-amber-400" /> {pagadoMonedas.toFixed(2)}/
                        {totalMonedas.toFixed(2)}
                      </span>
                    </div>
                    <div className="col-span-1 flex flex-col text-xs text-slate-400 items-end mt-0.5">
                      <span>{format(toDate(venta.fecha), 'dd/MM/yy', { locale: es })}</span>
                      <span className="flex items-center gap-1 tabular-nums">
                        <GlassWater className="h-3 w-3 text-sky-400" /> {pagadoConsumo.toFixed(2)}/
                        {totalConsumo.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3.5 pb-3.5 pt-0">
                  <div className="border-t border-[#2e2e2e] pt-3 space-y-3">
                    <div className="flex items-center justify-center gap-1.5 flex-nowrap w-full">
                      {permiteConsumoInterno && (
                        <Button
                          type="button"
                          className="h-7 px-2.5 rounded-full text-[11px] font-semibold bg-violet-500/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/35 shadow-sm transition-colors shrink-0"
                          onClick={() => actions.abrirDialogoConsumoInterno(venta)}
                          disabled={state.idVentaActiva === venta.id}
                        >
                          <Gift className="mr-1 h-3 w-3 shrink-0" />
                          Cortesía
                        </Button>
                      )}

                      {esVentaCredito ? (
                        <PermissionGuard permission="ventas.editar_credito">
                          <Button
                            type="button"
                            className="h-7 px-2.5 rounded-full text-[11px] font-semibold bg-sky-500/20 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/35 shadow-sm transition-colors shrink-0"
                            onClick={() => actions.manejarClickEditar(venta)}
                            disabled={state.idVentaActiva === venta.id}
                          >
                            <PencilIcon className="mr-1 h-3 w-3 shrink-0" />
                            Editar
                          </Button>
                        </PermissionGuard>
                      ) : (
                        <Button
                          type="button"
                          className="h-7 px-2.5 rounded-full text-[11px] font-semibold bg-sky-500/20 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/35 shadow-sm transition-colors shrink-0"
                          onClick={() => actions.manejarClickEditar(venta)}
                          disabled={state.idVentaActiva === venta.id}
                        >
                          <PencilIcon className="mr-1 h-3 w-3 shrink-0" />
                          Editar
                        </Button>
                      )}

                      {!esVentaCredito && (
                        <Button
                          type="button"
                          className="h-7 px-2.5 rounded-full text-[11px] font-semibold bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/35 shadow-sm transition-colors shrink-0"
                          onClick={() => actions.manejarClickPasarACredito(venta)}
                          disabled={
                            state.procesandoCredito === venta.id || state.idVentaActiva === venta.id
                          }
                        >
                          {state.procesandoCredito === venta.id ? (
                            <Clock className="mr-1 h-3 w-3 animate-spin shrink-0" />
                          ) : (
                            <CreditCard className="mr-1 h-3 w-3 shrink-0" />
                          )}
                          Crédito
                        </Button>
                      )}

                      <Button
                        type="button"
                        className="h-7 px-3 rounded-full text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shrink-0"
                        onClick={() => actions.abrirDialogoPago(venta)}
                        disabled={state.idVentaActiva === venta.id}
                      >
                        <CheckCircle className="mr-1 h-3 w-3 shrink-0" />
                        Pagar
                      </Button>
                    </div>

                    <ul className="divide-y divide-[#2e2e2e]">
                      {venta.detalles.map((detalle) => (
                        <li
                          key={detalle.idDetalle}
                          className="flex justify-between items-center py-2 px-1 first:pt-1 last:pb-0"
                        >
                          <div className="flex-1 min-w-0">{renderizarItemVenta(detalle)}</div>
                          <span
                            className={cn(
                              'text-xs font-bold tabular-nums ml-2 shrink-0',
                              detalle.estado === 'Pagada'
                                ? 'line-through text-slate-500'
                                : 'text-sky-400'
                            )}
                          >
                            Q{detalle.subtotal.toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </SurfaceCard>
  );
}
