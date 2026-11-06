import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
import type { Producto, DetalleAjusteInventario } from '@/lib/tipos';
import { useToast } from '@/hooks/use-toast';
import { realizarAjusteInventario } from '@/lib/firebase/servicios/inventario';
import { useSucursal } from '@/hooks/use-sucursal';

export type ProductoConAjuste = Producto & {
  existenciaFisica: number | '';
  diferencia: number;
};

export function useInventario() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { toast } = useToast();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();

  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const [productosAjuste, setProductosAjuste] = useState<ProductoConAjuste[]>([]);
  const [observaciones, setObservaciones] = useState('');
  const [filtro, setFiltro] = useState('');
  const [orden, setOrden] = useState('nombre-asc');
  const [ubicacionFiltro, setUbicacionFiltro] = useState('todas');
  const [alertaGuardado, setAlertaGuardado] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [confirmadoCheck, setConfirmadoCheck] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const productosQuery = useMemoFirebase(
    () => (firestore && sucursalId ? query(collection(firestore, `sucursales/${sucursalId}/productos`), orderBy('nombre')) : null),
    [firestore, sucursalId]
  );
  const { data: productos, isLoading: cargandoProductos } = useCollection<Producto>(productosQuery);

  useEffect(() => {
    if (productos) {
      setProductosAjuste(
        productos.map((p) => ({
          ...p,
          existenciaFisica: '',
          diferencia: 0,
        }))
      );
    }
  }, [productos]);

  const handleExistenciaFisicaChange = (productoId: string, valor: string) => {
    const valorNumerico = valor === '' ? '' : Number(valor);
    setProductosAjuste((prev) =>
      prev.map((p) => {
        if (p.id === productoId) {
          const sistema = p.existencia || 0;
          const diferencia = valorNumerico === '' ? 0 : valorNumerico - sistema;
          return { ...p, existenciaFisica: valorNumerico, diferencia };
        }
        return p;
      })
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }
  };

  const ubicacionesDisponibles = useMemo(() => {
    const set = new Set<string>();
    (productos || []).forEach((p) => {
      if (p.ubicacion && p.ubicacion.trim()) set.add(p.ubicacion.trim());
    });
    if (set.size === 0) {
      ['Estantes', 'Refris', 'Congeladores', 'Mostrador', 'Bodega'].forEach((s) => set.add(s));
    }
    return Array.from(set);
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    let result = [...productosAjuste];
    if (filtro) {
      const filtroLower = filtro.toLowerCase();
      result = result.filter((p) => p.nombre.toLowerCase().includes(filtroLower));
    }
    if (ubicacionFiltro !== 'todas') {
      if (ubicacionFiltro === 'sin_ubicacion') {
        result = result.filter((p) => !p.ubicacion || !p.ubicacion.trim());
      } else {
        result = result.filter((p) => (p.ubicacion || '').toLowerCase() === ubicacionFiltro.toLowerCase());
      }
    }

    if (orden === 'nombre-asc') result.sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (orden === 'nombre-desc') result.sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (orden === 'stock-asc') result.sort((a, b) => (a.existencia || 0) - (b.existencia || 0));
    if (orden === 'stock-desc') result.sort((a, b) => (b.existencia || 0) - (a.existencia || 0));

    return result;
  }, [productosAjuste, filtro, orden, ubicacionFiltro]);

  const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);
  const paginatedProductos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return productosFiltrados.slice(startIndex, startIndex + itemsPerPage);
  }, [productosFiltrados, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtro, orden, itemsPerPage, isRevisionMode, ubicacionFiltro]);

  const manejarGuardarAjuste = async () => {
    if (!firestore || !user || !sucursalId) return;

    const productosParaAjustar = productosAjuste.filter(
      (p) => p.existenciaFisica !== '' && p.existenciaFisica !== p.existencia
    );

    if (productosParaAjustar.length === 0) {
      toast({
        title: 'Sin cambios',
        description: 'No has ingresado ninguna diferencia respecto al inventario actual.',
        variant: 'destructive',
      });
      return;
    }

    setProcesando(true);
    try {
      const detalles: DetalleAjusteInventario[] = productosParaAjustar.map((p) => ({
        productoId: p.id,
        nombreProducto: p.nombre,
        existenciaAnterior: p.existencia || 0,
        existenciaFisica: Number(p.existenciaFisica),
        diferencia: p.diferencia,
        costoUnitario: p.costo || 0,
      }));

      await realizarAjusteInventario(firestore, sucursalId, {
        usuarioId: user.uid,
        usuarioNombre: user.displayName || user.email || 'Usuario',
        observaciones: observaciones.trim() || 'Ajuste general de conteo físico',
        tipoAjuste: 'general',
        detalles,
      });

      toast({
        title: 'Inventario actualizado',
        description: `Se aplicaron ajustes a ${detalles.length} productos correctamente.`,
      });

      setIsRevisionMode(false);
      setObservaciones('');
      setAlertaGuardado(false);
      setConfirmadoCheck(false);
    } catch (error: any) {
      console.error('Error al guardar ajuste:', error);
      toast({
        title: 'Error al aplicar ajustes',
        description: error.message || 'Ocurrió un problema al actualizar las existencias.',
        variant: 'destructive',
      });
    } finally {
      setProcesando(false);
    }
  };

  return {
    sucursalId,
    isLoading: isLoadingSucursal || cargandoProductos,
    isRevisionMode,
    setIsRevisionMode,
    productosAjuste,
    productosFiltrados,
    paginatedProductos,
    ubicacionesDisponibles,
    filtro,
    setFiltro,
    orden,
    setOrden,
    ubicacionFiltro,
    setUbicacionFiltro,
    observaciones,
    setObservaciones,
    confirmadoCheck,
    setConfirmadoCheck,
    alertaGuardado,
    setAlertaGuardado,
    procesando,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    handleExistenciaFisicaChange,
    handleKeyDown,
    manejarGuardarAjuste,
  };
}
