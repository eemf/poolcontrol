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
    version: "1.0.0",
    build: 264,
    fecha: "2026-10-01",
    estado: "publicada_actual",
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
  version: "1.0.0",
  build: 264,
  date: "2026-10-01",
  publicadaActual: releaseHistory[0], // Build 264
  publicadaAnterior: releaseHistory[1], // Build 263
  historial: releaseHistory
};
