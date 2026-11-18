import React from 'react';

interface SurfaceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'panel' | 'surface' | 'subcard';
  children: React.ReactNode;
  className?: string;
}

/**
 * Contenedores estándar de Pool Control (Antigravity IDE Dark Theme).
 * - panel: Fondo principal #1e1e1e con borde #2e2e2e (para listados y bloques principales).
 * - surface: Fondo secundario #252526 con borde #2e2e2e (para tarjetas individuales, items y controles).
 * - subcard: Fondo interior #1e1e1e con borde #2e2e2e (para bloques internos dentro de tarjetas #252526).
 */
export function SurfaceCard({
  variant = 'panel',
  children,
  className = '',
  ...props
}: SurfaceCardProps) {
  const baseStyles = 'rounded-xl border transition-all';
  const variantStyles = {
    panel: 'bg-[#1e1e1e] border-[#2e2e2e] shadow-md overflow-hidden',
    surface: 'bg-[#252526] border-[#2e2e2e] shadow-sm hover:border-[#383838]',
    subcard: 'bg-[#1e1e1e] border-[#2e2e2e]',
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
