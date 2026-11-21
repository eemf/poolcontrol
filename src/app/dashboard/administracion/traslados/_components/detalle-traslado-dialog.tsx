'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Building2,
  Calendar,
  User,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  Printer
} from 'lucide-react';
import type { TrasladoInterSucursal } from '@/lib/tipos';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  traslado: TrasladoInterSucursal | null;
}

export function DetalleTrasladoDialog({
  open,
  onOpenChange,
  traslado,
}: Props) {
  if (!traslado) return null;

  const fechaEnvioTexto = traslado.fechaEnvio?.toDate
    ? format(traslado.fechaEnvio.toDate(), "dd 'de' MMMM, yyyy - hh:mm a", { locale: es })
    : 'No registrada';

  const fechaRecepcionTexto = traslado.fechaRecepcion?.toDate
    ? format(traslado.fechaRecepcion.toDate(), "dd 'de' MMMM, yyyy - hh:mm a", { locale: es })
    : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-4 sm:p-6 rounded-2xl font-body bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 print:bg-white print:text-black">
        <DialogHeader className="space-y-1 pb-3 border-b border-[#2e2e2e] print:border-black">
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2 text-white print:text-black">
              <FileText className="h-5 w-5 text-sky-400" />
              Comprobante de Traslado #{traslado.idTraslado}
            </DialogTitle>
            <div>
              {traslado.estado === 'en_transito' && (
                <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  En Tránsito
                </Badge>
              )}
              {traslado.estado === 'recibido' && (
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Recibido
                </Badge>
              )}
              {traslado.estado === 'cancelado' && (
                <Badge className="bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Cancelado
                </Badge>
              )}
            </div>
          </div>
          <DialogDescription className="text-xs text-slate-400 print:text-gray-600">
            Registro detallado de transferencia de existencias entre sucursales.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1">
          {/* Sucursales Origen y Destino */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#252526] border border-[#2e2e2e] print:bg-gray-100 print:border-gray-300">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 print:text-gray-600 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-sky-400" />
                Sucursal de origen
              </span>
              <p className="text-sm font-bold text-white print:text-black">{traslado.sucursalOrigenNombre}</p>
            </div>

            <div className="flex flex-col items-center px-4">
              <ArrowRight className="h-5 w-5 text-sky-400 print:text-gray-800" />
              <span className="text-[0.625rem] text-slate-400 print:text-gray-500 font-medium">Traslado</span>
            </div>

            <div className="space-y-1 text-right">
              <span className="text-xs font-semibold text-slate-400 print:text-gray-600 flex items-center justify-end gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                Sucursal de destino
              </span>
              <p className="text-sm font-bold text-white print:text-black">{traslado.sucursalDestinoNombre}</p>
            </div>
          </div>

          {/* Fechas y Usuarios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#252526] border border-[#2e2e2e] space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="h-3.5 w-3.5 text-amber-400" />
                <span>Fecha de Envío:</span>
              </div>
              <p className="font-semibold text-slate-200">{fechaEnvioTexto}</p>
              <div className="flex items-center gap-1.5 text-slate-400 pt-1">
                <User className="h-3.5 w-3.5 text-sky-400" />
                <span>Despachado por:</span>
                <span className="font-medium text-slate-200">{traslado.usuarioEnvioNombre || 'No especificado'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#252526] border border-[#2e2e2e] space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                <span>Fecha de Recepción:</span>
              </div>
              <p className="font-semibold text-slate-200">{fechaRecepcionTexto || 'Pendiente de entrega'}</p>
              <div className="flex items-center gap-1.5 text-slate-400 pt-1">
                <User className="h-3.5 w-3.5 text-emerald-400" />
                <span>Recibido por:</span>
                <span className="font-medium text-slate-200">{traslado.usuarioRecepcionNombre || (traslado.estado === 'cancelado' ? 'Cancelado' : 'Pendiente')}</span>
              </div>
            </div>
          </div>

          {/* Listado Responsivo de Productos Trasladados */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 px-1">Productos Trasladados</span>
            <div className="space-y-2">
              {traslado.items.map((it, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[#2e2e2e] bg-[#252526] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">{it.nombreProducto}</p>
                    {it.nombreProductoDestino &&
                      it.nombreProductoDestino.trim().toLowerCase() !== it.nombreProducto.trim().toLowerCase() && (
                        <p className="text-[0.6875rem] text-sky-400 mt-0.5">
                          Recibido en destino como: {it.nombreProductoDestino}
                        </p>
                      )}
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 text-xs tabular-nums shrink-0 pt-1.5 sm:pt-0 border-t border-[#2e2e2e] sm:border-t-0">
                    <span className="font-bold text-amber-300">Cant: {it.cantidad}</span>
                    <span className="text-slate-400">C/U: Q{it.costoUnitario.toFixed(2)}</span>
                    <span className="font-bold text-emerald-400">Q{it.costoTotal.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="flex justify-end p-3 rounded-xl bg-[#252526] border border-[#2e2e2e] text-xs">
            <div className="space-y-1 text-right">
              <div>Total de Unidades: <strong className="text-white ml-1">{traslado.cantidadTotalItems}</strong></div>
              <div>Total Valor Traslado: <strong className="text-emerald-400 text-sm ml-1">Q{traslado.costoTotalTraslado.toFixed(2)}</strong></div>
            </div>
          </div>

          {/* Observaciones */}
          {(traslado.observacionesEnvio || traslado.observacionesRecepcion) && (
            <div className="space-y-2 text-xs">
              {traslado.observacionesEnvio && (
                <div className="p-3 rounded-xl bg-[#252526] border border-[#2e2e2e]">
                  <span className="font-semibold text-slate-300 block mb-0.5">Observaciones de Envío:</span>
                  <p className="text-slate-400">{traslado.observacionesEnvio}</p>
                </div>
              )}
              {traslado.observacionesRecepcion && (
                <div className="p-3 rounded-xl bg-[#252526] border border-[#2e2e2e]">
                  <span className="font-semibold text-slate-300 block mb-0.5">Observaciones de Recepción / Cancelación:</span>
                  <p className="text-slate-400">{traslado.observacionesRecepcion}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-[#2e2e2e] flex flex-row gap-2 justify-between items-center print:hidden">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrint}
            className="bg-[#252526] border-[#2e2e2e] text-slate-200 hover:bg-[#313131] rounded-full text-xs h-10 px-5 font-semibold"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-full text-xs h-10 px-7 shadow-md"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
