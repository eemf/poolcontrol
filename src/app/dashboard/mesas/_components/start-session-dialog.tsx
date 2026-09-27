'use client';

import React from 'react';
import type { Mesa } from '@/lib/tipos';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Clock, Timer, Play, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const intervalosDeTiempo = [
  { label: '30 min', minutos: 30 },
  { label: '1 hora', minutos: 60 },
  { label: '1h 30m', minutos: 90 },
  { label: '2 horas', minutos: 120 },
  { label: '2h 30m', minutos: 150 },
  { label: '3 horas', minutos: 180 },
  { label: '3h 30m', minutos: 210 },
  { label: '4 horas', minutos: 240 },
  { label: '4h 30m', minutos: 270 },
];

interface StartSessionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTable: Mesa | null;
  modoJuego: 'libre' | 'definido';
  setModoJuego: (modo: 'libre' | 'definido') => void;
  selectedInterval: number;
  setSelectedInterval: (val: number) => void;
  pagadoDeContado: boolean;
  setPagadoDeContado: (val: boolean) => void;
  onStart: () => void;
  numControles: number;
  setNumControles: (val: number) => void;
}

export function StartSessionDialog({
  isOpen,
  onOpenChange,
  selectedTable,
  modoJuego,
  setModoJuego,
  selectedInterval,
  setSelectedInterval,
  pagadoDeContado,
  setPagadoDeContado,
  onStart,
  numControles,
  setNumControles,
}: StartSessionDialogProps) {
  const isConsola = selectedTable?.tipoDeMesa === 'Consola';
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl sm:rounded-3xl font-body p-0 flex flex-col max-h-[90vh] overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 pb-2 shrink-0 bg-background">
          <DialogTitle className="font-headline text-xl">Iniciar Sesión: {isConsola ? 'Consola' : 'Mesa'} #{selectedTable?.numeroMesa}</DialogTitle>
          <DialogDescription className="font-body text-xs">Selecciona el modo de juego para comenzar.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 bg-muted/5">
          <div className="px-6 py-6 space-y-6">
            {isConsola && (
              <div className="space-y-3 bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-200 dark:border-amber-800">
                <Label className="text-[10px] font-black uppercase tracking-widest text-amber-800 dark:text-amber-400 flex items-center gap-2">
                  <Users className="h-3 w-3" /> Cantidad de Controles
                </Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((n) => (
                    <Button
                      key={n}
                      type="button"
                      variant={numControles === n ? "default" : "outline"}
                      className={cn(
                        "flex-1 rounded-full font-bold h-10 transition-all",
                        numControles === n ? "bg-amber-600 hover:bg-amber-700 shadow-md" : "border-amber-200 dark:border-amber-800 hover:bg-amber-50"
                      )}
                      onClick={() => setNumControles(n)}
                    >
                      {n}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setModoJuego('libre')} className={cn("flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all", modoJuego === 'libre' ? 'border-primary bg-primary/5' : 'border-muted hover:bg-muted/50')}>
                <Clock className={cn("h-6 w-6", modoJuego === 'libre' ? 'text-primary' : 'text-muted-foreground')} />
                <span className={cn("font-bold text-sm", modoJuego === 'libre' ? 'text-primary' : 'text-foreground/70')}>Tiempo Libre</span>
              </button>
              <button onClick={() => setModoJuego('definido')} className={cn("flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all", modoJuego === 'definido' ? 'border-primary bg-primary/5' : 'border-muted hover:bg-muted/50')}>
                <Timer className={cn("h-6 w-6", modoJuego === 'definido' ? 'text-primary' : 'text-muted-foreground')} />
                <span className={cn("font-bold text-sm", modoJuego === 'definido' ? 'text-primary' : 'text-foreground/70')}>Tiempo Definido</span>
              </button>
            </div>
            {modoJuego === 'definido' && (
              <div className="space-y-4 pt-4 border-t border-muted-foreground/10 animate-in fade-in slide-in-from-top-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Selecciona el Intervalo</Label>
                <div className="grid grid-cols-3 gap-2 p-1">
                  {intervalosDeTiempo.map((intervalo) => (
                    <Button key={intervalo.minutos} variant={selectedInterval === intervalo.minutos ? 'default' : 'outline'} onClick={() => setSelectedInterval(intervalo.minutos)} className="rounded-full h-10 font-bold text-xs">
                      {intervalo.label}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center space-x-2 p-4 bg-background rounded-2xl border border-muted/40 shadow-sm">
                  <Checkbox id="pagado-contado" checked={pagadoDeContado} onCheckedChange={(checked) => setPagadoDeContado(checked as boolean)} />
                  <Label htmlFor="pagado-contado" className="text-sm font-bold cursor-pointer">Pagado de Contado</Label>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 bg-background shrink-0 sm:justify-between flex flex-col-reverse sm:flex-row gap-3">
          <DialogClose asChild><Button variant="outline" className="rounded-full px-8 font-bold h-11 w-full sm:w-auto">Cancelar</Button></DialogClose>
          <Button onClick={onStart} className="rounded-full px-10 font-bold h-11 w-full sm:w-auto shadow-lg shadow-primary/20">
            <Play className="mr-2 h-4 w-4" />
            Iniciar Juego
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
