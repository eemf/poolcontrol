'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface PaginacionProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  itemLabelPlural?: string;
  className?: string;
}

/**
 * Genera el rango de números y elipsis para la vista de escritorio (sm+).
 * Muestra hasta 7 elementos numéricos y elipsis.
 */
function generarRangoDesktop(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Cerca del inicio: ej. 1, 2, 3, 4, 5, ..., totalPages
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }

  // Cerca del final: ej. 1, ..., totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages
  if (currentPage >= totalPages - 3) {
    return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  // En el medio: ej. 1, ..., currentPage - 1, currentPage, currentPage + 1, ..., totalPages
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

/**
 * Genera el rango de números y elipsis para la vista móvil (< sm).
 * Mantiene un límite estricto de máximo 5 elementos centrales (96px a 150px)
 * para que [ < Anterior ] y [ Siguiente > ] quepan sin deformarse, sin scroll y sin saltar de línea.
 */
function generarRangoMobile(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Cerca del inicio: ej. 1, 2, 3, ..., totalPages
  if (currentPage <= 2) {
    return [1, 2, 3, '...', totalPages];
  }

  // Cerca del final: ej. 1, ..., totalPages - 2, totalPages - 1, totalPages
  if (currentPage >= totalPages - 1) {
    return [1, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // En el medio: ej. 1, ..., currentPage, ..., totalPages
  return [1, '...', currentPage, '...', totalPages];
}

/**
 * Componente estándar oficial de Paginación para Pool Control 1.0.
 * Sigue el estándar visual corporativo Antigravity IDE Dark Theme:
 * - Vista móvil (< sm): Resumen superior balanceado y barra de navegación inferior
 *   de ancho completo con botones Anterior / Siguiente en extremos y botones redondos centrados.
 * - Vista escritorio (sm+): Fila única con resumen a la izquierda y controles a la derecha.
 */
export function Paginacion({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = [10, 20, 50],
  itemLabel = 'registro',
  itemLabelPlural,
  className,
}: PaginacionProps) {
  const labelPlural = itemLabelPlural || (itemLabel.endsWith('s') ? itemLabel : `${itemLabel}s`);
  const labelSingular = itemLabel.endsWith('s') ? itemLabel.slice(0, -1) : itemLabel;

  const safeTotalPages = Math.max(1, totalPages || 1);
  const rangoDesktop = generarRangoDesktop(currentPage, safeTotalPages);
  const rangoMobile = generarRangoMobile(currentPage, safeTotalPages);

  /**
   * Renderiza un botón numérico circular o elipsis (...)
   */
  const renderItemPagina = (item: number | '...', index: number, esMovil = false) => {
    if (item === '...') {
      return (
        <span
          key={`ellipsis-${esMovil ? 'm' : 'd'}-${index}`}
          className="h-8 w-5 sm:w-6 flex items-center justify-center text-slate-500 font-bold text-xs select-none shrink-0"
        >
          ...
        </span>
      );
    }

    const esActiva = item === currentPage;
    const esNumeroLargo = item >= 100;

    return (
      <button
        key={`page-${esMovil ? 'm' : 'd'}-${item}`}
        type="button"
        onClick={() => onPageChange(item)}
        className={cn(
          'h-8 rounded-full text-xs font-bold transition-all shrink-0 flex items-center justify-center border',
          esNumeroLargo ? 'min-w-[32px] px-1.5' : 'w-8 aspect-square p-0',
          esActiva
            ? 'bg-sky-600 text-white border-sky-400/40 shadow-sm shadow-sky-500/25 cursor-default font-black'
            : 'bg-[#252526] hover:bg-[#313131] text-slate-300 hover:text-white border-[#2e2e2e] cursor-pointer'
        )}
        aria-current={esActiva ? 'page' : undefined}
        title={`Página ${item}`}
      >
        {item}
      </button>
    );
  };

  return (
    <div className={cn('w-full pt-3 border-t border-[#2e2e2e] text-xs text-slate-400 font-body', className)}>
      {/* ================= VISTA MÓVIL (< sm) ================= */}
      <div className="flex sm:hidden flex-col gap-2.5 w-full">
        {/* Fila 1 Móvil: Resumen de página y selector de filas */}
        <div className="flex items-center justify-between w-full text-slate-300">
          <span className="leading-none text-xs">
            Pág. <strong className="text-white font-bold">{currentPage}</strong> de{' '}
            <strong className="text-white font-bold">{totalPages || 1}</strong>
            {totalItems !== undefined && (
              <span className="text-slate-400 ml-1">
                ({totalItems} {totalItems === 1 ? labelSingular : labelPlural})
              </span>
            )}
          </span>

          {onItemsPerPageChange && itemsPerPage && (
            <div className="flex items-center gap-1.5">
              <Select
                value={String(itemsPerPage)}
                onValueChange={(val) => onItemsPerPageChange(Number(val))}
              >
                <SelectTrigger className="h-7 w-[82px] rounded-full border-[#2e2e2e] bg-[#252526] text-slate-200 text-[0.6875rem] font-semibold focus:ring-1 focus:ring-sky-500 px-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-200 rounded-xl shadow-xl">
                  {pageSizeOptions.map((size) => (
                    <SelectItem
                      key={size}
                      value={String(size)}
                      className="text-xs rounded-lg cursor-pointer"
                    >
                      {size} filas
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Fila 2 Móvil: Controles de navegación en estricta fila única */}
        <div className="flex items-center justify-between w-full gap-1">
          {/* Botón Anterior */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="h-8 px-2.5 rounded-full bg-[#252526] hover:bg-[#313131] text-slate-300 hover:text-white border border-[#2e2e2e] disabled:opacity-30 disabled:hover:bg-[#252526] disabled:hover:text-slate-300 shadow-xs transition-colors shrink-0 font-medium gap-1 text-[0.6875rem] cursor-pointer disabled:cursor-not-allowed"
            title="Página anterior"
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Anterior</span>
          </Button>

          {/* Números de página circulares móviles */}
          <div className="flex items-center justify-center gap-1 shrink-0">
            {rangoMobile.map((item, idx) => renderItemPagina(item, idx, true))}
          </div>

          {/* Botón Siguiente */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(Math.min(safeTotalPages, currentPage + 1))}
            disabled={currentPage >= safeTotalPages}
            className="h-8 px-2.5 rounded-full bg-[#252526] hover:bg-[#313131] text-slate-300 hover:text-white border border-[#2e2e2e] disabled:opacity-30 disabled:hover:bg-[#252526] disabled:hover:text-slate-300 shadow-xs transition-colors shrink-0 font-medium gap-1 text-[0.6875rem] cursor-pointer disabled:cursor-not-allowed"
            title="Página siguiente"
            aria-label="Página siguiente"
          >
            <span>Siguiente</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* ================= VISTA ESCRITORIO (sm+) ================= */}
      <div className="hidden sm:flex items-center justify-between gap-3 w-full">
        {/* Lado izquierdo escritorio: Indicador de página, total y selector */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center leading-none text-slate-300">
            Página <strong className="text-white mx-1 font-bold">{currentPage}</strong> de{' '}
            <strong className="text-white mx-1 font-bold">{totalPages || 1}</strong>
            {totalItems !== undefined && (
              <span className="text-slate-400 ml-1">
                ({totalItems} {totalItems === 1 ? labelSingular : labelPlural})
              </span>
            )}
          </span>

          {onItemsPerPageChange && itemsPerPage && (
            <div className="flex items-center gap-1.5 pl-3 border-l border-[#2e2e2e]">
              <span className="text-slate-400 text-xs">Mostrar:</span>
              <Select
                value={String(itemsPerPage)}
                onValueChange={(val) => onItemsPerPageChange(Number(val))}
              >
                <SelectTrigger className="h-7 w-[88px] rounded-full border-[#2e2e2e] bg-[#252526] text-slate-200 text-xs font-semibold focus:ring-1 focus:ring-sky-500 px-2.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-200 rounded-xl shadow-xl">
                  {pageSizeOptions.map((size) => (
                    <SelectItem
                      key={size}
                      value={String(size)}
                      className="text-xs rounded-lg cursor-pointer"
                    >
                      {size} filas
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Lado derecho escritorio: Botones completos */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="h-8 px-3 rounded-full bg-[#252526] hover:bg-[#313131] text-slate-300 hover:text-white border border-[#2e2e2e] disabled:opacity-30 disabled:hover:bg-[#252526] disabled:hover:text-slate-300 shadow-xs transition-colors shrink-0 font-medium gap-1 text-xs cursor-pointer disabled:cursor-not-allowed"
            title="Página anterior"
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Anterior</span>
          </Button>

          <div className="flex items-center gap-1 shrink-0">
            {rangoDesktop.map((item, idx) => renderItemPagina(item, idx, false))}
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(Math.min(safeTotalPages, currentPage + 1))}
            disabled={currentPage >= safeTotalPages}
            className="h-8 px-3 rounded-full bg-[#252526] hover:bg-[#313131] text-slate-300 hover:text-white border border-[#2e2e2e] disabled:opacity-30 disabled:hover:bg-[#252526] disabled:hover:text-slate-300 shadow-xs transition-colors shrink-0 font-medium gap-1 text-xs cursor-pointer disabled:cursor-not-allowed"
            title="Página siguiente"
            aria-label="Página siguiente"
          >
            <span>Siguiente</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
