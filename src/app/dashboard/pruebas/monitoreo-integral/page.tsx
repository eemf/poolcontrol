'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MonitorCheck, 
  TrendingUp, 
  History, 
  Coins, 
  Banknote, 
  PackageSearch, 
  Gamepad2, 
  Trophy,
  ArrowRightLeft,
  Sigma,
  Info,
  ShieldCheck,
  Clock,
  ArrowUp,
  ArrowDown,
  ShoppingCart
} from 'lucide-react';
import { cn } from "@/lib/utils";

/**
 * @fileoverview Página de Propuesta Técnica y Prototipo para el Monitoreo Integral.
 * Muestra el diseño visual y la lógica de negocio planeada para unificar el control de stock y efectivo.
 * Aplicando reglas de estilo: Title Case, Poppins, Pesos de fuente Pool Control.
 */

export default function MonitoreoIntegralPrototipoPage() {
  return (
    <div className="space-y-10 pb-20 font-body max-w-6xl mx-auto">
      
      {/* HEADER DE LA PROPUESTA */}
      <div className="space-y-3">
        <h1 className="text-3xl font-black tracking-tight font-headline flex items-center gap-3 text-foreground">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <MonitorCheck className="h-7 w-7 text-primary" />
          </div>
          Propuesta: Monitoreo Integral del Período
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed font-medium">
          Diseño conceptual para la auditoría en tiempo real de productos y efectivo, separando el ciclo de gaveta (consumos) del ciclo de monedas (máquinas).
        </p>
      </div>

      {/* SECCIÓN 1: EL PLAN TÉCNICO */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className="h-6 w-6 rounded-full p-0 flex items-center justify-center bg-primary text-white font-black">1</Badge>
          <h2 className="text-lg font-bold font-headline">El Plan de Auditoría</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-muted/60 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 space-y-4 text-sm">
              <h3 className="font-bold text-primary flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Objetivos de Control
              </h3>
              <ul className="space-y-2 text-xs font-semibold text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>Sincronizar la <strong className="text-foreground">Existencia Inicial</strong> con el último corte de máquinas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>Visualizar el <strong className="text-foreground">Saldo Acumulado</strong> línea por línea para detectar fugas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>Separar visualmente el <strong className="text-foreground">Efectivo de Consumo</strong> (Gaveta) del <strong className="text-foreground">Efectivo de Monedas</strong>.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-muted/60 shadow-sm bg-muted/5 rounded-2xl overflow-hidden">
            <CardContent className="p-6 space-y-4 text-sm">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Pasos de Implementación
              </h3>
              <ol className="space-y-2 text-xs font-semibold text-muted-foreground list-decimal pl-4">
                <li>Integrar consultas de Firestore filtradas por el último evento de reinicio.</li>
                <li>Implementar la fila de "Apertura" estática al inicio de cada historial.</li>
                <li>Calcular deltas (+) y (-) en tiempo real según el tipo de documento.</li>
                <li>Añadir tarjetas de métricas resumidas para validación rápida.</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECCIÓN 2: PROTOTIPO DE INTERFACES */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Badge className="h-6 w-6 rounded-full p-0 flex items-center justify-center bg-primary text-white font-black">2</Badge>
          <h2 className="text-lg font-bold font-headline">Prototipo de Pantallas</h2>
        </div>

        <Tabs defaultValue="monedas" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-full h-14 p-1 bg-muted/20 border border-muted/40 mb-8">
            <TabsTrigger value="gaveta" className="rounded-full font-bold gap-2 data-[state=active]:bg-background">
              <Banknote className="h-4 w-4" /> Flujo de Gaveta
            </TabsTrigger>
            <TabsTrigger value="monedas" className="rounded-full font-bold gap-2 data-[state=active]:bg-background">
              <Coins className="h-4 w-4" /> Flujo de Monedas
            </TabsTrigger>
            <TabsTrigger value="inventario" className="rounded-full font-bold gap-2 data-[state=active]:bg-background">
              <PackageSearch className="h-4 w-4" /> Kardex Inventario
            </TabsTrigger>
          </TabsList>

          {/* PROTOTIPO: FLUJO DE MONEDAS */}
          <TabsContent value="monedas" className="space-y-6 outline-none animate-in fade-in zoom-in-95 duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-primary/5 border-primary/20 rounded-2xl">
                <CardHeader className="p-4 pb-2">
                  <p className="text-[10px] font-black text-primary tracking-widest">Existencia Inicial</p>
                  <CardTitle className="text-3xl font-black font-headline">35</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-emerald-50 border-emerald-200 rounded-2xl">
                <CardHeader className="p-4 pb-2">
                  <p className="text-[10px] font-black text-emerald-600 tracking-widest">Efectivo Neto Monedas</p>
                  <CardTitle className="text-3xl font-black text-emerald-600 font-headline">Q240.00</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-muted/10 border-muted/60 rounded-2xl">
                <CardHeader className="p-4 pb-2">
                  <p className="text-[10px] font-black text-muted-foreground tracking-widest">Existencia Actual</p>
                  <CardTitle className="text-3xl font-black font-headline">15</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card className="border-muted/60 overflow-hidden shadow-md rounded-2xl">
              <div className="bg-muted/5 p-4 border-b text-[10px] font-black tracking-widest text-muted-foreground grid grid-cols-12 gap-4">
                <div className="col-span-4">Movimiento / Detalle</div>
                <div className="col-span-3 text-center">Efectivo (Q)</div>
                <div className="col-span-3 text-center">Existencia</div>
                <div className="col-span-2 text-right">Hora</div>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="divide-y font-body">
                  {/* Fila de Apertura */}
                  <div className="grid grid-cols-12 gap-4 p-4 items-center bg-primary/[0.03]">
                    <div className="col-span-4">
                      <p className="font-black text-sm text-primary">Apertura del Período</p>
                      <p className="text-[10px] font-bold text-muted-foreground">Estado inicial tras el último cuadre</p>
                    </div>
                    <div className="col-span-3 text-center">
                      <span className="font-bold text-xs text-muted-foreground">Q0.00</span>
                    </div>
                    <div className="col-span-3 text-center">
                      <p className="font-black text-primary text-base tabular-nums">35</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-[10px] font-bold text-muted-foreground">08:00 AM</span>
                    </div>
                  </div>
                  {/* Fila de Venta */}
                  <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/5 transition-colors">
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <ShoppingCart className="h-4 w-4"/>
                      </div>
                      <div>
                        <p className="font-bold text-xs">Venta: 10 Monedas</p>
                        <p className="text-[9px] font-bold text-muted-foreground">Venta #307 - Samuel L.</p>
                      </div>
                    </div>
                    <div className="col-span-3 text-center">
                      <p className="text-xs font-black text-emerald-600">+ Q20.00</p>
                      <p className="text-[9px] font-bold text-muted-foreground opacity-40">Bal: Q20.00</p>
                    </div>
                    <div className="col-span-3 text-center">
                      <p className="text-xs font-black text-destructive">- 10</p>
                      <p className="text-[9px] font-bold text-muted-foreground opacity-40">Stock: 25</p>
                    </div>
                    <div className="col-span-2 text-right text-[10px] font-bold">09:15 AM</div>
                  </div>
                  {/* Fila de Premio */}
                  <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/5 transition-colors">
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                        <Trophy className="h-4 w-4"/>
                      </div>
                      <div>
                        <p className="font-bold text-xs">Pago Premio Total</p>
                        <p className="text-[9px] font-bold text-muted-foreground">Máquina 01 - Jackpot</p>
                      </div>
                    </div>
                    <div className="col-span-3 text-center">
                      <p className="text-xs font-black text-destructive">- Q50.00</p>
                      <p className="text-[9px] font-bold text-muted-foreground opacity-40">Bal: -Q30.00</p>
                    </div>
                    <div className="col-span-3 text-center">
                      <p className="text-xs font-black text-emerald-600">+ 50</p>
                      <p className="text-[9px] font-bold text-muted-foreground opacity-40">Stock: 75</p>
                    </div>
                    <div className="col-span-2 text-right text-[10px] font-bold">10:30 AM</div>
                  </div>
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* PROTOTIPO: KARDEX INVENTARIO */}
          <TabsContent value="inventario" className="space-y-6 outline-none animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 flex items-start gap-4 text-sm">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-900 dark:text-blue-200">Concepto de Kardex</p>
                <p className="text-xs text-blue-800/80 dark:text-blue-300/80 leading-relaxed mt-1 font-semibold">
                  Muestra cada entrada (compra/ajuste) y salida (venta/consumo) de productos físicos. A diferencia del arqueo de efectivo, este rastro es puramente de unidades.
                </p>
              </div>
            </div>

            <Card className="border-muted/60 overflow-hidden shadow-sm rounded-2xl">
              <div className="bg-muted/5 p-4 border-b text-[10px] font-black tracking-widest text-muted-foreground grid grid-cols-12 gap-4">
                <div className="col-span-5">Producto / Evento</div>
                <div className="col-span-2 text-center">Entra</div>
                <div className="col-span-2 text-center">Sale</div>
                <div className="col-span-3 text-right">Saldo Stock</div>
              </div>
              <div className="divide-y text-sm">
                {[1, 2].map((i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/5 transition-colors">
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-muted/20 flex items-center justify-center">
                        <History className="h-4 w-4 opacity-30 text-primary"/>
                      </div>
                      <div>
                        <p className="font-bold text-xs text-foreground">Cerveza Nacional 12oz</p>
                        <p className="text-[9px] text-muted-foreground font-black tracking-tight">Venta POS #1029</p>
                      </div>
                    </div>
                    <div className="col-span-2 text-center text-xs font-black text-emerald-600">--</div>
                    <div className="col-span-2 text-center text-xs font-black text-destructive">2</div>
                    <div className="col-span-3 text-right flex flex-col items-end">
                      <span className="font-black text-sm text-foreground tabular-nums">46</span>
                      <span className="text-[8px] font-black text-muted-foreground uppercase opacity-40">Antes: 48</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* FOOTER: NOTA DE DISEÑO */}
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-8 rounded-[2rem] text-center">
        <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <Sigma className="h-6 w-6 text-amber-600" />
        </div>
        <h3 className="font-black text-sm uppercase tracking-widest mb-2 text-amber-900 dark:text-amber-300">Integridad de Auditoría</h3>
        <p className="text-xs text-amber-800/80 dark:text-amber-400 leading-relaxed max-w-2xl mx-auto font-bold">
            Este modelo permite una reconciliación inmediata. Si la Existencia Inicial es <span className="text-foreground">35</span> y hubo una venta de <span className="text-foreground">10</span>, el stock resultante <span className="text-foreground">Debe</span> ser <span className="text-foreground">25</span>. Cualquier diferencia con el conteo físico en este historial delatará errores de marcación o pérdida de inventario.
        </p>
      </div>
    </div>
  );
}
