'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Palette, Star, Check, Circle, X, Plus, ThumbsUp, Home, PencilIcon, CreditCard, Gift, Archive } from "lucide-react";

export default function DisenoBotonesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center gap-2">
          <Palette className="h-6 w-6" />
          Galería de Botones
        </h1>
        <p className="text-sm text-muted-foreground">Una muestra de todos los estilos de botones utilizados en la aplicación.</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Variantes de Botones Estándar</CardTitle>
            <CardDescription>
                Estos son los estilos base proporcionados por el sistema de diseño.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-wrap items-center gap-4">
                <Button><Home className="mr-2 h-4 w-4"/> Primario</Button>
                <Button variant="secondary"><Check className="mr-2 h-4 w-4"/> Secundario</Button>
                <Button variant="destructive"><X className="mr-2 h-4 w-4"/> Destructivo</Button>
                <Button variant="outline"><Circle className="mr-2 h-4 w-4"/> Contorno</Button>
                <Button variant="ghost"><ThumbsUp className="mr-2 h-4 w-4"/> Fantasma</Button>
                <Button variant="link">Enlace</Button>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Tamaños de Botones</CardTitle>
            <CardDescription>
                Los botones pueden tener diferentes tamaños y pueden incluir iconos para acciones rápidas.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-wrap items-center gap-4">
                <Button size="lg"><Plus className="mr-2 h-5 w-5"/> Grande (h-11)</Button>
                <Button><Plus className="mr-2 h-4 w-4"/> Normal (h-10)</Button>
                <Button size="sm"><Plus className="mr-2 h-4 w-4"/> Pequeño (h-9)</Button>
                <Button size="icon">
                    <Star className="h-5 w-5" />
                </Button>
                 <Button variant="outline" size="icon">
                    <Archive className="h-5 w-5" />
                </Button>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Botones de Acción (Punto de Venta)</CardTitle>
            <CardDescription>
                Botones con colores específicos y tamaño consistente (h-9) para acciones rápidas en la lista de cuentas.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-wrap items-center gap-4">
                <Button size="sm" className="h-9">
                    <Check className="mr-2 h-4 w-4"/> Pagar
                </Button>
                <Button size="icon" className="bg-sky-600 hover:bg-sky-700 h-9 w-9 text-white">
                    <PencilIcon className="h-4 w-4"/>
                </Button>
                <Button size="icon" className="bg-teal-600 hover:bg-teal-700 h-9 w-9 text-white">
                    <CreditCard className="h-4 w-4"/>
                </Button>
                <Button size="icon" className="bg-orange-600 hover:bg-orange-700 h-9 w-9 text-white">
                    <Gift className="h-4 w-4"/>
                </Button>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Propuesta #1: Botón Secundario Sólido</CardTitle>
            <CardDescription>
                Este estilo de botón secundario utiliza los colores `secondary` y `secondary-foreground` de tu tema. Esto resulta en un botón de fondo sólido y opaco, pero con un color (generalmente un gris neutro) que es intencionadamente menos llamativo que el color primario.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-wrap items-center gap-4">
                <Button variant="secondary">
                    <Star className="mr-2 h-4 w-4"/> Propuesta Secundario
                </Button>
                <Button>
                    <Home className="mr-2 h-4 w-4"/> Primario (Comparación)
                </Button>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Propuesta #2: Botón de Acento</CardTitle>
            <CardDescription>
                Esta variante utiliza los colores de "acento" del tema. Es ideal para acciones secundarias que merecen un poco más de atención, como "Exportar" o "Ver Detalles", sin llegar a ser la acción principal. Funciona bien tanto en modo claro como oscuro.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-wrap items-center gap-4">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/80">
                    <Star className="mr-2 h-4 w-4"/> Botón de Acento
                </Button>
                <Button>
                    <Home className="mr-2 h-4 w-4"/> Primario (Comparación)
                </Button>
                 <Button variant="secondary">
                    <Star className="mr-2 h-4 w-4"/> Propuesta #1 (Comparación)
                </Button>
            </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
            <CardTitle>Propuesta #3: Botón Sutil</CardTitle>
            <CardDescription>
                Este estilo utiliza los colores `muted` para una apariencia de bajo contraste. Es perfecto para acciones terciarias que no deben competir visualmente, como un botón para "Cerrar" un panel informativo.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-wrap items-center gap-4">
                <Button className="bg-muted text-muted-foreground hover:bg-muted/80">
                    <Star className="mr-2 h-4 w-4"/> Botón Sutil
                </Button>
                <Button>
                    <Home className="mr-2 h-4 w-4"/> Primario (Comparación)
                </Button>
                 <Button className="bg-accent text-accent-foreground hover:bg-accent/80">
                    <Star className="mr-2 h-4 w-4"/> Propuesta #2 (Comparación)
                </Button>
            </div>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
            <CardTitle>Propuesta #4: Botón de Acento Invertido</CardTitle>
            <CardDescription>
                Esta variante utiliza el color de fondo de acento pero con texto claro (blanco), similar al efecto 'hover' de otros botones. Es una alternativa de alto contraste para acciones secundarias importantes.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-wrap items-center gap-4">
                <Button className="bg-accent text-primary-foreground hover:bg-accent/80">
                    <Star className="mr-2 h-4 w-4"/> Propuesta #4
                </Button>
                <Button>
                    <Home className="mr-2 h-4 w-4"/> Primario (Comparación)
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
