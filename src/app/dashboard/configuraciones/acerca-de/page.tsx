'use client';

import { appVersion, releaseHistory } from '@/lib/version';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Info, 
  GitBranch, 
  CheckCircle2, 
  History, 
  Sparkles, 
  Calendar, 
  Tag, 
  Layers, 
  Server
} from 'lucide-react';

export default function AcercaDePage() {
  const actual = appVersion.publicadaActual;
  const anterior = appVersion.publicadaAnterior;

  return (
    <div className="space-y-6 font-body">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight text-foreground flex items-center gap-2.5">
            <Info className="h-6 w-6 text-primary" />
            Acerca del Sistema e Historial de Versiones
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Registro de la versión publicada en producción (Firebase App Hosting) y el historial de versiones previas.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="outline" className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            En Producción: v{actual.version} (b{actual.build})
          </Badge>
        </div>
      </div>

      {/* Grid: Versión Publicada en Hosting vs Última Versión Anterior */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarjeta Versión Publicada Actual en Hosting */}
        <Card className="rounded-2xl border-emerald-500/40 bg-emerald-500/[0.04] dark:bg-emerald-950/15 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b border-emerald-500/15">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <Server className="h-4 w-4" />
                Versión Publicada Actual
              </span>
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white rounded-full text-[10px] font-bold px-2.5 py-0.5">
                Activa en Producción
              </Badge>
            </div>
            <CardTitle className="text-2xl font-black font-headline tracking-tight text-foreground mt-2 flex items-baseline gap-2">
              <span>v{actual.version}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                Build {actual.build}
              </span>
            </CardTitle>
            <CardDescription className="text-xs flex items-center gap-3 text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Publicada el {actual.fecha}
              </span>
              {actual.tagGit && (
                <span className="flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400">
                  <Tag className="h-3.5 w-3.5" />
                  {actual.tagGit}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <p className="text-sm text-foreground/90 font-medium">
              {actual.descripcion}
            </p>
            {actual.cambios && actual.cambios.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <p className="text-[11px] font-bold text-muted-foreground">
                  Novedades incluidas en este lanzamiento:
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {actual.cambios.map((c, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tarjeta Última Versión Anterior */}
        <Card className="rounded-2xl border-blue-500/30 bg-blue-500/[0.03] dark:bg-blue-950/10 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b border-blue-500/10">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                <History className="h-4 w-4" />
                Última Versión Anterior
              </span>
              <Badge variant="outline" className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border-blue-500/30 text-blue-600 dark:text-blue-400 bg-background">
                Previa
              </Badge>
            </div>
            <CardTitle className="text-2xl font-black font-headline tracking-tight text-foreground mt-2 flex items-baseline gap-2">
              <span>{anterior.version}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground">
                Build {anterior.build}
              </span>
            </CardTitle>
            <CardDescription className="text-xs flex items-center gap-3 text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Publicada el {anterior.fecha}
              </span>
              {anterior.tagGit && (
                <span className="flex items-center gap-1 font-mono">
                  <Tag className="h-3.5 w-3.5" />
                  {anterior.tagGit}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <p className="text-sm text-foreground/90 font-medium">
              {anterior.descripcion}
            </p>
            {anterior.cambios && anterior.cambios.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <p className="text-[11px] font-bold text-muted-foreground">
                  Alcance de la versión anterior:
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {anterior.cambios.map((c, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Historial Completo de Versiones */}
      <Card className="rounded-2xl border-muted/50 overflow-hidden shadow-sm">
        <CardHeader className="pb-3 border-b border-muted/30">
          <CardTitle className="text-base font-bold font-headline flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Registro Cronológico de Versiones Publicadas
          </CardTitle>
          <CardDescription className="text-xs">
            Historial de versiones y compilaciones que han estado publicadas en Firebase App Hosting.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-muted/30">
            {releaseHistory.map((item, idx) => {
              const isActual = item.estado === 'publicada_actual';
              const isAnterior = item.estado === 'publicada_anterior';

              return (
                <div key={idx} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-colors hover:bg-muted/10">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-base text-foreground font-headline">
                        {item.version}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-semibold h-5 rounded-full px-2">
                        Build {item.build}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-medium h-5 rounded-full px-2">
                        {item.tipo}
                      </Badge>
                      {isActual && (
                        <Badge className="bg-emerald-600 text-white rounded-full text-[9px] font-bold h-5 px-2">
                          Publicada Actual
                        </Badge>
                      )}
                      {isAnterior && (
                        <Badge className="bg-blue-600 text-white rounded-full text-[9px] font-bold h-5 px-2">
                          Publicada Anterior
                        </Badge>
                      )}
                      {!isActual && !isAnterior && (
                        <Badge variant="secondary" className="rounded-full text-[9px] font-medium h-5 px-2">
                          Archivada
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.descripcion}
                    </p>
                  </div>

                  <div className="flex flex-row sm:flex-col sm:items-end justify-between gap-1 text-xs text-muted-foreground shrink-0">
                    <div className="flex items-center gap-1 font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{item.fecha}</span>
                    </div>
                    {item.tagGit && (
                      <span className="text-[11px] font-mono text-primary flex items-center gap-1 bg-muted/40 px-2 py-0.5 rounded-md">
                        <GitBranch className="h-3 w-3" />
                        {item.tagGit}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
