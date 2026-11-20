'use client'

import { SurfaceCard, PillTabs } from "@/components/comunes"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Building2, Loader2, UserCheck, ArrowLeftRight, KeyRound, Edit, Trash2, Layers, ShieldCheck, Mail
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { SucursalMaestro, UsuarioConDocId } from "../_hooks/use-usuarios-maestro"

interface ListaUsuariosMaestroProps {
  usuarios: UsuarioConDocId[]
  sucursales: SucursalMaestro[]
  selectedSucursalId: string
  selectedSucursalNombre: string
  onSucursalChange: (val: string) => void
  isLoadingSucursales: boolean
  isLoading: boolean
  searchTerm: string
  onSearchChange: (val: string) => void
  filtroAcceso: 'todos' | 'global' | 'base'
  onFiltroAccesoChange: (val: 'todos' | 'global' | 'base') => void
  conteos: { todos: number; global: number; base: number }
  onEditar: (usuario: UsuarioConDocId) => void
  onEliminar: (usuario: UsuarioConDocId) => void
  onCambiarPassword: (usuario: UsuarioConDocId) => void
}

export function ListaUsuariosMaestro({
  usuarios,
  sucursales,
  selectedSucursalId,
  selectedSucursalNombre,
  onSucursalChange,
  isLoadingSucursales,
  isLoading,
  searchTerm,
  onSearchChange,
  filtroAcceso,
  onFiltroAccesoChange,
  conteos,
  onEditar,
  onEliminar,
  onCambiarPassword,
}: ListaUsuariosMaestroProps) {
  const getRolBadge = (rol: string) => {
    const r = (rol || '').toLowerCase()
    if (r === 'admin' || r === 'administrador') {
      return 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
    }
    if (r === 'cajero') {
      return 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
    }
    return 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
  }

  const getInitials = (name: string) => {
    return (name || 'U')
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const sucursalSelect = (className?: string) => (
    <Select value={selectedSucursalId} onValueChange={onSucursalChange} disabled={isLoadingSucursales}>
      <SelectTrigger
        className={cn(
          "rounded-full h-10 sm:h-11 border-[#2e2e2e] bg-[#252526] hover:bg-[#313131] text-xs text-slate-100 shrink-0",
          className
        )}
      >
        <div className="flex items-center gap-2 truncate">
          <Building2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
          <SelectValue placeholder={isLoadingSucursales ? "Cargando..." : "Elegir sucursal..."} />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 font-body">
        {sucursales.map(s => (
          <SelectItem key={s.id} value={s.id} className="text-xs">{s.nombre}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  return (
    <SurfaceCard variant="panel" className="p-4 sm:p-5 space-y-4 font-body">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="hidden sm:block shrink-0">
          {sucursalSelect("w-[210px]")}
        </div>

        <div className="flex-1 min-w-0">
          <PillTabs
            value={filtroAcceso}
            onValueChange={(v) => onFiltroAccesoChange(v as 'todos' | 'global' | 'base')}
            searchValue={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder="Buscar por nombre, email o rol..."
            collapsibleMobileTabs
            hasActiveExtraFilter={Boolean(selectedSucursalId)}
            mobileExtraContent={sucursalSelect("w-full")}
            tabs={[
              {
                id: 'todos',
                label: 'Todos',
                icon: Layers,
                count: conteos.todos,
                badgeVariant: filtroAcceso === 'todos' ? 'white' : 'slate',
              },
              {
                id: 'global',
                label: 'Multi-sucursal',
                icon: ArrowLeftRight,
                count: conteos.global,
                badgeVariant: filtroAcceso === 'global' ? 'white' : 'emerald',
              },
              {
                id: 'base',
                label: 'Solo base',
                icon: ShieldCheck,
                count: conteos.base,
                badgeVariant: filtroAcceso === 'base' ? 'white' : 'amber',
              },
            ]}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-3 text-slate-400">
          <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
          <span className="text-xs">Cargando usuarios...</span>
        </div>
      ) : !selectedSucursalId ? (
        <div className="flex flex-col items-center justify-center text-center py-12 rounded-xl border border-dashed border-[#2e2e2e] bg-[#252526]/50 px-4">
          <UserCheck className="h-10 w-10 mb-3 text-slate-500" />
          <p className="font-semibold text-base text-slate-200">Selecciona una sucursal</p>
          <p className="text-xs text-slate-400 mt-1">Elige una sucursal para ver y administrar sus usuarios.</p>
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
                      <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{usuario.email}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge className={cn('rounded-full font-semibold px-2.5 py-0.5 text-[10px]', getRolBadge(usuario.rol))}>
                      {usuario.rol}
                    </Badge>
                    {usuario.accesoGlobal && (
                      <Badge className="hidden sm:inline-flex rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold px-2.5 py-0.5 gap-1">
                        <ArrowLeftRight className="h-2.5 w-2.5" />
                        Multi-sucursal
                      </Badge>
                    )}
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="p-3.5 sm:p-4 bg-[#1e1e1e]">
                <div className="space-y-3.5">
                  <div className="bg-[#252526] border border-[#2e2e2e] rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                      <Building2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                      <span>Sucursales autorizadas</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {(() => {
                        if (!usuario.accesoGlobal) {
                          const sucBase = sucursales.find(s => s.id === usuario.sucursalId)
                          return (
                            <Badge className="rounded-full bg-[#1e1e1e] text-slate-300 border border-[#2e2e2e] text-[11px] font-medium">
                              Únicamente sucursal base ({sucBase?.nombre || selectedSucursalNombre})
                            </Badge>
                          )
                        }

                        const permitidas = usuario.sucursalesPermitidas
                        const esTodas = !permitidas || permitidas.length === 0 || permitidas.length >= sucursales.length

                        if (esTodas) {
                          return (
                            <>
                              <Badge className="rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[11px] font-semibold">
                                Todas las sucursales ({sucursales.length})
                              </Badge>
                              {sucursales.map(s => (
                                <Badge key={s.id} className="rounded-full bg-[#1e1e1e] text-slate-300 border border-[#2e2e2e] text-[10px] font-medium">
                                  {s.nombre}
                                </Badge>
                              ))}
                            </>
                          )
                        }

                        return permitidas.map((sId) => {
                          const suc = sucursales.find(s => s.id === sId)
                          const esBase = sId === usuario.sucursalId
                          return (
                            <Badge
                              key={sId}
                              className={cn(
                                "rounded-full text-[11px] font-medium flex items-center gap-1.5",
                                esBase
                                  ? "bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold"
                                  : "bg-[#1e1e1e] text-slate-300 border border-[#2e2e2e]"
                              )}
                            >
                              <span>{suc?.nombre || `Sucursal ${sId}`}</span>
                              {esBase && <span className="text-[9px] bg-sky-600 text-white px-1.5 py-0 rounded-full">Base</span>}
                            </Badge>
                          )
                        })
                      })()}
                    </div>
                  </div>

                  <div className="flex flex-nowrap items-center justify-end gap-2 pt-3 border-t border-[#2e2e2e]">
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
        <div className="flex flex-col items-center justify-center text-center py-12 rounded-xl border border-dashed border-[#2e2e2e] bg-[#252526]/50 px-4">
          <UserCheck className="h-10 w-10 mb-3 text-slate-500" />
          <p className="font-semibold text-base text-slate-200">
            {searchTerm || filtroAcceso !== 'todos' ? "Sin resultados" : "No hay usuarios registrados en esta sucursal"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {searchTerm || filtroAcceso !== 'todos' ? "Prueba ajustando los filtros o la búsqueda." : "Haz clic en 'Añadir Usuario' para empezar."}
          </p>
        </div>
      )}
    </SurfaceCard>
  )
}

