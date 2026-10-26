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
  Filter,
  Eye,
  Undo2,
  Building2,
  DollarSign,
  Boxes,
  Loader2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

  const completados = useMemo(() => {
    return todosTraslados.filter((t) => t.estado === 'recibido');
  }, [todosTraslados]);

  const totalValorMovilizado = useMemo(() => {
    return todosTraslados
      .filter((t) => t.estado !== 'cancelado')
      .reduce((acc, t) => acc + (t.costoTotalTraslado || 0), 0);
  }, [todosTraslados]);

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
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 flex items-center gap-1 w-fit text-[11px]">
            <Clock className="h-3 w-3" />
            En Tránsito
          </Badge>
        );
      case 'recibido':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 flex items-center gap-1 w-fit text-[11px]">
            <CheckCircle2 className="h-3 w-3" />
            Recibido
          </Badge>
        );
      case 'cancelado':
        return (
          <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 flex items-center gap-1 w-fit text-[11px]">
            <XCircle className="h-3 w-3" />
            Cancelado
          </Badge>
        );
      default:
        return <Badge variant="outline">{estado}</Badge>;
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
    <div className="space-y-6 font-body pb-10">
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ArrowLeftRight className="h-6 w-6 text-primary" />
            Traslados de Inventario entre Sucursales
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Mueve existencias entre sucursales garantizando compras independientes y cuadres semanales transparentes.
          </p>
        </div>

        <PermissionGuard permission="inventario.ver">
          <Button
            onClick={() => setIsNuevoOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full text-xs h-10 px-4 shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo Traslado
          </Button>
        </PermissionGuard>
      </div>

      {/* Tarjetas de Métricas Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          onClick={() => setActiveTab('pendientes')}
          className={`cursor-pointer transition-all border-[#2d3e55] bg-[#1d283a] hover:border-amber-500/50 ${
            activeTab === 'pendientes' ? 'ring-2 ring-amber-500/40 border-amber-500/60' : ''
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Por Recibir (Entrantes)
              </span>
              <p className="text-2xl font-bold text-amber-400">{pendientesRecibir.length}</p>
              <span className="text-[10px] text-slate-400">Envíos dirigidos a esta sucursal</span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <PackageCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setActiveTab('en_transito')}
          className={`cursor-pointer transition-all border-[#2d3e55] bg-[#1d283a] hover:border-sky-500/50 ${
            activeTab === 'en_transito' ? 'ring-2 ring-sky-500/40 border-sky-500/60' : ''
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                En Tránsito (Salientes)
              </span>
              <p className="text-2xl font-bold text-sky-400">{enviadosEnTransito.length}</p>
              <span className="text-[10px] text-slate-400">Despachados desde esta sucursal</span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Truck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setActiveTab('todos')}
          className={`cursor-pointer transition-all border-[#2d3e55] bg-[#1d283a] hover:border-emerald-500/50 ${
            activeTab === 'todos' ? 'ring-2 ring-emerald-500/40 border-emerald-500/60' : ''
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Completados
              </span>
              <p className="text-2xl font-bold text-emerald-400">{completados.length}</p>
              <span className="text-[10px] text-slate-400">Recibidos y liquidados</span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#2d3e55] bg-[#1d283a]">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Movilizado
              </span>
              <p className="text-2xl font-bold text-white">Q{totalValorMovilizado.toFixed(2)}</p>
              <span className="text-[10px] text-slate-400">Costo total de mercancías</span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel Principal de Listados con Tabs y Búsqueda */}
      <Card className="border-[#2d3e55] bg-[#182330] shadow-sm overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b border-[#2d3e55] bg-[#1d283a]/60">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full sm:w-auto">
              <TabsList className="bg-[#182330] border border-[#2d3e55] p-1 rounded-xl h-10">
                <TabsTrigger
                  value="pendientes"
                  className="rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5"
                >
                  <PackageCheck className="h-3.5 w-3.5" />
                  Pendientes de Recepción
                  {pendientesRecibir.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-black font-extrabold">
                      {pendientesRecibir.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="en_transito"
                  className="rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5"
                >
                  <Truck className="h-3.5 w-3.5" />
                  Enviados en Tránsito
                  {enviadosEnTransito.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-sky-500 text-white font-extrabold">
                      {enviadosEnTransito.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="todos"
                  className="rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5"
                >
                  <Boxes className="h-3.5 w-3.5" />
                  Historial General
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Buscador */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Buscar por #, sucursal, producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9 bg-[#182330] border-[#2d3e55] text-white text-xs h-9 rounded-full"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#1d283a]">
                <TableRow className="border-[#2d3e55] hover:bg-transparent">
                  <TableHead className="text-slate-300 text-xs py-3">Folio</TableHead>
                  <TableHead className="text-slate-300 text-xs py-3">Fecha Envío</TableHead>
                  <TableHead className="text-slate-300 text-xs py-3">Sucursal Origen</TableHead>
                  <TableHead className="text-slate-300 text-xs py-3">Sucursal Destino</TableHead>
                  <TableHead className="text-slate-300 text-xs text-center py-3">Productos</TableHead>
                  <TableHead className="text-slate-300 text-xs text-right py-3">Valor Total</TableHead>
                  <TableHead className="text-slate-300 text-xs text-center py-3">Estado</TableHead>
                  <TableHead className="text-slate-300 text-xs text-right py-3 pr-4">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listaFiltrada.length === 0 ? (
                  <TableRow className="border-[#2d3e55]">
                    <TableCell colSpan={8} className="text-center py-12 text-slate-400 text-xs">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Truck className="h-8 w-8 text-slate-500 opacity-40" />
                        <span>No hay traslados en esta sección.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  listaFiltrada.map((t) => {
                    const esDestino = t.sucursalDestinoId === sucursalId;
                    const esOrigen = t.sucursalOrigenId === sucursalId;
                    const puedeRecibir = esDestino && t.estado === 'en_transito';
                    const puedeCancelar = esOrigen && t.estado === 'en_transito';

                    const fechaStr = t.fechaEnvio?.toDate
                      ? format(t.fechaEnvio.toDate(), 'dd/MM/yyyy hh:mm a', { locale: es })
                      : 'N/A';

                    return (
                      <TableRow key={t.id} className="border-[#2d3e55] hover:bg-[#202d3e]">
                        <TableCell className="py-3 text-xs font-bold text-white">
                          #TR-{t.idTraslado}
                        </TableCell>
                        <TableCell className="py-3 text-xs text-slate-300 whitespace-nowrap">
                          {fechaStr}
                        </TableCell>
                        <TableCell className="py-3 text-xs font-medium text-slate-200">
                          <span className={esOrigen ? 'text-primary font-bold' : ''}>
                            {t.sucursalOrigenNombre}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 text-xs font-medium text-slate-200">
                          <span className={esDestino ? 'text-emerald-400 font-bold' : ''}>
                            {t.sucursalDestinoNombre}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 text-xs text-center text-slate-300">
                          <span className="font-semibold text-white">{t.cantidadTotalItems} uds</span>
                          <span className="text-[10px] text-slate-400 block">
                            ({t.items?.length || 0} prod.)
                          </span>
                        </TableCell>
                        <TableCell className="py-3 text-xs text-right font-bold text-emerald-400 whitespace-nowrap">
                          Q{(t.costoTotalTraslado || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="py-3 text-center">
                          <div className="flex justify-center">
                            {renderBadgeEstado(t.estado)}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-right pr-4">
                          <div className="flex items-center justify-end gap-1.5">
                            {puedeRecibir && (
                              <Button
                                size="sm"
                                onClick={() => setTrasladoParaRecibir(t)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs h-7 px-3 font-semibold shadow-sm"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Recibir
                              </Button>
                            )}

                            {puedeCancelar && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setTrasladoParaCancelar(t)}
                                className="border-rose-500/40 text-rose-300 hover:bg-rose-950/40 rounded-full text-xs h-7 px-2.5"
                              >
                                <Undo2 className="h-3 w-3 mr-1" />
                                Cancelar
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setTrasladoParaDetalle(t)}
                              className="text-slate-300 hover:text-white hover:bg-[#2c3b4f] rounded-full text-xs h-7 px-2.5"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
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
