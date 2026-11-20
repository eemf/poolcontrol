'use client'

import { Dispatch, FormEvent, SetStateAction } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Building, Loader2, Save, SlidersHorizontal } from "lucide-react"
import { FEATURE_GROUPS, type SucursalConDocId } from "../_hooks/use-sucursales-admin"

interface ModalSucursalProps {
  isOpen: boolean
  onClose: () => void
  editingSucursal: SucursalConDocId | null
  formState: {
    nombre: string
    direccion: string
    features: { [key: string]: boolean }
  }
  setFormState: Dispatch<SetStateAction<{
    nombre: string
    direccion: string
    features: { [key: string]: boolean }
  }>>
  onSubmit: (e: FormEvent) => void
  loading: boolean
}

export function ModalSucursal({
  isOpen,
  onClose,
  editingSucursal,
  formState,
  setFormState,
  onSubmit,
  loading,
}: ModalSucursalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 rounded-2xl p-5 sm:p-6 shadow-2xl font-body flex flex-col max-h-[90vh]">
        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 gap-4">
          <DialogHeader className="shrink-0">
            <div className="flex items-center gap-3 pr-6">
              <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <Building className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0">
                <DialogTitle className="font-headline text-lg font-bold text-slate-100 leading-tight truncate">
                  {editingSucursal ? "Editar Sucursal" : "Nueva Sucursal"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5 truncate">
                  Configura los datos y módulos operativos activos para este local.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 space-y-5 p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium ml-1 text-slate-200 block">
                  Nombre comercial*
                </Label>
                <Input
                  value={formState.nombre}
                  onChange={(e) => setFormState(p => ({ ...p, nombre: e.target.value }))}
                  onClick={(e) => e.currentTarget.select()}
                  placeholder="Ej: Pool Centro"
                  required
                  className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-sm text-slate-100 placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium ml-1 text-slate-200 block">
                  Ubicación / Dirección
                </Label>
                <Input
                  value={formState.direccion}
                  onChange={(e) => setFormState(p => ({ ...p, direccion: e.target.value }))}
                  placeholder="Ej: 5ta Avenida 12-30 Zona 1"
                  className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-sm text-slate-100 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-sky-400 flex items-center gap-2 border-b border-[#2e2e2e] pb-2">
                <SlidersHorizontal className="h-4 w-4" /> Módulos y funcionalidades
              </h3>

              {FEATURE_GROUPS.map((group) => (
                <div key={group.name} className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-200 pl-2 border-l-2 border-sky-500">
                    {group.name}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#252526] p-3 rounded-xl border border-[#2e2e2e]">
                    {group.features.map((feature) => (
                      <div
                        key={feature.id}
                        className="flex items-center justify-between p-2 px-2.5 rounded-xl bg-[#1e1e1e] border border-[#2e2e2e] hover:border-[#383838] transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div className="h-8 w-8 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                            <feature.icon className="h-3.5 w-3.5" />
                          </div>
                          <Label
                            htmlFor={`feature-${feature.id}`}
                            className="font-medium text-xs text-slate-200 cursor-pointer truncate"
                          >
                            {feature.label}
                          </Label>
                        </div>
                        <Switch
                          id={`feature-${feature.id}`}
                          checked={formState.features?.[feature.id] ?? false}
                          onCheckedChange={(checked) => {
                            const newFeatures = { ...formState.features, [feature.id]: checked };
                            setFormState(prev => ({ ...prev, features: newFeatures }));
                          }}
                          className="data-[state=checked]:bg-sky-600 data-[state=unchecked]:bg-[#313131]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-2 shrink-0 flex-row items-center justify-between sm:justify-between gap-2 sm:space-x-0">
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="rounded-full h-9 px-5 text-xs font-medium bg-[#252526] hover:bg-[#313131] text-slate-200 border border-[#2e2e2e]"
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full h-9 px-6 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {editingSucursal ? "Actualizar" : "Guardar Sucursal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

