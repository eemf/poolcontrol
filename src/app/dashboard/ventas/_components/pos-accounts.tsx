'use client';

import React, { useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Button } from "@/components/ui/button";
import { 
  Search, 
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
    <Tabs value={state.vistaCuentas} onValueChange={(value) => actions.setVistaCuentas(value as any)} className="w-full font-body">
      <Card className="border shadow-sm">
        <div className="p-4 pb-0">
          <div className="flex w-full items-center h-10 rounded-full border border-input bg-background px-3 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              ref={refs.filtroCuentasInputRef}
              type="search"
              placeholder="Buscar cuenta..."
              className="flex-1 border-0 bg-transparent p-0 pl-2 mr-2 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              value={state.filtroCuentas}
              onChange={(e) => actions.setFiltroCuentas(e.target.value)}
              tabIndex={-1}
            />
            <TabsList className="bg-transparent p-0 h-auto flex gap-1 rounded-full">
              <TabsTrigger value="pendientes" className="relative h-8 w-8 bg-transparent p-0 border-0 rounded-full text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <FileClock className="h-5 w-5"/>
                {state.ventasPendientes.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {state.ventasPendientes.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="credito" className="relative h-8 w-8 bg-transparent p-0 border-0 rounded-full text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <CreditCard className="h-5 w-5"/>
                {state.ventasACredito.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {state.ventasACredito.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        <CardContent className='p-0'>
          <TabsContent value={state.vistaCuentas} className="mt-2">
            {/* Resumen de Total a Crédito / Deuda por Cliente */}
            {state.vistaCuentas === 'credito' && state.ventasACredito.length > 0 && (
              <div className="px-4 pb-2.5">
                <div className="flex items-center justify-between p-2.5 px-3 rounded-lg bg-[#17202e] border border-[#324157] shadow-sm">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                      resumenCredito.hayFiltro 
                        ? "bg-cyan-500/15 border-cyan-400/30 text-cyan-400" 
                        : "bg-blue-500/15 border-blue-400/30 text-blue-400"
                    )}>
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
                    <span className={cn(
                      "text-base font-bold font-mono tracking-tight",
                      resumenCredito.hayFiltro ? "text-cyan-400" : "text-blue-400"
                    )}>
                      Q{resumenCredito.monto.toFixed(2)}
                    </span>
                    {resumenCredito.deudaTotalGlobal !== null && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        Total: <span className="text-indigo-400 font-bold font-mono">Q{resumenCredito.deudaTotalGlobal.toFixed(2)}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {cuentasFiltradas.length === 0 ? (
              <div className="flex items-center justify-center h-48 border-2 border-dashed border-muted-foreground/30 rounded-lg m-4">
                <p className="text-muted-foreground italic text-sm">No hay cuentas {state.vistaCuentas === 'pendientes' ? 'pendientes' : 'a crédito'}.</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full space-y-2 px-4 pb-4">
                {cuentasFiltradas.map(venta => {
                  const tieneCredito = state.clientesConCreditoIds.has(venta.clienteId);
                  const permiteConsumoInterno = state.clientesConConsumoInternoIds.has(venta.clienteId);
                  const totalMonedas = venta.detalles.filter(d => d.esVirtual).reduce((acc, item) => acc + item.subtotal, 0);
                  const saldoMonedas = venta.detalles.filter(d => d.esVirtual).reduce((acc, item) => acc + item.saldo, 0);
                  const pagadoMonedas = totalMonedas - saldoMonedas;
                  const totalConsumo = venta.detalles.filter(d => !d.esVirtual).reduce((acc, item) => acc + item.subtotal, 0);
                  const saldoConsumo = venta.detalles.filter(d => !d.esVirtual).reduce((acc, item) => acc + item.saldo, 0);
                  const pagadoConsumo = totalConsumo - saldoConsumo;
                  const esVentaCredito = venta.estado === 'credito';
                  
                  // Lógica para mostrar totales cuando hay crédito asociado
                  const mostrarDesgloseDeuda = state.vistaCuentas === 'pendientes' && tieneCredito;
                  const saldoCredito = mostrarDesgloseDeuda 
                    ? state.ventasACredito.filter(v => v.clienteId === venta.clienteId).reduce((acc, v) => acc + v.saldo, 0)
                    : 0;
                  
                  return (
                    <AccordionItem value={venta.id} key={venta.id} className={cn("border rounded-lg transition-all", state.idVentaActiva === venta.id ? "border-primary bg-primary/10" : "bg-card-foreground/5")}>
                      <AccordionTrigger 
                        className="p-4 hover:no-underline transition-colors active:bg-primary/20"
                        onDoubleClick={esVentaCredito ? undefined : () => actions.manejarClickEditar(venta)}
                        handleTap={esVentaCredito ? undefined : () => actions.handleTap(venta)}
                      >
                        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 w-full text-left">
                          <div className="col-span-1 flex flex-col">
                            <div className="flex items-center gap-2 h-5">
                              <User className="h-4 w-4 text-indigo-500 shrink-0" />
                              <p className="text-sm font-bold truncate">{venta.nombreCliente}</p>
                            </div>
                            {mostrarDesgloseDeuda && (
                                <>
                                    <div className="flex items-center gap-2 h-5 mt-1">
                                        <CreditCard className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                        <span className="text-sm font-bold text-foreground leading-tight">Crédito</span>
                                    </div>
                                    <div className="flex items-center gap-2 h-5 mt-1">
                                        <Sigma className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                        <span className="text-sm font-bold text-foreground leading-tight">Total</span>
                                    </div>
                                </>
                            )}
                          </div>
                          
                          <div className="col-span-1 flex flex-col items-end">
                            <p className="text-sm font-bold text-primary leading-tight h-5">Q{venta.saldo.toFixed(2)}</p>
                            {mostrarDesgloseDeuda && (
                                <>
                                    <span className="text-sm font-bold text-rose-600 leading-tight h-5 mt-1 flex items-center">Q{saldoCredito.toFixed(2)}</span>
                                    <div className="w-full flex justify-end py-1">
                                      <Separator className="w-16 bg-muted-foreground/30" />
                                    </div>
                                    <span className="text-sm font-bold text-indigo-600 leading-tight h-5 flex items-center">Q{(venta.saldo + saldoCredito).toFixed(2)}</span>
                                </>
                            )}
                          </div>

                          <div className="col-span-1 flex flex-col text-xs text-muted-foreground mt-1">
                            <span>Venta # {venta.idVenta}</span>
                            <span className="flex items-center gap-1"><Coins className="h-3 w-3 text-amber-500"/> {pagadoMonedas.toFixed(2)}/{totalMonedas.toFixed(2)}</span>
                          </div>
                          <div className="col-span-1 flex flex-col text-xs text-muted-foreground items-end mt-1">
                            <span>{format(toDate(venta.fecha), 'dd/MM/yy', { locale: es })}</span>
                            <span className="flex items-center gap-1"><GlassWater className="h-3 w-3 text-sky-500"/> {pagadoConsumo.toFixed(2)}/{totalConsumo.toFixed(2)}</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 pt-0">
                        <div className="border-t pt-4 space-y-4">
                          <div className="flex justify-center gap-2 flex-wrap pt-2">
                            {permiteConsumoInterno && (
                              <Button size="icon" className="h-9 w-9 bg-orange-600 hover:bg-orange-700 text-white border-none shadow-sm" onClick={() => actions.abrirDialogoConsumoInterno(venta)} disabled={state.idVentaActiva === venta.id}>
                                <Gift className="h-4 w-4"/>
                              </Button>
                            )}
                            
                            {esVentaCredito ? (
                              <PermissionGuard permission="ventas.editar_credito">
                                <Button size="icon" className="h-9 w-9 bg-sky-600 hover:bg-sky-700 text-white border-none shadow-sm" onClick={() => actions.manejarClickEditar(venta)} disabled={state.idVentaActiva === venta.id}>
                                  <PencilIcon className="h-4 w-4"/>
                                </Button>
                              </PermissionGuard>
                            ) : (
                              <Button size="icon" className="h-9 w-9 bg-sky-600 hover:bg-sky-700 text-white border-none shadow-sm" onClick={() => actions.manejarClickEditar(venta)} disabled={state.idVentaActiva === venta.id}>
                                <PencilIcon className="h-4 w-4"/>
                              </Button>
                            )}

                            {!esVentaCredito && (
                              <Button size="icon" className="h-9 w-9 bg-teal-600 hover:bg-teal-700 text-white border-none shadow-sm" onClick={() => actions.manejarClickPasarACredito(venta)} disabled={state.procesandoCredito === venta.id || state.idVentaActiva === venta.id}>
                                {state.procesandoCredito === venta.id ? <Clock className="h-4 w-4 animate-spin"/> : <CreditCard className="h-4 w-4"/>}
                              </Button>
                            )}

                            <Button variant="default" className="h-9" size="sm" onClick={() => actions.abrirDialogoPago(venta)} disabled={state.idVentaActiva === venta.id}>
                              <CheckCircle className="mr-2 h-4 w-4"/>
                              Pagar
                            </Button>
                          </div>
                          <ul className="space-y-1 pr-2">
                            {venta.detalles.map(detalle => (
                              <li key={detalle.idDetalle} className={cn(
                                "flex justify-between items-center py-2 border-b last:border-none p-2 rounded-md",
                                detalle.estado === 'Pagada' && "bg-green-500/10",
                                (detalle.saldo > 0 && detalle.saldo < detalle.subtotal) && "bg-amber-500/10",
                                (detalle.estado === 'Pendiente de pago' && detalle.saldo === detalle.subtotal) && "bg-red-500/10"
                              )}>
                                <div className='flex-1'>
                                  {renderizarItemVenta(detalle)}
                                </div>
                                <span className={cn('text-sm font-semibold', detalle.estado === 'Pagada' && 'line-through text-muted-foreground')}>
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
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
}
