'use client';

import {
    AlertTriangle,
    Calendar,
    CheckCircle2,
    CloudOff,
    Edit,
    HandCoins,
    History,
    Layers,
    Loader2,
    Power,
    PowerOff,
    RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Sucursal } from '@/lib/tipos';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PillTabs, SurfaceCard, type PillTabItem } from '@/components/comunes';
import { cn } from '@/lib/utils';
import {
    type FiltroEstadoSuscripcion,
    isSuscripcionActiva,
    isSuscripcionVencida,
} from '../_hooks/use-suscripciones-admin';

interface ListaSuscripcionesProps {
    sucursales: Sucursal[];
    isLoading: boolean;
    searchTerm: string;
    onSearchChange: (val: string) => void;
    filtroEstado: FiltroEstadoSuscripcion;
    onFiltroEstadoChange: (val: FiltroEstadoSuscripcion) => void;
    counts: {
        todas: number;
        activas: number;
        atencion: number;
    };
    onOpenPago: (s: Sucursal) => void;
    onOpenHistorial: (s: Sucursal) => void;
    onToggleSuspension: (s: Sucursal, m: 'administrativo' | 'tecnico') => void;
    onOpenEdit: (s: Sucursal) => void;
}

export function ListaSuscripciones({
    sucursales,
    isLoading,
    searchTerm,
    onSearchChange,
    filtroEstado,
    onFiltroEstadoChange,
    counts,
    onOpenPago,
    onOpenHistorial,
    onToggleSuspension,
    onOpenEdit,
}: ListaSuscripcionesProps) {
    const tabs: PillTabItem[] = [
        {
            id: 'todas',
            label: 'Todas',
            icon: Layers,
            count: counts.todas,
            badgeVariant: filtroEstado === 'todas' ? 'white' : 'slate',
        },
        {
            id: 'activas',
            label: 'Activas',
            icon: CheckCircle2,
            count: counts.activas,
            badgeVariant: 'emerald',
        },
        {
            id: 'atencion',
            label: 'Por atender',
            icon: AlertTriangle,
            count: counts.atencion,
            badgeVariant: 'amber',
        },
    ];

    return (
        <SurfaceCard variant="panel" className="p-4 sm:p-5 space-y-4">
            <PillTabs
                value={filtroEstado}
                onValueChange={(v) => onFiltroEstadoChange(v as FiltroEstadoSuscripcion)}
                tabs={tabs}
                searchValue={searchTerm}
                onSearchChange={onSearchChange}
                searchPlaceholder="Buscar sucursal por nombre o ID..."
                collapsibleMobileTabs
            />

            {isLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                    <span className="text-xs font-medium">Cargando suscripciones...</span>
                </div>
            ) : sucursales.length === 0 ? (
                <div className="py-14 px-4 rounded-2xl bg-[#252526] border border-[#2e2e2e] text-center">
                    <p className="text-sm font-medium text-slate-400">
                        No se encontraron sucursales con los filtros aplicados.
                    </p>
                </div>
            ) : (
                <TooltipProvider delayDuration={150}>
                    <div className="space-y-3">
                        {sucursales.map((s) => {
                            const sub = s.suscripcion;
                            const vencida = isSuscripcionVencida(sub);
                            const activa = isSuscripcionActiva(sub);
                            const isSuspended = sub?.estado === 'suspendido';
                            const isAdminSuspended =
                                isSuspended && sub?.motivoSuspension === 'administrativo';
                            const isTechSuspended =
                                isSuspended && sub?.motivoSuspension === 'tecnico';

                            return (
                                <div
                                    key={s.id}
                                    className="rounded-2xl bg-[#252526] border border-[#2e2e2e] hover:border-[#3c3c3c] transition-colors p-4 sm:px-5 sm:py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                                >
                                    {/* Información de Sucursal y Plan */}
                                    <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                                        <div
                                            className={cn(
                                                'h-11 w-11 rounded-full flex items-center justify-center shrink-0 border',
                                                isSuspended
                                                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                                    : vencida
                                                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                                      : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                                            )}
                                        >
                                            {isSuspended ? (
                                                <PowerOff className="h-5 w-5" />
                                            ) : sub?.plan === 'Pro' ? (
                                                <CheckCircle2 className="h-5 w-5" />
                                            ) : (
                                                <Calendar className="h-5 w-5" />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-bold text-base text-slate-100 truncate">
                                                    {s.nombre}
                                                </p>
                                                <Badge
                                                    variant="outline"
                                                    className="rounded-full bg-[#1e1e1e] border-[#2e2e2e] text-slate-300 text-[11px] font-semibold px-2.5 py-0.5"
                                                >
                                                    ID {s.idSucursal}
                                                </Badge>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-xs text-slate-400">
                                                <span className="font-medium text-slate-300">
                                                    Plan {sub?.plan || 'Sin plan'}
                                                </span>
                                                <span className="text-slate-600">•</span>
                                                {sub?.fechaVencimiento ? (
                                                    <span
                                                        className={cn(
                                                            vencida && !isSuspended
                                                                ? 'text-rose-400 font-semibold'
                                                                : 'text-slate-400'
                                                        )}
                                                    >
                                                        Vence:{' '}
                                                        {format(sub.fechaVencimiento.toDate(), 'dd MMM, yyyy', {
                                                            locale: es,
                                                        })}
                                                    </span>
                                                ) : (
                                                    <span className="text-rose-400 font-semibold">
                                                        Sin configurar
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Monto, Estado y Acciones */}
                                    <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 sm:gap-4 shrink-0 pt-2 lg:pt-0 border-t border-[#2e2e2e] lg:border-t-0">
                                        <div className="flex items-center gap-3">
                                            <div className="text-left sm:text-right">
                                                <p className="text-sm font-bold text-slate-100 tabular-nums">
                                                    Q{(sub?.montoAcordado || 0).toFixed(2)}
                                                </p>
                                                <p className="text-[11px] text-slate-400">Mensual</p>
                                            </div>

                                            {activa ? (
                                                <Badge className="rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 px-3 py-0.5 text-xs font-semibold">
                                                    Activo
                                                </Badge>
                                            ) : (
                                                <Badge className="rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 px-3 py-0.5 text-xs font-semibold">
                                                    {isSuspended
                                                        ? sub?.motivoSuspension === 'tecnico'
                                                            ? 'Falla técnica'
                                                            : 'Suspendido'
                                                        : 'Vencido'}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Barra de Acciones en Píldora */}
                                        <div className="flex items-center gap-1 bg-[#1e1e1e] border border-[#2e2e2e] rounded-full p-1">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="rounded-full h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/15"
                                                        onClick={() => onOpenPago(s)}
                                                        aria-label="Registrar pago"
                                                    >
                                                        <HandCoins className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">
                                                    <p>Registrar pago</p>
                                                </TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="rounded-full h-8 w-8 text-sky-400 hover:text-sky-300 hover:bg-sky-500/15"
                                                        onClick={() => onOpenHistorial(s)}
                                                        aria-label="Historial de pagos"
                                                    >
                                                        <History className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">
                                                    <p>Historial de pagos</p>
                                                </TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className={cn(
                                                            'rounded-full h-8 w-8',
                                                            isAdminSuspended
                                                                ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/15'
                                                                : 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/15'
                                                        )}
                                                        onClick={() => onToggleSuspension(s, 'administrativo')}
                                                        aria-label={
                                                            isAdminSuspended
                                                                ? 'Reactivar acceso'
                                                                : 'Suspensión administrativa'
                                                        }
                                                    >
                                                        {isAdminSuspended ? (
                                                            <RefreshCw className="h-4 w-4" />
                                                        ) : (
                                                            <Power className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">
                                                    <p>
                                                        {isAdminSuspended
                                                            ? 'Reactivar acceso'
                                                            : 'Suspensión administrativa'}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className={cn(
                                                            'rounded-full h-8 w-8',
                                                            isTechSuspended
                                                                ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/15'
                                                                : 'text-slate-400 hover:text-slate-200 hover:bg-[#313131]'
                                                        )}
                                                        onClick={() => onToggleSuspension(s, 'tecnico')}
                                                        aria-label={
                                                            isTechSuspended
                                                                ? 'Reactivar acceso'
                                                                : 'Simular error de servidor'
                                                        }
                                                    >
                                                        {isTechSuspended ? (
                                                            <RefreshCw className="h-4 w-4" />
                                                        ) : (
                                                            <CloudOff className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">
                                                    <p>
                                                        {isTechSuspended
                                                            ? 'Reactivar acceso'
                                                            : 'Error de servidor'}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="rounded-full h-8 w-8 text-slate-300 hover:text-white hover:bg-[#313131]"
                                                        onClick={() => onOpenEdit(s)}
                                                        aria-label="Editar suscripción"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">
                                                    <p>Editar suscripción</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </TooltipProvider>
            )}
        </SurfaceCard>
    );
}

