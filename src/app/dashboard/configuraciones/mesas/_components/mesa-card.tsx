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
    <Card className="flex flex-col bg-[#252526] border-[#2e2e2e] text-white shadow-sm hover:border-slate-500 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              {isConsola ? <Gamepad2 className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
            </div>
            <div>
              <CardTitle className="text-base font-bold text-white">
                {isConsola ? 'Consola' : 'Mesa'} {mesa.numeroMesa}
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">{mesa.tipoDeMesa}</CardDescription>
            </div>
          </div>
          {getEstadoBadge(mesa.estado)}
        </div>
      </CardHeader>

      <CardContent className="flex-grow space-y-1.5">
        <p className="text-xs font-medium text-slate-400">Tarifa Asignada</p>
        <p className="text-sm font-semibold text-white bg-[#1e1e1e] p-2 rounded-lg border border-[#2e2e2e]">
          {tarifa?.nombre || 'No asignada'}
        </p>
      </CardContent>

      <CardFooter className="justify-end gap-2 border-t border-[#2e2e2e] bg-[#1e1e1e]/50 p-2.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-slate-300 hover:text-white hover:bg-slate-700/50"
          onClick={() => onEdit(mesa)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-full"
          onClick={() => onDelete(mesa)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
