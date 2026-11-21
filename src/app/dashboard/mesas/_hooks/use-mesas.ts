'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { collection, doc, Timestamp, query, updateDoc, orderBy } from 'firebase/firestore';
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { 
  iniciarSesion, 
  pasarACuenta, 
  procesarVentaTiempoDeMesa, 
  trasladarMesa, 
  ajustarTiempoDefinido, 
  procesarPagoDivision, 
  eliminarConsumoMesa,
  procesarPagoAnticipadoMesa,
  type TipoPagoAnticipadoMesa,
} from '@/lib/firebase/servicios/mesas';
import { 
  descontarStockTemporal, 
  devolverStockTemporal, 
  descontarStockVirtualTemporal, 
  devolverStockVirtualTemporal, 
  registrarAuditoria, 
  registrarCacheUsuario, 
  registrarMovimientoInventarioDirecto 
} from '@/lib/firebase/servicios';
import { toDate } from '@/lib/firebase/servicios/utils';
import { useSucursal } from '@/hooks/use-sucursal';
import type { Mesa, Tarifa, Producto } from '@/lib/tipos';

/**
 * Hook principal de Sala de Juegos (mesas de billar y consolas).
 * Gestiona cronómetros en tiempo real, tarifas, consumos ligados a inventario, traslados y cobros.
 */
