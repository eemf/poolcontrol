

import {
  collection,
  doc,
  runTransaction,
  writeBatch,
  getDoc,
  Timestamp,
  addDoc,
  updateDoc,
  deleteDoc,
  Firestore,
  query,
  where,
  getDocs,
  limit,
  DocumentReference,
  increment,
  setDoc,
} from 'firebase/firestore';
import type { Venta, Cliente, DetalleVenta, Generales, Pago, Producto, Mesa, Tarifa, ProductoVirtual, Cuenta } from '@/lib/tipos';
import { analizarComando, type ComandoAnalizado } from '@/lib/utils/analizar-comando';


// Helper para obtener el siguiente número correlativo
async function getNextCorrelative(
  transaction: any,
  firestore: Firestore,
  sucursalId: string,
  entity: string
): Promise<number> {
  const correlativoRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, entity);
  const correlativoDoc = await transaction.get(correlativoRef);
  let nextId = 1;
  if (correlativoDoc.exists()) {
    nextId = correlativoDoc.data().correlativo + 1;
  }
  // IMPORTANT: The write must happen outside this helper, in the main transaction's write phase.
  return nextId;
}

export const getFullGenerales = (data: Partial<Generales> | undefined): Generales => {
    return {
        totalEfectivo: data?.totalEfectivo ?? 0,
        efectivoInicial: data?.efectivoInicial ?? 0,
        totalMesas: data?.totalMesas ?? 0,
        totalVentasTarjeta: data?.totalVentasTarjeta ?? 0,
        totalVentasMonedas: data?.totalVentasMonedas ?? 0,
        fechaInicioPeriodo: data?.fechaInicioPeriodo ?? Timestamp.now(),
        monedasIniciales: data?.monedasIniciales ?? 0,
        efectivoAcumuladoMonedas: data?.efectivoAcumuladoMonedas ?? 0,
        totalMonedasCredito: data?.totalMonedasCredito ?? 0,
        totalMonedasTarjeta: data?.totalMonedasTarjeta ?? 0,
        fechacuadretragamonedas: data?.fechacuadretragamonedas ?? Timestamp.now(),
        porcentajetragamonedas: data?.porcentajetragamonedas ?? 100,
    };
};

const calcularCosto = (segundos: number, tarifa: Tarifa): number => {
    if (!tarifa || segundos < 0) return 0;
    const minutos = Math.floor(segundos / 60);
    if (minutos <= 0) return 0;
  
    if (tarifa.tipoDeCalculo === "Por minuto") {
      return minutos * (tarifa.costoPorMinuto || 0);
    }
  
    if (tarifa.tipoDeCalculo === "Por intervalo" && tarifa.intervalos && tarifa.intervalos.length > 0) {
        const intervalosOrdenados = [...tarifa.intervalos].sort((a, b) => b.duracionMinutos - a.duracionMinutos);
        
        let minutosRestantes = minutos;
        let costoTotal = 0;
    
        for (const intervalo of intervalosOrdenados) {
          if (minutosRestantes > 0 && intervalo.duracionMinutos > 0) {
            const numeroDeBloques = Math.floor(minutosRestantes / intervalo.duracionMinutos);
            if (numeroDeBloques > 0) {
              costoTotal += numeroDeBloques * intervalo.precio;
              minutosRestantes -= numeroDeBloques * intervalo.duracionMinutos;
            }
          }
        }
        
        if (minutosRestantes > 0) {
          const intervaloMenorAplicable = [...tarifa.intervalos]
            .sort((a, b) => a.duracionMinutos - b.duracionMinutos)
            .find(intervalo => minutosRestantes <= intervalo.duracionMinutos);
    
          if (intervaloMenorAplicable) {
            costoTotal += intervaloMenorAplicable.precio;
          } else if (intervalosOrdenados.length > 0) {
              const intervaloMasPequeno = [...tarifa.intervalos].sort((a, b) => a.duracionMinutos - b.duracionMinutos)[0];
              if (intervaloMasPequeno) {
                  costoTotal += intervaloMasPequeno.precio;
              }
          }
        }
        return costoTotal;
    }
    return 0;
};


// --- SERVICIOS DE STOCK ---

export async function descontarStockTemporal(firestore: Firestore, sucursalId: string, productoId: string, cantidad: number) {
  const productoRef = doc(firestore, `sucursales/${sucursalId}/productos`, productoId);
  return runTransaction(firestore, async (transaction) => {
    const productoDoc = await transaction.get(productoRef);
    if (!productoDoc.exists()) throw new Error(`Producto con ID ${productoId} no encontrado.`);
    const existenciaActual = productoDoc.data().existencia || 0;
    if (existenciaActual < cantidad) throw new Error(`Stock insuficiente para ${productoDoc.data().nombre}.`);
    transaction.update(productoRef, { existencia: existenciaActual - cantidad });
  });
}

export async function devolverStockTemporal(firestore: Firestore, sucursalId: string, productoId: string, cantidad: number) {
  const productoRef = doc(firestore, `sucursales/${sucursalId}/productos`, productoId);
  return runTransaction(firestore, async (transaction) => {
    const productoDoc = await transaction.get(productoRef);
    if (!productoDoc.exists()) {
        console.warn(`Se intentó devolver stock a un producto no existente (ID: ${productoId}). Se omitirá.`);
        return;
    };
    const existenciaActual = productoDoc.data().existencia || 0;
    transaction.update(productoRef, { existencia: existenciaActual + cantidad });
  });
}

export async function descontarStockVirtualTemporal(firestore: Firestore, sucursalId: string, productoId: string, cantidad: number) {
  const productoRef = doc(firestore, `sucursales/${sucursalId}/productos_virtuales`, productoId);
  return runTransaction(firestore, async (transaction) => {
    const productoDoc = await transaction.get(productoRef);
    if (!productoDoc.exists()) throw new Error(`Producto virtual con ID ${productoId} no encontrado.`);
    const existenciaActual = productoDoc.data().existencia || 0;
    if (existenciaActual < cantidad) throw new Error(`Stock virtual insuficiente para ${productoDoc.data().nombre}.`);
    transaction.update(productoRef, { existencia: existenciaActual - cantidad });
  });
}

