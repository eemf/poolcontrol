import { useState, useEffect, useMemo, useCallback } from 'react';
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
    () =>
      firestore && sucursalId
        ? query(collection(firestore, `sucursales/${sucursalId}/productos`), orderBy('nombre'))
        : null,
    [firestore, sucursalId]
  );
  const { data: productos, isLoading: cargandoProductos, error } = useCollection<Producto>(productosQuery);

  // Sincroniza productos desde Firestore preservando cualquier conteo físico en curso durante el modo revisión
  useEffect(() => {
    if (productos) {
      setProductosAjuste((prev) => {
        const mapaPrevio = new Map(prev.map((item) => [item.id, item.existenciaFisica]));
        return productos.map((p) => {
          const fisicaPrevia = isRevisionMode ? (mapaPrevio.get(p.id) ?? '') : '';
          const sistema = p.existencia || 0;
          const diferencia = fisicaPrevia === '' ? 0 : Number(fisicaPrevia) - sistema;
          return {
            ...p,
            existenciaFisica: fisicaPrevia,
            diferencia,
          };
        });
      });
    }
  }, [productos, isRevisionMode]);

  const resetFormRevision = useCallback(() => {
    setObservaciones('');
    setAlertaGuardado(false);
    setConfirmadoCheck(false);
    setProductosAjuste((prev) =>
      prev.map((p) => ({
        ...p,
        existenciaFisica: '',
        diferencia: 0,
      }))
    );
  }, []);

  const iniciarModoRevision = useCallback(() => {
    resetFormRevision();
    setIsRevisionMode(true);
  }, [resetFormRevision]);

  const salirModoRevision = useCallback(() => {
    resetFormRevision();
    setIsRevisionMode(false);
  }, [resetFormRevision]);

  const handleExistenciaFisicaChange = useCallback((productoId: string, valor: string) => {
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
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }
  }, []);

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
    if (filtro.trim()) {
      const filtroLower = filtro.trim().toLowerCase();
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
    if (orden === 'nombre-desc') result.sort((a, b) => b.nombre.localeCompare(a.nombre));
    if (orden === 'stock-asc') result.sort((a, b) => (a.existencia || 0) - (b.existencia || 0));
    if (orden === 'stock-desc') result.sort((a, b) => (b.existencia || 0) - (a.existencia || 0));

    return result;
  }, [productosAjuste, filtro, orden, ubicacionFiltro]);

  const totalItems = productosFiltrados.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedProductos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return productosFiltrados.slice(startIndex, startIndex + itemsPerPage);
  }, [productosFiltrados, currentPage, itemsPerPage]);

  const totalModificados = useMemo(
    () => productosAjuste.filter((p) => p.existenciaFisica !== '' && p.diferencia !== 0).length,
    [productosAjuste]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filtro, orden, itemsPerPage, isRevisionMode, ubicacionFiltro]);

  const manejarGuardarAjuste = async () => {
    if (!firestore || !user || !sucursalId) return;

    if (productosAjuste.length === 0) {
      toast({
        title: 'Sin productos',
        description: 'No hay productos en el inventario para registrar la revisión.',
        variant: 'destructive',
      });
      return;
    }

    setProcesando(true);
    try {
      // Guardar el estado de TODOS los productos del inventario:
      // Si no se ingresó un conteo distinto para un producto, conserva su existencia actual con diferencia 0.
      const detalles: DetalleAjusteInventario[] = productosAjuste.map((p) => {
        const existenciaSistema = p.existencia || 0;
        const existenciaFisica =
          p.existenciaFisica === '' ? existenciaSistema : Number(p.existenciaFisica);
        const diferencia = existenciaFisica - existenciaSistema;

        return {
          productoId: p.id,
          nombreProducto: p.nombre,
          existenciaSistema,
          existenciaFisica,
          diferencia,
        };
      });

      const modificadosCount = detalles.filter((d) => d.diferencia !== 0).length;

      await realizarAjusteInventario(firestore, sucursalId, {
        usuarioId: user.uid,
        usuarioNombre: user.displayName || user.email || 'Usuario',
        observaciones:
          observaciones.trim() ||
          (modificadosCount > 0
            ? 'Revisión física con ajustes de stock'
            : 'Revisión física sin diferencias de stock'),
        tipoAjuste: 'general',
        detalles,
      });

      toast({
        title: 'Revisión de inventario guardada',
        description:
          modificadosCount > 0
            ? `Se guardó el estado de ${detalles.length} productos (${modificadosCount} con modificación).`
            : `Se guardó la revisión de los ${detalles.length} productos sin diferencias.`,
      });

      resetFormRevision();
      setIsRevisionMode(false);
    } catch (err: any) {
      console.error('Error al guardar ajuste:', err);
      toast({
        title: 'Error al guardar revisión',
        description: err.message || 'Ocurrió un problema al registrar la revisión de inventario.',
        variant: 'destructive',
      });
    } finally {
      setProcesando(false);
    }
  };

  return {
    sucursalId,
    isLoading: isLoadingSucursal || cargandoProductos,
    error,
    isRevisionMode,
    setIsRevisionMode,
    iniciarModoRevision,
    salirModoRevision,
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
    totalItems,
    totalPages,
    totalModificados,
    handleExistenciaFisicaChange,
    handleKeyDown,
    manejarGuardarAjuste,
  };
}
