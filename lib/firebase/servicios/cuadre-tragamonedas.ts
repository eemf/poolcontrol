
import { doc, runTransaction, Timestamp, Firestore, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import type { Generales } from '@/lib/tipos';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface MaquinaCuadre {
    id: string;
    nombre: string;
    montoManual: number;
    base: number;
    deuda: number;
    extraccion: number;
}

interface ResumenCuadre {
    totalManual: number;
    totalBase: number;
    totalDeuda: number;
    totalExtraccionNeta: number;
}

interface CuadreTragamonedasData {
    maquinas: MaquinaCuadre[];
    resumen: ResumenCuadre;
    existenciaSiguiente: number;
    efectivoAcumuladoSiguiente: number;
    gananciaATrasladar: number;
    observaciones: string;
}

export async function realizarCuadreTragamonedas(
    firestore: Firestore,
    sucursalId: string,
    data: CuadreTragamonedasData
) {
    console.log("[Cuadre Debug] Buscando producto de monedas...");
    const productosVirtualesRef = collection(firestore, `sucursales/${sucursalId}/productos_virtuales`);
    const qMonedasPorCodigo = query(productosVirtualesRef, where("codigoBusqueda", "==", "moneda-virtual"));
    const qMonedasPorNombre = query(productosVirtualesRef, where("nombre", "==", "Monedas"));

    const [monedasPorCodigoSnap, monedasPorNombreSnap] = await Promise.all([
        getDocs(qMonedasPorCodigo),
        getDocs(qMonedasPorNombre)
    ]);
    
    let monedaVirtualDocRef;

    if (!monedasPorCodigoSnap.empty) {
        monedaVirtualDocRef = monedasPorCodigoSnap.docs[0].ref;
        console.log(`[Cuadre Debug] Producto de monedas encontrado por codigoBusqueda con ID: ${monedaVirtualDocRef.id}`);
    } else if (!monedasPorNombreSnap.empty) {
        monedaVirtualDocRef = monedasPorNombreSnap.docs[0].ref;
        console.log(`[Cuadre Debug] Producto de monedas encontrado por nombre con ID: ${monedaVirtualDocRef.id}`);
    } else {
        console.error("[Cuadre Debug] ERROR: No se encontró el producto de monedas por código ('moneda-virtual') ni por nombre ('Monedas').");
        throw new Error("Producto de monedas no encontrado. Asegúrate de que exista un producto virtual con el nombre 'Monedas' o el código 'moneda-virtual'.");
    }

    return runTransaction(firestore, async (transaction) => {
        console.log("[Cuadre Debug] Iniciando transacción...");

        console.log("[Cuadre Debug] Leyendo documentos necesarios...");
        const correlativoRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'cuadre_tragamonedas');
        const generalesCajaRef = doc(firestore, `sucursales/${sucursalId}/generales`, 'actual');
        
        const [correlativoDoc, generalesCajaDoc] = await Promise.all([
            transaction.get(correlativoRef),
            transaction.get(generalesCajaRef)
        ]);
        console.log("[Cuadre Debug] Documentos leídos correctamente.");

        console.log("[Cuadre Debug] Procesando datos para la escritura...");
        const nuevoIdCuadre = (correlativoDoc.data()?.correlativo || 0) + 1;
        
        const dataCuadreHistorico = {
            idCuadre: nuevoIdCuadre,
            fecha: Timestamp.now(),
            estado: 'pendiente', 
            ...data,
        };

        const updatesGeneralesCaja: Partial<Generales> = {
            monedasIniciales: data.existenciaSiguiente,
            efectivoAcumuladoMonedas: data.efectivoAcumuladoSiguiente,
            acumuladoMonedasTarjeta: 0,
            fechacuadretragamonedas: Timestamp.now(),
        };

        console.log("[Cuadre Debug] Iniciando fase de escritura...");

        const nuevoCuadreRef = doc(firestore, `sucursales/${sucursalId}/cuadre_tragamonedas`, nuevoIdCuadre.toString());
        transaction.set(nuevoCuadreRef, dataCuadreHistorico);
        console.log(`[Cuadre Debug] Escribiendo historial de cuadre ID: ${nuevoIdCuadre}`);
        
        transaction.set(correlativoRef, { correlativo: nuevoIdCuadre }, { merge: true });
        console.log(`[Cuadre Debug] Actualizando correlativo a: ${nuevoIdCuadre}`);

        for (const maquina of data.maquinas) {
            const maquinaGeneralesRef = doc(firestore, `sucursales/${sucursalId}/generales_tragamonedas`, maquina.id);
            transaction.update(maquinaGeneralesRef, {
                totalBase: 0,
                totalDeuda: 0,
                totalExtraccion: 0,
                totalPremios: 0, // Reiniciando totalPremios también
                fechaActualizacion: Timestamp.now(),
            });
             console.log(`[Cuadre Debug] Reiniciando contadores para máquina: ${maquina.nombre} (ID: ${maquina.id})`);
        }
        
        console.log(`[Cuadre Debug] ACTUALIZANDO existencia del producto de monedas a: ${data.existenciaSiguiente}`);
        transaction.update(monedaVirtualDocRef, { existencia: data.existenciaSiguiente });

        console.log("[Cuadre Debug] Actualizando documento 'generales/actual' con nuevas monedas iniciales y efectivo acumulado.");
        transaction.set(generalesCajaRef, updatesGeneralesCaja, { merge: true });

        console.log("[Cuadre Debug] Transacción completada.");
    }).catch(error => {
        console.error("Error en transacción de cuadre de tragamonedas:", error);
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: `sucursales/${sucursalId}/`,
            operation: 'write', 
            requestResourceData: data,
          })
        );
        throw error;
    });
}
