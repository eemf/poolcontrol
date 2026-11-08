import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Dices } from "lucide-react"
import { TragamonedasConDocId, EstadoTragamonedas } from "../_hooks/use-config-tragamonedas"

interface TragamonedasCardProps {
  maquina: TragamonedasConDocId
  onEdit: (maquina: TragamonedasConDocId) => void
  onDelete: (maquina: TragamonedasConDocId) => void
}

export function TragamonedasCard({ maquina, onEdit, onDelete }: TragamonedasCardProps) {
  const getEstadoBadge = (estado: EstadoTragamonedas) => {
    switch (estado) {
      case 'activo':
        return <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold">Activo</Badge>
      case 'mantenimiento':
        return <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] font-semibold">Mantenimiento</Badge>
      case 'inactivo':
        return <Badge className="bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[11px] font-semibold">Inactivo</Badge>
      default:
        return <Badge variant="secondary" className="text-[11px] font-semibold">{estado}</Badge>
    }
  }

  return (
    <Card className="flex flex-col bg-[#252526] border-[#2e2e2e] text-white shadow-sm hover:border-slate-500 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Dices className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base font-bold text-white truncate">{maquina.nombre}</CardTitle>
              <CardDescription className="text-xs text-slate-400 truncate mt-0.5">
                {maquina.modelo || 'Sin modelo registrado'}
              </CardDescription>
            </div>
          </div>
          {getEstadoBadge(maquina.estado)}
        </div>
      </CardHeader>

      <CardContent className="flex-grow flex items-center justify-center py-6">
        <div className="h-14 w-14 rounded-2xl bg-[#1e1e1e] border border-[#2e2e2e] flex items-center justify-center text-slate-500">
          <Dices className="h-8 w-8 text-amber-400/50" />
        </div>
      </CardContent>

      <CardFooter className="justify-end gap-2 border-t border-[#2e2e2e] bg-[#1e1e1e]/50 p-2.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-slate-300 hover:text-white hover:bg-slate-700/50"
          onClick={() => onEdit(maquina)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-full"
          onClick={() => onDelete(maquina)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
