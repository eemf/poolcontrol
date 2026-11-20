'use client';

import { useState, useMemo } from 'react';
import { useFirebase, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, query, orderBy, Timestamp, updateDoc } from 'firebase/firestore';
import { format, addMonths } from 'date-fns';
import type { Sucursal, Suscripcion, PagoSuscripcion } from '@/lib/tipos';
import { useToast } from '@/hooks/use-toast';
import { suspenderSucursalManual } from '@/lib/firebase/servicios/suscripciones';
import { registrarPagoSuscripcion } from '@/lib/firebase/servicios/pagos-suscripcion';

export const PLANES: Suscripcion['plan'][] = ['Básico', 'Premium', 'Pro'];
export const ESTADOS: Suscripcion['estado'][] = ['activo', 'vencido', 'suspendido'];
export const METODOS = ['Efectivo', 'Transferencia', 'Tarjeta', 'Otro'] as const;

export type FiltroEstadoSuscripcion = 'todas' | 'activas' | 'atencion';

export function isSuscripcionVencida(sub?: Suscripcion): boolean {
    if (!sub) return true;
    if (sub.estado === 'vencido') return true;
    return Boolean(sub.fechaVencimiento && sub.fechaVencimiento.toDate() < new Date());
}

export function isSuscripcionActiva(sub?: Suscripcion): boolean {
    return sub?.estado === 'activo' && !isSuscripcionVencida(sub);
}

