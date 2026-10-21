'use client';

import { useState, useMemo } from 'react';
import { collection, query, orderBy, doc, Timestamp, where, collectionGroup } from 'firebase/firestore';
import { useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import type { CierreCaja, Generales, Pago, HistorialInventario, HistorialTragamonedas } from '@/lib/tipos';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MonitorCheck, 
  Clock, 
  Loader2, 
  PackageSearch, 
  Coins,
  Banknote,
  Scale,
  DollarSign
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSucursal } from '@/hooks/use-sucursal';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Subcomponentes modulares rediseñados
import { FlujoGaveta } from './_components/flujo-gaveta';
import { FlujoMonedas } from './_components/flujo-monedas';
import { KardexInventario } from './_components/kardex-inventario';
import { BalanceTurno } from './_components/balance-turno';

/** Helper para conversión de fechas segura */
const toDate = (fecha: any): Date => {
  if (fecha instanceof Timestamp) return fecha.toDate();
  if (fecha instanceof Date) return fecha;
  if (typeof fecha === 'string') {
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(0);
};

export default function PaginaMonitoreoIntegral() {
  const { firestore } = useFirebase();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  
  const [periodoId, setPeriodoId] = useState<string>('actual');
  const [tabActiva, setTabActiva] = useState<string>('gaveta');

  // 1. Obtener cierres pasados para el selector
  const cierresQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/cierre_caja`), orderBy('fecha', 'desc'));
  }, [firestore, sucursalId]);
  const { data: cierres } = useCollection<CierreCaja>(cierresQuery);

  // 2. Obtener estado de caja actual
  const generalesRef = useMemoFirebase(() => 
    firestore && sucursalId ? doc(firestore, `sucursales/${sucursalId}/generales/actual`) : null
  , [firestore, sucursalId]);
  const { data: turnoActual, isLoading: isLoadingTurno } = useDoc<Generales>(generalesRef);

  // 3. Configuración del rango del período seleccionado
  const configPeriodo = useMemo(() => {
    if (periodoId === 'actual') {
      if (!turnoActual) return null;
      const inicio = toDate(turnoActual.fechaInicioPeriodo);
      return {
        label: 'Turno actual',
        inicio,
        fin: null, // Tiempo real
        esTurnoAbierto: true,
        monedasIniciales: turnoActual.monedasTurnoAbierto ?? turnoActual.monedasIniciales ?? 0,
        efectivoInicial: turnoActual.efectivoInicial ?? 0,
        efectivoInicialMonedas: 0, // Al abrir el turno inicia en 0 y se acumula en el período
        efectivoAcumuladoMonedas: turnoActual.efectivoAcumuladoMonedas ?? 0,
        idCuadre: null,
      };
    }
    const cierre = cierres?.find(c => c.id === periodoId);
    if (!cierre) return null;
    return {
      label: `Turno #${cierre.idCuadre}`,
      inicio: toDate(cierre.inicioDelPeriodo),
      fin: toDate(cierre.fecha),
      esTurnoAbierto: false,
      monedasIniciales: cierre.snapshotMonedas?.existenciaAlInicio ?? cierre.snapshotMonedas?.existencia ?? 0,
      efectivoInicial: cierre.efectivoInicial ?? 0,
      efectivoInicialMonedas: 0, // Al abrir el turno inicia en 0
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
    return query(
      baseRef,
      where('fecha', '>=', configPeriodo.inicio),
      orderBy('fecha', 'asc')
    );
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
    return query(
      baseRef,
      where('fecha', '>=', configPeriodo.inicio),
      orderBy('fecha', 'asc')
    );
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
    return query(
      baseRef,
      where('sucursalId', '==', sucursalId),
      where('fecha', '>=', configPeriodo.inicio),
      orderBy('fecha', 'asc')
    );
  }, [firestore, sucursalId, configPeriodo]);
  const { data: movTraga, isLoading: isLoadingTraga } = useCollection<HistorialTragamonedas>(tragamonedasQuery);

  // --- CÁLCULOS FINANCIEROS Y DE EXISTENCIAS ---

  const resumenGaveta = useMemo(() => {
    const stats = { 
      inicial: configPeriodo?.efectivoInicial || 0, 
      ventas: 0, 
      alquileres: 0, 
      totalGaveta: 0 
    };
    if (!pagos || !configPeriodo) {
      stats.totalGaveta = stats.inicial;
      return stats;
    }

    pagos.forEach(p => {
      if (p.metodoPago !== 'Efectivo') return;
      p.itemsSaldados.forEach(item => {
        if (item.esVirtual) return;

        const name = (item.nombreProducto || '').toLowerCase();
        const id = (item.idProducto || '').toLowerCase();
        
        const esAlquiler = name.includes('mesa #') || 
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
    return pagos.map(p => {
      const monto = p.itemsSaldados.filter(i => !i.esVirtual).reduce((acc, i) => acc + i.montoAplicado, 0);
      if (monto > 0) saldo += monto;
      return { ...p, montoConsumo: monto, saldoAcumulado: saldo };
    }).filter(p => p.montoConsumo > 0);
  }, [pagos, configPeriodo]);

  const flujoMonedasObj = useMemo(() => {
    if (!configPeriodo) return { lista: [], ventaNetaPeriodo: 0, stockFinal: 0, efectivoFinal: 0 };
    
    // 1. Identificar Ventas Rápidas de Monedas (despacho físico y efectivo simultáneo)
    const ventasRapidasIds = new Set<string>();
    const movsVentasRapidas: any[] = [];

    (pagos || []).forEach(p => {
      const cli = (p.clienteNombre || '').toLowerCase();
      const esRapida = cli.includes('rápida') || cli.includes('rapida');
      
      const itemsMonedas = (p.itemsSaldados || []).filter(i => 
        i.esVirtual || (i.nombreProducto || '').toLowerCase().includes('moneda')
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
          idVenta: p.idVenta
        });
      }
    });

    // 2. Movimientos físicos de inventario (Despachos y devoluciones de cuentas/mesas)
    const movsInventario: any[] = [];
    (inventario || []).forEach(inv => {
      const nom = (inv.nombreProducto || '').toLowerCase();
      if (!nom.includes('moneda')) return;

      const ref = inv.referencia || '';
      const refLower = ref.toLowerCase();

      // Si es una venta rápida ya procesada en el paso 1, omitir para no duplicar
      const esVentaRapida = refLower.includes('rápida') || refLower.includes('rapida');
      if (esVentaRapida) {
        const match = ref.match(/#(\d+)/);
        if (match && ventasRapidasIds.has(match[1])) {
          return;
        }
      }

      if (inv.tipoMovimiento === 'Venta') {
        // Despacho a cuenta o mesa (salida física, efectivo aún no cobrado)
        movsInventario.push({
          tipo: 'despacho',
          fecha: inv.fecha,
          monto: 0,
          cantidad: Math.abs(inv.cantidad || 0),
          desc: `Despacho de monedas (${ref || 'Cuenta'})`,
          ref: 'Agregado a cuenta'
        });
      } else if (inv.tipoMovimiento === 'Producto Eliminado' || inv.tipoMovimiento === 'Venta Anulada') {
        // Eliminación de cuenta o devolución (reingreso físico a caja)
        movsInventario.push({
          tipo: 'eliminacion',
          fecha: inv.fecha,
          monto: 0,
          cantidad: Math.abs(inv.cantidad || 0),
          desc: `Monedas devueltas / eliminadas (${ref || 'Cuenta'})`,
          ref: 'Eliminado de cuenta'
        });
      } else if (inv.tipoMovimiento === 'Ajuste') {
        const esDeTraga = refLower.includes('premio') || 
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
            ref: 'Ajuste manual'
          });
        }
      }
    });

    // 3. Movimientos de cobro / abonos a cuentas con monedas (Flujo de efectivo)
    const movsCobros: any[] = [];
    (pagos || []).forEach(p => {
      const cli = (p.clienteNombre || '').toLowerCase();
      const esRapida = cli.includes('rápida') || cli.includes('rapida');
      if (esRapida || (p.idVenta && ventasRapidasIds.has(String(p.idVenta)))) return;

      const itemsMonedas = (p.itemsSaldados || []).filter(i => 
        i.esVirtual || (i.nombreProducto || '').toLowerCase().includes('moneda')
      );
      const montoM = itemsMonedas.reduce((acc, i) => acc + (i.montoAplicado || 0), 0);

      if (montoM > 0) {
        // Cobro o abono: las monedas ya salieron en el despacho físico, solo entra el dinero
        movsCobros.push({
          tipo: 'abono',
          fecha: p.fecha,
          monto: montoM,
          cantidad: 0,
          desc: `Cobro / Abono a monedas (Venta #${p.idVenta})`,
          ref: p.clienteNombre || 'Cuenta'
        });
      }
    });

    // 4. Movimientos de Tragamonedas (Premios, Bases, Extracciones)
    const tragamonedasMovs: any[] = [];
    (movTraga || []).forEach(p => {
      if (p.tipo.startsWith('premio')) {
        tragamonedasMovs.push({
          tipo: 'premio',
          fecha: p.fecha,
          monto: -p.monto,
          cantidad: p.monto,
          desc: p.descripcion || 'Premio pagado',
          ref: 'Tragamonedas'
        });
      } else if (p.tipo === 'base') {
        tragamonedasMovs.push({
          tipo: 'base',
          fecha: p.fecha,
          monto: 0,
          cantidad: p.monto,
          desc: 'Envío de base a máquina',
          ref: 'Tragamonedas'
        });
      } else if (p.tipo === 'extraccion') {
        tragamonedasMovs.push({
          tipo: 'extraccion',
          fecha: p.fecha,
          monto: 0,
          cantidad: p.monto,
          desc: 'Extracción de máquina',
          ref: 'Tragamonedas'
        });
      }
    });

    // 5. Consolidación cronológica y cálculo acumulado
    const consolidado = [
      ...movsVentasRapidas,
      ...movsInventario,
      ...movsCobros,
      ...tragamonedasMovs
    ].sort((a, b) => toDate(a.fecha).getTime() - toDate(b.fecha).getTime());

    let stock = configPeriodo.monedasIniciales;
    let cash = configPeriodo.efectivoInicialMonedas || 0; 
    let ventaNetaPeriodo = 0;
    const lista: any[] = [];

    consolidado.forEach(mov => {
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

  // Duración del período en texto
  const duracionPeriodoTexto = useMemo(() => {
    if (!configPeriodo?.inicio) return '';
    const fin = configPeriodo.fin ? configPeriodo.fin : new Date();
    try {
      return formatDistanceStrict(configPeriodo.inicio, fin, { locale: es });
    } catch {
      return '';
    }
  }, [configPeriodo]);

  // Exportar reporte consolidado a CSV
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
      csvContent += `Total efectivo esperado en caja,${(resumenGaveta.totalGaveta + flujoMonedasObj.ventaNetaPeriodo).toFixed(2)}\n`;
      csvContent += `Monedas iniciales,${configPeriodo.monedasIniciales}\n`;
      csvContent += `Monedas actuales en caja,${flujoMonedasObj.stockFinal}\n\n`;

      csvContent += `Movimientos de gaveta\n`;
      csvContent += `Pago ID,Venta ID,Cliente,Fecha,Hora,Importe (Q),Saldo acumulado (Q)\n`;
      flujoGavetaList.forEach(p => {
        csvContent += `"${p.idPago}","${p.idVenta}","${p.clienteNombre}","${format(toDate(p.fecha), 'dd/MM/yyyy')}","${format(toDate(p.fecha), 'HH:mm:ss')}",${p.montoConsumo.toFixed(2)},${p.saldoAcumulado.toFixed(2)}\n`;
      });

      csvContent += `\nMovimientos de monedas\n`;
      csvContent += `Tipo,Descripción,Referencia,Fecha,Hora,Importe (Q),Saldo acumulado efectivo (Q),Existencia acumulada\n`;
      flujoMonedasObj.lista.forEach(m => {
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
        description: 'Se ha descargado el archivo CSV con la auditoría del turno.',
      });
    } catch (e: any) {
      toast({
        title: 'Error al exportar',
        description: e.message || 'No se pudo generar el archivo CSV.',
        variant: 'destructive',
      });
    }
  };

  const isLoading = isLoadingSucursal || isLoadingTurno;

  if (isLoading) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center gap-3 font-body">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-xs text-muted-foreground font-medium">Cargando monitoreo integral del período...</p>
      </div>
    );
  }

  if (!configPeriodo) {
    return (
      <div className="p-8 text-center font-body text-muted-foreground">
        No se encontró información del turno seleccionado.
      </div>
    );
  }

  const totalEfectivoCaja = resumenGaveta.totalGaveta + flujoMonedasObj.ventaNetaPeriodo;

  return (
    <div className="space-y-6 font-body pb-10">
      {/* 1. Encabezado limpio con selector de turno integrado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-headline flex items-center gap-2 text-white">
            <MonitorCheck className="h-6 w-6 text-primary" />
            <span>Monitoreo integral</span>
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              {configPeriodo.esTurnoAbierto ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-bold text-emerald-400">Turno abierto</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                  <span className="font-bold text-blue-400">Turno cerrado</span>
                </>
              )}
            </div>
            <span>•</span>
            <span>Apertura: {format(configPeriodo.inicio, 'dd MMM, hh:mm a', { locale: es })}</span>
            {duracionPeriodoTexto && (
              <>
                <span>•</span>
                <span>{duracionPeriodoTexto}</span>
              </>
            )}
          </div>
        </div>

        {/* Selector de turno en el encabezado */}
        <div className="w-full sm:w-72 shrink-0">
          <Select value={periodoId} onValueChange={setPeriodoId}>
            <SelectTrigger className="rounded-full h-10 border-[#324157] bg-[#1d283a] text-white text-xs font-medium focus:ring-primary shadow-sm">
              <Clock className="h-3.5 w-3.5 text-primary mr-2 shrink-0" />
              <SelectValue placeholder="Seleccionar turno..." />
            </SelectTrigger>
            <SelectContent className="bg-[#17202e] border-[#324157] text-white max-h-[320px]">
              <SelectItem value="actual" className="font-bold text-primary">
                Turno actual (abierto)
              </SelectItem>
              {cierres && cierres.length > 0 && (
                <>
                  <Separator className="my-1.5 bg-[#324157]" />
                  <p className="px-2 py-1 text-[10px] font-medium text-muted-foreground">Turnos cerrados anteriores</p>
                  {cierres.map(c => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      Turno #{c.idCuadre} — {format(toDate(c.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 2. Tarjetas Ejecutivas de Métricas Relevantes (3 KPI Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {/* Total Efectivo Esperado en Caja (KPI Principal) */}
        <Card className="bg-[#1d283a] border-primary/40 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-8 -mt-8 pointer-events-none" />
          <div className="p-4 pb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold text-white">Total efectivo esperado</span>
            <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="p-4 pt-0">
            <div className="text-2xl md:text-3xl font-black text-white tabular-nums">
              Q{totalEfectivoCaja.toFixed(2)}
            </div>
            <p className="text-[11px] text-primary font-medium mt-1">
              Arqueo físico teórico total
            </p>
          </div>
        </Card>

        {/* Efectivo en Gaveta */}
        <Card className="bg-[#1d283a] border-[#324157] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
          <div className="p-4 pb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground">Efectivo en gaveta</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Banknote className="h-4 w-4" />
            </div>
          </div>
          <div className="p-4 pt-0">
            <div className="text-2xl md:text-3xl font-black text-emerald-400 tabular-nums">
              Q{resumenGaveta.totalGaveta.toFixed(2)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Fondo Q{resumenGaveta.inicial.toFixed(0)} + Cobros Q{(resumenGaveta.ventas + resumenGaveta.alquileres).toFixed(0)}
            </p>
          </div>
        </Card>

        {/* Flujo Neto de Monedas */}
        <Card className="bg-[#1d283a] border-[#324157] shadow-sm relative overflow-hidden">
          <div className="p-4 pb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground">Flujo neto monedas</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div className="p-4 pt-0">
            <div className={cn(
              "text-2xl md:text-3xl font-black tabular-nums",
              flujoMonedasObj.ventaNetaPeriodo >= 0 ? "text-purple-300" : "text-amber-400"
            )}>
              {flujoMonedasObj.ventaNetaPeriodo >= 0 ? '+' : ''}Q{flujoMonedasObj.ventaNetaPeriodo.toFixed(2)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Monedas vendidas vs premios
            </p>
          </div>
        </Card>
      </div>

      {/* 4. Contenedor Unificado de Pestañas Interactivas */}
      <Card className="bg-[#1d283a] border-[#324157] shadow-md overflow-hidden">
        <Tabs value={tabActiva} onValueChange={setTabActiva} className="w-full">
          {/* Barra superior de pestañas */}
          <div className="p-2 sm:p-3 bg-[#17202e] border-b border-[#324157] overflow-x-auto scrollbar-none">
            <TabsList className="grid grid-cols-4 w-full min-w-[280px] h-11 p-1 bg-[#283244] rounded-full border border-[#324157] gap-0.5 sm:gap-1">
              <TabsTrigger 
                value="gaveta" 
                className="font-medium text-[11px] sm:text-xs px-1.5 sm:px-3 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-bold transition-all gap-1 sm:gap-1.5 text-white truncate"
              >
                <Banknote className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  <span className="hidden sm:inline">Flujo de </span>Gaveta
                </span>
              </TabsTrigger>

              <TabsTrigger 
                value="monedas" 
                className="font-medium text-[11px] sm:text-xs px-1.5 sm:px-3 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-bold transition-all gap-1 sm:gap-1.5 text-white truncate"
              >
                <Coins className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  <span className="hidden sm:inline">Flujo de </span>Monedas
                </span>
              </TabsTrigger>

              <TabsTrigger 
                value="inventario" 
                className="font-medium text-[11px] sm:text-xs px-1.5 sm:px-3 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-bold transition-all gap-1 sm:gap-1.5 text-white truncate"
              >
                <PackageSearch className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  <span className="hidden sm:inline">Kardex </span>Inventario
                </span>
              </TabsTrigger>

              <TabsTrigger 
                value="balance" 
                className="font-medium text-[11px] sm:text-xs px-1.5 sm:px-3 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-bold transition-all gap-1 sm:gap-1.5 text-white truncate"
              >
                <Scale className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  Balance<span className="hidden sm:inline"> general</span>
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Contenido de cada pestaña */}
          <CardContent className="p-3 sm:p-5">
            {/* Pestaña 1: Flujo de Gaveta */}
            <TabsContent value="gaveta" className="m-0 outline-none">
              <FlujoGaveta 
                resumen={resumenGaveta} 
                flujo={flujoGavetaList} 
                inicioPeriodo={configPeriodo.inicio} 
              />
            </TabsContent>

            {/* Pestaña 2: Flujo de Monedas */}
            <TabsContent value="monedas" className="m-0 outline-none">
              <FlujoMonedas 
                lista={flujoMonedasObj.lista} 
                ventaNetaPeriodo={flujoMonedasObj.ventaNetaPeriodo} 
                monedasIniciales={configPeriodo.monedasIniciales} 
                efectivoInicialMonedas={configPeriodo.efectivoInicialMonedas || 0}
                efectivoAcumuladoMonedas={configPeriodo.efectivoAcumuladoMonedas || 0} 
                inicioPeriodo={configPeriodo.inicio} 
                isLoading={isLoadingTraga || isLoadingPagos} 
              />
            </TabsContent>

            {/* Pestaña 3: Kardex de Inventario */}
            <TabsContent value="inventario" className="m-0 outline-none">
              <KardexInventario 
                inventario={inventario || []} 
                isLoading={isLoadingInventario} 
              />
            </TabsContent>

            {/* Pestaña 4: Balance General del Turno */}
            <TabsContent value="balance" className="m-0 outline-none">
              <BalanceTurno
                resumenGaveta={resumenGaveta}
                flujoMonedas={flujoMonedasObj}
                monedasIniciales={configPeriodo.monedasIniciales}
                monedasFinales={flujoMonedasObj.stockFinal}
                esTurnoAbierto={configPeriodo.esTurnoAbierto}
                duracionTexto={duracionPeriodoTexto}
              />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
