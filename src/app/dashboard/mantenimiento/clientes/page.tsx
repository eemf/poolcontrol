
'use client'

import { useState, useEffect, useMemo, useCallback } from "react"
import { useFirebase, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, query, runTransaction, orderBy } from "firebase/firestore"
import { useSucursal } from "@/hooks/use-sucursal"
import { useToast } from "@/hooks/use-toast"
import type { Cliente } from "@/lib/tipos"

// Componentes Refactorizados
import { EncabezadoClientes } from "./_components/encabezado-clientes"
import { ListaClientes } from "./_components/lista-clientes"
import { ModalCliente } from "./_components/modal-cliente"
import { DialogoEliminarCliente } from "./_components/dialogo-eliminar-cliente"

type ClienteConDocId = Cliente & { docId: string };

export default function PaginaClientes() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  const { toast } = useToast();

  // Estados de UI
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<string>("id-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Estados de datos
  const [editingCustomer, setEditingCustomer] = useState<ClienteConDocId | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<ClienteConDocId | null>(null);

  // Estado del formulario unificado para evitar múltiples re-renders (flushSync error)
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    tipoCliente: 'Cliente' as Cliente['tipoCliente'],
    consumoInterno: false,
    pinConsumoInterno: '',
    permiteCredito: true,
  });

  // Consultas
  const customersQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    const [field, direction] = sortOrder.split('-');
    const firestoreField = field === 'id' ? 'idcliente' : 'nombre';
    return query(collection(firestore, `sucursales/${sucursalId}/clientes`), orderBy(firestoreField, direction as "asc" | "desc"));
  }, [firestore, sucursalId, sortOrder]);

  const { data: customers, isLoading: isLoadingCustomers } = useCollection<Cliente>(customersQuery);

  useEffect(() => {
    setIsMounted(true);
    // Asegurar que exista el cliente por defecto
    const ensureDefault = async () => {
      if (!firestore || !sucursalId || isLoadingCustomers) return;
      if (customers && !customers.some(c => c.id === '0')) {
        await setDoc(doc(firestore, `sucursales/${sucursalId}/clientes`, '0'), {
          idcliente: 0, nombre: 'Venta Rápida', tipoCliente: 'Cliente', consumoInterno: false, permiteCredito: false
        });
      }
    };
    ensureDefault();
  }, [firestore, sucursalId, customers, isLoadingCustomers]);

  const resetForm = useCallback(() => {
    setFormData({
      nombre: '',
      telefono: '',
      tipoCliente: 'Cliente',
      consumoInterno: false,
      pinConsumoInterno: '',
      permiteCredito: true,
    });
    setEditingCustomer(null);
  }, []);

  useEffect(() => {
    if (editingCustomer) {
      setFormData({
        nombre: editingCustomer.nombre,
        telefono: editingCustomer.telefono || '',
        tipoCliente: editingCustomer.tipoCliente,
        consumoInterno: editingCustomer.consumoInterno || false,
        pinConsumoInterno: editingCustomer.pinConsumoInterno || '',
        permiteCredito: editingCustomer.permiteCredito !== false,
      });
    } else if (!isModalOpen) {
      resetForm();
    }
  }, [editingCustomer, isModalOpen, resetForm]);

  const clientesConDocId = useMemo((): ClienteConDocId[] => {
    return (customers || []).map((c) => ({ ...c, docId: c.id } as ClienteConDocId));
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return clientesConDocId.filter(c => 
      c.idcliente !== 0 && (
        c.nombre.toLowerCase().includes(term) ||
        c.tipoCliente.toLowerCase().includes(term) ||
        String(c.idcliente).includes(term)
      )
    );
  }, [clientesConDocId, searchTerm]);

  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(start, start + itemsPerPage);
  }, [filteredCustomers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !sucursalId || !formData.nombre) return;
    setLoading(true);

    try {
      if (editingCustomer) {
        await setDoc(doc(firestore, `sucursales/${sucursalId}/clientes`, editingCustomer.docId), {
          ...formData,
          pinConsumoInterno: formData.consumoInterno ? formData.pinConsumoInterno : ''
        }, { merge: true });
      } else {
        await runTransaction(firestore, async (transaction) => {
          const corrRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, "clientes");
          const corrSnap = await transaction.get(corrRef);
          const nuevoId = (corrSnap.data()?.correlativo || 0) + 1;
          transaction.set(doc(firestore, `sucursales/${sucursalId}/clientes`, nuevoId.toString()), {
            ...formData,
            idcliente: nuevoId,
            pinConsumoInterno: formData.consumoInterno ? formData.pinConsumoInterno : ''
          });
          transaction.set(corrRef, { correlativo: nuevoId }, { merge: true });
        });
      }
      toast({ title: "Éxito", description: `Registro guardado.` });
      setIsModalOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!firestore || !customerToDelete || !sucursalId) return;
    setLoading(true);
    try {
      await deleteDoc(doc(firestore, `sucursales/${sucursalId}/clientes`, customerToDelete.docId));
      toast({ title: "Éxito", description: "Cliente eliminado." });
      setCustomerToDelete(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-6">
      <EncabezadoClientes onNuevoCliente={() => { setEditingCustomer(null); setIsModalOpen(true); }} />
      
      <ListaClientes 
        clientes={paginatedCustomers}
        cargando={isLoadingCustomers || isLoadingSucursal}
        terminoBusqueda={searchTerm}
        onSearchChange={setSearchTerm}
        orden={sortOrder}
        onSortOrderChange={setSortOrder}
        onEditar={setEditingCustomer}
        onEliminar={setCustomerToDelete}
        paginacion={{
          paginaActual: currentPage,
          itemsPorPagina: itemsPerPage,
          totalPaginas: totalPages,
          onPaginaChange: setCurrentPage,
          onItemsPorPaginaChange: setItemsPerPage
        }}
      />

      <ModalCliente 
        abierto={isModalOpen || !!editingCustomer}
        onClose={() => { setIsModalOpen(false); setEditingCustomer(null); }}
        editando={!!editingCustomer}
        onSubmit={handleSubmit}
        procesando={loading}
        form={{
          ...formData,
          setNombre: (v) => setFormData(prev => ({ ...prev, nombre: v })),
          setTelefono: (v) => setFormData(prev => ({ ...prev, telefono: v })),
          setTipoCliente: (v) => setFormData(prev => ({ ...prev, tipoCliente: v })),
          setConsumoInterno: (v) => setFormData(prev => ({ ...prev, consumoInterno: v })),
          setPinConsumoInterno: (v) => setFormData(prev => ({ ...prev, pinConsumoInterno: v })),
          setPermiteCredito: (v) => setFormData(prev => ({ ...prev, permiteCredito: v })),
        }}
      />

      <DialogoEliminarCliente 
        cliente={customerToDelete}
        abierto={!!customerToDelete}
        onOpenChange={(o) => !o && setCustomerToDelete(null)}
        onConfirmar={handleDelete}
        procesando={loading}
      />
    </div>
  );
}
