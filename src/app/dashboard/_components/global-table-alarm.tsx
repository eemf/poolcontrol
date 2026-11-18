'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { collection, doc, query, updateDoc, where } from 'firebase/firestore';
import { Timer, Check } from 'lucide-react';
import { useCollection, useMemoFirebase, useFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { toDate } from '@/lib/firebase/servicios/utils';
import type { Mesa } from '@/lib/tipos';

interface GlobalTableAlarmProps {
  userId?: string;
  sucursalId?: string | null;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

/**
 * Componente aislado para monitorear alarmas de mesas con tiempo definido.
 * Mantiene el ticker de 1s encapsulado aquí para evitar re-renderizar todo el LayoutDashboard y el menú.
 */
export const GlobalTableAlarm = React.memo(function GlobalTableAlarm({
  userId,
  sucursalId,
  audioRef,
}: GlobalTableAlarmProps) {
  const { firestore } = useFirebase();
  const [serverOffset, setServerOffset] = useState(0);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [ackedAlarmIds, setAckedAlarmIds] = useState<Record<string, number>>({});
  const alarmTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const mesasQuery = useMemoFirebase(() => {
    if (!firestore || !userId || !sucursalId) return null;
    return query(
      collection(firestore, `sucursales/${sucursalId}/mesas_de_billar`),
      where('estado', '==', 'ocupado')
    );
  }, [firestore, userId, sucursalId]);

  const { data: mesasOcupadas } = useCollection<Mesa>(mesasQuery);
  const hasActiveDefinedTable = useMemo(
    () => Boolean(mesasOcupadas?.some((m) => m.modoJuego === 'definido' && !m.alarmaAck)),
    [mesasOcupadas]
  );

  // Solo activar el intervalo de 1 segundo cuando realmente hay mesas de tiempo definido activas
  useEffect(() => {
    if (!hasActiveDefinedTable) return;
    setCurrentTime(Date.now());
    const ticker = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(ticker);
  }, [hasActiveDefinedTable]);

  const syncTime = useCallback(async () => {
    try {
      const start = Date.now();
      const response = await fetch(`${window.location.origin}/?t=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-cache',
      }).catch(() => null);

      if (response && response.ok) {
        const serverDateStr = response.headers.get('date');
        if (serverDateStr) {
          const serverDate = new Date(serverDateStr);
          const end = Date.now();
          const rtt = end - start;
          const estimatedServerTimeAtEnd = serverDate.getTime() + rtt / 2;
          setServerOffset(estimatedServerTimeAtEnd - end);
        }
      }
    } catch (e) {
      console.warn('Time sync info:', e);
    }
  }, []);

  useEffect(() => {
    if (!hasActiveDefinedTable) return;
    syncTime();
    const interval = setInterval(syncTime, 60000);
    return () => clearInterval(interval);
  }, [hasActiveDefinedTable, syncTime]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (hasActiveDefinedTable) syncTime();
        setTimeout(() => setIsWakingUp(false), 3000);
      } else {
        setIsWakingUp(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [hasActiveDefinedTable, syncTime]);

  useEffect(() => {
    if (!mesasOcupadas) return;
    setAckedAlarmIds((prev) => {
      const next = { ...prev };
      let changed = false;
      Object.keys(next).forEach((id) => {
        const m = mesasOcupadas.find((x) => x.id === id);
        const fInicio = m?.horaInicio ? toDate(m.horaInicio).getTime() : 0;
        if (!m || m.alarmaAck || fInicio !== next[id]) {
          delete next[id];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [mesasOcupadas]);

  const mesasEnAlarma = useMemo(() => {
    if (!mesasOcupadas || isWakingUp) return [];
    const ahoraSincronizada = currentTime + serverOffset;
    return mesasOcupadas.filter((mesa) => {
      if (mesa.modoJuego !== 'definido' || mesa.alarmaAck || !mesa.horaInicio || !mesa.tiempoDefinido) {
        return false;
      }
      const fechaInicio = toDate(mesa.horaInicio);
      if (fechaInicio.getTime() <= 0) return false;
      if (ackedAlarmIds[mesa.id] === fechaInicio.getTime()) return false;
      const fechaFinMillis = fechaInicio.getTime() + mesa.tiempoDefinido * 1000;
      return ahoraSincronizada >= fechaFinMillis;
    });
  }, [mesasOcupadas, serverOffset, isWakingUp, currentTime, ackedAlarmIds]);

  const handleAudioEnded = useCallback(() => {
    if (mesasEnAlarma.length > 0) {
      alarmTimeoutRef.current = setTimeout(() => {
        if (mesasEnAlarma.length > 0 && audioRef.current) {
          audioRef.current.play().catch((e) => console.error('Error replay:', e));
        }
      }, 3000);
    }
  }, [mesasEnAlarma.length, audioRef]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    if (mesasEnAlarma.length > 0) {
      if (!isAlarmPlaying) {
        setIsAlarmPlaying(true);
        audioElement.play().catch((e) => console.error('Error playback:', e));
      }
    } else {
      setIsAlarmPlaying(false);
      audioElement.pause();
      audioElement.currentTime = 0;
      if (alarmTimeoutRef.current) {
        clearTimeout(alarmTimeoutRef.current);
        alarmTimeoutRef.current = null;
      }
    }
  }, [mesasEnAlarma.length, isAlarmPlaying, audioRef]);

  const handleAcceptAlert = useCallback(async () => {
    if (mesasEnAlarma.length === 0 || !firestore || !sucursalId) return;
    const mesaActual = mesasEnAlarma[0];
    const inicioMillis = mesaActual.horaInicio ? toDate(mesaActual.horaInicio).getTime() : 0;

    setAckedAlarmIds((prev) => ({ ...prev, [mesaActual.id]: inicioMillis }));

    const mesaRef = doc(firestore, `sucursales/${sucursalId}/mesas_de_billar`, mesaActual.id);
    try {
      await updateDoc(mesaRef, { alarmaAck: true });
    } catch (error) {
      console.error('Error acknowledging alarm:', error);
    }
  }, [mesasEnAlarma, firestore, sucursalId]);

  useEffect(() => {
    if (mesasEnAlarma.length === 0) return;
    const handleKeyDownCapture = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        handleAcceptAlert();
      }
    };
    window.addEventListener('keydown', handleKeyDownCapture, true);
    return () => window.removeEventListener('keydown', handleKeyDownCapture, true);
  }, [mesasEnAlarma.length, handleAcceptAlert]);

  const primeraMesaEnAlarma = mesasEnAlarma[0];

  return (
    <>
      <audio ref={audioRef} src="/alarm.mp3" preload="auto" onEnded={handleAudioEnded} />
      {primeraMesaEnAlarma && (
        <div
          data-global-alert="true"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[100] pointer-events-auto flex items-center justify-center bg-black/75 backdrop-blur-[2px] p-4 font-body animate-in fade-in duration-150"
        >
          <div
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-xl sm:rounded-lg bg-[#1e1e1e] border border-[#2e2e2e] text-slate-100 p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <Timer className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0">
                <h3 className="font-headline text-base font-bold text-slate-100 leading-tight">
                  ¡Tiempo Culminado!
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  El tiempo para la sesión de juego de la{' '}
                  <strong className="text-slate-100 font-semibold">
                    {primeraMesaEnAlarma.tipoDeMesa === 'Consola' ? 'Consola' : 'Mesa'} #
                    {primeraMesaEnAlarma.numeroMesa}
                  </strong>{' '}
                  ha finalizado.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-0.5">
              <Button
                type="button"
                onClick={handleAcceptAlert}
                className="rounded-full h-9 px-6 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md"
              >
                <Check className="mr-1.5 h-3.5 w-3.5" />
                Entendido
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

