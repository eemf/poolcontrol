'use client';

import React, { useState, useMemo } from 'react';
import {
  collection,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { useSucursal } from '@/hooks/use-sucursal';
import type { TrasladoInterSucursal, Sucursal, Producto } from '@/lib/tipos';
import { useToast } from '@/hooks/use-toast';
import { cancelarTrasladoInterSucursal } from '@/lib/firebase/servicios/traslados';

import {
  Truck,
  ArrowLeftRight,
  PackageCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Eye,
  Undo2,
  Boxes,
  Loader2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { PermissionGuard } from '@/components/permission-guard';

import { NuevoTrasladoDialog } from './_components/nuevo-traslado-dialog';
import { RecibirTrasladoDialog } from './_components/recibir-traslado-dialog';
import { DetalleTrasladoDialog } from './_components/detalle-traslado-dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PaginaTraslados() {
  const { firestore } = useFirebase();
  const { user, profile } = useUser();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  const { toast } = useToast();

  // Estados de modales
  const [isNuevoOpen, setIsNuevoOpen] = useState(false);
  const [trasladoParaRecibir, setTrasladoParaRecibir] = useState<TrasladoInterSucursal | null>(null);
  const [trasladoParaDetalle, setTrasladoParaDetalle] = useState<TrasladoInterSucursal | null>(null);
  const [trasladoParaCancelar, setTrasladoParaCancelar] = useState<TrasladoInterSucursal | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [activeTab, setActiveTab] = useState<'pendientes' | 'en_transito' | 'todos'>('pendientes');

  // 1. Consultar todos los traslados donde participa esta sucursal (origen o destino)
  const trasladosQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(
      collection(firestore, 'traslados'),
      where('sucursalesIds', 'array-contains', sucursalId)
    );
  }, [firestore, sucursalId]);

  const { data: rawTraslados, isLoading: isLoadingTraslados } = useCollection<TrasladoInterSucursal>(trasladosQuery);

  // Ordenar en memoria por fecha de envío descendente
  const todosTraslados = useMemo(() => {
    if (!rawTraslados) return [];
    return [...rawTraslados].sort((a, b) => {
      const timeA = a.fechaEnvio?.toMillis ? a.fechaEnvio.toMillis() : 0;
      const timeB = b.fechaEnvio?.toMillis ? b.fechaEnvio.toMillis() : 0;
      return timeB - timeA;
    });
  }, [rawTraslados]);

  // 2. Consultar lista global de sucursales para mapeo y selección
  const sucursalesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'sucursales'), orderBy('idSucursal', 'asc'));
  }, [firestore]);
  const { data: sucursalesData } = useCollection<Sucursal>(sucursalesQuery);
  const sucursales = useMemo(() => sucursalesData || [], [sucursalesData]);

  const sucursalActiva = useMemo(() => {
    return sucursales.find((s) => s.id === sucursalId);
  }, [sucursales, sucursalId]);

  // 3. Consultar productos de la sucursal actual para creación de nuevo traslado
  const productosQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/productos`), orderBy('nombre', 'asc'));
  }, [firestore, sucursalId]);
  const { data: productosData } = useCollection<Producto>(productosQuery);
  const productosOrigen = useMemo(() => productosData || [], [productosData]);

  // 4. Consultar compras de la sucursal para obtener historial de precios de compra de los productos
  const comprasQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/compras`), orderBy('fecha', 'desc'));
  }, [firestore, sucursalId]);
  const { data: comprasData } = useCollection<Compra>(comprasQuery);
  const comprasOrigen = useMemo(() => comprasData || [], [comprasData]);

  // Categorización y métricas
  const pendientesRecibir = useMemo(() => {
    return todosTraslados.filter(
      (t) => t.sucursalDestinoId === sucursalId && t.estado === 'en_transito'
    );
  }, [todosTraslados, sucursalId]);

  const enviadosEnTransito = useMemo(() => {
    return todosTraslados.filter(
      (t) => t.sucursalOrigenId === sucursalId && t.estado === 'en_transito'
    );
  }, [todosTraslados, sucursalId]);

  // Lista según pestaña y búsqueda
  const listaFiltrada = useMemo(() => {
    let base = todosTraslados;
    if (activeTab === 'pendientes') {
      base = pendientesRecibir;
    } else if (activeTab === 'en_transito') {
      base = enviadosEnTransito;
    }

    if (!busqueda.trim()) return base;
    const q = busqueda.toLowerCase();
    return base.filter((t) => {
      const matchFolio = `#tr-${t.idTraslado}`.includes(q) || t.idTraslado.toString().includes(q);
      const matchOrigen = t.sucursalOrigenNombre?.toLowerCase().includes(q);
      const matchDestino = t.sucursalDestinoNombre?.toLowerCase().includes(q);
      const matchItem = t.items?.some((it) => it.nombreProducto?.toLowerCase().includes(q));
      return matchFolio || matchOrigen || matchDestino || matchItem;
    });
  }, [todosTraslados, activeTab, pendientesRecibir, enviadosEnTransito, busqueda]);

  // Acción cancelar traslado
  const handleConfirmarCancelacion = async () => {
    if (!firestore || !user || !trasladoParaCancelar) return;

    setIsCancelling(true);
    try {
      const usuarioNombre = profile?.nombre || user.displayName || user.email || 'Usuario';
      await cancelarTrasladoInterSucursal(
        firestore,
        trasladoParaCancelar.id,
        user.uid,
        usuarioNombre,
        'Cancelado desde el panel de traslados'
      );

      toast({
        title: 'Traslado cancelado',
        description: `El traslado #${trasladoParaCancelar.idTraslado} fue cancelado y el stock se reintegró a origen.`,
      });
      setTrasladoParaCancelar(null);
    } catch (err: any) {
      console.error('Error al cancelar traslado:', err);
      toast({
        title: 'Error al cancelar traslado',
        description: err.message || 'No se pudo cancelar el traslado.',
        variant: 'destructive',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const renderBadgeEstado = (estado: string) => {
    switch (estado) {
      case 'en_transito':
        return (
          <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full flex items-center gap-1 w-fit text-[11px] px-2.5 py-0.5">
            <Clock className="h-3 w-3" />
            <span>En Tránsito</span>
          </Badge>
        );
      case 'recibido':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1 w-fit text-[11px] px-2.5 py-0.5">
            <CheckCircle2 className="h-3 w-3" />
            <span>Recibido</span>
          </Badge>
        );
      case 'cancelado':
        return (
          <Badge className="bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full flex items-center gap-1 w-fit text-[11px] px-2.5 py-0.5">
            <XCircle className="h-3 w-3" />
            <span>Cancelado</span>
          </Badge>
        );
      default:
        return <Badge variant="outline" className="rounded-full text-[11px]">{estado}</Badge>;
    }
  };

  if (isLoadingSucursal || isLoadingTraslados) {
    return (
      <div className="flex flex-col justify-center items-center h-72 space-y-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground">Cargando traslados de inventario...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-body pb-10">
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <ArrowLeftRight className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Traslados
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Envío y recepción de inventario entre sucursales.
            </p>
          </div>
        </div>

        <PermissionGuard permission="inventario.ver">
          <Button
            onClick={() => setIsNuevoOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full text-xs h-9 px-4 shadow-md shadow-primary/20 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Nuevo Traslado
          </Button>
        </PermissionGuard>
      </div>

      {/* Contenedor Principal de Listado */}
      <Card className="border !border-[#324157] !bg-[#1d283a] shadow-sm overflow-hidden rounded-xl">
        <CardHeader className="p-3 sm:p-4 border-b !border-[#324157] !bg-[#1d283a]">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Pestañas en formato píldora estándar */}
            <div className="w-full md:w-auto">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                <TabsList className="grid grid-cols-3 w-full md:w-[420px] h-11 p-1 bg-[#283244] rounded-full border border-[#324157] gap-1">
                  <TabsTrigger
                    value="pendientes"
                    className="rounded-full text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center justify-center gap-1.5 px-2 transition-all"
                  >
                    <PackageCheck className="h-3.5 w-3.5 shrink-0" />
                    <span>Pendientes</span>
                    {pendientesRecibir.length > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-black leading-none bg-amber-400 text-slate-950 shadow-sm shrink-0">
                        {pendientesRecibir.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="en_transito"
                    className="rounded-full text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center justify-center gap-1.5 px-2 transition-all"
                  >
                    <Truck className="h-3.5 w-3.5 shrink-0" />
                    <span>Enviados</span>
                    {enviadosEnTransito.length > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-black leading-none bg-white text-slate-950 shadow-sm shrink-0">
                        {enviadosEnTransito.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="todos"
                    className="rounded-full text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center justify-center gap-1.5 px-2 transition-all"
                  >
                    <Boxes className="h-3.5 w-3.5 shrink-0" />
                    <span>Historial</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Buscador redondeado */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Buscar por #, sucursal, producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9 bg-[#283244] border-[#324157] text-white placeholder:text-slate-400 text-xs h-10 rounded-full focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-4 !bg-[#1d283a]">
          {listaFiltrada.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-400 text-xs">
              <Truck className="h-8 w-8 mx-auto text-slate-500 opacity-40 mb-2" />
              <span>No hay traslados en esta sección.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {listaFiltrada.map((t) => {
                const esDestino = t.sucursalDestinoId === sucursalId;
                const esOrigen = t.sucursalOrigenId === sucursalId;
                const puedeRecibir = esDestino && t.estado === 'en_transito';
                const puedeCancelar = esOrigen && t.estado === 'en_transito';

                const fechaStr = t.fechaEnvio?.toDate
                  ? format(t.fechaEnvio.toDate(), 'dd/MM/yyyy hh:mm a', { locale: es })
                  : 'N/A';

                return (
                  <div
                    key={t.id}
                    className="rounded-xl border !border-[#324157] !bg-[#283244] p-3.5 space-y-3 shadow-sm hover:border-slate-500/60 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Encabezado: Folio, Fecha y Estado */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-bold text-white shrink-0">#TR-{t.idTraslado}</span>
                          <span className="text-[11px] text-slate-400 font-medium truncate">({fechaStr})</span>
                        </div>
                        <div className="shrink-0">{renderBadgeEstado(t.estado)}</div>
                      </div>

                      {/* Ruta de Envío: Origen -> Destino */}
                      <div className="p-2.5 rounded-xl !bg-[#1d283a] border !border-[#324157] flex items-center justify-between text-xs gap-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] text-slate-400 block font-medium">Origen</span>
                          <span className={`font-semibold truncate block ${esOrigen ? 'text-primary' : 'text-slate-200'}`}>
                            {t.sucursalOrigenNombre}
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400 shrink-0 mx-1" />
                        <div className="flex-1 min-w-0 text-right">
                          <span className="text-[10px] text-slate-400 block font-medium">Destino</span>
                          <span className={`font-semibold truncate block ${esDestino ? 'text-emerald-400' : 'text-slate-200'}`}>
                            {t.sucursalDestinoNombre}
                          </span>
                        </div>
                      </div>

                      {/* Datos del Traslado: Unidades y Costo Total */}
                      <div className="flex items-center justify-between text-xs px-0.5">
                        <div>
                          <span className="text-slate-400">Productos: </span>
                          <strong className="text-white">{t.cantidadTotalItems} uds</strong>
                          <span className="text-slate-400 text-[11px] ml-1">({t.items?.length || 0} ítems)</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Total: </span>
                          <strong className="text-emerald-400 text-sm font-bold">Q{(t.costoTotalTraslado || 0).toFixed(2)}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Botones de Acción Estilizados */}
                    <div className="flex items-center gap-2 pt-2 border-t border-[#324157]/60">
                      {puedeRecibir && (
                        <Button
                          size="sm"
                          onClick={() => setTrasladoParaRecibir(t)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs h-8 px-3 font-semibold shadow-sm flex items-center justify-center gap-1.5 transition-all"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          <span>Recibir</span>
                        </Button>
                      )}

                      {puedeCancelar && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setTrasladoParaCancelar(t)}
                          className="flex-1 border-rose-500/40 text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 rounded-full text-xs h-8 px-3 flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Undo2 className="h-3.5 w-3.5 shrink-0" />
                          <span>Cancelar</span>
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setTrasladoParaDetalle(t)}
                        className={`border-[#324157] bg-[#1d283a] text-slate-300 hover:text-white hover:bg-[#283244] rounded-full text-xs h-8 px-3.5 flex items-center justify-center gap-1.5 transition-all ${
                          !puedeRecibir && !puedeCancelar ? 'w-full' : ''
                        }`}
                      >
                        <Eye className="h-3.5 w-3.5 shrink-0" />
                        <span>Ver Detalle</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de Nuevo Traslado */}
      <NuevoTrasladoDialog
        open={isNuevoOpen}
        onOpenChange={setIsNuevoOpen}
        sucursalOrigenId={sucursalId || ''}
        sucursalOrigenNombre={sucursalActiva?.nombre || ''}
        sucursales={sucursales}
        productosOrigen={productosOrigen}
        comprasOrigen={comprasOrigen}
      />

      {/* Diálogo de Confirmar Recepción */}
      <RecibirTrasladoDialog
        open={!!trasladoParaRecibir}
        onOpenChange={(op) => !op && setTrasladoParaRecibir(null)}
        traslado={trasladoParaRecibir}
        productosLocales={productosOrigen}
      />

      {/* Diálogo de Detalle / Comprobante */}
      <DetalleTrasladoDialog
        open={!!trasladoParaDetalle}
        onOpenChange={(op) => !op && setTrasladoParaDetalle(null)}
        traslado={trasladoParaDetalle}
      />

      {/* Alerta de confirmación para Cancelar Traslado */}
      <AlertDialog
        open={!!trasladoParaCancelar}
        onOpenChange={(op) => !op && setTrasladoParaCancelar(null)}
      >
        <AlertDialogContent className="bg-[#1b2533] border-[#2c3b4f] text-slate-100 font-body">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="h-5 w-5" />
              ¿Cancelar traslado #{trasladoParaCancelar?.idTraslado}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 text-xs">
              Esta acción revertirá el envío en tránsito. Las {trasladoParaCancelar?.cantidadTotalItems} unidades de los productos despachados se reintegrarán automáticamente al stock de esta sucursal ({trasladoParaCancelar?.sucursalOrigenNombre}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              disabled={isCancelling}
              className="border-[#2d3e55] text-slate-300 hover:bg-[#233144] rounded-full text-xs h-9"
            >
              Regresar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmarCancelacion}
              disabled={isCancelling}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-full text-xs h-9"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  Cancelando...
                </>
              ) : (
                'Sí, Cancelar y Reintegrar Stock'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
