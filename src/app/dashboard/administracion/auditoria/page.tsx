'use client';

import React from 'react';
import { PageHeader, SurfaceCard, Paginacion, BotonVolverArriba } from '@/components/comunes';
import { ShieldCheck, Clock } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { Accordion } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuditoria } from './_hooks/use-auditoria';
import { AuditoriaFiltros } from './_components/auditoria-filtros';
import { AuditoriaFeedItem } from './_components/auditoria-feed-item';

export default function PaginaAuditoria() {
  const {
    isLoadingSucursal,
    isLoadingRegistros,
    isLoadingTurnoActual,
    periodoSeleccionado,
    setPeriodoSeleccionado,
    cierres,
    busqueda,
    setBusqueda,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    usuarioSeleccionado,
    setUsuarioSeleccionado,
    listaUsuarios,
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
  } = useAuditoria();

  if (isLoadingSucursal) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader className="h-10 w-10 text-sky-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {/* 1. Encabezado Principal con Selector de Período en lugar de controles innecesarios */}
      <PageHeader
        title="Auditoría de Operaciones"
        description="Registro cronológico y trazabilidad completa de transacciones, usuarios, computadoras, tablets y teléfonos."
        icon={ShieldCheck}
        action={
          <div className="w-full sm:w-64 shrink-0">
            <Select value={periodoSeleccionado} onValueChange={setPeriodoSeleccionado}>
              <SelectTrigger className="rounded-full h-9 border-[#2e2e2e] bg-[#252526] text-white text-xs font-semibold focus:ring-1 focus:ring-sky-500 shadow-sm px-3.5">
                <div className="flex items-center gap-2 min-w-0 truncate">
                  <Clock className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                  <SelectValue placeholder="Seleccionar turno..." />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-white max-h-72 font-body">
                <SelectItem value="abierto" className="font-bold text-sky-400 text-xs">
                  Turno actual
                </SelectItem>

                {cierres && cierres.length > 0 && (
                  <>
                    <Separator className="my-1.5 bg-[#2e2e2e]" />
                    <p className="px-2 py-1 text-[10px] font-semibold text-slate-400">
                      Turnos anteriores
                    </p>
                    {cierres.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">
                        Turno #{c.idCuadre} • {formatearFechaCorta(c.fecha)}
                      </SelectItem>
                    ))}
                  </>
                )}

                <Separator className="my-1.5 bg-[#2e2e2e]" />
                <SelectItem value="todos" className="text-slate-300 font-medium text-xs">
                  Historial Completo
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* 2. Contenedor Principal Unificado (Buscador, Filtros Ocultos, Feed y Paginación) */}
      <SurfaceCard variant="panel" className="p-3.5 sm:p-4 space-y-3.5">
        {/* Barra de Búsqueda Estándar y Filtros Ocultos integrados en el contenedor */}
        <AuditoriaFiltros
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          usuarioSeleccionado={usuarioSeleccionado}
          setUsuarioSeleccionado={setUsuarioSeleccionado}
          listaUsuarios={listaUsuarios}
          categoriaSeleccionada={categoriaSeleccionada}
          setCategoriaSeleccionada={setCategoriaSeleccionada}
          filtrosActivosCount={filtrosActivosCount}
          totalEventosRaw={registrosRaw?.length || 0}
        />

        {/* Feed de Auditoría en Acordeón Compacto */}
        {(isLoadingRegistros || (periodoSeleccionado === 'abierto' && isLoadingTurnoActual)) ? (
          <div className="flex flex-col items-center justify-center p-12 bg-[#252526] rounded-xl border border-[#2e2e2e]">
            <Loader className="h-8 w-8 animate-spin text-sky-400 mb-2" />
            <p className="text-sm text-muted-foreground">
              {periodoSeleccionado === 'abierto'
                ? 'Cargando movimientos del período abierto...'
                : 'Cargando registros de auditoría...'}
            </p>
          </div>
        ) : registrosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-app-surface rounded-xl border border-app-border text-center">
            <ShieldCheck className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <h3 className="text-base font-semibold text-slate-100">No se encontraron movimientos</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              {periodoSeleccionado === 'abierto'
                ? 'Aún no hay transacciones u operaciones registradas en el turno actual abierto.'
                : 'No hay actividades registradas para este período o con los filtros seleccionados.'}
            </p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-2.5">
            {paginatedRegistros.map((registro) => {
              const userInfo = resolverUsuario(registro);
              return (
                <AuditoriaFeedItem
                  key={registro.id}
                  registro={registro}
                  userInfo={userInfo}
                  horaRelativa={formatearHoraRelativa(registro.fecha)}
                  fechaHora={formatearFechaHora(registro.fecha)}
                  onExpand={() => setRegistroDetalle(registro)}
                  articulosRecuperados={registroDetalle?.id === registro.id ? articulosRecuperados : null}
                  cargandoArticulos={registroDetalle?.id === registro.id && cargandoArticulos}
                  formatearFechaHora={formatearFechaHora}
                />
              );
            })}
          </Accordion>
        )}

        {/* 3. Paginación Estándar para Vista de Escritorio y Móvil */}
        {!isLoadingRegistros && registrosFiltrados.length > 0 && (
          <div className="pt-2 border-t border-app-border">
            <Paginacion
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={registrosFiltrados.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              pageSizeOptions={[10, 15, 25, 50, 100]}
              itemLabel="evento"
              itemLabelPlural="eventos"
            />
          </div>
        )}
      </SurfaceCard>

      {/* Control Estándar para Regresar al Inicio */}
      <BotonVolverArriba threshold={150} />
    </div>
  );
}
