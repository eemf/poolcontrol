import { doc, runTransaction, Timestamp, Firestore, collection } from 'firebase/firestore';
import type { AjusteInventario, DetalleAjusteInventario } from '@/lib/tipos';
import { registrarMovimientoInventario } from './historial-inventario';

interface AjusteInventarioData {
  fecha: Date;
  usuarioId: string;
  observaciones: string;
  detalles: DetalleAjusteInventario[];
}

export async function realizarAjusteInventario(
  firestore: Firestore,
  sucursalId: string,
  data: AjusteInventarioData
) {
  return runTransaction(firestore, async (transaction) => {
    // 1. Obtener los correlativos necesarios al inicio
    const correlativoAjusteRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'ajustes_inventario');
    const correlativoHistorialRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'historial_inventario');
    
    const [correlativoAjusteDoc, correlativoHistorialDoc] = await Promise.all([
      transaction.get(correlativoAjusteRef),
      transaction.get(correlativoHistorialRef)
    ]);

    const nuevoIdAjuste = (correlativoAjusteDoc.data()?.correlativo || 0) + 1;
    let siguienteIdHistorial = (correlativoHistorialDoc.data()?.correlativo || 0) + 1;

    // 2. Preparar el documento de historial de ajuste
    const nuevoAjusteRef = doc(firestore, `sucursales/${sucursalId}/ajustes_inventario`, nuevoIdAjuste.toString());
    const ajusteParaGuardar: Omit<AjusteInventario, 'id'> = {
      id: nuevoIdAjuste.toString(),
      idAjuste: nuevoIdAjuste,
      fecha: Timestamp.fromDate(data.fecha),
      usuarioId: data.usuarioId,
      observaciones: data.observaciones,
      detalles: data.detalles,
    };
    
    // 3. Poner en cola la escritura del historial del ajuste
    transaction.set(nuevoAjusteRef, ajusteParaGuardar);

    // 4. Poner en cola las actualizaciones de stock y el registro de movimiento
    for (const detalle of data.detalles) {
      const productoRef = doc(firestore, `sucursales/${sucursalId}/productos`, detalle.productoId);
      
      transaction.update(productoRef, { existencia: detalle.existenciaFisica });
      
      const idHistorialActual = siguienteIdHistorial++;
      registrarMovimientoInventario(transaction, firestore, sucursalId, idHistorialActual, {
        productoId: detalle.productoId,
        nombreProducto: detalle.nombreProducto,
        tipoMovimiento: 'Ajuste',
        cantidad: detalle.diferencia,
        existenciaAnterior: detalle.existenciaSistema,
        existenciaNueva: detalle.existenciaFisica,
        referencia: `Ajuste #${nuevoIdAjuste}`,
        usuarioId: data.usuarioId,
      });
    }
    
    // 5. Actualizar los correlativos al final
    transaction.set(correlativoAjusteRef, { correlativo: nuevoIdAjuste }, { merge: true });
    if (data.detalles.length > 0) {
      transaction.set(correlativoHistorialRef, { correlativo: siguienteIdHistorial - 1 }, { merge: true });
    }
  });
}
