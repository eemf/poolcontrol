'use client';

import React, { useState } from 'react';
import { useFirebase, useMemoFirebase, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import { 
  Gamepad2, Wallet, Landmark, Trophy, MinusCircle, History, Loader2, Check 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { InputNumero } from "@/components/ui/input-numero";
import { PermissionGuard } from "@/components/permission-guard";
import { SurfaceCard } from "@/components/comunes";
import { registrarBaseTragamonedas, registrarExtraccionTragamonedas } from "@/lib/firebase/servicios";
import type { GeneralesTragamonedas } from "@/lib/tipos";
import { cn } from "@/lib/utils";

type EstadoTragamonedas = "activo" | "mantenimiento" | "inactivo";

interface TragamonedasConDocId {
  idTragamonedas: number;
  nombre: string;
  modelo?: string;
  estado: EstadoTragamonedas;
  docId: string;
}

interface MaquinaCardProps {
  maquina: TragamonedasConDocId;
  sucursalId: string;
  usuarioId: string;
  onVerHistorial: (maquina: TragamonedasConDocId) => void;
}

export function MaquinaCard({ maquina, sucursalId, usuarioId, onVerHistorial }: MaquinaCardProps) {
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const [isBaseModalOpen, setIsBaseModalOpen] = useState(false);
  const [montoBase, setMontoBase] = useState<number | ''>(0);
  const [loadingBase, setLoadingBase] = useState(false);

  const [isExtraccionModalOpen, setIsExtraccionModalOpen] = useState(false);
  const [montoExtraccion, setMontoExtraccion] = useState<number | ''>(0);
  const [loadingExtraccion, setLoadingExtraccion] = useState(false);

  const generalesRef = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return doc(firestore, `sucursales/${sucursalId}/generales_tragamonedas`, maquina.docId);
  }, [firestore, maquina.docId, sucursalId]);

  const { data: generales, isLoading } = useDoc<GeneralesTragamonedas>(generalesRef);

  const getStatusBadge = (estado: EstadoTragamonedas) => {
    switch (estado) {
      case 'activo':
        return <Badge className="rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] px-2.5">Activo</Badge>;
      case 'mantenimiento':
        return <Badge className="rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] px-2.5">Mantenimiento</Badge>;
      case 'inactivo':
        return <Badge className="rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] px-2.5">Inactivo</Badge>;
      default:
        return <Badge variant="outline" className="rounded-full text-[10px]">{estado}</Badge>;
    }
  };

  const handleRegistrarBase = async () => {
    if (!firestore || !sucursalId) return;
    const monto = Number(montoBase);
    if (isNaN(monto) || monto <= 0) {
      toast({ title: "Atención", description: "El monto de la base debe ser mayor a cero.", variant: "destructive" });
      return;
    }

    setLoadingBase(true);
    try {
      await registrarBaseTragamonedas(firestore, sucursalId, maquina.docId, monto, usuarioId);
      toast({ title: "Base Registrada", description: `Base de Q${monto.toFixed(2)} agregada a ${maquina.nombre}.` });
      setIsBaseModalOpen(false);
    } catch (error: any) {
      console.error("Error registrando base:", error);
      toast({ title: "Error", description: error.message || "No se pudo registrar la base.", variant: "destructive" });
    } finally {
      setLoadingBase(false);
    }
  };

  const handleRegistrarExtraccion = async () => {
    if (!firestore || !sucursalId) return;
    const monto = Number(montoExtraccion);
    if (isNaN(monto) || monto <= 0) {
      toast({ title: "Atención", description: "El monto de la extracción debe ser mayor a cero.", variant: "destructive" });
      return;
    }

    setLoadingExtraccion(true);
    try {
      await registrarExtraccionTragamonedas(firestore, sucursalId, maquina.docId, monto, usuarioId);
      toast({ title: "Extracción Registrada", description: `Extracción de Q${monto.toFixed(2)} procesada exitosamente.` });
      setIsExtraccionModalOpen(false);
    } catch (error: any) {
      console.error("Error registrando extracción:", error);
      toast({ title: "Error", description: error.message || "No se pudo registrar la extracción.", variant: "destructive" });
    } finally {
      setLoadingExtraccion(false);
    }
  };

  return (
    <>
      <SurfaceCard variant="panel" className="p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-app-border">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400">
                <Gamepad2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">{maquina.nombre}</h3>
                {maquina.modelo && <p className="text-[10px] text-muted-foreground">{maquina.modelo}</p>}
              </div>
            </div>
            {getStatusBadge(maquina.estado)}
          </div>

          <div className="py-3 space-y-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-24">
                <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
              </div>
            ) : (
              <div className="space-y-1.5 bg-[#252526] p-3 rounded-xl border border-app-border">
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Wallet className="h-3.5 w-3.5 text-rose-400" /> Deuda
                  </span>
                  <span className="font-mono font-bold text-rose-400">
                    Q{(generales?.totalDeuda || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Landmark className="h-3.5 w-3.5 text-sky-400" /> Base
                  </span>
                  <span className="font-mono font-bold text-slate-100">
                    Q{(generales?.totalBase || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Trophy className="h-3.5 w-3.5 text-emerald-400" /> Extracción
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    Q{(generales?.totalExtraccion || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-app-border">
          <div className="grid grid-cols-2 gap-2">
            <Button
              className="w-full rounded-full h-8 text-xs bg-app-surface hover:bg-slate-700/60 border border-app-border text-slate-200"
              variant="outline"
              onClick={() => { setIsBaseModalOpen(true); setMontoBase(0); }}
            >
              <Landmark className="mr-1 h-3.5 w-3.5 text-sky-400" />
              Base
            </Button>
            <Button
              className="w-full rounded-full h-8 text-xs bg-app-surface hover:bg-slate-700/60 border border-app-border text-slate-200"
              variant="outline"
              onClick={() => { setIsExtraccionModalOpen(true); setMontoExtraccion(0); }}
            >
              <MinusCircle className="mr-1 h-3.5 w-3.5 text-emerald-400" />
              Extracción
            </Button>
          </div>

          <PermissionGuard permission="tragamonedas.historial">
            <Button
              className="w-full rounded-full h-8 text-xs bg-[#1e1e1e] hover:bg-slate-700/50 border border-app-border text-slate-300"
              variant="outline"
              onClick={() => onVerHistorial(maquina)}
            >
              <History className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
              Ver Historial
            </Button>
          </PermissionGuard>
        </div>
      </SurfaceCard>

      <Dialog open={isBaseModalOpen} onOpenChange={setIsBaseModalOpen}>
        <DialogContent className="rounded-2xl bg-app-surface border-app-border text-foreground p-5 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Landmark className="h-4 w-4 text-sky-400" />
              Base: {maquina.nombre}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Ingresa el monto de la base inicial a descontar de la existencia de monedas.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-1.5">
            <Label htmlFor="monto-base" className="text-xs text-slate-300">Monto de la Base (Q)</Label>
            <InputNumero
              id="monto-base"
              placeholder="0.00"
              value={montoBase}
              onChange={(e) => setMontoBase(e.target.value === '' ? '' : Number(e.target.value))}
              autoFocus
              onFocus={(e) => e.target.select()}
              className="text-center rounded-full text-base h-10 bg-[#1e1e1e] border-app-border font-bold"
              onKeyDown={(e) => { if (e.key === 'Enter') handleRegistrarBase(); }}
            />
          </div>

          <DialogFooter className="flex gap-2 sm:justify-between">
            <Button
              variant="outline"
              className="rounded-full h-8 text-xs border-app-border"
              onClick={() => setIsBaseModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRegistrarBase}
              disabled={loadingBase}
              className="rounded-full h-8 text-xs bg-sky-600 hover:bg-sky-500 text-white"
            >
              {loadingBase ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1 h-3.5 w-3.5" />}
              Confirmar Base
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isExtraccionModalOpen} onOpenChange={setIsExtraccionModalOpen}>
        <DialogContent className="rounded-2xl bg-app-surface border-app-border text-foreground p-5 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
              <MinusCircle className="h-4 w-4 text-emerald-400" />
              Extracción: {maquina.nombre}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Ingresa el monto extraído de la máquina para saldar deudas y bases.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-1.5">
            <Label htmlFor="monto-extraccion" className="text-xs text-slate-300">Monto Extraído (Q)</Label>
            <InputNumero
              id="monto-extraccion"
              placeholder="0.00"
              value={montoExtraccion}
              onChange={(e) => setMontoExtraccion(e.target.value === '' ? '' : Number(e.target.value))}
              autoFocus
              onFocus={(e) => e.target.select()}
              className="text-center rounded-full text-base h-10 bg-[#1e1e1e] border-app-border font-bold"
              onKeyDown={(e) => { if (e.key === 'Enter') handleRegistrarExtraccion(); }}
            />
          </div>

          <DialogFooter className="flex gap-2 sm:justify-between">
            <Button
              variant="outline"
              className="rounded-full h-8 text-xs border-app-border"
              onClick={() => setIsExtraccionModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRegistrarExtraccion}
              disabled={loadingExtraccion}
              className="rounded-full h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {loadingExtraccion ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1 h-3.5 w-3.5" />}
              Confirmar Extracción
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