export async function devolverStockVirtualTemporal(firestore: Firestore, sucursalId: string, productoId: string, cantidad: number) {
  const productoRef = doc(firestore, `sucursales/${sucursalId}/productos_virtuales`, productoId);
  return runTransaction(firestore, async (transaction) => {
    const productoDoc = await transaction.get(productoRef);
    if (!productoDoc.exists()) {
        console.warn(`Se intentó devolver stock a un producto virtual no existente (ID: ${productoId}). Se omitirá.`);
        return;
    };
    const existenciaActual = productoDoc.data().existencia || 0;
    transaction.update(productoRef, { existencia: existenciaActual + cantidad });
  });
}


// --- SERVICIOS DE VENTA ---

export async function guardarVentaYActualizarStock(
  firestore: Firestore,
  sucursalId: string,
  ventaId: string | null,
  ventaData: Omit<Venta, 'id' | 'idVenta' | 'fecha' | 'total' | 'saldo' | 'estado' | 'metodoPago'>
) {
    return runTransaction(firestore, async (transaction) => {
        // --- 1. FASE DE LECTURA (READS FIRST) ---
        const correlativoVentaRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, "ventas");
        const correlativoDetalleRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, "ventas_detalles");
        let ventaExistenteSnap;
        if (ventaId) {
          const ventaRef = doc(firestore, `sucursales/${sucursalId}/ventas`, ventaId);
          ventaExistenteSnap = await transaction.get(ventaRef);
          if (!ventaExistenteSnap.exists()) throw new Error("La venta que intentas actualizar no existe.");
        }
        const correlativoVentaDoc = await transaction.get(correlativoVentaRef);
        const correlativoDetalleDoc = await transaction.get(correlativoDetalleRef);
        
        // --- 2. FASE DE PROCESAMIENTO (IN-MEMORY) ---
        const ventaExistente = ventaExistenteSnap?.data() as Venta | undefined;

        const siguienteIdVenta = correlativoVentaDoc.exists() ? correlativoVentaDoc.data().correlativo + 1 : 1;
        let siguienteIdDetalle = correlativoDetalleDoc.exists() ? correlativoDetalleDoc.data().correlativo + 1 : 1;

        const idVentaFinal = ventaExistente ? ventaExistente.idVenta : siguienteIdVenta;

        const detallesProcesados = ventaData.detalles.map(d => {
            const idDetalle = d.idDetalle === 0 ? siguienteIdDetalle++ : d.idDetalle;
            return {
                ...d,
                idDetalle,
                subtotal: d.subtotal ?? 0,
                saldo: d.saldo ?? d.subtotal ?? 0,
                pagadoEfectivo: d.pagadoEfectivo ?? 0,
                pagadoTarjeta: d.pagadoTarjeta ?? 0,
                metodoPago: d.metodoPago ?? null,
                estado: d.estado ?? 'Pendiente de pago',
            } as DetalleVenta;
        });

        const totalVenta = detallesProcesados.reduce((acc, item) => acc + item.subtotal, 0);
        const saldoVenta = detallesProcesados.reduce((acc, item) => acc + item.saldo, 0);
        const estadoVenta = saldoVenta < 0.01 ? 'Pagada' : 'Pendiente de pago';

        const ventaCompleta: Omit<Venta, 'id'> = {
            ...ventaData,
            idVenta: idVentaFinal,
            fecha: ventaExistente ? ventaExistente.fecha : Timestamp.now(),
            detalles: detallesProcesados,
            total: totalVenta,
            saldo: saldoVenta,
            estado: estadoVenta,
            metodoPago: ventaExistente?.metodoPago ?? null,
        };

        // --- 3. FASE DE ESCRITURA (WRITES LAST) ---
        const docIdFinal = ventaId ?? idVentaFinal.toString();
        const ventaRef = doc(firestore, `sucursales/${sucursalId}/ventas`, docIdFinal);

        if (ventaExistente) {
            transaction.update(ventaRef, ventaCompleta);
        } else {
            transaction.set(ventaRef, ventaCompleta);
            transaction.set(correlativoVentaRef, { correlativo: siguienteIdVenta }, { merge: true });
        }

        const ultimoIdDetalleUsado = siguienteIdDetalle - 1;
        if (ultimoIdDetalleUsado > (correlativoDetalleDoc.data()?.correlativo || 0)) {
            transaction.set(correlativoDetalleRef, { correlativo: ultimoIdDetalleUsado }, { merge: true });
        }

        return { ventaId: docIdFinal, idVenta: idVentaFinal };
    });
}



export async function cancelarVentaYDevolverStock(firestore: Firestore, sucursalId: string, ventaId: string | null, itemsADevolver: DetalleVenta[]) {
    const batch = writeBatch(firestore);

    for (const item of itemsADevolver) {
        if (item.idProducto !== 'item-manual') {
          if (item.esVirtual) {
            const productoRef = doc(firestore, `sucursales/${sucursalId}/productos_virtuales`, item.idProducto);
            const productoDoc = await getDoc(productoRef);
            if (productoDoc.exists()) {
                const existenciaActual = productoDoc.data().existencia || 0;
                batch.update(productoRef, { existencia: existenciaActual + item.cantidad });
            }
          } else {
            const productoRef = doc(firestore, `sucursales/${sucursalId}/productos`, item.idProducto);
            const productoDoc = await getDoc(productoRef);
            if (productoDoc.exists()) {
                const existenciaActual = productoDoc.data().existencia || 0;
                batch.update(productoRef, { existencia: existenciaActual + item.cantidad });
            }
          }
            
            if (item.ingredientesConsumidos) {
                for (const ingrediente of item.ingredientesConsumidos) {
                    const ingredienteRef = doc(firestore, `sucursales/${sucursalId}/productos`, ingrediente.productoId);
                    const ingredienteDoc = await getDoc(ingredienteRef);
                     if (ingredienteDoc.exists()) {
                        const existenciaActualIng = ingredienteDoc.data().existencia ?? 0;
                        batch.update(ingredienteRef, { existencia: existenciaActualIng + (ingrediente.cantidad * item.cantidad) });
                    }
                }
            }
        }
    }

    if (ventaId) {
        // Si la venta existía, la eliminamos
        const ventaRef = doc(firestore, `sucursales/${sucursalId}/ventas`, ventaId);
        batch.delete(ventaRef);
    }

    await batch.commit();
}


