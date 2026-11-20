'use client';

import { useEffect } from 'react';

/**
 * MobileKeyboardHandler
 *
 * Resuelve el problema en dispositivos móviles reales donde el teclado virtual
 * puede cubrir un campo de texto enfocado, SIN agregar padding inferior artificial
 * que genere espacios vacíos al final del scroll cuando el teclado no está abierto.
 */
export function MobileKeyboardHandler() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let activeInput: HTMLElement | null = null;
    let resizeCleanup: (() => void) | null = null;

    const syncVisualViewportVars = () => {
      const root = document.documentElement;
      const vv = window.visualViewport;
      if (!vv || window.innerWidth >= 768) {
        root.style.removeProperty('--app-vv-height');
        root.style.removeProperty('--app-vv-offset-top');
        return;
      }
      root.style.setProperty('--app-vv-height', `${Math.round(vv.height)}px`);
      root.style.setProperty('--app-vv-offset-top', `${Math.round(vv.offsetTop)}px`);
    };

    syncVisualViewportVars();
    window.visualViewport?.addEventListener('resize', syncVisualViewportVars);
    window.visualViewport?.addEventListener('scroll', syncVisualViewportVars);
    window.addEventListener('resize', syncVisualViewportVars);

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

    const ensureInputVisible = (el: HTMLElement) => {
      const vv = window.visualViewport;
      if (!vv) return;
      // Solo actuar si realmente se desplegó un teclado virtual (viewport reducido > 100px)
      const keyboardOpen = window.innerHeight - vv.height > 100;
      if (!keyboardOpen) return;

      const rect = el.getBoundingClientRect();
      const visibleBottom = vv.offsetTop + vv.height - 16;
      const visibleTop = vv.offsetTop + 16;

      if (rect.bottom > visibleBottom || rect.top < visibleTop) {
        try {
          el.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest',
          });
        } catch {
          el.scrollIntoView(false);
        }
      }
    };

    const handleFocusIn = (e: FocusEvent) => {
      if (!isMobile()) return;
      if (!isTextEditable(e.target)) return;

      activeInput = e.target;

      if (window.visualViewport) {
        resizeCleanup?.();
        const handleViewportResize = () => {
          if (activeInput) {
            ensureInputVisible(activeInput);
          }
        };
        window.visualViewport.addEventListener('resize', handleViewportResize);
        resizeCleanup = () => {
          window.visualViewport?.removeEventListener('resize', handleViewportResize);
        };
      }
    };

    const handleFocusOut = () => {
      resizeCleanup?.();
      resizeCleanup = null;
      activeInput = null;
    };

    window.addEventListener('focusin', handleFocusIn, { passive: true });
    window.addEventListener('focusout', handleFocusOut, { passive: true });

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
      window.visualViewport?.removeEventListener('resize', syncVisualViewportVars);
      window.visualViewport?.removeEventListener('scroll', syncVisualViewportVars);
      window.removeEventListener('resize', syncVisualViewportVars);
      document.documentElement.style.removeProperty('--app-vv-height');
      document.documentElement.style.removeProperty('--app-vv-offset-top');
      resizeCleanup?.();
    };
  }, []);

  return null;
}
