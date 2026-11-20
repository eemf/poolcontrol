import { FormEvent, Dispatch, SetStateAction } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { InputNumero } from '@/components/ui/input-numero'
import { Loader2, Save, BookUser } from 'lucide-react'
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
      <DialogContent className="sm:max-w-md bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 rounded-2xl p-5 sm:p-6 shadow-2xl font-body flex flex-col max-h-[90vh]">
        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 gap-4">
          <DialogHeader className="shrink-0">
            <div className="flex items-center gap-3 pr-6">
              <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <BookUser className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0">
                <DialogTitle className="font-headline text-lg font-bold text-slate-100 leading-tight truncate">
                  {editingCuenta ? "Editar Cuenta" : "Nueva Cuenta"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5 truncate">
                  Completa la información para gestionar las finanzas de tu negocio.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 space-y-3.5 p-1">
            <div className="space-y-1.5">
              <Label htmlFor="nombre" className="text-xs font-medium ml-1 text-slate-200 block">
                Nombre de la Cuenta*
              </Label>
              <Input
                id="nombre"
                value={formState.nombre}
                onChange={(e) => setFormState(p => ({ ...p, nombre: e.target.value }))}
                onClick={(e) => e.currentTarget.select()}
                required
                className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-sm text-slate-100 placeholder:text-slate-500"
                placeholder="Ej: Caja Chica o Banco Industrial"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tipo" className="text-xs font-medium ml-1 text-slate-200 block">
                  Tipo de Cuenta
                </Label>
                <Select
                  value={formState.tipo}
                  onValueChange={(value: 'Efectivo' | 'Bancaria') => setFormState(p => ({ ...p, tipo: value }))}
                >
                  <SelectTrigger className="rounded-full h-10 bg-[#252526] hover:bg-[#313131] border-[#2e2e2e] text-sm text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="font-body bg-[#1e1e1e] border-[#2e2e2e] text-slate-100">
                    <SelectItem value="Efectivo" className="text-xs">Efectivo</SelectItem>
                    <SelectItem value="Bancaria" className="text-xs">Bancaria</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="saldo" className="text-xs font-medium ml-1 text-slate-200 block">
                  Saldo Inicial*
                </Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400 text-xs font-bold pointer-events-none">
                    Q
                  </span>
                  <InputNumero
                    id="saldo"
                    value={formState.saldo}
                    onChange={(e) => setFormState(p => ({ ...p, saldo: e.target.value === '' ? '' : Number(e.target.value) }))}
                    onFocus={(e) => e.target.select()}
                    required
                    placeholder="0.00"
                    className="rounded-full h-10 pl-8 pr-3 bg-[#252526] border-[#2e2e2e] text-sm font-bold text-sky-400 tabular-nums"
                  />
                </div>
              </div>
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
              {editingCuenta ? "Actualizar" : "Guardar Cuenta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
