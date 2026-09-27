'use client';

import { useState, useMemo } from 'react';
import { useFirebase, useUser } from '@/firebase';
import { useSucursal } from '@/hooks/use-sucursal';
import { usePermissions } from '@/hooks/use-permissions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from "@/components/ui/progress";
import { 
    Eraser, 
    AlertTriangle, 
    Loader2, 
    ShieldAlert, 
    CheckCircle2, 
    Info,
    ArrowRight
} from 'lucide-react';
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { eliminarVentasPorRango } from '@/lib/firebase/servicios/ventas-mantenimiento';
import { InputNumero } from '@/components/ui/input-numero';

export default function PaginaMantenimientoVentas() {
    const { firestore } = useFirebase();
    const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
    const { hasPermission, isLoading: isLoadingPerms } = usePermissions();
    const { toast } = useToast();

    // Estados de configuración
    const [desdeId, setDesdeId] = useState<number | ''>('');
    const [hastaId, setHastaId] = useState<number | ''>('');
    const [excluirCredito, setExcluirCredito] = useState(true);
    const [excluirPendientes, setExcluirPendientes] = useState(true);

    // Estados de control
    const [procesando, setProcesando] = useState(false);
    const [progreso, setProgreso] = useState(0);
    const [confirmacionAbierta, setConfirmacionAbierta] = useState(false);
    const [resultado, setResultado] = useState<{ total: number } | null>(null);

    const manejarEliminacion = async () => {
        if (!firestore || !sucursalId || desdeId === '' || hastaId === '') return;
        
        setProcesando(true);
        setProgreso(0);
        setResultado(null);
        
        try {
            const total = await eliminarVentasPorRango(
                firestore,
                sucursalId,
                Number(desdeId),
                Number(hastaId),
                excluirCredito,
                excluirPendientes,
                (p) => setProgreso(p)
            );
            
            setResultado({ total });
            toast({ 
                title: "Proceso completado", 
                description: `Se han eliminado ${total} registros de ventas exitosamente.` 
            });
            setDesdeId('');
            setHastaId('');
        } catch (error: any) {
            toast({ 
                title: "Error en mantenimiento", 
                description: error.message, 
                variant: "destructive" 
            });
        } finally {
            setProcesando(false);
            setConfirmacionAbierta(false);
        }
    };

    if (isLoadingSucursal || isLoadingPerms) {
        return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-primary h-10 w-10" /></div>;
    }

    if (!hasPermission('ventas.eliminar_rango')) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 font-body">
                <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
                <h1 className="text-xl font-bold">Acceso no autorizado</h1>
                <p className="text-sm text-muted-foreground max-w-sm">
                    No tienes los privilegios necesarios para realizar tareas de eliminación masiva de registros.
                </p>
            </div>
        );
    }

    const puedeEjecutar = desdeId !== '' && hastaId !== '' && Number(hastaId) >= Number(desdeId);

    return (
        <div className="space-y-6 font-body max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
                    <Eraser className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight font-headline">Mantenimiento de Ventas</h1>
                    <p className="text-sm text-muted-foreground">Borrado masivo de registros por rango de identificación.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-muted/60 shadow-sm overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-lg">Configurar Rango</CardTitle>
                            <CardDescription>Indica el intervalo de IDs de venta que deseas remover.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="desde-id" className="text-xs font-bold uppercase tracking-widest ml-1">Desde ID</Label>
                                    <InputNumero 
                                        id="desde-id" 
                                        placeholder="100" 
                                        value={desdeId} 
                                        onChange={e => setDesdeId(e.target.value === '' ? '' : Number(e.target.value))}
                                        className="rounded-full h-11 text-center font-bold"
                                        disabled={procesando}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hasta-id" className="text-xs font-bold uppercase tracking-widest ml-1">Hasta ID</Label>
                                    <InputNumero 
                                        id="hasta-id" 
                                        placeholder="500" 
                                        value={hastaId} 
                                        onChange={e => setHastaId(e.target.value === '' ? '' : Number(e.target.value))}
                                        className="rounded-full h-11 text-center font-bold"
                                        disabled={procesando}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Reglas de Seguridad</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-3 p-3 rounded-xl border bg-muted/5">
                                        <Checkbox 
                                            id="excluir-credito" 
                                            checked={excluirCredito} 
                                            onCheckedChange={checked => setExcluirCredito(!!checked)} 
                                            disabled={procesando}
                                        />
                                        <Label htmlFor="excluir-credito" className="text-sm font-medium cursor-pointer">
                                            Excluir ventas a Crédito
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 rounded-xl border bg-muted/5">
                                        <Checkbox 
                                            id="excluir-pendientes" 
                                            checked={excluirPendientes} 
                                            onCheckedChange={checked => setExcluirPendientes(!!checked)} 
                                            disabled={procesando}
                                        />
                                        <Label htmlFor="excluir-pendientes" className="text-sm font-medium cursor-pointer">
                                            Excluir ventas Pendientes
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            {procesando && (
                                <div className="space-y-3 pt-4 border-t animate-in fade-in">
                                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-primary">
                                        <span>Procesando eliminación...</span>
                                        <span>{progreso}%</span>
                                    </div>
                                    <Progress value={progreso} className="h-2" />
                                    <p className="text-[10px] text-center text-muted-foreground font-medium italic">
                                        Por favor, no cierres esta ventana hasta que el proceso finalice.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="bg-muted/5 border-t p-4 flex justify-end">
                            <Button 
                                variant="destructive" 
                                disabled={!puedeEjecutar || procesando} 
                                onClick={() => setConfirmacionAbierta(true)}
                                className="rounded-full px-10 font-bold h-11 shadow-lg shadow-destructive/10"
                            >
                                {procesando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eraser className="mr-2 h-4 w-4" />}
                                Ejecutar Eliminación
                            </Button>
                        </CardFooter>
                    </Card>

                    {resultado !== null && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 p-6 rounded-3xl flex items-center gap-4 animate-in zoom-in-95 duration-300">
                            <div className="h-12 w-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="font-black text-emerald-800 dark:text-emerald-400">Proceso Finalizado</p>
                                <p className="text-sm text-emerald-700 dark:text-emerald-300">Se han removido satisfactoriamente <strong>{resultado.total}</strong> registros del sistema.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 shadow-none">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase text-amber-700 dark:text-amber-400 flex items-center gap-2 tracking-widest">
                                <AlertTriangle className="h-4 w-4" /> Advertencia Crítica
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed font-medium">
                            Esta operación es <strong>IRREVERSIBLE</strong>. Una vez eliminados los registros, no se podrán recuperar. 
                            <br/><br/>
                            Se eliminarán tanto los documentos de <strong>Venta</strong> como los registros de <strong>Pagos</strong> asociados para mantener la integridad de los reportes.
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 shadow-none">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase text-blue-700 dark:text-blue-400 flex items-center gap-2 tracking-widest">
                                <Info className="h-4 w-4" /> Recomendación
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-blue-800 dark:text-blue-400 leading-relaxed font-medium">
                            Se recomienda mantener las opciones de exclusión activas para evitar borrar deudas actuales o ventas que aún no han sido cobradas en caja.
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AlertDialog open={confirmacionAbierta} onOpenChange={setConfirmacionAbierta}>
                <AlertDialogContent className="rounded-3xl font-body border-none shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl text-destructive font-headline flex items-center gap-2">
                            <AlertTriangle className="h-6 w-6" /> ¿Confirmar Purga de Datos?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm">
                            Estás a punto de borrar permanentemente las ventas desde el ID <span className="font-bold text-foreground">#{desdeId}</span> hasta el <span className="font-bold text-foreground">#{hastaId}</span>. 
                            <br/><br/>
                            Esta acción afectará directamente al historial financiero y no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-4">
                        <AlertDialogCancel className="rounded-full h-11 px-8 font-semibold">Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={ manejarEliminacion }
                            disabled={procesando}
                            className="bg-destructive hover:bg-destructive/90 rounded-full h-11 px-10 font-bold"
                        >
                            {procesando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eraser className="mr-2 h-4 w-4" />}
                            Sí, Borrar Registros
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
