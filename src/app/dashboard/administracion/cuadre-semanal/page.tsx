'use client'

import { useState, useMemo, useEffect } from 'react';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { useFirebase, useCollection, useMemoFirebase, useUser } from '@/firebase';
import type { CierreCaja, Compra, Gasto as GastoType, Cuenta, CuadreTragamonedas } from '@/lib/tipos';
import { 
    Loader2, 
} from "lucide-react";
import { realizarCuadreSemanal, type CuadreSemanalData } from '@/lib/firebase/servicios/cuadre-semanal';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useSucursal } from '@/hooks/use-sucursal';

// Componentes modulares en español
import { EncabezadoSemanal } from './_components/encabezado-semanal';
import { IngresosFisicos } from './_components/ingresos-fisicos';
import { IngresosTarjeta } from './_components/ingresos-tarjeta';
import { ListaCompras } from './_components/lista-compras';
import { ListaGastos } from './_components/lista-gastos';
import { BarraResumen } from './_components/barra-resumen';

type CierreCajaConId = CierreCaja & { id: string };
type CompraPendiente = Compra & { docId: string };
type GastoPendiente = GastoType & { docId: string };
type CuadreTragamonedasConId = CuadreTragamonedas & { id: string };

export default function CuadreSemanalPage() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { toast } = useToast();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();

  // Estados de selección
  const [selectedIngresosEfectivo, setSelectedIngresosEfectivo] = useState<Set<string>>(new Set());
  const [selectedIngresosTarjeta, setSelectedIngresosTarjeta] = useState<Set<string>>(new Set());
  const [selectedIngresosTragamonedas, setSelectedIngresosTragamonedas] = useState<Set<string>>(new Set());
  const [selectedCompras, setSelectedCompras] = useState<Set<string>>(new Set());
  const [selectedGastos, setSelectedGastos] = useState<Set<string>>(new Set());
  
  // Estados de formulario
  const [balanceALiquidar, setBalanceALiquidar] = useState<number | ''>('');
  const [cuentaOrigenId, setCuentaOrigenId] = useState('');
  const [cuentaDestinoId, setCuentaDestinoId] = useState('');
  const [observaciones, setObservaciones] = useState('');
  
  // Estados de control
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // --- Consultas Firestore ---
  const ingresosEfectivoQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/cierre_caja`), where('estadoEfectivo', '==', 'pendiente'));
  }, [firestore, sucursalId]);
  
  const ingresosTarjetaQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/cierre_caja`), where('estadoTarjeta', '==', 'pendiente'));
  }, [firestore, sucursalId]);

  const ingresosTragamonedasQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/cuadre_tragamonedas`), where('estado', '==', 'pendiente'));
  }, [firestore, sucursalId]);

  const comprasQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/compras`), where('estado', '==', 'Pendiente'));
  }, [firestore, sucursalId]);

  const gastosQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/gastos`), where('estado', '==', 'pendiente'));
  }, [firestore, sucursalId]);
  
  const cuentasQuery = useMemoFirebase(() => {
      if(!firestore || !sucursalId) return null;
      return query(collection(firestore, `sucursales/${sucursalId}/cuentas`));
  }, [firestore, sucursalId]);

  // Carga de datos
  const { data: ingresosEfectivoData, isLoading: isLoadingEfectivo } = useCollection<CierreCajaConId>(ingresosEfectivoQuery);
  const { data: ingresosTarjetaData, isLoading: isLoadingTarjeta } = useCollection<CierreCajaConId>(ingresosTarjetaQuery);
  const { data: ingresosTragamonedasData, isLoading: isLoadingTragamonedas } = useCollection<CuadreTragamonedasConId>(ingresosTragamonedasQuery);
  const { data: comprasData, isLoading: isLoadingCompras } = useCollection<Compra>(comprasQuery);
  const { data: gastosData, isLoading: isLoadingGastos } = useCollection<GastoType>(gastosQuery);
  const { data: cuentas, isLoading: isLoadingCuentas } = useCollection<Cuenta>(cuentasQuery);

  // Mapeo y ordenamiento de pendientes
  const ingresosEfectivoPendientes = useMemo(() => (ingresosEfectivoData || []), [ingresosEfectivoData]);
  const ingresosTarjetaPendientes = useMemo(() => (ingresosTarjetaData || []).sort((a,b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()), [ingresosTarjetaData]);
  const ingresosTragamonedasPendientes = useMemo(() => (ingresosTragamonedasData || []), [ingresosTragamonedasData]);
  
  const ingresosFisicosPendientes = useMemo(() => {
    const ef = ingresosEfectivoPendientes.map(i => ({ ...i, tipoItem: 'caja' as const }));
    const tr = ingresosTragamonedasPendientes.map(i => ({ ...i, tipoItem: 'tragamonedas' as const }));
    return [...ef, ...tr].sort((a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime());
  }, [ingresosEfectivoPendientes, ingresosTragamonedasPendientes]);

  const comprasPendientes = useMemo((): CompraPendiente[] => (comprasData || []).map(c => ({...c, docId: c.id})).sort((a,b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()), [comprasData]);
  const gastosPendientes = useMemo((): GastoPendiente[] => (gastosData || []).map(g => ({...g, docId: g.id})).sort((a,b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()), [gastosData]);

  // Handlers
  const handleSelect = (id: string, isSelected: boolean, type: 'ingresoEfectivo' | 'ingresoTarjeta' | 'ingresoTragamonedas' | 'compra' | 'gasto') => {
    const setters: any = {
        ingresoEfectivo: setSelectedIngresosEfectivo,
        ingresoTarjeta: setSelectedIngresosTarjeta,
        ingresoTragamonedas: setSelectedIngresosTragamonedas,
        compra: setSelectedCompras,
        gasto: setSelectedGastos
    };
    setters[type]((prev: Set<string>) => {
      const newSet = new Set(prev);
      if (isSelected) newSet.add(id);
      else newSet.delete(id);
      return newSet;
    });
  };
  
  const handleSelectAllFisico = () => {
    const allIdsEfectivo = ingresosEfectivoPendientes.map(i => i.id);
    const allIdsTragamonedas = ingresosTragamonedasPendientes.map(i => i.id);
    if (selectedIngresosEfectivo.size === allIdsEfectivo.length && selectedIngresosTragamonedas.size === allIdsTragamonedas.length) {
      setSelectedIngresosEfectivo(new Set());
      setSelectedIngresosTragamonedas(new Set());
    } else {
      setSelectedIngresosEfectivo(new Set(allIdsEfectivo));
      setSelectedIngresosTragamonedas(new Set(allIdsTragamonedas));
    }
  };

  const handleSelectAll = (type: 'ingresoTarjeta' | 'compra' | 'gasto') => {
    const sources: any = {
        ingresoTarjeta: ingresosTarjetaPendientes.map(i => i.id),
        compra: comprasPendientes.map(c => c.docId),
        gasto: gastosPendientes.map(g => g.docId)
    };
    const currentSet: any = { ingresoTarjeta: selectedIngresosTarjeta, compra: selectedCompras, gasto: selectedGastos }[type];
    const setter: any = { ingresoTarjeta: setSelectedIngresosTarjeta, compra: setSelectedCompras, gasto: setSelectedGastos }[type];

    if (currentSet.size === sources[type].length) setter(new Set());
    else setter(new Set(sources[type]));
  };

  // Cálculos de Resumen
  const totalesCalculados = useMemo(() => {
    const ingEf = ingresosEfectivoPendientes.filter(c => selectedIngresosEfectivo.has(c.id)).reduce((acc, c) => acc + c.totalLiquidado, 0);
    const ingTr = ingresosTarjetaPendientes.filter(c => selectedIngresosTarjeta.has(c.id)).reduce((acc, c) => acc + c.pagosTarjeta, 0);
    const ingTg = ingresosTragamonedasPendientes.filter(c => selectedIngresosTragamonedas.has(c.id)).reduce((acc, c) => acc + c.gananciaATrasladar, 0);
    const egCo = comprasPendientes.filter(c => selectedCompras.has(c.docId)).reduce((acc, c) => acc + c.montoTotal, 0);
    const egGa = gastosPendientes.filter(g => selectedGastos.has(g.docId)).reduce((acc, g) => acc + g.monto, 0);

    const ingresos = ingEf + ingTr + ingTg;
    const egresos = egCo + egGa;
    const balanceNeto = ingresos - egresos;

    return { ingresos, egresos, balanceNeto };
  }, [selectedIngresosEfectivo, selectedIngresosTarjeta, selectedIngresosTragamonedas, selectedCompras, selectedGastos, ingresosEfectivoPendientes, ingresosTarjetaPendientes, ingresosTragamonedasPendientes, comprasPendientes, gastosPendientes]);

  useEffect(() => {
    setBalanceALiquidar(totalesCalculados.balanceNeto);
  }, [totalesCalculados.balanceNeto]);

  useEffect(() => {
    if (cuentas && cuentas.length > 0) {
      if (!cuentaOrigenId) setCuentaOrigenId(cuentas[0].id);
      if (!cuentaDestinoId) setCuentaDestinoId(cuentas.length > 1 ? cuentas[1].id : cuentas[0].id);
    }
  }, [cuentas, cuentaOrigenId, cuentaDestinoId]);

  const handleProcess = async () => {
    if (!firestore || !user || !sucursalId || !cuentaOrigenId || !cuentaDestinoId) {
      toast({ title: "Error", description: "Faltan datos de configuración.", variant: "destructive" });
      return;
    }
    setIsProcessing(true);

    const data: CuadreSemanalData = {
      usuarioId: user.uid,
      resumen: {
        totalIngresosEfectivo: ingresosEfectivoPendientes.filter(c => selectedIngresosEfectivo.has(c.id)).reduce((acc, c) => acc + c.totalLiquidado, 0),
        totalIngresosTarjeta: ingresosTarjetaPendientes.filter(c => selectedIngresosTarjeta.has(c.id)).reduce((acc, c) => acc + c.pagosTarjeta, 0),
        totalIngresosTragamonedas: ingresosTragamonedasPendientes.filter(c => selectedIngresosTragamonedas.has(c.id)).reduce((acc, c) => acc + c.gananciaATrasladar, 0),
        totalCompras: comprasPendientes.filter(c => selectedCompras.has(c.docId)).reduce((acc, c) => acc + c.montoTotal, 0),
        totalGastos: gastosPendientes.filter(g => selectedGastos.has(g.docId)).reduce((acc, g) => acc + g.monto, 0),
        balanceNetoCalculado: totalesCalculados.balanceNeto,
        balanceLiquidado: Number(balanceALiquidar) || 0,
      },
      cuentas: { origenId: cuentaOrigenId, destinoId: cuentaDestinoId },
      idsProcesados: {
        ingresosEfectivo: Array.from(selectedIngresosEfectivo),
        ingresosTarjeta: Array.from(selectedIngresosTarjeta),
        ingresosTragamonedas: Array.from(selectedIngresosTragamonedas),
        compras: Array.from(selectedCompras),
        gastos: Array.from(selectedGastos),
      },
      observaciones,
    };
    
    try {
      await realizarCuadreSemanal(firestore, sucursalId, data);
      toast({ title: "Éxito", description: "Cuadre semanal procesado." });
      setSelectedIngresosEfectivo(new Set());
      setSelectedIngresosTarjeta(new Set());
      setSelectedIngresosTragamonedas(new Set());
      setSelectedCompras(new Set());
      setSelectedGastos(new Set());
      setObservaciones('');
    } catch (error: any) {
      toast({ title: "Error al Procesar", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
      setIsConfirmOpen(false);
    }
  };

  const isLoading = isLoadingEfectivo || isLoadingTarjeta || isLoadingTragamonedas || isLoadingCompras || isLoadingGastos || isLoadingCuentas || isLoadingSucursal;
  const hayDatosPendientes = ingresosFisicosPendientes.length > 0 || ingresosTarjetaPendientes.length > 0 || comprasPendientes.length > 0 || gastosPendientes.length > 0;

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 font-body">
      <EncabezadoSemanal hayDatosPendientes={hayDatosPendientes} />

      {!hayDatosPendientes ? (
        <div className="p-12 text-center border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No hay registros pendientes de procesar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <IngresosFisicos 
              items={ingresosFisicosPendientes} 
              selectedEfectivo={selectedIngresosEfectivo} 
              selectedTragamonedas={selectedIngresosTragamonedas} 
              onSelect={handleSelect} 
              onSelectAll={handleSelectAllFisico} 
            />
            
            <IngresosTarjeta 
              items={ingresosTarjetaPendientes} 
              selected={selectedIngresosTarjeta} 
              onSelect={(id, isSel) => handleSelect(id, isSel, 'ingresoTarjeta')} 
              onSelectAll={() => handleSelectAll('ingresoTarjeta')}
              firestore={firestore}
              sucursalId={sucursalId!}
            />

            <ListaCompras 
              items={comprasPendientes} 
              selected={selectedCompras} 
              onSelect={(id, isSel) => handleSelect(id, isSel, 'compra')} 
              onSelectAll={() => handleSelectAll('compra')} 
            />

            <ListaGastos 
              items={gastosPendientes} 
              selected={selectedGastos} 
              onSelect={(id, isSel) => handleSelect(id, isSel, 'gasto')} 
              onSelectAll={() => handleSelectAll('gasto')} 
            />
          </div>

          <BarraResumen 
            totals={totalesCalculados}
            balanceALiquidar={balanceALiquidar}
            setBalanceALiquidar={setBalanceALiquidar}
            cuentaOrigenId={cuentaOrigenId}
            setCuentaOrigenId={setCuentaOrigenId}
            cuentaDestinoId={cuentaDestinoId}
            setCuentaDestinoId={setCuentaDestinoId}
            cuentas={cuentas || []}
            isLoadingCuentas={isLoadingCuentas}
            observaciones={observaciones}
            setObservaciones={setObservaciones}
            isProcessing={isProcessing}
            onProcess={() => setIsConfirmOpen(true)}
            disabled={isProcessing || (!selectedIngresosEfectivo.size && !selectedIngresosTarjeta.size && !selectedIngresosTragamonedas.size && !selectedCompras.size && !selectedGastos.size)}
          />
        </div>
      )}

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="rounded-3xl font-body">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-xl">Confirmar Cuadre Semanal</AlertDialogTitle>
            <AlertDialogDescription>Esta acción procesará los ítems seleccionados y moverá el balance entre las cuentas. Es definitiva.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full h-11 px-8 font-bold">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleProcess} className="rounded-full h-11 px-10 font-bold shadow-lg">Sí, procesar cuadre</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
