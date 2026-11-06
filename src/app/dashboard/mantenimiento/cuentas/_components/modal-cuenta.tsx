import { FormEvent, Dispatch, SetStateAction } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { InputNumero } from '@/components/ui/input-numero'
import { Loader2, Save } from 'lucide-react'
import { CuentaConId } from '../_hooks/use-mantenimiento-cuentas'

interface ModalCuentaProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingCuenta: CuentaConId | null
  formState: {
    nombre: string
    tipo: 'Efectivo' | 'Bancaria'
    saldo: number | ''
  }
  setFormState: Dispatch<SetStateAction<{
    nombre: string
    tipo: 'Efectivo' | 'Bancaria'
    saldo: number | ''
  }>>
  onSubmit: (e: FormEvent) => void
  loading: boolean
}

export function ModalCuenta({
  isOpen,
  onOpenChange,
  editingCuenta,
  formState,
  setFormState,
  onSubmit,
  loading
}: ModalCuentaProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-[#1d283a] border-[#324157] text-white">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">
              {editingCuenta ? "Editar Cuenta" : "Nueva Cuenta"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Completa la información para gestionar las finanzas de tu negocio.
            </DialogDescription>
          </DialogHeader>

          <div className="py-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nombre" className="text-xs font-semibold text-slate-300">
                Nombre de la Cuenta*
              </Label>
              <Input
                id="nombre"
                value={formState.nombre}
                onChange={(e) => setFormState(p => ({ ...p, nombre: e.target.value }))}
                required
                className="rounded-full bg-[#283244] border-[#324157] text-white"
                placeholder="Ej: Caja Chica o Banco Industrial"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tipo" className="text-xs font-semibold text-slate-300">
                  Tipo de Cuenta
                </Label>
                <Select
                  value={formState.tipo}
                  onValueChange={(value: 'Efectivo' | 'Bancaria') => setFormState(p => ({ ...p, tipo: value }))}
                >
                  <SelectTrigger className="rounded-full bg-[#283244] border-[#324157] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#283244] border-[#324157] text-white">
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                    <SelectItem value="Bancaria">Bancaria</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="saldo" className="text-xs font-semibold text-slate-300">
                  Saldo Inicial (Q)*
                </Label>
                <InputNumero
                  id="saldo"
                  value={formState.saldo}
                  onChange={(e) => setFormState(p => ({ ...p, saldo: e.target.value === '' ? '' : Number(e.target.value) }))}
                  required
                  className="rounded-full text-center font-bold text-base bg-[#283244] border-[#324157] text-white"
                  onFocus={(e) => e.target.select()}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-2 border-t border-[#324157]">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="rounded-full w-full sm:w-auto border-[#324157] text-slate-300 hover:bg-[#283244]">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full w-full sm:w-auto font-bold bg-sky-600 hover:bg-sky-500 text-white"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {editingCuenta ? "Actualizar" : "Guardar Cuenta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
