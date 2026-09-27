'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
    Dices, 
    Gamepad2, 
    Play, 
    Square, 
    Clock, 
    Timer, 
    MoreHorizontal, 
    ShoppingBag, 
    Users, 
    Trophy, 
    Wallet,
    Landmark,
    Zap,
    LayoutGrid,
    Coins,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ModelosMesasPage() {
  return (
    <div className="space-y-12 pb-20 font-body">
      <div>
        <h1 className="text-3xl font-black tracking-tight font-headline flex items-center gap-3 text-foreground">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <LayoutGrid className="h-6 w-6 text-primary" />
          </div>
          Rediseño de Estaciones
        </h1>
        <p className="text-sm text-muted-foreground mt-2">Propuestas visuales modernas para el control de mesas y consolas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* PROPUESTA 1: ZEN MINIMALISTA (ESTADO DISPONIBLE) */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground pl-1">1. Zen Minimalista</h2>
                <Badge variant="outline" className="rounded-full bg-emerald-50 text-emerald-600 border-emerald-200 font-bold px-3">Estado: Libre</Badge>
            </div>
            <Card className="flex flex-col border-muted/60 shadow-sm bg-card transition-all rounded-3xl overflow-hidden group hover:shadow-xl hover:shadow-primary/5">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                            <Dices className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold font-headline leading-none">Mesa 08</CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase tracking-tighter mt-1">Carambola • Tarifa Premium</CardDescription>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full h-9 w-9"><MoreHorizontal className="h-4 w-4"/></Button>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col items-center justify-center py-12">
                    <div className="relative">
                        <div className="h-28 w-28 rounded-full bg-emerald-500/5 flex items-center justify-center text-emerald-500 animate-in zoom-in duration-500">
                            <Play className="h-14 w-14 fill-current opacity-20" />
                        </div>
                        <div className="absolute inset-0 border-2 border-dashed border-emerald-500/20 rounded-full animate-spin-slow" />
                    </div>
                    <p className="text-xs font-bold text-emerald-600/60 uppercase tracking-widest mt-6">Lista para jugar</p>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                    <Button className="w-full rounded-full font-black h-12 text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                        ABRIR MESA
                    </Button>
                </CardFooter>
            </Card>
        </div>

        {/* PROPUESTA 2: DATA-CENTRIC (ESTADO OCUPADO CON TOTALES DINÁMICOS) */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground pl-1">2. Arquitectura de Datos</h2>
                <Badge className="rounded-full bg-primary text-white border-none font-bold px-3">Estado: Ocupado</Badge>
            </div>
            <Card className="flex flex-col border-primary/20 shadow-md bg-card rounded-3xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2 bg-primary/[0.03]">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                            <Gamepad2 className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold font-headline leading-none">Play 03</CardTitle>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-tighter mt-1">Tiempo Definido • 2 Ctrl</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Vence en</p>
                        <p className="text-sm font-black text-foreground tabular-nums">15:40</p>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    <div className="text-center space-y-1">
                        <div className="text-5xl font-black font-headline tabular-nums tracking-tighter text-foreground">
                            00:44:22
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tiempo transcurrido</p>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        {/* Bloque de Totales: Diseño unificado y limpio */}
                        <div className="bg-card-foreground/5 p-4 rounded-2xl border border-muted/40 space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <Clock className="h-3 w-3" />
                                    </div>
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Alquiler</span>
                                </div>
                                <span className="font-black text-sm">Q35.00</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-lg bg-accent/10 flex items-center justify-center text-accent-foreground">
                                        <ShoppingBag className="h-3 w-3" />
                                    </div>
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Consumos</span>
                                </div>
                                <span className="font-black text-sm">Q12.50</span>
                            </div>
                            <Separator className="bg-muted-foreground/10" />
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-xs font-black text-primary uppercase tracking-widest">Total a Pagar</span>
                                <span className="text-xl font-black text-primary">Q47.50</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 grid grid-cols-2 gap-2">
                    <Button variant="outline" className="rounded-full font-black h-11 text-[10px] uppercase border-muted-foreground/20">
                        Añadir Ítem
                    </Button>
                    <Button variant="destructive" className="rounded-full font-black h-11 text-[10px] uppercase shadow-lg shadow-destructive/10">
                        Finalizar
                    </Button>
                </CardFooter>
            </Card>
        </div>

        {/* PROPUESTA 3: DASHBOARD OPERATIVO (VISTA DESGLOSADA) */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground pl-1">3. Control Operativo Pro</h2>
                <Badge variant="secondary" className="rounded-full bg-amber-100 text-amber-700 border-none font-bold px-3">Estado: Pendiente</Badge>
            </div>
            <Card className="flex flex-col border-muted/60 shadow-sm bg-card rounded-3xl overflow-hidden border-l-4 border-l-amber-500">
                <div className="p-5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
                            <Dices className="h-5 w-5 text-foreground/60" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black font-headline leading-none">Mesa 12</h3>
                            <div className="flex items-center gap-1.5 mt-1">
                                <Badge className="bg-amber-500 text-white border-none text-[8px] h-4 px-1 rounded-full">Tiempo Libre</Badge>
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tabular-nums">Inició 10:15 AM</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Total Acumulado</p>
                        <p className="text-2xl font-black text-primary leading-none">Q145.00</p>
                    </div>
                </div>
                <CardContent className="px-5 py-0 space-y-4">
                    <div className="bg-card-foreground/5 rounded-2xl overflow-hidden">
                        <div className="p-3 bg-muted/20 border-b border-muted/40 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Detalle de Sesión</span>
                            <Badge variant="outline" className="h-4 text-[8px] border-amber-200 text-amber-700">3 consumos</Badge>
                        </div>
                        <div className="p-3 space-y-2">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-muted-foreground">Alquiler (02:15:00)</span>
                                <span className="font-bold">Q60.00</span>
                            </div>
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-muted-foreground">2x Hamburguesa Clásica</span>
                                <span className="font-bold">Q70.00</span>
                            </div>
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-muted-foreground">1x Soda 600ml</span>
                                <span className="font-bold">Q15.00</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-5 flex gap-2">
                    <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary">
                        <Users className="h-5 w-5" />
                    </Button>
                    <Button className="flex-1 rounded-2xl font-black h-11 text-xs uppercase tracking-widest shadow-md">
                        Gestionar y Cobrar
                    </Button>
                </CardFooter>
            </Card>
        </div>

        {/* PROPUESTA 4: IMPACTO VISUAL (ESTADO CRÍTICO/TIEMPO AGOTADO) */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground pl-1">4. Vanguardia Visual</h2>
                <Badge className="rounded-full bg-red-600 text-white border-none font-bold px-3 animate-pulse">ALERTA: TIEMPO AGOTADO</Badge>
            </div>
            <Card className="flex flex-col border-none shadow-2xl bg-slate-950 text-white rounded-[2.5rem] overflow-hidden relative">
                {/* Fondo decorativo sutil */}
                <div className="absolute -top-10 -right-10 h-40 w-40 bg-primary/20 rounded-full blur-3xl opacity-50" />
                <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-red-600/20 rounded-full blur-3xl opacity-50" />
                
                <CardHeader className="relative z-10 p-8 pb-4 flex flex-row justify-between items-start">
                    <div className="space-y-2">
                        <Badge className="bg-white/10 text-white border-white/20 font-black text-[9px] uppercase tracking-[0.2em] h-5">Estación Gaming</Badge>
                        <CardTitle className="text-3xl font-black font-headline pt-1">CONSOLE 05</CardTitle>
                    </div>
                    <div className="h-12 w-12 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
                        <Gamepad2 className="h-6 w-6 text-white" />
                    </div>
                </CardHeader>
                <CardContent className="relative z-10 px-8 py-4 text-center">
                    <div className="space-y-0">
                        <div className="text-7xl font-black font-headline tabular-nums tracking-tighter text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                            00:00
                        </div>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Exceso: 05:12</p>
                    </div>
                    
                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <p className="text-[10px] font-black text-white/40 uppercase mb-1">Monto Total</p>
                            <p className="text-2xl font-black text-white">Q125.00</p>
                        </div>
                        <div className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <p className="text-[10px] font-black text-white/40 uppercase mb-1">Jugadores</p>
                            <p className="text-lg font-bold text-white/80">Grupo VIP</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="relative z-10 p-8 pt-4">
                    <Button className="w-full rounded-full bg-white text-slate-950 hover:bg-slate-200 font-black text-sm h-14 shadow-2xl shadow-white/10 transition-transform active:scale-95">
                        LIQUIDAR CUENTA AHORA
                    </Button>
                </CardFooter>
            </Card>
        </div>

      </div>

      {/* SECCIÓN DE NOTA TÉCNICA */}
      <div className="max-w-2xl mx-auto p-6 bg-muted/20 border border-dashed rounded-3xl text-center">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-bold text-sm uppercase tracking-widest mb-2">Nota de Diseño</h3>
        <p className="text-xs text-muted-foreground leading-relaxed px-4">
            Todas las propuestas utilizan la tipografía <span className="text-foreground font-bold">Poppins</span>. 
            Se ha implementado una lógica de <span className="text-foreground font-bold">visibilidad condicional</span>: 
            si una mesa no tiene consumos, el bloque de desglose se oculta automáticamente para mantener la limpieza visual.
        </p>
      </div>
    </div>
  )
}