export function useMesas() {
  const { toast } = useToast();
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

  // Estados Lógica
  const [costos, setCostos] = useState<{ [key: string]: number }>({});
  const [serverOffset, setServerOffset] = useState<number | null>(null);
  const [selectedTable, setSelectedTable] = useState<Mesa | null>(null);
  const [tableToCharge, setTableToCharge] = useState<Mesa | null>(null);
  const [mesaParaConsumo, setMesaParaConsumo] = useState<Mesa | null>(null);
  const [mesaParaTraslado, setMesaParaTraslado] = useState<Mesa | null>(null);
  const [mesaParaAjuste, setMesaParaAjuste] = useState<Mesa | null>(null);

  // Estados de Modales
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isCobroModalOpen, setIsCobroModalOpen] = useState(false);
  const [isConsumoModalOpen, setIsConsumoModalOpen] = useState(false);
  const [isTrasladoModalOpen, setIsTrasladoModalOpen] = useState(false);
  const [isAjusteTiempoModalOpen, setIsAjusteTiempoModalOpen] = useState(false);
  const [alertaCancelarDivisionAbierta, setAlertaCancelarDivisionAbierta] = useState(false);
  const [confirmarEliminarConsumo, setConfirmarEliminarConsumo] = useState<{
    mesaId: string;
    consumoId: string;
    nombre: string;
    cantidad?: number;
    precioUnitario?: number;
    total?: number;
    idProducto?: string;
    numeroMesa?: number;
    tipoDeMesa?: string;
  } | null>(null);

  // Estados Form Start
  const [modoJuego, setModoJuego] = useState<'libre' | 'definido'>('libre');
  const [selectedInterval, setSelectedInterval] = useState(30);
  const [pagadoDeContado, setPagadoDeContado] = useState(false);
  const [numControles, setNumControles] = useState(2);

  // Estados Form Cobro
  const [tiempoJugadoFinal, setTiempoJugadoFinal] = useState('');
  const [editableCost, setEditableCost] = useState<number | ''>(0);
  const [consumoFijoModal, setConsumoFijoModal] = useState(0);
  const [isEditingCost, setIsEditingCost] = useState(false);
  const [activeTab, setActiveTab] = useState('rapido');
  const [numeroDePartes, setNumeroDePartes] = useState<number | null>(null);
  const [currentDivisionStep, setCurrentDivisionStep] = useState<number | null>(null);
  const [divisionClienteId, setDivisionClienteId] = useState('');
  
  // Estados Form Consumo
  const [carritoConsumoTemporal, setCarritoConsumoTemporal] = useState<any[]>([]);
  const [isConsumoManual, setIsConsumoManual] = useState(false);
  const [cantidadConsumo, setCantidadConsumo] = useState<number | ''>(1);
  const [descripcionConsumoManual, setDescripcionConsumoManual] = useState('');
  const [precioConsumoManual, setPrecioConsumoManual] = useState<number | ''>('');
  const [productoConsumoId, setProductoConsumoId] = useState('');
  const [preparacionSeleccionada, setPreparacionSeleccionada] = useState<any>(null);
  const [hasSavedConsumo, setHasSavedConsumo] = useState(false);
  const [procesandoEliminacionConsumo, setProcesandoEliminacionConsumo] = useState(false);
  const carritoOriginalRef = useRef<any[]>([]);

  // Estados Form Traslado / Ajuste
  const [mesaDestinoId, setMesaDestinoId] = useState('');
  const [tiempoParaAnadir, setTiempoParaAnadir] = useState(30);
  const [pagarTiempoAnadido, setPagarTiempoAnadido] = useState(false);

  // Estados de carga
  const [processingCharge, setProcessingCharge] = useState(false);
  const [processingConsumption, setProcessingConsumption] = useState(false);
  const [processingTraslado, setProcessingTraslado] = useState(false);
  const [processingAjuste, setProcessingAjuste] = useState(false);
  const [procesandoDivision, setProcesandoDivision] = useState(false);
  const [procesandoAnadir, setProcesandoAnadir] = useState(false);

  // Referencias
  const clienteInputRef = useRef<HTMLInputElement>(null);
  const cantidadConsumoInputRef = useRef<HTMLInputElement>(null);
  const productoInputRef = useRef<HTMLInputElement>(null);
  const preparacionesContainerRef = useRef<HTMLDivElement>(null);
  const anadirConsumoButtonRef = useRef<HTMLButtonElement>(null);
  const itemManualCantRef = useRef<HTMLInputElement>(null);
  const itemManualDescRef = useRef<HTMLInputElement>(null);
  const itemManualPrecioRef = useRef<HTMLInputElement>(null);
  const itemManualAddBtnRef = useRef<HTMLButtonElement>(null);
  const filtroCuentasInputRef = useRef<HTMLInputElement>(null);
  const abonoInputRef = useRef<HTMLInputElement>(null);
  const lastTapTimeRef = useRef(0);
  const lastTapIdRef = useRef<string | null>(null);

  // Desbloquear body
  useEffect(() => {
    const anyModalOpen = isStartModalOpen || isCobroModalOpen || isConsumoModalOpen || 
                        isTrasladoModalOpen || isAjusteTiempoModalOpen || 
                        alertaCancelarDivisionAbierta || !!confirmarEliminarConsumo;
    
    if (!anyModalOpen) {
      document.body.style.pointerEvents = 'auto';
      document.body.style.overflow = 'auto';
    }
  }, [isStartModalOpen, isCobroModalOpen, isConsumoModalOpen, isTrasladoModalOpen, isAjusteTiempoModalOpen, alertaCancelarDivisionAbierta, confirmarEliminarConsumo]);

  // Sincronización del servidor
  useEffect(() => {
    const syncTime = async () => {
      try {
        const samples = [];
        for(let i = 0; i < 3; i++) {
          const start = Date.now();
          const response = await fetch(`${window.location.origin}/?t=${Date.now()}`, { 
            method: 'HEAD', 
            cache: 'no-cache' 
          }).catch(() => null);

          if (response && response.ok) {
            const serverDateStr = response.headers.get('date');
            if (serverDateStr) {
              const serverDate = new Date(serverDateStr);
              const end = Date.now();
              const rtt = end - start;
              const estimatedServerTimeAtEnd = serverDate.getTime() + (rtt / 2);
              samples.push(estimatedServerTimeAtEnd - end);
            }
          }
        }
        
        if (samples.length > 0) {
          samples.sort((a, b) => a - b);
          const medianOffset = samples[Math.floor(samples.length / 2)];
          setServerOffset(medianOffset);
        } else {
          setServerOffset(0);
        }
      } catch (e) {
        setServerOffset(0);
      }
    };
    syncTime();
    const interval = setInterval(syncTime, 60000); 
    return () => clearInterval(interval);
  }, []);

  // Consultas Firestore
  const generalesRef = useMemoFirebase(
    () => (firestore && sucursalId ? doc(firestore, `sucursales/${sucursalId}/generales`, 'actual') : null),
    [firestore, sucursalId]
  );
  const mesasQuery = useMemoFirebase(() => (firestore && sucursalId) ? query(collection(firestore, `sucursales/${sucursalId}/mesas_de_billar`), orderBy('numeroMesa')) : null, [firestore, sucursalId]);
  const tarifasQuery = useMemoFirebase(() => (firestore && sucursalId) ? query(collection(firestore, `sucursales/${sucursalId}/tarifas`)) : null, [firestore, sucursalId]);
  const clientesQuery = useMemoFirebase(() => (firestore && sucursalId) ? query(collection(firestore, `sucursales/${sucursalId}/clientes`), orderBy('nombre')) : null, [firestore, sucursalId]);
  const productosQuery = useMemoFirebase(() => (firestore && sucursalId) ? query(collection(firestore, `sucursales/${sucursalId}/productos`), orderBy('nombre')) : null, [firestore, sucursalId]);

  const { data: mesasData, isLoading: isLoadingMesas } = useCollection<Mesa>(mesasQuery);
  const { data: tarifasData, isLoading: isLoadingTarifas } = useCollection<Tarifa>(tarifasQuery);
  const { data: clientesData, isLoading: isLoadingClientes } = useCollection<any>(clientesQuery);
  const { data: productosData, isLoading: isLoadingProductos } = useCollection<Producto>(productosQuery);

  // Observador de Sincronización
  useEffect(() => {
    if (!mesasData) return;
    
    if (tableToCharge) {
      const mesaActual = mesasData.find(m => m.id === tableToCharge.id);
      if (!mesaActual || mesaActual.estado === 'disponible') {
        setIsCobroModalOpen(false);
        setTableToCharge(null);
      }
    }
    
    if (mesaParaConsumo) {
      const mesaActual = mesasData.find(m => m.id === mesaParaConsumo.id);
      if (!mesaActual || mesaActual.estado === 'disponible') {
        setIsConsumoModalOpen(false);
        setMesaParaConsumo(null);
      }
    }
  }, [mesasData, tableToCharge, mesaParaConsumo]);

  // Datos memoizados
  const clientesOptions = useMemo(() => (clientesData || []).map((c: any) => ({ value: c.id, label: c.nombre })), [clientesData]);
  const productosOptions = useMemo(() => (productosData || []).map(p => ({ value: p.id, label: p.nombre, description: `Stock: ${p.existencia} - Q${p.precioVenta.toFixed(2)}` })), [productosData]);
  const productoConsumoSeleccionado = useMemo(() => productosData?.find(p => p.id === productoConsumoId), [productosData, productoConsumoId]);
  const totalAPagarModal = tableToCharge ? (Number(editableCost) || 0) + consumoFijoModal : 0;
  const montoPorParte = totalAPagarModal > 0 && numeroDePartes ? totalAPagarModal / numeroDePartes : 0;

  // Lógica de costo local
  const calcularCostoLocal = useCallback((segundos: number, tarifa: Tarifa, numControles: number = 0): number => {
    if (!tarifa || segundos <= 0) return 0;
    
    const baseControles = tarifa.controlesBase || 0;
    const extraControles = Math.max(0, numControles - baseControles);
    const extraPorHora = extraControles * (tarifa.costoControlExtra || 0);

    if (tarifa.tipoDeMesa === 'Consola') {
      let tarifaPorHoraBase = 0;
      if (tarifa.tipoDeCalculo === "Por minuto") {
        tarifaPorHoraBase = (tarifa.costoPorMinuto || 0) * 60;
      } else if (tarifa.tipoDeCalculo === "Por intervalo" && tarifa.intervalos && tarifa.intervalos.length > 0) {
        const int60 = tarifa.intervalos.find(i => i.duracionMinutos === 60);
        if (int60) {
          tarifaPorHoraBase = int60.precio;
        } else {
          const mayor = [...tarifa.intervalos].sort((a, b) => b.duracionMinutos - a.duracionMinutos)[0];
          if (mayor && mayor.duracionMinutos > 0) {
            tarifaPorHoraBase = (mayor.precio / mayor.duracionMinutos) * 60;
          }
        }
      }
      
      const tarifaPorHoraTotal = tarifaPorHoraBase + extraPorHora;
      const minutos = Math.ceil(segundos / 60);
      const bloques30 = Math.ceil(minutos / 30);
      
      return bloques30 * (tarifaPorHoraTotal / 2);
    }

    const minutos = Math.ceil(segundos / 60);
    if (minutos <= 0) return 0;
  
    if (tarifa.tipoDeCalculo === "Por minuto") {
      return minutos * (tarifa.costoPorMinuto || 0);
    }
  
    if (tarifa.tipoDeCalculo === "Por intervalo" && tarifa.intervalos && tarifa.intervalos.length > 0) {
      const intervalosOrdenados = [...tarifa.intervalos].sort((a, b) => b.duracionMinutos - a.duracionMinutos);
      let minutosRestantes = minutos;
      let costoTotal = 0;
      for (const intervalo of intervalosOrdenados) {
        if (minutosRestantes > 0 && intervalo.duracionMinutos > 0) {
          const numeroDeBloques = Math.floor(minutosRestantes / intervalo.duracionMinutos);
          if (numeroDeBloques > 0) {
            costoTotal += numeroDeBloques * intervalo.precio;
            minutosRestantes -= numeroDeBloques * intervalo.duracionMinutos;
          }
        }
      }
      if (minutosRestantes > 0) {
        const intervaloMenorAplicable = [...tarifa.intervalos]
          .sort((a, b) => a.duracionMinutos - b.duracionMinutos)
          .find(intervalo => minutosRestantes <= intervalo.duracionMinutos);
        if (intervaloMenorAplicable) {
          costoTotal += intervaloMenorAplicable.precio;
        } else if (intervalosOrdenados.length > 0) {
          const intervaloMasPequeno = [...tarifa.intervalos].sort((a, b) => a.duracionMinutos - b.duracionMinutos)[0];
          if (intervaloMasPequeno) {
            costoTotal += intervaloMasPequeno.precio;
          }
        }
      }
      return costoTotal;
    }
    return 0;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!mesasData || !tarifasData || serverOffset === null) return;
      const nuevosCostos: { [key: string]: number } = {};
      const ahoraSincronizada = Date.now() + serverOffset;
      
      mesasData.forEach(mesa => {
        if (mesa.estado === 'ocupado' && mesa.modoJuego === 'libre' && !mesa.alquilerPagado) {
          const fInicio = toDate(mesa.horaInicio);
          if (fInicio.getTime() <= 0) return;
          
          const tarifa = tarifasData.find(t => t.id === mesa.tarifaId);
          const segundos = (ahoraSincronizada - fInicio.getTime()) / 1000;
          nuevosCostos[mesa.id] = calcularCostoLocal(segundos, tarifa as Tarifa, mesa.numControles || 0);
        }
      });
      setCostos(nuevosCostos);
    }, 1000); 
    return () => clearInterval(interval);
  }, [mesasData, tarifasData, calcularCostoLocal, serverOffset]);

  useEffect(() => {
    if (isConsumoModalOpen) {
      setTimeout(() => {
        if (isConsumoManual) {
          itemManualCantRef.current?.focus();
          itemManualCantRef.current?.select();
        } else {
          cantidadConsumoInputRef.current?.focus();
          cantidadConsumoInputRef.current?.select();
        }
      }, 100);
    }
  }, [isConsumoModalOpen, isConsumoManual]);

  // Handlers
  const handleSaveConsumo = useCallback(async () => {
    if (!mesaParaConsumo || !firestore || !sucursalId || processingConsumption) return;
    setProcessingConsumption(true);
    try {
      const additions = carritoConsumoTemporal.filter(t => !carritoOriginalRef.current.some(o => o.id === t.id));

      await updateDoc(doc(firestore, `sucursales/${sucursalId}/mesas_de_billar`, mesaParaConsumo.id), { consumos: carritoConsumoTemporal });
      
      for (const item of additions) {
        const idProd = item.idProducto || item.productoId;
        if (idProd && idProd !== 'item-manual') {
          await registrarMovimientoInventarioDirecto(firestore, sucursalId, {
            productoId: idProd,
            nombreProducto: item.nombreProducto,
            tipoMovimiento: 'Venta',
            cantidad: -item.cantidad,
            existenciaAnterior: 0,
            existenciaNueva: 0,
            referencia: `Consumo Mesa #${mesaParaConsumo.numeroMesa}`,
            usuarioId: user?.uid || 'sistema'
          }).catch(err => console.error("Error registrando inventario mesa:", err));
        }
      }

      const resumenConsumos = carritoConsumoTemporal
        .map((c: any) => `${c.cantidad}x ${c.nombreProducto || 'Producto'} (Q${(c.total || 0).toFixed(2)})`)
        .join(', ');

      await registrarAuditoria(firestore, sucursalId, {
        usuarioId: user?.uid || 'desconocido',
        usuarioNombre: user?.displayName || user?.email || 'Usuario',
        usuarioEmail: user?.email || '',
        categoria: 'MESAS',
        accion: 'MESA_AGREGAR_CONSUMO',
        titulo: `Consumo actualizado Mesa #${mesaParaConsumo.numeroMesa}`,
        descripcion: `Mesa #${mesaParaConsumo.numeroMesa} • Consumos: ${resumenConsumos || `${carritoConsumoTemporal.length} ítems`}`,
        detalles: {
          mesaId: mesaParaConsumo.id,
          numeroMesa: mesaParaConsumo.numeroMesa,
          totalConsumos: carritoConsumoTemporal.reduce((acc: number, c: any) => acc + (c.total || 0), 0),
          items: carritoConsumoTemporal.map((c: any) => ({ nombre: c.nombreProducto, cantidad: c.cantidad, total: c.total }))
        }
      });

      toast({ title: 'Éxito', description: 'Consumo guardado correctamente.' });
      setHasSavedConsumo(true);
      setIsConsumoManual(false);
      setDescripcionConsumoManual('');
      setPrecioConsumoManual('');
      setCantidadConsumo(1);
      setIsConsumoModalOpen(false);
    } catch (e: any) { 
      toast({ title: "Error", description: e.message, variant: 'destructive' }); 
    } finally { 
      setProcessingConsumption(false); 
    }
  }, [mesaParaConsumo, firestore, sucursalId, carritoConsumoTemporal, processingConsumption, toast, user]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isConsumoModalOpen) {
        if (event.key === 'F6') {
          event.preventDefault();
          setIsConsumoManual(prev => !prev);
        }
        if (event.key === 'F3') {
          event.preventDefault();
          handleSaveConsumo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConsumoModalOpen, handleSaveConsumo]);

  const handleOpenModal = useCallback((table: Mesa, action: 'iniciar' | 'cobrar') => {
    if (action === 'iniciar') {
      setSelectedTable(table); 
      setModoJuego('libre'); 
      setPagadoDeContado(false); 
      setNumControles(table.tipoDeMesa === 'Consola' ? 2 : 0);
      setIsStartModalOpen(true);
    } else if (action === 'cobrar') {
      const ahoraSincronizada = Date.now() + (serverOffset || 0);
      let ms = table.horaInicio ? Math.max(0, ahoraSincronizada - toDate(table.horaInicio).getTime()) : 0;
      const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
      setTiempoJugadoFinal(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
      let costoAlq = table.modoJuego === 'libre' ? calcularCostoLocal(ms / 1000, tarifasData?.find(t => t.id === table.tarifaId) as Tarifa, table.numControles || 0) : (!table.alquilerPagado ? (table.montoACobrar || 0) : 0);
      const costoAjustes = (table.ajustesDeTiempo || []).filter((a: any) => !a.pagado).reduce((acc: number, a: any) => acc + a.monto, 0);
      const totalCons = (table.consumos || []).reduce((acc: number, item: any) => acc + item.total, 0);
      setEditableCost(costoAlq + costoAjustes); 
      setConsumoFijoModal(totalCons); 
      setTableToCharge({ ...table, clienteId: '', nombreCliente: '' }); 
      setActiveTab('rapido');
      setIsEditingCost(false); 
      setIsCobroModalOpen(true);
    }
  }, [serverOffset, tarifasData, calcularCostoLocal]);

  const handleStartTime = useCallback(async () => {
    if (!selectedTable || !firestore || !user || !tarifasData || !sucursalId) return;
    try {
      const tarifaMesa = tarifasData.find(t => t.id === selectedTable.tarifaId);
      if (!tarifaMesa) throw new Error('Tarifa inválida.');
      await iniciarSesion({ 
        firestore, 
        sucursalId, 
        usuarioId: user.uid, 
        mesaId: selectedTable.id, 
        numeroMesa: selectedTable.numeroMesa, 
        modoJuego, 
        pagadoDeContado: modoJuego === 'definido' ? pagadoDeContado : false, 
        duracionDefinida: modoJuego === 'definido' ? selectedInterval : 0, 
        tarifa: tarifaMesa as Tarifa, 
        numControles: selectedTable.tipoDeMesa === 'Consola' ? numControles : 0, 
        serverOffset: serverOffset || 0 
      });
      toast({ title: `${selectedTable.tipoDeMesa === 'Consola' ? 'Consola' : 'Mesa'} ${selectedTable.numeroMesa} iniciada` });
    } catch (e: any) { 
      toast({ title: 'Error', description: e.message, variant: 'destructive' }); 
    } finally { 
      setIsStartModalOpen(false); 
      setSelectedTable(null); 
    }
  }, [selectedTable, firestore, user, tarifasData, sucursalId, modoJuego, pagadoDeContado, selectedInterval, numControles, serverOffset, toast]);

  const handleFinalizarSinCosto = useCallback(async () => {
    if (!tableToCharge || !firestore || !user || !sucursalId || processingCharge) return;
    setProcessingCharge(true);
    try {
      await procesarVentaTiempoDeMesa(firestore, sucursalId, tableToCharge, user.uid, 0, 'Efectivo', serverOffset || 0);
      toast({ title: "Sesión finalizada", description: "Registrada con valor Q0.00" });
      setIsCobroModalOpen(false); 
      setTableToCharge(null); 
      setNumeroDePartes(null); 
      setCurrentDivisionStep(null);
    } catch (e: any) { 
      toast({ title: "Error", description: e.message, variant: 'destructive'}); 
    } finally { 
      setProcessingCharge(false); 
    }
  }, [tableToCharge, firestore, user, sucursalId, serverOffset, toast, processingCharge]);

  const handleProcederConPago = useCallback(async (metodo: 'Efectivo' | 'Tarjeta') => {
    if (!tableToCharge || !firestore || !user || !sucursalId || processingCharge) return;
    setProcessingCharge(true);
    try {
      await procesarVentaTiempoDeMesa(firestore, sucursalId, tableToCharge, user.uid, Number(editableCost) || 0, metodo, serverOffset || 0);
      toast({ title: 'Cobro realizado exitosamente' });
      setIsCobroModalOpen(false); 
      setTableToCharge(null); 
      setNumeroDePartes(null); 
      setCurrentDivisionStep(null);
    } catch (e: any) { 
      toast({ title: "Error", description: e.message, variant: "destructive"}); 
    } finally { 
      setProcessingCharge(false); 
    }
  }, [tableToCharge, firestore, user, sucursalId, editableCost, serverOffset, toast, processingCharge]);

  /** Cobra tiempo, consumos o ambos por adelantado sin detener el reloj ni liberar la mesa/consola. */
  const handlePagoAnticipado = useCallback(async (tipoPago: TipoPagoAnticipadoMesa, metodo: 'Efectivo' | 'Tarjeta') => {
    if (!tableToCharge || !firestore || !user || !sucursalId || processingCharge) return;
    setProcessingCharge(true);
    try {
      await procesarPagoAnticipadoMesa({
        firestore,
        sucursalId,
        mesa: tableToCharge,
        usuarioId: user.uid,
        tipoPago,
        costoAlquiler: Number(editableCost) || 0,
        metodoDePago: metodo,
      });
      toast({
        title: 'Pago anticipado registrado',
        description: 'El cobro se guardó y la estación sigue activa.',
      });
      setIsCobroModalOpen(false);
      setTableToCharge(null);
      setNumeroDePartes(null);
      setCurrentDivisionStep(null);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setProcessingCharge(false);
    }
  }, [tableToCharge, firestore, user, sucursalId, editableCost, toast, processingCharge]);

  const handlePasarACuenta = useCallback(async (clienteId: string) => {
    if (!tableToCharge || !firestore || !user || !sucursalId || processingCharge) return;
    setProcessingCharge(true);
    try {
      await pasarACuenta(firestore, sucursalId, user.uid, tableToCharge, Number(editableCost) || 0, consumoFijoModal, clienteId, serverOffset || 0);
      toast({ title: 'Éxito', description: 'Añadido a cuenta del cliente.' });
      setIsCobroModalOpen(false); 
      setTableToCharge(null); 
      setNumeroDePartes(null); 
      setCurrentDivisionStep(null);
    } catch (e: any) { 
      toast({ title: 'Error', description: e.message, variant: 'destructive' }); 
    } finally { 
      setProcessingCharge(false); 
    }
  }, [tableToCharge, firestore, user, sucursalId, editableCost, consumoFijoModal, serverOffset, toast, processingCharge]);

  const handleAddConsumo = useCallback(async () => {
    if (isConsumoManual) {
      if (!descripcionConsumoManual.trim() || !precioConsumoManual || Number(precioConsumoManual) <= 0 || !cantidadConsumo) return;
      const n = { 
        id: `${Date.now()}-${Math.random()}`, 
        idProducto: 'item-manual', 
        nombreProducto: descripcionConsumoManual.trim(), 
        cantidad: Number(cantidadConsumo), 
        precioUnitario: Number(precioConsumoManual), 
        total: Number(cantidadConsumo) * Number(precioConsumoManual), 
        fechaAgregado: Timestamp.now() 
      };
      setCarritoConsumoTemporal(prev => [n, ...prev]); 
      setDescripcionConsumoManual(''); 
      setPrecioConsumoManual(''); 
      setCantidadConsumo(1);
      setIsConsumoManual(false);
      setTimeout(() => {
        cantidadConsumoInputRef.current?.focus();
        cantidadConsumoInputRef.current?.select();
      }, 50);
    } else {
      if (!productoConsumoSeleccionado || !cantidadConsumo || !firestore || !sucursalId) return;
      setProcesandoAnadir(true);
      const cantNum = Number(cantidadConsumo);
      const stockDisponible = productoConsumoSeleccionado.existencia ?? 0;
      if (stockDisponible < cantNum) {
        setProcesandoAnadir(false);
        toast({
          title: "Stock Insuficiente",
          description: `No hay suficiente stock para "${productoConsumoSeleccionado.nombre}". Existencia disponible: ${stockDisponible}, cantidad solicitada: ${cantNum}.`,
          variant: "destructive"
        });
        return;
      }

      try {
        let name = productoConsumoSeleccionado.nombre, price = productoConsumoSeleccionado.precioVenta, ing: any[] = [];
        if (productoConsumoSeleccionado.esVirtual) {
          await descontarStockVirtualTemporal(firestore, sucursalId, productoConsumoSeleccionado.id, cantNum);
        } else {
          await descontarStockTemporal(firestore, sucursalId, productoConsumoSeleccionado.id, cantNum);
        }
        if (preparacionSeleccionada && preparacionSeleccionada !== 'base' && 'preparaciones' in productoConsumoSeleccionado) { 
          name = `${productoConsumoSeleccionado.nombre} (${preparacionSeleccionada.nombre})`; 
          price = preparacionSeleccionada.precioVenta; 
          ing = preparacionSeleccionada.ingredientes || []; 
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
            if (productoConsumoSeleccionado.esVirtual) {
              await devolverStockVirtualTemporal(firestore, sucursalId, productoConsumoSeleccionado.id, cantNum).catch(() => {});
            } else {
              await devolverStockTemporal(firestore, sucursalId, productoConsumoSeleccionado.id, cantNum).catch(() => {});
            }
            throw errIng;
          }
        }
        const n = { 
          id: `${Date.now()}-${Math.random()}`, 
          idProducto: productoConsumoSeleccionado.id, 
          nombreProducto: name, 
          cantidad: cantNum, 
          precioUnitario: price, 
          total: cantNum * price, 
          fechaAgregado: Timestamp.now(), 
          esVirtual: !!productoConsumoSeleccionado.esVirtual, 
          ingredientesConsumidos: ing 
        };
        setCarritoConsumoTemporal(prev => [n, ...prev]); 
        setProductoConsumoId(''); 
        setCantidadConsumo(1); 
        setPreparacionSeleccionada(null); 
        setTimeout(() => {
          cantidadConsumoInputRef.current?.focus();
          cantidadConsumoInputRef.current?.select();
        }, 0);
      } catch (e: any) {
        toast({ title: "Error de stock", description: e.message, variant: "destructive" });
      } finally { 
        setProcesandoAnadir(false); 
      }
    }
  }, [isConsumoManual, descripcionConsumoManual, precioConsumoManual, cantidadConsumo, productoConsumoSeleccionado, firestore, sucursalId, preparacionSeleccionada, toast]);

  const handleRemoveFromTempCart = useCallback(async (id: string) => {
    const item = carritoConsumoTemporal.find(i => i.id === id);
    if (!item || !firestore || !sucursalId) return;
    try {
      if (item.idProducto !== 'item-manual') {
        if (item.esVirtual) {
          await devolverStockVirtualTemporal(firestore, sucursalId, item.idProducto, item.cantidad);
        } else {
          await devolverStockTemporal(firestore, sucursalId, item.idProducto, item.cantidad);
          if (item.ingredientesConsumidos) {
            for (const i of item.ingredientesConsumidos) {
              await devolverStockTemporal(firestore, sucursalId, i.productoId, i.cantidad * item.cantidad);
            }
          }
        }
      }
      setCarritoConsumoTemporal(prev => prev.filter(i => i.id !== id));
    } catch (e: any) {
      toast({ title: "Error al devolver stock", description: e.message, variant: "destructive" });
    }
  }, [carritoConsumoTemporal, firestore, sucursalId, toast]);

  const handleCancelConsumo = useCallback(async () => {
    if (hasSavedConsumo || !sucursalId || !firestore) return;
    const additions = carritoConsumoTemporal.filter(t => !carritoOriginalRef.current.some(o => o.id === t.id));
    const deletions = carritoOriginalRef.current.filter(o => !carritoConsumoTemporal.some(t => t.id === o.id));
    for (const item of additions) {
      if (item.idProducto !== 'item-manual') {
        if (item.esVirtual) { 
          await devolverStockVirtualTemporal(firestore, sucursalId, item.idProducto, item.cantidad); 
        } else {
          await devolverStockTemporal(firestore, sucursalId, item.idProducto, item.cantidad);
          if (item.ingredientesConsumidos) { 
            for (const ing of item.ingredientesConsumidos) { 
              await devolverStockTemporal(firestore, sucursalId, ing.productoId, ing.cantidad * item.cantidad); 
            } 
          }
        }
      }
    }
    for (const item of deletions) {
      if (item.idProducto !== 'item-manual') {
        if (item.esVirtual) { 
          await descontarStockVirtualTemporal(firestore, sucursalId, item.idProducto, item.cantidad); 
        } else {
          await descontarStockTemporal(firestore, sucursalId, item.idProducto, item.cantidad);
          if (item.ingredientesConsumidos) { 
            for (const ing of item.ingredientesConsumidos) { 
              await descontarStockTemporal(firestore, sucursalId, ing.productoId, ing.cantidad * item.cantidad); 
            } 
          }
        }
      }
    }
  }, [hasSavedConsumo, sucursalId, firestore, carritoConsumoTemporal]);

  const handleConfirmarTraslado = useCallback(async () => {
    if (!mesaParaTraslado || !mesaDestinoId || !sucursalId) return;
    setProcessingTraslado(true);
    try {
      await trasladarMesa(firestore!, sucursalId, mesaParaTraslado.id, mesaDestinoId, user?.uid);
      toast({ title: "Éxito", description: `${mesaParaTraslado.tipoDeMesa === 'Consola' ? 'Consola' : 'Mesa'} trasladada correctamente.` });
      setIsTrasladoModalOpen(false);
    } catch (e: any) { 
      toast({ title: "Error", description: e.message, variant: "destructive" }); 
    } finally { 
      setProcessingTraslado(false); 
    }
  }, [mesaParaTraslado, mesaDestinoId, sucursalId, firestore, user, toast]);

  const handleConfirmarAjusteTiempo = useCallback(async () => {
    if (!mesaParaAjuste || !user || !firestore || !sucursalId) return;
    setProcessingAjuste(true);
    try {
      await ajustarTiempoDefinido(firestore, sucursalId, user.uid, mesaParaAjuste.id, tiempoParaAnadir, pagarTiempoAnadido, serverOffset || 0);
      toast({ title: "Tiempo ajustado exitosamente" });
      setIsAjusteTiempoModalOpen(false);
    } catch (e: any) { 
      toast({ title: "Error", description: e.message, variant: "destructive" }); 
    } finally { 
      setProcessingAjuste(false); 
    }
  }, [mesaParaAjuste, user, firestore, sucursalId, tiempoParaAnadir, pagarTiempoAnadido, serverOffset, toast]);

  const handlePagoDivisionLocal = useCallback(async (metodo: 'Efectivo' | 'Tarjeta' | 'A Cuenta') => {
    if (!tableToCharge || !firestore || !user || numeroDePartes === null || currentDivisionStep === null || !sucursalId || procesandoDivision) return;
    let cli = null;
    if (metodo === 'A Cuenta') {
      const c = clientesData?.find((x: any) => x.id === divisionClienteId);
      if (!c) { toast({ title: "Error", description: "Cliente no válido.", variant: "destructive" }); return; }
      cli = { clienteId: divisionClienteId, nombreCliente: c.nombre };
    }
    setProcesandoDivision(true);
    try {
      const p = `Parte ${currentDivisionStep + 1}/${numeroDePartes}`;
      await procesarPagoDivision(firestore, sucursalId, user.uid, tableToCharge.numeroMesa, montoPorParte, metodo, cli, p);
      const next = currentDivisionStep + 1;
      if (next >= numeroDePartes) {
        await updateDoc(doc(firestore, `sucursales/${sucursalId}/mesas_de_billar`, tableToCharge.id), { 
          estado: 'disponible', 
          horaInicio: null, 
          modoJuego: null, 
          tiempoDefinido: null, 
          alquilerPagado: false, 
          montoACobrar: null, 
          ajustesDeTiempo: [], 
          alarmaAck: false, 
          numControles: 0, 
          idVentaPrepagada: null 
        });
        setIsCobroModalOpen(false); 
        setTableToCharge(null); 
        setNumeroDePartes(null); 
        setCurrentDivisionStep(null);
      } else { 
        setCurrentDivisionStep(next); 
        setDivisionClienteId(''); 
      }
    } catch (e: any) { 
      toast({ title: "Error", description: e.message, variant: "destructive" }); 
    } finally { 
      setProcesandoDivision(false); 
    }
  }, [tableToCharge, firestore, user, numeroDePartes, currentDivisionStep, sucursalId, clientesData, divisionClienteId, montoPorParte, toast]);

  const handleProductoEnter = useCallback(() => {
    if (productoConsumoSeleccionado && 'preparaciones' in productoConsumoSeleccionado && productoConsumoSeleccionado.preparaciones && productoConsumoSeleccionado.preparaciones.length > 0) {
      preparacionesContainerRef.current?.focus();
    } else {
      anadirConsumoButtonRef.current?.focus();
    }
  }, [productoConsumoSeleccionado]);

  const handleConfirmarEliminarConsumoPersistido = useCallback(async () => {
    if (!confirmarEliminarConsumo || !firestore || !sucursalId) return;
    setProcesandoEliminacionConsumo(true);
    try {
      await eliminarConsumoMesa(firestore, sucursalId, confirmarEliminarConsumo.mesaId, confirmarEliminarConsumo.consumoId, user?.uid);
      toast({ title: "Éxito", description: `${confirmarEliminarConsumo.nombre} eliminado.` });
      setConfirmarEliminarConsumo(null);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setProcesandoEliminacionConsumo(false);
    }
  }, [confirmarEliminarConsumo, firestore, sucursalId, user, toast]);

  const handleOpenConsumo = useCallback((m: Mesa) => {
    setMesaParaConsumo(m);
    setCarritoConsumoTemporal(m.consumos || []);
    carritoOriginalRef.current = [...(m.consumos || [])];
    setProductoConsumoId('');
    setIsConsumoManual(false);
    setDescripcionConsumoManual('');
    setPrecioConsumoManual('');
    setCantidadConsumo(1);
    setHasSavedConsumo(false);
    setIsConsumoModalOpen(true);
  }, []);

  const handleOpenTraslado = useCallback((m: Mesa) => {
    setMesaParaTraslado(m);
    setMesaDestinoId('');
    setIsTrasladoModalOpen(true);
  }, []);

  const handleOpenAjusteTiempo = useCallback((m: Mesa) => {
    setMesaParaAjuste(m);
    setTiempoParaAnadir(30);
    setPagarTiempoAnadido(false);
    setIsAjusteTiempoModalOpen(true);
  }, []);

  const handleOpenEliminarConsumo = useCallback((mesaId: string, consumoId: string) => {
    const mesa = mesasData?.find(m => m.id === mesaId);
    const consumo = mesa?.consumos?.find((c: any) => c.id === consumoId);
    if (consumo) {
      setConfirmarEliminarConsumo({
        mesaId,
        consumoId,
        nombre: consumo.nombreProducto,
        cantidad: consumo.cantidad,
        precioUnitario: consumo.precioUnitario,
        total: consumo.total,
        idProducto: consumo.idProducto,
        numeroMesa: mesa?.numeroMesa,
        tipoDeMesa: mesa?.tipoDeMesa,
      });
    }
  }, [mesasData]);

  const calcularCostoAlquilerReal = useCallback((mesa: Mesa) => {
    return (costos[mesa.id] || (mesa.estado === 'ocupado' && !mesa.alquilerPagado ? (mesa.montoACobrar || 0) : 0)) + 
      (mesa.ajustesDeTiempo || []).filter((a: any) => !a.pagado).reduce((acc: number, a: any) => acc + a.monto, 0);
  }, [costos]);

  const obtenerTarifaMesa = useCallback((tarifaId?: string) => {
    return tarifasData?.find(t => t.id === tarifaId);
  }, [tarifasData]);

  return {
    sucursalId,
    generalesRef,
    isLoading: isLoadingMesas || isLoadingTarifas || isLoadingClientes || isLoadingProductos || isLoadingSucursal,
    mesasData,
    tarifasData,
    clientesData,
    productosData,
    clientesOptions,
    productosOptions,
    costos,
    serverOffset,
    selectedTable,
    setSelectedTable,
    tableToCharge,
    setTableToCharge,
    mesaParaConsumo,
    setMesaParaConsumo,
    mesaParaTraslado,
    setMesaParaTraslado,
    mesaParaAjuste,
    setMesaParaAjuste,
    isStartModalOpen,
    setIsStartModalOpen,
    isCobroModalOpen,
    setIsCobroModalOpen,
    isConsumoModalOpen,
    setIsConsumoModalOpen,
    isTrasladoModalOpen,
    setIsTrasladoModalOpen,
    isAjusteTiempoModalOpen,
    setIsAjusteTiempoModalOpen,
    alertaCancelarDivisionAbierta,
    setAlertaCancelarDivisionAbierta,
    confirmarEliminarConsumo,
    setConfirmarEliminarConsumo,
    modoJuego,
    setModoJuego,
    selectedInterval,
    setSelectedInterval,
    pagadoDeContado,
    setPagadoDeContado,
    numControles,
    setNumControles,
    tiempoJugadoFinal,
    editableCost,
    setEditableCost,
    consumoFijoModal,
    isEditingCost,
    setIsEditingCost,
    activeTab,
    setActiveTab,
    numeroDePartes,
    setNumeroDePartes,
    currentDivisionStep,
    setCurrentDivisionStep,
    divisionClienteId,
    setDivisionClienteId,
    totalAPagarModal,
    montoPorParte,
    carritoConsumoTemporal,
    setCarritoConsumoTemporal,
    isConsumoManual,
    setIsConsumoManual,
    cantidadConsumo,
    setCantidadConsumo,
    descripcionConsumoManual,
    setDescripcionConsumoManual,
    precioConsumoManual,
    setPrecioConsumoManual,
    productoConsumoId,
    setProductoConsumoId,
    productoConsumoSeleccionado,
    preparacionSeleccionada,
    setPreparacionSeleccionada,
    mesaDestinoId,
    setMesaDestinoId,
    tiempoParaAnadir,
    setTiempoParaAnadir,
    pagarTiempoAnadido,
    setPagarTiempoAnadido,
    processingCharge,
    processingConsumption,
    processingTraslado,
    processingAjuste,
    procesandoDivision,
    procesandoAnadir,
    procesandoEliminacionConsumo,
    clienteInputRef,
    cantidadConsumoInputRef,
    productoInputRef,
    preparacionesContainerRef,
    anadirConsumoButtonRef,
    itemManualCantRef,
    itemManualDescRef,
    itemManualPrecioRef,
    itemManualAddBtnRef,
    filtroCuentasInputRef,
    abonoInputRef,
    lastTapTimeRef,
    lastTapIdRef,
    carritoOriginalRef,
    setHasSavedConsumo,
    handleOpenModal,
    handleStartTime,
    handleFinalizarSinCosto,
    handleProcederConPago,
    handlePagoAnticipado,
    handlePasarACuenta,
    handleAddConsumo,
    handleRemoveFromTempCart,
    handleCancelConsumo,
    handleSaveConsumo,
    handleConfirmarTraslado,
    handleConfirmarAjusteTiempo,
    handlePagoDivisionLocal,
    handleProductoEnter,
    handleConfirmarEliminarConsumoPersistido,
    handleOpenConsumo,
    handleOpenTraslado,
    handleOpenAjusteTiempo,
    handleOpenEliminarConsumo,
    calcularCostoAlquilerReal,
    obtenerTarifaMesa,
  };
}

export type UseMesasReturn = ReturnType<typeof useMesas>;
