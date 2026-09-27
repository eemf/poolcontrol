
'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, History, Loader2, ArrowUp, ArrowDown, CheckCircle2 } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/** Helper para conversión de fechas segura */
const toDate = (fecha: any): Date => {
  if (fecha instanceof Timestamp) return fecha.toDate();
  if (fecha instanceof Date) return fecha;
  if (typeof fecha === 'string') {
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(0);
};

interface KardexInventarioProps {
  inventario: any[] | null;
  isLoading: boolean;
}

export function KardexInventario({ inventario, isLoading }: KardexInventarioProps) {
  const [filtro, setFiltro] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const inventarioProcesado = useMemo(() => {
    if (!inventario) return [];
    
    let result = [...inventario];

    if (filtro) {
      const f = filtro.toLowerCase();
      result = result.filter(item => 
        item.nombreProducto?.toLowerCase().includes(f) ||
        item.tipoMovimiento?.toLowerCase().includes(f) ||
        item.referencia?.toLowerCase().includes(f)
      );
    }

    result.sort((a, b) => {
      const timeA = toDate(a.fecha).getTime();
      const timeB = toDate(b.fecha).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

    return result;
  }, [inventario, filtro, sortOrder]);

  return (
    <div className="space-y-6 outline-none animate-in fade-in duration-500 p-4 sm:p-6">
      {/* Buscador de Productos */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Filtrar movimientos por producto o referencia..." 
          className="pl-9 rounded-full h-11 border-muted-foreground/20 bg-background shadow-sm focus:ring-primary"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      {/* Tabla de Movimientos Físicos */}
      <Card className="border shadow-md rounded-lg overflow-hidden border-muted-foreground/10 bg-[hsl(219,26%,21%)]">
        <div className="bg-black/20 p-4 border-b border-white/5 text-[10px] font-bold text-muted-foreground grid grid-cols-12 gap-4 uppercase tracking-tighter">
          <div className="col-span-4 text-left">Producto / Evento</div>
          <div className="col-span-4 text-center">
            <button 
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-1.5 mx-auto hover:text-primary transition-colors"
            >
              Fecha / Hora
              {sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            </button>
          </div>
          <div className="col-span-1 text-center">Entra</div>
          <div className="col-span-1 text-center">Sale</div>
          <div className="col-span-2 text-right">Saldo Final</div>
        </div>
        <ScrollArea className="h-[400px]">
          <div className="divide-y divide-white/5">
            {isLoading ? (
              <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : inventarioProcesado.length === 0 ? (
              <div className="p-20 text-center text-white/20 italic text-sm border-2 border-dashed border-white/5 m-4 rounded-xl">
                {filtro ? "No se encontraron movimientos para esta búsqueda." : "No hay movimientos de stock físico registrados en este turno."}
              </div>
            ) : (
              inventarioProcesado.map((mov, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.03] transition-colors group relative">
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-primary/40 shadow-sm transition-transform group-hover:scale-110 relative">
                      <History className="h-5 w-5"/>
                      {mov.verificado && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 rounded-full p-0.5 shadow-lg border border-background animate-in zoom-in duration-300">
                                <CheckCircle2 className="h-3 w-3 text-white" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p className="text-[10px] font-bold uppercase tracking-widest">Transacción Verificada</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="font-bold text-sm text-white/90 truncate">{mov.nombreProducto}</p>
                      <p className="text-[10px] font-bold text-muted-foreground/60 truncate opacity-70 mt-0.5">{mov.tipoMovimiento} • {mov.referencia}</p>
                    </div>
                  </div>
                  <div className="col-span-4 text-center text-[10px] font-bold text-white/40 tabular-nums">
                    {format(toDate(mov.fecha), "dd/MM/yy HH:mm", { locale: es })}
                  </div>
                  <div className="col-span-1 text-center text-sm font-black text-emerald-400 tabular-nums">
                    {mov.cantidad > 0 ? `+${mov.cantidad}` : '--'}
                  </div>
                  <div className="col-span-1 text-center text-sm font-black text-rose-400 tabular-nums">
                    {mov.cantidad < 0 ? Math.abs(mov.cantidad) : '--'}
                  </div>
                  <div className="col-span-2 text-right flex flex-col items-end">
                    <span className="font-black text-lg text-primary tabular-nums tracking-tighter">{mov.existenciaNueva}</span>
                    <span className="text-[8px] font-bold text-white/20">Antes: {mov.existenciaAnterior}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
