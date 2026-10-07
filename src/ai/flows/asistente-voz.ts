'use server';

/**
 * @fileOverview Flow híbrido de Genkit con motor local NLP de respaldo total para comandos de voz y consultas en Pool Control.
 * Cubre exhaustivamente: Control de Mesas, Punto de Venta (POS) y Tragamonedas.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AsistenteVozInputSchema = z.object({
  transcripcion: z.string().describe('Texto transcrito de lo que dijo el operador por voz.'),
  mesasContexto: z.array(z.object({
    id: z.string(),
    numeroMesa: z.number(),
    tipoDeMesa: z.string().optional(),
    estado: z.string(), // 'disponible' | 'ocupado'
    modoJuego: z.string().nullable().optional(),
    clienteNombre: z.string().nullable().optional(),
    consumosCount: z.number().optional(),
  })).optional().describe('Estado actual de las mesas en la sucursal.'),
  productosNombres: z.array(z.string()).optional().describe('Lista de nombres de productos y consumos disponibles en la sucursal.'),
  clientesNombres: z.array(z.string()).optional().describe('Nombres de clientes registrados o con cuenta en la sucursal.'),
  maquinasContexto: z.array(z.object({
    id: z.string(),
    nombre: z.string(),
    totalBase: z.number().optional(),
    totalExtraccion: z.number().optional(),
    totalDeuda: z.number().optional(),
  })).optional().describe('Estado de máquinas tragamonedas en la sucursal.'),
});

export type AsistenteVozInput = z.infer<typeof AsistenteVozInputSchema>;

const AsistenteVozOutputSchema = z.object({
  tipoAccion: z.enum([
    'INICIAR_MESA',
    'AJUSTAR_TIEMPO_MESA',
    'TRASLADAR_MESA',
    'COBRAR_MESA',
    'PASAR_MESA_A_CUENTA',
    'AGREGAR_CONSUMO_MESA',
    'ELIMINAR_CONSUMO_MESA',
    'VENTA_RAPIDA',
    'AGREGAR_CONSUMO_CUENTA',
    'COBRAR_CUENTA_CLIENTE',
    'CONSULTAR_CUENTA_CLIENTE',
    'TRAGAMONEDAS_BASE',
    'TRAGAMONEDAS_EXTRACCION',
    'TRAGAMONEDAS_PREMIO',
    'CONSULTAR_ESTADO_MESA',
    'CONSULTAR_TRAGAMONEDAS',
    'CONSULTA_GENERAL',
    'NO_ENTENDIDO'
  ]).describe('El tipo de acción a ejecutar.'),
  numeroMesa: z.number().optional().describe('Número de mesa involucrada (si aplica).'),
  numeroMesaDestino: z.number().optional().describe('Número de mesa destino para traslados (si aplica).'),
  modoJuego: z.enum(['libre', 'definido']).optional().describe('Modo de juego: libre o definido (si aplica).'),
  minutosDefinidos: z.number().optional().describe('Minutos para tiempo definido, ej: 60 para una hora (si aplica).'),
  nombreCliente: z.string().optional().describe('Nombre del cliente para la cuenta (si aplica).'),
  nombreProducto: z.string().optional().describe('Nombre del producto identificado más cercano en el catálogo (si aplica).'),
  cantidad: z.number().optional().describe('Cantidad de unidades del producto (por defecto 1).'),
  metodoPago: z.enum(['Efectivo', 'Tarjeta']).optional().describe('Método de pago para cobros.'),
  maquinaNombre: z.string().optional().describe('Nombre o identificador de máquina tragamonedas (si aplica).'),
  monto: z.number().optional().describe('Monto monetario para operaciones de caja o tragamonedas (si aplica).'),
  mensajeVoz: z.string().describe('Frase concisa, profesional y natural en español que el sintetizador de voz leerá al operador.'),
  explicacion: z.string().describe('Detalle descriptivo para mostrar en la interfaz gráfica.'),
});

export type AsistenteVozOutput = z.infer<typeof AsistenteVozOutputSchema>;

// Mapa de números en palabras
const PALABRAS_A_NUMERO: Record<string, number> = {
  un: 1, una: 1, uno: 1,
  dos: 2, tres: 3, cuatro: 4, cinco: 5,
  seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10
};

/**
 * Motor local inteligente de procesamiento de comandos de voz (cero latencia, tolerancia total a fallas de API).
 */
