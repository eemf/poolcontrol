
'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  History,
  ShoppingCart,
  Disc3,
  Save,
  Trash2,
  BadgeHelp,
  Clock,
  Search,
  FileClock,
  CreditCard,
  Coins,
  GlassWater
} from "lucide-react";
import { CardHeader } from "@/components/ui/card";


export default function ModoOscuroPage() {
  return (
    <div className="bg-slate-900 p-8 rounded-lg -m-8">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div className="w-full text-center sm:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center sm:justify-start gap-2">
              <ShoppingCart className="h-6 w-6" />
              Punto de Venta
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Crea una nueva orden de venta. Presiona F6 para añadir un ítem manual.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <div className="flex items-center gap-2 w-full">
              <Button className="flex-1 bg-slate-700 text-slate-200 hover:bg-slate-600">
                <History className="mr-2 h-4 w-4" />
                Ver Historial
              </Button>
              <Button className="flex-1 bg-slate-700 text-slate-200 hover:bg-slate-600">
                <Disc3 className="mr-2 h-4 w-4" />
                <span>Mesas</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <Card className="w-full bg-slate-800 border-slate-700 text-white">
              <CardContent className="space-y-2 pt-6 p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1 w-full">
                    <Input
                      defaultValue="Edil"
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                  <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-center flex-shrink-0">
                      <p className="text-sm text-slate-400">Total Venta</p>
                      <p className="text-3xl font-bold text-blue-400">Q6.00</p>
                    </div>
                    <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                      <Save className="mr-2 h-4 w-4" />
                      Guardar
                    </Button>
                  </div>
                </div>

                <div className="p-4 border border-slate-700 rounded-lg space-y-4">
                  <div className="flex flex-col sm:flex-row items-end gap-2">
                    <div className="flex items-end gap-2 w-full sm:w-auto sm:flex-initial">
                      <div className="flex-1 sm:w-20">
                        <Label htmlFor="cantidad" className="text-slate-400">Cant.</Label>
                        <Input
                          id="cantidad"
                          defaultValue="1"
                          className="text-center bg-slate-700 border-slate-600 rounded-md"
                        />
                      </div>
                    </div>
                    <div className="flex-1 w-full space-y-1">
                      <Label htmlFor="producto-search" className="text-slate-400">Producto</Label>
                      <Input
                        id="producto-search"
                        placeholder="Buscar producto..."
                        className="bg-slate-700 border-slate-600 rounded-md"
                      />
                    </div>
                    <div className="flex-shrink-0 w-full sm:w-auto">
                      <Button className="w-full bg-slate-700 text-slate-200 hover:bg-slate-600 rounded-md">
                        Añadir
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="min-h-[200px] border border-slate-700 rounded-lg p-2 space-y-2 bg-slate-900/50">
                  <div className="divide-y divide-slate-700">
                    <div className="flex items-center gap-4 py-3 px-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <BadgeHelp className="h-5 w-5 text-red-500 flex-shrink-0" />
                          <p className="font-semibold leading-tight text-sm text-slate-200">
                            Jugo de Vegetales
                          </p>
                        </div>
                        <div className="flex items-center gap-x-2 text-xs text-slate-500 ml-7">
                          <span>1 × Q6.00</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            11:33:18 AM
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                        <div className="font-medium text-sm text-slate-200">Q6.00</div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-500/10 hover:text-red-400 h-7 w-7 rounded-full"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="p-4 pb-0">
                  <div className="flex w-full items-center h-10 rounded-md border border-slate-600 bg-slate-900 px-3 text-sm">
                      <Search className="h-4 w-4 shrink-0 text-slate-400" />
                      <Input
                          type="search"
                          placeholder="Buscar cuenta..."
                          className="flex-1 border-0 bg-transparent p-0 pl-2 mr-2 shadow-none focus-visible:ring-0 text-white"
                      />
                      <div className="flex gap-1">
                          <div className="relative h-8 w-8 flex items-center justify-center bg-slate-700 rounded-md">
                              <FileClock className="h-5 w-5 text-slate-400"/>
                              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                                  1
                              </span>
                          </div>
                          <div className="h-8 w-8 flex items-center justify-center bg-slate-700 rounded-md">
                              <CreditCard className="h-5 w-5 text-slate-400"/>
                          </div>
                      </div>
                  </div>
              </CardHeader>
              <CardContent className='p-4'>
                <div className="w-full space-y-2">
                  <div className="border border-blue-500/50 bg-blue-900/20 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 w-full text-left">
                      <div className="col-span-1 flex items-center gap-2">
                        <p className="text-sm font-bold truncate text-white">Samuel</p>
                      </div>
                      <p className="col-span-1 text-sm font-bold text-blue-400 text-right">Q12.00</p>
                      <div className="col-span-1 flex flex-col text-xs text-slate-400">
                        <span>Venta # 307</span>
                        <span className="flex items-center gap-1"><Coins className="h-3 w-3 text-amber-500"/> 0.00/0.00</span>
                      </div>
                      <div className="col-span-1 flex flex-col text-xs text-slate-400 items-end">
                        <span>11/01/26</span>
                        <span className="flex items-center gap-1"><GlassWater className="h-3 w-3 text-sky-500"/> 0.00/12.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
