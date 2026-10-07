'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Mic,
  MicOff,
  Sparkles,
  Loader2,
  Volume2,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  LayoutGrid,
  ShoppingCart,
  Dices,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { useVoiceAssistant, type UseVoiceAssistantProps } from '@/hooks/use-voice-assistant';
import { cn } from '@/lib/utils';
import type { Mesa, Producto, ProductoVirtual, Tarifa, GeneralesTragamonedas } from '@/lib/tipos';

export interface VoiceAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mesas?: Mesa[];
  productos?: (Producto | ProductoVirtual)[];
  tarifas?: Tarifa[];
  clientes?: string[];
  maquinas?: GeneralesTragamonedas[];
}

const CATEGORIAS_COMANDOS = [
  { id: 'mesas', label: 'Mesas', icon: LayoutGrid },
  { id: 'ventas', label: 'Ventas (POS)', icon: ShoppingCart },
  { id: 'tragamonedas', label: 'Tragamonedas', icon: Dices },
  { id: 'consultas', label: 'Consultas', icon: Info },
] as const;

const EJEMPLOS_POR_CATEGORIA: Record<string, string[]> = {
  mesas: [
    'Inicia tiempo libre en mesa 1',
    'Inicia una hora en mesa 2',
    'Agrega 30 minutos a mesa 1',
    'Traslada mesa 1 a mesa 3',
    'Cobra mesa 1 en efectivo',
    'Pasa mesa 1 a la cuenta de Juan',
    'Agrega una Coca Cola a mesa 2',
    'Elimina una cerveza de mesa 1',
  ],
  ventas: [
    'Vende una Coca Cola',
    'Venta rápida 2 cervezas',
    'Agrega un Casino a la cuenta de Juan',
    'Cobra la cuenta de Juan en efectivo',
    '¿Cuánto debe Juan?',
  ],
  tragamonedas: [
    'Agrega 50 de base a la máquina 1',
    'Extrae 100 de la máquina 2',
    'Paga premio de 30 en la máquina 1',
    'Estado de las máquinas tragamonedas',
  ],
  consultas: [
    '¿Qué mesas están libres?',
    '¿Cómo va la mesa 1?',
    '¿Cuánto tiene la cuenta de Juan?',
    '¿Cómo cierro la caja del turno?',
  ],
};

