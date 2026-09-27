'use client'

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getPersonalizedOfferRecommendations } from "@/ai/flows/personalized-offer-recommendations"
import { Loader2, Wand2, Users } from "lucide-react"

const formSchema = z.object({
  customerPurchaseHistory: z.string().min(10, {
    message: "El historial de compras debe tener al menos 10 caracteres.",
  }).default("Compra regularmente cervezas importadas y snacks. Ocasionalmente pide pizza."),
  tableUsage: z.string().min(10, {
    message: "El uso de la mesa debe tener al menos 10 caracteres.",
  }).default("Juega principalmente los viernes por la noche, durante 2-3 horas en la mesa 7."),
})

export default function CustomersPage() {
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        customerPurchaseHistory: "Compra regularmente cervezas importadas y snacks. Ocasionalmente pide pizza.",
        tableUsage: "Juega principalmente los viernes por la noche, durante 2-3 horas en la mesa 7."
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    setRecommendations("")
    try {
      const result = await getPersonalizedOfferRecommendations(values)
      setRecommendations(result.offerRecommendations)
    } catch (error) {
      console.error("Error getting recommendations:", error)
      setRecommendations("Hubo un error al generar las recomendaciones. Por favor, inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center gap-2">
                <Users className="h-6 w-6" />
                Recomendaciones para Clientes
            </h1>
            <p className="text-sm text-muted-foreground">Genera ofertas personalizadas utilizando IA.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
            <CardHeader>
            <CardTitle>Generador de Ofertas Personalizadas</CardTitle>
            <CardDescription>
                Usa IA para crear ofertas irresistibles para tus clientes basadas en su comportamiento.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="customerPurchaseHistory"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Historial de Compras del Cliente</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder="Ej: Compra 2 cervezas y 1 snack cada visita..."
                            className="min-h-[100px]"
                            {...field}
                        />
                        </FormControl>
                        <FormDescription>
                        Describe los productos que el cliente suele consumir.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="tableUsage"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Uso de Mesas del Cliente</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder="Ej: Juega los fines de semana, prefiere la mesa 3..."
                            className="min-h-[100px]"
                            {...field}
                        />
                        </FormControl>
                        <FormDescription>
                        Describe los hábitos de juego del cliente.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Generar Recomendaciones
                </Button>
                </form>
            </Form>
            </CardContent>
        </Card>
        <Card className="flex flex-col">
            <CardHeader>
            <CardTitle>Ofertas Recomendadas</CardTitle>
            <CardDescription>
                Aquí aparecerán las sugerencias generadas por la IA.
            </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
            {loading ? (
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p>Generando ideas brillantes...</p>
                </div>
            ) : recommendations ? (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {recommendations}
                </div>
            ) : (
                <div className="text-center text-muted-foreground">
                    <Wand2 className="h-12 w-12 mx-auto mb-2 text-primary/50" />
                    <p>Las recomendaciones aparecerán aquí.</p>
                </div>
            )}
            </CardContent>
        </Card>
        </div>
    </div>
  )
}
