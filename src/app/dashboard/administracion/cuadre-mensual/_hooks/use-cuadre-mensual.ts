'use client';

import { useState, useMemo, useEffect } from 'react';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { useFirebase, useCollection, useMemoFirebase, useUser } from '@/firebase';
import type { CuadreSemanal, Cuenta } from '@/lib/tipos';
import { useSucursal } from '@/hooks/use-sucursal';
import { useToast } from '@/hooks/use-toast';
import { realizarCuadreMensual, type CuadreMensualData } from '@/lib/firebase/servicios/cuadre-mensual';
import { format, subMonths, startOfMonth } from 'date-fns';

export type CuadreSemanalConId = CuadreSemanal & { id: string };

export function useCuadreMensual() {
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
    if (!firestore || !sucursalId) return null;
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
      toast({ title: "Atención", description: "Faltan datos de configuración (usuario o cuentas).", variant: "destructive" });
      return;
    }
    if (selectedCuadres.size === 0) {
      toast({ title: "Sin Selección", description: "Debes seleccionar al menos un cuadre semanal para procesar.", variant: "default" });
      return;
    }

    setIsProcessing(true);

    const seleccionados = cuadresSemanales ? cuadresSemanales.filter(c => selectedCuadres.has(c.id)) : [];
    let fechaPeriodoDate = new Date();
    if (seleccionados.length > 0) {
      fechaPeriodoDate = seleccionados[0].fecha.toDate();
    } else {
      const hoy = new Date();
      fechaPeriodoDate = hoy.getDate() <= 20 ? subMonths(hoy, 1) : hoy;
    }
    const mesCorrespondiente = format(fechaPeriodoDate, 'yyyy-MM');

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
      mesCorrespondiente,
      fechaPeriodo: Timestamp.fromDate(startOfMonth(fechaPeriodoDate)),
    };

    try {
      await realizarCuadreMensual(firestore, sucursalId, data);
      toast({ title: "Cuadre Mensual Procesado", description: "El cuadre mensual se ha consolidado correctamente." });
      setSelectedCuadres(new Set());
      setObservaciones('');
      setBalanceALiquidar('');
    } catch (error: any) {
      console.error("Error al procesar cuadre mensual:", error);
      toast({ title: "Error al Procesar", description: error.message || 'Ocurrió un error inesperado.', variant: "destructive" });
    } finally {
      setIsProcessing(false);
      setIsConfirmOpen(false);
    }
  };

  const cargando = isLoading || isLoadingSucursal || isLoadingCuentas;

  return {
    cargando,
    error,
    cuadresSemanales,
    cuentas,
    selectedCuadres,
    handleSelectCuadre,
    handleSelectAll,
    resumenMensual,
    balanceALiquidar,
    setBalanceALiquidar,
    cuentaOrigenId,
    setCuentaOrigenId,
    cuentaDestinoId,
    setCuentaDestinoId,
    observaciones,
    setObservaciones,
    isProcessing,
    isConfirmOpen,
    setIsConfirmOpen,
    handleProcess,
  };
}
