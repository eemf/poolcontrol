'use client';

import React, { useState } from 'react';
import { 
  XCircle, ShieldAlert, RefreshCw, ChevronDown, ChevronUp, Copy, Check, Headphones 
} from 'lucide-react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ModalErrorDiagnosticoProps {
  abierto?: boolean;
  onOpenChange?: (open: boolean) => void;
  modoPreview?: boolean;
}

export function ModalErrorDiagnostico({
  abierto = false,
  onOpenChange,
  modoPreview = false,
}: ModalErrorDiagnosticoProps) {
  const [expandido, setExpandido] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [reintentando, setReintentando] = useState(false);

  const codigoError = `ERROR_CODE: SEC_NETWORK_TIMEOUT_GATEWAY
ENDPOINT: /api/v1/sucursales/central/sincronizar
HTTP_STATUS: 504 Gateway Timeout
TIMESTAMP: 2026-11-14T17:40:22.451Z
TERMINAL_ID: POS-TERMINAL-01 (IP: 192.168.1.10)`;

  const copiarDiagnostico = () => {
    navigator.clipboard.writeText(codigoError);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const reintentar = () => {
    setReintentando(true);
    setTimeout(() => {
      setReintentando(false);
      alert("Conexión restablecida con éxito.");
      onOpenChange?.(false);
    }, 1200);
  };

  const contenido = (
    <div className="space-y-4 text-left">
      {/* Cabecera con Icono de Error y Alarma */}
      <div className="flex items-start gap-3 pt-1">
        <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0 shadow-inner">
          <XCircle className="h-6 w-6 stroke-[2.2]" />
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base sm:text-lg font-bold text-slate-100">
              Fallo de Sincronización en Caja
            </h3>
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border-rose-500/30 font-semibold">
              Error 504
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            No se pudo enviar el cierre provisional al servidor remoto. La red local parece no tener acceso al enlace principal.
          </p>
        </div>
      </div>

      {/* Sugerencia de Acción Rápida para el Operador */}
      <div className="p-3 rounded-xl bg-app-panel border border-app-border space-y-1 text-xs">
        <span className="font-semibold text-slate-200 block">
          ¿Qué puedes hacer?
        </span>
        <p className="text-muted-foreground leading-relaxed text-[11.5px]">
          Verifica que la antena Wi-Fi de la terminal esté conectada y pulsa <strong>Reintentar</strong>. Los datos están resguardados en la memoria local y no se perderán.
        </p>
      </div>

      {/* Desplegable de Diagnóstico Técnico */}
      <div className="border border-app-border rounded-xl bg-[#141414] overflow-hidden">
        <button
          type="button"
          onClick={() => setExpandido(prev => !prev)}
          className="w-full flex items-center justify-between p-2.5 text-xs text-slate-300 hover:text-slate-100 hover:bg-[#1e1e1e] transition-colors cursor-pointer"
        >
          <span className="font-semibold flex items-center gap-1.5 text-[11.5px]">
            <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
            Detalle Técnico para Soporte
          </span>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span>{expandido ? 'Ocultar' : 'Ver log'}</span>
            {expandido ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </div>
        </button>

        {expandido && (
          <div className="p-3 border-t border-app-border/60 bg-[#0f0f0f] space-y-2">
            <pre className="text-[10px] text-rose-300 font-mono leading-relaxed whitespace-pre-wrap select-all overflow-x-auto">
              {codigoError}
            </pre>
            <div className="flex justify-end pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={copiarDiagnostico}
                className="h-7 px-2.5 rounded-full text-[10.5px] text-muted-foreground hover:text-slate-100 hover:bg-[#1e1e1e] gap-1"
              >
                {copiado ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiado ? 'Copiado al portapapeles' : 'Copiar Diagnóstico'}</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Botones de Acción en Píldora */}
      <div className="flex items-center justify-between gap-2.5 pt-2 flex-col-reverse sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            alert("Contactando a soporte técnico...");
          }}
          className="w-full sm:w-auto h-9 px-3.5 rounded-full text-xs border-app-border text-slate-300 hover:bg-[#313131] gap-1.5"
        >
          <Headphones className="h-3.5 w-3.5 text-sky-400" />
          <span>Contactar Soporte</span>
        </Button>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange?.(false)}
            className="h-9 px-3.5 rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-[#313131]"
          >
            Cerrar
          </Button>

          <Button
            type="button"
            onClick={reintentar}
            disabled={reintentando}
            className="h-9 px-4 rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs gap-1.5 transition-transform active:scale-95"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", reintentando && "animate-spin")} />
            <span>{reintentando ? 'Reintentando...' : 'Reintentar Ahora'}</span>
          </Button>
        </div>
      </div>
    </div>
  );

  if (modoPreview) {
    return (
      <div className="rounded-2xl bg-app-surface border border-rose-500/40 p-5 max-w-lg w-full mx-auto shadow-md">
        {contenido}
      </div>
    );
  }

  return (
    <Dialog open={abierto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-app-surface border-rose-500/40 p-5 sm:p-6 rounded-2xl">
        {contenido}
      </DialogContent>
    </Dialog>
  );
}

