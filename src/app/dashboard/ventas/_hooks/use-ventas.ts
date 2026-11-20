'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { collection, onSnapshot, query, where, Timestamp, orderBy, doc, limit } from 'firebase/firestore';
import { useFirebase, useUser } from '@/firebase';
import type { Venta, Producto, Cliente, DetalleVenta, Preparacion, EstadoCaja, ProductoVirtual, Promocion } from '@/lib/tipos';
import { calcularPromocionesCarrito, esPromocionVigente } from '@/lib/promociones/calcular-promociones';
import type { MovimientoRecientePOS } from '../_types/movimiento-pos';
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
  eliminarProductoDeVenta,
  procesarPagoVenta, 
  liquidarComoConsumoInterno, 
  descontarStockVirtualTemporal, 
  devolverStockVirtualTemporal,
  procesarPagoUnificado,
  registrarAbonoGeneral,
  registrarCacheUsuario,
  trasladarItemsDeCuenta,
  type DestinoTraslado,
  type ItemATrasladar,
} from '@/lib/firebase/servicios';
import { useIsMobile } from '@/hooks/use-mobile';
/**
 * Hook principal del Punto de Venta (POS).
 * Coordina catálogo físico/virtual, promociones vigentes, cuentas pendientes/crédito y cobros transaccionales.
 */
import { useSucursal } from '@/hooks/use-sucursal';

