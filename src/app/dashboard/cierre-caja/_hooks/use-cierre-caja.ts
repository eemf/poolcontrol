'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Timestamp, doc, collection, query, where, orderBy } from 'firebase/firestore';
import type { Generales, Venta, Mesa } from '@/lib/tipos';
import { useToast } from '@/hooks/use-toast';
import { realizarCierreDeCaja, inicializarCaja } from '@/lib/firebase/servicios/cierre-caja';
import { sincronizarContadorCredito } from '@/lib/firebase/servicios/ventas';
import { toDate } from '@/lib/firebase/servicios/utils';
import { useFirebase, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { useSucursal } from '@/hooks/use-sucursal';

export interface Cuenta {
  id: string;
  nombre: string;
  saldo: number;
  tipo: 'Efectivo' | 'Bancaria';
  idCuenta: number;
}

/**
 * Hook de arqueo y cierre de caja del turno actual.
 * Consolida ventas pendientes, mesas activas y efectivo declarado para ejecutar el cierre atómico.
 */
export function useCierreCaja() {
  const { toast } = useToast();
  const { firestore, user, profile } = useFirebase();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  const efectivoFinalInputRef = useRef<HTMLInputElement>(null);

  // Firestore Docs & Collections
  const generalesRef = useMemoFirebase(() => 
    firestore && sucursalId ? doc(firestore, `sucursales/${sucursalId}/generales/actual`) : null
  , [firestore, sucursalId]);
  const { data: estadoCaja, isLoading: cargandoContext } = useDoc<Generales>(generalesRef);
  
  const cuentasQuery = useMemoFirebase(() => 
    firestore && sucursalId ? query(collection(firestore, `sucursales/${sucursalId}/cuentas`), orderBy('nombre')) : null
  , [firestore, sucursalId]);
  const { data: cuentasData } = useCollection<Cuenta>(cuentasQuery);

  const ventasPendientesQuery = useMemoFirebase(() => 
    firestore && sucursalId ? query(
      collection(firestore, `sucursales/${sucursalId}/ventas`),
      where('estado', '==', 'Pendiente de pago')
    ) : null
  , [firestore, sucursalId]);
  const { data: ventasPendientesData, isLoading: isLoadingVentas } = useCollection<Venta>(ventasPendientesQuery);

  const mesasActivasQuery = useMemoFirebase(() => 
    firestore && sucursalId ? query(
      collection(firestore, `sucursales/${sucursalId}/mesas_de_billar`),
      where('estado', '==', 'ocupado')
    ) : null
  , [firestore, sucursalId]);
  const { data: mesasActivasData, isLoading: isLoadingMesas } = useCollection<Mesa>(mesasActivasQuery);

  // Estados locales
  const [procesandoCierre, setProcesandoCierre] = useState(false);
  const [alertaAbierta, setAlertaAbierta] = useState(false);
  const [cuentaDestinoId, setCuentaDestinoId] = useState('');
  const [efectivoFinalContado, setEfectivoFinalContado] = useState<number | ''>('');
  const [cajaSiguienteTurno, setCajaSiguienteTurno] = useState<number | ''>('');
  const [observaciones, setObservaciones] = useState('');
  
  // Inicialización de Sucursal Nueva
  const [inicializando, setInicializando] = useState(false);
  const [fondoEfectivoInit, setFondoEfectivoInit] = useState<number | ''>(0);
  const [existenciaMonedasInit, setExistenciaMonedasInit] = useState<number | ''>(0);

  // Datos derivados
  const netoMonedasPeriodo = estadoCaja?.totalVentasMonedas || 0;
  const totalVentasTarjeta = estadoCaja?.totalVentasTarjeta || 0;
  const totalMonedasTarjeta = estadoCaja?.totalMonedasTarjeta || 0;
  const totalPagosTarjeta = totalVentasTarjeta + totalMonedasTarjeta;
  const efectivoEnCaja = (estadoCaja?.efectivoInicial || 0) + (estadoCaja?.totalMesas || 0) + (estadoCaja?.totalEfectivo || 0);
  
  const cuentasPendientes = ventasPendientesData || [];
  const mesasActivas = mesasActivasData || [];
  const hayVentasPendientes = cuentasPendientes.length > 0;
  const hayMesasActivas = mesasActivas.length > 0;
  const hayOperacionesPendientes = hayVentasPendientes || hayMesasActivas;
  
  const fechaInicioPeriodo = useMemo(() => {
    if (!estadoCaja?.fechaInicioPeriodo) return null;
    const date = toDate(estadoCaja.fechaInicioPeriodo);
    return isNaN(date.getTime()) ? null : date;
  }, [estadoCaja?.fechaInicioPeriodo]);

  useEffect(() => {
    if (!firestore || !sucursalId || cargandoContext) return;
    sincronizarContadorCredito(firestore, sucursalId).catch(console.error);
  }, [firestore, sucursalId, cargandoContext]);

  useEffect(() => {
    if (cuentasData && cuentasData.length > 0 && !cuentaDestinoId) {
      setCuentaDestinoId(cuentasData[0].id);
    }
  }, [cuentasData, cuentaDestinoId]);

  const cargando = cargandoContext || isLoadingSucursal;
  const focoInicialAplicadoRef = useRef(false);

  useEffect(() => {
    if (!cargando && estadoCaja && fechaInicioPeriodo && !focoInicialAplicadoRef.current) {
      const timer = setTimeout(() => {
        if (efectivoFinalInputRef.current) {
          efectivoFinalInputRef.current.focus();
          focoInicialAplicadoRef.current = true;
        }
      }, 40);
      return () => clearTimeout(timer);
    }
  }, [cargando, estadoCaja, fechaInicioPeriodo]);
  
  const diferencia = useMemo(() => {
    if (typeof efectivoFinalContado !== 'number') return 0;
    return efectivoFinalContado - efectivoEnCaja;
  }, [efectivoFinalContado, efectivoEnCaja]);

  const retiro = useMemo(() => {
    if (typeof efectivoFinalContado !== 'number' || typeof cajaSiguienteTurno !== 'number') return 0;
    return efectivoFinalContado - cajaSiguienteTurno;
  }, [efectivoFinalContado, cajaSiguienteTurno]);

  const manejarInicializarCaja = useCallback(async () => {
    if (!firestore || !sucursalId) return;
    setInicializando(true);
    try {
      await inicializarCaja(firestore, sucursalId, {
        efectivoInicial: Number(fondoEfectivoInit) || 0,
        monedasIniciales: Number(existenciaMonedasInit) || 0
      });
      toast({ title: "Caja Inicializada", description: "El turno de caja ha sido abierto exitosamente." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setInicializando(false);
    }
  }, [firestore, sucursalId, fondoEfectivoInit, existenciaMonedasInit, toast]);

  const manejarCierre = useCallback(async () => {
    setProcesandoCierre(true);
    if (!firestore || !sucursalId || !estadoCaja || !fechaInicioPeriodo || typeof efectivoFinalContado !== 'number' || typeof cajaSiguienteTurno !== 'number' || !cuentaDestinoId) {
      toast({ title: 'Error', description: 'Faltan datos para realizar el cierre.', variant: 'destructive'});
      setProcesandoCierre(false);
      return;
    }

    try {
      await realizarCierreDeCaja(firestore, sucursalId, {
        inicioDelPeriodo: Timestamp.fromDate(fechaInicioPeriodo),
        totalIngresoMesas: estadoCaja.totalMesas,
        totalVentaMonedas: estadoCaja.totalVentasMonedas,
        efectivoInicial: estadoCaja.efectivoInicial,
        pagosTarjeta: totalPagosTarjeta, 
        efectivoEsperado: efectivoEnCaja,
        efectivoFinalContado,
        diferencia: diferencia,
        cajaSiguienteTurno: cajaSiguienteTurno,
        observaciones,
        cuentaDestinoId: cuentaDestinoId,
        usuarioId: user?.uid || 'desconocido',
        usuarioNombre: profile?.nombre || user?.displayName || user?.email || 'Usuario',
        usuarioEmail: user?.email || '',
      });
      
      toast({ title: 'Éxito', description: 'El cierre de caja se realizó correctamente. Se ha iniciado un nuevo período.' });
      setEfectivoFinalContado('');
      setCajaSiguienteTurno('');
      setObservaciones('');
      setAlertaAbierta(false);

    } catch(error) {
      console.error("Error al realizar cierre:", error);
      toast({ title: 'Error en Cierre', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setProcesandoCierre(false);
    }
  }, [
    firestore, 
    sucursalId, 
    estadoCaja, 
    fechaInicioPeriodo, 
    efectivoFinalContado, 
    cajaSiguienteTurno, 
    cuentaDestinoId, 
    totalPagosTarjeta, 
    efectivoEnCaja, 
    diferencia, 
    observaciones, 
    user, 
    profile, 
    toast
  ]);

  return {
    sucursalId,
    estadoCaja,
    cargando: cargandoContext || isLoadingSucursal,
    cargandoValidaciones: isLoadingVentas || isLoadingMesas,
    cuentasData,
    cuentasPendientes,
    mesasActivas,
    hayVentasPendientes,
    hayMesasActivas,
    hayOperacionesPendientes,
    fechaInicioPeriodo,
    procesandoCierre,
    alertaAbierta,
    setAlertaAbierta,
    cuentaDestinoId,
    setCuentaDestinoId,
    efectivoFinalContado,
    setEfectivoFinalContado,
    cajaSiguienteTurno,
    setCajaSiguienteTurno,
    observaciones,
    setObservaciones,
    efectivoFinalInputRef,
    diferencia,
    retiro,
    netoMonedasPeriodo,
    totalVentasTarjeta,
    totalMonedasTarjeta,
    totalPagosTarjeta,
    efectivoEnCaja,
    montoApertura: fondoEfectivoInit,
    setMontoApertura: setFondoEfectivoInit,
    existenciaMonedasInit,
    setExistenciaMonedasInit,
    procesandoApertura: inicializando,
    manejarAperturaCaja: manejarInicializarCaja,
    manejarCierre,
  };
}
