'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/firebase'
import { Loader2 } from 'lucide-react'

export default function SeleccionarSucursalRedirectPage() {
  const { user, isUserLoading, isAdmin } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isUserLoading) {
      return; // Wait until user state is resolved
    }
    if (!user) {
      router.replace('/login');
      return;
    }
    if (isAdmin) {
      router.replace('/admin-success');
    } else {
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, isAdmin, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