// --- SERVICIOS DE PAGO Y CRÉDITO ---

export async function registrarAbonoACuenta(
  firestore: Firestore,
  sucursalId: string,
  ventaId: string,
  montoAbono: number,
  usuarioId: string
) {
    if (!usuarioId) throw new Error("Se requiere un ID de usuario para registrar un abono.");
    
    return runTransaction(firestore, async (transaction) => {
        const generalesRef = doc(firestore, `sucursales/${sucursalId}/generales`, "actual");
        const ventaRef = doc(firestore, `sucursales/${sucursalId}/ventas`, ventaId);
        const correlativoPagosRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'pagos');

        const [ventaDoc, generalesDoc, correlativoDoc] = await Promise.all([
            transaction.get(ventaRef),
            transaction.get(generalesRef),
            transaction.get(correlativoPagosRef)
        ]);

        if (!ventaDoc.exists()) throw new Error("La venta no existe.");

        const venta = ventaDoc.data() as Venta;
        if (montoAbono > venta.saldo) {
            throw new Error(`El abono (Q${montoAbono.toFixed(2)}) no puede ser mayor al saldo pendiente (Q${venta.saldo.toFixed(2)}).`);
        }
        
        let abonoRestante = montoAbono;
        let abonoAplicadoAMonedas = 0;
        let abonoAplicadoAOtros = 0;
        const itemsSaldados: Pago['itemsSaldados'] = [];
        
        const detallesOriginales = venta.detalles;
        const detallesActualizadosMap = new Map<number, DetalleVenta>();
        detallesOriginales.forEach(d => detallesActualizadosMap.set(d.idDetalle, {...d}));

        const detallesPendientes = detallesOriginales.filter(d => d.saldo > 0);
        const detallesMonedas = detallesPendientes.filter(d => d.esVirtual).sort((a, b) => new Date(a.fechaAgregado as string).getTime() - new Date(b.fechaAgregado as string).getTime());
        const detallesConsumo = detallesPendientes.filter(d => !d.esVirtual).sort((a, b) => new Date(a.fechaAgregado as string).getTime() - new Date(b.fechaAgregado as string).getTime());
        
        const aplicarAbono = (detalle: DetalleVenta) => {
            if (abonoRestante <= 0) return detalle;

            const montoAAplicar = Math.min(detalle.saldo, abonoRestante);
            
            if (detalle.esVirtual) {
                abonoAplicadoAMonedas += montoAAplicar;
            } else {
                abonoAplicadoAOtros += montoAAplicar;
            }

            itemsSaldados.push({
                idDetalle: detalle.idDetalle,
                nombreProducto: detalle.nombreProducto,
                montoAplicado: montoAAplicar,
            });

            const nuevoSaldoDetalle = detalle.saldo - montoAAplicar;
            abonoRestante -= montoAAplicar;

            const yaPagadoConTarjeta = (detalle.pagadoTarjeta ?? 0) > 0;
            const metodoPagoItem = yaPagadoConTarjeta ? 'Mixto' : 'Efectivo';
            
            return {
                ...detalle,
                saldo: nuevoSaldoDetalle,
                pagadoEfectivo: (detalle.pagadoEfectivo || 0) + montoAAplicar,
                estado: nuevoSaldoDetalle < 0.01 ? 'Pagada' : 'Pendiente de pago',
                metodoPago: nuevoSaldoDetalle < 0.01 ? metodoPagoItem : detalle.metodoPago,
            } as DetalleVenta;
        };

        detallesMonedas.forEach(d => {
            const detalleOriginal = detallesActualizadosMap.get(d.idDetalle);
            if (detalleOriginal) {
                detallesActualizadosMap.set(d.idDetalle, aplicarAbono(detalleOriginal));
            }
        });
        detallesConsumo.forEach(d => {
             if (abonoRestante > 0) {
                const detalleOriginal = detallesActualizadosMap.get(d.idDetalle);
                if (detalleOriginal) {
                    detallesActualizadosMap.set(d.idDetalle, aplicarAbono(detalleOriginal));
                }
            }
        });


        const detallesFinales = detallesOriginales.map(original => 
            detallesActualizadosMap.get(original.idDetalle) || original
        );

        const nuevoSaldoTotal = detallesFinales.reduce((acc, item) => acc + item.saldo, 0);
        const ventaFinalizada = nuevoSaldoTotal < 0.01;

        const dataUpdateVenta: Partial<Venta> = {
            saldo: nuevoSaldoTotal,
            detalles: detallesFinales,
            estado: ventaFinalizada ? 'Pagada' : venta.estado,
        };
        
        if (ventaFinalizada) {
             const metodosDePago = new Set(detallesFinales.filter(d => d.estado === 'Pagada').map(d => d.metodoPago));
             if (metodosDePago.size > 1 || metodosDePago.has('Mixto')) {
                 dataUpdateVenta.metodoPago = 'Mixto';
             } else if (metodosDePago.size === 1) {
                 dataUpdateVenta.metodoPago = metodosDePago.values().next().value;
             }
        }
        
        transaction.update(ventaRef, dataUpdateVenta);

        // Actualizar generales
        const generalesActual = getFullGenerales(generalesDoc.data());
        const nuevosGenerales: Partial<Generales> = {};
        if (abonoAplicadoAOtros > 0) {
            nuevosGenerales.totalEfectivo = (generalesActual.totalEfectivo || 0) + abonoAplicadoAOtros;
        }
        if (abonoAplicadoAMonedas > 0) {
            nuevosGenerales.totalVentasMonedas = (generalesActual.totalVentasMonedas || 0) + abonoAplicadoAMonedas;
        }
        
        if(Object.keys(nuevosGenerales).length > 0) {
            transaction.set(generalesRef, nuevosGenerales, { merge: true });
        }
        
        // Registrar el pago
        const nuevoIdPago = (correlativoDoc.data()?.correlativo || 0) + 1;
        const nuevoPagoRef = doc(firestore, `sucursales/${sucursalId}/pagos`, nuevoIdPago.toString());
        const pagoData: Omit<Pago, 'id'> = {
            idPago: nuevoIdPago,
            fecha: Timestamp.now(),
            idVenta: venta.idVenta,
            ventaDocId: ventaId,
            clienteNombre: venta.nombreCliente,
            montoTotalPagado: montoAbono,
            metodoPago: 'Efectivo',
            usuarioId,
            itemsSaldados,
        };
        transaction.set(nuevoPagoRef, pagoData);
        transaction.set(correlativoPagosRef, { correlativo: nuevoIdPago }, { merge: true });

        return { success: true };
    });
}


