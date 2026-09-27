
'use client';
/**
 * @fileoverview Página para realizar el cierre de caja, mostrando historiales de forma integrada.
 */
import * as React from 'react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Timestamp, doc, collection, query, where, getDocs, Firestore, onSnapshot, orderBy, collectionGroup } from 'firebase/firestore';
import type { Generales, Venta, DetalleVenta, HistorialTragamonedas, CierreCaja as CierreCajaTipo, Pago } from '@/lib/tipos';
import { useToast } from '@/hooks/use-toast';
import { realizarCierreDeCaja, inicializarCaja } from '@/lib/firebase/servicios/cierre-caja';
import { sincronizarContadorCredito } from '@/lib/firebase/servicios/ventas';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertTriangle, History, Archive, Coins, CreditCard, X, Loader2, Search, Trophy, Play, CheckCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { InputNumero } from '@/components/ui/input-numero';
import { Loader } from '@/components/ui/loader';
import { useFirebase, useDoc, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter, useCollection } from '@/firebase';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSucursal } from '@/hooks/use-sucursal';

// --- Tipos ---
interface Cuenta {
  id: string;
  nombre: string;
  saldo: number;
  tipo: 'Efectivo' | 'Bancaria';
  idCuenta: number;
}
type VistaHistorial = null | 'efectivo' | 'tarjeta' | 'monedas';

