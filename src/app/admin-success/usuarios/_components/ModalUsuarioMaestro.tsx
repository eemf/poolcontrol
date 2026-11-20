'use client'

import { Dispatch, FormEvent, SetStateAction } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save, UserCheck, ShieldCheck, Building2, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { RolMaestro, SucursalMaestro, UsuarioConDocId } from "../_hooks/use-usuarios-maestro"

interface ModalUsuarioMaestroProps {
  isOpen: boolean
  onClose: () => void
  editingUser: UsuarioConDocId | null
  selectedSucursalId: string
  sucursales: SucursalMaestro[]
  roles: RolMaestro[]
  isLoadingRoles: boolean
  loading: boolean
  onSubmit: (e: FormEvent) => void
  form: {
    nombre: string
    setNombre: (v: string) => void
    email: string
    setEmail: (v: string) => void
    password: string
    setPassword: (v: string) => void
    rol: string
    setRol: (v: string) => void
    accesoGlobal: boolean
    setAccesoGlobal: (v: boolean) => void
    sucursalesPermitidas: string[]
    setSucursalesPermitidas: Dispatch<SetStateAction<string[]>>
  }
}

export function ModalUsuarioMaestro({
  isOpen,
  onClose,
  editingUser,
  selectedSucursalId,
  sucursales,
  roles,
  isLoadingRoles,
  loading,
  onSubmit,
  form,
}: ModalUsuarioMaestroProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 rounded-2xl p-5 sm:p-6 shadow-2xl font-body flex flex-col max-h-[90vh]">
        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 gap-4">
          <DialogHeader className="shrink-0">
            <div className="flex items-center gap-3 pr-6">
              <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0">
                <DialogTitle className="font-headline text-lg font-bold text-slate-100 leading-tight truncate">
                  {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5 truncate">
                  {editingUser ? "Actualiza la información del usuario." : "Crea una nueva cuenta de acceso al sistema."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 space-y-3.5 p-1">
            <div className="space-y-1.5">
              <Label htmlFor="m-nombre" className="text-xs font-medium ml-1 text-slate-200 block">
                Nombre completo*
              </Label>
              <Input
                id="m-nombre"
                value={form.nombre}
                onChange={(e) => form.setNombre(e.target.value)}
                onClick={(e) => e.currentTarget.select()}
                required
                placeholder="Ej: Samuel L."
                className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-sm text-slate-100 placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="m-email" className="text-xs font-medium ml-1 text-slate-200 block">
                Correo electrónico*
              </Label>
              <Input
                id="m-email"
                type="email"
                value={form.email}
                onChange={(e) => form.setEmail(e.target.value)}
                required
                disabled={!!editingUser}
                placeholder="email@sucursal.com"
                className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-sm text-slate-100 placeholder:text-slate-500 disabled:opacity-60"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {editingUser ? (
                <div className="space-y-1.5">
                  <Label htmlFor="m-password" title="Mínimo 6 caracteres" className="text-xs font-medium ml-1 text-slate-200 block">
                    Nueva contraseña (opcional)
                  </Label>
                  <Input
                    id="m-password"
                    type="password"
                    value={form.password}
                    onChange={(e) => form.setPassword(e.target.value)}
                    placeholder="Dejar vacío para mantener"
                    className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-sm text-slate-100 placeholder:text-slate-500"
                    autoComplete="new-password"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="m-password" title="Mínimo 6 caracteres" className="text-xs font-medium ml-1 text-slate-200 block">
                    Contraseña*
                  </Label>
                  <Input
                    id="m-password"
                    type="password"
                    value={form.password}
                    onChange={(e) => form.setPassword(e.target.value)}
                    required
                    placeholder="••••••"
                    className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-sm text-slate-100 placeholder:text-slate-500"
                    autoComplete="new-password"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="m-rol" className="text-xs font-medium ml-1 text-slate-200 block">
                  Rol asignado*
                </Label>
                <Select value={form.rol} onValueChange={form.setRol} disabled={isLoadingRoles || !selectedSucursalId}>
                  <SelectTrigger className="rounded-full h-10 bg-[#252526] hover:bg-[#313131] border-[#2e2e2e] text-xs text-slate-100">
                    <SelectValue placeholder={!selectedSucursalId ? "Elige sucursal" : isLoadingRoles ? "Cargando..." : "Selecciona un rol"} />
                  </SelectTrigger>
                  <SelectContent className="font-body bg-[#1e1e1e] border-[#2e2e2e] text-slate-100">
                    {roles.length > 0 ? (
                      roles.map(r => (
                        <SelectItem key={r.idRol} value={(r as any).id} className="text-xs">{r.nombre}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-roles" disabled className="text-xs">No hay roles definidos</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between p-3.5 bg-[#252526] rounded-xl border border-[#2e2e2e]">
                <div className="space-y-0.5 pr-3">
                  <Label htmlFor="acceso-global" className="text-xs sm:text-sm font-semibold text-slate-100 flex items-center gap-1.5 cursor-pointer">
                    <ShieldCheck className="h-4 w-4 text-sky-400 shrink-0" />
                    Acceso Multi-sucursal
                  </Label>
                  <p className="text-[11px] text-slate-400">
                    Permite al usuario visualizar y saltar entre distintas sucursales.
                  </p>
                </div>
                <Switch
                  id="acceso-global"
                  checked={form.accesoGlobal}
                  onCheckedChange={(checked) => {
                    form.setAccesoGlobal(checked)
                    if (checked && form.sucursalesPermitidas.length === 0) {
                      form.setSucursalesPermitidas(sucursales.map(s => s.id))
                    }
                  }}
                  className="data-[state=checked]:bg-sky-600 data-[state=unchecked]:bg-[#313131]"
                />
              </div>

              {form.accesoGlobal && (
                <div className="p-3.5 bg-[#252526] rounded-xl border border-[#2e2e2e] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <Label className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-sky-400" />
                        Sucursales permitidas
                      </Label>
                      <p className="text-[11px] text-slate-400">
                        Elige las sucursales disponibles para cambiar.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-7 text-[11px] px-3 rounded-full bg-[#1e1e1e] hover:bg-[#313131] text-slate-200 border border-[#2e2e2e]"
                        onClick={() => form.setSucursalesPermitidas(sucursales.map(s => s.id))}
                      >
                        Todas
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[11px] px-2.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-[#313131]"
                        onClick={() => form.setSucursalesPermitidas(selectedSucursalId ? [selectedSucursalId] : [])}
                      >
                        Solo base
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                    {sucursales.map((s) => {
                      const isChecked = form.sucursalesPermitidas.includes(s.id)
                      const isBase = s.id === selectedSucursalId
                      return (
                        <button
                          type="button"
                          key={s.id}
                          onClick={() => {
                            form.setSucursalesPermitidas(prev =>
                              prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]
                            )
                          }}
                          className={cn(
                            "flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors text-left w-full",
                            isChecked
                              ? "bg-sky-600/15 border-sky-500/40 text-slate-100 font-medium"
                              : "bg-[#1e1e1e] border-[#2e2e2e] text-slate-300 hover:border-[#383838]"
                          )}
                        >
                          <div className={cn(
                            "h-4 w-4 rounded flex items-center justify-center border transition-colors shrink-0",
                            isChecked ? "bg-sky-600 border-sky-600 text-white" : "border-slate-500 bg-transparent"
                          )}>
                            {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <div className="min-w-0 flex-1 truncate">
                            <span className="truncate block">{s.nombre}</span>
                            {isBase && <span className="text-[10px] text-sky-400 font-semibold block">Sucursal Base</span>}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
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
              {editingUser ? "Actualizar" : "Guardar Usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

