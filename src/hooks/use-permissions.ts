'use client';

import { useMemo } from 'react';
import { useUser, useCollection, useMemoFirebase, useFirebase } from '@/firebase';
import { useSucursal } from '@/hooks/use-sucursal';
import { collection, query, where, documentId } from 'firebase/firestore';
import type { Rol, UsuarioSucursal } from '@/lib/tipos';

/**
 * Hook para gestionar y verificar permisos del usuario en la sucursal actual.
 */
export function usePermissions() {
  const { firestore } = useFirebase();
  const { user, isAdmin: isSuperAdmin, profile } = useUser();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();

  // 1. Obtener el documento del usuario en la sucursal
  // Usamos useCollection con un filtro de ID para obtener los datos del usuario en esta sucursal específica
  const userQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId || !user) return null;
    return query(
      collection(firestore, `sucursales/${sucursalId}/usuarios`), 
      where("authUid", "==", user.uid)
    );
  }, [firestore, sucursalId, user]);

  const { data: userDataList, isLoading: isLoadingUserData } = useCollection<UsuarioSucursal>(userQuery);
  const userData = userDataList?.[0];

  // 2. Obtener las definiciones de los roles asignados
  const rolesQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId || !userData?.roles || userData.roles.length === 0) return null;
    return query(
      collection(firestore, `sucursales/${sucursalId}/roles`), 
      where(documentId(), "in", userData.roles)
    );
  }, [firestore, sucursalId, userData?.roles]);

  const { data: rolesData, isLoading: isLoadingRoles } = useCollection<Rol>(rolesQuery);

  // 3. Calcular el set de permisos efectivos
  const permissions = useMemo(() => {
    // Super Admin o Usuarios con Acceso Global tienen acceso total (*)
    if (isSuperAdmin || profile?.accesoGlobal === true) return new Set(['*']);

    const perms = new Set<string>();
    
    // Añadir permisos provenientes de los roles asignados
    rolesData?.forEach(rol => {
      rol.permisos?.forEach(p => perms.add(p));
    });

    // Añadir permisos otorgados directamente al usuario (permisos extra)
    userData?.permisosExtra?.forEach(p => perms.add(p));

    return perms;
  }, [rolesData, userData, isSuperAdmin, profile]);

  /**
   * Verifica si el usuario tiene un permiso específico.
   */
  const hasPermission = (permissionKey: string): boolean => {
    if (isSuperAdmin || permissions.has('*')) return true;
    return permissions.has(permissionKey);
  };

  /**
   * Verifica si el usuario tiene al menos uno de los permisos de la lista.
   */
  const hasAnyPermission = (keys: string[]): boolean => {
    if (isSuperAdmin || permissions.has('*')) return true;
    return keys.some(key => permissions.has(key));
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    isLoading: isLoadingSucursal || isLoadingUserData || isLoadingRoles,
    isSuperAdmin
  };
}
