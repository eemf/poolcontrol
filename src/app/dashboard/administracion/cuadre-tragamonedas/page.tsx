'use client'

import { useState, useMemo, useEffect } from "react";
import { useFirebase, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import type { Tragamonedas, GeneralesTragamonedas, Generales as GeneralesCaja, Cuenta } from "@/lib/tipos";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, PiggyBank, Calculator, FileCog, Landmark, Wallet, Trophy, ChevronDown, Banknote, History } from "lucide-react";
import { InputNumero } from "@/components/ui/input-numero";
import { realizarCuadreTragamonedas } from "@/lib/firebase/servicios/cuadre-tragamonedas";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getFullGenerales } from "@/lib/firebase/servicios";
import Link from "next/link";
import { useSucursal } from "@/hooks/use-sucursal";

export default function PaginaCuadreTragamonedas() {
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();

    const [montosManuales, setMontosManuales] = useState<{ [key: string]: number | '' }>({});
    const [existenciaSiguiente, setExistenciaSiguiente] = useState<number | ''>('');
    const [efectivoSiguientePeriodo, setEfectivoSiguientePeriodo] = useState<number | ''>('');
    const [gananciaATrasladar, setGananciaATrasladar] = useState<number | ''>(0);
    const [cuentaDestinoId, setCuentaDestinoId] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [alertaAbierta, setAlertaAbierta] = useState(false);
    const [procesando, setProcesando] = useState(false);
    const [cuentas, setCuentas] = useState<Cuenta[]>([]);

    const maquinasQuery = useMemoFirebase(() => 
        (firestore && sucursalId) ? query(collection(firestore, `sucursales/${sucursalId}/tragamonedas`), orderBy('idTragamonedas')) : null,
    [firestore, sucursalId]);
    const { data: maquinas, isLoading: isLoadingMaquinas } = useCollection<Tragamonedas>(maquinasQuery);
    
    const generalesQuery = useMemoFirebase(() =>
        (firestore && sucursalId) ? query(collection(firestore, `sucursales/${sucursalId}/generales_tragamonedas`)) : null,
    [firestore, sucursalId]);
    const { data: generalesData, isLoading: isLoadingGenerales } = useCollection<GeneralesTragamonedas>(generalesQuery);
    
    const generalesCajaRef = useMemoFirebase(() => 
        (firestore && sucursalId) ? doc(firestore, `sucursales/${sucursalId}/generales/actual`) : null
    , [firestore, sucursalId]);
    const { data: generalesCajaData, isLoading: isLoadingGeneralesCaja } = useDoc<GeneralesCaja>(generalesCajaRef);

    const configuracionGeneral = useMemo(() => getFullGenerales(generalesCajaData), [generalesCajaData]);

    useEffect(() => {
        if (generalesCajaData) {
            setExistenciaSiguiente(configuracionGeneral.monedasIniciales || '');
        }
        // Simulación de carga de cuentas
        const cuentasDeEjemplo: Cuenta[] = [{ id: 'caja_chica_1', nombre: 'Caja Chica', saldo: 5000, tipo: 'Efectivo', idCuenta: 1 }];
        setCuentas(cuentasDeEjemplo);
        if (cuentasDeEjemplo.length > 0) setCuentaDestinoId(cuentasDeEjemplo[0].id);
    }, [generalesCajaData, configuracionGeneral]);
    
    const maquinasConGenerales = useMemo(() => {
        if (!maquinas || !generalesData) return [];
        return maquinas.map(maquina => {
            const generales = generalesData.find(g => g.id === maquina.id);
            return {
                ...maquina,
                ...generales,
            }
        });
    }, [maquinas, generalesData]);

    const handleMontoManualChange = (id: string, valor: string) => {
        setMontosManuales(prev => ({ ...prev, [id]: valor === '' ? '' : Number(valor) }));
    };

    const resumen = useMemo(() => {
        let totalManual = 0, totalBase = 0, totalDeuda = 0, totalExtraccionNeta = 0;
        
        maquinasConGenerales.forEach(m => {
            totalManual += Number(montosManuales[m.id] || 0);
            totalBase += m.totalBase || 0;
            totalDeuda += m.totalDeuda || 0;
            totalExtraccionNeta += m.totalExtraccion || 0;
        });

        const totalExtraido = totalManual + totalExtraccionNeta;
        const totalNeto = totalExtraido - totalBase;

        return { totalManual, totalBase, totalDeuda, totalExtraccionNeta, totalExtraido, totalNeto };
    }, [maquinasConGenerales, montosManuales]);

    const porcentajeGanancia = configuracionGeneral.porcentajetragamonedas || 100;
    const gananciaEstimada = resumen.totalNeto * (porcentajeGanancia / 100);

    const handleFinalizarCuadre = async () => {
        if (!firestore || !sucursalId) return;
        setProcesando(true);
        try {
            await realizarCuadreTragamonedas(firestore, sucursalId, {
                maquinas: maquinasConGenerales.map(m => ({
                    id: m.id,
                    nombre: m.nombre,
                    montoManual: Number(montosManuales[m.id] || 0),
                    base: m.totalBase,
                    deuda: m.totalDeuda,
                    extraccion: m.totalExtraccion
                })),
                resumen: {
                    totalManual: resumen.totalManual,
                    totalBase: resumen.totalBase,
                    totalDeuda: resumen.totalDeuda,
                    totalExtraccionNeta: resumen.totalExtraccionNeta,
                },
                existenciaSiguiente: Number(existenciaSiguiente) || 0,
                efectivoAcumuladoSiguiente: Number(efectivoSiguientePeriodo) || 0,
                gananciaATrasladar: Number(gananciaATrasladar) || 0,
                observaciones,
            });
            toast({ title: "Éxito", description: "El cuadre de tragamonedas se ha realizado correctamente." });
            setMontosManuales({});
            setObservaciones('');
            setGananciaATrasladar(0);
            setExistenciaSiguiente('');
            setEfectivoSiguientePeriodo('');

        } catch(error) {
            console.error("Error realizando cuadre:", error);
            toast({ title: "Error", description: "No se pudo finalizar el cuadre.", variant: "destructive" });
        } finally {
            setProcesando(false);
            setAlertaAbierta(false);
        }
    }

    if (isLoadingMaquinas || isLoadingGenerales || isLoadingGeneralesCaja || isLoadingSucursal) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-10 w-10 animate-spin text-primary"/></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className='flex flex-col w-full text-center sm:text-left'>
                    <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2 text-foreground">
                        <PiggyBank className="h-6 w-6 text-primary" />
                        Cuadre de tragamonedas
                    </h1>
                    <p className="text-xs text-muted-foreground hidden sm:block font-body">
                        Control y cierre de las operaciones de las máquinas tragamonedas.
                    </p>
                </div>
                <Button variant="outline" asChild className="rounded-full h-10 px-6 shrink-0 w-full sm:w-auto font-body">
                    <Link href="/dashboard/administracion/cuadre-tragamonedas/historial">
                        <History className="mr-2 h-4 w-4" />
                        Historial
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {maquinasConGenerales.map(maquina => {
                        const montoManual = Number(montosManuales[maquina.id] || 0);
                        const extraccionNeta = maquina.totalExtraccion || 0;
                        const base = maquina.totalBase || 0;
                        const deuda = maquina.totalDeuda || 0;
                        const totalExtraidoMaquina = montoManual + extraccionNeta - base - deuda;

                        return (
                            <Card key={maquina.id}>
                                <CardHeader>
                                    <CardTitle className="text-base">{maquina.nombre}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="space-y-1">
                                        <Label htmlFor={`manual-${maquina.id}`}>Extraído Manual (Q)</Label>
                                        <InputNumero 
                                            id={`manual-${maquina.id}`} 
                                            value={montosManuales[maquina.id] ?? ''} 
                                            onChange={(e) => handleMontoManualChange(maquina.id, e.target.value)} 
                                            placeholder="0.00" 
                                            className="text-center"
                                        />
                                    </div>
                                    <div className="text-sm space-y-1 pt-2">
                                        <div className="flex justify-between items-center"><span className="flex items-center gap-1.5 text-muted-foreground"><Landmark className="h-3 w-3"/>Base Registrada</span> <span className="font-semibold">Q{base.toFixed(2)}</span></div>
                                        <div className="flex justify-between items-center"><span className="flex items-center gap-1.5 text-muted-foreground"><Wallet className="h-3 w-3 text-destructive"/>Deuda Registrada</span> <span className="font-semibold text-destructive">Q{deuda.toFixed(2)}</span></div>
                                        <div className="flex justify-between items-center"><span className="flex items-center gap-1.5 text-muted-foreground"><Trophy className="h-3 w-3 text-green-600"/>Ext. Neta Registrada</span> <span className="font-semibold text-green-600">Q{extraccionNeta.toFixed(2)}</span></div>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-2 bg-green-500/10 rounded-b-lg">
                                    <div className="w-full text-center">
                                        <p className="text-xs font-bold text-green-600">TOTAL EXTRAÍDO DE MÁQUINA</p>
                                        <p className="text-lg font-bold text-green-600">Q{totalExtraidoMaquina.toFixed(2)}</p>
                                    </div>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>

                <div className="lg:col-span-1 space-y-4 sticky top-20">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5"/> Resumen y Cierre</CardTitle>
                             <CardDescription>Defina la base para el siguiente periodo y traslade las ganancias.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1" className="border-b-0">
                                    <div className="p-4 rounded-lg bg-primary/10 border-2 border-dashed border-primary/20 text-center">
                                        <p className="text-sm font-medium text-primary">Ganancia Estimada ({porcentajeGanancia}%)</p>
                                        <p className="text-4xl font-bold text-primary">Q{gananciaEstimada.toFixed(2)}</p>
                                        <AccordionTrigger className="text-xs text-muted-foreground justify-center hover:no-underline py-1 gap-1">
                                            Ver detalle del cálculo
                                        </AccordionTrigger>
                                    </div>
                                    <AccordionContent className="text-xs text-muted-foreground space-y-1 pt-2">
                                        <div className="flex justify-between font-semibold border-b pb-1 mb-1"><span>Total Neto:</span> <span>Q{resumen.totalNeto.toFixed(2)}</span></div>
                                        <div className="flex justify-between"><span>Total Manual:</span> <span className="font-medium">Q{resumen.totalManual.toFixed(2)}</span></div>
                                        <div className="flex justify-between"><span>+ Total Extr. Neta:</span> <span className="font-medium">Q{resumen.totalExtraccionNeta.toFixed(2)}</span></div>
                                        <div className="flex justify-between font-semibold border-t pt-1 mt-1"><span>= Total Extraído:</span> <span>Q{resumen.totalExtraido.toFixed(2)}</span></div>
                                        <div className="flex justify-between text-destructive"><span>- Total Base Devuelta:</span> <span className="font-medium">Q{resumen.totalBase.toFixed(2)}</span></div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Monedas Sig. Periodo (Q)</Label>
                                    <InputNumero value={existenciaSiguiente} onChange={(e) => setExistenciaSiguiente(e.target.value)} placeholder="0" className="text-center" />
                                </div>
                                <div className="space-y-1">
                                    <Label>Efectivo Sig. Periodo (Q)</Label>
                                    <InputNumero value={efectivoSiguientePeriodo} onChange={(e) => setEfectivoSiguientePeriodo(e.target.value)} placeholder="0.00" className="text-center" />
                                </div>
                            </div>
                             <div className="space-y-1">
                                <Label>Ganancia a Trasladar a Cuenta (Q)</Label>
                                <InputNumero value={gananciaATrasladar} onChange={(e) => setGananciaATrasladar(e.target.value)} placeholder="0.00" className="text-center" />
                            </div>
                             <div className="space-y-1">
                                <Label className="flex items-center gap-2"><Banknote className="h-4 w-4" />Cuenta Destino para Traslado</Label>
                                <Select value={cuentaDestinoId} onValueChange={setCuentaDestinoId}>
                                    <SelectTrigger><SelectValue placeholder="Seleccione la cuenta..."/></SelectTrigger>
                                    <SelectContent>{cuentas.map(c => (<SelectItem key={c.id} value={c.id}>{c.nombre} (Q{c.saldo.toFixed(2)})</SelectItem>))}</SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-1">
                                <Label>Notas Adicionales (Opcional)</Label>
                                <Textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Ej: Cuadre semanal de máquinas..."/>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => setAlertaAbierta(true)} disabled={procesando}>
                                {procesando ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FileCog className="mr-2 h-4 w-4"/>}
                                Finalizar y Procesar Cuadre
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            <AlertDialog open={alertaAbierta} onOpenChange={setAlertaAbierta}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Cierre de Tragamonedas</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción registrará un cuadre histórico y reiniciará los totales de base, deuda y extracción de todas las máquinas. ¿Estás seguro de continuar?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={procesando}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleFinalizarCuadre} disabled={procesando}>
                            {procesando && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Sí, Finalizar Cuadre
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
