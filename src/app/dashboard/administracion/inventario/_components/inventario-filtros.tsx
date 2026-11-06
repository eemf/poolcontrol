'use client';

import React from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InventarioFiltrosProps {
  filtro: string;
  setFiltro: (v: string) => void;
  ubicacionFiltro: string;
  setUbicacionFiltro: (v: string) => void;
  orden: string;
  setOrden: (v: string) => void;
  ubicacionesDisponibles: string[];
}

export function InventarioFiltros({
  filtro,
  setFiltro,
  ubicacionFiltro,
  setUbicacionFiltro,
  orden,
  setOrden,
  ubicacionesDisponibles,
}: InventarioFiltrosProps) {
  return (
    <div className="p-3 sm:p-4 border-b border-app-border bg-[#1d283a]">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Buscar producto por nombre..."
            className="pl-9 rounded-full h-9 bg-app-surface border-app-border text-white placeholder:text-slate-400 text-xs focus-visible:ring-1 focus-visible:ring-sky-500"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={ubicacionFiltro} onValueChange={setUbicacionFiltro}>
            <SelectTrigger className="w-full sm:w-[170px] rounded-full h-9 bg-app-surface border-app-border text-white text-xs">
              <MapPin className="mr-1.5 h-3.5 w-3.5 text-sky-400" />
              <SelectValue placeholder="Ubicación..." />
            </SelectTrigger>
            <SelectContent className="bg-app-surface border-app-border text-white text-xs font-body">
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
            <SelectTrigger className="w-full sm:w-[180px] rounded-full h-9 bg-app-surface border-app-border text-white text-xs">
              <SelectValue placeholder="Ordenar por..." />
            </SelectTrigger>
            <SelectContent className="bg-app-surface border-app-border text-white text-xs font-body">
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
