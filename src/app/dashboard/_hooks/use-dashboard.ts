'use client';

import { useMemo } from 'react';
import { collection, query, where, orderBy, limit, Timestamp, doc } from 'firebase/firestore';
import { useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { useSucursal } from '@/hooks/use-sucursal';
import { usePermissions } from '@/hooks/use-permissions';
import type { Mesa, Venta, Producto, Generales, CierreCaja, CuadreMensual } from '@/lib/tipos';
import { format, startOfDay, subDays, isSameDay, subMonths, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

const toDate = (fecha: any): Date => {
  if (fecha instanceof Timestamp) return fecha.toDate();
  if (fecha instanceof Date) return fecha;
  if (typeof fecha === 'string') {
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(0);
};

/**
 * Hook principal de métricas del Dashboard operativo de la sucursal.
 * Unifica la consulta de ventas (semana + mes) en un solo listener para reducir lecturas en Firestore.
 */
export function useDashboard() {
  const { firestore } = useFirebase();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  const { hasPermission, isLoading: isLoadingPerms } = usePermissions();

  const hace7Dias = useMemo(() => startOfDay(subDays(new Date(), 6)), []);
  const hace7Meses = useMemo(() => startOfMonth(subMonths(new Date(), 6)), []);
  const inicioMes = useMemo(() => startOfMonth(new Date()), []);
  // Toma la fecha más antigua entre los últimos 7 días y el inicio de mes para consultar ventas una sola vez
  const fechaInicioVentas = useMemo(
    () => (hace7Dias < inicioMes ? hace7Dias : inicioMes),
    [hace7Dias, inicioMes]
  );

  // Consultas
  const mesasQuery = useMemoFirebase(() => 
    (firestore && sucursalId) ? collection(firestore, `sucursales/${sucursalId}/mesas_de_billar`) : null
  , [firestore, sucursalId]);
  const { data: mesas } = useCollection<Mesa>(mesasQuery);

  // Listener unificado de ventas para evitar suscripción duplicada entre semana y mes
  const ventasRangoQuery = useMemoFirebase(() => 
    (firestore && sucursalId) ? query(
      collection(firestore, `sucursales/${sucursalId}/ventas`),
      where('fecha', '>=', Timestamp.fromDate(fechaInicioVentas)),
      orderBy('fecha', 'desc')
    ) : null
  , [firestore, sucursalId, fechaInicioVentas]);
  const { data: ventasRango } = useCollection<Venta>(ventasRangoQuery);

  const ventasSemana = useMemo(
    () => (ventasRango || []).filter((v) => toDate(v.fecha) >= hace7Dias),
    [ventasRango, hace7Dias]
  );
  const ventasMes = useMemo(
    () => (ventasRango || []).filter((v) => toDate(v.fecha) >= inicioMes),
    [ventasRango, inicioMes]
  );

  const productosQuery = useMemoFirebase(() => 
    (firestore && sucursalId) ? collection(firestore, `sucursales/${sucursalId}/productos`) : null
  , [firestore, sucursalId]);
  const { data: productos } = useCollection<Producto>(productosQuery);

  const cierresSemanaQuery = useMemoFirebase(() => 
    (firestore && sucursalId) ? query(
      collection(firestore, `sucursales/${sucursalId}/cierre_caja`),
      where('fecha', '>=', Timestamp.fromDate(hace7Dias)),
      orderBy('fecha', 'asc')
    ) : null
  , [firestore, sucursalId, hace7Dias]);
  const { data: cierresSemana } = useCollection<CierreCaja>(cierresSemanaQuery);

  const cierresMensualesQuery = useMemoFirebase(() => 
    (firestore && sucursalId) ? query(
      collection(firestore, `sucursales/${sucursalId}/cuadre_mensual`),
      where('fecha', '>=', Timestamp.fromDate(hace7Meses)),
      orderBy('fecha', 'asc'),
      limit(12)
    ) : null
  , [firestore, sucursalId, hace7Meses]);
  const { data: cierresMensuales } = useCollection<CuadreMensual>(cierresMensualesQuery);

  const generalesRef = useMemoFirebase(() => 
    (firestore && sucursalId) ? doc(firestore, `sucursales/${sucursalId}/generales/actual`) : null
  , [firestore, sucursalId]);
  const { data: estadoCaja } = useDoc<Generales>(generalesRef);

  // Métricas de ocupación, stock y ventas
  const metrics = useMemo(() => {
    const mesasBillar = mesas?.filter(m => m.tipoDeMesa !== 'Consola') || [];
    const totalBillar = mesasBillar.length;
    const ocupadasBillar = mesasBillar.filter(m => m.estado === 'ocupado').length;
    const percBillar = totalBillar > 0 ? Math.round((ocupadasBillar / totalBillar) * 100) : 0;

    const consolas = mesas?.filter(m => m.tipoDeMesa === 'Consola') || [];
    const totalConsola = consolas.length;
    const ocupadasConsola = consolas.filter(m => m.estado === 'ocupado').length;
    const percConsola = totalConsola > 0 ? Math.round((ocupadasConsola / totalConsola) * 100) : 0;

    const efInicial = estadoCaja?.efectivoInicial || 0;
    const vtasEfe = estadoCaja?.totalEfectivo || 0;
    const alqMesas = estadoCaja?.totalMesas || 0;
    const totalVendidoHoy = efInicial + vtasEfe + alqMesas;

    const listaBajoStock = productos?.filter(p => p.existencia <= (p.existenciaMinima || 0)) || [];
    const bajoStockCount = listaBajoStock.length;

    return { 
      totalBillar, ocupadasBillar, percBillar,
      totalConsola, ocupadasConsola, percConsola,
      totalVendidoHoy, bajoStock: bajoStockCount,
      productosBajoStock: listaBajoStock,
      efInicial, vtasEfe, alqMesas
    };
  }, [mesas, estadoCaja, productos]);

  const getTopStation = (ventas: Venta[]) => {
    const totals: Record<string, number> = {};
    ventas.forEach(v => {
      v.detalles.forEach(det => {
        const esTiempo = det.idProducto?.startsWith('mesa-') || det.idProducto?.startsWith('division-mesa-') || det.idProducto?.startsWith('mesa-ajuste-');
        if (esTiempo) {
          const match = det.nombreProducto.match(/(Mesa|Consola)\s+#\d+/i);
          const name = match ? match[0] : det.nombreProducto;
          totals[name] = (totals[name] || 0) + det.subtotal;
        }
      });
    });
    
    let top = { name: 'Sin registros', total: 0 };
    Object.entries(totals).forEach(([name, total]) => {
      if (total > top.total) top = { name, total };
    });
    return top;
  };

  const topTurno = useMemo(() => {
    if (!ventasSemana || !estadoCaja?.fechaInicioPeriodo) return { name: 'Sin registros', total: 0 };
    const inicio = toDate(estadoCaja.fechaInicioPeriodo);
    const vTurno = ventasSemana.filter(v => toDate(v.fecha) >= inicio);
    return getTopStation(vTurno);
  }, [ventasSemana, estadoCaja]);

  const topSemana = useMemo(() => getTopStation(ventasSemana || []), [ventasSemana]);
  const topMes = useMemo(() => getTopStation(ventasMes || []), [ventasMes]);

  const chartDataSemanal = useMemo(() => {
    const dias = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return {
        fecha: d,
        label: format(d, 'eee', { locale: es }),
        efectivo: 0,
        tarjeta: 0,
        monedas: 0
      };
    });

    if (!cierresSemana) return dias;

    cierresSemana.forEach(c => {
      const fechaCierreOriginal = toDate(c.fecha);
      const fechaAjustada = new Date(fechaCierreOriginal.getTime() - (5 * 60 * 60 * 1000));
      const diaEncontrado = dias.find(d => isSameDay(d.fecha, fechaAjustada));
      if (diaEncontrado) {
        diaEncontrado.efectivo += (c.totalLiquidado || 0);
        diaEncontrado.tarjeta += (c.pagosTarjeta || 0);
        diaEncontrado.monedas += (c.snapshotMonedas?.totalMonedasNetoPeriodo || 0);
      }
    });

    return dias;
  }, [cierresSemana]);

  const chartDataEstaciones = useMemo(() => {
    const dias = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return {
        fecha: d,
        label: format(d, 'eee', { locale: es }),
        Mesas: 0,
        Consolas: 0
      };
    });

    if (!ventasSemana) return dias;

    ventasSemana.forEach(v => {
      const fechaVenta = toDate(v.fecha);
      const diaEncontrado = dias.find(d => isSameDay(d.fecha, fechaVenta));
      if (diaEncontrado) {
        v.detalles.forEach(det => {
          const esTiempo = det.idProducto?.startsWith('mesa-') || det.idProducto?.startsWith('division-mesa-') || det.idProducto?.startsWith('mesa-ajuste-');
          if (esTiempo) {
            if (det.nombreProducto.toLowerCase().includes('consola')) {
              diaEncontrado.Consolas += det.subtotal;
            } else {
              diaEncontrado.Mesas += det.subtotal;
            }
          }
        });
      }
    });

    return dias;
  }, [ventasSemana]);

  const chartDataMensual = useMemo(() => {
    const meses = Array.from({ length: 6 }, (_, i) => {
      const d = startOfMonth(subMonths(new Date(), 5 - i));
      return {
        fecha: d,
        label: format(d, 'MMM', { locale: es }),
        efectivo: 0,
        tarjeta: 0
      };
    });

    if (!cierresMensuales) return meses;

    const getMesCorrespondiente = (c: CuadreMensual): Date => {
      if (c.fechaPeriodo) {
        return startOfMonth(toDate(c.fechaPeriodo));
      }
      if (c.mesCorrespondiente) {
        const parts = c.mesCorrespondiente.split('-');
        if (parts.length === 2) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          if (!isNaN(y) && !isNaN(m)) {
            return new Date(y, m, 1);
          }
        }
      }

      const fechaCierreOriginal = toDate(c.fecha);
      const fechaAjustada = new Date(fechaCierreOriginal.getTime() - (5 * 60 * 60 * 1000));
      
      if (fechaAjustada.getDate() <= 20) {
        return startOfMonth(subMonths(fechaAjustada, 1));
      }
      return startOfMonth(fechaAjustada);
    };

    cierresMensuales.forEach(c => {
      const mesTarget = getMesCorrespondiente(c);
      
      const mesEncontrado = meses.find(m => 
        m.fecha.getMonth() === mesTarget.getMonth() && 
        m.fecha.getFullYear() === mesTarget.getFullYear()
      );
      if (mesEncontrado) {
        const totalTarjeta = c.resumen?.totalIngresosTarjeta || 0;
        const totalLiquidado = c.resumen?.balanceLiquidado || 0;
        
        mesEncontrado.tarjeta += totalTarjeta;
        mesEncontrado.efectivo += Math.max(0, totalLiquidado - totalTarjeta);
      }
    });

    return meses;
  }, [cierresMensuales]);

  const isLoading = isLoadingSucursal || isLoadingPerms;
  const tienePermiso = hasPermission('dashboard.ver');

  return {
    isLoading,
    tienePermiso,
    metrics,
    topTurno,
    topSemana,
    topMes,
    chartDataSemanal,
    chartDataEstaciones,
    chartDataMensual,
  };
}
