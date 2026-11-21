'use client';

import React, { useState } from 'react';
import { useFirebase } from '@/firebase';
import { Trophy, Award, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { registrarPagoPremioTragamonedas } from '@/lib/firebase/servicios';
import { InputNumero } from '@/components/ui/input-numero';
import { PillTabs, SurfaceCard } from '@/components/comunes';

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

export const PremioForm = React.memo(function PremioForm({
  maquinas,
  sucursalId,
  usuarioId,
}: PremioFormProps) {
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const [maquinaId, setMaquinaId] = useState('');
  const [tipoPremio, setTipoPremio] = useState<'total' | 'parcial'>('total');
  const [montoTotal, setMontoTotal] = useState<number | ''>('');
  const [montoPagado, setMontoPagado] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setMaquinaId('');
    setTipoPremio('total');
    setMontoTotal('');
    setMontoPagado('');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!firestore) return;

    if (!maquinaId) {
      toast({
        title: 'Atención',
        description: 'Debes seleccionar una máquina.',
        variant: 'destructive',
      });
      return;
    }

    const montoTotalNum = Number(montoTotal);
    if (isNaN(montoTotalNum) || montoTotalNum <= 0) {
      toast({
        title: 'Atención',
        description: 'El monto del premio debe ser mayor a cero.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (tipoPremio === 'total') {
        await registrarPagoPremioTragamonedas(
          firestore,
          sucursalId,
          {
            maquinaId,
            tipoPago: 'total',
            monto: montoTotalNum,
          },
          usuarioId
        );
        toast({
          title: 'Premio Registrado',
          description: `Premio total de Q${montoTotalNum.toFixed(2)} registrado exitosamente.`,
        });
      } else {
        const montoPagadoNum = Number(montoPagado);
        if (isNaN(montoPagadoNum) || montoPagadoNum < 0) {
          toast({
            title: 'Atención',
            description: 'El monto pagado debe ser un número válido.',
            variant: 'destructive',
          });
          return;
        }
        if (montoPagadoNum > montoTotalNum) {
          toast({
            title: 'Atención',
            description: 'El monto pagado no puede exceder el premio total.',
            variant: 'destructive',
          });
          return;
        }
        await registrarPagoPremioTragamonedas(
          firestore,
          sucursalId,
          {
            maquinaId,
            tipoPago: 'parcial',
            montoTotal: montoTotalNum,
            montoPagado: montoPagadoNum,
          },
          usuarioId
        );
        toast({
          title: 'Premio Parcial Registrado',
          description: 'Se registró el pago parcial y se actualizó la deuda.',
        });
      }
      resetForm();
    } catch (error: any) {
      console.error('Error al registrar premio:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo registrar el pago del premio.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SurfaceCard variant="panel" className="p-4 flex flex-col justify-between font-body">
      <div>
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#2e2e2e]">
          <div className="h-9 w-9 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Trophy className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 leading-tight">Registrar Premio</h3>
            <p className="text-[0.6875rem] text-slate-400">
              Abono o liquidación de premios a jugadores
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mt-3">
          <div className="space-y-1">
            <Label htmlFor="maquina-premio" className="text-xs font-semibold text-slate-300">
              Máquina
            </Label>
            <Select value={maquinaId} onValueChange={setMaquinaId} disabled={loading}>
              <SelectTrigger
                id="maquina-premio"
                className="rounded-full h-9 px-3.5 bg-[#252526] border-[#2e2e2e] text-xs text-slate-100 focus:ring-1 focus:ring-sky-500"
              >
                <SelectValue placeholder="Seleccionar máquina..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-200 rounded-xl shadow-2xl text-xs">
                {maquinas.map((m) => (
                  <SelectItem
                    key={m.docId}
                    value={m.docId}
                    className="text-xs cursor-pointer focus:bg-[#252526]"
                  >
                    {m.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <PillTabs
            value={tipoPremio}
            onValueChange={(v) => setTipoPremio(v as 'total' | 'parcial')}
            listClassName="h-9"
            tabs={[
              {
                id: 'total',
                label: 'Total',
                icon: Trophy,
              },
              {
                id: 'parcial',
                label: 'Parcial',
                icon: Award,
              },
            ]}
          />

          {tipoPremio === 'total' ? (
            <div className="space-y-1">
              <Label htmlFor="monto-total" className="text-xs font-semibold text-slate-300">
                Monto del Premio (Q)
              </Label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400 pointer-events-none">
                  Q
                </span>
                <InputNumero
                  id="monto-total"
                  placeholder="0.00"
                  value={montoTotal}
                  onChange={(e) =>
                    setMontoTotal(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  min={0}
                  step="0.01"
                  disabled={loading}
                  className="rounded-full text-center h-9 pl-7 pr-3 bg-[#252526] border-[#2e2e2e] text-sm font-bold text-slate-100 tabular-nums"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="premio-total" className="text-[0.6875rem] font-semibold text-slate-300">
                  Total Premio (Q)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400 pointer-events-none">
                    Q
                  </span>
                  <InputNumero
                    id="premio-total"
                    placeholder="0.00"
                    value={montoTotal}
                    onChange={(e) =>
                      setMontoTotal(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    min={0}
                    step="0.01"
                    disabled={loading}
                    className="rounded-full text-center h-9 pl-6 pr-2 bg-[#252526] border-[#2e2e2e] text-xs font-bold text-slate-100 tabular-nums"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="monto-pagado" className="text-[0.6875rem] font-semibold text-slate-300">
                  Monto Pagado (Q)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400 pointer-events-none">
                    Q
                  </span>
                  <InputNumero
                    id="monto-pagado"
                    placeholder="0.00"
                    value={montoPagado}
                    onChange={(e) =>
                      setMontoPagado(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    min={0}
                    step="0.01"
                    disabled={loading}
                    className="rounded-full text-center h-9 pl-6 pr-2 bg-[#252526] border-[#2e2e2e] text-xs font-bold text-slate-100 tabular-nums"
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
          )}

          <Button
            type="submit"
            disabled={loading || !maquinaId}
            className="w-full rounded-full h-9 font-semibold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm mt-2"
          >
            {loading ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Award className="mr-1.5 h-4 w-4" />
            )}
            Registrar Premio
          </Button>
        </form>
      </div>
    </SurfaceCard>
  );
});
