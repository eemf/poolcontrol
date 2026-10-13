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
    build: 307,
    fecha: "2026-10-13",
    estado: "publicada_actual",
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
  version: "1.0.0",
  build: 307,
  date: "2026-10-13",
  publicadaActual: releaseHistory[0], // Build 307
  publicadaAnterior: releaseHistory[1], // Build 306
  historial: releaseHistory
};
