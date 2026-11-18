'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CasoModalReal } from './datos-casos-reales';
import { ModalCamposCompartidos } from './modal-campos-compartidos';
import { ModalFooterCompartido } from './modal-footer-compartido';
import { SwalIcono } from './swal-icono';

interface LineaBordeSuperiorProps {
  caso: CasoModalReal;
  procesando?: boolean;
  onCerrar?: () => void;
  onConfirmar?: () => void;
}

export function LineaBordeSuperior({
  caso,
  procesando = false,
  onCerrar,
  onConfirmar,
}: LineaBordeSuperiorProps) {
  const estilosBorde = {
    normal: {
      barraTop: 'from-sky-500 via-cyan-400 to-sky-600',
      badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      botonConfirmar: 'bg-sky-600 hover:bg-sky-500 text-white shadow-[0_4px_14px_rgba(2,132,199,0.28)]',
    },
    advertencia: {
      barraTop: 'from-amber-400 via-yellow-300 to-amber-500',
      badge: 'bg-amber-400 text-slate-950 font-bold',
      botonConfirmar: 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-[0_4px_14px_rgba(245,158,11,0.25)]',
    },
    destructivo: {
      barraTop: 'from-rose-500 via-red-400 to-rose-600',
      badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30 font-semibold',
      botonConfirmar: 'bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-[0_4px_14px_rgba(225,29,72,0.28)]',
    },
    info: {
      barraTop: 'from-sky-500 via-cyan-400 to-sky-600',
      badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      botonConfirmar: 'bg-sky-600 hover:bg-sky-500 text-white shadow-[0_4px_14px_rgba(2,132,199,0.28)]',
    },
  }[caso.tipo];

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-[#252526] border border-[#2e2e2e] p-5 pt-6 text-left transition-all shadow-2xl max-w-md w-full">
      <div className={cn("absolute top-0 inset-x-0 h-1 bg-gradient-to-r", estilosBorde.barraTop)} />

      <button
        type="button"
        disabled={procesando}
        onClick={onCerrar}
        className="absolute right-4 top-4 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-[#313131] transition-colors disabled:opacity-40 disabled:pointer-events-none"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center justify-between pb-2.5 pr-8">
        <Badge variant="outline" className={cn("text-[9.5px] px-2.5 py-0.5 rounded-full", estilosBorde.badge)}>
          {caso.tipoTexto}
        </Badge>
      </div>

      <div className="flex items-start gap-4">
        <SwalIcono swalTipo={caso.swalTipo} size="md" />

        <div className="space-y-1 min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-tight">
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
        confirmClassName={estilosBorde.botonConfirmar}
      />
    </div>
  );
}
