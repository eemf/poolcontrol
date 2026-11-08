'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  backHref?: string;
  className?: string;
}

/**
 * Componente estándar de cabecera de página en Pool Control.
 * Cumple con:
 * - Botón de retroceso circular opcional al lado izquierdo del título (ideal para móvil)
 * - Icono dentro de contenedor circular translúcido visible en móvil y escritorio
 * - Centrado del título e icono en móvil cuando existe botón de retroceso
 * - Título principal blanco, sin mayúsculas sostenidas
 * - Breve descripción explicativa en texto slate-400
 * - Botón de acción opcional alineado responsivamente
 */
export function PageHeader({
  title,
  description,
  icon: Icon,
  action,
  backHref,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`flex items-center justify-between gap-2.5 sm:gap-4 w-full ${className}`}>
      <div
        className={cn(
          'relative flex items-center gap-2 sm:gap-3 min-w-0',
          backHref && !action ? 'justify-center sm:justify-start w-full sm:w-auto min-h-[40px]' : 'justify-start'
        )}
      >
        {backHref && (
          <Button
            variant="secondary"
            size="icon"
            asChild
            className={cn(
              "rounded-full h-9 w-9 bg-[#252526] hover:bg-[#2e2e2e] text-slate-200 border border-[#2e2e2e] shrink-0 shadow-sm z-10",
              !action && "absolute left-0 sm:relative sm:left-auto"
            )}
            title="Regresar"
          >
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4 text-sky-400" />
            </Link>
          </Button>
        )}

        <div
          className={cn(
            'flex items-center gap-2 sm:gap-3 min-w-0',
            backHref && !action
              ? 'justify-center sm:justify-start text-center sm:text-left px-10 sm:px-0'
              : 'justify-start text-left'
          )}
        >
          {Icon && (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-sm">
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-sky-400" />
            </div>
          )}

          <div className={cn('min-w-0', backHref && !action ? 'text-center sm:text-left' : 'text-left')}>
            <h1 className="text-base sm:text-2xl font-bold text-white tracking-tight leading-tight truncate">
              {title}
            </h1>
            {description && (
              <p className="hidden sm:block text-xs text-slate-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {action && (
        <div className="shrink-0 flex items-center justify-end">
          {action}
        </div>
      )}
    </div>
  );
}
