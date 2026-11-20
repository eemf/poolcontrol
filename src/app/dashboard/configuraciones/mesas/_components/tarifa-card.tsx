import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Users } from "lucide-react"
import { TarifaConDocId } from "../_types/mesas-config-types"

interface TarifaCardProps {
  tarifa: TarifaConDocId
  onEdit: (tarifa: TarifaConDocId) => void
  onDelete: (tarifa: TarifaConDocId) => void
}

export function TarifaCard({ tarifa, onEdit, onDelete }: TarifaCardProps) {
  return (
    <Card className="flex flex-col bg-[#252526] border-[#2e2e2e] text-slate-100 shadow-sm hover:border-[#383838] transition-colors rounded-xl overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-slate-100">{tarifa.nombre}</CardTitle>
            <CardDescription className="text-xs text-slate-400">{tarifa.tipoDeMesa}</CardDescription>
          </div>
          <Badge variant="secondary" className="rounded-full text-[11px] font-medium bg-[#1e1e1e] text-slate-200 border border-[#2e2e2e]">
            {tarifa.tipoDeCalculo}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow space-y-3">
        {tarifa.tipoDeCalculo === 'Por minuto' ? (
          <div className="text-center p-3 bg-[#1e1e1e] rounded-xl border border-[#2e2e2e]">
            <p className="text-2xl font-black text-sky-400">Q{(tarifa.costoPorMinuto || 0).toFixed(2)}</p>
            <p className="text-xs font-medium text-slate-400 mt-0.5">Precio por minuto</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {(tarifa.intervalos || []).map((int, i) => (
              <div key={i} className="flex justify-between items-center text-xs p-2 bg-[#1e1e1e] rounded-lg border border-[#2e2e2e]">
                <span className="font-medium text-slate-300">{int.duracionMinutos} min</span>
                <span className="font-bold text-sky-400">Q{int.precio.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
        
        {tarifa.tipoDeMesa === 'Consola' && (
          <div className="p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/20 text-xs">
            <p className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5"/> Extras de Consola
            </p>
            <div className="flex justify-between text-slate-300">
              <span>Controles Base:</span>
              <span className="font-bold text-white">{tarifa.controlesBase}</span>
            </div>
            <div className="flex justify-between text-slate-300 mt-0.5">
              <span>Costo Control Extra (Hora):</span>
              <span className="font-bold text-white">Q{(tarifa.costoControlExtra || 0).toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="justify-end gap-2 border-t border-[#2e2e2e] px-4 py-2.5">
        <Button
          size="sm"
          className="h-8 px-3.5 rounded-full text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-sm"
          onClick={() => onEdit(tarifa)}
        >
          <Edit className="mr-1.5 h-3.5 w-3.5" />
          Editar
        </Button>
        <Button
          size="sm"
          className="h-8 px-3.5 rounded-full text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 shadow-sm"
          onClick={() => onDelete(tarifa)}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Eliminar
        </Button>
      </CardFooter>
    </Card>
  )
}
