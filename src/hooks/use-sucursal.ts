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
      
      // Si el usuario tiene una lista restringida de sucursales permitidas (y no es Super Admin)
      if (id && !isAdmin && profile?.sucursalesPermitidas && profile.sucursalesPermitidas.length > 0) {
        if (!profile.sucursalesPermitidas.includes(id)) {
          id = profile.sucursalId && profile.sucursalesPermitidas.includes(profile.sucursalId)
            ? profile.sucursalId
            : profile.sucursalesPermitidas[0];
          if (typeof window !== 'undefined') {
            localStorage.setItem('selectedSucursalId', id);
          }
        }
      }

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
    
    setSucursalId(prev => (prev !== id ? id : prev));
    setIsLoading(prev => (prev !== false ? false : prev));

  }, [isAdmin, profile, isUserLoading, pathname]);
  
  return { sucursalId, isLoading };
}
