'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Zap,
  Undo2,
  XCircle
} from "lucide-react"
import { ToastAction } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

export default function NotificacionesPruebasPage() {
  const { toast } = useToast()

  const dispararExito = () => {
    toast({
      variant: "success",
      title: "Venta registrada con éxito",
      description: "El inventario ha sido actualizado automáticamente.",
    })
  }

  const dispararError = () => {
    toast({
      variant: "destructive",
      title: "Error de conexión",
      description: "No se pudo sincronizar el cierre de caja. Reintenta más tarde.",
    })
  }

  const dispararInfo = () => {
    toast({
      variant: "info",
      title: "Nuevo producto disponible",
      description: "Se han añadido Monedas Virtuales al catálogo de servicios.",
    })
  }

  const dispararAviso = () => {
    toast({
      variant: "warning",
      title: "Stock bajo detectado",
      description: "Quedan menos de 5 unidades de Cerveza Nacional.",
    })
  }

  const dispararAccion = () => {
    toast({
      title: "Cliente eliminado",
      description: "El registro de 'Juan Pérez' ha sido removido.",
      action: (
        <ToastAction altText="Deshacer" onClick={() => console.log("Deshaciendo...")}>
          <Undo2 className="h-3 w-3 mr-1" />
          Deshacer
        </ToastAction>
      ),
    })
  }

  const items = [
    {
      title: "Éxito (Sólido)",
      desc: "Diseño esmeralda con icono CheckCircle2 integrado.",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      action: dispararExito,
      variant: "success"
    },
    {
      title: "Error (Alerta)",
      desc: "Diseño carmesí sólido para fallos críticos.",
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
      action: dispararError,
      variant: "destructive"
    },
    {
      title: "Info (Minimal)",
      desc: "Estilo Glassmorphism azul translúcido con icono Info.",
      icon: Info,
      color: "text-sky-500",
      bg: "bg-sky-50/10",
      action: dispararInfo,
      variant: "info"
    },
    {
      title: "Aviso (Borde)",
      desc: "Fondo crema con borde lateral grueso en ámbar.",
      icon: AlertTriangle,
      color: "text-amber-500",
      bg: "bg-amber-50/10",
      action: dispararAviso,
      variant: "warning"
    },
    {
      title: "Interactiva (POS)",
      desc: "Notificación estándar con botón de acción lateral.",
      icon: Zap,
      color: "text-primary",
      bg: "bg-primary/10",
      action: dispararAccion,
      variant: "default"
    },
    {
      title: "Replica",
      desc: "Estilo Glassmorphism azul traslúcido íntegro (Build 53).",
      icon: Info,
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-500/20",
      action: dispararInfo,
      variant: "info",
      isReplica: true
    }
  ]

  return (
    <div className="space-y-8 font-body max-w-5xl mx-auto pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          Galería de Notificaciones Modernas
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Diseños visualmente únicos con iconos y estructuras diferenciadas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item, idx) => (
          <Card 
            key={idx} 
            className={cn(
              "border-muted/60 shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden group",
              item.isReplica && "border-sky-200 dark:border-sky-800 bg-sky-50/80 dark:bg-sky-900/30 backdrop-blur-md text-sky-900 dark:text-sky-100 shadow-sky-500/10"
            )}
          >
            <CardHeader className="p-6">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", 
                  item.isReplica 
                    ? "h-16 w-16 bg-sky-500/20 text-sky-600 dark:text-sky-400" 
                    : cn("h-12 w-12", item.bg, item.color)
                )}>
                  <item.icon className={cn(item.isReplica ? "h-9 w-9" : "h-6 w-6")} />
                </div>
                <div className="space-y-1">
                  <CardTitle className={cn("text-base font-bold", item.isReplica && "text-sky-900 dark:text-sky-100")}>
                    {item.title}
                  </CardTitle>
                  <CardDescription className={cn("text-xs leading-relaxed", item.isReplica && "text-sky-800/70 dark:text-sky-200/70")}>
                    {item.desc}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <Button 
                onClick={item.action} 
                className={cn(
                  "w-full rounded-full font-bold h-11",
                  item.isReplica ? "bg-sky-600 hover:bg-sky-700 text-white border-none" : ""
                )}
                variant={item.variant === 'destructive' ? 'destructive' : (item.isReplica ? 'default' : 'outline')}
              >
                Probar Estilo
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-muted/30 p-6 rounded-3xl border border-dashed border-muted-foreground/20 text-center">
        <p className="text-xs text-muted-foreground font-medium">
          * Los iconos se inyectan automáticamente según la variante seleccionada para garantizar consistencia.
        </p>
      </div>
    </div>
  )
}
