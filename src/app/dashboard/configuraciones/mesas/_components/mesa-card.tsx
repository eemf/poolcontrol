import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, LayoutGrid, Gamepad2 } from "lucide-react"
import { MesaConDocId, TarifaConDocId } from "../_types/mesas-config-types"

interface MesaCardProps {
  mesa: MesaConDocId
  tarifas: TarifaConDocId[]
  onEdit: (mesa: MesaConDocId) => void
  onDelete: (mesa: MesaConDocId) => void
}

export function MesaCard({ mesa, tarifas, onEdit, onDelete }: MesaCardProps) {
  const tarifa = tarifas.find(t => t.docId === mesa.tarifaId)
  const isConsola = mesa.tipoDeMesa === 'Consola'

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'disponible':
        return <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold">Disponible</Badge>
      case 'ocupado':
        return <Badge className="bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[11px] font-semibold">Ocupado</Badge>
      case 'mantenimiento':
        return <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] font-semibold">Mantenimiento</Badge>
      default:
        return <Badge variant="secondary" className="text-[11px] font-semibold">{estado}</Badge>
    }
  }

  return (
    <Card className="flex flex-col bg-[#252526] border-[#2e2e2e] text-slate-100 shadow-sm hover:border-[#383838] transition-colors rounded-xl overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              {isConsola ? <Gamepad2 className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-100">
                {isConsola ? 'Consola' : 'Mesa'} {mesa.numeroMesa}
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">{mesa.tipoDeMesa}</CardDescription>
            </div>
          </div>
          {getEstadoBadge(mesa.estado)}
        </div>
      </CardHeader>

      <CardContent className="flex-grow pt-0 pb-3">
        <div className="flex items-center justify-between gap-2 bg-[#1e1e1e] px-3 py-2 rounded-xl border border-[#2e2e2e]">
          <span className="text-[11px] font-medium text-slate-400">Tarifa asignada</span>
          <span className="text-xs font-semibold text-slate-100 truncate">
            {tarifa?.nombre || 'No asignada'}
          </span>
        </div>
      </CardContent>

      <CardFooter className="justify-end gap-2 border-t border-[#2e2e2e] px-4 py-2.5">
        <Button
          size="sm"
          className="h-8 px-3.5 rounded-full text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-sm"
          onClick={() => onEdit(mesa)}
        >
          <Edit className="mr-1.5 h-3.5 w-3.5" />
          Editar
        </Button>
        <Button
          size="sm"
          className="h-8 px-3.5 rounded-full text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 shadow-sm"
          onClick={() => onDelete(mesa)}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Eliminar
        </Button>
      </CardFooter>
    </Card>
  )
}
