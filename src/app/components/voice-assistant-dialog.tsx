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
import { Badge } from '@/components/ui/badge';
import {
  Mic,
  MicOff,
  Sparkles,
  Loader2,
  Volume2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  LayoutGrid,
  ShoppingCart,
  Dices,
  Info,
  ShieldAlert,
  UserPlus,
  Check,
  X,
  Cpu,
  ChevronDown,
  ChevronUp,
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
    'Inicia una hora en mesa 2 pagado de contado',
    'Agrega 30 minutos a mesa 1',
    'Traslada mesa 1 a mesa 3',
    'Cobra mesa 1 en efectivo',
    'Finaliza mesa 1 y pasa la cuenta a Juan',
    'Divide la cuenta de la mesa 1 entre 2',
    'Agrega una Coca Cola a mesa 2',
    'Elimina una cerveza de mesa 1',
  ],
  ventas: [
    'Vende una Coca Cola',
    'Venta rápida 2 cervezas en tarjeta',
    'Despacha un Verde Lukis',
    'Cobra una Coca Cola en efectivo',
    'Agrega un Casino a la cuenta de Juan',
    'Agrega una Coca Cola a Victor Hugo',
    'Abona 20 a la cuenta de Samuel',
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
  const [mostrarComandos, setMostrarComandos] = useState(false);
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
    pendingConfirmation,
    confirmPendingAction,
    cancelPendingAction,
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

  const handleExampleClick = (ejemplo: string) => {
    if (isProcessing) return;
    processManualText(ejemplo);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[92vw] max-w-sm bg-[#1d283a] border-[#324157] text-slate-100 p-0 overflow-hidden shadow-2xl rounded-2xl mx-auto">
        {/* Cabecera Minimalista Adaptada a Móvil */}
        <div className="px-4 py-3 border-b border-[#324157] flex items-center justify-between bg-[#17202e] pr-12">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-sm shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-sm sm:text-base font-semibold text-slate-100 truncate">
                Asistente de Voz
              </DialogTitle>
              <DialogDescription className="sr-only">
                Control inteligente por voz para el sistema
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isListening ? (
              <Badge variant="outline" className="bg-red-500/15 text-red-400 border-red-500/30 text-[11px] whitespace-nowrap px-2 py-0.5 animate-pulse">
                Escuchando
              </Badge>
            ) : isSpeaking ? (
              <Badge variant="outline" className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[11px] whitespace-nowrap px-2 py-0.5">
                Hablando
              </Badge>
            ) : isProcessing ? (
              <Badge variant="outline" className="bg-blue-500/15 text-blue-400 border-blue-500/30 text-[11px] whitespace-nowrap px-2 py-0.5">
                Pensando
              </Badge>
            ) : lastResult?.motorUtilizado ? (
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] px-2 py-0.5 border flex items-center gap-1 font-medium whitespace-nowrap',
                  lastResult.motorUtilizado === 'api_groq'
                    ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                )}
              >
                {lastResult.motorUtilizado === 'api_groq' ? (
                  <>
                    <Sparkles className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                    IA Groq
                  </>
                ) : (
                  <>
                    <Cpu className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                    Motor Local
                  </>
                )}
              </Badge>
            ) : null}
          </div>
        </div>

        {/* Aviso de HTTPS para móviles si se conecta por IP local */}
        {!isSecureContext && isMobile && (
          <div className="mx-4 mt-3 p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-200 text-[11px] flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Conexión local sin SSL detectada:</span>
              Los navegadores móviles requieren HTTPS para habilitar el micrófono. Conéctate vía HTTPS para utilizar el control por voz.
            </div>
          </div>
        )}

        {/* Cuerpo Principal */}
        <div className="p-6 flex flex-col items-center justify-center space-y-4">
          {/* Botón Principal Hero de Micrófono con Ondas Sensibles al Sonido */}
          <div className="relative flex items-center justify-center py-2">
            {isListening && (
              <>
                <div 
                  className="absolute rounded-full bg-red-500/15 transition-all duration-300 ease-out pointer-events-none"
                  style={{
                    width: `${116 + (audioLevel > 10 ? (audioLevel / 100) * 44 : 8)}px`,
                    height: `${116 + (audioLevel > 10 ? (audioLevel / 100) * 44 : 8)}px`,
                  }}
                />
                <div 
                  className="absolute rounded-full bg-red-500/25 transition-all duration-200 ease-out pointer-events-none"
                  style={{
                    width: `${98 + (audioLevel > 10 ? (audioLevel / 100) * 22 : 4)}px`,
                    height: `${98 + (audioLevel > 10 ? (audioLevel / 100) * 22 : 4)}px`,
                  }}
                />
              </>
            )}
            {isSpeaking && (
              <div className="absolute w-28 h-28 rounded-full bg-emerald-500/20 animate-pulse pointer-events-none" />
            )}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={cn(
                'relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl cursor-pointer focus:outline-none',
                isListening
                  ? 'bg-red-500 text-white shadow-red-500/50 ring-4 ring-red-400/40 scale-105'
                  : isSpeaking
                  ? 'bg-emerald-600 text-white shadow-emerald-500/40 ring-4 ring-emerald-400/30'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/40 hover:scale-105 active:scale-95'
              )}
            >
              {isProcessing ? (
                <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin" />
              ) : isListening ? (
                <Mic className={cn("w-10 h-10 sm:w-12 sm:h-12 transition-transform duration-200", audioLevel > 15 && "scale-110")} />
              ) : isSpeaking ? (
                <Volume2 className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse" />
              ) : (
                <Mic className="w-10 h-10 sm:w-12 sm:h-12" />
              )}
            </button>
          </div>

          {/* Indicador de entrada de sonido en vivo */}
          {isListening && (
            <div className="w-48 flex flex-col items-center gap-1.5">
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                <div 
                  className={cn(
                    'h-full transition-all duration-200 ease-out rounded-full',
                    audioLevel > 15 ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-slate-500/30'
                  )}
                  style={{ width: `${Math.max(0, audioLevel)}%` }}
                />
              </div>
              <span className={cn("text-[10px] transition-colors duration-200", audioLevel > 15 ? "text-emerald-400 font-medium" : "text-slate-400")}>
                {audioLevel > 15 ? 'Voz detectada' : 'Esperando tu voz...'}
              </span>
            </div>
          )}

          <p className="text-sm text-center text-slate-200 font-medium">
            {isListening
              ? 'Habla ahora... escuchando'
              : isProcessing
              ? 'Interpretando comando...'
              : isSpeaking
              ? 'Respondiendo...'
              : 'Toca el micrófono para hablar'}
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

          {/* Tarjeta de Confirmación (Creación de cliente u otra acción que requiera aprobación) */}
          {pendingConfirmation && (
            <div className="w-full rounded-xl p-3.5 bg-amber-950/40 border-2 border-amber-500/60 text-amber-200 text-xs space-y-3 shadow-lg shadow-amber-950/30 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5 border border-amber-500/30">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-amber-300 block text-xs tracking-wide">
                    {pendingConfirmation.tipo === 'CREAR_CLIENTE_Y_PASAR_MESA'
                      ? '¿REGISTRAR CLIENTE Y PASAR CUENTA?'
                      : '¿REGISTRAR CLIENTE Y CARGAR PEDIDO?'}
                  </span>
                  <p className="text-slate-200 text-xs leading-relaxed">
                    El cliente <span className="font-bold text-amber-300 underline underline-offset-2">"{pendingConfirmation.nombreCliente}"</span> no existe en la base de datos.
                  </p>
                  <p className="text-[11px] text-amber-200/90 font-medium">
                    {pendingConfirmation.detalles}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-amber-500/30">
                <Button
                  type="button"
                  size="sm"
                  disabled={isProcessing}
                  onClick={() => confirmPendingAction()}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-8 gap-1.5 shadow-md shadow-emerald-900/30"
                >
                  <Check className="w-3.5 h-3.5" />
                  Crear y Aplicar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isProcessing}
                  onClick={() => cancelPendingAction()}
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white font-medium text-xs h-8 gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancelar
                </Button>
              </div>

              <div className="text-[10px] text-center text-slate-400 bg-[#1f293d] rounded py-1 px-2 border border-slate-700/60">
                O responde por voz diciendo <span className="text-emerald-400 font-bold">"Sí"</span> o <span className="text-red-400 font-bold">"No"</span>.
              </div>
            </div>
          )}

          {/* Resultado de la Última Acción */}
          {lastResult && !pendingConfirmation && (
            <div
              className={cn(
                'w-full rounded-lg p-3 border text-xs space-y-1 transition-all',
                lastResult.exito
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              )}
            >
              <div className="flex items-center justify-between gap-2 font-semibold">
                <div className="flex items-center gap-2">
                  {lastResult.exito ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <span>{lastResult.exito ? 'Acción ejecutada' : 'Aviso del Asistente'}</span>
                </div>
                {lastResult.motorUtilizado && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] px-1.5 py-0 font-medium tracking-wide flex items-center gap-1',
                      lastResult.motorUtilizado === 'api_groq'
                        ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/40'
                        : 'bg-amber-500/15 text-amber-300 border-amber-400/40'
                    )}
                  >
                    {lastResult.motorUtilizado === 'api_groq' ? (
                      <>
                        <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                        IA Groq (API)
                      </>
                    ) : (
                      <>
                        <Cpu className="w-2.5 h-2.5 text-amber-400" />
                        Motor Local (Offline)
                      </>
                    )}
                  </Badge>
                )}
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

          {/* Guía de Comandos Sugeridos por Módulo (Colapsable, Oculto por defecto) */}
          <div className="w-full pt-1 border-t border-[#324157]/50">
            <button
              type="button"
              onClick={() => setMostrarComandos(!mostrarComandos)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#243044]/60 hover:bg-[#28364c] text-slate-300 hover:text-white transition-all text-xs font-medium cursor-pointer border border-[#324157]/40"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>Comandos sugeridos por módulo</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <span>{mostrarComandos ? 'Ocultar' : 'Mostrar'}</span>
                {mostrarComandos ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </button>

            {mostrarComandos && (
              <div className="space-y-2.5 pt-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                {/* Selector de Categorías de Módulos */}
                <div className="flex flex-wrap gap-1">
                  {CATEGORIAS_COMANDOS.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = categoriaActiva === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoriaActiva(cat.id as any)}
                        className={cn(
                          'flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer',
                          isActive
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/30'
                            : 'bg-[#283244] text-slate-400 hover:text-slate-200 hover:bg-[#324157]'
                        )}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Chips de ejemplos de la categoría activa */}
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {EJEMPLOS_POR_CATEGORIA[categoriaActiva].map((ejemplo) => (
                    <button
                      key={ejemplo}
                      type="button"
                      onClick={() => handleExampleClick(ejemplo)}
                      disabled={isProcessing}
                      className="text-[11px] bg-[#283244] hover:bg-[#324157] text-slate-300 border border-[#324157] rounded-md px-2.5 py-1 text-left transition-colors cursor-pointer active:scale-95"
                    >
                      "{ejemplo}"
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
