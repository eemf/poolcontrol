'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, User } from "lucide-react";
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
    return <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  if (!usuarios || usuarios.length === 0) {
    return (
      <div className="py-20 text-center border-2 border-dashed rounded-3xl text-muted-foreground bg-muted/5 font-body">
        <p>No se encontraron usuarios registrados en esta sucursal.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Accordion type="single" collapsible className="w-full space-y-3">
        {usuarios.map(usuario => (
          <AccordionItem 
            value={usuario.authUid} 
            key={usuario.authUid} 
            className="border rounded-xl bg-card-foreground/5 hover:bg-card-foreground/[0.08] transition-all overflow-hidden shadow-sm"
          >
            <AccordionTrigger className="px-4 sm:px-6 py-5 hover:no-underline font-body transition-colors data-[state=open]:bg-muted/30">
              <div className="flex flex-1 items-center justify-between pr-4 text-left gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-base text-foreground truncate">{usuario.nombre}</p>
                  <p className="text-xs text-muted-foreground font-medium tracking-tight mt-0.5 truncate">
                    {usuario.email}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2 shrink-0">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-background/50 px-2 py-1 rounded-full border">
                    {(usuario.roles?.length || 0)} <span className="hidden xs:inline">Roles</span>
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 sm:px-6 pb-6">
              <div className="border-t border-muted-foreground/10 pt-6 mt-2 space-y-4">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <User className="h-3 w-3 text-primary" /> Selección de Roles Asignados
                  </h4>
                  <p className="text-[11px] text-muted-foreground pl-1">Haz clic en un rol para activarlo o desactivarlo para este usuario.</p>
                  
                  <div className="bg-background/50 rounded-2xl border border-dashed border-muted-foreground/20 p-4 sm:p-5 mt-4">
                    <div className="flex flex-wrap gap-2">
                      {roles?.map(rol => {
                        const rolId = (rol as any).id;
                        const isAssigned = usuario.roles?.includes(rolId);
                        return (
                          <button 
                            key={rolId}
                            className={cn(
                              "h-10 rounded-full text-[11px] font-bold tracking-tight font-body px-5 sm:px-6 transition-all border shadow-sm flex-1 sm:flex-none",
                              isAssigned 
                                ? "bg-primary text-primary-foreground border-primary scale-105" 
                                : "bg-background text-foreground border-input hover:bg-accent hover:border-muted-foreground/30"
                            )}
                            onClick={() => onToggleRol(usuario.authUid, rolId, usuario.roles || [])}
                          >
                            {rol.nombre}
                          </button>
                        )
                      })}
                      {(!roles || roles.length === 0) && (
                        <span className="text-xs text-muted-foreground italic p-2 w-full text-center">No hay roles definidos en la sucursal.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
