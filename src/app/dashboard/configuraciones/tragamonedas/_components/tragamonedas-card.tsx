import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
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
        return <Badge className="rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold px-2.5 py-0.5 shrink-0">Activo</Badge>
      case 'mantenimiento':
        return <Badge className="rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-semibold px-2.5 py-0.5 shrink-0">Mantenimiento</Badge>
      case 'inactivo':
        return <Badge className="rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-semibold px-2.5 py-0.5 shrink-0">Inactivo</Badge>
      default:
        return <Badge variant="secondary" className="rounded-full text-[10px] font-semibold px-2.5 py-0.5 shrink-0">{estado}</Badge>
    }
  }

  return (
    <Card className="flex flex-col bg-[#252526] border-[#2e2e2e] text-slate-100 shadow-sm hover:border-[#383838] transition-colors rounded-xl overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
              <Dices className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base font-bold text-slate-100 truncate">{maquina.nombre}</CardTitle>
              <CardDescription className="text-xs text-slate-400 truncate mt-0.5">
                {maquina.modelo || 'Sin modelo registrado'}
              </CardDescription>
            </div>
          </div>
          {getEstadoBadge(maquina.estado)}
        </div>
      </CardHeader>

      <CardFooter className="justify-end gap-2 border-t border-[#2e2e2e] px-4 py-2.5 mt-auto">
        <Button
          size="sm"
          className="h-8 px-3.5 rounded-full text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-sm"
          onClick={() => onEdit(maquina)}
        >
          <Edit className="mr-1.5 h-3.5 w-3.5" />
          Editar
        </Button>
        <Button
          size="sm"
          className="h-8 px-3.5 rounded-full text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 shadow-sm"
          onClick={() => onDelete(maquina)}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Eliminar
        </Button>
      </CardFooter>
    </Card>
  )
}
