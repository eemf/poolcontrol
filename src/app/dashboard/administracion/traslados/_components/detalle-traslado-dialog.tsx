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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-4 sm:p-6 rounded-2xl font-body bg-[#1b2533] border-[#2c3b4f] text-slate-100 print:bg-white print:text-black">
        <DialogHeader className="space-y-1 pb-3 border-b border-[#2c3b4f] print:border-black">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white print:text-black">
              <FileText className="h-5 w-5 text-primary" />
              Comprobante de Traslado #{traslado.idTraslado}
            </DialogTitle>
            <div>
              {traslado.estado === 'en_transito' && (
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  En Tránsito
                </Badge>
              )}
              {traslado.estado === 'recibido' && (
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Recibido
                </Badge>
              )}
              {traslado.estado === 'cancelado' && (
                <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 flex items-center gap-1">
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
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#233144]/80 border border-[#2d3e55] print:bg-gray-100 print:border-gray-300">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 print:text-gray-600 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                Sucursal de origen
              </span>
              <p className="text-sm font-bold text-white print:text-black">{traslado.sucursalOrigenNombre}</p>
            </div>

            <div className="flex flex-col items-center px-4">
              <ArrowRight className="h-5 w-5 text-primary print:text-gray-800" />
              <span className="text-[10px] text-slate-400 print:text-gray-500 font-medium">Traslado</span>
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
            <div className="p-3 rounded-lg bg-[#182330] border border-[#2d3e55] space-y-1">
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

            <div className="p-3 rounded-lg bg-[#182330] border border-[#2d3e55] space-y-1">
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

          {/* Tabla de Productos */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-300 px-1">Productos Trasladados</span>
            <div className="rounded-xl border border-[#2d3e55] overflow-hidden bg-[#182330]">
              <Table>
                <TableHeader className="bg-[#202d3e]">
                  <TableRow className="border-[#2d3e55]">
                    <TableHead className="text-slate-300 text-xs py-2">Producto</TableHead>
                    <TableHead className="text-slate-300 text-xs text-center py-2">Cantidad</TableHead>
                    <TableHead className="text-slate-300 text-xs text-right py-2">Costo U.</TableHead>
                    <TableHead className="text-slate-300 text-xs text-right py-2">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {traslado.items.map((it, idx) => (
                    <TableRow key={idx} className="border-[#2d3e55] hover:bg-[#233144]">
                      <TableCell className="py-2 text-xs font-medium text-white">
                        <div>{it.nombreProducto}</div>
                        {it.nombreProductoDestino && it.nombreProductoDestino.trim().toLowerCase() !== it.nombreProducto.trim().toLowerCase() && (
                          <div className="text-[10px] text-primary font-normal mt-0.5">
                            Recibido en destino como: {it.nombreProductoDestino}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-2 text-xs text-center font-bold text-amber-300">{it.cantidad}</TableCell>
                      <TableCell className="py-2 text-xs text-right text-slate-300">Q{it.costoUnitario.toFixed(2)}</TableCell>
                      <TableCell className="py-2 text-xs text-right font-bold text-emerald-400">Q{it.costoTotal.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Totales */}
          <div className="flex justify-end p-3 rounded-xl bg-[#233144] border border-[#2d3e55] text-xs">
            <div className="space-y-1 text-right">
              <div>Total de Unidades: <strong className="text-white ml-1">{traslado.cantidadTotalItems}</strong></div>
              <div>Total Valor Traslado: <strong className="text-emerald-400 text-sm ml-1">Q{traslado.costoTotalTraslado.toFixed(2)}</strong></div>
            </div>
          </div>

          {/* Observaciones */}
          {(traslado.observacionesEnvio || traslado.observacionesRecepcion) && (
            <div className="space-y-2 text-xs">
              {traslado.observacionesEnvio && (
                <div className="p-3 rounded-lg bg-[#182330] border border-[#2d3e55]">
                  <span className="font-semibold text-slate-300 block mb-0.5">Observaciones de Envío:</span>
                  <p className="text-slate-400">{traslado.observacionesEnvio}</p>
                </div>
              )}
              {traslado.observacionesRecepcion && (
                <div className="p-3 rounded-lg bg-[#182330] border border-[#2d3e55]">
                  <span className="font-semibold text-slate-300 block mb-0.5">Observaciones de Recepción / Cancelación:</span>
                  <p className="text-slate-400">{traslado.observacionesRecepcion}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-[#2c3b4f] flex flex-row gap-2 justify-between items-center print:hidden">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrint}
            className="border-[#2d3e55] text-slate-300 hover:bg-[#233144] rounded-full text-xs h-11 px-6 font-semibold"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full text-xs h-11 px-8 shadow-md shadow-primary/20"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
