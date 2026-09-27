
import {
  doc,
  runTransaction,
  Timestamp,
  Firestore,
} from 'firebase/firestore';

interface CierreCajaData {
    idCuadre: number;
    fecha: Timestamp;
    inicioDelPeriodo: Timestamp;
    efectivoInicial: number;
    totalIngresoMesas: number;
    totalVentaMonedas: number;
    pagosTarjeta: number;
    efectivoEsperado: number;
    efectivoFinalContado: number;
    diferencia: number;
    totalLiquidado: number; 
    totalVentaConsumo: number;
    snapshotMonedas: {
        existencia: number;
        existenciaRegistrada: number;
        efectivoAcumulado: number;
    },
    cajaSiguienteTurno: number;
    observaciones: string;
    estado: 'procesado' | 'pendiente';
}

export async function realizarCierreDeCaja(
    firestore: Firestore,
    sucursalId: string,
    cierreData: Omit<CierreCajaData, 'idCuadre' | 'fecha' | 'estado' | 'totalLiquidado' | 'totalVentaConsumo' | 'snapshotMonedas'>
) {
    return runTransaction(firestore, async (transaction) => {
        // --- 1. Fase de Lectura ---
        const correlativoRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'cierre_caja');
        const generalesRef = doc(firestore, `sucursales/${sucursalId}/generales`, 'actual');
        
        const [correlativoDoc, generalesDoc] = await Promise.all([
            transaction.get(correlativoRef),
            transaction.get(generalesRef)
        ]);
        
        const generalesActual = generalesDoc.data();

        // --- 2. Fase de Procesamiento (En Memoria) ---
        const nuevoIdCuadre = (correlativoDoc.data()?.correlativo || 0) + 1;
        
        const totalLiquidado = cierreData.efectivoFinalContado - cierreData.cajaSiguienteTurno;

        const totalVentasMonedasActual = generalesActual?.totalVentasMonedas || 0;
        const efectivoAcumuladoMonedasActual = generalesActual?.efectivoAcumuladoMonedas || 0;
        const nuevoEfectivoAcumuladoMonedas = efectivoAcumuladoMonedasActual + totalVentasMonedasActual;
        
        const snapshotMonedas = {
            existencia: generalesActual?.monedasIniciales || 0,
            existenciaRegistrada: generalesActual?.ExistenciaMonedas || 0,
            efectivoAcumulado: nuevoEfectivoAcumuladoMonedas,
        };

        const nuevoCierre: CierreCajaData = {
            ...cierreData,
            idCuadre: nuevoIdCuadre,
            fecha: Timestamp.now(),
            estado: 'pendiente',
            totalLiquidado: totalLiquidado,
            totalVentaConsumo: generalesActual?.totalEfectivo || 0,
            snapshotMonedas: snapshotMonedas,
        };
        
        const nuevosGenerales = {
            // Campos que se reinician
            totalEfectivo: 0,
            efectivoInicial: cierreData.cajaSiguienteTurno,
            totalMesas: 0,
            totalVentasTarjeta: 0,
            totalVentasMonedas: 0,
            fechaInicioPeriodo: Timestamp.now(),
            totalMonedasCredito: 0,
            totalMonedasTarjeta: 0,
            
            // Campos que se mantienen o se actualizan de forma especial
            efectivoAcumuladoMonedas: nuevoEfectivoAcumuladoMonedas,
            monedasIniciales: generalesActual?.monedasIniciales || 0,
        };

        // --- 3. Fase de Escritura ---
        const nuevoCierreRef = doc(firestore, `sucursales/${sucursalId}/cierre_caja`, nuevoIdCuadre.toString());
        
        transaction.set(nuevoCierreRef, nuevoCierre);
        transaction.set(generalesRef, nuevosGenerales, { merge: true });
        transaction.set(correlativoRef, { correlativo: nuevoIdCuadre }, { merge: true });
    });
}
