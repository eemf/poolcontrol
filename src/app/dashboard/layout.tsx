'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Header } from "@/app/components/header"
import {
  Sidebar,
  SidebarProvider,
} from "@/components/ui/sidebar"
import DashboardNav from "@/app/components/dashboard-nav"
import { useUser, useCollection, useMemoFirebase, useDoc } from '@/firebase'
import { SESION_ACTIVA_KEY } from '@/firebase/provider'
import { Loader2, AlertTriangle, CalendarX, ShieldAlert, CloudOff, RefreshCw, LogOut, Timer, Check } from 'lucide-react'
import { collection, doc, query, updateDoc, where, Timestamp } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { useFirebase } from '@/firebase'
import type { Mesa, Sucursal } from '@/lib/tipos'
import { useSucursal } from '@/hooks/use-sucursal'
import { differenceInDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { toDate } from '@/lib/firebase/servicios/utils'

export default function LayoutDashboard({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isUserLoading, profile, isAdmin } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const { firestore, auth } = useFirebase();
  const { sucursalId, isLoading: isLoadingSucursalId } = useSucursal();

  // --- Monitoreo de Suscripción ---
  const sucursalRef = useMemoFirebase(() => 
    (firestore && sucursalId) ? doc(firestore, 'sucursales', sucursalId) : null
  , [firestore, sucursalId]);
  const { data: sucursalData, isLoading: isLoadingSucursalData } = useDoc<Sucursal>(sucursalRef);

  const subInfo = useMemo(() => {
    if (!sucursalData?.suscripcion) return { isValid: true, isExpiringSoon: false };
    const sub = sucursalData.suscripcion;
    const vencimiento = toDate(sub.fechaVencimiento);
    const ahora = new Date();
    
    const isValid = sub.estado === 'activo' && vencimiento > ahora;
    const daysRemaining = differenceInDays(vencimiento, ahora);
    const isExpiringSoon = isValid && daysRemaining <= 5;

    return { isValid, isExpiringSoon, daysRemaining, sub };
  }, [sucursalData]);

  // --- Lógica de Redirección Inteligente ---
  useEffect(() => {
    if (!isUserLoading && user) {
      // Si es admin pero no tiene sucursal seleccionada, enviarlo a elegir una
      if (isAdmin && !sucursalId && !isLoadingSucursalId && !pathname.startsWith('/admin-success')) {
        router.push('/admin-success/sucursales');
      }
    }
  }, [isAdmin, sucursalId, isLoadingSucursalId, isUserLoading, user, router, pathname]);

  // --- Lógica de Salida ---
  const handleLogout = async () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(SESION_ACTIVA_KEY);
      }
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      router.push('/login');
    }
  };

  // --- Lógica de Alarmas de Mesas Sincronizada ---
  const [serverOffset, setServerOffset] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now()); 
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const alarmTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInteracted = useRef(false);

  useEffect(() => {
    const ticker = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(ticker);
  }, []);

  const syncTime = useCallback(async () => {
    try {
      const samples = [];
      for(let i = 0; i < 3; i++) {
        const start = Date.now();
        const response = await fetch(`${window.location.origin}/?t=${Date.now()}`, { 
          method: 'HEAD', 
          cache: 'no-cache' 
        }).catch(() => null);

        if (response && response.ok) {
          const serverDateStr = response.headers.get('date');
          if (serverDateStr) {
            const serverDate = new Date(serverDateStr);
            const end = Date.now();
            const rtt = end - start;
            const estimatedServerTimeAtEnd = serverDate.getTime() + (rtt / 2);
            samples.push(estimatedServerTimeAtEnd - end);
          }
        }
        if (i < 2) await new Promise(r => setTimeout(r, 150));
      }
      
      if (samples.length > 0) {
        samples.sort((a, b) => a - b);
        const medianOffset = samples[Math.floor(samples.length / 2)];
        setServerOffset(medianOffset);
      }
    } catch (e) {
      console.warn("Time sync info:", e);
    }
  }, []);

  useEffect(() => {
    syncTime();
    const interval = setInterval(syncTime, 60000);
    return () => clearInterval(interval);
  }, [syncTime]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncTime();
        setTimeout(() => setIsWakingUp(false), 3000);
      } else {
        setIsWakingUp(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [syncTime]);

  const mesasQuery = useMemoFirebase(() => {
    if (!firestore || !user || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/mesas_de_billar`), where("estado", "==", "ocupado"));
  }, [firestore, user, sucursalId]);
  
  const { data: mesasOcupadas } = useCollection<Mesa>(mesasQuery);
  const [ackedAlarmIds, setAckedAlarmIds] = useState<Record<string, number>>({});

  // Limpiar IDs reconocidos localmente cuando la sesión cambie o ya venga marcada desde Firestore
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
    return mesasOcupadas.filter(mesa => {
        if (mesa.modoJuego !== 'definido' || mesa.alarmaAck || !mesa.horaInicio || !mesa.tiempoDefinido) return false;
        const fechaInicio = toDate(mesa.horaInicio);
        if (fechaInicio.getTime() <= 0) return false; 
        if (ackedAlarmIds[mesa.id] === fechaInicio.getTime()) return false;
        const fechaFinMillis = fechaInicio.getTime() + (mesa.tiempoDefinido * 1000);
        return ahoraSincronizada >= fechaFinMillis;
    });
  }, [mesasOcupadas, serverOffset, isWakingUp, currentTime, ackedAlarmIds]);

  const handleAudioEnded = useCallback(() => {
    if (mesasEnAlarma.length > 0) {
      alarmTimeoutRef.current = setTimeout(() => {
        if (mesasEnAlarma.length > 0 && audioRef.current) {
          audioRef.current.play().catch(e => console.error("Error replay:", e));
        }
      }, 3000);
    }
  }, [mesasEnAlarma.length]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    if (mesasEnAlarma.length > 0) {
        if (!isAlarmPlaying) {
            setIsAlarmPlaying(true);
            audioElement.play().catch(e => console.error("Error playback:", e));
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
  }, [mesasEnAlarma.length, isAlarmPlaying]);

  const handleAcceptAlert = useCallback(async () => {
    if (mesasEnAlarma.length === 0 || !firestore || !sucursalId) return;
    const mesaActual = mesasEnAlarma[0];
    const inicioMillis = mesaActual.horaInicio ? toDate(mesaActual.horaInicio).getTime() : 0;

    // Reconocimiento optimista inmediato para cerrar el aviso sin demoras ni bloqueos de otros modales
    setAckedAlarmIds((prev) => ({ ...prev, [mesaActual.id]: inicioMillis }));

    const mesaRef = doc(firestore, `sucursales/${sucursalId}/mesas_de_billar`, mesaActual.id);
    try {
      await updateDoc(mesaRef, { alarmaAck: true });
    } catch (error) {
      console.error("Error acknowledging alarm:", error);
    }
  }, [mesasEnAlarma, firestore, sucursalId]);

  // Permitir cerrar la alerta de tiempo culminado con Enter o Escape en fase de captura sin cerrar modales subyacentes
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
  
  const handleInitialInteraction = () => {
    if (!hasInteracted.current && audioRef.current) {
      audioRef.current.load();
      hasInteracted.current = true;
    }
  };

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login')
    }
  }, [user, isUserLoading, router])

  if (isUserLoading || !user || isLoadingSucursalId) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  // Si no es admin y no tiene perfil, mostramos una advertencia pero permitimos el Layout base para poder salir
  const showMissingProfile = !isAdmin && !profile && !isUserLoading;

  if (!subInfo.isValid) {
    const isTechnical = subInfo.sub?.motivoSuspension === 'tecnico';
    return (
        <div className="flex flex-col h-screen items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-900 font-body animate-in fade-in duration-700">
            {isTechnical ? (
                <div className="flex flex-col items-center max-w-md">
                    <div className="h-20 w-20 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 mb-6 animate-pulse">
                        <CloudOff className="h-10 w-10" />
                    </div>
                    <h1 className="text-2xl font-bold font-headline mb-2 text-slate-800 dark:text-slate-200">Error de conexión local</h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
                        No se ha podido establecer comunicación con el servidor central de Pool Control.
                    </p>
                    <Card className="w-full border-none shadow-lg rounded-2xl overflow-hidden mb-8 bg-white dark:bg-slate-800">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-3 text-left">
                                <div className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wide">Estado: Reintentando vínculo...</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Button variant="ghost" className="rounded-full text-slate-400 hover:text-slate-600 gap-2" onClick={() => window.location.reload()}>
                        <RefreshCw className="h-4 w-4" /> Reintentar ahora
                    </Button>
                </div>
            ) : (
                <>
                    <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-6">
                        <CalendarX className="h-12 w-12" />
                    </div>
                    <h1 className="text-3xl font-black font-headline mb-2">Servicio suspendido</h1>
                    <p className="text-muted-foreground max-w-md mb-8">
                        La suscripción para la sucursal <strong>{sucursalData?.nombre}</strong> ha expirado o ha sido suspendida.
                    </p>
                    <Button variant="outline" className="rounded-full px-8" onClick={handleLogout}>
                        Cerrar sesión
                    </Button>
                </>
            )}
        </div>
    );
  }

  const primeraMesaEnAlarma = mesasEnAlarma[0];

  return (
    <SidebarProvider>
      <Header />
      <div className="flex flex-col flex-1 h-[calc(100dvh-3.5rem)] md:h-[calc(100vh-3.5rem)]">
        {subInfo.isExpiringSoon && (
            <div className="bg-amber-100 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 p-2 text-center flex items-center justify-center gap-3 animate-in slide-in-from-top duration-500">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <p className="text-[11px] sm:text-xs font-bold text-amber-800 dark:text-amber-400 font-body">
                    Aviso: Tu suscripción vence pronto. Contacta a soporte.
                </p>
            </div>
        )}

        <div className="flex flex-1 overflow-hidden">
            <Sidebar>
                <DashboardNav />
            </Sidebar>
            <main 
                className="flex-1 overflow-y-auto p-4 sm:p-6"
                onClick={handleInitialInteraction}
            >
                {showMissingProfile ? (
                  <div className="flex flex-col h-full items-center justify-center p-6 text-center animate-in fade-in duration-500">
                    <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-6">
                      <ShieldAlert className="h-10 w-10" />
                    </div>
                    <h1 className="text-2xl font-black font-headline mb-2 text-foreground">Perfil incompleto</h1>
                    <p className="text-muted-foreground max-w-md mb-8 text-sm">
                      Tu cuenta ha sido autenticada, pero no tiene una sucursal asignada o tu perfil no se ha configurado completamente.
                    </p>
                    <Button variant="outline" className="rounded-full px-8 font-bold" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
                    </Button>
                  </div>
                ) : (
                  children
                )}
            </main>
        </div>
      </div>

      <audio ref={audioRef} src="/alarm.mp3" preload="auto" onEnded={handleAudioEnded}></audio>
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
            className="w-full max-w-sm rounded-xl sm:rounded-lg bg-[#1d283a] border border-[#324157] text-slate-100 p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
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
    </SidebarProvider>
  )
}
