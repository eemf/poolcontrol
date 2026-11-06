import { useState, useMemo } from 'react';
import { collection, query, orderBy, doc, Timestamp, where, collectionGroup } from 'firebase/firestore';
import { useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import type { CierreCaja, Generales, Pago, HistorialInventario, HistorialTragamonedas } from '@/lib/tipos';
import { useSucursal } from '@/hooks/use-sucursal';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceStrict } from 'date-fns';
import { es } from 'date-fns/locale';

/** Helper para conversión de fechas segura */
export const toDate = (fecha: any): Date => {
  if (fecha instanceof Timestamp) return fecha.toDate();
  if (fecha instanceof Date) return fecha;
  if (typeof fecha === 'string') {
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(0);
};

export function useMonitoreoIntegral() {
  const { firestore } = useFirebase();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  const { toast } = useToast();

  const [periodoId, setPeriodoId] = useState<string>('actual');
  const [tabActiva, setTabActiva] = useState<string>('gaveta');

  // 1. Obtener cierres pasados para el selector
  const cierresQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/cierre_caja`), orderBy('fecha', 'desc'));
  }, [firestore, sucursalId]);
  const { data: cierres } = useCollection<CierreCaja>(cierresQuery);

  // 2. Obtener estado de caja actual
  const generalesRef = useMemoFirebase(
    () => (firestore && sucursalId ? doc(firestore, `sucursales/${sucursalId}/generales/actual`) : null),
    [firestore, sucursalId]
  );
  const { data: turnoActual, isLoading: isLoadingTurno } = useDoc<Generales>(generalesRef);

  // 3. Configuración del rango del período seleccionado
  const configPeriodo = useMemo(() => {
    if (periodoId === 'actual') {
      if (!turnoActual) return null;
      const inicio = toDate(turnoActual.fechaInicioPeriodo);
      return {
        label: 'Turno actual',
        inicio,
        fin: null,
        esTurnoAbierto: true,
        monedasIniciales: turnoActual.monedasTurnoAbierto ?? turnoActual.monedasIniciales ?? 0,
        efectivoInicial: turnoActual.efectivoInicial ?? 0,
        efectivoInicialMonedas: 0,
        efectivoAcumuladoMonedas: turnoActual.efectivoAcumuladoMonedas ?? 0,
        idCuadre: null,
      };
    }
    const cierre = cierres?.find((c) => c.id === periodoId);
    if (!cierre) return null;
    return {
      label: `Turno #${cierre.idCuadre}`,
      inicio: toDate(cierre.inicioDelPeriodo),
      fin: toDate(cierre.fecha),
      esTurnoAbierto: false,
      monedasIniciales: cierre.snapshotMonedas?.existenciaAlInicio ?? cierre.snapshotMonedas?.existencia ?? 0,
      efectivoInicial: cierre.efectivoInicial ?? 0,
      efectivoInicialMonedas: 0,
      efectivoAcumuladoMonedas: cierre.snapshotMonedas?.efectivoAcumulado ?? 0,
      idCuadre: cierre.idCuadre,
    };
  }, [periodoId, turnoActual, cierres]);

  // 4. Consultas de movimientos filtradas por el período
  const pagosQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId || !configPeriodo) return null;
    const baseRef = collection(firestore, `sucursales/${sucursalId}/pagos`);
    if (configPeriodo.fin) {
      return query(
        baseRef,
        where('fecha', '>=', configPeriodo.inicio),
        where('fecha', '<=', configPeriodo.fin),
        orderBy('fecha', 'asc')
      );
    }
    return query(baseRef, where('fecha', '>=', configPeriodo.inicio), orderBy('fecha', 'asc'));
  }, [firestore, sucursalId, configPeriodo]);
  const { data: pagos, isLoading: isLoadingPagos } = useCollection<Pago>(pagosQuery);

  const inventarioQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId || !configPeriodo) return null;
    const baseRef = collection(firestore, `sucursales/${sucursalId}/historial_inventario`);
    if (configPeriodo.fin) {
      return query(
        baseRef,
        where('fecha', '>=', configPeriodo.inicio),
        where('fecha', '<=', configPeriodo.fin),
        orderBy('fecha', 'asc')
      );
    }
    return query(baseRef, where('fecha', '>=', configPeriodo.inicio), orderBy('fecha', 'asc'));
  }, [firestore, sucursalId, configPeriodo]);
  const { data: inventario, isLoading: isLoadingInventario } = useCollection<HistorialInventario>(inventarioQuery);

  const tragamonedasQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId || !configPeriodo) return null;
    const baseRef = collectionGroup(firestore, 'historial');
    if (configPeriodo.fin) {
      return query(
        baseRef,
        where('sucursalId', '==', sucursalId),
        where('fecha', '>=', configPeriodo.inicio),
        where('fecha', '<=', configPeriodo.fin),
        orderBy('fecha', 'asc')
      );
    }
    return query(baseRef, where('sucursalId', '==', sucursalId), where('fecha', '>=', configPeriodo.inicio), orderBy('fecha', 'asc'));
  }, [firestore, sucursalId, configPeriodo]);
  const { data: movTraga, isLoading: isLoadingTraga } = useCollection<HistorialTragamonedas>(tragamonedasQuery);

  // Cálculos financieros
  const resumenGaveta = useMemo(() => {
    const stats = {
      inicial: configPeriodo?.efectivoInicial || 0,
      ventas: 0,
      alquileres: 0,
      totalGaveta: 0,
    };
    if (!pagos || !configPeriodo) {
      stats.totalGaveta = stats.inicial;
      return stats;
    }

    pagos.forEach((p) => {
      if (p.metodoPago !== 'Efectivo') return;
      p.itemsSaldados.forEach((item) => {
        if (item.esVirtual) return;

        const name = (item.nombreProducto || '').toLowerCase();
        const id = (item.idProducto || '').toLowerCase();

        const esAlquiler =
          name.includes('mesa #') ||
          name.includes('consola #') ||
          id.startsWith('mesa-') ||
          id.startsWith('division-mesa-') ||
          id.startsWith('mesa-ajuste-');

        if (esAlquiler) {
          stats.alquileres += item.montoAplicado;
        } else {
          stats.ventas += item.montoAplicado;
        }
      });
    });

    stats.totalGaveta = stats.inicial + stats.ventas + stats.alquileres;
    return stats;
  }, [pagos, configPeriodo]);

  const flujoGavetaList = useMemo(() => {
    if (!pagos || !configPeriodo) return [];
    let saldo = configPeriodo.efectivoInicial;
    return pagos
      .map((p) => {
        const monto = p.itemsSaldados.filter((i) => !i.esVirtual).reduce((acc, i) => acc + i.montoAplicado, 0);
        if (monto > 0) saldo += monto;
        return { ...p, montoConsumo: monto, saldoAcumulado: saldo };
      })
      .filter((p) => p.montoConsumo > 0);
  }, [pagos, configPeriodo]);

  const flujoMonedasObj = useMemo(() => {
    if (!configPeriodo) return { lista: [], ventaNetaPeriodo: 0, stockFinal: 0, efectivoFinal: 0 };

    const ventasRapidasIds = new Set<string>();
    const movsVentasRapidas: any[] = [];

    (pagos || []).forEach((p) => {
      const cli = (p.clienteNombre || '').toLowerCase();
      const esRapida = cli.includes('rápida') || cli.includes('rapida');

      const itemsMonedas = (p.itemsSaldados || []).filter(
        (i) => i.esVirtual || (i.nombreProducto || '').toLowerCase().includes('moneda')
      );
      const montoM = itemsMonedas.reduce((acc, i) => acc + (i.montoAplicado || 0), 0);
      const cantM = itemsMonedas.reduce((acc, i) => acc + (i.cantidad || 0), 0);

      if (esRapida && (montoM > 0 || cantM > 0)) {
        if (p.idVenta) ventasRapidasIds.add(String(p.idVenta));
        movsVentasRapidas.push({
          tipo: 'venta_rapida',
          fecha: p.fecha,
          monto: montoM,
          cantidad: cantM > 0 ? cantM : montoM,
          desc: `Venta rápida de monedas (Venta #${p.idVenta})`,
          ref: 'Venta Rápida',
          idVenta: p.idVenta,
        });
      }
    });

    const movsInventario: any[] = [];
    (inventario || []).forEach((inv) => {
      const nom = (inv.nombreProducto || '').toLowerCase();
      if (!nom.includes('moneda')) return;

      const ref = inv.referencia || '';
      const refLower = ref.toLowerCase();

      const esVentaRapida = refLower.includes('rápida') || refLower.includes('rapida');
      if (esVentaRapida) {
        const match = ref.match(/#(\d+)/);
        if (match && ventasRapidasIds.has(match[1])) {
          return;
        }
      }

      if (inv.tipoMovimiento === 'Venta') {
        movsInventario.push({
          tipo: 'despacho',
          fecha: inv.fecha,
          monto: 0,
          cantidad: Math.abs(inv.cantidad || 0),
          desc: `Despacho de monedas (${ref || 'Cuenta'})`,
          ref: 'Agregado a cuenta',
        });
      } else if (inv.tipoMovimiento === 'Producto Eliminado' || inv.tipoMovimiento === 'Venta Anulada') {
        movsInventario.push({
          tipo: 'eliminacion',
          fecha: inv.fecha,
          monto: 0,
          cantidad: Math.abs(inv.cantidad || 0),
          desc: `Monedas devueltas / eliminadas (${ref || 'Cuenta'})`,
          ref: 'Eliminado de cuenta',
        });
      } else if (inv.tipoMovimiento === 'Ajuste') {
        const esDeTraga =
          refLower.includes('premio') ||
          refLower.includes('base') ||
          refLower.includes('extracción') ||
          refLower.includes('extraccion') ||
          refLower.includes('anulación') ||
          refLower.includes('anulacion');
        if (!esDeTraga) {
          movsInventario.push({
            tipo: 'ajuste',
            fecha: inv.fecha,
            monto: 0,
            cantidad: inv.cantidad,
            desc: ref || 'Ajuste de inventario de monedas',
            ref: 'Ajuste manual',
          });
        }
      }
    });

    const movsCobros: any[] = [];
    (pagos || []).forEach((p) => {
      const cli = (p.clienteNombre || '').toLowerCase();
      const esRapida = cli.includes('rápida') || cli.includes('rapida');
      if (esRapida || (p.idVenta && ventasRapidasIds.has(String(p.idVenta)))) return;

      const itemsMonedas = (p.itemsSaldados || []).filter(
        (i) => i.esVirtual || (i.nombreProducto || '').toLowerCase().includes('moneda')
      );
      const montoM = itemsMonedas.reduce((acc, i) => acc + (i.montoAplicado || 0), 0);

      if (montoM > 0) {
        movsCobros.push({
          tipo: 'abono',
          fecha: p.fecha,
          monto: montoM,
          cantidad: 0,
          desc: `Cobro / Abono a monedas (Venta #${p.idVenta})`,
          ref: p.clienteNombre || 'Cuenta',
        });
      }
    });

    const tragamonedasMovs: any[] = [];
    (movTraga || []).forEach((p) => {
      if (p.tipo.startsWith('premio')) {
        tragamonedasMovs.push({
          tipo: 'premio',
          fecha: p.fecha,
          monto: -p.monto,
          cantidad: p.monto,
          desc: p.descripcion || 'Premio pagado',
          ref: 'Tragamonedas',
        });
      } else if (p.tipo === 'base') {
        tragamonedasMovs.push({
          tipo: 'base',
          fecha: p.fecha,
          monto: 0,
          cantidad: p.monto,
          desc: 'Envío de base a máquina',
          ref: 'Tragamonedas',
        });
      } else if (p.tipo === 'extraccion') {
        tragamonedasMovs.push({
          tipo: 'extraccion',
          fecha: p.fecha,
          monto: 0,
          cantidad: p.monto,
          desc: 'Extracción de máquina',
          ref: 'Tragamonedas',
        });
      }
    });

    const consolidado = [
      ...movsVentasRapidas,
      ...movsInventario,
      ...movsCobros,
      ...tragamonedasMovs,
    ].sort((a, b) => toDate(a.fecha).getTime() - toDate(b.fecha).getTime());

    let stock = configPeriodo.monedasIniciales;
    let cash = configPeriodo.efectivoInicialMonedas || 0;
    let ventaNetaPeriodo = 0;
    const lista: any[] = [];

    consolidado.forEach((mov) => {
      if (mov.tipo === 'venta_rapida') {
        cash += mov.monto;
        stock -= mov.cantidad;
        ventaNetaPeriodo += mov.monto;
      } else if (mov.tipo === 'despacho') {
        stock -= mov.cantidad;
      } else if (mov.tipo === 'eliminacion') {
        stock += mov.cantidad;
      } else if (mov.tipo === 'abono') {
        cash += mov.monto;
        ventaNetaPeriodo += mov.monto;
      } else if (mov.tipo === 'premio') {
        cash += mov.monto;
        stock += mov.cantidad;
        ventaNetaPeriodo += mov.monto;
      } else if (mov.tipo === 'base') {
        stock -= mov.cantidad;
      } else if (mov.tipo === 'extraccion') {
        stock += mov.cantidad;
      } else if (mov.tipo === 'ajuste') {
        stock += mov.cantidad;
      }

      lista.push({ ...mov, stockAcumulado: stock, cashAcumulado: cash });
    });

    return { lista, ventaNetaPeriodo, stockFinal: stock, efectivoFinal: cash };
  }, [pagos, inventario, movTraga, configPeriodo]);

  const duracionPeriodoTexto = useMemo(() => {
    if (!configPeriodo?.inicio) return '';
    const fin = configPeriodo.fin ? configPeriodo.fin : new Date();
    try {
      return formatDistanceStrict(configPeriodo.inicio, fin, { locale: es });
    } catch {
      return '';
    }
  }, [configPeriodo]);

  const totalEfectivoCaja = (resumenGaveta?.totalGaveta || 0) + (flujoMonedasObj?.ventaNetaPeriodo || 0);

  const exportarReporteCSV = () => {
    if (!configPeriodo) return;

    try {
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += `Reporte de monitoreo integral del periodo\n`;
      csvContent += `Turno:,"${configPeriodo.label}"\n`;
      csvContent += `Apertura:,"${format(configPeriodo.inicio, 'dd/MM/yyyy HH:mm:ss')}"\n`;
      csvContent += `Estado:,"${configPeriodo.esTurnoAbierto ? 'Abierto (en curso)' : 'Cerrado'}"\n\n`;

      csvContent += `Resumen contable\n`;
      csvContent += `Concepto,Importe (Q)\n`;
      csvContent += `Fondo inicial en gaveta,${resumenGaveta.inicial.toFixed(2)}\n`;
      csvContent += `Ventas de productos,${resumenGaveta.ventas.toFixed(2)}\n`;
      csvContent += `Alquiler de mesas,${resumenGaveta.alquileres.toFixed(2)}\n`;
      csvContent += `Subtotal en gaveta,${resumenGaveta.totalGaveta.toFixed(2)}\n`;
      csvContent += `Efectivo inicial venta de monedas,${(configPeriodo.efectivoInicialMonedas || 0).toFixed(2)}\n`;
      csvContent += `Venta neta de monedas,${flujoMonedasObj.ventaNetaPeriodo.toFixed(2)}\n`;
      csvContent += `Total efectivo esperado en caja,${totalEfectivoCaja.toFixed(2)}\n`;
      csvContent += `Monedas iniciales,${configPeriodo.monedasIniciales}\n`;
      csvContent += `Monedas actuales en caja,${flujoMonedasObj.stockFinal}\n\n`;

      csvContent += `Movimientos de gaveta\n`;
      csvContent += `Pago ID,Venta ID,Cliente,Fecha,Hora,Importe (Q),Saldo acumulado (Q)\n`;
      flujoGavetaList.forEach((p) => {
        csvContent += `"${p.idPago}","${p.idVenta}","${p.clienteNombre}","${format(toDate(p.fecha), 'dd/MM/yyyy')}","${format(toDate(p.fecha), 'HH:mm:ss')}",${p.montoConsumo.toFixed(2)},${p.saldoAcumulado.toFixed(2)}\n`;
      });

      csvContent += `\nMovimientos de monedas\n`;
      csvContent += `Tipo,Descripción,Referencia,Fecha,Hora,Importe (Q),Saldo acumulado efectivo (Q),Existencia acumulada\n`;
      flujoMonedasObj.lista.forEach((m) => {
        csvContent += `"${m.tipo}","${m.desc}","${m.ref || ''}","${format(toDate(m.fecha), 'dd/MM/yyyy')}","${format(toDate(m.fecha), 'HH:mm:ss')}",${m.monto.toFixed(2)},${(m.cashAcumulado || 0).toFixed(2)},${m.stockAcumulado}\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `monitoreo_${configPeriodo.label.replace(/\s+/g, '_').toLowerCase()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Reporte exportado',
        description: 'El archivo CSV consolidado se ha descargado correctamente.',
      });
    } catch (err: any) {
      toast({
        title: 'Error al exportar',
        description: err.message || 'No se pudo generar el archivo de reporte.',
        variant: 'destructive',
      });
    }
  };

  const isLoading = isLoadingSucursal || isLoadingTurno;

  return {
    periodoId,
    setPeriodoId,
    tabActiva,
    setTabActiva,
    cierres,
    configPeriodo,
    resumenGaveta,
    flujoGavetaList,
    flujoMonedasObj,
    inventario,
    duracionPeriodoTexto,
    totalEfectivoCaja,
    exportarReporteCSV,
    isLoading,
    isLoadingTraga,
    isLoadingPagos,
    isLoadingInventario,
  };
}
