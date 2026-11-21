'use client';

import { SurfaceCard, PillTabs, Paginacion } from "@/components/comunes";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowDownAZ, ArrowUpZA, Loader2, Edit, Trash2, Mail, Shield, ShieldAlert, KeyRound, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UsuarioSucursal } from "@/lib/tipos";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type UsuarioConDocId = UsuarioSucursal & { docId: string };

interface ListaUsuariosProps {
  usuarios: UsuarioConDocId[];
  totalItems: number;
  cargando: boolean;
  terminoBusqueda: string;
  onSearchChange: (val: string) => void;
  orden: string;
  onSortOrderChange: (val: string) => void;
  onEditar: (usuario: UsuarioConDocId) => void;
  onEliminar: (usuario: UsuarioConDocId) => void;
  onCambiarPassword?: (usuario: UsuarioConDocId) => void;
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
  totalItems,
  cargando,
  terminoBusqueda,
  onSearchChange,
  orden,
  onSortOrderChange,
  onEditar,
  onEliminar,
  onCambiarPassword,
  errorPermisos,
  paginacion
}: ListaUsuariosProps) {
  const getRolBadgeClasses = (rol: string) => {
    const r = (rol || '').toLowerCase();
    if (r === 'admin' || r === 'administrador') {
      return 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';
    }
    if (r === 'cajero') {
      return 'bg-sky-500/20 text-sky-300 border border-sky-500/30';
    }
    return 'bg-slate-500/20 text-slate-300 border border-slate-500/30';
  };

  const getInitials = (name: string) => {
    return (name || 'U')
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <SurfaceCard variant="panel" className="p-4 sm:p-5 space-y-4 font-body">
      <PillTabs
        value={orden}
        onValueChange={onSortOrderChange}
        searchValue={terminoBusqueda}
        onSearchChange={onSearchChange}
        searchPlaceholder="Buscar por nombre, email o rol..."
        collapsibleMobileTabs
        tabs={[
          { id: 'name-asc', label: 'A-Z', icon: ArrowDownAZ },
          { id: 'name-desc', label: 'Z-A', icon: ArrowUpZA },
          { id: 'rol-asc', label: 'Por rol', icon: Shield },
        ]}
      />

      {cargando ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-3 text-slate-400">
          <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
          <span className="text-xs">Cargando usuarios...</span>
        </div>
      ) : errorPermisos ? (
        <div className="flex flex-col items-center justify-center text-center h-64 rounded-xl border border-dashed border-rose-500/30 bg-rose-500/10 text-rose-300 p-6">
          <ShieldAlert className="h-10 w-10 mb-3 text-rose-400" />
          <p className="font-semibold text-base text-rose-200">Acceso denegado</p>
          <p className="text-xs text-rose-300/80 max-w-sm mt-1">
            No tienes los permisos necesarios para gestionar usuarios. Contacta al administrador maestro.
          </p>
        </div>
      ) : usuarios.length > 0 ? (
        <Accordion type="single" collapsible className="w-full space-y-2.5">
          {usuarios.map((usuario) => (
            <AccordionItem
              value={usuario.docId}
              key={usuario.docId}
              className="rounded-xl border border-[#2e2e2e] hover:border-[#383838] bg-[#252526] transition-all overflow-hidden shadow-sm"
            >
              <AccordionTrigger className="px-3.5 py-3 sm:px-4 sm:py-3.5 hover:no-underline hover:bg-[#2e2e2e]/30 transition-colors data-[state=open]:border-b data-[state=open]:border-[#2e2e2e]">
                <div className="flex-1 flex items-center justify-between gap-3 text-left pr-1.5 sm:pr-2.5 min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border border-sky-500/20 shrink-0">
                      <AvatarFallback className="bg-sky-500/10 text-sky-400 font-bold text-xs">
                        {getInitials(usuario.nombre)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex flex-col gap-0.5">
                      <p className="font-bold text-sm sm:text-base text-slate-100 truncate">
                        {usuario.nombre}
                      </p>
                      <p className="text-[0.6875rem] text-slate-400 truncate">
                        {usuario.email}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <Badge className={cn('rounded-full font-semibold px-2.5 py-0.5 text-[0.625rem]', getRolBadgeClasses(usuario.rol))}>
                      {usuario.rol}
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="p-3.5 sm:p-4 bg-[#1e1e1e]">
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="bg-[#252526] border border-[#2e2e2e] rounded-xl px-3 py-2.5 min-w-0">
                      <p className="text-[0.6875rem] text-slate-400 font-medium flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-sky-400 shrink-0" />
                        Correo electrónico
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-slate-100 truncate mt-1">
                        {usuario.email}
                      </p>
                    </div>
                    <div className="bg-[#252526] border border-[#2e2e2e] rounded-xl px-3 py-2.5 min-w-0">
                      <p className="text-[0.6875rem] text-slate-400 font-medium flex items-center gap-1.5">
                        <Shield className="h-3 w-3 text-sky-400 shrink-0" />
                        Identificador de seguridad
                      </p>
                      <p className="text-[0.6875rem] font-mono text-slate-300 break-all mt-1">
                        {usuario.authUid}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-nowrap items-center justify-end gap-2 pt-3 border-t border-[#2e2e2e]">
                    {onCambiarPassword && (
                      <Button
                        size="sm"
                        title="Modificar contraseña"
                        aria-label="Modificar contraseña"
                        className="rounded-full h-8 w-8 sm:w-auto sm:px-4 p-0 text-xs font-semibold bg-[#252526] hover:bg-[#313131] text-slate-200 border border-[#2e2e2e] shadow-sm shrink-0"
                        onClick={() => onCambiarPassword(usuario)}
                      >
                        <KeyRound className="h-3.5 w-3.5 sm:mr-1.5 text-sky-400" />
                        <span className="hidden sm:inline">Contraseña</span>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="rounded-full h-8 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-sm"
                      onClick={() => onEditar(usuario)}
                    >
                      <Edit className="mr-1.5 h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-full h-8 px-4 text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 shadow-sm"
                      onClick={() => onEliminar(usuario)}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="flex flex-col items-center justify-center text-center text-slate-400 h-64 rounded-xl border border-dashed border-[#2e2e2e] bg-[#252526]/50 p-6">
          <UserCheck className="h-10 w-10 mb-3 text-slate-500" />
          <p className="font-semibold text-base text-slate-200">
            {terminoBusqueda ? "Sin resultados" : "No hay usuarios registrados"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {terminoBusqueda
              ? "Prueba ajustando el término de búsqueda."
              : "Agrega un nuevo usuario para otorgarle acceso a esta sucursal."}
          </p>
        </div>
      )}

      {totalItems > 0 && (
        <Paginacion
          currentPage={paginacion.paginaActual}
          totalPages={paginacion.totalPaginas}
          totalItems={totalItems}
          itemsPerPage={paginacion.itemsPorPagina}
          onPageChange={paginacion.onPaginaChange}
          onItemsPerPageChange={paginacion.onItemsPorPaginaChange}
        />
      )}
    </SurfaceCard>
  );
}
