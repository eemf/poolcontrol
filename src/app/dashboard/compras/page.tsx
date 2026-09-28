'use client'

import { useState, useMemo, useEffect, useCallback } from "react"
import { useFirebase, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, runTransaction, query, orderBy, Timestamp, DocumentReference, DocumentSnapshot } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { useSucursal } from "@/hooks/use-sucursal"
import type { Compra, ItemCompra, Cliente, Producto } from "@/lib/tipos"

// Componentes Refactorizados
import { PurchaseHeader } from "./_components/purchase-header"
import { PurchaseList } from "./_components/purchase-list"
import { PurchaseModal } from "./_components/purchase-modal"
import { DeleteConfirmDialog } from "./_components/delete-confirm-dialog"
import { guardarCliente, registrarMovimientoInventario } from "@/lib/firebase/servicios"

type ProductoConDocId = Producto & { docId: string };
type ClienteConDocId = Cliente & { docId: string };
type CompraConDocId = Compra & { docId: string };

export default function PaginaCompras() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  const { toast } = useToast();

  // Estados de control de UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Estados de Formulario y Selección
  const [editingCompra, setEditingCompra] = useState<CompraConDocId | null>(null);
  const [compraToDelete, setCompraToDelete] = useState<CompraConDocId | null>(null);
  const [proveedorSeleccionadoId, setProveedorSeleccionadoId] = useState('');
  const [itemsEnCompra, setItemsEnCompra] = useState<ItemCompra[]>([]);

  // --- Consultas Firestore ---
  const comprasQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/compras`), orderBy("fecha", "desc"));
  }, [firestore, sucursalId]);
  
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

  // --- Memoización de Datos ---
  const comprasConDocId = useMemo((): CompraConDocId[] => (rawCompras || []).map(c => ({ ...c, docId: c.id })), [rawCompras]);
  const productosConDocId = useMemo((): ProductoConDocId[] => (productosData || []).map(p => ({ ...p, docId: p.id })), [productosData]);
  const proveedores = useMemo((): ClienteConDocId[] => (todosLosClientes || []).filter(c => c.tipoCliente === 'Proveedor' || c.tipoCliente === 'Ambos').map(c => ({...c, docId: c.id})), [todosLosClientes]);

  // Lógica de Filtrado
  const filteredCompras = useMemo(() => {
    let result = comprasConDocId;
    if (!mostrarTodas) result = result.filter(c => c.estado === 'Pendiente');
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      result = result.filter(c => (c.proveedorNombre || '').toLowerCase().includes(s) || String(c.idCompra).includes(s));
    }
    return result;
  }, [comprasConDocId, mostrarTodas, searchTerm]);

  // Lógica de Paginación
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
        // --- 1. FASE DE LECTURA (READS FIRST) ---
        
        // Determinar ID de compra y leer correlativo si es nueva
        const sid = sucursalId;
        const corrRef = doc(firestore, `sucursales/${sid}/correlativos`, "compras");
        const corrHistorialRef = doc(firestore, `sucursales/${sid}/correlativos`, 'historial_inventario');
        
        const [corrSnap, corrHistorialSnap] = await Promise.all([
          transaction.get(corrRef),
          transaction.get(corrHistorialRef)
        ]);
        
        const idFinal = editingCompra ? editingCompra.idCompra : (corrSnap?.data()?.correlativo || 0) + 1;
        let siguienteIdHistorial = (corrHistorialSnap.data()?.correlativo || 0) + 1;

        // Determinar qué productos leer para ajustar stock
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

        // Leer todos los documentos de productos involucrados antes de escribir nada
        const uniqueProductIds = Array.from(stockChanges.keys());
        const productRefs = uniqueProductIds.map(id => doc(firestore, `sucursales/${sid}/productos`, id));
        const productSnaps = await Promise.all(productRefs.map(ref => transaction.get(ref)));

        // --- 2. FASE DE PROCESAMIENTO (IN-MEMORY) ---
        
        const proveedor = proveedores.find(p => p.docId === proveedorSeleccionadoId);
        const total = itemsEnCompra.reduce((acc, item) => acc + (item.costoUnitario * item.cantidad), 0);

        // --- 3. FASE DE ESCRITURA (WRITES LAST) ---
        
        // Actualizar existencias y registrar historial
        productSnaps.forEach((snap, index) => {
          if (snap.exists()) {
            const productoId = uniqueProductIds[index];
            const cambio = stockChanges.get(productoId) || 0;
            
            if (cambio !== 0) {
                const exAnt = snap.data().existencia || 0;
                const exNue = exAnt + cambio;
                
                transaction.update(snap.ref, { existencia: exNue });
                
                // Registrar movimiento en el historial
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

        // Actualizar correlativos
        if (!editingCompra) {
          transaction.set(corrRef, { correlativo: idFinal }, { merge: true });
        }
        
        if (siguienteIdHistorial > ((corrHistorialSnap.data()?.correlativo || 0) + 1)) {
            transaction.set(corrHistorialRef, { correlativo: siguienteIdHistorial - 1 }, { merge: true });
        }
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
                
                // Registrar movimiento de anulación
                registrarMovimientoInventario(transaction, firestore, sid, siguienteIdHistorial++, {
                  productoId: item.productoId,
                  nombreProducto: pSnap.data().nombre,
                  tipoMovimiento: 'Venta Anulada', // Usamos este tipo para reversiones
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

  return (
    <div className="space-y-6">
      <PurchaseHeader onNewPurchase={() => { setEditingCompra(null); setItemsEnCompra([]); setProveedorSeleccionadoId(''); setIsModalOpen(true); }} />
      
      <PurchaseList
        compras={paginatedCompras}
        isLoading={isLoadingCompras || isLoadingSucursal}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        mostrarTodas={mostrarTodas}
        onMostrarTodasChange={setMostrarTodas}
        onEdit={handleEdit}
        onDelete={setCompraToDelete}
        pagination={{
          currentPage,
          itemsPerPage,
          totalPages,
          onPageChange: setCurrentPage,
          onItemsPerPageChange: setItemsPerPage
        }}
      />

      <PurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isEditing={!!editingCompra}
        onSubmit={handleSubmit}
        loading={loading}
        proveedorSeleccionadoId={proveedorSeleccionadoId}
        setProveedorSeleccionadoId={setProveedorSeleccionadoId}
        itemsEnCompra={itemsEnCompra}
        setItemsEnCompra={setItemsEnCompra}
        proveedorOptions={proveedores.map(p => ({ value: p.docId, label: p.nombre }))}
        productoOptions={productosConDocId.map(p => ({ value: p.docId, label: p.nombre, description: `Stock: ${p.existencia}` }))}
        productos={productosConDocId}
        compras={comprasConDocId}
        editingCompraId={editingCompra?.docId}
        onCrearProveedor={handleCrearProveedor}
      />

      <DeleteConfirmDialog
        compra={compraToDelete}
        isOpen={!!compraToDelete}
        onOpenChange={(o) => !o && setCompraToDelete(null)}
        onConfirm={handleDeleteConfirm}
        loading={loading}
      />
    </div>
  );
}
