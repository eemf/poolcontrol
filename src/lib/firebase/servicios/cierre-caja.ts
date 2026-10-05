
'use client';

import {
  doc,
  runTransaction,
  Timestamp,
  Firestore,
  collection,
  query,
  where,
  getDocs,
  limit,
  increment,
} from 'firebase/firestore';
import type { CierreCaja, Generales } from '@/lib/tipos';
import { registrarAuditoria } from './auditoria';

/**
 * Inicializa la caja por primera vez en una sucursal nueva.
 */
export async function inicializarCaja(
    firestore: Firestore,
    sucursalId: string,
    data: { efectivoInicial: number, monedasIniciales: number }
) {
    const sid = sucursalId;
    const generalesRef = doc(firestore, `sucursales/${sid}/generales`, 'actual');
    const correlativoCajaRef = doc(firestore, `sucursales/${sid}/correlativos`, 'cierre_caja');

    return runTransaction(firestore, async (transaction) => {
        const nuevosGenerales: Generales = {
            totalEfectivo: 0,
            efectivoInicial: data.efectivoInicial,
            totalMesas: 0,
            totalVentasTarjeta: 0,
            totalVentasMonedas: 0,
            fechaInicioPeriodo: Timestamp.now(),
            monedasIniciales: data.monedasIniciales,
            monedasTurnoAbierto: data.monedasIniciales,
            efectivoAcumuladoMonedas: 0,
            acumuladoMonedasTarjeta: 0,
            totalMonedasCredito: 0,
            totalMonedasTarjeta: 0,
            fechacuadretragamonedas: Timestamp.now(),
            porcentajetragamonedas: 100
        };

        transaction.set(generalesRef, nuevosGenerales);
        transaction.set(correlativoCajaRef, { correlativo: 0 }, { merge: true });
    });
}

/**
 * Realiza el cierre de caja del turno actual.
 */
