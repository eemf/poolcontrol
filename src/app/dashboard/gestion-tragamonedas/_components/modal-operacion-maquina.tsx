'use client';

import React, { useState, useEffect } from 'react';
import {
  Landmark,
  MinusCircle,
  Coins,
  Wallet,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InputNumero } from '@/components/ui/input-numero';
import { SurfaceCard } from '@/components/comunes';
import type { GeneralesTragamonedas } from '@/lib/tipos';
import type { OperacionMaquinaActiva } from '../_hooks/use-gestion-tragamonedas';

interface ModalOperacionMaquinaProps {
  operacion: OperacionMaquinaActiva | null;
  generales?: GeneralesTragamonedas;
  procesando: boolean;
  onClose: () => void;
  onConfirmar: (monto: number) => Promise<void>;
}

export function ModalOperacionMaquina({
  operacion,
  generales,
  procesando,
  onClose,
  onConfirmar,
}: ModalOperacionMaquinaProps) {
  const [monto, setMonto] = useState<number | ''>('');

  useEffect(() => {
    if (operacion) {
      setMonto('');
    }
  }, [operacion]);

  if (!operacion) return null;

  const esBase = operacion.tipo === 'base';
  const { maquina } = operacion;

  const handleSubmit = async () => {
    const valor = Number(monto);
    if (isNaN(valor) || valor <= 0 || procesando) return;
    await onConfirmar(valor);
  };

  return (
    <Dialog open={Boolean(operacion)} onOpenChange={(val) => !val && !procesando && onClose()}>
      <DialogContent className="sm:max-w-sm w-[95vw] bg-[#1e1e1e] border border-[#2e2e2e] text-slate-100 p-5 sm:p-6 rounded-2xl shadow-2xl font-body gap-4">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-3 pr-6">
            {esBase ? (
              <div className="h-10 w-10 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                <Landmark className="h-5 w-5" />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <MinusCircle className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              <DialogTitle className="font-headline text-base sm:text-lg font-bold text-slate-100 leading-tight truncate">
                {esBase ? `Base: ${maquina.nombre}` : `Extracción: ${maquina.nombre}`}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                {esBase
                  ? 'Registra la carga de base descontada de monedas.'
                  : 'Registra el retiro de monedas para saldar deudas y bases.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3.5">
          {esBase ? (
            <SurfaceCard
              variant="surface"
              className="p-3 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Coins className="h-4 w-4 text-sky-400 shrink-0" />
                <span className="text-xs font-medium text-slate-300">Base Acumulada Actual</span>
              </div>
              <span className="text-sm font-black text-sky-400 tabular-nums shrink-0">
                Q{(generales?.totalBase || 0).toFixed(2)}
              </span>
            </SurfaceCard>
          ) : (
            <SurfaceCard variant="surface" className="p-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5 text-rose-400" /> Deuda Actual:
                </span>
                <span className="font-bold text-rose-400 tabular-nums">
                  Q{(generales?.totalDeuda || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Landmark className="h-3.5 w-3.5 text-sky-400" /> Base Actual:
                </span>
                <span className="font-bold text-slate-100 tabular-nums">
                  Q{(generales?.totalBase || 0).toFixed(2)}
                </span>
              </div>
            </SurfaceCard>
          )}

          <div className="space-y-1.5">
            <Label
              htmlFor="monto-operacion-maquina"
              className="text-xs font-semibold text-slate-200 block text-center"
            >
              {esBase ? 'Monto de la Base (Q)' : 'Monto Extraído (Q)'}
            </Label>
            <div className="relative">
              <span
                className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold pointer-events-none ${
                  esBase ? 'text-sky-400' : 'text-emerald-400'
                }`}
              >
                Q
              </span>
              <InputNumero
                id="monto-operacion-maquina"
                placeholder="0.00"
                value={monto}
                onChange={(e) => setMonto(e.target.value === '' ? '' : Number(e.target.value))}
                autoFocus
                onFocus={(e) => e.target.select()}
                className="text-center rounded-full text-sm h-9 pl-8 pr-4 font-semibold text-slate-100 tabular-nums"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="pt-1 flex flex-row items-center justify-between sm:justify-between gap-2 sm:space-x-0">
          <Button
            type="button"
            variant="secondary"
            disabled={procesando}
            className="rounded-full h-9 px-5 text-xs font-semibold bg-[#252526] hover:bg-[#313131] text-slate-200 border border-[#2e2e2e]"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={procesando || !monto || Number(monto) <= 0}
            className={
              esBase
                ? 'rounded-full h-9 px-5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md'
                : 'rounded-full h-9 px-5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
            }
          >
            {procesando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>{esBase ? 'Confirmar Base' : 'Confirmar Extracción'}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

