'use client';

import { useEffect } from 'react';

/**
 * MobileKeyboardHandler
 * 
 * Resuelve el problema común en dispositivos móviles donde el teclado virtual
 * cubre los campos de texto e inputs al escribir.
 * 
 * Funcionalidad (EXCLUSIVA para vista móvil < 768px):
 * 1. Detecta cuando un input o control editable recibe foco.
 * 2. Si el dispositivo está en vista móvil, espera a que el teclado virtual se despliegue.
 * 3. Utiliza `visualViewport` (si está disponible) y un retardo calibrado para centrar suavemente
 *    el elemento en el espacio visible disponible con `scrollIntoView({ block: 'center' })`.
 * 4. Añade margen inferior temporal al contenedor de scroll si el campo está cerca del fondo,
 *    garantizando que pueda desplazarse hasta el centro exacto sin topar contra el límite del scroll.
 */
export function MobileKeyboardHandler() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let activeInput: HTMLElement | null = null;
    let resizeCleanup: (() => void) | null = null;
    let originalPaddingBottom: string | null = null;
    let scrollParent: HTMLElement | null = null;

    const isMobile = () => {
      return (
        window.innerWidth < 768 ||
        (typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 767px)').matches)
      );
    };

    const isTextEditable = (el: EventTarget | null): el is HTMLElement => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      if (tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable) return true;
      if (tag === 'INPUT') {
        const type = (el as HTMLInputElement).type?.toLowerCase();
        const nonTextTypes = [
          'checkbox',
          'radio',
          'button',
          'submit',
          'reset',
          'file',
          'hidden',
          'image',
          'range',
          'color',
        ];
        return !nonTextTypes.includes(type);
      }
      return false;
    };

    const findScrollableParent = (el: HTMLElement): HTMLElement => {
      let parent = el.parentElement;
      while (parent) {
        const { overflowY } = window.getComputedStyle(parent);
        if (
          (overflowY === 'auto' || overflowY === 'scroll') &&
          parent.scrollHeight > parent.clientHeight
        ) {
          return parent;
        }
        parent = parent.parentElement;
      }
      return document.documentElement;
    };

    const centerElement = (el: HTMLElement) => {
      try {
        el.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      } catch {
        el.scrollIntoView(false);
      }
    };

    const handleFocusIn = (e: FocusEvent) => {
      // Regla estricta: Solo actuar en vista móvil (< 768px)
      if (!isMobile()) return;
      if (!isTextEditable(e.target)) return;

      activeInput = e.target;
      scrollParent = findScrollableParent(activeInput);

      // Si el elemento está dentro de un contenedor con scroll, agregamos holgura
      // inferior temporal para que el scroll tenga espacio suficiente para centrarlo
      if (scrollParent && scrollParent !== document.documentElement) {
        if (originalPaddingBottom === null) {
          originalPaddingBottom = scrollParent.style.paddingBottom;
        }
        scrollParent.style.paddingBottom = '320px';
      }

      // Si visualViewport está disponible en el navegador móvil, sincronizamos con el resize
      if (window.visualViewport) {
        resizeCleanup?.();
        const handleViewportResize = () => {
          if (activeInput) {
            centerElement(activeInput);
          }
        };
        window.visualViewport.addEventListener('resize', handleViewportResize);
        resizeCleanup = () => {
          window.visualViewport?.removeEventListener('resize', handleViewportResize);
        };
      }

      // Retardos calculados para coincidir con la animación de despliegue del teclado virtual
      setTimeout(() => {
        if (activeInput) centerElement(activeInput);
      }, 150);

      setTimeout(() => {
        if (activeInput) centerElement(activeInput);
      }, 350);
    };

    const handleFocusOut = () => {
      resizeCleanup?.();
      resizeCleanup = null;
      activeInput = null;

      // Restaurar el padding del contenedor de scroll
      if (scrollParent && originalPaddingBottom !== null) {
        scrollParent.style.paddingBottom = originalPaddingBottom;
        originalPaddingBottom = null;
        scrollParent = null;
      }
    };

    window.addEventListener('focusin', handleFocusIn, { passive: true });
    window.addEventListener('focusout', handleFocusOut, { passive: true });

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
      resizeCleanup?.();
      if (scrollParent && originalPaddingBottom !== null) {
        scrollParent.style.paddingBottom = originalPaddingBottom;
      }
    };
  }, []);

  return null;
}