export async function procesarPagoVenta(
  firestore: Firestore, 
  sucursalId: string, 
  ventaId: string, 
  detalleIds: number[],
  metodoDePago: 'Efectivo' | 'Tarjeta',
  usuarioId: string
) {
    if (!usuarioId) throw new Error("Se requiere un ID de usuario para registrar el pago.");

    return runTransaction(firestore, async (transaction) => {
        const generalesRef = doc(firestore, `sucursales/${sucursalId}/generales`, 'actual');
        const ventaRef = doc(firestore, `sucursales/${sucursalId}/ventas`, ventaId);
        const correlativoPagosRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'pagos');
        
        const [generalesDoc, ventaDoc, correlativoDoc] = await Promise.all([
        transaction.get(generalesRef),
        transaction.get(ventaRef),
        transaction.get(correlativoPagosRef)
        ]);
        
        if (!ventaDoc.exists()) throw new Error("Venta no encontrada.");
        
        const venta = ventaDoc.data() as Venta;
        const generalesActual = getFullGenerales(generalesDoc.data());
        
        let totalPagoEfectivoConsumo = 0;
        let totalPagoEfectivoMonedas = 0;
        let totalPagoTarjetaMonedas = 0;
        let totalPagoTarjetaConsumo = 0;

        const itemsSaldados: Pago['itemsSaldados'] = [];
        
        const nuevosDetalles = venta.detalles.map(detalle => {
            if (detalleIds.includes(detalle.idDetalle) && detalle.estado === 'Pendiente de pago') {
                const montoAPagar = detalle.saldo;
                
                itemsSaldados.push({
                    idDetalle: detalle.idDetalle,
                    nombreProducto: detalle.nombreProducto,
                    montoAplicado: montoAPagar
                });

                let pagadoEfectivoActualizado = detalle.pagadoEfectivo || 0;
                let pagadoTarjetaActualizado = detalle.pagadoTarjeta || 0;

                if (metodoDePago === 'Tarjeta') {
                    pagadoTarjetaActualizado += montoAPagar;
                    if (detalle.esVirtual) {
                        totalPagoTarjetaMonedas += montoAPagar;
                    } else {
                        totalPagoTarjetaConsumo += montoAPagar;
                    }
                } else { // Efectivo
                    pagadoEfectivoActualizado += montoAPagar;
                    if (detalle.esVirtual) {
                        totalPagoEfectivoMonedas += montoAPagar;
                    } else {
                        totalPagoEfectivoConsumo += montoAPagar;
                    }
                }
                
                let metodoPagoFinalItem: DetalleVenta['metodoPago'] = metodoDePago;
                if (pagadoEfectivoActualizado > 0 && pagadoTarjetaActualizado > 0) {
                    metodoPagoFinalItem = 'Mixto';
                }

                return { 
                    ...detalle, 
                    estado: 'Pagada' as const, 
                    saldo: 0, 
                    pagadoEfectivo: pagadoEfectivoActualizado,
                    pagadoTarjeta: pagadoTarjetaActualizado,
                    metodoPago: metodoPagoFinalItem,
                };
            }
            return detalle;
        });

        const nuevoSaldo = nuevosDetalles.reduce((acc, item) => acc + item.saldo, 0);
        const ventaFinalizada = nuevoSaldo < 0.01;
        
        const dataUpdateVenta: Partial<Venta> = {
            detalles: nuevosDetalles,
            saldo: nuevoSaldo,
            estado: ventaFinalizada ? 'Pagada' : venta.estado,
        };
        
        if (ventaFinalizada) {
            const metodosDePago = new Set(nuevosDetalles.filter(d => d.estado === 'Pagada').map(d => d.metodoPago));
            if (metodosDePago.has('Mixto') || metodosDePago.size > 1) {
                dataUpdateVenta.metodoPago = 'Mixto';
            } else if (metodosDePago.size === 1) {
                dataUpdateVenta.metodoPago = metodosDePago.values().next().value;
            }
        }

        transaction.update(ventaRef, dataUpdateVenta);
        
        const camposGeneralesUpdate: Partial<Generales> = {};
        if (totalPagoEfectivoConsumo > 0) {
            camposGeneralesUpdate.totalEfectivo = (generalesActual.totalEfectivo || 0) + totalPagoEfectivoConsumo;
        }
        if (totalPagoEfectivoMonedas > 0) {
            camposGeneralesUpdate.totalVentasMonedas = (generalesActual.totalVentasMonedas || 0) + totalPagoEfectivoMonedas;
        }
        if (totalPagoTarjetaConsumo > 0) {
            camposGeneralesUpdate.totalVentasTarjeta = (generalesActual.totalVentasTarjeta || 0) + totalPagoTarjetaConsumo;
        }
        if (totalPagoTarjetaMonedas > 0) {
            camposGeneralesUpdate.totalMonedasTarjeta = (generalesActual.totalMonedasTarjeta || 0) + totalPagoTarjetaMonedas;
        }
        
        if(Object.keys(camposGeneralesUpdate).length > 0) {
            transaction.set(generalesRef, camposGeneralesUpdate, { merge: true });
        }

        if (itemsSaldados.length > 0) {
            const nuevoIdPago = (correlativoDoc.data()?.correlativo || 0) + 1;
            const nuevoPagoRef = doc(firestore, `sucursales/${sucursalId}/pagos`, nuevoIdPago.toString());
            const pagoData: Omit<Pago, 'id'> = {
                idPago: nuevoIdPago,
                fecha: Timestamp.now(),
                idVenta: venta.idVenta,
                ventaDocId: ventaId,
                clienteNombre: venta.nombreCliente,
                montoTotalPagado: totalPagoEfectivoConsumo + totalPagoEfectivoMonedas + totalPagoTarjetaConsumo + totalPagoTarjetaMonedas,
                metodoPago: metodoDePago,
                usuarioId,
                itemsSaldados,
            };
            transaction.set(nuevoPagoRef, pagoData);
            transaction.set(correlativoPagosRef, { correlativo: nuevoIdPago }, { merge: true });
        }
        
        return { success: true };
    });
}