const toDate = (fecha: any): Date => {
  if (fecha instanceof Timestamp) return fecha.toDate();
  if (fecha instanceof Date) return fecha;
  if (typeof fecha === 'string') {
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(0);
};

export function useVentas() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { firestore } = useFirebase();
  const { user, profile } = useUser();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();

  // Asegurar registro de identidad del operador en el caché de auditoría
  useEffect(() => {
    if (user) {
      registrarCacheUsuario(user.uid, {
        nombre: profile?.nombre || user.displayName || user.email || 'Operador',
        email: user.email || '',
        rol: profile?.rol || 'Operador',
      });
    }
  }, [user, profile]);

  // Estados de datos
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosVirtuales, setProductosVirtuales] = useState<ProductoVirtual[]>([]);
  const [promociones, setPromociones] = useState<Promocion[]>([]);
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
  const [alertaEliminarItemAbierta, setAlertaEliminarItemAbierta] = useState(false);
  const [itemParaEliminar, setItemParaEliminar] = useState<{ item: DetalleVenta; index: number } | null>(null);
  const [procesandoEliminarItem, setProcesandoEliminarItem] = useState(false);
  const [ventaParaPagar, setVentaParaPagar] = useState<Venta | null>(null);
  const [ventaParaConsumo, setVentaParaConsumo] = useState<Venta | null>(null);
  const [clienteParaEliminar, setClienteParaEliminar] = useState<Cliente | null>(null);
  const [itemsSeleccionadosParaPagar, setItemsSeleccionadosParaPagar] = useState<Set<number>>(new Set());
  const [montoAbono, setMontoAbono] = useState<number | ''>(0);
  const [pinConsumo, setPinConsumo] = useState('');
  const [procesandoPagoCredito, setProcesandoPagoCredito] = useState(false);
  
  // Pago Unificado
  const [incluirCreditoEnPago, setIncluirCreditoEnPago] = useState(false);

  // Estados de certeza operativa: Última Acción y Movimientos del Turno
  const [ultimaAccion, setUltimaAccion] = useState<MovimientoRecientePOS | null>(null);
  const [ultimosMovimientos, setUltimosMovimientos] = useState<MovimientoRecientePOS[]>([]);
  const [dialogoMovimientosAbierto, setDialogoMovimientosAbierto] = useState(false);
  const [ultimaCuentaModificadaId, setUltimaCuentaModificadaId] = useState<string | null>(null);

  // Estados para Traslado de Cuenta
  const [ventaParaTrasladar, setVentaParaTrasladar] = useState<Venta | null>(null);
  const [dialogoTrasladoAbierto, setDialogoTrasladoAbierto] = useState(false);
  const [procesandoTraslado, setProcesandoTraslado] = useState(false);

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
      onSnapshot(query(collection(firestore, `sucursales/${sucursalId}/promociones`)), s => setPromociones(s.docs.map(d => ({ id: d.id, ...d.data() } as Promocion)))),
      onSnapshot(query(collection(firestore, `sucursales/${sucursalId}/clientes`), orderBy('nombre')), s => { setClientes(s.docs.map(d => ({ id: d.id, ...d.data() } as Cliente))); setCargando(false); }),
      onSnapshot(query(collection(firestore, `sucursales/${sucursalId}/ventas`), where('estado', '==', 'Pendiente de pago')), s => setVentasPendientes(s.docs.map(d => {
        const data = d.data() as Venta;
        return {
          ...data,
          id: d.id,
          detalles: [...(data.detalles || [])].sort((a, b) => toDate(b.fechaAgregado).getTime() - toDate(a.fechaAgregado).getTime()),
        };
      }).sort((a,b) => toDate(b.fecha).getTime() - toDate(a.fecha).getTime()))),
      onSnapshot(query(collection(firestore, `sucursales/${sucursalId}/ventas`), where('estado', '==', 'credito')), s => setVentasACredito(s.docs.map(d => {
        const data = d.data() as Venta;
        return {
          ...data,
          id: d.id,
          detalles: [...(data.detalles || [])].sort((a, b) => toDate(b.fechaAgregado).getTime() - toDate(a.fechaAgregado).getTime()),
        };
      }).sort((a,b) => toDate(b.fecha).getTime() - toDate(a.fecha).getTime()))),
      onSnapshot(doc(firestore, `sucursales/${sucursalId}/generales`, 'actual'), d => d.exists() && setEstadoCaja(d.data() as EstadoCaja)),
      onSnapshot(
        query(collection(firestore, `sucursales/${sucursalId}/auditoria`), orderBy('fecha', 'desc'), limit(30)),
        (s) => {
          const movs: MovimientoRecientePOS[] = [];
          s.docs.forEach((d) => {
            const data = d.data();
            const categoriaUpper = String(data.categoria || '').toUpperCase();
            const accionUpper = String(data.accion || '').toUpperCase();
            if (!['VENTAS', 'PAGOS'].includes(categoriaUpper)) return;

            let tipo: MovimientoRecientePOS['tipo'] = 'venta_creada';
            if (accionUpper === 'VENTA_RAPIDA') tipo = 'venta_rapida';
            else if (accionUpper === 'VENTA_EDITAR') tipo = 'productos_agregados';
            else if (accionUpper === 'VENTA_ELIMINAR_PRODUCTO') tipo = 'item_eliminado';
            else if (accionUpper === 'VENTA_CONSUMO_INTERNO') tipo = 'consumo_interno';
            else if (accionUpper === 'VENTA_ANULAR') tipo = 'venta_anulada';
            else if (accionUpper === 'PAGO_ABONO' || accionUpper === 'ABONO_REGISTRADO' || accionUpper === 'VENTA_ABONAR') tipo = 'abono';
            else if (
              accionUpper === 'VENTA_PAGAR' ||
              accionUpper === 'PAGO_REGISTRAR' ||
              accionUpper === 'PAGO_UNIFICADO' ||
              categoriaUpper === 'PAGOS'
            ) {
              tipo = 'pago';
            }

            const detalles = data.detalles || {};
            const fecha = toDate(data.fecha || data.timestamp);

            let items: MovimientoRecientePOS['items'] = undefined;
            if (Array.isArray(detalles.itemsAgregados) && detalles.itemsAgregados.length > 0) {
              items = detalles.itemsAgregados.map((it: any) => ({
                nombre: it.nombre || 'Producto',
                cantidad: Number(it.cantidad) || 1,
                precioUnitario: it.precioUnitario,
                subtotal: it.subtotal,
              }));
            } else if (detalles.producto && detalles.cantidad) {
              items = [{
                nombre: detalles.producto,
                cantidad: Number(detalles.cantidad) || 1,
                subtotal: detalles.total,
              }];
            } else if (detalles.productoEliminado) {
              items = [{
                nombre: detalles.productoEliminado,
                cantidad: Number(detalles.cantidad) || 1,
                subtotal: detalles.subtotal,
              }];
            }

            movs.push({
              id: d.id,
              tipo,
              titulo: data.titulo || 'Operación POS',
              descripcion: data.descripcion || '',
              idVenta: detalles.idVenta,
              clienteNombre: detalles.nombreCliente || detalles.cliente,
              montoTotal: detalles.total ?? detalles.monto ?? detalles.montoPagado ?? detalles.montoAbonado ?? detalles.totalLiquidado ?? detalles.totalPagadoPrincipal,
              metodoPago: detalles.metodoDePago || detalles.metodoPago || detalles.metodo || (tipo === 'venta_rapida' ? 'Efectivo' : undefined),
              promocionNombre: detalles.promocionNombre || undefined,
              fecha,
              usuarioNombre: data.usuarioNombre || 'Operador',
              items,
            });
          });

          setUltimosMovimientos(movs);
          if (movs.length > 0) {
            setUltimaAccion((prev) => {
              if (!prev) return movs[0];
              if (movs[0].fecha.getTime() >= prev.fecha.getTime()) return movs[0];
              return prev;
            });
          }
        }
      )
    ];
    return () => unsubscribes.forEach(u => u());
  }, [firestore, sucursalId]);

  // Listener para sincronización de acciones inmediatas en la misma ventana
  useEffect(() => {
    const handleAccionReciente = (e: any) => {
      const mov = e?.detail as MovimientoRecientePOS;
      if (mov) {
        setUltimaAccion(mov);
        setUltimosMovimientos((prev) => [mov, ...prev.filter((m) => m.id !== mov.id)].slice(0, 30));
      }
    };
    window.addEventListener('pos:accion-reciente', handleAccionReciente);
    return () => window.removeEventListener('pos:accion-reciente', handleAccionReciente);
  }, []);

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
      const resultado = await guardarVentaYActualizarStock(
        firestore, 
        sucursalId, 
        idVentaActiva, 
        { clienteId: cli!.id, nombreCliente: cli!.nombre, detalles: carrito, tipoVenta: 'POS' }, 
        user.uid
      );

      // Registrar movimiento reciente para confirmación inmediata del operario
      const esEdicion = Boolean(idVentaActiva);
      const itemsNuevos = carrito.filter((d) => d.idDetalle === 0 || !idVentaActiva);
      const itemsDetalle = (itemsNuevos.length > 0 ? itemsNuevos : carrito).map((c) => ({
        nombre: c.nombreProducto,
        cantidad: c.cantidad,
        subtotal: c.subtotal,
      }));
      const totalOperacion = carrito.reduce((a, b) => a + b.saldo, 0);
      const resumenTexto = itemsDetalle.map((i) => `${i.cantidad}x ${i.nombre}`).join(', ');

      const movLocal: MovimientoRecientePOS = {
        id: Date.now().toString(),
        tipo: esEdicion ? 'productos_agregados' : 'venta_creada',
        titulo: esEdicion ? 'Productos Agregados' : 'Cuenta Creada',
        descripcion: `${esEdicion ? 'Se agregaron' : 'Productos'}: ${resumenTexto} • Total: Q${totalOperacion.toFixed(2)}`,
        idVenta: resultado.idVenta,
        clienteNombre: cli?.nombre,
        montoTotal: totalOperacion,
        fecha: new Date(),
        usuarioNombre: profile?.nombre || user.displayName || 'Operador',
        items: itemsDetalle,
      };

      setUltimaAccion(movLocal);
      setUltimosMovimientos((prev) => [movLocal, ...prev.filter((m) => m.id !== movLocal.id)].slice(0, 30));

      if (resultado.ventaId) {
        setUltimaCuentaModificadaId(resultado.ventaId);
        setTimeout(() => setUltimaCuentaModificadaId(null), 12000);
      }

      setClienteSeleccionadoId(''); setCarrito([]); setIdVentaActiva(null);
      setMostrarItemManual(false); setDescripcionItemManual(''); setPrecioUnitarioItemManual(''); setCantidadItemManual(1);
      toast({ 
        title: esEdicion ? "Productos Agregados a Cuenta" : "Venta Guardada con Éxito", 
        description: `Venta #${resultado.idVenta} de ${cli?.nombre || 'Cliente'}.` 
      });
      clienteInputRef.current?.focus();
    } catch (e: any) { toast({ title: "Error al Guardar Venta", description: e.message, variant: "destructive" }); }
    finally { setProcesandoGuardado(false); }
  }, [firestore, user, sucursalId, clienteSeleccionadoId, idVentaActiva, carrito, clientes, toast, procesandoGuardado, profile]);

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

    setMostrarItemManual(false);
    setDescripcionItemManual('');
    setPrecioUnitarioItemManual('');
    setCantidadItemManual(1);

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
    setMostrarItemManual(false);
    setDescripcionItemManual('');
    setPrecioUnitarioItemManual('');
    setCantidadItemManual(1);
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
      if (event.key === 'F6') {
        event.preventDefault();
        setMostrarItemManual(prev => {
          const next = !prev;
          if (next) {
            setTimeout(() => {
              itemManualCantRef.current?.focus();
              if (itemManualCantRef.current) itemManualCantRef.current.select();
            }, 0);
          } else {
            setTimeout(() => {
              cantidadInputRef.current?.focus();
              if (cantidadInputRef.current) cantidadInputRef.current.select();
            }, 0);
          }
          return next;
        });
      }
      if (event.key === 'F3') { event.preventDefault(); if (!procesandoGuardado) manejarGuardarVenta(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [manejarGuardarVenta, procesandoGuardado]);

  const promocionesPorProducto = useMemo(() => {
    const map = new Map<string, Promocion>();
    for (const promo of promociones) {
      if (!esPromocionVigente(promo)) continue;
      for (const pid of promo.productosIds || []) {
        if (!map.has(pid)) map.set(pid, promo);
      }
    }
    return map;
  }, [promociones]);

  const aplicarPromocionesACarrito = useCallback(
    (detalles: DetalleVenta[], listaPromos: Promocion[]): DetalleVenta[] => {
      if (!listaPromos.length) return detalles;

      const indicesElegibles: number[] = [];
      const itemsParaEval = detalles.flatMap((d, idx) => {
        const esElegible =
          d.idDetalle === 0 &&
          d.estado === 'Pendiente de pago' &&
          (d.pagadoEfectivo || 0) === 0 &&
          (d.pagadoTarjeta || 0) === 0 &&
          d.idProducto !== 'item-manual' &&
          !d.metadata?.tipo;
        if (!esElegible) return [];
        indicesElegibles.push(idx);
        return [
          {
            id: String(idx),
            productoId: d.idProducto,
            nombre: d.nombreProducto,
            precioVenta: d.precioOriginal ?? d.precioUnitario,
            cantidad: d.cantidad,
          },
        ];
      });

      if (itemsParaEval.length === 0) return detalles;
      const resultados = calcularPromocionesCarrito(itemsParaEval, listaPromos);
      const copia = [...detalles];

      resultados.forEach((res, rIdx) => {
        const origIdx = indicesElegibles[rIdx];
        const actual = copia[origIdx];
        if (res.promocionAplicada) {
          copia[origIdx] = {
            ...actual,
            precioOriginal: res.precioOriginal,
            precioUnitario: res.precioUnitarioEfectivo,
            subtotal: res.subtotalFinal,
            saldo: res.subtotalFinal,
            promocionAplicada: res.promocionAplicada,
          };
        } else {
          const { promocionAplicada: _p, precioOriginal: _o, ...resto } = actual;
          copia[origIdx] = {
            ...resto,
            precioUnitario: res.precioOriginal,
            subtotal: res.subtotalOriginal,
            saldo: res.subtotalOriginal,
          };
        }
      });

      return copia;
    },
    []
  );

  const opcionesClientes = useMemo(() => clientes.map(c => ({ value: c.id, label: c.nombre })), [clientes]);
  const opcionesProductos = useMemo(() => {
    if (cargando) return [];
    const fisicos = productos.map(p => {
      const promo = promocionesPorProducto.get(p.id);
      const prepBadge = (p.preparaciones?.length || 0) > 0 ? `${p.preparaciones?.length} prep.` : undefined;
      return {
        value: `prod-${p.id}`,
        label: p.nombre,
        description: `Stock: ${p.existencia}${p.precioVenta ? ` - Q${p.precioVenta.toFixed(2)}` : ''}`,
        badge: promo ? `Promo: ${promo.nombre}` : prepBadge,
      };
    });
    const virtuales = productosVirtuales.filter(p => p.incluirEnPOS).map(p => {
      const promo = promocionesPorProducto.get(p.id);
      return {
        value: `virt-${p.id}`,
        label: p.nombre,
        description: `Stock: ${p.existencia}${p.precioVenta ? ` - Q${p.precioVenta.toFixed(2)}` : ''}`,
        badge: promo ? `Promo: ${promo.nombre}` : undefined,
      };
    });
    return [...fisicos, ...virtuales];
  }, [productos, productosVirtuales, cargando, promocionesPorProducto]);

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

    const cantNum = Number(cantidad);
    const stockDisponible = prod.existencia ?? 0;
    if (stockDisponible < cantNum) {
      setProcesandoAnadir(false);
      toast({
        title: "Stock Insuficiente",
        description: `No hay suficiente stock para "${prod.nombre}". Existencia disponible: ${stockDisponible}, cantidad solicitada: ${cantNum}.`,
        variant: "destructive"
      });
      return;
    }

    try {
      let n = prod.nombre, p = prod.precioVenta, ing: any[] = [];
      if (esVirtual) await descontarStockVirtualTemporal(firestore, sucursalId, id, cantNum);
      else {
        await descontarStockTemporal(firestore, sucursalId, id, cantNum);
        if (preparacionSeleccionada && preparacionSeleccionada !== 'base' && 'preparaciones' in prod) {
          n = `${prod.nombre} (${preparacionSeleccionada.nombre})`; p = preparacionSeleccionada.precioVenta; ing = preparacionSeleccionada.ingredientes || [];
          const ingDescontados: { productoId: string; cantidad: number }[] = [];
          try {
            for (const i of ing) {
              const cantIng = i.cantidad * cantNum;
              await descontarStockTemporal(firestore, sucursalId, i.productoId, cantIng);
              ingDescontados.push({ productoId: i.productoId, cantidad: cantIng });
            }
          } catch (errIng) {
            for (const itemRevert of ingDescontados) {
              await devolverStockTemporal(firestore, sucursalId, itemRevert.productoId, itemRevert.cantidad).catch(() => {});
            }
            await devolverStockTemporal(firestore, sucursalId, id, cantNum).catch(() => {});
            throw errIng;
          }
        }
      }
      const det: DetalleVenta = { idDetalle: 0, idProducto: id, nombreProducto: n, cantidad: cantNum, precioUnitario: p, subtotal: cantNum*p, saldo: cantNum*p, pagadoEfectivo: 0, pagadoTarjeta: 0, metodoPago: null, estado: 'Pendiente de pago', fechaAgregado: new Date().toISOString(), ingredientesConsumidos: ing, esVirtual };
      setCarrito(prev => aplicarPromocionesACarrito([det, ...prev], promociones));
    } catch (e: any) { toast({ title: "Error de Stock", description: e.message, variant: "destructive" }); }
    finally { setProductoSeleccionadoId(''); setCantidad(1); setPreparacionSeleccionada(null); setProcesandoAnadir(false); setTimeout(() => { cantidadInputRef.current?.focus(); if (cantidadInputRef.current) cantidadInputRef.current.select(); }, 0); }
  };

  const manejarAnadirItemManual = () => {
    if (!descripcionItemManual.trim() || !precioUnitarioItemManual || !cantidadItemManual || Number(precioUnitarioItemManual) <= 0 || Number(cantidadItemManual) <= 0) return;
    const sub = Number(cantidadItemManual) * Number(precioUnitarioItemManual);
    const det: DetalleVenta = { idDetalle: 0, idProducto: 'item-manual', nombreProducto: descripcionItemManual.trim(), cantidad: Number(cantidadItemManual), precioUnitario: Number(precioUnitarioItemManual), subtotal: sub, saldo: sub, pagadoEfectivo: 0, pagadoTarjeta: 0, metodoPago: null, estado: 'Pendiente de pago', fechaAgregado: new Date().toISOString() };
    setCarrito(prev => [det, ...prev]);
    setDescripcionItemManual('');
    setPrecioUnitarioItemManual('');
    setCantidadItemManual(1);
    setMostrarItemManual(false);
    setTimeout(() => {
      cantidadInputRef.current?.focus();
      if (cantidadInputRef.current) cantidadInputRef.current.select();
    }, 50);
  };

  const manejarEliminarDelCarrito = (index: number) => {
    const item = carrito[index];
    if (!item || item.estado === 'Pagada' || item.saldo < item.subtotal) return;
    setItemParaEliminar({ item, index });
    setAlertaEliminarItemAbierta(true);
  };

  const confirmarEliminarItem = async () => {
    if (!itemParaEliminar) return;
    const { item, index } = itemParaEliminar;
    setProcesandoEliminarItem(true);
    try {
      if (idVentaActiva && item.idDetalle && item.idDetalle !== 0) {
        const resultado = await eliminarProductoDeVenta(
          firestore!, 
          sucursalId, 
          idVentaActiva, 
          item, 
          user!.uid
        );
        const nuevosItems = carrito.filter((_, i) => i !== index);
        setCarrito(nuevosItems);
        if (resultado.nuevosDetalles.length === 0 && nuevosItems.length === 0) {
          setIdVentaActiva(null);
          setClienteSeleccionadoId('');
        }
        const esCargoSinStock =
          item.idProducto === 'item-manual' ||
          item.idProducto?.startsWith('mesa-') ||
          item.idProducto?.startsWith('division-mesa-');
        toast({ 
          title: "Ítem Eliminado", 
          description: esCargoSinStock
            ? `Se eliminó ${item.nombreProducto} de la Venta #${resultado.idVenta}.`
            : `Se eliminó ${item.nombreProducto} de la Venta #${resultado.idVenta} y se reintegró al inventario.` 
        });
      } else {
        const esCargoSinStock =
          item.idProducto === 'item-manual' ||
          item.idProducto?.startsWith('mesa-') ||
          item.idProducto?.startsWith('division-mesa-');
        if (item.esVirtual) {
          await devolverStockVirtualTemporal(firestore!, sucursalId, item.idProducto, item.cantidad);
        } else if (!esCargoSinStock) {
          await devolverStockTemporal(firestore!, sucursalId, item.idProducto, item.cantidad);
          if (item.ingredientesConsumidos) {
            for (const i of item.ingredientesConsumidos) {
              await devolverStockTemporal(firestore!, sucursalId, i.productoId, i.cantidad * item.cantidad);
            }
          }
        }
        setCarrito(prev => aplicarPromocionesACarrito(prev.filter((_, i) => i !== index), promociones));
        toast({ 
          title: "Ítem Eliminado", 
          description: `Se eliminó ${item.nombreProducto} del carrito.` 
        });
      }

      const movElim: MovimientoRecientePOS = {
        id: Date.now().toString(),
        tipo: 'item_eliminado',
        titulo: `Ítem Eliminado`,
        descripcion: `Se eliminó ${item.cantidad}x ${item.nombreProducto} (Q${(item.subtotal || 0).toFixed(2)})`,
        fecha: new Date(),
        usuarioNombre: profile?.nombre || user?.displayName || 'Operador',
        items: [{
          nombre: item.nombreProducto,
          cantidad: item.cantidad,
          subtotal: item.subtotal
        }]
      };
      setUltimaAccion(movElim);
      setUltimosMovimientos((prev) => [movElim, ...prev.filter((m) => m.id !== movElim.id)].slice(0, 30));

      setAlertaEliminarItemAbierta(false);
      setItemParaEliminar(null);
    } catch (e: any) { 
      toast({ title: "Error al Eliminar Producto", description: e.message, variant: "destructive" }); 
    } finally {
      setProcesandoEliminarItem(false);
    }
  };

  const saldoCreditoCliente = useMemo(() => {
    if (!ventaParaPagar) return 0;
    return ventasACredito
      .filter(v => v.clienteId === ventaParaPagar.clienteId)
      .reduce((acc, v) => acc + v.saldo, 0);
  }, [ventasACredito, ventaParaPagar]);

  const montoAPagarDialogo = useMemo(() => {
    if (!ventaParaPagar) return 0;
    
    let total = ventaParaPagar.detalles
        .filter(d => itemsSeleccionadosParaPagar.has(d.idDetalle))
        .reduce((acc, item) => acc + item.saldo, 0);

    if (incluirCreditoEnPago) total += saldoCreditoCliente;
    
    return total;
  }, [ventaParaPagar, itemsSeleccionadosParaPagar, incluirCreditoEnPago, saldoCreditoCliente]);

  const manejarConfirmarAbono = async () => {
    if (!firestore || !user || !ventaParaPagar || !montoAbono || procesandoGuardado) return;
    const abonoNum = Number(montoAbono);
    if (abonoNum <= 0) return;

    setProcesandoGuardado(true);
    try {
      const deudaVentaActual = ventaParaPagar.saldo || 0;
      const tieneCreditos = saldoCreditoCliente > 0;
      const esVentaCredito = ventaParaPagar.estado === 'credito';

      if (incluirCreditoEnPago || esVentaCredito || (tieneCreditos && abonoNum > deudaVentaActual)) {
        await registrarAbonoGeneral(firestore, sucursalId, user.uid, {
          clienteId: ventaParaPagar.clienteId,
          montoAbono: abonoNum,
          ventaPrincipalId: !esVentaCredito ? ventaParaPagar.id : null,
          ventaCreditoId: esVentaCredito ? ventaParaPagar.id : null,
          metodoDePago: 'Efectivo',
        });
        toast({ 
          title: "Abono General Registrado", 
          description: `Q${abonoNum.toFixed(2)} distribuido en cuenta y créditos.` 
        });
      } else {
        await registrarAbonoACuenta(firestore, sucursalId, ventaParaPagar.id, abonoNum, user.uid);
        toast({ title: "Abono Registrado", description: "Q" + abonoNum.toFixed(2) });
      }

      const movAbono: MovimientoRecientePOS = {
        id: Date.now().toString(),
        tipo: 'abono',
        titulo: 'Abono a Cuenta',
        descripcion: `Abono de Q${abonoNum.toFixed(2)} registrado para ${ventaParaPagar.nombreCliente || 'Cliente'}`,
        idVenta: ventaParaPagar.idVenta,
        clienteNombre: ventaParaPagar.nombreCliente,
        montoTotal: abonoNum,
        metodoPago: 'Efectivo',
        fecha: new Date(),
        usuarioNombre: profile?.nombre || user.displayName || 'Operador',
      };
      setUltimaAccion(movAbono);
      setUltimosMovimientos((prev) => [movAbono, ...prev.filter((m) => m.id !== movAbono.id)].slice(0, 30));

      setDialogoAbonoAbierto(false); 
      setDialogoPagoAbierto(false);
      setMontoAbono('');
      clienteInputRef.current?.focus();
    } catch (e: any) { 
      toast({ title: "Error al Abonar", description: e.message, variant: "destructive" }); 
    } finally {
      setProcesandoGuardado(false);
    }
  };

  const procederConPago = async (metodo: 'Efectivo' | 'Tarjeta') => {
    if (!firestore || !ventaParaPagar || !user || !sucursalId || procesandoGuardado) return;
    const ids = Array.from(itemsSeleccionadosParaPagar);
    
    setProcesandoGuardado(true);
    try {
      if (incluirCreditoEnPago) {
        await procesarPagoUnificado(firestore, sucursalId, user.uid, {
          ventaPrincipalId: ventaParaPagar.id,
          detalleIdsVentaPrincipal: ids,
          incluirCredito: true,
          clienteId: ventaParaPagar.clienteId,
          metodoDePago: metodo
        });
        toast({ title: "Pago Unificado Procesado", description: "Cuenta actual y deuda histórica saldada." });
      } else {
        await procesarPagoVenta(firestore, sucursalId, ventaParaPagar.id, ids, metodo, user.uid);
        toast({ title: "Pago Procesado", description: metodo });
      }

      const movPago: MovimientoRecientePOS = {
        id: Date.now().toString(),
        tipo: 'pago',
        titulo: 'Cobro de Cuenta',
        descripcion: `Cobro de Q${montoAPagarDialogo.toFixed(2)} procesado en ${metodo} para ${ventaParaPagar.nombreCliente || 'Cliente'}`,
        idVenta: ventaParaPagar.idVenta,
        clienteNombre: ventaParaPagar.nombreCliente,
        montoTotal: montoAPagarDialogo,
        metodoPago: metodo,
        fecha: new Date(),
        usuarioNombre: profile?.nombre || user.displayName || 'Operador',
      };
      setUltimaAccion(movPago);
      setUltimosMovimientos((prev) => [movPago, ...prev.filter((m) => m.id !== movPago.id)].slice(0, 30));

      setVistaDialogo('pago');
      setDialogoPagoAbierto(false);
      clienteInputRef.current?.focus();
    } catch (e: any) { 
      toast({ title: "Error", description: e.message, variant: "destructive" }); 
    } finally {
      setProcesandoGuardado(false);
    }
  };

  const manejarPermanecerEnVenta = () => {
    setAlertaCancelarVentaAbierta(false);
    if (clienteSeleccionadoId && clienteInputRef.current) {
      const cli = clientes.find(c => c.id === clienteSeleccionadoId);
      if (cli) {
        clienteInputRef.current.value = cli.nombre;
      }
    }
  };

  const manejarConfirmarCancelacion = async () => {
    if (!firestore || !user) return;
    try {
      if (idVentaActiva) {
        const v = ventasPendientes.find(x => x.id === idVentaActiva) || ventasACredito.find(x => x.id === idVentaActiva);
        const idsOrig = new Set(v?.detalles.map(d => d.idDetalle));
        const aDev = carrito.filter(item => item.idDetalle === 0 || !idsOrig.has(item.idDetalle));
        if (aDev.length > 0) {
          await cancelarVentaYDevolverStock(firestore, sucursalId, idVentaActiva, aDev, user.uid, false);
          toast({
            title: "Cambios Descartados",
            description: `Se devolvió el stock de ${aDev.length} producto(s). La cuenta de ${v?.nombreCliente || 'cliente'} se mantiene intacta.`,
          });
        }
      } else if (carrito.length > 0) {
        await cancelarVentaYDevolverStock(firestore, sucursalId, null, carrito, user.uid, false);
        toast({
          title: "Venta Descartada",
          description: "Se devolvió el stock de los artículos al inventario.",
        });
      }
    } catch (e: any) {
      console.error("Error al descartar cambios:", e);
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setClienteSeleccionadoId('');
      setCarrito([]);
      setIdVentaActiva(null);
      setMostrarItemManual(false);
      setDescripcionItemManual('');
      setPrecioUnitarioItemManual('');
      setCantidadItemManual(1);
      setAlertaCancelarVentaAbierta(false);
      clienteInputRef.current?.focus();
    }
  };

  const abrirDialogoConsumoInterno = (venta: Venta) => { setVentaParaConsumo(venta); setPinConsumo(''); setDialogoConsumoInternoAbierto(true); };

  const confirmarConsumoInterno = async () => {
    if (!firestore || !ventaParaConsumo || !pinConsumo || !user) return;
    const c = clientes.find(x => x.id === ventaParaConsumo.clienteId);
    if (c?.pinConsumoInterno !== pinConsumo) return toast({ title: "Error", description: "PIN incorrecto", variant: "destructive" });
    try {
      await liquidarComoConsumoInterno(firestore, sucursalId, ventaParaConsumo.id, user.uid);
      setDialogoConsumoInternoAbierto(false); toast({ title: "Consumo Interno Registrado" });
      clienteInputRef.current?.focus();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const abrirDialogoPago = (v: Venta) => { 
    setVentaParaPagar(v); 
    const allPendingIds = v.detalles.filter(d => d.estado !== 'Pagada').map(d => d.idDetalle);
    setItemsSeleccionadosParaPagar(new Set(allPendingIds)); 
    setIncluirCreditoEnPago(false);
    setVistaDialogo('pago'); 
    setDialogoPagoAbierto(true); 
  };

  const abrirDialogoTraslado = useCallback((venta: Venta) => {
    setVentaParaTrasladar(venta);
    setDialogoTrasladoAbierto(true);
  }, []);

  const manejarConfirmarTraslado = useCallback(
    async ({
      ventaOrigenId,
      destino,
      items,
    }: {
      ventaOrigenId: string;
      destino: DestinoTraslado;
      items: ItemATrasladar[];
    }) => {
      if (!firestore || !sucursalId || !user || procesandoTraslado) return;
      setProcesandoTraslado(true);
      try {
        const resultado = await trasladarItemsDeCuenta(
          firestore,
          sucursalId,
          ventaOrigenId,
          destino,
          items,
          user.uid,
          profile?.nombre || user.displayName || 'Operador'
        );

        // Si la venta activa en el formulario era la de origen y fue eliminada, limpiar formulario
        if (idVentaActiva === ventaOrigenId && resultado.ventaOrigenEliminada) {
          setIdVentaActiva(null);
          setClienteSeleccionadoId('');
          setCarrito([]);
        }

        const itemsDetalle = resultado.itemsTrasladados.map((i) => ({
          nombre: i.nombre,
          cantidad: i.cantidad,
          subtotal: i.subtotal,
        }));
        const resumenTexto = itemsDetalle.map((i) => `${i.cantidad}x ${i.nombre}`).join(', ');

        const movLocal: MovimientoRecientePOS = {
          id: Date.now().toString(),
          tipo: 'productos_agregados',
          titulo: resultado.ventaOrigenEliminada ? 'Cuenta Fusionada / Trasladada' : 'Productos Trasladados',
          descripcion: `De ${resultado.clienteOrigenNombre} a ${resultado.clienteDestinoNombre}: ${resumenTexto} • Total: Q${resultado.montoTotalTrasladado.toFixed(2)}${
            resultado.ventaOrigenEliminada ? ' (Cuenta origen eliminada al quedar en Q0.00)' : ''
          }`,
          idVenta: resultado.idVentaDestino,
          clienteNombre: resultado.clienteDestinoNombre,
          montoTotal: resultado.montoTotalTrasladado,
          fecha: new Date(),
          usuarioNombre: profile?.nombre || user.displayName || 'Operador',
          items: itemsDetalle,
        };

        setUltimaAccion(movLocal);
        setUltimosMovimientos((prev) => [movLocal, ...prev.filter((m) => m.id !== movLocal.id)].slice(0, 30));

        if (resultado.ventaDestinoId) {
          setUltimaCuentaModificadaId(resultado.ventaDestinoId);
          setTimeout(() => setUltimaCuentaModificadaId(null), 12000);
        }

        setDialogoTrasladoAbierto(false);
        setVentaParaTrasladar(null);

        toast({
          title: resultado.ventaOrigenEliminada ? 'Cuenta Trasladada y Cerrada' : 'Productos Trasladados con Éxito',
          description: `Se pasaron Q${resultado.montoTotalTrasladado.toFixed(2)} a ${resultado.clienteDestinoNombre}.${
            resultado.ventaOrigenEliminada ? ' La cuenta original se eliminó al quedar en Q0.00.' : ''
          }`,
        });
      } catch (err: any) {
        console.error('Error al trasladar cuenta:', err);
        toast({
          title: 'Error al Trasladar Cuenta',
          description: err.message || 'No se pudo completar el traslado.',
          variant: 'destructive',
        });
      } finally {
        setProcesandoTraslado(false);
      }
    },
    [firestore, sucursalId, user, procesandoTraslado, profile, idVentaActiva, toast]
  );

  const onProductoEnter = () => {
    if (productoSeleccionado && 'preparaciones' in productoSeleccionado && productoSeleccionado.preparaciones && productoSeleccionado.preparaciones.length > 0) preparacionesContainerRef.current?.focus();
    else anadirButtonRef.current?.focus();
  };

  const manejarPasarACredito = (venta: Venta) => {
    const cliente = clientes.find(c => c.id === venta.clienteId);
    if (cliente && cliente.permiteCredito === false) {
      toast({ title: "Crédito No Autorizado", description: `El cliente ${cliente.nombre} no tiene permitido comprar a crédito.`, variant: "destructive" });
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

  const manejarCrearCliente = async (n: string) => {
    const formattedName = n.trim().toLowerCase().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const cid = await guardarCliente(firestore!, sucursalId, { nombre: formattedName, tipoCliente: 'Cliente', idcliente: 0, consumoInterno: false, permiteCredito: true });
    return cid.id;
  };

  const manejarAbrirAlertaEliminar = (o: { value: string }) => {
    setClienteParaEliminar(clientes.find(c => c.id === o.value) || null);
    setAlertaEliminarAbierta(true);
  };

  const manejarConfirmarEliminarCliente = () => {
    if (clienteParaEliminar) {
      eliminarCliente(firestore!, sucursalId, clienteParaEliminar.id);
      setAlertaEliminarAbierta(false);
    }
  };

  return {
    isLoadingSucursal,
    cargando,
    ultimaAccion,
    ultimosMovimientos,
    dialogoMovimientosAbierto,
    setDialogoMovimientosAbierto,
    ultimaCuentaModificadaId,
    formProps: {
      refs: {
        clienteInputRef,
        cantidadInputRef,
        productoInputRef,
        itemManualCantRef,
        itemManualDescRef,
        itemManualPrecioRef,
        itemManualAddBtnRef,
        anadirButtonRef,
        preparacionesContainerRef
      },
      state: {
        clienteSeleccionadoId,
        productoSeleccionadoId,
        cantidad,
        mostrarItemManual,
        descripcionItemManual,
        precioUnitarioItemManual,
        cantidadItemManual,
        preparacionSeleccionada,
        productoSeleccionado,
        cargando,
        procesandoGuardado,
        procesandoAnadir,
        isMobile,
        totalVentaActiva,
        opcionesClientes,
        opcionesProductos,
        puedeOperar: !clienteSeleccionadoId || (carrito.length === 0 && !idVentaActiva)
      },
      actions: {
        manejarSeleccionCliente,
        manejarCrearCliente,
        manejarAbrirAlertaEliminar,
        setMostrarItemManual,
        setCantidadItemManual,
        setDescripcionItemManual,
        setPrecioUnitarioItemManual,
        setCantidad,
        setProductoSeleccionadoId,
        setPreparacionSeleccionada,
        manejarAnadirProducto,
        manejarAnadirItemManual,
        manejarGuardarVenta,
        onProductoEnter
      }
    },
    cartProps: {
      carrito,
      clienteSeleccionadoId,
      manejarEliminarDelCarrito
    },
    accountsProps: {
      state: {
        vistaCuentas,
        filtroCuentas,
        ventasPendientes,
        ventasACredito,
        idVentaActiva,
        clientesConCreditoIds: new Set(ventasACredito.map(v => v.clienteId)),
        clientesConConsumoInternoIds,
        procesandoCredito,
        ultimaCuentaModificadaId
      },
      actions: {
        setVistaCuentas,
        setFiltroCuentas,
        manejarClickEditar: manejarClickEditarVenta,
        handleTap,
        abrirDialogoPago,
        abrirDialogoConsumoInterno,
        abrirDialogoTraslado,
        manejarClickPasarACredito: manejarPasarACredito
      },
      refs: {
        filtroCuentasInputRef
      }
    },
    trasladoProps: {
      open: dialogoTrasladoAbierto,
      onOpenChange: setDialogoTrasladoAbierto,
      ventaOrigen: ventaParaTrasladar,
      ventasPendientes,
      clientes,
      onConfirmarTraslado: manejarConfirmarTraslado,
      procesando: procesandoTraslado,
    },
    dialogsProps: {
      refs: {
        abonoInputRef
      },
      state: {
        dialogoPagoAbierto,
        vistaDialogo,
        dialogoAbonoAbierto,
        dialogoConsumoInternoAbierto,
        alertaCancelarVentaAbierta,
        alertaEliminarAbierta,
        alertaCreditoMonedasAbierta,
        alertaClienteConCreditoAbierta,
        ventaParaPagar,
        ventaParaConsumo,
        clienteParaEliminar,
        itemsSeleccionadosParaPagar,
        montoAbono,
        montoAPagarDialogo,
        pinConsumo,
        procesandoPagoCredito,
        procesandoGuardado,
        incluirCreditoEnPago,
        saldoCreditoCliente,
        alertaEliminarItemAbierta,
        itemParaEliminar,
        procesandoEliminarItem
      },
      actions: {
        setDialogoPagoAbierto,
        setVistaDialogo,
        setDialogoAbonoAbierto,
        setDialogoConsumoInternoAbierto,
        setAlertaCancelarVentaAbierta,
        setAlertaEliminarAbierta,
        setAlertaCreditoMonedasAbierta,
        setAlertaClienteConCreditoAbierta,
        setItemsSeleccionadosParaPagar,
        setMontoAbono,
        setPinConsumo,
        manejarConfirmarAbono,
        procederConPago,
        manejarConfirmarCancelacion,
        manejarPermanecerEnVenta,
        manejarConfirmarEliminarCliente,
        confirmarPasarACredito,
        procederAGuardarVenta,
        confirmarConsumoInterno,
        setIncluirCreditoEnPago,
        setAlertaEliminarItemAbierta,
        confirmarEliminarItem
      }
    }
  };
}
