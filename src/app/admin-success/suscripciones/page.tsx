
'use client'

import { useState, useMemo } from "react"
import { useFirebase, useCollection, useMemoFirebase, useUser } from "@/firebase"
import { collection, doc, query, orderBy, Timestamp, updateDoc } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
    CalendarClock, 
    Search, 
    Loader2, 
    Edit, 
    CheckCircle2, 
    Calendar,
    Save,
    Power,
    PowerOff,
    ShieldAlert,
    CloudOff,
    RefreshCw,
    History,
    HandCoins,
    ArrowRight
} from "lucide-react"
import { format, addMonths } from "date-fns"
import { es } from "date-fns/locale"
import type { Sucursal, Suscripcion, PagoSuscripcion } from "@/lib/tipos"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { InputNumero } from "@/components/ui/input-numero"
import { cn } from "@/lib/utils"
import { suspenderSucursalManual } from "@/lib/firebase/servicios/suscripciones"
import { registrarPagoSuscripcion } from "@/lib/firebase/servicios/pagos-suscripcion"
import { 
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"

const PLANES = ['Básico', 'Premium', 'Pro'];
const ESTADOS = ['activo', 'vencido', 'suspendido'];
const METODOS = ['Efectivo', 'Transferencia', 'Tarjeta', 'Otro'];

export default function PaginaSuscripcionesMaestra() {
    const { firestore } = useFirebase();
    const { user } = useUser();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    // Modales
    const [editingSucursal, setEditingSucursal] = useState<Sucursal | null>(null);
    const [sucursalToSuspend, setSucursalToSuspend] = useState<{ s: Sucursal, m: 'administrativo' | 'tecnico' } | null>(null);
    const [sucursalParaPago, setSucursalParaPago] = useState<Sucursal | null>(null);
    const [sucursalParaHistorial, setSucursalParaHistorial] = useState<Sucursal | null>(null);

    // Estados Form Suscripción
    const [plan, setPlan] = useState<Suscripcion['plan']>('Básico');
    const [estado, setEstado] = useState<Suscripcion['estado']>('activo');
    const [monto, setMonto] = useState<number | ''>(0);
    const [vencimientoStr, setVencimientoStr] = useState("");

    // Estados Form Pago
    const [pagoMeses, setPagoMeses] = useState(1);
    const [pagoMonto, setPagoMonto] = useState<number | ''>(0);
    const [pagoMetodo, setPagoMetodo] = useState('Efectivo');

    const sucursalesQuery = useMemoFirebase(() => 
        firestore ? query(collection(firestore, 'sucursales'), orderBy('idSucursal')) : null
    , [firestore]);

    const { data: sucursales, isLoading } = useCollection<Sucursal>(sucursalesQuery);

    const filteredSucursales = useMemo(() => {
        if (!sucursales) return [];
        return sucursales.filter(s => 
            s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.idSucursal.toString().includes(searchTerm)
        );
    }, [sucursales, searchTerm]);

    // Historial de Pagos (Listener Condicional)
    const historialQuery = useMemoFirebase(() => 
        (firestore && sucursalParaHistorial) ? query(collection(firestore, `sucursales/${sucursalParaHistorial.id}/pagos_suscripcion`), orderBy('fecha', 'desc')) : null
    , [firestore, sucursalParaHistorial]);
    const { data: historialPagos, isLoading: isLoadingHistorial } = useCollection<PagoSuscripcion>(historialQuery);

    const handleOpenEdit = (s: Sucursal) => {
        setEditingSucursal(s);
        const sub = s.suscripcion || {
            plan: 'Básico',
            estado: 'activo',
            montoAcordado: 0,
            fechaVencimiento: Timestamp.now()
        };
        setPlan(sub.plan);
        setEstado(sub.estado);
        setMonto(sub.montoAcordado);
        setVencimientoStr(format(sub.fechaVencimiento.toDate(), "yyyy-MM-dd"));
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
                suscripcion: subActualizada
            });

            toast({ title: "Éxito", description: "Suscripción actualizada correctamente." });
            setEditingSucursal(null);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
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
                usuarioId: user.uid
            });

            toast({ title: "Pago Registrado", description: "La vigencia ha sido extendida correctamente." });
            setSucursalParaPago(null);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
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
                title: isCurrentlyActive ? "Sucursal Desconectada" : "Sucursal Reactivada", 
                description: `Se ha cambiado el acceso para ${s.nombre}.` 
            });
            setSucursalToSuspend(null);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const extendOneMonth = () => {
        const current = new Date(vencimientoStr);
        const next = addMonths(current, 1);
        setVencimientoStr(format(next, "yyyy-MM-dd"));
    };

    return (
        <div className="space-y-6 font-body">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <CalendarClock className="h-6 w-6 text-primary" />
                        Gestión de Suscripciones
                    </h1>
                    <p className="text-sm text-muted-foreground">Administra el acceso, pagos y vigencia de todas las sucursales.</p>
                </div>
            </div>

            <Card className="rounded-2xl border-muted/60 shadow-sm overflow-hidden text-foreground">
                <CardHeader className="bg-muted/5 p-4 border-b">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar sucursal..."
                            className="pl-9 rounded-full h-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
                    ) : filteredSucursales.length === 0 ? (
                        <div className="py-20 text-center text-muted-foreground italic">No se encontraron sucursales.</div>
                    ) : (
                        <div className="divide-y divide-muted/40">
                            {filteredSucursales.map(s => {
                                const sub = s.suscripcion;
                                const isVencido = sub?.estado === 'vencido' || (sub?.fechaVencimiento && sub.fechaVencimiento.toDate() < new Date());
                                const isSuspended = sub?.estado === 'suspendido';
                                
                                return (
                                    <div key={s.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/5 transition-colors">
                                        <div className="flex items-center gap-4 min-w-0 flex-1">
                                            <div className={cn(
                                                "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0",
                                                isSuspended ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                                            )}>
                                                {isSuspended ? <PowerOff className="h-6 w-6" /> : (sub?.plan === 'Pro' ? <CheckCircle2 /> : <Calendar />)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-lg truncate">{s.nombre}</p>
                                                    <Badge variant="outline" className="text-[10px] uppercase font-bold px-2 rounded-full">ID {s.idSucursal}</Badge>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 text-xs font-medium">
                                                    <span className="text-muted-foreground uppercase tracking-widest">{sub?.plan || 'Sin Plan'}</span>
                                                    <span className="text-muted-foreground">•</span>
                                                    {sub?.fechaVencimiento ? (
                                                        <span className={cn(isVencido ? "text-destructive font-bold" : "text-muted-foreground")}>
                                                            Vence: {format(sub.fechaVencimiento.toDate(), "dd MMM, yyyy", { locale: es })}
                                                        </span>
                                                    ) : (
                                                        <span className="text-destructive font-bold uppercase tracking-tighter">Sin configurar</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-sm font-bold text-foreground">Q{(sub?.montoAcordado || 0).toFixed(2)}</p>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase">Mensual</p>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                {sub?.estado === 'activo' && !isVencido ? (
                                                    <Badge className="bg-emerald-500 text-white border-none rounded-full h-6">Activo</Badge>
                                                ) : (
                                                    <Badge variant="destructive" className="rounded-full h-6 border-none">
                                                        {isSuspended ? (sub.motivoSuspension === 'tecnico' ? 'Falla Técnica' : 'Suspendido') : 'Vencido'}
                                                    </Badge>
                                                )}
                                                
                                                <div className="flex items-center gap-1 ml-2">
                                                    <TooltipProvider>
                                                        <div className="flex items-center gap-1">
                                                            {/* Registrar Pago */}
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-emerald-600 hover:bg-emerald-50" onClick={() => handleOpenPago(s)}>
                                                                        <HandCoins className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top"><p>Registrar Pago</p></TooltipContent>
                                                            </Tooltip>

                                                            {/* Historial */}
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-primary hover:bg-primary/5" onClick={() => setSucursalParaHistorial(s)}>
                                                                        <History className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top"><p>Historial de Pagos</p></TooltipContent>
                                                            </Tooltip>

                                                            {/* Botón Suspensión Administrativa */}
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="icon" 
                                                                        className={cn(
                                                                            "rounded-full h-10 w-10",
                                                                            isSuspended && sub.motivoSuspension === 'administrativo' ? "text-emerald-600 hover:bg-emerald-50" : "text-destructive hover:bg-destructive/10"
                                                                        )}
                                                                        onClick={() => setSucursalToSuspend({ s, m: 'administrativo' })}
                                                                    >
                                                                        {isSuspended && sub.motivoSuspension === 'administrativo' ? <RefreshCw className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top"><p>{isSuspended ? 'Reactivar' : 'Suspensión Adm.'}</p></TooltipContent>
                                                            </Tooltip>

                                                            {/* Botón Suspensión Técnica */}
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="icon" 
                                                                        className={cn(
                                                                            "rounded-full h-10 w-10",
                                                                            isSuspended && sub.motivoSuspension === 'tecnico' ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-500 hover:bg-slate-100"
                                                                        )}
                                                                        onClick={() => setSucursalToSuspend({ s, m: 'tecnico' })}
                                                                    >
                                                                        {isSuspended && sub.motivoSuspension === 'tecnico' ? <RefreshCw className="h-4 w-4" /> : <CloudOff className="h-4 w-4" />}
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top"><p>{isSuspended ? 'Reactivar' : 'Error Servidor'}</p></TooltipContent>
                                                            </Tooltip>

                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={() => handleOpenEdit(s)}>
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top"><p>Editar Suscripción</p></TooltipContent>
                                                            </Tooltip>
                                                        </div>
                                                    </TooltipProvider>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal de Registro de Pago */}
            <Dialog open={!!sucursalParaPago} onOpenChange={(open) => !open && setSucursalParaPago(null)}>
                <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden text-foreground">
                    <form onSubmit={handleRegistrarPago}>
                        <DialogHeader className="p-6 bg-emerald-500 text-white">
                            <DialogTitle className="font-headline text-xl flex items-center gap-2">
                                <HandCoins className="h-6 w-6" /> Registrar Pago
                            </DialogTitle>
                            <DialogDescription className="text-white/80 font-body text-xs">
                                Extender vigencia para <strong>{sucursalParaPago?.nombre}</strong>.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Meses a Pagar</Label>
                                    <Select value={String(pagoMeses)} onValueChange={(v) => {
                                        const m = Number(v);
                                        setPagoMeses(m);
                                        setPagoMonto((sucursalParaPago?.suscripcion?.montoAcordado || 0) * m);
                                    }}>
                                        <SelectTrigger className="rounded-full h-11"><SelectValue /></SelectTrigger>
                                        <SelectContent className="font-body">
                                            {[1, 2, 3, 6, 12].map(m => <SelectItem key={m} value={String(m)}>{m} {m === 1 ? 'Mes' : 'Meses'}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Método</Label>
                                    <Select value={pagoMetodo} onValueChange={setPagoMetodo}>
                                        <SelectTrigger className="rounded-full h-11"><SelectValue /></SelectTrigger>
                                        <SelectContent className="font-body">
                                            {METODOS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Monto a Recibir (Q)</Label>
                                <InputNumero value={pagoMonto} onChange={e => setPagoMonto(e.target.value === '' ? '' : Number(e.target.value))} className="rounded-full h-12 font-black text-2xl text-emerald-600 bg-emerald-50 border-emerald-200 text-center" />
                            </div>

                            <div className="bg-muted/30 p-4 rounded-2xl flex items-center justify-between">
                                <div className="text-xs">
                                    <p className="text-muted-foreground font-bold uppercase">Vencimiento Nuevo</p>
                                    <p className="font-black text-foreground">
                                        {sucursalParaPago?.suscripcion?.fechaVencimiento && format(addMonths(sucursalParaPago.suscripcion.fechaVencimiento.toDate() > new Date() ? sucursalParaPago.suscripcion.fechaVencimiento.toDate() : new Date(), pagoMeses), "dd MMM, yyyy", { locale: es })}
                                    </p>
                                </div>
                                <ArrowRight className="h-5 w-5 text-emerald-500" />
                            </div>
                        </div>
                        <DialogFooter className="p-6 border-t bg-muted/5 sm:justify-between flex flex-col-reverse sm:flex-row gap-3">
                            <DialogClose asChild><Button type="button" variant="outline" className="rounded-full h-11 px-8 font-bold">Cancelar</Button></DialogClose>
                            <Button type="submit" disabled={loading} className="rounded-full h-11 px-10 font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200">
                                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                                Confirmar y Extender
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal de Historial de Pagos */}
            <Dialog open={!!sucursalParaHistorial} onOpenChange={(open) => !open && setSucursalParaHistorial(null)}>
                <DialogContent className="sm:max-w-2xl rounded-3xl p-0 overflow-hidden text-foreground">
                    <DialogHeader className="p-6 bg-slate-900 text-white">
                        <DialogTitle className="font-headline text-xl flex items-center gap-2">
                            <History className="h-6 w-6" /> Historial de Pagos
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 font-body text-xs">
                            Registro histórico para <strong>{sucursalParaHistorial?.nombre}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] p-6 bg-slate-50 dark:bg-slate-900/50">
                        {isLoadingHistorial ? (
                            <div className="flex justify-center py-10"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
                        ) : historialPagos?.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground italic">No hay pagos registrados.</div>
                        ) : (
                            <div className="space-y-4">
                                {historialPagos?.map(pago => (
                                    <Card key={pago.id} className="rounded-2xl border-muted/60 shadow-sm overflow-hidden bg-white">
                                        <CardContent className="p-4 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                                                    <HandCoins className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-lg text-foreground">Q{pago.monto.toFixed(2)}</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase">{format(pago.fecha.toDate(), "dd MMM, yyyy - hh:mm a")}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="secondary" className="text-[9px] font-bold rounded-full mb-1">{pago.metodo}</Badge>
                                                <p className="text-[10px] font-bold text-muted-foreground">{pago.meses} {pago.meses === 1 ? 'Mes' : 'Meses'}</p>
                                            </div>
                                        </CardContent>
                                        <div className="bg-muted/5 p-2 px-4 border-t flex justify-between items-center text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                            <span>De: {format(pago.vencimientoPrevio.toDate(), "dd/MM/yy")}</span>
                                            <ArrowRight className="h-3 w-3" />
                                            <span>A: {format(pago.vencimientoNuevo.toDate(), "dd/MM/yy")}</span>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                    <div className="p-4 bg-muted/5 border-t text-center">
                        <DialogClose asChild><Button variant="outline" className="rounded-full px-10">Cerrar</Button></DialogClose>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal de Configuración Completa */}
            <Dialog open={!!editingSucursal} onOpenChange={(open) => !open && setEditingSucursal(null)}>
                <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden text-foreground">
                    <form onSubmit={handleUpdate}>
                        <DialogHeader className="p-6 bg-background border-b">
                            <DialogTitle className="font-headline text-xl">Configurar Suscripción</DialogTitle>
                            <DialogDescription className="font-body text-xs">Ajusta los términos de servicio para <strong>{editingSucursal?.nombre}</strong>.</DialogDescription>
                        </DialogHeader>
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Plan</Label>
                                    <Select value={plan} onValueChange={(v: any) => setPlan(v)}>
                                        <SelectTrigger className="rounded-full h-11"><SelectValue /></SelectTrigger>
                                        <SelectContent className="font-body">
                                            {PLANES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Estado</Label>
                                    <Select value={estado} onValueChange={(v: any) => setEstado(v)}>
                                        <SelectTrigger className="rounded-full h-11"><SelectValue /></SelectTrigger>
                                        <SelectContent className="font-body">
                                            {ESTADOS.map(e => <SelectItem key={e} value={e} className="capitalize">{e}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Monto Mensual (Q)</Label>
                                <InputNumero value={monto} onChange={e => setMonto(e.target.value === '' ? '' : Number(e.target.value))} className="rounded-full h-11 font-bold text-primary" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Fecha de Vencimiento</Label>
                                <div className="flex gap-2">
                                    <Input type="date" value={vencimientoStr} onChange={e => setVencimientoStr(e.target.value)} className="rounded-full h-11 flex-1" />
                                    <Button type="button" variant="secondary" onClick={extendOneMonth} className="rounded-full h-11 shrink-0 px-4 font-bold">
                                        +1 Mes
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="p-6 border-t bg-muted/5 sm:justify-between flex flex-col-reverse sm:flex-row gap-3">
                            <DialogClose asChild><Button type="button" variant="outline" className="rounded-full h-11 px-8 font-bold">Cancelar</Button></DialogClose>
                            <Button type="submit" disabled={loading} className="rounded-full h-11 px-10 font-bold shadow-lg shadow-primary/20">
                                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                                Guardar Cambios
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Alerta de Suspensión Manual */}
            <AlertDialog open={!!sucursalToSuspend} onOpenChange={(o) => !o && setSucursalToSuspend(null)}>
                <AlertDialogContent className="rounded-3xl font-body">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-headline text-xl flex items-center gap-2">
                            {sucursalToSuspend?.m === 'administrativo' ? (
                                <ShieldAlert className={cn("h-6 w-6", sucursalToSuspend?.s.suscripcion?.estado === 'activo' ? "text-destructive" : "text-emerald-600")} />
                            ) : (
                                <CloudOff className={cn("h-6 w-6", sucursalToSuspend?.s.suscripcion?.estado === 'activo' ? "text-slate-600" : "text-emerald-600")} />
                            )}
                            {sucursalToSuspend?.s.suscripcion?.estado === 'activo' 
                                ? (sucursalToSuspend.m === 'administrativo' ? "¿Suspensión Administrativa?" : "¿Simular error de servidor?") 
                                : "¿Reactivar acceso?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm">
                            {sucursalToSuspend?.s.suscripcion?.estado === 'activo' 
                                ? (sucursalToSuspend.m === 'administrativo' 
                                    ? `Estás a punto de desconectar a ${sucursalToSuspend?.s.nombre}. Verán un mensaje de suscripción vencida.`
                                    : `Estás a punto de simular una falla de conexión en ${sucursalToSuspend?.s.nombre}. El personal creerá que hay un error técnico.`)
                                : `Se restablecerá el acceso para ${sucursalToSuspend?.s.nombre} inmediatamente.`
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0 sm:justify-between flex flex-col-reverse sm:flex-row">
                        <AlertDialogCancel className="rounded-full h-11 font-bold">Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleToggleSuspension} 
                            disabled={loading}
                            className={cn(
                                "rounded-full h-11 font-bold px-8",
                                sucursalToSuspend?.s.suscripcion?.estado === 'activo' 
                                    ? (sucursalToSuspend.m === 'administrativo' ? "bg-destructive hover:bg-destructive/90" : "bg-slate-700 hover:bg-slate-800")
                                    : "bg-emerald-600 hover:bg-emerald-700"
                            )}
                        >
                            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : (sucursalToSuspend?.s.suscripcion?.estado === 'activo' ? "Sí, Desconectar" : "Sí, Reactivar")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
