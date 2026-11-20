import { useState, useMemo, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { useSucursal } from '@/hooks/use-sucursal';
import type { TrasladoInterSucursal, Sucursal, Producto, Compra } from '@/lib/tipos';
import { useToast } from '@/hooks/use-toast';
import { cancelarTrasladoInterSucursal } from '@/lib/firebase/servicios/traslados';

export type TabTraslado = 'pendientes' | 'en_transito' | 'todos';

export function useTraslados() {
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

  // Filtros y paginación
  const [busqueda, setBusqueda] = useState('');
  const [activeTab, setActiveTab] = useState<TabTraslado>('pendientes');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, busqueda, itemsPerPage]);

  // 1. Consultar los traslados recientes donde participa esta sucursal (origen o destino)
  const trasladosQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(
      collection(firestore, 'traslados'),
      where('sucursalesIds', 'array-contains', sucursalId),
      limit(100)
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

  // 4. Consultar las últimas 50 compras de la sucursal para obtener precios de referencia recientes
  const comprasQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(
      collection(firestore, `sucursales/${sucursalId}/compras`),
      orderBy('fecha', 'desc'),
      limit(50)
    );
  }, [firestore, sucursalId]);
  const { data: comprasData } = useCollection<Compra>(comprasQuery);
  const comprasOrigen = useMemo(() => comprasData || [], [comprasData]);

  // Categorización y conteos
  const pendientesRecibir = useMemo(() => {
    if (!sucursalId) return [];
    return todosTraslados.filter(
      (t) => t.sucursalDestinoId === sucursalId && t.estado === 'en_transito'
    );
  }, [todosTraslados, sucursalId]);

  const enviadosEnTransito = useMemo(() => {
    if (!sucursalId) return [];
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

  const totalPages = Math.max(1, Math.ceil(listaFiltrada.length / itemsPerPage));
  const paginatedTraslados = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return listaFiltrada.slice(start, start + itemsPerPage);
  }, [listaFiltrada, currentPage, itemsPerPage]);

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

  return {
    sucursalId,
    sucursalActiva,
    sucursales,
    productosOrigen,
    comprasOrigen,
    todosTraslados,
    pendientesRecibir,
    enviadosEnTransito,
    listaFiltrada,
    paginatedTraslados,
    pagination: {
      currentPage,
      itemsPerPage,
      totalPages,
      onPageChange: setCurrentPage,
      onItemsPerPageChange: setItemsPerPage,
    },
    activeTab,
    setActiveTab,
    busqueda,
    setBusqueda,
    isNuevoOpen,
    setIsNuevoOpen,
    trasladoParaRecibir,
    setTrasladoParaRecibir,
    trasladoParaDetalle,
    setTrasladoParaDetalle,
    trasladoParaCancelar,
    setTrasladoParaCancelar,
    isCancelling,
    handleConfirmarCancelacion,
    isLoading: isLoadingSucursal || isLoadingTraslados,
  };
}
