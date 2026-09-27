'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, DollarSign, BarChart, Settings, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MasterDashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
      if (!isUserLoading && user) {
          user.getIdTokenResult().then(idTokenResult => {
              if (!idTokenResult.claims.admin) {
                  router.push('/dashboard');
              }
          })
      }
  }, [user, isUserLoading, router])


  return (
    <div className="space-y-6">
        <div>
            <div className="flex items-center gap-2">
                <Settings className="h-6 w-6" />
                <h1 className="text-2xl font-bold tracking-tight">Dashboard Maestro</h1>
            </div>
            <p className="text-muted-foreground">Panel de control para el Super Administrador.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Building className="h-6 w-6 text-primary" />
                        <CardTitle>Gestión de Sucursales</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <CardDescription>Añade, edita y administra todas las sucursales del negocio desde un único lugar.</CardDescription>
                    <Button asChild className="mt-4 w-full">
                        <Link href="/dashboard/configuraciones/sucursales">
                            Ir a Sucursales
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                     <div className="flex items-center gap-3">
                        <Users className="h-6 w-6 text-primary" />
                        <CardTitle>Administración de Usuarios</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <CardDescription>Visualiza y gestiona los usuarios con acceso al sistema de todas las sucursales.</CardDescription>
                     <Button asChild className="mt-4 w-full">
                        <Link href="/dashboard/configuraciones/usuarios">
                            Ir a Usuarios
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <BarChart className="h-6 w-6 text-primary" />
                        <CardTitle>Reportes Globales</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <CardDescription>Accede a reportes consolidados de ventas, ocupación y rendimiento de todas las sucursales.</CardDescription>
                     <Button variant="secondary" className="mt-4 w-full" disabled>
                        Próximamente
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
