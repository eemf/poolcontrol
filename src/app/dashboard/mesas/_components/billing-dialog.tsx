'use client';

import React, { useState, useEffect } from 'react';
import type { Mesa } from '@/lib/tipos';
import type { TipoPagoAnticipadoMesa } from '@/lib/firebase/servicios/mesas';
import type { AutocompleteOption } from '@/components/ui/autocomplete-input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { PillTabs, SurfaceCard } from '@/components/comunes';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InputNumero } from '@/components/ui/input-numero';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import {
  CheckCircle,
  CreditCard,
  Coins,
  User,
  Loader2,
  Pencil,
  Users,
  Zap,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BillingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tableToCharge: Mesa | null;
  tiempoJugadoFinal: string;
  totalAPagarModal: number;
  editableCost: number | '';
  setEditableCost: (val: number | '') => void;
  consumoFijoModal: number;
  isEditingCost: boolean;
  setIsEditingCost: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (val: string) => void;
  processingCharge: boolean;
  onFinalizarSinCosto: () => void;
  onProcederConPago: (metodo: 'Efectivo' | 'Tarjeta') => void;
  onPagoAnticipado: (tipoPago: TipoPagoAnticipadoMesa, metodo: 'Efectivo' | 'Tarjeta') => void;
  onPasarACuenta: (clienteId: string) => void;
  clientesOptions: AutocompleteOption[];
  clienteInputRef: React.RefObject<HTMLInputElement>;
  manejarCrearCliente: (nombre: string) => Promise<string | null>;
  currentDivisionStep: number | null;
  setCurrentDivisionStep: (val: number | null) => void;
  numeroDePartes: number | null;
  setNumeroDePartes: (val: number | null) => void;
  montoPorParte: number;
  onPagoDivision: (metodo: 'Efectivo' | 'Tarjeta' | 'A Cuenta') => void;
  divisionClienteId: string;
  setDivisionClienteId: (val: string) => void;
  procesandoDivision: boolean;
  setTableToCharge: (table: any) => void;
}

