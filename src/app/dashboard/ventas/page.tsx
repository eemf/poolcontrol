'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { collection, onSnapshot, query, where, Timestamp, orderBy, doc, serverTimestamp } from 'firebase/firestore';
import { useFirebase, useUser } from '@/firebase';
import type { Venta, Producto, Cliente, DetalleVenta, Preparacion, EstadoCaja, ProductoVirtual } from '@/lib/tipos';
import { useToast } from '@/hooks/use-toast';
import { 
  guardarCliente, 
  registrarAbonoACuenta, 
  pasarVentaACredito, 
  eliminarCliente, 
  descontarStockTemporal, 
  devolverStockTemporal, 
  cancelarVentaYDevolverStock, 
  guardarVentaYActualizarStock, 
  procesarPagoVenta, 
  liquidarVentaACredito, 
  liquidarComoConsumoInterno, 
  descontarStockVirtualTemporal, 
  devolverStockVirtualTemporal,
  sincronizarContadorCredito,
  procesarPagoUnificado
} from '@/lib/firebase/servicios';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSucursal } from '@/hooks/use-sucursal';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 as Loader } from 'lucide-react';

// Componentes modulares
import { POSHeader } from './_components/pos-header';
import { POSForm } from './_components/pos-form';
import { POSCart } from './_components/pos-cart';
import { POSAccounts } from './_components/pos-accounts';
import { POSDialogs } from './_components/pos-dialogs';

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

