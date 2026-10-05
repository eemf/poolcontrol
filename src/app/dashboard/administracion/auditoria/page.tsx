'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFirebase, useUser, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { useSucursal } from '@/hooks/use-sucursal';
import { collection, query, orderBy, limit, doc, getDoc, getDocs, where, Timestamp } from 'firebase/firestore';
import type { RegistroAuditoria, CategoriaAuditoria, UsuarioSucursal, Generales, CierreCaja } from '@/lib/tipos';
import { toDate } from '@/lib/firebase/servicios/utils';
import { 
  ShieldCheck, Search, Filter, Calendar, User, 
  ShoppingCart, Gamepad2, Scale, Package, Boxes, Truck, 
  Clock, ArrowUpDown, ChevronRight, RefreshCw, Eye,
  Monitor, Laptop, Tablet, Smartphone, Edit3, Check, CheckCircle2, History,
  CalendarRange, Sparkles, ArrowLeft
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader } from '@/components/ui/loader';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  obtenerInfoDetalladaDispositivo,
  obtenerNombreEquipo, 
  guardarNombreEquipo, 
  SUGERENCIAS_EQUIPOS, 
  EVENTO_EQUIPO_CAMBIADO,
  type InfoDispositivo,
  type TipoDispositivo
} from '@/lib/utils/dispositivo';

const CATEGORIAS_CONFIG: Record<
  CategoriaAuditoria,
  { label: string; color: string; badgeClass: string; icon: React.ElementType }
> = {
  VENTAS: {
    label: 'Ventas y Cobros',
    color: 'text-blue-500 dark:text-blue-400',
    badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    icon: ShoppingCart,
  },
  MESAS: {
    label: 'Sala de Juegos',
    color: 'text-emerald-500 dark:text-emerald-400',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    icon: Gamepad2,
  },
  CAJA: {
    label: 'Caja y Turnos',
    color: 'text-amber-500 dark:text-amber-400',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    icon: Scale,
  },
  CATALOGO: {
    label: 'Catálogo',
    color: 'text-purple-500 dark:text-purple-400',
    badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    icon: Package,
  },
  INVENTARIO: {
    label: 'Inventario',
    color: 'text-indigo-500 dark:text-indigo-400',
    badgeClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    icon: Boxes,
  },
  COMPRAS: {
    label: 'Compras',
    color: 'text-orange-500 dark:text-orange-400',
    badgeClass: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    icon: Truck,
  },
};

/**
 * Función auxiliar para resolver el icono, etiqueta y colores según el tipo de dispositivo
 */
export function resolverMetaDispositivo(tipo?: string, nombre?: string, so?: string) {
  const n = (nombre || '').toLowerCase();
  const t = (tipo || '').toLowerCase();
  const s = (so || '').toLowerCase();

  if (t === 'tablet' || n.includes('tablet') || n.includes('ipad') || s.includes('ipad')) {
    return {
      icon: Tablet,
      label: 'Tablet',
      badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800',
      color: 'text-amber-500 dark:text-amber-400',
    };
  }

  if (
    t === 'telefono' ||
    n.includes('celular') ||
    n.includes('teléfono') ||
    n.includes('telefono') ||
    n.includes('móvil') ||
    n.includes('movil') ||
    n.includes('iphone') ||
    (t !== 'computadora' && (s.includes('ios') || s.includes('android')) && !s.includes('ipad'))
  ) {
    return {
      icon: Smartphone,
      label: 'Teléfono',
      badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
      color: 'text-emerald-500 dark:text-emerald-400',
    };
  }

  return {
    icon: Monitor,
    label: 'Computadora',
    badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800',
    color: 'text-blue-500 dark:text-blue-400',
  };
}

export interface ItemAuditoriaVisual {
  nombre: string;
  cantidad: number;
  precioUnitario?: number;
  subtotal?: number;
  tipo?: 'agregado' | 'devuelto' | 'pagado' | 'ajustado' | 'info';
}

/**
 * Extrae los artículos, cantidades y precios involucrados en un registro de auditoría
 */
export function extraerArticulosDeRegistro(reg?: RegistroAuditoria | null): ItemAuditoriaVisual[] {
  if (!reg || !reg.detalles) return [];
  const d = reg.detalles;

  // 1. itemsAgregados (nuevo formato estructurado en ventas y cobros)
  if (Array.isArray(d.itemsAgregados) && d.itemsAgregados.length > 0) {
    return d.itemsAgregados.map((it: any) => ({
      nombre: it.nombre || it.nombreProducto || 'Producto',
      cantidad: Number(it.cantidad) || 1,
      precioUnitario: it.precioUnitario ? Number(it.precioUnitario) : undefined,
      subtotal: it.subtotal ? Number(it.subtotal) : ((Number(it.cantidad) || 1) * (Number(it.precioUnitario) || 0)),
      tipo: 'agregado' as const,
    }));
  }

  // 2. itemsDevueltos / itemsRevertidos (anulaciones de venta o devoluciones)
  const itemsDev = d.itemsDevueltos || d.itemsRevertidos;
  if (Array.isArray(itemsDev) && itemsDev.length > 0) {
    return itemsDev.map((it: any) => ({
      nombre: it.nombre || it.nombreProducto || 'Producto',
      cantidad: Number(it.cantidad) || 1,
      tipo: 'devuelto' as const,
    }));
  }

  // 3. items (usado en compras o consumos)
  if (Array.isArray(d.items) && d.items.length > 0) {
    return d.items.map((it: any) => ({
      nombre: it.nombre || it.nombreProducto || 'Producto',
      cantidad: Number(it.cantidad) || 1,
      precioUnitario: it.precioUnitario ? Number(it.precioUnitario) : (it.costoUnitario ? Number(it.costoUnitario) : undefined),
      subtotal: it.subtotal ? Number(it.subtotal) : ((Number(it.cantidad) || 1) * (Number(it.precioUnitario || it.costoUnitario) || 0)),
      tipo: 'info' as const,
    }));
  }

  // 4. consumos (sala de mesas)
  if (Array.isArray(d.consumos) && d.consumos.length > 0) {
    return d.consumos.map((it: any) => ({
      nombre: it.nombreProducto || it.nombre || 'Consumo',
      cantidad: Number(it.cantidad) || 1,
      subtotal: it.total ? Number(it.total) : (it.subtotal ? Number(it.subtotal) : undefined),
      precioUnitario: it.precioUnitario ? Number(it.precioUnitario) : undefined,
      tipo: 'agregado' as const,
    }));
  }

  // 5. productosAjustados (inventario)
  if (Array.isArray(d.productosAjustados) && d.productosAjustados.length > 0) {
    return d.productosAjustados.map((it: any) => ({
      nombre: it.nombre || it.nombreProducto || 'Producto',
      cantidad: Number(it.diferencia) || Number(it.cantidad) || 0,
      tipo: 'ajustado' as const,
    }));
  }

  // 6. itemsPagados (liquidación / cobro)
  if (Array.isArray(d.itemsPagados) && d.itemsPagados.length > 0) {
    return d.itemsPagados.map((it: any) => ({
      nombre: it.nombre || it.nombreProducto || 'Ítem pagado',
      cantidad: 1,
      subtotal: it.monto ? Number(it.monto) : undefined,
      tipo: 'pagado' as const,
    }));
  }

  // 7. producto + cantidad (venta rápida)
  if (d.producto && d.cantidad) {
    return [{
      nombre: String(d.producto),
      cantidad: Number(d.cantidad),
      subtotal: d.total ? Number(d.total) : undefined,
      tipo: 'agregado' as const,
    }];
  }

  return [];
}

