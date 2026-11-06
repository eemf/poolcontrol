'use client';

import React from 'react';
import type { CierreCaja, CategoriaAuditoria } from '@/lib/tipos';
import { SurfaceCard } from '@/components/comunes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, History, User, Filter } from 'lucide-react';
import { CATEGORIAS_CONFIG } from '../_utils/auditoria-helpers';

interface AuditoriaFiltrosProps {
  periodoSeleccionado: string;
  setPeriodoSeleccionado: (v: string) => void;
  cierres?: CierreCaja[];
  formatearFechaCorta: (fecha: any) => string;
  busqueda: string;
  setBusqueda: (v: string) => void;
  usuarioSeleccionado: string;
  setUsuarioSeleccionado: (v: string) => void;
  listaUsuarios: Array<{ id: string; nombre: string }>;
  categoriaSeleccionada: string;
  setCategoriaSeleccionada: (v: string) => void;
  totalEventosRaw: number;
}

export function AuditoriaFiltros({
  periodoSeleccionado,
  setPeriodoSeleccionado,
  cierres,
  formatearFechaCorta,
  busqueda,
  setBusqueda,
  usuarioSeleccionado,
  setUsuarioSeleccionado,
  listaUsuarios,
  categoriaSeleccionada,
  setCategoriaSeleccionada,
  totalEventosRaw,
}: AuditoriaFiltrosProps) {
  return (
    <SurfaceCard variant="surface" className="p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Selector de Período de Caja */}
        <div>
          <Select value={periodoSeleccionado} onValueChange={setPeriodoSeleccionado}>
            <SelectTrigger className="h-9 text-sm font-medium rounded-full bg-[#1d283a] border-app-border">
              <div className="flex items-center gap-2 truncate">
                <History className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                <SelectValue placeholder="Seleccionar período" />
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-72 bg-app-surface border-app-border text-foreground">
              <SelectItem value="abierto" className="font-semibold text-emerald-400">
                🟢 Período Abierto (En curso)
              </SelectItem>
              
              {cierres && cierres.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground">
                    Turnos Cerrados Anteriores
                  </div>
                  {cierres.map((c) => {
                    const fechaStr = formatearFechaCorta(c.fecha);
                    return (
                      <SelectItem key={c.id} value={c.id}>
                        Turno #{c.idCuadre} • {fechaStr}
                      </SelectItem>
                    );
                  })}
                </>
              )}

              <Separator className="my-1 bg-app-border" />
              <SelectItem value="todos" className="text-muted-foreground font-medium">
                🌐 Historial Completo (Todos)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por usuario, equipo, tablet, PC..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9 pr-4 h-9 text-sm rounded-full bg-[#1d283a] border-app-border"
          />
        </div>

        {/* Selector de Usuario */}
        <div>
          <Select value={usuarioSeleccionado} onValueChange={setUsuarioSeleccionado}>
            <SelectTrigger className="h-9 text-sm rounded-full bg-[#1d283a] border-app-border">
              <div className="flex items-center gap-2 truncate">
                <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Todos los usuarios" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-app-surface border-app-border text-foreground">
              <SelectItem value="TODOS">Todos los usuarios</SelectItem>
              {listaUsuarios.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selector de Categoría */}
        <div>
          <Select value={categoriaSeleccionada} onValueChange={setCategoriaSeleccionada}>
            <SelectTrigger className="h-9 text-sm rounded-full bg-[#1d283a] border-app-border">
              <div className="flex items-center gap-2 truncate">
                <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Todas las categorías" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-app-surface border-app-border text-foreground">
              <SelectItem value="TODAS">Todas las categorías</SelectItem>
              <SelectItem value="VENTAS">Ventas y Cobros</SelectItem>
              <SelectItem value="MESAS">Sala de Juegos</SelectItem>
              <SelectItem value="CAJA">Caja y Turnos</SelectItem>
              <SelectItem value="CATALOGO">Catálogo de Productos</SelectItem>
              <SelectItem value="INVENTARIO">Inventario y Ajustes</SelectItem>
              <SelectItem value="COMPRAS">Compras y Proveedores</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Píldoras de Categorías */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs no-scrollbar">
        <Button
          variant={categoriaSeleccionada === 'TODAS' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCategoriaSeleccionada('TODAS')}
          className={`h-7 px-3 text-xs font-normal rounded-full ${categoriaSeleccionada === 'TODAS' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-[#1d283a]'}`}
        >
          Todas ({totalEventosRaw})
        </Button>
        {(Object.keys(CATEGORIAS_CONFIG) as CategoriaAuditoria[]).map((catKey) => {
          const config = CATEGORIAS_CONFIG[catKey];
          const Icon = config.icon;
          const esActivo = categoriaSeleccionada === catKey;
          return (
            <Button
              key={catKey}
              variant={esActivo ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCategoriaSeleccionada(catKey)}
              className={`h-7 px-3 text-xs font-normal gap-1.5 rounded-full ${
                esActivo ? 'bg-sky-600 text-white font-medium' : 'text-slate-300 hover:bg-[#1d283a]'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${esActivo ? 'text-white' : config.color}`} />
              {config.label}
            </Button>
          );
        })}
      </div>
    </SurfaceCard>
  );
}
