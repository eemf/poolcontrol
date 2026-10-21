
'use client';
import { doc, runTransaction, Firestore } from 'firebase/firestore';

export async function descontarStockTemporal(firestore: Firestore, sucursalId: string, productoId: string, cantidad: number) {
  const productoRef = doc(firestore, `sucursales/${sucursalId}/productos`, productoId);
  return runTransaction(firestore, async (transaction) => {
    const productoDoc = await transaction.get(productoRef);
    if (!productoDoc.exists()) throw new Error(`Producto con ID ${productoId} no encontrado.`);
    const data = productoDoc.data();
    const existenciaActual = data.existencia ?? 0;
    const nombre = data.nombre || 'Producto';
    if (existenciaActual < cantidad) {
      throw new Error(`Stock insuficiente para "${nombre}". Existencia disponible: ${existenciaActual}, cantidad solicitada: ${cantidad}.`);
    }
    transaction.update(productoRef, { existencia: existenciaActual - cantidad });
  });
}

export async function devolverStockTemporal(firestore: Firestore, sucursalId: string, productoId: string, cantidad: number) {
  const productoRef = doc(firestore, `sucursales/${sucursalId}/productos`, productoId);
  return runTransaction(firestore, async (transaction) => {
    const productoDoc = await transaction.get(productoRef);
    if (!productoDoc.exists()) return;
    const existenciaActual = productoDoc.data().existencia || 0;
    transaction.update(productoRef, { existencia: existenciaActual + cantidad });
  });
}

export async function descontarStockVirtualTemporal(firestore: Firestore, sucursalId: string, productoId: string, cantidad: number) {
  const productoRef = doc(firestore, `sucursales/${sucursalId}/productos_virtuales`, productoId);
  return runTransaction(firestore, async (transaction) => {
    const productoDoc = await transaction.get(productoRef);
    if (!productoDoc.exists()) throw new Error(`Producto virtual con ID ${productoId} no encontrado.`);
    const data = productoDoc.data();
    const existenciaActual = data.existencia ?? 0;
    const nombre = data.nombre || 'Producto virtual';
    if (existenciaActual < cantidad) {
      throw new Error(`Stock insuficiente para "${nombre}". Existencia disponible: ${existenciaActual}, cantidad solicitada: ${cantidad}.`);
    }
    transaction.update(productoRef, { existencia: existenciaActual - cantidad });
  });
}

export async function devolverStockVirtualTemporal(firestore: Firestore, sucursalId: string, productoId: string, cantidad: number) {
  const productoRef = doc(firestore, `sucursales/${sucursalId}/productos_virtuales`, productoId);
  return runTransaction(firestore, async (transaction) => {
    const productoDoc = await transaction.get(productoRef);
    if (!productoDoc.exists()) return;
    const existenciaActual = productoDoc.data().existencia || 0;
    transaction.update(productoRef, { existencia: existenciaActual + cantidad });
  });
}
