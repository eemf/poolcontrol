import React from 'react';
import type { TrasladoInterSucursal } from '@/lib/tipos';
import { SurfaceCard } from '@/components/comunes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Undo2,
  Eye,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TrasladoCardProps {
  traslado: TrasladoInterSucursal;
  sucursalId: string | null;
  onRecibir: (traslado: TrasladoInterSucursal) => void;
  onCancelar: (traslado: TrasladoInterSucursal) => void;
  onVerDetalle: (traslado: TrasladoInterSucursal) => void;
}

export function TrasladoCard({
  traslado,
  sucursalId,
  onRecibir,
  onCancelar,
  onVerDetalle,
}: TrasladoCardProps) {
  const esDestino = traslado.sucursalDestinoId === sucursalId;
  const esOrigen = traslado.sucursalOrigenId === sucursalId;
  const puedeRecibir = esDestino && traslado.estado === 'en_transito';
  const puedeCancelar = esOrigen && traslado.estado === 'en_transito';

  const fechaStr = traslado.fechaEnvio?.toDate
    ? format(traslado.fechaEnvio.toDate(), 'dd/MM/yyyy hh:mm a', { locale: es })
    : 'N/A';

  const renderBadgeEstado = (estado: string) => {
    switch (estado) {
      case 'en_transito':
        return (
          <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full flex items-center gap-1 w-fit text-[0.6875rem] px-2.5 py-0.5">
            <Clock className="h-3 w-3" />
            <span>En Tránsito</span>
          </Badge>
        );
      case 'recibido':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1 w-fit text-[0.6875rem] px-2.5 py-0.5">
            <CheckCircle2 className="h-3 w-3" />
            <span>Recibido</span>
          </Badge>
        );
      case 'cancelado':
        return (
          <Badge className="bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full flex items-center gap-1 w-fit text-[0.6875rem] px-2.5 py-0.5">
            <XCircle className="h-3 w-3" />
            <span>Cancelado</span>
          </Badge>
        );
      default:
        return <Badge variant="outline" className="rounded-full text-[0.6875rem]">{estado}</Badge>;
    }
  };

  return (
    <SurfaceCard
      variant="surface"
      className="p-3.5 space-y-3 flex flex-col justify-between"
    >
      <div className="space-y-3">
        {/* Encabezado: Folio, Fecha y Estado */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold text-white shrink-0">#TR-{traslado.idTraslado}</span>
            <span className="text-[0.6875rem] text-slate-400 font-medium truncate">({fechaStr})</span>
          </div>
          <div className="shrink-0">{renderBadgeEstado(traslado.estado)}</div>
        </div>

        {/* Ruta de Envío: Origen -> Destino */}
        <SurfaceCard variant="subcard" className="p-2.5 flex items-center justify-between text-xs gap-2">
          <div className="flex-1 min-w-0">
            <span className="text-[0.625rem] text-slate-400 block font-medium">Origen</span>
            <span className={`font-semibold truncate block ${esOrigen ? 'text-sky-400' : 'text-slate-200'}`}>
              {traslado.sucursalOrigenNombre}
            </span>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 shrink-0 mx-1" />
          <div className="flex-1 min-w-0 text-right">
            <span className="text-[0.625rem] text-slate-400 block font-medium">Destino</span>
            <span className={`font-semibold truncate block ${esDestino ? 'text-emerald-400' : 'text-slate-200'}`}>
              {traslado.sucursalDestinoNombre}
            </span>
          </div>
        </SurfaceCard>

        {/* Datos del Traslado: Unidades y Costo Total */}
        <div className="flex items-center justify-between text-xs px-0.5">
          <div>
            <span className="text-slate-400">Productos: </span>
            <strong className="text-white">{traslado.cantidadTotalItems} uds</strong>
            <span className="text-slate-400 text-[0.6875rem] ml-1">({traslado.items?.length || 0} ítems)</span>
          </div>
          <div>
            <span className="text-slate-400">Total: </span>
            <strong className="text-emerald-400 text-sm font-bold">Q{(traslado.costoTotalTraslado || 0).toFixed(2)}</strong>
          </div>
        </div>
      </div>

      {/* Botones de Acción Estilizados */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#2e2e2e]/60">
        {puedeRecibir && (
          <Button
            size="sm"
            onClick={() => onRecibir(traslado)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs h-8 px-3 font-semibold shadow-sm flex items-center justify-center gap-1.5 transition-all"
          >
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span>Recibir</span>
          </Button>
        )}

        {puedeCancelar && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCancelar(traslado)}
            className="flex-1 bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-600 hover:text-white rounded-full text-xs h-8 px-3 flex items-center justify-center gap-1.5 transition-all"
          >
            <Undo2 className="h-3.5 w-3.5 shrink-0" />
            <span>Cancelar</span>
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={() => onVerDetalle(traslado)}
          className={`border-[#2e2e2e] bg-[#1e1e1e] text-slate-300 hover:text-white hover:bg-[#313131] rounded-full text-xs h-8 px-3.5 flex items-center justify-center gap-1.5 transition-all ${
            !puedeRecibir && !puedeCancelar ? 'w-full' : ''
          }`}
        >
          <Eye className="h-3.5 w-3.5 shrink-0" />
          <span>Ver Detalle</span>
        </Button>
      </div>
    </SurfaceCard>
  );
}
