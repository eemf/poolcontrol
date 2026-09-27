/**
 * @fileoverview Contiene la lógica para analizar el string de un comando de despacho rápido.
 */

export interface ComandoAnalizado {
  cantidad: number;
  nombreProducto: string;
  indicePreparacion?: number;
}


/**
 * Analiza un comando de texto y lo convierte en una estructura de datos.
 * @param comando El string del comando, ej: "2*cerveza*p1" o "-20"
 * @returns Un objeto con cantidad, nombre del producto e índice de preparación.
 */
export function analizarComando(comando: string): ComandoAnalizado {
    // Caso especial para monedas: empieza con "-"
    if (comando.startsWith('-')) {
        const cantidadStr = comando.substring(1);
        const cantidadNum = parseInt(cantidadStr, 10);
        if (!isNaN(cantidadNum) && cantidadNum > 0) {
            return { cantidad: cantidadNum, nombreProducto: 'moneda-virtual', indicePreparacion: undefined };
        }
    }

    const partes = comando.split('*').map(p => p.trim());
    let cantidad = 1;
    let nombreProducto = '';
    let indicePreparacion: number | undefined;

    // Formato: cantidad*producto...
    if (partes.length > 0 && !isNaN(parseInt(partes[0], 10))) {
        cantidad = parseInt(partes[0], 10);
        if (partes.length > 1) {
          nombreProducto = partes[1].toLowerCase();
          if (partes.length > 2 && partes[2]) {
            const prep = partes[2].toLowerCase();
            if (prep === 'p') indicePreparacion = 0;
            else if (prep.startsWith('p')) indicePreparacion = parseInt(prep.substring(1), 10) - 1;
          }
        } else {
            throw new Error('El formato del comando es incorrecto. Debe ser cantidad*producto.');
        }
    } else { // Formato: producto... (cantidad es 1)
        nombreProducto = partes[0].toLowerCase();
        if (partes.length > 1 && partes[1]) {
            const prep = partes[1].toLowerCase();
            if (prep === 'p') indicePreparacion = 0;
            else if (prep.startsWith('p')) indicePreparacion = parseInt(prep.substring(1), 10) - 1;
        }
    }


    if (!nombreProducto) {
        throw new Error('No se pudo determinar el nombre del producto en el comando.');
    }
    
    if (indicePreparacion !== undefined && isNaN(indicePreparacion)) {
        throw new Error(`El índice de preparación no es válido.`);
    }

    return { cantidad, nombreProducto, indicePreparacion };
}
