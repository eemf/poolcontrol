'use client';

import React, { useRef, useState } from 'react';
import { LucideIcon, Search, SlidersHorizontal, X } from 'lucide-react';
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
  /** Enfocar automáticamente el buscador al montar el componente */
  autoFocusSearch?: boolean;
  /** En móvil (< sm), oculta los interruptores bajo un botón de filtros junto al buscador */
  collapsibleMobileTabs?: boolean;
}

/**
 * Pestañas en píldora estándar para Pool Control.
 * - Barra contenedora redondeada (`rounded-full`) con fondo #252526 y borde #2e2e2e.
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
  autoFocusSearch = false,
  collapsibleMobileTabs = false,
}: PillTabsProps) {
  const hasSearch = typeof onSearchChange === 'function';
  const [showMobileTabs, setShowMobileTabs] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement | null>(null);
  const desktopInputRef = useRef<HTMLInputElement | null>(null);

  const focusVisibleInput = () => {
    if (desktopInputRef.current && desktopInputRef.current.offsetParent !== null) {
      desktopInputRef.current.focus();
    } else if (mobileInputRef.current && mobileInputRef.current.offsetParent !== null) {
      mobileInputRef.current.focus();
    } else {
      desktopInputRef.current?.focus();
    }
  };

  React.useEffect(() => {
    if (autoFocusSearch && hasSearch) {
      const timer = setTimeout(() => {
        focusVisibleInput();
      }, 40);
      return () => clearTimeout(timer);
    }
  }, [autoFocusSearch, hasSearch]);

  const setMobileInputRef = (node: HTMLInputElement | null) => {
    mobileInputRef.current = node;
    if (node && node.offsetParent !== null && searchInputRef && 'current' in searchInputRef) {
      (searchInputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
    }
  };

  const setDesktopInputRef = (node: HTMLInputElement | null) => {
    desktopInputRef.current = node;
    if (node && searchInputRef && 'current' in searchInputRef) {
      (searchInputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
    }
  };

  const handleClearSearch = () => {
    onSearchChange?.('');
    focusVisibleInput();
  };

  // Cálculo de columnas responsive dinámico
  const hasMultipleRows = tabs.length > 3;

  const colsClass =
    tabs.length === 2
      ? 'grid-cols-2'
      : tabs.length === 3
      ? 'grid-cols-3'
      : tabs.length === 4
      ? 'grid-cols-2 sm:grid-cols-4'
      : tabs.length === 5
      ? 'grid-cols-2 sm:grid-cols-5'
      : 'grid-cols-3 sm:grid-cols-6';

  if (!hasSearch) {
    return (
      <div className={`w-full ${className}`}>
        <Tabs value={value} onValueChange={onValueChange} className="w-full">
          <TabsList
            className={cn(
              'grid w-full p-1 bg-[#252526] border border-[#2e2e2e] transition-all',
              hasMultipleRows
                ? 'h-auto rounded-2xl p-1.5 gap-1.5 sm:h-11 sm:rounded-full sm:p-1 sm:gap-1'
                : 'h-11 rounded-full gap-1',
              colsClass,
              listClassName
            )}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const hasCount = typeof tab.count === 'number' && tab.count > 0;

              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    'rounded-full text-xs font-semibold data-[state=active]:bg-sky-600 data-[state=active]:text-white flex items-center justify-center gap-1.5 px-2 transition-all min-w-0',
                    hasMultipleRows ? 'h-8 sm:h-full py-0' : 'h-full py-0'
                  )}
                >
                  {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                  <span className="truncate">{tab.label}</span>
                  {hasCount && (
                    <CountBadge
                      count={tab.count!}
                      variant={tab.badgeVariant || (value === tab.id ? 'amber' : 'sky')}
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
      {/* ================= VISTA MÓVIL (< sm): Buscador arriba y Pestañas abajo ================= */}
      <div className="flex sm:hidden flex-col w-full">
        {/* Fila 1 móvil: Buscador + botón opcional de filtros/interruptores */}
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1 min-w-0 h-10 px-3 bg-[#252526] rounded-full border border-[#2e2e2e] focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500 flex items-center gap-2 transition-all">
            <Search className="h-4 w-4 text-slate-400 shrink-0 pointer-events-none" />
            <input
              ref={setMobileInputRef}
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
              className="w-full h-full bg-transparent text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none min-w-0"
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

          {collapsibleMobileTabs && (
            <button
              type="button"
              onClick={() => setShowMobileTabs((prev) => !prev)}
              aria-label="Mostrar u ocultar filtros"
              aria-expanded={showMobileTabs}
              className={cn(
                'h-10 w-10 rounded-full border flex items-center justify-center shrink-0 transition-colors relative',
                showMobileTabs
                  ? 'bg-sky-600 border-sky-500 text-white shadow-sm'
                  : tabs[0] && value !== tabs[0].id
                  ? 'bg-[#252526] border-sky-500/60 text-sky-400 hover:bg-[#313131]'
                  : 'bg-[#252526] border-[#2e2e2e] text-slate-300 hover:bg-[#313131]'
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {!showMobileTabs && tabs[0] && value !== tabs[0].id && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-sky-400" />
              )}
            </button>
          )}
        </div>

        {/* Pestañas completas con iconos, texto y badges en móvil (colapsables si collapsibleMobileTabs está activo) */}
        <div
          className={cn(
            'grid transition-all duration-200 ease-in-out',
            !collapsibleMobileTabs || showMobileTabs
              ? 'grid-rows-[1fr] opacity-100 mt-2'
              : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
          )}
        >
          <div className="overflow-hidden">
            <Tabs
              value={value}
              onValueChange={(val) => {
                onValueChange(val);
                if (hasSearch) {
                  setTimeout(() => {
                    focusVisibleInput();
                  }, 10);
                }
              }}
              className="w-full"
            >
          <TabsList
            className={cn(
              'grid w-full p-1 bg-[#252526] border border-[#2e2e2e] transition-all',
              hasMultipleRows
                ? 'h-auto rounded-2xl p-1.5 gap-1.5 sm:h-10 sm:rounded-full sm:p-1 sm:gap-1'
                : 'h-10 rounded-full gap-1',
              colsClass
            )}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const hasCount = typeof tab.count === 'number' && tab.count > 0;
              const isActive = value === tab.id;

              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  onClick={() => {
                    if (hasSearch) {
                      setTimeout(() => {
                        focusVisibleInput();
                      }, 20);
                    }
                  }}
                  className={cn(
                    'rounded-full text-xs font-semibold data-[state=active]:bg-sky-600 data-[state=active]:text-white flex items-center justify-center gap-1.5 px-2 transition-all min-w-0',
                    hasMultipleRows ? 'h-8 sm:h-full py-0' : 'h-full py-0'
                  )}
                >
                  {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                  <span className="truncate">{tab.label}</span>
                  {hasCount && (
                    <CountBadge
                      count={tab.count!}
                      variant={tab.badgeVariant || (isActive ? 'amber' : 'sky')}
                    />
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
          </div>
        </div>
      </div>

      {/* ================= VISTA ESCRITORIO (sm+): Buscador y Pestañas en la misma píldora ================= */}
      <div
        className={cn(
          'hidden sm:flex w-full h-11 p-1 bg-[#252526] rounded-full border border-[#2e2e2e] has-[input:focus]:border-sky-500 has-[input:focus]:ring-1 has-[input:focus]:ring-sky-500 items-center gap-1.5 transition-all',
          listClassName
        )}
      >
        {/* Izquierda: Buscador siempre visible */}
        <div className="flex-1 flex items-center gap-2 pl-2.5 pr-1 min-w-0 h-full">
          <Search className="h-4 w-4 text-slate-400 shrink-0 pointer-events-none" />
          <input
            ref={setDesktopInputRef}
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
        <Tabs
          value={value}
          onValueChange={(val) => {
            onValueChange(val);
            if (hasSearch) {
              setTimeout(() => {
                focusVisibleInput();
              }, 10);
            }
          }}
          className="h-full shrink-0"
        >
          <TabsList className="flex items-center h-full p-0 bg-transparent border-0 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const hasCount = typeof tab.count === 'number' && tab.count > 0;
              const isActive = value === tab.id;

              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  onClick={() => {
                    if (hasSearch) {
                      setTimeout(() => {
                        focusVisibleInput();
                      }, 20);
                    }
                  }}
                  className="h-full rounded-full text-xs font-semibold data-[state=active]:bg-sky-600 data-[state=active]:text-white flex items-center justify-center gap-1.5 px-3 transition-all"
                >
                  {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                  <span className="truncate">{tab.label}</span>
                  {hasCount && (
                    <CountBadge
                      count={tab.count!}
                      variant={tab.badgeVariant || (isActive ? 'amber' : 'sky')}
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
