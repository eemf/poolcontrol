'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { usePathname } from 'next/navigation';

/**
 * Hook guardián para la gestión del aislamiento de sucursales.
 * Garantiza que el contexto de la sucursal sea consistente con el perfil del usuario.
 */
export function useSucursal() {
  const { isAdmin, isUserLoading, profile } = useUser();
  const [sucursalId, setSucursalId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    if (isUserLoading) return;

    let id: string | null = null;
    
    // Un usuario puede "saltar" entre sucursales si es Super Admin o tiene Acceso Global
    const puedeSaltar = isAdmin || profile?.accesoGlobal === true;

    if (puedeSaltar) {
      // Intentar obtener la sucursal seleccionada manualmente en el menú
      id = typeof window !== 'undefined' ? localStorage.getItem('selectedSucursalId') : null;
      
      // Si no hay selección manual pero hay un perfil, usar la sucursal del perfil como base
      if (!id && profile?.sucursalId) {
        id = profile.sucursalId;
      }
    } else if (profile) {
      // Para usuarios normales, la fuente es SIEMPRE su sucursal asignada
      id = profile.sucursalId || null;
      
      // Limpieza preventiva: asegurar que no haya rastros de selecciones manuales previas
      if (typeof window !== 'undefined' && localStorage.getItem('selectedSucursalId')) {
        localStorage.removeItem('selectedSucursalId');
      }
    }
    
    setSucursalId(id);
    setIsLoading(false);

  }, [isAdmin, profile, isUserLoading, pathname]);
  
  return { sucursalId, isLoading };
}