export async function pasarVentaACredito(firestore: Firestore, sucursalId: string, ventaId: string) {
    return runTransaction(firestore, async (transaction) => {
        const ventaRef = doc(firestore, `sucursales/${sucursalId}/ventas`, ventaId);
        const generalesRef = doc(firestore, `sucursales/${sucursalId}/generales`, "actual");

        const [ventaDoc, generalesDoc] = await Promise.all([
            transaction.get(ventaRef),
            transaction.get(generalesRef)
        ]);

        if (!ventaDoc.exists()) throw new Error("La venta a mover a crédito no existe.");
        
        const venta = ventaDoc.data() as Venta;
        const saldoMonedas = venta.detalles.filter(d => d.esVirtual).reduce((acc, item) => acc + item.saldo, 0);

        if (saldoMonedas > 0) {
            const generalesActual = getFullGenerales(generalesDoc.data());
            transaction.update(generalesRef, {
                totalMonedasCredito: (generalesActual.totalMonedasCredito || 0) + saldoMonedas
            });
        }
        
        transaction.update(ventaRef, { estado: 'credito' });
    });
}

export async function liquidarVentaACredito(firestore: Firestore, sucursalId: string, ventaId: string) {
    return runTransaction(firestore, async (transaction) => {
        const ventaRef = doc(firestore, `sucursales/${sucursalId}/ventas`, ventaId);
        const generalesRef = doc(firestore, `sucursales/${sucursalId}/generales`, "actual");
        
        console.log(`[DEBUG Liquidación Crédito] Iniciando liquidación para venta ID: ${ventaId}`);

        const [ventaDoc, generalesDoc] = await Promise.all([
          transaction.get(ventaRef),
          transaction.get(generalesRef)
        ]);

        if (!ventaDoc.exists()) {
            throw new Error("La venta a crédito no existe.");
        }
        
        const venta = ventaDoc.data() as Venta;
        console.log("[DEBUG Liquidación Crédito] Venta data:", venta);

        const saldoMonedasOriginal = venta.detalles
          .filter(d => d.esVirtual)
          .reduce((acc, item) => acc + item.saldo, 0);
        
        const saldoConsumoOriginal = venta.detalles
          .filter(d => !d.esVirtual)
          .reduce((acc, item) => acc + item.saldo, 0);
        
        console.log(`[DEBUG Liquidación Crédito] Saldo Monedas: ${saldoMonedasOriginal}, Saldo Consumo: ${saldoConsumoOriginal}`);

        const generalesActual = getFullGenerales(generalesDoc.data());
        console.log("[DEBUG Liquidación Crédito] Generales ANTES:", generalesActual);

        const updatesGenerales: Partial<Generales> = {
            totalVentasMonedas: (generalesActual.totalVentasMonedas || 0) + saldoMonedasOriginal,
            totalEfectivo: (generalesActual.totalEfectivo || 0) + saldoConsumoOriginal,
            totalMonedasCredito: (generalesActual.totalMonedasCredito || 0) - saldoMonedasOriginal,
        };
        
        console.log("[DEBUG Liquidación Crédito] Objeto de actualización para Generales:", updatesGenerales);

        transaction.set(generalesRef, updatesGenerales, { merge: true });
        transaction.update(ventaRef, { estado: 'Pagada', saldo: 0, metodoPago: 'Mixto' });

        console.log("[DEBUG Liquidación Crédito] Transacción preparada para commit.");

        return { success: true };
    });
}


export async function liquidarComoConsumoInterno(firestore: Firestore, sucursalId: string, ventaId: string) {
    const ventaRef = doc(firestore, `sucursales/${sucursalId}/ventas`, ventaId);
    await updateDoc(ventaRef, { estado: 'Pagada', saldo: 0, metodoPago: 'Mixto' }); // Asumimos Mixto para consumo interno
}


// --- SERVICIOS DE CLIENTE ---

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


// --- SERVICIO DE CUENTAS ---

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


// --- SERVICIO DE COBRO DE MESA ---

const formatTime = (seconds: number = 0) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