export function BillingDialog({
  isOpen,
  onOpenChange,
  tableToCharge,
  tiempoJugadoFinal,
  totalAPagarModal,
  editableCost,
  setEditableCost,
  consumoFijoModal,
  isEditingCost,
  setIsEditingCost,
  activeTab,
  setActiveTab,
  processingCharge,
  onFinalizarSinCosto,
  onProcederConPago,
  onPagoAnticipado,
  onPasarACuenta,
  clientesOptions,
  clienteInputRef,
  manejarCrearCliente,
  currentDivisionStep,
  setCurrentDivisionStep,
  numeroDePartes,
  setNumeroDePartes,
  montoPorParte,
  onPagoDivision,
  divisionClienteId,
  setDivisionClienteId,
  procesandoDivision,
  setTableToCharge,
}: BillingDialogProps) {
  const isConsola = tableToCharge?.tipoDeMesa === 'Consola';
  const esTiempoDefinido = tableToCharge?.modoJuego === 'definido';
  const costoTiempoPendiente = esTiempoDefinido ? Math.max(0, Number(editableCost) || 0) : 0;
  const hayTiempoAnticipable = esTiempoDefinido && costoTiempoPendiente > 0;
  const hayConsumosAnticipables = consumoFijoModal > 0;
  const puedePagarAnticipado = hayTiempoAnticipable || hayConsumosAnticipables;

  const [confirmarTarjetaModo, setConfirmarTarjetaModo] = useState<
    'rapido' | 'dividir' | 'anticipado' | null
  >(null);
  const [tipoPagoAnticipado, setTipoPagoAnticipado] = useState<TipoPagoAnticipadoMesa>('ambos');
  const [confirmarCancelarDivision, setConfirmarCancelarDivision] = useState(false);
  const [submittingCuenta, setSubmittingCuenta] = useState(false);

  // Ajustar opción válida de pago anticipado según lo que tenga saldo pendiente
  useEffect(() => {
    if (hayTiempoAnticipable && hayConsumosAnticipables) {
      setTipoPagoAnticipado('ambos');
    } else if (hayTiempoAnticipable) {
      setTipoPagoAnticipado('tiempo');
    } else if (hayConsumosAnticipables) {
      setTipoPagoAnticipado('consumos');
    }
  }, [isOpen, hayTiempoAnticipable, hayConsumosAnticipables]);

  const montoAnticipado =
    tipoPagoAnticipado === 'ambos'
      ? costoTiempoPendiente + consumoFijoModal
      : tipoPagoAnticipado === 'tiempo'
        ? costoTiempoPendiente
        : consumoFijoModal;

  // Limpiar estados locales al cerrar el modal o cambiar estados de carga
  useEffect(() => {
    if (!isOpen) {
      setConfirmarTarjetaModo(null);
      setConfirmarCancelarDivision(false);
      setSubmittingCuenta(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!processingCharge && !procesandoDivision) {
      setSubmittingCuenta(false);
    }
  }, [processingCharge, procesandoDivision]);

  // Al cambiar a la pestaña 'cuenta', limpiar el cliente y enfocar el buscador automáticamente
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'cuenta') {
      if (tableToCharge) {
        setTableToCharge({
          ...tableToCharge,
          clienteId: '',
          nombreCliente: '',
        });
      }
      setTimeout(() => {
        clienteInputRef.current?.focus();
      }, 60);
    }
  };

  const handleConfirmarPagoTarjeta = async () => {
    if (!confirmarTarjetaModo) return;
    if (confirmarTarjetaModo === 'rapido') {
      await onProcederConPago('Tarjeta');
    } else if (confirmarTarjetaModo === 'anticipado') {
      await onPagoAnticipado(tipoPagoAnticipado, 'Tarjeta');
    } else {
      await onPagoDivision('Tarjeta');
    }
    setConfirmarTarjetaModo(null);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && confirmarTarjetaModo) {
          if (!processingCharge && !procesandoDivision) setConfirmarTarjetaModo(null);
          return;
        }
        if (!open && confirmarCancelarDivision) {
          setConfirmarCancelarDivision(false);
          return;
        }
        if (!open && currentDivisionStep !== null) {
          setConfirmarCancelarDivision(true);
          return;
        }
        onOpenChange(open);
      }}
    >
      <DialogContent
        onEscapeKeyDown={(e) => {
          if (confirmarTarjetaModo) {
            e.preventDefault();
            if (!processingCharge && !procesandoDivision) setConfirmarTarjetaModo(null);
            return;
          }
          if (confirmarCancelarDivision) {
            e.preventDefault();
            setConfirmarCancelarDivision(false);
            return;
          }
        }}
        className="p-5 sm:p-6 sm:max-w-lg flex flex-col font-body rounded-xl sm:rounded-lg overflow-visible bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 gap-5 shadow-2xl"
      >
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div className="text-left">
              <DialogTitle className="font-headline text-lg font-bold text-slate-100 leading-tight">
                Cobro de Sesión: {isConsola ? 'Consola' : 'Mesa'} #{tableToCharge?.numeroMesa}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                Tiempo total: {tiempoJugadoFinal} • Cliente:{' '}
                {tableToCharge?.nombreCliente || 'Venta Rápida'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          {/* Total Principal directo en el lienzo y desglose compacto siempre visibles */}
          <div className="space-y-4">
            <div className="text-center py-1">
              <p className="text-xs font-medium text-slate-400 mb-1">Total a Pagar</p>
              <p className="text-5xl font-bold text-sky-400 tabular-nums tracking-tight">
                Q{totalAPagarModal.toFixed(2)}
              </p>
            </div>

            <SurfaceCard
              variant="surface"
              className="grid grid-cols-2 divide-x divide-[#2e2e2e] p-3.5"
            >
              {/* Columna Alquiler */}
              <div className="pr-4 flex flex-col justify-center">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-medium text-slate-400">Alquiler</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full bg-[#1e1e1e] hover:bg-sky-500/20 hover:text-sky-300 text-slate-300 border border-[#2e2e2e]"
                    onMouseDown={(e) => {
                      // Evitar que el blur del input cierre y reabra al mismo tiempo al hacer clic en el lápiz
                      e.preventDefault();
                      setIsEditingCost(!isEditingCost);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                </div>
                {isEditingCost ? (
                  <div className="relative mt-0.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-sky-400">
                      Q
                    </span>
                    <InputNumero
                      value={editableCost}
                      onChange={(e) =>
                        setEditableCost(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="h-8 pl-7 pr-3 text-sm font-bold rounded-full bg-[#1e1e1e] border-[#2e2e2e] text-slate-100"
                      autoFocus
                      onFocus={(e) => e.target.select()}
                      onBlur={() => setIsEditingCost(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === 'Escape') {
                          e.preventDefault();
                          setIsEditingCost(false);
                        }
                      }}
                    />
                  </div>
                ) : (
                  <p
                    onClick={() => setIsEditingCost(true)}
                    className="text-base font-bold text-slate-100 tabular-nums cursor-pointer hover:text-sky-400 transition-colors"
                  >
                    Q{(Number(editableCost) || 0).toFixed(2)}
                  </p>
                )}
              </div>

              {/* Columna Consumos y Ajustes */}
              <div className="pl-4 flex flex-col justify-center">
                <span className="text-xs font-medium text-slate-400 mb-1">
                  Consumos y Ajustes
                </span>
                <p className="text-base font-bold text-slate-100 tabular-nums">
                  Q{consumoFijoModal.toFixed(2)}
                </p>
              </div>
            </SurfaceCard>
          </div>

          {totalAPagarModal <= 0 && !isEditingCost ? (
            <div className="space-y-4 pt-1 animate-in fade-in duration-200">
              <div className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                <span className="text-xs font-medium">
                  Sin saldo pendiente por cobrar en esta estación.
                </span>
              </div>

              <div className="flex flex-row items-center justify-between gap-2.5">
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-full px-5 font-medium h-10 bg-[#252526] hover:bg-[#2e2e2e] text-slate-200 border border-[#2e2e2e]"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={onFinalizarSinCosto}
                  disabled={processingCharge}
                  className="rounded-full font-semibold h-10 px-6 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
                >
                  {processingCharge ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Finalizar y Liberar
                </Button>
              </div>
            </div>
          ) : (
            <>

              {/* Pestañas Estándar en Píldora */}
              <PillTabs
                value={activeTab}
                onValueChange={handleTabChange}
                tabs={[
                  { id: 'rapido', label: 'Rápido', icon: Zap },
                  { id: 'cuenta', label: 'Cuenta', icon: User },
                  { id: 'dividir', label: 'Dividir', icon: Users },
                  ...(puedePagarAnticipado
                    ? [{ id: 'anticipado', label: 'Anticipado', icon: Clock }]
                    : []),
                ]}
              />

              {/* Contenido de Pestaña: Pago Anticipado (sin liberar estación) */}
              {activeTab === 'anticipado' && puedePagarAnticipado && (
                <div className="pt-1 space-y-3.5">
                  <div className="rounded-xl bg-[#252526] border border-[#2e2e2e] p-3.5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-slate-300">
                        Cobrar sin liberar {isConsola ? 'la consola' : 'la mesa'}
                      </span>
                      <span className="text-sm font-bold text-sky-400 tabular-nums">
                        Q{montoAnticipado.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {hayTiempoAnticipable && hayConsumosAnticipables && (
                        <button
                          type="button"
                          onClick={() => setTipoPagoAnticipado('ambos')}
                          className={cn(
                            'rounded-full h-8 px-3.5 text-xs font-semibold border transition-colors',
                            tipoPagoAnticipado === 'ambos'
                              ? 'bg-sky-600 border-sky-500 text-white'
                              : 'bg-[#1e1e1e] border-[#2e2e2e] text-slate-300 hover:bg-[#313131]'
                          )}
                        >
                          Todo (Q{(costoTiempoPendiente + consumoFijoModal).toFixed(2)})
                        </button>
                      )}
                      {hayTiempoAnticipable && (
                        <button
                          type="button"
                          onClick={() => setTipoPagoAnticipado('tiempo')}
                          className={cn(
                            'rounded-full h-8 px-3.5 text-xs font-semibold border transition-colors',
                            tipoPagoAnticipado === 'tiempo'
                              ? 'bg-sky-600 border-sky-500 text-white'
                              : 'bg-[#1e1e1e] border-[#2e2e2e] text-slate-300 hover:bg-[#313131]'
                          )}
                        >
                          Solo Tiempo (Q{costoTiempoPendiente.toFixed(2)})
                        </button>
                      )}
                      {hayConsumosAnticipables && (
                        <button
                          type="button"
                          onClick={() => setTipoPagoAnticipado('consumos')}
                          className={cn(
                            'rounded-full h-8 px-3.5 text-xs font-semibold border transition-colors',
                            tipoPagoAnticipado === 'consumos'
                              ? 'bg-sky-600 border-sky-500 text-white'
                              : 'bg-[#1e1e1e] border-[#2e2e2e] text-slate-300 hover:bg-[#313131]'
                          )}
                        >
                          Solo Consumos (Q{consumoFijoModal.toFixed(2)})
                        </button>
                      )}
                    </div>

                    <p className="text-[0.6875rem] text-slate-400 leading-snug">
                      El reloj seguirá corriendo y la estación permanecerá ocupada hasta que finalice la sesión.
                    </p>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5">
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full sm:w-auto rounded-full px-5 font-medium h-10 bg-[#252526] hover:bg-[#2e2e2e] text-slate-200 border border-[#2e2e2e]"
                      onClick={() => onOpenChange(false)}
                    >
                      Cancelar
                    </Button>
                    <div className="flex w-full flex-1 gap-2.5">
                      <Button
                        type="button"
                        onClick={() => setConfirmarTarjetaModo('anticipado')}
                        disabled={processingCharge || montoAnticipado <= 0}
                        variant="secondary"
                        className="flex-1 rounded-full h-10 font-semibold bg-[#252526] hover:bg-[#2e2e2e] text-slate-100 border border-[#2e2e2e]"
                      >
                        <CreditCard className="mr-1.5 h-4 w-4 text-sky-400" /> Tarjeta
                      </Button>
                      <Button
                        type="button"
                        onClick={() => onPagoAnticipado(tipoPagoAnticipado, 'Efectivo')}
                        disabled={processingCharge || montoAnticipado <= 0}
                        className="flex-1 rounded-full h-10 font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
                      >
                        {processingCharge && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                        <Coins className="mr-1.5 h-4 w-4" /> Efectivo
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Contenido de Pestaña: Pago Rápido */}
              {activeTab === 'rapido' && (
                <div className="pt-1 flex flex-col-reverse sm:flex-row items-center gap-2.5">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full sm:w-auto rounded-full px-5 font-medium h-10 bg-[#252526] hover:bg-[#2e2e2e] text-slate-200 border border-[#2e2e2e]"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancelar
                  </Button>
                  <div className="flex w-full flex-1 gap-2.5">
                    <Button
                      type="button"
                      onClick={() => setConfirmarTarjetaModo('rapido')}
                      disabled={processingCharge}
                      variant="secondary"
                      className="flex-1 rounded-full h-10 font-semibold bg-[#252526] hover:bg-[#2e2e2e] text-slate-100 border border-[#2e2e2e]"
                    >
                      <CreditCard className="mr-1.5 h-4 w-4 text-sky-400" /> Tarjeta
                    </Button>
                    <Button
                      type="button"
                      onClick={() => onProcederConPago('Efectivo')}
                      disabled={processingCharge}
                      className="flex-1 rounded-full h-10 font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
                    >
                      {processingCharge && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                      <Coins className="mr-1.5 h-4 w-4" /> Efectivo
                    </Button>
                  </div>
                </div>
              )}

              {/* Contenido de Pestaña: Pasar a Cuenta */}
              {activeTab === 'cuenta' && (
                <div className="pt-1 space-y-3">
                  <AutocompleteInput
                    ref={clienteInputRef}
                    options={clientesOptions}
                    value={tableToCharge?.clienteId || ''}
                    disabled={processingCharge || submittingCuenta}
                    onValueChange={(value) => {
                      if (tableToCharge) {
                        setTableToCharge({
                          ...tableToCharge,
                          clienteId: value,
                          nombreCliente:
                            clientesOptions.find((o) => o.value === value)?.label || '',
                        });
                      }
                    }}
                    placeholder="Buscar o crear cliente..."
                    onCreateNew={manejarCrearCliente}
                    onFocus={(e) => e.target.select()}
                  />
                  <div className="flex flex-row items-center justify-between gap-2.5">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={processingCharge || submittingCuenta}
                      className="rounded-full px-5 font-medium h-10 bg-[#252526] hover:bg-[#2e2e2e] text-slate-200 border border-[#2e2e2e]"
                      onClick={() => onOpenChange(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      className="rounded-full h-10 px-6 font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md"
                      onClick={() => {
                        if (!tableToCharge?.clienteId || processingCharge || submittingCuenta) return;
                        setSubmittingCuenta(true);
                        onPasarACuenta(tableToCharge.clienteId);
                      }}
                      disabled={processingCharge || submittingCuenta || !tableToCharge?.clienteId}
                    >
                      {(processingCharge || submittingCuenta) ? (
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      ) : (
                        <User className="mr-1.5 h-4 w-4" />
                      )}
                      Añadir a Cuenta
                    </Button>
                  </div>
                </div>
              )}

              {/* Contenido de Pestaña: Dividir Cuenta */}
              {activeTab === 'dividir' && (
                <div className="pt-1">
                  {currentDivisionStep === null ? (
                    <div className="space-y-3 text-center">
                      <p className="font-medium text-xs text-slate-400">
                        Selecciona entre cuántas personas se dividirá la cuenta:
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {[2, 3, 4, 5].map((parts) => (
                          <Button
                            key={parts}
                            type="button"
                            variant="secondary"
                            className="rounded-full font-semibold h-10 bg-[#252526] hover:bg-sky-600 hover:text-white hover:border-sky-500 text-slate-200 border border-[#2e2e2e]"
                            onClick={() => {
                              setNumeroDePartes(parts);
                              setCurrentDivisionStep(0);
                            }}
                          >
                            {parts} Pers.
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-4 py-2.5 rounded-full bg-[#252526] border border-[#2e2e2e]">
                        <span className="text-xs font-semibold text-slate-300">
                          Pago {currentDivisionStep + 1} de {numeroDePartes}
                        </span>
                        <span className="text-lg font-bold text-sky-400 tabular-nums">
                          Q{montoPorParte.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex flex-row gap-2.5">
                        <Button
                          type="button"
                          onClick={() => setConfirmarTarjetaModo('dividir')}
                          disabled={procesandoDivision}
                          variant="secondary"
                          className="flex-1 rounded-full h-10 font-semibold bg-[#252526] hover:bg-[#2e2e2e] text-slate-100 border border-[#2e2e2e]"
                        >
                          <CreditCard className="mr-1.5 h-4 w-4 text-sky-400" /> Tarjeta
                        </Button>
                        <Button
                          type="button"
                          onClick={() => onPagoDivision('Efectivo')}
                          disabled={procesandoDivision}
                          className="flex-1 rounded-full h-10 font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
                        >
                          {procesandoDivision && (
                            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                          )}
                          <Coins className="mr-1.5 h-4 w-4" /> Contado
                        </Button>
                      </div>

                      <div className="relative my-2 flex items-center justify-center">
                        <div className="w-full border-t border-[#2e2e2e]" />
                        <span className="bg-[#1e1e1e] px-3 text-[0.6875rem] font-medium text-slate-400 shrink-0">
                          O enviar a cuenta
                        </span>
                        <div className="w-full border-t border-[#2e2e2e]" />
                      </div>

                      <div className="space-y-3">
                        <AutocompleteInput
                          options={clientesOptions}
                          value={divisionClienteId}
                          disabled={procesandoDivision || submittingCuenta}
                          onValueChange={setDivisionClienteId}
                          placeholder="Buscar o crear cliente..."
                          onCreateNew={manejarCrearCliente}
                        />
                        <div className="flex flex-row items-center justify-between gap-2.5">
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={procesandoDivision || submittingCuenta}
                            className="rounded-full px-5 font-medium h-10 bg-[#252526] hover:bg-[#2e2e2e] text-slate-200 border border-[#2e2e2e]"
                            onClick={() => setCurrentDivisionStep(null)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="button"
                            className="rounded-full h-10 px-6 font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md"
                            onClick={() => {
                              if (!divisionClienteId || procesandoDivision || submittingCuenta) return;
                              setSubmittingCuenta(true);
                              onPagoDivision('A Cuenta');
                            }}
                            disabled={!divisionClienteId || procesandoDivision || submittingCuenta}
                          >
                            {(procesandoDivision || submittingCuenta) ? (
                              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                            ) : (
                              <User className="mr-1.5 h-4 w-4" />
                            )}
                            Enviar a Cuenta
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Sub-modal interno de confirmación de pago con tarjeta */}
        {confirmarTarjetaModo && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center rounded-xl sm:rounded-lg bg-black/75 backdrop-blur-[2px] p-4 animate-in fade-in duration-150"
            onClick={() => {
              if (!processingCharge && !procesandoDivision) setConfirmarTarjetaModo(null);
            }}
          >
            <div
              className="w-full max-w-sm rounded-xl sm:rounded-lg bg-[#1e1e1e] border border-[#2e2e2e] text-slate-100 p-5 shadow-2xl space-y-3.5 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <h3 className="font-headline text-base font-bold text-slate-100 leading-tight">
                    ¿Confirmar Pago con Tarjeta?
                  </h3>
                  <p className="text-[0.6875rem] text-slate-400 mt-0.5 truncate">
                    {isConsola ? 'Consola' : 'Mesa'} #{tableToCharge?.numeroMesa} • Verifica antes de procesar
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-[#252526] border border-[#2e2e2e] p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-300">
                    {confirmarTarjetaModo === 'dividir'
                      ? `Pago ${currentDivisionStep !== null ? currentDivisionStep + 1 : 1} de ${numeroDePartes}`
                      : 'Monto a cobrar con tarjeta'}
                  </span>
                  <span className="text-sm font-bold text-sky-400 tabular-nums shrink-0">
                    Q
                    {(confirmarTarjetaModo === 'dividir'
                      ? montoPorParte
                      : confirmarTarjetaModo === 'anticipado'
                        ? montoAnticipado
                        : totalAPagarModal
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#2e2e2e] text-[0.6875rem] text-slate-400 leading-snug">
                  El cobro se registrará como pago con tarjeta y no sumará al efectivo en caja.
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-0.5">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={processingCharge || procesandoDivision}
                  onClick={() => setConfirmarTarjetaModo(null)}
                  className="rounded-full h-9 px-4 text-xs font-medium bg-[#252526] hover:bg-[#2e2e2e] text-slate-200 border border-[#2e2e2e]"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  disabled={processingCharge || procesandoDivision}
                  onClick={handleConfirmarPagoTarjeta}
                  className="rounded-full h-9 px-5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md"
                >
                  {processingCharge || procesandoDivision ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                      Confirmar Pago
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Sub-modal interno de confirmación para cancelar división en curso */}
        {confirmarCancelarDivision && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center rounded-xl sm:rounded-lg bg-black/75 backdrop-blur-[2px] p-4 animate-in fade-in duration-150"
            onClick={() => setConfirmarCancelarDivision(false)}
          >
            <div
              className="w-full max-w-sm rounded-xl sm:rounded-lg bg-[#1e1e1e] border border-[#2e2e2e] text-slate-100 p-5 shadow-2xl space-y-3.5 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <h3 className="font-headline text-base font-bold text-slate-100 leading-tight">
                    ¿Cancelar División?
                  </h3>
                  <p className="text-[0.6875rem] text-slate-400 mt-0.5">
                    Los pagos parciales procesados no se revertirán.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setConfirmarCancelarDivision(false)}
                  className="rounded-full h-9 px-4 text-xs font-medium bg-[#252526] hover:bg-[#2e2e2e] text-slate-200 border border-[#2e2e2e]"
                >
                  No, Continuar
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setConfirmarCancelarDivision(false);
                    setNumeroDePartes(null);
                    setCurrentDivisionStep(null);
                    onOpenChange(false);
                  }}
                  className="rounded-full h-9 px-5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md"
                >
                  Sí, Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
