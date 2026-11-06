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
    build: 6,
    fecha: "2026-11-06",
    estado: "publicada_actual",
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
      "Diseño corporativo de `TooltipContent` (`src/components/ui/tooltip.tsx`): Formato píldora (`rounded-full`), fondo `#1d283a`, borde `#324157` y renderizado en portal para evitar recortes.",
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
      "Input de búsqueda visible por defecto en `PillTabs` (`src/components/comunes/pill-tabs.tsx`): El campo de búsqueda se muestra permanentemente a la izquierda y las pestañas a la derecha dentro de la misma píldora (`rounded-full bg-[#283244] border-[#324157]`)."
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
      "Cabecera POS (`pos-header.tsx`): Botones de navegación rápida (`Sala de Juegos`, `Tragamonedas`, `Historial`) con diseño píldora oficial (`rounded-full bg-[#283244] border-[#324157]`), iconos semánticos coloreados y centrado en vista móvil.",
      "Formulario y Carrito POS (`pos-form.tsx`, `pos-cart.tsx`): Eliminación de contenedores secundarios redundantes en la sección de carga de productos, adopción de `<SurfaceCard>` con paleta `#1d283a` / `#283244`, controles base por defecto, lista de carrito con scroll acotado (`max-h-[380px]`) y botón circular de eliminación.",
      "Cuentas Activas (`pos-accounts.tsx`): Reemplazo del selector improvisado dentro del buscador por `<PillTabs>` oficial (`Pendientes` y `Crédito` con `<CountBadge>`), buscador píldora independiente, eliminación de fondos oscuros arbitrarios (`#17202e`) y tarjetas de acordeón en `#283244` con botones `rounded-full`.",
      "Modales de POS (`pos-dialogs.tsx`): Rediseño completo de 'Cobro de Cuenta', 'Consumo Interno' y confirmaciones con el formato de `BillingDialog` (`#1d283a`, `Total a Liquidar` directo sobre el lienzo, sub-modales internos para Confirmar Pago con Tarjeta y Registrar Abono evitando conflictos de doble modal Radix)."
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
      "Estandarización visual del modal '¡Tiempo Culminado!' con paleta oficial (`#1d283a`, borde `#324157`), icono circular translúcido ámbar y botón en píldora."
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
      "Rediseño del bloque financiero en `TableCard`: Se reemplazaron los 3 sub-contenedores separados (Total a Pagar, Alquiler, Consumo) y la línea divisoria flotante por un único bloque unificado (`#283244`) con divisiones limpias.",
      "Integración del acordeón 'Ver Consumos' dentro del mismo bloque unificado con separadores `divide-y divide-[#324157]`, eliminando contenedores secundarios adicionales al desplegar."
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
      "Eliminación del contenedor secundario en 'Total Consolidado' dentro de `IncomeSummary`, ubicándolo directamente sobre el lienzo del panel principal (`#1d283a`).",
      "Eliminación del sub-contenedor anidado (`subcard`) y subtítulo redundante dentro de cada tarjeta de mesa, integrando las sesiones directamente con separadores `divide-y divide-[#324157]`."
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
      "Estilos oficiales integrados en `Select` (`src/components/ui/select.tsx`): `SelectTrigger`, `SelectContent` y `SelectItem` incluyen de fábrica la paleta `#283244`/`#1d283a`, bordes `#324157` y estados `hover:bg-sky-500/20 data-[highlighted]:bg-sky-500/20` sin requerir clases manuales en cada página.",
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
      "Borde y radio oficial (`rounded-xl sm:rounded-lg border-[#324157]`): Homologación del radio de esquina con `DialogContent` en los modales de confirmación de eliminación.",
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
      "Diseño de filas idéntico a POSCart: En `ConsumptionDialog`, los ítems del carrito muestran icono de estado (`BadgeHelp` en rojo o `ReceiptText` en índigo para manuales), nombre en `text-sm font-semibold`, sublínea con `{cantidad} × Q{precio}` y hora exacta (`Clock` + `hh:mm:ss a`), monto en blanco, botón de eliminar (`Trash2`) y divisores horizontales (`divide-y divide-[#324157]`), ordenando los productos recién agregados al inicio."
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
      "Unificación cromática de contenedores principales: `TableCard` adopta `SurfaceCard variant=\"panel\"` (`#1d283a`) igualando el tono del contenedor de `IncomeSummary`, con bloques internos en `#283244`.",
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
      "Adopción estricta del Design System en Sala de Juegos: Uso de `<SurfaceCard>`, `<PillTabs>`, `<CountBadge>` y paleta oficial (#1d283a, #283244, #324157) en TableCard, IncomeSummary y todos los modales operativos.",
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
      "Paleta cromática inspirada en Antigravity IDE: Lienzo base ultra oscuro descansado (`#12151b`), paneles estructurados (`#1d283a`), superficies elevadas (`#283244`), bordes de alta definición de 1px (`#324157`), azul primario de acción (`#0284c7`), y acentos de sintaxis semántica (esmeralda, ámbar, rosa, violeta).",
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
      "Cumplimiento estricto del Design System: Adopción del encabezado `<PageHeader>`, botones píldora `rounded-full`, paleta corporativa (#1d283a, #283244, #324157) y cero textos en mayúsculas sostenidas."
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
      "Cumplimiento del Design System: Adopción del encabezado oficial `<PageHeader>`, buscador ergonómico con `rounded-full` en `#283244`, eliminación total de textos en mayúsculas sostenidas (`uppercase`), y aplicación de la paleta corporativa oficial (#1d283a, #283244, #324157).",
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
      "Cumplimiento del Design System: Adopción del encabezado oficial `<PageHeader>`, contenedores `<SurfaceCard>`, botones `rounded-full`, eliminación de mayúsculas sostenidas y aplicación de la paleta corporativa oficial (#1d283a, #283244, #324157)."
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
      "Cumplimiento del Design System: Adopción del encabezado oficial `<PageHeader>`, contenedores `<SurfaceCard>`, botones `rounded-full`, eliminación de mayúsculas sostenidas y aplicación de la paleta corporativa oficial (#1d283a, #283244, #324157)."
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
      "Cumplimiento del Design System: Adopción del encabezado oficial `<PageHeader>`, pestañas `<PillTabs>`, contenedores `<SurfaceCard>`, botones `rounded-full` y paleta corporativa oficial (#1d283a, #283244, #324157)."
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
      "Cumplimiento del Design System: Adopción del encabezado oficial `<PageHeader>`, contenedores `<SurfaceCard>`, botones `rounded-full` y paleta corporativa oficial (#1d283a, #283244, #324157)."
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
      "Cumplimiento del Design System: Adopción del encabezado oficial `<PageHeader>`, contenedores `<SurfaceCard>`, botones `rounded-full` y paleta corporativa oficial (#1d283a, #283244, #324157).",
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
      "Cumplimiento del Design System: Adopción del encabezado oficial `<PageHeader>`, contenedores `<SurfaceCard>`, botones `rounded-full` y paleta corporativa oficial (#1d283a, #283244, #324157).",
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
      "Cumplimiento del Design System: Adopción del encabezado oficial `<PageHeader>`, eliminación total de mayúsculas sostenidas en badges y métricas, y aplicación de la paleta oficial (#1d283a, #283244, #324157).",
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
      "Design System oficial aplicado: Integración de `<PageHeader>`, accesos rápidos `rounded-full` a Sala de Juegos, Tragamonedas y POS, eliminación de mayúsculas sostenidas en badges y uso de paleta corporativa (#1d283a, #283244, #324157)."
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
      "Cumplimiento estricto del Design System: Adopción de `<PageHeader>`, contenedores `<SurfaceCard>`, botones `rounded-full`, paleta corporativa oficial (#1d283a, #283244, #324157) y tipografía sin mayúsculas sostenidas.",
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
      "Cumplimiento estricto del Design System: Adopción de `<PageHeader>`, contenedores `<SurfaceCard>`, botones `rounded-full`, paleta oficial (#1d283a, #283244, #324157) y eliminación de textos en mayúsculas forzadas.",
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
      "Design System oficial aplicado: Integración de `<PageHeader>`, contenedores `<SurfaceCard>`, botones de acción `rounded-full`, paleta oficial (#1d283a, #283244, #324157) y eliminación de tablas desbordables.",
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
      "Design System oficial aplicado: Contenedores `<SurfaceCard>`, encabezado `<PageHeader>`, controles píldora `rounded-full` y paleta corporativa #1d283a, #283244 y #324157.",
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
      "Estandarización visual: Integración de `<PageHeader>`, `<PillTabs>` (Flujo de Gaveta, Flujo de Monedas, Kardex de Inventario, Balance General) y `<SurfaceCard>` respetando la paleta oficial #1d283a, #283244 y #324157."
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
      "Paleta oficial aplicada: Sustitución de fondos y bordes arbitrarios por `#1d283a`, `#283244` y `#324157` junto a botones píldora redondeados."
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
      "Tokens de Color en Tailwind: Adición de `app.panel` (#1d283a), `app.surface` (#283244) y `app.border` (#324157) en `tailwind.config.ts`.",
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
    descripcion: "Rediseño integral de Traslados: tarjetas responsivas, paleta oficial (#1d283a, #283244, #324157), pestañas estándar y botones píldora.",
    cambios: [
      "Simplificación del encabezado: Título directo 'Traslados' sin descripción adicional.",
      "Eliminación de tarjetas de métricas: Maximización del área de trabajo eliminando contadores redundantes.",
      "Pestañas estándar tipo píldora (rounded-full): Nombres simplificados a 'Pendientes', 'Enviados' e 'Historial' con badges de conteo integrados y barra #283244.",
      "Paleta oficial de contenedores: Contenedor principal en #1d283a, bordes en #324157, buscador y tarjetas en #283244.",
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
      "Aplicación de colores del POS de venta (#1d283a en contenedor principal, #283244 en acordeones y tarjetas, #324157 en líneas y bordes).",
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
      "Paleta unificada (#1d283a contenedor, #283244 tarjetas y #324157 bordes) en Cuadre Semanal",
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
      "Paleta de colores para listado de compras (#1d283a, acordeones #283244 y bordes #324157)",
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
  version: "2.0.0",
  build: 6,
  date: "2026-11-06",
  publicadaActual: releaseHistory[0], // Build 6 (v2.0.0)
  publicadaAnterior: releaseHistory[1], // Build 5 (v2.0.0)
  historial: releaseHistory
};
