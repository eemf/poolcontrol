'use client'

import { useState, useEffect, useMemo, FormEvent } from "react"
import {
  LayoutGrid, ShoppingCart, Dices, Truck, Scale, Zap, MonitorCheck,
  Boxes, DollarSign, PiggyBank, BookUser, CalendarDays, Calendar,
  Settings, Contact, Package, Ghost, ShieldCheck, HandCoins, Mic, Eraser, Percent
} from "lucide-react"
import { useFirebase, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login"
import { collection, doc, setDoc, deleteDoc, query, orderBy, runTransaction, updateDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"

export const FEATURE_GROUPS = [
  {
    name: "Módulos Base",
    features: [
      { id: 'mesas', label: 'Control de Mesas', icon: LayoutGrid },
      { id: 'ventas', label: 'Punto de Venta', icon: ShoppingCart },
      { id: 'ventasRapidas', label: 'Ventas Rápidas (Comandos)', icon: Zap },
      { id: 'asistenteVoz', label: 'Comandos de Voz (Asistente)', icon: Mic },
      { id: 'cierreCaja', label: 'Cierre de Caja', icon: Scale },
      { id: 'compras', label: 'Compras', icon: Truck },
      { id: 'tragamonedas', label: 'Tragamonedas (Operación)', icon: Dices },
    ]
  },
  {
    name: "Reportes",
    features: [
      { id: 'repMonitoreo', label: 'Monitoreo Integral', icon: MonitorCheck },
      { id: 'repControlPagos', label: 'Control de Pagos', icon: HandCoins },
      { id: 'repAuditoria', label: 'Auditoría', icon: ShieldCheck },
      { id: 'repEliminarRango', label: 'Eliminar por Rango de Fecha', icon: Eraser },
    ]
  },
  {
    name: "Administración",
    features: [
      { id: 'adminInventario', label: 'Inventario (Admin)', icon: Boxes },
      { id: 'adminGastos', label: 'Gastos', icon: DollarSign },
      { id: 'adminCuadreTraga', label: 'Cuadre Tragamonedas', icon: PiggyBank },
      { id: 'adminCuentas', label: 'Cuentas Financieras', icon: BookUser },
      { id: 'adminCuadreSemanal', label: 'Cuadre Semanal', icon: CalendarDays },
      { id: 'adminCuadreMensual', label: 'Cuadre Mensual', icon: Calendar },
    ]
  },
  {
    name: "Configuraciones y Mantenimiento",
    features: [
      { id: 'configMesas', label: 'Config. Mesas', icon: Settings },
      { id: 'configTragamonedas', label: 'Config. Tragamonedas', icon: Dices },
      { id: 'mantClientes', label: 'Mantenimiento Clientes', icon: Contact },
      { id: 'mantProductos', label: 'Mantenimiento Productos', icon: Package },
      { id: 'mantProductosVirt', label: 'Mantenimiento Prod. Virtuales', icon: Ghost },
      { id: 'mantPromociones', label: 'Gestión de Promociones', icon: Percent },
      { id: 'mantRoles', label: 'Mantenimiento Roles', icon: ShieldCheck },
    ]
  }
];

export const ALL_FEATURES = FEATURE_GROUPS.flatMap(g => g.features);

export type SucursalAdmin = {
  idSucursal: number;
  nombre: string;
  direccion?: string;
  features?: { [key: string]: boolean };
};

export type SucursalConDocId = SucursalAdmin & { docId: string };

export function useSucursalesAdmin() {
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sucursalToDelete, setSucursalToDelete] = useState<SucursalConDocId | null>(null);
  const [editingSucursal, setEditingSucursal] = useState<SucursalConDocId | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filtroVoz, setFiltroVoz] = useState<'todas' | 'con-voz' | 'sin-voz'>('todas');
  const [loading, setLoading] = useState(false);

  const { auth, firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const defaultFeatures = useMemo(
    () => ALL_FEATURES.reduce((acc, f) => ({ ...acc, [f.id]: true }), {} as { [key: string]: boolean }),
    []
  );

  const [formState, setFormState] = useState({
    nombre: '',
    direccion: '',
    features: ALL_FEATURES.reduce((acc, f) => ({ ...acc, [f.id]: true }), {} as { [key: string]: boolean }),
  });

  const sucursalQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'sucursales'), orderBy("idSucursal", "asc"));
  }, [firestore, user]);

  const { data: sucursales, isLoading: isLoadingSucursales, error } = useCollection<SucursalAdmin>(sucursalQuery);

  const resetForm = () => {
    setFormState({
      nombre: '',
      direccion: '',
      features: { ...defaultFeatures },
    });
    setEditingSucursal(null);
  };

  useEffect(() => {
    if (editingSucursal) {
      setFormState({
        nombre: editingSucursal.nombre,
        direccion: editingSucursal.direccion || '',
        features: editingSucursal.features || { ...defaultFeatures },
      });
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingSucursal]);

  useEffect(() => {
    setIsMounted(true);
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

  const handleOpenModal = (sucursal: SucursalConDocId | null) => {
    setEditingSucursal(sucursal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingSucursal(null);
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !formState.nombre) return;
    setLoading(true);

    try {
      if (editingSucursal) {
        const dataToUpdate: Partial<SucursalAdmin> = {
          nombre: formState.nombre,
          direccion: formState.direccion,
          features: formState.features,
        };
        const sucursalRef = doc(firestore, 'sucursales', editingSucursal.docId);
        await setDoc(sucursalRef, dataToUpdate, { merge: true });
      } else {
        await runTransaction(firestore, async (transaction) => {
          const correlativoRef = doc(firestore, "correlativos", "sucursales");
          const correlativoDoc = await transaction.get(correlativoRef);

          let nuevoCorrelativo = 1;
          if (correlativoDoc.exists() && correlativoDoc.data()?.correlativo) {
            nuevoCorrelativo = correlativoDoc.data().correlativo + 1;
          }

          const nuevaSucursalRef = doc(firestore, 'sucursales', nuevoCorrelativo.toString());
          const finalData: SucursalAdmin = {
            idSucursal: nuevoCorrelativo,
            nombre: formState.nombre,
            direccion: formState.direccion,
            features: formState.features,
          };

          transaction.set(nuevaSucursalRef, finalData);
          transaction.set(correlativoRef, { correlativo: nuevoCorrelativo });
        });
      }
      handleCloseModal();
    } catch (err) {
      console.error("Error guardando sucursal:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSucursal = async () => {
    if (!firestore || !sucursalToDelete) return;
    setLoading(true);
    const sucursalRef = doc(firestore, 'sucursales', sucursalToDelete.docId);
    try {
      await deleteDoc(sucursalRef);
    } catch (err) {
      console.error("Error eliminando sucursal:", err);
    } finally {
      setLoading(false);
      setSucursalToDelete(null);
    }
  };

  const handleLoginAsSucursal = (sucursal: SucursalConDocId) => {
    localStorage.setItem('selectedSucursalId', sucursal.docId);
    router.push('/dashboard');
  };

  const handleToggleVoice = async (sucursal: SucursalConDocId, enabled: boolean) => {
    if (!firestore) return;
    try {
      const sucursalRef = doc(firestore, 'sucursales', sucursal.docId);
      await updateDoc(sucursalRef, {
        'features.asistenteVoz': enabled,
      });
    } catch (err) {
      console.error("Error al actualizar control por voz:", err);
    }
  };

  const sucursalesConDocId = useMemo((): SucursalConDocId[] => {
    return (sucursales || []).map((s) => ({
      ...s,
      docId: s.id,
    }));
  }, [sucursales]);

  const conteos = useMemo(() => ({
    todas: sucursalesConDocId.length,
    conVoz: sucursalesConDocId.filter((s) => s.features?.asistenteVoz !== false).length,
    sinVoz: sucursalesConDocId.filter((s) => s.features?.asistenteVoz === false).length,
  }), [sucursalesConDocId]);

  const filteredSucursales = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return sucursalesConDocId.filter((s) => {
      const vozActiva = s.features?.asistenteVoz !== false;
      if (filtroVoz === 'con-voz' && !vozActiva) return false;
      if (filtroVoz === 'sin-voz' && vozActiva) return false;
      if (!term) return true;
      return (
        (s.nombre || '').toLowerCase().includes(term) ||
        (s.direccion || '').toLowerCase().includes(term)
      );
    });
  }, [sucursalesConDocId, searchTerm, filtroVoz]);

  const hasPermissionError = Boolean(error && error.message.includes("Missing or insufficient permissions"));

  return {
    isMounted,
    isLoading: isLoadingSucursales || isUserLoading,
    hasPermissionError,
    filteredSucursales,
    conteos,
    searchTerm,
    setSearchTerm,
    filtroVoz,
    setFiltroVoz,
    isModalOpen,
    editingSucursal,
    sucursalToDelete,
    setSucursalToDelete,
    formState,
    setFormState,
    loading,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleDeleteSucursal,
    handleLoginAsSucursal,
    handleToggleVoice,
  };
}

