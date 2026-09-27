'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Trash2, CheckCircle, Key, FileText } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Rol } from "@/lib/tipos";
import { cn } from "@/lib/utils";

interface ListadoRolesProps {
  roles: Rol[] | null;
  cargando: boolean;
  onEditar: (rol: Rol) => void;
  onEliminar: (rolId: string) => void;
}

export function ListadoRoles({ roles, cargando, onEditar, onEliminar }: ListadoRolesProps) {
  if (cargando) {
    return <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  if (!roles || roles.length === 0) {
    return (
      <div className="py-20 text-center border-2 border-dashed rounded-lg text-muted-foreground bg-muted/5 font-body">
        <p>No hay roles definidos para esta sucursal.</p>
      </div>
    );
  }

  return (
    <Card className="border-none shadow-none bg-transparent font-body overflow-hidden">
      <CardContent className="p-0">
        <Accordion type="single" collapsible className="w-full space-y-3">
          {roles.map(rol => {
            // Lógica de agrupación de permisos por categoría
            const groupedPermissions = (rol.permisos || []).reduce((acc, p) => {
              const [cat, action] = p.split('.');
              const category = cat.charAt(0).toUpperCase() + cat.slice(1);
              const label = action ? action.charAt(0).toUpperCase() + action.slice(1) : category;
              
              if (!acc[category]) acc[category] = [];
              acc[category].push(label);
              return acc;
            }, {} as Record<string, string[]>);

            return (
              <AccordionItem 
                value={(rol as any).id} 
                key={(rol as any).id} 
                className="border rounded-lg bg-card-foreground/5 hover:bg-card-foreground/[0.08] transition-all overflow-hidden shadow-sm"
              >
                <AccordionTrigger className="px-4 py-4 hover:no-underline font-body">
                  <div className="flex flex-1 items-center justify-between pr-4 text-left gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-base text-foreground truncate">{rol.nombre}</p>
                      <p className="text-[10px] font-medium text-muted-foreground tracking-tight mt-0.5">
                        {(rol.permisos?.length || 0)} Capacidades configuradas
                      </p>
                    </div>
                    <Badge className="bg-primary text-white border-none rounded-full font-bold px-3 h-6 text-[10px] shrink-0">
                      Activo
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="border-t border-muted-foreground/10 pt-4 mt-2 space-y-6">
                    {/* Sección Descripción */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black text-muted-foreground tracking-widest uppercase flex items-center gap-2">
                        <FileText className="h-3 w-3" /> Perfil de Responsabilidades
                      </h4>
                      <p className="text-sm font-medium text-foreground/80 pl-1">
                        {rol.descripcion || "Sin descripción detallada disponible."}
                      </p>
                    </div>

                    {/* Sección Permisos Estructurada */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-muted-foreground tracking-widest uppercase flex items-center gap-2">
                        <Key className="h-3 w-3 text-primary" /> Matriz de Permisos Detallada
                      </h4>
                      
                      {rol.permisos && rol.permisos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {Object.entries(groupedPermissions).map(([category, perms]) => (
                            <div key={category} className="bg-background/50 rounded-xl border border-muted-foreground/10 p-3 shadow-sm">
                              <p className="text-[9px] font-black text-primary uppercase tracking-tighter mb-2 border-b border-primary/10 pb-1">
                                {category}
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {perms.map(p => (
                                  <div 
                                    key={p} 
                                    className="flex items-center gap-1.5 bg-muted/50 text-foreground/80 px-2 py-1 rounded-md text-[10px] font-bold border border-muted-foreground/10 transition-colors hover:bg-muted"
                                  >
                                    <CheckCircle className="h-3 w-3 text-emerald-500" />
                                    {p}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-background/50 rounded-xl border border-dashed border-muted-foreground/20 p-6 text-center">
                          <span className="text-xs text-muted-foreground italic">Este rol no cuenta con privilegios asignados todavía.</span>
                        </div>
                      )}
                    </div>

                    {/* Acciones del Registro */}
                    <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-dashed border-muted-foreground/20">
                      <button 
                        className="rounded-full h-11 sm:h-9 px-5 font-bold text-xs bg-sky-600 hover:bg-sky-700 text-white shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-95 w-full sm:w-auto"
                        onClick={() => onEditar(rol)}
                      >
                        <Edit className="h-4 w-4" />
                        Editar Rol
                      </button>
                      <button 
                        className="rounded-full h-11 sm:h-9 px-5 font-bold text-xs bg-destructive hover:bg-destructive/90 text-white shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-95 w-full sm:w-auto"
                        onClick={() => onEliminar((rol as any).id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
