import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { AlertTriangle, Info } from 'lucide-react'

export function PanelAdvertenciasVentas() {
  return (
    <div className="space-y-4">
      <Card className="bg-[#252526] border-amber-500/30 text-white shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold text-amber-400 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Advertencia Crítica
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-slate-300 leading-relaxed">
          Esta operación es <strong className="text-amber-400">irreversible</strong>. Una vez eliminados los registros, no se podrán recuperar.
          <br /><br />
          Se eliminarán tanto los documentos de <strong className="text-white">Venta</strong> como los registros de <strong className="text-white">Pagos</strong> asociados para mantener la integridad de los reportes.
        </CardContent>
      </Card>

      <Card className="bg-[#252526] border-sky-500/30 text-white shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold text-sky-400 flex items-center gap-2">
            <Info className="h-4 w-4" /> Recomendación
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-slate-300 leading-relaxed">
          Se recomienda mantener las opciones de exclusión activas para evitar borrar deudas actuales o ventas que aún no han sido cobradas en caja.
        </CardContent>
      </Card>
    </div>
  )
}
