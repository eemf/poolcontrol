'use client';

import React, { useRef } from 'react';
import { LucideIcon, Search, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CountBadge, CountBadgeVariant } from './count-badge';
import { cn } from '@/lib/utils';

export interface PillTabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
  badgeVariant?: CountBadgeVariant;
}

interface PillTabsProps {
  value: string;
  onValueChange: (val: string) => void;
  tabs: PillTabItem[];
  className?: string;
  listClassName?: string;
  /** Valor actual del buscador integrado (opcional) */
  searchValue?: string;
  /** Callback al cambiar el texto de búsqueda; al proveerse muestra el input a la izquierda */
  onSearchChange?: (val: string) => void;
  /** Placeholder del buscador */
  searchPlaceholder?: string;
  /** Referencia opcional al input de búsqueda */
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

/**
 * Pestañas en píldora estándar para Pool Control.
 * - Barra contenedora redondeada (`rounded-full`) con fondo #283244 y borde #324157.
 * - Triggers en píldora completa (`rounded-full`), estado activo en azul primario.
 * - Soporte integrado para buscador a la izquierda y pestañas con badges a la derecha en la misma píldora.
 */
export function PillTabs({
  value,
  onValueChange,
  tabs,
  className = '',
  listClassName = '',
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  searchInputRef,
}: PillTabsProps) {
  const hasSearch = typeof onSearchChange === 'function';
  const internalInputRef = useRef<HTMLInputElement | null>(null);

  const setInputRefs = (node: HTMLInputElement | null) => {
    internalInputRef.current = node;
    if (searchInputRef && 'current' in searchInputRef) {
      (searchInputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
    }
  };

  const handleClearSearch = () => {
    onSearchChange?.('');
    internalInputRef.current?.focus();
  };

  // Cálculo de columnas responsive dinámico
  const colsClass =
    tabs.length === 2
      ? 'grid-cols-2'
      : tabs.length === 3
      ? 'grid-cols-3'
      : tabs.length === 4
      ? 'grid-cols-2 sm:grid-cols-4'
      : 'grid-cols-3';

  if (!hasSearch) {
    return (
      <div className={`w-full ${className}`}>
        <Tabs value={value} onValueChange={onValueChange} className="w-full">
          <TabsList
            className={`grid ${colsClass} w-full h-11 p-1 bg-[#283244] rounded-full border border-[#324157] gap-1 ${listClassName}`}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const hasCount = typeof tab.count === 'number' && tab.count > 0;

              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="rounded-full text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center justify-center gap-1.5 px-2 transition-all"
                >
                  {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                  <span className="truncate">{tab.label}</span>
                  {hasCount && (
                    <CountBadge
                      count={tab.count!}
                      variant={tab.badgeVariant || (value === tab.id ? 'white' : 'amber')}
                    />
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'w-full h-11 p-1 bg-[#283244] rounded-full border border-[#324157] focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500 flex items-center gap-1.5 transition-all',
          listClassName
        )}
      >
        {/* Izquierda: Buscador siempre visible */}
        <div className="flex-1 flex items-center gap-2 pl-2.5 pr-1 min-w-0 h-full">
          <Search className="h-4 w-4 text-slate-400 shrink-0 pointer-events-none" />
          <input
            ref={setInputRefs}
            type="text"
            value={searchValue || ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && searchValue) {
                e.preventDefault();
                handleClearSearch();
              }
            }}
            placeholder={searchPlaceholder}
            className="w-full h-full bg-transparent text-xs sm:text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none min-w-0"
          />
          {searchValue && searchValue.length > 0 && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleClearSearch}
              aria-label="Limpiar búsqueda"
              className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Derecha: Pestañas en la misma píldora */}
        <Tabs value={value} onValueChange={onValueChange} className="h-full shrink-0">
          <TabsList className="flex items-center h-full p-0 bg-transparent border-0 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const hasCount = typeof tab.count === 'number' && tab.count > 0;

              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="h-full rounded-full text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center justify-center gap-1.5 px-2.5 transition-all"
                >
                  {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                  <span className="hidden sm:inline truncate">{tab.label}</span>
                  {hasCount && (
                    <CountBadge
                      count={tab.count!}
                      variant={tab.badgeVariant || (value === tab.id ? 'white' : 'amber')}
                    />
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
