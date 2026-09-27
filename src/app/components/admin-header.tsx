'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Menu, Bell, AlertTriangle, CheckCircle2, Clock, ShieldCheck } from 'lucide-react'
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

  const { data: sucursales } = useCollection<Sucursal>(sucursalesQuery);

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

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b bg-card/80 p-3 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary shrink-0" />
          <div className="flex flex-col">
            <h2 className="text-lg font-headline font-bold leading-tight text-foreground">Admin Panel</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-70">v{appVersion.version} (build {appVersion.build})</p>
          </div>
        </div>
        <div className="md:hidden">
            <SidebarTrigger variant="outline" size="icon" className="h-8 w-8 rounded-full">
                <Menu className="h-4 w-4" />
            </SidebarTrigger>
        </div>
      </div>

      <div className="flex items-center gap-2 pr-2">
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
          <PopoverContent className="w-80 p-0 mr-4 mt-2 rounded-2xl overflow-hidden shadow-2xl border-none font-body" align="end">
            <div className="p-4 bg-primary text-primary-foreground">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">Centro de Notificaciones</h3>
                <Badge variant="secondary" className="bg-white/20 text-white border-none text-[10px] font-bold">
                  {countAlertas} {countAlertas === 1 ? 'Alerta' : 'Alertas'}
                </Badge>
              </div>
            </div>
            
            <ScrollArea className="max-h-[400px]">
              {alertas.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Sin alertas pendientes</p>
                  <p className="text-[10px] text-muted-foreground">Todas las sucursales están al día.</p>
                </div>
              ) : (
                <div className="divide-y divide-muted/50">
                  {alertas.map((alerta) => (
                    <div key={alerta.id} className="p-4 hover:bg-muted/30 transition-colors cursor-pointer group">
                      <div className="flex gap-3">
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                          alerta.tipo === 'vencido' || alerta.tipo === 'suspendido' ? "bg-destructive/10 text-destructive" : "bg-amber-100 text-amber-600"
                        )}>
                          {alerta.tipo === 'proximo' ? <Clock className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold leading-none">{alerta.sucursalNombre}</p>
                          <p className="text-[11px] text-muted-foreground leading-tight">{alerta.mensaje}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-tighter px-1.5 h-4">ID {alerta.idSucursal}</Badge>
                            {alerta.tipo === 'suspendido' && <Badge variant="destructive" className="text-[9px] font-bold h-4">Bloqueo Manual</Badge>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            <Separator />
            <div className="p-2 bg-muted/10">
              <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest h-8 rounded-xl" asChild>
                <a href="/admin-success/suscripciones">Gestionar Suscripciones</a>
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
