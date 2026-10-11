'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, isUserLoading, isAdmin } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      const tieneSesionValida = typeof window !== 'undefined' && sessionStorage.getItem('pool_control_session_activa') === 'true';
      if (user && tieneSesionValida) {
        if (isAdmin) {
          router.replace('/admin-success');
        } else {
          router.replace('/dashboard');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [user, isUserLoading, isAdmin, router]);

  // Evitar renderizado mientras se resuelve la redirección
  return null;
}
