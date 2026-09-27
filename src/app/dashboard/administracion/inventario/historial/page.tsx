'use client'

import React, { useState, useMemo, useEffect } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import type { AjusteInventario } from '@/lib/tipos';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History, Search, Loader2, FileText, ArrowDown, ArrowUp, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useSucursal } from '@/hooks/use-sucursal';

type AjusteConId = AjusteInventario & { id: string };

export default function PaginaHistorialAjustes() {
  const { firestore } = useFirebase();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  const [filtro, setFiltro] = useState('');
  const [openItem, setOpenItem] = useState<string | undefined>(undefined);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const ajustesQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/ajustes_inventario`), orderBy('fecha', 'desc'));
  }, [firestore, sucursalId]);

  const { data: ajustes, isLoading, error } = useCollection<AjusteInventario>(ajustesQuery);

  const ajustesConId = useMemo((): AjusteConId[] => 
    (ajustes || []).map(a => ({ ...a, id: a.id }))
  , [ajustes]);

  const ajustesFiltrados = useMemo(() => {
    if (!filtro) return ajustesConId;
    const filtroLower = filtro.toLowerCase();
    return ajustesConId.filter(a => 
      a.observaciones.toLowerCase().includes(filtroLower) ||
      String(a.idAjuste).includes(filtroLower)
    );
  }, [ajustesConId, filtro]);

  const totalPages = Math.ceil(ajustesFiltrados.length / itemsPerPage);
  const paginatedAjustes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return ajustesFiltrados.slice(startIndex, startIndex + itemsPerPage);
  }, [ajustesFiltrados, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtro, itemsPerPage]);
  
  const renderDiferencia = (diferencia: number) => {
    if (diferencia === 0) return <span className="font-semibold text-muted-foreground">-</span>;
    const icono = diferencia > 0 ? <ArrowUp size={14}/> : <ArrowDown size={14}/>;
    const color = diferencia > 0 ? "text-green-600" : "text-destructive";
    const signo = diferencia > 0 ? "+" : "";

    return (
        <span className={cn("font-semibold flex items-center justify-center gap-1", color)}>
            {icono} {signo}{diferencia}
        </span>
    );
  }

  if (isLoading || isLoadingSucursal) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }
  if (error) {
    return <div className="text-center text-red-500 p-4"><p>Error al cargar el historial: {error.message}</p></div>;
  }
  
  return (
    <div className="space-y-6 font-body">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-auto text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2 text-foreground">
            <History className="h-6 w-6 text-primary"/>
            Historial de revisiones de inventarios
          </h1>
          <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
            Consulta los registros de ajustes realizados al inventario físico.
          </p>
        </div>
        <Link href="/dashboard/administracion/inventario">
          <Button variant="outline" className="rounded-full font-medium">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Regresar
          </Button>
        </Link>
      </div>
      
      <Card className="border border-border bg-card rounded-lg shadow-sm overflow-hidden">
        <CardHeader className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por ID o en observaciones..."
              className="pl-9 rounded-full"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {paginatedAjustes.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-lg bg-muted/5">
                <FileText className="h-12 w-12 mb-4 text-primary/30" />
                <p className="font-semibold text-lg">{filtro ? "No se encontraron registros" : "No hay ajustes registrados"}</p>
                <p className="text-sm">Los ajustes guardados aparecerán aquí.</p>
            </div>
          ) : (
            <Accordion 
              type="single" 
              collapsible 
              className="w-full space-y-2" 
              value={openItem} 
              onValueChange={setOpenItem}
            >
              {paginatedAjustes.map(ajuste => (
                <AccordionItem 
                  value={ajuste.id} 
                  key={ajuste.id} 
                  className="border border-border rounded-lg transition-all overflow-hidden bg-card-foreground/5 shadow-sm"
                >
                  <AccordionTrigger className="p-4 hover:no-underline text-sm transition-none data-[state=open]:border-b border-muted-foreground/10">
                    <div className="flex flex-1 items-center justify-between w-full pr-2 sm:pr-4">
                      <div className="flex flex-col text-left min-w-0 flex-1">
                        <p className="font-bold text-[13px] sm:text-base leading-tight truncate">
                          {format(ajuste.fecha.toDate(), "dd 'de' LLLL, yyyy", { locale: es })}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mt-0.5">
                          {format(ajuste.fecha.toDate(), "hh:mm aaa", { locale: es })}
                        </p>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        <Badge variant="secondary" className="font-bold rounded-full px-3 py-1 bg-primary/10 text-primary border-none flex flex-row items-center gap-1">
                          <span className="text-[13px]">{ajuste.detalles.length}</span>
                          <span className="text-[11px] whitespace-nowrap">
                            {ajuste.detalles.length === 1 ? 'prod.' : 'prods.'}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 pt-0">
                    <div className="space-y-6 pt-4">
                      {ajuste.observaciones && (
                        <div className="bg-muted/50 p-3 rounded-lg border border-muted/60">
                          <p className="text-[10px] font-bold text-muted-foreground mb-1">Observaciones:</p>
                          <p className="text-sm leading-relaxed">{ajuste.observaciones}</p>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        {ajuste.detalles.map(detalle => (
                          <div key={detalle.productoId} className="flex items-center justify-between p-3 bg-background/50 rounded-xl border border-muted/40 text-sm">
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-foreground truncate">{detalle.nombreProducto}</p>
                              <div className="flex items-center gap-3 mt-1.5 text-[10px] font-medium text-muted-foreground">
                                <span className="flex items-center gap-1">Sistema: <span className="font-bold text-foreground/80">{detalle.existenciaSistema}</span></span>
                                <span className="opacity-30">|</span>
                                <span className="flex items-center gap-1">Físico: <span className="text-primary font-bold">{detalle.existenciaFisica}</span></span>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-4">
                              <p className="text-[10px] font-bold text-muted-foreground mb-1 text-center">Dif.</p>
                              <div className="font-mono bg-background px-2 py-1 rounded-md border border-muted/40 min-w-[60px] text-center">
                                {renderDiferencia(detalle.diferencia)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-end pt-2">
                        <span className="text-[10px] font-bold text-muted-foreground">Id de ajuste: #{ajuste.idAjuste}</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
        
        {totalPages > 1 && (
          <CardFooter className="flex flex-col items-center gap-4 border-t p-4 sm:flex-row sm:justify-between bg-muted/5">
            <div className="flex items-center space-x-2">
              <p className="text-xs font-medium text-muted-foreground">Filas por página</p>
              <Select
                value={`${itemsPerPage}`}
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
                <SelectTrigger className="h-8 w-[70px] text-xs rounded-full bg-background">
                  <SelectValue placeholder={itemsPerPage} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 50, 100].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-full items-center justify-center space-x-2 sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 px-3 rounded-full bg-background"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="text-xs">Anterior</span>
              </Button>
              <div className="flex-shrink-0 text-xs font-semibold text-muted-foreground tracking-tighter px-2">
                Pág. {currentPage} de {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-3 rounded-full bg-background"
              >
                <span className="text-xs">Siguiente</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
