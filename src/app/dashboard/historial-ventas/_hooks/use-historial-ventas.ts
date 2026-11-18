'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, doc, Timestamp, orderBy, where, getDocs, limit } from 'firebase/firestore';
import { useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import type { Pago, Generales, CierreCaja, Venta } from '@/lib/tipos';
import { useSucursal } from '@/hooks/use-sucursal';
import { useToast } from '@/hooks/use-toast';
import { anularVentaCompleta, cambiarMetodoPago } from '@/lib/firebase/servicios/ventas-historial';

export type PagoConDocId = Pago & { id: string; turnoLabel?: string };

export type VentaAgrupada = {
  ventaDocId: string;
  idVenta: number;
  clienteNombre: string;
  totalPagadoPeriodo: number;
  ventaTotal: number;
  saldoActual: number;
  estadoVenta: 'Pagada' | 'credito' | 'abierta' | string;
  fueCredito: boolean;
  ultimoTurnoLabel?: string;
  pagos: PagoConDocId[];
  ventaOriginal?: Venta;
};

const toDate = (fecha: any): Date => {
  if (fecha instanceof Timestamp) return fecha.toDate();
  if (fecha instanceof Date) return fecha;
  if (typeof fecha === 'string') {
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(0);
};

export function useHistorialVentas() {
  const { firestore, user } = useFirebase();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  const { toast } = useToast();

  const [filtro, setFiltro] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [mostrarTodas, setMostrarTodas] = useState(false);

  // Estados para acciones
  const [ventaAAnular, setVentaAAnular] = useState<VentaAgrupada | null>(null);
  const [pagoACambiar, setPagoACambiar] = useState<{ pago: PagoConDocId; ventaDocId: string } | null>(null);
  const [procesandoAccion, setProcesandoAnulacion] = useState(false);
  const [procesandoCambioMetodo, setProcesandoCambioMetodo] = useState(false);

  const generalesRef = useMemoFirebase(() => 
    firestore && sucursalId ? doc(firestore, `sucursales/${sucursalId}/generales/actual`) : null, 
    [firestore, sucursalId]
  );
  const { data: estadoCaja, isLoading: cargandoEstadoCaja } = useDoc<Generales>(generalesRef);

  const fechaInicioPeriodo = useMemo(() => {
    if (!estadoCaja?.fechaInicioPeriodo) return null;
    return toDate(estadoCaja.fechaInicioPeriodo);
  }, [estadoCaja?.fechaInicioPeriodo]);

  const cierresQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId || !mostrarTodas) return null;
    return query(
      collection(firestore, `sucursales/${sucursalId}/cierre_caja`),
      orderBy('fecha', 'desc'),
      limit(50)
    );
  }, [firestore, sucursalId, mostrarTodas]);
  const { data: cierresData } = useCollection<CierreCaja>(cierresQuery);

  const pagosQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    
    const baseQuery = collection(firestore, `sucursales/${sucursalId}/pagos`);
    
    // Al inicio (Turno Actual): Solo se consultan los pagos registrados a partir del inicio del turno
    if (!mostrarTodas) {
      if (!fechaInicioPeriodo) return null;
      return query(
        baseQuery,
        where('fecha', '>=', Timestamp.fromDate(fechaInicioPeriodo)),
        orderBy('fecha', 'desc')
      );
    }
    
    // Al seleccionar Todos los Turnos: Nueva consulta con límite controlado para rendimiento óptimo
    return query(baseQuery, orderBy('fecha', 'desc'), limit(150));
  }, [firestore, sucursalId, mostrarTodas, fechaInicioPeriodo]);
  const { data: pagosData, isLoading: cargandoPagos, error: errorPagos } = useCollection<Pago>(pagosQuery);

  // Consulta de ventas del turno actual (solo si mostrarTodas es false)
  const ventasTurnoQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId || mostrarTodas || !fechaInicioPeriodo) return null;
    return query(
      collection(firestore, `sucursales/${sucursalId}/ventas`),
      where('fecha', '>=', Timestamp.fromDate(fechaInicioPeriodo))
    );
  }, [firestore, sucursalId, mostrarTodas, fechaInicioPeriodo]);

  // Consulta de ventas para todos los turnos (solo cuando mostrarTodas es true, con límite óptimo)
  const ventasTodasQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId || !mostrarTodas) return null;
    return query(
      collection(firestore, `sucursales/${sucursalId}/ventas`),
      orderBy('fecha', 'desc'),
      limit(150)
    );
  }, [firestore, sucursalId, mostrarTodas]);

  const { data: vTurno } = useCollection<Venta>(ventasTurnoQuery);
  const { data: vTodas } = useCollection<Venta>(ventasTodasQuery);

  const ventasOriginales = useMemo(() => {
    if (mostrarTodas) return vTodas || [];
    return vTurno || [];
  }, [vTurno, vTodas, mostrarTodas]);

  // Caché de ventas históricas que no están en el turno actual ni en crédito abierto
  const [ventasExtras, setVentasExtras] = useState<Map<string, Venta>>(new Map());

  useEffect(() => {
    if (!firestore || !sucursalId || !pagosData || pagosData.length === 0) return;
    const knownIds = new Set((ventasOriginales || []).map((v) => v.id));
    const missingIds = Array.from(
      new Set(
        pagosData
          .map((p) => p.ventaDocId)
          .filter((id) => id && !knownIds.has(id) && !ventasExtras.has(id))
      )
    );

    if (missingIds.length === 0) return;

    let isMounted = true;
    const fetchMissing = async () => {
      const newVentas = new Map(ventasExtras);
      for (let i = 0; i < missingIds.length; i += 10) {
        const batch = missingIds.slice(i, i + 10);
        try {
          const q = query(
            collection(firestore, `sucursales/${sucursalId}/ventas`),
            where('__name__', 'in', batch)
          );
          const snap = await getDocs(q);
          snap.docs.forEach((d) => {
            newVentas.set(d.id, { id: d.id, ...d.data() } as Venta);
          });
        } catch (err) {
          console.error('Error al recuperar ventas históricas para el detalle de cobros:', err);
        }
      }
      if (isMounted) {
        setVentasExtras(newVentas);
      }
    };

    fetchMissing();
    return () => {
      isMounted = false;
    };
  }, [firestore, sucursalId, pagosData, ventasOriginales, ventasExtras]);

  const todasVentasMap = useMemo(() => {
    const map = new Map<string, Venta>();
    (ventasOriginales || []).forEach((v) => map.set(v.id, v));
    ventasExtras.forEach((v, k) => {
      if (!map.has(k)) map.set(k, v);
    });
    return map;
  }, [ventasOriginales, ventasExtras]);

  const ventasAgrupadas = useMemo((): VentaAgrupada[] => {
    if (!pagosData) return [];

    const groups = new Map<string, VentaAgrupada>();
    
    const pagosConTurno = pagosData.map(pago => {
      const fechaPago = toDate(pago.fecha);
      let turnoLabel = 'Anterior';

      if (fechaInicioPeriodo && fechaPago >= fechaInicioPeriodo) {
        turnoLabel = 'Turno actual';
      } else if (cierresData) {
        const cierreAsociado = cierresData.find(c => {
          const fin = toDate(c.fecha);
          const inicio = toDate(c.inicioDelPeriodo);
          return fechaPago >= inicio && fechaPago <= fin;
        });
        if (cierreAsociado) {
          turnoLabel = `Turno #${cierreAsociado.idCuadre}`;
        }
      }

      return { ...pago, id: (pago as any).id, turnoLabel } as PagoConDocId;
    });

    for (const pago of pagosConTurno) {
      if (!pago.ventaDocId) continue;

      const esTurnoActual = pago.turnoLabel === 'Turno actual';
      if (!mostrarTodas && !esTurnoActual) continue;

      const vOriginal = todasVentasMap.get(pago.ventaDocId);

      if (!groups.has(pago.ventaDocId)) {
        groups.set(pago.ventaDocId, {
          ventaDocId: pago.ventaDocId,
          idVenta: pago.idVenta,
          clienteNombre: pago.clienteNombre || vOriginal?.clienteNombre || 'Consumidor Final',
          totalPagadoPeriodo: 0,
          ventaTotal: vOriginal?.total ?? pago.ventaTotal ?? 0,
          saldoActual: vOriginal?.saldo ?? 0,
          estadoVenta: vOriginal?.estado ?? 'Pagada',
          fueCredito: vOriginal?.estado === 'credito' || vOriginal?.fueCredito || false,
          pagos: [],
          ventaOriginal: vOriginal,
        });
      }
      
      const group = groups.get(pago.ventaDocId)!;

      if (!group.clienteNombre || group.clienteNombre.trim() === '' || group.clienteNombre === 'Consumidor Final') {
        const nombreRecuperado = vOriginal?.clienteNombre || pago.clienteNombre;
        if (nombreRecuperado && nombreRecuperado.trim() !== '') {
          group.clienteNombre = nombreRecuperado;
        }
      }

      if (!group.ventaOriginal && vOriginal) {
        group.ventaOriginal = vOriginal;
        group.ventaTotal = vOriginal.total;
        group.saldoActual = vOriginal.saldo;
        group.estadoVenta = vOriginal.estado;
        group.fueCredito = vOriginal.estado === 'credito' || vOriginal.fueCredito || false;
      }
      
      const passFiltro = !filtro || 
        (pago.clienteNombre || '').toLowerCase().includes(filtro.toLowerCase()) ||
        String(pago.idVenta).includes(filtro) ||
        String(pago.idPago).includes(filtro);

      if (passFiltro) {
        group.pagos.push(pago);
        group.totalPagadoPeriodo += (pago.montoTotalPagado || 0);
      }
    }
    
    let result = Array.from(groups.values()).filter(v => v.pagos.length > 0);

    result.forEach(venta => {
      venta.pagos.sort((a, b) => toDate(b.fecha).getTime() - toDate(a.fecha).getTime());
      venta.ultimoTurnoLabel = venta.pagos[0]?.turnoLabel;
      if (venta.ventaTotal <= 0) {
        venta.ventaTotal = Math.max(venta.totalPagadoPeriodo, venta.pagos[0]?.ventaTotal || 0);
      }
    });
    
    result.sort((a, b) => {
      const fechaA = toDate(a.pagos[0]?.fecha);
      const fechaB = toDate(b.pagos[0]?.fecha);
      return fechaB.getTime() - fechaA.getTime();
    });
    
    return result;
  }, [pagosData, filtro, fechaInicioPeriodo, mostrarTodas, cierresData, todasVentasMap]);

  const totalPages = Math.ceil(ventasAgrupadas.length / itemsPerPage);

  const ventasPaginadas = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return ventasAgrupadas.slice(startIndex, startIndex + itemsPerPage);
  }, [ventasAgrupadas, currentPage, itemsPerPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, filtro, mostrarTodas]);

  const confirmarAnulacion = async () => {
    if (!firestore || !sucursalId || !ventaAAnular || !user) return;
    setProcesandoAnulacion(true);
    try {
      await anularVentaCompleta(firestore, sucursalId, ventaAAnular.ventaDocId, user.uid);
      toast({ title: "Venta Anulada", description: `La venta #${ventaAAnular.idVenta} ha sido anulada exitosamente.` });
      setVentaAAnular(null);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setProcesandoAnulacion(false);
    }
  };

  const confirmarCambioMetodo = async () => {
    if (!firestore || !sucursalId || !pagoACambiar) return;
    const nuevoMetodo = pagoACambiar.pago.metodoPago === 'Efectivo' ? 'Tarjeta' : 'Efectivo';
    setProcesandoCambioMetodo(true);
    try {
      await cambiarMetodoPago(firestore, sucursalId, pagoACambiar.pago.id, nuevoMetodo);
      toast({ title: "Método Actualizado", description: `El pago ahora está registrado como ${nuevoMetodo}.` });
      setPagoACambiar(null);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setProcesandoCambioMetodo(false);
    }
  };

  const isLoading = isLoadingSucursal || cargandoPagos || (mostrarTodas ? false : cargandoEstadoCaja);

  return {
    filtro,
    setFiltro,
    mostrarTodas,
    setMostrarTodas,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    ventasAgrupadas,
    ventasPaginadas,
    handleNextPage,
    handlePreviousPage,
    ventaAAnular,
    setVentaAAnular,
    pagoACambiar,
    setPagoACambiar,
    procesandoAccion,
    procesandoCambioMetodo,
    confirmarAnulacion,
    confirmarCambioMetodo,
    isLoading,
    errorPagos,
  };
}
