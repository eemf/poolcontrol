
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useFirebase, useUser } from '@/firebase'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Dices, Loader2, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const loginSchema = z.object({
  email: z.string().email({ message: "Introduce un correo electrónico válido." }),
  password: z.string().min(1, { message: "La contraseña es obligatoria." }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginInitiated, setLoginInitiated] = useState(false);
  const router = useRouter()
  const { auth } = useFirebase()
  const { user, isUserLoading, isAdmin } = useUser();
  const { toast } = useToast()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Redirect if user is already logged in and their role is determined
  useEffect(() => {
    if (!isUserLoading && user) {
        if (isAdmin) {
            router.replace('/admin-success');
        } else {
            router.replace('/dashboard');
        }
    }
  }, [user, isUserLoading, isAdmin, router]);

  // Handle redirection after a login attempt is successful and user data is available
  useEffect(() => {
    if (loginInitiated && !isUserLoading && user) {
        toast({
            title: "Autenticación Exitosa",
            description: `Rol detectado: ${isAdmin ? 'Superadministrador' : 'Usuario de Sucursal'}. Redirigiendo...`,
            duration: 3000
        });

        setTimeout(() => {
            if (isAdmin) {
                router.push('/admin-success');
            } else {
                router.push('/dashboard');
            }
        }, 1000);
    }
  }, [loginInitiated, user, isUserLoading, isAdmin, router, toast]);

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true)
    setLoginInitiated(true);
    
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password)
    } catch (error: any) {
      setLoading(false);
      setLoginInitiated(false);
      
      let errorMessage = "Las credenciales son incorrectas. Por favor, inténtalo de nuevo.";
      
      if (error.code === 'auth/user-disabled') {
          errorMessage = "Esta cuenta ha sido deshabilitada.";
      }

      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: errorMessage,
      })
    } 
  }
  
  if (isUserLoading || (loginInitiated && !user)) {
      return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
  }

  if (user) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm shadow-xl rounded-2xl overflow-hidden border-muted/60">
        <CardHeader className="text-center pb-2">
          <Dices className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="mt-4 text-2xl font-headline font-bold">Pool Control</CardTitle>
          <CardDescription className="font-body">Inicia sesión para administrar tu sucursal</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <CardContent className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold ml-1">Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="usuario@sucursal.com"
                        className="rounded-full h-11"
                        disabled={loading}
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] ml-1" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold ml-1">Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••"
                          className="rounded-full h-11 pr-10"
                          disabled={loading}
                          autoComplete="current-password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full text-muted-foreground hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] ml-1" />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="pt-2 pb-8">
              <Button type="submit" className="w-full rounded-full h-11 font-bold shadow-lg shadow-primary/20" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : 'Ingresar al Sistema'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
