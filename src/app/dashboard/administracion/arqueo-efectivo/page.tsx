
'use client';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

/**
 * @fileoverview Esta página ha sido desactivada por solicitud del usuario.
 * Redirige automáticamente al dashboard principal.
 */
export default function ArqueoEfectivoPage() {
  useEffect(() => {
    redirect('/dashboard');
  }, []);
  return null;
}
