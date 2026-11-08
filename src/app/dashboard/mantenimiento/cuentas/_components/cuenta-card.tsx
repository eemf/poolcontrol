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
    <Card className="flex flex-col bg-[#252526] border-[#2e2e2e] text-white shadow-sm hover:border-slate-500 transition-colors">
      <CardHeader className="pb-3 border-b border-[#2e2e2e]/60">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
              esEfectivo
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                : 'bg-sky-500/15 border border-sky-500/30 text-sky-400'
            }`}>
              {esEfectivo ? <Banknote className="h-5 w-5" /> : <Landmark className="h-5 w-5" />}
            </div>
            <div>
              <CardTitle className="text-base font-bold text-white">{cuenta.nombre}</CardTitle>
              <Badge
                variant="secondary"
                className="text-[10px] font-semibold mt-0.5 bg-[#1e1e1e] text-slate-300 border-[#2e2e2e]"
              >
                {cuenta.tipo}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="text-center py-6 flex-grow flex flex-col justify-center">
        <p className="text-xs font-medium text-slate-400 mb-1">Saldo Actual</p>
        <p className="text-3xl font-black text-sky-400 tabular-nums">
          Q{cuenta.saldo.toFixed(2)}
        </p>
      </CardContent>

      <CardFooter className="justify-end gap-2 border-t border-[#2e2e2e] bg-[#1e1e1e]/50 p-2.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-slate-300 hover:text-white hover:bg-slate-700/50"
          onClick={() => onEdit(cuenta)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-full"
          onClick={() => onDelete(cuenta)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
