'use client';

import {
    ArrowRight,
    CalendarClock,
    HandCoins,
    History,
    Loader2,
    Save,
} from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import type { PagoSuscripcion, Sucursal, Suscripcion } from '@/lib/tipos';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { InputNumero } from '@/components/ui/input-numero';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ModalConfirmacion } from '@/components/comunes';
import { ESTADOS, METODOS, PLANES } from '../_hooks/use-suscripciones-admin';

interface ModalesSuscripcionProps {
    loading: boolean;
    // Pago
    sucursalParaPago: Sucursal | null;
    onClosePago: () => void;
    pagoMeses: number;
    setPagoMeses: (v: number) => void;
    pagoMonto: number | '';
    setPagoMonto: (v: number | '') => void;
    pagoMetodo: string;
    setPagoMetodo: (v: string) => void;
    onRegistrarPago: (e: React.FormEvent) => void;
    // Historial
    sucursalParaHistorial: Sucursal | null;
    onCloseHistorial: () => void;
    historialPagos: PagoSuscripcion[] | null;
    isLoadingHistorial: boolean;
    // Editar
    editingSucursal: Sucursal | null;
    onCloseEdit: () => void;
    plan: Suscripcion['plan'];
    setPlan: (v: Suscripcion['plan']) => void;
    estado: Suscripcion['estado'];
    setEstado: (v: Suscripcion['estado']) => void;
    monto: number | '';
    setMonto: (v: number | '') => void;
    vencimientoStr: string;
    setVencimientoStr: (v: string) => void;
    onExtendOneMonth: () => void;
    onUpdate: (e: React.FormEvent) => void;
    // Suspensión
    sucursalToSuspend: { s: Sucursal; m: 'administrativo' | 'tecnico' } | null;
    onCloseSuspend: () => void;
    onToggleSuspension: () => void;
}

