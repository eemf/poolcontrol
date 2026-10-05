
/**
 * @fileoverview Definición centralizada de permisos del sistema Pool Control 1.0.
 */

export interface PermissionDefinition {
  key: string;
  label: string;
  description: string;
}

export interface PermissionGroup {
  groupName: string;
  permissions: PermissionDefinition[];
}

export const PERMISSIONS_GROUPS: PermissionGroup[] = [
  {
    groupName: 'Módulos Operativos',
    permissions: [
      { key: 'dashboard.ver', label: 'Ver Dashboard', description: 'Permite el acceso al resumen principal de la sucursal.' },
      { key: 'mesas.ver', label: 'Acceso a Sala de Juegos', description: 'Permite visualizar y operar las mesas y consolas.' },
      { key: 'ventas.pos', label: 'Acceso a Punto de Venta', description: 'Permite usar el buscador y añadir productos a cuentas.' },
      { key: 'tragamonedas.ver', label: 'Acceso a Tragamonedas', description: 'Permite visualizar y operar los movimientos de las máquinas.' },
      { key: 'caja.cerrar', label: 'Realizar Cierre de Caja', description: 'Permite finalizar el turno y liquidar el efectivo.' },
      { key: 'inventario.ver', label: 'Ver Inventario', description: 'Permite visualizar las existencias actuales de productos.' },
    ]
  },
  {
    groupName: 'Funciones de Venta',
    permissions: [
      { key: 'ventas.cobrar', label: 'Cobrar Cuentas', description: 'Permite registrar pagos, abonos y liquidaciones.' },
      { key: 'ventas.anular', label: 'Anular Ventas', description: 'Permite cancelar ventas guardadas y devolver stock.' },
      { key: 'ventas.credito', label: 'Pasar a Crédito', description: 'Permite mover deudas a la sección de cuentas por cobrar.' },
      { key: 'ventas.editar_credito', label: 'Editar Cuentas a Crédito', description: 'Permite modificar los productos de una cuenta que ya ha sido movida a crédito.' },
      { key: 'mesas.consumo', label: 'Gestionar Consumo', description: 'Permite añadir o quitar productos de una sesión activa.' },
      { key: 'mesas.trasladar', label: 'Trasladar Estación', description: 'Permite mover una sesión activa a otra mesa o consola.' },
    ]
  },
  {
    groupName: 'Administración y Reportes',
    permissions: [
      { key: 'admin.monitoreo', label: 'Monitoreo de Período', description: 'Permite auditar pagos y movimientos del turno actual.' },
      { key: 'admin.movimientos', label: 'Movimiento de Productos', description: 'Permite rastrear el historial de entradas y salidas de stock.' },
      { key: 'compras.gestionar', label: 'Gestionar Compras', description: 'Permite registrar entradas de mercadería al inventario.' },
      { key: 'gastos.gestionar', label: 'Gestionar Gastos', description: 'Permite registrar egresos operativos de la sucursal.' },
      { key: 'tragamonedas.cuadre', label: 'Cuadre de Tragamonedas', description: 'Permite realizar el cierre financiero de las máquinas.' },
      { key: 'tragamonedas.historial', label: 'Ver Historial Tragamonedas', description: 'Permite consultar el registro de movimientos de las máquinas.' },
      { key: 'cuadre.semanal', label: 'Cuadre Semanal', description: 'Permite consolidar ingresos y egresos de la semana.' },
      { key: 'cuadre.mensual', label: 'Cuadre Mensual', description: 'Permite generar el cierre consolidado del mes.' },
      { key: 'inventario.revisar', label: 'Hacer Revisión Inventario', description: 'Permite realizar el conteo físico y ajustes de stock.' },
      { key: 'ventas.eliminar_rango', label: 'Mantenimiento de Ventas', description: 'Permite eliminar registros de ventas por rango (Admin).' },
      { key: 'admin.auditoria', label: 'Auditoría de Usuarios', description: 'Permite consultar la bitácora completa de acciones y transacciones por usuario.' },
      { key: 'sucursales.saltar', label: 'Navegación Multisucursal', description: 'Permite cambiar de sucursal rápidamente (Gerencia Global).' },
    ]
  },
  {
    groupName: 'Catálogos y Mantenimiento',
    permissions: [
      { key: 'mant.clientes', label: 'Gestionar Clientes', description: 'Permite administrar el padrón de clientes y proveedores.' },
      { key: 'config.productos', label: 'Catálogo de Productos', description: 'Permite crear y editar productos físicos y recetas.' },
      { key: 'mant.productos_virt', label: 'Productos Virtuales', description: 'Permite gestionar servicios y monedas virtuales.' },
      { key: 'mant.roles', label: 'Gestionar Roles', description: 'Permite crear y editar los perfiles de acceso (Admin).' },
      { key: 'mant.pagos', label: 'Historial de Pagos', description: 'Permite consultar el registro histórico de cobros.' },
      { key: 'mant.cuentas', label: 'Cuentas Financieras', description: 'Permite administrar las cuentas de efectivo y bancos.' },
    ]
  },
  {
    groupName: 'Configuración de Sistema',
    permissions: [
      { key: 'config.usuarios', label: 'Control de Usuarios', description: 'Permite administrar el personal con acceso al sistema.' },
      { key: 'config.permisos', label: 'Asignar Permisos', description: 'Permite otorgar privilegios a roles y usuarios.' },
      { key: 'config.mesas', label: 'Configurar Estaciones', description: 'Permite definir las mesas, consolas y sus tarifas.' },
      { key: 'config.tragamonedas', label: 'Configurar Máquinas', description: 'Permite dar de alta y configurar tragamonedas.' },
      { key: 'pruebas.ver', label: 'Acceso a Pruebas', description: 'Permite ver los modelos y páginas de prueba de la aplicación.' },
    ]
  }
];

export const ALL_PERMISSION_KEYS = PERMISSIONS_GROUPS.flatMap(g => g.permissions.map(p => p.key));
