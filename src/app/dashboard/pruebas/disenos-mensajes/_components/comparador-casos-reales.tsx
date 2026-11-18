'use client';

import React, { useState } from 'react';
import { Sliders, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CASOS_REALES, type CasoModalReal } from './datos-casos-reales';
import { LineaAntigravityOficial } from './linea-antigravity-oficial';
import { LineaBordeSuperior } from './linea-borde-superior';
import { LineaGlowCapsula } from './linea-glow-capsula';
import { LineaPosTactil } from './linea-pos-tactil';
import './swal-iconos.css';

export type EstiloLinea = 'oficial' | 'borde' | 'glow' | 'tactil';

export function ComparadorCasosReales() {
  const { toast } = useToast();
  const [lineaActiva, setLineaActiva] = useState<EstiloLinea>('oficial');
  const [casoAbiertoModal, setCasoAbiertoModal] = useState<CasoModalReal | null>(null);
  const [procesando, setProcesando] = useState(false);

  const cerrarModal = () => {
    if (procesando) return;
    setCasoAbiertoModal(null);
  };

  const confirmarAccion = (caso: CasoModalReal) => {
    if (procesando) return;
    setProcesando(true);
    setTimeout(() => {
      setProcesando(false);
      setCasoAbiertoModal(null);
      toast({
        variant: 'success',
        title: `${caso.titulo} — Completado`,
        description: 'La acción se procesó de forma segura con bloqueo anti-doble clic.',
      });
    }, 1300);
  };

  const renderModalPorLinea = (caso: CasoModalReal, esDialogoReal = false) => {
    const isBusy = esDialogoReal ? procesando : false;
    const onCerrarHandler = esDialogoReal ? cerrarModal : undefined;
    const onConfirmarHandler = esDialogoReal ? () => confirmarAccion(caso) : undefined;

    switch (lineaActiva) {
      case 'borde':
        return (
          <LineaBordeSuperior
            caso={caso}
            procesando={isBusy}
            onCerrar={onCerrarHandler}
            onConfirmar={onConfirmarHandler}
          />
        );
      case 'glow':
        return (
          <LineaGlowCapsula
            caso={caso}
            procesando={isBusy}
            onCerrar={onCerrarHandler}
            onConfirmar={onConfirmarHandler}
          />
        );
      case 'tactil':
        return (
          <LineaPosTactil
            caso={caso}
            procesando={isBusy}
            onCerrar={onCerrarHandler}
            onConfirmar={onConfirmarHandler}
          />
        );
      case 'oficial':
      default:
        return (
          <LineaAntigravityOficial
            caso={caso}
            procesando={isBusy}
            onCerrar={onCerrarHandler}
            onConfirmar={onConfirmarHandler}
            esDialogoReal={esDialogoReal}
          />
        );
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Selector de Línea de Estilo Unificada */}
      <div className="p-4 rounded-2xl bg-app-surface border border-app-border space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-sky-400" />
              Selecciona una Línea de Diseño Unificada:
            </h4>
            <p className="text-xs text-muted-foreground pt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>Todos los botones, selects e inputs comparten altura estándar (`h-9`). Pulsa</span>
              <strong className="text-sky-400 inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Abrir Diálogo
              </strong>
              <span>para probar la animación SweetAlert2 y el bloqueo al confirmar.</span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'oficial' as const, label: 'Línea 1: Antigravity Oficial' },
              { id: 'borde' as const, label: 'Línea 2: Borde Superior' },
              { id: 'glow' as const, label: 'Línea 3: Glow / Cápsula' },
              { id: 'tactil' as const, label: 'Línea 4: Táctil POS 50/50' },
            ].map((l) => (
              <Button
                key={l.id}
                size="sm"
                variant={lineaActiva === l.id ? 'default' : 'outline'}
                onClick={() => setLineaActiva(l.id)}
                className={`h-9 px-4 rounded-full text-xs font-semibold ${
                  lineaActiva === l.id
                    ? 'bg-sky-600 text-white hover:bg-sky-500 shadow-xs'
                    : 'border-app-border text-slate-300 hover:bg-[#313131]'
                }`}
              >
                {l.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Cuadrícula de los Casos Reales Estandarizados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CASOS_REALES.map((caso, index) => (
          <div key={caso.id} className="space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500/10 text-sky-400 text-[11px] font-black inline-flex items-center justify-center border border-sky-500/20">
                  {index + 1}
                </span>
                {caso.titulo}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setCasoAbiertoModal(caso)}
                className="h-8 px-3 rounded-full text-xs text-sky-400 hover:text-sky-300 hover:bg-[#252526] gap-1.5"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Abrir Diálogo</span>
              </Button>
            </div>

            <div className="p-3 rounded-2xl bg-[#121212] border border-app-border flex items-center justify-center min-h-[300px]">
              {renderModalPorLinea(caso, false)}
            </div>
          </div>
        ))}
      </div>

      {/* Diálogo Emergente Real: Bloqueo fuera y bloqueo de botones al confirmar */}
      <Dialog
        open={!!casoAbiertoModal}
        onOpenChange={(op) => !op && cerrarModal()}
      >
        <DialogContent
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="modal-pro-anim data-[state=open]:animate-none data-[state=closed]:animate-none max-w-md bg-transparent border-none p-0 shadow-none [&>button]:hidden"
        >
          <DialogTitle className="sr-only">
            {casoAbiertoModal?.titulo || 'Vista previa de modal'}
          </DialogTitle>
          {casoAbiertoModal && renderModalPorLinea(casoAbiertoModal, true)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
