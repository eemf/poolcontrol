'use client';

import { 
  doc, 
  writeBatch, 
  collection, 
  query, 
  where, 
  getDocs, 
  Firestore 
} from 'firebase/firestore';
import type { Venta } from '@/lib/tipos';
import { validarSucursal } from './utils';

/**
 * Elimina un rango de ventas y sus pagos asociados.
 * Esta función está diseñada para tareas de mantenimiento de base de datos.
 * AHORA INCLUYE UN CALLBACK DE PROGRESO.
 */
export async function eliminarVentasPorRango(
  firestore: Firestore,
  sucursalId: string,
  desdeId: number,
  hastaId: number,
  excluirCredito: boolean,
  excluirPendientes: boolean,
  onProgress?: (porcentaje: number) => void
) {
  const sid = validarSucursal(sucursalId);
  
  // 1. Consultar ventas en el rango numérico
  const ventasRef = collection(firestore, `sucursales/${sid}/ventas`);
  const qVentas = query(
    ventasRef,
    where('idVenta', '>=', desdeId),
    where('idVenta', '<=', hastaId)
  );
  
  const ventasSnap = await getDocs(qVentas);
  let ventasParaProcesar = ventasSnap.docs.map(d => ({ docId: d.id, ...d.data() } as Venta & { docId: string }));

  // 2. Aplicar filtros de exclusión
  if (excluirCredito) {
    ventasParaProcesar = ventasParaProcesar.filter(v => v.estado !== 'credito');
  }
  if (excluirPendientes) {
    ventasParaProcesar = ventasParaProcesar.filter(v => v.estado !== 'Pendiente de pago');
  }

  const totalAProcesar = ventasParaProcesar.length;
  if (totalAProcesar === 0) return 0;

  // 3. Ejecutar eliminación por lotes (batches de máximo 500 operaciones)
  let totalBorrados = 0;
  
  // Reportar inicio
  if (onProgress) onProgress(0);

  // Procesamos en trozos pequeños para no exceder los límites de WriteBatch de Firestore
  for (let i = 0; i < ventasParaProcesar.length; i += 100) {
    const chunk = ventasParaProcesar.slice(i, i + 100);
    const batch = writeBatch(firestore);

    for (const venta of chunk) {
      // Borrar documento de la venta
      batch.delete(doc(firestore, `sucursales/${sid}/ventas`, venta.docId));

      // Buscar y borrar pagos asociados a esta venta específica
      const pagosQuery = query(
        collection(firestore, `sucursales/${sid}/pagos`),
        where('ventaDocId', '==', venta.docId)
      );
      const pagosSnap = await getDocs(pagosQuery);
      pagosSnap.docs.forEach(pDoc => batch.delete(pDoc.ref));
    }
    
    await batch.commit();
    totalBorrados += chunk.length;

    // Reportar progreso
    if (onProgress) {
        onProgress(Math.round((totalBorrados / totalAProcesar) * 100));
    }
  }

  return totalBorrados;
}
