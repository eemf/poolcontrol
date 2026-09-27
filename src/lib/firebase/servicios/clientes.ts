'use client';
import { doc, runTransaction, deleteDoc, Firestore } from 'firebase/firestore';
import type { Cliente } from '@/lib/tipos';

export async function guardarCliente(firestore: Firestore, sucursalId: string, clienteData: Omit<Cliente, 'id' | 'idcliente'>): Promise<Cliente> {
  return runTransaction(firestore, async (transaction) => {
    const correlativoRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'clientes');
    const correlativoDoc = await transaction.get(correlativoRef);
    const nuevoId = (correlativoDoc.data()?.correlativo || 0) + 1;
    
    const finalClienteRef = doc(firestore, `sucursales/${sucursalId}/clientes`, nuevoId.toString());
    const clienteFinal: Cliente = {
      ...clienteData,
      idcliente: nuevoId,
      id: finalClienteRef.id,
    };

    transaction.set(finalClienteRef, clienteFinal);
    transaction.set(correlativoRef, { correlativo: nuevoId }, { merge: true });
    return clienteFinal;
  });
}

export async function eliminarCliente(firestore: Firestore, sucursalId: string, clienteId: string) {
    const clienteRef = doc(firestore, `sucursales/${sucursalId}/clientes`, clienteId);
    await deleteDoc(clienteRef);
}
