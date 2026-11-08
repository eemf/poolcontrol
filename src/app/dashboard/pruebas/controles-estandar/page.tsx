'use client';

import React, { useState } from 'react';
import { 
  Sliders, 
  Search, 
  Check, 
  X, 
  Sparkles, 
  AlertCircle, 
  Eye, 
  RefreshCw, 
  Send, 
  DollarSign, 
  Plus, 
  Trash2, 
  Pencil, 
  CheckCircle2, 
  HelpCircle,
  FolderOpen,
  ArrowRight,
  Palette,
  Moon,
  Sun,
  Copy,
  CheckCheck,
  Laptop,
  Code2,
  Layers,
  Contrast
} from 'lucide-react';
import { PageHeader, SurfaceCard, CountBadge } from '@/components/comunes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputNumero } from '@/components/ui/input-numero';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Tipos para las paletas
interface ColorItem {
  nombre: string;
  token: string;
  hexOscuro: string;
  hexClaro: string;
  descripcion: string;
  uso: string;
}

const PALETA_SISTEMA: ColorItem[] = [
  {
    nombre: 'Lienzo Base (Canvas)',
    token: 'bg-background',
    hexOscuro: '#12151b',
    hexClaro: '#f8fafc',
    descripcion: 'Fondo estructural de la ventana y áreas externas (inspirado en el editor Antigravity)',
    uso: 'html, body, layout-canvas'
  },
  {
    nombre: 'Panel Principal',
    token: 'bg-app-panel',
    hexOscuro: '#1e1e1e',
    hexClaro: '#ffffff',
    descripcion: 'Contenedores principales, barras laterales, encabezados y modales',
    uso: 'Sidebar, Modales, Tableros, Tarjetas base'
  },
  {
    nombre: 'Superficie de Control (Surface)',
    token: 'bg-app-surface',
    hexOscuro: '#252526',
    hexClaro: '#f1f5f9',
    descripcion: 'Fondo para inputs, acordeones, tarjetas secundarias y barras de herramientas',
    uso: 'Inputs, Selects, Sub-tarjetas, Tab-bar'
  },
  {
    nombre: 'Bordes Nítidos (Border)',
    token: 'border-app-border',
    hexOscuro: '#2e2e2e',
    hexClaro: '#cbd5e1',
    descripcion: 'Línea de 1px de alta definición para delimitar controles y tarjetas sin halos',
    uso: 'border-app-border, divisores, inputs'
  },
  {
    nombre: 'Azul Primario de Acción',
    token: 'bg-primary (sky-600)',
    hexOscuro: '#0284c7',
    hexClaro: '#0284c7',
    descripcion: 'Color de llamada a la acción, botones principales y aros de foco nítidos',
    uso: 'Botón Guardar, foco activo, pestañas'
  },
  {
    nombre: 'Éxito / Balance Positivo',
    token: 'bg-emerald-600',
    hexOscuro: '#10b981',
    hexClaro: '#059669',
    descripcion: 'Cobros completados, saldo a favor, mesas activas y confirmaciones',
    uso: 'Botón Cobrar, Badges de éxito'
  },
  {
    nombre: 'Alerta / Turnos y Conteos',
    token: 'bg-amber-500',
    hexOscuro: '#f59e0b',
    hexClaro: '#d97706',
    descripcion: 'Alertas de apertura de turno, pendientes por autorizar y advertencias',
    uso: 'Badges pendientes, avisos de arqueo'
  },
  {
    nombre: 'Peligro / Destructivo',
    token: 'bg-rose-600',
    hexOscuro: '#f43f5e',
    hexClaro: '#e11d48',
    descripcion: 'Eliminaciones, cancelaciones, errores de validación y cierres forzados',
    uso: 'Botón Cancelar, inputs con error'
  },
  {
    nombre: 'Acento Secundario (Violeta)',
    token: 'bg-purple-600',
    hexOscuro: '#a855f7',
    hexClaro: '#7c3aed',
    descripcion: 'Categorías especiales, módulos de auditoría y catálogos de inventario',
    uso: 'Badges de categoría, filtros analíticos'
  }
];

