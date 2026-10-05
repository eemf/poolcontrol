'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { useSucursal } from '@/hooks/use-sucursal';
import { collection, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import type { RegistroAuditoria, CategoriaAuditoria, UsuarioSucursal } from '@/lib/tipos';
import { 
  ShieldCheck, Search, Filter, Calendar, User, 
  ShoppingCart, Gamepad2, Scale, Package, Boxes, Truck, 
  Clock, ArrowUpDown, ChevronRight, RefreshCw, Eye,
  Monitor, Laptop, Edit3, Check, CheckCircle2
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
  obtenerNombreEquipo, 
  guardarNombreEquipo, 
  SUGERENCIAS_EQUIPOS, 
  EVENTO_EQUIPO_CAMBIADO 
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

export default function PaginaAuditoria() {
  const { firestore } = useFirebase();
  const { user: currentUser, profile: currentProfile } = useUser();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('TODAS');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<string>('TODOS');
  const [filtroFecha, setFiltroFecha] = useState<'HOY' | '7DIAS' | '30DIAS' | 'TODOS'>('HOY');
  const [limiteConsulta, setLimiteConsulta] = useState<number>(150);

  // Modal de detalles de registro
  const [registroDetalle, setRegistroDetalle] = useState<RegistroAuditoria | null>(null);

  // Gestión del Nombre de Equipo / Máquina
  const [nombreEquipoLocal, setNombreEquipoLocal] = useState<string>('Terminal POS');
  const [dialogoEquipoAbierto, setDialogoEquipoAbierto] = useState<boolean>(false);
  const [inputNombreEquipo, setInputNombreEquipo] = useState<string>('');

  // Cache dinámico de usuarios consultados desde Firestore (user_auth_lookup o usuarios)
  const [usuariosExtra, setUsuariosExtra] = useState<Record<string, { nombre: string; email: string; rol: string }>>({});

  // Cargar y escuchar el nombre del equipo configurado localmente
  useEffect(() => {
    const actual = obtenerNombreEquipo();
    setNombreEquipoLocal(actual);
    setInputNombreEquipo(actual);

    const handleCambioEquipo = (e: any) => {
      if (e?.detail) {
        setNombreEquipoLocal(e.detail);
      }
    };

    window.addEventListener(EVENTO_EQUIPO_CAMBIADO, handleCambioEquipo);
    return () => {
      window.removeEventListener(EVENTO_EQUIPO_CAMBIADO, handleCambioEquipo);
    };
  }, []);

  // Guardar cambio de nombre del equipo
  const handleGuardarNombreEquipo = (nombreAGuardar?: string) => {
    const valor = (nombreAGuardar || inputNombreEquipo).trim();
    if (!valor) return;
    const finalGuardado = guardarNombreEquipo(valor);
    setNombreEquipoLocal(finalGuardado);
    setDialogoEquipoAbierto(false);
  };

  // Consulta de auditoría en tiempo real
  const auditoriaQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null;
    return query(
      collection(firestore, `sucursales/${sucursalId}/auditoria`),
      orderBy('fecha', 'desc'),
      limit(limiteConsulta)
    );
  }, [firestore, sucursalId, limiteConsulta]);

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

        // Si no está en lookup, intentar en usuarios raíz
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
  // NUNCA devuelve un UID alfanumérico crudo como nombre
  const resolverUsuario = (reg: RegistroAuditoria) => {
    const esNombreValido = (nom?: string) => {
      if (!nom) return false;
      const t = nom.trim();
      if (t === '' || t === 'Usuario del sistema' || t === 'desconocido') return false;
      if (t === reg.usuarioId) return false;
      // Descartar UIDs crudos de Firebase (ej: 22+ caracteres seguidos sin espacios ni arroba)
      if (t.length >= 20 && !t.includes(' ') && !t.includes('@')) return false;
      return true;
    };

    // 1. Si el registro guardó un nombre legible directamente
    if (esNombreValido(reg.usuarioNombre)) {
      return {
        nombre: reg.usuarioNombre,
        email: reg.usuarioEmail || '',
        rol: reg.usuarioRol || 'Operador',
      };
    }

    // 2. Si coincide con el usuario actualmente logueado en la sesión
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

    // 3. Buscar en el mapa de usuarios de la sucursal
    const infoSucursal = mapaUsuarios.get(reg.usuarioId);
    if (infoSucursal && esNombreValido(infoSucursal.nombre)) {
      return {
        nombre: infoSucursal.nombre,
        email: reg.usuarioEmail || infoSucursal.email || '',
        rol: reg.usuarioRol || infoSucursal.rol || 'Operador',
      };
    }

    // 4. Buscar en usuarios extra cargados dinámicamente
    const infoExtra = usuariosExtra[reg.usuarioId];
    if (infoExtra && esNombreValido(infoExtra.nombre)) {
      return {
        nombre: infoExtra.nombre,
        email: reg.usuarioEmail || infoExtra.email || '',
        rol: reg.usuarioRol || infoExtra.rol || 'Operador',
      };
    }

    // 5. Deducir desde el correo electrónico registrado
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

    // 6. En última instancia, mostrar un rótulo amigable y legible (NUNCA el ID crudo)
    return {
      nombre: 'Operador del sistema',
      email: reg.usuarioEmail || '',
      rol: reg.usuarioRol || 'Operador',
    };
  };

  // Formateador de fecha
  const formatearFechaHora = (fecha: any) => {
    if (!fecha) return 'Fecha no disponible';
    const dateObj = fecha.toDate ? fecha.toDate() : new Date(fecha);
    return new Intl.DateTimeFormat('es-GT', {
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(dateObj);
  };

  const formatearHoraRelativa = (fecha: any) => {
    if (!fecha) return '';
    const dateObj = fecha.toDate ? fecha.toDate() : new Date(fecha);
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

    // 1. Agregar usuarios registrados en la sucursal
    (usuariosRegistrados || []).forEach((u: any) => {
      const uid = u.authUid || u.id;
      if (uid && u.nombre) {
        map.set(uid, { id: uid, nombre: u.nombre });
      }
    });

    // 2. Si el usuario actual no está, agregarlo
    if (currentUser?.uid) {
      const miNombre = currentProfile?.nombre || currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Mi Usuario');
      map.set(currentUser.uid, { id: currentUser.uid, nombre: `${miNombre} (Tú)` });
    }

    // 3. Complementar con los registros de auditoría
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

  // Filtrado reactivo en cliente (incluyendo búsqueda por nombre de equipo y nombre de usuario)
  const registrosFiltrados = useMemo(() => {
    if (!registrosRaw) return [];

    const ahora = new Date();
    const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()).getTime();
    const hace7Dias = ahora.getTime() - 7 * 24 * 60 * 60 * 1000;
    const hace30Dias = ahora.getTime() - 30 * 24 * 60 * 60 * 1000;

    return registrosRaw.filter((reg) => {
      // 1. Filtro por categoría
      if (categoriaSeleccionada !== 'TODAS' && reg.categoria !== categoriaSeleccionada) {
        return false;
      }

      // 2. Filtro por usuario
      if (usuarioSeleccionado !== 'TODOS' && reg.usuarioId !== usuarioSeleccionado) {
        return false;
      }

      // 3. Filtro por fecha
      const fechaMs = reg.fecha?.toDate ? reg.fecha.toDate().getTime() : new Date(reg.fecha).getTime();
      if (filtroFecha === 'HOY' && fechaMs < inicioHoy) return false;
      if (filtroFecha === '7DIAS' && fechaMs < hace7Dias) return false;
      if (filtroFecha === '30DIAS' && fechaMs < hace30Dias) return false;

      // 4. Filtro por texto de búsqueda (busca en título, descripción, usuario, email, acción y nombre de equipo)
      if (busqueda.trim() !== '') {
        const queryTerm = busqueda.toLowerCase().trim();
        const userResolved = resolverUsuario(reg);
        const textoTitulo = (reg.titulo || '').toLowerCase();
        const textoDesc = (reg.descripcion || '').toLowerCase();
        const textoUsuario = (userResolved.nombre || '').toLowerCase();
        const textoEmail = (userResolved.email || '').toLowerCase();
        const textoEquipo = (reg.nombreEquipo || 'Terminal POS').toLowerCase();
        const textoAccion = (reg.accion || '').toLowerCase();
        const textoDetalles = JSON.stringify(reg.detalles || {}).toLowerCase();

        const coincide =
          textoTitulo.includes(queryTerm) ||
          textoDesc.includes(queryTerm) ||
          textoUsuario.includes(queryTerm) ||
          textoEmail.includes(queryTerm) ||
          textoEquipo.includes(queryTerm) ||
          textoAccion.includes(queryTerm) ||
          textoDetalles.includes(queryTerm);

        if (!coincide) return false;
      }

      return true;
    });
  }, [registrosRaw, categoriaSeleccionada, usuarioSeleccionado, filtroFecha, busqueda, mapaUsuarios, usuariosExtra]);

  // Resumen de estadísticas
  const estadisticas = useMemo(() => {
    const total = registrosFiltrados.length;
    const ventas = registrosFiltrados.filter((r) => r.categoria === 'VENTAS').length;
    const mesas = registrosFiltrados.filter((r) => r.categoria === 'MESAS').length;
    const caja = registrosFiltrados.filter((r) => r.categoria === 'CAJA').length;
    const otros = total - ventas - mesas - caja;
    return { total, ventas, mesas, caja, otros };
  }, [registrosFiltrados]);

  if (isLoadingSucursal) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-primary" />
            Auditoría de Operaciones
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Registro cronológico y trazabilidad completa de transacciones, usuarios y equipos en el sistema.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Identificador interactivo de este equipo */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setInputNombreEquipo(nombreEquipoLocal);
              setDialogoEquipoAbierto(true);
            }}
            className="h-8 gap-1.5 text-xs bg-card hover:bg-muted/60 border shadow-xs"
            title="Haz clic para cambiar el nombre de este equipo/estación"
          >
            <Monitor className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Este equipo: <strong className="text-foreground">{nombreEquipoLocal}</strong></span>
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

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 bg-card/60 backdrop-blur-sm border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Eventos</span>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold mt-1 text-foreground">{estadisticas.total}</div>
        </Card>
        <Card className="p-4 bg-card/60 backdrop-blur-sm border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Ventas y Cobros</span>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{estadisticas.ventas}</div>
        </Card>
        <Card className="p-4 bg-card/60 backdrop-blur-sm border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Sala de Juegos</span>
            <Gamepad2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{estadisticas.mesas}</div>
        </Card>
        <Card className="p-4 bg-card/60 backdrop-blur-sm border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Caja y Turnos</span>
            <Scale className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">{estadisticas.caja}</div>
        </Card>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <Card className="p-4 bg-card/80 border shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por usuario, equipo, acción..."
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

          {/* Selector de Rango de Fecha */}
          <div>
            <Select value={filtroFecha} onValueChange={(val: any) => setFiltroFecha(val)}>
              <SelectTrigger className="h-9 text-sm">
                <div className="flex items-center gap-2 truncate">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Periodo de tiempo" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HOY">Hoy</SelectItem>
                <SelectItem value="7DIAS">Últimos 7 días</SelectItem>
                <SelectItem value="30DIAS">Últimos 30 días</SelectItem>
                <SelectItem value="TODOS">Todo el historial cargado</SelectItem>
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
        {isLoadingRegistros ? (
          <div className="flex flex-col items-center justify-center p-12 bg-card rounded-lg border">
            <Loader className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Cargando bitácora de auditoría...</p>
          </div>
        ) : registrosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-card rounded-lg border text-center">
            <ShieldCheck className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <h3 className="text-base font-semibold text-foreground">No se encontraron eventos</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              No hay actividades registradas con los filtros seleccionados. Intenta ampliar el rango de fecha o buscar otro término.
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

                      {/* Nombre del equipo / estación */}
                      <span className="flex items-center gap-1 text-muted-foreground font-medium bg-muted/30 px-1.5 py-0.5 rounded border border-border/50 text-[11px]">
                        <Monitor className="h-2.5 w-2.5 text-primary/70 shrink-0" />
                        {equipoNombre}
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
            return (
              <div className="space-y-4 py-2 text-sm">
                {/* Cuadro de Información: Operador y Equipo */}
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

                  {/* Equipo / Terminal de Trabajo */}
                  <div className="bg-muted/30 p-3 rounded-lg border space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground tracking-wide flex items-center gap-1">
                      <Monitor className="h-3 w-3 text-primary" />
                      Equipo / Estación
                    </span>
                    <div className="pt-0.5">
                      <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                        {equipoNombre}
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Dispositivo donde se realizó la operación
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

      {/* Modal para Renombrar e Identificar este Equipo */}
      <Dialog open={dialogoEquipoAbierto} onOpenChange={setDialogoEquipoAbierto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              Identificar este Equipo / Terminal
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Asigna un nombre descriptivo a esta computadora o terminal (por ejemplo: &quot;Caja Principal&quot;, &quot;Barra&quot;, &quot;Caja 2&quot;). Este nombre quedará grabado en todas las transacciones y auditorías que se efectúen desde este dispositivo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Nombre de esta estación de trabajo
              </label>
              <Input
                placeholder="Ej. Caja Principal, Barra, Mostrador..."
                value={inputNombreEquipo}
                onChange={(e) => setInputNombreEquipo(e.target.value)}
                className="text-sm h-9"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground">Sugerencias rápidas:</span>
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
