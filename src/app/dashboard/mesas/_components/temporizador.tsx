'use client';
import { useState, useEffect } from 'react';
import { toDate } from '@/lib/firebase/servicios/utils';

/**
 * Formatea segundos totales en formato HH:MM:SS.
 */
const formatSeconds = (totalSeconds: number): string => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const horas = Math.floor(safeSeconds / 3600);
  const minutos = Math.floor((safeSeconds % 3600) / 60);
  const segundos = Math.floor(safeSeconds % 60);

  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
};

interface MesaTemporizadorProps {
  horaInicio: any;
  horaFin?: any; 
  modoJuego?: 'libre' | 'definido';
  estado: string;
  tiempoDefinido?: number; 
  serverOffset?: number;
}

/**
 * Componente que muestra un cronómetro sincronizado basado en la hora del servidor.
 * UTILIZA HORA_INICIO + TIEMPO_DEFINIDO COMO ÚNICA FUENTE DE VERDAD.
 */
export default function MesaTemporizador({ 
  horaInicio, 
  modoJuego, 
  estado, 
  tiempoDefinido,
  serverOffset = 0 
}: MesaTemporizadorProps) {
  const [displaySeconds, setDisplaySeconds] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (estado !== 'ocupado') {
      setDisplaySeconds(0);
      setIsSyncing(false);
      return;
    }

    const updateTimer = () => {
      const ahoraSincronizada = Date.now() + serverOffset;
      const fechaInicio = toDate(horaInicio);
      
      // Si no hay fecha de inicio o es inválida, estamos sincronizando
      if (fechaInicio.getTime() <= 0) {
          setIsSyncing(true);
          return;
      }
      setIsSyncing(false);

      // LÓGICA ESTRICTA POR MODO DE JUEGO
      if (modoJuego === 'definido') {
        // En modo definido, el tiempoDefinido es obligatorio. 
        // Si no está presente temporalmente, no caer en el conteo de tiempo libre.
        if (tiempoDefinido) {
          const fechaFinMillis = fechaInicio.getTime() + (tiempoDefinido * 1000);
          const diff = (fechaFinMillis - ahoraSincronizada) / 1000;
          // CAP: Nunca permitir que un tiempo definido cuente hacia arriba tras llegar a cero.
          setDisplaySeconds(Math.max(0, diff));
        } else {
          // Si es definido pero no hay duración aún, mostrar cero para evitar saltos.
          setDisplaySeconds(0);
        }
      } else {
        // Tiempo Libre: Ahora - Inicio. Siempre cuenta hacia arriba.
        const diff = (ahoraSincronizada - fechaInicio.getTime()) / 1000;
        setDisplaySeconds(Math.max(0, diff));
      }
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);
    
    return () => clearInterval(intervalId);
  }, [horaInicio, modoJuego, estado, tiempoDefinido, serverOffset]);

  if (estado === 'ocupado' && isSyncing) {
    return <span className="text-sm font-medium animate-pulse text-muted-foreground">Sincronizando...</span>;
  }

  return (
    <span className="font-headline tabular-nums">
      {formatSeconds(displaySeconds)}
    </span>
  );
}
