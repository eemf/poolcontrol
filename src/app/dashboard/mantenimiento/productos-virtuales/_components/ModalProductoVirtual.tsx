'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Ghost } from "lucide-react";
import { InputNumero } from "@/components/ui/input-numero";

const CATEGORIES = ["Servicios", "Tiempo de Juego", "Otros"];

interface ModalProductoVirtualProps {
  abierto: boolean;
  onClose: () => void;
  editando: boolean;
  onSubmit: (e: React.FormEvent) => void;
  procesando: boolean;
  form: {
    nombre: string; setNombre: (v: string) => void;
    codigoBusqueda: string; setCodigoBusqueda: (v: string) => void;
    precioVenta: number | ''; setPrecioVenta: (v: number | '') => void;
    categoria: string; setCategoria: (v: string) => void;
    existencia: number | ''; setExistencia: (v: number | '') => void;
    incluirEnPOS: boolean; setIncluirEnPOS: (v: boolean) => void;
    incluirEnCompras: boolean; setIncluirEnCompras: (v: boolean) => void;
  };
}

export function ModalProductoVirtual({
  abierto,
  onClose,
  editando,
  onSubmit,
  procesando,
  form
}: ModalProductoVirtualProps) {
  return (
    <Dialog open={abierto} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 rounded-2xl p-5 sm:p-6 shadow-2xl font-body flex flex-col max-h-[90vh]">
        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 gap-4">
          <DialogHeader className="shrink-0">
            <div className="flex items-center gap-3 pr-6">
              <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <Ghost className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0">
                <DialogTitle className="font-headline text-lg font-bold text-slate-100 leading-tight truncate">
                  {editando ? "Editar Producto Virtual" : "Nuevo Producto Virtual"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5 truncate">
                  Configura los detalles del ítem sin inventario físico.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 space-y-3.5 p-1">
            <div className="space-y-1.5">
              <Label htmlFor="nombre" className="text-xs font-medium ml-1 text-slate-200 block">
                Nombre*
              </Label>
              <Input
                id="nombre"
                value={form.nombre}
                onChange={(e) => form.setNombre(e.target.value)}
                onClick={(e) => e.currentTarget.select()}
                placeholder="Ej: Servicio de Limpieza"
                required
                className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-sm text-slate-100 placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="codigoBusqueda" className="text-xs font-medium ml-1 text-slate-200 block">
                Código de búsqueda
              </Label>
              <Input
                id="codigoBusqueda"
                value={form.codigoBusqueda}
                onChange={(e) => form.setCodigoBusqueda(e.target.value)}
                onClick={(e) => e.currentTarget.select()}
                placeholder="Ej: moneda-virtual"
                className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-sm text-slate-100 placeholder:text-slate-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="precioVenta" className="text-xs font-medium ml-1 text-slate-200 block">
                  Precio venta*
                </Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 text-xs font-bold pointer-events-none">
                    Q
                  </span>
                  <InputNumero
                    id="precioVenta"
                    value={form.precioVenta}
                    onChange={(e) => form.setPrecioVenta(e.target.value === '' ? '' : Number(e.target.value))}
                    onClick={(e) => e.currentTarget.select()}
                    placeholder="0.00"
                    required
                    min="0"
                    step="0.01"
                    className="rounded-full h-10 pl-8 pr-3 bg-[#252526] border-[#2e2e2e] text-sm font-bold text-emerald-400 tabular-nums"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="categoria" className="text-xs font-medium ml-1 text-slate-200 block">
                  Categoría
                </Label>
                <Select value={form.categoria} onValueChange={form.setCategoria}>
                  <SelectTrigger className="rounded-full h-10 bg-[#252526] hover:bg-[#313131] border-[#2e2e2e] text-sm text-slate-100">
                    <SelectValue placeholder="Elegir..." />
                  </SelectTrigger>
                  <SelectContent className="font-body bg-[#1e1e1e] border-[#2e2e2e] text-slate-100">
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat} className="text-xs">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="existencia" className="text-xs font-medium ml-1 text-slate-200 block">
                Existencia inicial
              </Label>
              <InputNumero
                id="existencia"
                value={form.existencia}
                onChange={(e) => form.setExistencia(e.target.value === '' ? '' : Number(e.target.value))}
                onClick={(e) => e.currentTarget.select()}
                placeholder="0"
                min="0"
                className="rounded-full h-10 bg-[#252526] border-[#2e2e2e] text-sm text-slate-100 tabular-nums"
              />
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="flex flex-row items-center justify-between rounded-xl border border-[#2e2e2e] px-3.5 py-3 bg-[#252526]">
                <div className="space-y-0.5 pr-3">
                  <Label htmlFor="pos-switch" className="text-xs sm:text-sm font-semibold text-slate-100 cursor-pointer">
                    Incluir en POS
                  </Label>
                  <p className="text-[11px] text-slate-400">Habilitar en buscador de ventas</p>
                </div>
                <Switch
                  id="pos-switch"
                  checked={form.incluirEnPOS}
                  onCheckedChange={form.setIncluirEnPOS}
                  className="data-[state=checked]:bg-sky-600 data-[state=unchecked]:bg-[#313131]"
                />
              </div>

              <div className="flex flex-row items-center justify-between rounded-xl border border-[#2e2e2e] px-3.5 py-3 bg-[#252526]">
                <div className="space-y-0.5 pr-3">
                  <Label htmlFor="compras-switch" className="text-xs sm:text-sm font-semibold text-slate-100 cursor-pointer">
                    Incluir en Compras
                  </Label>
                  <p className="text-[11px] text-slate-400">Habilitar en registro de entradas</p>
                </div>
                <Switch
                  id="compras-switch"
                  checked={form.incluirEnCompras}
                  onCheckedChange={form.setIncluirEnCompras}
                  className="data-[state=checked]:bg-sky-600 data-[state=unchecked]:bg-[#313131]"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 shrink-0 flex-row items-center justify-between sm:justify-between gap-2 sm:space-x-0">
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="rounded-full h-9 px-5 text-xs font-medium bg-[#252526] hover:bg-[#313131] text-slate-200 border border-[#2e2e2e]"
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={procesando}
              className="rounded-full h-9 px-6 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md"
            >
              {procesando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {editando ? "Actualizar catálogo" : "Guardar producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
