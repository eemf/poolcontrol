
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
    History, 
    Coins, 
    CreditCard, 
    User, 
    ShoppingBag, 
    ArrowRight, 
    FileText, 
    CheckCircle2
} from "lucide-react";

const DUMMY_SALE = {
    idVenta: 429,
    nombreCliente: "Victor",
    total: 36.00,
    totalEfectivo: 36.00,
    totalTarjeta: 0.00,
    fecha: "25/02/26 11:40 AM",
    pagosAnteriores: [
        {
            monto: 12.00,
            fecha: "25/02/26 11:31 AM",
            metodo: "Efectivo",
            items: [
                { nombre: "Monedas", monto: 10.00 },
                { nombre: "Coca Cola", monto: 2.00 }
            ]
        },
        {
            monto: 10.00,
            fecha: "25/02/26 11:31 AM",
            metodo: "Efectivo",
            items: [
                { nombre: "Monedas", monto: 10.00 }
            ]
        }
    ],
    pagosActuales: [
        {
            monto: 14.00,
            fecha: "25/02/26 11:40 AM",
            metodo: "Efectivo",
            items: [
                { nombre: "Mania Criolla", monto: 4.00 },
                { nombre: "Coca Cola", monto: 10.00 }
            ]
        }
    ]
};

export default function ModeloHistorialVentasPage() {
  return (
    <div className="space-y-12 pb-20 font-body">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
          <History className="h-8 w-8 text-primary" />
          Modelos de Historial de Ventas
        </h1>
        <p className="text-muted-foreground">Exploración de diseños para la visualización detallada de pagos y ventas.</p>
      </div>

      {/* MODELO 1: TIMELINE MODERNO COMPACTO */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold border-l-4 border-primary pl-3">1. Diseño de Línea de Tiempo (Timeline) - Compacto</h2>
        <Card className="max-w-3xl overflow-hidden border-none shadow-lg bg-slate-50/50 dark:bg-slate-900/50">
            <CardHeader className="bg-white dark:bg-slate-900 border-b p-2 sm:p-3">
                <div className="flex items-center justify-between w-full pr-2 sm:pr-4">
                    <div className="flex flex-col text-left min-w-0">
                        <span className="text-xs font-black text-muted-foreground leading-tight">Venta #{DUMMY_SALE.idVenta}</span>
                        <div className="flex items-center gap-2 min-w-0 mt-0.5">
                            <span className="font-bold text-sm sm:text-base truncate">{DUMMY_SALE.nombreCliente}</span>
                            <div className="flex items-center gap-1 shrink-0">
                                {DUMMY_SALE.totalEfectivo > 0 && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 h-5 px-1.5 text-[9px] font-bold">
                                        <Coins className="h-2.5 w-2.5 mr-1" /> Q{DUMMY_SALE.totalEfectivo.toFixed(2)}
                                    </Badge>
                                )}
                                {DUMMY_SALE.totalTarjeta > 0 && (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 h-5 px-1.5 text-[9px] font-bold">
                                        <CreditCard className="h-2.5 w-2.5 mr-1" /> Q{DUMMY_SALE.totalTarjeta.toFixed(2)}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                        <p className="text-xl sm:text-2xl font-black text-primary leading-none">Q{DUMMY_SALE.total.toFixed(2)}</p>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest tabular-nums mt-1">{DUMMY_SALE.fecha}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-muted-foreground/20">
                    {/* Pagos Anteriores */}
                    {DUMMY_SALE.pagosAnteriores.map((pago, idx) => (
                        <div key={`m1-ant-${idx}`} className="relative pl-10">
                            <div className="absolute left-2 top-1.5 h-4 w-4 rounded-full border-2 border-primary bg-white dark:bg-slate-900 z-10" />
                            <div className="flex justify-between items-center mb-2">
                                <div className="font-bold text-sm flex items-center gap-2">
                                    <Coins className="h-4 w-4 text-green-600" /> Pago de Q{pago.monto.toFixed(2)}
                                </div>
                                <span className="text-[10px] font-medium text-muted-foreground">{pago.fecha}</span>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border shadow-sm">
                                {pago.items.map((item, i) => (
                                    <div key={i} className="flex justify-between text-xs py-1">
                                        <span className="text-muted-foreground">{item.nombre}</span>
                                        <span className="font-bold text-green-600">+ Q{item.monto.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {/* Pago Actual */}
                    {DUMMY_SALE.pagosActuales.map((pago, idx) => (
                        <div key={`m1-act-${idx}`} className="relative pl-10">
                            <div className="absolute left-1.5 top-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center z-10 shadow-md">
                                <CheckCircle2 className="h-3 w-3 text-white" />
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <div className="font-black text-sm text-primary flex items-center gap-2">
                                    <ArrowRight className="h-4 w-4" /> Pago de Q{pago.monto.toFixed(2)}
                                </div>
                                <span className="text-[10px] font-bold text-primary uppercase">{pago.fecha}</span>
                            </div>
                            <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/20 shadow-sm">
                                {pago.items.map((item, i) => (
                                    <div key={i} className="flex justify-between text-xs py-1.5 border-b border-primary/10 last:border-0">
                                        <span className="font-medium">{item.nombre}</span>
                                        <span className="font-black text-primary">+ Q{item.monto.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </section>

      {/* MODELO 2: CARDS DE ACTIVIDAD (CHAT STYLE) */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold border-l-4 border-amber-500 pl-3">2. Diseño de Burbujas de Actividad</h2>
        <div className="max-w-2xl space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <ShoppingBag className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-black">Venta #{DUMMY_SALE.idVenta}</h3>
                        <p className="text-sm text-muted-foreground font-medium">{DUMMY_SALE.nombreCliente}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-black">Q{DUMMY_SALE.total.toFixed(2)}</p>
                    <Badge variant="outline" className="rounded-full bg-green-500/10 text-green-600 border-green-200">Completada</Badge>
                </div>
            </div>

            <div className="space-y-3 px-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Movimientos Anteriores</p>
                {DUMMY_SALE.pagosAnteriores.map((pago, idx) => (
                    <div key={`m2-ant-${idx}`} className="bg-muted/30 rounded-2xl p-4 border border-transparent hover:border-muted-foreground/20 transition-all">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-slate-400" />
                                <span className="font-bold text-sm">Cobro Registrado</span>
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground">{pago.fecha}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {pago.items.map((item, i) => (
                                <div key={i} className="bg-white dark:bg-slate-800 px-3 py-1 rounded-full border text-[11px] font-medium flex items-center gap-2">
                                    {item.nombre} <span className="text-green-600">Q{item.monto.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest text-center pt-2">Cierre de Período</p>
                {DUMMY_SALE.pagosActuales.map((pago, idx) => (
                    <div key={`m2-act-${idx}`} className="bg-primary rounded-3xl p-5 text-primary-foreground shadow-lg shadow-primary/20">
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="font-black text-lg">Liquidación Final</h4>
                            <span className="text-[10px] font-black opacity-70">{pago.fecha}</span>
                        </div>
                        <div className="space-y-2">
                            {pago.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm opacity-90">
                                    <span>{item.nombre}</span>
                                    <span className="font-black">Q{item.monto.toFixed(2)}</span>
                                </div>
                            ))}
                            <Separator className="bg-white/20 my-2" />
                            <div className="flex justify-between font-black text-xl">
                                <span>Total Pago</span>
                                <span>Q{pago.monto.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* MODELO 3: MINIMALISTA (TABULAR) */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold border-l-4 border-slate-800 dark:border-white pl-3">3. Diseño Estructurado Minimalista</h2>
        <div className="bg-white dark:bg-slate-950 border rounded-lg max-w-4xl overflow-hidden">
            <div className="p-6 flex flex-col md:flex-row justify-between border-b bg-slate-50 dark:bg-slate-900">
                <div className="space-y-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Comprobante de Venta</span>
                    <h3 className="text-xl font-bold">Venta No. {DUMMY_SALE.idVenta}</h3>
                    <p className="text-sm font-medium">Cliente: <span className="text-primary">{DUMMY_SALE.nombreCliente}</span></p>
                </div>
                <div className="text-left md:text-right mt-4 md:mt-0">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Monto Total</p>
                    <p className="text-3xl font-black">Q{DUMMY_SALE.total.toFixed(2)}</p>
                    <p className="text-[10px] font-medium text-muted-foreground">{DUMMY_SALE.fecha}</p>
                </div>
            </div>
            
            <div className="p-0">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-muted/20 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b">
                            <th className="px-6 py-3 text-left">Descripción del Pago</th>
                            <th className="px-6 py-3 text-center">Fecha / Hora</th>
                            <th className="px-6 py-3 text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {[...DUMMY_SALE.pagosAnteriores, ...DUMMY_SALE.pagosActuales].map((pago, idx) => (
                            <tr key={idx} className="group hover:bg-muted/10 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        <div className="font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                            Pago de Q{pago.monto.toFixed(2)}
                                        </div>
                                        <div className="flex flex-wrap gap-x-3 text-[11px] text-muted-foreground ml-4">
                                            {pago.items.map(i => i.nombre).join(", ")}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center text-xs font-medium text-muted-foreground">
                                    {pago.fecha}
                                </td>
                                <td className="px-6 py-4 text-right font-black text-slate-700 dark:text-slate-200">
                                    Q{pago.monto.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-slate-50 dark:bg-slate-900 border-t">
                            <td colSpan={2} className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-muted-foreground">Balance Liquidado</td>
                            <td className="px-6 py-4 text-right font-black text-xl text-primary">Q{DUMMY_SALE.total.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
      </section>

      {/* MODELO 4: DASHBOARD COMPACTO */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold border-l-4 border-indigo-500 pl-3">4. Diseño de Bloques Informativos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="col-span-1 md:col-span-2 lg:col-span-3 border-none shadow-md bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground">
                <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30">
                                <FileText className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black">Cuenta #{DUMMY_SALE.idVenta}</h3>
                                <p className="text-white/70 font-medium">{DUMMY_SALE.nombreCliente} • {DUMMY_SALE.fecha}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold uppercase tracking-widest opacity-70">Saldo Final</p>
                            <p className="text-4xl font-black">Q{DUMMY_SALE.total.toFixed(2)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Pagos como mini-widgets */}
            {[...DUMMY_SALE.pagosAnteriores, ...DUMMY_SALE.pagosActuales].map((pago, idx) => (
                <Card key={idx} className="border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none font-bold text-[10px]">
                                {idx < DUMMY_SALE.pagosAnteriores.length ? 'ANTERIOR' : 'ACTUAL'}
                            </Badge>
                            <span className="text-[10px] font-bold text-muted-foreground">{pago.fecha.split(' ')[1]} {pago.fecha.split(' ')[2]}</span>
                        </div>
                        <CardTitle className="text-lg font-black pt-2">Q{pago.monto.toFixed(2)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {pago.items.map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-xs p-2 bg-muted/40 rounded-lg">
                                    <span className="font-medium">{item.nombre}</span>
                                    <span className="font-black text-indigo-600">+ Q{item.monto.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      </section>
    </div>
  )
}
