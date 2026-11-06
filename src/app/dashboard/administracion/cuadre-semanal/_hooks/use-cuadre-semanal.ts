import { useState, useMemo, useEffect } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useFirebase, useCollection, useMemoFirebase, useUser } from '@/firebase';
import type { CierreCaja, Compra, Gasto as GastoType, Cuenta, CuadreTragamonedas, TrasladoInterSucursal } from '@/lib/tipos';
import { realizarCuadreSemanal, type CuadreSemanalData } from '@/lib/firebase/servicios/cuadre-semanal';
import { useToast } from '@/hooks/use-toast';
import { useSucursal } from '@/hooks/use-sucursal';

export type CierreCajaConId = CierreCaja & { id: string };
export type CompraPendiente = Compra & { docId: string };
export type GastoPendiente = GastoType & { docId: string };
export type CuadreTragamonedasConId = CuadreTragamonedas & { id: string };

export function useCuadreSemanal() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { toast } = useToast();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();

  // Estados de selección
  const [selectedIngresosEfectivo, setSelectedIngresosEfectivo] = useState<Set<string>>(new Set());
  const [selectedIngresosTarjeta, setSelectedIngresosTarjeta] = useState<Set<string>>(new Set());
  const [selectedIngresosTragamonedas, setSelectedIngresosTragamonedas] = useState<Set<string>>(new Set());
  const [selectedIngresosTraslados, setSelectedIngresosTraslados] = useState<Set<string>>(new Set());
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

  // Consultas Firestore
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

  const trasladosCobroQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(
      collection(firestore, 'traslados'),
      where('sucursalOrigenId', '==', sucursalId)
    );
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
    if (!firestore || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/cuentas`));
  }, [firestore, sucursalId]);

  // Carga de datos
  const { data: ingresosEfectivoData, isLoading: isLoadingEfectivo } = useCollection<CierreCajaConId>(ingresosEfectivoQuery);
  const { data: ingresosTarjetaData, isLoading: isLoadingTarjeta } = useCollection<CierreCajaConId>(ingresosTarjetaQuery);
  const { data: ingresosTragamonedasData, isLoading: isLoadingTragamonedas } = useCollection<CuadreTragamonedasConId>(ingresosTragamonedasQuery);
  const { data: rawTraslados, isLoading: isLoadingTraslados } = useCollection<TrasladoInterSucursal>(trasladosCobroQuery);
  const { data: comprasData, isLoading: isLoadingCompras } = useCollection<Compra>(comprasQuery);
  const { data: gastosData, isLoading: isLoadingGastos } = useCollection<GastoType>(gastosQuery);
  const { data: cuentas, isLoading: isLoadingCuentas } = useCollection<Cuenta>(cuentasQuery);

  // Mapeo y ordenamiento
  const ingresosEfectivoPendientes = useMemo(() => (ingresosEfectivoData || []), [ingresosEfectivoData]);
  const ingresosTarjetaPendientes = useMemo(() => (ingresosTarjetaData || []).sort((a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()), [ingresosTarjetaData]);
  const ingresosTragamonedasPendientes = useMemo(() => (ingresosTragamonedasData || []), [ingresosTragamonedasData]);

  const trasladosCobroPendientes = useMemo(() => {
    if (!rawTraslados) return [];
    return rawTraslados
      .filter((t) => t.estado !== 'cancelado' && (t.estadoLiquidacion === 'pendiente' || !t.estadoLiquidacion))
      .sort((a, b) => {
        const timeA = a.fechaEnvio?.toMillis ? a.fechaEnvio.toMillis() : 0;
        const timeB = b.fechaEnvio?.toMillis ? b.fechaEnvio.toMillis() : 0;
        return timeB - timeA;
      });
  }, [rawTraslados]);

  const ingresosFisicosPendientes = useMemo(() => {
    const ef = ingresosEfectivoPendientes.map(i => ({ ...i, tipoItem: 'caja' as const }));
    const tr = ingresosTragamonedasPendientes.map(i => ({ ...i, tipoItem: 'tragamonedas' as const }));
    return [...ef, ...tr].sort((a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime());
  }, [ingresosEfectivoPendientes, ingresosTragamonedasPendientes]);

  const comprasPendientes = useMemo((): CompraPendiente[] => (comprasData || []).map(c => ({ ...c, docId: c.id })).sort((a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()), [comprasData]);
  const gastosPendientes = useMemo((): GastoPendiente[] => (gastosData || []).map(g => ({ ...g, docId: g.id })).sort((a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()), [gastosData]);

  // Selección
  const handleSelect = (id: string, isSelected: boolean, type: 'ingresoEfectivo' | 'ingresoTarjeta' | 'ingresoTragamonedas' | 'ingresoTraslado' | 'compra' | 'gasto') => {
    const setters: any = {
      ingresoEfectivo: setSelectedIngresosEfectivo,
      ingresoTarjeta: setSelectedIngresosTarjeta,
      ingresoTragamonedas: setSelectedIngresosTragamonedas,
      ingresoTraslado: setSelectedIngresosTraslados,
      compra: setSelectedCompras,
      gasto: setSelectedGastos,
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

  const handleSelectAllTraslados = () => {
    const allIds = trasladosCobroPendientes.map(t => t.id);
    if (selectedIngresosTraslados.size === allIds.length && allIds.length > 0) {
      setSelectedIngresosTraslados(new Set());
    } else {
      setSelectedIngresosTraslados(new Set(allIds));
    }
  };

  const handleSelectAll = (type: 'ingresoTarjeta' | 'compra' | 'gasto') => {
    const sources: any = {
      ingresoTarjeta: ingresosTarjetaPendientes.map(i => i.id),
      compra: comprasPendientes.map(c => c.docId),
      gasto: gastosPendientes.map(g => g.docId),
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
    const ingTrs = trasladosCobroPendientes.filter(t => selectedIngresosTraslados.has(t.id)).reduce((acc, t) => acc + (t.costoTotalTraslado || 0), 0);
    const egCo = comprasPendientes.filter(c => selectedCompras.has(c.docId)).reduce((acc, c) => acc + c.montoTotal, 0);
    const egGa = gastosPendientes.filter(g => selectedGastos.has(g.docId)).reduce((acc, g) => acc + g.monto, 0);

    const ingresos = ingEf + ingTr + ingTg + ingTrs;
    const egresos = egCo + egGa;
    const balanceNeto = ingresos - egresos;

    return { ingresos, egresos, balanceNeto };
  }, [selectedIngresosEfectivo, selectedIngresosTarjeta, selectedIngresosTragamonedas, selectedIngresosTraslados, selectedCompras, selectedGastos, ingresosEfectivoPendientes, ingresosTarjetaPendientes, ingresosTragamonedasPendientes, trasladosCobroPendientes, comprasPendientes, gastosPendientes]);

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
        totalIngresosTraslados: trasladosCobroPendientes.filter(t => selectedIngresosTraslados.has(t.id)).reduce((acc, t) => acc + (t.costoTotalTraslado || 0), 0),
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
        ingresosTraslados: Array.from(selectedIngresosTraslados),
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
      setSelectedIngresosTraslados(new Set());
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

  const isLoading = isLoadingEfectivo || isLoadingTarjeta || isLoadingTragamonedas || isLoadingTraslados || isLoadingCompras || isLoadingGastos || isLoadingCuentas || isLoadingSucursal;
  const hayDatosPendientes = ingresosFisicosPendientes.length > 0 || ingresosTarjetaPendientes.length > 0 || trasladosCobroPendientes.length > 0 || comprasPendientes.length > 0 || gastosPendientes.length > 0;

  return {
    firestore,
    sucursalId,
    isLoading,
    hayDatosPendientes,
    ingresosFisicosPendientes,
    ingresosTarjetaPendientes,
    trasladosCobroPendientes,
    comprasPendientes,
    gastosPendientes,
    selectedIngresosEfectivo,
    selectedIngresosTarjeta,
    selectedIngresosTragamonedas,
    selectedIngresosTraslados,
    selectedCompras,
    selectedGastos,
    totalesCalculados,
    balanceALiquidar,
    setBalanceALiquidar,
    cuentaOrigenId,
    setCuentaOrigenId,
    cuentaDestinoId,
    setCuentaDestinoId,
    cuentas: cuentas || [],
    isLoadingCuentas,
    observaciones,
    setObservaciones,
    isProcessing,
    isConfirmOpen,
    setIsConfirmOpen,
    handleSelect,
    handleSelectAllFisico,
    handleSelectAllTraslados,
    handleSelectAll,
    handleProcess,
  };
}
