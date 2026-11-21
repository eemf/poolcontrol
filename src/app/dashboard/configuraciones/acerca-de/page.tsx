'use client';

import { useMemo, useState } from 'react';
import { appVersion, releaseHistory, type ReleaseItem } from '@/lib/version';
import { Badge } from '@/components/ui/badge';
import {
  BotonVolverArriba,
  PageHeader,
  Paginacion,
  SurfaceCard,
} from '@/components/comunes';
import {
  Calendar,
  CheckCircle2,
  GitBranch,
  History,
  Info,
  Layers,
  Server,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VersionResumenCardProps {
  release: ReleaseItem;
  etiquetaSuperior: string;
  etiquetaEstado: string;
  variante: 'actual' | 'anterior';
}

/**
 * Tarjeta comparativa para mostrar una versión destacada (actual en producción o previa).
 * Centraliza la estructura visual para evitar duplicar marcado entre ambas tarjetas.
 */
function VersionResumenCard({
  release,
  etiquetaSuperior,
  etiquetaEstado,
  variante,
}: VersionResumenCardProps) {
  const esActual = variante === 'actual';
  const IconoSuperior = esActual ? Server : History;

  return (
    <div
      className={cn(
        'rounded-2xl border p-5 space-y-4 bg-[#252526]',
        esActual ? 'border-emerald-500/35' : 'border-sky-500/30'
      )}
    >
      <div className="space-y-2 pb-3 border-b border-[#2e2e2e]">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-xs font-bold',
              esActual ? 'text-emerald-400' : 'text-sky-400'
            )}
          >
            <IconoSuperior className="h-4 w-4" />
            {etiquetaSuperior}
          </span>
          <Badge
            className={cn(
              'rounded-full text-[0.6875rem] font-semibold px-2.5 py-0.5 border',
              esActual
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
            )}
          >
            {etiquetaEstado}
          </Badge>
        </div>

        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-2xl font-bold font-headline text-slate-100">
            {esActual ? `v${release.version}` : release.version}
          </span>
          <Badge
            variant="outline"
            className="rounded-full bg-[#1e1e1e] border-[#2e2e2e] text-slate-300 text-xs font-semibold px-2.5 py-0.5"
          >
            Build {release.build}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Publicada el {release.fecha}
          </span>
          {release.tagGit && (
            <span
              className={cn(
                'flex items-center gap-1 font-mono',
                esActual ? 'text-emerald-400' : 'text-sky-400'
              )}
            >
              <Tag className="h-3.5 w-3.5" />
              {release.tagGit}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-slate-200 font-medium">{release.descripcion}</p>
        {release.cambios && release.cambios.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-400">
              {esActual
                ? 'Novedades incluidas en este lanzamiento:'
                : 'Alcance de la versión anterior:'}
            </p>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {release.cambios.map((cambio, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2
                    className={cn(
                      'h-3.5 w-3.5 shrink-0 mt-0.5',
                      esActual ? 'text-emerald-400' : 'text-sky-400'
                    )}
                  />
                  <span>{cambio}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Página de información del sistema e historial cronológico de compilaciones.
 * Pagina el historial de versiones para evitar renderizar cientos de nodos simultáneos.
 */
export default function AcercaDePage() {
  const actual = appVersion.publicadaActual;
  const anterior = appVersion.publicadaAnterior;

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalPages = Math.max(1, Math.ceil(releaseHistory.length / itemsPerPage));
  const releasesPaginados = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return releaseHistory.slice(start, start + itemsPerPage);
  }, [currentPage, itemsPerPage]);

  return (
    <div className="space-y-6 font-body">
      <PageHeader
        title="Acerca del Sistema e Historial de Versiones"
        description="Registro de la versión publicada en producción (Firebase App Hosting) y el historial de versiones previas."
        icon={Info}
        action={
          <Badge
            variant="outline"
            className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border-emerald-500/30 flex items-center gap-1.5"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            En Producción: v{actual.version} (b{actual.build})
          </Badge>
        }
      />

      {/* Comparativa de versión publicada actual vs última anterior */}
      <SurfaceCard variant="panel" className="p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <VersionResumenCard
            release={actual}
            etiquetaSuperior="Versión Publicada Actual"
            etiquetaEstado="Activa en Producción"
            variante="actual"
          />
          <VersionResumenCard
            release={anterior}
            etiquetaSuperior="Última Versión Anterior"
            etiquetaEstado="Previa"
            variante="anterior"
          />
        </div>
      </SurfaceCard>

      {/* Historial cronológico paginado */}
      <SurfaceCard variant="panel" className="p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#2e2e2e]">
          <div className="h-9 w-9 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold font-headline text-slate-100">
              Registro Cronológico de Versiones Publicadas
            </h2>
            <p className="text-xs text-slate-400">
              Historial de versiones y compilaciones publicadas en Firebase App Hosting.
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {releasesPaginados.map((item) => {
            const isActual = item.estado === 'publicada_actual';
            const isAnterior = item.estado === 'publicada_anterior';

            return (
              <div
                key={`${item.version}-${item.build}`}
                className="rounded-xl bg-[#252526] border border-[#2e2e2e] p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-base text-slate-100 font-headline">
                      v{item.version}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[0.6875rem] font-semibold h-5 rounded-full px-2.5 bg-[#1e1e1e] border-[#2e2e2e] text-slate-300"
                    >
                      Build {item.build}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[0.6875rem] font-medium h-5 rounded-full px-2.5 bg-[#1e1e1e] border-[#2e2e2e] text-slate-400"
                    >
                      {item.tipo}
                    </Badge>
                    {isActual && (
                      <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full text-[0.6875rem] font-semibold h-5 px-2.5">
                        Publicada Actual
                      </Badge>
                    )}
                    {isAnterior && (
                      <Badge className="bg-sky-500/15 text-sky-400 border border-sky-500/30 rounded-full text-[0.6875rem] font-semibold h-5 px-2.5">
                        Publicada Anterior
                      </Badge>
                    )}
                    {!isActual && !isAnterior && (
                      <Badge className="bg-[#1e1e1e] text-slate-400 border border-[#2e2e2e] rounded-full text-[0.6875rem] font-medium h-5 px-2.5">
                        Archivada
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.descripcion}</p>
                </div>

                <div className="flex flex-row sm:flex-col sm:items-end justify-between gap-1 text-xs text-slate-400 shrink-0">
                  <div className="flex items-center gap-1 font-medium">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{item.fecha}</span>
                  </div>
                  {item.tagGit && (
                    <span className="text-[0.6875rem] font-mono text-sky-400 flex items-center gap-1 bg-[#1e1e1e] border border-[#2e2e2e] px-2 py-0.5 rounded-full">
                      <GitBranch className="h-3 w-3" />
                      {item.tagGit}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Paginacion
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={releaseHistory.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(n) => {
            setItemsPerPage(n);
            setCurrentPage(1);
          }}
        />
      </SurfaceCard>

      <BotonVolverArriba threshold={150} />
    </div>
  );
}
