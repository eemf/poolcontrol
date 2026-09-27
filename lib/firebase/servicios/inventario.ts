
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
    // 1. Obtener el siguiente ID para el ajuste
    const correlativoRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'ajustes_inventario');
    const correlativoDoc = await transaction.get(correlativoRef);
    const nuevoIdAjuste = (correlativoDoc.data()?.correlativo || 0) + 1;

    // 2. Preparar el documento de historial de ajuste
    const nuevoAjusteRef = doc(firestore, `sucursales/${sucursalId}/ajustes_inventario`, nuevoIdAjuste.toString());
    const ajusteParaGuardar: AjusteInventario = {
      idAjuste: nuevoIdAjuste,
      fecha: Timestamp.fromDate(data.fecha),
      usuarioId: data.usuarioId,
      observaciones: data.observaciones,
      detalles: data.detalles,
    };
    
    // 3. Poner en cola la escritura del historial
    transaction.set(nuevoAjusteRef, ajusteParaGuardar);

    // 4. Poner en cola la actualización del correlativo
    transaction.set(correlativoRef, { correlativo: nuevoIdAjuste }, { merge: true });

    // 5. Poner en cola las actualizaciones de stock y el registro de movimiento
    for (const detalle of data.detalles) {
      const productoRef = doc(firestore, `sucursales/${sucursalId}/productos`, detalle.productoId);
      transaction.update(productoRef, { existencia: detalle.existenciaFisica });
      
      await registrarMovimientoInventario(transaction, firestore, sucursalId, {
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
  });
}

    