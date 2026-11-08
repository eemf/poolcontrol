'use client';

import React, { useState, useMemo } from 'react';
import { useFirebase, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, doc, query, orderBy, where, Timestamp } from "firebase/firestore";
import type { HistorialTragamonedas as HistorialTipo, Generales } from "@/lib/tipos";
import { toDate } from '@/lib/firebase/servicios/utils';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader } from "@/components/ui/loader";
import { 
  History, Trophy, Coins, MinusCircle, Award, Undo2, XCircle, Check 
} from "lucide-react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HistorialModalProps {
  maquinaId: string;
  maquinaNombre: string;
  isOpen: boolean;
  onClose: () => void;
  sucursalId: string;
  onAnular: (item: HistorialTipo) => void;
}

export function HistorialModal({
  maquinaId,
  maquinaNombre,
  isOpen,
  onClose,
  sucursalId,
  onAnular,
}: HistorialModalProps) {
  const { firestore } = useFirebase();
  const [mostrarTodo, setMostrarTodo] = useState(false);

  const generalesRef = useMemoFirebase(() => 
    (firestore && sucursalId) ? doc(firestore, `sucursales/${sucursalId}/generales/actual`) : null
  , [firestore, sucursalId]);
  const { data: estadoCaja, isLoading: cargandoEstadoCaja } = useDoc<Generales>(generalesRef);
  
  const fechaInicioPeriodo = useMemo(() => {
    if (!estadoCaja?.fechaInicioPeriodo) return null;
    return toDate(estadoCaja.fechaInicioPeriodo);
  }, [estadoCaja?.fechaInicioPeriodo]);

  const historialQuery = useMemoFirebase(() => {
    if (!firestore || !isOpen || cargandoEstadoCaja || !sucursalId) return null;

    const historialCollectionRef = collection(firestore, `sucursales/${sucursalId}/tragamonedas/${maquinaId}/historial`);
    
    if (mostrarTodo) {
      return query(historialCollectionRef, orderBy('fecha', 'desc'));
    } else {
      return query(historialCollectionRef, where("fecha", ">=", fechaInicioPeriodo || new Date(0)), orderBy('fecha', 'desc'));
    }
  }, [firestore, maquinaId, isOpen, mostrarTodo, fechaInicioPeriodo, cargandoEstadoCaja, sucursalId]);

  const { data: historialData, isLoading: isLoadingHistorial } = useCollection<HistorialTipo>(historialQuery);
  
  const historialOrdenado = useMemo(() => {
    if (!historialData) return [];
    return [...historialData].sort((a, b) => toDate(b.fecha).getTime() - toDate(a.fecha).getTime());
  }, [historialData]);

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'premio_total': return <Trophy className="h-4 w-4 text-amber-400" />;
      case 'premio_parcial': return <Award className="h-4 w-4 text-amber-400" />;
      case 'base': return <Coins className="h-4 w-4 text-emerald-400" />;
      case 'extraccion': return <MinusCircle className="h-4 w-4 text-rose-400" />;
      default: return <History className="h-4 w-4 text-sky-400" />;
    }
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'premio_total': return <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10 text-[10px] rounded-full">Premio Total</Badge>;
      case 'premio_parcial': return <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10 text-[10px] rounded-full">Premio Parcial</Badge>;
      case 'base': return <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-[10px] rounded-full">Carga de Base</Badge>;
      case 'extraccion': return <Badge variant="outline" className="border-rose-500/40 text-rose-400 bg-rose-500/10 text-[10px] rounded-full">Extracción</Badge>;
      default: return <Badge variant="outline" className="text-[10px] rounded-full">{tipo}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-app-surface border-app-border text-foreground p-5 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2 text-slate-100">
            <History className="h-5 w-5 text-sky-400" />
            Historial de {maquinaNombre}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {mostrarTodo ? "Mostrando todos los registros históricos." : "Mostrando registros del período actual."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between p-3 bg-[#1e1e1e] rounded-xl border border-app-border my-2 text-xs">
          <Label htmlFor="mostrar-todo-switch" className="text-slate-200 font-medium cursor-pointer">
            Ver historial completo de turnos anteriores
          </Label>
          <Switch
            id="mostrar-todo-switch"
            checked={mostrarTodo}
            onCheckedChange={setMostrarTodo}
          />
        </div>

        <ScrollArea className="h-80 pr-3">
          {isLoadingHistorial ? (
            <div className="flex justify-center items-center h-48">
              <Loader className="h-8 w-8 text-sky-400 animate-spin" />
            </div>
          ) : historialOrdenado.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-xs">
              No hay movimientos registrados para esta máquina en este rango.
            </div>
          ) : (
            <div className="space-y-2">
              {historialOrdenado.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    item.anulado 
                      ? "bg-rose-950/20 border-rose-500/30 opacity-60" 
                      : "bg-[#1e1e1e] border-app-border"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-full bg-app-surface border border-app-border shrink-0">
                      {getTipoIcon(item.tipo)}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getTipoBadge(item.tipo)}
                        {item.anulado && (
                          <Badge variant="destructive" className="text-[9px] rounded-full">Anulado</Badge>
                        )}
                        <span className="font-mono font-bold text-slate-100">
                          Q{item.monto.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{item.descripcion}</p>
                      <p className="text-[10px] text-muted-foreground/70">
                        {format(toDate(item.fecha), "dd/MM/yyyy hh:mm a", { locale: es })}
                      </p>
                    </div>
                  </div>

                  {!item.anulado && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAnular(item)}
                      className="h-7 text-xs text-rose-400 hover:text-white hover:bg-rose-600/30 rounded-full px-2.5 shrink-0"
                    >
                      <Undo2 className="h-3 w-3 mr-1" />
                      Anular
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end pt-2 border-t border-app-border">
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-full bg-[#1e1e1e] border-app-border text-slate-200">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
