'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Icono oficial de Pool Control 2.0 (estilo Bola 8 Minimalista con halo celeste).
 * Utiliza un ID único por instancia para evitar colisiones de gradiente SVG.
 */
export function BolaBillarIcon({ className }: { className?: string }) {
  const gradId = React.useId();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={cn('h-10 w-10', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>
      {/* Esfera oscura con halo celeste */}
      <circle cx="32" cy="32" r="28" fill="#18181b" stroke={`url(#${gradId})`} strokeWidth="4" />
      {/* Reflejo superior */}
      <path
        d="M18 19a18 18 0 0 1 11-7"
        stroke="#7dd3fc"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* Ventana blanca y número 8 centrado */}
      <circle cx="32" cy="33" r="12" fill="#f8fafc" />
      <text
        x="32"
        y="38.5"
        textAnchor="middle"
        fontSize="16"
        fontWeight="800"
        fontFamily="system-ui, sans-serif"
        fill="#0f172a"
      >
        8
      </text>
    </svg>
  );
}
