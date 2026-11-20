'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, getCountFromServer, orderBy, query, Timestamp } from 'firebase/firestore';
import { differenceInDays } from 'date-fns';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import type { Sucursal, Suscripcion } from '@/lib/tipos';

const toDate = (fecha: unknown): Date | null => {
    if (!fecha) return null;
    if (fecha instanceof Timestamp) return fecha.toDate();
    if (fecha instanceof Date) return fecha;
    if (typeof fecha === 'string') {
        const d = new Date(fecha);
        if (!isNaN(d.getTime())) return d;
    }
    return null;
};

export interface SucursalMetricaItem {
    sucursal: Sucursal;
    activa: boolean;
    vencida: boolean;
    suspendida: boolean;
    diasRestantes: number | null;
    fechaVencimiento: Date | null;
    userCount: number | null;
}

export function useDashboardMaestro() {
    const { firestore } = useFirebase();
    const [usuariosPorSucursal, setUsuariosPorSucursal] = useState<Record<string, number>>({});
    const [loadingUsuarios, setLoadingUsuarios] = useState(false);

    const sucursalesQuery = useMemoFirebase(
        () => (firestore ? query(collection(firestore, 'sucursales'), orderBy('idSucursal')) : null),
        [firestore]
    );

    const { data: sucursales, isLoading } = useCollection<Sucursal>(sucursalesQuery);

    useEffect(() => {
        if (!firestore || !sucursales || sucursales.length === 0) {
            setUsuariosPorSucursal({});
            return;
        }

        let cancelled = false;
        setLoadingUsuarios(true);

        Promise.allSettled(
            sucursales.map(async (s) => {
                const snap = await getCountFromServer(
                    collection(firestore, `sucursales/${s.id}/usuarios`)
                );
                return { id: s.id, count: snap.data().count };
            })
        )
            .then((results) => {
                if (cancelled) return;
                const map: Record<string, number> = {};
                results.forEach((res) => {
                    if (res.status === 'fulfilled') {
                        map[res.value.id] = res.value.count;
                    }
                });
                setUsuariosPorSucursal(map);
            })
            .finally(() => {
                if (!cancelled) setLoadingUsuarios(false);
            });

        return () => {
            cancelled = true;
        };
    }, [firestore, sucursales]);

    const metricas = useMemo(() => {
        const list = sucursales ?? [];
        const ahora = new Date();

        let sucursalesActivas = 0;
        let sucursalesAtencion = 0;
        let proximasAVencer = 0;
        let mrrActivo = 0;
        let mrrPotencial = 0;
        let sucursalesConVoz = 0;

        const planesCount: Record<Suscripcion['plan'], number> = {
            Básico: 0,
            Premium: 0,
            Pro: 0,
        };

        const detalle: SucursalMetricaItem[] = list.map((s) => {
            const sub = s.suscripcion;
            const fechaVenc = toDate(sub?.fechaVencimiento);
            const suspendida = sub?.estado === 'suspendido';
            const vencidaPorFecha = fechaVenc ? fechaVenc < ahora : false;
            const vencida = sub?.estado === 'vencido' || vencidaPorFecha;
            const activa = sub?.estado === 'activo' && !vencida;
            const diasRestantes = fechaVenc ? differenceInDays(fechaVenc, ahora) : null;

            const monto = sub?.montoAcordado || 0;
            mrrPotencial += monto;

            if (activa) {
                sucursalesActivas += 1;
                mrrActivo += monto;
                if (diasRestantes !== null && diasRestantes >= 0 && diasRestantes <= 5) {
                    proximasAVencer += 1;
                }
            } else {
                sucursalesAtencion += 1;
            }

            if (s.features?.asistenteVoz !== false) {
                sucursalesConVoz += 1;
            }

            if (sub?.plan && sub.plan in planesCount) {
                planesCount[sub.plan] += 1;
            }

            return {
                sucursal: s,
                activa,
                vencida,
                suspendida,
                diasRestantes,
                fechaVencimiento: fechaVenc,
                userCount: s.id in usuariosPorSucursal ? usuariosPorSucursal[s.id] : null,
            };
        });

        const totalUsuarios = Object.values(usuariosPorSucursal).reduce((acc, n) => acc + n, 0);

        return {
            totalSucursales: list.length,
            sucursalesActivas,
            sucursalesAtencion,
            proximasAVencer,
            mrrActivo,
            mrrPotencial,
            sucursalesConVoz,
            totalUsuarios,
            planesCount,
            detalle,
        };
    }, [sucursales, usuariosPorSucursal]);

    return {
        isLoading,
        loadingUsuarios,
        ...metricas,
    };
}

