'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CasoModalReal } from './datos-casos-reales';

interface ModalCamposCompartidosProps {
  caso: CasoModalReal;
}

export function ModalCamposCompartidos({ caso }: ModalCamposCompartidosProps) {
  const [estacion, setEstacion] = useState('mesa-3');
  const [pin, setPin] = useState('1234');
  const [monto, setMonto] = useState('25.00');

  if (caso.campoTipo === 'ninguno' && !caso.descripcion) {
    return null;
  }

  return (
    <div className="my-4 space-y-3">
      {/* Caso 1: Select Estándar h-9 rounded-full */}
      {caso.campoTipo === 'select' && (
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-300 block">
            Estación de Destino
          </label>
          <Select value={estacion} onValueChange={setEstacion}>
            <SelectTrigger className="h-9 text-xs bg-[#141414] border-[#2e2e2e] rounded-full px-3.5 text-slate-100 focus:border-sky-500">
              <SelectValue placeholder="Selecciona una mesa..." />
            </SelectTrigger>
            <SelectContent className="bg-[#252526] border-[#2e2e2e] text-slate-100">
              <SelectItem value="mesa-3" className="text-xs">Mesa #3 (Billar Pool)</SelectItem>
              <SelectItem value="mesa-4" className="text-xs">Mesa #4 (Carambola)</SelectItem>
              <SelectItem value="mesa-5" className="text-xs">Mesa #5 (VIP)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Caso 2: Caja de Saldo de Cliente */}
      {caso.campoTipo === 'caja_saldo' && caso.detallesCaja && (
        <div className="p-3 rounded-xl bg-[#141414] border border-[#2e2e2e] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold text-slate-100">{caso.detallesCaja.nombre}</span>
          </div>
          <div className="text-right">
            <span className="text-muted-foreground text-[10px] mr-1.5">{caso.detallesCaja.etiquetaSaldo}:</span>
            <span className="font-black text-amber-400 tabular-nums text-sm">{caso.detallesCaja.saldo}</span>
          </div>
        </div>
      )}

      {/* Caso 4: Caja de Consumo y PIN Estándar h-9 rounded-full */}
      {caso.campoTipo === 'caja_pin' && caso.detallesCaja && (
        <div className="space-y-2.5">
          <div className="p-3 rounded-xl bg-[#141414] border border-[#2e2e2e] flex items-center justify-between text-xs">
            <span className="font-bold text-slate-100">{caso.detallesCaja.nombre}</span>
            <span className="font-black text-amber-400 tabular-nums text-sm">{caso.detallesCaja.saldo}</span>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300 block">
              PIN de Autorización
            </label>
            <Input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="h-9 text-center text-sm tracking-[0.5em] bg-[#141414] border-[#2e2e2e] rounded-full text-sky-400 font-bold focus-visible:border-sky-500"
            />
          </div>
        </div>
      )}

      {/* Caso 6: Desglose de Abono y Monto Estándar h-9 rounded-full */}
      {caso.campoTipo === 'caja_abono' && caso.detallesCaja && (
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#141414] border border-[#2e2e2e] text-xs">
            <div>
              <span className="text-[10px] text-muted-foreground block">Cuenta Actual:</span>
              <span className="font-bold text-slate-200 tabular-nums">{caso.detallesCaja.cuentaActual}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Crédito Acumulado:</span>
              <span className="font-bold text-amber-400 tabular-nums">{caso.detallesCaja.credito}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300 block">
              Monto a Recibir (Q)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400 font-bold text-xs">Q</span>
              <Input
                type="number"
                step="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="pl-8 h-9 text-xs bg-[#141414] border-[#2e2e2e] rounded-full text-slate-100 font-bold tabular-nums focus-visible:border-sky-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Descripción complementaria */}
      {caso.descripcion && (
        <p className="text-xs text-muted-foreground pt-0.5 leading-relaxed">
          {caso.descripcion}
        </p>
      )}
    </div>
  );
}

