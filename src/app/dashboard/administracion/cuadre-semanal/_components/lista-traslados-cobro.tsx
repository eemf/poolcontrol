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
      className="shadow-sm overflow-hidden font-body !bg-[#1e1e1e] border !border-[#2e2e2e]"
      style={{ backgroundColor: '#1e1e1e', borderColor: '#2e2e2e' }}
    >
      <CardHeader className="p-4 pb-2 bg-transparent">
        <CardTitle className="font-bold text-base sm:text-lg text-foreground flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5 text-emerald-400 shrink-0" />
          Traslados por Cobrar
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-1">
        <div className="space-y-3">
          <div className="flex items-center p-2 border-b !border-[#2e2e2e]">
            <Checkbox
              id="select-all-traslados"
              checked={selected.size === items.length && items.length > 0}
              onCheckedChange={onSelectAll}
            />
            <Label htmlFor="select-all-traslados" className="ml-3 flex-1 font-bold text-sm text-foreground cursor-pointer">
              Seleccionar Todos
            </Label>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-2">
            {items.map((traslado) => {
              const esProcesado = (traslado as any).estadoCuadre === 'procesado';
              const fechaEnvio = traslado.fechaEnvio?.toDate
                ? format(traslado.fechaEnvio.toDate(), 'dd MMM, yyyy', { locale: es })
                : 'N/A';

              return (
                <AccordionItem
                  value={traslado.id}
                  key={traslado.id}
                  style={{ backgroundColor: '#252526', borderColor: '#2e2e2e' }}
                  className="border-b-0 rounded-xl border !border-[#2e2e2e] !bg-[#252526] hover:brightness-105 transition-all overflow-hidden mb-2 shadow-sm relative"
                >
                  {/* Checkbox centrado verticalmente en la cabecera del acordeón */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
                      <Checkbox
                        id={`traslado-${traslado.id}`}
                        checked={selected.has(traslado.id)}
                        onCheckedChange={(checked) => onSelect(traslado.id, !!checked)}
                      />
                    </div>

                    <AccordionTrigger className="pl-10 pr-3 hover:no-underline py-3 w-full data-[state=open]:border-b data-[state=open]:border-[#2e2e2e]">
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-2 mr-2 text-left">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="hidden sm:flex h-8 w-8 rounded-full bg-emerald-500/10 items-center justify-center shrink-0">
                          <ArrowLeftRight className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-bold text-xs sm:text-sm leading-tight text-foreground truncate">
                            Traslado #TR-{traslado.idTraslado} — {traslado.sucursalDestinoNombre}
                          </span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="text-[0.625rem] sm:text-xs text-muted-foreground font-medium truncate">
                              {fechaEnvio}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                        <p className="font-bold text-xs sm:text-sm text-emerald-400 whitespace-nowrap tabular-nums leading-tight">
                          + Q{(traslado.costoTotalTraslado || 0).toFixed(2)}
                        </p>
                        <Badge
                          className={
                            esProcesado
                              ? 'rounded-full text-[0.625rem] font-semibold border border-emerald-500/30 bg-emerald-500/20 text-emerald-300 px-2 py-0.5'
                              : 'rounded-full text-[0.625rem] font-semibold border border-amber-500/30 bg-amber-500/20 text-amber-300 px-2 py-0.5'
                          }
                        >
                          {esProcesado ? 'Procesado' : 'Pendiente'}
                        </Badge>
                      </div>
                    </div>
                    </AccordionTrigger>
                  </div>

                  <AccordionContent className="p-3.5 sm:p-4 bg-[#1e1e1e]">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold text-xs text-slate-300 flex items-center gap-1.5">
                          <PackageCheck className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Detalle de mercancía despachada</span>
                        </h4>
                        <span className="text-[0.6875rem] font-medium text-slate-400 tabular-nums">
                          {traslado.items?.length || 0} {(traslado.items?.length || 0) === 1 ? 'artículo' : 'artículos'}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {traslado.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center bg-[#252526] border border-[#2e2e2e] p-2.5 rounded-xl text-xs"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="font-semibold text-slate-100 truncate">{item.nombreProducto}</p>
                              <p className="text-[0.625rem] text-slate-400 tabular-nums">
                                {item.cantidad} unidades &times; Q{item.costoUnitario.toFixed(2)}
                              </p>
                            </div>
                            <p className="font-bold text-emerald-400 tabular-nums shrink-0">
                              Q{(item.costoTotal || item.cantidad * item.costoUnitario).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {traslado.observacionesEnvio && (
                        <div className="p-2.5 rounded-xl bg-[#252526] border border-[#2e2e2e] text-xs text-slate-300">
                          <span className="font-semibold text-slate-400">Nota de envío: </span>
                          {traslado.observacionesEnvio}
                        </div>
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
