'use client';

import React from 'react';
import type { Mesa } from '@/lib/tipos';
import type { AutocompleteOption } from '@/components/ui/autocomplete-input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InputNumero } from '@/components/ui/input-numero';
import { Separator } from '@/components/ui/separator';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import { CheckCircle, CreditCard, Coins, User, Loader2, Pencil } from 'lucide-react';

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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-xl flex flex-col max-h-[90vh] font-body rounded-xl sm:rounded-3xl overflow-hidden border-muted/20 gap-0">
        <DialogHeader className="p-6 pb-4 flex-shrink-0 bg-background z-10">
          <DialogTitle className="font-headline text-xl">Cobro de Sesión: {isConsola ? 'Consola' : 'Mesa'} #{tableToCharge?.numeroMesa}</DialogTitle>
          <DialogDescription className="font-body">Tiempo total: {tiempoJugadoFinal}. Cliente: {tableToCharge?.nombreCliente || 'Venta Rápida'}.</DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto min-h-0 bg-muted/5">
          <div className="px-6 pb-10 space-y-6 pt-2">
            {totalAPagarModal <= 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-lg font-bold">Sin Saldo Pendiente</h3>
                <p className="text-muted-foreground text-sm">Esta estación no tiene costos pendientes de alquiler ni de consumo.</p>
                <div className="mt-6">
                  <Button onClick={onFinalizarSinCosto} disabled={processingCharge} className="w-full sm:w-auto rounded-full font-bold h-11 px-8">
                    {processingCharge && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Finalizar y Liberar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="rounded-2xl bg-primary/5 p-6 text-center border border-primary/10 shadow-sm">
                  <Label className="text-sm font-bold text-muted-foreground mb-1">Total a Pagar</Label>
                  <p className="text-5xl font-bold text-primary tabular-nums">Q{totalAPagarModal.toFixed(2)}</p>
                </div>
                
                <div className="space-y-3 rounded-xl border border-muted/40 p-4 bg-background shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label className="font-bold">Alquiler:</Label>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsEditingCost(!isEditingCost)}><Pencil className="h-4 w-4" /></Button>
                    </div>
                    {isEditingCost ? (
                      <InputNumero 
                        value={editableCost} 
                        onChange={(e) => setEditableCost(Number(e.target.value))} 
                        className="w-24 h-8 text-right font-bold rounded-full bg-background" 
                        autoFocus 
                        onFocus={(e) => e.target.select()}
                        onBlur={() => setIsEditingCost(false)} 
                      />
                    ) : (
                      <span className="font-bold text-foreground">Q{(Number(editableCost) || 0).toFixed(2)}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-bold">Consumos y Ajustes:</Label>
                    <span className="font-bold text-foreground">Q{consumoFijoModal.toFixed(2)}</span>
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 rounded-full h-11 p-1 bg-muted/20 border border-muted/40">
                    <TabsTrigger value="rapido" className="rounded-full font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Rápido</TabsTrigger>
                    <TabsTrigger value="cuenta" className="rounded-full font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Cuenta</TabsTrigger>
                    <TabsTrigger value="dividir" className="rounded-full font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Dividir</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="rapido" className="mt-0 pt-6">
                    <div className="flex flex-col-reverse sm:flex-row items-center gap-3">
                      <Button variant="outline" className="w-full sm:w-auto rounded-full px-8 font-bold h-11" onClick={() => onOpenChange(false)}>Cancelar</Button>
                      <div className="flex w-full flex-1 gap-2">
                        <Button onClick={() => onProcederConPago('Tarjeta')} disabled={processingCharge} variant="outline" className="flex-1 rounded-full h-11 font-bold"><CreditCard className="mr-2 h-4 w-4" /> Tarjeta</Button>
                        <Button onClick={() => onProcederConPago('Efectivo')} disabled={processingCharge} className="flex-1 rounded-full h-11 font-bold shadow-lg shadow-primary/20">{processingCharge && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}<Coins className="mr-2 h-4 w-4" /> Efectivo</Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="cuenta" className="mt-0 pt-6">
                    <div className="space-y-4">
                      <AutocompleteInput 
                        ref={clienteInputRef} 
                        options={clientesOptions} 
                        value={tableToCharge?.clienteId || ''} 
                        onValueChange={(value) => { if (tableToCharge) setTableToCharge({ ...tableToCharge, clienteId: value, nombreCliente: clientesOptions.find(o => o.value === value)?.label || '' }); }} 
                        placeholder="Buscar o crear cliente..." 
                        onCreateNew={manejarCrearCliente} 
                        onFocus={(e) => e.target.select()} 
                        className="rounded-full h-11" 
                      />
                      <div className="flex flex-col-reverse sm:flex-row items-center gap-3">
                        <Button variant="outline" className="w-full sm:w-auto rounded-full px-8 font-bold h-11" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button className="w-full sm:w-auto flex-1 rounded-full h-11 font-bold shadow-lg shadow-primary/20" onClick={() => tableToCharge?.clienteId && onPasarACuenta(tableToCharge.clienteId)} disabled={processingCharge || !tableToCharge?.clienteId}>{processingCharge && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}<User className="mr-2 h-4 w-4" /> Añadir a Cuenta</Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="dividir" className="mt-0 pt-6">
                    <div className="px-1">
                      {currentDivisionStep === null ? (
                        <div className="space-y-4 text-center">
                          <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-widest">Dividir en Partes Iguales</h4>
                          <div className="flex flex-wrap justify-center gap-2">
                            {[2, 3, 4, 5].map(parts => <Button key={parts} variant="outline" className="rounded-full px-6 font-bold h-10" onClick={() => { setNumeroDePartes(parts); setCurrentDivisionStep(0); }}>{parts} Pers.</Button>)}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="rounded-2xl bg-muted/20 p-4 text-center border border-muted/40 shadow-inner">
                            <Label className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-widest">Pago {currentDivisionStep + 1} de {numeroDePartes}</Label>
                            <p className="text-4xl font-bold text-primary tabular-nums">Q{montoPorParte.toFixed(2)}</p>
                          </div>
                          <div className="flex flex-row gap-2">
                            <Button onClick={() => onPagoDivision('Tarjeta')} disabled={procesandoDivision} variant="outline" className="flex-1 rounded-full h-11 font-bold"><CreditCard className="mr-2 h-4 w-4" /> Tarjeta</Button>
                            <Button onClick={() => onPagoDivision('Efectivo')} disabled={procesandoDivision} className="flex-1 rounded-full h-11 font-bold shadow-lg shadow-primary/20">{procesandoDivision && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}<Coins className="mr-2 h-4 w-4" /> Contado</Button>
                          </div>
                          <div className="relative my-6">
                            <Separator className="bg-muted-foreground/20" />
                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-muted/5 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">O Enviar a Cuenta</span>
                          </div>
                          <div className="space-y-4">
                            <AutocompleteInput options={clientesOptions} value={divisionClienteId} onValueChange={setDivisionClienteId} placeholder="Buscar o crear cliente..." onCreateNew={manejarCrearCliente} className="rounded-full h-11" />
                            <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-2">
                              <Button variant="outline" className="w-full sm:w-auto rounded-full px-8 font-bold h-11" onClick={() => setCurrentDivisionStep(null)}>Cancelar</Button>
                              <Button className="w-full sm:w-auto flex-1 rounded-full h-11 font-bold shadow-lg shadow-primary/20" onClick={() => onPagoDivision('A Cuenta')} disabled={!divisionClienteId || procesandoDivision}>{procesandoDivision && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}<User className="mr-2 h-4 w-4" /> Enviar a Cuenta</Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}