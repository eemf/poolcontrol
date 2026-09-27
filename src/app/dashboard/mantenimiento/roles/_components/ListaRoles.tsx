'use client';

import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Edit, Trash2, ChevronLeft, ChevronRight, ShieldCheck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Rol } from "@/lib/tipos";

type RolConDocId = Rol & { docId: string };

interface ListaRolesProps {
  roles: RolConDocId[];
  cargando: boolean;
  terminoBusqueda: string;
  onSearchChange: (val: string) => void;
  onEditar: (rol: RolConDocId) => void;
  onEliminar: (rol: RolConDocId) => void;
  paginacion: {
    paginaActual: number;
    itemsPorPagina: number;
    totalPaginas: number;
    onPaginaChange: (pagina: number) => void;
    onItemsPorPaginaChange: (val: number) => void;
  };
}

export function ListaRoles({
  roles,
  cargando,
  terminoBusqueda,
  onSearchChange,
  onEditar,
  onEliminar,
  paginacion
}: ListaRolesProps) {
  return (
    <Card className="border rounded-lg transition-all bg-card-foreground/5 shadow-sm font-body overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o descripción..."
            className="pl-9 rounded-full h-10 border-muted-foreground/20"
            value={terminoBusqueda}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {cargando ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : roles.length > 0 ? (
          <div className="space-y-2 mt-2">
            {roles.map((rol) => (
              <div 
                key={rol.docId} 
                className="flex flex-col sm:flex-row items-start sm:items-center p-4 border rounded-lg bg-card-foreground/5 hover:bg-muted/50 transition-all shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-base truncate">{rol.nombre}</p>
                  <p className="text-xs text-muted-foreground font-body">{rol.descripcion || 'Sin descripción'}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 pt-4 sm:pt-0 sm:ml-auto">
                  <Button 
                    size="sm" 
                    className="rounded-full h-9 px-5 font-bold text-xs bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
                    onClick={() => onEditar(rol)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="rounded-full h-9 px-5 font-bold text-xs shadow-sm"
                    onClick={() => onEliminar(rol)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-lg bg-muted/5 m-2">
            <ShieldCheck className="h-12 w-12 mb-4 text-primary/30" />
            <p className="font-semibold text-lg">{terminoBusqueda ? "Sin resultados" : "No hay roles registrados"}</p>
            <p className="text-xs mt-1">Crea tu primer rol para asignar permisos.</p>
          </div>
        )}
      </CardContent>
      {paginacion.totalPaginas > 1 && (
        <CardFooter className="flex flex-col items-center gap-4 p-4 sm:flex-row sm:justify-between bg-muted/5">
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