export default function ControlesEstandarPage() {
  // Estados para pruebas interactivas
  const [textoNormal, setTextoNormal] = useState('Texto de ejemplo');
  const [busqueda, setBusqueda] = useState('');
  const [monto, setMonto] = useState<number | ''>(150);
  const [categoria, setCategoria] = useState('bebidas');
  const [switchActivo, setSwitchActivo] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [valorInvalido, setValorInvalido] = useState('');

  // Estados para la sección de paleta de colores
  const [vistaPaleta, setVistaPaleta] = useState<'oscuro' | 'claro' | 'comparativa'>('oscuro');
  const [colorCopiado, setColorCopiado] = useState<string | null>(null);
  const [temaDemoVivo, setTemaDemoVivo] = useState<'oscuro' | 'claro'>('oscuro');

  const copiarAlPortapapeles = (hex: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(hex);
      setColorCopiado(hex);
      setTimeout(() => setColorCopiado(null), 2000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado Estándar del Sistema */}
      <PageHeader
        title="Catálogo de Controles y Paleta Estándar"
        description="Guía visual interactiva de controles UI y paleta oficial (Modo Oscuro Antigravity IDE y Modo Claro). Inspecciona, interactúa y valida antes de la aplicación global."
        icon={Sliders}
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Versión UI Oficial</span>
            <CountBadge count="1.0" variant="sky" />
          </div>
        }
      />

      {/* SECCIÓN A: PALETA DE COLORES (MODO OSCURO ANTIGRAVITY & MODO CLARO) */}
      <SurfaceCard variant="panel" className="p-5 border-sky-500/30 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#2e2e2e]">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <Palette className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-100">
                Paleta Oficial de Colores: Modo Oscuro (Antigravity IDE) & Modo Claro
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Referencia cromática inspirada en la atmósfera oscura, nítida y descansada del IDE Antigravity, con su equivalente de alto contraste para Modo Claro. Haz clic en cualquier color para copiar su código Hex.
            </p>
          </div>

          {/* Selector de Pestañas de Vista de Paleta */}
          <div className="inline-flex items-center p-1 rounded-full bg-[#182330] border border-[#2e2e2e] shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setVistaPaleta('oscuro')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                vistaPaleta === 'oscuro'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              Oscuro (IDE)
            </button>
            <button
              type="button"
              onClick={() => setVistaPaleta('claro')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                vistaPaleta === 'claro'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              Modo Claro
            </button>
            <button
              type="button"
              onClick={() => setVistaPaleta('comparativa')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                vistaPaleta === 'comparativa'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Contrast className="w-3.5 h-3.5" />
              Comparativa
            </button>
          </div>
        </div>

        {/* Notificación de copiado rápido */}
        {colorCopiado && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs w-fit animate-in fade-in slide-in-from-top-1">
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Código <strong>{colorCopiado}</strong> copiado al portapapeles</span>
          </div>
        )}

        {/* Vista: Modo Oscuro (Antigravity IDE) */}
        {vistaPaleta === 'oscuro' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {PALETA_SISTEMA.map((item, idx) => (
              <div
                key={idx}
                onClick={() => copiarAlPortapapeles(item.hexOscuro)}
                className="group relative p-3.5 rounded-2xl bg-[#182330] hover:bg-[#1f293b] border border-[#2e2e2e] hover:border-sky-500/60 cursor-pointer transition-all duration-200 space-y-2.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{item.nombre}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-sky-400 font-medium">Copiar</span>
                    <Copy className="w-3 h-3 text-sky-400" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Muestra visual de color */}
                  <div
                    className="w-12 h-12 rounded-xl border border-white/10 shadow-inner flex items-center justify-center shrink-0"
                    style={{ backgroundColor: item.hexOscuro }}
                  >
                    <span className="text-[10px] font-mono text-white/50 drop-shadow">
                      {idx + 1}
                    </span>
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <div className="font-mono text-sm font-bold text-sky-400">
                      {item.hexOscuro}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 truncate">
                      {item.token}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {item.descripcion}
                </p>

                <div className="pt-1.5 border-t border-[#2e2e2e]/50 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Uso:</span>
                  <span className="font-mono text-slate-300">{item.uso}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vista: Modo Claro */}
        {vistaPaleta === 'claro' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {PALETA_SISTEMA.map((item, idx) => (
              <div
                key={idx}
                onClick={() => copiarAlPortapapeles(item.hexClaro)}
                className="group relative p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-sky-500/60 cursor-pointer transition-all duration-200 space-y-2.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{item.nombre}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-sky-600 font-medium">Copiar</span>
                    <Copy className="w-3 h-3 text-sky-600" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Muestra visual de color */}
                  <div
                    className="w-12 h-12 rounded-xl border border-slate-300 shadow-inner flex items-center justify-center shrink-0"
                    style={{ backgroundColor: item.hexClaro }}
                  >
                    <span className="text-[10px] font-mono text-slate-500">
                      {idx + 1}
                    </span>
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <div className="font-mono text-sm font-bold text-sky-700">
                      {item.hexClaro}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 truncate">
                      {item.token}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {item.descripcion}
                </p>

                <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Uso:</span>
                  <span className="font-mono text-slate-700">{item.uso}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vista: Comparativa Lado a Lado */}
        {vistaPaleta === 'comparativa' && (
          <div className="overflow-x-auto rounded-2xl border border-[#2e2e2e]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#182330] text-slate-300 font-semibold border-b border-[#2e2e2e]">
                <tr>
                  <th className="p-3">Elemento / Token</th>
                  <th className="p-3">Modo Oscuro (Antigravity IDE)</th>
                  <th className="p-3">Modo Claro Corporativo</th>
                  <th className="p-3">Uso Recomendado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2e2e2e] bg-[#1e1e1e]">
                {PALETA_SISTEMA.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#252526]/50 transition-colors">
                    <td className="p-3">
                      <span className="font-bold text-slate-100 block">{item.nombre}</span>
                      <span className="text-[11px] font-mono text-sky-400">{item.token}</span>
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => copiarAlPortapapeles(item.hexOscuro)}
                        className="inline-flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-[#182330] border border-[#2e2e2e] hover:border-sky-500 transition-colors"
                      >
                        <span
                          className="w-6 h-6 rounded-full border border-white/10 shrink-0"
                          style={{ backgroundColor: item.hexOscuro }}
                        />
                        <span className="font-mono font-bold text-slate-200">{item.hexOscuro}</span>
                      </button>
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => copiarAlPortapapeles(item.hexClaro)}
                        className="inline-flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-white border border-slate-300 hover:border-sky-600 transition-colors"
                      >
                        <span
                          className="w-6 h-6 rounded-full border border-slate-300 shrink-0"
                          style={{ backgroundColor: item.hexClaro }}
                        />
                        <span className="font-mono font-bold text-slate-800">{item.hexClaro}</span>
                      </button>
                    </td>
                    <td className="p-3 text-[11px] text-slate-300">
                      <p>{item.descripcion}</p>
                      <span className="font-mono text-slate-400 text-[10px] block mt-0.5">{item.uso}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DEMO VIVO: Simulador Interactivo de Tema */}
        <div className="p-4 rounded-2xl bg-[#182330] border border-[#2e2e2e] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-slate-200 block">
                Simulador Interactivo de Tema en Tiempo Real
              </span>
              <p className="text-[11px] text-slate-400">
                Cambia el interruptor para ver cómo se comportan los controles estándar exactamente en cada paleta.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#12151b] px-3 py-1.5 rounded-full border border-[#2e2e2e]">
              <span className={`text-xs ${temaDemoVivo === 'oscuro' ? 'text-sky-400 font-bold' : 'text-slate-400'}`}>
                Oscuro
              </span>
              <Switch
                checked={temaDemoVivo === 'claro'}
                onCheckedChange={(checked) => setTemaDemoVivo(checked ? 'claro' : 'oscuro')}
              />
              <span className={`text-xs ${temaDemoVivo === 'claro' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                Claro
              </span>
            </div>
          </div>

          {/* Caja Contenedora con Tema Vivo */}
          <div
            className={`p-5 rounded-2xl border transition-all duration-300 ${
              temaDemoVivo === 'oscuro'
                ? 'bg-[#12151b] border-[#2e2e2e] text-slate-100'
                : 'bg-[#f8fafc] border-slate-200 text-slate-900 shadow-sm'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {/* Input en tema vivo */}
              <div className="space-y-1.5">
                <label className={`text-xs font-medium ml-1 block ${temaDemoVivo === 'oscuro' ? 'text-slate-200' : 'text-slate-700'}`}>
                  Input Estándar ({temaDemoVivo === 'oscuro' ? 'Modo Antigravity' : 'Modo Claro'})
                </label>
                <div className="relative">
                  <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold ${temaDemoVivo === 'oscuro' ? 'text-sky-400' : 'text-sky-600'}`}>
                    Q
                  </span>
                  <input
                    type="text"
                    defaultValue="250.00"
                    className={`flex h-10 w-full rounded-full pl-9 pr-4 text-sm font-semibold transition-colors focus:outline-none ${
                      temaDemoVivo === 'oscuro'
                        ? 'bg-[#252526] border border-[#2e2e2e] text-slate-100 focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                        : 'bg-white border border-slate-300 text-slate-900 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 shadow-sm'
                    }`}
                  />
                </div>
              </div>

              {/* Select en tema vivo */}
              <div className="space-y-1.5">
                <label className={`text-xs font-medium ml-1 block ${temaDemoVivo === 'oscuro' ? 'text-slate-200' : 'text-slate-700'}`}>
                  Select ({temaDemoVivo === 'oscuro' ? 'bg-[#252526]' : 'bg-white'})
                </label>
                <Select defaultValue="mesa1">
                  <SelectTrigger
                    className={`h-10 rounded-full px-4 text-sm font-medium ${
                      temaDemoVivo === 'oscuro'
                        ? 'bg-[#252526] border-[#2e2e2e] text-slate-100 focus:ring-1 focus:ring-sky-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:ring-1 focus:ring-sky-600 shadow-sm'
                    }`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={temaDemoVivo === 'oscuro' ? 'bg-[#1e1e1e] border-[#2e2e2e] text-slate-200' : 'bg-white border-slate-200 text-slate-800'}>
                    <SelectItem value="mesa1" className="rounded-full">Mesa 1 (Pool Estándar)</SelectItem>
                    <SelectItem value="mesa2" className="rounded-full">Mesa 2 (Carambola)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Botón y Badges en tema vivo */}
              <div className="flex items-center gap-3">
                <Button className="h-10 px-5 rounded-full bg-sky-600 hover:bg-sky-500 text-white font-medium shadow-sm">
                  <Plus className="w-4 h-4 mr-1.5" /> Registrar
                </Button>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-full border ${
                  temaDemoVivo === 'oscuro'
                    ? 'bg-[#1e1e1e] border-[#2e2e2e] text-slate-200'
                    : 'bg-white border-slate-300 text-slate-800 shadow-sm'
                }`}>
                  <span className="text-xs">Turno</span>
                  <CountBadge count={1} variant="amber" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SurfaceCard>

      {/* SECCIÓN B: COMPARATIVA DIRECTA DEL PROBLEMA REPORTADO */}
      <SurfaceCard variant="panel" className="p-5 border-amber-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-slate-100">
            Comparativa Directa: Input con Falla vs Input Estandarizado
          </h2>
        </div>
        <p className="text-xs text-slate-300 mb-6">
          Esta comparativa reproduce exactamente los dos casos que identificaste en tus capturas para validar la corrección del borde concéntrico (efecto dona) y las proporciones verticales.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Caso 1: Incorrecto (Captura 2) */}
          <div className="p-4 rounded-2xl bg-[#182330] border border-rose-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                <X className="w-4 h-4" /> Caso con Problema (Captura 2)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">h-9 + ring-offset + centrado</span>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs text-slate-400">Monto del Premio (Q)</Label>
              {/* Simulación con ring-offset que crea el artefacto de borde doble */}
              <input
                type="text"
                defaultValue="0.00"
                className="flex h-9 w-full rounded-full border border-input bg-[#252526] px-3 py-2 text-sm text-center text-slate-200 ring-offset-2 ring-offset-[#0f172a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              />
            </div>

            <div className="text-[11px] text-rose-300/80 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/40 space-y-1">
              <p className="font-semibold">Defectos visibles:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                <li><strong className="text-rose-200">Efecto Dona / Borde Doble:</strong> <code className="text-slate-300 font-mono">ring-offset-2</code> deja un espacio oscuro entre el borde interior y el aro azul.</li>
                <li><strong className="text-rose-200">Altura Apretada (h-9):</strong> Reduce el área táctil y distorsiona la cápsula.</li>
                <li><strong className="text-rose-200">Texto Centrado Forzado:</strong> Complica la lectura en cajas de texto amplias.</li>
              </ul>
            </div>
          </div>

          {/* Caso 2: Estandarizado Oficial (Captura 1 Perfeccionada) */}
          <div className="p-4 rounded-2xl bg-[#1e1e1e] border border-emerald-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <Check className="w-4 h-4" /> Estándar Oficial Aprobado
              </span>
              <span className="text-[11px] text-emerald-400/90 font-mono">h-10 + ring-1 + borde nítido</span>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-200 ml-1">Monto del Premio (Q)</Label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-sky-400">
                  Q
                </span>
                <input
                  type="text"
                  defaultValue="150.00"
                  className="flex h-10 w-full rounded-full border border-[#2e2e2e] bg-[#252526] pl-9 pr-4 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors shadow-sm"
                />
              </div>
            </div>

            <div className="text-[11px] text-emerald-300/90 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-900/40 space-y-1">
              <p className="font-semibold">Mejoras aplicadas:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                <li><strong className="text-emerald-200">Borde Nítido y Limpio:</strong> Aro de foco directo sin offset ni halos oscuros.</li>
                <li><strong className="text-emerald-200">Altura Estándar (h-10):</strong> Geometría balanceada ergonómicamente para escritorio y móvil.</li>
                <li><strong className="text-emerald-200">Prefijo Integrado (Q):</strong> Indicador de moneda limpio que evita textos flotantes confusos.</li>
              </ul>
            </div>
          </div>
        </div>
      </SurfaceCard>

      {/* SECCIÓN C: GALERÍA DE INPUTS ESTANDARIZADOS */}
      <SurfaceCard variant="panel" className="p-5 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            1. Inputs de Texto y Búsqueda
          </h2>
          <p className="text-xs text-slate-400">
            Fondo corporativo <code className="text-sky-300">#252526</code>, borde <code className="text-sky-300">#2e2e2e</code>, foco <code className="text-sky-300">sky-500</code>, padding ergonómico <code className="text-sky-300">px-4</code> y altura <code className="text-sky-300">h-10</code>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Input Normal */}
          <div className="p-3.5 rounded-xl bg-[#252526] border border-[#2e2e2e] space-y-2">
            <Label htmlFor="input-ejemplo-texto" className="text-xs font-medium text-slate-200 ml-1">
              Nombre de Cliente
            </Label>
            <input
              id="input-ejemplo-texto"
              type="text"
              value={textoNormal}
              onChange={(e) => setTextoNormal(e.target.value)}
              placeholder="Escribe un nombre..."
              className="flex h-10 w-full rounded-full border border-[#2e2e2e] bg-[#1e1e1e] px-4 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
            />
            <span className="text-[11px] text-slate-400 ml-1 block">Input estándar con relleno suave</span>
          </div>

          {/* Buscador con Icono y Botón de Limpiar */}
          <div className="p-3.5 rounded-xl bg-[#252526] border border-[#2e2e2e] space-y-2">
            <Label htmlFor="input-ejemplo-buscar" className="text-xs font-medium text-slate-200 ml-1">
              Buscador Rápido
            </Label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="input-ejemplo-buscar"
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar producto, cliente o folio..."
                className="flex h-10 w-full rounded-full border border-[#2e2e2e] bg-[#1e1e1e] pl-10 pr-9 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <span className="text-[11px] text-slate-400 ml-1 block">Con icono contextual centrado</span>
          </div>

          {/* Input Numérico con Prefijo Moneda */}
          <div className="p-3.5 rounded-xl bg-[#252526] border border-[#2e2e2e] space-y-2">
            <Label htmlFor="input-ejemplo-monto" className="text-xs font-medium text-slate-200 ml-1">
              Monto en Quetzales (Q)
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-sky-400 select-none">
                Q
              </span>
              <input
                id="input-ejemplo-monto"
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value === '' ? '' : Number(e.target.value))}
                step="0.01"
                min="0"
                className="flex h-10 w-full rounded-full border border-[#2e2e2e] bg-[#1e1e1e] pl-9 pr-4 py-2 text-sm font-semibold text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors"
              />
            </div>
            <span className="text-[11px] text-slate-400 ml-1 block">Alineación natural, sin flechas molestas</span>
          </div>

          {/* Input con Error de Validación */}
          <div className="p-3.5 rounded-xl bg-[#252526] border border-[#2e2e2e] space-y-2">
            <Label htmlFor="input-ejemplo-error" className="text-xs font-medium text-rose-300 ml-1 flex items-center gap-1">
              Campo Obligatorio <span className="text-rose-400">*</span>
            </Label>
            <div className="relative">
              <input
                id="input-ejemplo-error"
                type="text"
                value={valorInvalido}
                onChange={(e) => setValorInvalido(e.target.value)}
                placeholder="Ingresa un valor válido..."
                className="flex h-10 w-full rounded-full border border-rose-500/70 bg-[#1e1e1e] px-4 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 pr-9 transition-colors"
              />
              <AlertCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
            </div>
            <span className="text-[11px] text-rose-400 ml-1 block">Este campo no puede quedar vacío</span>
          </div>

          {/* Input Deshabilitado */}
          <div className="p-3.5 rounded-xl bg-[#252526] border border-[#2e2e2e] space-y-2 opacity-60">
            <Label htmlFor="input-ejemplo-disabled" className="text-xs font-medium text-slate-300 ml-1">
              Folio de Sistema (Bloqueado)
            </Label>
            <input
              id="input-ejemplo-disabled"
              type="text"
              disabled
              value="FOL-2026-08992"
              className="flex h-10 w-full rounded-full border border-[#2e2e2e] bg-[#182330] px-4 py-2 text-sm text-slate-400 cursor-not-allowed select-none"
            />
            <span className="text-[11px] text-slate-500 ml-1 block">Estado deshabilitado</span>
          </div>

          {/* Input con Botón de Acción Integrado */}
          <div className="p-3.5 rounded-xl bg-[#252526] border border-[#2e2e2e] space-y-2">
            <Label htmlFor="input-ejemplo-codigo" className="text-xs font-medium text-slate-200 ml-1">
              Código de Barras / Escáner
            </Label>
            <div className="relative">
              <input
                id="input-ejemplo-codigo"
                type="text"
                placeholder="Escanear o teclear..."
                className="flex h-10 w-full rounded-full border border-[#2e2e2e] bg-[#1e1e1e] pl-4 pr-24 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
              />
              <Button
                type="button"
                size="sm"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 px-3 text-xs bg-sky-600 hover:bg-sky-500 text-white rounded-full"
              >
                Buscar
              </Button>
            </div>
            <span className="text-[11px] text-slate-400 ml-1 block">Con botón secundario en la cápsula</span>
          </div>
        </div>
      </SurfaceCard>

      {/* SECCIÓN D: DESPLEGABLES (SELECTS) ESTÁNDAR */}
      <SurfaceCard variant="panel" className="p-5 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            2. Desplegables (Selects) Estándar
          </h2>
          <p className="text-xs text-slate-400">
            Cápsula de disparo alineada con los inputs (`h-10 rounded-full`), y menú desplegable estilizado con bordes nítidos sobre `#1e1e1e`.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Select Normal */}
          <div className="p-3.5 rounded-xl bg-[#252526] border border-[#2e2e2e] space-y-2">
            <Label className="text-xs font-medium text-slate-200 ml-1">Categoría de Producto</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="h-10 rounded-full border-[#2e2e2e] bg-[#1e1e1e] text-slate-100 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 px-4">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-200 rounded-2xl shadow-2xl p-1">
                <SelectItem value="bebidas" className="rounded-full focus:bg-sky-600/30 focus:text-white cursor-pointer py-2">
                  Bebidas y Licores
                </SelectItem>
                <SelectItem value="snacks" className="rounded-full focus:bg-sky-600/30 focus:text-white cursor-pointer py-2">
                  Snacks y Alimentos
                </SelectItem>
                <SelectItem value="accesorios" className="rounded-full focus:bg-sky-600/30 focus:text-white cursor-pointer py-2">
                  Accesorios de Billar
                </SelectItem>
                <SelectItem value="tragamonedas" className="rounded-full focus:bg-sky-600/30 focus:text-white cursor-pointer py-2">
                  Fichas Tragamonedas
                </SelectItem>
              </SelectContent>
            </Select>
            <span className="text-[11px] text-slate-400 ml-1 block">Menú flotante con elementos redondeados</span>
          </div>

          {/* Select Secundario / Estado */}
          <div className="p-3.5 rounded-xl bg-[#252526] border border-[#2e2e2e] space-y-2">
            <Label className="text-xs font-medium text-slate-200 ml-1">Estado de Operación</Label>
            <Select defaultValue="activo">
              <SelectTrigger className="h-10 rounded-full border-[#2e2e2e] bg-[#1e1e1e] text-slate-100 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 px-4">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-200 rounded-2xl shadow-2xl p-1">
                <SelectItem value="activo" className="rounded-full focus:bg-emerald-600/30 focus:text-emerald-300 cursor-pointer py-2">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Activo
                  </span>
                </SelectItem>
                <SelectItem value="pausado" className="rounded-full focus:bg-amber-600/30 focus:text-amber-300 cursor-pointer py-2">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span> En Pausa
                  </span>
                </SelectItem>
                <SelectItem value="inactivo" className="rounded-full focus:bg-rose-600/30 focus:text-rose-300 cursor-pointer py-2">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span> Inactivo
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            <span className="text-[11px] text-slate-400 ml-1 block">Con indicadores de estado a color</span>
          </div>

          {/* Select Deshabilitado */}
          <div className="p-3.5 rounded-xl bg-[#252526] border border-[#2e2e2e] space-y-2 opacity-60">
            <Label className="text-xs font-medium text-slate-300 ml-1">Sucursal Fija (Solo Lectura)</Label>
            <Select defaultValue="central" disabled>
              <SelectTrigger className="h-10 rounded-full border-[#2e2e2e] bg-[#182330] text-slate-400 cursor-not-allowed px-4">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e]">
                <SelectItem value="central">Sucursal Central</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-[11px] text-slate-500 ml-1 block">Select bloqueado</span>
          </div>
        </div>
      </SurfaceCard>

      {/* SECCIÓN E: BOTONES ESTÁNDAR (rounded-full) */}
      <SurfaceCard variant="panel" className="p-5 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            3. Botones de Acción Estándar (`rounded-full`)
          </h2>
          <p className="text-xs text-slate-400">
            Regla de diseño oficial: Todo botón de acción táctil debe ser <code className="text-sky-300">rounded-full</code> con padding ergonómico y contrastes armónicos.
          </p>
        </div>

        {/* Variantes Principales */}
        <div className="p-4 rounded-xl bg-[#252526] border border-[#2e2e2e] space-y-3">
          <span className="text-xs font-semibold text-slate-300 block">Variantes Semánticas (Altura Estándar h-9)</span>
          <div className="flex flex-wrap items-center gap-3">
            {/* Primario */}
            <Button className="h-9 px-4 rounded-full bg-sky-600 hover:bg-sky-500 text-white shadow-sm font-medium">
              <Plus className="w-4 h-4 mr-1.5" /> Primario (Guardar)
            </Button>

            {/* Secundario */}
            <Button variant="secondary" className="h-9 px-4 rounded-full bg-[#1e1e1e] hover:bg-[#2e3e57] text-slate-200 border border-[#2e2e2e] font-medium">
              <RefreshCw className="w-4 h-4 mr-1.5" /> Secundario (Filtrar)
            </Button>

            {/* Confirmar / Éxito */}
            <Button className="h-9 px-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm font-medium">
              <Check className="w-4 h-4 mr-1.5" /> Confirmar (Cobrar)
            </Button>

            {/* Cancelar / Destructivo */}
            <Button variant="destructive" className="h-9 px-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-sm font-medium">
              <Trash2 className="w-4 h-4 mr-1.5" /> Cancelar (Eliminar)
            </Button>

            {/* Contorno */}
            <Button variant="outline" className="h-9 px-4 rounded-full border-[#2e2e2e] hover:bg-[#1e1e1e] text-slate-200">
              <Eye className="w-4 h-4 mr-1.5" /> Ver Detalle
            </Button>

            {/* Fantasma */}
            <Button variant="ghost" className="h-9 px-4 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800/60">
              Limpiar Selección
            </Button>
          </div>
        </div>

        {/* Escala de Tamaños */}
        <div className="p-4 rounded-xl bg-[#252526] border border-[#2e2e2e] space-y-3">
          <span className="text-xs font-semibold text-slate-300 block">Escala de Tamaños Estandarizados</span>
          <div className="flex flex-wrap items-center gap-4">
            {/* Pequeño */}
            <div className="flex items-center gap-2">
              <Button size="sm" className="h-8 px-3 rounded-full text-xs bg-sky-600 hover:bg-sky-500 text-white">
                <Plus className="w-3.5 h-3.5 mr-1" /> Compacto (h-8)
              </Button>
              <span className="text-[11px] text-slate-400">Para tablas y tarjetas</span>
            </div>

            {/* Estándar */}
            <div className="flex items-center gap-2">
              <Button className="h-9 px-4 rounded-full text-sm bg-sky-600 hover:bg-sky-500 text-white">
                <Plus className="w-4 h-4 mr-1.5" /> Estándar (h-9)
              </Button>
              <span className="text-[11px] text-slate-400">Para barras y modales</span>
            </div>

            {/* Grande / CTA */}
            <div className="flex items-center gap-2">
              <Button className="h-10 px-5 rounded-full text-sm font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md">
                <Check className="w-4 h-4 mr-2" /> Acción Principal (h-10)
              </Button>
              <span className="text-[11px] text-slate-400">Para finalizar ventas o aperturas</span>
            </div>

            {/* Botón Icono */}
            <div className="flex items-center gap-2">
              <Button size="icon" className="h-9 w-9 rounded-full bg-[#1e1e1e] hover:bg-[#2e2e2e] text-slate-200 border border-[#2e2e2e]">
                <Pencil className="w-4 h-4" />
              </Button>
              <Button size="icon" className="h-9 w-9 rounded-full bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30">
                <Trash2 className="w-4 h-4" />
              </Button>
              <span className="text-[11px] text-slate-400">Botones circulares de icono</span>
            </div>
          </div>
        </div>
      </SurfaceCard>

      {/* SECCIÓN F: TIPOGRAFÍA Y BADGES NUMÉRICOS */}
      <SurfaceCard variant="panel" className="p-5 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            4. Tipografía y Badges Numéricos (Regla Cero Mayúsculas Sostenidas)
          </h2>
          <p className="text-xs text-slate-400">
            Cumplimiento estricto de la regla: No utilizar textos enteramente en mayúsculas (<code className="text-rose-400 line-through">MONTO TOTAL</code>). Usar formato Capitalizado (<code className="text-emerald-400 font-semibold">Monto Total</code>).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ejemplo Tipografía */}
          <div className="p-4 rounded-xl bg-[#252526] border border-[#2e2e2e] space-y-2">
            <span className="text-xs font-semibold text-slate-200 block">Jerarquía de Textos en Formularios</span>
            <div className="space-y-1.5 border-l-2 border-sky-500 pl-3">
              <p className="text-sm font-bold text-slate-100">Título de Sección (text-sm font-bold)</p>
              <p className="text-xs font-medium text-slate-300">Etiqueta de Campo (text-xs font-medium)</p>
              <p className="text-[11px] text-slate-400">Texto secundario o explicativo (text-[11px] text-slate-400)</p>
              <p className="text-[10px] text-slate-500 font-mono">Código de referencia o ID: sucursal-01 (text-[10px] font-mono)</p>
            </div>
          </div>

          {/* Badges Numéricos de Alto Contraste */}
          <div className="p-4 rounded-xl bg-[#252526] border border-[#2e2e2e] space-y-3">
            <span className="text-xs font-semibold text-slate-200 block">Badges Circulares de Alto Contraste</span>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-[#1e1e1e] px-3 py-1.5 rounded-full border border-[#2e2e2e]">
                <span className="text-xs text-slate-300">Pendientes</span>
                <CountBadge count={3} variant="amber" />
              </div>
              <div className="flex items-center gap-2 bg-[#1e1e1e] px-3 py-1.5 rounded-full border border-[#2e2e2e]">
                <span className="text-xs text-slate-300">Completados</span>
                <CountBadge count={18} variant="emerald" />
              </div>
              <div className="flex items-center gap-2 bg-sky-600 px-3 py-1.5 rounded-full text-white">
                <span className="text-xs font-medium">Pestaña Activa</span>
                <CountBadge count={5} variant="white" />
              </div>
              <div className="flex items-center gap-2 bg-[#1e1e1e] px-3 py-1.5 rounded-full border border-[#2e2e2e]">
                <span className="text-xs text-slate-300">Totales</span>
                <CountBadge count={42} variant="sky" />
              </div>
            </div>
            <span className="text-[11px] text-slate-400 block">
              Forma simétrica circular para 1 dígito, con alto contraste sobre cualquier fondo.
            </span>
          </div>
        </div>
      </SurfaceCard>

      {/* SECCIÓN G: DEMOSTRACIÓN EN UN MODAL REAL */}
      <SurfaceCard variant="panel" className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              5. Simulación en Contexto Real: Diálogo Modal
            </h2>
            <p className="text-xs text-slate-400">
              Prueba cómo interactúan todos los controles juntos dentro de una ventana modal típica de Pool Control.
            </p>
          </div>

          <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
            <DialogTrigger asChild>
              <Button className="h-10 px-5 rounded-full bg-sky-600 hover:bg-sky-500 text-white shadow-md font-semibold">
                <Eye className="w-4 h-4 mr-2" /> Abrir Modal de Prueba
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[480px] bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 rounded-3xl p-6 shadow-2xl">
              <DialogHeader className="space-y-1">
                <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-1">
                  <Sliders className="w-5 h-5" />
                </div>
                <DialogTitle className="text-lg font-bold text-slate-100">
                  Registrar Nuevo Movimiento
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Comprueba la armonía de los inputs, selects y botones en fondo modal.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3">
                {/* Campo 1 */}
                <div className="space-y-1.5">
                  <Label htmlFor="modal-nombre" className="text-xs font-medium text-slate-200 ml-1">
                    Concepto o Motivo
                  </Label>
                  <input
                    id="modal-nombre"
                    type="text"
                    defaultValue="Premio Especial Tragamonedas"
                    className="flex h-10 w-full rounded-full border border-[#2e2e2e] bg-[#252526] px-4 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  />
                </div>

                {/* Campo 2 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-200 ml-1">Categoría</Label>
                    <Select defaultValue="premios">
                      <SelectTrigger className="h-10 rounded-full border-[#2e2e2e] bg-[#252526] text-slate-100 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 px-4">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1e1e1e] border-[#2e2e2e] text-slate-200 rounded-2xl">
                        <SelectItem value="premios" className="rounded-full">Premios</SelectItem>
                        <SelectItem value="gastos" className="rounded-full">Gastos</SelectItem>
                        <SelectItem value="retiros" className="rounded-full">Retiros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="modal-monto" className="text-xs font-medium text-slate-200 ml-1">
                      Monto (Q)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-sky-400">
                        Q
                      </span>
                      <input
                        id="modal-monto"
                        type="number"
                        defaultValue="250.00"
                        className="flex h-10 w-full rounded-full border border-[#2e2e2e] bg-[#252526] pl-9 pr-4 py-2 text-sm font-semibold text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Switch interactivo */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#252526] border border-[#2e2e2e]">
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-slate-200 block">Afecta Cuadre Diario</span>
                    <span className="text-[11px] text-slate-400 block">Descuenta del saldo en efectivo de la caja</span>
                  </div>
                  <Switch checked={switchActivo} onCheckedChange={setSwitchActivo} />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 mt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setModalAbierto(false)}
                  className="h-10 px-5 rounded-full bg-[#252526] hover:bg-[#2e2e2e] text-slate-200 border border-[#2e2e2e]"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="h-10 px-6 rounded-full bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-md"
                >
                  <Check className="w-4 h-4 mr-1.5" /> Guardar Cambios
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SurfaceCard>
    </div>
  );
}
