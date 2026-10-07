'use server';

/**
 * @fileOverview Flow híbrido de Genkit con fallback de procesamiento local para comandos de voz y preguntas del asistente en Pool Control.
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
});

export type AsistenteVozInput = z.infer<typeof AsistenteVozInputSchema>;

const AsistenteVozOutputSchema = z.object({
  tipoAccion: z.enum([
    'INICIAR_MESA',
    'AGREGAR_CONSUMO_MESA',
    'AGREGAR_CONSUMO_CUENTA',
    'CONSULTAR_ESTADO_MESA',
    'CONSULTA_GENERAL',
    'NO_ENTENDIDO'
  ]).describe('El tipo de acción a ejecutar.'),
  numeroMesa: z.number().optional().describe('Número de mesa involucrada (si aplica).'),
  modoJuego: z.enum(['libre', 'definido']).optional().describe('Modo de juego: libre o definido (si aplica).'),
  minutosDefinidos: z.number().optional().describe('Minutos para tiempo definido, ej: 60 para una hora (si aplica).'),
  nombreCliente: z.string().optional().describe('Nombre del cliente para la cuenta (si aplica).'),
  nombreProducto: z.string().optional().describe('Nombre del producto identificado más cercano en el catálogo (si aplica).'),
  cantidad: z.number().optional().describe('Cantidad de unidades del producto (por defecto 1).'),
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
 * Motor local inteligente de procesamiento de comandos de voz (cero latencia, sin costos de API).
 */
