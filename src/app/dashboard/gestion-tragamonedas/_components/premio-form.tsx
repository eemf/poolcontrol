'use client';

import React, { useState } from 'react';
import { useFirebase } from "@/firebase";
import { Trophy, Award, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { registrarPagoPremioTragamonedas } from "@/lib/firebase/servicios";
import { InputNumero } from "@/components/ui/input-numero";
import { SurfaceCard } from "@/components/comunes";

interface TragamonedasItem {
  idTragamonedas: number;
  nombre: string;
  docId: string;
}

interface PremioFormProps {
  maquinas: TragamonedasItem[];
  sucursalId: string;
  usuarioId: string;
}

export function PremioForm({ maquinas, sucursalId, usuarioId }: PremioFormProps) {
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const [maquinaId, setMaquinaId] = useState('');
  const [tipoPremio, setTipoPremio] = useState<'total' | 'parcial'>('total');
  const [montoTotal, setMontoTotal] = useState<number | ''>('');
  const [montoPagado, setMontoPagado] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!firestore) return;

    if (!maquinaId) {
      toast({ title: "Atención", description: "Debes seleccionar una máquina.", variant: "destructive" });
      return;
    }

    const montoTotalNum = Number(montoTotal);
    if (isNaN(montoTotalNum) || montoTotalNum <= 0) {
      toast({ title: "Atención", description: "El monto del premio debe ser mayor a cero.", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      if (tipoPremio === 'total') {
        await registrarPagoPremioTragamonedas(firestore, sucursalId, {
          maquinaId,
          tipoPago: 'total',
          monto: montoTotalNum
        }, usuarioId);
        toast({ title: "Premio Registrado", description: `Premio total de Q${montoTotalNum.toFixed(2)} registrado exitosamente.` });
      } else {
        const montoPagadoNum = Number(montoPagado);
        if (isNaN(montoPagadoNum) || montoPagadoNum < 0) {
          toast({ title: "Atención", description: "El monto pagado debe ser un número válido.", variant: "destructive" });
          return;
        }
        if (montoPagadoNum > montoTotalNum) {
          toast({ title: "Atención", description: "El monto pagado no puede exceder el premio total.", variant: "destructive" });
          return;
        }
        await registrarPagoPremioTragamonedas(firestore, sucursalId, {
          maquinaId,
          tipoPago: 'parcial',
          montoTotal: montoTotalNum,
          montoPagado: montoPagadoNum
        }, usuarioId);
        toast({ title: "Premio Parcial Registrado", description: "Se registró el pago parcial y se actualizó la deuda." });
      }
      setMaquinaId('');
      setTipoPremio('total');
      setMontoTotal('');
      setMontoPagado('');
    } catch (error: any) {
      console.error("Error al registrar premio:", error);
      toast({ title: "Error", description: error.message || "No se pudo registrar el pago del premio.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SurfaceCard variant="panel" className="p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Trophy className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Registrar Premio</h3>
            <p className="text-[11px] text-muted-foreground">Abono o liquidación de premios a jugadores</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-3">
          <div className="space-y-1">
            <Label htmlFor="maquina-premio" className="text-xs text-slate-300">Máquina</Label>
            <Select value={maquinaId} onValueChange={setMaquinaId} disabled={loading}>
              <SelectTrigger id="maquina-premio" className="rounded-full h-9 bg-app-surface border-app-border text-xs">
                <SelectValue placeholder="Seleccionar máquina..." />
              </SelectTrigger>
              <SelectContent className="bg-app-surface border-app-border text-xs">
                {maquinas.map((m) => (
                  <SelectItem key={m.docId} value={m.docId}>
                    {m.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center p-1.5 bg-[#283244] rounded-full border border-app-border">
            <RadioGroup
              value={tipoPremio}
              onValueChange={(v) => setTipoPremio(v as 'total' | 'parcial')}
              className="flex items-center gap-6"
              disabled={loading}
            >
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="total" id="pago-total" />
                <Label htmlFor="pago-total" className="text-xs cursor-pointer text-slate-200">Total</Label>
              </div>
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="parcial" id="pago-parcial" />
                <Label htmlFor="pago-parcial" className="text-xs cursor-pointer text-slate-200">Parcial</Label>
              </div>
            </RadioGroup>
          </div>

          {tipoPremio === 'total' ? (
            <div className="space-y-1">
              <Label htmlFor="monto-total" className="text-xs text-slate-300">Monto del Premio (Q)</Label>
              <InputNumero
                id="monto-total"
                placeholder="0.00"
                value={montoTotal}
                onChange={(e) => setMontoTotal(Number(e.target.value))}
                min={0}
                step="0.01"
                disabled={loading}
                className="rounded-full text-center h-9 bg-app-surface border-app-border text-sm font-semibold"
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="premio-total" className="text-[11px] text-slate-300">Total Premio (Q)</Label>
                <InputNumero
                  id="premio-total"
                  placeholder="0.00"
                  value={montoTotal}
                  onChange={(e) => setMontoTotal(Number(e.target.value))}
                  min={0}
                  step="0.01"
                  disabled={loading}
                  className="rounded-full text-center h-9 bg-app-surface border-app-border text-xs font-semibold"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="monto-pagado" className="text-[11px] text-slate-300">Monto Pagado (Q)</Label>
                <InputNumero
                  id="monto-pagado"
                  placeholder="0.00"
                  value={montoPagado}
                  onChange={(e) => setMontoPagado(Number(e.target.value))}
                  min={0}
                  step="0.01"
                  disabled={loading}
                  className="rounded-full text-center h-9 bg-app-surface border-app-border text-xs font-semibold"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !maquinaId}
            className="w-full rounded-full h-9 font-medium text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 mt-2"
          >
            {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Award className="mr-1.5 h-4 w-4" />}
            Registrar Premio
          </Button>
        </form>
      </div>
    </SurfaceCard>
  );
}
