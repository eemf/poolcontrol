import * as React from 'react';
import { cn } from '@/lib/utils';

export function BolaBillarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className={cn('h-6 w-6', className)}
      aria-hidden="true"
    >
      {/* Esfera principal de la bola */}
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      {/* Reflejo sutil */}
      <path
        d="M7.2 7.2a6.8 6.8 0 0 1 4.2-2"
        stroke="rgba(255, 255, 255, 0.45)"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      {/* Ventana blanca del número */}
      <circle cx="12" cy="12" r="4.9" fill="#f8fafc" />
      {/* Número 8 nítido */}
      <circle cx="12" cy="10.35" r="1.2" stroke="#121212" strokeWidth="1.35" />
      <circle cx="12" cy="13.35" r="1.45" stroke="#121212" strokeWidth="1.35" />
    </svg>
  );
}
