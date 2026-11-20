'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Menu, Bell, AlertTriangle, CheckCircle2, Clock, Building2, HandCoins, Mic } from 'lucide-react'
import { BolaBillarIcon } from '@/components/comunes'
import { Skeleton } from '@/components/ui/skeleton'
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, Timestamp } from 'firebase/firestore'
import { useMemo } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Sucursal } from '@/lib/tipos'
import { differenceInDays } from 'date-fns'
import { UserNav } from './user-nav'
import { appVersion } from '@/lib/version';

const toDate = (fecha: any): Date => {
  if (fecha instanceof Timestamp) return fecha.toDate();
  if (fecha instanceof Date) return fecha;
  if (typeof fecha === 'string') {
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(0);
};

export function AdminHeader() {
  const { firestore } = useFirebase();

  // Monitorear todas las sucursales para notificaciones
  const sucursalesQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'sucursales'), orderBy('idSucursal')) : null
  , [firestore]);

  const { data: sucursales, isLoading: isLoadingSucursales } = useCollection<Sucursal>(sucursalesQuery);

  const resumenMetricas = useMemo(() => {
    const list = sucursales ?? [];
    const ahora = new Date();
    let activas = 0;
    let mrrActivo = 0;
    let conVoz = 0;

    list.forEach((s) => {
      const sub = s.suscripcion;
      const venc = toDate(sub?.fechaVencimiento);
      const isActiva = sub?.estado === 'activo' && venc >= ahora;
      if (isActiva) {
        activas += 1;
        mrrActivo += sub?.montoAcordado || 0;
      }
      if (s.features?.asistenteVoz !== false) {
        conVoz += 1;
      }
    });

    return {
      total: list.length,
      activas,
      atencion: list.length - activas,
      mrrActivo,
      conVoz,
    };
  }, [sucursales]);

  // Calcular notificaciones basadas en el estado de las sucursales
  const alertas = useMemo(() => {
    if (!sucursales) return [];
    
    const items: { id: string, sucursalNombre: string, mensaje: string, tipo: 'vencido' | 'proximo' | 'suspendido', idSucursal: number }[] = [];
    const ahora = new Date();

    sucursales.forEach(s => {
      const sub = s.suscripcion;
      if (!sub) return;

      const vencimiento = toDate(sub.fechaVencimiento);
      const isSuspended = sub.estado === 'suspendido';
      const isExpired = sub.estado === 'vencido' || (vencimiento < ahora && sub.estado === 'activo');
      const daysRemaining = differenceInDays(vencimiento, ahora);

      if (isSuspended) {
        items.push({
          id: s.id,
          sucursalNombre: s.nombre,
          mensaje: `Acceso suspendido manualmente (${sub.motivoSuspension || 'administrativo'}).`,
          tipo: 'suspendido',
          idSucursal: s.idSucursal
        });
      } else if (isExpired) {
        items.push({
          id: s.id,
          sucursalNombre: s.nombre,
          mensaje: 'Suscripción vencida. Acceso bloqueado.',
          tipo: 'vencido',
          idSucursal: s.idSucursal
        });
      } else if (daysRemaining <= 5 && daysRemaining >= 0) {
        items.push({
          id: s.id,
          sucursalNombre: s.nombre,
          mensaje: `Suscripción por vencer en ${daysRemaining} ${daysRemaining === 1 ? 'día' : 'días'}.`,
          tipo: 'proximo',
          idSucursal: s.idSucursal
        });
      }
    });

    return items;
  }, [sucursales]);

  const countAlertas = alertas.length;

  const pillClass = "flex-shrink-0 flex items-center gap-1.5 rounded-full bg-[#252526] border border-[#2e2e2e] px-2.5 py-1 text-xs text-slate-100 shadow-sm tabular-nums";

  const metricsPills = isLoadingSucursales ? (
    <div className="flex items-center gap-2">
      <Skeleton className="h-6 w-24 rounded-full" />
      <Skeleton className="h-6 w-24 rounded-full" />
      <Skeleton className="h-6 w-28 rounded-full" />
    </div>
  ) : (
    <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
      <div className={pillClass} title="Sucursales registradas">
        <Building2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
        <span className="text-slate-400">Sucursales:</span>
        <span className="font-bold text-slate-100">{resumenMetricas.total}</span>
      </div>
      <div className={pillClass} title="Suscripciones activas">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
        <span className="text-slate-400">Activas:</span>
        <span className="font-bold text-emerald-400">
          {resumenMetricas.activas}/{resumenMetricas.total}
        </span>
      </div>
      <div className={pillClass} title="Ingreso mensual activo (MRR)">
        <HandCoins className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
        <span className="text-slate-400">MRR:</span>
        <span className="font-bold text-slate-100">Q{resumenMetricas.mrrActivo.toFixed(2)}</span>
      </div>
      <div className={pillClass} title="Sucursales con comandos de voz">
        <Mic className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
        <span className="text-slate-400">Voz:</span>
        <span className="font-bold text-slate-100">{resumenMetricas.conVoz}</span>
      </div>
      {resumenMetricas.atencion > 0 && (
        <div
          className="flex-shrink-0 flex items-center gap-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 px-2.5 py-1 text-xs text-rose-300 shadow-sm tabular-nums"
          title="Suscripciones vencidas o suspendidas"
        >
          <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
          <span>Por atender:</span>
          <span className="font-bold text-rose-200">{resumenMetricas.atencion}</span>
        </div>
      )}
    </div>
  );

  return (
    <header className="flex h-auto flex-wrap md:flex-nowrap md:h-14 items-center justify-between gap-2 md:gap-4 border-b bg-card/80 p-2 md:p-3 backdrop-blur-sm sticky top-0 z-40">
      <div className="order-1 flex items-center gap-3 shrink-0">
        <div className="md:hidden">
          <SidebarTrigger variant="outline" size="icon" className="h-8 w-8 rounded-full">
            <Menu className="h-4 w-4" />
          </SidebarTrigger>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <BolaBillarIcon className="h-10 w-10 shrink-0" />
          <div className="flex flex-col">
            <h2 className="text-base font-headline font-bold leading-none text-slate-100">Admin Panel</h2>
            <p className="text-[11px] text-sky-400 font-medium mt-1">v{appVersion.version} (Build {appVersion.build})</p>
          </div>
        </div>
      </div>

      <div className="order-3 md:order-2 w-full md:w-auto md:flex-1 flex items-center gap-4 min-w-0 pb-0.5 md:pb-0">
        <div className="hidden md:block h-8 w-px bg-[#2e2e2e] shrink-0" />
        {metricsPills}
      </div>

      <div className="order-2 md:order-3 flex items-center gap-2 pr-1 md:pr-2 shrink-0">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full h-10 w-10">
              <Bell className="h-5 w-5" />
              {countAlertas > 0 && (
                <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-white ring-2 ring-background">
                  {countAlertas}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 mr-4 mt-2 rounded-2xl overflow-hidden shadow-2xl bg-[#1e1e1e] border border-[#2e2e2e] font-body text-slate-100" align="end">
            <div className="p-4 bg-[#252526] border-b border-[#2e2e2e]">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-100">Centro de notificaciones</h3>
                <Badge variant="secondary" className="rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 text-[11px] font-semibold">
                  {countAlertas} {countAlertas === 1 ? 'Alerta' : 'Alertas'}
                </Badge>
              </div>
            </div>
            
            <ScrollArea className="max-h-[400px]">
              {alertas.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-200">Sin alertas pendientes</p>
                  <p className="text-[11px] text-slate-400">Todas las sucursales están al día.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#2e2e2e]">
                  {alertas.map((alerta) => (
                    <div key={alerta.id} className="p-4 hover:bg-[#252526] transition-colors cursor-pointer group">
                      <div className="flex gap-3">
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 border",
                          alerta.tipo === 'vencido' || alerta.tipo === 'suspendido'
                            ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                            : "bg-amber-500/15 border-amber-500/30 text-amber-400"
                        )}>
                          {alerta.tipo === 'proximo' ? <Clock className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold leading-none text-slate-100">{alerta.sucursalNombre}</p>
                          <p className="text-[11px] text-slate-400 leading-tight">{alerta.mensaje}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="rounded-full bg-[#252526] border-[#2e2e2e] text-slate-300 text-[10px] font-semibold px-2 h-5">ID {alerta.idSucursal}</Badge>
                            {alerta.tipo === 'suspendido' && <Badge className="rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-semibold h-5">Bloqueo manual</Badge>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            <div className="p-2.5 bg-[#252526] border-t border-[#2e2e2e]">
              <Button variant="ghost" className="w-full text-xs font-semibold h-9 rounded-full hover:bg-[#313131] text-sky-400" asChild>
                <a href="/admin-success/suscripciones">Gestionar suscripciones</a>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <Separator orientation='vertical' className="mx-1 h-8" />
        <UserNav />
      </div>
    </header>
  )
}
