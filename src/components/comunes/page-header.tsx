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
 * Cumple con el estándar Antigravity IDE Dark Theme:
 * - Icono dentro de contenedor circular translúcido
 * - Título principal blanco, sin mayúsculas sostenidas
 * - Breve descripción explicativa en texto slate-400 (visible en móvil y escritorio)
 * - Botón "Regresar" en píldora al lado derecho con icono y texto en móvil y escritorio
 * - Acciones adicionales alineadas a la derecha
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
    <div className={cn('flex items-center justify-between gap-3 sm:gap-4 w-full', className)}>
      {/* Lado izquierdo: Icono circular + Título + Descripción visible en móvil y escritorio */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
        {Icon && (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-sm">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-sky-400" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="text-base sm:text-2xl font-bold text-white tracking-tight leading-tight truncate">
            {title}
          </h1>
          {description && (
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Lado derecho: Botón Regresar y/o Acción personalizada */}
      {(action || backHref) && (
        <div className="shrink-0 flex items-center justify-end gap-2">
          {action}
          {backHref && (
            <Button
              variant="secondary"
              asChild
              className="rounded-full h-8 sm:h-9 px-3 sm:px-3.5 bg-[#252526] hover:bg-[#2e2e2e] text-slate-200 hover:text-white border border-[#2e2e2e] shadow-sm transition-colors text-xs font-semibold gap-1.5 inline-flex items-center"
              title="Regresar"
            >
              <Link href={backHref}>
                <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-400 shrink-0" />
                <span>Regresar</span>
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
