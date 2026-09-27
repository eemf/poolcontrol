'use client'
import { useUser } from '@/firebase'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { user, isUserLoading, isAdmin } = useUser()

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        if (isAdmin) {
          redirect('/admin-success');
        } else {
          redirect('/dashboard');
        }
      } else {
        redirect('/login');
      }
    }
  }, [user, isUserLoading, isAdmin]);

  // Prevent rendering anything until redirection is determined
  return null;
}
