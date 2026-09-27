
'use client';

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, ArrowUpDown, Loader2, Edit, Trash2, ChevronLeft, ChevronRight, Contact, Phone, UserCog, Key, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Cliente } from "@/lib/tipos";

type ClienteConDocId = Cliente & { docId: string };

interface ListaClientesProps {
  clientes: ClienteConDocId[];
  cargando: boolean;
  terminoBusqueda: string;
  onSearchChange: (val: string) => void;
  orden: string;
  onSortOrderChange: (val: string) => void;
  onEditar: (cliente: ClienteConDocId) => void;
  onEliminar: (cliente: ClienteConDocId) => void;
  paginacion: {
    paginaActual: number;
    itemsPorPagina: number;
    totalPaginas: number;
    onPaginaChange: (pagina: number) => void;
    onItemsPorPaginaChange: (val: number) => void;
  };
}

export function ListaClientes({
  clientes,
  cargando,
  terminoBusqueda,
  onSearchChange,
  orden,
  onSortOrderChange,
  onEditar,
  onEliminar,
  paginacion
}: ListaClientesProps) {
  
  const getBadgeClasses = (tipo: Cliente['tipoCliente']) => {
    switch (tipo) {
        case 'Cliente': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
        case 'Proveedor': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
        case 'Ambos': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300';
        default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Card className="border rounded-lg transition-all bg-card-foreground/5 shadow-sm font-body overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o tipo..."
              className="pl-9 rounded-full h-10 border-muted-foreground/20"
              value={terminoBusqueda}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Select value={orden} onValueChange={onSortOrderChange}>
            <SelectTrigger className="w-full sm:w-[200px] rounded-full h-10 border-muted-foreground/20">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Ordenar por..." />
            </SelectTrigger>
            <SelectContent className="font-body">
              <SelectItem value="id-desc">ID Descendente</SelectItem>
              <SelectItem value="id-asc">ID Ascendente</SelectItem>
              <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
              <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {cargando ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : clientes.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-2 mt-2">
            {clientes.map((cliente) => (
              <AccordionItem 
                value={cliente.docId} 
                key={cliente.docId} 
                className="border-b-0 rounded-lg border bg-card-foreground/5 hover:bg-muted/50 transition-all overflow-hidden mb-2 shadow-sm"
              >
                <AccordionTrigger className="px-4 py-4 hover:no-underline font-body">
                  <div className="flex flex-1 items-center justify-between pr-4 text-left">
                    <div className="min-w-0">
                      <p className="font-bold text-base text-foreground truncate">{cliente.nombre}</p>
                      <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">ID: {cliente.idcliente}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {cliente.permiteCredito !== false ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 h-5 px-1.5 text-[8px] font-black uppercase">Crédito OK</Badge>
                        ) : (
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 h-5 px-1.5 text-[8px] font-black uppercase">Sin Crédito</Badge>
                        )}
                        <Badge variant="outline" className={cn('rounded-full font-bold border-none h-6 px-3 shadow-sm', getBadgeClasses(cliente.tipoCliente))}>
                            {cliente.tipoCliente}
                        </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="border-t pt-4 mt-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-muted-foreground flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" /> Información de contacto
                        </h4>
                        <p className="text-sm font-medium text-foreground/80 pl-5">
                          {cliente.telefono || 'Sin teléfono registrado'}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-muted-foreground flex items-center gap-2">
                          <UserCog className="h-3.5 w-3.5" /> Configuraciones especiales
                        </h4>
                        <div className="space-y-2 pl-5">
                            <div className="flex items-center gap-3">
                                <Switch checked={cliente.consumoInterno} disabled className="h-5 scale-75" />
                                <span className="text-xs font-medium text-muted-foreground">
                                    Consumo interno: {cliente.consumoInterno ? 'Habilitado' : 'Deshabilitado'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Switch checked={cliente.permiteCredito !== false} disabled className="h-5 scale-75" />
                                <span className="text-xs font-medium text-muted-foreground">
                                    Línea de crédito: {cliente.permiteCredito !== false ? 'Activa' : 'Bloqueada'}
                                </span>
                            </div>
                        </div>
                        {cliente.consumoInterno && cliente.pinConsumoInterno && (
                          <div className="flex items-center gap-2 pl-5 mt-2">
                            <Key className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-xs font-mono font-bold tracking-widest">****</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-dashed border-muted-foreground/20">
                      <Button 
                        size="sm" 
                        className="rounded-full h-10 px-5 font-bold text-xs bg-sky-600 hover:bg-sky-700 text-white shadow-sm w-full sm:w-auto"
                        onClick={() => onEditar(cliente)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar Registro
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="rounded-full h-10 px-5 font-bold text-xs shadow-sm w-full sm:w-auto"
                        onClick={() => onEliminar(cliente)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-lg bg-muted/5 m-2">
            <Contact className="h-12 w-12 mb-4 text-primary/30" />
            <p className="font-semibold text-lg">{terminoBusqueda ? "Sin resultados" : "No hay clientes registrados"}</p>
            <p className="text-xs mt-1">Los registros aparecerán aquí.</p>
          </div>
        )}
      </CardContent>
      {paginacion.totalPaginas > 1 && (
        <CardFooter className="flex flex-col items-center gap-4 p-4 sm:flex-row sm:justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-xs font-medium text-muted-foreground">Filas por página</p>
            <Select value={`${paginacion.itemsPorPagina}`} onValueChange={(v) => paginacion.onItemsPorPaginaChange(Number(v))}>
              <SelectTrigger className="h-8 w-[70px] rounded-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>{pageSize}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-full items-center justify-center space-x-2 sm:w-auto">
            <Button variant="outline" size="sm" onClick={() => paginacion.onPaginaChange(paginacion.paginaActual - 1)} disabled={paginacion.paginaActual === 1} className="px-3 rounded-full h-8">
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="text-xs">Anterior</span>
            </Button>
            <div className="flex-shrink-0 text-xs font-bold text-muted-foreground px-2">
              Pág. {paginacion.paginaActual} de {paginacion.totalPaginas}
            </div>
            <Button variant="outline" size="sm" onClick={() => paginacion.onPaginaChange(paginacion.paginaActual + 1)} disabled={paginacion.paginaActual === paginacion.totalPaginas} className="px-3 rounded-full h-8">
              <span className="text-xs">Siguiente</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
