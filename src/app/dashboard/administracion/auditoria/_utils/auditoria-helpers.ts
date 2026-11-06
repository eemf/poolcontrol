import React from 'react';
import type { RegistroAuditoria, CategoriaAuditoria } from '@/lib/tipos';
import {
  ShoppingCart, Gamepad2, Scale, Package, Boxes, Truck,
  Monitor, Tablet, Smartphone, ShieldCheck
} from 'lucide-react';

export const CATEGORIAS_CONFIG: Record<
  CategoriaAuditoria,
  { label: string; color: string; badgeClass: string; icon: React.ElementType }
> = {
  VENTAS: {
    label: 'Ventas y Cobros',
    color: 'text-blue-500 dark:text-blue-400',
    badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    icon: ShoppingCart,
  },
  MESAS: {
    label: 'Sala de Juegos',
    color: 'text-emerald-500 dark:text-emerald-400',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    icon: Gamepad2,
  },
  CAJA: {
    label: 'Caja y Turnos',
    color: 'text-amber-500 dark:text-amber-400',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    icon: Scale,
  },
  CATALOGO: {
    label: 'Catálogo',
    color: 'text-purple-500 dark:text-purple-400',
    badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    icon: Package,
  },
  INVENTARIO: {
    label: 'Inventario',
    color: 'text-indigo-500 dark:text-indigo-400',
    badgeClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    icon: Boxes,
  },
  COMPRAS: {
    label: 'Compras',
    color: 'text-orange-500 dark:text-orange-400',
    badgeClass: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    icon: Truck,
  },
};

/**
 * Función auxiliar para resolver el icono, etiqueta y colores según el tipo de dispositivo
 */
export function resolverMetaDispositivo(tipo?: string, nombre?: string, so?: string) {
  const n = (nombre || '').toLowerCase();
  const t = (tipo || '').toLowerCase();
  const s = (so || '').toLowerCase();

  if (t === 'tablet' || n.includes('tablet') || n.includes('ipad') || s.includes('ipad')) {
    return {
      icon: Tablet,
      label: 'Tablet',
      badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800',
      color: 'text-amber-500 dark:text-amber-400',
    };
  }

  if (
    t === 'telefono' ||
    n.includes('celular') ||
    n.includes('teléfono') ||
    n.includes('telefono') ||
    n.includes('móvil') ||
    n.includes('movil') ||
    n.includes('iphone') ||
    (t !== 'computadora' && (s.includes('ios') || s.includes('android')) && !s.includes('ipad'))
  ) {
    return {
      icon: Smartphone,
      label: 'Teléfono',
      badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
      color: 'text-emerald-500 dark:text-emerald-400',
    };
  }

  return {
    icon: Monitor,
    label: 'Computadora',
    badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800',
    color: 'text-blue-500 dark:text-blue-400',
  };
}

export interface ItemAuditoriaVisual {
  nombre: string;
  cantidad: number;
  precioUnitario?: number;
  subtotal?: number;
  tipo?: 'agregado' | 'devuelto' | 'eliminado' | 'pagado' | 'ajustado' | 'info';
}

/**
 * Extrae los artículos, cantidades y precios involucrados en un registro de auditoría
 */
