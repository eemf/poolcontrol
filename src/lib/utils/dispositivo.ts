/**
 * Utilidad avanzada para identificar y clasificar el tipo y nombre del dispositivo
 * (Computadora, Tablet o Teléfono Celular) en operaciones y bitácora de auditoría.
 */

export type TipoDispositivo = 'computadora' | 'tablet' | 'telefono';

export interface InfoDispositivo {
  tipo: TipoDispositivo;
  nombre: string;
  so: string;
  navegador: string;
  modelo?: string;
  resolucion?: string;
}

export const STORAGE_KEY_EQUIPO = 'poolcontrol_nombre_equipo';
export const STORAGE_KEY_TIPO = 'poolcontrol_tipo_equipo';
export const EVENTO_EQUIPO_CAMBIADO = 'poolcontrol_equipo_cambiado';

export const SUGERENCIAS_EQUIPOS = [
  'Caja Principal (PC)',
  'Caja 2',
  'Barra / Mostrador',
  'Tablet Mesas 1',
  'Tablet Mesas 2',
  'Tablet Barra',
  'Teléfono Administrador',
  'Teléfono Barra',
  'Estación Juegos',
  'Laptop Oficina',
];

/**
 * Detecta de manera exhaustiva el tipo de dispositivo, sistema operativo, navegador y modelo.
 */
export function obtenerInfoDetalladaDispositivo(): InfoDispositivo {
  if (typeof window === 'undefined') {
    return {
      tipo: 'computadora',
      nombre: 'Servidor',
      so: 'Servidor',
      navegador: 'Node.js',
    };
  }

  const ua = window.navigator.userAgent || '';
  const uaLower = ua.toLowerCase();
  const maxTouch = window.navigator.maxTouchPoints || 0;
  const isTouch = maxTouch > 0 || 'ontouchstart' in window;

  const width = window.screen.width || 0;
  const height = window.screen.height || 0;
  const minDim = Math.min(width, height);
  const maxDim = Math.max(width, height);
  const resolucion = `${width}x${height}`;

  // 1. Detección de iPad (incluso en iOS 13+ donde Safari reporta MacIntel con touch)
  const isIpad = /ipad/.test(uaLower) || (window.navigator.platform === 'MacIntel' && maxTouch > 1);

  // 2. Detección de Android Tablet (Android sin la palabra "Mobile")
  const isAndroidTablet = /android/.test(uaLower) && !/mobile/.test(uaLower);

  // 3. Detección de otras Tablets conocidas
  const isOtherTablet = /(tablet|playbook|silk)/.test(uaLower);

  // 4. Detección de Teléfono Móvil
  const isMobilePhone = /iphone|ipod|mobile|phone|blackberry|iemobile|opera mini/i.test(ua);

  // Determinar Tipo de Dispositivo
  let tipo: TipoDispositivo = 'computadora';
  if (isIpad || isAndroidTablet || isOtherTablet) {
    tipo = 'tablet';
  } else if (isMobilePhone) {
    tipo = 'telefono';
  } else if (isTouch && minDim >= 600 && minDim <= 1024 && maxDim <= 1366) {
    tipo = 'tablet';
  } else {
    tipo = 'computadora';
  }

  // Determinar Sistema Operativo
  let so = 'Desconocido';
  if (isIpad) so = 'iPadOS';
  else if (/iphone|ipod/i.test(ua)) so = 'iOS';
  else if (/android/i.test(ua)) so = 'Android';
  else if (/windows/i.test(ua)) so = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) so = 'macOS';
  else if (/linux/i.test(ua)) so = 'Linux';

  // Determinar Navegador
  let navegador = 'Navegador Web';
  if (/edg/i.test(ua)) navegador = 'Edge';
  else if (/chrome|crios/i.test(ua)) navegador = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) navegador = 'Firefox';
  else if (/safari/i.test(ua)) navegador = 'Safari';
  else if (/opera|opr/i.test(ua)) navegador = 'Opera';

  // Modelo o marca sugerida
  let modelo: string | undefined = undefined;
  if (isIpad) modelo = 'iPad';
  else if (/iphone/i.test(ua)) modelo = 'iPhone';
  else if (/samsung|sm-[a-z0-9]+/i.test(ua)) modelo = 'Samsung';
  else if (/xiaomi|redmi|poco/i.test(ua)) modelo = 'Xiaomi';
  else if (/motorola|moto/i.test(ua)) modelo = 'Motorola';
  else if (/pixel/i.test(ua)) modelo = 'Google Pixel';

  // Generar nombre automático legible
  let nombreDefecto = '';
  if (tipo === 'tablet') {
    nombreDefecto = modelo === 'iPad' ? 'Tablet iPad' : (modelo ? `Tablet ${modelo}` : 'Tablet Android');
  } else if (tipo === 'telefono') {
    nombreDefecto = modelo === 'iPhone' ? 'Teléfono iPhone' : (modelo ? `Teléfono ${modelo}` : 'Teléfono Móvil');
  } else {
    nombreDefecto = `PC ${so} (Caja)`;
  }

  // Verificar si hay un nombre personalizado en localStorage
  let nombreFinal = nombreDefecto;
  try {
    const guardado = localStorage.getItem(STORAGE_KEY_EQUIPO);
    if (guardado && guardado.trim().length > 0) {
      nombreFinal = guardado.trim();
    } else {
      localStorage.setItem(STORAGE_KEY_EQUIPO, nombreDefecto);
      localStorage.setItem(STORAGE_KEY_TIPO, tipo);
    }
  } catch {}

  return {
    tipo,
    nombre: nombreFinal,
    so,
    navegador,
    modelo,
    resolucion,
  };
}

/**
 * Obtiene el nombre asignado al equipo actual.
 */
export function obtenerNombreEquipo(): string {
  const info = obtenerInfoDetalladaDispositivo();
  return info.nombre;
}

/**
 * Obtiene el tipo de dispositivo actual (computadora, tablet o telefono).
 */
export function obtenerTipoDispositivoActual(): TipoDispositivo {
  const info = obtenerInfoDetalladaDispositivo();
  return info.tipo;
}

/**
 * Guarda o actualiza el nombre personalizado para este equipo en el navegador actual.
 */
export function guardarNombreEquipo(nuevoNombre: string): string {
  const info = obtenerInfoDetalladaDispositivo();
  const nombreLimpio = nuevoNombre?.trim() || info.nombre || 'Terminal POS';
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_EQUIPO, nombreLimpio);
      localStorage.setItem(STORAGE_KEY_TIPO, info.tipo);
      window.dispatchEvent(new CustomEvent(EVENTO_EQUIPO_CAMBIADO, { 
        detail: { nombre: nombreLimpio, tipo: info.tipo } 
      }));
    } catch (error) {
      console.warn('No se pudo guardar el nombre del equipo en localStorage:', error);
    }
  }
  return nombreLimpio;
}
