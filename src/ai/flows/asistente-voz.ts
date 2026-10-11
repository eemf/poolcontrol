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
    id: z.string().optional(),
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
    id: z.string().optional(),
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
    'DIVIDIR_CUENTA_MESA',
    'AGREGAR_CONSUMO_MESA',
    'ELIMINAR_CONSUMO_MESA',
    'VENTA_RAPIDA',
    'AGREGAR_CONSUMO_CUENTA',
    'COBRAR_CUENTA_CLIENTE',
    'ABONAR_CUENTA_CLIENTE',
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
  numeroPartes: z.number().optional().describe('Número de partes para dividir la cuenta de la mesa (si aplica).'),
  modoJuego: z.enum(['libre', 'definido']).optional().describe('Modo de juego: libre o definido (si aplica).'),
  minutosDefinidos: z.number().optional().describe('Minutos para tiempo definido, ej: 60 para una hora (si aplica).'),
  pagadoDeContado: z.boolean().optional().describe('Indica si el tiempo definido fue pagado de contado inmediatamente.'),
  nombreCliente: z.string().optional().describe('Nombre del cliente para la cuenta (si aplica).'),
  nombreProducto: z.string().optional().describe('Nombre del producto identificado más cercano en el catálogo (si aplica).'),
  cantidad: z.number().optional().describe('Cantidad de unidades del producto (por defecto 1).'),
  items: z.array(z.object({
    nombreProducto: z.string().describe('Nombre del producto identificado en el catálogo.'),
    cantidad: z.number().describe('Cantidad de unidades.'),
  })).optional().describe('Lista de uno o varios productos cuando el comando incluye múltiples consumos (ej: "una coca, un casino y un jugo").'),
  metodoPago: z.enum(['Efectivo', 'Tarjeta']).optional().describe('Método de pago para cobros.'),
  maquinaNombre: z.string().optional().describe('Nombre o identificador de máquina tragamonedas (si aplica).'),
  monto: z.number().optional().describe('Monto monetario para operaciones de caja o tragamonedas (si aplica).'),
  cobrarTodo: z.boolean().optional().describe('True si el operador pide cobrar la cuenta total/completa (incluyendo créditos). False o ausente si es solo la cuenta actual pendiente.'),
  motorUtilizado: z.enum(['api_groq', 'motor_local']).optional().describe('Indica si la orden fue interpretada por la API de IA (Groq) o por el Motor Local de respaldo.'),
  mensajeVoz: z.string().describe('Frase concisa, profesional y natural en español que el sintetizador de voz leerá al operador.'),
  explicacion: z.string().describe('Detalle descriptivo para mostrar en la interfaz gráfica.'),
});

export type AsistenteVozOutput = z.infer<typeof AsistenteVozOutputSchema>;

// Mapa expandido de números y palabras coloquiales en español
const PALABRAS_A_NUMERO: Record<string, number> = {
  un: 1, una: 1, uno: 1, primera: 1, primero: 1,
  dos: 2, segunda: 2, segundo: 2,
  tres: 3, tercera: 3, tercero: 3,
  cuatro: 4, cuarta: 4, cuarto: 4,
  cinco: 5, quinta: 5, quinto: 5,
  seis: 6, sexta: 6, sexto: 6,
  siete: 7, septima: 7, septimo: 7,
  ocho: 8, octava: 8, octavo: 8,
  nueve: 9, novena: 9, noveno: 9,
  diez: 10, decima: 10, decimo: 10,
  once: 11, doce: 12, trece: 13, catorce: 14, quince: 15,
  dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19,
  veinte: 20, veintiuno: 21, veintidos: 22, veintitres: 23, veinticuatro: 24,
  veinticinco: 25, veintiseis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29,
  treinta: 30
};

/**
 * Normaliza texto eliminando acentos, caracteres especiales y espacios redundantes
 */
