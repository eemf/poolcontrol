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
    build: 259,
    fecha: "2026-09-28",
    estado: "publicada_actual",
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
    estado: "publicada_anterior",
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
  build: 259,
  date: "2026-09-28",
  publicadaActual: releaseHistory[0], // Build 259
  publicadaAnterior: releaseHistory[1], // Build 258
  historial: releaseHistory
};