export default function PaginaAuditoria() {
  const { firestore } = useFirebase();
  const { user: currentUser, profile: currentProfile } = useUser();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();

  // Selector de Período (Predeterminado: 'abierto')
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<string>('abierto');

  // Filtros generales
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('TODAS');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<string>('TODOS');
  const [filtroFecha, setFiltroFecha] = useState<'HOY' | '7DIAS' | '30DIAS' | 'TODOS'>('HOY');
  const [limiteConsulta, setLimiteConsulta] = useState<number>(150);

  // Modal de detalles de registro
  const [registroDetalle, setRegistroDetalle] = useState<RegistroAuditoria | null>(null);

  // Artículos recuperados dinámicamente si el registro antiguo no los traía en detalles
  const [articulosRecuperados, setArticulosRecuperados] = useState<ItemAuditoriaVisual[] | null>(null);
  const [cargandoArticulos, setCargandoArticulos] = useState<boolean>(false);

  // Gestión e Información del Dispositivo Local Actual
  const [infoDispositivoLocal, setInfoDispositivoLocal] = useState<InfoDispositivo>({
    tipo: 'computadora',
    nombre: 'Terminal POS',
    so: 'Windows',
    navegador: 'Chrome',
  });
  const [nombreEquipoLocal, setNombreEquipoLocal] = useState<string>('Terminal POS');
  const [dialogoEquipoAbierto, setDialogoEquipoAbierto] = useState<boolean>(false);
  const [inputNombreEquipo, setInputNombreEquipo] = useState<string>('');

  // Cache dinámico de usuarios consultados desde Firestore (user_auth_lookup o usuarios)
  const [usuariosExtra, setUsuariosExtra] = useState<Record<string, { nombre: string; email: string; rol: string }>>({});

  // Cargar y escuchar el dispositivo y nombre configurado localmente
  useEffect(() => {
    const info = obtenerInfoDetalladaDispositivo();
    setInfoDispositivoLocal(info);
    setNombreEquipoLocal(info.nombre);
    setInputNombreEquipo(info.nombre);

    const handleCambioEquipo = (e: any) => {
      const nuevoNom = typeof e?.detail === 'string' ? e.detail : e?.detail?.nombre;
      if (nuevoNom) {
        setNombreEquipoLocal(nuevoNom);
        const actual = obtenerInfoDetalladaDispositivo();
        setInfoDispositivoLocal(actual);
      }
    };

    window.addEventListener(EVENTO_EQUIPO_CAMBIADO, handleCambioEquipo);
    return () => {
      window.removeEventListener(EVENTO_EQUIPO_CAMBIADO, handleCambioEquipo);
    };
  }, []);

  // Efecto para recuperar artículos de una venta si el registro de auditoría es antiguo y no los tiene en detalles
  useEffect(() => {
    if (!registroDetalle || !firestore || !sucursalId) {
      setArticulosRecuperados(null);
      setCargandoArticulos(false);
      return;
    }

    const itemsExistentes = extraerArticulosDeRegistro(registroDetalle);
    if (itemsExistentes.length > 0) {
      setArticulosRecuperados(null);
      setCargandoArticulos(false);
      return;
    }

    // Buscar si hay referencia a venta
    const idVenta = registroDetalle.detalles?.idVenta || registroDetalle.detalles?.ventaId;
    const matchTitulo = (registroDetalle.titulo || '').match(/#(\d+)/);
    const idVentaFinal = idVenta ? String(idVenta) : (matchTitulo ? matchTitulo[1] : null);

    if (!idVentaFinal || (registroDetalle.categoria !== 'VENTAS' && registroDetalle.categoria !== 'MESAS')) {
      setArticulosRecuperados(null);
      setCargandoArticulos(false);
      return;
    }

    setCargandoArticulos(true);
    let activo = true;

    const buscarVentaOProductos = async () => {
      try {
        // 1. Probar por ID de documento directo
        const docDirecto = await getDoc(doc(firestore, `sucursales/${sucursalId}/ventas`, idVentaFinal));
        if (activo && docDirecto.exists()) {
          const data = docDirecto.data();
          if (Array.isArray(data.detalles) && data.detalles.length > 0) {
            setArticulosRecuperados(data.detalles.map((d: any) => ({
              nombre: d.nombreProducto || 'Producto',
              cantidad: Number(d.cantidad) || 1,
              precioUnitario: d.precioUnitario ? Number(d.precioUnitario) : undefined,
              subtotal: d.subtotal ? Number(d.subtotal) : ((Number(d.cantidad) || 1) * (Number(d.precioUnitario) || 0)),
              tipo: 'agregado' as const,
            })));
            setCargandoArticulos(false);
            return;
          }
        }

        // 2. Probar por campo numérico idVenta
        const num = parseInt(idVentaFinal, 10);
        if (!isNaN(num)) {
          const q = query(
            collection(firestore, `sucursales/${sucursalId}/ventas`),
            where('idVenta', '==', num),
            limit(1)
          );
          const snap = await getDocs(q);
          if (activo && !snap.empty) {
            const data = snap.docs[0].data();
            if (Array.isArray(data.detalles) && data.detalles.length > 0) {
              setArticulosRecuperados(data.detalles.map((d: any) => ({
                nombre: d.nombreProducto || 'Producto',
                cantidad: Number(d.cantidad) || 1,
                precioUnitario: d.precioUnitario ? Number(d.precioUnitario) : undefined,
                subtotal: d.subtotal ? Number(d.subtotal) : ((Number(d.cantidad) || 1) * (Number(d.precioUnitario) || 0)),
                tipo: 'agregado' as const,
              })));
              setCargandoArticulos(false);
              return;
            }
          }
        }

        // 3. Buscar en historial_inventario si hay registros de esa venta
        const qHist = query(
          collection(firestore, `sucursales/${sucursalId}/historial_inventario`),
          where('referencia', '==', `Venta #${idVentaFinal}`),
          limit(20)
        );
        const snapHist = await getDocs(qHist);
        if (activo && !snapHist.empty) {
          setArticulosRecuperados(snapHist.docs.map((d: any) => {
            const hist = d.data();
            return {
              nombre: hist.nombreProducto || 'Producto',
              cantidad: Math.abs(Number(hist.cantidad) || 1),
              tipo: 'agregado' as const,
            };
          }));
          setCargandoArticulos(false);
          return;
        }

        if (activo) {
          setArticulosRecuperados(null);
          setCargandoArticulos(false);
        }
      } catch (err) {
        console.warn('Error al recuperar artículos de auditoría:', err);
        if (activo) {
          setArticulosRecuperados(null);
          setCargandoArticulos(false);
        }
      }
    };

    buscarVentaOProductos();

    return () => {
      activo = false;
    };
  }, [registroDetalle, firestore, sucursalId]);

  // Guardar cambio de nombre del equipo
  const handleGuardarNombreEquipo = (nombreAGuardar?: string) => {
    const valor = (nombreAGuardar || inputNombreEquipo).trim();
    if (!valor) return;
    const finalGuardado = guardarNombreEquipo(valor);
    setNombreEquipoLocal(finalGuardado);
    setDialogoEquipoAbierto(false);
  };

  // 1. Obtener información del turno actual (generales/actual) para conocer la fecha de apertura
  const generalesRef = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return doc(firestore, `sucursales/${sucursalId}/generales/actual`);
  }, [firestore, sucursalId]);

  const { data: turnoActual, isLoading: isLoadingTurnoActual } = useDoc<Generales>(generalesRef);

  // 2. Obtener lista de cierres de caja anteriores para permitir seleccionar turnos pasados
  const cierresQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(
      collection(firestore, `sucursales/${sucursalId}/cierre_caja`),
      orderBy('fecha', 'desc'),
      limit(60)
    );
  }, [firestore, sucursalId]);

  const { data: cierres, isLoading: isLoadingCierres } = useCollection<CierreCaja>(cierresQuery);

  // 3. Resolver los límites temporales del período seleccionado
  const infoPeriodo = useMemo(() => {
    if (periodoSeleccionado === 'abierto') {
      const inicio = turnoActual?.fechaInicioPeriodo ? toDate(turnoActual.fechaInicioPeriodo) : null;
      return {
        tipo: 'abierto' as const,
        label: 'Período Abierto (En curso)',
        inicio,
        fin: null,
        esAbierto: true,
      };
    }

    if (periodoSeleccionado === 'todos') {
      return {
        tipo: 'todos' as const,
        label: 'Historial Completo (Todos los períodos)',
        inicio: null,
        fin: null,
        esAbierto: false,
      };
    }

    // Buscar en los turnos cerrados
    const cierre = cierres?.find((c) => c.id === periodoSeleccionado);
    if (cierre) {
      const fin = toDate(cierre.fecha);
      let inicio: Date | null = null;
      if (cierre.inicioDelPeriodo) {
        inicio = toDate(cierre.inicioDelPeriodo);
      } else if (cierres) {
        const ordenados = [...cierres].sort((a, b) => b.idCuadre - a.idCuadre);
        const idx = ordenados.findIndex((item) => item.id === cierre.id);
        if (idx !== -1 && idx + 1 < ordenados.length) {
          inicio = toDate(ordenados[idx + 1].fecha);
        }
      }
      if (!inicio) {
        inicio = new Date(fin.getTime() - 24 * 60 * 60 * 1000);
      }

      return {
        tipo: 'cierre' as const,
        label: `Turno #${cierre.idCuadre}`,
        inicio,
        fin,
        cierre,
        esAbierto: false,
      };
    }

    return {
      tipo: 'abierto' as const,
      label: 'Período Abierto',
      inicio: null,
      fin: null,
      esAbierto: true,
    };
  }, [periodoSeleccionado, turnoActual, cierres]);

  // 4. Consulta de auditoría optimizada delimitada por fecha en Firestore
  const auditoriaQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;

    // Caso 1: Período abierto (comportamiento predeterminado)
    if (periodoSeleccionado === 'abierto') {
      if (infoPeriodo.inicio) {
        return query(
          collection(firestore, `sucursales/${sucursalId}/auditoria`),
          where('fecha', '>=', Timestamp.fromDate(infoPeriodo.inicio)),
          orderBy('fecha', 'desc'),
          limit(limiteConsulta)
        );
      }
      if (isLoadingTurnoActual) return null;

      const inicioHoy = new Date();
      inicioHoy.setHours(0, 0, 0, 0);
      return query(
        collection(firestore, `sucursales/${sucursalId}/auditoria`),
        where('fecha', '>=', Timestamp.fromDate(inicioHoy)),
        orderBy('fecha', 'desc'),
        limit(limiteConsulta)
      );
    }

    // Caso 2: Turno cerrado específico
    if (periodoSeleccionado !== 'abierto' && periodoSeleccionado !== 'todos') {
      if (infoPeriodo.inicio && infoPeriodo.fin) {
        return query(
          collection(firestore, `sucursales/${sucursalId}/auditoria`),
          where('fecha', '>=', Timestamp.fromDate(infoPeriodo.inicio)),
          where('fecha', '<=', Timestamp.fromDate(infoPeriodo.fin)),
          orderBy('fecha', 'desc'),
          limit(limiteConsulta)
        );
      } else if (infoPeriodo.fin) {
        return query(
          collection(firestore, `sucursales/${sucursalId}/auditoria`),
          where('fecha', '<=', Timestamp.fromDate(infoPeriodo.fin)),
          orderBy('fecha', 'desc'),
          limit(limiteConsulta)
        );
      }
    }

    // Caso 3: Historial completo seleccionado explícitamente
    return query(
      collection(firestore, `sucursales/${sucursalId}/auditoria`),
      orderBy('fecha', 'desc'),
      limit(limiteConsulta)
    );
  }, [firestore, sucursalId, periodoSeleccionado, infoPeriodo, isLoadingTurnoActual, limiteConsulta]);

  const { data: registrosRaw, isLoading: isLoadingRegistros } = useCollection<RegistroAuditoria>(auditoriaQuery);

  // Consulta de usuarios registrados en la sucursal para enriquecer la bitácora
  const usuariosQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/usuarios`));
  }, [firestore, sucursalId]);

  const { data: usuariosRegistrados } = useCollection<UsuarioSucursal>(usuariosQuery);

  // Mapa de resolución rápida de usuario por UID
  const mapaUsuarios = useMemo(() => {
    const map = new Map<string, { nombre: string; email: string; rol: string }>();
    (usuariosRegistrados || []).forEach((u: any) => {
      const uid = u.authUid || u.id;
      if (uid) {
        map.set(uid, {
          nombre: u.nombre || 'Usuario',
          email: u.email || '',
          rol: u.rol || 'Operador',
        });
      }
    });
    return map;
  }, [usuariosRegistrados]);

  // Efecto para buscar en Firestore los usuarios faltantes (de user_auth_lookup o usuarios)
  useEffect(() => {
    if (!firestore || !registrosRaw || registrosRaw.length === 0) return;

    const uidsFaltantes = new Set<string>();
    registrosRaw.forEach((reg) => {
      const uid = reg.usuarioId;
      if (
        uid && 
        uid !== 'desconocido' && 
        !mapaUsuarios.has(uid) && 
        !usuariosExtra[uid] && 
        uid !== currentUser?.uid
      ) {
        uidsFaltantes.add(uid);
      }
    });

    if (uidsFaltantes.size === 0) return;

    // Buscar cada UID en user_auth_lookup
    uidsFaltantes.forEach(async (uid) => {
      try {
        const snap = await getDoc(doc(firestore, 'user_auth_lookup', uid));
        if (snap.exists()) {
          const data = snap.data();
          const nombreEncontrado = data.nombre || (data.email ? data.email.split('@')[0] : 'Operador');
          setUsuariosExtra((prev) => ({
            ...prev,
            [uid]: {
              nombre: nombreEncontrado,
              email: data.email || '',
              rol: data.rol || 'Operador',
            },
          }));
          return;
        }

        const snapRoot = await getDoc(doc(firestore, 'usuarios', uid));
        if (snapRoot.exists()) {
          const dataRoot = snapRoot.data();
          const nombreRoot = dataRoot.nombre || (dataRoot.email ? dataRoot.email.split('@')[0] : 'Operador');
          setUsuariosExtra((prev) => ({
            ...prev,
            [uid]: {
              nombre: nombreRoot,
              email: dataRoot.email || '',
              rol: dataRoot.rol || 'Operador',
            },
          }));
        }
      } catch (err) {
        console.warn('No se pudo cargar información del usuario para auditoría:', uid);
      }
    });
  }, [firestore, registrosRaw, mapaUsuarios, usuariosExtra, currentUser]);

  // Función robusta para resolver nombre, correo y rol reales del usuario
  const resolverUsuario = (reg: RegistroAuditoria) => {
    const esNombreValido = (nom?: string) => {
      if (!nom) return false;
      const t = nom.trim();
      if (t === '' || t === 'Usuario del sistema' || t === 'desconocido') return false;
      if (t === reg.usuarioId) return false;
      if (t.length >= 20 && !t.includes(' ') && !t.includes('@')) return false;
      return true;
    };

    if (esNombreValido(reg.usuarioNombre)) {
      return {
        nombre: reg.usuarioNombre,
        email: reg.usuarioEmail || '',
        rol: reg.usuarioRol || 'Operador',
      };
    }

    if (currentUser && (currentUser.uid === reg.usuarioId || (reg.usuarioEmail && currentUser.email === reg.usuarioEmail))) {
      const nombreActual = currentProfile?.nombre 
        || currentUser.displayName 
        || (currentUser.email ? currentUser.email.split('@')[0] : 'Administrador');
      return {
        nombre: nombreActual,
        email: currentUser.email || reg.usuarioEmail || '',
        rol: currentProfile?.rol || reg.usuarioRol || 'Administrador',
      };
    }

    const infoSucursal = mapaUsuarios.get(reg.usuarioId);
    if (infoSucursal && esNombreValido(infoSucursal.nombre)) {
      return {
        nombre: infoSucursal.nombre,
        email: reg.usuarioEmail || infoSucursal.email || '',
        rol: reg.usuarioRol || infoSucursal.rol || 'Operador',
      };
    }

    const infoExtra = usuariosExtra[reg.usuarioId];
    if (infoExtra && esNombreValido(infoExtra.nombre)) {
      return {
        nombre: infoExtra.nombre,
        email: reg.usuarioEmail || infoExtra.email || '',
        rol: reg.usuarioRol || infoExtra.rol || 'Operador',
      };
    }

    if (reg.usuarioEmail && reg.usuarioEmail.includes('@')) {
      const parteCorreo = reg.usuarioEmail.split('@')[0];
      const capitalizado = parteCorreo.charAt(0).toUpperCase() + parteCorreo.slice(1);
      return {
        nombre: capitalizado,
        email: reg.usuarioEmail,
        rol: reg.usuarioRol || 'Operador',
      };
    }

    if (infoSucursal?.email && infoSucursal.email.includes('@')) {
      const parteCorreo = infoSucursal.email.split('@')[0];
      const capitalizado = parteCorreo.charAt(0).toUpperCase() + parteCorreo.slice(1);
      return {
        nombre: capitalizado,
        email: infoSucursal.email,
        rol: infoSucursal.rol || 'Operador',
      };
    }

    return {
      nombre: 'Operador del sistema',
      email: reg.usuarioEmail || '',
      rol: reg.usuarioRol || 'Operador',
    };
  };

  // Formateadores de fecha
  const formatearFechaHora = (fecha: any) => {
    if (!fecha) return 'Fecha no disponible';
    const dateObj = toDate(fecha);
    return new Intl.DateTimeFormat('es-GT', {
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(dateObj);
  };

  const formatearFechaCorta = (fecha: any) => {
    if (!fecha) return '';
    const dateObj = toDate(fecha);
    return new Intl.DateTimeFormat('es-GT', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  };

  const formatearHoraRelativa = (fecha: any) => {
    if (!fecha) return '';
    const dateObj = toDate(fecha);
    const ahora = new Date();
    const diffMs = ahora.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMins / 60);
    const diffDias = Math.floor(diffHoras / 24);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHoras < 24) return `Hace ${diffHoras} h`;
    if (diffDias === 1) return 'Ayer';
    if (diffDias < 7) return `Hace ${diffDias} días`;
    return dateObj.toLocaleDateString('es-GT');
  };

  // Lista única de usuarios con nombres reales para el selector de filtro
  const listaUsuarios = useMemo(() => {
    const map = new Map<string, { id: string; nombre: string }>();

    (usuariosRegistrados || []).forEach((u: any) => {
      const uid = u.authUid || u.id;
      if (uid && u.nombre) {
        map.set(uid, { id: uid, nombre: u.nombre });
      }
    });

    if (currentUser?.uid) {
      const miNombre = currentProfile?.nombre || currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Mi Usuario');
      map.set(currentUser.uid, { id: currentUser.uid, nombre: `${miNombre} (Tú)` });
    }

    (registrosRaw || []).forEach((reg) => {
      if (reg.usuarioId && !map.has(reg.usuarioId)) {
        const u = resolverUsuario(reg);
        map.set(reg.usuarioId, {
          id: reg.usuarioId,
          nombre: u.nombre,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [registrosRaw, usuariosRegistrados, mapaUsuarios, usuariosExtra, currentUser, currentProfile]);

  // Filtrado reactivo en cliente (categoría, usuario, búsqueda por equipo/dispositivo)
  const registrosFiltrados = useMemo(() => {
    if (!registrosRaw) return [];

    const ahora = new Date();
    const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()).getTime();
    const hace7Dias = ahora.getTime() - 7 * 24 * 60 * 60 * 1000;
    const hace30Dias = ahora.getTime() - 30 * 24 * 60 * 60 * 1000;

    return registrosRaw.filter((reg) => {
      if (categoriaSeleccionada !== 'TODAS' && reg.categoria !== categoriaSeleccionada) {
        return false;
      }

      if (usuarioSeleccionado !== 'TODOS' && reg.usuarioId !== usuarioSeleccionado) {
        return false;
      }

      if (periodoSeleccionado === 'todos') {
        const fechaMs = reg.fecha?.toDate ? reg.fecha.toDate().getTime() : new Date(reg.fecha).getTime();
        if (filtroFecha === 'HOY' && fechaMs < inicioHoy) return false;
        if (filtroFecha === '7DIAS' && fechaMs < hace7Dias) return false;
        if (filtroFecha === '30DIAS' && fechaMs < hace30Dias) return false;
      }

      if (busqueda.trim() !== '') {
        const queryTerm = busqueda.toLowerCase().trim();
        const userResolved = resolverUsuario(reg);
        const textoTitulo = (reg.titulo || '').toLowerCase();
        const textoDesc = (reg.descripcion || '').toLowerCase();
        const textoUsuario = (userResolved.nombre || '').toLowerCase();
        const textoEmail = (userResolved.email || '').toLowerCase();
        const textoEquipo = (reg.nombreEquipo || 'Terminal POS').toLowerCase();
        const textoTipoDisp = (reg.tipoDispositivo || '').toLowerCase();
        const textoAccion = (reg.accion || '').toLowerCase();
        const textoDetalles = JSON.stringify(reg.detalles || {}).toLowerCase();

        const coincide =
          textoTitulo.includes(queryTerm) ||
          textoDesc.includes(queryTerm) ||
          textoUsuario.includes(queryTerm) ||
          textoEmail.includes(queryTerm) ||
          textoEquipo.includes(queryTerm) ||
          textoTipoDisp.includes(queryTerm) ||
          textoAccion.includes(queryTerm) ||
          textoDetalles.includes(queryTerm);

        if (!coincide) return false;
      }

      return true;
    });
  }, [registrosRaw, categoriaSeleccionada, usuarioSeleccionado, filtroFecha, periodoSeleccionado, busqueda, mapaUsuarios, usuariosExtra]);

  // Resumen de estadísticas
  const estadisticas = useMemo(() => {
    const total = registrosFiltrados.length;
    const ventas = registrosFiltrados.filter((r) => r.categoria === 'VENTAS').length;
    const mesas = registrosFiltrados.filter((r) => r.categoria === 'MESAS').length;
    const caja = registrosFiltrados.filter((r) => r.categoria === 'CAJA').length;
    const otros = total - ventas - mesas - caja;
    return { total, ventas, mesas, caja, otros };
  }, [registrosFiltrados]);

  // Resolver metadata visual del dispositivo local actual
  const metaDispositivoLocal = useMemo(() => {
    return resolverMetaDispositivo(
      infoDispositivoLocal.tipo, 
      nombreEquipoLocal, 
      infoDispositivoLocal.so
    );
  }, [infoDispositivoLocal, nombreEquipoLocal]);

  const CurrentDeviceIcon = metaDispositivoLocal.icon;

  if (isLoadingSucursal) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-primary" />
            Auditoría de Operaciones
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Registro cronológico y trazabilidad completa de transacciones, usuarios, computadoras, tablets y teléfonos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Identificador interactivo de este equipo con su icono real (PC, Tablet o Teléfono) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setInputNombreEquipo(nombreEquipoLocal);
              setDialogoEquipoAbierto(true);
            }}
            className="h-8 gap-1.5 text-xs bg-card hover:bg-muted/60 border shadow-xs"
            title="Haz clic para personalizar el nombre de este equipo o ver sus datos"
          >
            <CurrentDeviceIcon className={`h-3.5 w-3.5 ${metaDispositivoLocal.color} shrink-0`} />
            <span>Este equipo: <strong className="text-foreground">{nombreEquipoLocal}</strong></span>
            <Badge variant="outline" className={`text-[9px] px-1 py-0 h-3.5 ${metaDispositivoLocal.badgeClass}`}>
              {metaDispositivoLocal.label}
            </Badge>
            <Edit3 className="h-3 w-3 text-muted-foreground ml-0.5" />
          </Button>

          <Badge variant="outline" className="px-3 py-1 text-xs text-muted-foreground bg-muted/40">
            {registrosFiltrados.length} eventos
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setLimiteConsulta((prev) => (prev === 150 ? 300 : 150))}
            className="text-xs gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {limiteConsulta === 150 ? 'Cargar 300' : 'Ver 150'}
          </Button>
        </div>
      </div>

      {/* Banner de Estado del Período Consultado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-lg border bg-card/70 backdrop-blur-sm shadow-xs">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <CalendarRange className="h-4 w-4 text-primary" />
            Período visualizado:
          </span>

          {periodoSeleccionado === 'abierto' ? (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 gap-1.5 font-medium py-0.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Período Abierto (En curso)
            </Badge>
          ) : periodoSeleccionado === 'todos' ? (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800 font-medium py-0.5">
              Historial Completo
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800 font-medium py-0.5">
              {infoPeriodo.label} (Cerrado)
            </Badge>
          )}

          <span className="text-muted-foreground text-xs">
            {periodoSeleccionado === 'abierto'
              ? (infoPeriodo.inicio 
                  ? `Iniciado el ${formatearFechaHora(infoPeriodo.inicio)} (operaciones en tiempo real)` 
                  : 'Turno activo actualmente')
              : infoPeriodo.inicio && infoPeriodo.fin
              ? `Del ${formatearFechaHora(infoPeriodo.inicio)} al ${formatearFechaHora(infoPeriodo.fin)}`
              : 'Todos los registros almacenados'}
          </span>
        </div>

        {periodoSeleccionado !== 'abierto' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPeriodoSeleccionado('abierto')}
            className="h-7 text-xs text-primary hover:text-primary gap-1 self-start sm:self-auto px-2"
          >
            <ArrowLeft className="h-3 w-3" />
            Volver al período abierto
          </Button>
        )}
      </div>

      {/* Tarjetas de Métricas Rápidas del Período */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 bg-card/60 backdrop-blur-sm border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Eventos</span>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold mt-1 text-foreground">{estadisticas.total}</div>
        </Card>
        <Card className="p-4 bg-card/60 backdrop-blur-sm border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Ventas y Cobros</span>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{estadisticas.ventas}</div>
        </Card>
        <Card className="p-4 bg-card/60 backdrop-blur-sm border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Sala de Juegos</span>
            <Gamepad2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{estadisticas.mesas}</div>
        </Card>
        <Card className="p-4 bg-card/60 backdrop-blur-sm border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Caja y Turnos</span>
            <Scale className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">{estadisticas.caja}</div>
        </Card>
      </div>

      {/* Barra de Filtros, Selector de Período y Búsqueda */}
      <Card className="p-4 bg-card/80 border shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Selector de Período de Caja (Turno Abierto / Cierres) */}
          <div>
            <Select value={periodoSeleccionado} onValueChange={setPeriodoSeleccionado}>
              <SelectTrigger className="h-9 text-sm font-medium">
                <div className="flex items-center gap-2 truncate">
                  <History className="h-3.5 w-3.5 text-primary shrink-0" />
                  <SelectValue placeholder="Seleccionar período" />
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="abierto" className="font-semibold text-emerald-600 dark:text-emerald-400">
                  🟢 Período Abierto (En curso)
                </SelectItem>
                
                {cierres && cierres.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground">
                      Turnos Cerrados Anteriores
                    </div>
                    {cierres.map((c) => {
                      const fechaStr = formatearFechaCorta(c.fecha);
                      return (
                        <SelectItem key={c.id} value={c.id}>
                          Turno #{c.idCuadre} • {fechaStr}
                        </SelectItem>
                      );
                    })}
                  </>
                )}

                <Separator className="my-1" />
                <SelectItem value="todos" className="text-muted-foreground font-medium">
                  🌐 Historial Completo (Todos)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por usuario, equipo, tablet, PC..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* Selector de Usuario con nombres reales */}
          <div>
            <Select value={usuarioSeleccionado} onValueChange={setUsuarioSeleccionado}>
              <SelectTrigger className="h-9 text-sm">
                <div className="flex items-center gap-2 truncate">
                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Todos los usuarios" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos los usuarios</SelectItem>
                {listaUsuarios.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selector de Categoría */}
          <div>
            <Select value={categoriaSeleccionada} onValueChange={setCategoriaSeleccionada}>
              <SelectTrigger className="h-9 text-sm">
                <div className="flex items-center gap-2 truncate">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Todas las categorías" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas las categorías</SelectItem>
                <SelectItem value="VENTAS">Ventas y Cobros</SelectItem>
                <SelectItem value="MESAS">Sala de Juegos</SelectItem>
                <SelectItem value="CAJA">Caja y Turnos</SelectItem>
                <SelectItem value="CATALOGO">Catálogo de Productos</SelectItem>
                <SelectItem value="INVENTARIO">Inventario y Ajustes</SelectItem>
                <SelectItem value="COMPRAS">Compras y Proveedores</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Categorías en formato Pills para navegación rápida */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs no-scrollbar">
          <Button
            variant={categoriaSeleccionada === 'TODAS' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setCategoriaSeleccionada('TODAS')}
            className="h-7 px-2.5 text-xs font-normal"
          >
            Todas ({registrosRaw?.length || 0})
          </Button>
          {(Object.keys(CATEGORIAS_CONFIG) as CategoriaAuditoria[]).map((catKey) => {
            const config = CATEGORIAS_CONFIG[catKey];
            const Icon = config.icon;
            const esActivo = categoriaSeleccionada === catKey;
            return (
              <Button
                key={catKey}
                variant={esActivo ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setCategoriaSeleccionada(catKey)}
                className={`h-7 px-2.5 text-xs font-normal gap-1.5 ${esActivo ? 'font-medium' : 'text-muted-foreground'}`}
              >
                <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                {config.label}
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Lista de Eventos de Auditoría */}
      <div className="space-y-2.5">
        {(isLoadingRegistros || (periodoSeleccionado === 'abierto' && isLoadingTurnoActual)) ? (
          <div className="flex flex-col items-center justify-center p-12 bg-card rounded-lg border">
            <Loader className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">
              {periodoSeleccionado === 'abierto'
                ? 'Cargando movimientos del período abierto...'
                : 'Cargando registros de auditoría...'}
            </p>
          </div>
        ) : registrosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-card rounded-lg border text-center">
            <ShieldCheck className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <h3 className="text-base font-semibold text-foreground">No se encontraron movimientos</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              {periodoSeleccionado === 'abierto'
                ? 'Aún no hay transacciones u operaciones registradas en el turno actual abierto.'
                : 'No hay actividades registradas para este período o con los filtros seleccionados.'}
            </p>
          </div>
        ) : (
          registrosFiltrados.map((registro) => {
            const catConfig = CATEGORIAS_CONFIG[registro.categoria] || {
              label: registro.categoria,
              color: 'text-foreground',
              badgeClass: 'bg-muted text-foreground',
              icon: ShieldCheck,
            };
            const IconComponent = catConfig.icon;
            const userInfo = resolverUsuario(registro);
            const equipoNombre = registro.nombreEquipo || 'Terminal POS';
            
            // Resolver icono y etiqueta específicos del dispositivo (PC, Tablet o Teléfono)
            const deviceMeta = resolverMetaDispositivo(
              registro.tipoDispositivo,
              registro.nombreEquipo,
              registro.detallesDispositivo?.so
            );
            const DeviceIcon = deviceMeta.icon;

            return (
              <div
                key={registro.id}
                onClick={() => setRegistroDetalle(registro)}
                className="group p-4 bg-card hover:bg-muted/40 transition-colors border rounded-lg shadow-xs cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Ícono de categoría */}
                  <div className={`p-2 rounded-md shrink-0 border ${catConfig.badgeClass}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>

                  {/* Contenido principal */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        {registro.titulo}
                      </span>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${catConfig.badgeClass}`}>
                        {catConfig.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        • {formatearHoraRelativa(registro.fecha)}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {registro.descripcion}
                    </p>

                    {/* Chips de productos y cantidades involucrados */}
                    {(() => {
                      const itemsCard = extraerArticulosDeRegistro(registro);
                      if (itemsCard.length === 0) return null;
                      return (
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {itemsCard.slice(0, 3).map((it, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-muted/70 text-foreground font-medium border border-border/70"
                            >
                              <span className="text-primary font-bold">{it.cantidad > 0 ? `${it.cantidad}x` : `${it.cantidad}`}</span>
                              <span className="truncate max-w-[150px]">{it.nombre}</span>
                              {it.subtotal !== undefined && it.subtotal > 0 ? (
                                <span className="text-muted-foreground font-mono text-[10px]">
                                  (Q{it.subtotal.toFixed(2)})
                                </span>
                              ) : null}
                            </span>
                          ))}
                          {itemsCard.length > 3 && (
                            <span className="text-[10px] text-muted-foreground self-center font-medium">
                              +{itemsCard.length - 3} más
                            </span>
                          )}
                        </div>
                      );
                    })()}

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground/80 pt-0.5">
                      {/* Usuario con nombre real */}
                      <span className="font-medium text-foreground/90 flex items-center gap-1.5">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {userInfo.nombre}
                      </span>

                      {/* Rol */}
                      {userInfo.rol && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 text-muted-foreground">
                          {userInfo.rol}
                        </Badge>
                      )}

                      {/* Identificación de Computadora, Tablet o Teléfono */}
                      <span className="flex items-center gap-1.5 text-muted-foreground font-medium bg-muted/30 px-2 py-0.5 rounded border border-border/50 text-[11px]">
                        <DeviceIcon className={`h-3 w-3 ${deviceMeta.color} shrink-0`} />
                        <span className="text-foreground/90 font-medium">{equipoNombre}</span>
                        <span className="text-[10px] text-muted-foreground/70 font-normal">
                          ({deviceMeta.label})
                        </span>
                      </span>

                      <span>•</span>
                      <span>{formatearFechaHora(registro.fecha)}</span>
                    </div>
                  </div>
                </div>

                {/* Botón de inspeccionar */}
                <div className="flex items-center justify-end gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-muted-foreground group-hover:text-foreground group-hover:bg-background/80"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Detalles
                    <ChevronRight className="h-3.5 w-3.5 ml-0.5 opacity-60" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Inspección Detallada */}
      <Dialog open={!!registroDetalle} onOpenChange={(open) => !open && setRegistroDetalle(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs font-normal">
                {registroDetalle?.categoria}
              </Badge>
              <Badge variant="secondary" className="text-xs font-normal">
                {registroDetalle?.accion}
              </Badge>
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              {registroDetalle?.titulo}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              ID del registro: {registroDetalle?.id}
            </DialogDescription>
          </DialogHeader>

          {registroDetalle && (() => {
            const modalUser = resolverUsuario(registroDetalle);
            const equipoNombre = registroDetalle.nombreEquipo || 'Terminal POS';
            const modalDeviceMeta = resolverMetaDispositivo(
              registroDetalle.tipoDispositivo,
              registroDetalle.nombreEquipo,
              registroDetalle.detallesDispositivo?.so
            );
            const ModalDeviceIcon = modalDeviceMeta.icon;

            return (
              <div className="space-y-4 py-2 text-sm">
                {/* Cuadro de Información: Operador y Dispositivo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Operador Responsable */}
                  <div className="bg-muted/30 p-3 rounded-lg border space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground tracking-wide flex items-center gap-1">
                      <User className="h-3 w-3 text-primary" />
                      Operador Responsable
                    </span>
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="font-semibold text-foreground text-sm">
                        {modalUser.nombre}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {modalUser.rol}
                      </Badge>
                    </div>
                    {modalUser.email && (
                      <p className="text-xs text-muted-foreground">{modalUser.email}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/70 font-mono pt-0.5">
                      ID: {registroDetalle.usuarioId}
                    </p>
                  </div>

                  {/* Dispositivo / Estación (PC, Tablet, Teléfono) */}
                  <div className="bg-muted/30 p-3 rounded-lg border space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-muted-foreground tracking-wide flex items-center gap-1">
                        <ModalDeviceIcon className={`h-3 w-3 ${modalDeviceMeta.color}`} />
                        Dispositivo de Registro
                      </span>
                      <Badge variant="outline" className={`text-[10px] px-1 py-0 h-4 ${modalDeviceMeta.badgeClass}`}>
                        {modalDeviceMeta.label}
                      </Badge>
                    </div>
                    <div className="pt-0.5">
                      <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                        {equipoNombre}
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {registroDetalle.detallesDispositivo?.so 
                          ? `${registroDetalle.detallesDispositivo.so} • ${registroDetalle.detallesDispositivo.navegador || 'Navegador Web'}` 
                          : 'Dispositivo detectado automáticamente'}
                        {registroDetalle.detallesDispositivo?.resolucion && (
                          <span className="text-[10px] text-muted-foreground/70 block mt-0.5 font-mono">
                            Pantalla: {registroDetalle.detallesDispositivo.resolucion}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fecha y Hora Exacta */}
                <div className="flex items-center justify-between px-1 text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Marca de tiempo exacta
                  </span>
                  <span className="font-medium text-foreground">
                    {formatearFechaHora(registroDetalle.fecha)}
                  </span>
                </div>

                <Separator />

                {/* Sección de Artículos y Cantidades Involucradas */}
                {(() => {
                  const itemsDirectos = extraerArticulosDeRegistro(registroDetalle);
                  const itemsAVisualizar = itemsDirectos.length > 0 ? itemsDirectos : (articulosRecuperados || []);
                  const esRecuperado = itemsDirectos.length === 0 && (articulosRecuperados || []).length > 0;
                  const matchTituloVenta = (registroDetalle.titulo || '').match(/#(\d+)/);
                  const idVentaRef = registroDetalle.detalles?.idVenta || (matchTituloVenta ? matchTituloVenta[1] : '');

                  if (itemsAVisualizar.length === 0 && !cargandoArticulos) return null;

                  return (
                    <div className="space-y-2 rounded-lg border bg-card p-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Package className="h-4 w-4 text-primary" />
                          Artículos y Cantidades Involucradas ({itemsAVisualizar.length})
                        </span>
                        {esRecuperado && idVentaRef && (
                          <Badge variant="outline" className="text-[10px] text-primary border-primary/30 bg-primary/5">
                            Recuperado de la venta #{idVentaRef}
                          </Badge>
                        )}
                      </div>

                      {cargandoArticulos ? (
                        <div className="flex items-center justify-center py-4 gap-2 text-xs text-muted-foreground">
                          <Loader className="h-4 w-4 animate-spin text-primary" />
                          Consultando artículos de la transacción...
                        </div>
                      ) : (
                        <div className="space-y-1.5 pt-1">
                          {itemsAVisualizar.map((it, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 rounded-md bg-muted/40 border border-border/50 text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 shrink-0">
                                  {it.cantidad > 0 ? `${it.cantidad}x` : `${it.cantidad}`}
                                </span>
                                <span className="font-semibold text-foreground truncate">
                                  {it.nombre}
                                </span>
                                {it.tipo === 'devuelto' && (
                                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-amber-400 text-amber-500">
                                    Devuelto
                                  </Badge>
                                )}
                              </div>

                              <div className="text-right shrink-0">
                                {it.subtotal !== undefined && it.subtotal > 0 ? (
                                  <span className="font-mono font-bold text-foreground">
                                    Q{it.subtotal.toFixed(2)}
                                    {it.precioUnitario && it.cantidad > 1 && (
                                      <span className="text-[10px] text-muted-foreground block font-normal">
                                        Q{it.precioUnitario.toFixed(2)} c/u
                                      </span>
                                    )}
                                  </span>
                                ) : it.precioUnitario !== undefined && it.precioUnitario > 0 ? (
                                  <span className="font-mono font-bold text-foreground">
                                    Q{(it.precioUnitario * (it.cantidad || 1)).toFixed(2)}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Descripción */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground tracking-wide">
                    Descripción
                  </span>
                  <p className="text-xs text-foreground bg-muted/20 p-2.5 rounded border leading-relaxed">
                    {registroDetalle.descripcion}
                  </p>
                </div>

                {/* Metadatos y Detalles Técnicos */}
                {registroDetalle.detalles && Object.keys(registroDetalle.detalles).length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-muted-foreground tracking-wide">
                      Detalles Estructurados
                    </span>
                    <ScrollArea className="max-h-48 rounded border bg-muted/10 p-3">
                      <div className="space-y-1.5">
                        {Object.entries(registroDetalle.detalles).map(([clave, valor]) => (
                          <div key={clave} className="flex flex-col text-xs pb-1 border-b border-muted/30 last:border-b-0">
                            <span className="font-mono text-[11px] text-muted-foreground">{clave}:</span>
                            <span className="font-mono text-[11px] text-foreground font-medium break-all">
                              {typeof valor === 'object' ? JSON.stringify(valor, null, 2) : String(valor)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Modal para Renombrar e Identificar este Equipo / Dispositivo */}
      <Dialog open={dialogoEquipoAbierto} onOpenChange={setDialogoEquipoAbierto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <CurrentDeviceIcon className={`h-5 w-5 ${metaDispositivoLocal.color}`} />
              Identificar este {metaDispositivoLocal.label}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Asigna un nombre descriptivo a este dispositivo (por ejemplo: &quot;Tablet Mesas 1&quot;, &quot;Caja Principal&quot;, &quot;Celular Edil&quot;). Este nombre quedará grabado en todas las transacciones y auditorías que se efectúen desde aquí.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Banner de hardware detectado automáticamente */}
            <div className="bg-muted/40 p-3 rounded-lg border space-y-1 text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <CurrentDeviceIcon className={`h-4 w-4 ${metaDispositivoLocal.color}`} />
                Hardware detectado en este dispositivo:
              </span>
              <div className="flex flex-wrap items-center gap-1.5 text-muted-foreground pt-0.5">
                <Badge variant="secondary" className="text-[11px] font-medium">
                  {metaDispositivoLocal.label}
                </Badge>
                <span>•</span>
                <span>{infoDispositivoLocal.so}</span>
                <span>•</span>
                <span>{infoDispositivoLocal.navegador}</span>
                {infoDispositivoLocal.resolucion && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-[10px]">{infoDispositivoLocal.resolucion}</span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Nombre para este dispositivo
              </label>
              <Input
                placeholder="Ej. Tablet Mesas 1, Caja Mostrador, Celular Admin..."
                value={inputNombreEquipo}
                onChange={(e) => setInputNombreEquipo(e.target.value)}
                className="text-sm h-9"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground">Sugerencias rápidas recomendadas:</span>
              <div className="flex flex-wrap gap-1.5">
                {SUGERENCIAS_EQUIPOS.map((sug) => (
                  <Button
                    key={sug}
                    type="button"
                    variant={inputNombreEquipo === sug ? 'secondary' : 'outline'}
                    size="sm"
                    className="h-7 text-xs font-normal"
                    onClick={() => setInputNombreEquipo(sug)}
                  >
                    {sug}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogoEquipoAbierto(false)}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={() => handleGuardarNombreEquipo()}
              disabled={!inputNombreEquipo.trim()}
              className="gap-1.5"
            >
              <Check className="h-4 w-4" />
              Guardar Identificador
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
