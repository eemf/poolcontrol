
'use client'

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  TableProperties, 
  CreditCard, 
  Coins, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Info,
  ShieldCheck,
  User,
  History,
  CheckCircle,
  Layout,
  Receipt,
  Sigma,
  Plus
} from 'lucide-react';
import { cn } from "@/lib/utils";

const DUMMY_ITEMS = [
  { id: 1, name: "2x Cerveza Nacional", price: 30.00 },
  { id: 2, name: "1x Hamburguesa Especial", price: 45.00 },
  { id: 3, name: "Monedas (Base)", price: 20.00 },
];

export default function SolucionPagoUnificadoPage() {
  // Estado para ítems de la venta actual
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set([1, 2, 3]));
  // Estado para el bloque de deuda anterior
  const [includeCredit, setIncludeCredit] = useState(false);

  const saldoCredito = 150.00;
  
  const subtotalVentaActual = useMemo(() => {
    return DUMMY_ITEMS
      .filter(item => selectedItems.has(item.id))
      .reduce((sum, item) => sum + item.price, 0);
  }, [selectedItems]);

  const totalACobrar = subtotalVentaActual + (includeCredit ? saldoCredito : 0);

  const toggleItem = (id: number) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-10 pb-20 font-body max-w-5xl mx-auto">
      {/* HEADER DE PÁGINA */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-3 text-foreground">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <TableProperties className="h-6 w-6 text-primary" />
          </div>
          Solución: Pago Unificado
        </h1>
        <p className="text-sm text-muted-foreground">
          Propuesta técnica para liquidar saldos actuales y deudas de crédito en un solo proceso.
        </p>
      </div>

      {/* BLOQUE: EL PLAN */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className="h-6 w-6 rounded-full p-0 flex items-center justify-center bg-primary">1</Badge>
          <h2 className="text-lg font-bold font-headline">El Plan Estratégico</h2>
        </div>
        <Card className="border-muted/60 shadow-sm">
          <CardContent className="p-6 space-y-4 text-sm leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <p className="font-bold text-primary flex items-center gap-2 italic">
                  <ShieldCheck className="h-4 w-4" /> Objetivo Operativo
                </p>
                <p className="font-medium">
                  Permitir que cuando un cliente con deuda histórica (Crédito) venga a pagar su consumo del día, el cajero pueda ofrecerle liquidar ambos saldos sin tener que abrir dos modales distintos.
                </p>
              </div>
              <div className="space-y-3">
                <p className="font-bold text-primary flex items-center gap-2 italic">
                  <History className="h-4 w-4" /> Lógica de Negocio
                </p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground font-semibold">
                  <li>Listado completo de ítems de la venta actual para cobro selectivo.</li>
                  <li>Bloque de deuda anterior que suma el saldo total de créditos.</li>
                  <li>Botón de abono disponible solo si no hay ítems individuales seleccionados.</li>
                  <li>Actualización de balances históricos en una sola transacción.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* BLOQUE: MAQUETA VISUAL */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Badge className="h-6 w-6 rounded-full p-0 flex items-center justify-center bg-primary">2</Badge>
          <h2 className="text-lg font-bold font-headline">Pantalla: Modal de Pago Unificado</h2>
        </div>
        
        <div className="bg-muted/30 p-4 sm:p-10 rounded-[2.5rem] border-2 border-dashed border-muted-foreground/20">
          <div className="max-w-md mx-auto bg-background border border-muted/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[700px]">
            
            {/* ENCABEZADO PROPUESTO */}
            <div className="p-6 bg-primary/5 text-center space-y-4 border-b border-primary/10 shrink-0">
              <div className="flex justify-center gap-2">
                <Badge className="bg-primary/10 text-primary border-none font-bold text-[10px] h-5 rounded-full px-3">
                  Cuenta de Samuel L.
                </Badge>
                <Badge className="bg-orange-100 text-orange-700 border-none font-bold text-[10px] h-5 rounded-full px-3">
                  Deuda Pendiente
                </Badge>
              </div>
              <div className="space-y-0.5">
                <p className="text-5xl font-bold text-blue-500 tabular-nums tracking-tighter">
                  Q{totalACobrar.toFixed(2)}
                </p>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Total a Liquidar</p>
              </div>
            </div>

            {/* CUERPO: LISTA DE ITEMS + BLOQUE DE CRÉDITO */}
            <div className="flex-1 min-h-0 bg-background flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 h-full">
                <div className="p-6 space-y-6">
                  
                  {/* SECCIÓN: VENTA DEL TURNO */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Venta del Turno</p>
                      <Badge variant="outline" className="text-[9px] font-bold h-4">Hoy</Badge>
                    </div>
                    <div className="space-y-1">
                      {DUMMY_ITEMS.map(item => (
                        <div 
                          key={item.id} 
                          className={cn(
                            "flex justify-between items-center p-3 border transition-all rounded-xl cursor-pointer",
                            selectedItems.has(item.id) ? "bg-primary/5 border-primary/20" : "bg-card border-muted/60 hover:bg-muted/5"
                          )}
                          onClick={() => toggleItem(item.id)}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Checkbox checked={selectedItems.has(item.id)} onCheckedChange={() => toggleItem(item.id)} className="h-5 w-5 rounded-md" />
                            <span className="text-sm font-bold text-foreground/80 truncate">{item.name}</span>
                          </div>
                          <span className="font-bold text-foreground tabular-nums text-sm">Q{item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-muted-foreground/10" />

                  {/* SECCIÓN: DEUDA ACUMULADA */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Deuda Histórica</p>
                    <div 
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer",
                        includeCredit ? "bg-orange-50 border-orange-400 ring-1 ring-orange-200" : "bg-card border-muted/60 hover:border-muted-foreground/30"
                      )}
                      onClick={() => setIncludeCredit(!includeCredit)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox checked={includeCredit} className="h-5 w-5 rounded-md" />
                        <div>
                          <p className={cn("text-sm font-bold", includeCredit ? "text-orange-700" : "")}>Total Créditos</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Cierres anteriores</p>
                        </div>
                      </div>
                      <span className={cn("font-bold", includeCredit ? "text-orange-700" : "")}>Q{saldoCredito.toFixed(2)}</span>
                    </div>
                  </div>

                </div>
              </ScrollArea>
            </div>

            {/* FOOTER: MATRIZ DE PAGOS COMPLETA */}
            <div className="p-6 bg-muted/5 border-t border-muted-foreground/10 shrink-0">
              <div className="grid grid-cols-3 gap-3">
                <Button 
                  className="rounded-2xl h-16 flex-col bg-orange-600 hover:bg-orange-700 gap-1 font-bold text-[11px] shadow-md border-none text-white transition-transform active:scale-95"
                  disabled={selectedItems.size > 0}
                >
                  <Coins className="h-5 w-5" /> Abono
                </Button>
                <Button className="rounded-2xl h-16 flex-col bg-blue-600 hover:bg-blue-700 gap-1 font-bold text-[11px] shadow-md border-none text-white transition-transform active:scale-95" disabled={totalACobrar <= 0}>
                  <CreditCard className="h-5 w-5" /> Tarjeta
                </Button>
                <Button className="rounded-2xl h-16 flex-col bg-emerald-600 hover:bg-emerald-700 gap-1 font-bold text-[11px] shadow-md border-none text-white transition-transform active:scale-95" disabled={totalACobrar <= 0}>
                  <CheckCircle className="h-5 w-5" /> Efectivo
                </Button>
              </div>
              <div className="mt-4 flex justify-between items-center px-1">
                <Button variant="ghost" className="text-muted-foreground font-bold text-xs rounded-full">Cerrar</Button>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                  Selección: {selectedItems.size} ítems {includeCredit ? '+ Deuda' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOQUE: PASOS TÉCNICOS */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className="h-6 w-6 rounded-full p-0 flex items-center justify-center bg-primary">3</Badge>
          <h2 className="text-lg font-bold font-headline">Implementación Técnica</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-muted/60">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Fase 1: Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground font-semibold">
              Al cargar un cliente en el POS, el sistema realiza un <strong>fetch paralelo</strong> de todas sus ventas con estado <code className="text-primary font-bold">"credito"</code>.
            </CardContent>
          </Card>
          <Card className="border-muted/60">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Layout className="h-4 w-4 text-primary" /> Fase 2: UI
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground font-semibold">
              El modal unifica el listado de ítems del día con el bloque de deuda histórica. Se mantiene la regla de abono global.
            </CardContent>
          </Card>
          <Card className="border-muted/60">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Fase 3: Tx
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground font-semibold">
              El pago se procesa mediante una <strong>Transaction</strong> que cierra múltiples documentos de venta y crea un único registro de Pago consolidado.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ADVERTENCIA FINAL */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 p-6 rounded-3xl flex items-start gap-4">
        <AlertTriangle className="h-6 w-6 text-blue-600 shrink-0" />
        <div className="space-y-1">
          <p className="font-bold text-blue-900 dark:text-blue-200 uppercase tracking-widest text-xs">Nota Importante</p>
          <p className="text-xs text-blue-800/80 dark:text-blue-300 font-semibold leading-relaxed">
            Esta es una página de propuesta conceptual. No se han realizado cambios en la lógica de producción del modal de ventas para garantizar la estabilidad del sistema actual mientras se revisa este plan.
          </p>
        </div>
      </div>
    </div>
  );
}