export async function procesarVentaTiempoDeMesa(
    firestore: Firestore,
    sucursalId: string,
    mesa: Mesa,
    usuarioId: string,
    costoAlquiler: number
) {
    const consumos = mesa.consumos || [];
    const costoTotalConsumo = consumos.reduce((sum, item: any) => sum + item.total, 0);
    const costoTotal = costoAlquiler + costoTotalConsumo;

    if (costoTotal <= 0) {
        const mesaRef = doc(firestore, `sucursales/${sucursalId}/mesas_de_billar`, mesa.id);
        await updateDoc(mesaRef, {
            estado: 'disponible',
            horaInicio: null,
            modoJuego: null,
            tiempoDefinido: null,
            alquilerPagado: false,
            consumos: [],
            montoACobrar: null,
            ajustesDeTiempo: [],
        });
        return;
    }

    return runTransaction(firestore, async (transaction) => {
        // --- LECTURA ---
        const correlativoVentaRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'ventas');
        const correlativoPagoRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'pagos');
        const correlativoDetalleRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'ventas_detalles');
        const generalesRef = doc(firestore, `sucursales/${sucursalId}/generales`, 'actual');
        const mesaRef = doc(firestore, `sucursales/${sucursalId}/mesas_de_billar`, mesa.id);

        const [corrVentaDoc, corrPagoDoc, corrDetalleDoc, generalesDoc] = await Promise.all([
            transaction.get(correlativoVentaRef),
            transaction.get(correlativoPagoRef),
            transaction.get(correlativoDetalleRef),
            transaction.get(generalesRef)
        ]);

        // --- PROCESAMIENTO ---
        let nuevoIdVenta = (corrVentaDoc.data()?.correlativo || 0) + 1;
        const nuevoIdPago = (corrPagoDoc.data()?.correlativo || 0) + 1;
        let siguienteIdDetalle = (corrDetalleDoc.data()?.correlativo || 0) + 1;

        const detallesVenta: DetalleVenta[] = [];

        // Agregar ítem de alquiler si aplica
        if (costoAlquiler > 0) {
            const tiempoJugadoMs = mesa.horaInicio ? Date.now() - (mesa.horaInicio as Timestamp).toMillis() : 0;
            const tiempoJugadoStr = formatTime(tiempoJugadoMs / 1000);
            const nombreProductoAlquiler = `Tiempo en Mesa #${mesa.numeroMesa} (${tiempoJugadoStr})`;
            detallesVenta.push({
                idDetalle: siguienteIdDetalle++,
                idProducto: `mesa-${mesa.id}`,
                nombreProducto: nombreProductoAlquiler,
                cantidad: 1,
                precioUnitario: costoAlquiler,
                subtotal: costoAlquiler,
                saldo: 0,
                pagadoEfectivo: costoAlquiler,
                pagadoTarjeta: 0,
                metodoPago: 'Efectivo',
                estado: 'Pagada',
                fechaAgregado: Timestamp.now(),
            });
        }

        // Agregar ítems de consumo
        consumos.forEach((item: any) => {
            detallesVenta.push({
                idDetalle: siguienteIdDetalle++,
                idProducto: item.productoId,
                nombreProducto: item.nombreProducto,
                cantidad: item.cantidad,
                precioUnitario: item.precioUnitario,
                subtotal: item.total,
                saldo: 0,
                pagadoEfectivo: item.total,
                pagadoTarjeta: 0,
                metodoPago: 'Efectivo',
                estado: 'Pagada',
                fechaAgregado: item.fechaAgregado instanceof Timestamp ? item.fechaAgregado : Timestamp.fromDate(new Date(item.fechaAgregado)),
                ingredientesConsumidos: item.ingredientesConsumidos || [],
            });
        });

        const ventaData: Omit<Venta, 'id'> = {
            idVenta: nuevoIdVenta,
            fecha: Timestamp.now(),
            clienteId: '0', 
            nombreCliente: 'Venta Rápida',
            total: costoTotal,
            saldo: 0,
            tipoVenta: 'POS',
            metodoPago: 'Efectivo',
            estado: 'Pagada',
            detalles: detallesVenta,
        };

        const pagoData: Omit<Pago, 'id'> = {
            idPago: nuevoIdPago,
            fecha: Timestamp.now(),
            idVenta: nuevoIdVenta,
            ventaDocId: nuevoIdVenta.toString(),
            clienteNombre: 'Venta Rápida',
            montoTotalPagado: costoTotal,
            metodoPago: 'Efectivo',
            usuarioId,
            itemsSaldados: detallesVenta.map(d => ({ idDetalle: d.idDetalle, nombreProducto: d.nombreProducto, montoAplicado: d.subtotal })),
        };

        // --- ESCRITURA ---
        transaction.set(doc(firestore, `sucursales/${sucursalId}/ventas`, nuevoIdVenta.toString()), ventaData);
        transaction.set(doc(firestore, `sucursales/${sucursalId}/pagos`, nuevoIdPago.toString()), pagoData);
        
        transaction.update(generalesRef, {
            totalMesas: (generalesDoc.data()?.totalMesas || 0) + costoAlquiler,
            totalEfectivo: (generalesDoc.data()?.totalEfectivo || 0) + costoTotalConsumo
        });

        transaction.update(mesaRef, {
            estado: 'disponible', horaInicio: null, modoJuego: null,
            tiempoDefinido: null, alquilerPagado: false, consumos: [], clienteId: null, nombreCliente: null,
            ajustesDeTiempo: [], horaFin: null, montoACobrar: null
        });

        transaction.set(correlativoVentaRef, { correlativo: nuevoIdVenta }, { merge: true });
        transaction.set(correlativoPagoRef, { correlativo: nuevoIdPago }, { merge: true });
        transaction.set(correlativoDetalleRef, { correlativo: siguienteIdDetalle - 1 }, { merge: true });
    });
}


// --- VENTA RÁPIDA ---

