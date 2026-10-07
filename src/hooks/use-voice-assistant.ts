'use client';

/**
 * @fileOverview Hook de React para reconocimiento de voz multi-dispositivo (Escritorio, Tablets y Móviles),
 * medición de volumen acústico y orquestación integral con el Asistente de IA y Motor Local.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useFirebase, useUser } from '@/firebase';
import { useSucursal } from '@/hooks/use-sucursal';
import type { Mesa, Producto, ProductoVirtual, Tarifa, GeneralesTragamonedas } from '@/lib/tipos';
import { procesarComandoVoz, type AsistenteVozOutput } from '@/ai/flows/asistente-voz';
import { ejecutarAccionVoz, type ResultadoEjecucionVoz } from '@/lib/firebase/servicios/asistente-voz-ejecutor';
import { useToast } from '@/hooks/use-toast';

export interface UseVoiceAssistantProps {
  mesas?: Mesa[];
  productos?: (Producto | ProductoVirtual)[];
  tarifas?: Tarifa[];
  clientes?: string[];
  maquinas?: GeneralesTragamonedas[];
}

export function useVoiceAssistant({
  mesas = [],
  productos = [],
  tarifas = [],
  clientes = [],
  maquinas = [],
}: UseVoiceAssistantProps = {}) {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { sucursalId } = useSucursal();
  const { toast } = useToast();

  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); // Nivel de 0 a 100 para onda visual
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [lastAction, setLastAction] = useState<AsistenteVozOutput | null>(null);
  const [lastResult, setLastResult] = useState<ResultadoEjecucionVoz | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSecureContext, setIsSecureContext] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Referencias para evitar Stale Closures
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const accumulatedTextRef = useRef<string>('');
  const isProcessingRef = useRef<boolean>(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handleProcessVoiceRef = useRef<(text: string) => Promise<void>>(() => Promise.resolve());

  // Detección de dispositivo móvil/tablet
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mobileDetected = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);
    setIsMobile(!!mobileDetected);

    const secure = window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    setIsSecureContext(!!secure);
  }, []);

  // Función de síntesis de voz (Text-to-Speech)
  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith('es'));
    if (esVoice) utterance.voice = esVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Procesar transcripción con IA y ejecutar acción
  const handleProcessVoice = useCallback(
    async (textParaProcesar: string) => {
      const textoLimpio = textParaProcesar.trim();
      if (!textoLimpio || isProcessingRef.current) return;

      if (!firestore || !sucursalId) {
        toast({
          title: 'Sucursal no disponible',
          description: 'Debes estar conectado a una sucursal para usar el asistente.',
          variant: 'destructive',
        });
        return;
      }

      isProcessingRef.current = true;
      setIsProcessing(true);
      setError(null);

      // Limpiar texto acumulado
      accumulatedTextRef.current = '';

      try {
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
        const maquinasCtx = maquinas.map(m => ({
          id: m.id,
          nombre: m.nombre,
          totalBase: m.totalBase || 0,
          totalExtraccion: m.totalExtraccion || 0,
          totalDeuda: m.totalDeuda || 0,
        }));

        // 1. Interpretar comando (IA Gemini 3.8 Flash o Motor Local NLP integrado)
        const decisionIA = await procesarComandoVoz({
          transcripcion: textoLimpio,
          mesasContexto: mesasCtx,
          productosNombres,
          clientesNombres: clientes,
          maquinasContexto: maquinasCtx,
        });

        setLastAction(decisionIA);

        // 2. Ejecutar acción de forma atómica en Firestore
        const resultado = await ejecutarAccionVoz(
          firestore,
          sucursalId,
          user?.uid || 'operador',
          decisionIA,
          {
            mesas,
            productos,
            tarifas,
            clientes,
            maquinas,
          }
        );

        setLastResult(resultado);

        // 3. Respuesta por voz
        if (resultado.mensajeVoz) {
          speak(resultado.mensajeVoz);
        }

        // 4. Notificación visual
        toast({
          title: resultado.exito ? 'Asistente de Voz' : 'Aviso del Asistente',
          description: resultado.mensaje,
          variant: resultado.exito ? 'default' : 'destructive',
          duration: 5000,
        });
      } catch (err: any) {
        console.error('Error al procesar comando de voz:', err);
        const errMsg = err?.message || 'Error desconocido al procesar comando.';
        setError(errMsg);
        speak('Ocurrió un error al procesar tu solicitud.');
        toast({
          title: 'Error del Asistente',
          description: errMsg,
          variant: 'destructive',
          duration: 5000,
        });
      } finally {
        isProcessingRef.current = false;
        setIsProcessing(false);
      }
    },
    [firestore, sucursalId, user, mesas, productos, tarifas, clientes, maquinas, speak, toast]
  );

  useEffect(() => {
    handleProcessVoiceRef.current = handleProcessVoice;
  }, [handleProcessVoice]);

  // Medición de volumen para escritorio (en móviles se omite getUserMedia para no bloquear el hardware del micrófono)
  const stopAudioAnalyser = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {
        // Ignore
      }
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  const startAudioAnalyser = useCallback(async () => {
    try {
      if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(normalized);

        animFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (err: any) {
      console.warn('No se pudo iniciar el analizador de volumen de audio:', err);
    }
  }, []);

  // Inicializar Web Speech API con adaptación multiplataforma
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();

      // En móviles (Android/iOS), continuous = false es el estándar nativo para evitar cuelgues o cierres instantáneos
      const mobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);

      recognition.continuous = !mobileDevice;
      recognition.interimResults = true;

      // Detección de idioma preferido (español)
      const userLang = navigator.language || 'es-GT';
      recognition.lang = userLang.startsWith('es') ? userLang : 'es-ES';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setInterimTranscript('');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }

        const fullCaptured = (final || interim).trim();
        if (interim) setInterimTranscript(interim);
        if (fullCaptured) {
          accumulatedTextRef.current = fullCaptured;
          setTranscript(fullCaptured);

          // En móvil, animar ondas de volumen reactivas al texto
          if (mobileDevice) {
            setAudioLevel(Math.min(95, Math.max(30, fullCaptured.length * 6)));
          }
        }

        // Si se detecta pausa tras hablar, disparar procesamiento automático
        if (fullCaptured.length > 2) {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (accumulatedTextRef.current.trim() && !isProcessingRef.current) {
              const textToSend = accumulatedTextRef.current;
              stopListening();
              handleProcessVoiceRef.current(textToSend);
            }
          }, 1400);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Aviso de reconocimiento de voz:', event.error);
        if (event.error === 'not-allowed') {
          setError('Permiso de micrófono denegado. Permite el acceso en el navegador.');
        } else if (event.error === 'audio-capture') {
          setError('El micrófono no está disponible o está en uso por otra aplicación.');
        } else if (event.error !== 'no-speech') {
          setError(`Aviso de micrófono: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        stopAudioAnalyser();

        const textoPendiente = accumulatedTextRef.current.trim();
        if (textoPendiente && !isProcessingRef.current) {
          handleProcessVoiceRef.current(textoPendiente);
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
      }
      stopAudioAnalyser();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stopAudioAnalyser]);

  // Iniciar escucha del micrófono
  const startListening = useCallback(async () => {
    if (!recognitionRef.current) {
      toast({
        title: 'Micrófono no compatible',
        description: 'Tu navegador no soporta reconocimiento de voz nativo. Se recomienda Chrome o Edge.',
        variant: 'destructive',
      });
      return;
    }

    stopSpeaking();
    setTranscript('');
    setInterimTranscript('');
    accumulatedTextRef.current = '';
    setError(null);

    // En escritorio iniciamos analizador acústico; en móviles no para evitar bloqueo exclusivo del hardware
    const mobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);

    if (!mobileDevice) {
      await startAudioAnalyser();
    } else {
      setAudioLevel(35);
    }

    try {
      recognitionRef.current.start();
    } catch (e: any) {
      console.warn('Recognition start error:', e);
      try {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current?.start(), 150);
      } catch {
        // Ignore
      }
    }
  }, [stopSpeaking, startAudioAnalyser, toast]);

  // Detener escucha manualmente y procesar
  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    stopAudioAnalyser();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }
    setIsListening(false);

    const textoFinal = accumulatedTextRef.current.trim();
    if (textoFinal && !isProcessingRef.current) {
      handleProcessVoiceRef.current(textoFinal);
    }
  }, [stopAudioAnalyser]);

  // Enviar comando directamente por texto
  const processCustomText = useCallback(
    async (customText: string) => {
      await handleProcessVoice(customText);
    },
    [handleProcessVoice]
  );

  return {
    isSupported,
    isListening,
    isProcessing,
    isSpeaking,
    isSecureContext,
    isMobile,
    audioLevel,
    transcript,
    interimTranscript,
    lastAction,
    lastResult,
    error,
    startListening,
    stopListening,
    stopSpeaking,
    processCustomText,
    processManualText: processCustomText,
  };
}