function interpretarComandoLocal(input: AsistenteVozInput, apiErrorMotivo?: string): AsistenteVozOutput {
  const raw = input.transcripcion || '';
  const texto = raw.toLowerCase().trim();

  // Helper para buscar producto en catálogo
  const buscarProductoCatalogo = (frase: string): string | undefined => {
    if (!input.productosNombres || !input.productosNombres.length) return undefined;
    for (const prod of input.productosNombres) {
      const pNom = prod.toLowerCase();
      if (frase.includes(pNom)) return prod;
    }
    const palabras = frase.split(/\s+/).filter(w => w.length >= 3 && !['mesa', 'cuenta', 'para', 'agrega', 'inicia', 'tiempo', 'maquina', 'vende'].includes(w));
    for (const prod of input.productosNombres) {
      const pNom = prod.toLowerCase();
      for (const w of palabras) {
        if (pNom.includes(w)) return prod;
      }
    }
    return undefined;
  };

  // Helper para buscar máquina en tragamonedas
  const buscarMaquina = (frase: string): string | undefined => {
    if (!input.maquinasContexto || !input.maquinasContexto.length) return undefined;
    const matchNum = frase.match(/m[áa]quina\s*(?:n[úu]mero|no\.?|#)?\s*(\d+|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)/i);
    if (matchNum) {
      const numStr = matchNum[1].toLowerCase();
      const num = !isNaN(parseInt(numStr, 10)) ? parseInt(numStr, 10) : PALABRAS_A_NUMERO[numStr];
      const encontrada = input.maquinasContexto.find(m => m.nombre.toLowerCase().includes(String(num)));
      if (encontrada) return encontrada.nombre;
    }
    for (const m of input.maquinasContexto) {
      if (frase.includes(m.nombre.toLowerCase())) return m.nombre;
    }
    return input.maquinasContexto[0]?.nombre;
  };

  // 1. Extraer número de mesa
  let numeroMesa: number | undefined;
  const matchMesa = texto.match(/mesa\s*(?:n[úu]mero|no\.?|#)?\s*(\d+|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)/i);
  if (matchMesa) {
    const val = matchMesa[1].toLowerCase();
    numeroMesa = !isNaN(parseInt(val, 10)) ? parseInt(val, 10) : PALABRAS_A_NUMERO[val];
  }

  // 2. Extraer cantidad
  let cantidad = 1;
  const matchCant = texto.match(/\b(\d+|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\b/i);
  if (matchCant) {
    const val = matchCant[1].toLowerCase();
    const parsed = !isNaN(parseInt(val, 10)) ? parseInt(val, 10) : PALABRAS_A_NUMERO[val];
    if (parsed && parsed > 0 && parsed !== numeroMesa) {
      cantidad = parsed;
    }
  }

  // 3. Extraer monto monetario (ej. Q50, 50 quetzales, base de 100)
  let monto: number | undefined;
  const matchMonto = texto.match(/(?:q|quetzales?|\$)?\s*(\d+(?:\.\d+)?)\s*(?:quetzales?|de base|de premio|premio)?/i) || texto.match(/(?:de|monto|premio|base|extrae|sacar)\s+(\d+(?:\.\d+)?)/i);
  if (matchMonto) {
    const parsedMonto = parseFloat(matchMonto[1]);
    if (!isNaN(parsedMonto) && parsedMonto > 0) {
      monto = parsedMonto;
    }
  }

  // 4. Método de pago
  const metodoPago: 'Efectivo' | 'Tarjeta' = /tarjeta|pos|tarj/i.test(texto) ? 'Tarjeta' : 'Efectivo';

  // ==========================================
  // SECCIÓN 1: OPERACIONES DE TRAGAMONEDAS
  // ==========================================
  if (/tragamonedas|m[áa]quina/i.test(texto)) {
    // A) Base en máquina
    if (/(base|poner base|recarga|meter)/i.test(texto)) {
      const maq = buscarMaquina(texto) || 'Máquina 1';
      const mBase = monto || 50;
      return {
        tipoAccion: 'TRAGAMONEDAS_BASE',
        maquinaNombre: maq,
        monto: mBase,
        mensajeVoz: `Listo, registrando Q${mBase} de base en la ${maq}.`,
        explicacion: `Base de Q${mBase} agregada a ${maq} vía comando local.`,
      };
    }

    // B) Extracción de máquina
    if (/(extrae|extraer|sacar|retiro|retirar|extracci[óo]n)/i.test(texto)) {
      const maq = buscarMaquina(texto) || 'Máquina 1';
      const mExt = monto || 50;
      return {
        tipoAccion: 'TRAGAMONEDAS_EXTRACCION',
        maquinaNombre: maq,
        monto: mExt,
        mensajeVoz: `Listo, registrando extracción de Q${mExt} en la ${maq}.`,
        explicacion: `Extracción de Q${mExt} de ${maq} vía comando local.`,
      };
    }

    // C) Pagar premio de máquina
    if (/(premio|pagar premio|paga premio)/i.test(texto)) {
      const maq = buscarMaquina(texto) || 'Máquina 1';
      const mPremio = monto || 20;
      return {
        tipoAccion: 'TRAGAMONEDAS_PREMIO',
        maquinaNombre: maq,
        monto: mPremio,
        mensajeVoz: `Listo, registrando pago de premio por Q${mPremio} en la ${maq}.`,
        explicacion: `Premio de Q${mPremio} pagado en ${maq} vía comando local.`,
      };
    }

    // D) Consultar máquinas
    if (/(c[óo]mo van|estado|cu[áa]nto tienen|totales)/i.test(texto)) {
      return {
        tipoAccion: 'CONSULTAR_TRAGAMONEDAS',
        mensajeVoz: 'Consultando el estado general de las máquinas tragamonedas.',
        explicacion: 'Consulta de resumen de máquinas tragamonedas.',
      };
    }
  }

  // ==========================================
  // SECCIÓN 2: CONTROL DE MESAS DE JUEGO
  // ==========================================

  // A) Trasladar mesa (ej. "traslada mesa 1 a mesa 3", "pasa mesa 2 a la 4")
  const matchTraslado = texto.match(/(?:traslada|pasa|mueve)\s+(?:la\s+)?mesa\s*(\d+)\s+a\s+(?:la\s+)?mesa\s*(\d+)/i);
  if (matchTraslado) {
    const oMesa = parseInt(matchTraslado[1], 10);
    const dMesa = parseInt(matchTraslado[2], 10);
    return {
      tipoAccion: 'TRASLADAR_MESA',
      numeroMesa: oMesa,
      numeroMesaDestino: dMesa,
      mensajeVoz: `Listo, trasladando sesión de la Mesa ${oMesa} a la Mesa ${dMesa}.`,
      explicacion: `Traslado de Mesa #${oMesa} a Mesa #${dMesa} vía comando local.`,
    };
  }

  // B) Ajustar / Añadir tiempo a mesa (ej. "agrega 30 minutos a mesa 1", "suma 1 hora a la mesa 2")
  if (numeroMesa && /(agrega|a[ñn]ade|suma|ajusta)\s+(\d+|\w+)\s+(minutos?|horas?)\s+(?:a|en)\s+(?:la\s+)?mesa/i.test(texto)) {
    let minutosParaAnadir = 30;
    if (/hora/i.test(texto)) {
      minutosParaAnadir = /dos|2/i.test(texto) ? 120 : 60;
    } else {
      const matchM = texto.match(/(\d+)\s*minutos?/i);
      if (matchM) minutosParaAnadir = parseInt(matchM[1], 10);
    }
    return {
      tipoAccion: 'AJUSTAR_TIEMPO_MESA',
      numeroMesa,
      minutosDefinidos: minutosParaAnadir,
      mensajeVoz: `Listo, sumando ${minutosParaAnadir} minutos a la Mesa ${numeroMesa}.`,
      explicacion: `Ajuste de +${minutosParaAnadir} minutos a Mesa #${numeroMesa} vía comando local.`,
    };
  }

  // C) Pasar mesa a cuenta de cliente (ej. "pasa la mesa 1 a la cuenta de Juan", "cargar mesa 2 a Carlos")
  const matchMesaACuenta = texto.match(/(?:pasa|pasar|cargar?|transfiere)\s+(?:la\s+)?mesa\s*(\d+)\s+(?:a|en)\s+(?:la\s+)?(?:cuenta\s+de\s+)?([a-zA-ZáéíóúñÑ]+)/i);
  if (matchMesaACuenta) {
    const numM = parseInt(matchMesaACuenta[1], 10);
    const nomC = matchMesaACuenta[2];
    return {
      tipoAccion: 'PASAR_MESA_A_CUENTA',
      numeroMesa: numM,
      nombreCliente: nomC.charAt(0).toUpperCase() + nomC.slice(1),
      mensajeVoz: `Listo, pasando la cuenta de la Mesa ${numM} a ${nomC}.`,
      explicacion: `Cuenta de Mesa #${numM} transferida a ${nomC} vía comando local.`,
    };
  }

  // D) Cobrar / Cerrar mesa (ej. "cobra mesa 1", "cerrar mesa 2 en efectivo", "cobra la mesa 3 con tarjeta")
  if (numeroMesa && /(cobra|cobrar|cierra|cerrar|liquida|liquidar|cuenta de la mesa)/i.test(texto)) {
    return {
      tipoAccion: 'COBRAR_MESA',
      numeroMesa,
      metodoPago,
      mensajeVoz: `Listo, cerrando y cobrando la Mesa ${numeroMesa} en ${metodoPago}.`,
      explicacion: `Cobro de Mesa #${numeroMesa} en ${metodoPago} vía comando local.`,
    };
  }

  // E) Eliminar consumo de mesa (ej. "elimina una coca cola de la mesa 1", "quita una cerveza de mesa 2")
  if (numeroMesa && /(elimina|quitar?|borra|remover?)\s+(?:un|una|\d+)?\s*(.*?)\s+(?:de|en)\s+(?:la\s+)?mesa/i.test(texto)) {
    const prod = buscarProductoCatalogo(texto) || 'Consumo';
    return {
      tipoAccion: 'ELIMINAR_CONSUMO_MESA',
      numeroMesa,
      nombreProducto: prod,
      cantidad,
      mensajeVoz: `Listo, eliminando ${cantidad} ${prod} de la Mesa ${numeroMesa}.`,
      explicacion: `Consumo ${cantidad}x ${prod} devuelto a inventario desde Mesa #${numeroMesa}.`,
    };
  }

  // F) Consultar estado de mesa o mesas libres
  if (numeroMesa && /(c[óo]mo va|cu[áa]nto lleva|tiempo de|estado de|est[áa] libre)/i.test(texto)) {
    const mesaEncontrada = input.mesasContexto?.find(m => m.numeroMesa === numeroMesa);
    const msj = mesaEncontrada
      ? (mesaEncontrada.estado === 'ocupado' ? `La Mesa ${numeroMesa} está ocupada (${mesaEncontrada.modoJuego || 'Libre'}).` : `La Mesa ${numeroMesa} está libre.`)
      : `Consultando estado de Mesa ${numeroMesa}.`;
    return {
      tipoAccion: 'CONSULTAR_ESTADO_MESA',
      numeroMesa,
      mensajeVoz: msj,
      explicacion: `Consulta local: ${msj}`,
    };
  }
  if (/(qu[ée]|cuales)\s+mesas\s+est[áa]n\s+(libres|disponibles)/i.test(texto)) {
    const libres = input.mesasContexto?.filter(m => m.estado === 'disponible').map(m => m.numeroMesa) || [];
    const msj = libres.length ? `Las mesas libres son: ${libres.join(', ')}.` : 'No hay mesas libres en este momento.';
    return {
      tipoAccion: 'CONSULTAR_ESTADO_MESA',
      mensajeVoz: msj,
      explicacion: msj,
    };
  }

  // G) Iniciar mesa (libre o definido)
  if (numeroMesa && /(inicia|iniciar|abre|abrir|pon|poner|comienza|arranca)/i.test(texto) && !/(agrega|c[áa]rgale|carga|ap[úu]ntale|apunta)/i.test(texto)) {
    let modoJuego: 'libre' | 'definido' = 'libre';
    let minutosDefinidos = 60;

    if (/(hora|minuto|min)/i.test(texto)) {
      modoJuego = 'definido';
      if (/media hora|30 min/i.test(texto)) minutosDefinidos = 30;
      else if (/dos horas|2 horas/i.test(texto)) minutosDefinidos = 120;
      else if (/tres horas|3 horas/i.test(texto)) minutosDefinidos = 180;
      else {
        const matchMin = texto.match(/(\d+)\s*(?:minutos|min)/i);
        if (matchMin) minutosDefinidos = parseInt(matchMin[1], 10);
      }
    }

    const descModo = modoJuego === 'libre' ? 'tiempo libre' : `${minutosDefinidos} minutos`;
    return {
      tipoAccion: 'INICIAR_MESA',
      numeroMesa,
      modoJuego,
      minutosDefinidos: modoJuego === 'definido' ? minutosDefinidos : undefined,
      mensajeVoz: `Listo, iniciando ${descModo} en la Mesa ${numeroMesa}.`,
      explicacion: `Mesa #${numeroMesa} iniciada en modo ${modoJuego === 'libre' ? 'Libre' : `Definido (${minutosDefinidos} min)`} vía motor local.`,
    };
  }

  // H) Agregar consumo a mesa
  if (numeroMesa && /(agrega|c[áa]rgale|carga|ap[úu]ntale|apunta|ponle|pon)/i.test(texto)) {
    const producto = buscarProductoCatalogo(texto) || 'Coca Cola';
    return {
      tipoAccion: 'AGREGAR_CONSUMO_MESA',
      numeroMesa,
      nombreProducto: producto,
      cantidad,
      mensajeVoz: `Listo, agregué ${cantidad} ${producto} a la Mesa ${numeroMesa}.`,
      explicacion: `Agregado ${cantidad}x ${producto} a Mesa #${numeroMesa} (Motor local).`,
    };
  }

  // ==========================================
  // SECCIÓN 3: PUNTO DE VENTA (POS) Y CUENTAS
  // ==========================================

  // A) Venta rápida (ej. "vende una coca cola", "vender 2 cervezas corona", "venta rápida de nachos")
  if (/(vende|vender|venta r[áa]pida|despacha)/i.test(texto) && !texto.includes('mesa') && !texto.includes('cuenta')) {
    const prod = buscarProductoCatalogo(texto) || 'Coca Cola';
    return {
      tipoAccion: 'VENTA_RAPIDA',
      nombreProducto: prod,
      cantidad,
      metodoPago: 'Efectivo',
      mensajeVoz: `Listo, procesando venta rápida de ${cantidad} ${prod} en efectivo.`,
      explicacion: `Venta rápida POS: ${cantidad}x ${prod} en efectivo.`,
    };
  }

  // B) Cobrar cuenta de cliente (ej. "cobra la cuenta de Juan", "saldar cuenta de Carlos en efectivo")
  const matchCobrarCuenta = texto.match(/(?:cobra|cobrar|saldar|pagar)\s+(?:la\s+)?cuenta\s+de\s+([a-zA-ZáéíóúñÑ]+)/i);
  if (matchCobrarCuenta) {
    const nomC = matchCobrarCuenta[1];
    return {
      tipoAccion: 'COBRAR_CUENTA_CLIENTE',
      nombreCliente: nomC.charAt(0).toUpperCase() + nomC.slice(1),
      metodoPago,
      mensajeVoz: `Listo, cobrando la cuenta de ${nomC} en ${metodoPago}.`,
      explicacion: `Cobro de cuenta de ${nomC} en ${metodoPago}.`,
    };
  }

  // C) Consultar saldo o estado de cuenta de cliente
  const matchSaldoCuenta = texto.match(/(?:cu[áa]nto debe|saldo de|estado de la cuenta de)\s+([a-zA-ZáéíóúñÑ]+)/i);
  if (matchSaldoCuenta) {
    const nomC = matchSaldoCuenta[1];
    return {
      tipoAccion: 'CONSULTAR_CUENTA_CLIENTE',
      nombreCliente: nomC.charAt(0).toUpperCase() + nomC.slice(1),
      mensajeVoz: `Consultando la cuenta de ${nomC}.`,
      explicacion: `Consulta de cuenta para ${nomC}.`,
    };
  }

  // D) Agregar consumo a cuenta de cliente (ej. "agrega un casino a la cuenta de Juan", "cárgale 2 gatorades a Pedro")
  const matchCuenta = texto.match(/(?:cuenta|nombre)\s+de\s+([a-zA-ZáéíóúñÑ]+)/i) || texto.match(/(?:c[áa]rgale|carga|ap[úu]ntale|apunta|ponle)\s+a\s+([a-zA-ZáéíóúñÑ]+)/i);
  if (matchCuenta && !texto.includes('mesa')) {
    const nombreCliente = matchCuenta[1];
    const producto = buscarProductoCatalogo(texto) || 'Casino';
    return {
      tipoAccion: 'AGREGAR_CONSUMO_CUENTA',
      nombreCliente: nombreCliente.charAt(0).toUpperCase() + nombreCliente.slice(1),
      nombreProducto: producto,
      cantidad,
      mensajeVoz: `Listo, cargué ${cantidad} ${producto} a la cuenta de ${nombreCliente}.`,
      explicacion: `Cargado ${cantidad}x ${producto} a ${nombreCliente} (Motor local).`,
    };
  }

  // Fallback explicativo
  if (apiErrorMotivo) {
    return {
      tipoAccion: 'CONSULTA_GENERAL',
      mensajeVoz: 'Comando no reconocido. Puedes decir: Inicia mesa 1, Vende una Coca Cola, Cobra mesa 2, o Agrega 50 de base a la máquina 1.',
      explicacion: 'Nota: Tus créditos de Google AI Studio están agotados, pero todos los comandos de Mesas, POS y Tragamonedas funcionan al 100% con el motor local.',
    };
  }

  return {
    tipoAccion: 'NO_ENTENDIDO',
    mensajeVoz: 'No logré entender el comando. Prueba diciendo: Inicia mesa 1, Vende una Coca Cola, o Cobra mesa 2.',
    explicacion: 'Comando no identificado.',
  };
}

const prompt = ai.definePrompt({
  name: 'asistenteVozPrompt',
  model: 'googleai/gemini-3.8-flash',
  input: { schema: AsistenteVozInputSchema },
  output: { schema: AsistenteVozOutputSchema },
  prompt: `Eres el Asistente Inteligente de Pool Control, un sistema de gestión para clubes de billar, consolas, bar y tragamonedas.
Tu función es interpretar comandos de voz del operador y devolver la acción estructurada para ejecutarla en el sistema.

Texto recibido por voz: "{{{transcripcion}}}"

Contexto actual de la sucursal:
- Mesas:
{{#each mesasContexto}}
  * Mesa #{{numeroMesa}} (Tipo: {{tipoDeMesa}}, Estado: {{estado}}{{#if modoJuego}}, Modo: {{modoJuego}}{{/if}}{{#if clienteNombre}}, Cliente: {{clienteNombre}}{{/if}})
{{/each}}

- Catálogo de productos:
{{#each productosNombres}}
  * {{this}}
{{/each}}

- Clientes registrados:
{{#each clientesNombres}}
  * {{this}}
{{/each}}

- Máquinas tragamonedas:
{{#each maquinasContexto}}
  * {{nombre}} (Base: {{totalBase}}, Extracción: {{totalExtraccion}}, Deuda: {{totalDeuda}})
{{/each}}

Reglas de interpretación:
1. CONTROL DE MESAS:
   - INICIAR MESA: "inicia tiempo libre en mesa 1" (modoJuego: 'libre'), "inicia una hora en mesa 2" (modoJuego: 'definido', minutosDefinidos: 60).
   - AJUSTAR TIEMPO: "agrega 30 minutos a la mesa 1", "suma una hora a mesa 2" -> tipoAccion: AJUSTAR_TIEMPO_MESA.
   - TRASLADAR MESA: "traslada mesa 1 a mesa 3" -> tipoAccion: TRASLADAR_MESA, numeroMesa: 1, numeroMesaDestino: 3.
   - COBRAR MESA: "cobra la mesa 1 en efectivo/tarjeta", "cerrar mesa 2" -> tipoAccion: COBRAR_MESA.
   - PASAR A CUENTA: "pasa la mesa 1 a la cuenta de Juan" -> tipoAccion: PASAR_MESA_A_CUENTA.
   - AGREGAR CONSUMO: "agrega 2 cervezas a la mesa 1" -> tipoAccion: AGREGAR_CONSUMO_MESA.
   - ELIMINAR CONSUMO: "elimina una coca cola de la mesa 1" -> tipoAccion: ELIMINAR_CONSUMO_MESA.
   - CONSULTAS: "¿cómo va la mesa 1?", "¿qué mesas están libres?" -> tipoAccion: CONSULTAR_ESTADO_MESA.

2. PUNTO DE VENTA (POS) Y CUENTAS:
   - VENTA RÁPIDA: "vende una coca cola", "vender 2 cervezas corona" -> tipoAccion: VENTA_RAPIDA.
   - CARGAR A CUENTA: "agrega un casino a la cuenta de Juan" -> tipoAccion: AGREGAR_CONSUMO_CUENTA.
   - COBRAR CUENTA: "cobra la cuenta de Juan en efectivo/tarjeta" -> tipoAccion: COBRAR_CUENTA_CLIENTE.
   - CONSULTAR CUENTA: "¿cuánto debe Juan?", "saldo de Pedro" -> tipoAccion: CONSULTAR_CUENTA_CLIENTE.

3. TRAGAMONEDAS:
   - REGISTRAR BASE: "agrega 50 de base a la máquina 1" -> tipoAccion: TRAGAMONEDAS_BASE, monto: 50.
   - EXTRACCIÓN: "extrae 100 de la máquina 2" -> tipoAccion: TRAGAMONEDAS_EXTRACCION, monto: 100.
   - PREMIO: "paga premio de 30 en la máquina 1" -> tipoAccion: TRAGAMONEDAS_PREMIO, monto: 30.
   - CONSULTA: "estado de las máquinas" -> tipoAccion: CONSULTAR_TRAGAMONEDAS.

4. CONSULTA GENERAL: Dudas operativas del sistema.

El campo "mensajeVoz" debe ser natural, conciso y profesional en español.`,
});

const asistenteVozFlow = ai.defineFlow(
  {
    name: 'asistenteVozFlow',
    inputSchema: AsistenteVozInputSchema,
    outputSchema: AsistenteVozOutputSchema,
  },
  async input => {
    try {
      const { output } = await prompt(input);
      if (output && output.tipoAccion !== 'NO_ENTENDIDO') {
        return output;
      }
    } catch (err: any) {
      console.warn('Fallo en API de Gemini (activando motor local de respaldo):', err?.message);
      return interpretarComandoLocal(input, err?.message);
    }

    return interpretarComandoLocal(input);
  }
);

export async function procesarComandoVoz(input: AsistenteVozInput): Promise<AsistenteVozOutput> {
  return asistenteVozFlow(input);
}
