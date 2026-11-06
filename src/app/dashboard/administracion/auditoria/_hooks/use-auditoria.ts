'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useFirebase, useUser, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { useSucursal } from '@/hooks/use-sucursal';
import { collection, query, orderBy, limit, doc, getDoc, getDocs, where, Timestamp } from 'firebase/firestore';
import type { RegistroAuditoria, CategoriaAuditoria, UsuarioSucursal, Generales, CierreCaja } from '@/lib/tipos';
import { toDate } from '@/lib/firebase/servicios/utils';
import { 
  obtenerInfoDetalladaDispositivo, 
  guardarNombreEquipo, 
  EVENTO_EQUIPO_CAMBIADO,
  type InfoDispositivo
} from '@/lib/utils/dispositivo';
import { 
  extraerArticulosDeRegistro, 
  resolverMetaDispositivo, 
  type ItemAuditoriaVisual 
} from '../_utils/auditoria-helpers';

export function useAuditoria() {
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

  // Cache dinámico de usuarios consultados desde Firestore
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

  const handleGuardarNombreEquipo = useCallback((nombreAGuardar?: string) => {
    const valor = (nombreAGuardar || inputNombreEquipo).trim();
    if (!valor) return;
    const finalGuardado = guardarNombreEquipo(valor);
    setNombreEquipoLocal(finalGuardado);
    setDialogoEquipoAbierto(false);
  }, [inputNombreEquipo]);

  // Turno actual
  const generalesRef = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return doc(firestore, `sucursales/${sucursalId}/generales/actual`);
  }, [firestore, sucursalId]);

  const { data: turnoActual, isLoading: isLoadingTurnoActual } = useDoc<Generales>(generalesRef);

  // Cierres de caja anteriores
  const cierresQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(
      collection(firestore, `sucursales/${sucursalId}/cierre_caja`),
      orderBy('fecha', 'desc'),
      limit(60)
    );
  }, [firestore, sucursalId]);

  const { data: cierres, isLoading: isLoadingCierres } = useCollection<CierreCaja>(cierresQuery);

  // Límites temporales del período
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

  // Consulta de auditoría delimitada
  const auditoriaQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;

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

    return query(
      collection(firestore, `sucursales/${sucursalId}/auditoria`),
      orderBy('fecha', 'desc'),
      limit(limiteConsulta)
    );
  }, [firestore, sucursalId, periodoSeleccionado, infoPeriodo, isLoadingTurnoActual, limiteConsulta]);

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

  // Cargar usuarios faltantes
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

  // Resolver usuario de un registro
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

  // Filtrado de registros
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
  }, [registrosRaw, categoriaSeleccionada, usuarioSeleccionado, filtroFecha, periodoSeleccionado, busqueda, resolverUsuario]);

  const metaDispositivoLocal = useMemo(() => {
    return resolverMetaDispositivo(
      infoDispositivoLocal.tipo, 
      nombreEquipoLocal, 
      infoDispositivoLocal.so
    );
  }, [infoDispositivoLocal, nombreEquipoLocal]);

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
    limiteConsulta,
    setLimiteConsulta,
    registrosFiltrados,
    registrosRaw,
    registroDetalle,
    setRegistroDetalle,
    articulosRecuperados,
    cargandoArticulos,
    infoDispositivoLocal,
    nombreEquipoLocal,
    dialogoEquipoAbierto,
    setDialogoEquipoAbierto,
    inputNombreEquipo,
    setInputNombreEquipo,
    handleGuardarNombreEquipo,
    metaDispositivoLocal,
    resolverUsuario,
    formatearFechaHora,
    formatearFechaCorta,
    formatearHoraRelativa,
  };
}
