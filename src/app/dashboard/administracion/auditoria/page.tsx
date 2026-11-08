'use client';

import React from 'react';
import { PageHeader, SurfaceCard } from '@/components/comunes';
import { ShieldCheck, RefreshCw, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader } from '@/components/ui/loader';
import { useAuditoria } from './_hooks/use-auditoria';
import { AuditoriaFiltros } from './_components/auditoria-filtros';
import { AuditoriaFeedItem } from './_components/auditoria-feed-item';
import { AuditoriaDetalleDialog } from './_components/auditoria-detalle-dialog';
import { AuditoriaEquipoDialog } from './_components/auditoria-equipo-dialog';

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
  } = useAuditoria();

  const CurrentDeviceIcon = metaDispositivoLocal.icon;

  if (isLoadingSucursal) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader className="h-10 w-10 text-sky-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Encabezado Principal usando PageHeader estándar */}
      <PageHeader
        title="Auditoría de Operaciones"
        description="Registro cronológico y trazabilidad completa de transacciones, usuarios, computadoras, tablets y teléfonos."
        icon={ShieldCheck}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {/* Identificador interactivo de este equipo con su icono real (PC, Tablet o Teléfono) */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInputNombreEquipo(nombreEquipoLocal);
                setDialogoEquipoAbierto(true);
              }}
              className="h-8 gap-1.5 text-xs bg-app-surface hover:bg-[#2e2e2e] border-app-border rounded-full"
              title="Haz clic para personalizar el nombre de este equipo o ver sus datos"
            >
              <CurrentDeviceIcon className={`h-3.5 w-3.5 ${metaDispositivoLocal.color} shrink-0`} />
              <span>Este equipo: <strong className="text-slate-100">{nombreEquipoLocal}</strong></span>
              <Badge variant="outline" className={`text-[9px] px-1 py-0 h-3.5 rounded-full ${metaDispositivoLocal.badgeClass}`}>
                {metaDispositivoLocal.label}
              </Badge>
              <Edit3 className="h-3 w-3 text-muted-foreground ml-0.5" />
            </Button>

            <Badge variant="outline" className="px-3 py-1 text-xs text-slate-300 bg-app-surface border-app-border rounded-full">
              {registrosFiltrados.length} eventos
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setLimiteConsulta((prev) => (prev === 150 ? 300 : 150))}
              className="text-xs gap-1.5 rounded-full border-app-border bg-app-surface hover:bg-[#2e2e2e]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {limiteConsulta === 150 ? 'Cargar 300' : 'Ver 150'}
            </Button>
          </div>
        }
      />

      {/* Barra de Filtros, Selector de Período y Búsqueda */}
      <AuditoriaFiltros
        periodoSeleccionado={periodoSeleccionado}
        setPeriodoSeleccionado={setPeriodoSeleccionado}
        cierres={cierres}
        formatearFechaCorta={formatearFechaCorta}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        usuarioSeleccionado={usuarioSeleccionado}
        setUsuarioSeleccionado={setUsuarioSeleccionado}
        listaUsuarios={listaUsuarios}
        categoriaSeleccionada={categoriaSeleccionada}
        setCategoriaSeleccionada={setCategoriaSeleccionada}
        totalEventosRaw={registrosRaw?.length || 0}
      />

      {/* Feed de Auditoría */}
      <SurfaceCard variant="panel" className="p-4 space-y-3">
        {(isLoadingRegistros || (periodoSeleccionado === 'abierto' && isLoadingTurnoActual)) ? (
          <div className="flex flex-col items-center justify-center p-12 bg-app-surface rounded-xl border border-app-border">
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
          <div className="space-y-2.5">
            {registrosFiltrados.map((registro) => {
              const userInfo = resolverUsuario(registro);
              return (
                <AuditoriaFeedItem
                  key={registro.id}
                  registro={registro}
                  userInfo={userInfo}
                  horaRelativa={formatearHoraRelativa(registro.fecha)}
                  fechaHora={formatearFechaHora(registro.fecha)}
                  onSelect={setRegistroDetalle}
                />
              );
            })}
          </div>
        )}
      </SurfaceCard>

      {/* Modal de Inspección Detallada */}
      <AuditoriaDetalleDialog
        registro={registroDetalle}
        onClose={() => setRegistroDetalle(null)}
        articulosRecuperados={articulosRecuperados}
        cargandoArticulos={cargandoArticulos}
        userInfo={registroDetalle ? resolverUsuario(registroDetalle) : { nombre: '', email: '', rol: '' }}
        formatearFechaHora={formatearFechaHora}
      />

      {/* Modal para Renombrar e Identificar este Equipo / Dispositivo */}
      <AuditoriaEquipoDialog
        open={dialogoEquipoAbierto}
        onOpenChange={setDialogoEquipoAbierto}
        infoDispositivo={infoDispositivoLocal}
        nombreEquipo={nombreEquipoLocal}
        inputNombreEquipo={inputNombreEquipo}
        setInputNombreEquipo={setInputNombreEquipo}
        onGuardar={handleGuardarNombreEquipo}
        metaDispositivo={metaDispositivoLocal}
      />
    </div>
  );
}
