'use client';

import React, { useRef, useEffect, useState } from 'react';
import type { CategoriaAuditoria } from '@/lib/tipos';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, SlidersHorizontal, User, Filter, X } from 'lucide-react';
import { CATEGORIAS_CONFIG } from '../_utils/auditoria-helpers';

interface AuditoriaFiltrosProps {
  busqueda: string;
  setBusqueda: (v: string) => void;
  usuarioSeleccionado: string;
  setUsuarioSeleccionado: (v: string) => void;
  listaUsuarios: Array<{ id: string; nombre: string }>;
  categoriaSeleccionada: string;
  setCategoriaSeleccionada: (v: string) => void;
  filtrosActivosCount: number;
  totalEventosRaw: number;
}

export function AuditoriaFiltros({
  busqueda,
  setBusqueda,
  usuarioSeleccionado,
  setUsuarioSeleccionado,
  listaUsuarios,
  categoriaSeleccionada,
  setCategoriaSeleccionada,
  filtrosActivosCount,
  totalEventosRaw,
}: AuditoriaFiltrosProps) {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Autoenfoque en el buscador al montar
  useEffect(() => {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 40);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-3 pb-3 border-b border-[#2e2e2e]">
      {/* Buscador con botón X interno y botón Opciones/Ocultar externo a la par */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            ref={searchInputRef}
            placeholder="Buscar por cliente, comprobante, venta, usuario, terminal o producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && busqueda) {
                e.preventDefault();
                setBusqueda('');
              }
            }}
            className="pl-10 pr-9 h-10 text-xs sm:text-sm rounded-full"
          />
          {busqueda && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setBusqueda('');
                searchInputRef.current?.focus();
              }}
              aria-label="Limpiar búsqueda"
              title="Limpiar búsqueda"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={() => setMostrarFiltros((prev) => !prev)}
          className={`h-10 px-3 sm:px-3.5 text-xs font-semibold rounded-full border gap-1.5 shrink-0 transition-colors ${
            mostrarFiltros
              ? 'bg-sky-600 border-sky-500 text-white hover:bg-sky-500 hover:text-white shadow-sm'
              : filtrosActivosCount > 0
              ? 'bg-[#252526] border-sky-500/60 text-sky-400 hover:bg-[#313131] hover:text-sky-300'
              : 'bg-[#252526] border-[#2e2e2e] text-slate-300 hover:text-white hover:bg-[#313131]'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">{mostrarFiltros ? 'Ocultar' : 'Opciones'}</span>
          {filtrosActivosCount > 0 && (
            <span className="min-w-[18px] h-[18px] rounded-full bg-amber-400 text-slate-950 font-black text-[0.625rem] inline-flex items-center justify-center px-1">
              {filtrosActivosCount}
            </span>
          )}
        </Button>
      </div>

      {/* Panel colapsable de preferencias y filtros */}
      {mostrarFiltros && (
        <div className="p-3 rounded-xl bg-[#1e1e1e] border border-[#2e2e2e] space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Selector de Usuario / Operador */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300 flex items-center gap-1">
                <User className="h-3 w-3 text-sky-400" /> Operador / Usuario
              </label>
              <Select value={usuarioSeleccionado} onValueChange={setUsuarioSeleccionado}>
                <SelectTrigger className="h-9 text-xs rounded-full">
                  <SelectValue placeholder="Todos los usuarios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos los usuarios</SelectItem>
                  {listaUsuarios.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selector de Categoría Principal */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300 flex items-center gap-1">
                <Filter className="h-3 w-3 text-sky-400" /> Categoría de Operación
              </label>
              <Select value={categoriaSeleccionada} onValueChange={setCategoriaSeleccionada}>
                <SelectTrigger className="h-9 text-xs rounded-full">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
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

          {/* Píldoras de Categorías Rápida Selección */}
          <div className="pt-2 border-t border-[#2e2e2e]">
            <span className="text-[0.6875rem] text-muted-foreground block mb-1.5 font-medium">
              Filtro rápido por categoría:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs no-scrollbar">
              <Button
                variant={categoriaSeleccionada === 'TODAS' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCategoriaSeleccionada('TODAS')}
                className={`h-7 px-3 text-xs font-medium rounded-full ${
                  categoriaSeleccionada === 'TODAS' 
                    ? 'bg-sky-600 text-white' 
                    : 'text-slate-300 bg-app-surface hover:bg-[#313131] border border-app-border'
                }`}
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
                    className={`h-7 px-3 text-xs gap-1.5 rounded-full ${
                      esActivo 
                        ? 'bg-sky-600 text-white font-medium' 
                        : 'text-slate-300 bg-app-surface hover:bg-[#313131] border border-app-border font-normal'
                    }`}
                  >
                    <Icon className={`h-3 w-3 ${esActivo ? 'text-white' : config.color}`} />
                    <span>{config.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
