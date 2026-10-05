'use client'

import { useState, useMemo, useEffect } from 'react';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useFirebase, useCollection, useMemoFirebase, useUser } from '@/firebase';
import type { CuadreSemanal, Cuenta } from '@/lib/tipos';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Loader2, FileSignature, ArrowRight, History } from "lucide-react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { InputNumero } from '@/components/ui/input-numero';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { realizarCuadreMensual, type CuadreMensualData } from '@/lib/firebase/servicios/cuadre-mensual';
import { useSucursal } from '@/hooks/use-sucursal';
import { cn } from '@/lib/utils';

type CuadreSemanalConId = CuadreSemanal & { id: string };

export default function CuadreMensualPage() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { toast } = useToast();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();

  const [selectedCuadres, setSelectedCuadres] = useState<Set<string>>(new Set());
  const [balanceALiquidar, setBalanceALiquidar] = useState<number | ''>('');
  const [cuentaOrigenId, setCuentaOrigenId] = useState('');
  const [cuentaDestinoId, setCuentaDestinoId] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const cuadresQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(
        collection(firestore, `sucursales/${sucursalId}/cuadre_semanal`),
        orderBy('fecha', 'desc')
    );
  }, [firestore, sucursalId]);

  const cuentasQuery = useMemoFirebase(() => {
      if(!firestore || !sucursalId) return null;
      return query(collection(firestore, `sucursales/${sucursalId}/cuentas`));
  }, [firestore, sucursalId]);

  const { data: todosLosCuadres, isLoading, error } = useCollection<CuadreSemanalConId>(cuadresQuery);
  const { data: cuentas, isLoading: isLoadingCuentas } = useCollection<Cuenta>(cuentasQuery);
  
  const cuadresSemanales = useMemo(() => {
    if (!todosLosCuadres) return null;
    return todosLosCuadres.filter(c => c.estadoMensual === 'pendiente');
  }, [todosLosCuadres]);

  const handleSelectCuadre = (id: string, isSelected: boolean) => {
    setSelectedCuadres(prev => {
      const newSet = new Set(prev);
      if (isSelected) newSet.add(id);
      else newSet.delete(id);
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (!cuadresSemanales) return;
    if (selectedCuadres.size === cuadresSemanales.length) {
      setSelectedCuadres(new Set());
    } else {
      setSelectedCuadres(new Set(cuadresSemanales.map(c => c.id)));
    }
  };

  const resumenMensual = useMemo(() => {
    const resumenBase = {
        cantidad: 0,
        totalIngresosEfectivo: 0,
        totalIngresosTarjeta: 0,
        totalCompras: 0,
        totalGastos: 0,
        balanceNeto: 0,
        balanceLiquidado: 0,
    };
    
    if (!cuadresSemanales) return resumenBase;

    const seleccionados = cuadresSemanales.filter(c => selectedCuadres.has(c.id));
    
    return seleccionados.reduce((acc, cuadre) => {
        acc.cantidad++;
        acc.totalIngresosEfectivo += (cuadre.resumen.totalIngresosEfectivo || 0);
        acc.totalIngresosTarjeta += (cuadre.resumen.totalIngresosTarjeta || 0);
        acc.totalCompras += (cuadre.resumen.totalCompras || 0);
        acc.totalGastos += (cuadre.resumen.totalGastos || 0);
        acc.balanceNeto += (cuadre.resumen.balanceNetoCalculado || 0);
        acc.balanceLiquidado += (cuadre.resumen.balanceLiquidado || 0);
        return acc;
    }, resumenBase);

  }, [selectedCuadres, cuadresSemanales]);

  useEffect(() => {
    setBalanceALiquidar(resumenMensual.balanceLiquidado);
  }, [resumenMensual.balanceLiquidado]);

  useEffect(() => {
    if (cuentas && cuentas.length > 0) {
      if (!cuentaOrigenId) setCuentaOrigenId(cuentas[0].id);
      if (!cuentaDestinoId) setCuentaDestinoId(cuentas.length > 1 ? cuentas[1].id : cuentas[0].id);
    }
  }, [cuentas, cuentaOrigenId, cuentaDestinoId]);

  const handleProcess = async () => {
    if (!firestore || !user || !sucursalId || !cuentaOrigenId || !cuentaDestinoId) {
      toast({ title: "Error", description: "Faltan datos de configuración (usuario, cuentas).", variant: "destructive" });
      return;
    }
    if (selectedCuadres.size === 0) {
      toast({ title: "Sin Selección", description: "Debes seleccionar al menos un cuadre semanal para procesar.", variant: "default" });
      return;
    }

    setIsProcessing(true);

    const data: CuadreMensualData = {
      usuarioId: user.uid,
      resumen: {
        totalIngresosEfectivo: resumenMensual.totalIngresosEfectivo,
        totalIngresosTarjeta: resumenMensual.totalIngresosTarjeta,
        totalCompras: resumenMensual.totalCompras,
        totalGastos: resumenMensual.totalGastos,
        balanceNetoCalculado: resumenMensual.balanceNeto,
        balanceLiquidado: Number(balanceALiquidar) || 0,
      },
      cuentas: {
        origenId: cuentaOrigenId,
        destinoId: cuentaDestinoId,
      },
      idsCuadresProcesados: Array.from(selectedCuadres),
      observaciones,
    };

    try {
      await realizarCuadreMensual(firestore, sucursalId, data);
      toast({ title: "Éxito", description: "El cuadre mensual se ha procesado correctamente." });
      setSelectedCuadres(new Set());
      setObservaciones('');
      setBalanceALiquidar('');
    } catch (error: any) {
      console.error("Error al procesar cuadre mensual:", error);
      toast({ title: "Error al Procesar", description: error.message || 'Ocurrió un error desconocido.', variant: "destructive" });
    } finally {
      setIsProcessing(false);
      setIsConfirmOpen(false);
    }
  };


  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-destructive h-64 border-2 border-dashed border-destructive/50 rounded-lg bg-destructive/10">
          <FileSignature className="h-12 w-12 mb-4" />
          <p className="font-semibold text-lg">Error de Permisos o de Consulta</p>
          <p className="text-sm max-w-sm">No se pudieron cargar los cuadres. Por favor, revisa tus permisos.</p>
      </div>
    );
  }

  const cargando = isLoading || isLoadingSucursal;

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className='flex flex-col w-full text-center sm:text-left'>
                <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2 text-foreground">
                    <FileSignature className="h-6 w-6 text-primary"/>
                    Cuadre mensual
                </h1>
                <p className="text-sm text-muted-foreground hidden sm:block font-body">Consolida los cierres semanales pendientes para generar el reporte mensual.</p>
            </div>
             <Button variant="outline" asChild className="rounded-full h-10 px-6 shrink-0 w-full sm:w-auto">
                <Link href="/dashboard/administracion/cuadre-mensual/historial">
                    <History className="mr-2 h-4 w-4" /> Historial
                </Link>
            </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Cuadres Semanales Pendientes</CardTitle>
                        <CardDescription>Selecciona los cuadres que deseas incluir en el cierre mensual.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {cargando ? <div className="flex justify-center items-center h-48"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
                        : !cuadresSemanales || cuadresSemanales.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-xl bg-card/40 space-y-3">
                                <FileSignature className="h-12 w-12 text-primary/50" />
                                <div className="space-y-1">
                                    <p className="font-semibold text-lg text-foreground">No hay cuadres semanales pendientes</p>
                                    <p className="text-sm text-muted-foreground">Completa un cuadre semanal para que aparezca aquí o consulta los anteriores.</p>
                                </div>
                                <Button variant="outline" asChild className="rounded-full px-6 gap-2 shadow-xs font-semibold">
                                    <Link href="/dashboard/administracion/cuadre-mensual/historial">
                                        <History className="h-4 w-4" /> Ver Historial de Cuadres Mensuales
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                               <div className="flex items-center p-2 border-b">
                                   <Checkbox id="select-all-cuadres" checked={selectedCuadres.size === cuadresSemanales.length && cuadresSemanales.length > 0} onCheckedChange={handleSelectAll}/>
                                   <Label htmlFor="select-all-cuadres" className="ml-4 flex-1 font-semibold text-sm">Seleccionar Todos</Label>
                                </div>
                               {cuadresSemanales.map(cuadre => (
                                  <div key={cuadre.id} className="flex items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <Checkbox id={`cuadre-${cuadre.id}`} checked={selectedCuadres.has(cuadre.id)} onCheckedChange={(checked) => handleSelectCuadre(cuadre.id, !!checked)}/>
                                    <Label htmlFor={`cuadre-${cuadre.id}`} className="ml-4 flex-1 cursor-pointer">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">#{cuadre.idCuadreSemanal}. Cuadre del {format(cuadre.fecha.toDate(), "dd 'de' LLLL, yyyy", { locale: es })}</span>
                                                    <span className="text-xs text-muted-foreground">{cuadre.cuentas.origenNombre} <ArrowRight className="inline h-3 w-3"/> {cuadre.cuentas.destinoNombre}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-lg text-primary">Q{cuadre.resumen.balanceLiquidado.toFixed(2)}</p>
                                                <Badge variant="outline">Pendiente</Badge>
                                            </div>
                                        </div>
                                    </Label>
                                  </div>
                               ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

             <div className="lg:col-span-1 space-y-4 sticky top-20">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2 font-headline"><FileSignature className="h-5 w-5 text-primary"/>Resumen</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-lg bg-primary/10 text-center border border-primary/20">
                            <p className="text-sm font-medium text-primary">Balance Consolidado</p>
                            <p className="text-3xl font-bold text-primary">Q{resumenMensual.balanceLiquidado.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground mt-1">{resumenMensual.cantidad} de {(cuadresSemanales || []).length} cuadres seleccionados.</p>
                        </div>

                         <div className="space-y-1 pt-4 border-t">
                            <Label htmlFor="balance-liquidar" className="text-base font-medium">Balance a Liquidar (Q)</Label>
                            <InputNumero id="balance-liquidar" placeholder="0.00" value={balanceALiquidar} onChange={e => setBalanceALiquidar(e.target.value === '' ? '' : Number(e.target.value))} className="h-12 text-lg text-center font-bold text-primary" onFocus={(e) => e.target.select()} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="cuenta-origen" className="text-base font-medium">Cuenta Origen</Label>
                            <Select value={cuentaOrigenId} onValueChange={setCuentaOrigenId} disabled={isLoadingCuentas}>
                                <SelectTrigger><SelectValue placeholder={isLoadingCuentas ? "Cargando..." : "Seleccionar origen..."}/></SelectTrigger>
                                <SelectContent>{(cuentas || []).map(c => (<SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor="cuenta-destino" className="text-base font-medium">Cuenta Destino</Label>
                             <Select value={cuentaDestinoId} onValueChange={setCuentaDestinoId} disabled={isLoadingCuentas}>
                                <SelectTrigger><SelectValue placeholder={isLoadingCuentas ? "Cargando..." : "Seleccionar destino..."}/></SelectTrigger>
                                <SelectContent>{(cuentas || []).map(c => (<SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="observaciones">Observaciones</Label>
                            <Textarea id="observaciones" value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Añade notas sobre este cuadre..."/>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button className="w-full rounded-full" disabled={isProcessing || selectedCuadres.size === 0} onClick={() => setIsConfirmOpen(true)}>
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <ArrowRight className="mr-2 h-4 w-4"/>}
                            Procesar Cuadre Mensual
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>

        <AlertDialog open={isConfirmOpen} onOpenChange={isConfirmOpen && !isProcessing ? setIsConfirmOpen : undefined}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Cuadre Mensual</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción procesará los cuadres semanales seleccionados, actualizando sus estados y moviendo el balance entre las cuentas. ¿Deseas continuar?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleProcess} disabled={isProcessing}>Sí, procesar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
