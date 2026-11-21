'use client';

import Link from 'next/link';
import {
    ArrowRight,
    BarChart3,
    Building2,
    CalendarClock,
    Settings,
    Users,
    type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BotonVolverArriba, PageHeader, SurfaceCard } from '@/components/comunes';
import { cn } from '@/lib/utils';
import { useDashboardMaestro } from './_hooks/use-dashboard-maestro';
import { MetricasMaestro } from './_components/MetricasMaestro';

interface DashboardModuleCard {
    id: string;
    title: string;
    description: string;
    href?: string;
    ctaLabel: string;
    icon: LucideIcon;
    accentClass: string;
    disabled?: boolean;
}

const DASHBOARD_MODULES: DashboardModuleCard[] = [
    {
        id: 'sucursales',
        title: 'Gestión de Sucursales',
        description:
            'Añade, edita y administra todas las sucursales del negocio desde un único lugar.',
        href: '/admin-success/sucursales',
        ctaLabel: 'Ir a Sucursales',
        icon: Building2,
        accentClass: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
    },
    {
        id: 'usuarios',
        title: 'Administración de Usuarios',
        description:
            'Visualiza y gestiona los usuarios con acceso al sistema de todas las sucursales.',
        href: '/admin-success/usuarios',
        ctaLabel: 'Ir a Usuarios',
        icon: Users,
        accentClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    },
    {
        id: 'suscripciones',
        title: 'Gestión de Suscripciones',
        description:
            'Controla planes, pagos mensuales, fechas de vencimiento y estado de acceso por sucursal.',
        href: '/admin-success/suscripciones',
        ctaLabel: 'Ir a Suscripciones',
        icon: CalendarClock,
        accentClass: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    },
    {
        id: 'reportes',
        title: 'Reportes Globales',
        description:
            'Accede a reportes consolidados de ventas, ocupación y rendimiento de todas las sucursales.',
        ctaLabel: 'Próximamente',
        icon: BarChart3,
        accentClass: 'bg-[#1e1e1e] border-[#2e2e2e] text-slate-400',
        disabled: true,
    },
];

export default function AdminDashboardPage() {
    const metricas = useDashboardMaestro();

    return (
        <div className="space-y-6 font-body">
            <PageHeader
                title="Dashboard Maestro"
                description="Panel de control y métricas globales para el Super Administrador."
                icon={Settings}
            />

            <MetricasMaestro {...metricas} />

            <SurfaceCard variant="panel" className="p-4 sm:p-5 space-y-4">
                <div>
                    <h2 className="text-sm font-bold text-slate-100">Accesos rápidos</h2>
                    <p className="text-[0.6875rem] text-slate-400">
                        Navega directamente a cada módulo administrativo
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {DASHBOARD_MODULES.map((mod) => {
                        const Icon = mod.icon;
                        return (
                            <div
                                key={mod.id}
                                className="rounded-2xl bg-[#252526] border border-[#2e2e2e] hover:border-[#3c3c3c] transition-colors p-5 flex flex-col justify-between gap-5"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div
                                            className={cn(
                                                'h-11 w-11 rounded-full border flex items-center justify-center shrink-0',
                                                mod.accentClass
                                            )}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>

                                        {mod.disabled && (
                                            <Badge
                                                variant="outline"
                                                className="rounded-full bg-[#1e1e1e] border-[#2e2e2e] text-slate-400 text-[0.6875rem] font-medium px-2.5 py-0.5"
                                            >
                                                En desarrollo
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <h3 className="text-base font-bold text-slate-100 leading-snug">
                                            {mod.title}
                                        </h3>
                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            {mod.description}
                                        </p>
                                    </div>
                                </div>

                                {mod.disabled || !mod.href ? (
                                    <Button
                                        variant="outline"
                                        disabled
                                        className="w-full h-9 rounded-full bg-[#1e1e1e] border-[#2e2e2e] text-slate-500 font-semibold"
                                    >
                                        {mod.ctaLabel}
                                    </Button>
                                ) : (
                                    <Button
                                        asChild
                                        className="w-full h-9 rounded-full bg-sky-600 hover:bg-sky-500 text-white font-semibold"
                                    >
                                        <Link href={mod.href}>
                                            <span>{mod.ctaLabel}</span>
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </SurfaceCard>

            <BotonVolverArriba threshold={150} />
        </div>
    );
}
