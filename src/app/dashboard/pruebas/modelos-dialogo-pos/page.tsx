
'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  CreditCard, 
  Coins, 
  CheckCircle, 
  Layout, 
  Receipt, 
  User, 
  Wallet,
  ShoppingBag,
  ArrowRight,
  X
} from 'lucide-react'
import { cn } from "@/lib/utils"

const DUMMY_ITEMS = [
  { id: 1, name: "2x Cerveza Nacional", price: 30.00 },
  { id: 2, name: "1x Hamburguesa Especial", price: 45.00 },
  { id: 3, name: "Monedas (Base)", price: 20.00 },
  { id: 4, name: "1x Porción de Papas", price: 15.00 },
  { id: 5, name: "1x Soda 600ml", price: 12.00 },
  { id: 6, name: "1x Agua Pura", price: 8.00 },
  { id: 7, name: "2x Tacos de Res", price: 25.00 },
  { id: 8, name: "1x Alitas de Pollo", price: 35.00 },
  { id: 9, name: "1x Nachos Supreme", price: 40.00 },
  { id: 10, name: "1x Café Americano", price: 10.00 }
];

export default function ModelosDialogoPOSPage() {
  // Estado para el Modelo 2 (Selección de items interactiva)
  const [selectedModel2, setSelectedModel2] = useState<Set<number>>(new Set([1, 2, 3]));

  const totalModel2 = useMemo(() => {
    return DUMMY_ITEMS
      .filter(item => selectedModel2.has(item.id))
      .reduce((sum, item) => sum + item.price, 0);
  }, [selectedModel2]);

  const toggleItemModel2 = (id: number) => {
    setSelectedModel2(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-12 pb-20 font-body max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-3 text-foreground">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Layout className="h-6 w-6 text-primary" />
          </div>
          Exploración de Diálogos POS
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Cinco propuestas visuales para el proceso de liquidación de cuentas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-16">
        
        {/* MODELO 1: SPLIT CLÁSICO REFINADO (ESTILO BUILD 120) */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground pl-1">1. Split Clásico Refinado</h2>
          <div className="max-w-4xl w-full bg-background border border-muted/60 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 bg-muted/20 p-8 flex flex-col gap-6 border-r border-muted/40">
              <div className="text-center space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Pagar</Label>
                <p className="text-5xl font-bold text-blue-500 tabular-nums">Q95.00</p>
              </div>
              <div className="space-y-3">
                <Button className="w-full h-12 rounded-full font-bold bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/10 border-none text-white">
                  <Coins className="mr-2 h-4 w-4" /> Abono
                </Button>
                <Button className="w-full h-12 rounded-full font-bold bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-600/10 border-none text-white">
                  <CreditCard className="mr-2 h-4 w-4" /> Tarjeta
                </Button>
              </div>
            </div>
            <div className="flex-1 flex flex-col bg-background">
              <div className="p-8 pb-4">
                <h3 className="font-headline text-xl font-bold flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" /> Items Pendientes
                </h3>
              </div>
              <ScrollArea className="flex-1 h-[300px] px-8">
                <div className="space-y-3">
                  {DUMMY_ITEMS.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl border border-muted/20">
                      <div className="flex items-center gap-3">
                        <Checkbox className="rounded-md h-5 w-5" checked />
                        <span className="font-bold text-sm">{item.name}</span>
                      </div>
                      <span className="font-bold text-sm text-foreground/80">Q{item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-8 flex justify-between items-center">
                <Button variant="ghost" className="rounded-full font-bold">Cerrar</Button>
                <Button className="rounded-full h-12 px-10 font-bold bg-blue-500 shadow-xl shadow-blue-600/20 border-none text-white">
                  Pagar con Efectivo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* MODELO 2: JERARQUÍA SUPERIOR (BILL STYLE) - REFINADO */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-muted-foreground pl-1 font-headline">2. Jerarquía Superior (Refinado)</h2>
          <div className="max-w-xl w-full bg-background border border-muted/60 rounded-2xl shadow-2xl overflow-hidden font-body">
            <div className="p-6 bg-primary/5 text-center space-y-4 border-b border-primary/10">
              <div className="flex justify-center">
                <Badge className="bg-primary/10 text-primary border-none font-bold text-[11px] h-6 rounded-full px-4">
                  Cuenta de Samuel
                </Badge>
              </div>
              <div className="space-y-0.5">
                <p className="text-5xl font-bold text-primary tabular-nums tracking-tighter">Q{totalModel2.toFixed(2)}</p>
                <p className="text-[11px] font-semibold text-muted-foreground">Monto Final Seleccionado</p>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <ScrollArea className="h-[250px] pr-4">
                <div className="space-y-1">
                  {DUMMY_ITEMS.map(item => (
                    <div 
                      key={item.id} 
                      className={cn(
                        "flex justify-between items-center py-2.5 border border-transparent transition-all px-4 rounded-xl group cursor-pointer",
                        selectedModel2.has(item.id) ? "bg-primary/5 border-primary/10" : "hover:bg-muted/5"
                      )}
                      onClick={() => toggleItemModel2(item.id)}
                    >
                      <div className="flex items-center gap-4">
                        <Checkbox 
                          id={`check-m2-${item.id}`} 
                          className="rounded-md h-5 w-5" 
                          checked={selectedModel2.has(item.id)}
                          onCheckedChange={() => toggleItemModel2(item.id)}
                        />
                        <Label className="text-sm font-bold text-foreground/80 cursor-pointer">{item.name}</Label>
                      </div>
                      <span className="font-bold text-foreground tabular-nums text-sm">Q{item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="grid grid-cols-3 gap-3">
                <Button className="rounded-2xl h-16 flex-col bg-orange-600 hover:bg-orange-700 gap-1 font-bold text-[11px] shadow-md border-none text-white transition-transform active:scale-95">
                  <Coins className="h-5 w-5" /> Abono
                </Button>
                <Button className="rounded-2xl h-16 flex-col bg-blue-600 hover:bg-blue-700 gap-1 font-bold text-[11px] shadow-md border-none text-white transition-transform active:scale-95" disabled={totalModel2 <= 0}>
                  <CreditCard className="h-5 w-5" /> Tarjeta
                </Button>
                <Button className="rounded-2xl h-16 flex-col bg-emerald-600 hover:bg-emerald-700 gap-1 font-bold text-[11px] shadow-md border-none text-white transition-transform active:scale-95" disabled={totalModel2 <= 0}>
                  <CheckCircle className="h-5 w-5" /> Efectivo
                </Button>
              </div>
            </div>
            <div className="p-3 bg-muted/5 border-t text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Items seleccionados: {selectedModel2.size}</p>
            </div>
          </div>
        </section>

        {/* MODELO 3: CENTRADO EN SELECCIÓN (DASHBOARD) */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground pl-1">3. Tablero de Selección</h2>
          <div className="max-w-5xl w-full bg-background border border-muted/60 rounded-[2rem] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-[1fr_280px]">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold font-headline">Items en Cuenta</h3>
                <Badge variant="secondary" className="rounded-full">10 articulos</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DUMMY_ITEMS.map(item => (
                  <Card key={item.id} className="border-none shadow-none bg-muted/20 rounded-2xl p-4 hover:bg-muted/40 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start">
                      <Checkbox className="rounded-full h-6 w-6" checked />
                      <div className="text-right">
                        <p className="font-bold text-sm group-hover:text-primary transition-colors">{item.name}</p>
                        <p className="text-lg font-bold text-primary">Q{item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            <div className="bg-muted/10 p-8 flex flex-col justify-between border-l border-muted/40">
              <div className="space-y-6">
                <div className="p-6 bg-background rounded-3xl border border-muted/40 shadow-inner text-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Subtotal</p>
                  <p className="text-4xl font-bold text-blue-500">Q240.00</p>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full rounded-full border-orange-500 text-orange-600 font-bold hover:bg-orange-50">Registrar Abono</Button>
                  <Button className="w-full rounded-full bg-blue-600 font-bold h-12 shadow-lg shadow-blue-500/20 text-white border-none">PAGAR AHORA</Button>
                </div>
              </div>
              <Button variant="ghost" className="text-muted-foreground font-bold">Cancelar Proceso</Button>
            </div>
          </div>
        </section>

        {/* MODELO 4: MODERN GLASS (VANGUARDIA) */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground pl-1">4. Vanguardia Glass</h2>
          <div className="max-w-3xl w-full bg-slate-900 text-white rounded-[3rem] shadow-2xl p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-blue-600/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 h-40 w-40 bg-orange-600/10 rounded-full blur-[80px]" />
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
              <div className="space-y-8 flex-1 w-full">
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold font-headline">Liquidar Sesión</h3>
                  <p className="text-slate-400 font-medium">Cliente: Samuel L. • Venta #429</p>
                </div>
                <div className="space-y-4">
                  {DUMMY_ITEMS.slice(0, 4).map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
                      <span className="font-bold text-slate-200">{item.name}</span>
                      <span className="font-bold text-blue-400">Q{item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full md:w-[240px] space-y-4 shrink-0">
                <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] text-center backdrop-blur-xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Total</p>
                  <p className="text-5xl font-bold text-white">Q240</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button className="rounded-full h-12 bg-white text-slate-900 hover:bg-slate-200 font-bold shadow-xl shadow-white/10 border-none">EFECTIVO</Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="rounded-full border-white/20 text-white hover:bg-white/10 font-bold">Tarjeta</Button>
                    <Button variant="outline" className="rounded-full border-white/20 text-white hover:bg-white/10 font-bold">Abono</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MODELO 5: MATRIZ OPERATIVA (TACTILE) */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground pl-1">5. Matriz Operativa Táctil</h2>
          <div className="max-w-4xl w-full bg-background border border-muted/60 rounded-[2rem] shadow-2xl overflow-hidden">
            <div className="p-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-white shadow-lg">
                  <User className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-headline">Samuel</h3>
                  <p className="text-sm font-bold text-muted-foreground">ID Venta: 307</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-primary leading-none">Q240.00</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2">Saldo Total Pendiente</p>
              </div>
            </div>
            <Separator className="bg-muted/40" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              <button className="flex flex-col items-center justify-center py-10 gap-3 border-r border-b md:border-b-0 hover:bg-primary/5 transition-all group">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Coins className="h-7 w-7" />
                </div>
                <span className="font-bold text-xs uppercase tracking-widest">Contado</span>
              </button>
              <button className="flex flex-col items-center justify-center py-10 gap-3 border-r border-b md:border-b-0 hover:bg-blue-500/5 transition-all group">
                <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <CreditCard className="h-7 w-7" />
                </div>
                <span className="font-bold text-xs uppercase tracking-widest text-blue-600">Tarjeta</span>
              </button>
              <button className="flex flex-col items-center justify-center py-10 gap-3 border-r border-b md:border-b-0 hover:bg-orange-500/5 transition-all group">
                <div className="h-14 w-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                  <Wallet className="h-7 w-7" />
                </div>
                <span className="font-bold text-xs uppercase tracking-widest text-orange-600">Abono</span>
              </button>
              <button className="flex flex-col items-center justify-center py-10 gap-3 hover:bg-muted transition-all group">
                <div className="h-14 w-14 rounded-2xl bg-muted-foreground/10 flex items-center justify-center text-muted-foreground group-hover:scale-110 transition-transform">
                  <X className="h-7 w-7" />
                </div>
                <span className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Cerrar</span>
              </button>
            </div>
            <div className="p-4 bg-muted/20 text-center">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Selecciona un método para liquidar la cuenta inmediatamente</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
