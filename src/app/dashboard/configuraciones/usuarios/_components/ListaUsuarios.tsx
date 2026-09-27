'use client';

import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Edit, Trash2, ChevronLeft, ChevronRight, User, Mail, Shield, ShieldAlert, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UsuarioSucursal } from "@/lib/tipos";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type UsuarioConDocId = UsuarioSucursal & { docId: string };

interface ListaUsuariosProps {
  usuarios: UsuarioConDocId[];
  cargando: boolean;
  terminoBusqueda: string;
  onSearchChange: (val: string) => void;
  onEditar: (usuario: UsuarioConDocId) => void;
  onEliminar: (usuario: UsuarioConDocId) => void;
  errorPermisos: boolean;
  paginacion: {
    paginaActual: number;
    itemsPorPagina: number;
    totalPaginas: number;
    onPaginaChange: (pagina: number) => void;
    onItemsPorPaginaChange: (val: number) => void;
  };
}

export function ListaUsuarios({
  usuarios,
  cargando,
  terminoBusqueda,
  onSearchChange,
  onEditar,
  onEliminar,
  errorPermisos,
  paginacion
}: ListaUsuariosProps) {
  
  const getRolBadgeClasses = (rol: string) => {
    const r = rol.toLowerCase();
    if (r === 'admin' || r === 'administrador') return 'bg-indigo-600 text-white border-none shadow-sm';
    if (r === 'cajero') return 'bg-blue-600 text-white border-none shadow-sm';
    return 'bg-slate-600 text-white border-none shadow-sm';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <Card className="border rounded-lg transition-all bg-card-foreground/5 shadow-sm font-body overflow-hidden">
      <CardHeader className="p-4">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o rol..."
            className="pl-9 rounded-full h-10 border-muted-foreground/20 bg-background"
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
        ) : errorPermisos ? (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-lg bg-destructive/10 text-destructive">
            <ShieldAlert className="h-12 w-12 mb-4" />
            <p className="font-semibold text-lg">Acceso denegado</p>
            <p className="text-sm max-w-sm">No tienes los permisos necesarios para gestionar usuarios. Contacta al administrador maestro.</p>
          </div>
        ) : usuarios.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-2 mt-2">
            {usuarios.map((usuario) => (
              <AccordionItem 
                value={usuario.docId} 
                key={usuario.docId} 
                className="border-b-0 rounded-lg border bg-card-foreground/5 hover:bg-muted/50 transition-all overflow-hidden mb-2 shadow-sm"
              >
                <AccordionTrigger className="px-4 py-4 hover:no-underline font-body transition-colors data-[state=open]:bg-muted/30">
                  <div className="flex flex-1 items-center justify-between pr-4 text-left">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 border border-muted-foreground/20">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                          {getInitials(usuario.nombre)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex flex-col gap-0.5">
                        <p className="font-bold text-base text-foreground truncate">{usuario.nombre}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-medium text-muted-foreground tracking-tight">Personal activo</p>
                          <Badge className={cn('sm:hidden rounded-full font-bold px-2 h-5 text-[9px] border-none', getRolBadgeClasses(usuario.rol))}>
                            {usuario.rol}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:flex flex-1 justify-end mr-2">
                      <Badge className={cn('rounded-full font-bold px-3 h-6 text-[10px] border-none shadow-sm', getRolBadgeClasses(usuario.rol))}>
                        {usuario.rol}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="border-t pt-4 mt-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5" /> Correo electrónico
                        </h4>
                        <p className="text-sm font-medium text-foreground/80 pl-5">{usuario.email}</p>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                          <Shield className="h-3.5 w-3.5" /> Identificador de seguridad
                        </h4>
                        <p className="text-[10px] font-mono text-muted-foreground pl-5 break-all opacity-70">{usuario.authUid}</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-dashed border-muted-foreground/20">
                      <Button 
                        size="sm" 
                        className="rounded-full h-9 px-5 font-bold text-xs bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
                        onClick={() => onEditar(usuario)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Editar perfil</span>
                        <span className="sm:hidden">Editar</span>
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="rounded-full h-9 px-5 font-bold text-xs shadow-sm"
                        onClick={() => onEliminar(usuario)}
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
            <User className="h-12 w-12 mb-4 text-primary/30" />
            <p className="font-semibold text-lg">{terminoBusqueda ? "Sin resultados" : "No hay usuarios registrados"}</p>
            <p className="text-xs mt-1">Haz clic en "Añadir usuario" para empezar.</p>
          </div>
        )}
      </CardContent>
      {paginacion.totalPaginas > 1 && (
        <CardFooter className="flex flex-col items-center gap-4 p-4 sm:flex-row sm:justify-between bg-muted/5">
          <div className="flex items-center space-x-2">
            <p className="text-xs font-medium text-muted-foreground">Filas por página</p>
            <Select value={`${paginacion.itemsPorPagina}`} onValueChange={(v) => paginacion.onItemsPorPaginaChange(Number(v))}>
              <SelectTrigger className="h-8 w-[70px] rounded-full text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top" className="font-body">
                {[10, 20, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>{pageSize}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-full items-center justify-center space-x-2 sm:w-auto">
            <Button variant="outline" size="sm" onClick={() => paginacion.onPaginaChange(paginacion.paginaActual - 1)} disabled={paginacion.paginaActual === 1} className="px-3 rounded-full h-8 bg-background">
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="text-xs">Anterior</span>
            </Button>
            <div className="flex-shrink-0 text-xs font-bold text-muted-foreground px-2">
              Pág. {paginacion.paginaActual} de {paginacion.totalPaginas}
            </div>
            <Button variant="outline" size="sm" onClick={() => paginacion.onPaginaChange(paginacion.paginaActual + 1)} disabled={paginacion.paginaActual === paginacion.totalPaginas} className="px-3 rounded-full h-8 bg-background">
              <span className="text-xs">Siguiente</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