export async function procesarVentaRapidaConId(
  firestore: Firestore,
  sucursalId: string,
  usuarioId: string,
  comando: ComandoAnalizado,
  productoId: string,
  productoData: Producto | ProductoVirtual,
  esVirtual: boolean
) {
    
    const productoRef = doc(firestore, `sucursales/${sucursalId}/${esVirtual ? 'productos_virtuales' : 'productos'}`, productoId);

    return runTransaction(firestore, async (transaction) => {
        const [productoDoc, generalesDoc, corrVentaDoc, corrPagoDoc, corrDetalleDoc] = await Promise.all([
            transaction.get(productoRef),
            transaction.get(doc(firestore, `sucursales/${sucursalId}/generales`, 'actual')),
            transaction.get(doc(firestore, `sucursales/${sucursalId}/correlativos`, 'ventas')),
            transaction.get(doc(firestore, `sucursales/${sucursalId}/correlativos`, 'pagos')),
            transaction.get(doc(firestore, `sucursales/${sucursalId}/correlativos`, 'ventas_detalles'))
        ]);

        if (!productoDoc.exists()) {
            throw new Error(`El producto ya no se encuentra disponible.`);
        }
        
        const productoDataTx = productoDoc.data() as Producto | ProductoVirtual;
        const generalesActual = getFullGenerales(generalesDoc.data());
        
        let nombreVenta = productoDataTx.nombre;
        let precioUnitario = productoDataTx.precioVenta;
        
        if (esVirtual) {
            if ((productoDataTx as ProductoVirtual).existencia < comando.cantidad) {
                throw new Error(`Stock insuficiente de monedas virtuales. Actual: ${(productoDataTx as ProductoVirtual).existencia}`);
            }
        } else if ('existencia' in productoDataTx && (productoDataTx.existencia ?? 0) < comando.cantidad) {
            throw new Error(`Stock insuficiente para ${productoDataTx.nombre}.`);
        }
        
        const totalVenta = comando.cantidad * precioUnitario;
        const nuevoIdVenta = (corrVentaDoc.data()?.correlativo || 0) + 1;
        const nuevoIdPago = (corrPagoDoc.data()?.correlativo || 0) + 1;
        const nuevoIdDetalle = (corrDetalleDoc.data()?.correlativo || 0) + 1;

        const detalle: DetalleVenta = {
            idDetalle: nuevoIdDetalle, idProducto: productoId, nombreProducto: nombreVenta,
            cantidad: comando.cantidad, precioUnitario, subtotal: totalVenta, saldo: 0,
            pagadoEfectivo: totalVenta, pagadoTarjeta: 0, metodoPago: 'Efectivo',
            estado: 'Pagada', fechaAgregado: Timestamp.now(),
            esVirtual: esVirtual,
        };
        
        const ventaData: Omit<Venta, 'id'> = {
            idVenta: nuevoIdVenta, fecha: Timestamp.now(),
            clienteId: '0', nombreCliente: 'Venta Rápida', total: totalVenta, saldo: 0,
            tipoVenta: 'Rapida', metodoPago: 'Efectivo', estado: 'Pagada', detalles: [detalle],
        };
        
        const pagoData: Omit<Pago, 'id'> = {
            idPago: nuevoIdPago, fecha: Timestamp.now(),
            idVenta: nuevoIdVenta, ventaDocId: nuevoIdVenta.toString(), clienteNombre: 'Venta Rápida',
            montoTotalPagado: totalVenta, metodoPago: 'Efectivo', usuarioId,
            itemsSaldados: [{ idDetalle: detalle.idDetalle, nombreProducto: detalle.nombreProducto, montoAplicado: totalVenta }]
        };

        const nuevaVentaRef = doc(firestore, `sucursales/${sucursalId}/ventas`, nuevoIdVenta.toString());
        const nuevoPagoRef = doc(firestore, `sucursales/${sucursalId}/pagos`, nuevoIdPago.toString());
        
        transaction.set(nuevaVentaRef, ventaData);
        transaction.set(nuevoPagoRef, pagoData);

        if (esVirtual) {
            const existenciaActualMonedas = (productoDataTx as ProductoVirtual).existencia || 0;
            transaction.update(productoRef, { existencia: existenciaActualMonedas - comando.cantidad });
            transaction.update(doc(firestore, `sucursales/${sucursalId}/generales`, 'actual'), {
                totalVentasMonedas: generalesActual.totalVentasMonedas + totalVenta
            });
        } else {
            transaction.update(productoRef, { existencia: (productoDataTx as Producto).existencia - comando.cantidad });
            transaction.update(doc(firestore, `sucursales/${sucursalId}/generales`, 'actual'), { totalEfectivo: generalesActual.totalEfectivo + totalVenta });
        }
        
        transaction.set(doc(firestore, `sucursales/${sucursalId}/correlativos`, 'ventas'), { correlativo: nuevoIdVenta }, { merge: true });
        transaction.set(doc(firestore, `sucursales/${sucursalId}/correlativos`, 'pagos'), { correlativo: nuevoIdPago }, { merge: true });
        transaction.set(doc(firestore, `sucursales/${sucursalId}/correlativos`, 'ventas_detalles'), { correlativo: nuevoIdDetalle }, { merge: true });

        return { nombreProducto: nombreVenta, cantidad: comando.cantidad, totalVenta };
    });
}

// --- SERVICIOS DE TRAGAMONEDAS ---

interface PagoPremioTotal {
    maquinaId: string;
    tipoPago: 'total';
    monto: number;
}
interface PagoPremioParcial {
    maquinaId: string;
    tipoPago: 'parcial';
    montoTotal: number;
    montoPagado: number;
}

type PagoPremioData = PagoPremioTotal | PagoPremioParcial;

export async function registrarPagoPremioTragamonedas(firestore: Firestore, sucursalId: string, data: PagoPremioData) {
    return runTransaction(firestore, async (transaction) => {
        const correlativoHistorialRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'historial_tragamonedas');
        const generalesRef = doc(firestore, `sucursales/${sucursalId}/generales`, 'actual');
        const maquinaGeneralesRef = doc(firestore, `sucursales/${sucursalId}/generales_tragamonedas`, data.maquinaId);
        const productosVirtualesRef = collection(firestore, `sucursales/${sucursalId}/productos_virtuales`);
        
        const qMonedasPorCodigo = query(productosVirtualesRef, where("codigoBusqueda", "==", "moneda-virtual"), limit(1));
        const qMonedasPorNombre = query(productosVirtualesRef, where("nombre", "==", "Monedas"), limit(1));

        const [generalesDoc, maquinaGeneralesDoc, correlativoHistorialDoc, monedasPorCodigoSnap, monedasPorNombreSnap] = await Promise.all([
            transaction.get(generalesRef),
            transaction.get(maquinaGeneralesRef),
            transaction.get(correlativoHistorialRef),
            getDocs(qMonedasPorCodigo),
            getDocs(qMonedasPorNombre),
        ]);

        const nuevoIdHistorial = (correlativoHistorialDoc.data()?.correlativo || 0) + 1;
        const maquinaHistorialRef = doc(firestore, `sucursales/${sucursalId}/tragamonedas/${data.maquinaId}/historial`, nuevoIdHistorial.toString());

        let monedaVirtualSnap;
        if (!monedasPorCodigoSnap.empty) {
            monedaVirtualSnap = monedasPorCodigoSnap.docs[0];
        } else if (!monedasPorNombreSnap.empty) {
            monedaVirtualSnap = monedasPorNombreSnap.docs[0];
        }

        if (!monedaVirtualSnap) throw new Error("Producto virtual de monedas ('moneda-virtual' o 'Monedas') no encontrado.");
        if (!maquinaGeneralesDoc.exists()) throw new Error("Datos generales de la máquina no encontrados.");

        const monedaVirtualRef = monedaVirtualSnap.ref;
        
        if (data.tipoPago === 'total') {
            transaction.update(generalesRef, {
                totalVentasMonedas: increment(-data.monto)
            });
            transaction.update(monedaVirtualRef, {
                existencia: increment(data.monto)
            });
            transaction.set(maquinaHistorialRef, {
                id: nuevoIdHistorial,
                maquinaId: data.maquinaId,
                fecha: Timestamp.now(),
                tipo: 'premio_total',
                monto: data.monto,
                descripcion: 'Premio total pagado',
            });
        } else { // Parcial
            transaction.update(generalesRef, {
                totalVentasMonedas: increment(-data.montoTotal)
            });
            transaction.update(monedaVirtualRef, {
                existencia: increment(data.montoPagado)
            });
            const deuda = data.montoTotal - data.montoPagado;
            transaction.update(maquinaGeneralesRef, {
                totalDeuda: increment(deuda)
            });
             transaction.set(maquinaHistorialRef, {
                id: nuevoIdHistorial,
                maquinaId: data.maquinaId,
                fecha: Timestamp.now(),
                tipo: 'premio_parcial',
                monto: data.montoTotal,
                descripcion: `Premio parcial pagado. Monto: Q${data.montoTotal}, Pagado: Q${data.montoPagado}, Deuda Generada: Q${deuda}`,
            });
        }
        transaction.set(correlativoHistorialRef, { correlativo: nuevoIdHistorial }, { merge: true });
    });
}

