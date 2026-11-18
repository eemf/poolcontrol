'use client';

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CasoModalReal } from './datos-casos-reales';
import { ModalCamposCompartidos } from './modal-campos-compartidos';
import { ModalFooterCompartido } from './modal-footer-compartido';
import { SwalIcono } from './swal-icono';

interface LineaPosTactilProps {
  caso: CasoModalReal;
  procesando?: boolean;
  onCerrar?: () => void;
  onConfirmar?: () => void;
}

export function LineaPosTactil({
  caso,
  procesando = false,
  onCerrar,
  onConfirmar,
}: LineaPosTactilProps) {
  const estilosTactil = {
    normal: 'bg-sky-600 hover:bg-sky-500 text-white shadow-[0_4px_12px_rgba(2,132,199,0.28)]',
    advertencia: 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-[0_4px_12px_rgba(245,158,11,0.25)]',
    destructivo: 'bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-[0_4px_12px_rgba(225,29,72,0.28)]',
    info: 'bg-sky-600 hover:bg-sky-500 text-white shadow-[0_4px_12px_rgba(2,132,199,0.28)]',
  }[caso.tipo];

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-[#252526] border border-[#2e2e2e] p-5 text-left transition-all shadow-2xl max-w-md w-full">
      <button
        type="button"
        disabled={procesando}
        onClick={onCerrar}
        className="absolute right-4 top-4 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-[#313131] transition-colors disabled:opacity-40 disabled:pointer-events-none"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-4 pr-8 pb-1">
        <SwalIcono swalTipo={caso.swalTipo} size="md" />
        <div className="min-w-0 flex-1 space-y-0.5">
          <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-tight">
            {caso.titulo}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
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
        confirmClassName={estilosTactil}
        modoTactil
      />
    </div>
  );
}
