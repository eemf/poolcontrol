import { doc, runTransaction, Timestamp, serverTimestamp, Firestore } from 'firebase/firestore';
import type { AjusteInventario, DetalleAjusteInventario } from '@/lib/tipos';
import { registrarMovimientoInventario } from './historial-inventario';
import { registrarAuditoria } from './auditoria';

interface AjusteInventarioData {
  fecha?: Date;
  usuarioId: string;
  usuarioNombre?: string;
  observaciones: string;
  tipoAjuste?: string;
  detalles: DetalleAjusteInventario[];
}

export async function realizarAjusteInventario(
  firestore: Firestore,
  sucursalId: string,
  data: AjusteInventarioData
) {
  if (!sucursalId) {
    throw new Error('No se encontró una sucursal activa para registrar la revisión.');
  }

  return runTransaction(firestore, async (transaction) => {
    // 1. Obtener los correlativos necesarios al inicio
    const correlativoAjusteRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'ajustes_inventario');
    const correlativoHistorialRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'historial_inventario');

    const [correlativoAjusteDoc, correlativoHistorialDoc] = await Promise.all([
      transaction.get(correlativoAjusteRef),
      transaction.get(correlativoHistorialRef),
    ]);

    const nuevoIdAjuste = (correlativoAjusteDoc.data()?.correlativo || 0) + 1;
    let siguienteIdHistorial = (correlativoHistorialDoc.data()?.correlativo || 0) + 1;

    // 2. Preparar el documento de historial de ajuste (guarda el estado de TODOS los productos)
    const nuevoAjusteRef = doc(firestore, `sucursales/${sucursalId}/ajustes_inventario`, nuevoIdAjuste.toString());
    const ajusteParaGuardar: Omit<AjusteInventario, 'id'> = {
      id: nuevoIdAjuste.toString(),
      idAjuste: nuevoIdAjuste,
      fecha: serverTimestamp() as unknown as Timestamp,
      usuarioId: data.usuarioId,
      observaciones: data.observaciones,
      detalles: data.detalles,
    };

    // 3. Poner en cola la escritura del historial del ajuste
    transaction.set(nuevoAjusteRef, ajusteParaGuardar);

    // 4. Actualizar stock y registrar movimiento en kardex únicamente para los productos que tuvieron modificación
    const detallesModificados = data.detalles.filter((d) => d.diferencia !== 0);

    for (const detalle of detallesModificados) {
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
    if (detallesModificados.length > 0) {
      transaction.set(correlativoHistorialRef, { correlativo: siguienteIdHistorial - 1 }, { merge: true });
    }

    registrarAuditoria(
      firestore,
      sucursalId,
      {
        usuarioId: data.usuarioId,
        categoria: 'INVENTARIO',
        accion: 'INVENTARIO_AJUSTE',
        titulo: `Revisión de inventario #${nuevoIdAjuste}`,
        descripcion: `${data.detalles.length} productos revisados (${detallesModificados.length} con ajuste). Obs: ${
          data.observaciones || 'Sin observaciones'
        }`,
        detalles: {
          idAjuste: nuevoIdAjuste,
          observaciones: data.observaciones,
          totalRevisados: data.detalles.length,
          totalModificados: detallesModificados.length,
          productosAjustados: detallesModificados.map((d) => ({
            nombre: d.nombreProducto,
            existenciaSistema: d.existenciaSistema,
            existenciaFisica: d.existenciaFisica,
            diferencia: d.diferencia,
          })),
        },
      },
      transaction
    );
  });
}
