'use client'

import {
  Sidebar,
  SidebarProvider,
} from "@/components/ui/sidebar"
import AdminDashboardNav from "@/app/components/admin-dashboard-nav"
import { useUser } from '@/firebase'
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from 'lucide-react'
import { AdminHeader } from "@/app/components/admin-header"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isUserLoading, isAdmin } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isUserLoading) {
        if (user) {
            if (!isAdmin) {
                router.push('/dashboard');
            }
        } else {
             router.push('/login');
        }
    }
  }, [user, isUserLoading, isAdmin, router]);


  if (isUserLoading || !user || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AdminHeader />
      <div className="flex h-[calc(100vh-3.5rem)]">
        <Sidebar>
          <AdminDashboardNav />
        </Sidebar>
        <main 
          className="flex-1 overflow-y-auto p-4 sm:p-6"
        >
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