export function extraerArticulosDeRegistro(reg?: RegistroAuditoria | null): ItemAuditoriaVisual[] {
  if (!reg || !reg.detalles) return [];
  const d = reg.detalles as Record<string, any>;
  const articulos: ItemAuditoriaVisual[] = [];

  // 1. itemsEliminados (productos eliminados de una venta o cuenta)
  if (Array.isArray(d.itemsEliminados) && d.itemsEliminados.length > 0) {
    d.itemsEliminados.forEach((it: any) => {
      articulos.push({
        nombre: it.nombre || it.nombreProducto || 'Producto Eliminado',
        cantidad: Number(it.cantidad) || 1,
        precioUnitario: it.precioUnitario ? Number(it.precioUnitario) : undefined,
        subtotal: it.subtotal ? Number(it.subtotal) : ((Number(it.cantidad) || 1) * (Number(it.precioUnitario) || 0)),
        tipo: 'eliminado' as const,
      });
    });
  } else if (d.productoEliminado) {
    articulos.push({
      nombre: String(d.productoEliminado),
      cantidad: Number(d.cantidad) || 1,
      precioUnitario: d.precioUnitario ? Number(d.precioUnitario) : undefined,
      subtotal: d.subtotal ? Number(d.subtotal) : ((Number(d.cantidad) || 1) * (Number(d.precioUnitario) || 0)),
      tipo: 'eliminado' as const,
    });
  }

  // 2. itemsAgregados (nuevo formato estructurado en ventas y cobros)
  if (Array.isArray(d.itemsAgregados) && d.itemsAgregados.length > 0) {
    d.itemsAgregados.forEach((it: any) => {
      articulos.push({
        nombre: it.nombre || it.nombreProducto || 'Producto',
        cantidad: Number(it.cantidad) || 1,
        precioUnitario: it.precioUnitario ? Number(it.precioUnitario) : undefined,
        subtotal: it.subtotal ? Number(it.subtotal) : ((Number(it.cantidad) || 1) * (Number(it.precioUnitario) || 0)),
        tipo: 'agregado' as const,
      });
    });
  }

  // Si ya tenemos items estructurados (agregados y/o eliminados), retornarlos
  if (articulos.length > 0) return articulos;

  // 3. itemsDevueltos / itemsRevertidos (anulaciones de venta o devoluciones)
  const itemsDev = d.itemsDevueltos || d.itemsRevertidos;
  if (Array.isArray(itemsDev) && itemsDev.length > 0) {
    const esEliminacionDirecta = reg.accion === 'VENTA_ELIMINAR_PRODUCTO' || (reg.titulo || '').toLowerCase().includes('elimin');
    return itemsDev.map((it: any) => ({
      nombre: it.nombre || it.nombreProducto || 'Producto',
      cantidad: Number(it.cantidad) || 1,
      precioUnitario: it.precioUnitario ? Number(it.precioUnitario) : undefined,
      subtotal: it.subtotal ? Number(it.subtotal) : undefined,
      tipo: esEliminacionDirecta ? ('eliminado' as const) : ('devuelto' as const),
    }));
  }

  // 4. items (usado en compras o consumos)
  if (Array.isArray(d.items) && d.items.length > 0) {
    return d.items.map((it: any) => ({
      nombre: it.nombre || it.nombreProducto || 'Producto',
      cantidad: Number(it.cantidad) || 1,
      precioUnitario: it.precioUnitario ? Number(it.precioUnitario) : (it.costoUnitario ? Number(it.costoUnitario) : undefined),
      subtotal: it.subtotal ? Number(it.subtotal) : ((Number(it.cantidad) || 1) * (Number(it.precioUnitario || it.costoUnitario) || 0)),
      tipo: 'info' as const,
    }));
  }

  // 5. consumos (sala de mesas)
  if (Array.isArray(d.consumos) && d.consumos.length > 0) {
    return d.consumos.map((it: any) => ({
      nombre: it.nombreProducto || it.nombre || 'Consumo',
      cantidad: Number(it.cantidad) || 1,
      subtotal: it.total ? Number(it.total) : (it.subtotal ? Number(it.subtotal) : undefined),
      precioUnitario: it.precioUnitario ? Number(it.precioUnitario) : undefined,
      tipo: 'agregado' as const,
    }));
  }

  // 6. productosAjustados (inventario)
  if (Array.isArray(d.productosAjustados) && d.productosAjustados.length > 0) {
    return d.productosAjustados.map((it: any) => ({
      nombre: it.nombre || it.nombreProducto || 'Producto',
      cantidad: Number(it.diferencia) || Number(it.cantidad) || 0,
      tipo: 'ajustado' as const,
    }));
  }

  // 7. itemsPagados (liquidación / cobro)
  if (Array.isArray(d.itemsPagados) && d.itemsPagados.length > 0) {
    return d.itemsPagados.map((it: any) => ({
      nombre: it.nombre || it.nombreProducto || 'Ítem pagado',
      cantidad: 1,
      subtotal: it.monto ? Number(it.monto) : undefined,
      tipo: 'pagado' as const,
    }));
  }

  // 8. producto + cantidad (venta rápida)
  if (d.producto && d.cantidad) {
    return [{
      nombre: String(d.producto),
      cantidad: Number(d.cantidad),
      subtotal: d.total ? Number(d.total) : undefined,
      tipo: 'agregado' as const,
    }];
  }

  return [];
}
