'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Rol, UsuarioSucursal } from "@/lib/tipos";

interface SeccionPersonalProps {
  usuarios: UsuarioSucursal[] | null;
  roles: Rol[] | null;
  onToggleRol: (usuarioUid: string, rolId: string, currentRoles: string[]) => void;
  cargando: boolean;
}

export function SeccionPersonal({ usuarios, roles, onToggleRol, cargando }: SeccionPersonalProps) {
  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-3 text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
        <span className="text-xs">Cargando personal de sucursal...</span>
      </div>
    );
  }

  if (!usuarios || usuarios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-slate-400 h-64 rounded-xl border border-dashed border-[#2e2e2e] bg-[#252526]/50 p-6 font-body">
        <Users className="h-10 w-10 mb-3 text-slate-500" />
        <p className="font-semibold text-base text-slate-200">No hay usuarios registrados</p>
        <p className="text-xs text-slate-400 mt-1">No se encontraron usuarios en esta sucursal.</p>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full space-y-2.5 font-body">
      {usuarios.map((usuario) => {
        const numRoles = usuario.roles?.length || 0;

        return (
          <AccordionItem
            value={usuario.authUid}
            key={usuario.authUid}
            className="rounded-xl border border-[#2e2e2e] hover:border-[#383838] bg-[#252526] transition-all overflow-hidden shadow-sm"
          >
            <AccordionTrigger className="px-3.5 py-3 sm:px-4 sm:py-3.5 hover:no-underline hover:bg-[#2e2e2e]/30 transition-colors data-[state=open]:border-b data-[state=open]:border-[#2e2e2e]">
              <div className="flex-1 flex items-center justify-between gap-3 text-left pr-1.5 sm:pr-2.5 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm sm:text-base text-slate-100 truncate">{usuario.nombre}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                      {usuario.email}
                    </p>
                  </div>
                </div>
                <Badge className="rounded-full text-[10px] font-semibold px-2.5 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 shrink-0 tabular-nums">
                  {numRoles} {numRoles === 1 ? 'Rol' : 'Roles'}
                </Badge>
              </div>
            </AccordionTrigger>

            <AccordionContent className="p-3.5 sm:p-4 bg-[#1e1e1e]">
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-sky-400" />
                    Selección de roles asignados
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Haz clic en un rol para activarlo o desactivarlo para este usuario.
                  </p>
                </div>

                <div className="bg-[#252526] rounded-xl border border-[#2e2e2e] p-3.5">
                  <div className="flex flex-wrap gap-2">
                    {roles?.map((rol) => {
                      const rolId = (rol as any).id;
                      const isAssigned = usuario.roles?.includes(rolId);
                      return (
                        <button
                          key={rolId}
                          type="button"
                          className={cn(
                            "h-9 rounded-full text-xs font-semibold font-body px-4 transition-all border",
                            isAssigned
                              ? "bg-sky-600 text-white border-sky-500 shadow-sm hover:bg-sky-500"
                              : "bg-[#1e1e1e] text-slate-300 border-[#2e2e2e] hover:bg-[#313131] hover:text-slate-100"
                          )}
                          onClick={() => onToggleRol(usuario.authUid, rolId, usuario.roles || [])}
                        >
                          {rol.nombre}
                        </button>
                      );
                    })}
                    {(!roles || roles.length === 0) && (
                      <span className="text-xs text-slate-400 italic p-2 w-full text-center">
                        No hay roles definidos en la sucursal.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
