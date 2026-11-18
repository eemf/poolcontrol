'use client';

import React, { useState } from 'react';
import { Check, Loader2, type LucideIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SwalIcono, type SwalTipoIcono } from './swal-icono';

export type TipoModalMensaje = 'normal' | 'advertencia' | 'destructivo' | 'info' | 'exito';

interface ModalConfirmacionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipo?: TipoModalMensaje;
  swalTipo?: SwalTipoIcono;
  titulo: string;
  subtitulo?: string;
  children?: React.ReactNode;
  textoCancelar?: string;
  textoConfirmar?: string;
  iconoConfirmar?: LucideIcon;
  soloConfirmar?: boolean;
  procesando?: boolean;
  confirmDisabled?: boolean;
  onConfirmar?: () => void | Promise<void>;
  onCancelar?: () => void;
  maxWidthClass?: string;
}

const SWAL_DEFAULT_MAP: Record<TipoModalMensaje, SwalTipoIcono> = {
  normal: 'question',
  advertencia: 'warning',
  destructivo: 'error',
  info: 'info',
  exito: 'success',
};

const ESTILOS_LINEA_OFICIAL: Record<
  TipoModalMensaje,
  { luzSuperior: string; botonConfirmar: string }
> = {
  normal: {
    luzSuperior: 'via-sky-400/50',
    botonConfirmar:
      'bg-sky-600 hover:bg-sky-500 text-white shadow-[0_4px_14px_rgba(2,132,199,0.3)]',
  },
  advertencia: {
    luzSuperior: 'via-amber-400/50',
    botonConfirmar:
      'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-[0_4px_14px_rgba(245,158,11,0.25)]',
  },
  destructivo: {
    luzSuperior: 'via-rose-400/50',
    botonConfirmar:
      'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_4px_14px_rgba(225,29,72,0.3)]',
  },
  info: {
    luzSuperior: 'via-sky-400/50',
    botonConfirmar:
      'bg-sky-600 hover:bg-sky-500 text-white shadow-[0_4px_14px_rgba(2,132,199,0.3)]',
  },
  exito: {
    luzSuperior: 'via-emerald-400/50',
    botonConfirmar:
      'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)]',
  },
};

/**
 * Modal estándar Línea 1 (Antigravity Oficial + SweetAlert2).
 * Incluye bloqueo de cierre externo, iconos animados SweetAlert2, botón Cancelar
 * a la izquierda y bloqueo preventivo anti-doble clic durante operaciones asíncronas.
 */
export function ModalConfirmacion({
  open,
  onOpenChange,
  tipo = 'normal',
  swalTipo,
  titulo,
  subtitulo,
  children,
  textoCancelar = 'Cancelar',
  textoConfirmar = 'Confirmar',
  iconoConfirmar: IconoConfirmar = Check,
  soloConfirmar = false,
  procesando: procesandoExterno = false,
  confirmDisabled = false,
  onConfirmar,
  onCancelar,
  maxWidthClass = 'max-w-md',
}: ModalConfirmacionProps) {
  const [procesandoInterno, setProcesandoInterno] = useState(false);
  const estaProcesando = procesandoExterno || procesandoInterno;
  const tipoIcono = swalTipo || SWAL_DEFAULT_MAP[tipo];
  const estilo = ESTILOS_LINEA_OFICIAL[tipo];

  const handleCerrar = () => {
    if (estaProcesando) return;
    onCancelar?.();
    onOpenChange(false);
  };

  const handleConfirmar = async () => {
    if (estaProcesando || confirmDisabled) return;
    if (!onConfirmar) {
      onOpenChange(false);
      return;
    }
    try {
      setProcesandoInterno(true);
      await onConfirmar();
    } finally {
      setProcesandoInterno(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleCerrar();
        else onOpenChange(true);
      }}
    >
      <DialogContent
        disableClose={estaProcesando}
        className={cn(
          'overflow-hidden rounded-2xl bg-[#1e1e1e] border border-[#2e2e2e] p-5 sm:p-6 text-left shadow-2xl gap-0',
          maxWidthClass
        )}
      >
        <div
          className={cn(
            'absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent to-transparent',
            estilo.luzSuperior
          )}
        />

        {/* Cabecera estilo SweetAlert2 centrada */}
        <div className="flex flex-col items-center text-center space-y-3 pt-1">
          <SwalIcono swalTipo={tipoIcono} size="lg" />

          <div className="space-y-1 max-w-sm">
            <DialogTitle className="text-lg font-bold text-slate-100 leading-tight">
              {titulo}
            </DialogTitle>
            {subtitulo ? (
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                {subtitulo}
              </DialogDescription>
            ) : (
              <DialogDescription className="sr-only">{titulo}</DialogDescription>
            )}
          </div>
        </div>

        {/* Contenido específico del modal (cajas #141414, selects, inputs, etc.) */}
        {children && <div className="my-4 space-y-3">{children}</div>}

        {/* Footer: Cancelar a la izquierda, Confirmar a la derecha */}
        <div
          className={cn(
            'flex items-center gap-3 pt-3 mt-4 border-t border-[#2e2e2e]/70',
            soloConfirmar ? 'justify-end' : 'justify-between'
          )}
        >
          {!soloConfirmar && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={estaProcesando}
              onClick={handleCerrar}
              className="h-9 px-4 rounded-full text-xs border-[#2e2e2e] bg-[#252526] text-slate-300 hover:bg-[#313131] hover:text-white disabled:opacity-45 disabled:cursor-not-allowed"
            >
              {textoCancelar}
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            disabled={estaProcesando || confirmDisabled}
            onClick={handleConfirmar}
            className={cn(
              'h-9 px-5 rounded-full text-xs font-bold gap-1.5 transition-all active:scale-95 disabled:opacity-75 disabled:cursor-wait disabled:active:scale-100',
              estilo.botonConfirmar
            )}
          >
            {estaProcesando ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <IconoConfirmar className="h-3.5 w-3.5" />
                <span>{textoConfirmar}</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

