'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useFirebase, useUser, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { useSucursal } from '@/hooks/use-sucursal';
import { collection, query, orderBy, limit, doc, getDoc, where, Timestamp } from 'firebase/firestore';
import type { RegistroAuditoria, UsuarioSucursal, Generales, CierreCaja } from '@/lib/tipos';
import { toDate } from '@/lib/firebase/servicios/utils';
import { 
  extraerArticulosDeRegistro, 
  type ItemAuditoriaVisual 
} from '../_utils/auditoria-helpers';

export function useAuditoria() {
  const { firestore } = useFirebase();
  const { user: currentUser, profile: currentProfile } = useUser();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();

  // Selector de Período (Predeterminado: 'abierto' = Período Actual)
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<string>('abierto');

  // Filtros generales
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('TODAS');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<string>('TODOS');
  const [filtroFecha, setFiltroFecha] = useState<'HOY' | '7DIAS' | '30DIAS' | 'TODOS'>('HOY');

  // Paginación estándar
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(15);

  // Detalles de registro seleccionado para recuperación diferida de artículos si hiciera falta
  const [registroDetalle, setRegistroDetalle] = useState<RegistroAuditoria | null>(null);
  const [articulosRecuperados, setArticulosRecuperados] = useState<ItemAuditoriaVisual[] | null>(null);
  const [cargandoArticulos, setCargandoArticulos] = useState<boolean>(false);

  // Cache dinámico de usuarios consultados desde Firestore
  const [usuariosExtra, setUsuariosExtra] = useState<Record<string, { nombre: string; email: string; rol: string }>>({});
  const uidsConsultadosRef = useRef<Set<string>>(new Set());

  // Efecto para recuperar artículos de una venta si el registro de auditoría es antiguo
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

    const idVenta = (registroDetalle.detalles as any)?.idVenta || (registroDetalle.detalles as any)?.ventaId;
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
      } catch (e) {
        console.warn('No se pudo recuperar venta para auditoría:', idVentaFinal);
      }
      if (activo) {
        setCargandoArticulos(false);
      }
    };

    buscarVentaOProductos();

    return () => {
      activo = false;
    };
  }, [registroDetalle, firestore, sucursalId]);

  // Turno actual
  const generalesRef = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return doc(firestore, `sucursales/${sucursalId}/generales/actual`);
  }, [firestore, sucursalId]);

  const { data: turnoActual, isLoading: isLoadingTurnoActual } = useDoc<Generales>(generalesRef);

  // Cierres de caja anteriores (optimizado a 40)
  const cierresQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(
      collection(firestore, `sucursales/${sucursalId}/cierre_caja`),
      orderBy('fecha', 'desc'),
      limit(40)
    );
  }, [firestore, sucursalId]);

  const { data: cierres, isLoading: isLoadingCierres } = useCollection<CierreCaja>(cierresQuery);

  // Límites temporales del período
  const infoPeriodo = useMemo(() => {
    if (periodoSeleccionado === 'abierto') {
      const inicio = turnoActual?.fechaInicioPeriodo ? toDate(turnoActual.fechaInicioPeriodo) : null;
      return {
        tipo: 'abierto' as const,
        label: 'Período Actual',
        inicio,
        fin: null,
        esAbierto: true,
      };
    }

    if (periodoSeleccionado === 'todos') {
      return {
        tipo: 'todos' as const,
        label: 'Historial Completo',
        inicio: null,
        fin: null,
        esAbierto: false,
      };
    }

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
      label: 'Período Actual',
      inicio: null,
      fin: null,
      esAbierto: true,
    };
  }, [periodoSeleccionado, turnoActual, cierres]);

  // Consulta de auditoría delimitada (carga exhaustiva del turno)
  const auditoriaQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;

    if (periodoSeleccionado === 'abierto') {
      if (infoPeriodo.inicio) {
        return query(
          collection(firestore, `sucursales/${sucursalId}/auditoria`),
          where('fecha', '>=', Timestamp.fromDate(infoPeriodo.inicio)),
          orderBy('fecha', 'desc')
        );
      }
      if (isLoadingTurnoActual) return null;

      const inicioHoy = new Date();
      inicioHoy.setHours(0, 0, 0, 0);
      return query(
        collection(firestore, `sucursales/${sucursalId}/auditoria`),
        where('fecha', '>=', Timestamp.fromDate(inicioHoy)),
        orderBy('fecha', 'desc')
      );
    }

    if (periodoSeleccionado !== 'abierto' && periodoSeleccionado !== 'todos') {
      if (infoPeriodo.inicio && infoPeriodo.fin) {
        return query(
          collection(firestore, `sucursales/${sucursalId}/auditoria`),
          where('fecha', '>=', Timestamp.fromDate(infoPeriodo.inicio)),
          where('fecha', '<=', Timestamp.fromDate(infoPeriodo.fin)),
          orderBy('fecha', 'desc')
        );
      } else if (infoPeriodo.fin) {
        return query(
          collection(firestore, `sucursales/${sucursalId}/auditoria`),
          where('fecha', '<=', Timestamp.fromDate(infoPeriodo.fin)),
          orderBy('fecha', 'desc')
        );
      }
    }

    return query(
      collection(firestore, `sucursales/${sucursalId}/auditoria`),
      orderBy('fecha', 'desc'),
      limit(300)
    );
  }, [firestore, sucursalId, periodoSeleccionado, infoPeriodo, isLoadingTurnoActual]);

  const { data: registrosRaw, isLoading: isLoadingRegistros } = useCollection<RegistroAuditoria>(auditoriaQuery);

  // Usuarios registrados
  const usuariosQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/usuarios`));
  }, [firestore, sucursalId]);

  const { data: usuariosRegistrados } = useCollection<UsuarioSucursal>(usuariosQuery);

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

  // Cargar usuarios faltantes sin loops infinitos de red
  useEffect(() => {
    if (!firestore || !registrosRaw || registrosRaw.length === 0) return;

    const uidsParaConsultar: string[] = [];
    registrosRaw.forEach((reg) => {
      const uid = reg.usuarioId;
      if (
        uid && 
        uid !== 'desconocido' && 
        !mapaUsuarios.has(uid) && 
        !usuariosExtra[uid] && 
        !uidsConsultadosRef.current.has(uid) &&
        uid !== currentUser?.uid
      ) {
        uidsConsultadosRef.current.add(uid);
        uidsParaConsultar.push(uid);
      }
    });

    if (uidsParaConsultar.length === 0) return;

    uidsParaConsultar.forEach(async (uid) => {
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
  }, [firestore, registrosRaw, mapaUsuarios, currentUser]);

  // Resolver usuario de un registro de forma memorizada
  const resolverUsuario = useCallback((reg: RegistroAuditoria) => {
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

    return {
      nombre: 'Operador del sistema',
      email: reg.usuarioEmail || '',
      rol: reg.usuarioRol || 'Operador',
    };
  }, [currentUser, currentProfile, mapaUsuarios, usuariosExtra]);

  // Lista única de usuarios para selector
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
  }, [registrosRaw, usuariosRegistrados, currentUser, currentProfile, resolverUsuario]);

  // Filtrado de registros multidimensional
  const registrosFiltrados = useMemo(() => {
    if (!registrosRaw) return [];

    const ahora = new Date();
    const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()).getTime();
    const hace7Dias = ahora.getTime() - 7 * 24 * 60 * 60 * 1000;
    const hace30Dias = ahora.getTime() - 30 * 24 * 60 * 60 * 1000;
    const queryTerm = busqueda.toLowerCase().trim();

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

      if (queryTerm !== '') {
        const userResolved = resolverUsuario(reg);
        const textoTitulo = (reg.titulo || '').toLowerCase();
        const textoDesc = (reg.descripcion || '').toLowerCase();
        const textoUsuario = (userResolved.nombre || '').toLowerCase();
        const textoEquipo = (reg.nombreEquipo || 'Terminal POS').toLowerCase();

        const coincide =
          textoTitulo.includes(queryTerm) ||
          textoDesc.includes(queryTerm) ||
          textoUsuario.includes(queryTerm) ||
          textoEquipo.includes(queryTerm);

        if (!coincide) return false;
      }

      return true;
    });
  }, [registrosRaw, categoriaSeleccionada, usuarioSeleccionado, filtroFecha, periodoSeleccionado, busqueda, resolverUsuario]);

  // Formateadores de fecha de alta eficiencia
  const formatearFechaHora = useCallback((fecha: any) => {
    if (!fecha) return '';
    const dateObj = toDate(fecha);
    return dateObj.toLocaleString('es-GT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }, []);

  const formatearFechaCorta = useCallback((fecha: any) => {
    if (!fecha) return '';
    const dateObj = toDate(fecha);
    return dateObj.toLocaleDateString('es-GT', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }, []);

  const formatearHoraRelativa = useCallback((fecha: any) => {
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
  }, []);

  // Paginación y contador de filtros activos
  const totalPages = Math.max(1, Math.ceil(registrosFiltrados.length / itemsPerPage));
  const paginatedRegistros = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return registrosFiltrados.slice(start, start + itemsPerPage);
  }, [registrosFiltrados, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda, categoriaSeleccionada, usuarioSeleccionado, periodoSeleccionado, itemsPerPage]);

  const filtrosActivosCount = useMemo(() => {
    let count = 0;
    if (categoriaSeleccionada !== 'TODAS') count++;
    if (usuarioSeleccionado !== 'TODOS') count++;
    return count;
  }, [categoriaSeleccionada, usuarioSeleccionado]);

  return {
    isLoadingSucursal,
    isLoadingRegistros,
    isLoadingTurnoActual,
    isLoadingCierres,
    periodoSeleccionado,
    setPeriodoSeleccionado,
    cierres,
    infoPeriodo,
    busqueda,
    setBusqueda,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    usuarioSeleccionado,
    setUsuarioSeleccionado,
    listaUsuarios,
    filtroFecha,
    setFiltroFecha,
    registrosFiltrados,
    paginatedRegistros,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    filtrosActivosCount,
    registrosRaw,
    registroDetalle,
    setRegistroDetalle,
    articulosRecuperados,
    cargandoArticulos,
    resolverUsuario,
    formatearFechaHora,
    formatearFechaCorta,
    formatearHoraRelativa,
  };
}