export function useSuscripcionesAdmin() {
    const { firestore } = useFirebase();
    const { user } = useUser();
    const { toast } = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<FiltroEstadoSuscripcion>('todas');
    const [loading, setLoading] = useState(false);

    // Modales
    const [editingSucursal, setEditingSucursal] = useState<Sucursal | null>(null);
    const [sucursalToSuspend, setSucursalToSuspend] = useState<{
        s: Sucursal;
        m: 'administrativo' | 'tecnico';
    } | null>(null);
    const [sucursalParaPago, setSucursalParaPago] = useState<Sucursal | null>(null);
    const [sucursalParaHistorial, setSucursalParaHistorial] = useState<Sucursal | null>(null);

    // Estados Form Suscripción
    const [plan, setPlan] = useState<Suscripcion['plan']>('Básico');
    const [estado, setEstado] = useState<Suscripcion['estado']>('activo');
    const [monto, setMonto] = useState<number | ''>(0);
    const [vencimientoStr, setVencimientoStr] = useState('');

    // Estados Form Pago
    const [pagoMeses, setPagoMeses] = useState(1);
    const [pagoMonto, setPagoMonto] = useState<number | ''>(0);
    const [pagoMetodo, setPagoMetodo] = useState('Efectivo');

    const sucursalesQuery = useMemoFirebase(
        () => (firestore ? query(collection(firestore, 'sucursales'), orderBy('idSucursal')) : null),
        [firestore]
    );

    const { data: sucursales, isLoading } = useCollection<Sucursal>(sucursalesQuery);

    const historialQuery = useMemoFirebase(
        () =>
            firestore && sucursalParaHistorial
                ? query(
                      collection(firestore, `sucursales/${sucursalParaHistorial.id}/pagos_suscripcion`),
                      orderBy('fecha', 'desc')
                  )
                : null,
        [firestore, sucursalParaHistorial]
    );
    const { data: historialPagos, isLoading: isLoadingHistorial } =
        useCollection<PagoSuscripcion>(historialQuery);

    const counts = useMemo(() => {
        const list = sucursales ?? [];
        const activas = list.filter((s) => isSuscripcionActiva(s.suscripcion)).length;
        return {
            todas: list.length,
            activas,
            atencion: list.length - activas,
        };
    }, [sucursales]);

    const filteredSucursales = useMemo(() => {
        if (!sucursales) return [];
        const q = searchTerm.trim().toLowerCase();

        return sucursales.filter((s) => {
            const matchesSearch =
                !q || s.nombre.toLowerCase().includes(q) || s.idSucursal.toString().includes(q);
            if (!matchesSearch) return false;

            if (filtroEstado === 'activas') return isSuscripcionActiva(s.suscripcion);
            if (filtroEstado === 'atencion') return !isSuscripcionActiva(s.suscripcion);
            return true;
        });
    }, [sucursales, searchTerm, filtroEstado]);

    const handleOpenEdit = (s: Sucursal) => {
        setEditingSucursal(s);
        const sub = s.suscripcion || {
            plan: 'Básico',
            estado: 'activo',
            montoAcordado: 0,
            fechaVencimiento: Timestamp.now(),
        };
        setPlan(sub.plan);
        setEstado(sub.estado);
        setMonto(sub.montoAcordado);
        setVencimientoStr(format(sub.fechaVencimiento.toDate(), 'yyyy-MM-dd'));
    };

    const handleOpenPago = (s: Sucursal) => {
        setSucursalParaPago(s);
        setPagoMeses(1);
        setPagoMonto(s.suscripcion?.montoAcordado || 0);
        setPagoMetodo('Efectivo');
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore || !editingSucursal) return;
        setLoading(true);

        try {
            const dateObj = new Date(vencimientoStr);
            dateObj.setHours(23, 59, 59);

            const subActualizada: Suscripcion = {
                plan,
                estado,
                montoAcordado: Number(monto) || 0,
                fechaInicio: editingSucursal.suscripcion?.fechaInicio || Timestamp.now(),
                fechaVencimiento: Timestamp.fromDate(dateObj),
                ciclo: 'Mensual',
                ultimoPago: editingSucursal.suscripcion?.ultimoPago || null,
            };

            await updateDoc(doc(firestore, 'sucursales', editingSucursal.id), {
                suscripcion: subActualizada,
            });

            toast({ title: 'Éxito', description: 'Suscripción actualizada correctamente.' });
            setEditingSucursal(null);
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleRegistrarPago = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore || !sucursalParaPago || !user) return;
        setLoading(true);

        try {
            await registrarPagoSuscripcion(firestore, {
                sucursalId: sucursalParaPago.id,
                monto: Number(pagoMonto) || 0,
                metodo: pagoMetodo,
                meses: pagoMeses,
                usuarioId: user.uid,
            });

            toast({ title: 'Pago Registrado', description: 'La vigencia ha sido extendida correctamente.' });
            setSucursalParaPago(null);
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSuspension = async () => {
        if (!firestore || !sucursalToSuspend) return;
        setLoading(true);
        const { s, m } = sucursalToSuspend;
        const isCurrentlyActive = s.suscripcion?.estado === 'activo';

        try {
            await suspenderSucursalManual(firestore, s.id, isCurrentlyActive, m);
            toast({
                title: isCurrentlyActive ? 'Sucursal Desconectada' : 'Sucursal Reactivada',
                description: `Se ha cambiado el acceso para ${s.nombre}.`,
            });
            setSucursalToSuspend(null);
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const extendOneMonth = () => {
        const current = new Date(vencimientoStr);
        const next = addMonths(current, 1);
        setVencimientoStr(format(next, 'yyyy-MM-dd'));
    };

    return {
        searchTerm,
        setSearchTerm,
        filtroEstado,
        setFiltroEstado,
        loading,
        isLoading,
        counts,
        filteredSucursales,
        editingSucursal,
        setEditingSucursal,
        sucursalToSuspend,
        setSucursalToSuspend,
        sucursalParaPago,
        setSucursalParaPago,
        sucursalParaHistorial,
        setSucursalParaHistorial,
        historialPagos,
        isLoadingHistorial,
        plan,
        setPlan,
        estado,
        setEstado,
        monto,
        setMonto,
        vencimientoStr,
        setVencimientoStr,
        pagoMeses,
        setPagoMeses,
        pagoMonto,
        setPagoMonto,
        pagoMetodo,
        setPagoMetodo,
        handleOpenEdit,
        handleOpenPago,
        handleUpdate,
        handleRegistrarPago,
        handleToggleSuspension,
        extendOneMonth,
    };
}

