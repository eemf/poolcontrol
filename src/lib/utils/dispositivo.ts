/**
 * Utilidad para identificar y gestionar el nombre del equipo o terminal de trabajo.
 * Permite registrar y auditar desde qué máquina se realizan las operaciones del sistema.
 */

export const STORAGE_KEY_EQUIPO = 'poolcontrol_nombre_equipo';
export const EVENTO_EQUIPO_CAMBIADO = 'poolcontrol_equipo_cambiado';

export const SUGERENCIAS_EQUIPOS = [
  'Caja Principal',
  'Caja 2',
  'Barra / Mostrador',
  'Estación Juegos',
  'Administración',
  'Tablet Móvil',
  'Servidor Central',
];

/**
 * Detecta una descripción legible del sistema operativo y navegador actual
 */
export function detectarPlataformaDispositivo(): string {
  if (typeof window === 'undefined') return 'Servidor';
  
  const ua = window.navigator.userAgent || '';
  let os = 'PC';
  if (/windows/i.test(ua)) os = 'PC Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'Mac';
  else if (/android/i.test(ua)) os = 'Terminal Android';
  else if (/ipad|iphone|ipod/i.test(ua)) os = 'Dispositivo iOS';
  else if (/linux/i.test(ua)) os = 'Terminal Linux';

  return os;
}

/**
 * Obtiene el nombre asignado a este equipo. Si no existe, genera uno por defecto y lo almacena.
 */
export function obtenerNombreEquipo(): string {
  if (typeof window === 'undefined') return 'Terminal POS';

  try {
    const guardado = localStorage.getItem(STORAGE_KEY_EQUIPO);
    if (guardado && guardado.trim().length > 0) {
      return guardado.trim();
    }

    // Si aún no tiene nombre personalizado, generar uno amigable basado en la plataforma
    const plataforma = detectarPlataformaDispositivo();
    const defaultNombre = `${plataforma} (Caja)`;
    localStorage.setItem(STORAGE_KEY_EQUIPO, defaultNombre);
    return defaultNombre;
  } catch (error) {
    return 'Terminal POS';
  }
}

/**
 * Guarda o actualiza el nombre personalizado para este equipo en el navegador actual
 */
export function guardarNombreEquipo(nuevoNombre: string): string {
  const nombreLimpio = nuevoNombre?.trim() || 'Terminal POS';
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_EQUIPO, nombreLimpio);
      window.dispatchEvent(new CustomEvent(EVENTO_EQUIPO_CAMBIADO, { detail: nombreLimpio }));
    } catch (error) {
      console.warn('No se pudo guardar el nombre del equipo en localStorage:', error);
    }
  }
  return nombreLimpio;
}
