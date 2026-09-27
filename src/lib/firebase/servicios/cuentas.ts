'use client'

import {
  doc,
  runTransaction,
  deleteDoc,
  Firestore,
} from 'firebase/firestore';
import type { Cuenta } from '@/lib/tipos';

export async function guardarCuenta(
  firestore: Firestore,
  sucursalId: string,
  cuentaData: Omit<Cuenta, 'id' | 'idCuenta'>,
  idExistente?: string,
) {
  return runTransaction(firestore, async (transaction) => {
    if (idExistente) {
      // Actualizar cuenta existente
      const cuentaRef = doc(firestore, `sucursales/${sucursalId}/cuentas`, idExistente);
      transaction.update(cuentaRef, cuentaData);
      return idExistente;
    } else {
      // Crear nueva cuenta
      const correlativoRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'cuentas');
      const correlativoDoc = await transaction.get(correlativoRef);
      const nuevoId = (correlativoDoc.data()?.correlativo || 0) + 1;
      
      const nuevaCuentaRef = doc(firestore, `sucursales/${sucursalId}/cuentas`, nuevoId.toString());
      const cuentaFinal: Omit<Cuenta, 'id'> = {
        ...cuentaData,
        idCuenta: nuevoId,
      };
      
      transaction.set(nuevaCuentaRef, cuentaFinal);
      transaction.set(correlativoRef, { correlativo: nuevoId }, { merge: true });
      return nuevaCuentaRef.id;
    }
  });
}

export async function eliminarCuenta(firestore: Firestore, sucursalId: string, cuentaId: string) {
    const cuentaRef = doc(firestore, `sucursales/${sucursalId}/cuentas`, cuentaId);
    await deleteDoc(cuentaRef);
}