const toDate = (fecha: any): Date => {
  if (fecha instanceof Timestamp) return fecha.toDate();
  if (fecha instanceof Date) return fecha;
  if (typeof fecha === 'string') {
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(0);
};

// --- Componentes de Historial ---
const HistorialPagosEfectivo = ({ fechaInicioPeriodo, onCerrar, sucursalId }: { fechaInicioPeriodo: Date, onCerrar: () => void, sucursalId: string }) => {
  const { firestore } = useFirebase();
  const [pagosEfectivo, setPagosEfectivo] = useState<Pago[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firestore) return;
    setCargando(true);
    const q = query(
      collection(firestore, `sucursales/${sucursalId}/pagos`),
      where('fecha', '>=', fechaInicioPeriodo),
      where('metodoPago', '==', 'Efectivo')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const pagosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pago));
        const pagosFiltrados = pagosData.map(pago => ({
            ...pago,
            itemsSaldados: pago.itemsSaldados.filter(item => !item.esVirtual)
        })).filter(pago => pago.itemsSaldados.length > 0);

        setPagosEfectivo(pagosFiltrados.sort((a,b) => toDate(b.fecha).getTime() - toDate(a.fecha).getTime()));
        setCargando(false);
    }, err => {
      console.error("Error cargando historial de efectivo:", err);
      setError("No se pudo cargar el historial.");
      setCargando(false);
    });
    return () => unsubscribe();
  }, [firestore, fechaInicioPeriodo, sucursalId]);

  const totalGeneralEfectivo = useMemo(() => pagosEfectivo.reduce((sum, pago) => sum + pago.itemsSaldados.reduce((itemSum, item) => itemSum + item.montoAplicado, 0), 0), [pagosEfectivo]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Coins className="h-6 w-6 text-green-600"/>
              Historial de Efectivo (Consumo)
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Total en período: <span className="font-bold text-green-600">Q{totalGeneralEfectivo.toFixed(2)}</span>
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onCerrar}><X className="h-5 w-5"/></Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[55vh]">
          {cargando ? <div className="flex justify-center items-center h-48"><Loader/></div> : 
           error ? <p className="text-destructive text-center">{error}</p> :
           pagosEfectivo.length === 0 ? <p className="text-muted-foreground text-center h-48 flex items-center justify-center">No hay pagos en efectivo en este período.</p> :
           (
             <Accordion type="single" collapsible className="w-full space-y-3">
               {pagosEfectivo.map(pago => (
                 <AccordionItem value={pago.id} key={pago.id} className="border rounded-lg overflow-hidden">
                   <AccordionTrigger className="p-4 hover:no-underline text-sm bg-card-foreground/5">
                      <div className="grid grid-cols-[1fr,auto] sm:grid-cols-[auto,1fr,auto] gap-x-3 items-center w-full text-left">
                        <div className="hidden sm:block bg-green-500/10 text-green-600 p-2 rounded-full row-span-2">
                          <Coins className="h-5 w-5"/>
                        </div>
                        <p className="font-bold truncate">{pago.clienteNombre}</p>
                        <p className="font-bold text-green-600 text-lg text-right">Q{pago.itemsSaldados.reduce((acc, item) => acc + item.montoAplicado, 0).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Pago #{pago.idPago} / Venta #{pago.idVenta}</p>
                        <p className="text-xs text-muted-foreground text-right">{format(toDate(pago.fecha), "dd MMM, hh:mm a", { locale: es })}</p>
                      </div>
                   </AccordionTrigger>
                   <AccordionContent className="p-4">
                     <h4 className="font-semibold text-xs mb-2 uppercase tracking-wider text-muted-foreground">Artículos Pagados</h4>
                     <div className="divide-y">
                       {pago.itemsSaldados.map((item, index) => (
                         <div key={index} className="flex justify-between items-center py-2 text-sm">
                           <div>
                             <p className="font-medium">
                                {item.cantidad ? `${item.cantidad}x ` : ''}{item.nombreProducto}
                             </p>
                           </div>
                           <p className="font-semibold text-green-600">+ Q{item.montoAplicado.toFixed(2)}</p>
                         </div>
                       ))}
                     </div>
                   </AccordionContent>
                 </AccordionItem>
               ))}
             </Accordion>
           )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

const HistorialPagosTarjeta = ({ fechaInicioPeriodo, onCerrar, sucursalId }: { fechaInicioPeriodo: Date, onCerrar: () => void, sucursalId: string }) => {
  const { firestore } = useFirebase();
  const [pagosTarjeta, setPagosTarjeta] = useState<Pago[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firestore) return;
    setCargando(true);
    const q = query(
      collection(firestore, `sucursales/${sucursalId}/pagos`),
      where('fecha', '>=', fechaInicioPeriodo),
      where('metodoPago', '==', 'Tarjeta')
    );
     const unsubscribe = onSnapshot(q, (snapshot) => {
        const pagosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pago));
        const pagosFiltrados = pagosData.map(pago => ({
            ...pago,
            itemsSaldados: pago.itemsSaldados.filter(item => !item.esVirtual)
        })).filter(pago => pago.itemsSaldados.length > 0);
        setPagosTarjeta(pagosFiltrados.sort((a,b) => toDate(b.fecha).getTime() - toDate(a.fecha).getTime()));
        setCargando(false);
    }, err => {
      console.error("Error cargando historial de tarjeta:", err);
      setError("No se pudo cargar el historial.");
      setCargando(false);
    });
    return () => unsubscribe();
  }, [firestore, fechaInicioPeriodo, sucursalId]);
  
  const totalGeneralTarjeta = useMemo(() => pagosTarjeta.reduce((sum, pago) => sum + pago.itemsSaldados.reduce((itemSum, item) => itemSum + item.montoAplicado, 0), 0), [pagosTarjeta]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-blue-600"/>
              Historial de Tarjeta (Consumo)
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Total en período: <span className="font-bold text-blue-600">Q{totalGeneralTarjeta.toFixed(2)}</span>
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onCerrar}><X className="h-5 w-5"/></Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[55vh]">
          {cargando ? <div className="flex justify-center items-center h-48"><Loader/></div> : 
           error ? <p className="text-destructive text-center">{error}</p> :
           pagosTarjeta.length === 0 ? <p className="text-muted-foreground text-center h-48 flex items-center justify-center">No hay pagos con tarjeta en este período.</p> :
           (
             <Accordion type="single" collapsible className="w-full space-y-3">
               {pagosTarjeta.map(pago => (
                 <AccordionItem value={pago.id} key={pago.id} className="border rounded-lg overflow-hidden">
                   <AccordionTrigger className="p-4 hover:no-underline text-sm bg-card-foreground/5">
                      <div className="grid grid-cols-[1fr,auto] sm:grid-cols-[auto,1fr,auto] gap-x-3 items-center w-full text-left">
                        <div className="hidden sm:block bg-blue-500/10 text-blue-600 p-2 rounded-full row-span-2">
                          <CreditCard className="h-5 w-5"/>
                        </div>
                        <p className="font-bold truncate">{pago.clienteNombre}</p>
                        <p className="font-bold text-blue-600 text-lg text-right">Q{pago.itemsSaldados.reduce((acc, item) => acc + item.montoAplicado, 0).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Pago #{pago.idPago} / Venta #{pago.idVenta}</p>
                        <p className="text-xs text-muted-foreground text-right">{format(toDate(pago.fecha), "dd MMM, hh:mm a", { locale: es })}</p>
                      </div>
                   </AccordionTrigger>
                   <AccordionContent className="p-4">
                     <h4 className="font-semibold text-xs mb-2 uppercase tracking-wider text-muted-foreground">Artículos Pagados</h4>
                     <div className="divide-y">
                       {pago.itemsSaldados.map((item, index) => (
                         <div key={index} className="flex justify-between items-center py-2 text-sm">
                           <div>
                             <p className="font-medium">
                                {item.cantidad ? `${item.cantidad}x ` : ''}{item.nombreProducto}
                             </p>
                           </div>
                           <p className="font-semibold text-blue-600">+ Q{item.montoAplicado.toFixed(2)}</p>
                         </div>
                       ))}
                     </div>
                   </AccordionContent>
                 </AccordionItem>
               ))}
             </Accordion>
           )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

const HistorialMonedas = ({ fechaInicioPeriodo, onCerrar, sucursalId }: { fechaInicioPeriodo: Date, onCerrar: () => void, sucursalId: string }) => {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  
  const [ventasMonedas, setVentasMonedas] = useState<Pago[]>([]);
  const [pagosPremios, setPagosPremios] = useState<HistorialTragamonedas[]>([]);
  const [cargandoPagos, setCargandoPagos] = useState(true);
  const [cargandoPremios, setCargandoPremios] = useState(true);
  const [errorPremios, setErrorPremios] = useState<string | null>(null);

  useEffect(() => {
    if (!firestore) return;
    setCargandoPagos(true);
    const qPagos = query(collection(firestore, `sucursales/${sucursalId}/pagos`), where('fecha', '>=', fechaInicioPeriodo));
    const unsubPagos = onSnapshot(qPagos, (snapshot) => {
        const pagosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pago));
        const pagosMonedasFiltrados = pagosData
            .map(pago => ({
                ...pago,
                itemsSaldados: pago.itemsSaldados.filter(item => item.esVirtual)
            }))
            .filter(pago => pago.itemsSaldados.length > 0);
        setVentasMonedas(pagosMonedasFiltrados);
        setCargandoPagos(false);
    }, err => {
      console.error("Error cargando historial de monedas (pagos):", err);
      setCargandoPagos(false);
    });
    return () => unsubPagos();
  }, [firestore, fechaInicioPeriodo, sucursalId]);

  useEffect(() => {
    if (!firestore) return;
    setCargandoPremios(true);
    setErrorPremios(null);
    const qPremios = query(collectionGroup(firestore, 'historial'), where('sucursalId', '==', sucursalId), where('fecha', '>=', fechaInicioPeriodo), where('tipo', 'in', ['premio_total', 'premio_parcial']));
    const unsubPremios = onSnapshot(qPremios, (snapshot) => {
        const premiosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HistorialTragamonedas));
        setPagosPremios(premiosData);
        setCargandoPremios(false);
    }, err => {
      console.error("Error cargando historial de premios:", err);
      setErrorPremios("No se pudieron cargar los premios.");
      if (err.code === 'failed-precondition') {
          toast({
              title: "Error de Permisos",
              description: "No se pudo cargar el historial de premios. Es posible que falte un índice en Firestore. Revisa la consola para más detalles.",
              variant: "destructive",
          });
      }
      setCargandoPremios(false);
    });
    return () => unsubPremios();
  }, [firestore, fechaInicioPeriodo, toast, sucursalId]);

  const { historialCombinado, balanceTotal } = useMemo(() => {
    const ventas = ventasMonedas.map(pago => ({
      id: `pago-${pago.id}`,
      fecha: pago.fecha,
      tipo: 'venta_moneda' as const,
      monto: pago.itemsSaldados.reduce((sum, item) => sum + item.montoAplicado, 0),
      data: pago,
    }));
    const premios = pagosPremios.map(premio => ({
      id: `premio-${premio.id}`,
      fecha: premio.fecha,
      tipo: 'pago_premio' as const,
      monto: premio.monto,
      data: premio,
    }));

    const historial = [...ventas, ...premios].sort((a, b) => toDate(b.fecha).getTime() - toDate(a.fecha).getTime());
    const balance = historial.reduce((sum, item) => {
      return item.tipo === 'venta_moneda' ? sum + item.monto : sum - item.monto;
    }, 0);

    return { historialCombinado: historial, balanceTotal: balance };
  }, [ventasMonedas, pagosPremios]);

  const cargando = cargandoPagos || cargandoPremios;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-xl font-semibold flex items-center gap-2">
                            <Coins className="h-6 w-6 text-amber-500"/>
                            Historial de Venta de Monedas
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                            Balance neto del período: <span className="font-bold text-amber-500">Q{balanceTotal.toFixed(2)}</span>
                        </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onCerrar}><X className="h-5 w-5"/></Button>
                </div>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[55vh]">
                    {cargando ? <div className="flex justify-center items-center h-48"><Loader/></div> : 
                    errorPremios ? <p className="text-destructive text-center">{errorPremios}</p> :
                    historialCombinado.length === 0 ? <p className="text-muted-foreground text-center h-48 flex items-center justify-center">No hay movimientos de monedas en este período.</p> :
                    (
                        <Accordion type="single" collapsible className="w-full space-y-3">
                           {historialCombinado.map(item => {
                               if (item.tipo === 'venta_moneda') {
                                    const pago = item.data as Pago;
                                    return (
                                        <AccordionItem value={item.id} key={item.id} className="border rounded-lg overflow-hidden">
                                            <AccordionTrigger className="p-4 hover:no-underline text-sm bg-card-foreground/5">
                                              <div className="grid grid-cols-[1fr,auto] sm:grid-cols-[auto,1fr,auto] gap-x-3 items-center w-full text-left">
                                                <div className={`hidden sm:block p-2 rounded-full row-span-2 ${pago.metodoPago === 'Efectivo' ? 'bg-green-500/10 text-green-600' : 'bg-blue-500/10 text-blue-600'}`}>
                                                  {pago.metodoPago === 'Efectivo' ? <Coins className="h-5 w-5"/> : <CreditCard className="h-5 w-5" />}
                                                </div>
                                                <p className="font-bold truncate">{pago.clienteNombre}</p>
                                                <p className="font-bold text-amber-500 text-lg text-right">+ Q{item.monto.toFixed(2)}</p>
                                                <p className="text-xs text-muted-foreground">Pago #{pago.idPago} / Venta #{pago.idVenta}</p>
                                                <p className="text-xs text-muted-foreground text-right">{format(toDate(pago.fecha), "dd MMM, hh:mm a", { locale: es })}</p>
                                              </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="p-4">
                                            <h4 className="font-semibold text-xs mb-2 uppercase tracking-wider text-muted-foreground">Ítems Virtuales Pagados</h4>
                                            <div className="divide-y">
                                                {pago.itemsSaldados.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center py-2 text-sm">
                                                    <div>
                                                    <p className="font-medium">
                                                        {item.cantidad ? `${item.cantidad}x ` : ''}{item.nombreProducto}
                                                    </p>
                                                    </div>
                                                    <p className="font-semibold text-amber-600">+ Q{item.montoAplicado.toFixed(2)}</p>
                                                </div>
                                                ))}
                                            </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    )
                               } else if (item.tipo === 'pago_premio') {
                                    const premio = item.data as HistorialTragamonedas;
                                    return (
                                        <div key={item.id} className="border rounded-lg overflow-hidden p-4 bg-card-foreground/5">
                                            <div className="grid grid-cols-[1fr,auto] sm:grid-cols-[auto,1fr,auto] gap-x-3 items-center w-full text-left">
                                                <div className="hidden sm:block bg-red-500/10 text-red-600 p-2 rounded-full row-span-2">
                                                    <Trophy className="h-5 w-5"/>
                                                </div>
                                                <p className="font-bold truncate text-sm">Pago de Premio</p>
                                                <p className="font-bold text-destructive text-lg text-right">- Q{item.monto.toFixed(2)}</p>
                                                <p className="text-xs text-muted-foreground truncate">{premio.descripcion}</p>
                                                <p className="text-xs text-muted-foreground text-right">{format(toDate(item.fecha), "dd MMM, hh:mm a", { locale: es })}</p>
                                            </div>
                                        </div>
                                    )
                               }
                               return null;
                           })}
                         </Accordion>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
};


