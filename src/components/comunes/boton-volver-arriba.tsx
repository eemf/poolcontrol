'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BotonVolverArribaProps {
  /** Píxeles de desplazamiento vertical para mostrar el botón (por defecto 150px) */
  threshold?: number;
  /** Contenedor con scroll personalizado (ej. dentro de un modal); si se omite usa <main> / window */
  containerRef?: React.RefObject<HTMLElement | null>;
  className?: string;
}

/**
 * Control flotante estándar del Design System para volver al inicio de la página o lista.
 * Detecta automáticamente el desplazamiento tanto en el contenedor indicado como en `<main>` / `window`.
 */
export function BotonVolverArriba({
  threshold = 150,
  containerRef,
  className,
}: BotonVolverArribaProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const customEl = containerRef?.current;
    if (containerRef) {
      if (!customEl) return;
      const handleCustomScroll = () => {
        setVisible(customEl.scrollTop > threshold);
      };
      handleCustomScroll();
      customEl.addEventListener('scroll', handleCustomScroll, { passive: true });
      return () => customEl.removeEventListener('scroll', handleCustomScroll);
    }

    const mainEl = document.querySelector('main');

    const handleScroll = () => {
      const scrollTop = Math.max(
        window.scrollY || 0,
        document.documentElement.scrollTop || 0,
        mainEl ? mainEl.scrollTop : 0
      );
      setVisible(scrollTop > threshold);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    mainEl?.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      mainEl?.removeEventListener('scroll', handleScroll);
    };
  }, [threshold, containerRef]);

  const scrollToTop = useCallback(() => {
    const customEl = containerRef?.current;
    if (customEl) {
      customEl.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const mainEl = document.querySelector('main');
    if (mainEl && mainEl.scrollTop > 0) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (window.scrollY > 0 || document.documentElement.scrollTop > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [containerRef]);

  if (!visible) return null;

  return (
    <Button
      type="button"
      onClick={scrollToTop}
      size="icon"
      aria-label="Volver al inicio de la página"
      title="Subir al inicio"
      className={cn(
        'fixed bottom-6 right-5 sm:bottom-8 sm:right-8 z-40 h-10 w-10 sm:h-11 sm:w-11 p-0 rounded-full aspect-square bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30 border border-sky-400/30 transition-all duration-200 animate-in fade-in zoom-in-75 cursor-pointer',
        className
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
}

