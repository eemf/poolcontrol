'use client';

import React, { useState } from 'react';
import {
  PageHeader,
  SurfaceCard,
  PillTabs,
  CountBadge,
} from '@/components/comunes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Moon,
  Copy,
  Check,
  Layers,
  Palette,
  Sparkles,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorToken {
  nombre: string;
  hex: string;
  clase: string;
  uso: string;
  capa?: string;
}

const CAPAS_BASE: ColorToken[] = [
  {
    capa: 'Capa 1',
    nombre: 'Fondo Base (Canvas)',
    hex: '#121212',
    clase: 'bg-[#121212]',
    uso: 'Fondo general de la aplicación (body / --background).',
  },
  {
    capa: 'Capa 2',
    nombre: 'Paneles, Modales y Sub-bloques',
    hex: '#1e1e1e',
    clase: 'bg-[#1e1e1e]',
    uso: 'Contenedores principales (panel), modales, sidebar y bloques internos dentro de tarjetas #252526 (subcard).',
  },
  {
    capa: 'Capa 3',
    nombre: 'Tarjetas y Controles',
    hex: '#252526',
    clase: 'bg-[#252526]',
    uso: 'Tarjetas individuales (surface), acordeones, inputs, selectores, PillTabs y botones secundarios.',
  },
  {
    capa: 'Interacción',
    nombre: 'Hover Táctil',
    hex: '#313131',
    clase: 'bg-[#313131]',
    uso: 'Estado hover sobre botones secundarios, filas interactivas y botones de cierre.',
  },
  {
    capa: 'Divisor',
    nombre: 'Bordes Estándar',
    hex: '#2e2e2e',
    clase: 'bg-[#2e2e2e]',
    uso: 'Bordes de paneles, tarjetas, inputs, modales y divisores internos (divide-[#2e2e2e]).',
  },
];

const COLORES_ACENTO: ColorToken[] = [
  {
    nombre: 'Acento Primario (Antigravity)',
    hex: '#0284c7 / #0078D4',
    clase: 'bg-sky-600',
    uso: 'Botones principales, pestaña activa, anillo de foco (sky-500) y montos destacados (text-sky-400).',
  },
  {
    nombre: 'Éxito / Efectivo / Liquidado',
    hex: '#059669 / #34d399',
    clase: 'bg-emerald-600',
    uso: 'Cobro en efectivo, confirmaciones positivas y estados procesados.',
  },
  {
    nombre: 'Advertencia / Monedas / Crédito',
    hex: '#f59e0b / #fbbf24',
    clase: 'bg-amber-500',
    uso: 'Badges sobre azul activo, saldos pendientes, abonos y operaciones de monedas.',
  },
  {
    nombre: 'Peligro / Anular / Eliminar',
    hex: '#e11d48 / #fb7185',
    clase: 'bg-rose-600',
    uso: 'Botones de eliminación, anulación y alertas destructivas.',
  },
];

