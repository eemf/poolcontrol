'use client';

import Link from 'next/link';
import {
    AlertTriangle,
    ArrowRight,
    Building2,
    CheckCircle2,
    Clock,
    HandCoins,
    Layers,
    Loader2,
    Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SurfaceCard } from '@/components/comunes';
import { cn } from '@/lib/utils';
import type { Suscripcion } from '@/lib/tipos';
import type { SucursalMetricaItem } from '../_hooks/use-dashboard-maestro';

interface MetricasMaestroProps {
    isLoading: boolean;
    loadingUsuarios: boolean;
    totalSucursales: number;
    sucursalesActivas: number;
    sucursalesAtencion: number;
    proximasAVencer: number;
    mrrActivo: number;
    mrrPotencial: number;
    sucursalesConVoz: number;
    totalUsuarios: number;
    planesCount: Record<Suscripcion['plan'], number>;
    detalle: SucursalMetricaItem[];
}

const PLAN_CONFIG: {
    key: Suscripcion['plan'];
    label: string;
    barClass: string;
    badgeClass: string;
}[] = [
    {
        key: 'Pro',
        label: 'Plan Pro',
        barClass: 'bg-sky-500',
        badgeClass: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
    },
    {
        key: 'Premium',
        label: 'Plan Premium',
        barClass: 'bg-emerald-500',
        badgeClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    },
    {
        key: 'Básico',
        label: 'Plan Básico',
        barClass: 'bg-amber-400',
        badgeClass: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    },
];