function normalizarTexto(txt: string): string {
  return txt
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Motor local inteligente de procesamiento de comandos de voz.
 * Soporta lenguaje natural coloquial, variaciones de entonación, sinónimos y extracción flexible de entidades.
 */
export async function interpretarComandoLocal(input: AsistenteVozInput, apiErrorMotivo?: string): Promise<AsistenteVozOutput> {
  const raw = input.transcripcion || '';
  const textoNorm = normalizarTexto(raw);

  // Helper para extraer término del producto del comando de voz
  const extraerTerminoProducto = (frase: string): string => {
    let limpio = frase
      .replace(/^(?:agrega|agregame|cargale|cargame|carga|apuntale|apuntame|apunta|sirve|sirvele|lleva|llevale|ponle|pon|dame|vende|vender|despacha|factura|cobrate|venta\s+rapida\s+de)\s+/i, '')
      .trim();

    limpio = limpio
      .replace(/^(?:un|una|uno|el|la|los|las|\d+|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s+/i, '')
      .trim();

    limpio = limpio
      .replace(/\s+(?:a|en|para)\s+(?:la\s+)?(?:mesa\s*)?(?:\d+|[a-z]+)$/i, '')
      .replace(/\s+(?:de\s+la\s+)?(?:mesa\s*)?(?:\d+|[a-z]+)$/i, '')
      .replace(/\s+(?:a|en|para)\s+(?:la\s+)?(?:cuenta\s+de\s+|cuenta\s+|cliente\s+)?[a-z\s]+$/i, '')
      .trim();

    return limpio;
  };

  // Helper inteligente para buscar producto en catálogo (coincidencias flexibles, alias, prefijos y tolerancias)
  const buscarProductoCatalogo = (frase: string): { producto?: string; terminoBuscado: string } => {
    const termino = extraerTerminoProducto(frase);
    if (!input.productosNombres || !input.productosNombres.length) {
      return { producto: undefined, terminoBuscado: termino || 'solicitado' };
    }

    const tNorm = normalizarTexto(termino);

    if (tNorm) {
      // 1. Coincidencia exacta con el término
      const matchExacto = input.productosNombres.find(p => normalizarTexto(p) === tNorm);
      if (matchExacto) return { producto: matchExacto, terminoBuscado: termino };

      // 2. Coincidencia si el nombre del producto empieza con el término (ej. "coca" -> "Coca Cola")
      if (tNorm.length >= 3) {
        const matchEmpieza = input.productosNombres.find(p => normalizarTexto(p).startsWith(tNorm));
        if (matchEmpieza) return { producto: matchEmpieza, terminoBuscado: termino };
      }

      // 3. Coincidencia por palabra exacta (ej. "verde" en "Verde Lukis", "gallo" en "Cerveza Gallo")
      const matchPalabra = input.productosNombres.find(p => {
        const palabras = normalizarTexto(p).split(/\s+/);
        return palabras.includes(tNorm);
      });
      if (matchPalabra) return { producto: matchPalabra, terminoBuscado: termino };

      // 4. Tolerancia plural/singular (ej. "cocas" -> "coca", "verdes" -> "verde")
      if (tNorm.endsWith('s')) {
        const tSingular = tNorm.replace(/(?:es|s)$/, '');
        const matchSingular = input.productosNombres.find(p => {
          const palabras = normalizarTexto(p).split(/\s+/).map(w => w.endsWith('s') ? w.replace(/(?:es|s)$/, '') : w);
          return palabras.includes(tSingular) || palabras.some(w => w.startsWith(tSingular));
        });
        if (matchSingular) return { producto: matchSingular, terminoBuscado: termino };
      }

      // 5. Coincidencia de subcadena directa con el término
      if (tNorm.length >= 3) {
        const matchSub = input.productosNombres.find(p => {
          const pNorm = normalizarTexto(p);
          return pNorm.includes(tNorm) || tNorm.includes(pNorm);
        });
        if (matchSub) return { producto: matchSub, terminoBuscado: termino };
      }
    }

    // 6. Búsqueda por coincidencia directa de la frase completa
    for (const prod of input.productosNombres) {
      const pNorm = normalizarTexto(prod);
      if (frase.includes(pNorm)) return { producto: prod, terminoBuscado: prod };
    }

    const palabrasFrase = frase.split(/\s+/).filter(w =>
      w.length >= 3 &&
      !['mesa', 'cuenta', 'para', 'agrega', 'inicia', 'tiempo', 'maquina', 'vende', 'despacha', 'cobra', 'cliente', 'quitar', 'eliminar', 'finaliza', 'cierra', 'tres', 'uno', 'dos', 'cuatro', 'cinco'].includes(w)
    );

    for (const prod of input.productosNombres) {
      const pNorm = normalizarTexto(prod);
      for (const w of palabrasFrase) {
        if (pNorm.includes(w) || w.includes(pNorm)) return { producto: prod, terminoBuscado: w };
      }
    }

    return { producto: undefined, terminoBuscado: termino || 'solicitado' };
  };

  // Helper para buscar máquina tragamonedas
  const buscarMaquina = (frase: string): string | undefined => {
    if (!input.maquinasContexto || !input.maquinasContexto.length) return undefined;
    const matchNum = frase.match(/maquina\s*(?:numero|no|#)?\s*(\d+|[a-z]+)/);
    if (matchNum) {
      const numStr = matchNum[1];
      const num = !isNaN(parseInt(numStr, 10)) ? parseInt(numStr, 10) : PALABRAS_A_NUMERO[numStr];
      const encontrada = input.maquinasContexto.find(m => normalizarTexto(m.nombre).includes(String(num)));
      if (encontrada) return encontrada.nombre;
    }
    for (const m of input.maquinasContexto) {
      if (frase.includes(normalizarTexto(m.nombre))) return m.nombre;
    }
    return input.maquinasContexto[0]?.nombre;
  };

  // 1. Extractor inteligente de número de mesa (soporta "mesa 1", "la 1", "en la mesa 1", "finaliza la 1", etc.)
  const extraerNumeroMesa = (t: string): number | undefined => {
    // Patrón A: "mesa 1", "mesa no 1", "mesa #1", "mesa uno", "billar 1", "consola 1"
    const mA = t.match(/(?:mesa|billar|consola)\s*(?:numero|no|#)?\s*(\d+|[a-z]+)/);
    if (mA) {
      const val = mA[1];
      const n = !isNaN(parseInt(val, 10)) ? parseInt(val, 10) : PALABRAS_A_NUMERO[val];
      if (n !== undefined) return n;
    }
    // Patrón B: "la 1", "el 1", "a la 1", "en la 1", "de la 1", "la dos", "la mesa 1"
    const mB = t.match(/(?:(?:a|en|de)\s+)?(?:la|el)\s+(\d+|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|trece|catorce|quince|dieciseis|diecisiete|dieciocho|diecinueve|veinte)/);
    if (mB) {
      const val = mB[1];
      const n = !isNaN(parseInt(val, 10)) ? parseInt(val, 10) : PALABRAS_A_NUMERO[val];
      if (n !== undefined) return n;
    }
    // Patrón C: Acción directa y número (ej. "inicia 1", "finaliza 2", "cobra 3", "cierra 1")
    const mC = t.match(/(?:inicia|abre|arranca|empieza|comienza|finaliza|termina|cierra|cobra|liquida|deten|para)\s+(\d+|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)/);
    if (mC) {
      const val = mC[1];
      const n = !isNaN(parseInt(val, 10)) ? parseInt(val, 10) : PALABRAS_A_NUMERO[val];
      if (n !== undefined) return n;
    }
    return undefined;
  };

  const numeroMesa = extraerNumeroMesa(textoNorm);

  // 2. Extraer cantidad de unidades para ventas o consumos
  let cantidad = 1;
  const matchCant = textoNorm.match(/\b(\d+|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\b/);
  if (matchCant) {
    const val = matchCant[1];
    const parsed = !isNaN(parseInt(val, 10)) ? parseInt(val, 10) : PALABRAS_A_NUMERO[val];
    if (parsed && parsed > 0 && parsed !== numeroMesa) {
      cantidad = parsed;
    }
  }

  // 3. Extraer monto monetario (Q50, 50 quetzales, base de 100, premio de 40)
  let monto: number | undefined;
  const matchMonto = textoNorm.match(/(?:q|quetzales?|\$)?\s*(\d+(?:\.\d+)?)\s*(?:quetzales?|de base|de premio|premio|quetzal)?/)
    || textoNorm.match(/(?:de|monto|premio|base|extrae|sacar|recarga|saldo)\s+(\d+(?:\.\d+)?)/);
  if (matchMonto) {
    const parsedMonto = parseFloat(matchMonto[1]);
    if (!isNaN(parsedMonto) && parsedMonto > 0) {
      monto = parsedMonto;
    }
  }

  // 4. Método de pago (Efectivo por defecto en clubes de billar, Tarjeta si se menciona POS/Tarjeta)
  const metodoPago: 'Efectivo' | 'Tarjeta' = /tarjeta|pos|tarj|visa|credito|debito/.test(textoNorm) ? 'Tarjeta' : 'Efectivo';

  // ==========================================
  // SECCIÓN 1: OPERACIONES DE TRAGAMONEDAS
  // ==========================================
  if (/tragamonedas|maquina|slot/.test(textoNorm)) {
    // A) Base en máquina (ej. "base de 100 en maquina 1", "recarga 50 en maquina 2", "ponele base a maquina 1")
    if (/(base|poner base|recarga|recargar|meter|ponele base|pon base)/.test(textoNorm)) {
      const maq = buscarMaquina(textoNorm) || 'Máquina 1';
      const mBase = monto || 50;
      return {
        tipoAccion: 'TRAGAMONEDAS_BASE',
        maquinaNombre: maq,
        monto: mBase,
        mensajeVoz: `Listo, registrando Q${mBase} de base en la ${maq}.`,
        explicacion: `Base de Q${mBase} agregada a ${maq} vía comando local.`,
      };
    }

    // B) Extracción de máquina (ej. "sacar 80 de la maquina 1", "extraccion de 50 en maquina 2")
    if (/(extrae|extraer|sacar|sacale|retiro|retirar|extraccion|descuenta)/.test(textoNorm)) {
      const maq = buscarMaquina(textoNorm) || 'Máquina 1';
      const mExt = monto || 50;
      return {
        tipoAccion: 'TRAGAMONEDAS_EXTRACCION',
        maquinaNombre: maq,
        monto: mExt,
        mensajeVoz: `Listo, registrando extracción de Q${mExt} en la ${maq}.`,
        explicacion: `Extracción de Q${mExt} de ${maq} vía comando local.`,
      };
    }

    // C) Pagar premio de máquina (ej. "paga premio de 40 en maquina 1", "premio de 50 en maquina 2")
    if (/(premio|pagar premio|paga premio|premio de)/.test(textoNorm)) {
      const maq = buscarMaquina(textoNorm) || 'Máquina 1';
      const mPremio = monto || 20;
      return {
        tipoAccion: 'TRAGAMONEDAS_PREMIO',
        maquinaNombre: maq,
        monto: mPremio,
        mensajeVoz: `Listo, registrando pago de premio por Q${mPremio} en la ${maq}.`,
        explicacion: `Premio de Q${mPremio} pagado en ${maq} vía comando local.`,
      };
    }

    // D) Consultar máquinas (ej. "como van las maquinas", "estado de tragamonedas", "cuanto tienen las maquinas")
    if (/(como van|estado|cuanto tienen|totales|saldo)/.test(textoNorm)) {
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

  // A) Trasladar mesa (ej. "traslada mesa 1 a mesa 3", "pasa la 1 a la 2", "mueve mesa 2 a la 4", "cambia la 1 a la 3")
  const matchTraslado = textoNorm.match(/(?:traslad|pas|muev|cambi)\w*\s+(?:la\s+)?(?:mesa\s*)?(\d+|[a-z]+)\s+(?:a|hacia|por)\s+(?:la\s+)?(?:mesa\s*)?(\d+|[a-z]+)/);
  if (matchTraslado) {
    const oStr = matchTraslado[1];
    const dStr = matchTraslado[2];
    const oMesa = !isNaN(parseInt(oStr, 10)) ? parseInt(oStr, 10) : PALABRAS_A_NUMERO[oStr];
    const dMesa = !isNaN(parseInt(dStr, 10)) ? parseInt(dStr, 10) : PALABRAS_A_NUMERO[dStr];
    if (oMesa && dMesa && oMesa !== dMesa) {
      return {
        tipoAccion: 'TRASLADAR_MESA',
        numeroMesa: oMesa,
        numeroMesaDestino: dMesa,
        mensajeVoz: `Listo, trasladando sesión de la Mesa ${oMesa} a la Mesa ${dMesa}.`,
        explicacion: `Traslado de Mesa #${oMesa} a Mesa #${dMesa} vía comando local.`,
      };
    }
  }

  // B) Ajustar / Añadir tiempo a mesa (ej. "agrega 30 minutos a mesa 1", "sumale una hora a la mesa 2", "mas tiempo a la 1")
  if (numeroMesa && /(?:mas\s+tiempo|agrega\s+tiempo|suma\s+tiempo|anade\s+tiempo|ajusta\s+tiempo|dale\s+mas\s+tiempo|tiempo\s+mas|(?:agrega|anade|suma|ajusta|ponle|dale)\s+(?:\d+|[a-z]+)\s*(?:minutos?|min|horas?)|(?:\d+|[a-z]+)\s*(?:minutos?|min|horas?)\s+mas)/.test(textoNorm)) {
    let minutosParaAnadir = 30;
    if (/hora/i.test(textoNorm)) {
      minutosParaAnadir = /dos|2/i.test(textoNorm) ? 120 : 60;
    } else {
      const matchM = textoNorm.match(/(\d+)\s*(?:minutos?|min)/i);
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

  // C) Pasar mesa a cuenta de cliente (ej. "finaliza la mesa 1 y pasa la cuenta a Juan", "finaliza la 1 y cargala a Juan", "pasa el total de la mesa 1 a la cuenta de Carlos", "pasa mesa 1 a Juan")
  if (numeroMesa && /(?:pas|carg|transfier)\w*/.test(textoNorm) && /(?:cuenta|cliente|saldo|a\s+[a-z]+|en\s+[a-z]+)/.test(textoNorm)) {
    const match = textoNorm.match(/(?:pas|carg|transfier)\w*\s+(?:la\s+cuenta\s+de\s+|el\s+total\s+de\s+|la\s+cuenta|el\s+total|eso|la|lo)?\s*(?:(?:de\s+)?(?:la\s+)?(?:mesa|billar|consola)?\s*(?:\d+|[a-z]+))?\s*(?:y\s+)?(?:pas\w*|carg\w*)?\s*(?:a|en)\s+(?:la\s+)?(?:cuenta\s+de\s+|cuenta\s+|cliente\s+)?([a-z\s]+)$/i)
      || textoNorm.match(/(?:a|en)\s+(?:la\s+)?(?:cuenta\s+de\s+|cuenta\s+|cliente\s+)?([a-z\s]+)$/i);

    if (match) {
      let nom = match[1].trim();
      nom = nom.replace(/^(?:la|el|cuenta|cliente|de)\s+/g, '').trim();
      const stopWords = ['efectivo', 'tarjeta', 'pos', 'mesa', 'cuenta', 'libre', 'definido', 'dos', 'tres', 'cuatro', 'cinco'];
      if (nom && nom.length >= 2 && !stopWords.includes(nom)) {
        let nombreFinal = nom;
        if (input.clientesNombres && input.clientesNombres.length) {
          const normNom = normalizarTexto(nom);
          const clienteExistente = input.clientesNombres.find(cn => {
            const cnNorm = normalizarTexto(cn);
            return cnNorm === normNom || cnNorm.includes(normNom) || normNom.includes(cnNorm);
          });
          if (clienteExistente) {
            nombreFinal = clienteExistente;
          }
        }
        const nombreFormateado = nombreFinal.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return {
          tipoAccion: 'PASAR_MESA_A_CUENTA',
          numeroMesa,
          nombreCliente: nombreFormateado,
          mensajeVoz: `Listo, pasando la cuenta de la Mesa ${numeroMesa} a ${nombreFormateado}.`,
          explicacion: `Cuenta de Mesa #${numeroMesa} transferida a ${nombreFormateado} vía comando local.`,
        };
      }
    }
  }

  // D) Dividir cuenta de mesa y cobrar (ej. "divide la cuenta de la mesa 1 entre 2", "divide la mesa 1 entre 3 en efectivo", "cobra la mesa 1 dividida entre 2", "cobra la 1 dividida en 3 partes")
  if (numeroMesa && (/(?:divid|part)\w*/.test(textoNorm) || /dividid[ao]/.test(textoNorm))) {
    const matchPartes = textoNorm.match(/(?:entre|en)\s+(\d+|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s*(?:partes|personas|pagos)?/);
    let partes = 2;
    if (matchPartes) {
      const val = matchPartes[1];
      const n = !isNaN(parseInt(val, 10)) ? parseInt(val, 10) : PALABRAS_A_NUMERO[val];
      if (n && n >= 2) partes = n;
    }
    return {
      tipoAccion: 'DIVIDIR_CUENTA_MESA',
      numeroMesa,
      numeroPartes: partes,
      metodoPago,
      mensajeVoz: `Listo, dividiendo la cuenta de la Mesa ${numeroMesa} en ${partes} partes y cobrando en ${metodoPago}.`,
      explicacion: `Cobro dividido de Mesa #${numeroMesa} en ${partes} partes (${metodoPago}) vía comando local.`,
    };
  }

  // E) Finalizar / Cobrar / Cerrar mesa (Coloquial y flexible: "finaliza la mesa 1", "finaliza la 1", "cierra la 1", "cobra la 1", "termina mesa 2", etc.)
  if (numeroMesa && /(?:finaliz|termin|cierr|cerr|cobr|liquid|deten|parar?|apag|desactiv|saca\s+la\s+cuenta|cuenta\s+de\s+(?:la\s+)?(?:mesa|\d+)|cancela\s+la\s+mesa)/.test(textoNorm)) {
    return {
      tipoAccion: 'COBRAR_MESA',
      numeroMesa,
      metodoPago,
      mensajeVoz: `Listo, cerrando y cobrando la Mesa ${numeroMesa} en ${metodoPago}.`,
      explicacion: `Cierre y cobro de Mesa #${numeroMesa} en ${metodoPago} vía comando local.`,
    };
  }

  // E) Eliminar consumo de mesa (ej. "elimina una coca cola de la mesa 1", "quita una cerveza de la 2", "cancela el consumo de la 1")
  if (numeroMesa && /(?:elimin|quit|borr|remov|devuelv)\w*\s+/.test(textoNorm)) {
    const { producto } = buscarProductoCatalogo(textoNorm);
    const prodFinal = producto || 'Consumo';
    return {
      tipoAccion: 'ELIMINAR_CONSUMO_MESA',
      numeroMesa,
      nombreProducto: prodFinal,
      cantidad,
      mensajeVoz: `Listo, eliminando ${cantidad} ${prodFinal} de la Mesa ${numeroMesa}.`,
      explicacion: `Consumo ${cantidad}x ${prodFinal} devuelto a inventario desde Mesa #${numeroMesa}.`,
    };
  }

  // F) Consultar estado de mesa o mesas libres (ej. "como va la mesa 1", "cuanto lleva la 1", "que mesas estan libres")
  if (numeroMesa && /(?:como va|cuanto lleva|cuanto va|tiempo de|estado de|esta libre)/.test(textoNorm)) {
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
  if (/(?:que|cuales)\s+mesas\s+estan\s+(?:libres|disponibles)|mesas\s+libres|mesas\s+disponibles/.test(textoNorm)) {
    const libres = input.mesasContexto?.filter(m => m.estado === 'disponible').map(m => m.numeroMesa) || [];
    const msj = libres.length ? `Las mesas libres son: ${libres.join(', ')}.` : 'No hay mesas libres en este momento.';
    return {
      tipoAccion: 'CONSULTAR_ESTADO_MESA',
      mensajeVoz: msj,
      explicacion: msj,
    };
  }

  // G) Iniciar / Abrir mesa (Soporta inicio libre, definido y DEFINIDO PAGADO DE CONTADO)
  if (numeroMesa && /(?:inici|abr|arranc|empez|empiez|comienz|activ|enciend|tiempo\s+libre|dale\s+tiempo|pon\s+tiempo|ponle\s+tiempo|tiempo\s+en|tiempo\s+para|tiempo\s+a)/.test(textoNorm)) {
    const esPagadoContado = /(?:pagad[ao]\s+de\s+contado|de\s+contado|pagad[ao]|prepago|prepagad[ao]|contado)/.test(textoNorm);

    let modoJuego: 'libre' | 'definido' = esPagadoContado ? 'definido' : 'libre';
    let minutosDefinidos = 60;

    // Si menciona duración explícita o es pagado de contado
    if (/(?:hora|minuto|min|media\s+hora)/.test(textoNorm) || esPagadoContado) {
      modoJuego = 'definido';
      if (/media\s+hora|30\s*min/.test(textoNorm)) minutosDefinidos = 30;
      else if (/hora\s+y\s+media|90\s*min/.test(textoNorm)) minutosDefinidos = 90;
      else if (/dos\s+horas|2\s*horas/.test(textoNorm)) minutosDefinidos = 120;
      else if (/tres\s+horas|3\s*horas/.test(textoNorm)) minutosDefinidos = 180;
      else {
        const matchMin = textoNorm.match(/(\d+)\s*(?:minutos?|min)/);
        if (matchMin) minutosDefinidos = parseInt(matchMin[1], 10);
      }
    }

    const descModo = modoJuego === 'libre'
      ? 'tiempo libre'
      : (esPagadoContado ? `${minutosDefinidos} minutos pagados de contado` : `${minutosDefinidos} minutos`);

    return {
      tipoAccion: 'INICIAR_MESA',
      numeroMesa,
      modoJuego,
      minutosDefinidos: modoJuego === 'definido' ? minutosDefinidos : undefined,
      pagadoDeContado: esPagadoContado,
      mensajeVoz: `Listo, iniciando ${descModo} en la Mesa ${numeroMesa}.`,
      explicacion: `Mesa #${numeroMesa} iniciada en modo ${modoJuego === 'libre' ? 'Libre' : `Definido (${minutosDefinidos} min)`}${esPagadoContado ? ' (PAGADO DE CONTADO)' : ''} vía motor local.`,
    };
  }

  // H) Agregar consumo a mesa (ej. "agrega un verde a la mesa 3", "agrega 2 cervezas y una coca a la mesa 3")
  if (numeroMesa && /(?:agreg|carg|apunt|sirv|llev|ponle|pon|dame)/.test(textoNorm)) {
    const fraseSinMesa = textoNorm
      .replace(new RegExp(`(?:a|en|para)\\s+(?:la\\s+)?mesa\\s*${numeroMesa}`, 'i'), '')
      .trim();

    const chunks = fraseSinMesa
      .replace(/^(?:agrega|agregame|cargale|cargame|carga|apuntale|apuntame|apunta|sirve|sirvele|ponle|pon|dame)\s+/i, '')
      .split(/(?:,| y | e )+/)
      .map(c => c.trim())
      .filter(Boolean);

    const itemsDetectados: Array<{ nombreProducto: string; cantidad: number }> = [];
    for (const chunk of chunks) {
      const { producto: pFound } = buscarProductoCatalogo(chunk);
      if (pFound) {
        const matchCant = chunk.match(/^(?:(\d+)|un|una|uno|dos|tres|cuatro|cinco)\b/i);
        const cChunk = matchCant ? extraerCantidad(chunk) : 1;
        itemsDetectados.push({ nombreProducto: pFound, cantidad: cChunk });
      }
    }

    if (itemsDetectados.length > 1) {
      return {
        tipoAccion: 'AGREGAR_CONSUMO_MESA',
        numeroMesa,
        nombreProducto: itemsDetectados[0].nombreProducto,
        cantidad: itemsDetectados[0].cantidad,
        items: itemsDetectados,
        mensajeVoz: `Listo, agregué ${itemsDetectados.map(i => `${i.cantidad} ${i.nombreProducto}`).join(', ')} a la Mesa ${numeroMesa}.`,
        explicacion: `Agregados múltiples consumos a Mesa #${numeroMesa} (Motor local).`,
      };
    }

    const { producto, terminoBuscado } = buscarProductoCatalogo(textoNorm);
    if (!producto) {
      return {
        tipoAccion: 'NO_ENTENDIDO',
        mensajeVoz: `No encontré el producto "${terminoBuscado}" en el catálogo. Por favor verifica el nombre.`,
        explicacion: `El producto "${terminoBuscado}" no existe en el catálogo de esta sucursal.`,
      };
    }
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
  // ==========================================
  // SECCIÓN 3: PUNTO DE VENTA (POS) Y CUENTAS
  // ==========================================

  // A) Cobrar cuenta de cliente (ej. "cobra la cuenta de Juan en efectivo", "cobra el total de la cuenta de Samuel", "saldar cuenta de Carlos en tarjeta")
  const matchCobrarCuenta = textoNorm.match(/(?:cobra\w*|sald\w*|pag\w*)\s+(?:(?:el\s+total\s+de\s+(?:la\s+)?|la\s+cuenta\s+completa\s+de\s+|todo\s+lo\s+de\s+|la\s+cuenta\s+total\s+de\s+)?cuenta\s+(?:de\s+)?|el\s+total\s+de\s+|todo\s+lo\s+de\s+)?([a-z\s]+?)(?:\s+(?:en|con)\s+(?:efectivo|tarjeta|pos))?$/i);
  if (matchCobrarCuenta) {
    const cobrarTodo = /(?:total|complet[ao]|tod[ao]\s+lo\s+de)/i.test(textoNorm);
    let nomC = matchCobrarCuenta[1].trim().replace(/^(?:la|el|cuenta|cliente|total|de)\s+/g, '');
    const stopWords = ['mesa', 'caja', 'turno', 'efectivo', 'tarjeta', 'pos'];
    if (nomC && !stopWords.includes(nomC)) {
      if (input.clientesNombres && input.clientesNombres.length) {
        const normNom = normalizarTexto(nomC);
        const clienteExistente = input.clientesNombres.find(cn => {
          const cnNorm = normalizarTexto(cn);
          return cnNorm === normNom || cnNorm.includes(normNom) || normNom.includes(cnNorm);
        });
        if (clienteExistente) nomC = clienteExistente;
      }
      const nombreFormateado = nomC.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return {
        tipoAccion: 'COBRAR_CUENTA_CLIENTE',
        nombreCliente: nombreFormateado,
        metodoPago,
        cobrarTodo,
        mensajeVoz: cobrarTodo
          ? `Listo, cobrando el total de la cuenta de ${nombreFormateado} en ${metodoPago}.`
          : `Listo, cobrando la cuenta actual de ${nombreFormateado} en ${metodoPago}.`,
        explicacion: `Cobro de cuenta ${cobrarTodo ? 'total' : 'actual'} de ${nombreFormateado} en ${metodoPago} vía comando local.`,
      };
    }
  }

  // B) Consultar saldo o estado de cuenta de cliente (ej. "¿cuánto debe Juan?", "saldo de Carlos", "estado de cuenta de Pedro")
  const matchSaldoCuenta = textoNorm.match(/(?:cuanto debe|cuanto tiene\s+(?:la\s+cuenta\s+de)?|saldo de|estado de\s+(?:la\s+)?cuenta de)\s+([a-z\s]+)/i);
  if (matchSaldoCuenta) {
    let nomC = matchSaldoCuenta[1].trim().replace(/\?+/g, '').replace(/^(?:la|el|cuenta|cliente)\s+/g, '');
    if (nomC) {
      if (input.clientesNombres && input.clientesNombres.length) {
        const normNom = normalizarTexto(nomC);
        const clienteExistente = input.clientesNombres.find(cn => {
          const cnNorm = normalizarTexto(cn);
          return cnNorm === normNom || cnNorm.includes(normNom) || normNom.includes(cnNorm);
        });
        if (clienteExistente) nomC = clienteExistente;
      }
      const nombreFormateado = nomC.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return {
        tipoAccion: 'CONSULTAR_CUENTA_CLIENTE',
        nombreCliente: nombreFormateado,
        mensajeVoz: `Consultando la cuenta de ${nombreFormateado}.`,
        explicacion: `Consulta de cuenta para ${nombreFormateado} vía comando local.`,
      };
    }
  }

  // C) Abonar a cuenta de cliente (ej. "abona 20 a la cuenta de Samuel", "abona 50 a Carlos", "abono de 30 a Juan", "abona 20 quetzales a la cuenta de Samuel en tarjeta")
  const matchAbono = textoNorm.match(/(?:abona\w*|abono(?:\s+de)?)\s+(\d+|[a-z]+)\s*(?:quetzales|q)?\s+(?:a|en|para)\s+(?:la\s+cuenta\s+de\s+|cuenta\s+de\s+)?([a-z\s]+?)(?:\s+(?:en|con)\s+(?:efectivo|tarjeta|pos))?$/i);
  if (matchAbono) {
    const montoStr = matchAbono[1];
    const montoAbono = !isNaN(parseFloat(montoStr)) ? parseFloat(montoStr) : (PALABRAS_A_NUMERO[montoStr] || 0);
    let nomC = matchAbono[2].trim().replace(/^(?:la|el|cuenta|cliente|de)\s+/g, '');
    const stopWords = ['mesa', 'caja', 'turno', 'efectivo', 'tarjeta', 'pos'];
    if (montoAbono > 0 && nomC && !stopWords.includes(nomC)) {
      if (input.clientesNombres && input.clientesNombres.length) {
        const normNom = normalizarTexto(nomC);
        const clienteExistente = input.clientesNombres.find(cn => {
          const cnNorm = normalizarTexto(cn);
          return cnNorm === normNom || cnNorm.includes(normNom) || normNom.includes(cnNorm);
        });
        if (clienteExistente) nomC = clienteExistente;
      }
      const nombreFormateado = nomC.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return {
        tipoAccion: 'ABONAR_CUENTA_CLIENTE',
        nombreCliente: nombreFormateado,
        monto: montoAbono,
        metodoPago,
        mensajeVoz: `Listo, registrando abono de Q${montoAbono} a la cuenta de ${nombreFormateado} en ${metodoPago}.`,
        explicacion: `Abono de Q${montoAbono} a cuenta de ${nombreFormateado} (${metodoPago}) vía comando local.`,
      };
    }
  }

  // D) Agregar consumo a cuenta de cliente (ej. "agrega una coca a la cuenta de Juan", "agrega una coca a Victor Hugo", "cárgale 2 cervezas a Carlos", "apunta un verde para Pedro", "ponle un casino a Maria")
  const matchCuentaCliente = (
    textoNorm.match(/(?:a\s+la\s+cuenta\s+de|en\s+la\s+cuenta\s+de|a\s+cuenta\s+de|cuenta\s+de)\s+([a-z\s]+)$/i) ||
    textoNorm.match(/(?:agreg\w*|carg\w*|apunt\w*|anot\w*|pon\w*|pas\w*|sum\w*)\s+.*?\s+(?:a|para)\s+(?:la\s+cuenta\s+de\s+|cuenta\s+de\s+)?([a-z\s]+)$/i) ||
    textoNorm.match(/(?:cargale|carga|apuntale|apunta|ponle)\s+(?:a|para)\s+([a-z\s]+)$/i) ||
    (textoNorm.includes('cuenta') && textoNorm.match(/(?:para|a)\s+([a-z\s]+)$/i))
  );

  if (matchCuentaCliente && !textoNorm.includes('mesa') && !textoNorm.includes('consola') && !textoNorm.includes('billar') && !textoNorm.includes('maquina') && !textoNorm.includes('slot') && !textoNorm.includes('tragamonedas')) {
    let nomC = matchCuentaCliente[1].trim().replace(/^(?:la|el|cuenta|cliente|de)\s+/g, '');
    const stopWords = ['efectivo', 'tarjeta', 'pos', 'mesa', 'cuenta', 'libre', 'definido', 'caja', 'turno'];
    if (nomC && nomC.length >= 2 && !stopWords.includes(nomC)) {
      if (input.clientesNombres && input.clientesNombres.length) {
        const normNom = normalizarTexto(nomC);
        const clienteExistente = input.clientesNombres.find(cn => {
          const cnNorm = normalizarTexto(cn);
          return cnNorm === normNom || cnNorm.includes(normNom) || normNom.includes(cnNorm);
        });
        if (clienteExistente) nomC = clienteExistente;
      }
      const nombreFormateado = nomC.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

      // Remover el nombre del cliente de la frase para buscar el producto de forma 100% limpia
      const fraseSinCliente = textoNorm
        .replace(new RegExp(`(?:a|para)\\s+(?:la\\s+cuenta\\s+de\\s+|cuenta\\s+de\\s+)?${nomC}$`, 'i'), '')
        .trim();

      // Detectar si hay múltiples productos separados por comas o "y"
      const chunks = (fraseSinCliente || textoNorm)
        .replace(/^(?:agrega|agregame|cargale|cargame|carga|apuntale|apuntame|apunta|sirve|sirvele|ponle|pon|dame)\s+/i, '')
        .split(/(?:,| y | e )+/)
        .map(c => c.trim())
        .filter(Boolean);

      const itemsDetectados: Array<{ nombreProducto: string; cantidad: number }> = [];
      for (const chunk of chunks) {
        const { producto: pFound } = buscarProductoCatalogo(chunk);
        if (pFound) {
          const matchCant = chunk.match(/^(?:(\d+)|un|una|uno|dos|tres|cuatro|cinco)\b/i);
          const cChunk = matchCant ? extraerCantidad(chunk) : 1;
          itemsDetectados.push({ nombreProducto: pFound, cantidad: cChunk });
        }
      }

      if (itemsDetectados.length > 1) {
        return {
          tipoAccion: 'AGREGAR_CONSUMO_CUENTA',
          nombreCliente: nombreFormateado,
          nombreProducto: itemsDetectados[0].nombreProducto,
          cantidad: itemsDetectados[0].cantidad,
          items: itemsDetectados,
          mensajeVoz: `Listo, cargué ${itemsDetectados.map(i => `${i.cantidad} ${i.nombreProducto}`).join(', ')} a la cuenta de ${nombreFormateado}.`,
          explicacion: `Cargados múltiples consumos a cuenta de ${nombreFormateado} vía comando local.`,
        };
      }

      const { producto, terminoBuscado } = buscarProductoCatalogo(fraseSinCliente || textoNorm);
      if (!producto) {
        return {
          tipoAccion: 'NO_ENTENDIDO',
          mensajeVoz: `No encontré el producto "${terminoBuscado}" en el catálogo para cargar a ${nombreFormateado}.`,
          explicacion: `El producto "${terminoBuscado}" no existe en el catálogo de esta sucursal.`,
        };
      }
      return {
        tipoAccion: 'AGREGAR_CONSUMO_CUENTA',
        nombreCliente: nombreFormateado,
        nombreProducto: producto,
        cantidad,
        mensajeVoz: `Listo, cargué ${cantidad} ${producto} a la cuenta de ${nombreFormateado}.`,
        explicacion: `Cargado ${cantidad}x ${producto} a cuenta de ${nombreFormateado} vía comando local.`,
      };
    }
  }

  // D) Venta rápida POS (ej. "vende una coca cola", "vender 2 cervezas en tarjeta", "despacha un agua", "despacho rápido 1 verde", "dame una coca")
  const tieneAccionVenta = /(?:vende\w*|despach\w*|venta\s+rapida|despacho\s+rapido|cobrate|cobr\w*|dame|sacale|saca|sirve|servi)/i.test(textoNorm);
  if (tieneAccionVenta && !textoNorm.includes('mesa') && !textoNorm.includes('consola') && !textoNorm.includes('billar') && !textoNorm.includes('cuenta') && !textoNorm.includes('maquina') && !textoNorm.includes('slot') && !textoNorm.includes('tragamonedas')) {
    const { producto, terminoBuscado } = buscarProductoCatalogo(textoNorm);
    if (!producto) {
      return {
        tipoAccion: 'NO_ENTENDIDO',
        mensajeVoz: `No encontré el producto "${terminoBuscado}" en el catálogo para venta rápida.`,
        explicacion: `El producto "${terminoBuscado}" no existe en el catálogo de esta sucursal.`,
      };
    }
    return {
      tipoAccion: 'VENTA_RAPIDA',
      nombreProducto: producto,
      cantidad,
      metodoPago,
      mensajeVoz: `Listo, venta rápida de ${cantidad} ${producto} en ${metodoPago}.`,
      explicacion: `Venta rápida POS: ${cantidad}x ${producto} (${metodoPago}) vía comando local.`,
    };
  }

  // Fallback sin sugerencias cuando ningún comando coincide
  if (apiErrorMotivo) {
    return {
      tipoAccion: 'NO_ENTENDIDO',
      mensajeVoz: 'Comando no reconocido.',
      explicacion: 'Comando no reconocido.',
    };
  }

  return {
    tipoAccion: 'NO_ENTENDIDO',
    mensajeVoz: 'Comando no reconocido.',
    explicacion: 'Comando no reconocido.',
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
   - COBRAR MESA: "cobra la mesa 1 en efectivo/tarjeta", "cerrar mesa 2", "finaliza la mesa 1" -> tipoAccion: COBRAR_MESA.
   - PASAR A CUENTA: "finaliza la mesa 1 y pasa la cuenta a Juan", "pasa la mesa 1 a la cuenta de Juan", "finaliza la 1 y cargala a Juan" -> tipoAccion: PASAR_MESA_A_CUENTA, numeroMesa: 1, nombreCliente: 'Juan'.
   - DIVIDIR CUENTA: "divide la cuenta de la mesa 1 entre 2 en efectivo", "cobra la mesa 1 dividida entre 3" -> tipoAccion: DIVIDIR_CUENTA_MESA, numeroMesa: 1, numeroPartes: 2 o 3, metodoPago: 'Efectivo'.
   - AGREGAR CONSUMO: "agrega 2 cervezas a la mesa 1" -> tipoAccion: AGREGAR_CONSUMO_MESA.
   - ELIMINAR CONSUMO: "elimina una coca cola de la mesa 1" -> tipoAccion: ELIMINAR_CONSUMO_MESA.
   - CONSULTAS: "¿cómo va la mesa 1?", "¿qué mesas están libres?" -> tipoAccion: CONSULTAR_ESTADO_MESA.

2. PUNTO DE VENTA (POS) Y CUENTAS:
   - VENTA RÁPIDA: "vende una coca cola", "vender 2 cervezas corona" -> tipoAccion: VENTA_RAPIDA.
   - CARGAR A CUENTA: "agrega un casino a la cuenta de Juan", "agrega una coca a Victor Hugo", "carga 2 cervezas a Carlos", "apunta un agua para Pedro" -> tipoAccion: AGREGAR_CONSUMO_CUENTA.
   - ABONAR A CUENTA: "abona 20 a la cuenta de Samuel", "abona 50 a Carlos", "abono de 30 a Juan" -> tipoAccion: ABONAR_CUENTA_CLIENTE, monto: 20, nombreCliente: 'Samuel'.
   - COBRAR CUENTA: "cobra la cuenta de Juan en efectivo/tarjeta" -> tipoAccion: COBRAR_CUENTA_CLIENTE.
   - CONSULTAR CUENTA: "¿cuánto debe Juan?", "saldo de Pedro" -> tipoAccion: CONSULTAR_CUENTA_CLIENTE.

3. TRAGAMONEDAS:
   - REGISTRAR BASE: "agrega 50 de base a la máquina 1" -> tipoAccion: TRAGAMONEDAS_BASE, monto: 50.
   - EXTRACCIÓN: "extrae 100 de la máquina 2" -> tipoAccion: TRAGAMONEDAS_EXTRACCION, monto: 100.
   - PREMIO: "paga premio de 30 en la máquina 1" -> tipoAccion: TRAGAMONEDAS_PREMIO, monto: 30.
   - CONSULTA: "estado de las máquinas" -> tipoAccion: CONSULTAR_TRAGAMONEDAS.

4. CONSULTA GENERAL: Dudas operativas del sistema.

REGLA CRÍTICA PARA COMANDOS NO RECONOCIDOS:
Si el texto recibido no coincide con ninguna acción operativa o no se entiende, responde exactamente con tipoAccion: "NO_ENTENDIDO", mensajeVoz: "Comando no reconocido." y explicacion: "Comando no reconocido." SIN dar sugerencias, ejemplos ni opciones adicionales.

El campo "mensajeVoz" debe ser natural, conciso y profesional en español.`,
});

/**
 * Consulta al Agente de IA en Groq con procesamiento ultra-rápido y modelo de lenguaje avanzado.
 */
async function consultarAgenteGroq(input: AsistenteVozInput): Promise<AsistenteVozOutput | null> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return null;
  }

  const systemPrompt = `Eres el Agente Inteligente de Voz para Pool Control, un sistema de gestión integral de salas de billar, bar/cafetería y máquinas tragamonedas.
Tu función es interpretar comandos de voz del operador y devolver un JSON estructurado con la acción exacta a ejecutar.

Esquema JSON requerido:
{
  "tipoAccion": "INICIAR_MESA" | "AJUSTAR_TIEMPO_MESA" | "TRASLADAR_MESA" | "COBRAR_MESA" | "PASAR_MESA_A_CUENTA" | "DIVIDIR_CUENTA_MESA" | "AGREGAR_CONSUMO_MESA" | "ELIMINAR_CONSUMO_MESA" | "VENTA_RAPIDA" | "AGREGAR_CONSUMO_CUENTA" | "COBRAR_CUENTA_CLIENTE" | "ABONAR_CUENTA_CLIENTE" | "CONSULTAR_CUENTA_CLIENTE" | "TRAGAMONEDAS_BASE" | "TRAGAMONEDAS_EXTRACCION" | "TRAGAMONEDAS_PREMIO" | "CONSULTAR_ESTADO_MESA" | "CONSULTAR_TRAGAMONEDAS" | "CONSULTA_GENERAL" | "NO_ENTENDIDO",
  "numeroMesa": number (opcional),
  "numeroMesaDestino": number (opcional),
  "numeroPartes": number (opcional),
  "modoJuego": "libre" | "definido" (opcional),
  "minutosDefinidos": number (opcional),
  "pagadoDeContado": boolean (opcional, true si indica pagado, al contado, de contado o ya pagó),
  "nombreCliente": string (opcional),
  "nombreProducto": string (opcional, mapeado inteligentemente al producto más coherente del catálogo si aplica),
  "cantidad": number (opcional, por defecto 1),
  "items": [
    { "nombreProducto": string, "cantidad": number }
  ] (opcional, lista de uno o varios productos cuando el comando incluye múltiples consumos),
  "metodoPago": "Efectivo" | "Tarjeta" (opcional),
  "maquinaNombre": string (opcional),
  "monto": number (opcional),
  "cobrarTodo": boolean (opcional, true si pide cobrar la cuenta total/completa/todo incluyendo créditos; false o ausente si es solo la cuenta actual pendiente),
  "mensajeVoz": string,
  "explicacion": string
}

DIRECTRICES CLAVE:
1. MÚLTIPLES PRODUCTOS EN UN MISMO COMANDO:
   Si el operador pide uno o varios productos a la vez (ej: "agrega una coca, un casino, y un jugo de vegetales a samuel", "agrega 2 cervezas y unas papas a la mesa 3", "vende una coca y 2 chocolates"), debes extraer TODOS los productos solicitados en el array "items" con sus cantidades y los nombres más adecuados del catálogo:
   "items": [
     { "nombreProducto": "Coca Cola 600ml", "cantidad": 1 },
     { "nombreProducto": "Galleta Casino", "cantidad": 1 },
     { "nombreProducto": "Jugo de Vegetales", "cantidad": 1 }
   ]
   También llena "nombreProducto" y "cantidad" con el primer producto.
   El "mensajeVoz" debe mencionar los productos de forma natural (ej: "Agregando una Coca Cola, un Casino y un Jugo de Vegetales a Samuel.").
2. Para productos, asocia intuitivamente palabras coloquiales al catálogo (ej: "coca" -> "Coca Cola", "casino" -> "Galleta Casino" o "Casino", "verde" -> "Verde Lukis", "corona" -> "Cerveza Corona", "agua" -> "Agua Pura").
3. Para clientes, extrae el nombre mencionado o busca la coincidencia más cercana en la lista de clientes (soporta tanto "a la cuenta de X" como "a X").
4. DISTINCIÓN CRÍTICA EN COBRO DE CUENTAS DE CLIENTES:
   - "cobra la cuenta de Samuel", "cóbbrale a Samuel": Se refiere ÚNICAMENTE a su cuenta actual pendiente -> tipoAccion: "COBRAR_CUENTA_CLIENTE", nombreCliente: "Samuel", cobrarTodo: false.
   - "cobra el total de la cuenta de Samuel", "cobra todo lo de Samuel", "cobra la cuenta completa de Samuel", "cobra la deuda total de Samuel": Se refiere a la cuenta completa incluyendo créditos -> tipoAccion: "COBRAR_CUENTA_CLIENTE", nombreCliente: "Samuel", cobrarTodo: true.
5. ABONO A CUENTAS DE CLIENTES:
   - "abona 20 a la cuenta de Samuel", "abona 50 a Carlos": tipoAccion: "ABONAR_CUENTA_CLIENTE", monto: 20, nombreCliente: "Samuel". Se aplica a la cuenta actual, y si sobrepasa la cuenta actual el sistema abona el excedente a la cuenta a crédito más antigua.
6. Si el operador pide iniciar una mesa con tiempo definido y menciona "pagado", "contado", "al contado", marca pagadoDeContado: true, modoJuego: "definido".
7. Si el operador pide finalizar o cobrar una mesa y pasar la cuenta a un cliente (ej: "finaliza la mesa 1 y pasa la cuenta a Samuel"), tipoAccion: "PASAR_MESA_A_CUENTA", numeroMesa: 1, nombreCliente: "Samuel".
8. Si el operador pide dividir la cuenta (ej: "divide la cuenta de la mesa 1 entre 2 en efectivo"), tipoAccion: "DIVIDIR_CUENTA_MESA", numeroMesa: 1, numeroPartes: 2, metodoPago: "Efectivo".
9. REGLA ESTRICTA PARA COMANDOS NO RECONOCIDOS O FRASES NO OPERATIVAS:
Si el texto recibido no coincide con ninguna acción operativa o no se entiende, responde EXACTAMENTE:
tipoAccion: "NO_ENTENDIDO", mensajeVoz: "Comando no reconocido.", explicacion: "Comando no reconocido." SIN dar sugerencias ni explicaciones adicionales.`;

  const contextStr = [
    input.productosNombres?.length ? `Catálogo: ${JSON.stringify(input.productosNombres)}` : '',
    input.clientesNombres?.length ? `Clientes: ${JSON.stringify(input.clientesNombres)}` : '',
    input.mesasContexto?.length ? `Mesas: ${JSON.stringify(input.mesasContexto.map(m => ({ numeroMesa: m.numeroMesa, estado: m.estado, modoJuego: m.modoJuego, cliente: m.clienteNombre })))}` : '',
    input.maquinasContexto?.length ? `Máquinas: ${JSON.stringify(input.maquinasContexto.map(m => ({ nombre: m.nombre, totalBase: m.totalBase, deuda: m.totalDeuda })))}` : '',
  ].filter(Boolean).join('\n');

  const models = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];

  for (const model of models) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `${contextStr}\n\nComando del operador: "${input.transcripcion}"` }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1
        }),
        signal: AbortSignal.timeout(5000)
      });

      if (!res.ok) {
        console.warn(`Groq (${model}) HTTP ${res.status}`);
        continue;
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content) as AsistenteVozOutput;
        if (parsed.tipoAccion) {
          parsed.motorUtilizado = 'api_groq';
          return parsed;
        }
      }
    } catch (err: any) {
      console.warn(`Error llamando a Groq (${model}):`, err?.message);
    }
  }

  return null;
}

const asistenteVozFlow = ai.defineFlow(
  {
    name: 'asistenteVozFlow',
    inputSchema: AsistenteVozInputSchema,
    outputSchema: AsistenteVozOutputSchema,
  },
  async input => {
    // 1. Intentar con el Agente Groq ultra-rápido
    try {
      const resGroq = await consultarAgenteGroq(input);
      if (resGroq) {
        if (resGroq.tipoAccion !== 'NO_ENTENDIDO') {
          return { ...resGroq, motorUtilizado: 'api_groq' };
        }
        // Si Groq no entendió, verificar si el motor local detecta un patrón obvio
        const fallbackLocal = await interpretarComandoLocal(input);
        if (fallbackLocal.tipoAccion !== 'NO_ENTENDIDO') {
          return { ...fallbackLocal, motorUtilizado: 'motor_local' };
        }
        return { ...resGroq, motorUtilizado: 'api_groq' };
      }
    } catch (err: any) {
      console.warn('Fallo en Agente Groq:', err?.message);
    }

    // 2. Intentar con Genkit / Gemini si Groq no estuviese configurado
    try {
      const { output } = await prompt(input);
      if (output && output.tipoAccion !== 'NO_ENTENDIDO') {
        return { ...output, motorUtilizado: 'api_groq' };
      }
    } catch (err: any) {
      console.warn('Fallo en API de Gemini:', err?.message);
    }

    // 3. Motor local inteligente de respaldo total
    const localRes = await interpretarComandoLocal(input);
    return { ...localRes, motorUtilizado: 'motor_local' };
  }
);

export async function procesarComandoVoz(input: AsistenteVozInput): Promise<AsistenteVozOutput> {
  // 1. Intentar con el Agente Groq de IA (Ultra-rápido, modelos gpt-oss-120b/20b con contexto completo)
  try {
    const resGroq = await consultarAgenteGroq(input);
    if (resGroq) {
      if (resGroq.tipoAccion !== 'NO_ENTENDIDO') {
        return { ...resGroq, motorUtilizado: 'api_groq' };
      }
      // Si Groq no entendió, verificar si el motor local detecta un patrón obvio
      const fallbackLocal = await interpretarComandoLocal(input);
      if (fallbackLocal.tipoAccion !== 'NO_ENTENDIDO') {
        return { ...fallbackLocal, motorUtilizado: 'motor_local' };
      }
      return { ...resGroq, motorUtilizado: 'api_groq' };
    }
  } catch (err: any) {
    console.warn('Groq no disponible, recurriendo al motor local de respaldo:', err?.message);
  }

  // 2. Motor local inteligente de respaldo total de alta disponibilidad
  const localRes = await interpretarComandoLocal(input);
  return { ...localRes, motorUtilizado: 'motor_local' };
}


