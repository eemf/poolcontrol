'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  collection, query, orderBy, where, doc, Timestamp 
} from 'firebase/firestore';
import { useFirebase, useCollection, useMemoFirebase, useDoc, useUser } from '@/firebase';
import type { Pago, Generales, CierreCaja, UsuarioSucursal } from '@/lib/tipos';
import { useSucursal } from '@/hooks/use-sucursal';
import { toDate } from '@/lib/firebase/servicios/utils';
import { format } from 'date-fns';

export type PagoConDocId = Pago & { id: string };

export type PeriodoTipo = 'actual' | 'hoy' | 'ayer' | '7dias' | 'mes' | 'todos' | 'personalizado' | string;

export interface VentaDesglosada {
  idVenta: number;
  ventaDocId: string;
  montoPagadoVenta: number;
  ventaTotal?: number;
  itemsSaldados: Pago['itemsSaldados'];
}

export interface PagoVisual {
  id: string;
  idPagoPrincipal: number;
  idsPagoTexto: string;
  fecha: Date;
  clienteNombre: string;
  montoTotalPagado: number;
  metodoPago: string;
  usuarioId: string;
  esMultiventa: boolean;
  ventas: VentaDesglosada[];
  todosItemsSaldados: (Pago['itemsSaldados'][0] & { idVenta?: number })[];
  rawPagos: PagoConDocId[];
}

