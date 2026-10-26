'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight, Clock, CheckCircle2, Building2, PackageCheck } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { TrasladoInterSucursal } from '@/lib/tipos';

interface ListaTrasladosCobroProps {
  items: TrasladoInterSucursal[];
  selected: Set<string>;
  onSelect: (id: string, isSelected: boolean) => void;
  onSelectAll: () => void;
}

export function ListaTrasladosCobro({ items, selected, onSelect, onSelectAll }: ListaTrasladosCobroProps) {
  if (items.length === 0) return null;

  return (
    <Card
      className="shadow-sm overflow-hidden font-body !bg-[#1d283a] border !border-[#324157]"
      style={{ backgroundColor: '#1d283a', borderColor: '#324157' }}
    >
      <CardHeader className="p-4 pb-2 bg-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="font-bold text-base sm:text-lg text-foreground flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-emerald-400" />
            Cobros por Traslados a Sucursales (Ingresos)
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {items.length} {items.length === 1 ? 'traslado pendiente' : 'traslados pendientes'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-1">
        <div className="space-y-3">
          <div className="flex items-center p-2 border-b !border-[#324157]">
            <Checkbox
              id="select-all-traslados"
              checked={selected.size === items.length && items.length > 0}
              onCheckedChange={onSelectAll}
            />
            <Label htmlFor="select-all-traslados" className="ml-3 flex-1 font-bold text-sm text-foreground cursor-pointer">
              Seleccionar Todos los Traslados
            </Label>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-2">
            {items.map((traslado) => {
              const esRecibido = traslado.estado === 'recibido';
              const fechaEnvio = traslado.fechaEnvio?.toDate
                ? format(traslado.fechaEnvio.toDate(), 'dd MMM, yyyy - hh:mm a', { locale: es })
                : 'N/A';

              return (
                <AccordionItem
                  value={traslado.id}
                  key={traslado.id}
                  style={{ backgroundColor: '#283244', borderColor: '#324157' }}
                  className="border-b-0 rounded-xl border !border-[#324157] !bg-[#283244] hover:brightness-105 transition-all overflow-hidden mb-2 shadow-sm relative"
                >
                  {/* Checkbox anclado a la cabecera del acordeón */}
                  <div className="absolute left-3 top-6 -translate-y-1/2 z-20 flex items-center justify-center">
                    <Checkbox
                      id={`traslado-${traslado.id}`}
                      checked={selected.has(traslado.id)}
                      onCheckedChange={(checked) => onSelect(traslado.id, !!checked)}
                    />
                  </div>

                  <AccordionTrigger className="pl-10 pr-3 hover:no-underline py-3 w-full">
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-2 mr-2 text-left">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="hidden sm:flex h-8 w-8 rounded-full bg-emerald-500/10 items-center justify-center shrink-0">
                          <ArrowLeftRight className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-bold text-xs sm:text-sm leading-tight text-foreground truncate">
                            Traslado #TR-{traslado.idTraslado} — A {traslado.sucursalDestinoNombre}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] sm:text-xs text-muted-foreground font-medium flex items-center gap-1">
                              <Clock className="h-3 w-3 shrink-0" />
                              {fechaEnvio}
                            </span>
                            {traslado.cantidadTotalItems && (
                              <span className="text-[10px] text-slate-400">
                                ({traslado.cantidadTotalItems} unidades)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                        <p className="font-bold text-xs sm:text-sm text-emerald-400 whitespace-nowrap tabular-nums leading-tight">
                          + Q{(traslado.costoTotalTraslado || 0).toFixed(2)}
                        </p>
                        <div className="flex items-center gap-1">
                          {esRecibido ? (
                            <Badge className="h-4 text-[9px] font-semibold border-none bg-emerald-500/20 text-emerald-300 px-1.5 py-0 flex items-center gap-0.5">
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              Recibido en destino
                            </Badge>
                          ) : (
                            <Badge className="h-4 text-[9px] font-semibold border-none bg-amber-500/20 text-amber-300 px-1.5 py-0 flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" />
                              En tránsito
                            </Badge>
                          )}
                          <Badge className="h-4 text-[9px] font-semibold border-none bg-sky-500/20 text-sky-300 px-1.5 py-0">
                            Por Cobrar
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-3 pb-3">
                    <div className="space-y-2 border-t !border-[#324157] pt-2.5 mt-1 text-xs">
                      <div className="flex items-center justify-between text-slate-300 px-1 text-[11px]">
                        <span className="font-semibold text-slate-400">Detalle de mercancía despachada:</span>
                        {traslado.idCompraGeneradaDestino && (
                          <span className="text-muted-foreground font-medium">
                            Compra registrada en {traslado.sucursalDestinoNombre}: #{traslado.idCompraGeneradaDestino}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        {traslado.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center text-[11px] bg-[#1d283a]/70 p-2.5 rounded-lg border !border-[#324157]"
                          >
                            <div className="flex flex-col min-w-0 flex-1 mr-2">
                              <span className="font-bold text-foreground/90 truncate">{item.nombreProducto}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {item.cantidad} unidades × Q{item.costoUnitario.toFixed(2)}
                              </span>
                            </div>
                            <span className="font-bold text-emerald-400 whitespace-nowrap">
                              Q{(item.costoTotal || item.cantidad * item.costoUnitario).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {traslado.observacionesEnvio && (
                        <div className="p-2 rounded-lg bg-[#1d283a]/50 border !border-[#324157] text-[10px] text-slate-300">
                          <strong className="text-slate-400">Nota de envío:</strong> {traslado.observacionesEnvio}
                        </div>
                      )}

                      {traslado.usuarioRecepcionNombre && (
                        <p className="text-[10px] text-slate-400 italic px-1">
                          Confirmado y recibido por: <span className="text-white font-medium">{traslado.usuarioRecepcionNombre}</span>
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}
