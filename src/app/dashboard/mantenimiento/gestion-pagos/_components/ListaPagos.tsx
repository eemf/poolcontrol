'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, Loader2, ChevronLeft, ChevronRight, History, Clock, ReceiptText, ExternalLink, Coins, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';
import Link from 'next/link';
import type { Pago, CierreCaja } from '@/lib/tipos';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

type PagoConDocId = Pago & { id: string };

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
  pagos: PagoConDocId[];
  cargando: boolean;
  filtro: string;
  onFiltroChange: (val: string) => void;
  periodoFiltro: string;
  onPeriodoFiltroChange: (val: string) => void;
  cierres: CierreCaja[];
  paginacion: {
    paginaActual: number;
    itemsPorPagina: number;
    totalPaginas: number;
    onPaginaChange: (pagina: number) => void;
    onItemsPorPaginaChange: (val: number) => void;
  };
}

export function ListaPagos({
  pagos,
  cargando,
  filtro,
  onFiltroChange,
  periodoFiltro,
  onPeriodoFiltroChange,
  cierres,
  paginacion
}: ListaPagosProps) {
  
  const getBadgeStyle = (metodo: string) => {
    switch (metodo) {
      case 'Efectivo': return 'bg-emerald-600 text-white border-none shadow-sm';
      case 'Tarjeta': return 'bg-blue-600 text-white border-none shadow-sm';
      case 'Consumo Interno': return 'bg-purple-600 text-white border-none shadow-sm';
      default: return 'bg-slate-600 text-white border-none';
    }
  };

  return (
    <Card className="border rounded-lg transition-all bg-card-foreground/5 shadow-sm font-body overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full max-md:max-w-none max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por ID o cliente..."
              className="pl-9 rounded-full h-10 border-muted-foreground/20 bg-background"
              value={filtro}
              onChange={(e) => onFiltroChange(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Label htmlFor="periodo-select" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hidden sm:block shrink-0">Período</Label>
            <Select value={periodoFiltro} onValueChange={onPeriodoFiltroChange}>
              <SelectTrigger id="periodo-select" className="w-full sm:w-[250px] rounded-full h-10 border-muted-foreground/20 bg-background">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Seleccionar período" />
                </div>
              </SelectTrigger>
              <SelectContent className="font-body max-h-[300px]">
                <SelectItem value="actual" className="font-bold text-primary">Turno Actual (Abierto)</SelectItem>
                <SelectItem value="todos">Todos los registros</SelectItem>
                {cierres && cierres.length > 0 && (
                  <>
                    <Separator className="my-2" />
                    <p className="px-2 py-1 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Turnos Cerrados</p>
                    {cierres.map(c => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">
                        Turno #{c.idCuadre} — {format(toDate(c.fecha), 'dd/MM/yy HH:mm')}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {cargando ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : pagos.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-lg bg-muted/5 m-2">
            <History className="h-12 w-12 mb-4 text-primary/30" />
            <p className="font-semibold text-lg">{filtro ? "No se encontraron pagos" : "No hay pagos en este período"}</p>
            <p className="text-xs mt-1">Los registros aparecerán aquí según el filtro seleccionado.</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-2 mt-2">
            {pagos.map(pago => (
              <AccordionItem 
                value={pago.id} 
                key={pago.id} 
                className="border-b-0 rounded-lg border bg-card-foreground/5 hover:bg-muted/50 transition-all overflow-hidden mb-2"
              >
                <AccordionTrigger className="p-4 hover:no-underline font-body transition-colors data-[state=open]:bg-muted/30">
                  <div className="flex flex-1 items-center justify-between w-full pr-2 sm:pr-4">
                    <div className="min-w-0 text-left">
                      <p className="font-bold text-base text-foreground truncate">{pago.clienteNombre}</p>
                      <p className="text-[10px] font-semibold text-muted-foreground tracking-tight mt-0.5">ID Pago: {pago.idPago}</p>
                    </div>
                    <div className="text-right flex flex-col items-end shrink-0 ml-4">
                      <p className="font-bold text-primary tabular-nums text-lg leading-none">Q{pago.montoTotalPagado.toFixed(2)}</p>
                      <Badge className={cn("h-5 text-[9px] font-black uppercase rounded-full mt-1.5", getBadgeStyle(pago.metodoPago))}>
                        {pago.metodoPago}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="border-t pt-4 mt-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Información de la transacción</h4>
                          <p className="text-xs font-bold text-foreground/80 flex items-center gap-2">
                            <Clock className="h-3 w-3 text-primary" />
                            {format(toDate(pago.fecha), "dd 'de' MMMM, yyyy - hh:mm a", { locale: es })}
                          </p>
                        </div>
                        <div className="pt-1">
                          <Button variant="outline" size="sm" asChild className="h-9 rounded-full text-[10px] font-bold px-4">
                            <Link href={`/dashboard/historial-ventas?ventaId=${pago.ventaDocId}`}>
                              <ExternalLink className="mr-2 h-3.5 w-3.5" />
                              Ver detalle de Venta #{pago.idVenta}
                            </Link>
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                          <ReceiptText className="h-3.5 w-3.5 text-primary" /> Artículos Saldados
                        </h4>
                        <div className="space-y-2">
                          {pago.itemsSaldados.map((item, index) => {
                            const esPagoConsumoInterno = pago.metodoPago === 'Consumo Interno';
                            // Usar un epsilon para comparaciones de punto flotante
                            const esLiquidacionTotal = esPagoConsumoInterno || (item.subtotalItem !== undefined && Math.abs(item.montoAplicado - item.subtotalItem) < 0.01);
                            
                            return (
                              <div key={index} className="flex justify-between items-center bg-background/50 p-3 rounded-xl border border-muted/40 transition-colors hover:bg-background shadow-sm">
                                <div className="flex flex-col gap-1 min-w-0">
                                  <p className="font-bold text-[13px] text-foreground truncate">
                                    {item.cantidad ? `${item.cantidad}x ` : '1x '}{item.nombreProducto}
                                  </p>
                                  <Badge className={cn(
                                    "h-4 px-1.5 text-[9px] font-black uppercase rounded-full w-fit border-none text-white",
                                    esLiquidacionTotal ? "bg-emerald-600" : "bg-amber-500"
                                  )}>
                                    {esLiquidacionTotal ? 'Saldado' : 'Abono'}
                                  </Badge>
                                </div>
                                <div className="text-right flex flex-col items-end shrink-0 ml-4">
                                  <p className="font-bold text-green-600 tabular-nums text-sm leading-none">
                                    Q{esPagoConsumoInterno ? '0.00' : (item.montoAplicado || 0).toFixed(2)}
                                  </p>
                                  {item.subtotalItem !== undefined && !esPagoConsumoInterno && (
                                    <p className="text-[10px] text-muted-foreground font-bold tracking-tighter mt-1">
                                      de Q{item.subtotalItem.toFixed(2)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
      {paginacion.totalPaginas > 1 && (
        <CardFooter className="flex flex-col items-center gap-4 p-4 sm:flex-row sm:justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-xs font-medium text-muted-foreground">Filas por página</p>
            <Select
              value={`${paginacion.itemsPorPagina}`}
              onValueChange={(value) => paginacion.onItemsPorPaginaChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px] rounded-full text-xs bg-background">
                <SelectValue placeholder={paginacion.itemsPorPagina} />
              </SelectTrigger>
              <SelectContent side="top" className="font-body">
                {[10, 20, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>{pageSize}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-full items-center justify-center space-x-2 sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginacion.onPaginaChange(paginacion.paginaActual - 1)}
              disabled={paginacion.paginaActual === 1}
              className="px-3 rounded-full h-8 bg-background"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="text-xs">Anterior</span>
            </Button>
            <div className="flex-shrink-0 text-xs font-bold text-muted-foreground px-2">
              Pág. {paginacion.paginaActual} de {paginacion.totalPaginas}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginacion.onPaginaChange(paginacion.paginaActual + 1)}
              disabled={paginacion.paginaActual === paginacion.totalPaginas}
              className="px-3 rounded-full h-8 bg-background"
            >
              <span className="text-xs">Siguiente</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
