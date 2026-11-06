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
    <Card className="flex flex-col bg-[#283244] border-[#324157] text-white shadow-sm hover:border-slate-500 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-white">{tarifa.nombre}</CardTitle>
            <CardDescription className="text-xs text-slate-400">{tarifa.tipoDeMesa}</CardDescription>
          </div>
          <Badge variant="secondary" className="text-[11px] font-medium bg-[#1d283a] text-slate-200 border-[#324157]">
            {tarifa.tipoDeCalculo}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow space-y-3">
        {tarifa.tipoDeCalculo === 'Por minuto' ? (
          <div className="text-center p-3 bg-[#1d283a] rounded-xl border border-[#324157]">
            <p className="text-2xl font-black text-sky-400">Q{(tarifa.costoPorMinuto || 0).toFixed(2)}</p>
            <p className="text-xs font-medium text-slate-400 mt-0.5">Precio por minuto</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {(tarifa.intervalos || []).map((int, i) => (
              <div key={i} className="flex justify-between items-center text-xs p-2 bg-[#1d283a] rounded-lg border border-[#324157]">
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

      <CardFooter className="justify-end gap-2 border-t border-[#324157] bg-[#1d283a]/50 p-2.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-slate-300 hover:text-white hover:bg-slate-700/50"
          onClick={() => onEdit(tarifa)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-full"
          onClick={() => onDelete(tarifa)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
