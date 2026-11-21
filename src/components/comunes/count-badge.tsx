import React from 'react';

export type CountBadgeVariant = 'amber' | 'white' | 'emerald' | 'sky' | 'slate';

interface CountBadgeProps {
  count: number;
  variant?: CountBadgeVariant;
  className?: string;
  showZero?: boolean;
}

const variantStyles: Record<CountBadgeVariant, string> = {
  amber: 'bg-amber-400 text-slate-950',
  white: 'bg-white text-slate-950',
  emerald: 'bg-emerald-400 text-slate-950',
  sky: 'bg-sky-300 text-slate-950',
  slate: 'bg-slate-200 text-slate-900',
};

/**
 * Badge numérico estándar para pestañas y botones de Pool Control.
 * - Forma perfectamente circular para 1 dígito (20x20px), expande a cápsula suavemente si hay más dígitos.
 * - Textos de alto contraste y legibilidad absoluta sin mezcla de color.
 */
export function CountBadge({
  count,
  variant = 'white',
  className = '',
  showZero = false,
}: CountBadgeProps) {
  if (count <= 0 && !showZero) return null;

  return (
    <span
      className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[0.6875rem] font-black leading-none shadow-sm shrink-0 transition-transform ${variantStyles[variant]} ${className}`}
    >
      {count}
    </span>
  );
}