export default function VoiceAssistantDialog({
  open,
  onOpenChange,
  mesas,
  productos,
  tarifas,
  clientes,
  maquinas,
}: VoiceAssistantDialogProps) {
  const [manualText, setManualText] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<'mesas' | 'ventas' | 'tragamonedas' | 'consultas'>('mesas');

  const {
    isSupported,
    isListening,
    isProcessing,
    isSpeaking,
    isSecureContext,
    isMobile,
    audioLevel,
    transcript,
    interimTranscript,
    lastResult,
    error,
    startListening,
    stopListening,
    processManualText,
  } = useVoiceAssistant({
    mesas,
    productos,
    tarifas,
    clientes,
    maquinas,
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim() || isProcessing) return;
    const t = manualText;
    setManualText('');
    processManualText(t);
  };

  const handleExampleClick = (ejemplo: string) => {
    if (isProcessing) return;
    processManualText(ejemplo);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#1d283a] border-[#324157] text-slate-100 p-0 overflow-hidden shadow-2xl">
        {/* Cabecera */}
        <div className="p-4 border-b border-[#324157] flex items-center justify-between bg-[#17202e]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-slate-100">
                Asistente Inteligente
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Mesas, POS de Ventas y Tragamonedas
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {isListening && (
              <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 animate-pulse text-xs">
                Escuchando...
              </Badge>
            )}
            {isSpeaking && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                Hablando...
              </Badge>
            )}
            {!isListening && !isSpeaking && !isProcessing && (
              <Badge variant="outline" className="bg-slate-700/50 text-slate-300 border-slate-600 text-xs">
                Listo
              </Badge>
            )}
          </div>
        </div>

        {/* Aviso de HTTPS para móviles si se conecta por IP local */}
        {!isSecureContext && isMobile && (
          <div className="mx-4 mt-3 p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-200 text-[11px] flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Conexión local sin SSL detectada:</span>
              Los navegadores móviles requieren HTTPS para habilitar el micrófono. Puedes escribir comandos en el campo de texto o pulsar las acciones sugeridas.
            </div>
          </div>
        )}

        {/* Cuerpo Principal */}
        <div className="p-5 flex flex-col items-center justify-center space-y-3.5">
          {/* Botón Principal de Micrófono con Onda Sensible al Sonido */}
          <div className="relative flex items-center justify-center py-1">
            {isListening && (
              <div 
                className="absolute rounded-full bg-red-500/20 transition-all duration-75 pointer-events-none"
                style={{
                  width: `${100 + audioLevel * 0.8}px`,
                  height: `${100 + audioLevel * 0.8}px`,
                }}
              />
            )}
            {isSpeaking && (
              <div className="absolute w-24 h-24 rounded-full bg-emerald-500/20 animate-pulse" />
            )}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={cn(
                'relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg cursor-pointer focus:outline-none',
                isListening
                  ? 'bg-red-500 text-white shadow-red-500/40 ring-4 ring-red-400/30 scale-105'
                  : isSpeaking
                  ? 'bg-emerald-600 text-white shadow-emerald-500/30 ring-4 ring-emerald-400/20'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30 hover:scale-105 active:scale-95'
              )}
            >
              {isProcessing ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : isListening ? (
                <Mic className="w-8 h-8 animate-bounce" />
              ) : isSpeaking ? (
                <Volume2 className="w-8 h-8 animate-pulse" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
          </div>

          {/* Indicador de entrada de sonido en vivo */}
          {isListening && (
            <div className="w-44 flex flex-col items-center gap-1">
              <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    'h-full transition-all duration-75 rounded-full',
                    audioLevel > 15 ? 'bg-emerald-400' : 'bg-blue-400'
                  )}
                  style={{ width: `${Math.max(8, audioLevel)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400">
                {audioLevel > 10 ? 'Voz detectada' : 'Esperando voz...'}
              </span>
            </div>
          )}

          <p className="text-xs text-center text-slate-300 max-w-xs font-medium">
            {isListening
              ? 'Habla ahora... escuchando instrucción.'
              : isProcessing
              ? 'Procesando instrucción...'
              : isSpeaking
              ? 'Respondiendo...'
              : 'Presiona el micrófono para hablar o escribe tu comando.'}
          </p>

          {/* Visualización de Transcripción */}
          {(transcript || interimTranscript) && (
            <div className="w-full bg-[#283244] border border-[#324157] rounded-lg p-2.5 text-xs">
              <span className="text-slate-400 text-[10px] block mb-0.5 font-medium">
                Texto reconocido:
              </span>
              <p className="text-slate-100 font-medium italic">
                "{interimTranscript || transcript}"
              </p>
            </div>
          )}

          {/* Resultado de la Última Acción */}
          {lastResult && (
            <div
              className={cn(
                'w-full rounded-lg p-3 border text-xs space-y-1 transition-all',
                lastResult.exito
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              )}
            >
              <div className="flex items-center gap-2 font-semibold">
                {lastResult.exito ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>{lastResult.exito ? 'Acción ejecutada' : 'Aviso del Asistente'}</span>
              </div>
              <p className="text-slate-200 font-normal">{lastResult.mensaje}</p>
            </div>
          )}

          {/* Error de hardware o permisos */}
          {error && (
            <div className="w-full bg-red-950/40 border border-red-500/40 rounded-lg p-2.5 text-xs text-red-200 flex items-center gap-2">
              <MicOff className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Entrada de texto manual */}
          <form onSubmit={handleManualSubmit} className="w-full flex items-center gap-2 pt-0.5">
            <Input
              type="text"
              placeholder="O escribe un comando aquí..."
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              disabled={isProcessing}
              className="bg-[#283244] border-[#324157] text-slate-100 text-xs placeholder:text-slate-500 focus-visible:ring-blue-500 h-9"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!manualText.trim() || isProcessing}
              className="bg-blue-600 hover:bg-blue-500 h-9 w-9 shrink-0 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>

          {/* Selector de Categorías de Comandos Sugeridos */}
          <div className="w-full space-y-2 pt-2 border-t border-[#324157]/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>Comandos por módulo:</span>
              </div>
              <div className="flex gap-1">
                {CATEGORIAS_COMANDOS.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = categoriaActiva === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoriaActiva(cat.id as any)}
                      className={cn(
                        'flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer',
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#283244] text-slate-400 hover:text-slate-200 hover:bg-[#324157]'
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chips de ejemplos de la categoría activa */}
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {EJEMPLOS_POR_CATEGORIA[categoriaActiva].map((ejemplo) => (
                <button
                  key={ejemplo}
                  type="button"
                  onClick={() => handleExampleClick(ejemplo)}
                  disabled={isProcessing}
                  className="text-[11px] bg-[#283244] hover:bg-[#324157] text-slate-300 border border-[#324157] rounded-md px-2 py-1 text-left transition-colors cursor-pointer"
                >
                  "{ejemplo}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