export function MetricasMaestro({
    isLoading,
    loadingUsuarios,
    totalSucursales,
    sucursalesActivas,
    sucursalesAtencion,
    proximasAVencer,
    mrrActivo,
    mrrPotencial,
    sucursalesConVoz,
    totalUsuarios,
    planesCount,
    detalle,
}: MetricasMaestroProps) {
    const kpis = [
        {
            id: 'sucursales',
            label: 'Sucursales registradas',
            value: isLoading ? '—' : String(totalSucursales),
            sub: `${sucursalesConVoz} con comandos de voz`,
            icon: Building2,
            iconClass: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
        },
        {
            id: 'activas',
            label: 'Suscripciones activas',
            value: isLoading ? '—' : `${sucursalesActivas} / ${totalSucursales}`,
            sub:
                sucursalesAtencion > 0
                    ? `${sucursalesAtencion} requieren atención`
                    : proximasAVencer > 0
                      ? `${proximasAVencer} por vencer en ≤ 5 días`
                      : 'Todas al día',
            icon: sucursalesAtencion > 0 ? AlertTriangle : CheckCircle2,
            iconClass:
                sucursalesAtencion > 0
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
        },
        {
            id: 'mrr',
            label: 'Ingreso mensual activo',
            value: isLoading ? '—' : `Q${mrrActivo.toFixed(2)}`,
            sub: `Proyectado total: Q${mrrPotencial.toFixed(2)}`,
            icon: HandCoins,
            iconClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
        },
        {
            id: 'usuarios',
            label: 'Usuarios globales',
            value: isLoading || loadingUsuarios ? '—' : String(totalUsuarios),
            sub: `En ${totalSucursales} ${totalSucursales === 1 ? 'sucursal' : 'sucursales'}`,
            icon: Users,
            iconClass: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
        },
    ];

    return (
        <div className="space-y-4">
            {/* Fila de KPIs principales */}
            <SurfaceCard variant="panel" className="p-4 sm:p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
                    {kpis.map((kpi) => {
                        const Icon = kpi.icon;
                        return (
                            <div
                                key={kpi.id}
                                className="rounded-2xl bg-[#252526] border border-[#2e2e2e] p-4 flex items-start justify-between gap-3"
                            >
                                <div className="space-y-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-400 truncate">
                                        {kpi.label}
                                    </p>
                                    <p className="text-2xl font-bold text-slate-100 tabular-nums tracking-tight">
                                        {kpi.value}
                                    </p>
                                    <p className="text-[0.6875rem] text-slate-400 truncate">{kpi.sub}</p>
                                </div>
                                <div
                                    className={cn(
                                        'h-10 w-10 rounded-full border flex items-center justify-center shrink-0',
                                        kpi.iconClass
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </SurfaceCard>

            {/* Desglose por sucursal y distribución de planes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <SurfaceCard variant="panel" className="lg:col-span-2 p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
                                <Clock className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-100">
                                    Estado por sucursal
                                </h2>
                                <p className="text-[0.6875rem] text-slate-400">
                                    Vigencia, usuarios asignados y cuota mensual
                                </p>
                            </div>
                        </div>
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-full px-3.5 bg-[#252526] border-[#2e2e2e] hover:bg-[#313131] text-slate-200 text-xs font-semibold"
                        >
                            <Link href="/admin-success/suscripciones">
                                Ver todo
                                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="py-10 flex justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
                        </div>
                    ) : detalle.length === 0 ? (
                        <div className="py-10 rounded-2xl bg-[#252526] border border-[#2e2e2e] text-center text-xs text-slate-400">
                            No hay sucursales registradas.
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {detalle.map((item) => {
                                const {
                                    sucursal,
                                    activa,
                                    suspendida,
                                    diasRestantes,
                                    fechaVencimiento,
                                    userCount,
                                } = item;
                                const sub = sucursal.suscripcion;
                                const porVencer =
                                    activa &&
                                    diasRestantes !== null &&
                                    diasRestantes >= 0 &&
                                    diasRestantes <= 5;

                                return (
                                    <div
                                        key={sucursal.id}
                                        className="rounded-xl bg-[#252526] border border-[#2e2e2e] px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-slate-100 truncate">
                                                    {sucursal.nombre}
                                                </p>
                                                <Badge
                                                    variant="outline"
                                                    className="rounded-full bg-[#1e1e1e] border-[#2e2e2e] text-slate-300 text-[0.625rem] font-semibold px-2 py-0"
                                                >
                                                    {sub?.plan || 'Sin plan'}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.6875rem] text-slate-400 mt-0.5">
                                                <span>
                                                    {userCount !== null
                                                        ? `${userCount} ${userCount === 1 ? 'usuario' : 'usuarios'}`
                                                        : 'Cargando usuarios...'}
                                                </span>
                                                <span className="text-slate-600">•</span>
                                                <span>
                                                    {fechaVencimiento
                                                        ? `Vence ${format(fechaVencimiento, 'dd MMM, yyyy', { locale: es })}`
                                                        : 'Sin vencimiento'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                            <span className="text-xs font-bold text-slate-100 tabular-nums">
                                                Q{(sub?.montoAcordado || 0).toFixed(2)}
                                            </span>
                                            {activa ? (
                                                porVencer ? (
                                                    <Badge className="rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[0.6875rem] font-semibold px-2.5 py-0.5">
                                                        Vence en {diasRestantes}d
                                                    </Badge>
                                                ) : (
                                                    <Badge className="rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[0.6875rem] font-semibold px-2.5 py-0.5">
                                                        Activa
                                                    </Badge>
                                                )
                                            ) : (
                                                <Badge className="rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[0.6875rem] font-semibold px-2.5 py-0.5">
                                                    {suspendida ? 'Suspendida' : 'Vencida'}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </SurfaceCard>

                {/* Distribución de planes y salud de vigencia */}
                <SurfaceCard variant="panel" className="p-4 sm:p-5 space-y-4">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                            <Layers className="h-4 w-4" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-100">
                                Distribución de planes
                            </h2>
                            <p className="text-[0.6875rem] text-slate-400">
                                Suscripciones por nivel de servicio
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-[#252526] border border-[#2e2e2e] p-4 space-y-3.5">
                        {PLAN_CONFIG.map((plan) => {
                            const count = planesCount[plan.key] || 0;
                            const pct =
                                totalSucursales > 0
                                    ? Math.round((count / totalSucursales) * 100)
                                    : 0;

                            return (
                                <div key={plan.key} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium text-slate-200">
                                            {plan.label}
                                        </span>
                                        <span className="text-slate-400 tabular-nums">
                                            {count} ({pct}%)
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-[#1e1e1e] overflow-hidden">
                                        <div
                                            className={cn(
                                                'h-full rounded-full transition-all duration-300',
                                                plan.barClass
                                            )}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="rounded-2xl bg-[#252526] border border-[#2e2e2e] p-4 space-y-2.5">
                        <p className="text-xs font-semibold text-slate-200">
                            Resumen de vigencia
                        </p>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="rounded-xl bg-[#1e1e1e] border border-[#2e2e2e] p-2.5">
                                <p className="text-base font-bold text-emerald-400 tabular-nums">
                                    {sucursalesActivas}
                                </p>
                                <p className="text-[0.6875rem] text-slate-400">Activas</p>
                            </div>
                            <div className="rounded-xl bg-[#1e1e1e] border border-[#2e2e2e] p-2.5">
                                <p className="text-base font-bold text-amber-400 tabular-nums">
                                    {proximasAVencer}
                                </p>
                                <p className="text-[0.6875rem] text-slate-400">Por vencer</p>
                            </div>
                            <div className="rounded-xl bg-[#1e1e1e] border border-[#2e2e2e] p-2.5">
                                <p className="text-base font-bold text-rose-400 tabular-nums">
                                    {sucursalesAtencion}
                                </p>
                                <p className="text-[0.6875rem] text-slate-400">Inactivas</p>
                            </div>
                        </div>
                    </div>
                </SurfaceCard>
            </div>
        </div>
    );
}

