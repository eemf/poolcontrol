'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  collection, query, orderBy, where, doc, Timestamp 
} from 'firebase/firestore';
import { useFirebase, useCollection, useMemoFirebase, useDoc, useUser } from '@/firebase';
import type { Pago, Generales, CierreCaja, UsuarioSucursal } from '@/lib/tipos';
import { useSucursal } from '@/hooks/use-sucursal';
import { toDate } from '@/lib/firebase/servicios/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

// Componentes de interfaz
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { 
  Search, Loader2, ChevronLeft, ChevronRight, Clock, ReceiptText, 
  ExternalLink, Coins, CreditCard, User, Download, Printer, 
  RotateCcw, ShoppingCart, Calendar, 
  DollarSign, Wallet, Tag, HandCoins, Split, SlidersHorizontal
} from 'lucide-react';

type PagoConDocId = Pago & { id: string };

type PeriodoTipo = 'actual' | 'hoy' | 'ayer' | '7dias' | 'mes' | 'todos' | 'personalizado' | string;

export interface VentaDesglosada {
  idVenta: number;
  ventaDocId: string;
  montoPagadoVenta: number;
  ventaTotal?: number;
  itemsSaldados: Pago['itemsSaldados'];
}

export interface PagoVisual {
  id: string; // group key or doc id
  idPagoPrincipal: number;
  idsPagoTexto: string; // Ej: "#104" o "#104 - #105"
  fecha: Date;
  clienteNombre: string;
  montoTotalPagado: number; // Suma de montos, ej: Q40.00
  metodoPago: string;
  usuarioId: string;
  esMultiventa: boolean; // true si cubrió más de 1 venta
  ventas: VentaDesglosada[];
  todosItemsSaldados: (Pago['itemsSaldados'][0] & { idVenta?: number })[];
  rawPagos: PagoConDocId[];
}

