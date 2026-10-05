
'use client';

import * as React from 'react';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { collection, doc, Timestamp, query, updateDoc, orderBy, getDocs, where, serverTimestamp } from 'firebase/firestore';
import { useFirebase, useUser, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { iniciarSesion, pasarACuenta, procesarVentaTiempoDeMesa, trasladarMesa, ajustarTiempoDefinido, procesarPagoDivision, eliminarConsumoMesa } from '@/lib/firebase/servicios/mesas';
import { guardarCliente, descontarStockTemporal, devolverStockTemporal, descontarStockVirtualTemporal, devolverStockVirtualTemporal, registrarAuditoria, registrarCacheUsuario } from '@/lib/firebase/servicios';
import { toDate, validarSucursal } from '@/lib/firebase/servicios/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2, LayoutGrid, ShoppingCart, Dices, AlertTriangle, Trash2, Gamepad2 } from 'lucide-react';
import Link from 'next/link';
import { useSucursal } from '@/hooks/use-sucursal';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader } from '@/components/ui/loader';

// Componentes modulares
import { IncomeSummary } from './_components/income-summary';
import { TableCard } from './_components/table-card';
import { StartSessionDialog } from './_components/start-session-dialog';
import { BillingDialog } from './_components/billing-dialog';
import { ConsumptionDialog } from './_components/consumption-dialog';
import { TransferDialog } from './_components/transfer-dialog';
import { TimeAdjustDialog } from './_components/time-adjust-dialog';

import type { Mesa, Tarifa, Producto, Preparacion } from '@/lib/tipos';

