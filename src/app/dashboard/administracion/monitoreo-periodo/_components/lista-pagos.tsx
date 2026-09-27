'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import type { Pago } from '@/lib/tipos';
import { 
  Search, 
  ShoppingBag, 
  Coins, 
  CreditCard, 
  Loader2, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Banknote
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ConmutadorTriple } from './conmutador-triple';
import { cn } from '@/lib/utils';

const toDate = (fecha: any): Date => {
  if (fecha instanceof Timestamp) return fecha.toDate();
  if (fecha instanceof Date) return fecha;
  if (typeof fecha === 'string') {
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(0);
};

interface ListaPagosProps {
  pagos: Pago[];
  isLoading: boolean;
}

export function ListaPagos({ pagos, isLoading }: ListaPagosProps) {
  const [filtro, setFiltro] = useState('');
  const [metodoFiltro, setMetodoFiltro] = useState('todos');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [idVentaActiva, setIdVentaActiva] = useState<string | null>(null);

  // Calcular total de efectivo del periodo
  const totalEfectivoPeriodo = useMemo(() => {
    return pagos
      .filter(p => p.metodoPago === 'Efectivo')
      .reduce((sum, p) => sum + (p.montoTotalPagado || 0), 0);
  }, [pagos]);

  const ventasAgrupadas = useMemo(() => {
    const groups = new Map<string, { idVenta: number, ventaDocId: string, clienteNombre: string, totalEnPeriodo: number, pagos: Pago[], esConsumoInterno: boolean }>();
    
    pagos.forEach(pago => {
      if (!pago.ventaDocId) return;
      
      if (metodoFiltro !== 'todos' && pago.metodoPago !== metodoFiltro) return;

      if (!groups.has(pago.ventaDocId)) {
        groups.set(pago.ventaDocId, {
          idVenta: pago.idVenta,
          ventaDocId: pago.ventaDocId,
          clienteNombre: pago.clienteNombre,
          totalEnPeriodo: 0,
          pagos: [],
          esConsumoInterno: false
        });
      }
      const group = groups.get(pago.ventaDocId)!;
      group.pagos.push(pago);
      
      if (pago.metodoPago === 'Consumo Interno') {
        group.esConsumoInterno = true;
      }

      group.totalEnPeriodo += (pago.montoTotalPagado || 0);
    });

    let result = Array.from(groups.values());

    if (filtro) {
      const f = filtro.toLowerCase();
      result = result.filter(v => 
        v.clienteNombre.toLowerCase().includes(f) || 
        String(v.idVenta).includes(f)
      );
    }

    return result.sort((a,b) => {
      const fechaA = toDate(a.pagos[0]?.fecha);
      const fechaB = toDate(b.pagos[0]?.fecha);
      return fechaB.getTime() - fechaA.getTime();
    });
  }, [pagos, filtro, metodoFiltro]);

  const totalPages = Math.ceil(ventasAgrupadas.length / itemsPerPage);
  const paginatedVentas = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return ventasAgrupadas.slice(start, start + itemsPerPage);
  }, [ventasAgrupadas, currentPage, itemsPerPage]);

  useEffect(() => { setCurrentPage(1); }, [filtro, metodoFiltro, itemsPerPage]);

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4 font-body">
      <div className="flex flex-col gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por cliente o id de venta..." 
            className="pl-9 h-10 rounded-full border-muted/60 bg-background"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <div className="w-full sm:w-auto">
            <ConmutadorTriple value={metodoFiltro} onChange={setMetodoFiltro} />
          </div>

          <div className="flex flex-1 justify-center sm:justify-end w-full">
            <div className="flex bg-emerald-50 dark:bg-emerald-950/30 px-4 rounded-full border border-emerald-200 dark:border-emerald-800 h-10 items-center gap-2 shadow-sm w-full sm:w-auto justify-center">
              <Banknote className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
                Total: Q{totalEfectivoPeriodo.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {ventasAgrupadas.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-16 border-2 border-dashed rounded-xl bg-muted/5">
          <ShoppingBag className="h-12 w-12 mb-4 opacity-20" />
          <p className="font-bold text-lg text-foreground">No se encontraron registros</p>
          <p className="text-sm">Intenta con otro término de búsqueda o filtro.</p>
        </div>
      ) : (
        <>
          <Accordion 
            type="single" 
            collapsible 
            className="space-y-2"
            onValueChange={(value) => setIdVentaActiva(value || null)}
          >
            {paginatedVentas.map(venta => {
              const pagoEnEfectivo = venta.pagos.filter(p => p.metodoPago === 'Efectivo').reduce((sum, p) => sum + p.montoTotalPagado, 0);
              const pagoEnTarjeta = venta.pagos.filter(p => p.metodoPago === 'Tarjeta').reduce((sum, p) => sum + p.montoTotalPagado, 0);

              return (
                <AccordionItem 
                  value={venta.ventaDocId} 
                  key={venta.ventaDocId} 
                  className={cn(
                    "border rounded-lg transition-all mb-2 overflow-hidden", 
                    idVentaActiva === venta.ventaDocId ? "border-primary bg-primary/10" : "bg-card-foreground/5 shadow-sm"
                  )}
                >
                  <AccordionTrigger className="p-3 sm:p-4 hover:no-underline text-left data-[state=open]:border-b border-muted/20">
                    <div className="flex flex-col w-full pr-2 sm:pr-4 gap-1.5">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="font-bold text-sm sm:text-lg leading-tight text-foreground truncate">{venta.clienteNombre}</span>
                          {venta.esConsumoInterno && (
                            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-none font-bold uppercase text-[8px] sm:text-[9px] h-4 sm:h-5 rounded-full px-1.5 sm:px-2 shrink-0">
                              Consumo
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm sm:text-xl font-black text-primary tabular-nums shrink-0 ml-2">
                          Q{venta.esConsumoInterno ? '0.00' : venta.totalEnPeriodo.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between w-full flex-wrap gap-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] sm:text-xs font-medium text-muted-foreground whitespace-nowrap">Venta #{venta.idVenta}</span>
                          {!venta.esConsumoInterno && (
                            <div className="flex items-center gap-1 flex-wrap">
                              {pagoEnEfectivo > 0 && (
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 h-4 sm:h-5 px-1 sm:px-1.5 text-[8px] sm:text-[9px] font-bold">
                                  <Coins className="h-2.5 w-2.5 mr-1" /> Q{pagoEnEfectivo.toFixed(2)}
                                </Badge>
                              )}
                              {pagoEnTarjeta > 0 && (
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 h-4 sm:h-5 px-1 sm:px-1.5 text-[8px] sm:text-[9px] font-bold">
                                  <CreditCard className="h-2.5 w-2.5 mr-1" /> Q{pagoEnTarjeta.toFixed(2)}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] sm:text-xs text-muted-foreground font-bold tabular-nums uppercase tracking-tighter">
                          {venta.pagos.length} Pago(s)
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-0 bg-background/50">
                    <div className="p-4 sm:p-6 flex flex-col">
                      <div className="relative before:absolute before:left-3.5 sm:before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-muted-foreground/15">
                        <div className="space-y-6 sm:space-y-8">
                          {venta.pagos.sort((a,b) => toDate(b.fecha).getTime() - toDate(a.fecha).getTime()).map((pago, idx) => {
                            const esUltimo = idx === 0;
                            const esPagoConsumoInterno = pago.metodoPago === 'Consumo Interno';

                            return (
                              <div key={idx} className="relative pl-8 sm:pl-12">
                                <div className={cn(
                                  "absolute left-0.5 sm:left-2.5 top-1 h-5 w-5 rounded-full flex items-center justify-center z-10 shadow-sm border-2 border-background",
                                  esUltimo ? "bg-primary" : "bg-muted-foreground/30"
                                )}>
                                  {esUltimo ? <CheckCircle2 className="h-3 w-3 text-primary-foreground" /> : <div className="h-1.5 w-1.5 rounded-full bg-background" />}
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1">
                                  <div className={cn("font-bold text-[11px] sm:text-sm flex items-center gap-2", esUltimo ? "text-primary" : "text-muted-foreground")}>
                                    {esPagoConsumoInterno ? (
                                      <CheckCircle2 className="h-3.5 w-3.5 text-purple-500" />
                                    ) : pago.metodoPago === 'Efectivo' ? (
                                      <Coins className="h-3.5 w-3.5 text-emerald-500" />
                                    ) : (
                                      <CreditCard className="h-3.5 w-3.5 text-blue-500" />
                                    )}
                                    {esPagoConsumoInterno ? 'Consumo interno' : `Pago de Q${pago.montoTotalPagado.toFixed(2)}`}
                                  </div>
                                  <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground/80 tabular-nums">
                                    {format(toDate(pago.fecha), "dd/MM/yy, hh:mm a", { locale: es })}
                                  </span>
                                </div>
                                <div className={cn(
                                  "rounded-xl p-3 border shadow-sm transition-all",
                                  esUltimo ? "bg-muted/20 border-primary/20" : "bg-muted/5 border-muted/60"
                                )}>
                                  {pago.itemsSaldados.map((item, i) => (
                                    <div key={i} className="flex justify-between text-[10px] sm:text-xs py-1.5 border-b last:border-0 border-muted/40">
                                      <span className="text-muted-foreground font-medium truncate max-w-[65%] text-left">
                                        {item.cantidad ? `${item.cantidad}x ` : ''}{item.nombreProducto}
                                      </span>
                                      <span className={cn("font-bold shrink-0 ml-2 tabular-nums", esUltimo ? "text-primary" : "text-foreground/80")}>
                                        + Q{esPagoConsumoInterno ? '0.00' : (item.montoAplicado || 0).toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-4 border-t border-muted/60 bg-muted/5 p-4 rounded-xl">
            <div className="flex items-center space-x-2">
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">Filas por pág.</p>
              <Select value={String(itemsPerPage)} onValueChange={(v) => setItemsPerPage(Number(v))}>
                <SelectTrigger className="h-8 w-[70px] rounded-full text-[10px] sm:text-xs font-bold border-muted/60 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="top" className="font-body">
                  {[10, 30, 50, 100].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-full items-center justify-center space-x-2 sm:w-auto">
              <Button variant="outline" size="sm" className="px-3 sm:px-4 rounded-full h-8 border-muted/60 bg-background" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="text-[10px] sm:text-xs font-bold">Ant.</span>
              </Button>
              <div className="flex-shrink-0 text-[10px] sm:text-xs font-bold text-muted-foreground px-2 tracking-tighter">
                Página {currentPage} de {totalPages || 1}
              </div>
              <Button variant="outline" size="sm" className="px-3 sm:px-4 rounded-full h-8 border-muted/60 bg-background" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                <span className="text-[10px] sm:text-xs font-bold">Sig.</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
