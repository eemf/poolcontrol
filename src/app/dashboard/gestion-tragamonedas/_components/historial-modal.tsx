'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import type { HistorialTragamonedas as HistorialTipo } from '@/lib/tipos';
import { toDate } from '@/lib/firebase/servicios/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PillTabs, SurfaceCard, Paginacion, BotonVolverArriba } from '@/components/comunes';
import {
  History,
  Trophy,
  Landmark,
  MinusCircle,
  Award,
  Undo2,
  Clock,
  Loader2,
} from 'lucide-react';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface HistorialModalProps {
  maquinaId: string;
  maquinaNombre: string;
  isOpen: boolean;
  onClose: () => void;
  sucursalId: string;
  fechaInicioPeriodo: Date | null;
  onAnular: (item: HistorialTipo) => void;
}

export function HistorialModal({
  maquinaId,
  maquinaNombre,
  isOpen,
  onClose,
  sucursalId,
  fechaInicioPeriodo,
  onAnular,
}: HistorialModalProps) {
  const { firestore } = useFirebase();
  const [rangoVista, setRangoVista] = useState<'actual' | 'todo'>('actual');
  const [busqueda, setBusqueda] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const listContainerRef = useRef<HTMLDivElement | null>(null);

  const mostrarTodo = rangoVista === 'todo';

  // Al abrir el modal o cambiar de máquina, cargar por defecto únicamente los registros del turno actual
  useEffect(() => {
    if (isOpen) {
      setRangoVista('actual');
      setBusqueda('');
      setCurrentPage(1);
    }
  }, [isOpen, maquinaId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [rangoVista, busqueda]);

  // 1. Consulta ligera por defecto: únicamente registros del turno actual
  const turnoActualQuery = useMemoFirebase(() => {
    if (!firestore || !isOpen || !sucursalId || !maquinaId) return null;
    const historialCollectionRef = collection(
      firestore,
      `sucursales/${sucursalId}/tragamonedas/${maquinaId}/historial`
    );
    return query(
      historialCollectionRef,
      where('fecha', '>=', fechaInicioPeriodo || new Date(0)),
      orderBy('fecha', 'desc')
    );
  }, [firestore, maquinaId, isOpen, fechaInicioPeriodo, sucursalId]);

  // 2. Consulta completa diferida: SOLO se ejecuta cuando el usuario hace clic en "Todos los Registros"
  const todosRegistrosQuery = useMemoFirebase(() => {
    if (!firestore || !isOpen || !sucursalId || !maquinaId || rangoVista !== 'todo') return null;
    const historialCollectionRef = collection(
      firestore,
      `sucursales/${sucursalId}/tragamonedas/${maquinaId}/historial`
    );
    return query(historialCollectionRef, orderBy('fecha', 'desc'));
  }, [firestore, maquinaId, isOpen, sucursalId, rangoVista]);

  const { data: datosTurnoActual, isLoading: cargandoTurnoActual } =
    useCollection<HistorialTipo>(turnoActualQuery);
  const { data: datosTodosRegistros, isLoading: cargandoTodosRegistros } =
    useCollection<HistorialTipo>(todosRegistrosQuery);

  const datosActivos = mostrarTodo ? datosTodosRegistros : datosTurnoActual;
  const isLoadingHistorial = mostrarTodo ? cargandoTodosRegistros : cargandoTurnoActual;

  const historialFiltrado = useMemo(() => {
    if (!datosActivos) return [];
    let lista = [...datosActivos].sort(
      (a, b) => toDate(b.fecha).getTime() - toDate(a.fecha).getTime()
    );

    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      lista = lista.filter(
        (item) =>
          item.descripcion?.toLowerCase().includes(q) ||
          item.tipo?.toLowerCase().includes(q) ||
          String(item.monto).includes(q)
      );
    }

    return lista;
  }, [datosActivos, busqueda]);

  // En "Turno Actual" se muestran todos sin paginación; en "Todos los Registros" se pagina para rendimiento óptimo
  const totalPages = Math.max(1, Math.ceil(historialFiltrado.length / itemsPerPage));
  const listaVisible = useMemo(() => {
    if (!mostrarTodo) return historialFiltrado;
    const start = (currentPage - 1) * itemsPerPage;
    return historialFiltrado.slice(start, start + itemsPerPage);
  }, [historialFiltrado, mostrarTodo, currentPage, itemsPerPage]);

  const renderIconoCircular = (tipo: string) => {
    switch (tipo) {
      case 'premio_total':
        return (
          <div className="h-9 w-9 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Trophy className="h-4 w-4" />
          </div>
        );
      case 'premio_parcial':
        return (
          <div className="h-9 w-9 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Award className="h-4 w-4" />
          </div>
        );
      case 'base':
        return (
          <div className="h-9 w-9 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Landmark className="h-4 w-4" />
          </div>
        );
      case 'extraccion':
        return (
          <div className="h-9 w-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <MinusCircle className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="h-9 w-9 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <History className="h-4 w-4" />
          </div>
        );
    }
  };

  const renderBadgeTipo = (tipo: string) => {
    switch (tipo) {
      case 'premio_total':
        return (
          <Badge className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-semibold h-5 rounded-full px-2.5 gap-1 shrink-0">
            <Trophy className="h-3 w-3" />
            Premio Total
          </Badge>
        );
      case 'premio_parcial':
        return (
          <Badge className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-semibold h-5 rounded-full px-2.5 gap-1 shrink-0">
            <Award className="h-3 w-3" />
            Premio Parcial
          </Badge>
        );
      case 'base':
        return (
          <Badge className="bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[10px] font-semibold h-5 rounded-full px-2.5 gap-1 shrink-0">
            <Landmark className="h-3 w-3" />
            Carga de Base
          </Badge>
        );
      case 'extraccion':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold h-5 rounded-full px-2.5 gap-1 shrink-0">
            <MinusCircle className="h-3 w-3" />
            Extracción
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] font-semibold h-5 rounded-full px-2.5">
            {tipo}
          </Badge>
        );
    }
  };

  const getColorMonto = (tipo: string, anulado?: boolean) => {
    if (anulado) return 'line-through text-slate-500';
    switch (tipo) {
      case 'premio_total':
      case 'premio_parcial':
        return 'text-amber-400';
      case 'base':
        return 'text-sky-400';
      case 'extraccion':
        return 'text-emerald-400';
      default:
        return 'text-slate-100';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 p-4 sm:p-6 gap-2.5 sm:gap-4 rounded-2xl shadow-2xl font-body overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera Estándar */}
        <DialogHeader className="space-y-1 pb-0 sm:pb-2 text-left shrink-0">
          <div className="flex items-center gap-3 pr-6">
            <div className="h-10 w-10 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 shadow-xs">
              <History className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="font-headline text-base sm:text-lg font-bold text-slate-100 leading-tight truncate">
                Historial de {maquinaNombre}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                {mostrarTodo
                  ? 'Mostrando todos los registros históricos de esta máquina.'
                  : 'Mostrando los movimientos registrados en el turno actual.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Barra de Búsqueda + Pestañas Estándar */}
        <div className="shrink-0">
          <PillTabs
            value={rangoVista}
            onValueChange={(v) => setRangoVista(v as 'actual' | 'todo')}
            searchValue={busqueda}
            onSearchChange={setBusqueda}
            searchPlaceholder="Buscar descripción o monto..."
            searchInputRef={searchInputRef}
            collapsibleMobileTabs
            tabs={[
              {
                id: 'actual',
                label: 'Turno Actual',
                icon: Clock,
                count: datosTurnoActual?.length || 0,
                badgeVariant: rangoVista === 'actual' ? 'amber' : 'sky',
              },
              {
                id: 'todo',
                label: 'Todos los Registros',
                icon: History,
                count: mostrarTodo ? datosTodosRegistros?.length || 0 : undefined,
                badgeVariant: rangoVista === 'todo' ? 'amber' : 'sky',
              },
            ]}
          />
        </div>

        {/* Lista de Movimientos + Botón flotante para volver al inicio en móvil y escritorio */}
        <div className="relative flex-1 min-h-0 flex flex-col">
          <div
            ref={listContainerRef}
            className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar h-[50vh]"
          >
            {isLoadingHistorial ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                <p className="text-xs">
                  {mostrarTodo
                    ? 'Cargando historial completo de la máquina...'
                    : 'Cargando movimientos del turno actual...'}
                </p>
              </div>
            ) : listaVisible.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 gap-2 rounded-xl bg-[#252526] border border-dashed border-[#2e2e2e] p-6">
                <div className="h-12 w-12 rounded-full bg-[#1e1e1e] border border-[#2e2e2e] flex items-center justify-center text-slate-500">
                  <History className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-slate-300">
                  No hay movimientos registrados
                </p>
                <p className="text-xs text-slate-400 max-w-xs">
                  {busqueda.trim()
                    ? 'No se encontraron coincidencias para tu búsqueda.'
                    : mostrarTodo
                      ? 'Esta máquina aún no registra operaciones históricas.'
                      : 'No hay premios, bases ni extracciones en el período actual.'}
                </p>
              </div>
            ) : (
              listaVisible.map((item) => {
                const fechaObj = toDate(item.fecha);
                const matchParentesis = item.descripcion?.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
                const textoPrincipal = matchParentesis ? matchParentesis[1].trim() : item.descripcion;
                const chipsDetalle = matchParentesis
                  ? matchParentesis[2].split(',').map((s) => s.trim()).filter(Boolean)
                  : [];
                const esTextoRedundanteConBadge =
                  item.tipo === 'extraccion' && textoPrincipal.toLowerCase() === 'extracción';

                return (
                  <SurfaceCard
                    key={item.id}
                    variant="surface"
                    className={cn(
                      'p-3 sm:p-3.5 transition-colors hover:border-[#3c3c3c]',
                      item.anulado && 'bg-rose-950/15 border-rose-500/30 opacity-65'
                    )}
                  >
                    <div className="flex items-start sm:items-center justify-between gap-3">
                      {/* Lado izquierdo: Icono (solo escritorio) + Contenido */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="hidden sm:block shrink-0">
                          {renderIconoCircular(item.tipo)}
                        </div>
                        <div className="min-w-0 flex-1 space-y-1.5">
                          {/* Fila 1: Badges + Monto en móvil */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {renderBadgeTipo(item.tipo)}
                              {item.anulado && (
                                <Badge className="bg-rose-500/20 text-rose-300 border border-rose-500/35 text-[10px] font-semibold h-5 rounded-full px-2">
                                  Anulado
                                </Badge>
                              )}
                            </div>
                            <span
                              className={cn(
                                'sm:hidden text-sm font-black tabular-nums leading-tight shrink-0',
                                getColorMonto(item.tipo, item.anulado)
                              )}
                            >
                              Q{item.monto.toFixed(2)}
                            </span>
                          </div>

                          {/* Fila 2: Descripción o Chips estructurados */}
                          {!esTextoRedundanteConBadge && textoPrincipal && (
                            <p className="text-xs text-slate-200 font-medium leading-snug break-words">
                              {textoPrincipal}
                            </p>
                          )}

                          {chipsDetalle.length > 0 && (
                            <div className="flex items-center flex-wrap gap-1.5">
                              {chipsDetalle.map((chip, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#1e1e1e] border border-[#2e2e2e] text-[11px] text-slate-300 tabular-nums"
                                >
                                  {chip}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Fila 3: Fecha + Botón Anular en móvil */}
                          <div className="flex items-center justify-between gap-2 pt-0.5">
                            <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-slate-400">
                              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                                <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                                {format(fechaObj, 'dd/MM/yyyy • hh:mm a', { locale: es })}
                              </span>
                              <span className="text-slate-500 whitespace-nowrap">
                                ({formatDistanceToNowStrict(fechaObj, { locale: es, addSuffix: true })})
                              </span>
                            </div>

                            {!item.anulado && (
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onAnular(item)}
                                className="sm:hidden h-8 px-3 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/30 transition-colors shrink-0"
                              >
                                <Undo2 className="h-3.5 w-3.5 mr-1" />
                                Anular
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Lado derecho (solo escritorio): Monto + Anular */}
                      <div className="hidden sm:flex flex-col items-end justify-between gap-2 shrink-0">
                        <span
                          className={cn(
                            'text-sm font-black tabular-nums leading-tight',
                            getColorMonto(item.tipo, item.anulado)
                          )}
                        >
                          Q{item.monto.toFixed(2)}
                        </span>

                        {!item.anulado && (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onAnular(item)}
                            className="h-8 px-3.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/30 transition-colors shrink-0"
                          >
                            <Undo2 className="h-3.5 w-3.5 mr-1.5" />
                            Anular
                          </Button>
                        )}
                      </div>
                    </div>
                  </SurfaceCard>
                );
              })
            )}
          </div>
          <BotonVolverArriba
            containerRef={listContainerRef}
            threshold={120}
            className="absolute bottom-3 right-3 sm:bottom-3 sm:right-3 z-20"
          />
        </div>

        {/* Paginación Estándar solo cuando se consulta "Todos los Registros" */}
        {mostrarTodo && historialFiltrado.length > itemsPerPage && (
          <div className="pt-2 border-t border-[#2e2e2e] shrink-0">
            <Paginacion
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={historialFiltrado.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(val) => {
                setItemsPerPage(val);
                setCurrentPage(1);
              }}
              itemLabel="registros"
              hideIfSinglePage
            />
          </div>
        )}

        {/* Pie de Modal Estándar */}
        <DialogFooter className="pt-2 flex flex-row items-center justify-between sm:justify-between gap-2 shrink-0">
          <span className="text-xs text-slate-400">
            Total:{' '}
            <strong className="text-slate-200 tabular-nums">{historialFiltrado.length}</strong>{' '}
            {historialFiltrado.length === 1 ? 'registro' : 'registros'}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-full h-9 px-5 text-xs font-semibold bg-[#252526] hover:bg-[#313131] text-slate-200 border-[#2e2e2e]"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