export default function PaginaMesas() {
  const { toast } = useToast();
  const iMobile = useIsMobile();
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

  // --- ESTADOS LÓGICA ---
  const [costos, setCostos] = useState<{[key: string]: number}>({});
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
  const [confirmarEliminarConsumo, setConfirmarEliminarConsumo] = useState<{ mesaId: string, consumoId: string, nombre: string } | null>(null);

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

  // EFECTO DE SEGURIDAD PARA DESBLOQUEAR EL BODY
  useEffect(() => {
    const anyModalOpen = isStartModalOpen || isCobroModalOpen || isConsumoModalOpen || 
                        isTrasladoModalOpen || isAjusteTiempoModalOpen || 
                        alertaCancelarDivisionAbierta || !!confirmarEliminarConsumo;
    
    if (!anyModalOpen) {
      document.body.style.pointerEvents = 'auto';
      document.body.style.overflow = 'auto';
    }
  }, [isStartModalOpen, isCobroModalOpen, isConsumoModalOpen, isTrasladoModalOpen, isAjusteTiempoModalOpen, alertaCancelarDivisionAbierta, confirmarEliminarConsumo]);

  // Sincronización del servidor optimizada para evitar saltos
  useEffect(() => {
    const syncTime = async () => {
      try {
        const samples = [];
        for(let i = 0; i < 3; i++) {
          const start = Date.now();
          const response = await fetch(`${window.location.origin}/api/time?t=${Date.now()}`, { 
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

  // --- CONSULTAS ---
  const mesasQuery = useMemoFirebase(() => (firestore && sucursalId) ? query(collection(firestore, `sucursales/${sucursalId}/mesas_de_billar`), orderBy('numeroMesa')) : null, [firestore, sucursalId]);
  const tarifasQuery = useMemoFirebase(() => (firestore && sucursalId) ? query(collection(firestore, `sucursales/${sucursalId}/tarifas`)) : null, [firestore, sucursalId]);
  const clientesQuery = useMemoFirebase(() => (firestore && sucursalId) ? query(collection(firestore, `sucursales/${sucursalId}/clientes`), orderBy('nombre')) : null, [firestore, sucursalId]);
  const productosQuery = useMemoFirebase(() => (firestore && sucursalId) ? query(collection(firestore, `sucursales/${sucursalId}/productos`), orderBy('nombre')) : null, [firestore, sucursalId]);
  const generalesRef = useMemoFirebase(() => firestore && sucursalId ? doc(firestore, `sucursales/${sucursalId}/generales/actual`) : null, [firestore, sucursalId]);

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

  // Memoized data
  const clientesOptions = useMemo(() => (clientesData || []).map((c: any) => ({ value: c.id, label: c.nombre })), [clientesData]);
  const productosOptions = useMemo(() => (productosData || []).map(p => ({ value: p.id, label: p.nombre, description: `Stock: ${p.existencia} - Q${p.precioVenta.toFixed(2)}` })), [productosData]);
  const productoConsumoSeleccionado = useMemo(() => productosData?.find(p => p.id === productoConsumoId), [productosData, productoConsumoId]);
  const totalAPagarModal = tableToCharge ? (Number(editableCost) || 0) + consumoFijoModal : 0;
  const montoPorParte = totalAPagarModal > 0 && numeroDePartes ? totalAPagarModal / numeroDePartes : 0;

  // --- LÓGICA DE COSTO ---
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
        const nuevosCostos: {[key: string]: number} = {};
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

  // --- HANDLERS ACCIONES ---
  const handleSaveConsumo = useCallback(async () => {
    if (!mesaParaConsumo || !firestore || !sucursalId || processingConsumption) return;
    setProcessingConsumption(true);
    try {
      await updateDoc(doc(firestore, `sucursales/${sucursalId}/mesas_de_billar`, mesaParaConsumo.id), { consumos: carritoConsumoTemporal });
      
      await registrarAuditoria(firestore, sucursalId, {
        usuarioId: user?.uid || 'desconocido',
        usuarioNombre: user?.displayName || user?.email || 'Usuario',
        usuarioEmail: user?.email || '',
        categoria: 'MESAS',
        accion: 'MESA_AGREGAR_CONSUMO',
        titulo: `Consumo actualizado Mesa #${mesaParaConsumo.numeroMesa}`,
        descripcion: `${carritoConsumoTemporal.length} consumos guardados en mesa`,
        detalles: {
          mesaId: mesaParaConsumo.id,
          numeroMesa: mesaParaConsumo.numeroMesa,
          totalConsumos: carritoConsumoTemporal.reduce((acc: number, c: any) => acc + (c.total || 0), 0),
          items: carritoConsumoTemporal.map((c: any) => ({ nombre: c.nombreProducto, cantidad: c.cantidad, total: c.total }))
        }
      });

      toast({ title: 'Éxito', description: 'Consumo guardado correctamente.' });
      setHasSavedConsumo(true);
      setIsConsumoModalOpen(false);
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: 'destructive' }); }
    finally { setProcessingConsumption(false); }
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

  const handleOpenModal = (table: Mesa, action: 'iniciar' | 'cobrar') => {
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
        setEditableCost(costoAlq + costoAjustes); setConsumoFijoModal(totalCons); setTableToCharge(table); setIsEditingCost(false); setIsCobroModalOpen(true);
    }
  };

  const handleStartTime = async () => {
    if (!selectedTable || !firestore || !user || !tarifasData || !sucursalId) return;
    try {
      const tarifaMesa = tarifasData.find(t => t.id === selectedTable.tarifaId);
      if (!tarifaMesa) throw new Error('Tarifa inválida.');
      await iniciarSesion({ firestore, sucursalId, usuarioId: user.uid, mesaId: selectedTable.id, numeroMesa: selectedTable.numeroMesa, modoJuego, pagadoDeContado: modoJuego === 'definido' ? pagadoDeContado : false, duracionDefinida: modoJuego === 'definido' ? selectedInterval : 0, tarifa: tarifaMesa as Tarifa, numControles: selectedTable.tipoDeMesa === 'Consola' ? numControles : 0, serverOffset: serverOffset || 0 });
      toast({ title: `${selectedTable.tipoDeMesa === 'Consola' ? 'consola' : 'mesa'} ${selectedTable.numeroMesa} iniciada` });
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    finally { setIsStartModalOpen(false); setSelectedTable(null); }
  };

  const handleFinalizarSinCosto = async () => {
    if (!tableToCharge || !firestore || !user || !sucursalId) return;
    setProcessingCharge(true);
    try {
        await procesarVentaTiempoDeMesa(firestore, sucursalId, tableToCharge, user.uid, 0, 'Efectivo', serverOffset || 0);
        toast({ title: "sesión finalizada", description: "registrada con valor Q0.00" });
        setIsCobroModalOpen(false); setTableToCharge(null); setNumeroDePartes(null); setCurrentDivisionStep(null);
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: 'destructive'}); }
    finally { setProcessingCharge(false); }
  };

  const handleProcederConPago = async (metodo: 'Efectivo' | 'Tarjeta') => {
    if (!tableToCharge || !firestore || !user || !sucursalId) return;
    setProcessingCharge(true);
    try {
        await procesarVentaTiempoDeMesa(firestore, sucursalId, tableToCharge, user.uid, Number(editableCost) || 0, metodo, serverOffset || 0);
        toast({ title: 'cobro realizado' });
        setIsCobroModalOpen(false); setTableToCharge(null); setNumeroDePartes(null); setCurrentDivisionStep(null);
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive"}); }
    finally { setProcessingCharge(false); }
  };

  const handlePasarACuenta = async (clienteId: string) => {
    if (!tableToCharge || !firestore || !user || !sucursalId) return;
    setProcessingCharge(true);
    try {
      await pasarACuenta(firestore, sucursalId, user.uid, tableToCharge, Number(editableCost) || 0, consumoFijoModal, clienteId, serverOffset || 0);
      toast({ title: 'éxito', description: 'añadido a cuenta.' });
      setIsCobroModalOpen(false); setTableToCharge(null); setNumeroDePartes(null); setCurrentDivisionStep(null);
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    finally { setProcessingCharge(false); }
  };

  const handleAddConsumo = async () => {
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
        setCarritoConsumoTemporal(prev => [...prev, n]); 
        setDescripcionConsumoManual(''); 
        setPrecioConsumoManual(''); 
        setCantidadConsumo(1);
        setTimeout(() => {
          itemManualCantRef.current?.focus();
          itemManualCantRef.current?.select();
        }, 0);
    } else {
        if (!productoConsumoSeleccionado || !cantidadConsumo || !firestore || !sucursalId) return;
        setProcesandoAnadir(true);
        try {
            let name = productoConsumoSeleccionado.nombre, price = productoConsumoSeleccionado.precioVenta, ing: any[] = [];
            if (productoConsumoSeleccionado.esVirtual) {
                await descontarStockVirtualTemporal(firestore, sucursalId, productoConsumoSeleccionado.id, Number(cantidadConsumo));
            } else {
                await descontarStockTemporal(firestore, sucursalId, productoConsumoSeleccionado.id, Number(cantidadConsumo));
            }
            if (preparacionSeleccionada && preparacionSeleccionada !== 'base' && 'preparaciones' in productoConsumoSeleccionado) { 
              name = `${productoConsumoSeleccionado.nombre} (${preparacionSeleccionada.nombre})`; 
              price = preparacionSeleccionada.precioVenta; 
              ing = preparacionSeleccionada.ingredientes || []; 
              for (const i of ing) {
                await descontarStockTemporal(firestore, sucursalId, i.productoId, i.cantidad * Number(cantidadConsumo));
              }
            }
            const n = { id: `${Date.now()}-${Math.random()}`, idProducto: productoConsumoSeleccionado.id, nombreProducto: name, cantidad: Number(cantidadConsumo), precioUnitario: price, total: Number(cantidadConsumo) * price, fechaAgregado: Timestamp.now(), esVirtual: !!productoConsumoSeleccionado.esVirtual, ingredientesConsumidos: ing };
            setCarritoConsumoTemporal(prev => [...prev, n]); 
            setProductoConsumoId(''); 
            setCantidadConsumo(1); 
            setPreparacionSeleccionada(null); 
            setTimeout(() => {
              cantidadConsumoInputRef.current?.focus();
              cantidadConsumoInputRef.current?.select();
            }, 0);
        } catch (e: any) {
          toast({ title: "Error de stock", description: e.message, variant: "destructive" });
        } finally { setProcesandoAnadir(false); }
    }
  };

  const handleRemoveFromTempCart = async (id: string) => {
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
  };

  const handleCancelConsumo = async () => {
    if (hasSavedConsumo || !sucursalId || !firestore) return;
    const additions = carritoConsumoTemporal.filter(t => !carritoOriginalRef.current.some(o => o.id === t.id));
    const deletions = carritoOriginalRef.current.filter(o => !carritoConsumoTemporal.some(t => t.id === o.id));
    for (const item of additions) {
      if (item.idProducto !== 'item-manual') {
        if (item.esVirtual) { await devolverStockVirtualTemporal(firestore, sucursalId, item.idProducto, item.cantidad); }
        else {
            await devolverStockTemporal(firestore, sucursalId, item.idProducto, item.cantidad);
            if (item.ingredientesConsumidos) { for (const ing of item.ingredientesConsumidos) { await devolverStockTemporal(firestore, sucursalId, ing.productoId, ing.cantidad * item.cantidad); } }
        }
      }
    }
    for (const item of deletions) {
      if (item.idProducto !== 'item-manual') {
        if (item.esVirtual) { await descontarStockVirtualTemporal(firestore, sucursalId, item.idProducto, item.cantidad); }
        else {
            await descontarStockTemporal(firestore, sucursalId, item.idProducto, item.cantidad);
            if (item.ingredientesConsumidos) { for (const ing of item.ingredientesConsumidos) { await descontarStockTemporal(firestore, sucursalId, ing.productoId, ing.cantidad * item.cantidad); } }
        }
      }
    }
  };

  const handleConfirmarTraslado = async () => {
    if (!mesaParaTraslado || !mesaDestinoId || !sucursalId) return;
    setProcessingTraslado(true);
    try {
      await trasladarMesa(firestore!, sucursalId, mesaParaTraslado.id, mesaDestinoId, user?.uid);
      toast({ title: "éxito", description: `${mesaParaTraslado.tipoDeMesa === 'Consola' ? 'consola' : 'mesa'} trasladada.` });
      setIsTrasladoModalOpen(false);
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setProcessingTraslado(false); }
  };

  const handleConfirmarAjusteTiempo = async () => {
    if (!mesaParaAjuste || !user || !firestore || !sucursalId) return;
    setProcessingAjuste(true);
    try {
        await ajustarTiempoDefinido(firestore, sucursalId, user.uid, mesaParaAjuste.id, tiempoParaAnadir, pagarTiempoAnadido, serverOffset || 0);
        toast({ title: "tiempo ajustado" });
        setIsAjusteTiempoModalOpen(false);
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setProcessingAjuste(false); }
  };

  const handlePagoDivisionLocal = async (metodo: 'Efectivo' | 'Tarjeta' | 'A Cuenta') => {
    if (!tableToCharge || !firestore || !user || numeroDePartes === null || currentDivisionStep === null || !sucursalId) return;
    let cli = null;
    if (metodo === 'A Cuenta') {
        const c = clientesData?.find((x: any) => x.id === divisionClienteId);
        if (!c) { toast({ title: "Error", description: "cliente no válido.", variant: "destructive" }); return; }
        cli = { clienteId: divisionClienteId, nombreCliente: c.nombre };
    }
    setProcesandoDivision(true);
    try {
        const p = `Parte ${currentDivisionStep + 1}/${numeroDePartes}`;
        await procesarPagoDivision(firestore, sucursalId, user.uid, tableToCharge.numeroMesa, montoPorParte, metodo, cli, p);
        const next = currentDivisionStep + 1;
        if (next >= numeroDePartes) {
            await updateDoc(doc(firestore, `sucursales/${sucursalId}/mesas_de_billar`, tableToCharge.id), { estado: 'disponible', horaInicio: null, modoJuego: null, tiempoDefinido: null, alquilerPagado: false, montoACobrar: null, ajustesDeTiempo: [], alarmaAck: false, numControles: 0, idVentaPrepagada: null });
            setIsCobroModalOpen(false); setTableToCharge(null); setNumeroDePartes(null); setCurrentDivisionStep(null);
        } else { setCurrentDivisionStep(next); setDivisionClienteId(''); }
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setProcesandoDivision(false); }
  };

  const handleProductoEnter = () => {
    if (productoConsumoSeleccionado && 'preparaciones' in productoConsumoSeleccionado && productoConsumoSeleccionado.preparaciones && productoConsumoSeleccionado.preparaciones.length > 0) {
      preparacionesContainerRef.current?.focus();
    } else {
      anadirConsumoButtonRef.current?.focus();
    }
  };

  const handleConfirmarEliminarConsumoPersistido = async () => {
    if (!confirmarEliminarConsumo || !firestore || !sucursalId) return;
    setProcesandoEliminacionConsumo(true);
    try {
        await eliminarConsumoMesa(firestore, sucursalId, confirmarEliminarConsumo.mesaId, confirmarEliminarConsumo.consumoId, user?.uid);
        toast({ title: "éxito", description: `${confirmarEliminarConsumo.nombre} eliminado.` });
        setConfirmarEliminarConsumo(null);
    } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
        setProcesandoEliminacionConsumo(false);
    }
  };

  if (isLoadingMesas || isLoadingTarifas || isLoadingClientes || isLoadingProductos || isLoadingSucursal) {
    return <div className="flex h-64 items-center justify-center"><Loader className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className='flex flex-col w-full text-center sm:text-left'>
                <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2 text-foreground">
                    <Gamepad2 className="h-6 w-6 text-primary"/> Sala de Juegos
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block font-body">Administra tus mesas de billar y consolas de videojuegos en tiempo real.</p>
            </div>
            <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
                <Button variant="outline" asChild className="rounded-full h-10 px-6 font-bold"><Link href="/dashboard/ventas" className='flex items-center gap-2'><ShoppingCart className="h-4 w-4" /> Ventas</Link></Button>
                <Button variant="outline" asChild className="rounded-full h-10 px-6 font-bold"><Link href="/dashboard/gestion-tragamonedas" className='flex items-center gap-2'><Dices className="h-4 w-4" /> Tragamonedas</Link></Button>
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 order-first grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {(mesasData || []).map((mesa) => (
              <TableCard 
                key={mesa.id} 
                mesa={mesa} 
                tarifaMesa={tarifasData?.find(t => t.id === mesa.tarifaId)}
                costoAlquilerReal={costos[mesa.id] || (mesa.estado === 'ocupado' && !mesa.alquilerPagado ? (mesa.montoACobrar || 0) : 0) + (mesa.ajustesDeTiempo || []).filter((a: any) => !a.pagado).reduce((acc: number, a: any) => acc + a.monto, 0)}
                onAction={handleOpenModal}
                onConsumo={(m) => { 
                  setMesaParaConsumo(m); 
                  setCarritoConsumoTemporal(m.consumos || []); 
                  carritoOriginalRef.current = [...(m.consumos || [])];
                  setProductoConsumoId(''); 
                  setIsConsumoManual(false); 
                  setHasSavedConsumo(false);
                  setIsConsumoModalOpen(true); 
                }}
                onTraslado={(m) => { setMesaParaTraslado(m); setMesaDestinoId(''); setIsTrasladoModalOpen(true); }}
                onAjusteTiempo={(m) => { setMesaParaAjuste(m); setTiempoParaAnadir(30); setPagarTiempoAnadido(false); setIsAjusteTiempoModalOpen(true); }}
                onEliminarConsumo={(mesaId, consumoId) => {
                    const m = mesasData?.find(x => x.id === mesaId);
                    const c = m?.consumos?.find((x: any) => x.id === consumoId);
                    if (m && c) setConfirmarEliminarConsumo({ mesaId, consumoId, nombre: c.nombreProducto });
                }}
                serverOffset={serverOffset || 0}
              />
            ))}
          </div>
          <div className="lg:col-span-1 order-last">
            <IncomeSummary generalesRef={generalesRef} sucursalId={sucursalId} />
          </div>
        </div>
      </div>

      <StartSessionDialog isOpen={isStartModalOpen} onOpenChange={setIsStartModalOpen} selectedTable={selectedTable} modoJuego={modoJuego} setModoJuego={setModoJuego} selectedInterval={selectedInterval} setSelectedInterval={setSelectedInterval} pagadoDeContado={pagadoDeContado} setPagadoDeContado={setPagadoDeContado} onStart={handleStartTime} numControles={numControles} setNumControles={setNumControles} />
      <BillingDialog isOpen={isCobroModalOpen} onOpenChange={(o) => { if (currentDivisionStep !== null && !o) setAlertaCancelarDivisionAbierta(true); else { setIsCobroModalOpen(o); if(!o) { setNumeroDePartes(null); setCurrentDivisionStep(null); } } }} tableToCharge={tableToCharge} tiempoJugadoFinal={tiempoJugadoFinal} totalAPagarModal={totalAPagarModal} editableCost={editableCost} setEditableCost={setEditableCost} consumoFijoModal={consumoFijoModal} isEditingCost={isEditingCost} setIsEditingCost={setIsEditingCost} activeTab={activeTab} setActiveTab={setActiveTab} processingCharge={processingCharge} onFinalizarSinCosto={handleFinalizarSinCosto} onProcederConPago={handleProcederConPago} onPasarACuenta={handlePasarACuenta} clientesOptions={clientesOptions} clienteInputRef={clienteInputRef} manejarCrearCliente={async (n) => { 
        const formattedName = n.trim().toLowerCase().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const c = await guardarCliente(firestore!, sucursalId!, { nombre: formattedName, tipoCliente: 'Cliente', idcliente: 0, consumoInterno: false }); 
        return c.id; 
      }} currentDivisionStep={currentDivisionStep} setCurrentDivisionStep={setCurrentDivisionStep} numeroDePartes={numeroDePartes} setNumeroDePartes={setNumeroDePartes} montoPorParte={montoPorParte} onPagoDivision={handlePagoDivisionLocal} divisionClienteId={divisionClienteId} setDivisionClienteId={setDivisionClienteId} procesandoDivision={procesandoDivision} setTableToCharge={setTableToCharge} />
      <ConsumptionDialog 
        isOpen={isConsumoModalOpen} 
        onOpenChange={(open) => {
          if (!open) handleCancelConsumo();
          setIsConsumoModalOpen(open);
        }} 
        mesaParaConsumo={mesaParaConsumo} 
        isConsumoManual={isConsumoManual} 
        setIsConsumoManual={setIsConsumoManual} 
        cantidadConsumo={cantidadConsumo} 
        setCantidadConsumo={setCantidadConsumo} 
        descripcionConsumoManual={descripcionConsumoManual} 
        setDescripcionConsumoManual={setDescripcionConsumoManual} 
        precioConsumoManual={precioConsumoManual} 
        setPrecioConsumoManual={setPrecioConsumoManual} 
        productoConsumoId={productoConsumoId} 
        setProductoConsumoId={setProductoConsumoId} 
        productosOptions={productosOptions} 
        isLoadingProductos={isLoadingProductos} 
        productoConsumoSeleccionado={productoConsumoSeleccionado} 
        preparacionSeleccionada={preparacionSeleccionada} 
        setPreparacionSeleccionada={setPreparacionSeleccionada} 
        carritoConsumoTemporal={carritoConsumoTemporal} 
        onAddConsumo={handleAddConsumo} 
        onRemoveFromTempCart={handleRemoveFromTempCart} 
        onSave={handleSaveConsumo} 
        processingConsumption={processingConsumption} 
        procesandoAnadir={procesandoAnadir} 
        cantidadConsumoInputRef={cantidadConsumoInputRef} 
        productoInputRef={productoInputRef} 
        itemManualCantRef={itemManualCantRef} 
        itemManualDescRef={itemManualDescRef} 
        itemManualPrecioRef={itemManualPrecioRef} 
        itemManualAddBtnRef={itemManualAddBtnRef} 
        anadirConsumoButtonRef={anadirConsumoButtonRef} 
        preparacionesContainerRef={preparacionesContainerRef} 
        onProductoEnter={handleProductoEnter} 
        isMobile={iMobile} 
      />
      <TransferDialog isOpen={isTrasladoModalOpen} onOpenChange={setIsTrasladoModalOpen} mesaParaTraslado={mesaParaTraslado} mesaDestinoId={mesaDestinoId} setMesaDestinoId={setMesaDestinoId} mesasDisponibles={(mesasData || []).filter(m => m.estado === 'disponible')} onConfirm={handleConfirmarTraslado} processingTraslado={processingTraslado} />
      <TimeAdjustDialog isOpen={isAjusteTiempoModalOpen} onOpenChange={setIsAjusteTiempoModalOpen} mesaParaAjuste={mesaParaAjuste} tiempoParaAnadir={tiempoParaAnadir} setTiempoParaAnadir={setTiempoParaAnadir} pagarTiempoAnadido={pagarTiempoAnadido} setPagarTiempoAnadido={setPagarTiempoAnadido} onConfirm={handleConfirmarAjusteTiempo} processingAjuste={processingAjuste} />
      
      <AlertDialog open={alertaCancelarDivisionAbierta} onOpenChange={setAlertaCancelarDivisionAbierta}>
        <AlertDialogContent className='rounded-3xl font-body'>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar división de cuenta?</AlertDialogTitle>
            <AlertDialogDescription>Si ya has procesado algún pago, este no se revertirá automáticamente. ¿Deseas cancelar?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='flex-col sm:flex-row gap-2'>
            <AlertDialogCancel className='rounded-full h-11 px-8'>No</AlertDialogCancel>
            <AlertDialogAction className='rounded-full h-11 px-10' onClick={() => { setNumeroDePartes(null); setCurrentDivisionStep(null); setIsCobroModalOpen(false); setAlertaCancelarDivisionAbierta(false); }}>Sí</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!confirmarEliminarConsumo} onOpenChange={(o) => !o && setConfirmarEliminarConsumo(null)}>
        <AlertDialogContent className="rounded-3xl font-body">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive font-headline">
              <AlertTriangle className="h-6 w-6" />
              ¿Eliminar consumo guardado?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar <span className="font-bold text-foreground">"{confirmarEliminarConsumo?.nombre}"</span> de esta estación. Se devolverá automáticamente el stock al inventario. ¿Deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full h-11 px-8">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
                onClick={handleConfirmarEliminarConsumoPersistido} 
                disabled={procesandoEliminacionConsumo}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full h-11 px-10 font-bold"
            >
                {procesandoEliminacionConsumo ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Confirmar eliminación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