export async function registrarBaseTragamonedas(firestore: Firestore, sucursalId: string, maquinaId: string, montoBase: number) {
    return runTransaction(firestore, async (transaction) => {
        const maquinaGeneralesRef = doc(firestore, `sucursales/${sucursalId}/generales_tragamonedas`, maquinaId);
        const correlativoHistorialRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'historial_tragamonedas');
        const productosVirtualesRef = collection(firestore, `sucursales/${sucursalId}/productos_virtuales`);

        const qMonedasPorCodigo = query(productosVirtualesRef, where("codigoBusqueda", "==", "moneda-virtual"), limit(1));
        const qMonedasPorNombre = query(productosVirtualesRef, where("nombre", "==", "Monedas"), limit(1));

        const [maquinaGeneralesDoc, correlativoHistorialDoc, monedasPorCodigoSnap, monedasPorNombreSnap] = await Promise.all([
            transaction.get(maquinaGeneralesRef),
            transaction.get(correlativoHistorialRef),
            getDocs(qMonedasPorCodigo),
            getDocs(qMonedasPorNombre),
        ]);

        const nuevoIdHistorial = (correlativoHistorialDoc.data()?.correlativo || 0) + 1;
        const maquinaHistorialRef = doc(firestore, `sucursales/${sucursalId}/tragamonedas/${maquinaId}/historial`, nuevoIdHistorial.toString());

        let monedaVirtualSnap;
        if (!monedasPorCodigoSnap.empty) {
            monedaVirtualSnap = monedasPorCodigoSnap.docs[0];
        } else if (!monedasPorNombreSnap.empty) {
            monedaVirtualSnap = monedasPorNombreSnap.docs[0];
        }

        if (!monedaVirtualSnap) throw new Error("Producto virtual de monedas ('moneda-virtual' o 'Monedas') no encontrado.");
        if (!maquinaGeneralesDoc.exists()) throw new Error("Datos generales de la máquina no encontrados.");

        const monedaVirtualRef = monedaVirtualSnap.ref;
        const monedaVirtualData = monedaVirtualSnap.data() as ProductoVirtual;

        if ((monedaVirtualData.existencia ?? 0) < montoBase) {
            throw new Error(`Existencia de monedas insuficiente. Disponible: ${monedaVirtualData.existencia}, requerido: ${montoBase}.`);
        }

        transaction.update(monedaVirtualRef, {
            existencia: increment(-montoBase)
        });
        transaction.update(maquinaGeneralesRef, {
            totalBase: increment(montoBase)
        });
        transaction.set(maquinaHistorialRef, {
            id: nuevoIdHistorial,
            maquinaId: maquinaId,
            fecha: Timestamp.now(),
            tipo: 'base',
            monto: montoBase,
            descripcion: 'Se agregó base a la máquina',
        });
        transaction.set(correlativoHistorialRef, { correlativo: nuevoIdHistorial }, { merge: true });
    });
}

export async function registrarExtraccionTragamonedas(firestore: Firestore, sucursalId: string, maquinaId: string, montoExtraido: number) {
    return runTransaction(firestore, async (transaction) => {
        const maquinaGeneralesRef = doc(firestore, `sucursales/${sucursalId}/generales_tragamonedas`, maquinaId);
        const correlativoHistorialRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'historial_tragamonedas');
        
        const [maquinaGeneralesDoc, correlativoHistorialDoc] = await Promise.all([
            transaction.get(maquinaGeneralesRef),
            transaction.get(correlativoHistorialRef),
        ]);

        if (!maquinaGeneralesDoc.exists()) throw new Error("Datos generales de la máquina no encontrados.");

        const nuevoIdHistorial = (correlativoHistorialDoc.data()?.correlativo || 0) + 1;
        const maquinaHistorialRef = doc(firestore, `sucursales/${sucursalId}/tragamonedas/${maquinaId}/historial`, nuevoIdHistorial.toString());

        const maquinaData = maquinaGeneralesDoc.data();
        let montoRestante = montoExtraido;

        let deudaSaldada = 0;
        if (maquinaData.totalDeuda > 0) {
            deudaSaldada = Math.min(montoRestante, maquinaData.totalDeuda);
            montoRestante -= deudaSaldada;
        }

        let baseSaldada = 0;
        if (montoRestante > 0 && maquinaData.totalBase > 0) {
            baseSaldada = Math.min(montoRestante, maquinaData.totalBase);
            montoRestante -= baseSaldada;
        }

        const extraccionNeta = montoRestante;

        transaction.update(maquinaGeneralesRef, {
            totalDeuda: increment(-deudaSaldada),
            totalBase: increment(-baseSaldada),
            totalExtraccion: increment(extraccionNeta),
        });

        transaction.set(maquinaHistorialRef, {
            id: nuevoIdHistorial,
            maquinaId: maquinaId,
            fecha: Timestamp.now(),
            tipo: 'extraccion',
            monto: montoExtraido,
            descripcion: `Extracción. Deuda saldada: Q${deudaSaldada.toFixed(2)}, Base saldada: Q${baseSaldada.toFixed(2)}, Extracción neta: Q${extraccionNeta.toFixed(2)}`,
        });
        transaction.set(correlativoHistorialRef, { correlativo: nuevoIdHistorial }, { merge: true });
    });
}