export default function PaginaVentasPOS() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();

  // Estados de datos
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosVirtuales, setProductosVirtuales] = useState<ProductoVirtual[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ventasPendientes, setVentasPendientes] = useState<Venta[]>([]);
  const [ventasACredito, setVentasACredito] = useState<Venta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesandoCredito, setProcesandoCredito] = useState<string | null>(null);
  const [estadoCaja, setEstadoCaja] = useState<EstadoCaja | null>(null);

  // Estados de la venta actual
  const [idVentaActiva, setIdVentaActiva] = useState<string | null>(null);
  const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState<string>('');
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState<string>('');
  const [preparacionSeleccionada, setPreparacionSeleccionada] = useState<Preparacion | 'base' | null>(null);
  const [cantidad, setCantidad] = useState<number | ''>(1);
  const [carrito, setCarrito] = useState<DetalleVenta[]>([]);
  const [descripcionItemManual, setDescripcionItemManual] = useState('');
  const [precioUnitarioItemManual, setPrecioUnitarioItemManual] = useState<number | ''>('');
  const [cantidadItemManual, setCantidadItemManual] = useState<number | ''>(1);
  const [mostrarItemManual, setMostrarItemManual] = useState(false);
  
  // Estados para diálogos
  const [dialogoPagoAbierto, setDialogoPagoAbierto] = useState(false);
  const [vistaDialogo, setVistaDialogo] = useState<'pago' | 'confirmarTarjeta'>('pago');
  const [dialogoAbonoAbierto, setDialogoAbonoAbierto] = useState(false);
  const [dialogoConsumoInternoAbierto, setDialogoConsumoInternoAbierto] = useState(false);
  const [alertaCancelarVentaAbierta, setAlertaCancelarVentaAbierta] = useState(false);
  const [alertaEliminarAbierta, setAlertaEliminarAbierta] = useState(false);
  const [alertaCreditoMonedasAbierta, setAlertaCreditoMonedasAbierta] = useState(false);
  const [alertaClienteConCreditoAbierta, setAlertaClienteConCreditoAbierta] = useState(false);
  const [ventaParaPagar, setVentaParaPagar] = useState<Venta | null>(null);
  const [ventaParaConsumo, setVentaParaConsumo] = useState<Venta | null>(null);
  const [clienteParaEliminar, setClienteParaEliminar] = useState<Cliente | null>(null);
  const [itemsSeleccionadosParaPagar, setItemsSeleccionadosParaPagar] = useState<Set<number>>(new Set());
  const [montoAbono, setMontoAbono] = useState<number | ''>(0);
  const [pinConsumo, setPinConsumo] = useState('');
  const [procesandoPagoCredito, setProcesandoPagoCredito] = useState(false);
  
  // Pago Unificado
  const [incluirCreditoEnPago, setIncluirCreditoEnPago] = useState(false);

  const [procesandoGuardado, setProcesandoGuardado] = useState(false);
  const [procesandoAnadir, setProcesandoAnadir] = useState(false);
  const [vistaCuentas, setVistaCuentas] = useState<'pendientes' | 'credito'>('pendientes');
  const [filtroCuentas, setFiltroCuentas] = useState('');

  // Referencias
  const clienteInputRef = useRef<HTMLInputElement>(null);
  const cantidadInputRef = useRef<HTMLInputElement>(null);
  const productoInputRef = useRef<HTMLInputElement>(null);
  const preparacionesContainerRef = useRef<HTMLDivElement>(null);
  const anadirButtonRef = useRef<HTMLButtonElement>(null);
  const itemManualCantRef = useRef<HTMLInputElement>(null);
  const itemManualDescRef = useRef<HTMLInputElement>(null);
  const itemManualPrecioRef = useRef<HTMLInputElement>(null);
  const itemManualAddBtnRef = useRef<HTMLButtonElement>(null);
  const filtroCuentasInputRef = useRef<HTMLInputElement>(null);
  const abonoInputRef = useRef<HTMLInputElement>(null);
  const lastTapTimeRef = useRef(0);
  const lastTapIdRef = useRef<string | null>(null);

  // Listeners de Firestore
  useEffect(() => {
    if (!firestore || !sucursalId) return;
    const unsubscribes = [
      onSnapshot(query(collection(firestore, `sucursales/${sucursalId}/productos`), orderBy('nombre')), s => setProductos(s.docs.map(d => ({ id: d.id, ...d.data() } as Producto)))),
      onSnapshot(query(collection(firestore, `sucursales/${sucursalId}/productos_virtuales`), orderBy('nombre')), s => setProductosVirtuales(s.docs.map(d => ({ id: d.id, ...d.data() } as ProductoVirtual)))),
      onSnapshot(query(collection(firestore, `sucursales/${sucursalId}/clientes`), orderBy('nombre')), s => { setClientes(s.docs.map(d => ({ id: d.id, ...d.data() } as Cliente))); setCargando(false); }),
      onSnapshot(query(collection(firestore, `sucursales/${sucursalId}/ventas`), where('estado', '==', 'Pendiente de pago')), s => setVentasPendientes(s.docs.map(d => ({ id: d.id, ...d.data() } as Venta)).sort((a,b) => toDate(b.fecha).getTime() - toDate(a.fecha).getTime()))),
      onSnapshot(query(collection(firestore, `sucursales/${sucursalId}/ventas`), where('estado', '==', 'credito')), s => setVentasACredito(s.docs.map(d => ({ id: d.id, ...d.data() } as Venta)).sort((a,b) => toDate(b.fecha).getTime() - toDate(a.fecha).getTime()))),
      onSnapshot(doc(firestore, `sucursales/${sucursalId}/generales`, 'actual'), d => d.exists() && setEstadoCaja(d.data() as EstadoCaja))
    ];
    return () => unsubscribes.forEach(u => u());
  }, [firestore, sucursalId]);

  // Foco inicial al cargar
  useEffect(() => {
    if (!cargando && !isLoadingSucursal) {
      clienteInputRef.current?.focus();
    }
  }, [cargando, isLoadingSucursal]);

  const procederAGuardarVenta = useCallback(async () => {
    if (!firestore || !user || !sucursalId || !clienteSeleccionadoId || procesandoGuardado) return;
    setProcesandoGuardado(true);
    try {
      const cli = clientes.find(c => c.id === clienteSeleccionadoId);
      await guardarVentaYActualizarStock(firestore, sucursalId, idVentaActiva, { clienteId: cli!.id, nombreCliente: cli!.nombre, detalles: carrito, tipoVenta: 'POS' }, user.uid);
      setClienteSeleccionadoId(''); setCarrito([]); setIdVentaActiva(null);
      toast({ title: "Éxito", description: "Venta guardada." });
      clienteInputRef.current?.focus();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setProcesandoGuardado(false); }
  }, [firestore, user, sucursalId, clienteSeleccionadoId, idVentaActiva, carrito, clientes, toast, procesandoGuardado]);

  const manejarGuardarVenta = useCallback(() => {
    if (procesandoGuardado) return;
    if (!idVentaActiva && ventasACredito.some(v => v.clienteId === clienteSeleccionadoId)) setAlertaClienteConCreditoAbierta(true);
    else procederAGuardarVenta();
  }, [idVentaActiva, ventasACredito, clienteSeleccionadoId, procederAGuardarVenta, procesandoGuardado]);

  const manejarSeleccionCliente = (id: string) => {
    if (id === clienteSeleccionadoId) return;
    
    const tieneItemsNuevos = carrito.some(item => item.idDetalle === 0);
    if (tieneItemsNuevos) {
      setAlertaCancelarVentaAbierta(true);
      return;
    }

    if (!id) {
      setClienteSeleccionadoId(''); setCarrito([]); setIdVentaActiva(null);
      return;
    }
    
    setClienteSeleccionadoId(id);
    const v = ventasPendientes.find(v => v.clienteId === id);
    if (v) {
      setCarrito(v.detalles); setIdVentaActiva(v.id);
    } else {
      setCarrito([]); setIdVentaActiva(null);
    }
    
    setTimeout(() => {
      cantidadInputRef.current?.focus();
      if (cantidadInputRef.current) cantidadInputRef.current.select();
    }, 100);
  };

  const manejarClickEditarVenta = (venta: Venta) => {
    if (idVentaActiva === venta.id) return;
    const tieneItemsNuevos = carrito.some(item => item.idDetalle === 0);
    if (tieneItemsNuevos) {
      setAlertaCancelarVentaAbierta(true);
      return;
    }
    setClienteSeleccionadoId(venta.clienteId);
    setCarrito(venta.detalles);
    setIdVentaActiva(venta.id);
    toast({ title: "Modo Edición", description: `Editando cuenta de ${venta.nombreCliente}` });
    setTimeout(() => {
      cantidadInputRef.current?.focus();
      if (cantidadInputRef.current) cantidadInputRef.current.select();
    }, 100);
  };

  const handleTap = (venta: Venta) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (lastTapIdRef.current === venta.id && (now - lastTapTimeRef.current) < DOUBLE_TAP_DELAY) {
      manejarClickEditarVenta(venta);
    }
    lastTapTimeRef.current = now;
    lastTapIdRef.current = venta.id;
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F6') { event.preventDefault(); setMostrarItemManual(prev => !prev); }
      if (event.key === 'F3') { event.preventDefault(); if (!procesandoGuardado) manejarGuardarVenta(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [manejarGuardarVenta, procesandoGuardado]);

  const opcionesClientes = useMemo(() => clientes.map(c => ({ value: c.id, label: c.nombre })), [clientes]);
  const opcionesProductos = useMemo(() => {
    if (cargando) return [];
    const fisicos = productos.map(p => ({ value: `prod-${p.id}`, label: p.nombre, description: `Stock: ${p.existencia}${p.precioVenta ? ` - Q${p.precioVenta.toFixed(2)}` : ''}`, badge: (p.preparaciones?.length || 0) > 0 ? `${p.preparaciones?.length} prep.` : undefined }));
    const virtuales = productosVirtuales.filter(p => p.incluirEnPOS).map(p => ({ value: `virt-${p.id}`, label: p.nombre, description: `Stock: ${p.existencia}${p.precioVenta ? ` - Q${p.precioVenta.toFixed(2)}` : ''}` }));
    return [...fisicos, ...virtuales];
  }, [productos, productosVirtuales, cargando]);

  const productoSeleccionado = useMemo(() => {
    if (!productoSeleccionadoId) return null;
    const [type, id] = productoSeleccionadoId.split('-');
    return type === 'prod' ? (productos.find(p => p.id === id) || null) : (productosVirtuales.find(p => p.id === id) || null);
  }, [productos, productosVirtuales, productoSeleccionadoId]);

  const totalVentaActiva = useMemo(() => carrito.reduce((a, b) => a + b.saldo, 0), [carrito]);
  const clientesConConsumoInternoIds = useMemo(() => new Set(clientes.filter(c => c.consumoInterno && c.pinConsumoInterno).map(c => c.id)), [clientes]);

  const manejarAnadirProducto = async () => {
    if (!firestore || !sucursalId || !productoSeleccionadoId || !cantidad || Number(cantidad) <= 0) return;
    setProcesandoAnadir(true);
    const [type, id] = productoSeleccionadoId.split('-');
    const esVirtual = type === 'virt';
    const prod = esVirtual ? productosVirtuales.find(p => p.id === id) : productos.find(p => p.id === id);
    if (!prod) { setProcesandoAnadir(false); return; }

    try {
      let n = prod.nombre, p = prod.precioVenta, ing: any[] = [];
      if (esVirtual) await descontarStockVirtualTemporal(firestore, sucursalId, id, Number(cantidad));
      else {
        await descontarStockTemporal(firestore, sucursalId, id, Number(cantidad));
        if (preparacionSeleccionada && preparacionSeleccionada !== 'base' && 'preparaciones' in prod) {
          n = `${prod.nombre} (${preparacionSeleccionada.nombre})`; p = preparacionSeleccionada.precioVenta; ing = preparacionSeleccionada.ingredientes || [];
          for (const i of ing) await descontarStockTemporal(firestore, sucursalId, i.productoId, i.cantidad * Number(cantidad));
        }
      }
      const det: DetalleVenta = { idDetalle: 0, idProducto: id, nombreProducto: n, cantidad: Number(cantidad), precioUnitario: p, subtotal: Number(cantidad)*p, saldo: Number(cantidad)*p, pagadoEfectivo: 0, pagadoTarjeta: 0, metodoPago: null, estado: 'Pendiente de pago', fechaAgregado: new Date().toISOString(), ingredientesConsumidos: ing, esVirtual };
      setCarrito(prev => [det, ...prev]);
    } catch (e: any) { toast({ title: "Error de Stock", description: e.message, variant: "destructive" }); }
    finally { setProductoSeleccionadoId(''); setCantidad(1); setPreparacionSeleccionada(null); setProcesandoAnadir(false); setTimeout(() => { cantidadInputRef.current?.focus(); if (cantidadInputRef.current) cantidadInputRef.current.select(); }, 0); }
  };

  const manejarAnadirItemManual = () => {
    if (!descripcionItemManual.trim() || !precioUnitarioItemManual || !cantidadItemManual) return;
    const sub = Number(cantidadItemManual) * Number(precioUnitarioItemManual);
    const det: DetalleVenta = { idDetalle: 0, idProducto: 'item-manual', nombreProducto: descripcionItemManual.trim(), cantidad: Number(cantidadItemManual), precioUnitario: Number(precioUnitarioItemManual), subtotal: sub, saldo: sub, pagadoEfectivo: 0, pagadoTarjeta: 0, metodoPago: null, estado: 'Pendiente de pago', fechaAgregado: new Date().toISOString() };
    setCarrito(prev => [det, ...prev]);
    setDescripcionItemManual(''); setPrecioUnitarioItemManual(''); setCantidadItemManual(1); setTimeout(() => { itemManualCantRef.current?.focus(); if (itemManualCantRef.current) itemManualCantRef.current.select(); }, 0);
  };

  const manejarEliminarDelCarrito = async (index: number) => {
    const item = carrito[index];
    if (item.estado === 'Pagada' || item.saldo < item.subtotal) return;
    try {
      if (item.esVirtual) await devolverStockVirtualTemporal(firestore!, sucursalId, item.idProducto, item.cantidad);
      else if (item.idProducto !== 'item-manual') {
        await devolverStockTemporal(firestore!, sucursalId, item.idProducto, item.cantidad);
        if (item.ingredientesConsumidos) for (const i of item.ingredientesConsumidos) await devolverStockTemporal(firestore!, sucursalId, i.productoId, i.cantidad * item.cantidad);
      }
      setCarrito(prev => prev.filter((_, i) => i !== index));
    } catch (e: any) { toast({ title: "Error al devolver stock", description: e.message, variant: "destructive" }); }
  };

  const manejarConfirmarAbono = async () => {
    if (!firestore || !user || !ventaParaPagar || !montoAbono) return;
    try {
      await registrarAbonoACuenta(firestore, sucursalId, ventaParaPagar.id, Number(montoAbono), user.uid);
      setDialogoAbonoAbierto(false); setDialogoPagoAbierto(false);
      toast({ title: "Abono registrado", description: "Q" + Number(montoAbono).toFixed(2) });
      clienteInputRef.current?.focus();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const procederConPago = async (metodo: 'Efectivo' | 'Tarjeta') => {
    if (!firestore || !ventaParaPagar || !user || !sucursalId) return;
    const ids = Array.from(itemsSeleccionadosParaPagar);
    
    try {
      if (incluirCreditoEnPago) {
        await procesarPagoUnificado(firestore, sucursalId, user.uid, {
          ventaPrincipalId: ventaParaPagar.id,
          detalleIdsVentaPrincipal: ids,
          incluirCredito: true,
          clienteId: ventaParaPagar.clienteId,
          metodoDePago: metodo
        });
        toast({ title: "Pago Unificado procesado", description: "Cuenta actual + Deuda histórica saldada." });
      } else {
        await procesarPagoVenta(firestore, sucursalId, ventaParaPagar.id, ids, metodo, user.uid);
        toast({ title: "Pago procesado", description: metodo });
      }
      setDialogoPagoAbierto(false);
      clienteInputRef.current?.focus();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const manejarConfirmarCancelacion = async () => {
    if (!firestore || !user) return;
    if (idVentaActiva) {
      const v = ventasPendientes.find(x => x.id === idVentaActiva);
      const idsOrig = new Set(v?.detalles.map(d => d.idDetalle));
      const aDev = carrito.filter(item => item.idDetalle === 0 || !idsOrig.has(item.idDetalle));
      if (aDev.length > 0) await cancelarVentaYDevolverStock(firestore, sucursalId, idVentaActiva, aDev, user.uid);
    } else if (carrito.length > 0) await cancelarVentaYDevolverStock(firestore, sucursalId, null, carrito, user.uid);
    setClienteSeleccionadoId(''); setCarrito([]); setIdVentaActiva(null); setAlertaCancelarVentaAbierta(false);
    clienteInputRef.current?.focus();
  };

  const abrirDialogoConsumoInterno = (venta: Venta) => { setVentaParaConsumo(venta); setPinConsumo(''); setDialogoConsumoInternoAbierto(true); };

  const confirmarConsumoInterno = async () => {
    if (!firestore || !ventaParaConsumo || !pinConsumo || !user) return;
    const c = clientes.find(x => x.id === ventaParaConsumo.clienteId);
    if (c?.pinConsumoInterno !== pinConsumo) return toast({ title: "Error", description: "PIN incorrecto", variant: "destructive" });
    try {
        await liquidarComoConsumoInterno(firestore, sucursalId, ventaParaConsumo.id, user.uid);
        setDialogoConsumoInternoAbierto(false); toast({ title: "Consumo interno registrado" });
        clienteInputRef.current?.focus();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const abrirDialogoPago = (v: Venta) => { 
    setVentaParaPagar(v); 
    // Seleccionar todos los ítems pendientes por defecto
    const allPendingIds = v.detalles.filter(d => d.estado !== 'Pagada').map(d => d.idDetalle);
    setItemsSeleccionadosParaPagar(new Set(allPendingIds)); 
    setIncluirCreditoEnPago(false);
    setVistaDialogo('pago'); 
    setDialogoPagoAbierto(true); 
  };

  const onProductoEnter = () => {
    if (productoSeleccionado && 'preparaciones' in productoSeleccionado && productoSeleccionado.preparaciones && productoSeleccionado.preparaciones.length > 0) preparacionesContainerRef.current?.focus();
    else anadirButtonRef.current?.focus();
  };

  const saldoCreditoCliente = useMemo(() => {
    if (!ventaParaPagar) return 0;
    return ventasACredito
      .filter(v => v.clienteId === ventaParaPagar.clienteId)
      .reduce((acc, v) => acc + v.saldo, 0);
  }, [ventasACredito, ventaParaPagar]);

  const montoAPagarDialogo = useMemo(() => {
    if (!ventaParaPagar) return 0;
    
    // Sumar solo los saldos de los ítems seleccionados de la venta principal
    let total = ventaParaPagar.detalles
        .filter(d => itemsSeleccionadosParaPagar.has(d.idDetalle))
        .reduce((acc, item) => acc + item.saldo, 0);

    // Si se marca incluir crédito, sumamos el saldo histórico del cliente
    if (incluirCreditoEnPago) total += saldoCreditoCliente;
    
    return total;
  }, [ventaParaPagar, itemsSeleccionadosParaPagar, incluirCreditoEnPago, saldoCreditoCliente]);

  const manejarPasarACredito = (venta: Venta) => {
    const cliente = clientes.find(c => c.id === venta.clienteId);
    if (cliente && cliente.permiteCredito === false) {
        toast({ title: "Crédito no autorizado", description: `El cliente ${cliente.nombre} no tiene permitido comprar a crédito.`, variant: "destructive" });
        return;
    }
    setVentaParaPagar(venta); setAlertaCreditoMonedasAbierta(true);
  };

  const confirmarPasarACredito = async (venta: Venta) => {
    if (!firestore) return;
    setProcesandoCredito(venta.id);
    try {
        await pasarVentaACredito(firestore, sucursalId, venta.id);
        toast({ title: "Éxito", description: `Venta movida a crédito.` });
        clienteInputRef.current?.focus();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setProcesandoCredito(null); setAlertaCreditoMonedasAbierta(false); }
  };

  if (isLoadingSucursal) return <div className="flex h-64 items-center justify-center"><Loader className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <POSHeader />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Card className="w-full">
            <CardContent className="space-y-2 pt-6 p-4">
              <POSForm 
                refs={{ clienteInputRef, cantidadInputRef, productoInputRef, itemManualCantRef, itemManualDescRef, itemManualPrecioRef, itemManualAddBtnRef, anadirButtonRef, preparacionesContainerRef }}
                state={{ 
                  clienteSeleccionadoId, productoSeleccionadoId, cantidad, mostrarItemManual, descripcionItemManual, precioUnitarioItemManual, cantidadItemManual, preparacionSeleccionada, productoSeleccionado, cargando, procesandoGuardado, procesandoAnadir, isMobile, totalVentaActiva, opcionesClientes, opcionesProductos, 
                  puedeOperar: !clienteSeleccionadoId || (carrito.length === 0 && !idVentaActiva) 
                }}
                actions={{ 
                  manejarSeleccionCliente, 
                  manejarCrearCliente: async (n) => { 
                    const formattedName = n.trim().toLowerCase().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    const cid = await guardarCliente(firestore!, sucursalId, { nombre: formattedName, tipoCliente: 'Cliente', idcliente: 0, consumoInterno: false, permiteCredito: true }); return cid.id; 
                  }, 
                  manejarAbrirAlertaEliminar: (o) => { setClienteParaEliminar(clientes.find(c => c.id === o.value) || null); setAlertaEliminarAbierta(true); }, 
                  setMostrarItemManual, setCantidadItemManual, setDescripcionItemManual, setPrecioUnitarioItemManual, setCantidad, setProductoSeleccionadoId, setPreparacionSeleccionada, manejarAnadirProducto, manejarAnadirItemManual, manejarGuardarVenta, onProductoEnter 
                }}
              />
              <POSCart carrito={carrito} clienteSeleccionadoId={clienteSeleccionadoId} manejarEliminarDelCarrito={manejarEliminarDelCarrito} />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <POSAccounts 
            state={{ vistaCuentas, filtroCuentas, ventasPendientes, ventasACredito, idVentaActiva, clientesConCreditoIds: new Set(ventasACredito.map(v => v.clienteId)), clientesConConsumoInternoIds, procesandoCredito }}
            actions={{ setVistaCuentas, setFiltroCuentas, manejarClickEditar: manejarClickEditarVenta, handleTap, abrirDialogoPago, abrirDialogoConsumoInterno, manejarClickPasarACredito: manejarPasarACredito }}
            refs={{ filtroCuentasInputRef }}
          />
        </div>
      </div>
      <POSDialogs 
        refs={{ abonoInputRef }}
        state={{ 
          dialogoPagoAbierto, vistaDialogo, dialogoAbonoAbierto, dialogoConsumoInternoAbierto, alertaCancelarVentaAbierta, alertaEliminarAbierta, alertaCreditoMonedasAbierta, alertaClienteConCreditoAbierta, ventaParaPagar, ventaParaConsumo, clienteParaEliminar, itemsSeleccionadosParaPagar, montoAbono, montoAPagarDialogo, pinConsumo, procesandoPagoCredito, procesandoGuardado,
          incluirCreditoEnPago, saldoCreditoCliente
        }}
        actions={{ setDialogoPagoAbierto, setVistaDialogo, setDialogoAbonoAbierto, setDialogoConsumoInternoAbierto, setAlertaCancelarVentaAbierta, setAlertaEliminarAbierta, setAlertaCreditoMonedasAbierta, setAlertaClienteConCreditoAbierta, setItemsSeleccionadosParaPagar, setMontoAbono, setPinConsumo, manejarConfirmarAbono, procederConPago, manejarConfirmarCancelacion, manejarConfirmarEliminarCliente: () => { eliminarCliente(firestore!, sucursalId, clienteParaEliminar!.id); setAlertaEliminarAbierta(false); }, confirmarPasarACredito: (v) => confirmarPasarACredito(v), procederAGuardarVenta, confirmarConsumoInterno, setIncluirCreditoEnPago }}
      />
    </div>
  );
}
