'use client';

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CasoModalReal } from './datos-casos-reales';
import { ModalCamposCompartidos } from './modal-campos-compartidos';
import { ModalFooterCompartido } from './modal-footer-compartido';
import { SwalIcono } from './swal-icono';

interface LineaAntigravityOficialProps {
  caso: CasoModalReal;
  procesando?: boolean;
  onCerrar?: () => void;
  onConfirmar?: () => void;
  esDialogoReal?: boolean;
}

export function LineaAntigravityOficial({
  caso,
  procesando = false,
  onCerrar,
  onConfirmar,
  esDialogoReal = false,
}: LineaAntigravityOficialProps) {
  const estilosTipo = {
    normal: {
      luzSuperior: 'via-sky-400/50',
      botonConfirmar: 'bg-sky-600 hover:bg-sky-500 text-white shadow-[0_4px_14px_rgba(2,132,199,0.3)]',
    },
    advertencia: {
      luzSuperior: 'via-amber-400/50',
      botonConfirmar: 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-[0_4px_14px_rgba(245,158,11,0.25)]',
    },
    destructivo: {
      luzSuperior: 'via-rose-400/50',
      botonConfirmar: 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_4px_14px_rgba(225,29,72,0.3)]',
    },
    info: {
      luzSuperior: 'via-sky-400/50',
      botonConfirmar: 'bg-sky-600 hover:bg-sky-500 text-white shadow-[0_4px_14px_rgba(2,132,199,0.3)]',
    },
  }[caso.tipo];

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl bg-[#252526] border border-[#2e2e2e] p-5 sm:p-6 text-left transition-colors shadow-2xl max-w-md w-full",
      !esDialogoReal && "hover:border-slate-600/70"
    )}>
      <div className={cn(
        "absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent to-transparent",
        estilosTipo.luzSuperior
      )} />

      <button
        type="button"
        disabled={procesando}
        onClick={onCerrar}
        className="absolute right-4 top-4 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-[#313131] transition-colors disabled:opacity-40 disabled:pointer-events-none"
        title="Cerrar modal"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Cabecera estilo SweetAlert2 centrada */}
      <div className="flex flex-col items-center text-center space-y-3 pt-1">
        <SwalIcono swalTipo={caso.swalTipo} size="lg" />

        <div className="space-y-1 max-w-sm">
          <h3 className="text-lg font-bold text-slate-100 leading-tight">
            {caso.titulo}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {caso.subtitulo}
          </p>
        </div>
      </div>

      <ModalCamposCompartidos caso={caso} />

      <ModalFooterCompartido
        caso={caso}
        procesando={procesando}
        onCerrar={onCerrar}
        onConfirmar={onConfirmar}
        confirmClassName={estilosTipo.botonConfirmar}
      />
    </div>
  );
}
