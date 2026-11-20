'use client'

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Building, MapPin, Mic, SlidersHorizontal, LogIn, Edit, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ALL_FEATURES, type SucursalConDocId } from "../_hooks/use-sucursales-admin"

interface SucursalCardProps {
  sucursal: SucursalConDocId
  onIngresar: (sucursal: SucursalConDocId) => void
  onEditar: (sucursal: SucursalConDocId) => void
  onEliminar: (sucursal: SucursalConDocId) => void
  onToggleVoice: (sucursal: SucursalConDocId, enabled: boolean) => void
}

export function SucursalCard({
  sucursal,
  onIngresar,
  onEditar,
  onEliminar,
  onToggleVoice,
}: SucursalCardProps) {
  const vozActiva = sucursal.features?.asistenteVoz !== false
  const totalModulos = ALL_FEATURES.length
  const activosCount = ALL_FEATURES.filter((f) => sucursal.features?.[f.id] !== false).length

  return (
    <div className="flex flex-col justify-between rounded-xl bg-[#252526] border border-[#2e2e2e] hover:border-[#383838] p-4 transition-all shadow-sm space-y-4">
      {/* Cabecera */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
              <Building className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base text-slate-100 truncate leading-tight">
                {sucursal.nombre}
              </h3>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 truncate">
                <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                <span className="truncate">{sucursal.direccion || 'Sin dirección registrada'}</span>
              </p>
            </div>
          </div>

          <Badge className="rounded-full text-[10px] font-semibold px-2.5 py-0.5 bg-[#1e1e1e] text-sky-400 border border-[#2e2e2e] tabular-nums shrink-0">
            #{sucursal.idSucursal}
          </Badge>
        </div>

        {/* Métricas / Controles internos */}
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#1e1e1e] border border-[#2e2e2e]">
            <div className="flex items-center gap-2 min-w-0">
              <SlidersHorizontal className="h-3.5 w-3.5 text-sky-400 shrink-0" />
              <span className="text-xs font-medium text-slate-300">Módulos habilitados</span>
            </div>
            <span className="text-xs font-bold text-slate-100 tabular-nums shrink-0">
              {activosCount} / {totalModulos}
            </span>
          </div>

          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#1e1e1e] border border-[#2e2e2e]">
            <div className="flex items-center gap-2 min-w-0">
              <Mic className={cn("h-3.5 w-3.5 shrink-0", vozActiva ? "text-emerald-400" : "text-slate-500")} />
              <span className="text-xs font-medium text-slate-300">Comandos de voz</span>
              <span
                className={cn(
                  "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                  vozActiva
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-[#252526] text-slate-400"
                )}
              >
                {vozActiva ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <Switch
              checked={vozActiva}
              onCheckedChange={(checked) => onToggleVoice(sucursal, checked)}
              className="data-[state=checked]:bg-sky-600 data-[state=unchecked]:bg-[#313131]"
            />
          </div>
        </div>
      </div>

      {/* Pie de acciones */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#2e2e2e]">
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEditar(sucursal)}
            className="h-8 px-3 rounded-full text-xs font-semibold bg-[#1e1e1e] hover:bg-[#313131] text-slate-200 border border-[#2e2e2e]"
          >
            <Edit className="mr-1.5 h-3.5 w-3.5 text-sky-400" />
            Editar
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => onEliminar(sucursal)}
            title="Eliminar sucursal"
            className="h-8 w-8 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Button
          size="sm"
          onClick={() => onIngresar(sucursal)}
          className="h-8 px-4 rounded-full text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-sm"
        >
          <LogIn className="mr-1.5 h-3.5 w-3.5" />
          Ingresar
        </Button>
      </div>
    </div>
  )
}

