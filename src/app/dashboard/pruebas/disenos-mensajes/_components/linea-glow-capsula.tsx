'use client';

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CasoModalReal } from './datos-casos-reales';
import { ModalCamposCompartidos } from './modal-campos-compartidos';
import { ModalFooterCompartido } from './modal-footer-compartido';
import { SwalIcono } from './swal-icono';

interface LineaGlowCapsulaProps {
  caso: CasoModalReal;
  procesando?: boolean;
  onCerrar?: () => void;
  onConfirmar?: () => void;
}

export function LineaGlowCapsula({
  caso,
  procesando = false,
  onCerrar,
  onConfirmar,
}: LineaGlowCapsulaProps) {
  const estilosGlow = {
    normal: {
      borde: 'border-sky-500/35 shadow-[0_0_30px_rgba(14,165,233,0.14)]',
      gradienteFondo: 'from-sky-500/10 via-[#1e1e1e] to-[#1e1e1e]',
      botonConfirmar: 'bg-sky-500 hover:bg-sky-400 text-white font-bold shadow-[0_4px_14px_rgba(14,165,233,0.3)]',
    },
    advertencia: {
      borde: 'border-amber-500/35 shadow-[0_0_30px_rgba(245,158,11,0.14)]',
      gradienteFondo: 'from-amber-500/10 via-[#1e1e1e] to-[#1e1e1e]',
      botonConfirmar: 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-[0_4px_14px_rgba(245,158,11,0.25)]',
    },
    destructivo: {
      borde: 'border-rose-500/35 shadow-[0_0_30px_rgba(244,63,94,0.14)]',
      gradienteFondo: 'from-rose-500/10 via-[#1e1e1e] to-[#1e1e1e]',
      botonConfirmar: 'bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-[0_4px_14px_rgba(225,29,72,0.3)]',
    },
    info: {
      borde: 'border-sky-500/35 shadow-[0_0_30px_rgba(14,165,233,0.14)]',
      gradienteFondo: 'from-sky-500/10 via-[#1e1e1e] to-[#1e1e1e]',
      botonConfirmar: 'bg-sky-500 hover:bg-sky-400 text-white font-bold shadow-[0_4px_14px_rgba(14,165,233,0.3)]',
    },
  }[caso.tipo];

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-3xl bg-gradient-to-b border p-6 text-left transition-all max-w-md w-full",
      estilosGlow.gradienteFondo,
      estilosGlow.borde
    )}>
      <button
        type="button"
        disabled={procesando}
        onClick={onCerrar}
        className="absolute right-4 top-4 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-[#2e2e2e] transition-colors disabled:opacity-40 disabled:pointer-events-none"
      >
        <X className="h-4 w-4" />
      </button>

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
        confirmClassName={estilosGlow.botonConfirmar}
        cancelClassName="bg-[#141414]/60 hover:bg-[#2e2e2e]"
      />
    </div>
  );
}
