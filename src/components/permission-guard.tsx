
'use client';

import React from 'react';
import { usePermissions } from '@/hooks/use-permissions';

interface PermissionGuardProps {
  permission?: string;
  anyPermission?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente que renderiza su contenido solo si el usuario tiene los permisos requeridos.
 */
export function PermissionGuard({ 
  permission, 
  anyPermission, 
  children, 
  fallback = null 
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, isLoading } = usePermissions();

  if (isLoading) return null;

  let authorized = false;

  if (permission) {
    authorized = hasPermission(permission);
  } else if (anyPermission) {
    authorized = hasAnyPermission(anyPermission);
  } else {
    authorized = true; // Si no se pide nada, se autoriza
  }

  return authorized ? <>{children}</> : <>{fallback}</>;
}
