'use client'

import { useState, useEffect, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { 
    Loader2, Dices, Trophy, Wallet, Landmark, History, 
    Gamepad2, ShoppingCart, LayoutGrid, 
    Award, MinusCircle, Undo2, AlertTriangle, X, XCircle,
    Check
} from "lucide-react"
import { useFirebase, useUser, useCollection, useMemoFirebase, useDoc } from "@/firebase"
import { collection, doc, query, orderBy, where, Timestamp, increment } from "firebase/firestore"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { 
    registrarPagoPremioTragamonedas, 
    registrarBaseTragamonedas, 
    registrarExtraccionTragamonedas, 
    anularTransaccionTragamonedas 
} from "@/lib/firebase/servicios"
import type { GeneralesTragamonedas, HistorialTragamonedas as HistorialTipo, Generales } from "@/lib/tipos"
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, 
    DialogFooter, DialogClose 
} from "@/components/ui/dialog"
import { 
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { useSucursal } from "@/hooks/use-sucursal"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { InputNumero } from "@/components/ui/input-numero"
import { PermissionGuard } from "@/components/permission-guard"

type EstadoTragamonedas = "activo" | "mantenimiento" | "inactivo";

type Tragamonedas = {
  idTragamonedas: number;
  nombre: string;
  modelo?: string;
  estado: EstadoTragamonedas;
};

type TragamonedasConDocId = Tragamonedas & { docId: string };

const toDate = (fecha: any): Date => {
  if (fecha instanceof Timestamp) return fecha.toDate();
  if (fecha instanceof Date) return fecha;
  if (typeof fecha === 'string') {
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(0);
};

const HistorialModal = ({ maquinaId, maquinaNombre, isOpen, onClose, sucursalId, onAnular }: { maquinaId: string, maquinaNombre: string, isOpen: boolean, onClose: () => void, sucursalId: string, onAnular: (item: HistorialTipo) => void }) => {
    const { firestore } = useFirebase();
    const [mostrarTodo, setMostrarTodo] = useState(false);

    const generalesRef = useMemoFirebase(() => 
        (firestore && sucursalId) ? doc(firestore, `sucursales/${sucursalId}/generales/actual`) : null
    , [firestore, sucursalId]);
    const { data: estadoCaja, isLoading: cargandoEstadoCaja } = useDoc<Generales>(generalesRef);
    
    const fechaInicioPeriodo = useMemo(() => {
        if (!estadoCaja?.fechaInicioPeriodo) return null;
        return toDate(estadoCaja.fechaInicioPeriodo);
    }, [estadoCaja?.fechaInicioPeriodo]);

    const historialQuery = useMemoFirebase(() => {
        if (!firestore || !isOpen || cargandoEstadoCaja || !sucursalId) return null;

        const historialCollectionRef = collection(firestore, `sucursales/${sucursalId}/tragamonedas/${maquinaId}/historial`);
        
        if (mostrarTodo) {
            return query(historialCollectionRef, orderBy('fecha', 'desc'));
        } else {
             return query(historialCollectionRef, where("fecha", ">=", fechaInicioPeriodo || new Date(0)), orderBy('fecha', 'desc'));
        }
    }, [firestore, maquinaId, isOpen, mostrarTodo, fechaInicioPeriodo, cargandoEstadoCaja, sucursalId]);

    const { data: historialData, isLoading: isLoadingHistorial } = useCollection<HistorialTipo>(historialQuery);
    
    const historialOrdenado = useMemo(() => {
        if (!historialData) return [];
        return [...historialData].sort((a,b) => toDate(b.fecha).getTime() - toDate(a.fecha).getTime());
    }, [historialData]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl rounded-2xl font-body p-0 overflow-hidden">
                <div className="p-4 sm:p-6">
                    <DialogHeader className="relative flex flex-col items-center sm:items-start text-center sm:text-left">
                        <DialogTitle className="font-headline text-xl w-full">{maquinaNombre}</DialogTitle>
                        <DialogDescription className="font-body text-sm hidden sm:block">
                            Registro de todos los movimientos para esta máquina.
                        </DialogDescription>
                        <div className="mt-4 sm:mt-0 sm:absolute sm:right-0 sm:top-0 flex items-center space-x-2 bg-muted/50 p-2 rounded-full px-4 w-fit mx-auto sm:mx-0">
                            <Switch id="historial-completo-modal" checked={mostrarTodo} onCheckedChange={setMostrarTodo} />
                            <Label htmlFor="historial-completo-modal" className="text-xs font-medium cursor-pointer font-body">
                                {mostrarTodo ? 'Todo' : 'Turno'}
                            </Label>
                        </div>
                    </DialogHeader>
                    
                    <div className="py-4">
                        {isLoadingHistorial || cargandoEstadoCaja ? (
                            <div className="flex justify-center items-center h-48">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            </div>
                        ) : (
                            <ScrollArea className="h-[60vh] sm:h-[55vh]">
                                <div className="space-y-4 pr-3">
                                    {historialOrdenado.length > 0 ? (
                                        historialOrdenado.map((mov) => {
                                            const esBase = mov.tipo === 'base';
                                            const esExtraccion = mov.tipo === 'extraccion';
                                            const esPremio = mov.tipo.startsWith('premio');

                                            const getIcon = () => {
                                                if(esBase) return <Landmark className="h-5 w-5 text-green-500" />;
                                                if(esExtraccion) return <MinusCircle className="h-5 w-5 text-blue-500" />;
                                                if(esPremio) return <Award className="h-5 w-5 text-amber-500" />;
                                                return null;
                                            }
                                            
                                            const getColor = () => {
                                                if(esBase) return 'text-green-600';
                                                if(esExtraccion) return 'text-blue-600';
                                                if(esPremio) return 'text-destructive';
                                                return '';
                                            }

                                            return (
                                                <div key={mov.id} className="flex items-start gap-3 py-3 border-b last:border-0 font-body">
                                                    <div className='flex-shrink-0'>
                                                        <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
                                                            {getIcon()}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm leading-tight">
                                                            {mov.descripcion}
                                                        </p>
                                                        <p className="text-sm font-bold mt-0.5">
                                                           <span className={getColor()}>
                                                                Q{mov.monto.toFixed(2)}
                                                            </span>
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">
                                                            {format(toDate(mov.fecha), 'dd MMM yyyy, hh:mm a', { locale: es })}
                                                        </p>
                                                    </div>
                                                    <div className="flex-shrink-0 self-center">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-10 w-10 text-muted-foreground hover:text-destructive rounded-full"
                                                                        onClick={() => onAnular(mov)}
                                                                    >
                                                                        <Undo2 className="h-5 w-5" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent><p>Anular transacción</p></TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center text-muted-foreground py-10 font-body">
                                            No hay movimientos registrados.
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="font-body rounded-full px-8 w-full sm:w-auto">Cerrar</Button>
                        </DialogClose>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}

const PagoPremioCard = ({ maquinas, sucursalId, usuarioId }: { maquinas: TragamonedasConDocId[], sucursalId: string, usuarioId: string }) => {
    const { firestore } = useFirebase();
    const { toast } = useToast();

    const [maquinaId, setMaquinaId] = useState('');
    const [tipoPremio, setTipoPremio] = useState<'total' | 'parcial'>('total');
    const [montoTotal, setMontoTotal] = useState<number | ''>('');
    const [montoPagado, setMontoPagado] = useState<number | ''>('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!firestore) return;

        if (!maquinaId) {
            toast({ title: "Error", description: "Debes seleccionar una máquina.", variant: "destructive" });
            return;
        }

        const montoTotalNum = Number(montoTotal);
        if (isNaN(montoTotalNum) || montoTotalNum <= 0) {
            toast({ title: "Error", description: "El monto del premio debe ser un número mayor a cero.", variant: "destructive" });
            return;
        }

        setLoading(true);

        try {
            if (tipoPremio === 'total') {
                await registrarPagoPremioTragamonedas(firestore, sucursalId, {
                    maquinaId,
                    tipoPago: 'total',
                    monto: montoTotalNum
                }, usuarioId);
                toast({ title: "Éxito", description: `Premio total de Q${montoTotalNum} registrado.` });
            } else {
                const montoPagadoNum = Number(montoPagado);
                if (isNaN(montoPagadoNum) || montoPagadoNum < 0) {
                    toast({ title: "Error", description: "El monto pagado debe ser un número válido.", variant: "destructive" });
                    return;
                }
                if (montoPagadoNum > montoTotalNum) {
                     toast({ title: "Error", description: "El monto pagado no puede ser mayor al premio total.", variant: "destructive" });
                     return;
                }
                await registrarPagoPremioTragamonedas(firestore, sucursalId, {
                    maquinaId,
                    tipoPago: 'parcial',
                    montoTotal: montoTotalNum,
                    montoPagado: montoPagadoNum
                }, usuarioId);
                toast({ title: "Éxito", description: `Pago parcial registrado. Deuda actualizada.` });
            }
            setMaquinaId('');
            setTipoPremio('total');
            setMontoTotal('');
            setMontoPagado('');

        } catch (error: any) {
            console.error("Error al registrar premio:", error);
            toast({ title: "Error", description: error.message || "No se pudo registrar the pago del premio.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };


    return (
        <Card className="flex flex-col border-muted/60 shadow-md overflow-hidden font-body">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 font-headline">
                    <Trophy className="h-5 w-5 text-amber-500"/>
                    Registrar premio
                </CardTitle>
                <CardDescription className="text-xs">Abona premios a los jugadores.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="flex-grow flex flex-col justify-center gap-4">
                    <div className="w-full space-y-4">
                        <Select value={maquinaId} onValueChange={setMaquinaId} disabled={loading}>
                            <SelectTrigger id="maquina-premio" className="rounded-full h-10"><SelectValue placeholder="Seleccionar máquina..." /></SelectTrigger>
                            <SelectContent className="font-body">
                                {maquinas.map(m => <SelectItem key={m.docId} value={m.docId}>{m.nombre}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <RadioGroup value={tipoPremio} onValueChange={(v) => setTipoPremio(v as any)} className="flex items-center justify-center gap-4" disabled={loading}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="total" id="pago-total" />
                                <Label htmlFor="pago-total" className="text-sm cursor-pointer">Total</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="parcial" id="pago-parcial" />
                                <Label htmlFor="pago-parcial" className="text-sm cursor-pointer">Parcial</Label>
                            </div>
                        </RadioGroup>
                         {tipoPremio === 'total' ? (
                            <div className="space-y-1">
                                <Label htmlFor="monto-total" className="text-xs ml-3">Monto Premio</Label>
                                <InputNumero 
                                    id="monto-total" 
                                    placeholder="0.00" 
                                    value={montoTotal} 
                                    onChange={e => setMontoTotal(Number(e.target.value))} 
                                    min={0} 
                                    step="0.01" 
                                    disabled={loading} 
                                    className="rounded-full text-center h-10"
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                                />
                            </div>
                       ) : (
                           <div className="space-y-2">
                            <div className="space-y-1">
                                <Label htmlFor="premio-total" className="text-xs ml-3">Total Premio</Label>
                                <InputNumero id="premio-total" placeholder="100.00" value={montoTotal} onChange={e => setMontoTotal(Number(e.target.value))} min={0} step="0.01" disabled={loading} className="rounded-full text-center h-10" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="monto-pagado" className="text-xs ml-3">Monto Pagado</Label>
                                <InputNumero 
                                    id="monto-pagado" 
                                    placeholder="80.00" 
                                    value={montoPagado} 
                                    onChange={e => setMontoPagado(Number(e.target.value))} 
                                    min={0} 
                                    step="0.01" 
                                    disabled={loading} 
                                    className="rounded-full text-center h-10" 
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                                />
                            </div>
                           </div>
                       )}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={loading || !maquinaId} className="w-full rounded-full font-headline h-10">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Award className="mr-2 h-4 w-4" />}
                        Registrar
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}

const MaquinaCard = ({ maquina, sucursalId, onVerHistorial, usuarioId }: { maquina: TragamonedasConDocId, sucursalId: string, onVerHistorial: (maquina: TragamonedasConDocId) => void, usuarioId: string }) => {
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [isBaseModalOpen, setIsBaseModalOpen] = useState(false);
    const [montoBase, setMontoBase] = useState<number | ''>(0);
    const [loadingBase, setLoadingBase] = useState(false);
    
    const [isExtraccionModalOpen, setIsExtraccionModalOpen] = useState(false);
    const [montoExtraccion, setMontoExtraccion] = useState<number | ''>(0);
    const [loadingExtraccion, setLoadingExtraccion] = useState(false);

    const generalesRef = useMemoFirebase(() => {
        if (!firestore || !sucursalId) return null;
        return doc(firestore, `sucursales/${sucursalId}/generales_tragamonedas`, maquina.docId);
    }, [firestore, maquina.docId, sucursalId]);

    const { data: generales, isLoading } = useDoc<GeneralesTragamonedas>(generalesRef);

    const getStatusBadgeVariant = (estado: EstadoTragamonedas) => {
        switch (estado) {
            case 'activo': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case 'mantenimiento': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
            case 'inactivo': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
            default: return 'secondary';
        }
    }

    const handleRegistrarBase = async () => {
        if (!firestore || !sucursalId) return;
        const monto = Number(montoBase);
        if (isNaN(monto) || monto <= 0) {
            toast({ title: "Error", description: "El monto de la base debe ser un número mayor a cero.", variant: "destructive" });
            return;
        }

        setLoadingBase(true);
        try {
            await registrarBaseTragamonedas(firestore, sucursalId, maquina.docId, monto, usuarioId);
            toast({ title: "Éxito", description: `Base de Q${monto.toFixed(2)} registrada para ${maquina.nombre}.` });
            setIsBaseModalOpen(false);
        } catch (error: any) {
            console.error("Error registrando la base:", error);
            toast({ title: "Error", description: error.message || "No se pudo registrar la base.", variant: "destructive" });
        } finally {
            setLoadingBase(false);
        }
    };
    
    const handleRegistrarExtraccion = async () => {
        if (!firestore || !sucursalId) return;
        const monto = Number(montoExtraccion);
        if (isNaN(monto) || monto <= 0) {
            toast({ title: "Error", description: "El monto de la extracción debe ser mayor a cero.", variant: "destructive" });
            return;
        }

        setLoadingExtraccion(true);
        try {
            await registrarExtraccionTragamonedas(firestore, sucursalId, maquina.docId, monto, usuarioId);
            toast({ title: "Éxito", description: `Extracción de Q${monto.toFixed(2)} registrada para ${maquina.nombre}.` });
            setIsExtraccionModalOpen(false);
        } catch (error: any) {
            console.error("Error registrando extracción:", error);
            toast({ title: "Error", description: error.message || "No se pudo registrar la extracción.", variant: "destructive" });
        } finally {
            setLoadingExtraccion(false);
        }
    };
    
    return (
        <>
            <Card className="flex flex-col text-center shadow-md hover:shadow-lg transition-shadow border-muted/60 overflow-hidden font-body">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-bold font-headline">{maquina.nombre}</CardTitle>
                        <Badge className={cn("rounded-full border-0 font-body px-3", getStatusBadgeVariant(maquina.estado))}>{maquina.estado}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col items-center justify-center gap-4 py-2">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <>
                            <Gamepad2 className="h-16 w-16 text-primary/20" />
                            <div className="w-full space-y-2.5 pt-4 border-t text-left">
                                <div className="flex justify-between items-center text-sm px-1">
                                    <span className="flex items-center gap-2 text-muted-foreground"><Wallet className="h-3.5 w-3.5 text-destructive" /> Deuda</span>
                                    <span className="font-bold text-destructive">Q{(generales?.totalDeuda || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm px-1">
                                    <span className="flex items-center gap-2 text-muted-foreground"><Landmark className="h-3.5 w-3.5 text-blue-500" /> Base</span>
                                    <span className="font-bold text-foreground/80">Q{(generales?.totalBase || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm px-1">
                                    <span className="flex items-center gap-2 text-muted-foreground"><Trophy className="h-3.5 w-3.5 text-green-600" /> Extracción</span>
                                    <span className="font-bold text-green-600">Q{(generales?.totalExtraccion || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col gap-2 pt-4 p-4 border-t bg-muted/10">
                    <div className="w-full grid grid-cols-2 gap-2">
                        <Button className="w-full rounded-full font-body h-10 px-2" variant="outline" onClick={() => {setIsBaseModalOpen(true); setMontoBase(0);}}>
                            <Landmark className="mr-1 h-4 w-4" />
                            Base
                        </Button>
                        <Button className="w-full rounded-full font-body h-10 px-2" variant="outline" onClick={() => {setIsExtraccionModalOpen(true); setMontoExtraccion(0);}}>
                            <MinusCircle className="mr-1 h-4 w-4" />
                            Extracción
                        </Button>
                    </div>
                    <PermissionGuard permission="tragamonedas.historial">
                        <Button className="w-full rounded-full font-body h-10" variant="outline" onClick={() => onVerHistorial(maquina)}>
                            <History className="mr-2 h-4 w-4" />
                            Ver historial
                        </Button>
                    </PermissionGuard>
                </CardFooter>
            </Card>

            <Dialog open={isBaseModalOpen} onOpenChange={setIsBaseModalOpen}>
                <DialogContent className="rounded-2xl font-body">
                    <DialogHeader>
                        <DialogTitle className="font-headline text-lg text-center sm:text-left">Registrar base para {maquina.nombre}</DialogTitle>
                        <DialogDescription className="font-body text-center sm:text-left">Ingresa el monto de la base inicial para esta máquina. Se descontará de la existencia de monedas.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <Label htmlFor="monto-base" className="ml-3 font-body">Monto de la base (Q)</Label>
                        <InputNumero 
                            id="monto-base" 
                            placeholder="0" 
                            value={montoBase} 
                            onChange={(e) => setMontoBase(e.target.value === '' ? '' : Number(e.target.value))} 
                            autoFocus 
                            onFocus={e => e.target.select()} 
                            className="text-center rounded-full text-lg h-12 font-body"
                            onKeyDown={(e) => { if (e.key === 'Enter') handleRegistrarBase(); }}
                        />
                    </div>
                    <DialogFooter className="sm:justify-between flex flex-col-reverse sm:flex-row gap-2">
                        <Button variant="outline" className="rounded-full font-body h-10" onClick={() => setIsBaseModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleRegistrarBase} disabled={loadingBase} className="rounded-full font-body h-10">
                            {loadingBase ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                            Confirmar base
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
             <Dialog open={isExtraccionModalOpen} onOpenChange={setIsExtraccionModalOpen}>
                <DialogContent className="rounded-2xl font-body">
                    <DialogHeader>
                        <DialogTitle className="font-headline text-lg text-center sm:text-left">Registrar extracción de {maquina.nombre}</DialogTitle>
                        <DialogDescription className="font-body text-center sm:text-left">Ingresa el monto total retirado de la máquina. El sistema saldará deudas y bases automáticamente.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <Label htmlFor="monto-extraccion" className="ml-3 font-body">Monto extraído (Q)</Label>
                        <InputNumero 
                            id="monto-extraccion" 
                            placeholder="0" 
                            value={montoExtraccion} 
                            onChange={(e) => setMontoExtraccion(e.target.value === '' ? '' : Number(e.target.value))} 
                            autoFocus 
                            onFocus={e => e.target.select()} 
                            className="text-center rounded-full text-lg h-12 font-body"
                            onKeyDown={(e) => { if (e.key === 'Enter') handleRegistrarExtraccion(); }}
                        />
                    </div>
                     <DialogFooter className="sm:justify-between flex flex-col-reverse sm:flex-row gap-2">
                        <Button variant="outline" className="rounded-full font-body h-10" onClick={() => setIsExtraccionModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleRegistrarExtraccion} disabled={loadingExtraccion} className="rounded-full font-body h-10">
                            {loadingExtraccion ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                            Confirmar extracción
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};


export default function PaginaGestionTragamonedas() {
  const [isMounted, setIsMounted] = useState(false);
  
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  const { toast } = useToast();

  const [maquinaSeleccionada, setMaquinaSeleccionada] = useState<TragamonedasConDocId | null>(null);
  const [itemParaAnular, setItemParaAnular] = useState<HistorialTipo | null>(null);
  const [procesandoAnulacion, setProcesandoAnulacion] = useState(false);

  const maquinaIdParaAnular = useRef<string | null>(null);

  // EFECTO DE SEGURIDAD PARA DESBLOQUEAR EL BODY
  useEffect(() => {
    const cleanupBody = () => {
        if (!itemParaAnular && !maquinaSeleccionada) {
            document.body.style.pointerEvents = 'auto';
            document.body.style.overflow = 'auto';
        }
    };

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const pointerEvents = document.body.style.pointerEvents;
                if (pointerEvents === 'none' && !itemParaAnular && !maquinaSeleccionada) {
                    document.body.style.pointerEvents = 'auto';
                }
            }
        });
    });

    observer.observe(document.body, { attributes: true });
    cleanupBody();

    return () => {
        observer.disconnect();
        document.body.style.pointerEvents = 'auto';
    };
  }, [itemParaAnular, maquinaSeleccionada]);

  const tragamonedasQuery = useMemoFirebase(() => {
    if (!firestore || !user || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/tragamonedas`), orderBy("idTragamonedas", "asc"));
  }, [firestore, user, sucursalId]);

  const { data: maquinas, isLoading: isLoadingMaquinas, error } = useCollection<Tragamonedas>(tragamonedasQuery);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const handleConfirmarAnulacion = async () => {
    if (!firestore || !sucursalId || !itemParaAnular || !maquinaIdParaAnular.current || !user) {
        return;
    }
    
    const currentItem = itemParaAnular;
    const currentMaquinaId = maquinaIdParaAnular.current;
    const userId = user.uid;
    
    setItemParaAnular(null); 
    
    document.body.style.pointerEvents = 'auto';
    document.body.style.overflow = 'auto';
    
    setTimeout(async () => {
        setProcesandoAnulacion(true);
        try {
            await anularTransaccionTragamonedas(firestore, sucursalId, currentMaquinaId, currentItem.id, userId);
            toast({ title: "Éxito", description: "La transacción ha sido anulada correctamente." });
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "No se pudo anular la transacción.", variant: "destructive" });
        } finally {
            setProcesandoAnulacion(false);
            document.body.style.pointerEvents = 'auto';
        }
    }, 100);
  };

  const maquinasConDocId = useMemo((): TragamonedasConDocId[] => {
    return (maquinas || []).map((m) => ({ ...m, docId: m.id }));
  }, [maquinas]);

  if (!isMounted) return null;
  
  const isLoading = isLoadingMaquinas || isUserLoading || isLoadingSucursal;

  return (
    <div className="space-y-6 font-body">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className='flex flex-col w-full text-center sm:text-left'>
                <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2 text-foreground">
                    <Dices className="h-6 w-6 text-primary"/>
                    Gestión de Tragamonedas
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Visualiza el estado de las máquinas y registra pagos, bases o extracciones.</p>
            </div>
            <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
                <Button variant="outline" asChild className="rounded-full h-10 font-body">
                    <Link href="/dashboard/ventas">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Ventas
                    </Link>
                </Button>
                <Button variant="outline" asChild className="rounded-full h-10 font-body">
                    <Link href="/dashboard/mesas">
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        Sala de Juegos
                    </Link>
                </Button>
            </div>
        </div>
        
        {isLoading ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        ) : error ? (
            <div className="flex flex-col items-center justify-center text-center text-destructive h-64 border-2 border-dashed border-destructive/50 rounded-lg bg-destructive/10">
                <Dices className="h-12 w-12 mb-4" />
                <p className="font-semibold text-lg font-headline">Acceso Denegado</p>
                <p className="text-sm max-w-sm">No tienes los permisos necesarios para realizar estas operaciones.</p>
            </div>
        ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sucursalId && user && <PagoPremioCard maquinas={maquinasConDocId} sucursalId={sucursalId} usuarioId={user.uid}/>}
                {maquinasConDocId.length > 0 ? maquinasConDocId.map((maquina) => (
                   sucursalId && user && <MaquinaCard key={maquina.docId} maquina={maquina} sucursalId={sucursalId} onVerHistorial={setMaquinaSeleccionada} usuarioId={user.uid} />
                )) : (
                    <div className="col-span-full flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-lg">
                        <Dices className="h-12 w-12 mb-4 text-primary/50" />
                        <p className="font-semibold text-lg font-headline">No hay máquinas registradas</p>
                         <p className="text-sm">
                            Ve a <Link href="/dashboard/configuraciones/tragamonedas" className="text-primary hover:underline">Configuraciones</Link> para añadir una nueva máquina.
                        </p>
                    </div>
                )}
             </div>
        )}

        {maquinaSeleccionada && sucursalId && (
            <HistorialModal
                maquinaId={maquinaSeleccionada.docId}
                maquinaNombre={maquinaSeleccionada.nombre}
                isOpen={!!maquinaSeleccionada}
                onClose={() => setMaquinaSeleccionada(null)}
                sucursalId={sucursalId}
                onAnular={(item) => {
                    maquinaIdParaAnular.current = maquinaSeleccionada.docId;
                    setItemParaAnular(item);
                }}
            />
        )}

        <AlertDialog 
            open={!!itemParaAnular} 
            onOpenChange={(open) => { 
                if(!open) setItemParaAnular(null);
            }}
        >
            <AlertDialogContent 
                className="rounded-2xl font-body"
                onCloseAutoFocus={(e) => e.preventDefault()}
            >
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-destructive font-headline">
                        <AlertTriangle className="h-6 w-6" />
                        ¿Anular transacción?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="font-body">
                        Estás a punto de revertir esta operación. Esto devolverá los montos correspondientes a la máquina y ajustará el inventario de monedas. Esta acción es irreversible.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={procesandoAnulacion} className="rounded-full h-10 font-body">Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmarAnulacion} disabled={procesandoAnulacion} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold rounded-full h-10 font-body">
                        {procesandoAnulacion ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Undo2 className="mr-2 h-4 w-4" />}
                        Anular
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  )
}
