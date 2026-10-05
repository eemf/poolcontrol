'use client';

/**
 * @fileoverview Entry point para todos los servicios de Firebase de la aplicación.
 * Este archivo centraliza las exportaciones de los módulos especializados.
 */

// Helpers y Utilidades
export * from './servicios/utils';

// Gestión de Inventario y Stock
export * from './servicios/stock';
export * from './servicios/historial-inventario';
export * from './servicios/inventario';

// Gestión de Ventas y POS
export * from './servicios/ventas';
export * from './servicios/ventas-historial';

// Gestión de Pagos y Cuentas
export * from './servicios/pagos';
export * from './servicios/cuentas';

// Gestión de Entidades
export * from './servicios/clientes';
export * from './servicios/mesas';
export * from './servicios/tragamonedas';
export * from './servicios/cuadre-tragamonedas';

// Administración
export * from './servicios/cierre-caja';
export * from './servicios/cuadre-semanal';
export * from './servicios/cuadre-mensual';
export * from './servicios/suscripciones';
export * from './servicios/pagos-suscripcion';
export * from './servicios/auditoria';
