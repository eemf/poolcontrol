'use client';

/**
 * @fileOverview Hook de React para reconocimiento de voz, síntesis vocal y orquestación con el Asistente de IA.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useFirebase, useUser } from '@/firebase';
import { useSucursal } from '@/hooks/use-sucursal';
import type { Mesa, Producto, ProductoVirtual, Tarifa } from '@/lib/tipos';
import { procesarComandoVoz, type AsistenteVozOutput } from '@/ai/flows/asistente-voz';
import { ejecutarAccionVoz, type ResultadoEjecucionVoz } from '@/lib/firebase/servicios/asistente-voz-ejecutor';
import { useToast } from '@/hooks/use-toast';

export interface UseVoiceAssistantProps {
  mesas?: Mesa[];
  productos?: (Producto | ProductoVirtual)[];
  tarifas?: Tarifa[];
  clientes?: string[];
}

export function useVoiceAssistant({
  mesas = [],
  productos = [],
  tarifas = [],
  clientes = [],
}: UseVoiceAssistantProps = {}) {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { sucursalId } = useSucursal();
  const { toast } = useToast();

  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [lastAction, setLastAction] = useState<AsistenteVozOutput | null>(null);
  const [lastResult, setLastResult] = useState<ResultadoEjecucionVoz | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Inicializar Web Speech API en el cliente
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'es-419'; // Español latinoamericano

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setInterimTranscript('');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (interim) setInterimTranscript(interim);
        if (final) {
          setTranscript(final);
          setInterimTranscript('');
          handleProcessVoice(final);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Error en reconocimiento de voz:', event.error);
        if (event.error !== 'no-speech') {
          setError(`Error de micrófono: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Función de síntesis de voz (Text-to-Speech)
  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Detener cualquier audio previo
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-419';
    utterance.rate = 1.05; // Ritmo ágil y natural
    utterance.pitch = 1.0;

    // Buscar voz en español disponible en el sistema
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith('es'));
    if (esVoice) {
      utterance.voice = esVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  // Detener voz
  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Iniciar escucha del micrófono
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast({
        title: 'Micrófono no compatible',
        description: 'Tu navegador no soporta reconocimiento de voz nativo. Puedes usar Chrome o Edge.',
        variant: 'destructive',
      });
      return;
    }

    stopSpeaking();
    setTranscript('');
    setInterimTranscript('');
    setError(null);

    try {
      recognitionRef.current.start();
    } catch (e: any) {
      console.warn('Recognition start error:', e);
      // Si ya estaba activo, reiniciar
      try {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current?.start(), 150);
      } catch {
        // Ignore
      }
    }
  }, [stopSpeaking, toast]);

  // Detener escucha
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }
    setIsListening(false);
  }, []);

  // Procesar transcripción con IA y ejecutar acción
  const handleProcessVoice = useCallback(
    async (textParaProcesar: string) => {
      const textoLimpio = textParaProcesar.trim();
      if (!textoLimpio) return;

      if (!firestore || !sucursalId) {
        toast({
          title: 'Sucursal no disponible',
          description: 'Debes estar conectado a una sucursal para usar el asistente.',
          variant: 'destructive',
        });
        return;
      }

      setIsProcessing(true);
      setError(null);

      try {
        // Preparar contexto reducido para la IA
        const mesasCtx = mesas.map(m => ({
          id: m.id,
          numeroMesa: m.numeroMesa,
          tipoDeMesa: m.tipoDeMesa,
          estado: m.estado,
          modoJuego: m.modoJuego || null,
          clienteNombre: m.nombreCliente || null,
          consumosCount: m.consumos?.length || 0,
        }));

        const productosNombres = productos.map(p => p.nombre);

        // 1. Interpretar con Genkit / Gemini
        const decisionIA = await procesarComandoVoz({
          transcripcion: textoLimpio,
          mesasContexto: mesasCtx,
          productosNombres: productosNombres.slice(0, 150),
          clientesNombres: clientes.slice(0, 50),
        });

        setLastAction(decisionIA);

        // 2. Ejecutar la acción si requiere cambios transaccionales
        const resultado = await ejecutarAccionVoz(
          firestore,
          sucursalId,
          user?.uid || 'asistente_voz',
          decisionIA,
          {
            mesas,
            productos,
            tarifas,
          }
        );

        setLastResult(resultado);

        // 3. Responder por voz
        if (resultado.mensajeVoz) {
          speak(resultado.mensajeVoz);
        }

        // 4. Notificación visual tipo Toast respetando reglas (5 segundos)
        toast({
          title: resultado.exito ? 'Asistente de Voz' : 'Aviso del Asistente',
          description: resultado.mensaje,
          variant: resultado.exito ? 'default' : 'destructive',
          duration: 5000,
        });
      } catch (err: any) {
        console.error('Error procesando comando de voz:', err);
        const msjError = err.message || 'Error al procesar el comando.';
        setError(msjError);
        speak('Ocurrió un inconveniente al procesar la solicitud.');
        toast({
          title: 'Error de Asistente',
          description: msjError,
          variant: 'destructive',
          duration: 5000,
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [firestore, sucursalId, user, mesas, productos, tarifas, clientes, speak, toast]
  );

  return {
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
    speak,
    stopSpeaking,
    processManualText: handleProcessVoice,
  };
}
