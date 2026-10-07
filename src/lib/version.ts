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
    build: 282,
    fecha: "2026-10-07",
    estado: "publicada_actual",
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
  version: "1.0.0",
  build: 282,
  date: "2026-10-07",
  publicadaActual: releaseHistory[0], // Build 282
  publicadaAnterior: releaseHistory[1], // Build 281
  historial: releaseHistory
};
