import { NextRequest, NextResponse } from 'next/server';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { firebaseConfig } from '@/firebase/config';
import fs from 'fs';
import path from 'path';

function getAdminAuth() {
  if (getApps().length === 0) {
    let serviceAccountData: any = null;

    // 1. Verificar si existe la variable de entorno
    const envKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (envKey) {
      try {
        if (fs.existsSync(envKey)) {
          serviceAccountData = JSON.parse(fs.readFileSync(envKey, 'utf8'));
        } else {
          serviceAccountData = JSON.parse(envKey);
        }
      } catch (e) {
        console.warn('Error leyendo FIREBASE_SERVICE_ACCOUNT_KEY:', e);
      }
    }

    // 2. Si no se obtuvo, buscar archivos locales en el directorio raíz
    if (!serviceAccountData) {
      const posiblesArchivos = [
        path.join(process.cwd(), 'serviceAccountKey.json'),
        path.join(process.cwd(), 'firebase-service-account.json'),
      ];

      for (const ruta of posiblesArchivos) {
        if (fs.existsSync(ruta)) {
          try {
            serviceAccountData = JSON.parse(fs.readFileSync(ruta, 'utf8'));
            break;
          } catch (e) {
            console.warn(`Error leyendo archivo ${ruta}:`, e);
          }
        }
      }
    }

    if (serviceAccountData) {
      initializeApp({
        credential: cert(serviceAccountData),
        projectId: firebaseConfig.projectId,
      });
    } else {
      initializeApp({
        projectId: firebaseConfig.projectId,
      });
    }
  }
  return getAuth();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { authUid, nuevaPassword } = body;

    if (!authUid || !nuevaPassword) {
      return NextResponse.json(
        { ok: false, message: 'El identificador de usuario y la nueva contraseña son obligatorios.' },
        { status: 400 }
      );
    }

    if (typeof nuevaPassword !== 'string' || nuevaPassword.length < 6) {
      return NextResponse.json(
        { ok: false, message: 'La nueva contraseña debe tener al menos 6 caracteres.' },
        { status: 400 }
      );
    }

    const adminAuth = getAdminAuth();
    await adminAuth.updateUser(authUid, {
      password: nuevaPassword,
    });

    return NextResponse.json({
      ok: true,
      message: 'Contraseña actualizada correctamente.',
    });
  } catch (error: any) {
    console.error('Error al actualizar contraseña:', error);

    // Códigos específicos de Firebase Auth
    if (error.code === 'auth/user-not-found') {
      return NextResponse.json(
        { ok: false, message: 'No se encontró la cuenta de autenticación de este usuario.' },
        { status: 404 }
      );
    }

    if (error.code === 'auth/invalid-password') {
      return NextResponse.json(
        { ok: false, message: 'La contraseña proporcionada no es válida. Debe tener al menos 6 caracteres.' },
        { status: 400 }
      );
    }

    // Detectar si falta credencial de servicio en entorno de desarrollo
    if (
      error.code === 'app/invalid-credential' ||
      error.message?.includes('Could not load the default credentials')
    ) {
      return NextResponse.json(
        {
          ok: false,
          code: 'ADMIN_CREDENTIALS_NEEDED',
          message: 'Se requiere configurar credenciales de Firebase Admin para cambio directo en local. Utilice el envío de enlace por correo.',
        },
        { status: 501 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        message: error.message || 'Error al actualizar la contraseña del usuario.',
      },
      { status: 500 }
    );
  }
}
