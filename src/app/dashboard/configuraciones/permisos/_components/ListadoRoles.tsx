'use client';

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Trash2, CheckCircle2, Key, FileText, ShieldCheck } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Rol } from "@/lib/tipos";

interface ListadoRolesProps {
  roles: Rol[] | null;
  cargando: boolean;
  onEditar: (rol: Rol) => void;
  onEliminar: (rol: Rol) => void;
}

export function ListadoRoles({ roles, cargando, onEditar, onEliminar }: ListadoRolesProps) {
  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-3 text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
        <span className="text-xs">Cargando roles y permisos...</span>
      </div>
    );
  }

  if (!roles || roles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-slate-400 h-64 rounded-xl border border-dashed border-[#2e2e2e] bg-[#252526]/50 p-6 font-body">
        <ShieldCheck className="h-10 w-10 mb-3 text-slate-500" />
        <p className="font-semibold text-base text-slate-200">No hay roles definidos</p>
        <p className="text-xs text-slate-400 mt-1">Crea tu primer rol para configurar sus capacidades.</p>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full space-y-2.5 font-body">
      {roles.map((rol) => {
        const groupedPermissions = (rol.permisos || []).reduce((acc, p) => {
          const [cat, action] = p.split('.');
          const category = cat.charAt(0).toUpperCase() + cat.slice(1);
          const label = action ? action.charAt(0).toUpperCase() + action.slice(1) : category;

          if (!acc[category]) acc[category] = [];
          acc[category].push(label);
          return acc;
        }, {} as Record<string, string[]>);

        const numPermisos = rol.permisos?.length || 0;

        return (
          <AccordionItem
            value={(rol as any).id}
            key={(rol as any).id}
            className="rounded-xl border border-[#2e2e2e] hover:border-[#383838] bg-[#252526] transition-all overflow-hidden shadow-sm"
          >
            <AccordionTrigger className="px-3.5 py-3 sm:px-4 sm:py-3.5 hover:no-underline hover:bg-[#2e2e2e]/30 transition-colors data-[state=open]:border-b data-[state=open]:border-[#2e2e2e]">
              <div className="flex-1 flex items-center justify-between gap-3 text-left pr-1.5 sm:pr-2.5 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm sm:text-base text-slate-100 truncate">{rol.nombre}</p>
                    <p className="text-[0.6875rem] text-slate-400 font-medium mt-0.5 tabular-nums">
                      {numPermisos} {numPermisos === 1 ? 'capacidad configurada' : 'capacidades configuradas'}
                    </p>
                  </div>
                </div>
                <Badge className="rounded-full text-[0.625rem] font-semibold px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  Activo
                </Badge>
              </div>
            </AccordionTrigger>

            <AccordionContent className="p-3.5 sm:p-4 bg-[#1e1e1e]">
              <div className="space-y-4">
                <div className="bg-[#252526] border border-[#2e2e2e] rounded-xl px-3.5 py-3 space-y-1">
                  <h4 className="text-[0.6875rem] font-medium text-slate-400 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-sky-400" />
                    Perfil de responsabilidades
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-200">
                    {rol.descripcion || "Sin descripción detallada disponible."}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-sky-400" />
                    Matriz de permisos detallada
                  </h4>

                  {numPermisos > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {Object.entries(groupedPermissions).map(([category, perms]) => (
                        <div key={category} className="bg-[#252526] rounded-xl border border-[#2e2e2e] p-3 space-y-2">
                          <p className="text-xs font-bold text-sky-400 border-b border-[#2e2e2e] pb-1.5">
                            {category}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {perms.map((p) => (
                              <div
                                key={p}
                                className="flex items-center gap-1.5 bg-[#1e1e1e] text-slate-200 px-2.5 py-1 rounded-full text-[0.6875rem] font-medium border border-[#2e2e2e]"
                              >
                                <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                                {p}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#252526]/50 rounded-xl border border-dashed border-[#2e2e2e] p-6 text-center">
                      <span className="text-xs text-slate-400 italic">
                        Este rol no cuenta con privilegios asignados todavía.
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#2e2e2e]">
                  <Button
                    size="sm"
                    className="rounded-full h-8 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-sm"
                    onClick={() => onEditar(rol)}
                  >
                    <Edit className="mr-1.5 h-3.5 w-3.5" />
                    Editar Rol
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-full h-8 px-4 text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 shadow-sm"
                    onClick={() => onEliminar(rol)}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