export default function ModoOscuroPage() {
  const [copiado, setCopiado] = useState<string | null>(null);
  const [tabEjemplo, setTabEjemplo] = useState('activos');
  const [busquedaEjemplo, setBusquedaEjemplo] = useState('');
  const [selectEjemplo, setSelectEjemplo] = useState('opcion-1');

  const copiarHex = (texto: string) => {
    navigator.clipboard?.writeText(texto);
    setCopiado(texto);
    setTimeout(() => setCopiado(null), 1400);
  };

  return (
    <div className="space-y-6 pb-2 font-body">
      <PageHeader
        title="Paleta Oficial — Modo Oscuro"
        description="Guía gráfica de la jerarquía oficial en 3 capas sin negros (#121212 / #1e1e1e / #252526) basada en Historial de Ventas."
        icon={Moon}
      />

      {/* 1. Capas de Elevación */}
      <SurfaceCard variant="panel" className="p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-100">
              1. Capas de Superficie y Elevación
            </h2>
            <p className="text-xs text-slate-400">
              Regla clave: lo que está dentro de #1e1e1e usa #252526; lo que está dentro de #252526 usa #1e1e1e.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {CAPAS_BASE.map((item) => (
            <SurfaceCard
              key={item.hex}
              variant="surface"
              className="p-3.5 flex flex-col justify-between gap-3"
            >
              <div className="space-y-2.5">
                <div
                  className={cn(
                    'h-16 w-full rounded-xl border border-[#3a3a3a] flex items-end justify-between p-2',
                    item.clase
                  )}
                >
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#121212]/80 text-slate-200 border border-[#2e2e2e]">
                    {item.capa}
                  </span>
                  <button
                    type="button"
                    onClick={() => copiarHex(item.hex)}
                    className="h-6 w-6 rounded-full bg-[#1e1e1e]/90 hover:bg-[#313131] border border-[#2e2e2e] flex items-center justify-center text-slate-300 transition-colors"
                    title={`Copiar ${item.hex}`}
                  >
                    {copiado === item.hex ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-100">{item.nombre}</p>
                  <p className="text-xs font-mono font-bold text-sky-400 mt-0.5">{item.hex}</p>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-snug">{item.uso}</p>
            </SurfaceCard>
          ))}
        </div>
      </SurfaceCard>

      {/* 2. Acentos y Estados Semánticos */}
      <SurfaceCard variant="panel" className="p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Palette className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-100">
              2. Acentos y Estados Semánticos
            </h2>
            <p className="text-xs text-slate-400">
              Colores funcionales para acciones primarias, efectivo, advertencias y anulaciones.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {COLORES_ACENTO.map((item) => (
            <SurfaceCard key={item.nombre} variant="surface" className="p-3.5 space-y-2.5">
              <div className={cn('h-12 w-full rounded-xl flex items-center px-3', item.clase)}>
                <span className="text-xs font-bold text-white drop-shadow-sm">{item.hex}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100">{item.nombre}</p>
                <p className="text-[11px] text-slate-400 leading-snug mt-1">{item.uso}</p>
              </div>
            </SurfaceCard>
          ))}
        </div>
      </SurfaceCard>

      {/* 3. Diagrama Interactivo de Anidamiento Real */}
      <SurfaceCard variant="panel" className="p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-100">
              3. Ejemplo Gráfico de Anidamiento (Modelo de Referencia)
            </h2>
            <p className="text-xs text-slate-400">
              Así se combinan las 3 capas y los controles estándar en una pantalla o modal real.
            </p>
          </div>
        </div>

        {/* Simulación Capa 1 (#121212) */}
        <div className="rounded-2xl bg-[#121212] border border-[#2e2e2e] p-4 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-mono font-bold text-slate-300">Capa 1: Canvas (#121212)</span>
            <span>Fondo de página</span>
          </div>

          {/* Simulación Capa 2 (#1e1e1e) */}
          <SurfaceCard variant="panel" className="p-4 space-y-4">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono font-bold text-sky-400">
                Capa 2: Panel / Modal (#1e1e1e)
              </span>
              <span>Contenedor principal</span>
            </div>

            <PillTabs
              value={tabEjemplo}
              onValueChange={setTabEjemplo}
              searchValue={busquedaEjemplo}
              onSearchChange={setBusquedaEjemplo}
              searchPlaceholder="Input integrado (#252526)..."
              tabs={[
                { id: 'activos', label: 'Activos', icon: Clock, count: 4, badgeVariant: 'amber' },
                { id: 'todos', label: 'Todos', icon: CheckCircle2, count: 12, badgeVariant: 'sky' },
              ]}
            />

            {/* Simulación Capa 3 (#252526) */}
            <SurfaceCard variant="surface" className="p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Capa 3: Tarjeta (#252526)
                  </span>
                  <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px]">
                    Pagada
                  </Badge>
                  <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full text-[10px]">
                    Pendiente
                  </Badge>
                </div>
                <span className="text-sm font-black text-sky-400 tabular-nums">Q150.00</span>
              </div>

              {/* Simulación Sub-bloque interno (#1e1e1e sobre #252526) */}
              <SurfaceCard variant="subcard" className="p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-slate-300">
                    Sub-bloque interno (#1e1e1e sobre #252526)
                  </span>
                  <span className="text-slate-400">Desglose de ítems</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300 pt-1 border-t border-[#2e2e2e]">
                  <span>1x Producto de ejemplo</span>
                  <span className="font-bold text-slate-100 tabular-nums">Q150.00</span>
                </div>
              </SurfaceCard>
            </SurfaceCard>

            {/* Controles estándar sobre Capa 2 (#1e1e1e) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="relative">
                <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input placeholder="Input estándar (#252526)" className="pl-9 h-10 text-xs" />
              </div>

              <Select value={selectEjemplo} onValueChange={setSelectEjemplo}>
                <SelectTrigger className="h-10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="opcion-1" className="text-xs">
                    Selector estándar (#252526)
                  </SelectItem>
                  <SelectItem value="opcion-2" className="text-xs">
                    Segunda opción
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-full h-9 px-4 text-xs bg-[#252526] hover:bg-[#313131] text-slate-200 border border-[#2e2e2e]"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="rounded-full h-9 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white"
                >
                  Confirmar <CountBadge count={3} variant="white" className="ml-1.5" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Éxito
              </span>
              <span className="inline-flex items-center gap-1 text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5" /> Advertencia
              </span>
              <span className="inline-flex items-center gap-1 text-rose-400">
                <XCircle className="h-3.5 w-3.5" /> Peligro
              </span>
            </div>
          </SurfaceCard>
        </div>
      </SurfaceCard>
    </div>
  );
}
