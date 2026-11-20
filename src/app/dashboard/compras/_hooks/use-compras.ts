import { useState, useMemo, useEffect } from "react";
import { useFirebase, useUser, useCollection, useMemoFirebase } from "@/firebase";
import {
  collection,
  doc,
  runTransaction,
  query,
  orderBy,
  where,
  limit,
  Timestamp,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useSucursal } from "@/hooks/use-sucursal";
import type { Compra, ItemCompra, Cliente, Producto } from "@/lib/tipos";
import {
  guardarCliente,
  registrarMovimientoInventario,
  registrarAuditoria,
} from "@/lib/firebase/servicios";

export type ProductoConDocId = Producto & { docId: string };
export type ClienteConDocId = Cliente & { docId: string };
export type CompraConDocId = Compra & { docId: string };

const LIMITE_INICIAL_COMPRAS = 50;

/**
 * Hook de gestión de compras e ingreso automático a inventario.
 * Optimiza las lecturas de Firestore consultando solo pendientes por defecto
 * o los últimos 50 registros históricos cuando se activa "Mostrar todas".
 */
export function useCompras() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  const { toast } = useToast();

  // Estados de UI y modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const [limiteCompras, setLimiteCompras] = useState(LIMITE_INICIAL_COMPRAS);
  const [searchTerm, setSearchTerm] = useState('');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Estados de Formulario y Selección
  const [editingCompra, setEditingCompra] = useState<CompraConDocId | null>(null);
  const [compraToDelete, setCompraToDelete] = useState<CompraConDocId | null>(null);
  const [proveedorSeleccionadoId, setProveedorSeleccionadoId] = useState('');
  const [itemsEnCompra, setItemsEnCompra] = useState<ItemCompra[]>([]);

  // Consulta condicional: pendientes activas o historial acotado por fecha descendente
  const comprasQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    const baseRef = collection(firestore, `sucursales/${sucursalId}/compras`);
    return mostrarTodas
      ? query(baseRef, orderBy("fecha", "desc"), limit(limiteCompras))
      : query(baseRef, where("estado", "==", "Pendiente"));
  }, [firestore, sucursalId, mostrarTodas, limiteCompras]);

  const { data: rawCompras, isLoading: isLoadingCompras } = useCollection<Compra>(comprasQuery);

  const productosQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/productos`), orderBy("nombre", "asc"));
  }, [firestore, sucursalId]);
  const { data: productosData, isLoading: isLoadingProductos } = useCollection<Producto>(productosQuery);

  const proveedoresQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/clientes`), orderBy("nombre", "asc"));
  }, [firestore, sucursalId]);
  const { data: todosLosClientes, isLoading: isLoadingProveedores } = useCollection<Cliente>(proveedoresQuery);

  // Memoización de Datos (orden descendente garantizado incluso en consulta filtrada por estado)
  const comprasConDocId = useMemo((): CompraConDocId[] => {
    return [...(rawCompras || [])]
      .sort((a, b) => {
        const fa = a.fecha instanceof Timestamp ? a.fecha.toMillis() : 0;
        const fb = b.fecha instanceof Timestamp ? b.fecha.toMillis() : 0;
        return fb - fa;
      })
      .map(c => ({ ...c, docId: c.id }));
  }, [rawCompras]);
  const productosConDocId = useMemo((): ProductoConDocId[] => (productosData || []).map(p => ({ ...p, docId: p.id })), [productosData]);
  const proveedores = useMemo((): ClienteConDocId[] => (todosLosClientes || []).filter(c => c.tipoCliente === 'Proveedor' || c.tipoCliente === 'Ambos').map(c => ({ ...c, docId: c.id })), [todosLosClientes]);

  // Conteos
  const totalPendientes = useMemo(() => {
    return comprasConDocId.filter(c => c.estado === 'Pendiente').length;
  }, [comprasConDocId]);

  // Filtrado
  const filteredCompras = useMemo(() => {
    let result = comprasConDocId;
    if (!mostrarTodas) result = result.filter(c => c.estado === 'Pendiente');
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      result = result.filter(c => (c.proveedorNombre || '').toLowerCase().includes(s) || String(c.idCompra).includes(s));
    }
    return result;
  }, [comprasConDocId, mostrarTodas, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(filteredCompras.length / itemsPerPage);
  const paginatedCompras = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCompras.slice(start, start + itemsPerPage);
  }, [filteredCompras, currentPage, itemsPerPage]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, mostrarTodas, itemsPerPage]);

  const handleEdit = (compra: CompraConDocId) => {
    setEditingCompra(compra);
    setProveedorSeleccionadoId(compra.proveedorId || '');
    setItemsEnCompra(compra.items);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setEditingCompra(null);
    setItemsEnCompra([]);
    setProveedorSeleccionadoId('');
    setIsModalOpen(true);
  };

  const handleCrearProveedor = async (nombre: string) => {
    if (!firestore || !sucursalId) return;
    const c = await guardarCliente(firestore, sucursalId, { nombre, tipoCliente: 'Proveedor', idcliente: 0, consumoInterno: false });
    return c.id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !sucursalId || itemsEnCompra.length === 0) return;
    setLoading(true);

    try {
      await runTransaction(firestore, async (transaction) => {
        const sid = sucursalId;
        const corrRef = doc(firestore, `sucursales/${sid}/correlativos`, "compras");
        const corrHistorialRef = doc(firestore, `sucursales/${sid}/correlativos`, 'historial_inventario');

        const [corrSnap, corrHistorialSnap] = await Promise.all([
          transaction.get(corrRef),
          transaction.get(corrHistorialRef)
        ]);

        const idFinal = editingCompra ? editingCompra.idCompra : (corrSnap?.data()?.correlativo || 0) + 1;
        let siguienteIdHistorial = (corrHistorialSnap.data()?.correlativo || 0) + 1;

        const stockChanges: Map<string, number> = new Map();
        if (editingCompra) {
          editingCompra.items.forEach(item => {
            if (item.tipo === 'producto' && item.productoId) {
              stockChanges.set(item.productoId, (stockChanges.get(item.productoId) || 0) - item.cantidad);
            }
          });
        }
        itemsEnCompra.forEach(item => {
          if (item.tipo === 'producto' && item.productoId) {
            stockChanges.set(item.productoId, (stockChanges.get(item.productoId) || 0) + item.cantidad);
          }
        });

        const uniqueProductIds = Array.from(stockChanges.keys());
        const productRefs = uniqueProductIds.map(id => doc(firestore, `sucursales/${sid}/productos`, id));
        const productSnaps = await Promise.all(productRefs.map(ref => transaction.get(ref)));

        const proveedor = proveedores.find(p => p.docId === proveedorSeleccionadoId);
        const total = itemsEnCompra.reduce((acc, item) => acc + (item.costoUnitario * item.cantidad), 0);

        productSnaps.forEach((snap, index) => {
          if (snap.exists()) {
            const productoId = uniqueProductIds[index];
            const cambio = stockChanges.get(productoId) || 0;

            if (cambio !== 0) {
              const exAnt = snap.data().existencia || 0;
              const exNue = exAnt + cambio;

              transaction.update(snap.ref, { existencia: exNue });

              registrarMovimientoInventario(transaction, firestore, sid, siguienteIdHistorial++, {
                productoId: productoId,
                nombreProducto: snap.data().nombre,
                tipoMovimiento: 'Compra',
                cantidad: cambio,
                existenciaAnterior: exAnt,
                existenciaNueva: exNue,
                referencia: `Compra #${idFinal}${editingCompra ? ' (Edición)' : ''}`,
                usuarioId: user.uid,
              });
            }
          }
        });

        const data: Compra = {
          id: idFinal.toString(),
          idCompra: idFinal,
          sucursalId: sid,
          fecha: editingCompra ? editingCompra.fecha : Timestamp.now(),
          estado: editingCompra ? editingCompra.estado : 'Pendiente',
          proveedorNombre: proveedor?.nombre ?? 'Varios',
          items: itemsEnCompra,
          montoTotal: total,
          usuarioId: user.uid,
          proveedorId: proveedorSeleccionadoId || undefined,
        };

        const compRef = doc(firestore, `sucursales/${sid}/compras`, idFinal.toString());
        transaction.set(compRef, data);

        if (!editingCompra) {
          transaction.set(corrRef, { correlativo: idFinal }, { merge: true });
        }

        if (siguienteIdHistorial > ((corrHistorialSnap.data()?.correlativo || 0) + 1)) {
          transaction.set(corrHistorialRef, { correlativo: siguienteIdHistorial - 1 }, { merge: true });
        }

        registrarAuditoria(firestore, sid, {
          usuarioId: user.uid,
          usuarioNombre: user.displayName || user.email || 'Usuario',
          usuarioEmail: user.email || '',
          categoria: 'COMPRAS',
          accion: editingCompra ? 'COMPRA_EDITAR' : 'COMPRA_CREAR',
          titulo: `${editingCompra ? 'Edición de compra' : 'Nueva compra'} #${idFinal}`,
          descripcion: `Proveedor: ${proveedor?.nombre ?? 'Varios'} - Total: Q${total.toFixed(2)} (${itemsEnCompra.length} ítems)`,
          detalles: {
            idCompra: idFinal,
            proveedor: proveedor?.nombre ?? 'Varios',
            total,
            items: itemsEnCompra.map(i => ({ nombre: i.nombre, cantidad: i.cantidad, costoUnitario: i.costoUnitario }))
          }
        }, transaction);
      });

      toast({ title: "Éxito", description: `Compra ${editingCompra ? 'actualizada' : 'registrada'} correctamente.` });
      setIsModalOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!firestore || !compraToDelete || !sucursalId || !user) return;
    setLoading(true);
    try {
      await runTransaction(firestore, async (transaction) => {
        const sid = sucursalId;
        const ref = doc(firestore, `sucursales/${sid}/compras`, compraToDelete.docId);
        const corrHistorialRef = doc(firestore, `sucursales/${sid}/correlativos`, 'historial_inventario');

        const [snap, corrHistorialSnap] = await Promise.all([
          transaction.get(ref),
          transaction.get(corrHistorialRef)
        ]);

        if (snap.exists()) {
          const data = snap.data() as Compra;
          let siguienteIdHistorial = (corrHistorialSnap.data()?.correlativo || 0) + 1;

          for (const item of data.items) {
            if (item.tipo === 'producto' && item.productoId) {
              const pRef = doc(firestore, `sucursales/${sid}/productos`, item.productoId);
              const pSnap = await transaction.get(pRef);
              if (pSnap.exists()) {
                const exAnt = pSnap.data().existencia || 0;
                const exNue = exAnt - item.cantidad;

                transaction.update(pRef, { existencia: exNue });

                registrarMovimientoInventario(transaction, firestore, sid, siguienteIdHistorial++, {
                  productoId: item.productoId,
                  nombreProducto: pSnap.data().nombre,
                  tipoMovimiento: 'Venta Anulada',
                  cantidad: -item.cantidad,
                  existenciaAnterior: exAnt,
                  existenciaNueva: exNue,
                  referencia: `Eliminación Compra #${data.idCompra}`,
                  usuarioId: user.uid,
                });
              }
            }
          }

          transaction.delete(ref);
          transaction.set(corrHistorialRef, { correlativo: siguienteIdHistorial - 1 }, { merge: true });

          registrarAuditoria(firestore, sid, {
            usuarioId: user.uid,
            usuarioNombre: user.displayName || user.email || 'Usuario',
            usuarioEmail: user.email || '',
            categoria: 'COMPRAS',
            accion: 'COMPRA_ANULAR',
            titulo: `Anulación de compra #${data.idCompra}`,
            descripcion: `Compra por Q${data.montoTotal.toFixed(2)} anulada y stock revertido`,
            detalles: {
              idCompra: data.idCompra,
              montoTotal: data.montoTotal,
              itemsRevertidos: data.items.map(i => ({ nombre: i.nombre, cantidad: i.cantidad }))
            }
          }, transaction);
        }
      });
      toast({ title: "Éxito", description: "Compra eliminada." });
      setCompraToDelete(null);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return {
    sucursalId,
    isLoading: isLoadingCompras || isLoadingSucursal || isLoadingProductos || isLoadingProveedores,
    loading,
    isModalOpen,
    setIsModalOpen,
    editingCompra,
    compraToDelete,
    setCompraToDelete,
    proveedorSeleccionadoId,
    setProveedorSeleccionadoId,
    itemsEnCompra,
    setItemsEnCompra,
    searchTerm,
    setSearchTerm,
    mostrarTodas,
    setMostrarTodas,
    totalPendientes,
    totalCompras: comprasConDocId.length,
    paginatedCompras,
    filteredCompras,
    proveedores,
    productosConDocId,
    comprasConDocId,
    pagination: {
      currentPage,
      itemsPerPage,
      totalPages,
      onPageChange: setCurrentPage,
      onItemsPerPageChange: setItemsPerPage,
    },
    handleNew,
    handleEdit,
    handleCrearProveedor,
    handleSubmit,
    handleDeleteConfirm,
  };
}
