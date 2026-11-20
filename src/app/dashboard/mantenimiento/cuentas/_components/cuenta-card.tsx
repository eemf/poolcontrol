import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Banknote, Landmark, Edit, Trash2 } from 'lucide-react'
import { CuentaConId } from '../_hooks/use-mantenimiento-cuentas'

interface CuentaCardProps {
  cuenta: CuentaConId
  onEdit: (cuenta: CuentaConId) => void
  onDelete: (cuenta: CuentaConId) => void
}

export function CuentaCard({ cuenta, onEdit, onDelete }: CuentaCardProps) {
  const esEfectivo = cuenta.tipo === 'Efectivo'

  return (
    <Card className="flex flex-col bg-[#252526] border-[#2e2e2e] text-slate-100 shadow-sm hover:border-[#383838] transition-colors rounded-xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-[#2e2e2e]">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
              esEfectivo
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                : 'bg-sky-500/15 border border-sky-500/30 text-sky-400'
            }`}>
              {esEfectivo ? <Banknote className="h-5 w-5" /> : <Landmark className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base font-bold text-slate-100 truncate">{cuenta.nombre}</CardTitle>
              <Badge
                variant="secondary"
                className="rounded-full text-[10px] font-semibold mt-0.5 bg-[#1e1e1e] text-slate-300 border border-[#2e2e2e]"
              >
                {cuenta.tipo}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="text-center py-5 flex-grow flex flex-col justify-center">
        <p className="text-xs font-medium text-slate-400 mb-1">Saldo Actual</p>
        <p className="text-2xl sm:text-3xl font-black text-sky-400 tabular-nums">
          Q{cuenta.saldo.toFixed(2)}
        </p>
      </CardContent>

      <CardFooter className="justify-end gap-2 border-t border-[#2e2e2e] bg-[#1e1e1e] p-2.5">
        <Button
          size="sm"
          className="h-8 px-3.5 rounded-full text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-sm"
          onClick={() => onEdit(cuenta)}
        >
          <Edit className="mr-1.5 h-3.5 w-3.5" />
          Editar
        </Button>
        <Button
          size="sm"
          className="h-8 px-3.5 rounded-full text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 shadow-sm"
          onClick={() => onDelete(cuenta)}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Eliminar
        </Button>
      </CardFooter>
    </Card>
  )
}