export function useControlPagos() {
  const { firestore } = useFirebase();
  const { user: currentUser } = useUser();
  const { sucursalId, sucursal, isLoading: isLoadingSucursal } = useSucursal();

  // Estados de Filtros y Búsqueda
  const [filtroTexto, setFiltroTexto] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [periodoFiltro, setPeriodoFiltro] = useState<PeriodoTipo>('actual');
  const [metodoFiltro, setMetodoFiltro] = useState<string>('todos');
  const [operadorFiltro, setOperadorFiltro] = useState<string>('todos');
  const [tipoCoberturaFiltro, setTipoCoberturaFiltro] = useState<string>('todos');
  
  // Rango de fechas personalizado
  const [fechaInicioPers, setFechaInicioPers] = useState<string>('');
  const [fechaFinPers, setFechaFinPers] = useState<string>('');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Modal de Comprobante / Ticket
  const [pagoSeleccionadoTicket, setPagoSeleccionadoTicket] = useState<PagoVisual | null>(null);

  // 1. Estado de caja del turno actual
  const generalesRef = useMemoFirebase(() => 
    firestore && sucursalId ? doc(firestore, `sucursales/${sucursalId}/generales/actual`) : null
  , [firestore, sucursalId]);
  const { data: estadoCaja, isLoading: cargandoEstadoCaja } = useDoc<Generales>(generalesRef);

  // 2. Historial de cierres de turno
  const cierresQuery = useMemoFirebase(() => 
    (firestore && sucursalId) ? query(collection(firestore, `sucursales/${sucursalId}/cierre_caja`), orderBy('fecha', 'desc')) : null
  , [firestore, sucursalId]);
  const { data: cierres } = useCollection<CierreCaja>(cierresQuery);

  // 3. Usuarios de la sucursal
  const usuariosQuery = useMemoFirebase(() => 
    (firestore && sucursalId) ? query(collection(firestore, `sucursales/${sucursalId}/usuarios`), orderBy('nombre', 'asc')) : null
  , [firestore, sucursalId]);
  const { data: usuariosData } = useCollection<UsuarioSucursal>(usuariosQuery);

  // Mapeo rápido de usuarios
  const mapaUsuarios = useMemo(() => {
    const map = new Map<string, { nombre: string; email?: string; rol?: string }>();
    (usuariosData || []).forEach(u => {
      const info = {
        nombre: u.nombre || u.email?.split('@')[0] || 'Operador',
        email: u.email || '',
        rol: Array.isArray(u.roles) && u.roles.length > 0 ? u.roles.join(', ') : 'Operador',
      };
      if (u.authUid) map.set(u.authUid, info);
      if ((u as any).id) map.set((u as any).id, info);
    });
    return map;
  }, [usuariosData]);

  const resolverNombreOperador = useCallback((uid?: string): string => {
    if (!uid) return 'Sistema';
    const found = mapaUsuarios.get(uid);
    if (found?.nombre) return found.nombre;
    if (currentUser?.uid === uid) return currentUser.displayName || currentUser.email?.split('@')[0] || 'Tú';
    return uid.length > 12 ? `Operador (${uid.slice(0, 6)}...)` : uid;
  }, [mapaUsuarios, currentUser]);

  // 4. Límites temporales
  const limitesPeriodo = useMemo(() => {
    const ahora = new Date();
    
    if (periodoFiltro === 'actual') {
      if (!estadoCaja?.fechaInicioPeriodo) return null;
      return { desde: toDate(estadoCaja.fechaInicioPeriodo), hasta: null };
    }
    
    if (periodoFiltro === 'hoy') {
      const desde = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 0, 0, 0, 0);
      const hasta = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 23, 59, 59, 999);
      return { desde, hasta };
    }

    if (periodoFiltro === 'ayer') {
      const ayer = new Date(ahora);
      ayer.setDate(ayer.getDate() - 1);
      const desde = new Date(ayer.getFullYear(), ayer.getMonth(), ayer.getDate(), 0, 0, 0, 0);
      const hasta = new Date(ayer.getFullYear(), ayer.getMonth(), ayer.getDate(), 23, 59, 59, 999);
      return { desde, hasta };
    }

    if (periodoFiltro === '7dias') {
      const desde = new Date(ahora);
      desde.setDate(desde.getDate() - 7);
      return { desde, hasta: null };
    }

    if (periodoFiltro === 'mes') {
      const desde = new Date(ahora.getFullYear(), ahora.getMonth(), 1, 0, 0, 0, 0);
      return { desde, hasta: null };
    }

    if (periodoFiltro === 'personalizado') {
      if (!fechaInicioPers) return null;
      const dParts = fechaInicioPers.split('-');
      const desde = new Date(Number(dParts[0]), Number(dParts[1]) - 1, Number(dParts[2]), 0, 0, 0);
      let hasta: Date | null = null;
      if (fechaFinPers) {
        const hParts = fechaFinPers.split('-');
        hasta = new Date(Number(hParts[0]), Number(hParts[1]) - 1, Number(hParts[2]), 23, 59, 59);
      }
      return { desde, hasta };
    }

    if (periodoFiltro !== 'todos') {
      const cierre = cierres?.find(c => c.id === periodoFiltro);
      if (cierre) {
        return { desde: toDate(cierre.inicioDelPeriodo), hasta: toDate(cierre.fecha) };
      }
    }

    return null;
  }, [periodoFiltro, estadoCaja?.fechaInicioPeriodo, cierres, fechaInicioPers, fechaFinPers]);

  const pagosQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    const baseCol = collection(firestore, `sucursales/${sucursalId}/pagos`);

    if (periodoFiltro === 'todos') {
      return query(baseCol, orderBy('fecha', 'desc'));
    }

    if (limitesPeriodo?.desde && limitesPeriodo?.hasta) {
      return query(
        baseCol,
        where('fecha', '>=', Timestamp.fromDate(limitesPeriodo.desde)),
        where('fecha', '<=', Timestamp.fromDate(limitesPeriodo.hasta)),
        orderBy('fecha', 'desc')
      );
    }

    if (limitesPeriodo?.desde) {
      return query(
        baseCol,
        where('fecha', '>=', Timestamp.fromDate(limitesPeriodo.desde)),
        orderBy('fecha', 'desc')
      );
    }

    if (periodoFiltro === 'actual') return null;

    return query(baseCol, orderBy('fecha', 'desc'));
  }, [firestore, sucursalId, periodoFiltro, limitesPeriodo]);

  const { data: rawPagos, isLoading: cargandoPagos } = useCollection<Pago>(pagosQuery);

  // AGRUPACIÓN MULTI-VENTA
  const pagosVisuales = useMemo((): PagoVisual[] => {
    const lista = (rawPagos || []).map(p => ({ ...p, id: p.id }));
    if (lista.length === 0) return [];

    const grupos = new Map<string, PagoConDocId[]>();
    const yaAsignados = new Set<string>();

    lista.forEach((pago) => {
      if (yaAsignados.has(pago.id)) return;

      if (pago.grupoPagoId) {
        const matches = lista.filter(x => x.grupoPagoId === pago.grupoPagoId);
        matches.forEach(m => yaAsignados.add(m.id));
        grupos.set(`grp_${pago.grupoPagoId}`, matches);
        return;
      }

      const fechaP = toDate(pago.fecha).getTime();
      const coetaneos = lista.filter(x => {
        if (yaAsignados.has(x.id)) return false;
        if (x.id === pago.id) return true;
        if (x.grupoPagoId) return false;
        if (x.clienteNombre !== pago.clienteNombre) return false;
        if (x.usuarioId !== pago.usuarioId) return false;
        if (x.metodoPago !== pago.metodoPago) return false;

        const diffSec = Math.abs(toDate(x.fecha).getTime() - fechaP) / 1000;
        return diffSec <= 5 && x.idVenta !== pago.idVenta;
      });

      if (coetaneos.length > 1) {
        coetaneos.forEach(c => yaAsignados.add(c.id));
        grupos.set(`auto_${pago.id}`, coetaneos);
      } else {
        yaAsignados.add(pago.id);
        grupos.set(`single_${pago.id}`, [pago]);
      }
    });

    const resultado: PagoVisual[] = [];
    grupos.forEach((subPagos, key) => {
      subPagos.sort((a, b) => a.idPago - b.idPago);

      const primerPago = subPagos[0];
      const fechaObj = toDate(primerPago.fecha);
      const montoTotal = subPagos.reduce((acc, p) => acc + (p.montoTotalPagado || 0), 0);
      const idsNumeros = subPagos.map(p => p.idPago);
      const idsPagoTexto = idsNumeros.length === 1 
        ? `#${idsNumeros[0]}` 
        : `#${idsNumeros[0]} - #${idsNumeros[idsNumeros.length - 1]}`;

      const ventasMap = new Map<number, VentaDesglosada>();
      const todosItems: (Pago['itemsSaldados'][0] & { idVenta?: number })[] = [];

      subPagos.forEach(p => {
        const itemsConVenta = (p.itemsSaldados || []).map(it => ({
          ...it,
          idVenta: it.idVenta || p.idVenta,
        }));
        todosItems.push(...itemsConVenta);

        if (!ventasMap.has(p.idVenta)) {
          ventasMap.set(p.idVenta, {
            idVenta: p.idVenta,
            ventaDocId: p.ventaDocId,
            montoPagadoVenta: p.montoTotalPagado,
            ventaTotal: p.ventaTotal,
            itemsSaldados: itemsConVenta,
          });
        } else {
          const v = ventasMap.get(p.idVenta)!;
          v.montoPagadoVenta += p.montoTotalPagado;
          v.itemsSaldados.push(...itemsConVenta);
        }
      });

      resultado.push({
        id: key,
        idPagoPrincipal: primerPago.idPago,
        idsPagoTexto,
        fecha: fechaObj,
        clienteNombre: primerPago.clienteNombre || 'Consumidor Final',
        montoTotalPagado: montoTotal,
        metodoPago: primerPago.metodoPago,
        usuarioId: primerPago.usuarioId,
        esMultiventa: ventasMap.size > 1,
        ventas: Array.from(ventasMap.values()),
        todosItemsSaldados: todosItems,
        rawPagos: subPagos,
      });
    });

    return resultado.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  }, [rawPagos]);

  // Filtro multidimensional
  const pagosFiltrados = useMemo(() => {
    const q = filtroTexto.trim().toLowerCase();

    return pagosVisuales.filter(p => {
      if (metodoFiltro !== 'todos' && p.metodoPago !== metodoFiltro) {
        return false;
      }

      if (operadorFiltro !== 'todos' && p.usuarioId !== operadorFiltro) {
        return false;
      }

      if (tipoCoberturaFiltro === 'completo') {
        const esCompleto = p.ventas.every(v => v.ventaTotal && Math.abs(v.montoPagadoVenta - v.ventaTotal) < 0.05);
        if (!esCompleto) return false;
      } else if (tipoCoberturaFiltro === 'abono') {
        const esAbono = p.ventas.some(v => v.ventaTotal && Math.abs(v.montoPagadoVenta - v.ventaTotal) >= 0.05);
        if (!esAbono) return false;
      }

      if (!q) return true;

      if (p.idsPagoTexto.toLowerCase().includes(q) || String(p.idPagoPrincipal).includes(q)) return true;
      if (p.ventas.some(v => String(v.idVenta).includes(q) || `#${v.idVenta}`.includes(q))) return true;
      if (p.clienteNombre && p.clienteNombre.toLowerCase().includes(q)) return true;

      const nomOperador = resolverNombreOperador(p.usuarioId).toLowerCase();
      if (nomOperador.includes(q)) return true;

      if (p.metodoPago && p.metodoPago.toLowerCase().includes(q)) return true;

      const coincideProducto = p.todosItemsSaldados?.some(it => {
        if (!it) return false;
        return (it.nombreProducto && it.nombreProducto.toLowerCase().includes(q)) ||
               (it.idProducto && it.idProducto.toLowerCase().includes(q));
      });
      if (coincideProducto) return true;

      return false;
    });
  }, [pagosVisuales, filtroTexto, metodoFiltro, operadorFiltro, tipoCoberturaFiltro, resolverNombreOperador]);

  // Contador de filtros secundarios activos
  const filtrosActivosCount = useMemo(() => {
    let c = 0;
    if (periodoFiltro !== 'actual') c++;
    if (metodoFiltro !== 'todos') c++;
    if (operadorFiltro !== 'todos') c++;
    if (tipoCoberturaFiltro !== 'todos') c++;
    return c;
  }, [periodoFiltro, metodoFiltro, operadorFiltro, tipoCoberturaFiltro]);

  // Métricas financieras
  const metricas = useMemo(() => {
    let totalRecaudado = 0;
    let totalEfectivo = 0;
    let totalTarjeta = 0;
    let totalConsumoInterno = 0;
    let totalArticulosCubiertos = 0;

    pagosFiltrados.forEach(p => {
      totalRecaudado += (p.montoTotalPagado || 0);
      if (p.metodoPago === 'Efectivo') totalEfectivo += (p.montoTotalPagado || 0);
      else if (p.metodoPago === 'Tarjeta') totalTarjeta += (p.montoTotalPagado || 0);
      else if (p.metodoPago === 'Consumo Interno') totalConsumoInterno += (p.montoTotalPagado || 0);

      p.todosItemsSaldados.forEach(it => {
        totalArticulosCubiertos += (it.cantidad || 1);
      });
    });

    return {
      totalRecaudado,
      totalEfectivo,
      totalTarjeta,
      totalConsumoInterno,
      totalComprobantes: pagosFiltrados.length,
      totalArticulosCubiertos,
    };
  }, [pagosFiltrados]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(pagosFiltrados.length / itemsPerPage));

  const paginatedPagos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return pagosFiltrados.slice(start, start + itemsPerPage);
  }, [pagosFiltrados, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, filtroTexto, periodoFiltro, metodoFiltro, operadorFiltro, tipoCoberturaFiltro]);

  // Operadores disponibles
  const operadoresDisponibles = useMemo(() => {
    const uids = new Set<string>();
    pagosVisuales.forEach(p => {
      if (p.usuarioId) uids.add(p.usuarioId);
    });
    (usuariosData || []).forEach(u => {
      if (u.authUid) uids.add(u.authUid);
    });
    return Array.from(uids).map(uid => ({
      uid,
      nombre: resolverNombreOperador(uid),
    })).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [pagosVisuales, usuariosData, resolverNombreOperador]);

  // Exportar CSV
  const exportarCSV = useCallback(() => {
    if (pagosFiltrados.length === 0) return;

    const headers = [
      'ID Comprobante(s)',
      'Fecha',
      'Hora',
      'Ventas Afectadas',
      'Cliente',
      'Operador / Cajero',
      'Metodo de Pago',
      'Monto Pagado Total (Q)',
      'Distribucion en Ventas',
      'Articulos Saldados'
    ];

    const rows = pagosFiltrados.map(p => {
      const fechaStr = format(p.fecha, 'yyyy-MM-dd');
      const horaStr = format(p.fecha, 'HH:mm:ss');
      const ventasStr = p.ventas.map(v => `#${v.idVenta}`).join(', ');
      const distribucionStr = p.ventas.map(v => `Venta #${v.idVenta}: Q${v.montoPagadoVenta.toFixed(2)}`).join(' | ');
      const articulosStr = p.todosItemsSaldados.map(it => `${it.cantidad}x ${it.nombreProducto} (Q${it.subtotal.toFixed(2)})`).join('; ');

      return [
        `"${p.idsPagoTexto}"`,
        `"${fechaStr}"`,
        `"${horaStr}"`,
        `"${ventasStr}"`,
        `"${p.clienteNombre.replace(/"/g, '""')}"`,
        `"${resolverNombreOperador(p.usuarioId).replace(/"/g, '""')}"`,
        `"${p.metodoPago}"`,
        p.montoTotalPagado.toFixed(2),
        `"${distribucionStr.replace(/"/g, '""')}"`,
        `"${articulosStr.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Control_Pagos_${sucursal?.nombre || 'Sucursal'}_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [pagosFiltrados, sucursal, resolverNombreOperador]);

  return {
    isLoadingSucursal,
    cargandoEstadoCaja,
    cargandoPagos,
    sucursal,
    filtroTexto,
    setFiltroTexto,
    mostrarFiltros,
    setMostrarFiltros,
    periodoFiltro,
    setPeriodoFiltro,
    metodoFiltro,
    setMetodoFiltro,
    operadorFiltro,
    setOperadorFiltro,
    tipoCoberturaFiltro,
    setTipoCoberturaFiltro,
    fechaInicioPers,
    setFechaInicioPers,
    fechaFinPers,
    setFechaFinPers,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    pagoSeleccionadoTicket,
    setPagoSeleccionadoTicket,
    pagosFiltrados,
    paginatedPagos,
    metricas,
    filtrosActivosCount,
    operadoresDisponibles,
    cierres,
    resolverNombreOperador,
    exportarCSV,
  };
}
