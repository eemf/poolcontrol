import React from 'react';

interface SurfaceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'panel' | 'surface' | 'subcard';
  children: React.ReactNode;
  className?: string;
}

/**
 * Contenedores estándar de Pool Control.
 * - panel: Fondo principal #1d283a con borde #324157 (para listados y bloques principales).
 * - surface: Fondo secundario #283244 con borde #324157 (para tarjetas individuales, items).
 * - subcard: Fondo interior #1d283a con borde #324157 (para bloques internos como rutas origen-destino).
 */
export function SurfaceCard({
  variant = 'panel',
  children,
  className = '',
  ...props
}: SurfaceCardProps) {
  const baseStyles = 'rounded-xl border transition-all';
  const variantStyles = {
    panel: 'bg-[#1d283a] border-[#324157] shadow-sm overflow-hidden',
    surface: 'bg-[#283244] border-[#324157] shadow-sm hover:border-slate-500/60',
    subcard: 'bg-[#1d283a] border-[#324157]',
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
