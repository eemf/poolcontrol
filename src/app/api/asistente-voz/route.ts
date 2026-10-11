import { NextRequest, NextResponse } from 'next/server';
import { procesarComandoVoz, type AsistenteVozInput } from '@/ai/flows/asistente-voz';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AsistenteVozInput;
    if (!body || !body.transcripcion) {
      return NextResponse.json(
        { error: 'Transcripción requerida' },
        { status: 400 }
      );
    }

    const resultado = await procesarComandoVoz(body);
    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('Error en API /api/asistente-voz:', error);
    return NextResponse.json(
      {
        tipoAccion: 'NO_ENTENDIDO',
        mensajeVoz: 'Comando no reconocido.',
        explicacion: 'Comando no reconocido.',
        error: error?.message || 'Error interno',
      },
      { status: 500 }
    );
  }
}
