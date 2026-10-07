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
} from 'lucide-react';
import { useVoiceAssistant, type UseVoiceAssistantProps } from '@/hooks/use-voice-assistant';
import { cn } from '@/lib/utils';

import type { Mesa, Producto, ProductoVirtual, Tarifa } from '@/lib/tipos';

export interface VoiceAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mesas?: Mesa[];
  productos?: (Producto | ProductoVirtual)[];
  tarifas?: Tarifa[];
  clientes?: string[];
}

export default function VoiceAssistantDialog({
  open,
  onOpenChange,
  mesas,
  productos,
  tarifas,
  clientes,
}: VoiceAssistantDialogProps) {
  const [manualText, setManualText] = useState('');

  const {
    isSupported,
    isListening,
    isProcessing,
    isSpeaking,
    transcript,
    interimTranscript,
    lastAction,
    lastResult,
    error,
    startListening,
    stopListening,
    stopSpeaking,
    processManualText,
  } = useVoiceAssistant({
    mesas,
    productos,
    tarifas,
    clientes,
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
        <div className="p-5 border-b border-[#324157] flex items-center justify-between bg-[#17202e]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-slate-100">
                Asistente Inteligente
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Control de mesas, consumos y consultas por voz
              </DialogDescription>
            </div>
          </div>

          <div>
            {isListening && (
              <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 animate-pulse text-xs">
                Escuchando...
              </Badge>
            )}
            {isProcessing && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs">
                Procesando con IA...
              </Badge>
            )}
            {isSpeaking && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                Respondiendo...
              </Badge>
            )}
            {!isListening && !isProcessing && !isSpeaking && (
              <Badge variant="outline" className="bg-slate-700/50 text-slate-300 border-slate-600 text-xs">
                Listo
              </Badge>
            )}
          </div>
        </div>

        {/* Cuerpo Principal */}
        <div className="p-6 flex flex-col items-center justify-center space-y-5">
          {/* Botón Principal de Micrófono */}
          <div className="relative flex items-center justify-center">
            {isListening && (
              <div className="absolute w-28 h-28 rounded-full bg-blue-500/20 animate-ping" />
            )}
            {isSpeaking && (
              <div className="absolute w-28 h-28 rounded-full bg-emerald-500/20 animate-pulse" />
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

          <p className="text-xs text-center text-slate-300 max-w-xs font-medium">
            {isListening
              ? 'Te escucho... habla con naturalidad.'
              : isProcessing
              ? 'Interpretando comando con Gemini...'
              : isSpeaking
              ? 'Hablando respuesta...'
              : 'Presiona el micrófono para dar una orden o hacer una pregunta.'}
          </p>

          {/* Visualización de Transcripción */}
          {(transcript || interimTranscript) && (
            <div className="w-full bg-[#283244] border border-[#324157] rounded-lg p-3 text-sm">
              <span className="text-slate-400 text-xs block mb-1 font-medium">
                Voz detectada:
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
                'w-full rounded-lg p-3.5 border text-xs space-y-1.5 transition-all',
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
            <div className="w-full bg-red-950/40 border border-red-500/40 rounded-lg p-3 text-xs text-red-200 flex items-center gap-2">
              <MicOff className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Entrada de texto alternativa para pruebas o ambientes ruidosos */}
          <form onSubmit={handleManualSubmit} className="w-full flex items-center gap-2 pt-1">
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

          {/* Sugerencias Rápidas */}
          <div className="w-full space-y-2 pt-2 border-t border-[#324157]/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>Comandos sugeridos para probar:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Inicia tiempo libre en la Mesa 1',
                'Agrega una Coca Cola a la Mesa 2',
                'Cárgale un Casino a la cuenta de Juan',
                '¿Cómo va la Mesa 1?',
              ].map((ejemplo) => (
                <button
                  key={ejemplo}
                  type="button"
                  onClick={() => handleExampleClick(ejemplo)}
                  disabled={isProcessing}
                  className="text-[11px] bg-[#283244] hover:bg-[#324157] text-slate-300 border border-[#324157] rounded-md px-2.5 py-1 text-left transition-colors cursor-pointer"
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