export function ModalesSuscripcion({
    loading,
    sucursalParaPago,
    onClosePago,
    pagoMeses,
    setPagoMeses,
    pagoMonto,
    setPagoMonto,
    pagoMetodo,
    setPagoMetodo,
    onRegistrarPago,
    sucursalParaHistorial,
    onCloseHistorial,
    historialPagos,
    isLoadingHistorial,
    editingSucursal,
    onCloseEdit,
    plan,
    setPlan,
    estado,
    setEstado,
    monto,
    setMonto,
    vencimientoStr,
    setVencimientoStr,
    onExtendOneMonth,
    onUpdate,
    sucursalToSuspend,
    onCloseSuspend,
    onToggleSuspension,
}: ModalesSuscripcionProps) {
    const isActiveToSuspend = sucursalToSuspend?.s.suscripcion?.estado === 'activo';

    return (
        <>
            {/* Modal de Registro de Pago */}
            <Dialog open={!!sucursalParaPago} onOpenChange={(open) => !open && onClosePago()}>
                <DialogContent className="sm:max-w-md rounded-2xl bg-[#1e1e1e] border border-[#2e2e2e] p-6 text-slate-100">
                    <form onSubmit={onRegistrarPago} className="space-y-5">
                        <DialogHeader className="space-y-2 text-left">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                                    <HandCoins className="h-5 w-5" />
                                </div>
                                <div>
                                    <DialogTitle className="font-headline text-lg text-slate-100">
                                        Registrar pago
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-slate-400">
                                        Extender vigencia para{' '}
                                        <span className="font-semibold text-slate-200">
                                            {sucursalParaPago?.nombre}
                                        </span>
                                        .
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-slate-300 ml-1">
                                        Meses a pagar
                                    </Label>
                                    <Select
                                        value={String(pagoMeses)}
                                        onValueChange={(v) => {
                                            const m = Number(v);
                                            setPagoMeses(m);
                                            setPagoMonto(
                                                (sucursalParaPago?.suscripcion?.montoAcordado || 0) * m
                                            );
                                        }}
                                    >
                                        <SelectTrigger className="rounded-full h-9 bg-[#252526] border-[#2e2e2e] text-slate-100">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#252526] border-[#2e2e2e] text-slate-100">
                                            {[1, 2, 3, 6, 12].map((m) => (
                                                <SelectItem key={m} value={String(m)}>
                                                    {m} {m === 1 ? 'Mes' : 'Meses'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-slate-300 ml-1">
                                        Método
                                    </Label>
                                    <Select value={pagoMetodo} onValueChange={setPagoMetodo}>
                                        <SelectTrigger className="rounded-full h-9 bg-[#252526] border-[#2e2e2e] text-slate-100">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#252526] border-[#2e2e2e] text-slate-100">
                                            {METODOS.map((m) => (
                                                <SelectItem key={m} value={m}>
                                                    {m}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-300 ml-1">
                                    Monto a recibir (Q)
                                </Label>
                                <InputNumero
                                    value={pagoMonto}
                                    onChange={(e) =>
                                        setPagoMonto(e.target.value === '' ? '' : Number(e.target.value))
                                    }
                                    className="rounded-full h-11 font-bold text-xl text-emerald-400 bg-[#252526] border-[#2e2e2e] text-center"
                                />
                            </div>

                            <div className="bg-[#252526] border border-[#2e2e2e] p-3.5 rounded-2xl flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-xs font-medium text-slate-400">Vencimiento nuevo</p>
                                    <p className="text-sm font-bold text-slate-100">
                                        {sucursalParaPago?.suscripcion?.fechaVencimiento
                                            ? format(
                                                  addMonths(
                                                      sucursalParaPago.suscripcion.fechaVencimiento.toDate() >
                                                          new Date()
                                                          ? sucursalParaPago.suscripcion.fechaVencimiento.toDate()
                                                          : new Date(),
                                                      pagoMeses
                                                  ),
                                                  'dd MMM, yyyy',
                                                  { locale: es }
                                              )
                                            : format(addMonths(new Date(), pagoMeses), 'dd MMM, yyyy', {
                                                  locale: es,
                                              })}
                                    </p>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="flex flex-row items-center justify-between gap-3 pt-1">
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-full h-9 px-5 bg-[#252526] border-[#2e2e2e] hover:bg-[#313131] text-slate-200 font-semibold"
                                >
                                    Cancelar
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="rounded-full h-9 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                Confirmar y extender
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal de Historial de Pagos */}
            <Dialog
                open={!!sucursalParaHistorial}
                onOpenChange={(open) => !open && onCloseHistorial()}
            >
                <DialogContent className="sm:max-w-2xl rounded-2xl bg-[#1e1e1e] border border-[#2e2e2e] p-6 text-slate-100">
                    <DialogHeader className="space-y-2 text-left">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
                                <History className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="font-headline text-lg text-slate-100">
                                    Historial de pagos
                                </DialogTitle>
                                <DialogDescription className="text-xs text-slate-400">
                                    Registro histórico para{' '}
                                    <span className="font-semibold text-slate-200">
                                        {sucursalParaHistorial?.nombre}
                                    </span>
                                    .
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <ScrollArea className="max-h-[55vh] pr-2">
                        {isLoadingHistorial ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="animate-spin h-7 w-7 text-sky-400" />
                            </div>
                        ) : !historialPagos || historialPagos.length === 0 ? (
                            <div className="py-12 rounded-2xl bg-[#252526] border border-[#2e2e2e] text-center text-sm text-slate-400">
                                No hay pagos registrados para esta sucursal.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {historialPagos.map((pago) => (
                                    <div
                                        key={pago.id}
                                        className="rounded-2xl bg-[#252526] border border-[#2e2e2e] p-4 space-y-3"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="h-10 w-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                                                    <HandCoins className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-base text-slate-100 tabular-nums">
                                                        Q{pago.monto.toFixed(2)}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {format(pago.fecha.toDate(), 'dd MMM, yyyy - hh:mm a', {
                                                            locale: es,
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 space-y-1">
                                                <Badge
                                                    variant="outline"
                                                    className="rounded-full bg-[#1e1e1e] border-[#2e2e2e] text-slate-200 text-[11px] font-semibold px-2.5 py-0.5"
                                                >
                                                    {pago.metodo}
                                                </Badge>
                                                <p className="text-xs font-medium text-slate-400">
                                                    {pago.meses} {pago.meses === 1 ? 'Mes' : 'Meses'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl px-3.5 py-2 flex items-center justify-between text-xs text-slate-400">
                                            <span>
                                                De: {format(pago.vencimientoPrevio.toDate(), 'dd/MM/yyyy')}
                                            </span>
                                            <ArrowRight className="h-3.5 w-3.5 text-sky-400" />
                                            <span className="font-semibold text-slate-200">
                                                A: {format(pago.vencimientoNuevo.toDate(), 'dd/MM/yyyy')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    <DialogFooter className="flex flex-row justify-end pt-2">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-full h-9 px-6 bg-[#252526] border-[#2e2e2e] hover:bg-[#313131] text-slate-200 font-semibold"
                            >
                                Cerrar
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Configuración Completa */}
            <Dialog open={!!editingSucursal} onOpenChange={(open) => !open && onCloseEdit()}>
                <DialogContent className="sm:max-w-md rounded-2xl bg-[#1e1e1e] border border-[#2e2e2e] p-6 text-slate-100">
                    <form onSubmit={onUpdate} className="space-y-5">
                        <DialogHeader className="space-y-2 text-left">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
                                    <CalendarClock className="h-5 w-5" />
                                </div>
                                <div>
                                    <DialogTitle className="font-headline text-lg text-slate-100">
                                        Configurar suscripción
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-slate-400">
                                        Ajusta los términos de servicio para{' '}
                                        <span className="font-semibold text-slate-200">
                                            {editingSucursal?.nombre}
                                        </span>
                                        .
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-slate-300 ml-1">
                                        Plan
                                    </Label>
                                    <Select
                                        value={plan}
                                        onValueChange={(v) => setPlan(v as Suscripcion['plan'])}
                                    >
                                        <SelectTrigger className="rounded-full h-9 bg-[#252526] border-[#2e2e2e] text-slate-100">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#252526] border-[#2e2e2e] text-slate-100">
                                            {PLANES.map((p) => (
                                                <SelectItem key={p} value={p}>
                                                    {p}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-slate-300 ml-1">
                                        Estado
                                    </Label>
                                    <Select
                                        value={estado}
                                        onValueChange={(v) => setEstado(v as Suscripcion['estado'])}
                                    >
                                        <SelectTrigger className="rounded-full h-9 bg-[#252526] border-[#2e2e2e] text-slate-100 capitalize">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#252526] border-[#2e2e2e] text-slate-100">
                                            {ESTADOS.map((e) => (
                                                <SelectItem key={e} value={e} className="capitalize">
                                                    {e}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-300 ml-1">
                                    Monto mensual (Q)
                                </Label>
                                <InputNumero
                                    value={monto}
                                    onChange={(e) =>
                                        setMonto(e.target.value === '' ? '' : Number(e.target.value))
                                    }
                                    className="rounded-full h-9 bg-[#252526] border-[#2e2e2e] text-sky-400 font-bold"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-300 ml-1">
                                    Fecha de vencimiento
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="date"
                                        value={vencimientoStr}
                                        onChange={(e) => setVencimientoStr(e.target.value)}
                                        className="rounded-full h-9 flex-1 bg-[#252526] border-[#2e2e2e] text-slate-100"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onExtendOneMonth}
                                        className="rounded-full h-9 shrink-0 px-4 bg-[#252526] border-[#2e2e2e] hover:bg-[#313131] text-slate-200 font-semibold"
                                    >
                                        +1 Mes
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="flex flex-row items-center justify-between gap-3 pt-1">
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-full h-9 px-5 bg-[#252526] border-[#2e2e2e] hover:bg-[#313131] text-slate-200 font-semibold"
                                >
                                    Cancelar
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="rounded-full h-9 px-5 bg-sky-600 hover:bg-sky-500 text-white font-semibold"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                Guardar cambios
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirmación de Suspensión / Reactivación */}
            <ModalConfirmacion
                open={!!sucursalToSuspend}
                onOpenChange={(open) => !open && onCloseSuspend()}
                tipo={isActiveToSuspend ? 'destructivo' : 'exito'}
                titulo={
                    isActiveToSuspend
                        ? sucursalToSuspend?.m === 'administrativo'
                            ? '¿Suspensión administrativa?'
                            : '¿Simular error de servidor?'
                        : '¿Reactivar acceso?'
                }
                subtitulo={
                    isActiveToSuspend
                        ? sucursalToSuspend?.m === 'administrativo'
                            ? `Estás a punto de desconectar a ${sucursalToSuspend?.s.nombre}. Verán un mensaje de suscripción vencida.`
                            : `Estás a punto de simular una falla de conexión en ${sucursalToSuspend?.s.nombre}. El personal creerá que hay un error técnico.`
                        : `Se restablecerá el acceso para ${sucursalToSuspend?.s.nombre} inmediatamente.`
                }
                textoCancelar="Cancelar"
                textoConfirmar={isActiveToSuspend ? 'Sí, desconectar' : 'Sí, reactivar'}
                procesando={loading}
                onConfirmar={onToggleSuspension}
            />
        </>
    );
}

