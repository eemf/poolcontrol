'use client';

import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Search, FileText, Loader2, CalendarDays, Clock, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import type { Gasto } from "@/lib/tipos";

type GastoConDocId = Gasto & { docId: string };

interface ListaGastosProps {
  gastos: GastoConDocId[];
  cargando: boolean;
  terminoBusqueda: string;
  onTerminoBusquedaChange: (val: string) => void;
  mostrarTodos: boolean;
  onMostrarTodosChange: (val: boolean) => void;
  onEditar: (gasto: GastoConDocId) => void;
  onEliminar: (gasto: GastoConDocId) => void;
  paginacion: {
    paginaActual: number;
    itemsPorPagina: number;
    totalPaginas: number;
    onPaginaChange: (pagina: number) => void;
    onItemsPorPaginaChange: (val: number) => void;
  };
}

export function ListaGastos({
  gastos,
  cargando,
  terminoBusqueda,
  onTerminoBusquedaChange,
  mostrarTodos,
  onMostrarTodosChange,
  onEditar,
  onEliminar,
  paginacion
}: ListaGastosProps) {
  return (
    <Card className="shadow-sm border-muted/60 font-body overflow-hidden">
      <CardHeader className="p-4 bg-muted/5 border-b">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por descripción o ID..."
              className="pl-9 rounded-full h-10 border-muted-foreground/20"
              value={terminoBusqueda}
              onChange={(e) => onTerminoBusquedaChange(e.target.value)}
            />
          </div>
          
          <div className="flex items-center justify-center gap-3 px-4 h-10 border rounded-full bg-background shrink-0 w-full sm:w-auto">
            <span className={cn("text-xs font-medium transition-colors", !mostrarTodos ? "text-primary font-bold" : "text-muted-foreground")}>
              Pendientes
            </span>
            <Switch
              id="mostrar-todos"
              checked={mostrarTodos}
              onCheckedChange={onMostrarTodosChange}
            />
            <span className={cn("text-xs font-medium transition-colors", mostrarTodos ? "text-primary font-bold" : "text-muted-foreground")}>
              Todos
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {cargando ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : gastos.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-3xl bg-muted/5 m-2">
            <FileText className="h-12 w-12 mb-4 text-primary/20" />
            <p className="font-bold text-lg">{terminoBusqueda ? "Sin resultados" : (mostrarTodos ? "No hay gastos registrados" : "Sin gastos pendientes")}</p>
            <p className="text-sm mt-1">Los gastos registrados aparecerán aquí.</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-2 mt-2">
            {gastos.map((gasto) => (
              <AccordionItem value={gasto.docId} key={gasto.docId} className="border-b-0 rounded-xl border border-muted/60 bg-muted/30 hover:bg-muted/50 transition-all overflow-hidden mb-2 shadow-sm">
                <AccordionTrigger className="p-3 sm:p-4 hover:no-underline text-sm transition-colors data-[state=open]:bg-muted/30">
                  <div className="grid grid-cols-[1fr,auto] gap-2 items-center w-full pr-2 sm:pr-4 text-left font-body text-foreground">
                    <div className="flex flex-col items-start min-w-0">
                      <p className="font-bold text-base sm:text-lg leading-tight truncate w-full">
                        #{gasto.idGasto}. {gasto.descripcion}
                      </p>
                      <Badge className={cn('mt-1 rounded-full px-2.5 h-5 text-[10px] font-semibold border-none shadow-sm', gasto.estado === 'pendiente' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white')}>
                        {gasto.estado === 'pendiente' ? 'Pendiente' : 'Procesado'}
                      </Badge>
                    </div>
                    <div className="flex flex-col items-end shrink-0 gap-1 ml-2">
                      <span className="text-sm sm:text-lg font-bold text-primary leading-none">Q{gasto.monto.toFixed(2)}</span>
                      <p className="text-[10px] sm:text-xs text-muted-foreground font-medium tracking-tight whitespace-nowrap">
                        {format(gasto.fecha.toDate(), "dd/MM/yyyy hh:mm a", { locale: es })}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-0">
                  <div className="border-t mt-2 pt-4 flex items-center justify-end gap-2 w-full">
                    <Button className="rounded-full h-9 px-5 font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-sm" onClick={() => onEditar(gasto)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button variant="destructive" className="rounded-full h-9 px-5 font-semibold shadow-sm" onClick={() => onEliminar(gasto)}>
                      <Trash2 className="mr-2 h-4 w-4"/>
                      Eliminar
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>

      {paginacion.totalPaginas > 1 && (
        <CardFooter className="flex flex-col items-center gap-4 border-t p-4 sm:flex-row sm:justify-between bg-muted/5 font-body">
          <div className="flex items-center space-x-2">
            <p className="text-xs font-medium text-muted-foreground">Filas por Página</p>
            <Select
              value={`${paginacion.itemsPorPagina}`}
              onValueChange={(value) => paginacion.onItemsPorPaginaChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px] rounded-full text-xs">
                <SelectValue placeholder={paginacion.itemsPorPagina} />
              </SelectTrigger>
              <SelectContent side="top" className="font-body">
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
              onClick={() => paginacion.onPaginaChange(Math.max(1, paginacion.paginaActual - 1))}
              disabled={paginacion.paginaActual === 1}
              className="h-8 px-3 rounded-full"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="text-xs">Anterior</span>
            </Button>
            <div className="flex-shrink-0 text-xs font-semibold text-muted-foreground tracking-tighter px-2">
              Pág. {paginacion.paginaActual} de {paginacion.totalPaginas}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginacion.onPaginaChange(Math.min(paginacion.totalPaginas, paginacion.paginaActual + 1))}
              disabled={paginacion.paginaActual === paginacion.totalPaginas}
              className="h-8 px-3 rounded-full"
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
