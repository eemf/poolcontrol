'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";
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
      <DialogContent className="sm:max-w-md rounded-2xl font-body border-none shadow-2xl p-0 overflow-hidden">
        <form onSubmit={onSubmit} className="flex flex-col max-h-[90vh]">
          <DialogHeader className="p-6 pb-4 shrink-0 bg-background">
            <DialogTitle className="font-headline text-xl">{editando ? "Editar Producto Virtual" : "Nuevo Producto Virtual"}</DialogTitle>
            <DialogDescription className="text-xs font-body">Configura los detalles del ítem sin inventario físico.</DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-5 p-6 pt-2">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-xs font-semibold text-muted-foreground ml-1">Nombre*</Label>
                <Input id="nombre" value={form.nombre} onChange={(e) => form.setNombre(e.target.value)} placeholder="Ej: Servicio de Limpieza" required className="rounded-full h-11 border-muted-foreground/20" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigoBusqueda" className="text-xs font-semibold text-muted-foreground ml-1">Código de búsqueda</Label>
                <Input id="codigoBusqueda" value={form.codigoBusqueda} onChange={(e) => form.setCodigoBusqueda(e.target.value)} placeholder="ej: moneda-virtual" className="rounded-full h-11 border-muted-foreground/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="precioVenta" className="text-xs font-semibold text-muted-foreground ml-1">Precio venta*</Label>
                  <InputNumero id="precioVenta" value={form.precioVenta} onChange={(e) => form.setPrecioVenta(e.target.value === '' ? '' : Number(e.target.value))} required min="0" step="0.01" className="rounded-full h-11 text-center font-bold text-primary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria" className="text-xs font-semibold text-muted-foreground ml-1">Categoría</Label>
                  <Select value={form.categoria} onValueChange={form.setCategoria}>
                    <SelectTrigger className="rounded-full h-11">
                      <SelectValue placeholder="Elegir..." />
                    </SelectTrigger>
                    <SelectContent className="font-body">
                      {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="existencia" className="text-xs font-semibold text-muted-foreground ml-1">Existencia inicial</Label>
                <InputNumero id="existencia" value={form.existencia} onChange={(e) => form.setExistencia(e.target.value === '' ? '' : Number(e.target.value))} min="0" className="rounded-full h-11 text-center" />
              </div>
              
              <div className="space-y-3 pt-2">
                <div className="flex flex-row items-center justify-between rounded-2xl border border-muted-foreground/20 p-4 bg-background shadow-sm">
                  <div className="space-y-0.5">
                    <Label htmlFor="pos-switch" className="text-sm font-bold">Incluir en POS</Label>
                    <p className="text-[10px] text-muted-foreground font-medium tracking-tight">Habilitar en buscador de ventas</p>
                  </div>
                  <Switch id="pos-switch" checked={form.incluirEnPOS} onCheckedChange={form.setIncluirEnPOS} />
                </div>
                <div className="flex flex-row items-center justify-between rounded-2xl border border-muted-foreground/20 p-4 bg-background shadow-sm">
                  <div className="space-y-0.5">
                    <Label htmlFor="compras-switch" className="text-sm font-bold">Incluir en Compras</Label>
                    <p className="text-[10px] text-muted-foreground font-medium tracking-tight">Habilitar en registro de entradas</p>
                  </div>
                  <Switch id="compras-switch" checked={form.incluirEnCompras} onCheckedChange={form.setIncluirEnCompras} />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-4 bg-background shrink-0 flex-col-reverse sm:flex-row sm:justify-between gap-3">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="w-full sm:w-auto rounded-full h-11 px-8 font-semibold">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={procesando} className="w-full sm:w-auto rounded-full h-11 px-10 font-bold shadow-lg shadow-primary/20">
              {procesando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {editando ? "Actualizar catálogo" : "Guardar producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
