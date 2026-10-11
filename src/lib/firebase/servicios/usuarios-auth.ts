import { Auth, User, updatePassword, sendPasswordResetEmail } from 'firebase/auth';

interface CambiarPasswordParams {
  authUid: string;
  email: string;
  nuevaPassword: string;
  currentUser: User | null;
  auth: Auth;
}

interface ResultadoCambioPassword {
  ok: boolean;
  message: string;
  code?: string;
}

/**
 * Modifica la contraseña de un usuario.
 * Si el usuario es el usuario activo actual, utiliza updatePassword de Firebase client SDK.
 * Si es otro usuario, solicita la actualización mediante el endpoint de administración.
 */
export async function cambiarPasswordUsuario({
  authUid,
  email,
  nuevaPassword,
  currentUser,
  auth,
}: CambiarPasswordParams): Promise<ResultadoCambioPassword> {
  if (!nuevaPassword || nuevaPassword.length < 6) {
    return {
      ok: false,
      message: 'La contraseña debe tener al menos 6 caracteres.',
    };
  }

  // Si el usuario a editar es el mismo actualmente autenticado
  if (currentUser && currentUser.uid === authUid) {
    try {
      await updatePassword(currentUser, nuevaPassword);
      return {
        ok: true,
        message: 'Tu contraseña ha sido actualizada exitosamente.',
      };
    } catch (error: any) {
      console.error('Error al actualizar contraseña del usuario actual:', error);
      if (error.code === 'auth/requires-recent-login') {
        return {
          ok: false,
          code: 'REQUIRES_RECENT_LOGIN',
          message: 'Por seguridad, debes cerrar sesión e iniciar sesión nuevamente antes de cambiar tu contraseña.',
        };
      }
      return {
        ok: false,
        message: error.message || 'No se pudo actualizar la contraseña.',
      };
    }
  }

  // Para otro usuario, llamamos al endpoint de administración
  try {
    const res = await fetch('/api/usuarios/cambiar-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        authUid,
        email,
        nuevaPassword,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.ok) {
      if (data.code === 'ADMIN_CREDENTIALS_NEEDED') {
        return {
          ok: false,
          code: 'ADMIN_CREDENTIALS_NEEDED',
          message: data.message || 'Se requiere configurar credenciales de Firebase Admin.',
        };
      }
      return {
        ok: false,
        message: data.message || 'Error al cambiar la contraseña del usuario.',
      };
    }

    return {
      ok: true,
      message: data.message || 'Contraseña actualizada exitosamente.',
    };
  } catch (error: any) {
    console.error('Error al llamar al endpoint de cambio de contraseña:', error);
    return {
      ok: false,
      message: error.message || 'Error de conexión al cambiar la contraseña.',
    };
  }
}

/**
 * Envía un correo oficial de restablecimiento de contraseña al correo del usuario.
 */
export async function enviarCorreoRestablecimiento(
  auth: Auth,
  email: string
): Promise<ResultadoCambioPassword> {
  if (!email) {
    return {
      ok: false,
      message: 'El correo electrónico es requerido.',
    };
  }

  try {
    await sendPasswordResetEmail(auth, email);
    return {
      ok: true,
      message: `Se ha enviado un enlace de restablecimiento a ${email}.`,
    };
  } catch (error: any) {
    console.error('Error al enviar correo de restablecimiento:', error);
    let msg = 'No se pudo enviar el correo de restablecimiento.';
    if (error.code === 'auth/user-not-found') {
      msg = 'No se encontró un usuario con ese correo electrónico.';
    } else if (error.code === 'auth/invalid-email') {
      msg = 'El formato del correo electrónico no es válido.';
    }
    return {
      ok: false,
      message: msg,
    };
  }
}
