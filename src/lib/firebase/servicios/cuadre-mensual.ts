
'use client';

import { doc, runTransaction, Timestamp, Firestore, increment } from 'firebase/firestore';
import type { Cuenta, CuadreMensual } from '@/lib/tipos';

export interface CuadreMensualData {
  usuarioId: string;
  resumen: {
    totalIngresosEfectivo: number;
    totalIngresosTarjeta: number;
    totalCompras: number;
    totalGastos: number;
    balanceNetoCalculado: number;
    balanceLiquidado: number;
  };
  cuentas: {
    origenId: string;
    destinoId: string;
  };
  idsCuadresProcesados: string[];
  observaciones: string;
}

export async function realizarCuadreMensual(
  firestore: Firestore,
  sucursalId: string,
  data: CuadreMensualData
) {
  return runTransaction(firestore, async (transaction) => {
    // --- 1. Fase de Lectura ---
    const correlativoRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'cuadre_mensual');
    const cuentaOrigenRef = doc(firestore, `sucursales/${sucursalId}/cuentas`, data.cuentas.origenId);
    const cuentaDestinoRef = doc(firestore, `sucursales/${sucursalId}/cuentas`, data.cuentas.destinoId);

    const correlativoDoc = await transaction.get(correlativoRef);
    const cuentaOrigenDoc = await transaction.get(cuentaOrigenRef);
    const cuentaDestinoDoc = data.cuentas.origenId === data.cuentas.destinoId
      ? cuentaOrigenDoc
      : await transaction.get(cuentaDestinoRef);

    if (!cuentaOrigenDoc.exists()) throw new Error("La cuenta de origen no existe.");
    if (!cuentaDestinoDoc.exists()) throw new Error("La cuenta de destino no existe.");

    // --- 2. Fase de Procesamiento ---
    const nuevoIdCuadre = (correlativoDoc.data()?.correlativo || 0) + 1;
    const cuentaOrigenData = cuentaOrigenDoc.data() as Cuenta;
    const cuentaDestinoData = cuentaDestinoDoc.data() as Cuenta;

    const dataCuadreHistorico: CuadreMensual = {
      id: nuevoIdCuadre.toString(),
      idCuadreMensual: nuevoIdCuadre,
      fecha: Timestamp.now(),
      usuarioId: data.usuarioId,
      resumen: data.resumen,
      cuentas: {
        origenId: data.cuentas.origenId,
        origenNombre: cuentaOrigenData.nombre,
        destinoId: data.cuentas.destinoId,
        destinoNombre: cuentaDestinoData.nombre,
      },
      idsCuadresProcesados: data.idsCuadresProcesados,
      observaciones: data.observaciones,
    };

    // --- 3. Fase de Escritura ---
    const nuevoCuadreRef = doc(firestore, `sucursales/${sucursalId}/cuadre_mensual`, nuevoIdCuadre.toString());
    transaction.set(nuevoCuadreRef, dataCuadreHistorico);

    transaction.set(correlativoRef, { correlativo: nuevoIdCuadre }, { merge: true });

    // Actualizar estado de los cuadres semanales procesados
    for (const id of data.idsCuadresProcesados) {
      const cuadreSemanalRef = doc(firestore, `sucursales/${sucursalId}/cuadre_semanal`, id);
      transaction.update(cuadreSemanalRef, { estadoMensual: 'procesado' });
    }

    // Actualizar saldos de cuentas
    if (data.cuentas.origenId !== data.cuentas.destinoId && data.resumen.balanceLiquidado !== 0) {
      transaction.update(cuentaOrigenRef, { saldo: increment(-data.resumen.balanceLiquidado) });
      transaction.update(cuentaDestinoRef, { saldo: increment(data.resumen.balanceLiquidado) });
    }
  });
}
