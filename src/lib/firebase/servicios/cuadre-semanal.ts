
'use client';

import { doc, runTransaction, Timestamp, Firestore, increment } from 'firebase/firestore';
import type { Cuenta, CuadreSemanal } from '@/lib/tipos';

export interface CuadreSemanalData {
  usuarioId: string;
  resumen: {
    totalIngresosEfectivo: number;
    totalIngresosTarjeta: number;
    totalIngresosTragamonedas: number;
    totalCompras: number;
    totalGastos: number;
    balanceNetoCalculado: number;
    balanceLiquidado: number;
  };
  cuentas: {
    origenId: string;
    destinoId: string;
  };
  idsProcesados: {
    ingresosEfectivo: string[];
    ingresosTarjeta: string[];
    ingresosTragamonedas: string[];
    compras: string[];
    gastos: string[];
  };
  observaciones: string;
}

export async function realizarCuadreSemanal(
  firestore: Firestore,
  sucursalId: string,
  data: CuadreSemanalData
) {
  return runTransaction(firestore, async (transaction) => {
    // --- 1. Fase de Lectura ---
    const correlativoRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'cuadre_semanal');
    const cuentaOrigenRef = doc(firestore, `sucursales/${sucursalId}/cuentas`, data.cuentas.origenId);
    const cuentaDestinoRef = doc(firestore, `sucursales/${sucursalId}/cuentas`, data.cuentas.destinoId);

    const [correlativoDoc, cuentaOrigenDoc, cuentaDestinoDoc] = await Promise.all([
      transaction.get(correlativoRef),
      transaction.get(cuentaOrigenRef),
      data.cuentas.origenId === data.cuentas.destinoId
        ? transaction.get(cuentaOrigenRef)
        : transaction.get(cuentaDestinoRef)
    ]);
    
    if (!cuentaOrigenDoc.exists()) throw new Error("La cuenta de origen no existe.");
    if (!cuentaDestinoDoc.exists()) throw new Error("La cuenta de destino no existe.");

    // --- 2. Fase de Procesamiento ---
    const nuevoIdCuadre = (correlativoDoc.data()?.correlativo || 0) + 1;
    const cuentaOrigenData = cuentaOrigenDoc.data() as Cuenta;
    const cuentaDestinoData = cuentaDestinoDoc.data() as Cuenta;

    const dataCuadreHistorico: Omit<CuadreSemanal, 'id'> = {
      idCuadreSemanal: nuevoIdCuadre,
      fecha: Timestamp.now(),
      usuarioId: data.usuarioId,
      resumen: data.resumen,
      cuentas: {
        origenId: data.cuentas.origenId,
        origenNombre: cuentaOrigenData.nombre,
        destinoId: data.cuentas.destinoId,
        destinoNombre: cuentaDestinoData.nombre,
      },
      idsProcesados: data.idsProcesados,
      observaciones: data.observaciones,
      estadoMensual: 'pendiente',
    };

    // --- 3. Fase de Escritura ---
    
    const nuevoCuadreRef = doc(firestore, `sucursales/${sucursalId}/cuadre_semanal`, nuevoIdCuadre.toString());
    transaction.set(nuevoCuadreRef, dataCuadreHistorico);

    transaction.set(correlativoRef, { correlativo: nuevoIdCuadre }, { merge: true });

    // Actualizar estado de cierres de caja (efectivo)
    for (const id of data.idsProcesados.ingresosEfectivo) {
      const cierreRef = doc(firestore, `sucursales/${sucursalId}/cierre_caja`, id);
      transaction.update(cierreRef, { estadoEfectivo: 'procesado' });
    }

    // Actualizar estado de cierres de caja (tarjeta)
    for (const id of data.idsProcesados.ingresosTarjeta) {
      const cierreRef = doc(firestore, `sucursales/${sucursalId}/cierre_caja`, id);
      transaction.update(cierreRef, { estadoTarjeta: 'procesado' });
    }

    // Actualizar estado de cuadres de tragamonedas
    for (const id of data.idsProcesados.ingresosTragamonedas) {
      const cuadreRef = doc(firestore, `sucursales/${sucursalId}/cuadre_tragamonedas`, id);
      transaction.update(cuadreRef, { estado: 'procesado' });
    }

    // Actualizar estado de compras
    for (const id of data.idsProcesados.compras) {
      const compraRef = doc(firestore, `sucursales/${sucursalId}/compras`, id);
      transaction.update(compraRef, { estado: 'Pagado' });
    }

    // Actualizar estado de gastos
    for (const id of data.idsProcesados.gastos) {
      const gastoRef = doc(firestore, `sucursales/${sucursalId}/gastos`, id);
      transaction.update(gastoRef, { estado: 'procesado' });
    }
    
    // Actualizar saldos de cuentas si hay un balance a liquidar
    if (data.resumen.balanceLiquidado !== 0 && data.cuentas.origenId !== data.cuentas.destinoId) {
      transaction.update(cuentaOrigenRef, { saldo: increment(-data.resumen.balanceLiquidado) });
      transaction.update(cuentaDestinoRef, { saldo: increment(data.resumen.balanceLiquidado) });
    }
  });
}
