"use client";

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

const InputNumero = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, onKeyDown, ...props }, ref) => {

  const internalRef = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(ref, () => internalRef.current as HTMLInputElement);

  React.useEffect(() => {
    const inputElement = internalRef.current;

    const handleWheel = (e: WheelEvent) => {
      if (document.activeElement === inputElement) {
        e.preventDefault();
      }
    };

    // Agregar el event listener al elemento de input
    inputElement?.addEventListener('wheel', handleWheel, { passive: false });

    // Limpieza al desmontar el componente
    return () => {
      inputElement?.removeEventListener('wheel', handleWheel);
    };
  }, []); // El array de dependencias vacío asegura que esto solo se ejecute al montar/desmontar

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevenir el cambio de valor con las flechas arriba/abajo
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  }

  return (
    <Input
      ref={internalRef}
      type="number"
      className={cn(
        // Ocultar flechas en Chrome, Safari, Edge, Opera
        "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
        className
      )}
      onKeyDown={handleKeyDown}
      {...props}
    />
  )
})
InputNumero.displayName = "InputNumero"

export { InputNumero }