function interpretarComandoLocal(input: AsistenteVozInput, apiErrorMotivo?: string): AsistenteVozOutput {
  const raw = input.transcripcion || '';
  const texto = raw.toLowerCase().trim();

  // 1. Extraer número de mesa
  let numeroMesa: number | undefined;
  const matchMesa = texto.match(/mesa\s*(?:número|numero|no\.?|#)?\s*(\d+|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)/i);
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

  // 3. Buscar el producto más cercano en el catálogo
  const buscarProductoCatalogo = (frase: string): string | undefined => {
    if (!input.productosNombres || !input.productosNombres.length) return undefined;
    
    // Buscar coincidencia directa
    for (const prod of input.productosNombres) {
      const pNom = prod.toLowerCase();
      if (frase.includes(pNom)) return prod;
    }

    // Buscar por palabras clave de al menos 4 letras
    const palabras = frase.split(/\s+/).filter(w => w.length >= 3 && !['mesa', 'cuenta', 'para', 'agrega', 'inicia', 'tiempo'].includes(w));
    for (const prod of input.productosNombres) {
      const pNom = prod.toLowerCase();
      for (const w of palabras) {
        if (pNom.includes(w)) return prod;
      }
    }
    return undefined;
  };

  // CASO: CONSULTAR ESTADO DE MESA
  if (numeroMesa && /(cómo va|como va|cuánto lleva|cuanto lleva|tiempo de|estado de|está libre|esta libre)/i.test(texto)) {
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

  // CASO: INICIAR MESA
  if (numeroMesa && /(inicia|iniciar|abre|abrir|pon|poner|comienza|arranca)/i.test(texto) && !/(agrega|cárgale|carga|apúntale|apunta)/i.test(texto)) {
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

  // CASO: AGREGAR CONSUMO A CUENTA DE CLIENTE
  const matchCuenta = texto.match(/(?:cuenta|nombre)\s+de\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)/i) || texto.match(/(?:cárgale|carga|apúntale|apunta|ponle)\s+a\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)/i);
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

  // CASO: AGREGAR CONSUMO A MESA
  if (numeroMesa && /(agrega|cárgale|carga|apúntale|apunta|ponle|pon|vende)/i.test(texto)) {
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

  // Si no encajó en un comando estructurado
  if (apiErrorMotivo) {
    return {
      tipoAccion: 'CONSULTA_GENERAL',
      mensajeVoz: 'Comando no reconocido. Puedes decir: Inicia tiempo libre en mesa 1, Agrega una Coca Cola a la mesa 2, o Cárgale a la cuenta de Juan.',
      explicacion: 'Nota: Tus créditos de Google AI Studio están agotados, pero los comandos de control de mesas y despachos siguen funcionando al 100% con el motor local.',
    };
  }

  return {
    tipoAccion: 'NO_ENTENDIDO',
    mensajeVoz: 'No logré entender el comando. Prueba diciendo: Inicia mesa 1 libre, o Agrega una gaseosa a la mesa 2.',
    explicacion: 'Comando no identificado.',
  };
}

const prompt = ai.definePrompt({
  name: 'asistenteVozPrompt',
  model: 'googleai/gemini-3.8-flash',
  input: { schema: AsistenteVozInputSchema },
  output: { schema: AsistenteVozOutputSchema },
  prompt: `Eres el Asistente Inteligente de Pool Control, un sistema de gestión para clubes de billar, consolas y bar.
Tu función es interpretar comandos de voz del operador y responder preguntas con precisión y rapidez.

Texto recibido por voz: "{{{transcripcion}}}"

Contexto actual de la sucursal:
- Mesas:
{{#each mesasContexto}}
  * Mesa #{{numeroMesa}} (Tipo: {{tipoDeMesa}}, Estado: {{estado}}{{#if modoJuego}}, Modo: {{modoJuego}}{{/if}}{{#if clienteNombre}}, Cliente: {{clienteNombre}}{{/if}})
{{/each}}

- Catálogo de productos disponibles (usa estos nombres para emparejar lo que dijo el usuario):
{{#each productosNombres}}
  * {{this}}
{{/each}}

- Clientes conocidos / cuentas:
{{#each clientesNombres}}
  * {{this}}
{{/each}}

Reglas de interpretación:
1. INICIAR MESA:
   - "inicia tiempo libre en mesa 1", "pon la mesa 2", "abre la mesa 3 libre", "inicia mesa 4" -> tipoAccion: INICIAR_MESA, modoJuego: 'libre'.
   - "inicia una hora en la mesa 1", "ponle 30 minutos a la mesa 2" -> tipoAccion: INICIAR_MESA, modoJuego: 'definido', minutosDefinidos: cantidad de minutos (ej. 60 para 1 hora, 30 para 30 min).
   - Identifica el número de mesa exacto.

2. AGREGAR CONSUMO A MESA:
   - "agrega una coca cola a la mesa 2", "apúntale dos cervezas a la mesa 1", "carga 3 aguas a la 5" -> tipoAccion: AGREGAR_CONSUMO_MESA.
   - Extrae el número de mesa, la cantidad (número entero >= 1) y busca en el catálogo de productos el nombre oficial más cercano (por ejemplo si dice "un casino" o "galleta casino", empareja con el producto que contenga "Casino").

3. AGREGAR CONSUMO A CUENTA DE CLIENTE:
   - "agrega un casino a la cuenta de juan", "cárgale 2 gatorades a pedro", "apunta una cerveza a maría" -> tipoAccion: AGREGAR_CONSUMO_CUENTA.
   - Extrae el nombre del cliente, la cantidad y el producto más cercano del catálogo.

4. CONSULTAR ESTADO DE MESA:
   - "¿cómo va la mesa 2?", "¿cuánto lleva la mesa 1?", "¿está libre la mesa 3?" -> tipoAccion: CONSULTAR_ESTADO_MESA.
   - Responde con datos claros según el contexto de las mesas.

5. CONSULTA GENERAL / DUDAS DEL SISTEMA:
   - Si el usuario hace una pregunta sobre el sistema (ej. cómo cerrar caja, cómo registrar una compra, dudas del negocio, o conversación) -> tipoAccion: CONSULTA_GENERAL.
   - Responde de forma cordial, profesional y concisa.

6. NO ENTENDIDO:
   - Si la frase es ininteligible o no tiene sentido -> tipoAccion: NO_ENTENDIDO.

El campo "mensajeVoz" debe ser muy fluido, amigable y directo al grano para ser hablado en voz alta.`,
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