// --- Componente Principal ---
export default function PaginaCierreCaja() {
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
    const efectivoFinalInputRef = useRef<HTMLInputElement>(null);

    // --- LECTURA DE DATOS DE FIRESTORE ---
    const generalesRef = useMemoFirebase(() => 
        firestore && sucursalId ? doc(firestore, `sucursales/${sucursalId}/generales/actual`) : null
    , [firestore, sucursalId]);
    const { data: estadoCaja, isLoading: cargandoContext, error } = useDoc<Generales>(generalesRef);
    
    const cuentasQuery = useMemoFirebase(() => 
        firestore && sucursalId ? query(collection(firestore, `sucursales/${sucursalId}/cuentas`), orderBy('nombre')) : null
    , [firestore, sucursalId]);
    const { data: cuentasData } = useCollection<Cuenta>(cuentasQuery);

    const ventasPendientesQuery = useMemoFirebase(() => 
        firestore && sucursalId ? query(
            collection(firestore, `sucursales/${sucursalId}/ventas`),
            where('estado', '==', 'Pendiente de pago')
        ) : null
    , [firestore, sucursalId]);
    const { data: ventasPendientesData, isLoading: isLoadingVentas } = useCollection<Venta>(ventasPendientesQuery);

    // --- ESTADOS LOCALES ---
    const [historialVisible, setHistorialVisible] = useState<VistaHistorial>(null);
    const [procesandoCierre, setProcesandoCierre] = useState(false);
    const [alertaAbierta, setAlertaAbierta] = useState(false);
    const [cuentaDestinoId, setCuentaDestinoId] = useState('');
    const [efectivoFinalContado, setEfectivoFinalContado] = useState<number | ''>('');
    const [cajaSiguienteTurno, setCajaSiguienteTurno] = useState<number | ''>('');
    const [observaciones, setObservaciones] = useState('');
    
    // Estados para Inicialización de Sucursal Nueva
    const [inicializando, setInicializando] = useState(false);
    const [fondoEfectivoInit, setFondoEfectivoInit] = useState<number | ''>(0);
    const [existenciaMonedasInit, setExistenciaMonedasInit] = useState<number | ''>(0);

    // --- DATOS DERIVADOS ---
    const netoMonedasPeriodo = estadoCaja?.totalVentasMonedas || 0;
    const totalVentasTarjeta = estadoCaja?.totalVentasTarjeta || 0;
    const totalMonedasTarjeta = estadoCaja?.totalMonedasTarjeta || 0;
    const totalPagosTarjeta = totalVentasTarjeta + totalMonedasTarjeta;
    const efectivoEnCaja = (estadoCaja?.efectivoInicial || 0) + (estadoCaja?.totalMesas || 0) + (estadoCaja?.totalEfectivo || 0);
    
    const cuentasPendientes = ventasPendientesData || [];
    
    const fechaInicioPeriodo = useMemo(() => {
        if (!estadoCaja?.fechaInicioPeriodo) return null;
        const date = toDate(estadoCaja.fechaInicioPeriodo);
        return isNaN(date.getTime()) ? null : date;
    }, [estadoCaja?.fechaInicioPeriodo]);

    useEffect(() => {
        if (!firestore || !sucursalId || cargandoContext) return;
        sincronizarContadorCredito(firestore, sucursalId).catch(console.error);
    }, [firestore, sucursalId, cargandoContext]);

    useEffect(() => {
        if (cuentasData && cuentasData.length > 0 && !cuentaDestinoId) {
            setCuentaDestinoId(cuentasData[0].id);
        }
    }, [cuentasData, cuentaDestinoId]);

    useEffect(() => {
        if (efectivoFinalInputRef.current) {
            efectivoFinalInputRef.current.focus();
        }
    }, []);
    
    const diferencia = useMemo(() => {
        if (typeof efectivoFinalContado !== 'number') return 0;
        return efectivoFinalContado - efectivoEnCaja;
    }, [efectivoFinalContado, efectivoEnCaja]);

    const retiro = useMemo(() => {
        if (typeof efectivoFinalContado !== 'number' || typeof cajaSiguienteTurno !== 'number') return 0;
        return efectivoFinalContado - cajaSiguienteTurno;
    }, [efectivoFinalContado, cajaSiguienteTurno]);

    const manejarInicializarCaja = async () => {
        if (!firestore || !sucursalId) return;
        setInicializando(true);
        try {
            await inicializarCaja(firestore, sucursalId, {
                efectivoInicial: Number(fondoEfectivoInit) || 0,
                monedasIniciales: Number(existenciaMonedasInit) || 0
            });
            toast({ title: "Caja Inicializada", description: "El turno de caja ha sido abierto exitosamente." });
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        } finally {
            setInicializando(false);
        }
    };

    const manejarCierre = async () => {
        setProcesandoCierre(true);
        if (!firestore || !sucursalId || !estadoCaja || !fechaInicioPeriodo || typeof efectivoFinalContado !== 'number' || typeof cajaSiguienteTurno !== 'number' || !cuentaDestinoId) {
            toast({ title: 'Error', description: 'Faltan datos para realizar el cierre.', variant: 'destructive'});
            setProcesandoCierre(false);
            return;
        }

        try {
            await realizarCierreDeCaja(firestore, sucursalId, {
                inicioDelPeriodo: Timestamp.fromDate(fechaInicioPeriodo),
                totalIngresoMesas: estadoCaja.totalMesas,
                totalVentaMonedas: estadoCaja.totalVentasMonedas,
                efectivoInicial: estadoCaja.efectivoInicial,
                pagosTarjeta: totalPagosTarjeta, 
                efectivoEsperado: efectivoEnCaja,
                efectivoFinalContado,
                diferencia: diferencia,
                cajaSiguienteTurno: cajaSiguienteTurno,
                observaciones,
                cuentaDestinoId: cuentaDestinoId
            });
            
            toast({ title: 'Éxito', description: 'El cierre de caja se realizó correctamente. Se ha iniciado un nuevo período.' });
            setEfectivoFinalContado('');
            setCajaSiguienteTurno('');
            setObservaciones('');
            setAlertaAbierta(false);

        } catch(error) {
            console.error("Error al realizar cierre:", error);
            toast({ title: 'Error en Cierre', description: (error as Error).message, variant: 'destructive' });
        } finally {
            setProcesandoCierre(false);
        }
    };

    const toggleHistorial = (vista: VistaHistorial) => {
        if (!fechaInicioPeriodo) {
            toast({ title: 'Aviso', description: 'No hay período de caja activo.' });
            return;
        }
        setHistorialVisible(current => (current === vista ? null : vista));
    };
    
    if (cargandoContext || isLoadingSucursal || isLoadingVentas) return <div className="flex justify-center items-center h-64"><Loader /></div>;
    
    // VISTA DE INICIALIZACIÓN (Sucursal Nueva)
    if (!estadoCaja || !fechaInicioPeriodo) {
         return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center font-body animate-in fade-in duration-500">
                <Card className="max-w-md w-full border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="bg-primary text-white p-8 pb-10">
                        <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                            <Play className="h-8 w-8 fill-current" />
                        </div>
                        <CardTitle className="text-2xl font-black font-headline tracking-tight">Apertura de Sucursal</CardTitle>
                        <CardDescription className="text-white/70 text-xs font-medium uppercase tracking-widest mt-2">Configuración de inicio de caja</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6 -mt-6 bg-background rounded-t-[2.5rem]">
                        <div className="space-y-4">
                            <div className="space-y-1.5 text-left">
                                <Label htmlFor="init-fondo" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-4">Fondo de Caja (Efectivo)</Label>
                                <InputNumero 
                                    id="init-fondo"
                                    value={fondoEfectivoInit}
                                    onChange={e => setFondoEfectivoInit(Number(e.target.value))}
                                    placeholder="0.00"
                                    className="h-12 rounded-full text-center text-lg font-bold border-muted-foreground/20 bg-muted/5"
                                />
                            </div>
                            <div className="space-y-1.5 text-left">
                                <Label htmlFor="init-monedas" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-4">Existencia de Monedas</Label>
                                <InputNumero 
                                    id="init-monedas"
                                    value={existenciaMonedasInit}
                                    onChange={e => setExistenciaMonedasInit(Number(e.target.value))}
                                    placeholder="0"
                                    className="h-12 rounded-full text-center text-lg font-bold border-muted-foreground/20 bg-muted/5"
                                />
                            </div>
                        </div>
                        <Button 
                            className="w-full h-12 rounded-full font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                            onClick={manejarInicializarCaja}
                            disabled={inicializando}
                        >
                            {inicializando ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                            Abrir Turno Ahora
                        </Button>
                    </CardContent>
                </Card>
                <div className="mt-8 flex items-center gap-2 text-muted-foreground">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <p className="text-[10px] font-bold uppercase tracking-tighter">Esto creará el registro base necesario para operar el sistema.</p>
                </div>
            </div>
        )
    }
    
    const hayOperacionesPendientes = cuentasPendientes.length > 0;
    
    return (
        <div className='space-y-6'>
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                <div className='w-full text-center sm:text-left'>
                  <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2">
                      <Archive className="h-6 w-6"/>Cierre de Caja
                  </h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">Cuadre de caja del turno actual y liquidación de ingresos.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Link href="/dashboard/cierre-caja/historial" className="flex-1 sm:flex-none">
                        <Button variant="outline" className="w-full">
                            <History className="mr-2 h-4 w-4" />
                            Historial
                        </Button>
                    </Link>
                </div>
            </div>

            {hayOperacionesPendientes && (
                <div className="bg-destructive text-destructive-foreground border-l-8 border-black/20 p-4 rounded-2xl shadow-xl animate-in slide-in-from-top duration-300" role="alert">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                            <AlertTriangle className="h-7 w-7 text-white"/>
                        </div>
                        <div className="flex-1">
                            <p className="font-black text-lg uppercase tracking-tight">Bloqueo: Acción Requerida</p>
                            <p className="text-sm font-medium opacity-90">Hay {cuentasPendientes.length} cuenta(s) pendiente(s) de cobro. No puedes cerrar caja hasta liquidarlas.</p>
                            <p className="text-sm mt-2 font-bold">
                                <Link href="/dashboard/ventas" className="underline decoration-2 underline-offset-4 hover:opacity-80 transition-opacity">
                                    Ir a Punto de Venta para liquidarlas →
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <Card className="p-6 col-span-1">
                    <h2 className="text-xl font-semibold flex items-center gap-2 mb-2"><span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>Conteo y Separación</h2>
                    {fechaInicioPeriodo && (<p className="text-xs text-muted-foreground mb-6">Período actual desde: {format(fechaInicioPeriodo, "dd 'de' MMMM, yyyy 'a las' hh:mm a", { locale: es })}</p>)}
                    <div className="space-y-6">
                       
                        <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-center border border-amber-300 dark:border-amber-700">
                            <div className="flex justify-center items-center gap-2">
                                <Label className="text-sm font-semibold text-amber-800 dark:text-amber-200">Total Venta Monedas</Label>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-amber-600" title="Ver historial de monedas" onClick={() => toggleHistorial('monedas')}><History className="h-4 w-4" /></Button>
                            </div>
                            <p className="text-4xl font-bold text-amber-900 dark:text-amber-300">Q{netoMonedasPeriodo.toFixed(2)}</p>
                        </div>
                        
                        {totalPagosTarjeta > 0 && (
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-center border border-blue-300 dark:border-blue-700">
                                <div className="flex justify-center items-center gap-2">
                                    <Label className="text-sm font-semibold text-blue-800 dark:text-amber-200">Total Pagado con Tarjeta</Label>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-600" title="Ver historial de pagos con tarjeta" onClick={() => toggleHistorial('tarjeta')}>
                                        <History className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-4xl font-bold text-blue-900 dark:text-blue-300">Q{totalPagosTarjeta.toFixed(2)}</p>
                                <div className="text-xs text-blue-700 dark:text-blue-200 mt-1">
                                    <span>Ventas: Q{totalVentasTarjeta.toFixed(2)}</span>
                                    <span className="mx-1">+</span>
                                    <span>Monedas: Q{totalMonedasTarjeta.toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        <div className="p-4 bg-muted/80 rounded-lg text-center border-dashed border-2 border-primary/50 space-y-3">
                            <div>
                                <div className="flex justify-center items-center gap-2">
                                <Label className="text-sm font-semibold">Total Efectivo Esperado</Label>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-primary/80" title="Ver historial de efectivo" onClick={() => toggleHistorial('efectivo')}><History className="h-4 w-4" /></Button>
                                </div>
                                <p className="text-4xl font-bold text-primary">Q{efectivoEnCaja.toFixed(2)}</p>
                            </div>
                            <div className="text-xs text-muted-foreground pt-2 border-t border-dashed">
                                <div className="flex justify-between px-4"><span>Efectivo Inicial:</span> <span className="font-medium">Q{(estadoCaja?.efectivoInicial || 0).toFixed(2)}</span></div>
                                <div className="flex justify-between px-4"><span>Alquiler Mesas:</span> <span className="font-medium">Q{(estadoCaja?.totalMesas || 0).toFixed(2)}</span></div>
                                <div className="flex justify-between px-4"><span>Total Ventas:</span> <span className="font-medium">Q{(estadoCaja?.totalEfectivo || 0).toFixed(2)}</span></div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="efectivo-final" className="text-base font-medium">Total Físico en Caja</Label>
                            <InputNumero ref={efectivoFinalInputRef} id="efectivo-final" placeholder="0" value={efectivoFinalContado} onChange={e => setEfectivoFinalContado(Number(e.target.value))} className="h-12 text-lg text-center" />
                        </div>

                        {typeof efectivoFinalContado === 'number' && efectivoFinalContado > 0 && (
                            <div className={`p-4 rounded-lg text-center ${diferencia === 0 ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                                <Label className={`text-sm font-semibold ${diferencia === 0 ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>Diferencia (Sobrante / Faltante)</Label>
                                <p className={`text-3xl font-bold ${diferencia === 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>Q{diferencia.toFixed(2)}</p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="p-6 col-span-1">
                    <h2 className="text-xl font-semibold flex items-center gap-2 mb-6"><span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>Cierre y Liquidación</h2>
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <Label htmlFor="caja-siguiente" className="text-base font-medium">Efectivo para el siguiente periodo</Label>
                            <InputNumero id="caja-siguiente" placeholder="0" value={cajaSiguienteTurno} onChange={e => setCajaSiguienteTurno(Number(e.target.value))} className="h-12 text-lg text-center" />
                        </div>
                        {typeof efectivoFinalContado === 'number' && typeof cajaSiguienteTurno === 'number' && (
                            <div className="p-4 rounded-lg bg-muted text-center">
                                <Label className="text-sm font-semibold">Total a Liquidar</Label>
                                <p className="text-3xl font-bold text-primary">Q{retiro.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">(Total Físico - Efectivo Siguiente)</p>
                            </div>
                        )}
                        <div className="space-y-1">
                            <Label htmlFor="cuenta-destino" className="text-base font-medium">Cuenta destino de la liquidación</Label>
                            <Select value={cuentaDestinoId} onValueChange={setCuentaDestinoId}>
                                <SelectTrigger className="h-12 text-sm"><SelectValue placeholder="Seleccione la cuenta destino..."/></SelectTrigger>
                                <SelectContent>{(cuentasData || []).map(c => (<SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="observaciones" className="text-base font-medium">Observaciones</Label>
                            <Textarea id="observaciones" value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Ej: Cierre de fin de semana..."/>
                        </div>
                        <Button className="w-full mt-6" size="lg" onClick={() => setAlertaAbierta(true)} disabled={typeof efectivoFinalContado !== 'number' || typeof cajaSiguienteTurno !== 'number' || hayOperacionesPendientes}>
                            Finalizar y Registrar Cierre
                        </Button>
                    </div>
                </Card>
            </div>
            
            <div className="mt-8">
              {historialVisible === 'efectivo' && fechaInicioPeriodo && sucursalId && <HistorialPagosEfectivo fechaInicioPeriodo={fechaInicioPeriodo} onCerrar={() => setHistorialVisible(null)} sucursalId={sucursalId} />}
              {historialVisible === 'tarjeta' && fechaInicioPeriodo && sucursalId && <HistorialPagosTarjeta fechaInicioPeriodo={fechaInicioPeriodo} onCerrar={() => setHistorialVisible(null)} sucursalId={sucursalId} />}
              {historialVisible === 'monedas' && fechaInicioPeriodo && sucursalId && <HistorialMonedas fechaInicioPeriodo={fechaInicioPeriodo} onCerrar={() => setHistorialVisible(null)} sucursalId={sucursalId} />}
            </div>

            <AlertDialog open={alertaAbierta} onOpenChange={setAlertaAbierta}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="h-6 w-6 text-amber-500"/>Confirmar Cierre de Caja</AlertDialogTitle>
                        <AlertDialogDescription>Estás a punto de finalizar el período actual. Esta acción guardará un registro histórico y reiniciará los totales para el siguiente turno. ¿Estás seguro?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={procesandoCierre}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={manejarCierre} disabled={procesandoCierre}>
                            {procesandoCierre && <Loader />}
                            Sí, realizar cierre
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
