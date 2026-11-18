'use client';

import React, { useState } from 'react';
import { 
  Layers, CheckCircle2, AlertTriangle, XCircle, 
  Sparkles, SlidersHorizontal, BookOpen, MessageSquare, ShieldCheck, Check 
} from 'lucide-react';
import { PageHeader } from '@/components/comunes/page-header';
import { PillTabs } from '@/components/comunes/pill-tabs';
import { SurfaceCard } from '@/components/comunes/surface-card';
import { BotonVolverArriba } from '@/components/comunes/boton-volver-arriba';
import { ComparadorCasosReales } from './_components/comparador-casos-reales';
import { CASOS_REALES } from './_components/datos-casos-reales';
import { LineaAntigravityOficial } from './_components/linea-antigravity-oficial';
import { LineaBordeSuperior } from './_components/linea-borde-superior';
import { LineaGlowCapsula } from './_components/linea-glow-capsula';
import { LineaPosTactil } from './_components/linea-pos-tactil';

export default function DisenosMensajesPage() {
  const [tabActual, setTabActual] = useState<'casos-reales' | 'lineas' | 'reglas'>('casos-reales');

  const tabsConfig = [
    {
      id: 'casos-reales',
      label: 'Tus 7 Casos Estandarizados',
      icon: Layers,
      count: 7,
      badgeVariant: 'amber' as const,
    },
    {
      id: 'lineas',
      label: 'Propuestas de Línea de Estilo',
      icon: SlidersHorizontal,
      count: 4,
    },
    {
      id: 'reglas',
      label: 'Reglas Maestras de Modales',
      icon: BookOpen,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado Estándar del Design System */}
      <PageHeader
        title="Estandarización y Líneas de Diseño para Modales"
        description="Propuestas de unificación visual para que todos los diálogos emergentes del sistema (ventas, traslados, créditos, abonos y alertas) sigan una sola línea coherente."
        icon={MessageSquare}
      />

      {/* Contenedor Principal */}
      <SurfaceCard variant="panel" className="p-4 sm:p-6 space-y-6">
        
        {/* Pestañas Estándar tipo Píldora */}
        <div className="flex justify-start">
          <PillTabs
            value={tabActual}
            onValueChange={(val) => setTabActual(val as any)}
            tabs={tabsConfig}
          />
        </div>

        {/* VISTA 1: Tus 6 Casos Reales Estandarizados */}
        {tabActual === 'casos-reales' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="font-bold text-sm sm:text-base text-slate-100">
                Comparador Interactivo de tus 7 Modales Reales
              </h3>
              <p className="text-xs text-muted-foreground">
                Hemos tomado los 7 modales de tus capturas (incluyendo ¡Tiempo Culminado!) con un diseño moderno, iconos más grandes con animación, y el botón Cancelar siempre alineado a la izquierda.
              </p>
            </div>

            <ComparadorCasosReales />
          </div>
        )}

        {/* VISTA 2: Comparativa de las 4 Líneas de Estilo */}
        {tabActual === 'lineas' && (
          <div className="space-y-8">
            <div className="space-y-1">
              <h3 className="font-bold text-sm sm:text-base text-slate-100">
                Las 4 Propuestas de Línea Visual para Elegir
              </h3>
              <p className="text-xs text-muted-foreground">
                Compara la anatomía de cada línea de estilo aplicada sobre el mismo caso representativo (¿Mover Cuenta a Crédito?).
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Línea 1 */}
              <div className="p-4 rounded-2xl bg-app-surface border border-app-border space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-app-border">
                  <span className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-sky-500/10 text-sky-400 font-bold text-[11px] inline-flex items-center justify-center border border-sky-500/20">1</span>
                    Línea 1: Antigravity Oficial (Recomendada)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Más Equilibrada</span>
                </div>
                <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                  Fondo corporativo en `#252526`, icono circular tonal discreto, botón cerrar (X) siempre presente, botón cancelar neutro y confirmar con acento semántico.
                </p>
                <div className="p-3 rounded-xl bg-[#121212] border border-app-border flex justify-center">
                  <LineaAntigravityOficial caso={CASOS_REALES[1]} />
                </div>
              </div>

              {/* Línea 2 */}
              <div className="p-4 rounded-2xl bg-app-surface border border-app-border space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-app-border">
                  <span className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 font-bold text-[11px] inline-flex items-center justify-center border border-amber-500/20">2</span>
                    Línea 2: Borde Superior Semántico de Acento
                  </span>
                  <span className="text-[10px] text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">Alta Visibilidad</span>
                </div>
                <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                  Barra superior coloreada de 4px (`border-t-4`) que transmite inmediatamente la severidad del mensaje (azul = normal, ámbar = alerta, rojo = destructivo).
                </p>
                <div className="p-3 rounded-xl bg-[#121212] border border-app-border flex justify-center">
                  <LineaBordeSuperior caso={CASOS_REALES[1]} />
                </div>
              </div>

              {/* Línea 3 */}
              <div className="p-4 rounded-2xl bg-app-surface border border-app-border space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-app-border">
                  <span className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[11px] inline-flex items-center justify-center border border-emerald-500/20">3</span>
                    Línea 3: Glow / Cápsula Suave
                  </span>
                  <span className="text-[10px] text-sky-300 font-semibold bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">Estilo Moderno</span>
                </div>
                <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                  Bordes con resplandor perimetral sutil (`shadow-glow`), esquinas más redondeadas (`rounded-3xl`) e icono ampliado para mayor impacto visual.
                </p>
                <div className="p-3 rounded-xl bg-[#121212] border border-app-border flex justify-center">
                  <LineaGlowCapsula caso={CASOS_REALES[1]} />
                </div>
              </div>

              {/* Línea 4 */}
              <div className="p-4 rounded-2xl bg-app-surface border border-app-border space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-app-border">
                  <span className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-400 font-bold text-[11px] inline-flex items-center justify-center border border-purple-500/20">4</span>
                    Línea 4: Táctil POS Ergonómico (Botones 50/50)
                  </span>
                  <span className="text-[10px] text-purple-300 font-semibold bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">Ideal Tablets</span>
                </div>
                <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                  Especialmente pensado para pantallas táctiles: botones anchos distribuidos al 50% / 50% en el pie para pulsación rápida con los dedos.
                </p>
                <div className="p-3 rounded-xl bg-[#121212] border border-app-border flex justify-center">
                  <LineaPosTactil caso={CASOS_REALES[1]} />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VISTA 3: Reglas Maestras de Estandarización */}
        {tabActual === 'reglas' && (
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <h3 className="font-bold text-sm sm:text-base text-slate-100">
                Las 5 Reglas de Oro para Mantener una Sola Línea en Todos los Modales
              </h3>
              <p className="text-muted-foreground">
                Siguiendo estas 5 pautas resolveremos las inconsistencias vistas en las capturas anteriores.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-app-surface border border-app-border space-y-2">
                <span className="font-bold text-slate-100 flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  1. Botón Cancelar siempre neutro
                </span>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Problema anterior:</strong> En algunos modales el botón Cancelar tenía borde cyan brillante (`border-2 border-sky-400`), compitiendo con el botón de confirmación.<br />
                  <strong>Regla unificada:</strong> Cancelar debe ser siempre un botón secundario neutro (`variant="outline"` o fantasma con borde `border-app-border`), dejando el foco visual exclusivamente a la acción principal.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-app-surface border border-app-border space-y-2">
                <span className="font-bold text-slate-100 flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  2. Botón de Confirmación con Color Semántico Coherente
                </span>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Normal / Traslado / Abono:</strong> Azul Antigravity (`bg-sky-600 text-white`).<br />
                  <strong>Advertencia / Crédito:</strong> Ámbar corporativo (`bg-amber-400 text-slate-950 font-bold`).<br />
                  <strong>Destructivo / Descartar:</strong> Rojo carmesí (`bg-rose-600 text-white`).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-app-surface border border-app-border space-y-2">
                <span className="font-bold text-slate-100 flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  3. Botón de Cerrar (X) universal
                </span>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Problema anterior:</strong> Algunos diálogos tenían la 'X' en la esquina y otros no.<br />
                  <strong>Regla unificada:</strong> Todo modal sin excepción debe incluir la 'X' superior derecha para permitir escape rápido sin forzar la lectura del footer.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-app-surface border border-app-border space-y-2">
                <span className="font-bold text-slate-100 flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  4. Cajas de Datos en Capa Inset Oficial (#141414)
                </span>
                <p className="text-muted-foreground leading-relaxed">
                  Toda información auxiliar (saldo del cliente, estación seleccionada, total de deuda o PIN) debe encapsularse en un contenedor recesivo `bg-[#141414]` con borde `#2e2e2e`, garantizando una lectura ordenada y sin saturación.
                </p>
              </div>
            </div>
          </div>
        )}

      </SurfaceCard>

      {/* Botón flotante para volver arriba */}
      <BotonVolverArriba threshold={150} />
    </div>
  );
}
