'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface InventarioFiltrosProps {
  filtro: string;
  setFiltro: (v: string) => void;
  ubicacionFiltro: string;
  setUbicacionFiltro: (v: string) => void;
  orden: string;
  setOrden: (v: string) => void;
  ubicacionesDisponibles: string[];
  isLoading?: boolean;
  isRevisionMode?: boolean;
}

export function InventarioFiltros({
  filtro,
  setFiltro,
  ubicacionFiltro,
  setUbicacionFiltro,
  orden,
  setOrden,
  ubicacionesDisponibles,
  isLoading = false,
  isRevisionMode = false,
}: InventarioFiltrosProps) {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 40);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isRevisionMode]);

  const tieneFiltrosActivos = ubicacionFiltro !== 'todas' || orden !== 'nombre-asc';

  const handleLimpiarBusqueda = () => {
    setFiltro('');
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-2.5">
      {/* Fila principal: en móvil [Buscador + Botón Filtros afuera]; en escritorio [Buscador + Filtros inline a la par] */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              ref={inputRef}
              autoFocus
              placeholder="Buscar producto por nombre..."
              className="pl-10 pr-9 rounded-full h-10 text-xs"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape' && filtro) {
                  e.preventDefault();
                  handleLimpiarBusqueda();
                }
              }}
            />
            {filtro && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleLimpiarBusqueda}
                aria-label="Limpiar búsqueda"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Botón externo de filtros: solo visible en vista móvil (< sm) */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMostrarFiltros((prev) => !prev)}
            title={mostrarFiltros ? 'Ocultar filtros' : 'Mostrar filtros de ubicación y ordenamiento'}
            aria-label={mostrarFiltros ? 'Ocultar filtros' : 'Mostrar filtros'}
            aria-expanded={mostrarFiltros}
            className={cn(
              'sm:hidden h-10 w-10 rounded-full border shrink-0 transition-colors relative',
              mostrarFiltros
                ? 'bg-sky-600 border-sky-500 text-white hover:bg-sky-500 shadow-sm'
                : tieneFiltrosActivos
                  ? 'bg-[#252526] border-sky-500/60 text-sky-400 hover:bg-[#313131]'
                  : 'bg-[#252526] border-[#2e2e2e] text-slate-300 hover:bg-[#313131] hover:text-white'
            )}
          >
            <SlidersHorizontal className="h-4 w-4 shrink-0" />
            {tieneFiltrosActivos && !mostrarFiltros && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-sky-400" />
            )}
          </Button>
        </div>

        {/* Filtros inline en escritorio (sm+); desplegables en móvil (< sm) */}
        <div
          className={cn(
            'grid grid-cols-1 gap-2 sm:flex sm:items-center sm:gap-2 shrink-0',
            mostrarFiltros ? 'grid animate-in fade-in slide-in-from-top-1 duration-150' : 'hidden sm:flex'
          )}
        >
          <Select value={ubicacionFiltro} onValueChange={setUbicacionFiltro}>
            <SelectTrigger className="w-full sm:w-[190px] rounded-full h-10 text-xs px-3.5">
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                <SelectValue placeholder="Ubicación..." />
              </div>
            </SelectTrigger>
            <SelectContent className="text-xs font-body">
              <SelectItem value="todas">Todas las ubicaciones</SelectItem>
              {ubicacionesDisponibles.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
              <SelectItem value="sin_ubicacion">Sin ubicación</SelectItem>
            </SelectContent>
          </Select>

          <Select value={orden} onValueChange={setOrden}>
            <SelectTrigger className="w-full sm:w-[185px] rounded-full h-10 text-xs px-3.5">
              <div className="flex items-center gap-1.5 truncate">
                <ArrowUpDown className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                <SelectValue placeholder="Ordenar por..." />
              </div>
            </SelectTrigger>
            <SelectContent className="text-xs font-body">
              <SelectItem value="nombre-asc">Nombre (A-Z)</SelectItem>
              <SelectItem value="nombre-desc">Nombre (Z-A)</SelectItem>
              <SelectItem value="stock-asc">Stock (Menor a Mayor)</SelectItem>
              <SelectItem value="stock-desc">Stock (Mayor a Menor)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