export async function realizarCierreDeCaja(
    firestore: Firestore,
    sucursalId: string,
    cierreData: Omit<CierreCaja, 'id' | 'idCuadre' | 'fecha' | 'estadoEfectivo' | 'estadoTarjeta' | 'totalLiquidado' | 'totalVentaConsumo' | 'snapshotMonedas'> & { cuentaDestinoId: string }
) {
    const productosVirtualesRef = collection(firestore, `sucursales/${sucursalId}/productos_virtuales`);
    const qMonedasPorCodigo = query(productosVirtualesRef, where("codigoBusqueda", "==", "moneda-virtual"), limit(1));
    const qVentasPendientes = query(collection(firestore, `sucursales/${sucursalId}/ventas`), where("estado", "==", "Pendiente de pago"), limit(1));
    const qMesasActivas = query(collection(firestore, `sucursales/${sucursalId}/mesas_de_billar`), where("estado", "==", "ocupado"), limit(1));
    
    const [monedasPorCodigoSnap, monedasPorNombreSnap, ventasPendientesSnap, mesasActivasSnap] = await Promise.all([
        getDocs(qMonedasPorCodigo),
        getDocs(qMonedasPorNombre),
        getDocs(qVentasPendientes),
        getDocs(qMesasActivas)
    ]);

    if (!ventasPendientesSnap.empty) {
        throw new Error("No se puede realizar el cierre de caja mientras existan cuentas pendientes de pago en el Punto de Venta.");
    }

    if (!mesasActivasSnap.empty) {
        throw new Error("No se puede realizar el cierre de caja mientras existan estaciones de juego activas en la Sala de Juegos.");
    }

    let monedaVirtualDoc;
    if (!monedasPorCodigoSnap.empty) {
        monedaVirtualDoc = monedasPorCodigoSnap.docs[0].data();
    } else if (!monedasPorNombreSnap.empty) {
        monedaVirtualDoc = monedasPorNombreSnap.docs[0].data();
    } else {
        console.warn("Producto virtual 'Monedas' no encontrado. La existencia en el snapshot será 0.");
        monedaVirtualDoc = null;
    }
    const existenciaActualMonedas = monedaVirtualDoc?.existencia || 0;

    return runTransaction(firestore, async (transaction) => {
        const correlativoRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'cierre_caja');
        const generalesRef = doc(firestore, `sucursales/${sucursalId}/generales`, 'actual');
        const cuentaDestinoRef = doc(firestore, `sucursales/${sucursalId}/cuentas`, cierreData.cuentaDestinoId);
        
        const [correlativoDoc, generalesDoc, cuentaDestinoDoc] = await Promise.all([
            transaction.get(correlativoRef),
            transaction.get(generalesRef),
            transaction.get(cuentaDestinoRef),
        ]);
        
        if (!cuentaDestinoDoc.exists()) {
            throw new Error("La cuenta de destino seleccionada no existe.");
        }
        
        const generalesActual = generalesDoc.data();
        const nuevoIdCuadre = (correlativoDoc.data()?.correlativo || 0) + 1;
        const totalLiquidado = cierreData.efectivoFinalContado - cierreData.cajaSiguienteTurno;
        const nuevoEfectivoAcumuladoMonedas = (generalesActual?.efectivoAcumuladoMonedas || 0) + (generalesActual?.totalVentasMonedas || 0);
        
        const snapshotMonedas = {
            existencia: existenciaActualMonedas, // Final del periodo actual
            existenciaAlInicio: generalesActual?.monedasTurnoAbierto || generalesActual?.monedasIniciales || 0, // Inicio del periodo actual
            totalMonedasNetoPeriodo: generalesActual?.totalVentasMonedas || 0,
            efectivoAcumulado: nuevoEfectivoAcumuladoMonedas,
        };

        const nuevoCierre: CierreCaja = {
            ...cierreData,
            id: nuevoIdCuadre.toString(),
            idCuadre: nuevoIdCuadre,
            sucursalId: sucursalId,
            fecha: Timestamp.now(),
            estadoEfectivo: 'pendiente',
            totalLiquidado: totalLiquidado,
            totalVentaConsumo: generalesActual?.totalEfectivo || 0,
            pagosTarjeta: cierreData.pagosTarjeta,
            snapshotMonedas: snapshotMonedas,
        };

        if (cierreData.pagosTarjeta > 0) {
            nuevoCierre.estadoTarjeta = 'pendiente';
        }
        
        const nuevosGenerales = {
            // Campos que se reinician en cada turno
            totalEfectivo: 0,
            efectivoInicial: cierreData.cajaSiguienteTurno,
            totalMesas: 0,
            totalVentasTarjeta: 0,
            totalVentasMonedas: 0,
            fechaInicioPeriodo: Timestamp.now(),
            totalMonedasTarjeta: 0,
            
            // Campos que se mantienen o actualizan a lo largo del ciclo de máquinas
            efectivoAcumuladoMonedas: nuevoEfectivoAcumuladoMonedas,
            acumuladoMonedasTarjeta: generalesActual?.acumuladoMonedasTarjeta || 0,
            monedasIniciales: generalesActual?.monedasIniciales || 0,
            monedasTurnoAbierto: existenciaActualMonedas, // El inicio del PROXIMO turno es la existencia actual
        };

        const nuevoCierreRef = doc(firestore, `sucursales/${sucursalId}/cierre_caja`, nuevoIdCuadre.toString());
        
        transaction.set(nuevoCierreRef, nuevoCierre);
        
        transaction.set(generalesRef, nuevosGenerales, { merge: true });
        transaction.set(correlativoRef, { correlativo: nuevoIdCuadre }, { merge: true });
        
        // Solo actualizar si hay algo que liquidar
        if (totalLiquidado !== 0) {
            transaction.update(cuentaDestinoRef, { saldo: increment(totalLiquidado) });
        }

        registrarAuditoria(firestore, sucursalId, {
            usuarioId: cierreData.usuarioId || 'desconocido',
            categoria: 'CAJA',
            accion: 'CAJA_CIERRE',
            titulo: `Cierre de Caja #${nuevoIdCuadre}`,
            descripcion: `Efectivo contado: Q${cierreData.efectivoFinalContado.toFixed(2)}, Liquidado: Q${totalLiquidado.toFixed(2)}, Prox. Turno: Q${cierreData.cajaSiguienteTurno.toFixed(2)}`,
            detalles: {
                idCuadre: nuevoIdCuadre,
                efectivoContado: cierreData.efectivoFinalContado,
                totalLiquidado,
                cajaSiguienteTurno: cierreData.cajaSiguienteTurno,
                pagosTarjeta: cierreData.pagosTarjeta,
                totalVentaConsumo: generalesActual?.totalEfectivo || 0,
                cuentaDestinoId: cierreData.cuentaDestinoId
            }
        }, transaction);
    });
}