export default function PaginaControlPagos() {
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

  // 3. Usuarios de la sucursal para resolver usuarioId -> Nombre real
  const usuariosQuery = useMemoFirebase(() => 
    (firestore && sucursalId) ? query(collection(firestore, `sucursales/${sucursalId}/usuarios`), orderBy('nombre', 'asc')) : null
  , [firestore, sucursalId]);
  const { data: usuariosData } = useCollection<UsuarioSucursal>(usuariosQuery);

  // Mapeo rápido de usuarios por UID o docId
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

  const resolverNombreOperador = (uid?: string): string => {
    if (!uid) return 'Sistema';
    const found = mapaUsuarios.get(uid);
    if (found?.nombre) return found.nombre;
    if (currentUser?.uid === uid) return currentUser.displayName || currentUser.email?.split('@')[0] || 'Tú';
    return uid.length > 12 ? `Operador (${uid.slice(0, 6)}...)` : uid;
  };

  // 4. Consulta de pagos
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

    return null; // 'todos'
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

  // AGRUPACIÓN INTELIGENTE DE PAGOS MULTI-VENTA:
  // Si una sola operación de cobro distribuyó un pago (ej. Q40 = Q10 a Venta 1 + Q30 a Venta 2),
  // se unifica en UN SOLO PAGO DE Q40 con desglose completo por ventas y productos.
  const pagosVisuales = useMemo((): PagoVisual[] => {
    const lista = (rawPagos || []).map(p => ({ ...p, id: p.id }));
    if (lista.length === 0) return [];

    const grupos = new Map<string, PagoConDocId[]>();
    const yaAsignados = new Set<string>();

    lista.forEach((pago) => {
      if (yaAsignados.has(pago.id)) return;

      // 1. Agrupamiento por grupoPagoId explícito
      if (pago.grupoPagoId) {
        const matches = lista.filter(x => x.grupoPagoId === pago.grupoPagoId);
        matches.forEach(m => yaAsignados.add(m.id));
        grupos.set(`grp_${pago.grupoPagoId}`, matches);
        return;
      }

      // 2. Agrupamiento retroactivo de pagos coetáneos de una misma operación
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

  // Filtro multidimensional sobre los pagos visuales agrupados
  const pagosFiltrados = useMemo(() => {
    const q = filtroTexto.trim().toLowerCase();

    return pagosVisuales.filter(p => {
      // Filtro por método de pago
      if (metodoFiltro !== 'todos' && p.metodoPago !== metodoFiltro) {
        return false;
      }

      // Filtro por cajero / operador
      if (operadorFiltro !== 'todos' && p.usuarioId !== operadorFiltro) {
        return false;
      }

      // Filtro por tipo de cobertura
      if (tipoCoberturaFiltro === 'completo') {
        const esCompleto = p.ventas.every(v => v.ventaTotal && Math.abs(v.montoPagadoVenta - v.ventaTotal) < 0.05);
        if (!esCompleto) return false;
      } else if (tipoCoberturaFiltro === 'abono') {
        const esAbono = p.ventas.some(v => v.ventaTotal && Math.abs(v.montoPagadoVenta - v.ventaTotal) >= 0.05);
        if (!esAbono) return false;
      }

      if (!q) return true;

      // Coincidencia por ID de comprobante
      if (p.idsPagoTexto.toLowerCase().includes(q) || String(p.idPagoPrincipal).includes(q)) return true;

      // Coincidencia por ID de cualquiera de las ventas afectadas
      if (p.ventas.some(v => String(v.idVenta).includes(q) || `#${v.idVenta}`.includes(q))) return true;

      // Coincidencia por Nombre de Cliente
      if (p.clienteNombre && p.clienteNombre.toLowerCase().includes(q)) return true;

      // Coincidencia por Operador
      const nomOperador = resolverNombreOperador(p.usuarioId).toLowerCase();
      if (nomOperador.includes(q)) return true;

      // Coincidencia por Método de Pago
      if (p.metodoPago && p.metodoPago.toLowerCase().includes(q)) return true;

      // Coincidencia por Productos Cubiertos en cualquiera de las ventas
      const coincideProducto = p.todosItemsSaldados?.some(it => {
        if (!it) return false;
        return (it.nombreProducto && it.nombreProducto.toLowerCase().includes(q)) ||
               (it.idProducto && it.idProducto.toLowerCase().includes(q));
      });
      if (coincideProducto) return true;

      return false;
    });
  }, [pagosVisuales, filtroTexto, metodoFiltro, operadorFiltro, tipoCoberturaFiltro, mapaUsuarios]);

  // Contador de filtros secundarios activos
  const filtrosActivosCount = useMemo(() => {
    let c = 0;
    if (periodoFiltro !== 'actual') c++;
    if (metodoFiltro !== 'todos') c++;
    if (operadorFiltro !== 'todos') c++;
    if (tipoCoberturaFiltro !== 'todos') c++;
    return c;
  }, [periodoFiltro, metodoFiltro, operadorFiltro, tipoCoberturaFiltro]);

  // Métricas financieras calculadas del resultado filtrado
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

  // Lista de operadores para el dropdown
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
  }, [pagosVisuales, usuariosData, mapaUsuarios]);

  // Exportar registros a CSV
  const exportarCSV = () => {
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
      const fechaStr = format(p.fecha, 'dd/MM/yyyy');
      const horaStr = format(p.fecha, 'HH:mm:ss');
      const operadorStr = resolverNombreOperador(p.usuarioId);
      const ventasStr = p.ventas.map(v => `#${v.idVenta}`).join(' | ');
      const distribucionStr = p.ventas.map(v => `Venta #${v.idVenta}: Q${v.montoPagadoVenta.toFixed(2)}`).join(' ; ');
      const articulosStr = (p.todosItemsSaldados || [])
        .map(it => `${it.cantidad || 1}x ${it.nombreProducto} (Venta #${it.idVenta || ''}: Q${(it.montoAplicado || 0).toFixed(2)})`)
        .join(' | ');

      return [
        `"${p.idsPagoTexto}"`,
        fechaStr,
        horaStr,
        `"${ventasStr}"`,
        `"${(p.clienteNombre || 'Consumidor Final').replace(/"/g, '""')}"`,
        `"${operadorStr.replace(/"/g, '""')}"`,
        p.metodoPago,
        p.montoTotalPagado.toFixed(2),
        `"${distribucionStr}"`,
        `"${articulosStr.replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `control_de_pagos_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getBadgeStyle = (metodo: string) => {
    switch (metodo) {
      case 'Efectivo': return 'bg-emerald-600/90 hover:bg-emerald-600 text-white border-emerald-500/30';
      case 'Tarjeta': return 'bg-blue-600/90 hover:bg-blue-600 text-white border-blue-500/30';
      case 'Consumo Interno': return 'bg-purple-600/90 hover:bg-purple-600 text-white border-purple-500/30';
      default: return 'bg-slate-600 text-white';
    }
  };

  const isLoading = isLoadingSucursal || cargandoPagos || (periodoFiltro === 'actual' && cargandoEstadoCaja);

  return (
    <div className="space-y-6 pb-12 font-body">
      {/* 1. Encabezado con estilo estándar consistente con Punto de Venta (POS) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex flex-col w-full text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2">
            <HandCoins className="h-6 w-6"/>
            <span>Control de Pagos</span>
          </h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Rastreo de comprobantes, pagos unificados, productos cubiertos y operadores.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 w-full sm:w-auto shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={exportarCSV}
            disabled={pagosFiltrados.length === 0}
            className="w-10 h-10 p-0 sm:w-auto sm:h-10 sm:px-4 sm:py-2 rounded-full shrink-0"
            title="Exportar CSV"
          >
            <Download className="h-4 w-4 sm:mr-2 shrink-0 text-primary" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="w-10 h-10 p-0 sm:w-auto sm:h-10 sm:px-4 sm:py-2 rounded-full shrink-0"
            title="Historial de Ventas"
          >
            <Link href="/dashboard/historial-ventas">
              <ShoppingCart className="h-4 w-4 sm:mr-2 shrink-0 text-blue-400" />
              <span className="hidden sm:inline">Historial de Ventas</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Tarjetas de Métricas Financieras (KPI Cards) - Sin textos en mayúsculas sostenidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Total Recaudado */}
        <Card className="bg-[#1d283a] border-[#324157] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground">Total recaudado</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl md:text-3xl font-black text-emerald-400 tabular-nums">
              Q{metricas.totalRecaudado.toFixed(2)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {metricas.totalComprobantes} pago{metricas.totalComprobantes !== 1 ? 's' : ''} registrado{metricas.totalComprobantes !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        {/* Efectivo */}
        <Card className="bg-[#1d283a] border-[#324157] shadow-sm relative overflow-hidden">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground">En efectivo</span>
              <div className="p-1.5 rounded-lg bg-emerald-600/10 text-emerald-500">
                <Coins className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl md:text-2xl font-black text-white tabular-nums">
              Q{metricas.totalEfectivo.toFixed(2)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {metricas.totalRecaudado > 0 ? `${((metricas.totalEfectivo / metricas.totalRecaudado) * 100).toFixed(0)}% del total` : '0%'}
            </p>
          </CardContent>
        </Card>

        {/* Tarjeta */}
        <Card className="bg-[#1d283a] border-[#324157] shadow-sm relative overflow-hidden">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground">En tarjeta</span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl md:text-2xl font-black text-blue-400 tabular-nums">
              Q{metricas.totalTarjeta.toFixed(2)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {metricas.totalRecaudado > 0 ? `${((metricas.totalTarjeta / metricas.totalRecaudado) * 100).toFixed(0)}% del total` : '0%'}
            </p>
          </CardContent>
        </Card>

        {/* Artículos Cubiertos */}
        <Card className="bg-[#1d283a] border-[#324157] shadow-sm relative overflow-hidden">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground">Artículos cubiertos</span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                <ReceiptText className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl md:text-2xl font-black text-purple-300 tabular-nums">
              {metricas.totalArticulosCubiertos}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Productos y servicios saldados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Contenedor Unificado: Búsqueda, Filtros y Lista de Pagos */}
      <Card className="bg-[#1d283a] border-[#324157] shadow-md overflow-hidden">
        {/* Encabezado del contenedor: Título, paginación rápida y buscador integrado con filtros */}
        <div className="p-3 sm:p-4 space-y-3 bg-[#17202e] border-b border-[#324157]">
          {/* Fila 1: Título de la sección y paginación rápida */}
          <div className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-primary" />
              <h2 className="text-sm sm:text-base font-bold text-white">
                Historial de pagos y cobros
              </h2>
              <Badge className="bg-[#283244] text-white border-[#324157] font-mono text-[11px] rounded-full ml-1">
                {pagosFiltrados.length} pago{pagosFiltrados.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            <div className="text-xs text-muted-foreground hidden sm:block">
              Página {currentPage} de {totalPages}
            </div>
          </div>

          {/* Fila 2: Input del Buscador con botón de Filtros integrado dentro del input */}
          <div className="relative flex items-center w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary pointer-events-none" />
            <Input
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              placeholder="Buscar por producto cubierto, cliente, # venta, # comprobante, operador o método..."
              className="pl-10 pr-28 sm:pr-32 h-11 rounded-full bg-[#1d283a] border-[#324157] text-white placeholder:text-muted-foreground/70 focus-visible:ring-primary shadow-inner text-xs sm:text-sm"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {filtroTexto && (
                <button
                  onClick={() => setFiltroTexto('')}
                  className="text-xs font-bold text-muted-foreground hover:text-white px-2 py-1 rounded-full bg-[#283244] transition-colors"
                  title="Borrar búsqueda"
                >
                  ✕
                </button>
              )}
              <Button
                type="button"
                variant={mostrarFiltros || filtrosActivosCount > 0 ? "secondary" : "outline"}
                size="sm"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className={cn(
                  "h-8 px-3 rounded-full text-xs font-medium transition-colors gap-1.5 shrink-0",
                  mostrarFiltros 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 border-transparent shadow-xs" 
                    : "bg-[#283244] border-[#324157] text-white hover:bg-[#324157]"
                )}
                title="Mostrar u ocultar filtros"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Filtros</span>
                {filtrosActivosCount > 0 && (
                  <Badge className="h-4 px-1.5 text-[9px] font-bold bg-white text-black border-none rounded-full ml-0.5">
                    {filtrosActivosCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Fila 3: Selectores de Filtro desplegables cuando mostrarFiltros está activo o hay filtros activos */}
          {(mostrarFiltros || filtrosActivosCount > 0) && (
            <div className="pt-2 border-t border-[#324157]/60 space-y-3 animate-in fade-in-50 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Período */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-primary" /> Período
                  </label>
                  <Select value={periodoFiltro} onValueChange={(v) => setPeriodoFiltro(v)}>
                    <SelectTrigger className="h-9 rounded-full bg-[#1d283a] border-[#324157] text-xs font-medium text-white">
                      <SelectValue placeholder="Seleccionar período" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#17202e] border-[#324157] text-white max-h-[320px]">
                      <SelectItem value="actual" className="font-bold text-primary">Turno actual (abierto)</SelectItem>
                      <SelectItem value="hoy">Hoy</SelectItem>
                      <SelectItem value="ayer">Ayer</SelectItem>
                      <SelectItem value="7dias">Últimos 7 días</SelectItem>
                      <SelectItem value="mes">Este mes</SelectItem>
                      <SelectItem value="personalizado">Rango personalizado</SelectItem>
                      <SelectItem value="todos">Todos los registros</SelectItem>
                      {cierres && cierres.length > 0 && (
                        <>
                          <Separator className="my-1.5 bg-[#324157]" />
                          <p className="px-2 py-1 text-[10px] font-medium text-muted-foreground">Turnos cerrados anteriores</p>
                          {cierres.slice(0, 15).map(c => (
                            <SelectItem key={c.id} value={c.id} className="text-xs">
                              Turno #{c.idCuadre} — {format(toDate(c.fecha), 'dd/MM/yy HH:mm')}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Método de Pago */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                    <Wallet className="h-3 w-3 text-blue-400" /> Método de pago
                  </label>
                  <Select value={metodoFiltro} onValueChange={setMetodoFiltro}>
                    <SelectTrigger className="h-9 rounded-full bg-[#1d283a] border-[#324157] text-xs font-medium text-white">
                      <SelectValue placeholder="Todos los métodos" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#17202e] border-[#324157] text-white">
                      <SelectItem value="todos">Todos los métodos</SelectItem>
                      <SelectItem value="Efectivo">Solo efectivo</SelectItem>
                      <SelectItem value="Tarjeta">Solo tarjeta</SelectItem>
                      <SelectItem value="Consumo Interno">Consumo interno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Operador / Cajero */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3 w-3 text-emerald-400" /> Operador / Cajero
                  </label>
                  <Select value={operadorFiltro} onValueChange={setOperadorFiltro}>
                    <SelectTrigger className="h-9 rounded-full bg-[#1d283a] border-[#324157] text-xs font-medium text-white">
                      <SelectValue placeholder="Todos los operadores" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#17202e] border-[#324157] text-white max-h-[250px]">
                      <SelectItem value="todos">Todos los operadores</SelectItem>
                      {operadoresDisponibles.map(op => (
                        <SelectItem key={op.uid} value={op.uid} className="text-xs">
                          {op.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tipo de Cobertura */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                    <Tag className="h-3 w-3 text-amber-400" /> Tipo de pago
                  </label>
                  <Select value={tipoCoberturaFiltro} onValueChange={setTipoCoberturaFiltro}>
                    <SelectTrigger className="h-9 rounded-full bg-[#1d283a] border-[#324157] text-xs font-medium text-white">
                      <SelectValue placeholder="Todos los pagos" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#17202e] border-[#324157] text-white">
                      <SelectItem value="todos">Todos los pagos</SelectItem>
                      <SelectItem value="completo">Liquidaciones completas (100%)</SelectItem>
                      <SelectItem value="abono">Abonos parciales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Rango Personalizado de Fechas (si está activo) */}
              {periodoFiltro === 'personalizado' && (
                <div className="flex flex-col sm:flex-row items-center gap-3 p-2.5 rounded-xl bg-[#1d283a] border border-primary/20">
                  <span className="text-xs font-semibold text-primary flex items-center gap-1.5 shrink-0">
                    <Calendar className="h-3.5 w-3.5" /> Fechas personalizadas:
                  </span>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-[11px] text-muted-foreground">Desde:</span>
                    <Input
                      type="date"
                      value={fechaInicioPers}
                      onChange={(e) => setFechaInicioPers(e.target.value)}
                      className="h-8 text-xs rounded-lg bg-[#283244] border-[#324157] text-white w-full sm:w-[150px]"
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-[11px] text-muted-foreground">Hasta:</span>
                    <Input
                      type="date"
                      value={fechaFinPers}
                      onChange={(e) => setFechaFinPers(e.target.value)}
                      className="h-8 text-xs rounded-lg bg-[#283244] border-[#324157] text-white w-full sm:w-[150px]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fila 4: Indicador de Filtros Activos y Limpieza */}
          {(filtroTexto || metodoFiltro !== 'todos' || operadorFiltro !== 'todos' || tipoCoberturaFiltro !== 'todos' || periodoFiltro !== 'actual') && (
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-[#324157]/60 flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-white/80">Filtros aplicados:</span>
                {filtroTexto && (
                  <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-[10px] rounded-full font-normal">
                    Texto: &quot;{filtroTexto}&quot;
                  </Badge>
                )}
                {metodoFiltro !== 'todos' && (
                  <Badge variant="outline" className="border-blue-500/40 bg-blue-500/10 text-blue-400 text-[10px] rounded-full font-normal">
                    Método: {metodoFiltro}
                  </Badge>
                )}
                {operadorFiltro !== 'todos' && (
                  <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-[10px] rounded-full font-normal">
                    Operador: {resolverNombreOperador(operadorFiltro)}
                  </Badge>
                )}
                {tipoCoberturaFiltro !== 'todos' && (
                  <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-400 text-[10px] rounded-full font-normal">
                    {tipoCoberturaFiltro === 'completo' ? 'Liquidación total' : 'Abonos'}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFiltroTexto('');
                  setPeriodoFiltro('actual');
                  setMetodoFiltro('todos');
                  setOperadorFiltro('todos');
                  setTipoCoberturaFiltro('todos');
                  setFechaInicioPers('');
                  setFechaFinPers('');
                }}
                className="h-7 text-xs text-muted-foreground hover:text-white hover:bg-[#283244] rounded-full px-3"
              >
                <RotateCcw className="h-3 w-3 mr-1" /> Restablecer filtros
              </Button>
            </div>
          )}
        </div>

        {/* Cuerpo del contenedor unificado: Lista de Acordeones de Pagos */}
        <CardContent className="p-3 sm:p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs font-bold">Cargando pagos y transacciones...</p>
            </div>
          ) : pagosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed border-[#324157] rounded-xl bg-[#17202e]/40 my-2">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                <ReceiptText className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-base text-white">No se encontraron pagos</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                {filtroTexto 
                  ? `No hay registros coincidentes con "${filtroTexto}" en este período.`
                  : 'No se registran pagos en el período seleccionado.'}
              </p>
              {periodoFiltro === 'actual' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPeriodoFiltro('todos')}
                  className="mt-4 rounded-full h-8 text-xs bg-[#283244] border-[#324157] text-primary hover:bg-[#324157]"
                >
                  <Clock className="h-3.5 w-3.5 mr-1.5" /> Buscar en todos los registros históricos
                </Button>
              )}
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full space-y-2.5">
              {paginatedPagos.map((pago) => {
                const operadorNombre = resolverNombreOperador(pago.usuarioId);
                const qLower = filtroTexto.trim().toLowerCase();

                return (
                  <AccordionItem
                    key={pago.id}
                    value={pago.id}
                    className="border border-[#324157] rounded-xl bg-[#283244] hover:border-primary/40 transition-all overflow-hidden shadow-sm"
                  >
                    <AccordionTrigger className="p-3.5 sm:p-4 hover:no-underline font-body transition-colors data-[state=open]:bg-[#17202e]/60">
                      <div className="flex flex-1 items-center justify-between w-full pr-2 sm:pr-4 gap-3">
                        {/* Identificación: ID Pago, Cliente y Ventas */}
                        <div className="min-w-0 text-left space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-xs sm:text-sm text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                              {pago.idsPagoTexto}
                            </span>
                            <span className="font-bold text-sm sm:text-base text-white truncate max-w-[180px] sm:max-w-[280px]">
                              {pago.clienteNombre}
                            </span>

                            {/* Badge de Multi-venta si cubrió más de 1 venta */}
                            {pago.esMultiventa ? (
                              <Badge className="bg-indigo-600/80 hover:bg-indigo-600 text-white border-indigo-400/30 text-[10px] font-medium rounded-full flex items-center gap-1">
                                <Split className="h-3 w-3" />
                                Cubrió {pago.ventas.length} ventas ({pago.ventas.map(v => `#${v.idVenta}`).join(', ')})
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] font-medium border-[#324157] text-muted-foreground bg-[#17202e] hidden sm:inline-flex">
                                Venta #{pago.ventas[0]?.idVenta}
                              </Badge>
                            )}
                          </div>

                          {/* Fecha, hora y operador en subtítulo */}
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1 text-white/70">
                              <Clock className="h-3 w-3 text-primary/80" />
                              {format(pago.fecha, 'dd/MM/yyyy hh:mm:ss a')}
                            </span>
                            <span className="text-white/40">•</span>
                            <span className="flex items-center gap-1 text-emerald-400 font-medium">
                              <User className="h-3 w-3 text-emerald-400" />
                              {operadorNombre}
                            </span>
                            <span className="text-white/40 hidden md:inline">•</span>
                            <span className="text-muted-foreground/80 hidden md:inline">
                              {formatDistanceToNow(pago.fecha, { addSuffix: true, locale: es })}
                            </span>
                          </div>
                        </div>

                        {/* Monto pagado y método */}
                        <div className="text-right flex flex-col items-end shrink-0 ml-2">
                          <span className="font-black text-emerald-400 tabular-nums text-base sm:text-lg leading-tight">
                            Q{pago.montoTotalPagado.toFixed(2)}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Badge className={cn("h-5 text-[9.5px] font-medium rounded-full px-2 shadow-xs", getBadgeStyle(pago.metodoPago))}>
                              {pago.metodoPago}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-4 pb-4 pt-1">
                      <div className="border-t border-[#324157] pt-4 mt-1 space-y-4">
                        
                        {/* Banner de Operación Multi-Venta (si aplica) */}
                        {pago.esMultiventa && (
                          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300">
                                <Split className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white">Pago unificado de Q{pago.montoTotalPagado.toFixed(2)}</p>
                                <p className="text-[11px] text-indigo-300/80">
                                  Este pago único se distribuyó entre {pago.ventas.length} ventas a crédito pendientes del cliente.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {pago.ventas.map(v => (
                                <Badge key={v.idVenta} variant="outline" className="border-indigo-400/40 bg-indigo-900/30 text-white font-mono text-[10px]">
                                  Venta #{v.idVenta}: Q{v.montoPagadoVenta.toFixed(2)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* DESGLOSE POR CADA VENTA CUBIERTA */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-white flex items-center gap-2">
                            <ReceiptText className="h-3.5 w-3.5 text-primary" />
                            Distribución de ventas y artículos cubiertos
                          </h4>

                          <div className="space-y-3">
                            {pago.ventas.map((v) => {
                              const esVentaLiquidadaTotal = v.ventaTotal && Math.abs(v.montoPagadoVenta - v.ventaTotal) < 0.05;

                              return (
                                <div key={v.idVenta} className="rounded-xl border border-[#324157] bg-[#17202e] p-3.5 space-y-3 shadow-inner">
                                  {/* Encabezado de la Venta */}
                                  <div className="flex items-center justify-between pb-2 border-b border-[#324157]/60 flex-wrap gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                                        Venta #{v.idVenta}
                                      </span>
                                      <span className="text-xs font-medium text-white">
                                        Cubierto por este pago: <span className="text-emerald-400 font-bold">Q{v.montoPagadoVenta.toFixed(2)}</span>
                                      </span>
                                      {v.ventaTotal && (
                                        <span className="text-[10px] text-muted-foreground font-mono">
                                          (Total de la venta: Q{v.ventaTotal.toFixed(2)})
                                        </span>
                                      )}
                                      <Badge className={cn("text-[9px] font-medium rounded-full px-1.5 h-4", esVentaLiquidadaTotal ? "bg-emerald-600 text-white" : "bg-amber-600 text-white")}>
                                        {esVentaLiquidadaTotal ? 'Liquidada al 100%' : 'Abono'}
                                      </Badge>
                                    </div>

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      asChild
                                      className="h-7 text-[11px] font-medium text-blue-400 hover:text-white hover:bg-[#283244] px-2 rounded-full"
                                    >
                                      <Link href={`/dashboard/historial-ventas?ventaId=${v.ventaDocId}`}>
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        Ver Venta #{v.idVenta}
                                      </Link>
                                    </Button>
                                  </div>

                                  {/* Artículos saldados dentro de esta venta */}
                                  <div className="space-y-1.5 pt-1">
                                    <span className="text-[10px] font-medium text-muted-foreground block">
                                      Artículos saldados en Venta #{v.idVenta}:
                                    </span>
                                    {v.itemsSaldados && v.itemsSaldados.length > 0 ? (
                                      v.itemsSaldados.map((it, iIdx) => {
                                        const coincide = qLower && (it.nombreProducto?.toLowerCase().includes(qLower) || it.idProducto?.toLowerCase().includes(qLower));

                                        return (
                                          <div
                                            key={iIdx}
                                            className={cn(
                                              "flex justify-between items-center p-2.5 rounded-lg border text-xs transition-colors",
                                              coincide
                                                ? "bg-primary/10 border-primary"
                                                : "bg-[#283244]/60 border-[#324157]/80 hover:bg-[#283244]"
                                            )}
                                          >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                              <span className="font-bold text-white bg-[#17202e] px-1.5 py-0.5 rounded text-[11px] border border-[#324157]">
                                                {it.cantidad || 1}x
                                              </span>
                                              <div className="min-w-0">
                                                <div className="font-bold text-white truncate text-xs flex items-center gap-1.5">
                                                  <span>{it.nombreProducto}</span>
                                                  {it.esVirtual && (
                                                    <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 border-purple-500/30 text-purple-400 bg-purple-500/10">
                                                      Virtual
                                                    </Badge>
                                                  )}
                                                </div>
                                                {it.subtotalItem && (
                                                  <span className="text-[9.5px] text-muted-foreground font-mono">
                                                    Subtotal: Q{it.subtotalItem.toFixed(2)}
                                                  </span>
                                                )}
                                              </div>
                                            </div>

                                            <div className="text-right flex flex-col items-end shrink-0 ml-2">
                                              <span className="font-bold text-emerald-400 font-mono text-xs">
                                                Q{(it.montoAplicado || 0).toFixed(2)}
                                              </span>
                                              <span className="text-[9px] text-muted-foreground">
                                                Aplicado
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })
                                    ) : (
                                      <div className="p-2 text-center text-xs text-muted-foreground bg-[#283244]/40 rounded-lg">
                                        Abono directo al saldo de la venta sin desglose de ítems.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Botones de Acción del Registro */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#324157]/60">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPagoSeleccionadoTicket(pago)}
                            className="h-8 rounded-full text-xs font-medium bg-[#17202e] border-[#324157] text-white hover:bg-[#283244] gap-1.5"
                          >
                            <Printer className="h-3.5 w-3.5 text-primary" />
                            <span>Imprimir comprobante unificado</span>
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>

        {/* Paginación */}
        {totalPages > 1 && (
          <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-[#324157] bg-[#17202e]">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">Registros por página:</span>
              <Select
                value={`${itemsPerPage}`}
                onValueChange={(val) => setItemsPerPage(Number(val))}
              >
                <SelectTrigger className="h-8 w-[75px] rounded-full text-xs bg-[#283244] border-[#324157] text-white">
                  <SelectValue placeholder={itemsPerPage} />
                </SelectTrigger>
                <SelectContent className="bg-[#17202e] border-[#324157] text-white font-body">
                  {[10, 15, 25, 50, 100].map((size) => (
                    <SelectItem key={size} value={`${size}`}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 rounded-full h-8 bg-[#283244] border-[#324157] text-white hover:bg-[#324157]"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="text-xs">Anterior</span>
              </Button>

              <div className="text-xs font-bold text-muted-foreground px-2">
                Página {currentPage} de {totalPages}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 rounded-full h-8 bg-[#283244] border-[#324157] text-white hover:bg-[#324157]"
              >
                <span className="text-xs">Siguiente</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* 5. Modal de Comprobante / Ticket Imprimible */}
      <Dialog open={!!pagoSeleccionadoTicket} onOpenChange={(open) => !open && setPagoSeleccionadoTicket(null)}>
        <DialogContent className="max-w-md bg-[#17202e] border-[#324157] text-white p-6 font-body rounded-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold flex items-center gap-2 text-white">
                <ReceiptText className="h-5 w-5 text-primary" />
                Comprobante de pago
              </DialogTitle>
              {pagoSeleccionadoTicket && (
                <Badge className={cn("text-[9px] font-medium", getBadgeStyle(pagoSeleccionadoTicket.metodoPago))}>
                  {pagoSeleccionadoTicket.metodoPago}
                </Badge>
              )}
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Comprobante oficial de cobro y liquidación.
            </DialogDescription>
          </DialogHeader>

          {pagoSeleccionadoTicket && (
            <div className="space-y-4 my-2 text-xs">
              {/* Encabezado del Ticket */}
              <div className="bg-[#1d283a] p-4 rounded-xl border border-[#324157] text-center space-y-1">
                <h3 className="font-bold text-sm text-white">
                  {sucursal?.nombre || 'Pool Control'}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Comprobante {pagoSeleccionadoTicket.idsPagoTexto}
                </p>
                <div className="text-[10px] text-muted-foreground pt-1 border-t border-[#324157]/60 mt-1">
                  {format(pagoSeleccionadoTicket.fecha, "dd 'de' MMMM, yyyy - hh:mm:ss a", { locale: es })}
                </div>
              </div>

              {/* Datos de la Operación */}
              <div className="space-y-1.5 bg-[#1d283a] p-3 rounded-xl border border-[#324157]">
                <div className="flex justify-between py-1 border-b border-[#324157]/40">
                  <span className="text-muted-foreground font-medium">Cliente:</span>
                  <span className="font-bold text-white">{pagoSeleccionadoTicket.clienteNombre}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#324157]/40">
                  <span className="text-muted-foreground font-medium">Ventas cubiertas:</span>
                  <span className="font-mono font-bold text-primary">
                    {pagoSeleccionadoTicket.ventas.map(v => `#${v.idVenta}`).join(', ')}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#324157]/40">
                  <span className="text-muted-foreground font-medium">Operador / Cajero:</span>
                  <span className="font-bold text-emerald-400">{resolverNombreOperador(pagoSeleccionadoTicket.usuarioId)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground font-medium">Método de pago:</span>
                  <span className="font-bold text-white">{pagoSeleccionadoTicket.metodoPago}</span>
                </div>
              </div>

              {/* Desglose por Ventas en el Ticket */}
              <div className="space-y-2">
                <p className="text-[10px] font-medium text-muted-foreground">
                  Distribución en ventas y artículos
                </p>
                <div className="max-h-[180px] overflow-y-auto space-y-2 pr-1">
                  {pagoSeleccionadoTicket.ventas.map((v) => (
                    <div key={v.idVenta} className="p-2.5 rounded-lg bg-[#1d283a] border border-[#324157] space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold text-white pb-1 border-b border-[#324157]/60">
                        <span className="text-primary font-mono">Venta #{v.idVenta}</span>
                        <span className="text-emerald-400 font-mono">Q{v.montoPagadoVenta.toFixed(2)}</span>
                      </div>
                      <div className="space-y-1">
                        {v.itemsSaldados?.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[11px] text-muted-foreground">
                            <span>{it.cantidad || 1}x {it.nombreProducto}</span>
                            <span className="font-mono text-white/80">Q{(it.montoAplicado || 0).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Destacado */}
              <div className="flex justify-between items-center bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl">
                <span className="font-bold text-sm text-white">Monto total pagado:</span>
                <span className="font-black text-lg text-emerald-400 tabular-nums">
                  Q{pagoSeleccionadoTicket.montoTotalPagado.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="flex sm:justify-between items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagoSeleccionadoTicket(null)}
              className="rounded-full bg-[#1d283a] border-[#324157] text-white hover:bg-[#283244]"
            >
              Cerrar
            </Button>

            <Button
              size="sm"
              onClick={() => {
                window.print();
              }}
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
