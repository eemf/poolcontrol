'use client'

import { useState, useEffect, useMemo, FormEvent, useCallback } from "react"
import { useFirebase, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, runTransaction, query, orderBy, Timestamp, deleteDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { useSucursal } from "@/hooks/use-sucursal"
import type { Gasto as GastoType } from '@/lib/tipos'

// Componentes Refactorizados
import { EncabezadoGastos } from "./_components/encabezado-gastos"
import { ListaGastos } from "./_components/lista-gastos"
import { ModalGasto } from "./_components/modal-gasto"
import { DialogoEliminarGasto } from "./_components/dialogo-eliminar-gasto"

type GastoConDocId = GastoType & { docId: string };

export default function PaginaGastos() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
  const { toast } = useToast();

  // Estados de control de UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Estados para editar y eliminar
  const [editingGasto, setEditingGasto] = useState<GastoConDocId | null>(null);
  const [gastoToDelete, setGastoToDelete] = useState<GastoConDocId | null>(null);

  // Estados del formulario
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState<number | ''>('');

  // --- Consultas Firestore ---
  const gastosQuery = useMemoFirebase(() => {
    if (!firestore || !user || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/gastos`), orderBy("fecha", "desc"));
  }, [firestore, user, sucursalId]);

  const { data: todosLosGastos, isLoading: isLoadingGastos } = useCollection<GastoType>(gastosQuery);

  // --- Lógica de Filtrado y Datos ---
  const gastosConDocId = useMemo((): GastoConDocId[] => {
    if (!todosLosGastos) return [];
    const base = todosLosGastos.map((g) => ({ ...g, docId: g.id }));
    
    let result = base;
    if (!mostrarTodos) {
      result = base.filter(g => g.estado === 'pendiente');
    }
    
    if (searchTerm) {
      const f = searchTerm.toLowerCase();
      result = result.filter(g => 
        g.descripcion.toLowerCase().includes(f) || 
        String(g.idGasto).includes(f)
      );
    }
    
    return result;
  }, [todosLosGastos, mostrarTodos, searchTerm]);

  // --- Paginación ---
  const totalPages = Math.ceil(gastosConDocId.length / itemsPerPage);
  const paginatedGastos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return gastosConDocId.slice(startIndex, startIndex + itemsPerPage);
  }, [gastosConDocId, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, mostrarTodos, itemsPerPage]);

  // --- Handlers ---
  const handleOpenEdit = (gasto: GastoConDocId) => {
    setEditingGasto(gasto);
    setDescripcion(gasto.descripcion);
    setMonto(gasto.monto);
    setIsModalOpen(true);
  };

  const handleNuevoGasto = () => {
    setEditingGasto(null);
    setDescripcion('');
    setMonto('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !sucursalId || !descripcion || !monto || Number(monto) <= 0) {
      toast({ title: "Error", description: "Completa los campos obligatorios con montos válidos.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      await runTransaction(firestore, async (transaction) => {
        const dataToSave: Omit<GastoType, 'id' | 'idGasto' | 'fecha' | 'categoria'> = {
            descripcion,
            monto: Number(monto),
            usuarioId: user.uid,
            estado: 'pendiente',
        };

        if (editingGasto) {
            const gastoRef = doc(firestore, `sucursales/${sucursalId}/gastos`, editingGasto.docId);
            transaction.update(gastoRef, dataToSave);
        } else {
            const correlativoRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, "gastos");
            const correlativoDoc = await transaction.get(correlativoRef);
            const nuevoIdGasto = (correlativoDoc.data()?.correlativo || 0) + 1;

            const nuevoGastoRef = doc(firestore, `sucursales/${sucursalId}/gastos`, nuevoIdGasto.toString());
            
            const gastoCompleto: Omit<GastoType, 'id'> = {
                ...dataToSave,
                idGasto: nuevoIdGasto,
                fecha: Timestamp.now(),
            };

            transaction.set(nuevoGastoRef, gastoCompleto);
            transaction.set(correlativoRef, { correlativo: nuevoIdGasto }, { merge: true });
        }
      });

      toast({ title: "Éxito", description: `Gasto ${editingGasto ? 'actualizado' : 'registrado'} correctamente.` });
      setIsModalOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!firestore || !gastoToDelete || !sucursalId) return;
    setLoading(true);
    try {
        const gastoRef = doc(firestore, `sucursales/${sucursalId}/gastos`, gastoToDelete.docId);
        await deleteDoc(gastoRef);
        toast({ title: "Éxito", description: "Gasto eliminado." });
        setGastoToDelete(null);
    } catch(error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <EncabezadoGastos onNuevoGasto={handleNuevoGasto} />
      
      <ListaGastos 
        gastos={paginatedGastos}
        cargando={isLoadingGastos || isLoadingSucursal}
        terminoBusqueda={searchTerm}
        onTerminoBusquedaChange={setSearchTerm}
        mostrarTodos={mostrarTodos}
        onMostrarTodosChange={setMostrarTodos}
        onEditar={handleOpenEdit}
        onEliminar={setGastoToDelete}
        paginacion={{
          paginaActual: currentPage,
          itemsPorPagina: itemsPerPage,
          totalPaginas: totalPages,
          onPaginaChange: setCurrentPage,
          onItemsPorPaginaChange: setItemsPerPage
        }}
      />

      <ModalGasto 
        abierto={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editando={!!editingGasto}
        onSubmit={handleSubmit}
        procesando={loading}
        descripcion={descripcion}
        setDescripcion={setDescripcion}
        monto={monto}
        setMonto={setMonto}
      />

      <DialogoEliminarGasto 
        gasto={gastoToDelete}
        abierto={!!gastoToDelete}
        onOpenChange={(o) => !o && setGastoToDelete(null)}
        onConfirmar={handleDelete}
        procesando={loading}
      />
    </div>
  )
}
