'use server';

/**
 * @fileOverview Flow de Genkit para procesar comandos de voz y preguntas del asistente inteligente en Pool Control.
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

export async function procesarComandoVoz(input: AsistenteVozInput): Promise<AsistenteVozOutput> {
  return asistenteVozFlow(input);
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

El campo "mensajeVoz" debe ser muy fluido, amigable y directo al grano para ser hablado en voz alta (ej: "Listo, iniciando tiempo libre en la mesa 1", "Agregando una Coca-Cola a la mesa 2").`,
});

const asistenteVozFlow = ai.defineFlow(
  {
    name: 'asistenteVozFlow',
    inputSchema: AsistenteVozInputSchema,
    outputSchema: AsistenteVozOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    if (!output) {
      return {
        tipoAccion: 'NO_ENTENDIDO' as const,
        mensajeVoz: 'Disculpa, no pude comprender el comando. Por favor intenta de nuevo.',
        explicacion: 'No se obtuvo respuesta estructurada del modelo.',
      };
    }
    return output;
  }
);
