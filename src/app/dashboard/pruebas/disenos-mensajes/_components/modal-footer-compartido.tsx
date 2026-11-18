'use client';

import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CasoModalReal } from './datos-casos-reales';

interface ModalFooterCompartidoProps {
  caso: CasoModalReal;
  procesando?: boolean;
  onCerrar?: () => void;
  onConfirmar?: () => void;
  confirmClassName?: string;
  cancelClassName?: string;
  modoTactil?: boolean;
}

export function ModalFooterCompartido({
  caso,
  procesando = false,
  onCerrar,
  onConfirmar,
  confirmClassName,
  cancelClassName,
  modoTactil = false,
}: ModalFooterCompartidoProps) {
  const IconoConfirmar = caso.iconoConfirmar || Check;

  return (
    <div
      className={cn(
        'pt-3 mt-4 border-t border-[#2e2e2e]/70',
        modoTactil
          ? cn('grid gap-2.5', caso.soloConfirmar ? 'grid-cols-1' : 'grid-cols-2')
          : cn('flex items-center gap-3', caso.soloConfirmar ? 'justify-end' : 'justify-between')
      )}
    >
      {!caso.soloConfirmar && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={procesando}
          onClick={onCerrar}
          className={cn(
            'h-9 px-4 rounded-full text-xs border-[#2e2e2e] bg-[#1e1e1e] text-slate-300 hover:bg-[#313131] hover:text-white disabled:opacity-45 disabled:cursor-not-allowed',
            cancelClassName
          )}
        >
          {caso.textoBotonCancelar}
        </Button>
      )}

      <Button
        type="button"
        size="sm"
        disabled={procesando}
        onClick={onConfirmar}
        className={cn(
          'h-9 px-5 rounded-full text-xs font-bold gap-1.5 transition-all active:scale-95 disabled:opacity-75 disabled:cursor-wait disabled:active:scale-100',
          confirmClassName
        )}
      >
        {procesando ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Procesando...</span>
          </>
        ) : (
          <>
            <IconoConfirmar className="h-3.5 w-3.5" />
            <span>{caso.textoBotonConfirmar}</span>
          </>
        )}
      </Button>
    </div>
  );
}

