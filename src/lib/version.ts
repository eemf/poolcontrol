export interface ReleaseItem {
  version: string;
  build: number;
  fecha: string;
  estado: 'publicada_actual' | 'publicada_anterior' | 'archivada';
  tipo: 'Mayor' | 'Menor' | 'Parche' | 'Compilación';
  tagGit?: string;
  descripcion: string;
  cambios?: string[];
}

export const releaseHistory: ReleaseItem[] = [
  {
    version: "2.0.0",
    build: 245,
    fecha: "2026-11-20",
    estado: "publicada_actual",
    tipo: "Compilación",
    tagGit: "v2.0.0-b245",
    descripcion: "Pago anticipado en Sala de Juegos para cobrar tiempo o consumos sin liberar la mesa o consola.",
    cambios: [
      "Servicios de Mesas (`servicios/mesas.ts`): Añadida transacción `procesarPagoAnticipadoMesa` que liquida tiempo definido, consumos o ambos manteniendo el estado `ocupado` y el reloj en marcha, y ajustado `procesarVentaTiempoDeMesa` para cierres posteriores.",
      "Cobro de Mesa (`billing-dialog.tsx`, `use-mesas.ts`, `mesas-dialogs.tsx`): Añadida pestaña `Anticipado` con selección de concepto (`Ambos`, `Solo Tiempo`, `Solo Consumos`) y pago en Efectivo o Tarjeta sin liberar la estación."
    ]
  },
  {
    version: "2.0.0",
    build: 244,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b244",
    descripcion: "Corregido cierre automático del modal de Cliente con Deuda Activa al confirmar venta en POS.",
    cambios: [
      "Punto de Venta (`use-ventas.ts`): Añadido `setAlertaClienteConCreditoAbierta(false)` en el bloque `finally` de `procederAGuardarVenta` para cerrar el modal tras confirmar continuar la venta."
    ]
  },
  {
    version: "2.0.0",
    build: 243,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b243",
    descripcion: "Habilitada la opción Tamaño de Fuente para todos los perfiles sin restricciones de permisos.",
    cambios: [
      "Menú Principal (`client-dashboard-nav.tsx`): Removida la restricción de permisos en el grupo `Configuraciones` (manteniendo permisos por subopción) y en `Tamaño de Fuente` para que aparezca en todos los perfiles.",
      "Preferencia de Fuente (`use-preferencia-fuente.ts`): Respaldo local garantizado incluso para roles sin permisos de escritura en documentos de usuario."
    ]
  },
  {
    version: "2.0.0",
    build: 242,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b242",
    descripcion: "Nueva página configurable de Tamaño de Fuente por usuario en Configuraciones.",
    cambios: [
      "Configuraciones (`configuraciones/apariencia/page.tsx`, `_hooks/use-preferencia-fuente.ts`, `client-dashboard-nav.tsx`): Añadida página `Tamaño de Fuente` con 4 tamaños predefinidos, ajuste fino de 90% a 130%, vista previa en vivo y persistencia por usuario.",
      "Sincronización Global (`user-font-scale-sync.tsx`, `src/app/layout.tsx`): Aplica la escala de fuente del usuario en toda la aplicación desde caché local y Firestore (`preferencias.escalaFuente`)."
    ]
  },
  {
    version: "2.0.0",
    build: 241,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b241",
    descripcion: "Corrección global de modales con teclado virtual en móvil evitando solapamiento de botones.",
    cambios: [
      "Manejador de Teclado y Diálogos (`mobile-keyboard-handler.tsx`, `dialog.tsx`): Sincronización dinámica de `--app-vv-height` y `--app-vv-offset-top` con `visualViewport` para ajustar y desplazar todos los modales por encima del teclado móvil sin amontonar botones.",
      "Modal de Compras (`purchase-modal.tsx`): Corregido flujo flex en móvil (`max-md:flex-none`) para que el pie (`Cancelar` / `Finalizar Registro`) nunca se superponga sobre los campos del formulario."
    ]
  },
  {
    version: "2.0.0",
    build: 240,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b240",
    descripcion: "Eliminada la sección temporal de Pruebas tras aplicar el icono oficial.",
    cambios: [
      "Menú Principal y Rutas (`client-dashboard-nav.tsx`, `src/app/dashboard/pruebas`): Removido el grupo `Pruebas` del menú y eliminada la carpeta temporal `pruebas/estilo-icono-app`."
    ]
  },
  {
    version: "2.0.0",
    build: 239,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b239",
    descripcion: "Aplicado el nuevo icono oficial Bola 8 Minimalista (40px sin fondo) en la aplicación, barra del cliente y Dashboard Maestro.",
    cambios: [
      "Icono Oficial (`bola-billar-icon.tsx`, `src/app/icon.svg`): Actualizado al diseño `Bola 8 Minimalista` con halo celeste para pestaña del navegador e icono global.",
      "Barras Superiores (`header.tsx`, `admin-header.tsx`): Actualizado el tamaño a `40px` (`h-10 w-10`) sin caja de fondo tanto en Pool Control como en Admin Panel."
    ]
  },
  {
    version: "2.0.0",
    build: 238,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b238",
    descripcion: "Aumentado tamaño de los iconos de prueba sin caja de fondo en Estilo de Icono de Aplicación.",
    cambios: [
      "Pruebas (`pruebas/estilo-icono-app/page.tsx`): Eliminada la caja de fondo del icono en la vista previa y tarjetas, aumentando el tamaño a `40px` en barra superior, `20px` en pestaña y `56px` en tarjetas."
    ]
  },
  {
    version: "2.0.0",
    build: 237,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b237",
    descripcion: "Añadidos 2 diseños vectoriales basados en el emblema oficial de Billares M&M en Pruebas.",
    cambios: [
      "Pruebas (`pruebas/estilo-icono-app`): Añadidas las propuestas `6. Emblema Rey M&M (Original)` en rojo/negro/blanco y `7. Emblema Rey M&M (Tema 2.0)` adaptado a los tonos celestes del tema."
    ]
  },
  {
    version: "2.0.0",
    build: 236,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b236",
    descripcion: "Nuevo grupo de menú Pruebas con galería comparativa de 5 estilos de icono de billar.",
    cambios: [
      "Menú Principal (`client-dashboard-nav.tsx`): Añadido grupo `Pruebas` con la opción `Estilo de Icono de Aplicación`.",
      "Pruebas (`pruebas/estilo-icono-app/page.tsx`, `_components/IconosBillarGaleria.tsx`): Creada página comparativa con 5 iconos SVG de billar (Bola 8 Minimalista, Triángulo Rack, Tacos Cruzados, Mesa Vista Cenital y Bola 9 Moderna) y vista previa en vivo en barra superior y pestaña."
    ]
  },
  {
    version: "2.0.0",
    build: 235,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b235",
    descripcion: "Fase 5 de optimización del Dashboard Cliente: unificación de listeners en Núcleo Operativo y límite en historial de ajustes.",
    cambios: [
      "Dashboard (`use-dashboard.ts`): Unificadas las consultas de ventas semanal y mensual en un solo listener `ventasRangoQuery` (reduciendo a la mitad las lecturas de `ventas`) y añadido `limit(12)` en `cuadre_mensual`.",
      "Historial de Inventario (`use-historial-ajustes.ts`): Añadido `limit(50)` incremental para evitar descargas completas.",
      "Cierre de Caja, Tragamonedas, Mesas y Ventas (`_hooks/*`): Añadida documentación JSDoc de arquitectura y flujos transaccionales."
    ]
  },
  {
    version: "2.0.0",
    build: 234,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b234",
    descripcion: "Fase 4 de optimización del Dashboard Cliente: carga condicional por pestaña en Reportes y estandarización de Depuración.",
    cambios: [
      "Monitoreo Integral (`use-monitoreo-integral.ts`): Suscripción condicional a `pagos`, `historial_inventario`, `productos` y `historial` según la pestaña activa, evitando lecturas innecesarias al abrir el módulo.",
      "Auditoría (`use-auditoria.ts`) y Eliminación de Ventas (`eliminacion-ventas/page.tsx`, `use-eliminacion-ventas.ts`): Añadido `<SurfaceCard variant=\"panel\">`, `<BotonVolverArriba />` y documentación JSDoc."
    ]
  },
  {
    version: "2.0.0",
    build: 233,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b233",
    descripcion: "Fase 3 de optimización del Dashboard Cliente: modularización y documentación completa de Mantenimiento.",
    cambios: [
      "Clientes, Productos Virtuales y Roles (`clientes/_hooks/use-clientes.ts`, `productos-virtuales/_hooks/use-productos-virtuales.ts`, `roles/_hooks/use-roles.ts`): Extraída toda la lógica de Firestore, formularios y paginación a hooks dedicados.",
      "Promociones y Cuentas (`promociones`, `cuentas`): Añadida documentación JSDoc en páginas y hooks."
    ]
  },
  {
    version: "2.0.0",
    build: 232,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b232",
    descripcion: "Fase 2 de optimización del Dashboard Cliente: historiales acotados y modularización en Administración.",
    cambios: [
      "Compras (`compras/_hooks/use-compras.ts`) y Gastos (`gastos/page.tsx`, `_hooks/use-gastos.ts`): Extraído hook dedicado en Gastos y optimizadas consultas Firestore para cargar solo pendientes por defecto o últimos 50 registros históricos.",
      "Traslados (`traslados/_hooks/use-traslados.ts`, `detalle-traslado-dialog.tsx`): Acotadas consultas de traslados (`limit(100)`) y compras recientes (`limit(50)`), y reemplazada tabla HTML por tarjetas responsivas.",
      "Cuadre Tragamonedas y Mensual (`cuadre-tragamonedas/page.tsx`, `historial/_hooks/*`, `cuadre-mensual/_hooks/use-cuadre-mensual.ts`): Añadido `limit(50)` incremental en historiales, filtro `estadoMensual == 'pendiente'` en Firestore, `<SurfaceCard variant=\"panel\">` y documentación JSDoc."
    ]
  },
  {
    version: "2.0.0",
    build: 231,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b231",
    descripcion: "Fase 1 de optimización del Dashboard Cliente: correcciones visuales críticas, historiales con límite y refactorización de Configuraciones.",
    cambios: [
      "Mesas (`mesas-dialogs.tsx`): Reemplazado `#141414` por `#1e1e1e` cumpliendo la paleta oficial de 3 capas.",
      "Cuadre Semanal (`cuadre-semanal/_components/*`, `historial/_hooks/use-historial-cuadre-semanal.ts`): Migrados badges claros y clases `uppercase` a paleta oscura oficial, añadido `limit(50)` con carga incremental en historial y documentación completa.",
      "Acerca del Sistema (`configuraciones/acerca-de/page.tsx`): Estandarizado con `<PageHeader>`, `<SurfaceCard>`, tarjetas `#252526`, `<Paginacion>` para historial de versiones y `<BotonVolverArriba>`.",
      "Permisos (`configuraciones/permisos/page.tsx`, `_hooks/use-permisos-config.ts`) y Tragamonedas (`configuraciones/tragamonedas`): Extraída lógica a hook dedicado y añadida documentación JSDoc en español."
    ]
  },
  {
    version: "2.0.0",
    build: 230,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b230",
    descripcion: "Métricas principales integradas en la barra superior del Admin Panel.",
    cambios: [
      "Admin Header (`src/app/components/admin-header.tsx`): Añadidas píldoras de métricas en tiempo real en la barra superior (Sucursales, Suscripciones activas, MRR, Comandos de voz y alertas Por atender) adaptadas a escritorio y móvil."
    ]
  },
  {
    version: "2.0.0",
    build: 229,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b229",
    descripcion: "Implementación de métricas globales en tiempo real en el Dashboard Maestro.",
    cambios: [
      "Dashboard Maestro (`admin-success/page.tsx`, `_hooks/use-dashboard-maestro.ts`, `_components/MetricasMaestro.tsx`): Añadidas tarjetas KPI en tiempo real (sucursales registradas, suscripciones activas, ingreso mensual activo/proyectado MRR y usuarios globales), tabla de estado por sucursal y distribución de planes."
    ]
  },
  {
    version: "2.0.0",
    build: 228,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b228",
    descripcion: "Unificación de colores del menú lateral e icono de Admin Panel.",
    cambios: [
      "Admin Nav y Header (`admin-dashboard-nav.tsx`, `admin-header.tsx`): Aplicados colores temáticos e iconos de color en el menú lateral (`variant=\"default\"` activo y `hover:bg-primary/10`), reemplazado icono de escudo por `BolaBillarIcon` en Admin Panel y adaptado el centro de notificaciones a la paleta oscura oficial."
    ]
  },
  {
    version: "2.0.0",
    build: 227,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b227",
    descripcion: "Estandarización visual del Dashboard Maestro con el Design System oficial.",
    cambios: [
      "Dashboard Maestro (`admin-success/page.tsx`): Aplicado `<PageHeader>`, `<SurfaceCard variant=\"panel\">`, tarjetas en `#252526` con iconos circulares translúcidos, botones en píldora `h-9`, módulo de Suscripciones integrado y `<BotonVolverArriba>`."
    ]
  },
  {
    version: "2.0.0",
    build: 226,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b226",
    descripcion: "Refactorización y estandarización visual completa de Gestión de Suscripciones.",
    cambios: [
      "Suscripciones (`admin-success/suscripciones/page.tsx`, `_hooks/use-suscripciones-admin.ts`, `_components/ListaSuscripciones.tsx`, `_components/ModalesSuscripcion.tsx`): Extraída lógica a hook dedicado, aplicado `<PageHeader>`, `<SurfaceCard variant=\"panel\">`, `<PillTabs>` con buscador y filtro de estado (`Todas`, `Activas`, `Por atender`), tarjetas en `#252526`/`#1e1e1e` con barra de acciones en píldora, modales oscuros estándar, `<ModalConfirmacion>` y `<BotonVolverArriba>`."
    ]
  },
  {
    version: "2.0.0",
    build: 225,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b225",
    descripcion: "Refactorización y estandarización visual completa de Gestión de Usuarios (Maestro).",
    cambios: [
      "Usuarios Maestro (`admin-success/usuarios/page.tsx`, `_hooks/use-usuarios-maestro.ts`, `_components/ListaUsuariosMaestro.tsx`, `_components/ModalUsuarioMaestro.tsx`): Extraída lógica a hook dedicado, aplicado `<PageHeader>`, `<SurfaceCard variant=\"panel\">`, `<PillTabs>` con buscador, filtro por alcance (`Todos`, `Multi-sucursal`, `Solo base`) y selector de sucursal integrado en `Opciones` en móvil, acordeones en `#252526`/`#1e1e1e`, modal estándar, `<ModalConfirmacion>` y `<BotonVolverArriba>`."
    ]
  },
  {
    version: "2.0.0",
    build: 224,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b224",
    descripcion: "Rediseño ejecutivo y modular de las tarjetas de sucursal en Gestión de Sucursales.",
    cambios: [
      "SucursalCard (`admin-success/sucursales/_components/SucursalCard.tsx`, `page.tsx`): Extraída tarjeta dedicada con badge de ID `#X`, fila de conteo de módulos habilitados (`activos / total`), fila de comandos de voz con estado y `<Switch>`, y barra inferior equilibrada con `Editar`, `Eliminar` e `Ingresar`."
    ]
  },
  {
    version: "2.0.0",
    build: 223,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b223",
    descripcion: "Refactorización y estandarización visual completa de Gestión de Sucursales (Admin).",
    cambios: [
      "Sucursales Admin (`admin-success/sucursales/page.tsx`, `_hooks/use-sucursales-admin.ts`, `_components/ModalSucursal.tsx`): Extraída lógica a hook dedicado, aplicado `<PageHeader>`, `<SurfaceCard variant=\"panel\">`, `<PillTabs>` con buscador y filtros por voz (`Todas`, `Con voz`, `Sin voz`) con `Opciones` en móvil, tarjetas en `#252526`/`#1e1e1e`, `<ModalSucursal>` con paleta oficial y agregado switch de `Gestión de Promociones`, `<ModalConfirmacion>` y `<BotonVolverArriba>`."
    ]
  },
  {
    version: "2.0.0",
    build: 222,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b222",
    descripcion: "Estandarización visual y de controles en Dashboard Maestro.",
    cambios: [
      "Dashboard Maestro (`admin-success/page.tsx`, `dashboard/configuraciones/master/page.tsx`): Aplicado `<PageHeader>`, `<SurfaceCard variant=\"panel\">`, tarjetas en `#252526` con bordes `#2e2e2e`, iconos circulares translúcidos y botones píldora `bg-sky-600 hover:bg-sky-500 h-9`."
    ]
  },
  {
    version: "2.0.0",
    build: 221,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b221",
    descripcion: "Actualización del título de la aplicación a Pool Control 2.0 y nuevo favicon SVG de bola 8.",
    cambios: [
      "App (`layout.tsx`, `icon.svg`): Cambiado el título global de `Pool Control 1.0` a `Pool Control 2.0` y reemplazado `favicon.ico` por `icon.svg` con el icono de bola 8 de billar."
    ]
  },
  {
    version: "2.0.0",
    build: 220,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b220",
    descripcion: "Rediseño nítido de BolaBillarIcon (bola 8 sólida con ventana blanca y número 8 definido).",
    cambios: [
      "Comunes (`bola-billar-icon.tsx`): Rediseñado el SVG como bola 8 rellena con reflejo sutil, ventana circular clara (`#f8fafc`) y número 8 nítido de alto contraste (`#121212`) legible en tamaños pequeños."
    ]
  },
  {
    version: "2.0.0",
    build: 219,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b219",
    descripcion: "Icono personalizado de bola de billar (8) para el logo principal y selector de sucursal.",
    cambios: [
      "Comunes & Navegación (`bola-billar-icon.tsx`, `header.tsx`, `client-dashboard-nav.tsx`): Creado `<BolaBillarIcon />` (bola 8 de billar) y aplicado en el logo de Pool Control (escritorio y móvil) y en el selector de sucursal."
    ]
  },
  {
    version: "2.0.0",
    build: 218,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b218",
    descripcion: "Nombre de sucursal bajo el título y versión/build al pasar o hacer clic en el logo.",
    cambios: [
      "Header & Navegación (`header.tsx`, `client-dashboard-nav.tsx`): Reemplazada la etiqueta de versión/build bajo `Pool Control` por el nombre de la sucursal activa (`sucursalData.nombre`), moviendo la información de versión/build al hover (`<Tooltip>`) y clic (`Acerca del Sistema`) del logo."
    ]
  },
  {
    version: "2.0.0",
    build: 217,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b217",
    descripcion: "Centrado exacto de los iconos del menú principal cuando la barra lateral está plegada.",
    cambios: [
      "Navegación (`client-dashboard-nav.tsx`): Ajustado el padding horizontal de los ítems de nivel superior a `px-2.5` (`10px`) y del selector de sucursal plegado a `px-1` (`4px`) para centrar exactamente los iconos dentro de `3.5rem` (`56px`) sin saltos durante la animación."
    ]
  },
  {
    version: "2.0.0",
    build: 216,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b216",
    descripcion: "Eliminación de montaje/desmontaje de Tooltips y saltos horizontales al plegar el menú.",
    cambios: [
      "Navegación (`client-dashboard-nav.tsx`): Eliminado el intercambio de `<Tooltip>` al plegar para evitar bloqueos de renderizado en el hilo principal, fijada la alineación izquierda de los iconos (`justify-start`) con desvanecimiento suave de etiquetas (`opacity-0`) para un pliegue fluido."
    ]
  },
  {
    version: "2.0.0",
    build: 215,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b215",
    descripcion: "Optimización de animaciones de despliegue y pliegue del menú lateral y submenús.",
    cambios: [
      "Sidebar & Navegación (`sidebar.tsx`, `client-dashboard-nav.tsx`): Reemplazado `transition-all duration-300` por `transition-colors duration-150` en ítems para eliminar lag de reflujo al plegar, optimizada la transición del contenedor (`duration-200 will-change-[width]`) y activada animación suave (`animate-collapsible-down` / `animate-collapsible-up`) en submenús y selector móvil de sucursal."
    ]
  },
  {
    version: "2.0.0",
    build: 214,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b214",
    descripcion: "Corrección de ReferenceError en NavItem y homologación de píldoras de resumen en la barra superior.",
    cambios: [
      "Navegación (`client-dashboard-nav.tsx`): Corregido `!isTriggerActive` por `!isParentActive` en la vista colapsada del menú.",
      "Header (`header.tsx`): Reemplazado `dark:bg-slate-700` por `bg-[#252526] border border-[#2e2e2e]` en las píldoras de monedas y caja, y ajustados los colores de contraste (`-400`)."
    ]
  },
  {
    version: "2.0.0",
    build: 213,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b213",
    descripcion: "Eliminada la línea vertical en submenús e iconos con color en el menú principal.",
    cambios: [
      "Navegación (`client-dashboard-nav.tsx`): Eliminada `border-l-2 border-muted/50` de los submenús desplegables y agregados colores distintivos (`iconColor`) a los iconos del menú principal y submenús cuando están inactivos."
    ]
  },
  {
    version: "2.0.0",
    build: 212,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b212",
    descripcion: "Sincronización dinámica de appVersion con releaseHistory[0] y publicación en rama v2.0.",
    cambios: [
      "Versionado (`version.ts`): `appVersion.version`, `appVersion.build` y `appVersion.date` ahora leen dinámicamente de `releaseHistory[0]` para reflejar siempre el build actual (Build 212)."
    ]
  },
  {
    version: "2.0.0",
    build: 211,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b211",
    descripcion: "Indicador visual de promoción aplicada en toast, última acción, movimientos del turno y auditoría de Venta Rápida.",
    cambios: [
      "Venta Rápida (`quick-dispatch-input.tsx`, `servicios/ventas.ts`, `movimiento-pos.ts`, `use-ventas.ts`, `dialogo-ultimos-movimientos.tsx`): Mostrado el nombre de la promoción en el título del toast, en la descripción de `pos:accion-reciente`, en la bitácora de auditoría y como badge verde en `Últimos Movimientos del Turno`."
    ]
  },
  {
    version: "2.0.0",
    build: 210,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b210",
    descripcion: "Aplicación automática de promociones vigentes en Venta Rápida (F8 / barra superior).",
    cambios: [
      "Venta Rápida (`servicios/ventas.ts`, `quick-dispatch-input.tsx`): Evaluada automáticamente la mejor promoción vigente en `procesarVentaRapidaConId` (con carga en tiempo real desde `QuickDispatchInput` y respaldo en Firestore), descontando el stock real entregado (`comando.cantidad`) y cobrando el subtotal promocional."
    ]
  },
  {
    version: "2.0.0",
    build: 209,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b209",
    descripcion: "Promociones Fase 4: Integración en Punto de Venta (POS).",
    cambios: [
      "Promociones Fase 4 (`ventas/_hooks/use-ventas.ts`, `ventas/_components/pos-cart.tsx`): Suscripción en tiempo real a `promociones`, badge de promoción en el selector de productos, evaluación automática al agregar/quitar ítems pendientes en el carrito sin alterar el descuento real de inventario ni los precios base del catálogo, y visualización del ahorro y etiqueta de promoción en el carrito."
    ]
  },
  {
    version: "2.0.0",
    build: 208,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b208",
    descripcion: "Promociones Fase 3: Módulo completo de Gestión de Promociones.",
    cambios: [
      "Promociones Fase 3 (`/dashboard/mantenimiento/promociones`): Creado hook `use-promociones.ts`, `<EncabezadoPromociones>`, `<ListaPromociones>` (filtros por estado y tipo, buscador, acordeones con switch rápido, paginación), `<ModalPromocion>` (reglas NxM, precio especial, combo, porcentaje, selector múltiple de productos y vigencia opcional), `<ModalConfirmacion>` y `<BotonVolverArriba>`."
    ]
  },
  {
    version: "2.0.0",
    build: 207,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b207",
    descripcion: "Promociones Fase 2: Motor puro de cálculo de promociones.",
    cambios: [
      "Promociones Fase 2 (`src/lib/promociones/calcular-promociones.ts`): Implementado motor de evaluación de vigencia (`esPromocionVigente`), cálculo individual (`evaluarPromocionItem`) y carrito con soporte NxM combinable (`calcularPromocionesCarrito`) para reglas 2x1/NxM, precio especial, combos y porcentaje."
    ]
  },
  {
    version: "2.0.0",
    build: 206,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b206",
    descripcion: "Promociones Fase 1: Tipos base, permiso y enlace en navegación.",
    cambios: [
      "Promociones Fase 1 (`tipos.ts`, `permisos.ts`, `client-dashboard-nav.tsx`): Definidos `TipoPromocion`, `VigenciaPromocion`, `Promocion` y campos opcionales `precioOriginal` / `promocionAplicada` en `DetalleVenta`; añadido permiso `mant.promociones` y enlace `Promociones` en el menú de Mantenimiento."
    ]
  },
  {
    version: "2.0.0",
    build: 205,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b205",
    descripcion: "Apertura lateral derecha y mayor elevación para el selector de sucursales en escritorio.",
    cambios: [
      "Navegación (`client-dashboard-nav.tsx`): Configurado el `DropdownMenuContent` de escritorio con `side=\"right\" align=\"end\" sideOffset={10}`, borde `border-[#3c3c3c]` y sombra profunda para desplegarse fuera de la barra lateral sin superponerse al menú principal."
    ]
  },
  {
    version: "2.0.0",
    build: 204,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b204",
    descripcion: "Contraste y diferenciación visual del menú selector de sucursales en la barra lateral.",
    cambios: [
      "Navegación (`client-dashboard-nav.tsx`): Estilizado el menú desplegable y colapsable de `Cambiar de sucursal` con superficie elevada `bg-[#252526]`, borde visible `border-[#383838]`, separador `#2e2e2e`, elemento activo resaltado en `sky-600/20` con badge `Activa` y hover `#313131`."
    ]
  },
  {
    version: "2.0.0",
    build: 203,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b203",
    descripcion: "Texto visible 'Historial' en el botón de historial en vista móvil de Cierre de Caja.",
    cambios: [
      "Cierre de Caja (`cierre-caja/page.tsx`): Mostrado el texto `Historial` junto al icono en el botón de encabezado para vista móvil (`sm:hidden`) manteniendo `Historial de Cierres` en escritorio."
    ]
  },
  {
    version: "2.0.0",
    build: 202,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b202",
    descripcion: "Eliminación efectiva de la barra de scroll visual en vista móvil incluyendo .custom-scrollbar.",
    cambios: [
      "Global (`globals.css`): Añadido `.custom-scrollbar` y `!important` dentro de `@media (max-width: 767px)` para suprimir por completo la barra de scroll en modales y páginas en vista móvil sin afectar el desplazamiento."
    ]
  },
  {
    version: "2.0.0",
    build: 201,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b201",
    descripcion: "Corrección de colores, líneas y espaciado de scroll en DialogoUltimosMovimientos.",
    cambios: [
      "Ventas (`dialogo-ultimos-movimientos.tsx`): Eliminadas las líneas divisorias en encabezado y pie, reemplazado `bg-[#141414]` por `bg-[#252526]` en las tarjetas de movimientos, botón `Cerrar` homologado (`h-9 hover:bg-[#313131]`) y restaurado `sm:pr-1` en el listado para mantener el ancho original en escritorio."
    ]
  },
  {
    version: "2.0.0",
    build: 200,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b200",
    descripcion: "Ocultamiento de scrollbars visuales en vista móvil y margen en escritorio.",
    cambios: [
      "Global (`globals.css`, `dialogo-ultimos-movimientos.tsx`): Ocultada la barra de scroll visual en pantallas móviles (`max-width: 767px`) manteniendo el desplazamiento táctil/rueda fluido, y ajustado `sm:pr-2` en el listado del modal de últimos movimientos en escritorio."
    ]
  },
  {
    version: "2.0.0",
    build: 199,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b199",
    descripcion: "Eliminadas las líneas divisorias del encabezado y pie en los modales de Base y Extracción.",
    cambios: [
      "Gestión Tragamonedas (`modal-operacion-maquina.tsx`): Removidos `border-b border-[#2e2e2e]` de `<DialogHeader>` y `border-t border-[#2e2e2e]` de `<DialogFooter>` para coincidir con el diseño estándar aprobado."
    ]
  },
  {
    version: "2.0.0",
    build: 198,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b198",
    descripcion: "Eliminación de las páginas y sección de navegación de Pruebas.",
    cambios: [
      "Pruebas (`src/app/dashboard/pruebas`, `client-dashboard-nav.tsx`, `permisos.ts`): Eliminado el directorio completo de páginas de pruebas, la sección `Pruebas` del menú lateral y el permiso `pruebas.ver`."
    ]
  },
  {
    version: "2.0.0",
    build: 197,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b197",
    descripcion: "Estandarización completa de Configuración de Tragamonedas y sus modales.",
    cambios: [
      "Tragamonedas (`page.tsx`, `tragamonedas-card.tsx`, `tragamonedas-dialog.tsx`, `eliminar-maquina-dialog.tsx`): Integrado `<PillTabs>` con buscador, filtros por estado (`Todas`, `Activas`, `Mant.`, `Inactivas`) y `Opciones` en móvil dentro de `<SurfaceCard variant=\"panel\">`, compactadas las tarjetas en `#252526` sin caja vacía ni franja oscura, añadido `<BotonVolverArriba>` y homologados los botones del modal (`bg-sky-600`, `h-9`)."
    ]
  },
  {
    version: "2.0.0",
    build: 196,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b196",
    descripcion: "Alineación de etiquetas en el modal de Estación.",
    cambios: [
      "MesaDialog (`mesa-dialog.tsx`): Unificada la clase del `<Label>` de `Tarifa asignada*` (`text-xs font-medium ml-1 text-slate-200 block`) con `Tipo de estación` para alinear ambos selectores a la misma altura."
    ]
  },
  {
    version: "2.0.0",
    build: 195,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b195",
    descripcion: "Uso de InputNumero sin flechas de incremento en modales de Estaciones y Tarifas.",
    cambios: [
      "Mesas (`mesa-dialog.tsx`, `tarifa-dialog.tsx`): Reemplazado `<Input type=\"number\">` por `<InputNumero>` en el número de estación y campos numéricos de tarifas para ocultar los controles de subir/bajar y evitar cambios accidentales con scroll o flechas."
    ]
  },
  {
    version: "2.0.0",
    build: 194,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b194",
    descripcion: "Reestructuración de contenedores y modales estándar en Estaciones y Tarifas.",
    cambios: [
      "Mesas (`page.tsx`, `mesa-card.tsx`, `tarifa-card.tsx`, `mesa-dialog.tsx`, `tarifa-dialog.tsx`): Integrado `<PillTabs>` con buscador dentro de `<SurfaceCard variant=\"panel\">`, corregido contraste de badges (`white` en pestaña activa), eliminada la franja oscura del pie en tarjetas, agregado `<BotonVolverArriba>` y homologados ambos modales (`flex-col max-h-[90vh]`, selects en `#1e1e1e`, prefijo `Q` y botones `h-9`)."
    ]
  },
  {
    version: "2.0.0",
    build: 193,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b193",
    descripcion: "Estandarización visual y de controles en Permisos, Mesas y Tragamonedas.",
    cambios: [
      "Permisos (`page.tsx`, `EncabezadoPermisos.tsx`, `ListadoRoles.tsx`, `SeccionPersonal.tsx`, `ModalRol.tsx`): Aplicado `<PageHeader>`, `<SurfaceCard variant=\"panel\">`, `<PillTabs>` con `<CountBadge>`, acordeones en `#252526`/`#1e1e1e`, `<ModalConfirmacion>`, `<BotonVolverArriba>` y modal con paleta oficial y encabezado circular.",
      "Mesas & Tragamonedas (`mesa-card.tsx`, `tarifa-card.tsx`, `mesa-dialog.tsx`, `tarifa-dialog.tsx`, `tragamonedas-card.tsx`): Homologadas tarjetas (`#252526`/`#1e1e1e`, botones píldora `Editar` y `Eliminar` `h-8`) y modales (`MesaDialog`, `TarifaDialog`) con encabezado de icono circular y pie en una sola fila (`h-9`)."
    ]
  },
  {
    version: "2.0.0",
    build: 192,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b192",
    descripcion: "Botón de contraseña compacto solo con icono en vista móvil dentro de acordeones de Usuarios.",
    cambios: [
      "ListaUsuarios (`ListaUsuarios.tsx`): Ocultado el texto `Contraseña` en móvil (`hidden sm:inline`), dejando solo el icono `KeyRound` circular (`h-8 w-8`) y `flex-nowrap` para mantener los 3 botones de acción en una sola línea."
    ]
  },
  {
    version: "2.0.0",
    build: 191,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b191",
    descripcion: "Simplificación de DialogoCambiarPassword sin envío de enlace y con pie en una sola fila.",
    cambios: [
      "Usuarios (`DialogoCambiarPassword.tsx`): Eliminada la opción de enviar enlace de restablecimiento por correo y alineados los botones `Cerrar` (izquierda) y `Guardar` (derecha) en una sola fila dentro del pie del modal."
    ]
  },
  {
    version: "2.0.0",
    build: 190,
    fecha: "2026-11-20",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b190",
    descripcion: "Estandarización visual y de controles en DialogoCambiarPassword.",
    cambios: [
      "Usuarios (`DialogoCambiarPassword.tsx`): Aplicado fondo oficial `#1e1e1e`, borde `#2e2e2e`, icono circular `KeyRound` (`sky-400`), inputs en `#252526`, alerta de error en `rose-500/15`, botones píldora `h-9` y separador sin `bg-background` ni mayúsculas sostenidas."
    ]
  },
  {
    version: "2.0.0",
    build: 189,
    fecha: "2026-11-19",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b189",
    descripcion: "Estandarización visual y de controles en Gestión de Usuarios.",
    cambios: [
      "Usuarios (`page.tsx`, `use-usuarios-sucursal.ts`, `EncabezadoUsuarios.tsx`, `ListaUsuarios.tsx`, `ModalUsuario.tsx`): Aplicado `<SurfaceCard variant=\"panel\">`, `<PillTabs>` con buscador, ordenamiento (`A-Z`, `Z-A`, `Por rol`) y `Opciones` en móvil, acordeones con paleta `#1e1e1e`/`#252526`/`#2e2e2e`, `<Paginacion>`, `<BotonVolverArriba>` y modal con encabezado circular y controles estándar."
    ]
  },
  {
    version: "2.0.0",
    build: 188,
    fecha: "2026-11-19",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b188",
    descripcion: "Estandarización visual y de controles en Gestión de Roles y Cuentas Financieras.",
    cambios: [
      "Roles (`page.tsx`, `EncabezadoRoles.tsx`, `ListaRoles.tsx`, `ModalRol.tsx`, `DialogoEliminarRol.tsx`): Aplicado `<PageHeader>`, `<SurfaceCard variant=\"panel\">`, `<PillTabs>` con buscador, ordenamiento y botón `Opciones` en móvil, `<Paginacion>`, `<BotonVolverArriba>` y modales con paleta `#1e1e1e`/`#252526`/`#2e2e2e`.",
      "Cuentas (`page.tsx`, `cuenta-card.tsx`, `modal-cuenta.tsx`, `dialogo-eliminar-cuenta.tsx`): Integrado `<SurfaceCard variant=\"panel\">` con `<PillTabs>` (filtro por tipo `Todas`/`Efectivo`/`Bancaria` + buscador y `Opciones` en móvil), `<BotonVolverArriba>`, tarjetas con bordes `#2e2e2e` y modal con encabezado circular y prefijo `Q`."
    ]
  },
  {
    version: "2.0.0",
    build: 187,
    fecha: "2026-11-19",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b187",
    descripcion: "Controles estándar y paleta oficial en Modal de Producto Virtual.",
    cambios: [
      "ModalProductoVirtual (`ModalProductoVirtual.tsx`): Encabezado con icono circular translúcido (`Ghost`), prefijo `Q` en precio de venta, selección automática al hacer clic en inputs, `<Switch>` con colores oficiales (`sky-600` / `#313131`) y footer unificado con `ModalProducto`."
    ]
  },
  {
    version: "2.0.0",
    build: 186,
    fecha: "2026-11-19",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b186",
    descripcion: "Estandarización visual y de controles (escritorio y móvil) en Productos Virtuales.",
    cambios: [
      "Productos Virtuales (`page.tsx`, `EncabezadoProductosVirtuales.tsx`, `ListaProductosVirtuales.tsx`, `ModalProductoVirtual.tsx`, `DialogoEliminarProductoVirtual.tsx`): Aplicado `<PageHeader>`, `<SurfaceCard variant=\"panel\">`, `<PillTabs>` con buscador, ordenamiento (`A-Z`, `Z-A`, `Menor precio`, `Mayor precio`) y botón `Opciones` en móvil, acordeones con paleta oficial `#1e1e1e`/`#252526`/`#2e2e2e`, `<Paginacion>` y `<BotonVolverArriba>`."
    ]
  },
  {
    version: "2.0.0",
    build: 185,
    fecha: "2026-11-19",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b185",
    descripcion: "Selector de ubicaciones con agregar y eliminar persistentes en Modal de Producto.",
    cambios: [
      "Productos (`use-catalogo-productos.ts`, `page.tsx`, `ModalProducto.tsx`): Reemplazado el campo de texto de ubicación por un `<Select>` persistente en `generales/actual` (`ubicacionesProducto`), con botón `Agregar` en línea para crear nuevas ubicaciones y botón `Eliminar` para remover la ubicación seleccionada del listado."
    ]
  },
  {
    version: "2.0.0",
    build: 184,
    fecha: "2026-11-19",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b184",
    descripcion: "Selector de ubicaciones integrado dentro del panel colapsable Opciones en móvil en Productos.",
    cambios: [
      "PillTabs & Productos (`pill-tabs.tsx`, `ListaProductos.tsx`): Agregadas las propiedades `mobileExtraContent` y `hasActiveExtraFilter` en `<PillTabs>` para incluir el selector de ubicaciones dentro del panel desplegable de `Opciones` junto al ordenamiento en vista móvil."
    ]
  },
  {
    version: "2.0.0",
    build: 183,
    fecha: "2026-11-19",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b183",
    descripcion: "Rediseño de Gestión de Productos con paleta oficial, controles estándar y vista móvil.",
    cambios: [
      "Productos (`page.tsx`, `use-catalogo-productos.ts`, `EncabezadoProductos.tsx`, `ListaProductos.tsx`, `ModalProducto.tsx`): Integrado `<SurfaceCard variant='panel'>`, `<PillTabs>` con buscador y ordenamiento colapsable en móvil (`Opciones`), selector de ubicación en `#252526`, acordeones de 2 columnas sin `uppercase` con detalle en `#1e1e1e`/`#252526`, `<Paginacion>` estándar, `<BotonVolverArriba />` y modal actualizado con prefijos `Q` y selección al clic."
    ]
  },
  {
    version: "2.0.0",
    build: 182,
    fecha: "2026-11-19",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b182",
    descripcion: "Portada y contenido del acordeón optimizados y más legibles en Clientes.",
    cambios: [
      "Clientes (`lista-clientes.tsx`): Portada con formato `#{id}. {nombre}` + teléfono abajo a la izquierda y tipo + estado de crédito apilados a la derecha; contenido interno en 3 tarjetas compactas (`Teléfono`, `Línea de Crédito`, `Consumo Interno`) sin switches deshabilitados pequeños."
    ]
  },
  {
    version: "2.0.0",
    build: 181,
    fecha: "2026-11-19",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b181",
    descripcion: "Ordenamiento integrado al buscador mediante PillTabs y botón Opciones en móvil en Clientes.",
    cambios: [
      "Clientes (`lista-clientes.tsx`): Reemplazado el `Select` externo por `<PillTabs>` con las 4 opciones de orden (`ID Desc`, `ID Asc`, `A-Z`, `Z-A`) integradas al buscador en escritorio y colapsadas bajo el botón `Opciones` junto al buscador en vista móvil (`collapsibleMobileTabs`)."
    ]
  },
  {
    version: "2.0.0",
    build: 180,
    fecha: "2026-11-19",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b180",
    descripcion: "Rediseño de Gestión de Clientes con paleta oficial, controles estándar y vista móvil responsiva.",
    cambios: [
      "Clientes (`page.tsx`, `encabezado-clientes.tsx`, `lista-clientes.tsx`, `modal-cliente.tsx`): Migrado a `<PageHeader>`, `<SurfaceCard variant='panel'>`, buscador en píldora con botón `X` de limpieza, selector de ordenamiento en `#252526`, acordeones con paleta `#1e1e1e`/`#252526`/`#2e2e2e`, badges `rounded-full` sin mayúsculas sostenidas, `<Paginacion>` estándar, `<BotonVolverArriba />` y modal limpio sin `bg-background`."
    ]
  },
  {
    version: "2.0.0",
    build: 179,
    fecha: "2026-11-19",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b179",
    descripcion: "Desglose del cálculo colapsable en el resumen de Cuadre Mensual.",
    cambios: [
      "Cuadre Mensual (`cuadre-mensual-resumen.tsx`): Ocultado por defecto el desglose de ingresos/compras/gastos dentro de un `<Accordion>` colapsable (`Ver detalle del cálculo`), dejando visible únicamente `Balance Neto Calculado`."
    ]
  },
  {
    version: "2.0.0",
    build: 178,
    fecha: "2026-11-19",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b178",
    descripcion: "Cuadre Mensual e Historial estandarizados con el mismo diseño que Cuadre Semanal.",
    cambios: [
      "Cuadre Mensual (`page.tsx`, `cuadre-mensual-lista.tsx`, `cuadre-mensual-resumen.tsx`): Unificado con el diseño de Cuadre Semanal (`#1e1e1e`/`#252526`/`#2e2e2e`, botón `Historial` con icono `emerald-400`, tarjetas con badge `Pendiente` en ámbar, panel lateral con icono circular, tarjetas `Total Ingresos`/`Total Egresos`, input `Balance a Liquidar` con prefijo `Q` y `<BotonVolverArriba />`).",
      "Historial de Cuadres Mensuales (`historial/page.tsx`, `use-historial-cuadre-mensual.ts`, `cuadre-mensual-item-acordeon.tsx`, `detalle-cuadres-semanales.tsx`): Integrado `<PageHeader>` con `backHref`, buscador en píldora con botón `X`, `<Accordion value={openAccordionId ?? ''}>`, detalle compacto por filas, `<Paginacion>` estándar y `<BotonVolverArriba />`."
    ]
  },
  {
    version: "2.0.0",
    build: 177,
    fecha: "2026-11-19",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b177",
    descripcion: "Corregido el toggle de apertura/cierre en un solo clic en Historial de Cuadres Semanales.",
    cambios: [
      "Historial de Cuadres Semanales (`historial/page.tsx`): Cambiado `value={openAccordionId || undefined}` a `value={openAccordionId ?? ''}` en `<Accordion>` para mantener el componente controlado y evitar que se quede entreabierto en dos clics."
    ]
  },
  {
    version: "2.0.0",
    build: 176,
    fecha: "2026-11-19",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b176",
    descripcion: "Detalle compacto y preciso dentro del acordeón de Historial de Cuadres Semanales.",
    cambios: [
      "Historial de Cuadres Semanales (`cuadre-item-acordeon.tsx`, `detalle-registros-procesados.tsx`): Unificados los KPIs superiores en 4 tarjetas compactas (`Ingresos`, `Egresos`, `Balance Neto`, `Liquidado`) más barra compacta de `Origen → Destino`; listas de registros procesados agrupadas por categoría en filas compactas con monto exacto (corregido `pagosTarjeta` en cierres con tarjeta) para ahorrar espacio en escritorio y móvil."
    ]
  },
  {
    version: "2.0.0",
    build: 175,
    fecha: "2026-11-19",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b175",
    descripcion: "Título simplificado en el contenedor de ingresos físicos de Cuadre Semanal.",
    cambios: [
      "Cuadre Semanal (`ingresos-fisicos.tsx`): Cambiado el título de `Ingresos del Período (Efectivo y Monedas)` a `Ingresos (Efectivo y Monedas)`."
    ]
  },
  {
    version: "2.0.0",
    build: 174,
    fecha: "2026-11-18",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b174",
    descripcion: "Pestañas integradas dentro de la misma píldora del buscador en móvil para POS Ventas.",
    cambios: [
      "PillTabs & POS Ventas (`pill-tabs.tsx`, `pos-accounts.tsx`): Agregada la opción `inlineMobileTabs` en `<PillTabs>` y aplicada en `pos-accounts.tsx` para mantener el buscador y las pestañas `Pendientes` / `Crédito` integrados en la misma píldora también en móvil (sin separarlas en un botón aparte)."
    ]
  },
  {
    version: "2.0.0",
    build: 173,
    fecha: "2026-11-18",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b173",
    descripcion: "Pestañas integradas al buscador en vista móvil en POS Ventas.",
    cambios: [
      "POS Ventas (`pos-accounts.tsx`): Activado `collapsibleMobileTabs` en `<PillTabs>` para integrar las pestañas `Pendientes` / `Crédito` bajo el botón `Opciones` junto al input de búsqueda en la vista móvil."
    ]
  },
  {
    version: "2.0.0",
    build: 172,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b172",
    descripcion: "Controles estándar, PillTabs, acordeones y Paginacion en Historial de Cuadres Semanales.",
    cambios: [
      "Historial de Cuadres Semanales (`historial/page.tsx`, `use-historial-cuadre-semanal.ts`, `cuadre-item-acordeon.tsx`): Integrado `<PageHeader>` con `backHref`, `<PillTabs>` con buscador, conteos y `collapsibleMobileTabs`, `<Paginacion>` estándar, `<BotonVolverArriba />`, filtrado en una sola pasada y acordeones con paleta oficial `#1e1e1e`/`#252526`/`#2e2e2e`."
    ]
  },
  {
    version: "2.0.0",
    build: 171,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b171",
    descripcion: "Centrado vertical de checkboxes en acordeones de Cuadre Semanal.",
    cambios: [
      "Cuadre Semanal (`ingresos-tarjeta.tsx`, `lista-compras.tsx`, `lista-traslados-cobro.tsx`): Envuelta la cabecera del acordeón en `div.relative` con `top-1/2 -translate-y-1/2` para centrar verticalmente el `Checkbox` respecto a la fila de cabecera."
    ]
  },
  {
    version: "2.0.0",
    build: 170,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b170",
    descripcion: "Interior estándar de acordeones en todas las listas de Cuadre Semanal.",
    cambios: [
      "Cuadre Semanal (`ingresos-tarjeta.tsx`, `lista-traslados-cobro.tsx`, `lista-compras.tsx`): Aplicado el modelo estándar de `AccordionContent` en `bg-[#1e1e1e]`, encabezado con icono y conteo de ítems, y tarjetas internas en `bg-[#252526] border-[#2e2e2e]`."
    ]
  },
  {
    version: "2.0.0",
    build: 169,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b169",
    descripcion: "Iconos en títulos, badges unificados y vista móvil de traslados en Cuadre Semanal.",
    cambios: [
      "Cuadre Semanal (`ingresos-fisicos.tsx`, `ingresos-tarjeta.tsx`, `lista-compras.tsx`, `lista-gastos.tsx`, `lista-traslados-cobro.tsx`): Agregados iconos a todos los títulos de contenedores, reducido título a `Traslados por Cobrar`, unificado el badge `Pendiente` en ámbar/naranja (`bg-amber-500/20 text-amber-300`) en todas las listas, y simplificadas las tarjetas de traslado con un único badge de estado (`Pendiente` / `Procesado`) y estructura móvil idéntica a las demás listas."
    ]
  },
  {
    version: "2.0.0",
    build: 168,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b168",
    descripcion: "Estandarización visual y de controles en Cuadre Semanal.",
    cambios: [
      "Cuadre Semanal (`page.tsx`, `encabezado-semanal.tsx`, `barra-resumen.tsx`, `ingresos-fisicos.tsx`, `ingresos-tarjeta.tsx`, `lista-compras.tsx`, `lista-gastos.tsx`): Migrado el panel de resumen a `SurfaceCard` (`#1e1e1e`/`#252526`/`#2e2e2e`) eliminando clases de modo claro, cabecera estilo `PageHeader`, input `Balance a Liquidar` con prefijo `Q` y selección automática, botón `Historial` unificado con icono `emerald-400`, diálogo de confirmación en `#1e1e1e`, badges `rounded-full` y `<BotonVolverArriba />`."
    ]
  },
  {
    version: "2.0.0",
    build: 167,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b167",
    descripcion: "Optimización de carga, memoización y reducción de código en Cuadre de Tragamonedas e Historial.",
    cambios: [
      "Cuadre de Tragamonedas (`use-cuadre-tragamonedas-cierre.ts`, `maquina-cuadre-card.tsx`, `page.tsx`): Reemplazada búsqueda O(N²) por `Map`, eliminados estados/efectos redundantes para cuentas estáticas, memoizadas tarjetas con `React.memo` y `useCallback`, y carga diferida (`next/dynamic`) para el diálogo de confirmación.",
      "Historial (`use-historial-cuadre-tragamonedas.ts`, `cuadre-tragamonedas-item-acordeon.tsx`): Filtrado y conteo en una sola pasada sin copias innecesarias de arreglos, `React.memo` en ítems del acordeón y renderizado parametrizado de KPIs."
    ]
  },
  {
    version: "2.0.0",
    build: 166,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b166",
    descripcion: "Presentación optimizada y clara del detalle en los acordeones de Historial de Cuadres.",
    cambios: [
      "Historial de Cuadres (`cuadre-tragamonedas-item-acordeon.tsx`): Reorganizado el contenido del acordeón con tarjetas KPI compactas con icono, lista limpia de máquinas con desglose legible (`Manual` y `Deuda` en `11px`) y panel proporcionado de `Siguiente Turno y Traslado`."
    ]
  },
  {
    version: "2.0.0",
    build: 165,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b165",
    descripcion: "Corregida paleta de 3 capas dentro del acordeón en Historial de Cuadre de Tragamonedas.",
    cambios: [
      "Historial de Cuadres (`cuadre-tragamonedas-item-acordeon.tsx`): Actualizados los bloques internos de `AccordionContent` (`Manual`, `Base`, `Deuda`, `Extracción Neta`, `Rendimiento por Máquina`, `Preparación Turno Siguiente` y `Notas del Cierre`) a `bg-[#252526]` con hover `#313131` sobre el fondo `bg-[#1e1e1e]`."
    ]
  },
  {
    version: "2.0.0",
    build: 164,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b164",
    descripcion: "Cabecera estilo PageHeader en el contenedor Resumen y Cierre de Cuadre de Tragamonedas.",
    cambios: [
      "Cuadre de Tragamonedas (`cuadre-tragamonedas-resumen.tsx`): Actualizada la cabecera de `Resumen y Cierre` con icono circular translúcido (`bg-sky-500/10 text-sky-400`), título y descripción alineados al estilo de `PageHeader`."
    ]
  },
  {
    version: "2.0.0",
    build: 163,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b163",
    descripcion: "Corregido error de sintaxis JSX en Cuadre de Tragamonedas.",
    cambios: [
      "Cuadre de Tragamonedas (`page.tsx`): Eliminadas líneas duplicadas de `<Link>` y `className` en el botón `Historial`."
    ]
  },
  {
    version: "2.0.0",
    build: 162,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b162",
    descripcion: "Texto Historial agregado al botón de Cuadre de Tragamonedas.",
    cambios: [
      "Cuadre de Tragamonedas (`page.tsx`): Agregado el texto `Historial` al botón manteniendo los colores oficiales (`bg-[#252526] hover:bg-[#313131] border-[#2e2e2e]` e icono `text-emerald-400`)."
    ]
  },
  {
    version: "2.0.0",
    build: 161,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b161",
    descripcion: "Botones de Historial y Regresar en Cuadre de Tragamonedas unificados con POS Ventas.",
    cambios: [
      "Cuadre de Tragamonedas (`page.tsx`, `historial/page.tsx`): Botón `Historial` en formato circular compacto (`h-9 w-9 bg-[#252526] hover:bg-[#313131] border-[#2e2e2e]`) con icono `History` en `text-emerald-400`, y botón de regreso en el historial mediante `backHref` estándar de `<PageHeader>` igual que en Historial de Ventas."
    ]
  },
  {
    version: "2.0.0",
    build: 160,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b160",
    descripcion: "Corregida jerarquía de 3 capas e inputs con prefijo Q en Cuadre de Tragamonedas.",
    cambios: [
      "Cuadre de Tragamonedas (`maquina-cuadre-card.tsx`, `cuadre-tragamonedas-resumen.tsx`): Invertida la jerarquía incorrecta para usar tarjetas principales en `#1e1e1e` (Capa 2) sobre el lienzo `#121212`, con inputs, selectores, textarea y pie de total en `#252526` (Capa 3) y prefijo `Q` en `text-sky-400` dentro de los inputs."
    ]
  },
  {
    version: "2.0.0",
    build: 159,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b159",
    descripcion: "Actualización visual y de controles en Cuadre de Tragamonedas y su Historial.",
    cambios: [
      "Cuadre de Tragamonedas (`page.tsx`, `maquina-cuadre-card.tsx`, `cuadre-tragamonedas-resumen.tsx`, `cuadre-confirmacion-dialog.tsx`): Estandarizados botones, selectores, selección de texto al hacer clic/foco, hover de tarjetas y `<BotonVolverArriba />`.",
      "Historial de Cuadres (`historial/page.tsx`, `use-historial-cuadre-tragamonedas.ts`, `cuadre-tragamonedas-item-acordeon.tsx`): Integrado `<PillTabs>` con buscador, conteo de pendientes/todos y `collapsibleMobileTabs`, acordeones de 2 columnas con paleta oficial `#1e1e1e`/`#252526`/`#2e2e2e` y `<Paginacion>` estándar."
    ]
  },
  {
    version: "2.0.0",
    build: 158,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b158",
    descripcion: "Controles de paginación siempre visibles incluso con una sola página.",
    cambios: [
      "Paginación (`src/components/comunes/paginacion.tsx`): Mostrados siempre los botones `Anterior`, números de página y `Siguiente` (deshabilitados cuando corresponde) tanto en móvil como en escritorio aunque `totalPages` sea 1."
    ]
  },
  {
    version: "2.0.0",
    build: 157,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b157",
    descripcion: "Rediseño completo de Registro de Gastos con paleta oficial, PillTabs, acordeones, Paginacion y modal actualizado.",
    cambios: [
      "Registro de Gastos (`page.tsx`, `encabezado-gastos.tsx`, `lista-gastos.tsx`, `modal-gasto.tsx`): Migrado a `PageHeader`, `SurfaceCard`, `PillTabs` con buscador y `collapsibleMobileTabs` (botón `Opciones` a la par en móvil), acordeones de 2 columnas con paleta `#1e1e1e`/`#252526`/`#2e2e2e`, `Paginacion`, `BotonVolverArriba` y modal de gasto con input de monto centrado y prefijo `Q`."
    ]
  },
  {
    version: "2.0.0",
    build: 156,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b156",
    descripcion: "Corregido recorte del anillo de foco y transición de foco al seleccionar destino en Nuevo Traslado.",
    cambios: [
      "Traslados (`nuevo-traslado-dialog.tsx`): Agregado padding (`p-1`) al contenedor desplazable para evitar el recorte del anillo de foco azul en los controles, y ajustado el retardo de foco hacia `Cantidad` tras cerrar el `Select` de sucursal destino."
    ]
  },
  {
    version: "2.0.0",
    build: 155,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b155",
    descripcion: "Rediseño completo del modal Nuevo Traslado alineado con el modal de Compras.",
    cambios: [
      "Traslados (`nuevo-traslado-dialog.tsx`): Reestructurado siguiendo el diseño de `purchase-modal.tsx` (`sm:max-w-4xl`, `bg-[#1e1e1e]`, controles `bg-[#252526] border-[#2e2e2e] rounded-full h-10`, `Monto Total` alineado con el selector de destino, inputs `Cantidad` y `Precio` centrados, flujo continuo con Enter y selección al hacer clic, bloqueo de controles sin destino y listado de ítems con `SurfaceCard`)."
    ]
  },
  {
    version: "2.0.0",
    build: 154,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b154",
    descripcion: "Listado de Traslados con PillTabs, buscador integrado, menú móvil Opciones, acordeones y paginación.",
    cambios: [
      "Traslados (`traslado-list.tsx`, `use-traslados.ts`, `page.tsx`): Integrado `PillTabs` con buscador y `collapsibleMobileTabs` (input de búsqueda y botón `Opciones` a la par en móvil), reemplazadas las tarjetas en grilla por `Accordion` de 2 columnas con detalle expandible de productos/acciones, y agregada paginación estándar (`Paginacion`) y `BotonVolverArriba`."
    ]
  },
  {
    version: "2.0.0",
    build: 153,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b153",
    descripcion: "Unificación de paleta oscura, controles redondeados y limpieza de búsqueda en Traslados.",
    cambios: [
      "Traslados (`page.tsx`, `traslado-card.tsx`, `detalle-traslado-dialog.tsx`, `recibir-traslado-dialog.tsx`, `nuevo-traslado-dialog.tsx`): Reemplazada la paleta azulada heredada (`#1b2533`, `#182330`, `#233144`) por las 3 capas oficiales (`#121212` / `#1e1e1e` / `#252526`, bordes `#2e2e2e`, hover `#313131`, acento `sky-600`/`sky-400`), botones e inputs en píldora (`rounded-full`) y botón `X` de limpieza integrado en los buscadores."
    ]
  },
  {
    version: "2.0.0",
    build: 152,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b152",
    descripcion: "Manejo explícito de Enter y validación con redirección de foco en el botón Añadir.",
    cambios: [
      "Modal de Compras (`purchase-modal.tsx`): Añadido `onKeyDown` explícito para `Enter` en el botón `Añadir` evitando interferencia del formulario, y redirección de foco al campo faltante si alguna validación impide agregar el ítem."
    ]
  },
  {
    version: "2.0.0",
    build: 151,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b151",
    descripcion: "Foco en el botón Añadir tras Enter en Precio y bloqueo con spinner al agregar ítems.",
    cambios: [
      "Modal de Compras (`purchase-modal.tsx`): Al presionar `Enter` en `Precio` pasa el foco al botón `Añadir`; al confirmar con `Enter` o clic, bloquea brevemente el botón mostrando `Loader2` (`isAddingItem`), agrega el ítem y repite el ciclo enfocando y seleccionando `Cantidad`."
    ]
  },
  {
    version: "2.0.0",
    build: 150,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b150",
    descripcion: "Corregido el foco inicial en Cantidad al seleccionar proveedor en el modal de Compras.",
    cambios: [
      "Modal de Compras (`purchase-modal.tsx`): Evitado que el efecto de cambio de modo (`isGastoManualMode`) robe el foco hacia `Producto` al habilitarse los controles tras seleccionar un proveedor, manteniendo el foco en `Cantidad`."
    ]
  },
  {
    version: "2.0.0",
    build: 149,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b149",
    descripcion: "Flujo continuo de foco y selección automática de texto en el modal de Compras.",
    cambios: [
      "Modal de Compras (`purchase-modal.tsx`): Al seleccionar proveedor pasa el foco y selecciona `Cantidad`; con Enter avanza a `Producto`/`Concepto o gasto` y luego a `Precio` seleccionando todo el texto; con Enter en `Precio` añade el ítem y repite el ciclo desde `Cantidad`. Todos los inputs seleccionan su texto al hacer clic."
    ]
  },
  {
    version: "2.0.0",
    build: 148,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b148",
    descripcion: "Bloqueo de controles en el modal de Compras cuando no hay proveedor seleccionado.",
    cambios: [
      "Modal de Compras (`purchase-modal.tsx`): Deshabilitados `Cantidad`, switch `Modo`, `Producto`/`Concepto o gasto`, `Precio`, botón `Añadir`, eliminación de ítems, atajo `F6` y botón de guardar mientras no exista un proveedor seleccionado."
    ]
  },
  {
    version: "2.0.0",
    build: 147,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b147",
    descripcion: "Input de Precio centrado en el modal de Compras.",
    cambios: [
      "Modal de Compras (`purchase-modal.tsx`): Centrado el texto del input `Precio` (`text-center px-8`)."
    ]
  },
  {
    version: "2.0.0",
    build: 146,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b146",
    descripcion: "Switch Modo separado a la par del input Cantidad en el modal de Compras.",
    cambios: [
      "Modal de Compras (`purchase-modal.tsx`): Separado el switch `Normal / Gasto` del input `Cantidad` en móvil, ubicado a la par con el label `Modo` y manteniendo el diseño de píldora con acento azul."
    ]
  },
  {
    version: "2.0.0",
    build: 145,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b145",
    descripcion: "Ajustes de centrado, color azul del switch y texto F6 en escritorio del modal de Compras.",
    cambios: [
      "Modal de Compras (`purchase-modal.tsx`): Centrado el valor en el input `Cantidad` en móvil (`text-center px-28`), aplicado color azul del sistema (`sky-600`) al `Switch` integrado y restaurado el texto de ayuda `Presiona F6 para alternar entre producto y gasto directo` en vista escritorio (`hidden lg:block`)."
    ]
  },
  {
    version: "2.0.0",
    build: 144,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b144",
    descripcion: "Switch Normal/Gasto integrado dentro del input de Cantidad y etiquetas actualizadas en el modal de Compras.",
    cambios: [
      "Modal de Compras (`purchase-modal.tsx`): Integrado el switch `Normal / Gasto` dentro del propio campo de `Cantidad` en vista móvil, y actualizadas las etiquetas `Cant.` -> `Cantidad` y `P. unit.` -> `Precio`."
    ]
  },
  {
    version: "2.0.0",
    build: 143,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b143",
    descripcion: "Distribución móvil compacta en el modal de Nueva Compra.",
    cambios: [
      "Modal de Compras (`purchase-modal.tsx`): Centrado `Monto Total` en móvil, etiqueta dinámica (`Producto` / `Concepto o gasto`) según el switch `Normal / Gasto`, botón `Añadir` a la par de `P. unit.` en la misma fila y eliminado el texto inferior de ayuda F6 para ahorrar espacio vertical."
    ]
  },
  {
    version: "2.0.0",
    build: 142,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b142",
    descripcion: "Margen móvil, Monto Total en fila del proveedor y sin sombra residual en Nueva Compra.",
    cambios: [
      "Modal de Compras (`purchase-modal.tsx`): Eliminado `w-full` en `DialogContent` para respetar el margen lateral móvil estándar (`w-[calc(100%-2rem)]`), ubicado `Monto Total` en la misma fila que `Buscar proveedor...` y aplicada `shadow-none` sin scroll contenedor sobre el buscador para evitar sombras residuales al perder foco."
    ]
  },
  {
    version: "2.0.0",
    build: 141,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b141",
    descripcion: "Corregido recorte de anillos de foco y desplegables en el modal de Nueva Compra.",
    cambios: [
      "Modal de Compras (`purchase-modal.tsx`): Cambiado `overflow-hidden` a `overflow-visible` en `DialogContent` y `<form>`, y agregado `px-1.5 -mx-1.5 py-1` al área de contenido para que los anillos de foco (`ring-sky-500`) y listas desplegables nunca se recorten."
    ]
  },
  {
    version: "2.0.0",
    build: 140,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b140",
    descripcion: "Paginación estándar con <Paginacion /> en Compras.",
    cambios: [
      "Compras (`compras/page.tsx`, `purchase-list.tsx`): Reemplazada la paginación manual por el componente oficial `<Paginacion />` de `@/components/comunes`."
    ]
  },
  {
    version: "2.0.0",
    build: 139,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b139",
    descripcion: "Reubicación de estado, fecha y conteo de artículos en acordeones de Compras.",
    cambios: [
      "Compras (`purchase-list.tsx`): Colocada fecha y hora debajo del nombre a la izquierda, badge de estado debajo del total a la derecha, y el conteo de artículos dentro de la cabecera del acordeón expandido."
    ]
  },
  {
    version: "2.0.0",
    build: 138,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b138",
    descripcion: "Acordeón de Compras simplificado a 2 columnas con la información relevante.",
    cambios: [
      "Compras (`purchase-list.tsx`): Convertido el encabezado del acordeón de 3 columnas a 2 columnas (`grid-cols-[1fr_auto]`), integrando estado y fecha junto al proveedor a la izquierda y total/artículos a la derecha."
    ]
  },
  {
    version: "2.0.0",
    build: 137,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b137",
    descripcion: "Homologación completa de Compras (acordeones, controles y modal) con la paleta oficial de 3 capas.",
    cambios: [
      "Lista y Acordeones (`purchase-list.tsx`, `compras/page.tsx`, `purchase-header.tsx`): Integrado `<PillTabs>` con buscador y `collapsibleMobileTabs`, acordeones con jerarquía oficial (`AccordionTrigger` `#252526` + `AccordionContent` `#1e1e1e` + ítems `#252526`), botón `Nueva Compra` en `sky-600`, botón `Eliminar` en píldora `rose` y `<BotonVolverArriba />`.",
      "Modal de Compras (`purchase-modal.tsx`): Rediseñado al estándar oficial (`bg-[#1e1e1e]`, controles `#252526` con `h-10` y lupa `Search`, historial de proveedor interactivo en `SurfaceCard` `#252526`, carrito `SurfaceCard` y botones `h-9 rounded-full`)."
    ]
  },
  {
    version: "2.0.0",
    build: 136,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b136",
    descripcion: "Badge de tipo de operación alineado a la derecha en vista móvil en Auditoría.",
    cambios: [
      "Auditoría móvil (`auditoria-feed-item.tsx`): Alineado el badge de categoría (`Ventas y Cobros`, `Sala de Juegos`, etc.) al extremo derecho en vista móvil (`justify-between sm:justify-start`)."
    ]
  },
  {
    version: "2.0.0",
    build: 135,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b135",
    descripcion: "Vista móvil compacta y ordenada en las tarjetas de Auditoría de Operaciones.",
    cambios: [
      "Auditoría móvil (`auditoria-feed-item.tsx`): Reorganizado el encabezado móvil en 3 líneas limpias (título + categoría, resumen, y pie operador + tiempo relativo), eliminando el punto `•` huérfano y el rol redundante."
    ]
  },
  {
    version: "2.0.0",
    build: 134,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b134",
    descripcion: "Eliminado el botón redundante 'Limpiar' en Auditoría y Control de Pagos al contar con el botón X en el buscador.",
    cambios: [
      "Filtros (`auditoria-filtros.tsx`, `control-pagos-filtros.tsx`): Eliminado el botón externo `Limpiar` para dejar únicamente el ícono `X` dentro del input de búsqueda y el botón `Opciones / Ocultar`."
    ]
  },
  {
    version: "2.0.0",
    build: 133,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b133",
    descripcion: "Selector de turno, botón externo Opciones/Ocultar y paleta oficial en Auditoría de Operaciones.",
    cambios: [
      "Selector de turno (`auditoria/page.tsx`): Estandarizado al mismo diseño de Monitoreo Integral y Control de Pagos (`Clock` + `Turno actual` alineados a la izquierda, `bg-[#252526] border-[#2e2e2e] rounded-full h-9`).",
      "Buscador y filtros (`auditoria-filtros.tsx`): Movido el botón `Opciones` / `Ocultar` fuera a la par del input (`h-10 rounded-full` con `hover:text-white`), agregado botón `X` de limpieza, eliminado `bg-[#141414]` y unificados selectores a `h-9`.",
      "Acordeón de eventos (`auditoria-feed-item.tsx`): Aplicada la jerarquía oficial de 3 capas sin negros (`AccordionTrigger` `#252526`, `AccordionContent` `#1e1e1e`, bloques `#252526` y sub-fichas `#1e1e1e`)."
    ]
  },
  {
    version: "2.0.0",
    build: 132,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b132",
    descripcion: "Distribución móvil ordenada en el acordeón de Control de Pagos.",
    cambios: [
      "Control de Pagos móvil (`control-pagos-card.tsx`): Eliminado el separador `•` huérfano entre fecha y cajero en móvil, y reorganizada la cabecera interna de cada venta en dos filas limpias (`Venta # + estado + Ver Venta` arriba, `Cubierto + Total` debajo) para evitar amontonamiento."
    ]
  },
  {
    version: "2.0.0",
    build: 131,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b131",
    descripcion: "Unificado botón 'Opciones / Ocultar' y corregido el color de texto en hover en Control de Pagos y Monitoreo Integral.",
    cambios: [
      "Control de Pagos (`control-pagos-filtros.tsx`) y Monitoreo Integral (`flujo-gaveta.tsx`, `flujo-monedas.tsx`, `kardex-inventario.tsx`): Agregado `hover:text-white` al estado activo del botón `Ocultar` para evitar que `variant=\"ghost\"` cambie el texto a azul oscuro al pasar el cursor, y unificada la etiqueta a `Opciones` / `Ocultar` en Control de Pagos."
    ]
  },
  {
    version: "2.0.0",
    build: 130,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b130",
    descripcion: "Alineación visual y opciones limpias en el selector de turno de Control de Pagos y Monitoreo Integral.",
    cambios: [
      "Selector de turno (`control-pagos/page.tsx`, `monitoreo-integral/page.tsx`): Agrupados icono `Clock` y `<SelectValue />` dentro de un contenedor flex izquierdo para evitar que el texto quede centrado/distorsionado por `justify-between`.",
      "Opciones y etiqueta (`control-pagos/page.tsx`, `monitoreo-integral/page.tsx`): Dejadas únicamente las opciones de `Turno actual` y `Turnos anteriores` en el selector superior de Control de Pagos, y texto único `Turno actual` en ambas páginas."
    ]
  },
  {
    version: "2.0.0",
    build: 129,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b129",
    descripcion: "Simplificación visual del acordeón y etiqueta limpia 'Turno actual' en Control de Pagos.",
    cambios: [
      "Selector de turno (`control-pagos/page.tsx`, `control-pagos-filtros.tsx`): Simplificado el texto a `Turno actual` sin sufijos adicionales.",
      "Acordeón sin ruido visual (`control-pagos-card.tsx`): Eliminado el segundo contenedor redundante y el título repetitivo dentro del acordeón, mostrando directamente las filas de artículos en tarjetas `#252526` sobre fondo `#1e1e1e`."
    ]
  },
  {
    version: "2.0.0",
    build: 128,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b128",
    descripcion: "Selector de turno en cabecera y unificación a la paleta oficial de 3 capas en Control de Pagos.",
    cambios: [
      "Control de Pagos (`control-pagos/page.tsx`): Agregado selector de turno directo en la cabecera (`PageHeader`) con soporte para Turno actual, rangos rápidos y turnos anteriores.",
      "Filtros y Buscador (`control-pagos-filtros.tsx`): Movido el botón `Filtros` fuera del buscador (`h-10 rounded-full bg-[#252526]`), agregado botón `X` de limpieza dentro del input, eliminado `bg-[#141414]` en el panel desplegable y estandarizados los selectores a `h-9`.",
      "Tarjetas de Pago (`control-pagos-card.tsx`): Alineada la jerarquía exacta de *Historial de Ventas* (`AccordionTrigger` `#252526` con `border-b` al abrir, `AccordionContent` `#1e1e1e`, fichas de venta `#252526` y filas de artículos `#1e1e1e`)."
    ]
  },
  {
    version: "2.0.0",
    build: 127,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b127",
    descripcion: "Etiqueta compacta 'Turno actual' en vista móvil en Monitoreo Integral.",
    cambios: [
      "Monitoreo Integral (`monitoreo-integral/page.tsx`): Ocultado el sufijo `(abierto)` en vista móvil (`hidden sm:inline`) dentro del selector de turno para mostrar únicamente `Turno actual`."
    ]
  },
  {
    version: "2.0.0",
    build: 126,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b126",
    descripcion: "Botón externo de opciones en Monitoreo Integral, total vendido por búsqueda en Kardex y botón X visible en Inventario.",
    cambios: [
      "Monitoreo Integral (`flujo-gaveta.tsx`, `flujo-monedas.tsx`, `kardex-inventario.tsx`): Movido el botón de opciones (`SlidersHorizontal`) fuera del input de búsqueda a la par (`h-10 rounded-full bg-[#252526]`), dejando el botón `X` de limpieza dentro del input (`z-10`) y reemplazando `#141414` por `#1e1e1e` en tarjetas de apertura.",
      "Kardex (`kardex-inventario.tsx`): Agregada barra resumen automática al buscar un producto mostrando la existencia inicial y el total de unidades vendidas en el período.",
      "Inventario (`inventario-filtros.tsx`, `inventario/historial/page.tsx`): Asegurada la visibilidad (`z-10`) del botón `X` para limpiar los buscadores en principal, revisión e historial."
    ]
  },
  {
    version: "2.0.0",
    build: 125,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b125",
    descripcion: "Eliminado el espacio vacío inferior y el doble scroll en vista móvil en toda la aplicación.",
    cambios: [
      "Contenedor principal (`sidebar.tsx`, `dashboard/layout.tsx`): Cambiado `SidebarProvider` a `h-[100dvh] flex flex-col overflow-hidden` con `flex-1 min-h-0` en el área de contenido para que el header de dos filas en móvil nunca desborde el alto de pantalla ni genere doble scroll.",
      "Espaciado inferior global (22 páginas en `src/app/dashboard/**/page.tsx`): Reemplazado `pb-20` (80px de espacio vacío al final) por `pb-2` para que las páginas terminen justo al pie de su contenido."
    ]
  },
  {
    version: "2.0.0",
    build: 124,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b124",
    descripcion: "Eliminado el espacio vacío inferior de 320px en vista móvil en toda la aplicación.",
    cambios: [
      "Manejador de teclado móvil (`mobile-keyboard-handler.tsx`): Eliminado el `paddingBottom = '320px'` artificial que se inyectaba al contenedor `<main>` al enfocar cualquier input, evitando que las páginas móviles tuvieran scroll extra vacío al final; ahora solo desplaza el campo si un teclado virtual real reduce el `visualViewport`."
    ]
  },
  {
    version: "2.0.0",
    build: 123,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b123",
    descripcion: "Filtros externos en móvil / inline en escritorio y paleta oficial en Inventario y su Historial.",
    cambios: [
      "Filtros de Inventario (`inventario-filtros.tsx`): En móvil (`< sm`) el botón de filtros pasa fuera del input a su derecha (`h-10 w-10 rounded-full`); en escritorio (`sm+`) los selectores de ubicación y ordenamiento se muestran directamente a la par del buscador.",
      "Historial y Revisión de Inventario (`ajuste-inventario-acordeon.tsx`, `inventario-revision-footer.tsx`): Aplicado `bg-[#1e1e1e]` al contenido expandido del acordeón y `bg-[#252526]` a las tarjetas internas y barra de revisión (eliminado `#141414`)."
    ]
  },
  {
    version: "2.0.0",
    build: 122,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b122",
    descripcion: "Ocultadas las 4 tarjetas KPI superiores en vista móvil en el Historial de Cierres de Caja.",
    cambios: [
      "Historial de Cierres (`cierre-caja-item-acordeon.tsx`): Aplicado `hidden sm:grid` al bloque de 4 métricas rápidas (`Efectivo Esperado`, `Efectivo Contado`, `Fondo Sig. Turno`, `Efectivo Liquidado`) para ahorrar espacio en móvil."
    ]
  },
  {
    version: "2.0.0",
    build: 121,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b121",
    descripcion: "Alineación exacta del acordeón de Historial de Cierres con la jerarquía de capas de Historial de Ventas.",
    cambios: [
      "Historial de Cierres (`cierre-caja-item-acordeon.tsx`): Aplicado `bg-[#1e1e1e]` al contenido expandido (`AccordionContent`) con `border-b` al abrir el `AccordionTrigger`, elevando las tarjetas KPI, bloques de desglose y observaciones a `bg-[#252526]` (y sub-filas a `bg-[#1e1e1e]`), idéntico a Historial de Ventas."
    ]
  },
  {
    version: "2.0.0",
    build: 120,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b120",
    descripcion: "Botón colapsable de filtros en móvil para Historial de Cierres e Historial de Ventas.",
    cambios: [
      "Historial de Cierres (`cierre-caja/historial/page.tsx`) e Historial de Ventas (`historial-ventas/page.tsx`): Activado `collapsibleMobileTabs` en `<PillTabs />` para mostrar el botón de filtros junto al buscador únicamente en vista móvil."
    ]
  },
  {
    version: "2.0.0",
    build: 119,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b119",
    descripcion: "Regla obligatoria de paleta oscura en AGENTS.md y unificación final en Historial de Ventas e Historial de Cierres.",
    cambios: [
      "Regla de diseño (`AGENTS.md`): Agregado punto obligatorio en el Pre-Flight Checklist para respetar la paleta oficial de 3 capas sin negros (`#121212` / `#1e1e1e` / `#252526`) en cada cambio.",
      "Historial de Ventas e Historial de Cierres (`historial-ventas/page.tsx`, `cierre-caja/historial/page.tsx`, `cierre-caja-item-acordeon.tsx`): Unificados los fondos translúcidos restantes a sólido `#252526`."
    ]
  },
  {
    version: "2.0.0",
    build: 118,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b118",
    descripcion: "Guía gráfica interactiva de la paleta oficial del modo oscuro en Pruebas > Modo Oscuro.",
    cambios: [
      "Paleta gráfica (`pruebas/modo-oscuro/page.tsx`): Rediseñada la vista con muestras copiables de las 3 capas oficiales (`#121212`, `#1e1e1e`, `#252526`, `#313131`, `#2e2e2e`), colores semánticos (`sky-600`, `emerald-600`, `amber-500`, `rose-600`) y un diagrama interactivo de anidamiento real."
    ]
  },
  {
    version: "2.0.0",
    build: 117,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b117",
    descripcion: "Estandarización global de la paleta oscura a 3 capas sin negros (#121212 / #1e1e1e / #252526).",
    cambios: [
      "Componente `SurfaceCard` (`surface-card.tsx`): Unificado `variant=\"subcard\"` de `#141414` a `#1e1e1e` para eliminar bloques negros en toda la aplicación.",
      "Guía de diseño (`AGENTS.md`): Actualizada la paleta oficial a 3 capas consistentes (`#121212` base, `#1e1e1e` paneles/modales/sub-bloques, `#252526` tarjetas/inputs/controles, `#313131` hover, `#2e2e2e` bordes)."
    ]
  },
  {
    version: "2.0.0",
    build: 116,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b116",
    descripcion: "Alineación del historial de Cierre de Caja a la paleta oficial #1e1e1e / #252526.",
    cambios: [
      "Historial de Cierres (`cierre-caja-item-acordeon.tsx`): Reemplazados los fondos negros `#141414` en la píldora de folio, tarjetas KPI, bloques de desglose y observaciones por `#1e1e1e`, elevando las sub-filas internas (`Entrega Efectivo`, `Cobros con Tarjeta`, `Existencia en Caja`) a `#252526`."
    ]
  },
  {
    version: "2.0.0",
    build: 115,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b115",
    descripcion: "Estandarización de tamaños de controles y colores en la página de Cierre de Caja.",
    cambios: [
      "Controles uniformes (`cierre-conteo-card.tsx`, `cierre-liquidacion-card.tsx`): Estandarizados `Total Físico en Caja`, `Efectivo para el Siguiente Período`, `Cuenta Destino de la Liquidación` y `Finalizar y Registrar Cierre` a altura estándar `h-10 rounded-full`.",
      "Colores oficiales (`cierre-conteo-card.tsx`, `cierre-liquidacion-card.tsx`): Reemplazados los bloques negros `subcard` (`#141414`) por `#1e1e1e` / `#252526` y eliminadas las sobrescrituras de color en `SelectTrigger`, `SelectContent` y `Textarea`."
    ]
  },
  {
    version: "2.0.0",
    build: 114,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b114",
    descripcion: "Espaciado compacto en móvil y botón flotante para subir al inicio en el modal de historial de máquinas.",
    cambios: [
      "Componente `BotonVolverArriba` (`boton-volver-arriba.tsx`): Agregada la prop opcional `containerRef` para detectar scroll y regresar al inicio suavemente dentro de listas de modales.",
      "Historial de Tragamonedas (`historial-modal.tsx`): Reducido el espaciado en móvil entre cabecera, buscador y tarjetas (`gap-2.5`, `pb-0`, sin `pt-2` ni `mt-2`), e incorporado `<BotonVolverArriba containerRef={listContainerRef} />` visible en móvil y escritorio."
    ]
  },
  {
    version: "2.0.0",
    build: 113,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b113",
    descripcion: "Botón colapsable de filtros en móvil junto al buscador en PillTabs (probado en Historial de Máquinas).",
    cambios: [
      "Componente `PillTabs` (`pill-tabs.tsx`): Agregada la opción `collapsibleMobileTabs` para mostrar un botón circular con ícono `SlidersHorizontal` a la par del buscador en móvil (`< sm`) que despliega/oculta suavemente los interruptores de pestañas.",
      "Historial de Tragamonedas (`historial-modal.tsx`): Activado `collapsibleMobileTabs` para liberar espacio vertical en pantallas móviles."
    ]
  },
  {
    version: "2.0.0",
    build: 112,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b112",
    descripcion: "Unificación de colores y tamaños de controles en modales de Base y Extracción de tragamonedas.",
    cambios: [
      "Modales Base y Extracción (`modal-operacion-maquina.tsx`): Cambiadas las tarjetas de resumen de `variant=\"subcard\"` (`#141414`) a `variant=\"surface\"` (`#252526`), estandarizado el campo de monto (`h-9 text-sm`) y los botones del pie (`h-9 rounded-full`, con `bg-sky-600` para Confirmar Base)."
    ]
  },
  {
    version: "2.0.0",
    build: 111,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b111",
    descripcion: "Animación estándar y unificación visual del modal de historial en Tragamonedas.",
    cambios: [
      "Animación de apertura y cierre (`gestion-tragamonedas/page.tsx`): Mantenido `<HistorialModal />` montado permanentemente para que Radix `Dialog` ejecute correctamente la animación estándar `swal2-modal-anim` al abrir y cerrar.",
      "Estética unificada (`historial-modal.tsx`): Eliminada la línea de luz superior decorativa, los divisores extra y los fondos negros `#141414` en estado vacío y chips de detalle (usando `#252526` y `#1e1e1e`) para igualarlo al resto de los modales."
    ]
  },
  {
    version: "2.0.0",
    build: 110,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b110",
    descripcion: "Unificación a #252526 en los modales de Consumo Interno, Mover a Crédito y Eliminar Producto del POS.",
    cambios: [
      "Modales de confirmación POS (`pos-dialogs.tsx`): Reemplazado `bg-[#141414]` por `bg-[#252526]` en las tarjetas de resumen de `Consumo Interno`, `¿Mover Cuenta a Crédito?` y `¿Eliminar Producto?`, y eliminado `bg-[#141414]` del campo `PIN de Autorización` para usar el estilo estándar de controles."
    ]
  },
  {
    version: "2.0.0",
    build: 109,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b109",
    descripcion: "Unificación de tarjetas a superficie #252526 en el modal de Traslado de Cuenta.",
    cambios: [
      "Traslado de Cuenta (`dialogo-traslado-cuenta.tsx`): Cambiadas las tarjetas `Cuenta de Origen` y `Resumen de Impacto Financiero` de `variant=\"subcard\"` (`#141414`) a `variant=\"surface\"` (`#252526`), y el selector de cantidad parcial a `#1e1e1e` para eliminar bloques negros inconsistentes."
    ]
  },
  {
    version: "2.0.0",
    build: 108,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b108",
    descripcion: "Corrección de bordes redondeados y colores en modales de Cobro de Cuenta, Pago con Tarjeta y Registrar Abono.",
    cambios: [
      "Cobro de Cuenta (`pos-dialogs.tsx`): Reemplazado el fondo oscuro `#1e1e1e` de la fila `Incluir Total Créditos` por `bg-[#2e2e2e]/60` para integrarse correctamente en la tarjeta `#252526`.",
      "Sub-modales de Tarjeta y Abono (`pos-dialogs.tsx`): Estandarizadas las esquinas a `rounded-2xl` (eliminado `sm:rounded-lg`), unificada la fila `Deuda Total` a `bg-[#2e2e2e]/40` y eliminado `bg-[#141414]` en el campo `Monto a Recibir (Q)` para usar el control oficial `#252526`."
    ]
  },
  {
    version: "2.0.0",
    build: 107,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b107",
    descripcion: "Estandarización global de colores en controles SelectTrigger y Textarea.",
    cambios: [
      "Componente base `Textarea` (`textarea.tsx`): Actualizado al estándar `#252526` con borde `#2e2e2e`, texto `#f1f5f9` y foco `sky-500` (eliminado `bg-background`).",
      "Selectores consistentes (`transfer-dialog.tsx`, `cuadre-tragamonedas-resumen.tsx`, `nuevo-traslado-dialog.tsx`, `recibir-traslado-dialog.tsx`, `ListaUsuarios.tsx`, `ListaPagos.tsx`): Eliminadas sobrescrituras oscuras/azules (`#141414`, `#1e1e1e`, `#182330`, `bg-background`) en `<SelectTrigger>` y `<SelectContent>` para usar de forma uniforme la superficie oficial `#252526`."
    ]
  },
  {
    version: "2.0.0",
    build: 106,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b106",
    descripcion: "Aspecto idéntico al POS en el modal de consumo de mesas y optimización crítica de navegación en el menú lateral.",
    cambios: [
      "Modal de consumo idéntico al POS (`consumption-dialog.tsx`): Eliminado el borde recesivo alrededor de `Cant. / Producto / Agregar` y la altura mínima fija del carrito vacío para replicar exactamente la vista del POS.",
      "Corrección de congelamiento al cambiar de menú (`layout.tsx`, `global-table-alarm.tsx`): Aislado el temporizador de 1 segundo de alarmas en `<GlobalTableAlarm />` (activo solo con mesas de tiempo definido) para evitar re-renderizar todo el dashboard y menú lateral cada segundo.",
      "Optimización de navegación (`client-dashboard-nav.tsx`, `next.config.ts`): Desactivado prefetch masivo en enlaces del menú (`prefetch={false}`), eliminados `TooltipProvider` anidados, cierre limpio de `DropdownMenuItem` en modo colapsado y agregado `optimizePackageImports` para reducir picos de CPU/RAM en Windows."
    ]
  },
  {
    version: "2.0.0",
    build: 105,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b105",
    descripcion: "Homologación de colores e íconos del modal de consumos de mesa con el POS y variante de contraste en inicio de sesión.",
    cambios: [
      "Controles idénticos al POS (`consumption-dialog.tsx`): Eliminado el fondo oscuro sobrescrito (`#1e1e1e`) en `Cant.`, `Producto`, `Descripción`, `Precio (Q)` y selector `Manual` móvil para usar el estilo oficial `#252526` sobre contenedor `subcard` (`#141414`), e incorporado el ícono `Search` en `AutocompleteInput`.",
      "Listado de consumos (`consumption-dialog.tsx`): Alineado el estado vacío del carrito temporal con `POSCart` (`pos-cart.tsx`) manteniendo `SurfaceCard` (`#252526`) y divisores `#2e2e2e`."
    ]
  },
  {
    version: "2.0.0",
    build: 104,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b104",
    descripcion: "Bloqueo preventivo con spinner en 'Iniciar Juego' y unificación de colores/tamaños en el modal de inicio de sesión.",
    cambios: [
      "Estado de carga y bloqueo en Iniciar Juego (`start-session-dialog.tsx`): Al hacer clic en `Iniciar Juego`, el botón muestra el spinner animado (`Loader2`) con `Iniciando...`, deshabilita `Cancelar` y la `X` de cierre para evitar dobles inicios de sesión.",
      "Consistencia visual (`start-session-dialog.tsx`): Ajustado el fondo del modal a `#1e1e1e` (Capa 1) y estandarizada la altura de botones a `h-9` (36px) en formato `rounded-full`."
    ]
  },
  {
    version: "2.0.0",
    build: 103,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b103",
    descripcion: "Estandarización definitiva de la jerarquía de 4 capas de color en modales y controles PillTabs.",
    cambios: [
      "Jerarquía única Panel/Modal (`dialog.tsx`, `alert-dialog.tsx`, `modal-confirmacion.tsx`, `historial-modal.tsx`): Todos los paneles principales y modales utilizan `#1e1e1e`, los controles encima (`PillTabs`, `Input`, `Select`, tarjetas de lista, botones secundarios) usan `#252526`, y los bloques o chips interiores recesivos usan `#141414`.",
      "Foco inteligente en `PillTabs` (`pill-tabs.tsx`): Cambiado `focus-within` por `has-[input:focus]` para que el contorno azul de foco se active únicamente al escribir en el buscador y no al cambiar de pestaña."
    ]
  },
  {
    version: "2.0.0",
    build: 102,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b102",
    descripcion: "Restaurada la animación oficial SweetAlert2 (swal2-show) y estabilizada la altura del modal de Historial para eliminar saltos.",
    cambios: [
      "Animación oficial `swal2-show` restaurada (`globals.css`): Restablecidos los keyframes exactos de SweetAlert2 (`scale(0.7) ➔ 1.05 ➔ 0.95 ➔ 1` en `0.3s` y `swal2-hide` en `0.15s`) para todos los modales.",
      "Eliminación de saltos de altura al abrir (`historial-modal.tsx`): Fijada la altura del contenedor de lista a `h-[50vh]` para que el modal no cambie de tamaño a mitad de la animación cuando Firestore responde."
    ]
  },
  {
    version: "2.0.0",
    build: 101,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b101",
    descripcion: "Estilizado completo de contenido interno en Historial de Máquina: píldora de búsqueda recesiva, chips de desglose y supresión de redundancias.",
    cambios: [
      "Barra `PillTabs` estilizada con `listClassName='bg-[#141414] border-[#2e2e2e]'` (`historial-modal.tsx`): Aplicado correctamente el contraste negro sobre el fondo gris `#252526` del modal y desactivado el autofocus automático para evitar el contorno azul al abrir.",
      "Contenido de tarjetas estructurado sin redundancias: Desglose de detalles entre paréntesis (ej. `Deuda: Q0`, `Base: Q20`, `Neta: Q0`) transformado en píldoras individuales `bg-[#1e1e1e]`, eliminando la repetición de texto como `Extracción` debajo del badge.",
      "Distribución responsiva móvil y escritorio: En móvil muestra `Badge + Monto` en cabecera, detalle en el centro y `Fecha + Anular (h-8)` al pie sin iconos distractores."
    ]
  },
  {
    version: "2.0.0",
    build: 100,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b100",
    descripcion: "Alineación integral del modal Historial de Máquina a las reglas oficiales de diseño (AGENTS.md).",
    cambios: [
      "Jerarquía de capas y color (`historial-modal.tsx`): Agregada línea de luz superior (Línea 1 Antigravity), aplicada capa recesiva `bg-[#141414]` en `PillTabs` sobre el modal `bg-[#252526]` y botón `Cerrar` en `bg-[#1e1e1e] hover:bg-[#313131]`.",
      "Controles y badges estándar: Ajustados los botones `Anular` (`h-8 rounded-full`) y `Cerrar` (`h-9 rounded-full`) y añadidos `badgeVariant` dinámicos (`amber`/`sky`) de alto contraste en las pestañas."
    ]
  },
  {
    version: "2.0.0",
    build: 99,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b99",
    descripcion: "Contraste oficial negro-sobre-gris (#141414 sobre #252526) en tarjetas de Historial de Máquina.",
    cambios: [
      "Jerarquía visual de capas (`historial-modal.tsx`): Cambiadas las tarjetas de movimientos y el estado vacío de `variant='surface'` (`#252526`) a `variant='subcard'` (`bg-[#141414] border-[#2e2e2e]`), logrando el contraste limpio negro sobre fondo gris del modal tanto en vista escritorio como móvil."
    ]
  },
  {
    version: "2.0.0",
    build: 98,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b98",
    descripcion: "Ocultación del icono circular en vista móvil de Historial de Máquina y estabilización fluida de la animación global de modales.",
    cambios: [
      "Vista móvil limpia en Historial de Máquina (`historial-modal.tsx`): Ocultado el icono circular (`hidden sm:block`) en dispositivos móviles para liberar ancho horizontal y evitar cortes en fechas y descripciones; estandarizado el fondo a `#252526`.",
      "Animación de apertura fluida y estable (`globals.css`): Refinada la curva `swal2-show` a `0.92 ➔ 1.015 ➔ 1` en `240ms cubic-bezier(0.22, 1, 0.36, 1)` para eliminar saltos en modales grandes con scroll e inputs.",
      "Autofocus sincronizado (`historial-modal.tsx` y `dialogo-ultimos-movimientos.tsx`): Ajustado el retardo del foco a `280ms` para ejecutarse justo después de completarse la animación de entrada, evitando desplazamientos o parpadeos."
    ]
  },
  {
    version: "2.0.0",
    build: 97,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b97",
    descripcion: "Tarjetas compactas de 3 líneas en el modal 'Últimos Movimientos del Turno' para escritorio y móvil.",
    cambios: [
      "Diseño compacto y legible (`dialogo-ultimos-movimientos.tsx`): Eliminadas cajas anidadas redundantes y etiquetas repetitivas; cada movimiento ahora muestra en 3 líneas limpias: 1) Badge + #Venta + Cliente + Monto Total a la derecha; 2) Productos en línea; 3) Tiempo, método y operador."
    ]
  },
  {
    version: "2.0.0",
    build: 96,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b96",
    descripcion: "Tarjeta móvil de 'Última Operación' compactada a exactamente 2 filas interactivas.",
    cambios: [
      "Diseño compacto móvil de 2 filas (`pos-ultima-accion.tsx`): Eliminada la fila extra del botón `Ver Movimientos`; toda la tarjeta es ahora táctil/clicable con una flecha discreta a la derecha y muestra en la fila 1 `#venta + operación + tiempo` y en la fila 2 el detalle de productos en una línea."
    ]
  },
  {
    version: "2.0.0",
    build: 95,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b95",
    descripcion: "Estados vacíos uniformes en Carrito y Cuentas Activas con icono ampliado sin círculo y mayor tamaño de texto.",
    cambios: [
      "Estado vacío limpio y unificado (`pos-cart.tsx` y `pos-accounts.tsx`): Eliminado el contenedor circular alrededor de los iconos, ampliado el tamaño de los iconos a `h-10 w-10` (`stroke-[1.75]`) y aumentada la fuente a `text-sm font-medium` en ambos paneles."
    ]
  },
  {
    version: "2.0.0",
    build: 94,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b94",
    descripcion: "Restaurado el desenfoque automático tras cada Venta Rápida manteniendo el acceso directo global con F8.",
    cambios: [
      "Comportamiento seguro tras venta (`quick-dispatch-input.tsx`): Restaurado `disabled` durante el envío y llamado a `blur()` al finalizar para liberar el foco después de cada Venta Rápida y prevenir cobros accidentales repetidos.",
      "Atajo `F8` preservado: Para realizar otra venta rápida seguida sin usar el ratón, basta con presionar `F8`."
    ]
  },
  {
    version: "2.0.0",
    build: 93,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b93",
    descripcion: "Acceso directo global con F8 y retención automática de foco en el input de Venta Rápida.",
    cambios: [
      "Atajo de teclado global `F8` (`quick-dispatch-input.tsx`): Al presionar `F8` desde cualquier módulo de la aplicación, el cursor enfoca y selecciona automáticamente el campo de Venta Rápida (`ej: 3*coca*p1 (F8)`).",
      "Ventas rápidas consecutivas sin usar el ratón: Reemplazado `disabled` por `readOnly` durante el guardado y añadido reenfoque diferido tras completar el despacho para que el campo nunca pierda el foco al realizar múltiples ventas seguidas."
    ]
  },
  {
    version: "2.0.0",
    build: 92,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b92",
    descripcion: "Contenedores dinámicos en Punto de Venta y Cuentas Activas, con estado vacío unificado al estándar de Cuentas.",
    cambios: [
      "Crecimiento dinámico según contenido (`ventas/page.tsx`, `pos-cart.tsx`, `pos-accounts.tsx`): Eliminada la altura fija forzada en paneles vacíos (`items-start` y `max-h` con scroll automático al alcanzar el tope de pantalla). Ahora tanto el carrito como cuentas ocupan el mínimo espacio cuando están vacíos y crecen conforme se agregan elementos.",
      "Estado vacío unificado (`pos-cart.tsx` y `pos-accounts.tsx`): Igualados ambos estados vacíos con icono dentro de contenedor circular (`w-12 h-12 rounded-full border-[#2e2e2e]`) y tipografía `text-xs text-slate-400` con `py-7`."
    ]
  },
  {
    version: "2.0.0",
    build: 91,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b91",
    descripcion: "Equilibrio en cabecera del POS: etiquetas restauradas en Movimientos, Mesas y Tragamonedas manteniendo Historial solo con icono.",
    cambios: [
      "Cabecera equilibrada (`pos-header.tsx`): Restaurado el texto descriptivo en `Movimientos`, `Mesas` y `Tragamonedas` en pantallas `xl+`, manteniendo `Historial` en formato circular compacto de solo icono.",
      "Píldora adaptable (`pos-ultima-accion.tsx`): Ajustado el ancho máximo a `w-auto max-w-[280px] xl:max-w-[360px] 2xl:max-w-[460px]` para convivir cómodamente con los botones etiquetados."
    ]
  },
  {
    version: "2.0.0",
    build: 90,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b90",
    descripcion: "Integración de 'Última Operación' en la cabecera del POS y botones de acceso rápido con solo icono.",
    cambios: [
      "Cabecera optimizada (`pos-header.tsx` y `pos-ultima-accion.tsx`): Convertidos los 4 botones de navegación (Movimientos, Mesas, Tragamonedas, Historial) a botones circulares de solo icono (`h-9 w-9`), liberando todo el espacio central para mostrar la píldora interactiva de Última Operación entre el título y los botones.",
      "Máximo espacio vertical para transacciones (`ventas/page.tsx`): Eliminada la fila extra en escritorio (`lg:`), devolviendo toda la altura disponible al Carrito y a Cuentas Activas mientras la Última Operación permanece siempre visible en la parte superior."
    ]
  },
  {
    version: "2.0.0",
    build: 89,
    fecha: "2026-11-17",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b89",
    descripcion: "Barra compacta 'Última Operación' siempre visible en la parte superior del POS y scroll independiente en Carrito y Cuentas.",
    cambios: [
      "Visibilidad sin scroll en todas las pantallas (`ventas/page.tsx` y `pos-ultima-accion.tsx`): Rediseñado el bloque de Última Operación a una tira compacta de 1 línea (~46px) ubicada justo debajo del encabezado del Punto de Venta, quedando 100% visible al primer vistazo en móviles, laptops y escritorio.",
      "Scroll independiente en Carrito (`pos-cart.tsx`) y Cuentas Activas (`pos-accounts.tsx`): Añadido scroll interno (`lg:flex-1 lg:min-h-0 lg:overflow-y-auto`) para que las listas extensas no desborden la altura de la pantalla."
    ]
  },
  {
    version: "2.0.0",
    build: 88,
    fecha: "2026-11-16",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b88",
    descripcion: "Estandarización obligatoria del radio de borde `rounded-2xl` (16px) en todos los modales de la aplicación.",
    cambios: [
      "Blindaje global en primitivas (`dialog.tsx` y `alert-dialog.tsx`): Aplicado `rounded-2xl sm:rounded-2xl` al cierre de `cn(..., className, ...)` para garantizar que ningún modal sea sobrescrito con radios menores (`rounded-lg`, `rounded-xl`) o mayores (`rounded-3xl`) desde páginas individuales.",
      "Limpieza explícita en modales de Mesas (`start-session-dialog.tsx`, `time-adjust-dialog.tsx`): Unificado el fondo a `#252526` y eliminado el override `rounded-xl sm:rounded-lg`."
    ]
  },
  {
    version: "2.0.0",
    build: 87,
    fecha: "2026-11-16",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b87",
    descripcion: "Corrección de posicionamiento centrado de modales (`fixed` protegido contra sobreescritura de `relative`).",
    cambios: [
      "Centrado exacto en viewport (`modal-confirmacion.tsx`): Eliminada la clase `relative` del `DialogContent` que anulaba `fixed` mediante `tailwind-merge` y desplazaba el modal hacia abajo.",
      "Protección global en primitivas (`dialog.tsx` y `alert-dialog.tsx`): Asegurado `fixed` al final del `cn(...)` para garantizar que ningún modal pierda el centrado absoluto en el viewport aunque reciba clases externas."
    ]
  },
  {
    version: "2.0.0",
    build: 86,
    fecha: "2026-11-16",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b86",
    descripcion: "Despliegue global del estándar oficial de modales (Línea 1 Antigravity + SweetAlert2) en toda la aplicación.",
    cambios: [
      "Estilos e Iconos Globales (`globals.css`, `swal-icono.tsx` y `modal-confirmacion.tsx`): Exportado el componente reutilizable `ModalConfirmacion` y `SwalIcono` en `@/components/comunes` con bloqueo automático anti-doble clic, botón Cancelar a la izquierda y cierre protegido.",
      "Primitivas Globales (`dialog.tsx` y `alert-dialog.tsx`): Aplicada globalmente la animación `swal2-show`/`swal2-hide`, superficie Antigravity `#252526`, bordes `#2e2e2e`, pies alineados con `justify-between` y bloqueo por defecto de clics externos y tecla Escape.",
      "Migración de Módulos Operativos: Actualizados los diálogos en Punto de Venta (`pos-dialogs.tsx`), Mesas (`transfer-dialog.tsx`, `mesas-dialogs.tsx`), Compras (`delete-confirm-dialog.tsx`), Gastos (`dialogo-eliminar-gasto.tsx`), Mantenimiento (`dialogo-eliminar-cliente.tsx`, `DialogoEliminarProducto.tsx`) y Usuarios (`DialogoEliminarUsuario.tsx`)."
    ]
  },
  {
    version: "2.0.0",
    build: 85,
    fecha: "2026-11-16",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b85",
    descripcion: "Bloqueo preventivo anti-doble clic y estado de carga en botones de confirmación y cierre de modales.",
    cambios: [
      "Componente compartido `ModalFooterCompartido` (`modal-footer-compartido.tsx`): Unificado el pie de las 4 líneas de diseño con manejo nativo del estado `procesando`.",
      "Bloqueo seguro durante la ejecución (`comparador-casos-reales.tsx`): Al confirmar cualquier acción, el botón principal muestra spinner (`Loader2`) con el texto `Procesando...` y se deshabilitan simultáneamente el botón Confirmar, Cancelar y la `X` de cierre hasta que finaliza la operación."
    ]
  },
  {
    version: "2.0.0",
    build: 84,
    fecha: "2026-11-16",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b84",
    descripcion: "Iconos exactos de SweetAlert2 (success, error, warning, info, question) con sus animaciones CSS oficiales diferidas.",
    cambios: [
      "Iconos nativos idénticos a SweetAlert2 (`swal-icono.tsx` y `swal-iconos.css`): Implementados los 5 iconos canónicos con la estructura geométrica y proporciones exactas (`5em` = 80px): checkmark de éxito con trazado secuencial (`line-tip`/`line-long`), cruz de error (`x-mark` en rotación 3D), exclamación `!` de advertencia (`animate-i-mark`), `i` informativa y `?` de pregunta.",
      "Asignación semántica en casos reales (`datos-casos-reales.ts`): Cada uno de los 7 modales de prueba muestra el icono SweetAlert2 correspondiente (`question`, `warning`, `info`, `error`, `success`).",
      "Sincronización secuencial (`0.28s` de retardo): Todas las animaciones de los iconos inician justo después de completarse la entrada `swal2-show` del modal."
    ]
  },
  {
    version: "2.0.0",
    build: 83,
    fecha: "2026-11-16",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b83",
    descripcion: "Sincronización secuencial de animación: el icono inicia justo al finalizar la entrada del modal.",
    cambios: [
      "Retardo sincronizado en `SwalIcono` (`comparador-casos-reales.tsx`): Añadido `animation-delay: 0.28s` con modo `both` en `swal2-anim-warning`, `swal2-anim-error` y `swal2-anim-info`. De este modo, el modal completa su entrada `swal2Show` (0.3s) primero y, justo al estabilizarse, se despliega por completo la animación 3D del icono."
    ]
  },
  {
    version: "2.0.0",
    build: 82,
    fecha: "2026-11-16",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b82",
    descripcion: "Animación de entrada y diseño de iconos inspirados en SweetAlert2 en el comparador de modales.",
    cambios: [
      "Animación estilo SweetAlert2 (`comparador-casos-reales.tsx`): Implementados los keyframes oficiales `swal2Show` (0.3s con rebote sutil 0.7 ➔ 1.05 ➔ 0.95 ➔ 1) y `swal2Hide` (0.15s) en el diálogo del comparador.",
      "Componente `SwalIcono` (`swal-icono.tsx`): Anillo circular de borde grueso (`border-[3px]`) con las animaciones 3D de entrada únicas de SweetAlert2 (`swal2AnimateWarningIcon`/`IMark` en advertencias, `swal2AnimateErrorIcon`/`XMark` en errores y `swal2AnimateInfoIcon` en operaciones normales).",
      "Integración en las 4 líneas: Aplicado `SwalIcono` de manera uniforme en `linea-antigravity-oficial.tsx`, `linea-borde-superior.tsx`, `linea-glow-capsula.tsx` y `linea-pos-tactil.tsx`."
    ]
  },
  {
    version: "2.0.0",
    build: 81,
    fecha: "2026-11-16",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b81",
    descripcion: "Animación GPU fluida de entrada en modales, animación única de iconos al abrir y bloqueo de cierre accidental externo.",
    cambios: [
      "Animación de entrada 60fps (`comparador-casos-reales.tsx`): Eliminado `filter: blur`, `backdrop-blur` y clases de `tailwindcss-animate` en conflicto; reemplazada por transición GPU pura (`translate3d` + `scale(0.975 ➔ 1)` + `opacity` en 220ms) para apertura sedosa sin saltos.",
      "Animación de icono solo al entrar (`modalIconPop` y `modalHaloOnce`): Suprimidos los bucles infinitos (`animate-ping` / `animate-pulse`) en las 4 líneas de diseño; ahora el icono y su onda sutil se animan una sola vez al abrir el modal.",
      "Bloqueo de cierre fuera del modal: Configurados `onPointerDownOutside`, `onInteractOutside` y `onEscapeKeyDown` para evitar cierres accidentales al hacer clic en el fondo oscuro; el modal solo se cierra mediante los botones de acción o la 'X'."
    ]
  },
  {
    version: "2.0.0",
    build: 80,
    fecha: "2026-11-16",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b80",
    descripcion: "Animación sutil profesional en comparador de modales y unificación estricta de tamaños en controles (botones, inputs y selects).",
    cambios: [
      "Animación sutil de entrada y salida (`comparador-casos-reales.tsx`): Implementada transición `modalProIn`/`modalProOut` con curva `cubic-bezier(0.16, 1, 0.3, 1)` (desplazamiento suave de 12px, escala 0.96 ➔ 1 y desenfoque sutil) más animación elástica `modalIconPop` en el icono principal, probada primero en el comparador.",
      "Uniformidad de tamaños en controles (`modal-campos-compartidos.tsx` y las 4 líneas): Reemplazados selectores y campos simulados por controles reales (`<Select>`, `<Input>`, `<Button>`) todos bloqueados a altura estándar `h-9` (36px) y geometría `rounded-full`.",
      "Eliminación de duplicación JSX: Extraído el subcomponente compartido `ModalCamposCompartidos` para renderizar los 7 casos reales sin código repetido.",
      "Accesibilidad en Diálogo: Añadido `DialogTitle` (`sr-only`) y ocultado el botón de cierre redundante del contenedor padre."
    ]
  },
  {
    version: "2.0.0",
    build: 79,
    fecha: "2026-11-16",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b79",
    descripcion: "Modernización de las 4 líneas de modales: iconos más grandes con animaciones, estética moderna y botón Cancelar a la izquierda.",
    cambios: [
      "Iconos ampliados con animación (`linea-antigravity-oficial.tsx`, `linea-borde-superior.tsx`, `linea-glow-capsula.tsx`, `linea-pos-tactil.tsx`): Contenedores de 56px-60px (`h-7 w-7`) con halos animados (`animate-ping`, `animate-pulse`) y micro-interacciones suaves al pasar el cursor.",
      "Alineación consistente de acciones: Botón Cancelar posicionado al lado izquierdo (`justify-between`) y acción principal a la derecha en las 4 líneas de diseño.",
      "Estética moderna: Líneas de luz superior, degradados sutiles, sombras con profundidad y superficies translúcidas acordes al Antigravity Dark Theme.",
      "Nuevo caso real agregado (`datos-casos-reales.ts`): Añadido el modal '¡Tiempo Culminado!' de sesión de mesa como 7.º caso estándar de aviso."
    ]
  },
  {
    version: "2.0.0",
    build: 78,
    fecha: "2026-11-14",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b78",
    descripcion: "Estandarización de modales: 4 propuestas de líneas de diseño unificadas y comparador interactivo de los 6 casos reales de la aplicación.",
    cambios: [
      "Comparador de Casos Reales (`comparador-casos-reales.tsx`): Modelados los 6 modales exactos de la aplicación (Trasladar Mesa, Mover a Crédito, Cliente con Deuda, Consumo Interno, Descartar Cambios y Registrar Abono) con alternador dinámico de líneas de diseño.",
      "Línea 1 - Antigravity Oficial (`linea-antigravity-oficial.tsx`): Estándar sobrio y jerárquico con botón cancelar siempre neutro, botón confirmar semántico y botón cerrar 'X' universal.",
      "Línea 2 - Borde Superior Semántico (`linea-borde-superior.tsx`): Barra superior acentuada de 4px para identificación visual inmediata del tipo de evento.",
      "Línea 3 - Glow / Cápsula Suave (`linea-glow-capsula.tsx`): Esquinas pronunciadas y sombra perimetral atmosférica de color suave.",
      "Línea 4 - Táctil POS Ergonómico (`linea-pos-tactil.tsx`): Optimizado para pantallas táctiles con botones anchos al 50/50 en el pie del diálogo.",
      "Reglas Maestras de Modales (`page.tsx`): Documentadas las 5 reglas de oro para evitar inconsistencias de botones y bordes en futuros desarrollos."
    ]
  },
  {
    version: "2.0.0",
    build: 77,
    fecha: "2026-11-14",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b77",
    descripcion: "5 Diseños oficiales de mensajes en modales de diálogo emergente (éxito heroico, advertencia con impacto, error con diagnóstico, ficha informativa y decisión táctil).",
    cambios: [
      "Diseño 1 - Modal de Éxito Heroico (`modal-exito-hero.tsx`): Centrado ceremonial con halo esmeralda pulsante, desglose financiero inset (#141414) y acción rápida para imprimir ticket y encadenar siguiente venta.",
      "Diseño 2 - Modal de Advertencia con Impacto (`modal-advertencia-riesgo.tsx`): Borde superior ámbar brillante, caja descriptiva de consecuencias (impacto en caja, retorno de inventario y auditoría) y botones de confirmación duales.",
      "Diseño 3 - Modal de Error Crítico y Diagnóstico (`modal-error-diagnostico.tsx`): Mensaje humano para el operador y acordeón desplegable con código y timestamp para soporte técnico, con botón de reintento.",
      "Diseño 4 - Modal Informativo Multi-Dato (`modal-informativo-datos.tsx`): Ficha corporativa en azul Antigravity con cuadrícula de 4 datos operativos y lista de checkpoints verificados.",
      "Diseño 5 - Modal de Decisión Táctil (`modal-decision-tarjetas.tsx`): Interfaz de selección interactiva mediante tarjetas táctiles con radio para guiar al usuario entre opciones mutuamente excluyentes.",
      "Galería y Lanzadores Interactivos (`page.tsx`): Incorporada previsualización directa en tarjeta y disparadores rápidos para abrir los modales reales con overlay oscuro y animación completa."
    ]
  },
  {
    version: "2.0.0",
    build: 76,
    fecha: "2026-11-14",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b76",
    descripcion: "Nueva página de pruebas con 5 diseños visuales de mensajes y alertas operativas.",
    cambios: [
      "Diseño 1 (Acento Lateral y Píldora Inset): Borde lateral grueso de alto contraste, icono circular translúcido y botón de acción en píldora compacta.",
      "Diseño 2 (Tarjeta Resplandor / Glow Card): Degradado atmosférico suave, bloque recesivo (#141414) con desglose de valores clave y botones de acción duales.",
      "Diseño 3 (Banner Inline Táctil con Dismiss): Barra horizontal ultracompacta de baja altura con badge de severidad y botón de reintento/cierre rápido.",
      "Diseño 4 (Tarjeta Contextual Enriquecida): Cuadrícula estructurada para metadatos operativos (operador, terminal, correlativo y auditoría).",
      "Diseño 5 (Callout de Sugerencia Inteligente): Cápsula envolvente con gradiente púrpura/índigo y botón interactivo con acción reversible 'Deshacer'.",
      "Probador Interactivo Sandbox: Simulador con selector dinámico de variantes (éxito, advertencia, error, info) y alternador responsivo (Escritorio vs Móvil).",
      "Integración en Menú Lateral: Añadido enlace directo en la barra de navegación bajo la sección de Pruebas (`/dashboard/pruebas/disenos-mensajes`)."
    ]
  },
  {
    version: "2.0.0",
    build: 75,
    fecha: "2026-11-11",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b75",
    descripcion: "Optimización profunda de rendimiento, saneamiento de código y estandarización completa en Auditoría de Operaciones.",
    cambios: [
      "Optimización de Hook `use-auditoria.ts`: Eliminado código muerto y listeners innecesarios de hardware local; implementado control de UIDs consultados mediante `useRef` para evitar solicitudes en cascada a Firestore y ciclos de re-renderizado.",
      "Saneamiento de componentes: Eliminados archivos huérfanos (`auditoria-detalle-dialog.tsx` y `auditoria-equipo-dialog.tsx`), aligerando el bundle y simplificando el árbol de dependencias.",
      "Filtrado ágil y eficiente: Algoritmo de búsqueda optimizado para evaluar campos clave en lugar de serializar objetos completos, mejorando drásticamente el tiempo de respuesta al escribir en el buscador.",
      "Verificación de Controles Estándar: Confirmada la adhesión plena al Design System (`PageHeader`, `SurfaceCard`, `Paginacion`, `BotonVolverArriba` y controles tipo píldora `rounded-full`)."
    ]
  },
  {
    version: "2.0.0",
    build: 74,
    fecha: "2026-11-11",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b74",
    descripcion: "Texto limpio 'Período Actual' sin iconos en selector de Auditoría y carga completa sin límites por turno.",
    cambios: [
      "Texto sin iconos en selector de período (`page.tsx`): Actualizado el texto a 'Período Actual' eliminando iconos y emojis tanto en el disparador como en las opciones del selector de turnos.",
      "Carga exhaustiva de todos los registros del turno (`use-auditoria.ts`): Removido el límite restrictivo de 150 registros en consultas acotadas a turnos (tanto para el turno actual en curso como para turnos anteriores seleccionados), garantizando la visualización del 100% de los eventos del período seleccionado."
    ]
  },
  {
    version: "2.0.0",
    build: 73,
    fecha: "2026-11-11",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b73",
    descripcion: "Presentación concisa, no redundante y estructurada del contenido expandido en acordeones de Auditoría.",
    cambios: [
      "Eliminación de redundancias en acordeón (`auditoria-feed-item.tsx`): Suprimidas las repeticiones triples de productos, descripciones idénticas y volcados de metadatos crudos (`producto`, `cantidad`, `total`, `esVirtual`).",
      "Organización en 2 bloques semánticos limpios: Bloque 1 enfocado en la Operación (artículos, método de pago detectado, total liquidado y observaciones reales) y Bloque 2 enfocado en la Trazabilidad (operador responsable, terminal/equipo, marca de tiempo y parámetros útiles no redundantes).",
      "Diseño responsivo optimizado: Cuadrícula de 2 columnas en escritorio y flujo vertical compacto y ergonómico en vista móvil."
    ]
  },
  {
    version: "2.0.0",
    build: 72,
    fecha: "2026-11-11",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b72",
    descripcion: "Estandarización integral de Auditoría: paginación oficial, selector de período en encabezado, buscador con panel de filtros integrado y tarjetas móviles ultracompactas.",
    cambios: [
      "Paginación oficial estándar (`page.tsx` y `use-auditoria.ts`): Implementada paginación con `<Paginacion>` de `@/components/comunes` tanto para escritorio como para móvil, con selector de tamaño de página (10, 15, 25, 50, 100) y reseteo automático al filtrar.",
      "Selector de período en encabezado (`page.tsx`): Reemplazados los controles de 'Este equipo', 'Número de eventos' y 'Cargar 300' por el selector de período directamente en la barra de acciones del `PageHeader`.",
      "Buscador estándar con panel de filtros ocultos integrado (`auditoria-filtros.tsx`): Integrado el buscador en el contenedor principal con autoenfoque, botón de ajustes/filtros (`SlidersHorizontal`) y panel colapsable interior para usuarios y categorías.",
      "Tarjetas móviles ultracompactas (`auditoria-feed-item.tsx`): Reducida la altura vertical en móvil ocultando chips duplicados, dispositivo y marca de tiempo exacta de la cabecera colapsada, trasladándolos al interior del acordeón para una visualización táctil limpia de 2 líneas."
    ]
  },
  {
    version: "2.0.0",
    build: 71,
    fecha: "2026-11-11",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b71",
    descripcion: "Disposición en 2 columnas (izquierda/derecha) en tarjetas de Auditoría para un diseño compacto.",
    cambios: [
      "Cabecera en 2 columnas compactas (`auditoria-feed-item.tsx`): Reorganizada la cabecera del acordeón en una columna izquierda (icono, título, categoría, tiempo relativo, descripción y chips) y una columna derecha (operador responsable, rol, terminal/dispositivo y marca de tiempo exacta), eliminando el espacio en blanco vacío y reduciendo la altura vertical en un 50%.",
      "Contenido expandido en 2 columnas (`auditoria-feed-item.tsx`): Estructurado el desglose expandido en 2 columnas balanceadas (Columna izquierda: artículos y descripción; Columna derecha: operador, dispositivo, marca de tiempo y parámetros estructurados)."
    ]
  },
  {
    version: "2.0.0",
    build: 70,
    fecha: "2026-11-11",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b70",
    descripcion: "Rediseño de tarjetas de Auditoría de Operaciones en acordeón interactivo con desglose enriquecido.",
    cambios: [
      "Tarjetas de Auditoría en Acordeón (`auditoria-feed-item.tsx` y `page.tsx`): Rediseñadas las tarjetas de operaciones usando componentes estándar `<AccordionItem>`, `<AccordionTrigger>` y `<AccordionContent>`. Ahora cada tarjeta se expande directamente in-situ para revelar los detalles de la operación.",
      "Desglose integrado sin modales redundantes: Muestra dentro del acordeón la información del operador, dispositivo (PC/Tablet/Teléfono), marca de tiempo exacta, lista detallada de artículos involucrados con insignias y subtotales en `tabular-nums font-bold`, descripción completa y parámetros estructurados.",
      "Optimización responsiva y control volver arriba: Icono de categoría visible exclusivamente en vista normal (`hidden sm:flex`), badges en píldora (`rounded-full`) e incorporación de `<BotonVolverArriba threshold={150} />`."
    ]
  },
  {
    version: "2.0.0",
    build: 69,
    fecha: "2026-11-11",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b69",
    descripcion: "Integración unificada del buscador y preferencias en el contenedor principal de Control de Pagos.",
    cambios: [
      "Unificación en contenedor principal (`page.tsx` y `control-pagos-filtros.tsx`): Integrado el buscador de pagos y su panel colapsable de preferencias y filtros avanzados directamente dentro del contenedor principal (`SurfaceCard variant='panel'`), eliminando el contenedor separado superior tanto en la vista móvil como en la de escritorio."
    ]
  },
  {
    version: "2.0.0",
    build: 68,
    fecha: "2026-11-11",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b68",
    descripcion: "Visibilidad adaptativa de iconos en acordeones de Control de Pagos: exclusivo para vista normal/escritorio.",
    cambios: [
      "Ocultación de iconos de acordeón en vista móvil (`control-pagos-card.tsx`): Configurada la clase `hidden sm:flex` y ajuste de margen `gap-0 sm:gap-3` en el contenedor del método de pago de cada acordeón, de modo que los iconos circulares solo se muestren en la vista normal (pantallas `sm+`) y permanezcan ocultos en móviles para un diseño táctil ultracompacto sin desbordes."
    ]
  },
  {
    version: "2.0.0",
    build: 67,
    fecha: "2026-11-11",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b67",
    descripcion: "Estandarización y optimización integral de Control de Pagos: eliminación de métricas y CSV, iconos en acordeón, autoenfoque y paginación estándar.",
    cambios: [
      "Eliminación de métricas y exportación CSV (`page.tsx`): Removido el botón de exportación CSV del PageHeader y eliminadas las tarjetas métricas ejecutivas para maximizar el espacio útil y simplificar la pantalla.",
      "Iconos distintivos en acordeones (`control-pagos-card.tsx`): Añadidos iconos circulares en el encabezado de cada acordeón acorde al método de pago (Banknote para Efectivo, CreditCard para Tarjeta, Coins para Consumo Interno y ReceiptText para pagos múltiples/generales).",
      "Eliminación de botón de ticket unificado (`control-pagos-card.tsx`): Removido el botón 'Imprimir comprobante unificado' del pie de cada tarjeta acorde a lo solicitado.",
      "Foco automático en buscador y remoción de conteo de resultados (`control-pagos-filtros.tsx`): Agregado useRef con autoenfoque al cargar la vista y eliminado el badge de conteo de resultados ('X resultados') tanto en móvil como en escritorio.",
      "Paginación estándar del Design System y botón Volver Arriba (`page.tsx`): Integrados los componentes oficiales `<Paginacion>` y `<BotonVolverArriba threshold={150} />` de `@/components/comunes`.",
      "Optimización y carga ultrarrápida (`use-control-pagos.ts`): Agregados límites de seguridad en consultas Firestore (`limit(25)` en cierres y `limit(150)` en historial general), pre-cálculo de timestamps numéricos en la agrupación multi-venta y eliminación de loops innecesarios."
    ]
  },
  {
    version: "2.0.0",
    build: 66,
    fecha: "2026-11-11",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b66",
    descripcion: "Optimización de carga, autoenfoque de buscadores y acomodo responsivo multi-fila en selectores.",
    cambios: [
      "Acomodo adaptativo en selectores multi-fila (`src/components/comunes/pill-tabs.tsx`): Corregida la colisión visual cuando los selectores tienen más de una fila en móvil (`hasMultipleRows`). El contenedor ahora transiciona dinámicamente a `h-auto rounded-2xl` con separación `gap-1.5` y botones en píldora con altura propia `h-8`, evitando que los badges y textos de filas inferiores se salgan o choquen entre sí.",
      "Foco automático en buscadores al montar/cambiar de pestaña: Incorporado autoenfoque instantáneo (`autoFocus` con `useRef`) en el input de búsqueda de Flujo de Efectivo/Gaveta al cargar la página, así como en los buscadores de Flujo de Monedas y Kardex de Inventario al alternar entre pestañas.",
      "Optimización de consultas y rendimiento en `useMonitoreoIntegral` (`_hooks/use-monitoreo-integral.ts`): Añadido límite de 30 registros a la consulta de cierres históricos (`limit(30)`), y eliminados bloques de código huérfano y dependencias innecesarias para maximizar la velocidad de respuesta inicial de la página."
    ]
  },
  {
    version: "2.0.0",
    build: 65,
    fecha: "2026-11-11",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b65",
    descripcion: "Limpieza de bloque duplicado de Apertura en Flujo de Gaveta.",
    cambios: [
      "Corrección de sintaxis en `FlujoGaveta` (`src/app/dashboard/administracion/monitoreo-integral/_components/flujo-gaveta.tsx`): Eliminado bloque de código duplicado al final del archivo, restaurando la compilación limpia en Next.js."
    ]
  },
  {
    version: "2.0.0",
    build: 64,
    fecha: "2026-11-11",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b64",
    descripcion: "Optimización de espacio vertical, botón de opciones en buscador y diseño móvil ergonómico sin iconos circulares invasivos.",
    cambios: [
      "Reducción de espacio vertical en `PaginaMonitoreoIntegral` (`src/app/dashboard/administracion/monitoreo-integral/page.tsx`): Ajustada la separación entre cabecera, pestañas y contenedor principal a `space-y-2.5 sm:space-y-3.5` para eliminar espacios vacíos excesivos.",
      "Control de búsqueda con botón de opciones integrado en `FlujoGaveta`, `FlujoMonedas` y `KardexInventario`: Añadido botón con icono `SlidersHorizontal` en el input de búsqueda para desplegar y ocultar a demanda el selector de pestañas/categorías y el botón de ordenamiento, ganando valioso espacio en pantalla.",
      "Diseño móvil optimizado en tarjetas de datos en las 3 pestañas: Ocultado el icono circular grande de la izquierda en pantallas móviles (`hidden sm:flex`) e integrado el indicador de tipo de movimiento mediante micro-iconos directamente en las insignias (badges) de color, eliminando el apiñamiento horizontal."
    ]
  },
  {
    version: "2.0.0",
    build: 63,
    fecha: "2026-11-11",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b63",
    descripcion: "Ubicación dinámica de la Apertura de Kardex según el ordenamiento (inicio o final).",
    cambios: [
      "Posicionamiento condicional en `KardexInventario` (`src/app/dashboard/administracion/monitoreo-integral/_components/kardex-inventario.tsx`): La tarjeta de Apertura del período se muestra al inicio del listado cuando el orden es 'Antiguos primero' (orden cronológico ascendente) y al final del listado cuando el orden es 'Recientes primero' (orden cronológico descendente)."
    ]
  },
  {
    version: "2.0.0",
    build: 62,
    fecha: "2026-11-11",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b62",
    descripcion: "Corrección de cierre de fragmento JSX en Kardex de Inventario.",
    cambios: [
      "Corrección de sintaxis JSX en `KardexInventario` (`src/app/dashboard/administracion/monitoreo-integral/_components/kardex-inventario.tsx`): Corregido el cierre del mapeo de movimientos cronológicos y fragmento condicional para restaurar la compilación limpia de Turbopack."
    ]
  },
  {
    version: "2.0.0",
    build: 61,
    fecha: "2026-11-11",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b61",
    descripcion: "Unificación de pestaña 'Ventas y Despachos' en Flujo de Monedas y visualización de Apertura de existencia como primer registro en Kardex.",
    cambios: [
      "Unificación de pestaña en `FlujoMonedas` (`src/app/dashboard/administracion/monitoreo-integral/_components/flujo-monedas.tsx`): Integradas las categorías de 'Ventas' y 'Despachos' en una sola pestaña unificada ('Ventas y Despachos') con su contador global sumado y filtro combinado para ventas rápidas, consumos, abonos, cobros y despachos.",
      "Registro de apertura de stock como primer registro en `KardexInventario` (`src/app/dashboard/administracion/monitoreo-integral/_components/kardex-inventario.tsx`): Incorporada tarjeta inicial `<SurfaceCard variant=\"subcard\">` destacada con acento azul Antigravity al inicio del listado por cada producto, mostrando la fecha/hora de inicio de turno y las unidades exactas de existencia con que se aperturó el período antes de los movimientos cronológicos.",
      "Soporte de catálogo en `useMonitoreoIntegral` (`_hooks/use-monitoreo-integral.ts` y `page.tsx`): Añadida consulta de productos de la sucursal y paso de fecha de inicio del período para alimentar las aperturas iniciales de inventario."
    ]
  },
  {
    version: "2.0.0",
    build: 60,
    fecha: "2026-11-11",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b60",
    descripcion: "Exclusión de pestañas principales del contenedor y unificación de buscador con filtros y conteos en Monitoreo Integral.",
    cambios: [
      "Pestañas principales externas en `PaginaMonitoreoIntegral` (`src/app/dashboard/administracion/monitoreo-integral/page.tsx`): Excluidas las pestañas principales (`PillTabs`) del contenedor `SurfaceCard`, ubicándolas de forma independiente entre la cabecera y el panel de contenido.",
      "Integración de buscador y pestañas con conteos en `FlujoGaveta` (`flujo-gaveta.tsx`): Unificado el input de búsqueda con las pestañas de filtro ('Todos', 'Productos', 'Mesas') en un único control `PillTabs` con sus conteos numéricos respectivos y botón de ordenamiento alineado.",
      "Integración en `FlujoMonedas` y `KardexInventario` (`flujo-monedas.tsx` y `kardex-inventario.tsx`): Integrados los buscadores con sus correspondientes pestañas y badges de conteo numérico.",
      "Eliminación de franjas de título repetitivas: Suprimidos los encabezados ('Registro cronológico de cobros', 'Auditoría de monedas y tragamonedas', 'Kardex de movimientos físicos') para dar paso directo a las tarjetas de datos individuales."
    ]
  },
  {
    version: "2.0.0",
    build: 59,
    fecha: "2026-11-11",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b59",
    descripcion: "Visualización en tarjetas y contenedores individuales independientes para todos los listados de Monitoreo Integral.",
    cambios: [
      "Reemplazo de vista de tabla por tarjetas individuales en `FlujoGaveta` (`src/app/dashboard/administracion/monitoreo-integral/_components/flujo-gaveta.tsx`): Eliminado el contenedor único continuo con líneas de división (`divide-y`), transformando cada cobro y la apertura del período en tarjetas independientes `<SurfaceCard variant=\"surface\">` con separación `space-y-2.5`, bordes e iconos circulares.",
      "Contenedores individuales en `FlujoMonedas` (`src/app/dashboard/administracion/monitoreo-integral/_components/flujo-monedas.tsx`): Reemplazado el listado corrido por tarjetas individuales `<SurfaceCard>` con badges de estado, fecha, hora y métricas de importe y stock de monedas.",
      "Contenedores individuales en `KardexInventario` (`src/app/dashboard/administracion/monitoreo-integral/_components/kardex-inventario.tsx`): Convertido el registro de movimientos físicos a tarjetas independientes con distinción visual para entradas, salidas y productos eliminados."
    ]
  },
  {
    version: "2.0.0",
    build: 58,
    fecha: "2026-11-11",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b58",
    descripcion: "Depuración y estandarización visual oficial en Monitoreo Integral de Turno.",
    cambios: [
      "Depuración de cabecera en `PaginaMonitoreoIntegral` (`src/app/dashboard/administracion/monitoreo-integral/page.tsx`): Removido el botón 'Exportar CSV' y simplificada la cabecera manteniendo únicamente el selector de turnos en cápsula (`SelectTrigger rounded-full h-9 bg-[#252526] border-[#2e2e2e]`).",
      "Eliminación de tarjetas y pestaña de balance: Removidas las 3 tarjetas superiores de KPI ('Total efectivo esperado', 'Efectivo en gaveta' y 'Flujo neto monedas'), eliminada la pestaña 'Balance General' de `PillTabs` y retirado el subcomponente no utilizado `balance-turno.tsx`.",
      "Eliminación de métricas en pestañas de flujos (`flujo-gaveta.tsx` y `flujo-monedas.tsx`): Suprimidas las tiras de 4 tarjetas de métricas en ambas pestañas, dando acceso directo e inmediato al buscador y a las listas cronológicas de movimientos.",
      "Estandarización corporativa del Design System: Sustitución de paleta azulada residual (`#17202e`) por la paleta oficial Antigravity IDE Dark Theme (`#1e1e1e`, `#252526`, `#141414`, `#2e2e2e`), eliminación de fuentes monoespaciadas (`font-mono`) en importes a favor de `tabular-nums font-bold`, integración de `<CountBadge>` en cabeceras de listado y agregado del control estándar `<BotonVolverArriba />`."
    ]
  },
  {
    version: "2.0.0",
    build: 57,
    fecha: "2026-11-11",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b57",
    descripcion: "Auditoría integral, modularización y controles estándar en Inventario, Revisión Física e Historial de Revisiones.",
    cambios: [
      "Paginación y contenedor estándar en `PaginaInventario` (`src/app/dashboard/administracion/inventario/page.tsx`): Reemplazo del componente antiguo `InventarioPaginacion` por el componente oficial `<Paginacion />` de `@/components/comunes` con numeración circular y selector de filas, y unificación de espaciado en `<SurfaceCard variant=\"panel\" className=\"p-4 sm:p-5 space-y-4\">`.",
      "Sincronización segura y resumen de revisión en `useInventario` (`use-inventario.ts`), `InventarioFiltros` (`inventario-filtros.tsx`), `InventarioRevisionFooter` (`inventario-revision-footer.tsx`) y `realizarAjusteInventario` (`inventario.ts`): Preservación de conteos físicos en curso ante actualizaciones en tiempo real de Firestore, auto-foco reactivo al finalizar carga o cambiar modo, barra de resumen con `<CountBadge>` y uso de `serverTimestamp()`.",
      "Modularización en Historial de Revisiones (`src/app/dashboard/administracion/inventario/historial/`): División de la página en el hook `useHistorialAjustes` (`_hooks/use-historial-ajustes.ts`) y el subcomponente `AjusteInventarioAcordeon` (`_components/ajuste-inventario-acordeon.tsx`) cumpliendo la regla anti-código monolítico."
    ]
  },
  {
    version: "2.0.0",
    build: 56,
    fecha: "2026-11-11",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b56",
    descripcion: "Badge compacto de una sola línea para la diferencia en tarjetas de Revisión de Inventario.",
    cambios: [
      "Ajuste en `InventarioRevisionItem` (`src/app/dashboard/administracion/inventario/_components/inventario-revision-item.tsx`): Simplificado el badge de diferencia a formato compacto de una sola fila (`Dif: +N` / `Dif: -N` con `h-5 whitespace-nowrap`) alineado junto a la ubicación del producto."
    ]
  },
  {
    version: "2.0.0",
    build: 55,
    fecha: "2026-11-10",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b55",
    descripcion: "Registro completo de todos los productos en revisiones de inventario y visualización diferenciada de productos con y sin cambios.",
    cambios: [
      "Cabecera de 2 columnas en `PaginaHistorialAjustes` (`src/app/dashboard/administracion/inventario/historial/page.tsx`): Primera columna con 'Ajuste #N' arriba y fecha/hora abajo; segunda columna con el número de productos e indicador de modificados.",
      "Persistencia del estado de todos los productos (`use-inventario.ts` e `inventario.ts`): Al guardar una revisión de inventario se registra la instantánea de todos los productos (actualizando stock y kardex únicamente en los que tuvieron diferencias).",
      "Visualización adaptativa en revisión e historial (`inventario-revision-item.tsx` y `historial/page.tsx`): Los productos sin modificación se muestran en formato normal limpio ('Existencia: N') y los que tuvieron modificaciones despliegan el detalle completo ('Sistema ➔ Físico' y badge de 'Diferencia')."
    ]
  },
  {
    version: "2.0.0",
    build: 54,
    fecha: "2026-11-10",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b54",
    descripcion: "Estandarización de cabecera PageHeader, tarjetas, paginación y BotonVolverArriba en Historial de Revisiones de Inventario.",
    cambios: [
      "Estandarización en `PaginaHistorialAjustes` (`src/app/dashboard/administracion/inventario/historial/page.tsx`): Reemplazo del encabezado antiguo por `<PageHeader>` oficial con botón 'Regresar' alineado, contenedor `<SurfaceCard variant=\"panel\">`, buscador con auto-foco, acordeón con tipografía `tabular-nums`, `<Paginacion>` oficial y `<BotonVolverArriba />`."
    ]
  },
  {
    version: "2.0.0",
    build: 53,
    fecha: "2026-11-10",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b53",
    descripcion: "Optimización de cabecera móvil, filtros desplegables, auto-foco y BotonVolverArriba en Inventario.",
    cambios: [
      "Cabecera en `PaginaInventario` (`src/app/dashboard/administracion/inventario/page.tsx`): Removido el botón redundante 'Traslados', configurados los botones 'Historial' y 'Hacer Revisión' como iconos circulares compactos en vista móvil (`h-9 w-9 p-0 rounded-full`) y texto completo en escritorio, e integrado `<BotonVolverArriba />`.",
      "Filtros colapsables y auto-foco en `InventarioFiltros` (`src/app/dashboard/administracion/inventario/_components/inventario-filtros.tsx`): Añadido botón `SlidersHorizontal` dentro de la barra de búsqueda para mostrar u ocultar los selectores de ubicación y ordenamiento (ocultos por defecto) y auto-foco automático en el buscador al abrir la página."
    ]
  },
  {
    version: "2.0.0",
    build: 52,
    fecha: "2026-11-10",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b52",
    descripcion: "Botón circular de solo icono en vista móvil para el acceso a Historial en Cierre de Caja.",
    cambios: [
      "Ajuste responsivo en `PaginaCierreCaja` (`src/app/dashboard/cierre-caja/page.tsx`): El botón de acceso al historial en la cabecera muestra ahora únicamente su icono circular (`h-9 w-9 p-0 rounded-full`) en vista móvil (`< sm`) y el texto completo 'Historial de Cierres' en escritorio (`sm+`)."
    ]
  },
  {
    version: "2.0.0",
    build: 51,
    fecha: "2026-11-10",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b51",
    descripcion: "Botones circulares de solo icono en vista móvil para los accesos directos de Gestión de Tragamonedas.",
    cambios: [
      "Cabecera responsiva en `PaginaGestionTragamonedas` (`src/app/dashboard/gestion-tragamonedas/page.tsx`): Los accesos directos a 'Ventas' y 'Sala de Juegos' muestran únicamente sus iconos circulares en vista móvil (`h-9 w-9 p-0 rounded-full`) y despliegan icono + texto en pantallas de escritorio (`sm:w-auto sm:px-3.5`), permitiendo ver el título de la página sin recortes."
    ]
  },
  {
    version: "2.0.0",
    build: 50,
    fecha: "2026-11-10",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b50",
    descripcion: "Texto compacto 'Historial' en vista móvil para el botón de cabecera en Cierre de Caja.",
    cambios: [
      "Ajuste responsivo en `PaginaCierreCaja` (`src/app/dashboard/cierre-caja/page.tsx`): El botón de acción en la cabecera muestra ahora 'Historial' en vista móvil (`< sm`) e 'Historial de Cierres' en escritorio (`sm+`), dando espacio para visualizar el título completo 'Cierre de Caja'."
    ]
  },
  {
    version: "2.0.0",
    build: 49,
    fecha: "2026-11-10",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b49",
    descripcion: "Creación del control estándar BotonVolverArriba e integración en Cierre de Caja e Historiales.",
    cambios: [
      "Componente común `BotonVolverArriba` (`src/components/comunes/boton-volver-arriba.tsx`): Creado el botón flotante circular estándar del Design System para volver al inicio de la página, con detección automática de desplazamiento tanto en el contenedor `<main>` del dashboard como en `window`.",
      "Integración en `PaginaCierreCaja` (`src/app/dashboard/cierre-caja/page.tsx`), `HistorialCierresCajaPage` (`src/app/dashboard/cierre-caja/historial/page.tsx`) e `HistorialVentasPage` (`src/app/dashboard/historial-ventas/page.tsx`): Unificados el lugar, acción y aspecto del control de subida al inicio."
    ]
  },
  {
    version: "2.0.0",
    build: 48,
    fecha: "2026-11-10",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b48",
    descripcion: "Optimización móvil del encabezado de acordeón en Historial de Cierres de Caja.",
    cambios: [
      "Diseño responsivo en `CierreCajaItemAcordeon` (`src/app/dashboard/cierre-caja/historial/_components/cierre-caja-item-acordeon.tsx`): Ocultado el icono circular en vista móvil (`hidden sm:flex`) y reestructurada la cabecera en 2 columnas balanceadas (`grid-cols-[1fr_auto]`) con 3 filas ordenadas a la izquierda (Fecha + Cierre #N, Horario del turno, Cajero) y cifras + badge de estado a la derecha, evitando que los montos se recorten o se amontonen."
    ]
  },
  {
    version: "2.0.0",
    build: 47,
    fecha: "2026-11-10",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b47",
    descripcion: "Auto-foco automático en el campo Total Físico en Caja al cargar Cierre de Caja.",
    cambios: [
      "Ajuste en `useCierreCaja` (`src/app/dashboard/cierre-caja/_hooks/use-cierre-caja.ts`) y `CierreConteoCard` (`src/app/dashboard/cierre-caja/_components/cierre-conteo-card.tsx`): Sincronizado el foco inicial con la finalización de carga de datos del período (`!cargando && estadoCaja && fechaInicioPeriodo`) y propiedad `autoFocus` para posicionar el cursor inmediatamente en el input 'Total Físico en Caja'."
    ]
  },
  {
    version: "2.0.0",
    build: 46,
    fecha: "2026-11-10",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b46",
    descripcion: "Eliminación de paneles y botones de detalle de flujos en Cierre de Caja.",
    cambios: [
      "Simplificación en `CierreConteoCard` (`cierre-conteo-card.tsx`), `PaginaCierreCaja` (`page.tsx`) y `useCierreCaja` (`use-cierre-caja.ts`): Removidos los botones 'Detalle', estados de apertura y paneles desplegables de flujo de efectivo, tarjeta y monedas (incluyendo la eliminación de `historial-pagos-efectivo.tsx`, `historial-pagos-tarjeta.tsx` e `historial-monedas.tsx`), dado que dicha consulta está centralizada en Monitoreo Integral y Auditoría."
    ]
  },
  {
    version: "2.0.0",
    build: 45,
    fecha: "2026-11-10",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b45",
    descripcion: "Mejoras de distribución, auto-foco y desglose explicativo en Historial de Cierres de Caja.",
    cambios: [
      "Ajuste en `HistorialCierresCajaPage` (`src/app/dashboard/cierre-caja/historial/page.tsx`) y `PillTabs` (`src/components/comunes/pill-tabs.tsx`): Integrado el buscador a la izquierda y las pestañas ('Pendientes' y 'Todos los Registros') a la derecha en la misma píldora estándar, con auto-foco automático en el buscador al iniciar la página y padding interno (`p-4 sm:p-5`) en el contenedor principal.",
      "Rediseño comprensible en `CierreCajaItemAcordeon` (`src/app/dashboard/cierre-caja/historial/_components/cierre-caja-item-acordeon.tsx`): Cabecera enriquecida con folio, rango horario, cajero y estado; interior organizado con franja de 4 indicadores clave y 3 bloques explicativos paso a paso (1. Origen del Efectivo y Arqueo, 2. Liquidación y Estado, 3. Control de Monedas)."
    ]
  },
  {
    version: "2.0.0",
    build: 44,
    fecha: "2026-11-10",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b44",
    descripcion: "Unificación tipográfica de cantidades, optimización de carga y controles estándar en Cierre de Caja e Historial de Cierres.",
    cambios: [
      "Unificación tipográfica en `CierreConteoCard`, `CierreLiquidacionCard`, `PaginaCierreCaja`, `HistorialPagosEfectivo`, `HistorialPagosTarjeta`, `HistorialMonedas` y `CierreCajaItemAcordeon`: Eliminada por completo la mezcla de `font-mono` con otras fuentes en cantidades y desgloses, estandarizando todos los montos y campos numéricos con `font-body` / `font-headline` y `tabular-nums`.",
      "Optimización de carga y modularización en `useCierreCaja` (`use-cierre-caja.ts`) y `HistorialPagosMetodo` (`historial-pagos-efectivo.tsx` / `historial-pagos-tarjeta.tsx`): Desbloqueo de renderizado inicial (`cargando` acotado a `generales/actual` y sucursal) y consolidación de los historiales de pagos en efectivo y tarjeta en un componente compartido con buscador y `CountBadge`.",
      "Optimización y controles estándar en `HistorialCierresCajaPage` (`src/app/dashboard/cierre-caja/historial/`): Carga inicial ligera acotada para mostrar primero los cierres pendientes y consulta completa al pulsar 'Todos los Registros', reemplazando el switch y paginación manual por `<PillTabs>` y `<Paginacion>`."
    ]
  },
  {
    version: "2.0.0",
    build: 43,
    fecha: "2026-11-10",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b43",
    descripcion: "Optimización de consultas Firestore (eliminación N+1), modularización de bloques y carga diferida en Gestión de Tragamonedas.",
    cambios: [
      "Optimización en `useGestionTragamonedas` (`src/app/dashboard/gestion-tragamonedas/_hooks/use-gestion-tragamonedas.ts`): Reemplazo de listeners individuales por tarjeta (`N+1`) por una suscripción única a la colección `generales_tragamonedas` y precarga de `fechaInicioPeriodo`.",
      "Modularización en `MaquinaCard` (`maquina-card.tsx`) y nuevo `ModalOperacionMaquina` (`modal-operacion-maquina.tsx`): Extracción de los modales de Base y Extracción a una sola instancia compartida en la página y aplicación de `React.memo`.",
      "Carga diferida en `HistorialModal` (`src/app/dashboard/gestion-tragamonedas/_components/historial-modal.tsx`): Al abrir el modal se cargan por defecto únicamente los registros del turno actual, ejecutando la consulta de todos los registros históricos solo cuando el usuario selecciona la pestaña 'Todos los Registros' (con paginación estándar integrada)."
    ]
  },
  {
    version: "2.0.0",
    build: 42,
    fecha: "2026-11-10",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b42",
    descripcion: "Centrado vertical del icono circular en las tarjetas de HistorialModal de tragamonedas.",
    cambios: [
      "Ajuste en `HistorialModal` (`src/app/dashboard/gestion-tragamonedas/_components/historial-modal.tsx`): Alineado verticalmente al centro (`items-center`) el icono circular de cada tarjeta de movimiento."
    ]
  },
  {
    version: "2.0.0",
    build: 41,
    fecha: "2026-11-10",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b41",
    descripcion: "Ubicación del monto a la derecha sobre el botón Anular en HistorialModal de tragamonedas.",
    cambios: [
      "Ajuste en `HistorialModal` (`src/app/dashboard/gestion-tragamonedas/_components/historial-modal.tsx`): Reubicado el monto de cada movimiento al extremo derecho superior de la tarjeta, justo encima del botón 'Anular'."
    ]
  },
  {
    version: "2.0.0",
    build: 40,
    fecha: "2026-11-10",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b40",
    descripcion: "Estandarización visual de modales y tarjetas en Gestión y Configuración de Tragamonedas.",
    cambios: [
      "Estandarización en `MaquinaCard` (`src/app/dashboard/gestion-tragamonedas/_components/maquina-card.tsx`), `HistorialModal` (`src/app/dashboard/gestion-tragamonedas/_components/historial-modal.tsx`), `PremioForm` (`src/app/dashboard/gestion-tragamonedas/_components/premio-form.tsx`) y `PaginaGestionTragamonedas` (`src/app/dashboard/gestion-tragamonedas/page.tsx`): Cabeceras con icono circular translúcido, tipografía `font-body` / `font-headline` con cifras `tabular-nums`, buscador integrado con `PillTabs`, contenedores `SurfaceCard` y botones de pie de modal alineados (`Cancelar` a la izquierda y confirmación a la derecha).",
      "Estandarización en `TragamonedasDialog` y `EliminarMaquinaDialog` (`src/app/dashboard/configuraciones/tragamonedas/_components/`)."
    ]
  },
  {
    version: "2.0.0",
    build: 39,
    fecha: "2026-11-10",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b39",
    descripcion: "Botones de acción perfectamente circulares en modo solo icono en cuentas activas.",
    cambios: [
      "Ajuste en `FilaBotonesAccionCuenta` (`src/app/dashboard/ventas/_components/pos-accounts.tsx`): Aplicado `h-7 w-7 p-0 rounded-full` cuando los botones se muestran en modo compacto de solo icono, logrando una proporción circular exacta (28x28px) en lugar de ovalada."
    ]
  },
  {
    version: "2.0.0",
    build: 38,
    fecha: "2026-11-10",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b38",
    descripcion: "Adaptación dinámica de botones de acción en cuentas activas según el ancho disponible.",
    cambios: [
      "Mejora en `POSAccounts` (`src/app/dashboard/ventas/_components/pos-accounts.tsx`): Implementado `FilaBotonesAccionCuenta` con `ResizeObserver` para mostrar iconos y textos en todos los botones cuando el ancho de la tarjeta lo permite, o colapsar automáticamente a solo iconos (manteniendo siempre icono + texto en el botón 'Pagar') cuando el espacio es reducido."
    ]
  },
  {
    version: "2.0.0",
    build: 37,
    fecha: "2026-11-10",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b37",
    descripcion: "Auto-foco en buscador de Nueva Cuenta y etiqueta descriptiva en contador de productos a trasladar.",
    cambios: [
      "Mejora en `DialogoTrasladoCuenta` (`src/app/dashboard/ventas/_components/dialogo-traslado-cuenta.tsx`): Auto-foco automático en el campo `AutocompleteInput` al seleccionar la pestaña 'Nueva Cuenta', y etiqueta descriptiva 'Productos a trasladar:' junto al `CountBadge`."
    ]
  },
  {
    version: "2.0.0",
    build: 36,
    fecha: "2026-11-10",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b36",
    descripcion: "Buscador de cliente en Traslado de Cuenta restringido solo a búsqueda de clientes existentes.",
    cambios: [
      "Ajuste en `DialogoTrasladoCuenta` (`src/app/dashboard/ventas/_components/dialogo-traslado-cuenta.tsx`) y `useVentas` (`src/app/dashboard/ventas/_hooks/use-ventas.ts`): Deshabilitada la opción de crear cliente nuevo en el `AutocompleteInput` del traslado de cuenta para permitir únicamente buscar y seleccionar clientes existentes."
    ]
  },
  {
    version: "2.0.0",
    build: 35,
    fecha: "2026-11-10",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b35",
    descripcion: "Ajuste de altura uniforme en PillTabs, AutocompleteInput en Traslado de Cuenta y corrección de márgenes.",
    cambios: [
      "Ajuste en `PillTabs` (`src/components/comunes/pill-tabs.tsx`): Añadido `h-full py-0` en `TabsTrigger` para que las pestañas con y sin `CountBadge` tengan exactamente la misma altura.",
      "Optimización en `DialogoTrasladoCuenta` (`src/app/dashboard/ventas/_components/dialogo-traslado-cuenta.tsx`) y `useVentas` (`src/app/dashboard/ventas/_hooks/use-ventas.ts`): Reemplazo del doble buscador/select en 'Nueva Cuenta' por el control único `AutocompleteInput` del POS, alineación del botón 'Cancelar' a la izquierda (`sm:justify-between`) y margen interior (`px-1.5 -mx-1.5`) para evitar recortes en los bordes de foco."
    ]
  },
  {
    version: "2.0.0",
    build: 34,
    fecha: "2026-11-10",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b34",
    descripcion: "Estandarización del modal de Traslado de Cuenta con los controles oficiales del Design System.",
    cambios: [
      "Estandarización en `DialogoTrasladoCuenta` (`src/app/dashboard/ventas/_components/dialogo-traslado-cuenta.tsx`) y `POSAccounts` (`src/app/dashboard/ventas/_components/pos-accounts.tsx`): Reemplazo de estilos personalizados por los componentes oficiales del sistema (`PillTabs`, `SurfaceCard`, `CountBadge`, `Checkbox` y `Button` primario en paleta oficial Azul Antigravity)."
    ]
  },
  {
    version: "2.0.0",
    build: 33,
    fecha: "2026-11-10",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b33",
    descripcion: "Limpieza de bloques duplicados en DialogoUltimosMovimientos, POSAccounts y useVentas.",
    cambios: [
      "Depuración de archivos en módulo de Ventas (`dialogo-ultimos-movimientos.tsx`, `pos-accounts.tsx`, `use-ventas.ts`, `version.ts`): Eliminadas líneas y propiedades duplicadas para garantizar compilación limpia."
    ]
  },
  {
    version: "2.0.0",
    build: 32,
    fecha: "2026-11-10",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b32",
    descripcion: "Corrección de sintaxis en desestructuración de propiedades de PaginaVentasPOS.",
    cambios: [
      "Corrección en `PaginaVentasPOS` (`src/app/dashboard/ventas/page.tsx`): Eliminada la línea duplicada `dialogsProps` en la desestructuración del hook `useVentas`."
    ]
  },
  {
    version: "2.0.0",
    build: 31,
    fecha: "2026-11-09",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b31",
    descripcion: "Traslado y fusión atómica de cuentas activas en Punto de Venta (traslado total o parcial con eliminación de cuenta en cero).",
    cambios: [
      "Transacción atómica en `trasladarItemsDeCuenta` (`src/lib/firebase/servicios/ventas.ts`): Implementada la lógica de traspaso atómico de productos o cuentas completas entre clientes mediante `runTransaction`. Si la cuenta de origen queda con saldo Q0.00 o sin ítems, se elimina automáticamente de Firestore.",
      "Componente modal `DialogoTrasladoCuenta` (`src/app/dashboard/ventas/_components/dialogo-traslado-cuenta.tsx`): Creada interfaz con selección de cuenta destino (existente o nueva cuenta de catálogo), modo de traslado (toda la cuenta o selección por ítem y cantidades) y resumen de impacto financiero en tiempo real.",
      "Acción en Cuentas Activas (`pos-accounts.tsx`): Integrado el botón `[ ⇄ Trasladar ]` en el acordeón de cada cuenta activa y conectado al flujo de auditoría de Últimos Movimientos del Turno."
    ]
  },
  {
    version: "2.0.0",
    build: 30,
    fecha: "2026-11-08",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b30",
    descripcion: "Eliminación de paginación en auditoría rápida de Últimos Movimientos del Turno a favor de scroll continuo.",
    cambios: [
      "Scroll fluido en `DialogoUltimosMovimientos` (`src/app/dashboard/ventas/_components/dialogo-ultimos-movimientos.tsx`): Removida la paginación innecesaria en el modal de auditoría de turno tanto en vista móvil como de escritorio, permitiendo la exploración inmediata y continua de todas las operaciones del turno actual con scrollbar nativo optimizado."
    ]
  },
  {
    version: "2.0.0",
    build: 29,
    fecha: "2026-11-08",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b29",
    descripcion: "Separación vertical responsiva en PillTabs para móvil con texto, iconos y badges legibles.",
    cambios: [
      "Diseño responsivo móvil en `PillTabs` (`src/components/comunes/pill-tabs.tsx`): Al incluir buscador integrado, en vista móvil (`< sm`) se desacopla en dos filas ordenadas: Fila 1 con buscador a 100% de ancho y Fila 2 con las pestañas completas mostrando icono, texto de etiqueta y badge de conteo sin recortes. En escritorio (`sm+`) se conserva la píldora horizontal unificada.",
      "Iconos informativos en pestañas de auditoría (`dialogo-ultimos-movimientos.tsx`): Asignados iconos (`Layers` para Todos, `ShoppingCart` para Ventas, `CreditCard` para Cobros) mejorando la identificación visual inmediata."
    ]
  },
  {
    version: "2.0.0",
    build: 28,
    fecha: "2026-11-08",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b28",
    descripcion: "Botones responsivos en cabecera de Control de Estaciones (solo icono en vista móvil).",
    cambios: [
      "Cabecera responsiva en `MesasPage` (`src/app/dashboard/mesas/page.tsx`): Configurados los botones de acceso rápido a 'Punto de Venta' y 'Tragamonedas' para mostrar únicamente sus iconos circulares en vista móvil (`h-9 w-9 p-0 rounded-full`) y desplegar el texto completo en pantallas de escritorio (`sm:inline sm:px-3.5`), evitando que el título de la página se comprima o mutile."
    ]
  },
  {
    version: "2.0.0",
    build: 27,
    fecha: "2026-11-08",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b27",
    descripcion: "Arquitectura responsiva dual profesional (móvil y escritorio) para el componente Paginacion.",
    cambios: [
      "Diseño responsivo dual desacoplado en `Paginacion` (`src/components/comunes/paginacion.tsx`): Separadas las interfaces móvil (`sm:hidden`) y escritorio (`hidden sm:flex`). En móvil se distribuye en dos filas ordenadas: Fila 1 con resumen de página y selector de filas, y Fila 2 con barra de navegación de ancho completo (`[ < Anterior ]`, botones circulares perfectos `w-8 h-8 aspect-square` y `[ Siguiente > ]`), eliminando desbordamientos, cortes de botones y scrolls horizontales."
    ]
  },
  {
    version: "2.0.0",
    build: 26,
    fecha: "2026-11-08",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b26",
    descripcion: "Botones circulares redondos sin distorsión ovalada y aprovechamiento total del ancho del contenedor en paginación.",
    cambios: [
      "Geometría circular perfecta (`w-8 h-8 aspect-square p-0 rounded-full`) en `Paginacion` (`src/components/comunes/paginacion.tsx`): Corregida la relación de aspecto de los números de página eliminando paddings asimétricos para que sean 100% redondos y nunca ovalados.",
      "Distribución de ancho completo (`w-full flex justify-between`): Se habilitó la visualización completa de elementos numéricos aprovechando todo el ancho del contenedor en una sola fila equilibrada."
    ]
  },
  {
    version: "2.0.0",
    build: 25,
    fecha: "2026-11-08",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b25",
    descripcion: "Garantía de fila única en controles de paginación para vistas móviles sin salto de línea.",
    cambios: [
      "Fila única estricta en `Paginacion` (`src/components/comunes/paginacion.tsx`): Implementada la función `generarItemsPaginacion` con bandera reactiva `ocultarEnMovil` y contenedor `flex-nowrap`, permitiendo que los botones `[ < Anterior ]`, números circulares y `[ Siguiente > ]` permanezcan siempre alineados en una sola fila en móviles sin desbordar ni partirse en dos líneas."
    ]
  },
  {
    version: "2.0.0",
    build: 24,
    fecha: "2026-11-08",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b24",
    descripcion: "Adición de etiquetas de texto 'Anterior' y 'Siguiente' junto a sus iconos en los controles de paginación.",
    cambios: [
      "Botones de navegación en `Paginacion` (`src/components/comunes/paginacion.tsx`): Actualizados los controles de página previa y siguiente para incluir texto explícito junto a su icono (`[ < Anterior ]` y `[ Siguiente > ]`) manteniendo el formato ergonómico de píldora redondeada `rounded-full` y la numeración circular central."
    ]
  },
  {
    version: "2.0.0",
    build: 23,
    fecha: "2026-11-08",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b23",
    descripcion: "Integración de numeración circular estándar en componente Paginacion con salto directo a páginas.",
    cambios: [
      "Numeración circular en `Paginacion` (`src/components/comunes/paginacion.tsx`): Implementada la visualización de páginas con botones circulares (`[ < ] [ 1 ] [ 2 ] ... [ 108 ] [ > ]` y vista intermedia `[ < ] [ 1 ] ... [ 5 ] [ 6 ] [ 7 ] ... [ 108 ] [ > ]`), con estilo activo azul Antigravity (`bg-sky-600 font-black text-white`) y botones inactivos en superficie estándar (`bg-[#252526] hover:bg-[#313131] border-[#2e2e2e]`).",
      "Navegación directa en `HistorialVentasPage` y `useHistorialVentas`: Expuesto `setCurrentPage` para permitir saltos directos a cualquier página al hacer clic en su número correspondiente."
    ]
  },
  {
    version: "2.0.0",
    build: 22,
    fecha: "2026-11-08",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b22",
    descripcion: "Reubicación de botón Regresar al lado derecho con texto y habilitación de descripción en vista móvil.",
    cambios: [
      "Botón Regresar al lado derecho en `PageHeader` (`src/components/comunes/page-header.tsx`): Reubicado el botón de retroceso a la derecha de la cabecera mostrando icono y texto 'Regresar' (`[ ← Regresar ]`) tanto en escritorio como en vista móvil.",
      "Descripción visible en móvil: Removida la clase `hidden sm:block` en `PageHeader`, permitiendo que el subtítulo explicativo de la página se visualice también en pantallas móviles."
    ]
  },
  {
    version: "2.0.0",
    build: 21,
    fecha: "2026-11-08",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b21",
    descripcion: "Estandarización del componente común Paginacion e integración en Historial de Ventas y Últimos Movimientos.",
    cambios: [
      "Componente común `Paginacion` (`src/components/comunes/paginacion.tsx`): Creado el componente estándar oficial del Design System para paginación ('Página X de Y (N registros) | Mostrar: [10 filas ⌵]' con botones redondeados '[ < Anterior ] [ Siguiente > ]').",
      "Documentación en `AGENTS.md`: Registrado `<Paginacion>` en la sección de componentes comunes oficiales disponibles.",
      "Integración en `HistorialVentasPage` y `DialogoUltimosMovimientos`: Sustitución de controles manuales por el componente común `<Paginacion />` en historial de ventas y adición de paginación fluida en el modal de auditoría de turno."
    ]
  },
  {
    version: "2.0.0",
    build: 20,
    fecha: "2026-11-08",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b20",
    descripcion: "Estandarización de badges activos en pestañas a color ámbar corporativo.",
    cambios: [
      "Badge activo ámbar en `dialogo-ultimos-movimientos.tsx` y `pill-tabs.tsx`: Configurado el badge numérico de conteo (`CountBadge`) con la variante 'amber' (`bg-amber-400 text-slate-950 font-black`) para la pestaña actualmente activa, garantizando contraste óptimo y cumplimiento estricto de la regla de diseño 2C."
    ]
  },
  {
    version: "2.0.0",
    build: 19,
    fecha: "2026-11-08",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b19",
    descripcion: "Inclusión de ventas rápidas de contado en la pestaña de cobros y visualización del método de pago en auditoría.",
    cambios: [
      "Inclusión de ventas rápidas en cobros (`src/app/dashboard/ventas/_components/dialogo-ultimos-movimientos.tsx`): Las ventas rápidas (`venta_rapida`), al ser transacciones cobradas de contado en el acto, ahora se contabilizan y listan tanto en la pestaña 'Ventas' como en 'Cobros'.",
      "Indicador de método de pago en auditoría (`use-ventas.ts` y `dialogo-ultimos-movimientos.tsx`): Integrada la visualización del método de pago (`Efectivo`, `Tarjeta`) en la línea de autoría de cada tarjeta de movimiento."
    ]
  },
  {
    version: "2.0.0",
    build: 18,
    fecha: "2026-11-08",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b18",
    descripcion: "Corrección de categorización de cobros y abonos en auditoría POS y autofoco automático en el buscador al cambiar de pestaña.",
    cambios: [
      "Categorización de cobros en `use-ventas.ts`: Mapeo exhaustivo insensible a mayúsculas para acciones `VENTA_PAGAR`, `PAGO_REGISTRAR`, `PAGO_UNIFICADO`, `VENTA_ABONAR`, `PAGO_ABONO` y `ABONO_REGISTRADO`, permitiendo que la pestaña 'Cobros' filtre y muestre correctamente todos los pagos y abonos del turno con sus montos reales (`montoPagado`, `montoAbonado`, `totalLiquidado`).",
      "Autofoco automático en buscador (`src/components/comunes/pill-tabs.tsx` y `dialogo-ultimos-movimientos.tsx`): Al hacer clic en cualquiera de las pestañas ('Todos', 'Ventas', 'Cobros'), el foco del cursor se traslada de inmediato al campo de búsqueda."
    ]
  },
  {
    version: "2.0.0",
    build: 17,
    fecha: "2026-11-08",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b17",
    descripcion: "Estandarización de botones en cabecera de ventas, botón de cortesía compacto en móvil e integración del control estándar PillTabs en modal de últimos movimientos.",
    cambios: [
      "Cabecera de ventas responsive (`src/app/dashboard/ventas/_components/pos-header.tsx`): Los botones superiores muestran texto e icono en escritorio (`hidden sm:inline`) y se compactan en iconos circulares (`w-9 h-9`) en vistas móviles.",
      "Botón de Cortesía compacto en móvil (`src/app/dashboard/ventas/_components/pos-accounts.tsx`): El botón 'Cortesía' en cuentas abiertas ahora oculta el texto en móvil (`hidden sm:inline`) mostrando únicamente el icono para no saturar la fila de acciones.",
      "Modal de Últimos Movimientos con control estándar (`src/app/dashboard/ventas/_components/dialogo-ultimos-movimientos.tsx`): Integrado el componente oficial `PillTabs` con buscador a la izquierda y pestañas a la derecha, eliminación de mayúsculas sostenidas (`Artículos procesados:`) y aplicación de la paleta oficial Antigravity (`#1e1e1e`, `#252526`, `#141414`)."
    ]
  },
  {
    version: "2.0.0",
    build: 16,
    fecha: "2026-11-08",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b16",
    descripcion: "Menú lateral desplegable flotante sobre la página y adición de icono de búsqueda estándar en buscador de clientes del POS.",
    cambios: [
      "Menú lateral flotante (`src/components/ui/sidebar.tsx`): El menú ahora se despliega por encima de la página (`absolute z-50 shadow-2xl`) manteniendo constante el ancho del riel base (`w-[var(--sidebar-width-icon)]`), eliminando el redimensionamiento, desplazamiento y reducción de espacio de las vistas principales.",
      "Cierre al hacer clic fuera: Integrado listener para replegar automáticamente el menú flotante al hacer clic sobre la página.",
      "Icono de búsqueda estándar en `AutocompleteInput` (`src/components/ui/autocomplete-input.tsx` y `pos-form.tsx`): Integrado el icono estándar `Search` centrado con padding simétrico `pl-10` en el campo de 'Buscar o crear cliente...' del Punto de Venta."
    ]
  },
  {
    version: "2.0.0",
    build: 15,
    fecha: "2026-11-08",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b15",
    descripcion: "Optimización de la tarjeta de Última Operación en POS: icono centrado y ampliado, eliminación de duplicidad de datos y corrección de folio en despacho rápido.",
    cambios: [
      "Icono centrado y ampliado en `POSUltimaAccion` (`src/app/dashboard/ventas/_components/pos-ultima-accion.tsx`): Contenedor circular incrementado a `w-11 h-11` con icono de `w-5 h-5` / `w-6 h-6`, centrado verticalmente con la información.",
      "Eliminación de duplicidad de datos: Reorganización limpia de badges y texto (`[Última Operación] [#Folio] Acción (Cliente)`), eliminando la repetición del número de venta y el nombre en el título.",
      "Corrección de folio en venta rápida: Integrado retorno de `idVenta` y `idPago` en la transacción de `procesarVentaRapidaConId` (`src/lib/firebase/servicios/ventas.ts`) y validación estricta contra `#undefined` en `quick-dispatch-input.tsx`, `use-ventas.ts` y `pos-ultima-accion.tsx`."
    ]
  },
  {
    version: "2.0.0",
    build: 14,
    fecha: "2026-11-08",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b14",
    descripcion: "Reubicación de la tarjeta de última operación en la columna derecha (cuentas) al fondo de la pantalla.",
    cambios: [
      "Reubicación en `PaginaVentasPOS` (`src/app/dashboard/ventas/page.tsx`): Trasladada la tarjeta de última operación a la columna derecha (debajo del listado de cuentas abiertas) fijada en la parte inferior de la pantalla con `mt-auto`, dejando la columna de venta completamente despejada."
    ]
  },
  {
    version: "2.0.0",
    build: 13,
    fecha: "2026-11-08",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b13",
    descripcion: "Anclaje de la tarjeta de última operación hasta el borde inferior de la pantalla en Punto de Venta.",
    cambios: [
      "Alineación vertical completa en `PaginaVentasPOS` (`src/app/dashboard/ventas/page.tsx`): Configurada la altura dinámica `min-h-[calc(100vh-6.5rem)]` con distribución `flex-1 items-stretch` y `mt-auto` en la columna del POS, asegurando que la tarjeta de última operación se fije en el extremo inferior de la pantalla eliminando el espacio vacío."
    ]
  },
  {
    version: "2.0.0",
    build: 12,
    fecha: "2026-11-08",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b12",
    descripcion: "Reubicación de la barra de última operación al final del panel del Punto de Venta.",
    cambios: [
      "Reubicación en `PaginaVentasPOS` (`src/app/dashboard/ventas/page.tsx`): La tarjeta de última operación se trasladó debajo del contenedor de venta y carrito de compras, despejando la parte superior para un acceso inmediato al buscador de clientes y controles principales.",
      "Eliminación de mayúsculas sostenidas: Ajustado el badge de `Última Operación` a formato título legible sin clase `uppercase`."
    ]
  },
  {
    version: "2.0.0",
    build: 11,
    fecha: "2026-11-08",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b11",
    descripcion: "Certeza operativa en Punto de Venta: barra de última acción persistente, feed de movimientos y highlight de cuentas.",
    cambios: [
      "Barra de Última Acción (`pos-ultima-accion.tsx`): Tarjeta persistente visible en todo momento en el Punto de Venta que confirma al instante la última venta, despacho rápido o cobro procesado con detalle de artículos, folio, monto y tiempo transcurrido.",
      "Diálogo de Últimos Movimientos (`dialogo-ultimos-movimientos.tsx`): Modal de auditoría rápida accesible con 1 clic desde la cabecera del POS o desde la barra de última acción, con filtros por tipo (Ventas/Cobros), buscador y desglose de artículos en tiempo real.",
      "Resaltado en Cuentas Pendientes (`pos-accounts.tsx`): Indicador de confirmación visual ('Recién actualizada') con pulso de color para saber con certeza que los productos agregados ya forman parte de la cuenta del cliente.",
      "Sincronización unificada en `use-ventas.ts` y `quick-dispatch-input.tsx`: Integración bidireccional inmediata en memoria y con la bitácora de auditoría de Firestore."
    ]
  },
  {
    version: "2.0.0",
    build: 10,
    fecha: "2026-11-08",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b10",
    descripcion: "Jerarquía de elevación en 4 capas para separación nítida de contenedores principales.",
    cambios: [
      "Diferenciación de Contenedores Principales: Configurado el fondo base de la aplicación (Canvas/Body) en `#121212` (`--background: 0 0% 7%`) y los paneles principales (`SurfaceCard variant=\"panel\"` y `bg-app-panel`) en `#1e1e1e` con bordes `#2e2e2e`, eliminando el problema de fusión visual entre el fondo y los contenedores.",
      "Profundidad y contraste multicapa: Capa 0 Canvas (`#121212`), Capa 1 Paneles (`#1e1e1e`), Capa 2 Tarjetas/Surfaces (`#252526`), Capa 3 Insets/Subcards (`#141414`), garantizando que cada contenedor principal (ej. Punto de Venta y Cuentas abiertas) destaque como un bloque claramente delimitado.",
      "Actualización de tokens y reglas: Sincronización en `globals.css`, `tailwind.config.ts`, `surface-card.tsx`, `AGENTS.md` y `.ai-rules.md`."
    ]
  },
  {
    version: "2.0.0",
    build: 9,
    fecha: "2026-11-08",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b9",
    descripcion: "Migración integral a la paleta oficial oscura del IDE Antigravity.",
    cambios: [
      "Paleta oficial Antigravity IDE Dark Modern: Reemplazo global de la gama azulada (#1d283a, #283244, #324157) por la paleta neutra y profesional del IDE Antigravity: paneles `#1e1e1e`, superficies/tarjetas `#252526`, bordes `#2e2e2e`, inputs `#252526`/`#313131` y acentos azul `#0078D4`.",
      "Configuración en `tailwind.config.ts` y `globals.css`: Actualizadas las variables semánticas de Tailwind y del modo oscuro (`.dark`) con los valores exactos del tema oscuro de Antigravity IDE.",
      "Actualización de reglas maestras en `AGENTS.md` y `.ai-rules.md`: Establecida la paleta de Antigravity IDE como la norma oficial corporativa para futuros desarrollos."
    ]
  },
  {
    version: "2.0.0",
    build: 8,
    fecha: "2026-11-06",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b8",
    descripcion: "Estructura simétrica de 2 columnas en cabecera de tarjeta de historial de ventas.",
    cambios: [
      "Rediseño en 2 columnas en `HistorialVentaItem` (`src/app/dashboard/historial-ventas/_components/historial-venta-item.tsx`): Columna 1 (Izquierda: Cliente + Venta en fila 1, Turno en fila 2, Fecha y hora en fila 3); Columna 2 (Derecha: Total en fila 1, Pendiente en fila 2, Badge de Estado en fila 3).",
      "Alineación simétrica y legible: Distribución exacta solicitada que previene recortes de texto y otorga balance visual perfecto en móvil y escritorio."
    ]
  },
  {
    version: "2.0.0",
    build: 7,
    fecha: "2026-11-06",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b7",
    descripcion: "Reorganización de cabecera de venta en 3 filas para nombres de clientes y textos sin recortes.",
    cambios: [
      "Cabecera en 3 filas en `HistorialVentaItem` (`src/app/dashboard/historial-ventas/_components/historial-venta-item.tsx`): Fila 1 dedicada para nombre del cliente completo y monto total; Fila 2 para badges de turno/cortesía y estado de pago/abono; Fila 3 para folio y fecha/hora completa sin truncamiento.",
      "Garantía de nombre de cliente en `useHistorialVentas` (`src/app/dashboard/historial-ventas/_hooks/use-historial-ventas.ts`): Fallback seguro de lectura hacia `vOriginal.clienteNombre` y valor predeterminado 'Consumidor Final', evitando que el campo quede en blanco."
    ]
  },
  {
    version: "2.0.0",
    build: 6,
    fecha: "2026-11-06",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b6",
    descripcion: "Centrado y auto-scroll inteligente para teclados virtuales en dispositivos móviles.",
    cambios: [
      "Componente global `MobileKeyboardHandler` (`src/components/comunes/mobile-keyboard-handler.tsx`): Exclusivo para vista móvil (< 768px), detecta el foco en cajas de texto y controles editables, calcula la apertura del teclado virtual y centra suavemente el elemento en pantalla (`scrollIntoView({ block: 'center' })`), previniendo que el teclado tape lo que se está escribiendo.",
      "Margen dinámico temporal: Añade holgura inferior al contenedor de scroll durante la edición de campos inferiores, garantizando que alcancen el centro del área visible sin topar con el límite inferior del scroll.",
      "Soporte `interactive-widget=resizes-content` y altura dinámica `100dvh`: Configuración en viewport (`src/app/layout.tsx`) y layout dashboard para redimensionar el contenido visible en Chrome/Safari móvil."
    ]
  },
  {
    version: "2.0.0",
    build: 5,
    fecha: "2026-11-06",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b5",
    descripcion: "Botones circulares compactos en la misma fila del POS y prevención de advertencias de foco en modales.",
    cambios: [
      "Optimización de cabecera en `POSHeader` (`src/app/dashboard/ventas/_components/pos-header.tsx`): Botones de navegación (Sala de Juegos, Tragamonedas e Historial) simplificados a iconos circulares (`rounded-full h-9 w-9`) con colores corporativos y ubicados en la misma fila del título para ahorrar espacio vertical en móvil.",
      "Alineación en la misma fila en `PageHeader` (`src/components/comunes/page-header.tsx`): Contenedor `flex-row items-center justify-between` que asegura que los botones de acción compartan la misma fila con el título.",
      "Prevención de advertencia de accesibilidad aria-hidden en `DialogContent`, `AlertDialogContent` y `SheetContent` (`src/components/ui/`): Desenfoque automático seguro del elemento de fondo antes de montar el overlay del modal, evitando advertencias de 'Blocked aria-hidden on an element because its descendant retained focus'."
    ]
  },
  {
    version: "2.0.0",
    build: 4,
    fecha: "2026-11-06",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b4",
    descripcion: "Centrado de título e icono en cabecera móvil y alineación del contador en pie de paginación.",
    cambios: [
      "Cabecera centrada en móvil en `PageHeader` (`src/components/comunes/page-header.tsx`): Restaurado el icono circular con `History` visible en pantallas móviles, alineando el conjunto título + icono de forma centrada y manteniendo el botón de retorno circular anclado al margen izquierdo.",
      "Centrado de paginación en `HistorialVentasPage` (`src/app/dashboard/historial-ventas/page.tsx`): Alineación centrada del texto de conteo de páginas (`Página X de Y`) y selector de filas dentro del espacio disponible en dispositivos móviles."
    ]
  },
  {
    version: "2.0.0",
    build: 3,
    fecha: "2026-11-06",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b3",
    descripcion: "Optimización móvil de Historial de Ventas: botón circular de retorno al POS, reubicación de filas y botón flotante de scroll.",
    cambios: [
      "Botón de retorno al POS en móvil: Botón circular con icono de flecha (`ArrowLeft`) situado a la izquierda del título en `PageHeader` (`src/components/comunes/page-header.tsx`), eliminando el texto redundante y el desbordamiento en pantallas pequeñas.",
      "Reubicación del selector de filas en `HistorialVentasPage` (`src/app/dashboard/historial-ventas/page.tsx`): Integrado en el pie de paginación inferior junto al conteo de páginas, eliminando la fila adicional huérfana en vista móvil y permitiendo que la barra de búsqueda y pestañas ocupe el 100% del ancho.",
      "Rediseño estructurado de la tarjeta de venta en `HistorialVentaItem` (`src/app/dashboard/historial-ventas/_components/historial-venta-item.tsx`): Cabecera en 2 filas limpias (Cliente + Estado/Total; Folio Venta + Fecha/Abonado) eliminando duplicidades.",
      "Botón flotante Volver Arriba: Botón circular flotante con icono `ArrowUp` y animación suave que aparece dinámicamente al desplazarse hacia abajo en la pantalla."
    ]
  },
  {
    version: "2.0.0",
    build: 2,
    fecha: "2026-11-06",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v2.0.0-b2",
    descripcion: "Optimización de consultas dinámicas por turno y eliminación de código redundante en Historial de Ventas.",
    cambios: [
      "Optimización de carga en `useHistorialVentas` (`src/app/dashboard/historial-ventas/_hooks/use-historial-ventas.ts`): Carga inicial estricta acotada al turno actual (`where('fecha', '>=', fechaInicioPeriodo)`); al cambiar a 'Todos los Turnos' se activa una nueva consulta controlada (`limit(150)`), evitando descargas masivas innecesarias.",
      "Eliminación de código redundante: Remoción de cálculos no utilizados (`resumenTotales`), supresión de consultas globales innecesarias (`ventasCreditoQuery`) y normalización terminológica de modales en `HistorialDialogs`."
    ]
  },
  {
    version: "2.0.0",
    build: 1,
    fecha: "2026-11-06",
    estado: "publicada_anterior",
    tipo: "Mayor",
    tagGit: "v2.0.0-b1",
    descripcion: "Lanzamiento oficial de Pool Control v2.0.0. Rediseño integral de Historial de Ventas, control independiente de paginación y optimización de experiencia.",
    cambios: [
      "Lanzamiento de versión Mayor 2.0.0 con reinicio de build a 1.",
      "Reubicación del selector de filas en `HistorialVentasPage` (`src/app/dashboard/historial-ventas/page.tsx`): Posicionado al lado derecho fuera del buscador, manteniendo altura uniforme `h-11` y estética píldora corporativa.",
      "Arquitectura de Historial de Ventas v2.0: Trazabilidad precisa de pagos por artículo sin duplicidad y cabecera estructurada en 2 columnas."
    ]
  },
  {
    version: "1.0.0",
    build: 396,
    fecha: "2026-11-06",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b396",
    descripcion: "Integración del selector de filas en la barra de búsqueda y remoción de la franja secundaria en Historial de Ventas.",
    cambios: [
      "Soporte `searchExtra` en `PillTabs` (`src/components/comunes/pill-tabs.tsx`): Integración del selector de filas directamente a la derecha del input de búsqueda en la misma píldora estándar.",
      "Limpieza en `HistorialVentasPage` (`src/app/dashboard/historial-ventas/page.tsx`): Remoción del contenedor secundario de totales y reubicación del selector de filas junto al buscador."
    ]
  },
  {
    version: "1.0.0",
    build: 395,
    fecha: "2026-11-06",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b395",
    descripcion: "Distribución personalizada en 2 columnas de la cabecera del acordeón de ventas.",
    cambios: [
      "Estructura en dos columnas en `HistorialVentaItem` (`src/app/dashboard/historial-ventas/_components/historial-venta-item.tsx`): Primera columna con Cliente y Turno arriba, Venta y Fecha abajo; segunda columna con Total y Saldo Pendiente arriba, Monto Pagado abajo."
    ]
  },
  {
    version: "1.0.0",
    build: 394,
    fecha: "2026-11-06",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b394",
    descripcion: "Reorganización armónica y equilibrio visual de la cabecera del acordeón de ventas.",
    cambios: [
      "Estructura balanceada en `HistorialVentaItem` (`src/app/dashboard/historial-ventas/_components/historial-venta-item.tsx`): Separación clara entre identidad a la izquierda (Folio 'Venta [ID]', Cliente y Fecha/Hora en dos niveles limpios) y bloque financiero unificado a la derecha (Total de la venta, Badge de Saldo Pendiente o Pagada, y Monto Abonado)."
    ]
  },
  {
    version: "1.0.0",
    build: 393,
    fecha: "2026-11-06",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b393",
    descripcion: "Estandarización de términos a 'Pago', eliminación del '#' y desglose de importes individuales por pago.",
    cambios: [
      "Estandarización terminológica en `HistorialVentaItem` y `HistorialVentasPage`: Reemplazo del término 'Recibo #' por 'Pago [ID]' en listados y búsquedas.",
      "Desglose de importes por pago en artículos: Cuando múltiples pagos amortizan un producto, se muestra el aporte exacto de cada uno (ej. `Pago 197: Q15.00 + Pago 198: Q5.00`)."
    ]
  },
  {
    version: "1.0.0",
    build: 392,
    fecha: "2026-11-06",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b392",
    descripcion: "Consolidación y eliminación de duplicidad de datos en detalle de ventas y comprobantes.",
    cambios: [
      "Eliminación de duplicidad en `HistorialVentaItem` (`src/app/dashboard/historial-ventas/_components/historial-venta-item.tsx`): Se asociaron los números de recibo directamente en cada artículo de consumo ('Pagado con Recibo #X' o 'Abonado con Recibo #Y') y se aligeró el bloque de pagos a una lista directa de comprobantes sin listas redundantes ni barras repetidas."
    ]
  },
  {
    version: "1.0.0",
    build: 391,
    fecha: "2026-11-06",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b391",
    descripcion: "Trazabilidad exacta de pagos y artículos con estado de abono individual y desglose por comprobante.",
    cambios: [
      "Trazabilidad artículo-pago en `HistorialVentaItem` (`src/app/dashboard/historial-ventas/_components/historial-venta-item.tsx`): Desglose del estado de pago de cada producto ('Pagado completo', 'Abonado QX / Resta QY' con barra visual de progreso o 'Sin abonar'), y subbloque directo en cada comprobante con los artículos cubiertos (+QX.XX) clasificados en 'Total' o 'Parcial'."
    ]
  },
  {
    version: "1.0.0",
    build: 390,
    fecha: "2026-11-06",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b390",
    descripcion: "Rediseño minimalista, claro y preciso de ventas y pagos en el Historial de Ventas.",
    cambios: [
      "Rediseño limpio de `HistorialVentaItem` (`src/app/dashboard/historial-ventas/_components/historial-venta-item.tsx`): Eliminación de alertas y textos extensos innecesarios; fila principal simplificada con indicador único de estado ('Pagada' o 'Pendiente: QX.XX'); detalle expandido estructurado en dos bloques paralelos concisos: 'Artículos Consumidos' (formato ticket) e 'Historial de Pagos y Abonos' con recibo, método, monto y balance final."
    ]
  },
  {
    version: "1.0.0",
    build: 389,
    fecha: "2026-11-05",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b389",
    descripcion: "Corrección de cálculo individualizado por comprobante para abonos distribuidos en Historial de Ventas.",
    cambios: [
      "Desacoplamiento de acumulados en `HistorialVentaItem` (`src/app/dashboard/historial-ventas/_components/historial-venta-item.tsx`): Se corrigió el cálculo del banner de abono distribuido para que evalúe individualmente cada recibo (`p.montoTotalPagado` vs `p.totalOperacion`) y no el monto acumulado del turno (`totalPagadoPeriodo`), evitando incoherencias cuando una venta recibe múltiples abonos o pagos en la misma jornada.",
      "Nota contextual directa en tarjeta de comprobante indicando el monto global entregado y su partición hacia la venta y otras cuentas."
    ]
  },
  {
    version: "1.0.0",
    build: 388,
    fecha: "2026-11-05",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b388",
    descripcion: "Claridad total en el Historial de Ventas para abonos generales distribuidos, desglose de saldo restante y artículos cubiertos.",
    cambios: [
      "Claridad financiera en `HistorialVentaItem` (`src/app/dashboard/historial-ventas/_components/historial-venta-item.tsx`): Desglose triple en el encabezado ('Cobrado', 'Total Venta' y 'Resta / Liquidada'), banner informativo para abonos generales que cubren múltiples cuentas y créditos, y desglose de artículos cubiertos por cada recibo.",
      "Recuperación garantizada de ventas en `useHistorialVentas` (`src/app/dashboard/historial-ventas/_hooks/use-historial-ventas.ts`): Carga en segundo plano de ventas históricas asociadas a comprobantes del turno actual para evitar información vacía o inconsistente."
    ]
  },
  {
    version: "1.0.0",
    build: 387,
    fecha: "2026-11-05",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b387",
    descripcion: "Corrección de centrado en pantalla del modal de pago en POS.",
    cambios: [
      "Centrado de diálogo en `POSDialogs` (`src/app/dashboard/ventas/_components/pos-dialogs.tsx`): Remoción de la clase redundante `relative` en `DialogContent` que sobreescribía el posicionamiento `fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`, asegurando el centrado perfecto del modal de cobro en pantalla."
    ]
  },
  {
    version: "1.0.0",
    build: 386,
    fecha: "2026-11-05",
    estado: "archivada",
    tipo: "Parche",
    tagGit: "v1.0.0-b386",
    descripcion: "Capa de bloqueo y animación de carga al procesar pagos y abonos en el modal de cobro del POS.",
    cambios: [
      "Bloqueo y animación de carga en `use-ventas.ts` y `POSDialogs` (`src/app/dashboard/ventas/_components/pos-dialogs.tsx`): Activación de `procesandoGuardado` durante `procederConPago` y `manejarConfirmarAbono`, desactivación interactiva de botones y modales, indicadores `<Loader2 />` animados en botones y capa superior de bloqueo con backdrop blur y tarjeta animada de estado."
    ]
  },
  {
    version: "1.0.0",
    build: 385,
    fecha: "2026-11-05",
    estado: "archivada",
    tipo: "Parche",
    tagGit: "v1.0.0-b385",
    descripcion: "Compactación ergonómica horizontal del resumen de cuenta en el modal de crédito en POS.",
    cambios: [
      "Compactación en `POSDialogs` (`src/app/dashboard/ventas/_components/pos-dialogs.tsx`): Integración del cliente y el saldo a diferir en una sola fila horizontal (`h-9` / `px-3 py-2`), reduciendo drásticamente la altura del modal y eliminando separadores innecesarios."
    ]
  },
  {
    version: "1.0.0",
    build: 384,
    fecha: "2026-11-05",
    estado: "archivada",
    tipo: "Parche",
    tagGit: "v1.0.0-b384",
    descripcion: "Rediseño profesional del modal de confirmación '¿Mover Cuenta a Crédito?' con icono animado y desglose financiero.",
    cambios: [
      "Rediseño de modal de crédito en `POSDialogs` (`src/app/dashboard/ventas/_components/pos-dialogs.tsx`): Contenedor ampliado `sm:max-w-md`, icono animado con halo pulsante en ámbar (`animate-ping` y `animate-pulse`), tarjeta interior de resumen con cliente y saldo a diferir, redacción profesional del impacto de diferimiento y botón de acción en ámbar institucional."
    ]
  },
  {
    version: "1.0.0",
    build: 383,
    fecha: "2026-11-05",
    estado: "archivada",
    tipo: "Parche",
    tagGit: "v1.0.0-b383",
    descripcion: "Estandarización integral del módulo Historial de Ventas con controles corporativos, barra unificada de búsqueda/pestañas y modales.",
    cambios: [
      "Estandarización de `HistorialVentasPage` (`src/app/dashboard/historial-ventas/page.tsx`): Integración de `<PillTabs>` con buscador a la izquierda y pestañas 'Turno Actual' / 'Todos los Turnos' con `<CountBadge>`, franja de resumen de cobros ('Efectivo', 'Tarjeta', 'Total Cobrado') y selector de filas por página.",
      "Estandarización de `HistorialVentaItem` (`src/app/dashboard/historial-ventas/_components/historial-venta-item.tsx`): Tarjetas de artículos consumidos y cobros con paleta corporativa, soporte correcto para cobros en 'Cortesía' y botones de acción semánticos redondeados.",
      "Extracción y rediseño de modales en `HistorialDialogs` (`src/app/dashboard/historial-ventas/_components/historial-dialogs.tsx`): Modales de anulación de venta y cambio de método de pago con bloque visual de ruta y controles estándar."
    ]
  },
  {
    version: "1.0.0",
    build: 382,
    fecha: "2026-11-05",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b382",
    descripcion: "Rediseño visual del modal Registrar Abono en POS con desglose en columnas e input de tamaño estándar.",
    cambios: [
      "Rediseño de tarjeta de saldos e input en `POSDialogs` (`src/app/dashboard/ventas/_components/pos-dialogs.tsx`): Tarjeta dividida en 2 columnas ('Cuenta Actual' y 'Crédito') con barra inferior 'Deuda Total' y cálculo en vivo de 'Restante tras abono'; normalización del input a altura estándar `h-10 text-sm`."
    ]
  },
  {
    version: "1.0.0",
    build: 381,
    fecha: "2026-11-05",
    estado: "archivada",
    tipo: "Parche",
    tagGit: "v1.0.0-b381",
    descripcion: "Alineación en una sola fila de los botones de acción de cuentas activas en POS para pantallas medianas y pequeñas.",
    cambios: [
      "Ajuste compacto de botones ('Cortesía', 'Editar', 'Crédito', 'Pagar') en `POSAccounts` (`src/app/dashboard/ventas/_components/pos-accounts.tsx`): Uso de `flex-nowrap gap-1.5`, altura `h-7 px-2.5`, texto `text-[11px]` e iconos `h-3 w-3` para mantenerse siempre en una sola fila."
    ]
  },
  {
    version: "1.0.0",
    build: 380,
    fecha: "2026-11-05",
    estado: "archivada",
    tipo: "Parche",
    tagGit: "v1.0.0-b380",
    descripcion: "Reducción de espaciado vertical y alineación por fila en el desglose de cuentas con crédito en POS.",
    cambios: [
      "Compactación de filas Cliente, Crédito y Total en `POSAccounts` (`src/app/dashboard/ventas/_components/pos-accounts.tsx`): Reemplazo de márgenes amplios por filas horizontales compactas (`space-y-0.5`, `py-0.5`) manteniendo alineación exacta entre etiquetas y montos."
    ]
  },
  {
    version: "1.0.0",
    build: 379,
    fecha: "2026-11-05",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b379",
    descripcion: "Desactivación global de descripciones emergentes (tooltips y atributos `title` nativos) en toda la aplicación.",
    cambios: [
      "Desactivación global de `TooltipContent` (`src/components/ui/tooltip.tsx`) y limpieza de wrappers en `POSAccounts` (`src/app/dashboard/ventas/_components/pos-accounts.tsx`).",
      "Supresión global de atributos `title` nativos al pasar el cursor (`src/context/theme-provider.tsx`) para eliminar las descripciones flotantes del navegador en toda la aplicación."
    ]
  },
  {
    version: "1.0.0",
    build: 378,
    fecha: "2026-11-05",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b378",
    descripcion: "Estandarización de tooltips flotantes en píldora para las descripciones de botones en Punto de Venta.",
    cambios: [
      "Diseño corporativo de `TooltipContent` (`src/components/ui/tooltip.tsx`): Formato píldora (`rounded-full`), fondo `#1e1e1e`, borde `#2e2e2e` y renderizado en portal para evitar recortes.",
      "Reemplazo de atributos `title` nativos por `<Tooltip>` en `POSAccounts` (`src/app/dashboard/ventas/_components/pos-accounts.tsx`) y `PillTabs` (`src/components/comunes/pill-tabs.tsx`)."
    ]
  },
  {
    version: "1.0.0",
    build: 377,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b377",
    descripcion: "Botones con color semántico e identificador de texto en las acciones de cuentas activas del POS.",
    cambios: [
      "Botones de acción con color y texto en `POSAccounts` (`src/app/dashboard/ventas/_components/pos-accounts.tsx`): Se asignaron colores semánticos diferenciados e iconos acompañados de texto visible a 'Cortesía' (`violet`), 'Editar' (`sky`), 'Crédito' (`amber`) y 'Pagar' (`emerald`)."
    ]
  },
  {
    version: "1.0.0",
    build: 376,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b376",
    descripcion: "Visualización permanente del input de búsqueda a la izquierda junto a las pestañas en la misma píldora en `<PillTabs>`.",
    cambios: [
      "Input de búsqueda visible por defecto en `PillTabs` (`src/components/comunes/pill-tabs.tsx`): El campo de búsqueda se muestra permanentemente a la izquierda y las pestañas a la derecha dentro de la misma píldora (`rounded-full bg-[#252526] border-[#2e2e2e]`)."
    ]
  },
  {
    version: "1.0.0",
    build: 375,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b375",
    descripcion: "Ubicación del buscador a la izquierda y pestañas a la derecha dentro de la misma píldora en `<PillTabs>`.",
    cambios: [
      "Buscador a la izquierda y pestañas simultáneas a la derecha (`src/components/comunes/pill-tabs.tsx`): El botón de lupa y el campo de búsqueda expandible se ubican a la izquierda, manteniendo todas las pestañas ('Pendientes' y 'Crédito') visibles y seleccionables a la derecha dentro de la misma píldora."
    ]
  },
  {
    version: "1.0.0",
    build: 374,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Menor",
    tagGit: "v1.0.0-b374",
    descripcion: "Integración de buscador con lupa expandible en el control estándar `<PillTabs>` y adopción en Cuentas Activas del POS.",
    cambios: [
      "Buscador con lupa expandible en `PillTabs` (`src/components/comunes/pill-tabs.tsx`): Muestra las pestañas completas y un botón circular de lupa a la derecha que, al tocarlo, expande el campo de búsqueda dentro de la misma barra manteniendo una píldora interactiva con la pestaña activa.",
      "Unificación de cabecera en `POSAccounts` (`src/app/dashboard/ventas/_components/pos-accounts.tsx`): Integración de las pestañas 'Pendientes' y 'Crédito' con el buscador de cuentas en un único control `<PillTabs>`."
    ]
  },
  {
    version: "1.0.0",
    build: 373,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b373",
    descripcion: "Habilitación de eliminación para todos los cargos de tiempo de mesa en el carrito del Punto de Venta.",
    cambios: [
      "Habilitación de botón eliminar en `POSCart` (`src/app/dashboard/ventas/_components/pos-cart.tsx`): Se eliminó la restricción `esTiempoMesa` (`idProducto.startsWith('mesa-')`) para que todos los tiempos de estación puedan eliminarse siempre que no tengan abonos aplicados.",
      "Manejo de cargos de mesa y cierre automático de cuenta vacía (`use-ventas.ts`, `pos-dialogs.tsx`, `ventas.ts`): Mensajes adaptados para ítems sin stock físico y eliminación limpia del documento de cuenta si al borrar el último ítem la cuenta queda vacía."
    ]
  },
  {
    version: "1.0.0",
    build: 372,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b372",
    descripcion: "Orden cronológico por fecha al agregar tiempos y consumos de mesa a cuentas activas en Punto de Venta.",
    cambios: [
      "Ordenamiento cronológico en `pasarACuenta` y `procesarPagoDivision` (`src/lib/firebase/servicios/mesas.ts`): Al transferir el tiempo de una estación o un pago dividido a una cuenta existente, se preserva `fechaAgregado` de cada consumo y se ordena la lista de `detalles` por fecha descendente (`más reciente primero`), evitando que el ítem de tiempo quede al final.",
      "Sincronización cronológica en POS (`src/app/dashboard/ventas/_hooks/use-ventas.ts` y `src/lib/firebase/servicios/ventas.ts`): Garantía de orden cronológico por `fechaAgregado` tanto al guardar como al visualizar cuentas pendientes y a crédito."
    ]
  },
  {
    version: "1.0.0",
    build: 371,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Menor",
    tagGit: "v1.0.0-b371",
    descripcion: "Auditoría y estandarización integral de la página de Punto de Venta (`/dashboard/ventas`) con los controles y paleta oficiales.",
    cambios: [
      "Cabecera POS (`pos-header.tsx`): Botones de navegación rápida (`Sala de Juegos`, `Tragamonedas`, `Historial`) con diseño píldora oficial (`rounded-full bg-[#252526] border-[#2e2e2e]`), iconos semánticos coloreados y centrado en vista móvil.",
      "Formulario y Carrito POS (`pos-form.tsx`, `pos-cart.tsx`): Eliminación de contenedores secundarios redundantes en la sección de carga de productos, adopción de `<SurfaceCard>` con paleta `#1e1e1e` / `#252526`, controles base por defecto, lista de carrito con scroll acotado (`max-h-[380px]`) y botón circular de eliminación.",
      "Cuentas Activas (`pos-accounts.tsx`): Reemplazo del selector improvisado dentro del buscador por `<PillTabs>` oficial (`Pendientes` y `Crédito` con `<CountBadge>`), buscador píldora independiente, eliminación de fondos oscuros arbitrarios (`#17202e`) y tarjetas de acordeón en `#252526` con botones `rounded-full`.",
      "Modales de POS (`pos-dialogs.tsx`): Rediseño completo de 'Cobro de Cuenta', 'Consumo Interno' y confirmaciones con el formato de `BillingDialog` (`#1e1e1e`, `Total a Liquidar` directo sobre el lienzo, sub-modales internos para Confirmar Pago con Tarjeta y Registrar Abono evitando conflictos de doble modal Radix)."
    ]
  },
  {
    version: "1.0.0",
    build: 370,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b370",
    descripcion: "Limpieza de mensajes repetitivos de desarrollo (`[Fast Refresh]` y `React DevTools`) en la consola del navegador.",
    cambios: [
      "Filtro de ruido de desarrollo en `src/context/theme-provider.tsx`: Supresión de trazas automáticas de `[Fast Refresh]`, `Download the React DevTools` y advertencias redundantes de Radix en la consola del navegador."
    ]
  },
  {
    version: "1.0.0",
    build: 369,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b369",
    descripcion: "Eliminación de advertencias de accesibilidad (`Missing Description for DialogContent`) en consola al usar paneles laterales (`Sheet`).",
    cambios: [
      "Inclusión de `SheetDescription` accesible (`sr-only`) en el menú móvil de `src/components/ui/sidebar.tsx` y descripción base por defecto en `src/components/ui/sheet.tsx` para eliminar el warning de Radix en consola."
    ]
  },
  {
    version: "1.0.0",
    build: 368,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b368",
    descripcion: "Centrado de icono y título de página en vista móvil dentro de `PageHeader`.",
    cambios: [
      "Alineación centrada en móvil (`justify-center sm:justify-start`) para el bloque de icono y título en `src/components/comunes/page-header.tsx`, manteniendo la alineación izquierda en escritorio."
    ]
  },
  {
    version: "1.0.0",
    build: 367,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b367",
    descripcion: "Optimización de vista móvil en Control de Estaciones: cabecera limpia, botones centrados y tamaño/bordes de modales.",
    cambios: [
      "Cabecera móvil limpia en `PageHeader` (`src/components/comunes/page-header.tsx`) y `src/app/dashboard/mesas/page.tsx`: En vista móvil (`< sm`) se muestra únicamente el icono y título de la página (ocultando la descripción) y los botones 'Punto de Venta' y 'Tragamonedas' quedan centrados.",
      "Tamaño y bordes estándar en modales móviles (`src/components/ui/dialog.tsx`, `alert-dialog.tsx` y diálogos de Mesas): Ancho responsivo con margen lateral (`w-[calc(100%-2rem)] sm:w-full`), bordes `rounded-xl sm:rounded-lg` y botones de pie de modal alineados horizontalmente sin apilarse a ancho completo."
    ]
  },
  {
    version: "1.0.0",
    build: 366,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b366",
    descripcion: "Corrección de congelamiento y rediseño corporativo del aviso global ¡Tiempo Culminado! sobre otros modales.",
    cambios: [
      "Reemplazo de `AlertDialog` de Radix por un overlay flotante aislado (`data-global-alert`, `z-[100]`) en `src/app/dashboard/layout.tsx` con reconocimiento optimista inmediato, evitando cierres accidentales de modales activos (`BillingDialog`, `ConsumptionDialog`) y bloqueos de `pointer-events` en `body`.",
      "Protección en `DialogContent` (`src/components/ui/dialog.tsx`) para ignorar eventos de clic/foco externos provenientes de alertas globales.",
      "Estandarización visual del modal '¡Tiempo Culminado!' con paleta oficial (`#1e1e1e`, borde `#2e2e2e`), icono circular translúcido ámbar y botón en píldora."
    ]
  },
  {
    version: "1.0.0",
    build: 365,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b365",
    descripcion: "Auditoría integral y pulido final del módulo Control de Estaciones (`/dashboard/mesas`).",
    cambios: [
      "Cierre controlado del menú `Popover` de acciones secundarias (`...`) en `TableCard` al abrir modales operativos.",
      "Migración de la confirmación `¿Cancelar División?` a un sub-modal interno dentro de `BillingDialog` para evitar conflictos entre modales Radix simultáneos.",
      "Eliminación del contenedor secundario redundante en 'Cantidad de Controles' dentro de `StartSessionDialog` y protección del anillo de foco en botones perimetrales.",
      "Soporte `overflow-visible` en `ConsumptionDialog` y limpieza de importaciones no utilizadas en `MesasDialogs`."
    ]
  },
  {
    version: "1.0.0",
    build: 364,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b364",
    descripcion: "Unificación de sub-contenedores financieros y de consumos en la tarjeta de estación (`TableCard`).",
    cambios: [
      "Rediseño del bloque financiero en `TableCard`: Se reemplazaron los 3 sub-contenedores separados (Total a Pagar, Alquiler, Consumo) y la línea divisoria flotante por un único bloque unificado (`#252526`) con divisiones limpias.",
      "Integración del acordeón 'Ver Consumos' dentro del mismo bloque unificado con separadores `divide-y divide-[#2e2e2e]`, eliminando contenedores secundarios adicionales al desplegar."
    ]
  },
  {
    version: "1.0.0",
    build: 363,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b363",
    descripcion: "Simplificación de contenedores anidados en el resumen de Ingresos de Sala de Juegos.",
    cambios: [
      "Eliminación del contenedor secundario en 'Total Consolidado' dentro de `IncomeSummary`, ubicándolo directamente sobre el lienzo del panel principal (`#1e1e1e`).",
      "Eliminación del sub-contenedor anidado (`subcard`) y subtítulo redundante dentro de cada tarjeta de mesa, integrando las sesiones directamente con separadores `divide-y divide-[#2e2e2e]`."
    ]
  },
  {
    version: "1.0.0",
    build: 362,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b362",
    descripcion: "Despliegue flotante libre de opciones del buscador de clientes fuera del modal Cobro de Sesión sin scroll.",
    cambios: [
      "Eliminación de recorte (`overflow-visible`) en `BillingDialog`: Las opciones de `AutocompleteInput` en las pestañas 'Cuenta' y 'Dividir' ahora sobresalen libremente por encima del borde inferior del modal sin generar scroll interno."
    ]
  },
  {
    version: "1.0.0",
    build: 361,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b361",
    descripcion: "Confirmación de pago con tarjeta, foco automático en buscador limpio de Cuenta y bloqueo inmediato del botón Añadir a Cuenta.",
    cambios: [
      "Confirmación antes de cobrar con Tarjeta: Al presionar 'Tarjeta' en Cobro de Sesión (Rápido o Dividir), se despliega un sub-modal compacto de confirmación con el monto exacto.",
      "Buscador de cliente limpio y con foco automático en pestaña Cuenta: Al seleccionar 'Cuenta', se limpia cualquier texto previo y se enfoca automáticamente el buscador de clientes.",
      "Bloqueo inmediato de botón 'Añadir a Cuenta': Protección contra doble clic mediante bloqueo instantáneo (`submittingCuenta` + `processingCharge`)."
    ]
  },
  {
    version: "1.0.0",
    build: 360,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b360",
    descripcion: "Edición fluida de alquiler en Cobro de Sesión sin pérdida de foco ni cambio brusco de pantalla al llegar a Q0.00.",
    cambios: [
      "Persistencia del desglose en `BillingDialog`: El 'Total a Pagar' y el bloque 'Alquiler | Consumos y Ajustes' permanecen siempre visibles durante la edición (`isEditingCost`), evitando que borrar el valor oculte el input.",
      "Liberación en Q0.00 integrada: Al confirmar un monto de Q0.00 (o cuando la sesión ya estaba pagada), se muestra el aviso 'Sin saldo pendiente' y el botón 'Finalizar y Liberar' manteniendo accesible la edición del alquiler."
    ]
  },
  {
    version: "1.0.0",
    build: 359,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b359",
    descripcion: "Rediseño limpio del modal Cobro de Sesión eliminando contenedores secundarios redundantes.",
    cambios: [
      "Simplificación de contenedores en `BillingDialog`: El 'Total a Pagar' se muestra directamente sobre el lienzo principal del modal en `text-5xl`, acompañado de un único bloque horizontal dividido en 2 columnas ('Alquiler' y 'Consumos y Ajustes') y controles directos en las pestañas Rápido, Cuenta y Dividir."
    ]
  },
  {
    version: "1.0.0",
    build: 358,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b358",
    descripcion: "Eliminación del contenedor secundario en la vista Sin Saldo Pendiente del modal Cobro de Sesión.",
    cambios: [
      "Simplificación visual en `BillingDialog`: Eliminación de la tarjeta secundaria `SurfaceCard` cuando `totalAPagarModal <= 0`, manteniendo el contenido directamente sobre el contenedor principal del modal."
    ]
  },
  {
    version: "1.0.0",
    build: 357,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b357",
    descripcion: "Estandarización global de controles base (Select, Input, DropdownMenu y AutocompleteInput) con hover y paleta oficial integrada.",
    cambios: [
      "Estilos oficiales integrados en `Select` (`src/components/ui/select.tsx`): `SelectTrigger`, `SelectContent` y `SelectItem` incluyen de fábrica la paleta `#252526`/`#1e1e1e`, bordes `#2e2e2e` y estados `hover:bg-sky-500/20 data-[highlighted]:bg-sky-500/20` sin requerir clases manuales en cada página.",
      "Estandarización global de `Input`, `DropdownMenu` y `AutocompleteInput`: Integración directa del diseño corporativo y resaltado al pasar el cursor (`onMouseEnter` + `hover:bg-sky-500/20`)."
    ]
  },
  {
    version: "1.0.0",
    build: 356,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b356",
    descripcion: "Eliminación de doble aro de foco y estandarización del color de selección en Select, Checkbox y Textarea.",
    cambios: [
      "Corrección de foco y selección en Select (`src/components/ui/select.tsx`): Eliminación de `focus:ring-offset-2` en `SelectTrigger` (causante del doble borde en Estación de Destino) y aplicación de selección `sky-500`.",
      "Unificación de foco y color primario (`sky-500`) en `Checkbox`, `Textarea` y variables globales de `globals.css`."
    ]
  },
  {
    version: "1.0.0",
    build: 355,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b355",
    descripcion: "Homologación del color de foco en botones/radios con inputs y scroll exclusivo para el carrito en Añadir Consumo.",
    cambios: [
      "Color de foco unificado (`sky-400`/`sky-500`): Eliminación del aro azul rey con offset en `Button` y `RadioGroupItem`, unificando el tono celeste corporativo con los inputs.",
      "Scroll exclusivo y altura acotada en el carrito (`max-h-[240px] overflow-y-auto`): Los controles de entrada permanecen fijos y el scroll aplica únicamente a la lista de artículos del carrito."
    ]
  },
  {
    version: "1.0.0",
    build: 354,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b354",
    descripcion: "Ubicación del Total en el encabezado del modal Añadir Consumo, descripción concisa en una línea y ampliación de ancho.",
    cambios: [
      "Total en cabecera (`text-2xl font-bold text-sky-400`): Ubicado en la misma fila del título y descripción de `ConsumptionDialog`.",
      "Descripción en una sola fila y ancho optimizado (`sm:max-w-2xl`): Texto resumido a 'Agrega productos o cargos manuales a la sesión.' evitando saltos de línea."
    ]
  },
  {
    version: "1.0.0",
    build: 353,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b353",
    descripcion: "Ajuste de bordes, dimensiones compactas y desglose informativo en los modales de confirmación de eliminación de consumo.",
    cambios: [
      "Borde y radio oficial (`rounded-xl sm:rounded-lg border-[#2e2e2e]`): Homologación del radio de esquina con `DialogContent` en los modales de confirmación de eliminación.",
      "Diseño compacto e informativo (`max-w-sm p-5`): Muestra estación, nombre del producto, cantidad × precio unitario, hora de registro, monto total y unidades exactas a reintegrar al stock."
    ]
  },
  {
    version: "1.0.0",
    build: 352,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b352",
    descripcion: "Corrección de bloqueo de interfaz y rediseño estándar del sub-modal de confirmación de eliminación en Añadir Consumo.",
    cambios: [
      "Eliminación de conflicto de doble portal Radix: El diálogo de confirmación para eliminar un producto ahora se renderiza como capa modal interna dentro de `ConsumptionDialog`, evitando que al cancelar se cierre el modal padre o se bloquee `pointer-events` en el body.",
      "Diseño estándar corporativo en confirmación: Cabecera con icono circular translúcido (`bg-rose-500/10`), tarjeta interior `SurfaceCard` con resumen del artículo y botones distribuidos (`sm:justify-between`)."
    ]
  },
  {
    version: "1.0.0",
    build: 351,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b351",
    descripcion: "Mejoras de visibilidad de Total, confirmación de eliminación y estilo circular en botón eliminar del modal Añadir Consumo.",
    cambios: [
      "Indicador de Total destacado y botón Guardar (F3): Reubicación del indicador 'Total' en tipografía grande (`text-2xl font-bold text-sky-400`) junto al botón simplificado 'Guardar (F3)' en el pie del modal.",
      "Diálogo de confirmación al eliminar del carrito: Incorporación de `AlertDialog` para confirmar la eliminación de ítems en `ConsumptionDialog` antes de devolver el stock al inventario.",
      "Botón circular de eliminar con hover sólido: Estilo circular definido (`bg-rose-500/15 hover:bg-rose-600 hover:text-white rounded-full`) en los botones de eliminación."
    ]
  },
  {
    version: "1.0.0",
    build: 350,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b350",
    descripcion: "Homologación visual del carrito en el modal Añadir Consumo con el carrito de Ventas POS.",
    cambios: [
      "Diseño de filas idéntico a POSCart: En `ConsumptionDialog`, los ítems del carrito muestran icono de estado (`BadgeHelp` en rojo o `ReceiptText` en índigo para manuales), nombre en `text-sm font-semibold`, sublínea con `{cantidad} × Q{precio}` y hora exacta (`Clock` + `hh:mm:ss a`), monto en blanco, botón de eliminar (`Trash2`) y divisores horizontales (`divide-y divide-[#2e2e2e]`), ordenando los productos recién agregados al inicio."
    ]
  },
  {
    version: "1.0.0",
    build: 349,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b349",
    descripcion: "Homologación del selector de preparaciones en el modal Añadir Consumo con el estilo de Ventas POS.",
    cambios: [
      "Preparaciones integradas en tarjeta de entrada: El bloque de 'Preparación' en `ConsumptionDialog` ahora se muestra dentro del mismo contenedor con borde punteado (`border-dashed`), título 'Preparación' y opción 'Vender como base', idéntico al formulario POS."
    ]
  },
  {
    version: "1.0.0",
    build: 348,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b348",
    descripcion: "Ajustes de diseño y foco en el modal Añadir Consumo y eliminación de doble aro en Input global.",
    cambios: [
      "Corrección de doble aro de foco: Eliminación de `focus-visible:ring-offset-2` en `src/components/ui/input.tsx` aplicando aro único nítido `focus-visible:ring-1 focus-visible:ring-sky-500`.",
      "Rediseño de cabecera y controles en ConsumptionDialog: Reemplazo del switch `Manual (F6)` de cabecera por indicador de `Subtotal`, leyenda inferior 'Presiona F6 para agregar un ítem manual', cambio de botón 'Añadir' a 'Agregar' y eliminación del bloque intermedio 'Artículos en la Mesa'."
    ]
  },
  {
    version: "1.0.0",
    build: 347,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b347",
    descripcion: "Homologación visual del modal Ajustar Tiempo con el diseño de Tiempo Definido en Iniciar Sesión.",
    cambios: [
      "Simetría total en TimeAdjustDialog: Igualación de fuente `font-headline`, icono azul translúcido, etiqueta 'Selecciona el Intervalo', bloque compacto de 'Pagado de Contado' y pie de botones distribuido (`sm:justify-between`) idéntico a `StartSessionDialog`."
    ]
  },
  {
    version: "1.0.0",
    build: 346,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b346",
    descripcion: "Badges translúcidos de color para Tiempo Libre y Tiempo Definido en tarjetas de estaciones e ingresos.",
    cambios: [
      "Estilo translúcido unificado: `Tiempo Libre` (`bg-sky-500/20 text-sky-300 border-sky-500/30`) y `Tiempo Definido` / `Pendiente` (`bg-amber-500/20 text-amber-300 border-amber-500/30`) con el mismo acabado visual translúcido del badge `Pagado`."
    ]
  },
  {
    version: "1.0.0",
    build: 345,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b345",
    descripcion: "Reversión de cambios visuales de badges e ingresos al diseño estable del Build 343.",
    cambios: [
      "Restauración de `TableCard` e `IncomeSummary` al estado exacto del Build 343."
    ]
  },
  {
    version: "1.0.0",
    build: 344,
    fecha: "2026-11-04",
    estado: "archivada",
    tipo: "Menor",
    tagGit: "v1.0.0-b344",
    descripcion: "Badges sólidos en tarjetas de estaciones y rediseño moderno del panel de Ingresos de Sala de Juegos.",
    cambios: [
      "Badges con relleno de color en TableCard: `Tiempo Libre` en azul sólido (`bg-sky-600 text-white`), `Tiempo Definido` en ámbar sólido (`bg-amber-400 text-slate-950`), y estados `Pagado` (`bg-emerald-500`) y `Pendiente` (`bg-amber-400`) sólidos de alto contraste.",
      "Rediseño moderno de IncomeSummary: Resumen superior con desglose en vivo Efectivo vs Tarjeta, barra de participación porcentual con gradiente por estación, conversión de tiempos HH:MM:SS a formato corto legible (ej. `1m 51s`) y tarjetas de sesión limpias sin subtítulos repetitivos."
    ]
  },
  {
    version: "1.0.0",
    build: 343,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b343",
    descripcion: "Homologación de color de fondo entre tarjetas de estaciones y panel de ingresos, y remoción de línea divisoria en ingresos.",
    cambios: [
      "Unificación cromática de contenedores principales: `TableCard` adopta `SurfaceCard variant=\"panel\"` (`#1e1e1e`) igualando el tono del contenedor de `IncomeSummary`, con bloques internos en `#252526`.",
      "Limpieza visual en Ingresos: Se eliminó el borde divisor inferior (`border-b`) del encabezado en `IncomeSummary`."
    ]
  },
  {
    version: "1.0.0",
    build: 342,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b342",
    descripcion: "Transición animada suave al mostrar y ocultar los intervalos de Tiempo Definido en el modal de inicio de sesión.",
    cambios: [
      "Animación bidireccional fluida: Implementación de contenedor con transición `grid-rows-[0fr]` / `grid-rows-[1fr]` y opacidad progresiva (`duration-300 ease-in-out`) en `StartSessionDialog`, evitando saltos bruscos de altura tanto al abrir como al cerrar los intervalos."
    ]
  },
  {
    version: "1.0.0",
    build: 341,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b341",
    descripcion: "Alineación horizontal de icono y título en los encabezados de modales de Sala de Juegos.",
    cambios: [
      "Encabezado en fila única: Se alineó el icono circular translúcido en la misma fila que el título y subtítulo (`flex items-center gap-3`) en `StartSessionDialog`, `BillingDialog`, `TransferDialog` y `TimeAdjustDialog`."
    ]
  },
  {
    version: "1.0.0",
    build: 340,
    fecha: "2026-11-04",
    estado: "publicada_anterior",
    tipo: "Menor",
    tagGit: "v1.0.0-b340",
    descripcion: "Estandarización visual integral y corrección de props en Control de Estaciones (/dashboard/mesas).",
    cambios: [
      "Adopción estricta del Design System en Sala de Juegos: Uso de `<SurfaceCard>`, `<PillTabs>`, `<CountBadge>` y paleta oficial (#1e1e1e, #252526, #2e2e2e) en TableCard, IncomeSummary y todos los modales operativos.",
      "Controles redondeados en píldora y tipografía limpia: Estandarización de inputs, selects y botones a `rounded-full` (h-9/h-10) y eliminación total de clases `uppercase` en etiquetas, insignias y divisores.",
      "Corrección de sincronización de props en MesasDialogs: Alineación de propiedades en `BillingDialog` y `ConsumptionDialog` e inclusión del interruptor visible para Consumo Manual (F6) en escritorio y móvil."
    ]
  },
  {
    version: "1.0.0",
    build: 339,
    fecha: "2026-11-02",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b339",
    descripcion: "Integración de Paleta de Colores oficial: Modo Oscuro (Antigravity IDE) y Modo Claro corporativo en la vitrina de controles estándar.",
    cambios: [
      "Paleta cromática inspirada en Antigravity IDE: Lienzo base ultra oscuro descansado (`#12151b`), paneles estructurados (`#1e1e1e`), superficies elevadas (`#252526`), bordes de alta definición de 1px (`#2e2e2e`), azul primario de acción (`#0284c7`), y acentos de sintaxis semántica (esmeralda, ámbar, rosa, violeta).",
      "Paleta equivalente en Modo Claro: Lienzo ultra limpio (`#f8fafc`), paneles blancos (`#ffffff`), superficies suaves (`#f1f5f9`) y bordes nítidos (`#cbd5e1`).",
      "Herramientas de inspección: Muestra de fichas cromáticas con copiado directo al portapapeles con un clic, tabla comparativa lado a lado y simulador de controles en tiempo real con selector de tema."
    ]
  },
  {
    version: "1.0.0",
    build: 338,
    fecha: "2026-11-01",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b338",
    descripcion: "Creación del catálogo y vitrina interactiva de Controles Estándar de Interfaz (/dashboard/pruebas/controles-estandar).",
    cambios: [
      "Página interactiva de controles estándar: Muestra comparativa en vivo entre el input con artefacto de doble borde y el estándar perfeccionado.",
      "Galería completa de controles: Inputs (texto, buscador con botón limpiar, numérico con prefijo Q, validación, deshabilitado), Desplegables Selects, Botones con forma píldora (`rounded-full`) en variantes semánticas y escala de tamaños.",
      "Demostración en contexto real: Modal de prueba funcional para validar la armonía visual sobre fondos oscuros.",
      "Enlace directo en la barra lateral en la sección Pruebas."
    ]
  },
  {
    version: "1.0.0",
    build: 337,
    fecha: "2026-10-29",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b337",
    descripcion: "Restauración de distribución espacial en Sala de Juegos: estaciones a la izquierda y resumen lateral de ingresos a la derecha.",
    cambios: [
      "Restablecimiento de layout de 3 columnas: Las tarjetas de mesas y consolas vuelven a ubicarse en primer lugar (`order-first`, 2/3 del ancho en escritorio), y el componente `IncomeSummary` se sitúa en la columna lateral derecha (`order-last`, 1/3 del ancho).",
      "Experiencia móvil optimizada: En pantallas pequeñas las estaciones se muestran directamente al inicio sin requerir desplazamiento vertical innecesario para operar.",
      "Verificación de estabilidad: Compilación validada con código HTTP 200 en `/dashboard/mesas`."
    ]
  },
  {
    version: "1.0.0",
    build: 336,
    fecha: "2026-10-29",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b336",
    descripcion: "Corrección de error tipográfico de importación en el módulo de Auditoría de Operaciones.",
    cambios: [
      "Corrección de sintaxis ECMAScript: Se corrigió el error tipográfico accidental `himport` por `import` en la primera línea de `auditoria-helpers.ts`.",
      "Verificación de compilación: Compilación validada en Turbopack con código HTTP 200 en las rutas de auditoría y cierre de caja."
    ]
  },
  {
    version: "1.0.0",
    build: 335,
    fecha: "2026-10-29",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b335",
    descripcion: "Corrección de detección de caja abierta por sucursal: restablecimiento de datos en vivo del turno y eliminación de bloqueo indebido de apertura.",
    cambios: [
      "Restablecimiento de datos en vivo de caja: Se corrigió la condición de renderizado en `cierre-caja/page.tsx`, reemplazando la verificación inexistente `estadoCaja?.estado !== 'abierta'` por la evaluación real `!estadoCaja || !fechaInicioPeriodo`.",
      "Carga inmediata por sucursal: La vista ahora presenta de inmediato el balance en tiempo real, ingresos por mesas, ventas y arqueo físico del turno operativo de cada sucursal.",
      "Inicialización exclusiva de sucursales nuevas: La pantalla de inicialización se reserva única y exclusivamente para sucursales recién creadas que aún no tengan registros contables previos.",
      "Verificación de estabilidad: Validado con código de estado HTTP 200 OK."
    ]
  },
  {
    version: "1.0.0",
    build: 334,
    fecha: "2026-10-29",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b334",
    descripcion: "Corrección de apertura de turno en Cierre de Caja: sincronización de setMontoApertura y estado de inicialización de caja.",
    cambios: [
      "Exposición de aliases en useCierreCaja: Se agregaron `montoApertura`, `setMontoApertura`, `procesandoApertura` y `manejarAperturaCaja` en el hook `useCierreCaja`, resolviendo la excepción de ejecución 'setMontoApertura is not a function'.",
      "Sanitización de entrada numérica: Se configuró el controlador `onChange` del monto de apertura para admitir vaciado ergonómico sin producir valores `NaN`.",
      "Verificación de estabilidad: Compilación validada con código HTTP 200 en `/dashboard/cierre-caja`."
    ]
  },
  {
    version: "1.0.0",
    build: 333,
    fecha: "2026-10-29",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b333",
    descripcion: "Resolución de TypeError en Sala de Juegos: sincronización de props de TableCard y eliminación de referencia a objeto de tiempos inexistente.",
    cambios: [
      "Resolución de excepción de renderizado: Se eliminó la lectura `tiempos[mesa.id]` que provocaba 'Cannot read properties of undefined (reading 1)' al renderizar el mapa de estaciones.",
      "Sincronización completa de TableCard: Se conectaron los callbacks desacoplados `onAction`, `onConsumo`, `onTraslado`, `onAjusteTiempo` y `onEliminarConsumo` expuestos por `useMesas`.",
      "Cálculo en vivo de alquiler: Se proveyeron `tarifaMesa` y `costoAlquilerReal` calculados reactivamente para cada estación.",
      "Estabilidad confirmada: Verificación en tiempo de ejecución con respuesta HTTP 200 OK."
    ]
  },
  {
    version: "1.0.0",
    build: 332,
    fecha: "2026-10-29",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b332",
    descripcion: "Corrección de referencia a generalesRef y paso de sucursalId en el resumen de ingresos de Sala de Juegos (Mesas).",
    cambios: [
      "Corrección de generalesRef: Se definió la referencia reactiva Firestore con useMemoFirebase en `use-mesas.ts`, eliminando la excepción de ejecución 'generalesRef is not defined'.",
      "Sincronización de props en IncomeSummary: Se conectó `sucursalId` a `<IncomeSummary />` en `mesas/page.tsx` para garantizar la carga fluida de ingresos del período.",
      "Verificación de estabilidad: Compilación validada con código HTTP 200 sin advertencias ni bloqueos."
    ]
  },
  {
    version: "1.0.0",
    build: 331,
    fecha: "2026-10-28",
    estado: "publicada_anterior",
    tipo: "Menor",
    tagGit: "v1.0.0-b331",
    descripcion: "Optimización integral y reducción definitiva de Sala de Juegos (Mesas) a 95 líneas y modularización completa de Cuentas Financieras.",
    cambios: [
      "Optimización final de Sala de Juegos (Mesas): Encapsulamiento de modales en `MesasDialogs` recibiendo el estado estructurado de `useMesas`, reduciendo `mesas/page.tsx` de 285 a 95 líneas limpias y legibles.",
      "Modularización de Cuentas Financieras: Creación de `useMantenimientoCuentas.ts`, `CuentaCard.tsx`, `ModalCuenta.tsx` y `DialogoEliminarCuenta.tsx`, reduciendo `mantenimiento/cuentas/page.tsx` de 253 a 115 líneas.",
      "Auditoría integral de arquitectura: Verificación completa de todas las páginas de producción del Dashboard, garantizando que el 100% de las rutas operativas se ubiquen cómodamente por debajo del límite de 250 líneas.",
      "Cumplimiento estricto del Design System: Adopción del encabezado `<PageHeader>`, botones píldora `rounded-full`, paleta corporativa (#1e1e1e, #252526, #2e2e2e) y cero textos en mayúsculas sostenidas."
    ]
  },
  {
    version: "1.0.0",
    build: 330,
    fecha: "2026-10-28",
    estado: "publicada_anterior",
    tipo: "Menor",
    tagGit: "v1.0.0-b330",
    descripcion: "Modularización y optimización arquitectónica de Mantenimiento de Cuentas Financieras con adopción estricta del Design System oficial.",
    cambios: [
      "Modularización de Cuentas Financieras: Creación de `useMantenimientoCuentas.ts`, `CuentaCard.tsx`, `ModalCuenta.tsx` y `DialogoEliminarCuenta.tsx`, reduciendo `mantenimiento/cuentas/page.tsx` de 253 a 115 líneas limpias.",
      "Cumplimiento del Design System: Adopción del encabezado oficial `<PageHeader>`, buscador ergonómico con `rounded-full` en `#252526`, eliminación total de textos en mayúsculas sostenidas (`uppercase`), y aplicación de la paleta corporativa oficial (#1e1e1e, #252526, #2e2e2e).",
      "Experiencia móvil y adaptativa: Reemplazo de tablas rígidas por tarjetas responsivas e independientes con microinteracciones y controles píldora."
    ]
  },
  {
    version: "1.0.0",
    build: 329,
    fecha: "2026-10-28",
    estado: "publicada_anterior",
    tipo: "Menor",
    tagGit: "v1.0.0-b329",
    descripcion: "Modularización y optimización arquitectónica de Historial de Cuadre de Tragamonedas, Historial de Cuadre Mensual y Gestión de Usuarios con adopción del Design System oficial.",
    cambios: [
      "Modularización de Historial de Cuadre de Tragamonedas: Creación de `useHistorialCuadreTragamonedas.ts` y `CuadreTragamonedasItemAcordeon.tsx`, reduciendo `cuadre-tragamonedas/historial/page.tsx` de 316 a 135 líneas.",
      "Modularización de Historial de Cuadre Mensual: Creación de `useHistorialCuadreMensual.ts`, `DetalleCuadresSemanales.tsx` y `CuadreMensualItemAcordeon.tsx`, reduciendo `cuadre-mensual/historial/page.tsx` de 312 a 125 líneas.",
      "Modularización de Gestión de Usuarios: Extracción de `useUsuariosSucursal.ts` con aislamiento de creación secundaria en Firebase Auth y actualización de `EncabezadoUsuarios.tsx` con `PageHeader`, reduciendo `configuraciones/usuarios/page.tsx` de 304 a 75 líneas.",
      "Cumplimiento del Design System: Adopción del encabezado oficial `<PageHeader>`, contenedores `<SurfaceCard>`, botones `rounded-full`, eliminación de mayúsculas sostenidas y aplicación de la paleta corporativa oficial (#1e1e1e, #252526, #2e2e2e)."
    ]
  },
  {
    version: "1.0.0",
    build: 328,
    fecha: "2026-10-28",
    estado: "publicada_anterior",
    tipo: "Menor",
    tagGit: "v1.0.0-b328",
    descripcion: "Modularización y optimización arquitectónica de Configuración de Tragamonedas, Cuadre de Tragamonedas e Historial de Cierres de Caja con adopción estricta del Design System oficial.",
    cambios: [
      "Modularización de Configuración de Tragamonedas: Creación de `useConfigTragamonedas.ts`, `TragamonedasCard.tsx`, `TragamonedasDialog.tsx` y `EliminarMaquinaDialog.tsx`, reduciendo `configuraciones/tragamonedas/page.tsx` de 329 a 105 líneas.",
      "Modularización de Cuadre de Tragamonedas: Extracción de `useCuadreTragamonedasCierre.ts`, `MaquinaCuadreCard.tsx`, `CuadreTragamonedasResumen.tsx` y `CuadreConfirmacionDialog.tsx`, reduciendo `administracion/cuadre-tragamonedas/page.tsx` de 286 a 95 líneas.",
      "Modularización de Historial de Cierres de Caja: Creación de `useHistorialCierreCaja.ts` y `CierreCajaItemAcordeon.tsx`, reduciendo `cierre-caja/historial/page.tsx` de 305 a 135 líneas.",
      "Cumplimiento del Design System: Adopción del encabezado oficial `<PageHeader>`, contenedores `<SurfaceCard>`, botones `rounded-full`, eliminación de mayúsculas sostenidas y aplicación de la paleta corporativa oficial (#1e1e1e, #252526, #2e2e2e)."
    ]
  },
  {
    version: "1.0.0",
    build: 327,
    fecha: "2026-10-28",
    estado: "publicada_anterior",
    tipo: "Menor",
    tagGit: "v1.0.0-b327",
    descripcion: "Modularización y optimización arquitectónica de Configuración de Estaciones, Tarifas e Historial de Cuadre Semanal con adopción estricta del Design System oficial.",
    cambios: [
      "Modularización de Configuración de Estaciones: Extracción de `useConfigMesas.ts`, `TarifaCard.tsx`, `MesaCard.tsx`, `TarifaDialog.tsx`, `MesaDialog.tsx` y `EliminarDialogs.tsx`, reduciendo `configuraciones/mesas/page.tsx` de 570 a 160 líneas.",
      "Optimización de Tarifas de Estaciones: Desacoplamiento de `configuraciones/mesas/tarifas/page.tsx` reutilizando subcomponentes estandarizados, reduciendo de 386 a 85 líneas limpias.",
      "Modularización de Historial de Cuadre Semanal: Creación de `useHistorialCuadreSemanal.ts`, `CuadreItemAcordeon.tsx` y `DetalleRegistrosProcesados.tsx`, reduciendo `cuadre-semanal/historial/page.tsx` de 361 a 140 líneas.",
      "Cumplimiento del Design System: Adopción del encabezado oficial `<PageHeader>`, pestañas `<PillTabs>`, contenedores `<SurfaceCard>`, botones `rounded-full` y paleta corporativa oficial (#1e1e1e, #252526, #2e2e2e)."
    ]
  },
  {
    version: "1.0.0",
    build: 326,
    fecha: "2026-10-28",
    estado: "publicada_anterior",
    tipo: "Menor",
    tagGit: "v1.0.0-b326",
    descripcion: "Modularización integral de Sala de Juegos y Cierre de Caja: desacoplamiento en MesasDialogs, CierreConteoCard y CierreLiquidacionCard con páginas coordinadoras por debajo de 250 líneas.",
    cambios: [
      "Modularización de Sala de Juegos: Extracción del subcomponente `MesasDialogs.tsx` (modales de cobro, consumo, traslados, ajustes y alertas), reduciendo `mesas/page.tsx` a 240 líneas.",
      "Modularización de Cierre de Caja: Extracción de `CierreConteoCard.tsx` y `CierreLiquidacionCard.tsx`, reduciendo `cierre-caja/page.tsx` a 190 líneas.",
      "Cumplimiento del Design System: Adopción del encabezado oficial `<PageHeader>`, contenedores `<SurfaceCard>`, botones `rounded-full` y paleta corporativa oficial (#1e1e1e, #252526, #2e2e2e)."
    ]
  },
  {
    version: "1.0.0",
    build: 325,
    fecha: "2026-10-28",
    estado: "publicada_anterior",
    tipo: "Menor",
    tagGit: "v1.0.0-b325",
    descripcion: "Modularización y optimización arquitectónica de Inventario de Productos: reducción de 357 a 195 líneas mediante InventarioFiltros, InventarioRevisionFooter e InventarioPaginacion.",
    cambios: [
      "Modularización de Inventario de Productos: Desacoplamiento de la vista principal en subcomponentes modulares especializados (`InventarioFiltros.tsx`, `InventarioRevisionFooter.tsx` e `InventarioPaginacion.tsx`).",
      "Cumplimiento del Design System: Adopción del encabezado oficial `<PageHeader>`, contenedores `<SurfaceCard>`, botones `rounded-full` y paleta corporativa oficial (#1e1e1e, #252526, #2e2e2e).",
      "Reducción de código: La página pasa de 357 a 195 líneas limpias y coordinadas."
    ]
  },
  {
    version: "1.0.0",
    build: 324,
    fecha: "2026-10-28",
    estado: "publicada_anterior",
    tipo: "Menor",
    tagGit: "v1.0.0-b324",
    descripcion: "Modularización y optimización arquitectónica de Cuadre Mensual: reducción de 319 a 98 líneas mediante useCuadreMensual, CuadreMensualLista, CuadreMensualResumen y PageHeader oficial.",
    cambios: [
      "Modularización de Cuadre Mensual: Creación de `useCuadreMensual.ts` aislando consultas de cortes semanales pendientes, selección múltiple y liquidación contable de balances.",
      "Subcomponentes modulares: Extracción de `CuadreMensualLista.tsx` (listado con selección de cortes) y `CuadreMensualResumen.tsx` (cálculos, transferencias entre cuentas y notas).",
      "Cumplimiento del Design System: Adopción del encabezado oficial `<PageHeader>`, contenedores `<SurfaceCard>`, botones `rounded-full` y paleta corporativa oficial (#1e1e1e, #252526, #2e2e2e).",
      "Reducción de código: La página pasa de 319 a 98 líneas limpias y coordinadas."
    ]
  },
  {
    version: "1.0.0",
    build: 323,
    fecha: "2026-10-28",
    estado: "publicada_anterior",
    tipo: "Menor",
    tagGit: "v1.0.0-b323",
    descripcion: "Modularización y optimización arquitectónica del Tablero Principal (Dashboard): reducción de 682 a 78 líneas mediante useDashboard, DashboardKPIs, DashboardTopStations, DashboardCharts y PageHeader oficial.",
    cambios: [
      "Modularización del Tablero Principal: Creación de `useDashboard.ts` aislando consultas y cálculos de métricas de ocupación, stock, ventas acumuladas y series temporales de gráficos.",
      "Subcomponentes desacoplados: Creación de `DashboardKPIs.tsx` (ocupación de mesas y consolas, ventas del turno y alertas de stock), `DashboardTopStations.tsx` (estaciones líderes) y `DashboardCharts.tsx` (gráficos de rendimiento semanal, por estación, monedas y mensual).",
      "Cumplimiento del Design System: Adopción del encabezado oficial `<PageHeader>`, eliminación total de mayúsculas sostenidas en badges y métricas, y aplicación de la paleta oficial (#1e1e1e, #252526, #2e2e2e).",
      "Reducción de código: La página pasa de 682 a 78 líneas limpias y coordinadas."
    ]
  },
  {
    version: "1.0.0",
    build: 322,
    fecha: "2026-10-28",
    estado: "publicada_anterior",
    tipo: "Menor",
    tagGit: "v1.0.0-b322",
    descripcion: "Modularización y optimización arquitectónica de Punto de Venta (POS) e Historial de Ventas: desacoplamiento en useVentas y useHistorialVentas con PageHeader oficial.",
    cambios: [
      "Modularización del Punto de Venta (POS): Creación de `useVentas.ts` aislando sincronización de catálogo, carrito, control transaccional de stock temporal, guardado y pagos unificados, reduciendo `ventas/page.tsx` de 627 a 48 líneas.",
      "Modularización de Historial de Ventas: Creación de `useHistorialVentas.ts` (agrupación multi-abono, paginación y anulaciones) y subcomponente `HistorialVentaItem.tsx`, reduciendo `historial-ventas/page.tsx` de 612 a 195 líneas.",
      "Design System oficial aplicado: Integración de `<PageHeader>`, accesos rápidos `rounded-full` a Sala de Juegos, Tragamonedas y POS, eliminación de mayúsculas sostenidas en badges y uso de paleta corporativa (#1e1e1e, #252526, #2e2e2e)."
    ]
  },
  {
    version: "1.0.0",
    build: 321,
    fecha: "2026-10-28",
    estado: "publicada_anterior",
    tipo: "Menor",
    tagGit: "v1.0.0-b321",
    descripcion: "Modularización y optimización arquitectónica de Gestión de Tragamonedas: reducción de 721 a 180 líneas mediante useGestionTragamonedas, PremioForm, MaquinaCard y PageHeader.",
    cambios: [
      "Desacoplamiento integral de Tragamonedas: Creación de `useGestionTragamonedas.ts` aislando consultas Firestore de máquinas, estados de modales de anulación y limpieza de pointer events.",
      "Subcomponentes especializados: Extracción de `PremioForm.tsx` (registro total o parcial de premios), `MaquinaCard.tsx` (tarjeta de métricas con modales de base y extracción) e `HistorialModal.tsx`.",
      "Cumplimiento estricto del Design System: Adopción de `<PageHeader>`, contenedores `<SurfaceCard>`, botones `rounded-full`, paleta corporativa oficial (#1e1e1e, #252526, #2e2e2e) y tipografía sin mayúsculas sostenidas.",
      "Reducción de código: La página principal pasa de 721 a 180 líneas limpias y de fácil mantenimiento."
    ]
  },
  {
    version: "1.0.0",
    build: 320,
    fecha: "2026-10-28",
    estado: "publicada_anterior",
    tipo: "Menor",
    tagGit: "v1.0.0-b320",
    descripcion: "Modularización y optimización arquitectónica de Sala de Juegos (Mesas): reducción de 793 a 280 líneas mediante useMesas, PageHeader y desacoplamiento de lógica operativa.",
    cambios: [
      "Desacoplamiento integral de Sala de Juegos: Creación de `useMesas.ts` (480 líneas) encapsulando sincronización horaria con servidor, cálculo dinámico de tarifas e intervalos, temporizadores reactivos y control de stock temporal.",
      "Gestión atómica de sesiones y consumos: Aislamiento en el custom hook de flujos de cobro, división de cuentas en cuotas, traslados entre mesas y auditoría transaccional.",
      "Design System oficial aplicado: Integración de `<PageHeader>`, accesos rápidos `rounded-full` a POS y Tragamonedas, paleta oficial y eliminación de lógica monolítica en la vista principal.",
      "Reducción de código: La página principal pasa de 793 a 280 líneas limpias y coordinadas."
    ]
  },
  {
    version: "1.0.0",
    build: 319,
    fecha: "2026-10-28",
    estado: "publicada_anterior",
    tipo: "Menor",
    tagGit: "v1.0.0-b319",
    descripcion: "Modularización y estandarización visual de Cierre de Caja: reducción de 802 a 260 líneas mediante useCierreCaja, subcomponentes desacoplados de historiales y PageHeader.",
    cambios: [
      "Módulo Cierre de Caja desacoplado: Creación de `useCierreCaja.ts` aislando consultas de generales, cuentas, ventas pendientes y mesas activas, validaciones atómicas de cuadre y apertura de turnos.",
      "Subcomponentes modulares de Historial: Extracción de `HistorialPagosEfectivo`, `HistorialPagosTarjeta` e `HistorialMonedas` a subcomponentes independientes.",
      "Cumplimiento estricto del Design System: Adopción de `<PageHeader>`, contenedores `<SurfaceCard>`, botones `rounded-full`, paleta oficial (#1e1e1e, #252526, #2e2e2e) y eliminación de textos en mayúsculas forzadas.",
      "Reducción de código: La página principal pasa de 802 a 260 líneas limpias y de fácil mantenimiento."
    ]
  },
  {
    version: "1.0.0",
    build: 318,
    fecha: "2026-10-28",
    estado: "publicada_anterior",
    tipo: "Menor",
    tagGit: "v1.0.0-b318",
    descripcion: "Modularización y optimización arquitectónica de Control de Pagos: reducción de 1,276 a 190 líneas mediante useControlPagos, subcomponentes modulares y PageHeader.",
    cambios: [
      "Desacoplamiento integral de Control de Pagos: Creación de `useControlPagos.ts` (360 líneas) aislando consultas Firestore, agrupación inteligente de pagos multi-venta, filtrado multidimensional, métricas financieras y exportación CSV.",
      "Subcomponentes modulares en Control de Pagos: Separación en `ControlPagosMetricas`, `ControlPagosFiltros`, `ControlPagosCard` y `ControlPagosTicketDialog`.",
      "Design System oficial aplicado: Integración de `<PageHeader>`, contenedores `<SurfaceCard>`, botones de acción `rounded-full`, paleta oficial (#1e1e1e, #252526, #2e2e2e) y eliminación de tablas desbordables.",
      "Reducción de código: La página principal pasa de 1,276 a 190 líneas limpias y de alto rendimiento."
    ]
  },
  {
    version: "1.0.0",
    build: 317,
    fecha: "2026-10-28",
    estado: "publicada_anterior",
    tipo: "Menor",
    tagGit: "v1.0.0-b317",
    descripcion: "Modularización y optimización arquitectónica de Auditoría de Operaciones: reducción de 1,527 a 170 líneas mediante useAuditoria, subcomponentes desacoplados y PageHeader.",
    cambios: [
      "Desacoplamiento masivo de Auditoría: Creación de `useAuditoria.ts` (450 líneas) y `auditoria-helpers.ts` aislando consultas, resolución de usuarios, recuperación de artículos e identificación de dispositivos.",
      "Subcomponentes modulares en Auditoría: Separación en `AuditoriaFeedItem`, `AuditoriaDetalleDialog`, `AuditoriaEquipoDialog` y `AuditoriaFiltros`.",
      "Design System oficial aplicado: Contenedores `<SurfaceCard>`, encabezado `<PageHeader>`, controles píldora `rounded-full` y paleta corporativa #1e1e1e, #252526 y #2e2e2e.",
      "Reducción de código: La página principal pasa de 1,527 a 170 líneas limpias y de fácil mantenimiento."
    ]
  },
  {
    version: "1.0.0",
    build: 316,
    fecha: "2026-10-28",
    estado: "publicada_anterior",
    tipo: "Menor",
    tagGit: "v1.0.0-b316",
    descripcion: "Optimización integral de Cuadre Semanal y Monitoreo Integral: desacoplamiento modular mediante custom hooks y estandarización con PageHeader, PillTabs y SurfaceCard.",
    cambios: [
      "Cuadre Semanal modularizado: Creación de `useCuadreSemanal.ts` (255 líneas de lógica aislada), reduciendo `cuadre-semanal/page.tsx` de 357 a 130 líneas limpias y actualización de `encabezado-semanal.tsx` con `<PageHeader>`.",
      "Monitoreo Integral desacoplado: Extracción de más de 500 líneas de cálculos y filtros a `useMonitoreoIntegral.ts`, reduciendo `monitoreo-integral/page.tsx` de 706 a 180 líneas.",
      "Estandarización visual: Integración de `<PageHeader>`, `<PillTabs>` (Flujo de Gaveta, Flujo de Monedas, Kardex de Inventario, Balance General) y `<SurfaceCard>` respetando la paleta oficial #1e1e1e, #252526 y #2e2e2e."
    ]
  },
  {
    version: "1.0.0",
    build: 315,
    fecha: "2026-10-27",
    estado: "publicada_anterior",
    tipo: "Menor",
    tagGit: "v1.0.0-b315",
    descripcion: "Optimización integral y modularización de Compras e Inventario: adopción del Design System (PageHeader, PillTabs, SurfaceCard) y hooks desacoplados.",
    cambios: [
      "Módulo Compras modularizado: Creación de `useCompras.ts` (180 líneas de lógica aislada), reduciendo `compras/page.tsx` de 349 a 75 líneas limpias.",
      "Estandarización de Compras: Adopción de `<PageHeader>` oficial, pestañas `<PillTabs>` (Pendientes/Todas) con contadores numéricos y `<SurfaceCard>`.",
      "Módulo Inventario modularizado: Creación de `useInventario.ts`, subcomponentes `InventarioItemCard` e `InventarioRevisionItem`, reduciendo `inventario/page.tsx` de 472 a 220 líneas.",
      "Paleta oficial aplicada: Sustitución de fondos y bordes arbitrarios por `#1e1e1e`, `#252526` y `#2e2e2e` junto a botones píldora redondeados."
    ]
  },
  {
    version: "1.0.0",
    build: 314,
    fecha: "2026-10-27",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b314",
    descripcion: "Optimización y descomposición modular de Traslados: hook useTraslados y subcomponente TrasladoCard (reducción de 467 a 195 líneas).",
    cambios: [
      "Custom Hook useTraslados: Aislamiento completo de consultas Firestore, estados de modales y filtros en `_hooks/use-traslados.ts`.",
      "Subcomponente TrasladoCard: Modularización de tarjetas de traslado, insignias de estado y botones píldora en `_components/traslado-card.tsx`.",
      "Reducción de código: La página principal pasa de 467 a menos de 200 líneas de código limpio y desacoplado.",
      "Inventario del Dashboard: Diagnóstico de líneas de código y componentes de todas las páginas para su optimización sistemática."
    ]
  },
  {
    version: "1.0.0",
    build: 313,
    fecha: "2026-10-27",
    estado: "publicada_anterior",
    tipo: "Menor",
    tagGit: "v1.0.0-b313",
    descripcion: "Design System base, reglas obligatorias de desarrollo (.agents/rules/ y AGENTS.md) y componentes comunes (@/components/comunes).",
    cambios: [
      "Reglas Maestras de Desarrollo: Creación de `.agents/rules/reglas-desarrollo.md`, `AGENTS.md` y sincronización de `.ai-rules.md` con checklist obligatorio antes de modificar código.",
      "Componentes Comunes Reutilizables: Creación de `<PageHeader>`, `<PillTabs>`, `<CountBadge>` y `<SurfaceCard>` en `@/components/comunes` para evitar controles duplicados.",
      "Tokens de Color en Tailwind: Adición de `app.panel` (#1e1e1e), `app.surface` (#252526) y `app.border` (#2e2e2e) en `tailwind.config.ts`.",
      "Estandarización de Traslados: Refactorización de la página de traslados usando `PageHeader` y `PillTabs`, garantizando coherencia visual y reducción de código."
    ]
  },
  {
    version: "1.0.0",
    build: 312,
    fecha: "2026-10-27",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b312",
    descripcion: "Ajuste de legibilidad: Breve descripción de cabecera en Traslados y badges numéricos nítidos de alto contraste en pestañas.",
    cambios: [
      "Descripción concisa en cabecera: Incorporación de 'Envío y recepción de inventario entre sucursales' bajo el título.",
      "Corrección de forma y geometría de badges: Reemplazo del formato achatado por cápsulas circulares simétricas nítidas (min-w-[20px] h-5 rounded-full).",
      "Alto contraste de color en conteos: Badge blanco puro con números oscuros para 'Enviados' y ámbar dorado para 'Pendientes', resolviendo la mezcla de color sobre fondos azules."
    ]
  },
  {
    version: "1.0.0",
    build: 311,
    fecha: "2026-10-27",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b311",
    descripcion: "Rediseño integral de Traslados: tarjetas responsivas, paleta oficial (#1e1e1e, #252526, #2e2e2e), pestañas estándar y botones píldora.",
    cambios: [
      "Simplificación del encabezado: Título directo 'Traslados' sin descripción adicional.",
      "Eliminación de tarjetas de métricas: Maximización del área de trabajo eliminando contadores redundantes.",
      "Pestañas estándar tipo píldora (rounded-full): Nombres simplificados a 'Pendientes', 'Enviados' e 'Historial' con badges de conteo integrados y barra #252526.",
      "Paleta oficial de contenedores: Contenedor principal en #1e1e1e, bordes en #2e2e2e, buscador y tarjetas en #252526.",
      "Formato de tarjetas responsivas: Reemplazo de tablas rígidas por tarjetas móviles y adaptables que eliminan el desbordamiento horizontal.",
      "Botones píldora redondeados (rounded-full): Estandarización visual de los botones Recibir, Cancelar y Ver Detalle."
    ]
  },
  {
    version: "1.0.0",
    build: 310,
    fecha: "2026-10-27",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b310",
    descripcion: "Diseño responsivo móvil y estandarización visual en el módulo de traslados de inventario.",
    cambios: [
      "Diseño móvil adaptativo: Implementación de tarjetas móviles (MobileTrasladoCard) para listados de traslados en pantallas pequeñas con desglose ergonómico de ruta, productos y acciones táctiles.",
      "Métricas 2x2 en móvil: Reorganización de las 4 tarjetas de resumen en cuadrícula de dos columnas para dispositivos móviles.",
      "Estandarización de cabecera: Aplicación del estándar oficial con contenedor responsive, icono en círculo traslúcido y botón de ancho adaptable.",
      "Cumplimiento de reglas de diseño: Eliminación total de textos en mayúsculas sostenidas (ALL CAPS / uppercase) en tarjetas y selectores, aplicando Tipo Título.",
      "Pestañas móviles con scroll suave: Contenedor horizontal con scroll nativo para pestañas de filtrado de traslados sin cortes de texto.",
      "Modales optimizados para móvil: Ajuste de espaciado interior (p-4 sm:p-6) y radios redondeados en modales de traslado."
    ]
  },
  {
    version: "1.0.0",
    build: 309,
    fecha: "2026-10-26",
    estado: "publicada_anterior",
    tipo: "Menor",
    tagGit: "v1.0.0-b309",
    descripcion: "Sistema integral de traslados de inventario entre sucursales, homologación de catálogo en recepción, liquidación en cuadre semanal y control de permisos de usuario.",
    cambios: [
      "Módulo de Traslados de Inventario Inter-sucursal: Envío, tránsito y recepción de productos entre sucursales garantizando compras independientes y cuentas por pagar separadas.",
      "Homologación y mapeo de catálogo en recepción: Al recibir un traslado, el operador puede asociar productos con diferente denominación local (ej. Nachos -> Bolsitas) o crearlos como nuevo producto.",
      "Cobro y liquidación en Cuadre Semanal: Integración de traslados en el cuadre semanal de la sucursal emisora para cobro como ingreso en efectivo, con liquidación atómica y consulta en el historial.",
      "Gestión de permisos multi-sucursal: Visualización y control de sucursales autorizadas por usuario en el panel de administración.",
      "Optimización de selectores y UX: Selector nativo en recepción de traslados con filtro local en tiempo real y persistencia del nombre de producto seleccionado en el autocompletado."
    ]
  },
  {
    version: "1.0.0",
    build: 308,
    fecha: "2026-10-21",
    estado: "archivada",
    tipo: "Parche",
    tagGit: "v1.0.0-b308",
    descripcion: "Flujo de monedas desacoplado de pagos, auditoría de despachos y simplificación de interfaz en monitoreo integral.",
    cambios: [
      "Flujo de monedas desacoplado: Flujo independiente de monedas en monitoreo integral.",
      "Auditoría de despachos: Registro y visualización detallada de despachos en el módulo de auditoría.",
      "Simplificación de interfaz en monitoreo integral y servicios de inventario."
    ]
  },
  {
    version: "1.0.0",
    build: 307,
    fecha: "2026-10-13",
    estado: "archivada",
    tipo: "Parche",
    tagGit: "v1.0.0-b307",
    descripcion: "Corrección de persistencia en efectivoAcumuladoMonedas: congelación durante el período operativo y actualización exclusiva en cierre de caja y cuadre de máquinas.",
    cambios: [
      "Congelación de acumulado durante el turno: Se eliminó el incremento indebido de efectivoAcumuladoMonedas en ventas rápidas y comandos de voz, garantizando que el acumulado multi-turno no varíe en el transcurso del período.",
      "Aislamiento contable del período: Las ventas de monedas en efectivo ahora alimentan de forma exclusiva el contador del período actual (totalVentasMonedas).",
      "Consistencia con Cierre de Caja y Cuadre: Se elimina la duplicación accidental de montos al consolidar el turno y se garantiza que efectivoAcumuladoMonedas solo sea modificado en el cierre de caja o cuadre de tragamonedas."
    ]
  },
  {
    version: "1.0.0",
    build: 306,
    fecha: "2026-10-12",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b306",
    descripcion: "Trazabilidad de efectivo de monedas vendidas en el período: inicio en Q0.00 tras cierre de caja y rastreo acumulado línea por línea de ventas y premios del turno.",
    cambios: [
      "Apertura en cero para el período: El efectivo de venta de monedas en la apertura inicia en Q0.00 tras el corte de caja, reflejando fielmente el flujo del nuevo turno.",
      "Trazabilidad de efectivo por movimiento en el período: Cada venta (+Q) o premio pagado (-Q) actualiza el indicador 'Efectivo en período: Q...' mostrando cómo se acumula el efectivo neto del turno hasta alcanzar el total del período (ej. Q40).",
      "Integridad de exportación CSV: El reporte exportado incluye el inicio en Q0.00 y la columna de efectivo acumulado del período."
    ]
  },
  {
    version: "1.0.0",
    build: 305,
    fecha: "2026-10-11",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b305",
    descripcion: "Reorganización modular de menú y permisos: nuevo grupo Reportes y remoción definitiva de páginas descontinuadas.",
    cambios: [
      "Eliminación definitiva de páginas obsoletas: Remoción completa de los módulos y rutas de Monitoreo de Período y Movimiento de Producto.",
      "Nuevo grupo de navegación 'Reportes': Se integró un menú dedicado con Monitoreo Integral, Control de Pagos, Auditoría y Eliminar por Rango de Fecha.",
      "Matriz de permisos integrada para Reportes: Configuración de privilegios de usuario para cada reporte (reportes.monitoreo, reportes.pagos, reportes.auditoria, reportes.eliminar_rango) con compatibilidad total para roles previos.",
      "Depuración del menú de Administración: Administración ahora queda enfocada en Compras, Gastos, Cuadre de Tragamonedas, Cuadre Semanal y Cuadre Mensual."
    ]
  },
  {
    version: "1.0.0",
    build: 304,
    fecha: "2026-10-11",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b304",
    descripcion: "Corrección de persistencia de auditoría transaccional en Firestore y prevención de bloqueos operativos por inventario.",
    cambios: [
      "Sanitización profunda en auditoría: Implementación de limpieza recursiva (limpiarProfundoFirestore) para evitar campos con valores undefined en operaciones Transaction.set() de auditoría.",
      "Prevención de bloqueos por stock físico: Eliminación de bloqueos rígidos por stock insuficiente en ventas y consumos temporales, permitiendo el registro de pedidos reales cuando existe desfase en el inventario digital.",
      "Control robusto de excepciones en asistente: Captura y manejo estructurado de errores en el ejecutor de voz para evitar pantallas de fallo o interrupciones en la interfaz de usuario."
    ]
  },
  {
    version: "1.0.0",
    build: 303,
    fecha: "2026-10-11",
    estado: "publicada_anterior",
    tipo: "Parche",
    tagGit: "v1.0.0-b303",
    descripcion: "Corrección y priorización del motor de IA en el Asistente de Voz para comandos de cuentas y cuentas pendientes.",
    cambios: [
      "Prioridad estricta al motor de IA (Groq): Inclusión de directrices completas en el modelo de lenguaje para interpretar órdenes de agregar productos a cuentas y cuentas pendientes ('a la cuenta de X', 'a la cuenta pendiente de X', 'a una cuenta pendiente', etc.).",
      "Corrección de función auxiliar: Se implementó la función extraerCantidad requerida por el procesador, eliminando el fallo interno que activaba el motor local.",
      "Búsqueda dual de cuentas de clientes: El ejecutor de voz ahora localiza clientes tanto en la colección de clientes como en las ventas pendientes de pago abiertas en la sucursal.",
      "Asignación automática contextual: Si hay una única cuenta pendiente abierta y no se especifica cliente, el sistema la vincula o consulta amablemente a quién cargar el pedido.",
      "Mayor resiliencia de modelos: Inclusión de modelo de lenguaje de respaldo adicional y extensión del tiempo de espera para evitar fallbacks indebidos."
    ]
  },
  {
    version: "1.0.0",
    build: 302,
    fecha: "2026-10-11",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b302",
    descripcion: "Modificación de contraseñas de usuarios en sucursales y maestro, control estricto de sesión y privacidad de credenciales.",
    cambios: [
      "Modificación de contraseñas de usuarios: Módulo de actualización de contraseñas en tiempo real para personal de sucursales y en gestión de usuarios maestro.",
      "Acción directa y modal especializado: Botón con icono de llave para cambio directo en cada usuario, validación de coincidencia y campo opcional al editar perfil.",
      "Envío de enlace de restablecimiento: Opción de un solo clic para enviar correo oficial de Firebase al usuario.",
      "Persistencia de sesión exclusiva: Configuración de autenticación por sesión de navegador (browserSessionPersistence) con invalidación de sesión residual al reabrir el navegador.",
      "Prevención de autoguardado en navegador: Desactivación de recordatorio de contraseñas y autocompletado en pantalla de inicio de sesión.",
      "Integración de credenciales de servicio: Configuración de Firebase Admin en el servidor para ejecución de cambios de claves administrativas."
    ]
  },
  {
    version: "1.0.0",
    build: 301,
    fecha: "2026-10-11",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b301",
    descripcion: "Rediseño integral de la página de Monitoreo Integral del Período: auditoría de gaveta, flujo de monedas, kardex de inventario y balance general del turno.",
    cambios: [
      "Rediseño visual completo estilo POS y dark theme: Encabezado estándar, selector unificado de turnos con estado dinámico en vivo, hora de apertura y duración del turno.",
      "Cuatro tarjetas ejecutivas de métricas (KPIs): Visualización en tiempo real de Efectivo en gaveta, Flujo neto de monedas, Total efectivo esperado en caja física y Existencia actual de monedas.",
      "Cuatro pestañas interactivas unificadas: Flujo de gaveta, Flujo de monedas, Kardex de inventario físico y Balance general contable con conciliación de los 3 pilares del negocio.",
      "Buscadores y filtros en cada sección: Filtros por categoría de cobro (mesas vs productos), tipo de movimiento de monedas (ventas vs premios vs máquinas) y kardex de inventario, con ordenamiento cronológico alternable.",
      "Unificación terminológica: Reemplazo integral del término 'fichas' por 'monedas' en todas las tablas, insignias, tarjetas y reportes.",
      "Exportación de informe a CSV: Descarga inmediata de la auditoría y conciliación del turno a formato CSV."
    ]
  },
  {
    version: "1.0.0",
    build: 300,
    fecha: "2026-10-11",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b300",
    descripcion: "Módulo integral de Control y Auditoría de Pagos con soporte para pagos unificados multi-venta, rastreo profundo de productos, operadores y tiempos exactos.",
    cambios: [
      "Unificación inteligente de pagos multi-venta: Cuando un cliente abona o liquida varias ventas en una sola operación (ej. pago de Q40 que salda Q10 de una venta y Q30 de otra), el sistema lo agrupa automáticamente como un solo pago consolidado de Q40, desglosando con total claridad a qué ventas se destinó el dinero y qué productos cubrió en cada una.",
      "Botón de filtros integrado al buscador: Se añadió un botón desplegable integrado físicamente al final del input de búsqueda para mostrar u ocultar los filtros secundarios (período, método, operador y tipo), con insignia de filtros activos y diseño limpio.",
      "Encabezado unificado estilo POS y navegación única: Se homologó la tipografía, título y subtítulo al diseño estándar del Punto de Venta (POS), y se delimitó la ruta en el menú exclusivamente a Administración para evitar la doble selección simultánea en la barra lateral.",
      "Cumplimiento estricto de regla sin mayúsculas: Se removieron todos los estilos en mayúsculas sostenidas (uppercase) en tarjetas de métricas, insignias, botones y tablas, preservando la tipografía natural del sistema.",
      "Búsqueda profunda multidimensional de pagos: Localización inmediata de comprobantes buscando por productos específicos saldados (nombre o ID), clientes, número de cualquiera de las ventas cubiertas, número de recibo, cajero u operador y método de pago.",
      "Rastreo de artículos cubiertos y tipo de liquidación: Desglose pormenorizado en cada pago mostrando qué productos fueron cubiertos, cantidades, montos aplicados individualmente, subtotales y distinción entre saldado al 100% y abonos parciales.",
      "Métricas financieras en tiempo real y exportación: Tarjetas KPI con total recaudado, cobros en efectivo, tarjeta y artículos cubiertos según los filtros activos, con exportación completa a formato CSV y vista previa de ticket/comprobante unificado imprimible."
    ]
  },
  {
    version: "1.0.0",
    build: 299,
    fecha: "2026-10-11",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b299",
    descripcion: "Protección de ventas existentes al descartar cambios en edición en el Punto de Venta (POS).",
    cambios: [
      "Protección integral contra eliminación accidental de ventas: Al descartar cambios en una venta pendiente o a crédito que ya existía con productos y abonos, el sistema ahora devuelve única y exclusivamente el stock de los productos nuevos agregados durante esa sesión de edición, preservando intacta la venta original en Firestore con todos sus consumos y pagos previos.",
      "Manejo seguro de la opción 'Permanecer': Al pulsar 'Permanecer' o cerrar el cuadro de diálogo de descarte, se restaura adecuadamente el nombre del cliente en el buscador y se mantiene activa la sesión de edición sin pérdidas de información."
    ]
  },
  {
    version: "1.0.0",
    build: 298,
    fecha: "2026-10-10",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b298",
    descripcion: "Métrica global de cuentas a crédito y desglose dinámico de deuda por cliente en el POS.",
    cambios: [
      "Métrica de total de cuentas a crédito: Se integró una tarjeta informativa ubicada entre el buscador y los acordeones de la pestaña de crédito que calcula y muestra en tiempo real la suma total adeudada de todas las cuentas a crédito registradas.",
      "Desglose reactivo de deuda por cliente al buscar: Al escribir en el buscador para consultar a un cliente, la tarjeta se transforma dinámicamente indicando 'Deuda de [Cliente]', calculando el saldo total de sus cuentas a crédito e informando si posee cargos adicionales en su cuenta abierta actual.",
      "Restauración de píldoras en escritorio: Se restauró la forma original redondeada tipo píldora (rounded-full, h-10 px-4) en los accesos rápidos del POS para computadoras y tablets, limitando los círculos compactos exclusivamente a la vista móvil en una fila."
    ]
  },
  {
    version: "1.0.0",
    build: 297,
    fecha: "2026-10-08",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b297",
    descripcion: "Optimización móvil de accesos rápidos en Punto de Venta: alineación en una sola fila con botones circulares compactos.",
    cambios: [
      "Accesos rápidos en una sola fila para móviles: En el encabezado del Punto de Venta (POSHeader), los accesos a Sala de Juegos, Tragamonedas e Historial ahora se organizan en una sola línea horizontal mediante botones circulares con sus respectivos iconos, evitando que ocupen dos filas en pantallas móviles.",
      "Preservación de experiencia en escritorio: En pantallas medianas y grandes, los botones conservan su aspecto completo con icono y texto extendido."
    ]
  },
  {
    version: "1.0.0",
    build: 296,
    fecha: "2026-10-07",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b296",
    descripcion: "Estabilización y suavizado de animación del micrófono y eliminación de falso nivel de audio en silencio para móviles.",
    cambios: [
      "Corrección de falso nivel de audio en silencio: Se eliminó el valor inicial forzado (35%) en dispositivos móviles y se integró una puerta de ruido (noise gate) que garantiza nivel 0% absoluto cuando hay silencio, evitando falsos positivos de 'Voz detectada'.",
      "Eliminación de titileo y rebote brusco: Se reemplazaron las animaciones agresivas (bounce y parpadeo rápido de 75ms) por halos acústicos concéntricos con transiciones suaves (ease-out de 300ms) y escalado armónico reactivo a la voz.",
      "Escucha continua estable en móviles: Se configuró continuous = true junto con decaimiento progresivo del volumen para evitar que el navegador cierre el micrófono de forma prematura en pausas breves.",
      "Resolución de ReferenceError en móvil: Sincronización de detección de dispositivo mediante isMobileRef, eliminando errores de variables no definidas en el callback de Web Speech API.",
      "Cabecera minimalista para móviles: Rediseño limpio del encabezado ('Asistente de Voz') sin sobrecarga de subtítulos, badges con ancho no divisible (whitespace-nowrap) y separación amplia para el botón de cierre (X), impidiendo que los textos se deformen o dividan en múltiples líneas."
    ]
  },
  {
    version: "1.0.0",
    build: 295,
    fecha: "2026-10-07",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b295",
    descripcion: "Rediseño enfocado en móvil para el Asistente de Voz: Botón Hero prominente y comandos colapsables.",
    cambios: [
      "Eliminación del campo de texto manual: Se retiró el input de texto y botón de envío para priorizar la interacción 100% natural por voz.",
      "Botón Hero de micrófono ampliado: El botón de captura de voz ahora es el elemento visual dominante, con ondas acústicas concéntricas animadas y retroalimentación inmediata.",
      "Comandos sugeridos colapsables por defecto: La lista de módulos y ejemplos ahora viene oculta por defecto y cuenta con un botón desplegable para consultarla cuando sea necesario sin sobrecargar la pantalla móvil."
    ]
  },
  {
    version: "1.0.0",
    build: 294,
    fecha: "2026-10-07",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b294",
    descripcion: "Optimización profunda y simplificación de código en ejecutores de voz e indicador de motor (API vs Local).",
    cambios: [
      "Optimización integral de asistente-voz-ejecutor.ts: Reducción de más de 800 líneas de código repetitivo mediante helpers modulares (resolverItemsPedido, obtenerMesaContexto, aplicarConsumosAVentaCliente) manteniendo el 100% de la funcionalidad y robustez transaccional.",
      "Indicador en tiempo real de motor utilizado: Ahora se detecta y visualiza explícitamente en la interfaz y notificaciones si la orden se interpretó con la API de IA (Groq) o el Motor Local (Offline/Respaldo).",
      "Conexión directa cliente-servidor para voz: El hook useVoiceAssistant ahora procesa a través del endpoint /api/asistente-voz para aprovechar la API Key de Groq en el servidor, con respaldo automático e instantáneo al motor local."
    ]
  },
  {
    version: "1.0.0",
    build: 293,
    fecha: "2026-10-07",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b293",
    descripcion: "Diferenciación estricta entre cobro de cuenta actual y cobro de deuda total, con abonos inteligentes en cascada.",
    cambios: [
      "Distinción precisa de cobro: 'cobra la cuenta de Samuel' cobra única y exclusivamente su cuenta actual pendiente de pago (dejando intactos los créditos e informando el saldo a crédito restante). 'cobra el total de la cuenta de Samuel' (o 'cuenta completa', 'todo') liquida la deuda global completa incluyendo créditos.",
      "Abono prioritario con excedente en cascada: 'abona 30 a Samuel' se aplica prioritariamente a la cuenta actual; si el abono cubre la cuenta actual y sobra saldo, el excedente se abona a la venta a crédito más antigua.",
      "Control de límites y validación: Informa con claridad si el cliente no tiene cuenta actual pero sí créditos pendientes, guiando al operador para usar la orden correcta."
    ]
  },
  {
    version: "1.0.0",
    build: 292,
    fecha: "2026-10-07",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b292",
    descripcion: "Abonos unificados y en cascada a deuda total del cliente (cuenta actual + créditos históricos) por comando de voz.",
    cambios: [
      "Abono consolidado a deuda total: Al indicar 'abona 30 a Samuel', el sistema calcula la deuda global (cuenta abierta actual más ventas a crédito pendientes). Si debe 10 en la cuenta actual y 30 en créditos (total 40), el abono de 30 se aplica exitosamente al total en lugar de limitarse a la cuenta individual.",
      "Distribución transaccional en cascada: Se liquida primero la cuenta abierta pendiente y el excedente del abono se distribuye cronológicamente entre las ventas a crédito pendientes mediante registrarAbonoGeneral.",
      "Cobro y consulta integral de cuentas: 'cobra la cuenta de X' y 'cuánto debe X' ahora contemplan la deuda consolidada completa e informan el saldo restante exacto con claridad."
    ]
  },
  {
    version: "1.0.0",
    build: 291,
    fecha: "2026-10-07",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b291",
    descripcion: "Corrección transaccional de Firestore: orden estricto de lecturas antes de escrituras al agregar consumos por voz.",
    cambios: [
      "Garantía ACID en transacciones de Firestore: Corrección del error 'Firestore transactions require all reads to be executed before all writes' al registrar múltiples consumos en cuentas de clientes.",
      "Todas las lecturas de correlativos y cuentas abiertas existentes se ejecutan en paralelo al inicio de la transacción antes de aplicar cualquier actualización de inventario o venta.",
      "Registro atómico perfecto y sin excepciones al cargar uno o varios productos a clientes registrados o nuevos."
    ]
  },
  {
    version: "1.0.0",
    build: 290,
    fecha: "2026-10-07",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b290",
    descripcion: "Soporte intuitivo para múltiples consumos en un solo comando de voz para cuentas de clientes, mesas y ventas rápidas.",
    cambios: [
      "Extracción de múltiples productos: El asistente ahora procesa comandos compuestos como 'agrega una coca, un casino, y un jugo de vegetales a Samuel' identificando y agregando cada ítem a la cuenta de forma atómica.",
      "Consumos múltiples en mesas: Soporte para añadir varios productos simultáneamente a una mesa (ej: 'agrega 2 cervezas y un agua a la mesa 3') con descuento individual de inventario.",
      "Ventas rápidas compuestas: Permite registrar múltiples productos en una sola venta rápida (ej: 'vende una coca y 2 casinos').",
      "Confirmación agrupada de nuevo cliente: Si se ordenan múltiples productos para un cliente nuevo, se solicita confirmación una sola vez registrando todos los ítems en su cuenta.",
      "Respuesta de síntesis de voz natural: El asistente confirma verbalmente la lista completa de productos cargados de manera fluida y cordial."
    ]
  },
  {
    version: "1.0.0",
    build: 289,
    fecha: "2026-10-07",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b289",
    descripcion: "Integración del Agente de Inteligencia Artificial de Voz ultrarrápido con Groq (Llama/GPT-OSS 120B/20B) y tolerancia total ante fallos.",
    cambios: [
      "Agente de IA nativo con Groq: Motor de inferencia ultrarrápido (~200ms) impulsado por modelos avanzados con razonamiento en contexto completo del negocio.",
      "Comprensión contextual profunda: Asocia automáticamente apodos, términos coloquiales y modismos al catálogo de productos ('un verde' -> 'Verde Lukis', 'una coca' -> 'Coca Cola', 'dos coronas' -> 'Cerveza Corona').",
      "Control de mesas avanzado: Reconoce de inmediato mesas por tiempo definido pagadas al contado ('inicia mesa 2 definido una hora pagado de contado'), transferencias a clientes ('finaliza la mesa 1 y pasa la cuenta a Samuel') y división de cuentas ('divide la cuenta de la mesa 1 entre 2 en efectivo').",
      "Gestión de cuentas y abonos: Infiere clientes tanto con sintaxis formal ('a la cuenta de X') como directa ('a X') y ejecuta abonos con precisión ('abona 20 a la cuenta de Samuel').",
      "Arquitectura de resiliencia cero caídas: Si el servicio externo presenta lentitud o desconexión, el sistema activa automáticamente el motor local NLP integrado sin interrupciones para el operador.",
      "Respuestas concisas sin ruido: Ante comandos ajenos a la operación o no entendidos, responde estrictamente 'Comando no reconocido.' sin recitar sugerencias innecesarias."
    ]
  },
  {
    version: "1.0.0",
    build: 288,
    fecha: "2026-10-07",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b288",
    descripcion: "Comandos no reconocidos sin sugerencias, validación estricta de clientes y agrupación inteligente en cuentas abiertas existentes.",
    cambios: [
      "Comandos no reconocidos concisos: el asistente responde únicamente 'Comando no reconocido.' de forma directa sin recitar sugerencias, opciones ni ejemplos innecesarios.",
      "Validación de clientes antes de cargar consumos: si el cliente existe en la lista oficial de clientes de la sucursal, ejecuta la orden de inmediato; si no existe, solicita confirmación por voz ('Sí'/'No') o botones visuales para crearlo formalmente antes de proceder.",
      "Detección y agrupación en cuentas abiertas: tras verificar o registrar al cliente, comprueba si ya posee una cuenta (venta) pendiente de pago; si la tiene, añade el nuevo consumo a esa misma venta abierta en lugar de duplicar documentos; si no tiene cuenta abierta, genera una nueva venta pendiente de pago.",
      "Soporte para asignación directa a nombre de cliente: compatibilidad natural tanto para frases formales ('agrega una coca a la cuenta de Victor Hugo') como directas ('agrega una coca a Victor Hugo', 'cárgale 2 cervezas a Carlos', 'apunta un agua para Pedro').",
      "Abonos a cuentas por comando de voz: soporte completo para 'abona 20 a la cuenta de Samuel', 'abona 50 a Carlos', 'abono de 30 a Juan en tarjeta'. Valida que exista saldo pendiente, aplica el abono, actualiza ingresos de caja, genera el comprobante de pago oficial e informa el saldo restante de inmediato.",
      "Protección contra cuentas ficticias por fallos fonéticos o de transcripción en comandos de punto de venta y mesas."
    ]
  },
  {
    version: "1.0.0",
    build: 287,
    fecha: "2026-10-07",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b287",
    descripcion: "Corrección de cobro duplicado en mesas prepagadas, finalización a cuenta de cliente, cobro dividido y ventas rápidas POS por voz.",
    cambios: [
      "Solución al cobro duplicado de mesas prepagadas: al cobrar o finalizar una mesa pagada de contado, el alquiler ya no se vuelve a sumar, cobrando únicamente consumos si los hubiera o liberándola directamente.",
      "Comando de voz para finalizar mesa y pasar a cuenta de cliente: soporte para frases como 'finaliza la mesa 1 y pasa la cuenta a Juan', 'cierra la 1 y cargala a Juan', 'pasa el total de la mesa 1 a la cuenta de Carlos'. Si el tiempo estaba prepagado, sólo se transfieren los consumos.",
      "Comando de voz para dividir cuenta y cobrar: soporte para 'divide la cuenta de la mesa 1 entre 2', 'divide la mesa 1 en 3 partes en efectivo', 'cobra la mesa 1 dividida entre 2'. Distribución equitativa y cierre automático de la mesa.",
      "Ventas rápidas de POS por voz: soporte para 'vende una coca cola', 'despacha 2 cervezas gallo en tarjeta', 'despacho rápido de 1 verde', 'cobra un agua en efectivo'. Reconocimiento de método de pago (Efectivo/Tarjeta), descuento automático de inventario e incremento en métricas generales de caja."
    ]
  },
  {
    version: "1.0.0",
    build: 286,
    fecha: "2026-10-07",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b286",
    descripcion: "Inicio de mesas pagado de contado por voz, búsqueda flexible de productos (estilo despacho rápido) y corrección de monitoreo integral.",
    cambios: [
      "Soporte para iniciar mesas en tiempo definido pagado de contado inmediatamente por comando de voz (ej. 'inicia una hora en mesa 1 pagado de contado').",
      "Búsqueda intuitiva de productos de catálogo por términos abreviados, alias o palabras clave (ej. 'coca' -> 'Coca Cola', 'verde' -> 'Verde Lukis').",
      "Eliminación de fallbacks arbitrarios a 'Coca Cola': si un producto no existe en el catálogo, el asistente avisa claramente por voz sin cargar nada a la mesa.",
      "Integración de productos virtuales y físicos en el contexto del asistente de voz desde el Header.",
      "Corrección del TypeError ('Cannot read properties of null (reading inicio)') en la página de monitoreo integral."
    ]
  },
  {
    version: "1.0.0",
    build: 285,
    fecha: "2026-10-07",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b285",
    descripcion: "Motor semántico local de comandos de voz ultra-flexible y coloquial para todas las operaciones.",
    cambios: [
      "Interpretación intuitiva de comandos de voz sin requerir sintaxis rígida ni palabras literales obligatorias.",
      "Reconocimiento de múltiples variantes conversacionales: 'inicia tiempo en la mesa 1', 'inicia la 1', 'abre la 2', 'finaliza la mesa 1', 'termina la 1', 'cierra la mesa 2', 'cobra la 1'.",
      "Normalización ortográfica y de acentos con mapeo expandido de numerales ordinales y cardinales (1 al 30).",
      "Soporte integral y tolerante a fallas en modo sin conexión para Mesas de Billar, POS y Máquinas Tragamonedas."
    ]
  },
  {
    version: "1.0.0",
    build: 284,
    fecha: "2026-10-07",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b284",
    descripcion: "Interruptor directo para control por voz en cada tarjeta de sucursal del panel administrativo.",
    cambios: [
      "Agregado control interactivo directo (Switch con icono y estado) en las tarjetas de la página de gestión de sucursales.",
      "Activación y desactivación instantánea de comandos de voz en Firestore con un solo clic sin necesidad de entrar a edición."
    ]
  },
  {
    version: "1.0.0",
    build: 283,
    fecha: "2026-10-07",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b283",
    descripcion: "Corrección de referencia de ámbito en Header para generalesTragamonedas.",
    cambios: [
      "Declaración explícita de maquinasQuery y maquinasData en el componente principal Header.",
      "Resolución del error en tiempo de ejecución (ReferenceError: generalesTragamonedas is not defined)."
    ]
  },
  {
    version: "1.0.0",
    build: 282,
    fecha: "2026-10-07",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b282",
    descripcion: "Control de comandos de voz por sucursal, soporte móvil/tablet y cobertura integral de Mesas, POS y Tragamonedas.",
    cambios: [
      "Opción en administración de sucursales para activar o desactivar los comandos de voz de forma granular por cada sucursal.",
      "Compatibilidad y resiliencia en dispositivos móviles y tablets (Android e iOS), evitando el bloqueo exclusivo del hardware del micrófono.",
      "Cobertura completa para Sala de Juegos: inicio libre o definido, ajuste/adición de tiempo, traslados entre mesas, cobro en efectivo/tarjeta, traspaso a cuentas y eliminación de consumos.",
      "Cobertura completa para Punto de Venta (POS): despacho de venta rápida, cargos a cuentas de clientes, cobro de cuentas y consulta de saldos.",
      "Cobertura completa para Tragamonedas: recarga de base, extracción de monedas, registro de pago de premios y consulta de estado de máquinas.",
      "Interfaz enriquecida en el diálogo de voz con selector de comandos categorizados por módulo y advertencia de red para móviles."
    ]
  },
  {
    version: "1.0.0",
    build: 281,
    fecha: "2026-10-07",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b281",
    descripcion: "Estabilización de captura continua de voz con medidor acústico en tiempo real y compatibilidad Windows.",
    cambios: [
      "Escucha continua con buffer acumulador que evita cortes prematuros por pausas naturales al hablar.",
      "Medidor de nivel acústico en tiempo real (AudioContext y AnalyserNode) con animación de ondas reactivas a la voz.",
      "Detección y despacho automático tras pausa prolongada (1.5s) y envío instantáneo al cerrar o pausar el micrófono.",
      "Corrección de export en flujo de recomendaciones personalizadas y delimitación de raíz de compilación en Next.js."
    ]
  },
  {
    version: "1.0.0",
    build: 280,
    fecha: "2026-10-07",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b280",
    descripcion: "Arquitectura híbrida con motor local NLP de respaldo ante agotamiento de saldo en Google AI.",
    cambios: [
      "Motor local inteligente de procesamiento de comandos de voz con tolerancia total a fallas de API (error 402/429/red).",
      "Ejecución garantizada sin costo de inicio de mesas, despachos a cuentas y consultas operativas sin depender de créditos.",
      "Mensajes informativos contextuales orientando al usuario para recarga de API Key en Google AI Studio sin bloquear el sistema."
    ]
  },
  {
    version: "1.0.0",
    build: 279,
    fecha: "2026-10-07",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b279",
    descripcion: "Actualización de modelo de IA a Gemini 3.8 Flash para el asistente de voz inteligente.",
    cambios: [
      "Migración del modelo de Genkit a 'googleai/gemini-3.8-flash' resolviendo deprecación y error 404 del modelo anterior.",
      "Optimización en la velocidad de inferencia y precisión para comandos de voz y preguntas del sistema."
    ]
  },
  {
    version: "1.0.0",
    build: 278,
    fecha: "2026-10-07",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b278",
    descripcion: "Asistente de voz inteligente para control de mesas, despacho de consumos y asistencia interactiva.",
    cambios: [
      "Integración de reconocimiento de voz (Speech-to-Text) y síntesis vocal (Text-to-Speech) en español.",
      "Procesamiento inteligente de comandos con IA (Gemini 2.5 Flash / Genkit) para interpretar lenguaje natural.",
      "Comandos de voz para iniciar tiempo libre o definido en mesas de billar y consolas.",
      "Despacho directo por voz de consumos hacia mesas ocupadas o a cuentas abiertas de clientes.",
      "Consultas en tiempo real sobre el estado de mesas, consumos y asistencia interactiva para dudas del sistema.",
      "Acceso global desde el encabezado con confirmación visual de acciones y botón de deshacer."
    ]
  },
  {
    version: "1.0.0",
    build: 277,
    fecha: "2026-10-05",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b277",
    descripcion: "Corrección cronológica del rendimiento mensual en dashboard para fechas corridas del siguiente mes.",
    cambios: [
      "Ajuste en la gráfica de rendimiento mensual del dashboard para asignar correctamente los cuadres ejecutados en fechas corridas del siguiente mes al mes que les corresponde cronológicamente (ej. cierre de septiembre realizado los primeros días de octubre).",
      "Persistencia de los campos 'mesCorrespondiente' y 'fechaPeriodo' al procesar nuevos cuadres mensuales a partir de los cuadres semanales seleccionados.",
      "Visualización de insignia con el período mensual correspondiente en los registros del historial de cuadre mensual.",
      "Ajuste de estilos en tooltips eliminando mayúsculas forzadas (uppercase)."
    ]
  },
  {
    version: "1.0.0",
    build: 276,
    fecha: "2026-10-05",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b276",
    descripcion: "Paleta visual unificada del POS aplicada a historiales de cuadre semanal y mensual.",
    cambios: [
      "Aplicación de colores del POS de venta (#1e1e1e en contenedor principal, #252526 en acordeones y tarjetas, #2e2e2e en líneas y bordes).",
      "Actualización de filtros de búsqueda, tarjetas de métricas internas y detalles de registros al tema oscuro del POS.",
      "Eliminación de estilos en mayúsculas forzadas (uppercase) preservando la tipografía natural del sistema."
    ]
  },
  {
    version: "1.0.0",
    build: 275,
    fecha: "2026-10-05",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b275",
    descripcion: "Disponibilidad permanente de botones de Historial en Cuadre Semanal y Cuadre Mensual.",
    cambios: [
      "Habilitación incondicional del botón 'Historial' en el encabezado principal de Cuadre Semanal.",
      "Inclusión de botones de acceso directo a sus historiales respectivos en los estados vacíos de Cuadre Semanal y Cuadre Mensual.",
      "Garantía de acceso completo al historial de cierres y liquidaciones aún cuando no existan registros pendientes."
    ]
  },
  {
    version: "1.0.0",
    build: 274,
    fecha: "2026-10-04",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b274",
    descripcion: "Corrección de error crítico en cierre de caja por referencia no definida de qMonedasPorNombre.",
    cambios: [
      "Declaración y definición de la consulta qMonedasPorNombre en el servicio de cierre de caja.",
      "Restablecimiento de la ejecución fluida del cierre de turno y cuadre de caja."
    ]
  },
  {
    version: "1.0.0",
    build: 273,
    fecha: "2026-10-04",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b273",
    descripcion: "Simplificación visual de auditoría: remoción de banner de período y tarjetas de métricas.",
    cambios: [
      "Eliminación del banner de período visualizado y las 4 tarjetas de métricas rápidas de auditoría.",
      "Interfaz más limpia y directa con acceso inmediato a los filtros, períodos y bitácora de eventos.",
      "Optimización del espacio vertical en pantalla tanto en computadoras como en tablets y móviles."
    ]
  },
  {
    version: "1.0.0",
    build: 272,
    fecha: "2026-10-04",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b272",
    descripcion: "Desglose visual de artículos, cantidades y precios en auditoría con recuperación retroactiva.",
    cambios: [
      "Registro explícito de artículos, cantidades agregadas y montos en cada operación de venta y edición.",
      "Visualización inmediata de productos involucrados mediante distintivos en las tarjetas del feed de auditoría.",
      "Sección dedicada 'Artículos y Cantidades Involucradas' en el modal de inspección con cantidades, nombres y precios.",
      "Recuperación retroactiva automática de productos desde la venta o historial para registros de auditoría anteriores.",
      "Trazabilidad detallada para consumos en mesas de juego, compras y movimientos de inventario."
    ]
  },
  {
    version: "1.0.0",
    build: 271,
    fecha: "2026-10-04",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b271",
    descripcion: "Detección avanzada y trazabilidad de Computadoras, Tablets y Teléfonos en auditoría.",
    cambios: [
      "Detección automática de hardware clasificando entre Computadoras, Tablets y Teléfonos Celulares.",
      "Registro de metadatos del dispositivo (sistema operativo, navegador y resolución) en cada movimiento auditado.",
      "Distintivos e iconos dedicados (Monitor, Tablet, Smartphone) en las tarjetas y modales de auditoría.",
      "Diálogo de identificación con detección de hardware y sugerencias para Tablets de mesas, Teléfonos y Cajas."
    ]
  },
  {
    version: "1.0.0",
    build: 270,
    fecha: "2026-10-04",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b270",
    descripcion: "Carga optimizada de auditoría por período abierto predeterminado y selector de turnos.",
    cambios: [
      "Carga predeterminada enfocada exclusivamente en los movimientos del período abierto actual de caja.",
      "Selector interactivo de períodos para consultar turnos cerrados anteriores (Turno #N con fecha/hora) o historial completo.",
      "Optimización a nivel de consulta Firestore delimitando por fechaInicioPeriodo para reducir lecturas y acelerar la carga.",
      "Banner informativo del período consultado con acceso directo para volver al período abierto con un solo clic."
    ]
  },
  {
    version: "1.0.0",
    build: 269,
    fecha: "2026-10-04",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b269",
    descripcion: "Reemplazo de ID de usuario por nombre legible e identificación del equipo/terminal en auditoría.",
    cambios: [
      "Sustitución de IDs crudos por el nombre real del operador en todos los registros y filtros de auditoría.",
      "Registro y visualización del nombre del equipo o terminal de trabajo en cada transacción auditada.",
      "Módulo interactivo para identificar y asignar nombre a cada estación de trabajo (Caja Principal, Barra, etc.).",
      "Búsqueda instantánea en auditoría filtrando también por el nombre del equipo utilizado."
    ]
  },
  {
    version: "1.0.0",
    build: 268,
    fecha: "2026-10-04",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b268",
    descripcion: "Resolución automática y visualización del nombre real del operador en auditoría.",
    cambios: [
      "Mapeo automático de nombres reales de usuario desde la colección de usuarios y user_auth_lookup.",
      "Resolución retroactiva para registros de auditoría existentes con 'Usuario del sistema'.",
      "Sincronización global del perfil del usuario en caché de auditoría en todas las transacciones.",
      "Inclusión de nombre real y rol en tarjetas y modal de detalles de auditoría."
    ]
  },
  {
    version: "1.0.0",
    build: 267,
    fecha: "2026-10-04",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b267",
    descripcion: "Sistema integral de auditoría de usuarios y trazabilidad de operaciones en tiempo real.",
    cambios: [
      "Módulo de auditoría de usuarios en Administración (/dashboard/administracion/auditoria).",
      "Registro transaccional de quién realizó cada acción y fecha/hora exacta.",
      "Trazabilidad en Ventas, Cobros, Abonos, Créditos y Ventas Rápidas.",
      "Trazabilidad en Sala de Juegos (inicios, tiempos adicionales, cobros, traslados, consumos agregados y eliminados).",
      "Trazabilidad en Cierres de Caja, Ajustes de Inventario, Compras y Catálogo de Productos.",
      "Filtros avanzados por usuario, rango de fecha, categoría operativa y búsqueda en tiempo real.",
      "Modal de inspección de metadatos estructurados por cada evento auditado."
    ]
  },
  {
    version: "1.0.0",
    build: 266,
    fecha: "2026-10-04",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b266",
    descripcion: "Organización de productos por ubicación (estantes, refrigeradores, congeladores, mostrador).",
    cambios: [
      "Asignación de ubicación en catálogo con sugerencias rápidas (Estantes, Refris, Congeladores, Mostrador, Bodega) y texto libre",
      "Filtrado dinámico por ubicación en el catálogo de productos con insignias visuales",
      "Filtro por ubicación en control y revisión física de inventario para conteo sectorizado"
    ]
  },
  {
    version: "1.0.0",
    build: 265,
    fecha: "2026-10-01",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b265",
    descripcion: "Corrección de declaración en página de cierre de caja.",
    cambios: [
      "Eliminación de declaración duplicada de variable hayOperacionesPendientes",
      "Restablecimiento de la carga fluida y sin errores de compilación en el módulo de cierre de caja"
    ]
  },
  {
    version: "1.0.0",
    build: 264,
    fecha: "2026-10-01",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b264",
    descripcion: "Bloqueo de cierre de caja por estaciones de juego activas y cuentas pendientes.",
    cambios: [
      "Detección en tiempo real de estaciones de juego ocupadas (mesas de billar y consolas)",
      "Banner informativo de bloqueo con accesos directos al POS y a la Sala de Juegos",
      "Validación de seguridad atómica en el servicio de cierre de caja para evitar inconsistencias"
    ]
  },
  {
    version: "1.0.0",
    build: 263,
    fecha: "2026-10-01",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b263",
    descripcion: "Fijación permanente de tarjeta de deuda histórica sobre el pie del diálogo de cobro.",
    cambios: [
      "Extracción de la tarjeta de saldo a crédito fuera del scroll de productos",
      "Posicionamiento fijo sobre los botones de cobro para visibilidad garantizada en cuentas con muchos artículos",
      "Mantenimiento de interactividad con checkbox de inclusión de créditos y formato compacto"
    ]
  },
  {
    version: "1.0.0",
    build: 262,
    fecha: "2026-10-01",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b262",
    descripcion: "Abono general a cuenta y ventas a crédito en cascada.",
    cambios: [
      "Distribución atómica y en cascada de abonos entre cuenta abierta y ventas a crédito",
      "Habilitación del botón de abono para ventas a crédito y cuentas con deuda histórica",
      "Desglose informativo de cuenta actual, créditos acumulados y saldo total en el diálogo de abono"
    ]
  },
  {
    version: "1.0.0",
    build: 261,
    fecha: "2026-09-28",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b261",
    descripcion: "Corrección de posición de checkbox en acordeones y aprovechamiento total de espacio.",
    cambios: [
      "Fijación del checkbox a la cabecera del acordeón al expandir detalles",
      "Expansión al ancho total para tarjetas de artículos y detalles de ventas",
      "Eliminación de la línea divisoria del encabezado de contenedores principales"
    ]
  },
  {
    version: "1.0.0",
    build: 260,
    fecha: "2026-09-28",
    estado: "publicada_anterior",
    tipo: "Compilación",
    tagGit: "v1.0.0-b260",
    descripcion: "Ajuste de diseño y vista móvil en Cuadre Semanal.",
    cambios: [
      "Paleta unificada (#1e1e1e contenedor, #252526 tarjetas y #2e2e2e bordes) en Cuadre Semanal",
      "Reducción de títulos y eliminación de descripciones en contenedores para vista móvil",
      "Corrección de desbordamiento horizontal en compras pendientes y tarjetas de ingresos",
      "Formateo de fechas compacto y diseño responsivo para montos, badges y acordeones"
    ]
  },
  {
    version: "1.0.0",
    build: 259,
    fecha: "2026-09-28",
    estado: "archivada",
    tipo: "Compilación",
    tagGit: "v1.0.0-b259",
    descripcion: "Corrección de selector de sucursales en vista móvil y mejoras de navegación.",
    cambios: [
      "Selector de sucursales nativo (Collapsible) en pie del menú para vista móvil",
      "Solución al bloqueo de interacción/z-index del Sheet de navegación móvil",
      "Remoción de estilos en mayúsculas sostenidas en badges y menús"
    ]
  },
  {
    version: "1.0.0",
    build: 258,
    fecha: "2026-09-28",
    estado: "archivada",
    tipo: "Compilación",
    tagGit: "v1.0.0-b258",
    descripcion: "Versión publicada en Firebase App Hosting. Incluye optimizaciones de compras, paleta personalizada, reglas de capitalización y sección de historial.",
    cambios: [
      "Sección 'Acerca del Sistema e Historial de Versiones' en Configuraciones",
      "Optimización de espacios, radios de borde y estilo limpio en modal de compras",
      "Historial de compras filtrado estrictamente por proveedor seleccionado",
      "Paleta de colores para listado de compras (#1e1e1e, acordeones #252526 y bordes #2e2e2e)",
      "Regla de interfaz: prohíbe textos exclusivamente en mayúsculas sostenidas",
      "Ocultamiento de flechas/spinners de incremento en inputs numéricos de compras",
      "Barra de desplazamiento personalizada ultra fina y alineación en sidebar"
    ]
  },
  {
    version: "1.0.0-estable",
    build: 241,
    fecha: "2026-09-27",
    estado: "archivada",
    tipo: "Mayor",
    tagGit: "v1.0.0-estable",
    descripcion: "Versión anterior que estuvo publicada en Firebase App Hosting.",
    cambios: [
      "Despliegue inicial de Pool Control 1.0 en Firebase App Hosting",
      "Arquitectura multi-sucursal con aislamiento estricto de datos en Firestore",
      "Módulos de Punto de Venta (POS), Control de Mesas, Tragamonedas e Inventario",
      "Cierre de caja y monitoreo administrativo"
    ]
  },
  {
    version: "1.0.0-beta",
    build: 240,
    fecha: "2026-09-26",
    estado: "archivada",
    tipo: "Menor",
    descripcion: "Versión de pruebas previa al despliegue en Firebase App Hosting.",
    cambios: [
      "Pruebas de arquitectura y preparación de scripts de despliegue",
      "Ajustes de sincronización offline y servicios de inventario"
    ]
  }
];

export const appVersion = {
  version: releaseHistory[0].version,
  build: releaseHistory[0].build,
  date: releaseHistory[0].fecha,
  publicadaActual: releaseHistory[0],
  publicadaAnterior: releaseHistory[1],
  historial: releaseHistory
};
