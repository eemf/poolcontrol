'use client';

import {
  doc,
  runTransaction,
  Timestamp,
  Firestore,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  getDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import type { Mesa, Tarifa, Generales, Venta, DetalleVenta, Pago, Cliente } from '@/lib/tipos';
import { toDate, validarSucursal } from './utils';

/**
 * Formatea milisegundos en HH:MM:SS de forma segura, evitando valores negativos.
 */
const formatMsToTime = (ms: number): string => {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.floor(safeMs / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const calcularCosto = (segundos: number, tarifa: Tarifa, numControles: number = 0): number => {
    if (!tarifa || segundos <= 0) return 0;
    
    const baseControles = tarifa.controlesBase || 0;
    const extraControles = Math.max(0, numControles - baseControles);
    const extraPorHora = extraControles * (tarifa.costoControlExtra || 0);

    if (tarifa.tipoDeMesa === 'Consola') {
        let tarifaPorHoraBase = 0;
        if (tarifa.tipoDeCalculo === "Por minuto") {
            tarifaPorHoraBase = (tarifa.costoPorMinuto || 0) * 60;
        } else if (tarifa.tipoDeCalculo === "Por intervalo" && tarifa.intervalos && tarifa.intervalos.length > 0) {
            const int60 = tarifa.intervalos.find(i => i.duracionMinutos === 60);
            if (int60) {
                tarifaPorHoraBase = int60.precio;
            } else {
                const mayor = [...tarifa.intervalos].sort((a, b) => b.duracionMinutos - a.duracionMinutos)[0];
                if (mayor && mayor.duracionMinutos > 0) {
                    tarifaPorHoraBase = (mayor.precio / mayor.duracionMinutos) * 60;
                }
            }
        }
        
        const tarifaPorHoraTotal = tarifaPorHoraBase + extraPorHora;
        const minutos = Math.ceil(segundos / 60);
        const bloques30 = Math.ceil(minutos / 30);
        
        return bloques30 * (tarifaPorHoraTotal / 2);
    }

    const minutos = Math.ceil(segundos / 60);
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

interface IniciarSesionParams {
  firestore: Firestore;
  sucursalId: string;
  usuarioId: string;
  mesaId: string;
  numeroMesa: number;
  modoJuego: 'libre' | 'definido';
  pagadoDeContado: boolean;
  duracionDefinida: number;
  tarifa: Tarifa;
  numControles?: number;
  serverOffset?: number;
}

export async function iniciarSesion({ firestore, sucursalId, usuarioId, mesaId, numeroMesa, modoJuego, pagadoDeContado, duracionDefinida, tarifa, numControles = 0, serverOffset = 0 }: IniciarSesionParams) {
    const sid = validarSucursal(sucursalId);
    const mesaRef = doc(firestore, `sucursales/${sid}/mesas_de_billar`, mesaId);
    
    return runTransaction(firestore, async (transaction) => {
        const mesaDoc = await transaction.get(mesaRef);
        if (!mesaDoc.exists()) throw new Error("La estación no existe.");
        if (mesaDoc.data()?.estado === 'ocupado') throw new Error("La estación ya se encuentra ocupada.");

        const costo = modoJuego === 'definido' ? calcularCosto(duracionDefinida * 60, tarifa, numControles) : 0;
        
        const datosInicio: any = {
            estado: 'ocupado', 
            horaInicio: serverTimestamp(), 
            horaFin: null, 
            modoJuego,
            clienteId: '0', 
            nombreCliente: `Mesa ${numeroMesa}`,
            consumos: [], 
            ajustesDeTiempo: [], 
            alarmaAck: false, 
            numControles: numControles,
            tiempoDefinido: modoJuego === 'definido' ? duracionDefinida * 60 : null,
            alquilerPagado: pagadoDeContado,
            montoACobrar: (modoJuego === 'definido' && !pagadoDeContado) ? costo : null,
            idVentaPrepagada: null
        };

        if (modoJuego === 'definido' && pagadoDeContado) {
            const [generalesDoc, corrVentaDoc, corrPagoDoc, corrDetalleDoc] = await Promise.all([
                transaction.get(doc(firestore, `sucursales/${sid}/generales`, 'actual')),
                transaction.get(doc(firestore, `sucursales/${sid}/correlativos`, 'ventas')),
                transaction.get(doc(firestore, `sucursales/${sid}/correlativos`, 'pagos')),
                transaction.get(doc(firestore, `sucursales/${sid}/correlativos`, 'ventas_detalles')),
            ]);
            
            if (costo <= 0) throw new Error("No se pudo calcular el costo.");
            const nuevoIdVenta = (corrVentaDoc.data()?.correlativo || 0) + 1;
            const nuevoIdPago = (corrPagoDoc.data()?.correlativo || 0) + 1;
            const nuevoIdDetalle = (corrDetalleDoc.data()?.correlativo || 0) + 1;
            
            const labelEstacion = tarifa.tipoDeMesa === 'Consola' ? 'Consola' : 'Mesa';
            const nombreProducto = `Alquiler prepagado ${labelEstacion} #${numeroMesa} (${duracionDefinida} min)`;

            const detalle: DetalleVenta = {
                idDetalle: nuevoIdDetalle, idProducto: `mesa-${mesaId}`, nombreProducto, cantidad: 1,
                precioUnitario: costo, subtotal: costo, saldo: 0, pagadoEfectivo: costo, pagadoTarjeta: 0,
                metodoPago: 'Efectivo', estado: 'Pagada', fechaAgregado: Timestamp.now(), esVirtual: false,
                metadata: {
                    tipo: 'alquiler',
                    modo: 'definido',
                    pagadoContado: true,
                    horaInicio: Timestamp.now()
                }
            };
            
            transaction.set(doc(firestore, `sucursales/${sid}/ventas`, nuevoIdVenta.toString()), { 
                idVenta: nuevoIdVenta, 
                sucursalId: sid,
                fecha: serverTimestamp(), 
                clienteId: '0', 
                nombreCliente: `Mesa ${numeroMesa}`, 
                total: costo, 
                saldo: 0, 
                tipoVenta: 'POS', 
                metodoPago: 'Efectivo', 
                estado: 'Pagada', 
                detalles: [detalle] 
            });
            transaction.set(doc(firestore, `sucursales/${sid}/pagos`, nuevoIdPago.toString()), { 
                idPago: nuevoIdPago, 
                sucursalId: sid,
                fecha: serverTimestamp(), 
                idVenta: nuevoIdVenta, 
                ventaDocId: nuevoIdVenta.toString(), 
                clienteNombre: `Mesa ${numeroMesa}`, 
                montoTotalPagado: costo, 
                ventaTotal: costo, 
                metodoPago: 'Efectivo', 
                usuarioId, 
                itemsSaldados: [{ idDetalle: nuevoIdDetalle, nombreProducto, montoAplicado: costo, subtotalItem: costo, esVirtual: false, cantidad: 1 }] 
            });
            transaction.update(doc(firestore, `sucursales/${sid}/generales`, 'actual'), { totalMesas: increment(costo) });
            transaction.set(doc(firestore, `sucursales/${sid}/correlativos`, 'ventas'), { correlativo: nuevoIdVenta }, { merge: true });
            transaction.set(doc(firestore, `sucursales/${sid}/correlativos`, 'pagos'), { correlativo: nuevoIdPago }, { merge: true });
            transaction.set(doc(firestore, `sucursales/${sid}/correlativos`, 'ventas_detalles'), { correlativo: nuevoIdDetalle }, { merge: true });
            
            datosInicio.idVentaPrepagada = nuevoIdVenta.toString();
        }

        transaction.update(mesaRef, datosInicio);
    });
}

export async function ajustarTiempoDefinido(firestore: Firestore, sucursalId: string, usuarioId: string, mesaId: string, minutosParaAnadir: number, pagadoDeContado: boolean, serverOffset: number = 0) {
    const sid = validarSucursal(sucursalId);
    const mesaRef = doc(firestore, `sucursales/${sid}/mesas_de_billar`, mesaId);
    return runTransaction(firestore, async (transaction) => {
        const mesaDoc = await transaction.get(mesaRef);
        if (!mesaDoc.exists()) throw new Error("La estación no existe.");
        const mesaData = mesaDoc.data() as Mesa;
        if (mesaData.estado !== 'ocupado') throw new Error("La sesión ya no está activa.");

        const tarifaDoc = await transaction.get(doc(firestore, `sucursales/${sid}/tarifas`, mesaData.tarifaId));
        const tarifaData = tarifaDoc.data() as Tarifa;
        const costoAdicional = calcularCosto(minutosParaAnadir * 60, tarifaData, mesaData.numControles);
        
        const ajuste = { minutosAgregados: minutosParaAnadir, monto: costoAdicional, fecha: Timestamp.now(), pagado: pagadoDeContado };
        const ajustesActuales = mesaData.ajustesDeTiempo || [];
        
        const nuevoTiempoDefinido = (mesaData.tiempoDefinido || 0) + (minutosParaAnadir * 60);

        if (pagadoDeContado) {
            const [generalesDoc, corrVentaDoc, corrPagoDoc, corrDetalleDoc] = await Promise.all([
                transaction.get(doc(firestore, `sucursales/${sid}/generales`, 'actual')),
                transaction.get(doc(firestore, `sucursales/${sid}/correlativos`, 'ventas')),
                transaction.get(doc(firestore, `sucursales/${sid}/correlativos`, 'pagos')),
                transaction.get(doc(firestore, `sucursales/${sid}/correlativos`, 'ventas_detalles')),
            ]);
            const nuevoIdV = (corrVentaDoc.data()?.correlativo || 0) + 1, nuevoIdP = (corrPagoDoc.data()?.correlativo || 0) + 1, nuevoIdD = (corrDetalleDoc.data()?.correlativo || 0) + 1;
            
            const labelEstacion = tarifaData.tipoDeMesa === 'Consola' ? 'Consola' : 'Mesa';
            const nombreP = `Tiempo adicional ${labelEstacion} #${mesaData.numeroMesa} (${minutosParaAnadir} min)`;
            
            const det: DetalleVenta = { 
                idDetalle: nuevoIdD, idProducto: `mesa-ajuste-${mesaId}`, nombreProducto: nombreP, cantidad: 1, 
                precioUnitario: costoAdicional, subtotal: costoAdicional, saldo: 0, pagadoEfectivo: costoAdicional, 
                pagadoTarjeta: 0, metodoPago: 'Efectivo', estado: 'Pagada', fechaAgregado: Timestamp.now(), 
                esVirtual: false,
                metadata: {
                    tipo: 'ajuste',
                    modo: 'definido',
                    pagadoContado: true,
                    horaInicio: Timestamp.now()
                }
            };
            
            transaction.set(doc(firestore, `sucursales/${sid}/ventas`, nuevoIdV.toString()), { 
                idVenta: nuevoIdV, 
                sucursalId: sid,
                fecha: serverTimestamp(), 
                clienteId: '0', 
                nombreCliente: `${labelEstacion} ${mesaData.numeroMesa}`, 
                total: costoAdicional, 
                saldo: 0, 
                tipoVenta: 'POS', 
                metodoPago: 'Efectivo', 
                estado: 'Pagada', 
                detalles: [det] 
            });
            transaction.set(doc(firestore, `sucursales/${sid}/pagos`, nuevoIdP.toString()), { 
                idPago: nuevoIdP, 
                sucursalId: sid,
                fecha: serverTimestamp(), 
                idVenta: nuevoIdV, 
                ventaDocId: nuevoIdV.toString(), 
                clienteNombre: `${labelEstacion} ${mesaData.numeroMesa}`, 
                montoTotalPagado: costoAdicional, 
                ventaTotal: costoAdicional, 
                metodoPago: 'Efectivo', 
                usuarioId, 
                itemsSaldados: [{ idDetalle: nuevoIdD, nombreProducto: nombreP, montoAplicado: costoAdicional, subtotalItem: costoAdicional, esVirtual: false, cantidad: 1 }] 
            });
            transaction.update(doc(firestore, `sucursales/${sid}/generales`, 'actual'), { totalMesas: increment(costoAdicional) });
            transaction.set(doc(firestore, `sucursales/${sid}/correlativos`, 'ventas'), { correlativo: nuevoIdV }, { merge: true });
            transaction.set(doc(firestore, `sucursales/${sid}/correlativos`, 'pagos'), { correlativo: nuevoIdP }, { merge: true });
            transaction.set(doc(firestore, `sucursales/${sid}/correlativos`, 'ventas_detalles'), { correlativo: nuevoIdD }, { merge: true });
        }

        transaction.update(mesaRef, { 
            tiempoDefinido: nuevoTiempoDefinido, 
            ajustesDeTiempo: [...ajustesActuales, ajuste],
            alarmaAck: false // IMPORTANTE: Resetear para que la alarma vuelva a sonar al terminar el nuevo tiempo
        });
    });
}

export async function pasarACuenta(firestore: Firestore, sucursalId: string, usuarioId: string, mesa: Mesa, costoAlquilerFinal: number, costoConsumoFinal: number, clienteId: string, serverOffset: number = 0) {
    const sid = validarSucursal(sucursalId);
    const mesaRef = doc(firestore, `sucursales/${sid}/mesas_de_billar`, mesa.id);
    const q = query(collection(firestore, `sucursales/${sid}/ventas`), where("clienteId", "==", clienteId), where("estado", "==", "Pendiente de pago"));
    
    return runTransaction(firestore, async (transaction) => {
        const mesaDoc = await transaction.get(mesaRef);
        if (mesaDoc.data()?.estado !== 'ocupado') throw new Error("La sesión ya no está activa.");

        const [querySnapshot, clienteDocSnap, corrDetalleDoc] = await Promise.all([
            getDocs(q), 
            transaction.get(doc(firestore, `sucursales/${sid}/clientes`, clienteId)), 
            transaction.get(doc(firestore, `sucursales/${sid}/correlativos`, 'ventas_detalles'))
        ]);
        
        const nombreCliente = (clienteDocSnap.data() as Cliente).nombre;
        let siguienteIdDetalle = (corrDetalleDoc.data()?.correlativo || 0) + 1;
        const nuevosDetalles: DetalleVenta[] = (mesa.consumos || []).map((consumo: any) => ({ 
            idDetalle: siguienteIdDetalle++, idProducto: consumo.idProducto, nombreProducto: consumo.nombreProducto, 
            cantidad: consumo.cantidad, precioUnitario: consumo.precioUnitario, subtotal: consumo.total, 
            saldo: consumo.total, pagadoEfectivo: 0, pagadoTarjeta: 0, metodoPago: null, estado: 'Pendiente de pago', 
            fechaAgregado: Timestamp.now(), esVirtual: !!consumo.esVirtual,
            metadata: { tipo: 'consumo' }
        }));
        
        if (costoAlquilerFinal > 0) {
            const ahoraSincronizada = Date.now() + serverOffset;
            const ms = mesa.horaInicio ? Math.max(0, ahoraSincronizada - toDate(mesa.horaInicio).getTime()) : 0;
            const tStr = formatMsToTime(ms);
            const labelEstacion = mesa.tipoDeMesa === 'Consola' ? 'Consola' : 'Mesa';
            nuevosDetalles.push({ 
                idDetalle: siguienteIdDetalle++, idProducto: `mesa-${mesa.id}`, 
                nombreProducto: `Tiempo ${labelEstacion} #${mesa.numeroMesa} (${tStr})`, 
                cantidad: 1, precioUnitario: costoAlquilerFinal, subtotal: costoAlquilerFinal, 
                saldo: costoAlquilerFinal, pagadoEfectivo: 0, pagadoTarjeta: 0, metodoPago: null, 
                estado: 'Pendiente de pago', fechaAgregado: Timestamp.now(), esVirtual: false,
                metadata: {
                    tipo: 'alquiler',
                    modo: mesa.modoJuego || 'libre',
                    pagadoContado: false,
                    horaInicio: mesa.horaInicio,
                    horaFin: Timestamp.now()
                }
            });
        }
        
        const totalNuevosItems = nuevosDetalles.reduce((sum, item) => sum + item.subtotal, 0);
        if (querySnapshot.empty) {
            const corrVDoc = await transaction.get(doc(firestore, `sucursales/${sid}/correlativos`, 'ventas'));
            const nuevoIdV = (corrVDoc.data()?.correlativo || 0) + 1;
            transaction.set(doc(firestore, `sucursales/${sid}/ventas`, nuevoIdV.toString()), { 
                idVenta: nuevoIdV, 
                sucursalId: sid,
                fecha: serverTimestamp(), 
                clienteId, nombreCliente, 
                total: totalNuevosItems, 
                saldo: totalNuevosItems, 
                tipoVenta: 'POS', 
                estado: 'Pendiente de pago', 
                detalles: nuevosDetalles 
            });
            transaction.set(corrVDoc.ref, { correlativo: nuevoIdV }, { merge: true });
        } else {
            const vDoc = querySnapshot.docs[0];
            const vData = vDoc.data() as Venta;
            transaction.update(vDoc.ref, { total: increment(totalNuevosItems), saldo: increment(totalNuevosItems), detalles: [...vData.detalles, ...nuevosDetalles] });
        }
        
        transaction.set(corrDetalleDoc.ref, { correlativo: siguienteIdDetalle - 1 }, { merge: true });
        transaction.update(mesaRef, { estado: 'disponible', horaInicio: null, horaFin: null, modoJuego: null, tiempoDefinido: null, alquilerPagado: false, montoACobrar: null, clienteId: null, nombreCliente: null, consumos: [], ajustesDeTiempo: [], alarmaAck: false, numControles: 0, idVentaPrepagada: null });
    });
}

export async function procesarVentaTiempoDeMesa(firestore: Firestore, sucursalId: string, mesa: Mesa, usuarioId: string, costoAlquiler: number, metodoDePago: 'Efectivo' | 'Tarjeta', serverOffset: number = 0) {
    const sid = validarSucursal(sucursalId);
    const mesaRef = doc(firestore, `sucursales/${sid}/mesas_de_billar`, mesa.id);
    return runTransaction(firestore, async (transaction) => {
        const mesaDoc = await transaction.get(mesaRef);
        if (mesaDoc.data()?.estado !== 'ocupado') throw new Error("La sesión ya no está activa.");

        const ahoraSincronizada = Date.now() + serverOffset;
        const ms = mesa.horaInicio ? Math.max(0, ahoraSincronizada - toDate(mesa.horaInicio).getTime()) : 0;
        const tStr = formatMsToTime(ms);
        const labelEstacion = mesa.tipoDeMesa === 'Consola' ? 'Consola' : 'Mesa';
        const nombreProductoTiempo = `Tiempo ${labelEstacion} #${mesa.numeroMesa} (${tStr})`;

        if (mesa.idVentaPrepagada) {
            const ventaRef = doc(firestore, `sucursales/${sid}/ventas`, mesa.idVentaPrepagada);
            const corrPagoRef = doc(firestore, `sucursales/${sid}/correlativos`, 'pagos');
            const corrDetalleRef = doc(firestore, `sucursales/${sid}/correlativos`, 'ventas_detalles');
            const generalesRef = doc(firestore, `sucursales/${sid}/generales`, 'actual');

            const [ventaSnap, corrPagoSnap, corrDetalleSnap] = await Promise.all([
                transaction.get(ventaRef),
                transaction.get(corrPagoRef),
                transaction.get(corrDetalleRef)
            ]);

            if (ventaSnap.exists()) {
                const ventaData = ventaSnap.data() as Venta;
                let idD = (corrDetalleSnap.data()?.correlativo || 0) + 1;
                
                const detallesActualizados = ventaData.detalles.map(d => {
                    if (d.idProducto === `mesa-${mesa.id}`) {
                        return { 
                            ...d, 
                            nombreProducto: nombreProductoTiempo,
                            metadata: {
                                ...d.metadata,
                                horaFin: Timestamp.now()
                            }
                        };
                    }
                    return d;
                });

                const consumosItems = (mesa.consumos || []).map((it: any) => ({
                    idDetalle: idD++, idProducto: it.idProducto, nombreProducto: it.nombreProducto, 
                    cantidad: it.cantidad, precioUnitario: it.precioUnitario, subtotal: it.total, 
                    saldo: 0, pagadoEfectivo: metodoDePago === 'Efectivo' ? it.total : 0, 
                    pagadoTarjeta: metodoDePago === 'Tarjeta' ? it.total : 0, 
                    metodoPago: metodoDePago, estado: 'Pagada', fechaAgregado: Timestamp.now(), esVirtual: !!it.esVirtual,
                    metadata: { tipo: 'consumo' }
                } as DetalleVenta));

                const totalConsumo = consumosItems.reduce((s, i) => s + i.subtotal, 0);
                const nuevoTotalVenta = ventaData.total + totalConsumo + costoAlquiler;

                const montoExtra = totalConsumo + costoAlquiler;
                if (montoExtra > 0) {
                    const idP = (corrPagoSnap.data()?.correlativo || 0) + 1;
                    const itemsSaldados = consumosItems.map(d => ({ 
                        idDetalle: d.idDetalle, nombreProducto: d.nombreProducto, 
                        montoAplicado: d.subtotal, subtotalItem: d.subtotal, 
                        esVirtual: !!d.esVirtual, cantidad: d.cantidad 
                    }));

                    const pagoData: Omit<Pago, 'id'> = {
                        idPago: idP, 
                        sucursalId: sid,
                        fecha: serverTimestamp(), 
                        idVenta: ventaData.idVenta, 
                        ventaDocId: mesa.idVentaPrepagada, clienteNombre: ventaData.nombreCliente, 
                        montoTotalPagado: montoExtra, ventaTotal: nuevoTotalVenta, 
                        metodoPago: metodoDePago, usuarioId, 
                        itemsSaldados
                    };
                    
                    transaction.set(doc(firestore, `sucursales/${sid}/pagos`, idP.toString()), pagoData);
                    transaction.set(corrPagoRef, { correlativo: idP }, { merge: true });

                    if (metodoDePago === 'Efectivo') {
                        transaction.update(generalesRef, { totalMesas: increment(costoAlquiler), totalEfectivo: increment(totalConsumo) });
                    } else {
                        // Distribuir entre ventas normales y monedas para Tarjeta
                        const monedasCard = itemsSaldados.filter(i => i.esVirtual).reduce((acc, i) => acc + i.montoAplicado, 0);
                        const otrosCard = montoExtra - monedasCard;
                        if (otrosCard > 0) transaction.update(generalesRef, { totalVentasTarjeta: increment(otrosCard) });
                        if (monedasCard > 0) {
                            transaction.update(generalesRef, { 
                                totalMonedasTarjeta: increment(monedasCard),
                                acumuladoMonedasTarjeta: increment(monedasCard)
                            });
                        }
                    }
                }

                transaction.update(ventaRef, {
                    detalles: [...detallesActualizados, ...consumosItems],
                    total: nuevoTotalVenta,
                    saldo: 0,
                    metodoPago: (ventaData.metodoPago === metodoDePago || !ventaData.metodoPago) ? metodoDePago : 'Mixto'
                });

                transaction.set(corrDetalleRef, { correlativo: idD - 1 }, { merge: true });
                transaction.update(mesaRef, { estado: 'disponible', horaInicio: null, modoJuego: null, tiempoDefinido: null, alquilerPagado: false, montoACobrar: null, ajustesDeTiempo: [], alarmaAck: false, numControles: 0, idVentaPrepagada: null });
                return;
            }
        }

        const [cV, cP, cD, gD] = await Promise.all([
            transaction.get(doc(firestore, `sucursales/${sid}/correlativos`, 'ventas')), 
            transaction.get(doc(firestore, `sucursales/${sid}/correlativos`, 'pagos')), 
            transaction.get(doc(firestore, `sucursales/${sid}/correlativos`, 'ventas_detalles')), 
            transaction.get(doc(firestore, `sucursales/${sid}/generales`, 'actual'))
        ]);
        
        let idV = (cV.data()?.correlativo || 0) + 1, idP = (cP.data()?.correlativo || 0) + 1, idD = (cD.data()?.correlativo || 0) + 1;
        const detV: DetalleVenta[] = [];
        
        detV.push({ 
            idDetalle: idD++, idProducto: `mesa-${mesa.id}`, nombreProducto: nombreProductoTiempo, 
            cantidad: 1, precioUnitario: costoAlquiler, subtotal: costoAlquiler, saldo: 0, 
            pagadoEfectivo: metodoDePago === 'Efectivo' ? costoAlquiler : 0, 
            pagadoTarjeta: metodoDePago === 'Tarjeta' ? costoAlquiler : 0, 
            metodoPago: metodoDePago, estado: 'Pagada', fechaAgregado: Timestamp.now(), esVirtual: false,
            metadata: {
                tipo: 'alquiler',
                modo: mesa.modoJuego || 'libre',
                pagadoContado: false,
                horaInicio: mesa.horaInicio,
                horaFin: Timestamp.now()
            }
        });
        
        (mesa.consumos || []).forEach((it: any) => detV.push({ 
            idDetalle: idD++, idProducto: it.idProducto, nombreProducto: it.nombreProducto, 
            cantidad: it.cantidad, precioUnitario: it.precioUnitario, subtotal: it.total, 
            saldo: 0, pagadoEfectivo: metodoDePago === 'Efectivo' ? it.total : 0, 
            pagadoTarjeta: metodoDePago === 'Tarjeta' ? it.total : 0, 
            metodoPago: metodoDePago, estado: 'Pagada', fechaAgregado: Timestamp.now(), esVirtual: !!it.esVirtual,
            metadata: { tipo: 'consumo' }
        }));
        
        const total = detV.reduce((s, i) => s + i.subtotal, 0);
        transaction.set(doc(firestore, `sucursales/${sid}/ventas`, idV.toString()), { 
            idVenta: idV, 
            sucursalId: sid,
            fecha: serverTimestamp(), 
            clienteId: '0', nombreCliente: `${labelEstacion} #${mesa.numeroMesa}`, total, saldo: 0, tipoVenta: 'POS', metodoPago: metodoDePago, estado: 'Pagada', detalles: detV 
        });
        transaction.set(doc(firestore, `sucursales/${sid}/pagos`, idP.toString()), { 
            idPago: idP, 
            sucursalId: sid,
            fecha: serverTimestamp(), idVenta: idV, ventaDocId: idV.toString(), clienteNombre: `${labelEstacion} #${mesa.numeroMesa}`, montoTotalPagado: total, ventaTotal: total, metodoPago: metodoDePago, usuarioId, itemsSaldados: detV.map(d => ({ idDetalle: d.idDetalle, nombreProducto: d.nombreProducto, montoAplicado: d.subtotal, subtotalItem: d.subtotal, esVirtual: !!d.esVirtual, cantidad: d.cantidad })) 
        });
        
        if (metodoDePago === 'Efectivo') {
            transaction.update(gD.ref, { totalMesas: increment(costoAlquiler), totalEfectivo: increment(total - costoAlquiler) });
        } else {
            // Distribuir entre ventas normales y monedas para Tarjeta (Regular)
            const monedasTotal = detV.filter(i => i.esVirtual).reduce((acc, i) => acc + i.subtotal, 0);
            const otrosTotal = total - monedasTotal;
            if (otrosTotal > 0) transaction.update(gD.ref, { totalVentasTarjeta: increment(otrosTotal) });
            if (monedasTotal > 0) {
                transaction.update(gD.ref, { 
                    totalMonedasTarjeta: increment(monedasTotal),
                    acumuladoMonedasTarjeta: increment(monedasTotal)
                });
            }
        }
        
        transaction.update(mesaRef, { estado: 'disponible', horaInicio: null, modoJuego: null, tiempoDefinido: null, alquilerPagado: false, montoACobrar: null, ajustesDeTiempo: [], alarmaAck: false, numControles: 0, idVentaPrepagada: null });
        transaction.set(doc(firestore, `sucursales/${sid}/correlativos`, 'ventas'), { correlativo: idV }, { merge: true }); 
        transaction.set(doc(firestore, `sucursales/${sid}/correlativos`, 'pagos'), { correlativo: idP }, { merge: true }); 
        transaction.set(doc(firestore, `sucursales/${sid}/correlativos`, 'ventas_detalles'), { correlativo: idD - 1 }, { merge: true });
    });
}

export async function trasladarMesa(firestore: Firestore, sucursalId: string, mesaOrigenId: string, mesaDestinoId: string) {
  const sid = validarSucursal(sucursalId);
  return runTransaction(firestore, async (transaction) => {
    const oR = doc(firestore, `sucursales/${sid}/mesas_de_billar`, mesaOrigenId);
    const dR = doc(firestore, `sucursales/${sid}/mesas_de_billar`, mesaDestinoId);
    const [oD, dD] = await Promise.all([transaction.get(oR), transaction.get(dR)]);
    
    if (!oD.exists() || !dD.exists()) throw new Error("La estación no existe.");
    const oData = oD.data() as Mesa;
    if (oData.estado !== 'ocupado') throw new Error("La estación de origen ya no está activa.");
    if (dD.data()?.estado !== 'disponible') throw new Error("La estación de destino ya no está libre.");

    transaction.update(dR, { estado: 'ocupado', horaInicio: oData.horaInicio, horaFin: oData.horaFin, modoJuego: oData.modoJuego, tiempoDefinido: oData.tiempoDefinido, alquilerPagado: oData.alquilerPagado, montoACobrar: oData.montoACobrar, clienteId: oData.clienteId, nombreCliente: oData.nombreCliente, consumos: oData.consumos || [], ajustesDeTiempo: oData.ajustesDeTiempo || [], alarmaAck: oData.alarmaAck || false, numControles: oData.numControles || 0, idVentaPrepagada: oData.idVentaPrepagada || null });
    transaction.update(oR, { estado: 'disponible', horaInicio: null, horaFin: null, modoJuego: null, tiempoDefinido: null, alquilerPagado: false, montoACobrar: null, clienteId: null, nombreCliente: null, consumos: [], ajustesDeTiempo: [], alarmaAck: false, numControles: 0, idVentaPrepagada: null });
  });
}

export async function procesarPagoDivision(
  firestore: Firestore, 
  sucursalId: string, 
  usuarioId: string, 
  mesaNumero: number, 
  monto: number, 
  metodo: 'Efectivo' | 'Tarjeta' | 'A Cuenta', 
  clienteInfo: { clienteId: string; nombreCliente: string; } | null, 
  parteInfo?: string
) {
    const sid = validarSucursal(sucursalId);

    // Solo buscamos cuenta existente si es 'A Cuenta'
    let qVentaExistente = null;
    if (metodo === 'A Cuenta' && clienteInfo) {
        qVentaExistente = query(
            collection(firestore, `sucursales/${sid}/ventas`), 
            where("clienteId", "==", clienteInfo.clienteId), 
            where("estado", "==", "Pendiente de pago")
        );
    }

    return runTransaction(firestore, async (transaction) => {
        let fId = metodo === 'A Cuenta' ? clienteInfo!.clienteId : '0', 
            fNom = metodo === 'A Cuenta' ? clienteInfo!.nombreCliente : `Mesa #${mesaNumero}${parteInfo ? ` - ${parteInfo}` : ''}`;
        
        const gR = doc(firestore, `sucursales/${sid}/generales`, 'actual'), 
              cV = doc(firestore, `sucursales/${sid}/correlativos`, 'ventas'), 
              cP = doc(firestore, `sucursales/${sid}/correlativos`, 'pagos'), 
              cD = doc(firestore, `sucursales/${sid}/correlativos`, 'ventas_detalles');

        // Realizamos todas las lecturas
        const [cVD, cPD, cDD, vSnap] = await Promise.all([
            transaction.get(cV), 
            transaction.get(cP), 
            transaction.get(cD),
            qVentaExistente ? getDocs(qVentaExistente) : Promise.resolve(null)
        ]);

        const nV = (cVD.data()?.correlativo || 0) + 1, 
              nP = (cPD.data()?.correlativo || 0) + 1, 
              nD = (cDD.data()?.correlativo || 0) + 1;

        const det: DetalleVenta = { 
            idDetalle: nD, 
            idProducto: `division-mesa-${mesaNumero}`, 
            nombreProducto: `Pago dividido Mesa #${mesaNumero}${parteInfo ? ` (${parteInfo})` : ''}`, 
            cantidad: 1, 
            precioUnitario: monto, 
            subtotal: monto, 
            saldo: metodo === 'A Cuenta' ? monto : 0, 
            pagadoEfectivo: metodo === 'Efectivo' ? monto : 0, 
            pagadoTarjeta: metodo === 'Tarjeta' ? monto : 0, 
            metodoPago: metodo === 'A Cuenta' ? null : metodo, 
            estado: metodo === 'A Cuenta' ? 'Pendiente de pago' : 'Pagada', 
            fechaAgregado: Timestamp.now(), 
            esVirtual: false,
            metadata: {
                tipo: 'alquiler',
                modo: 'definido',
                pagadoContado: metodo !== 'A Cuenta',
                horaInicio: Timestamp.now(),
                horaFin: Timestamp.now()
            }
        };
        
        if (metodo === 'A Cuenta' && vSnap && !vSnap.empty) {
            // SI YA EXISTE UNA CUENTA ABIERTA: Actualizarla
            const vDoc = vSnap.docs[0];
            const vData = vDoc.data() as Venta;
            transaction.update(vDoc.ref, { 
                total: increment(monto), 
                saldo: increment(monto), 
                detalles: [...vData.detalles, det] 
            });
        } else {
            // SI ES PAGO EN SITIO O NO HAY CUENTA ABIERTA: Crear nueva venta
            transaction.set(doc(firestore, `sucursales/${sid}/ventas`, nV.toString()), { 
                idVenta: nV, 
                sucursalId: sid,
                fecha: serverTimestamp(), 
                clienteId: fId, 
                nombreCliente: fNom, 
                total: monto, 
                saldo: metodo === 'A Cuenta' ? monto : 0, 
                tipoVenta: 'POS', 
                estado: metodo === 'A Cuenta' ? 'Pendiente de pago' : 'Pagada', 
                detalles: [det] 
            });
            transaction.set(cV, { correlativo: nV }, { merge: true });
        }
        
        if (metodo !== 'A Cuenta') {
            // Registrar pago si no es a cuenta
            transaction.set(doc(firestore, `sucursales/${sid}/pagos`, nP.toString()), { 
                idPago: nP, 
                sucursalId: sid,
                fecha: serverTimestamp(), 
                idVenta: nV, 
                ventaDocId: nV.toString(), 
                clienteNombre: fNom, 
                montoTotalPagado: monto, 
                ventaTotal: monto, 
                metodoPago: metodo, 
                usuarioId, 
                itemsSaldados: [{ idDetalle: nD, nombreProducto: det.nombreProducto, montoAplicado: monto, subtotalItem: monto, esVirtual: false, cantidad: 1 }] 
            });
            if (metodo === 'Efectivo') transaction.update(gR, { totalMesas: increment(monto) }); 
            else transaction.update(gR, { totalVentasTarjeta: increment(monto) });
            transaction.set(cP, { correlativo: nP }, { merge: true });
        }
        
        transaction.set(cD, { correlativo: nD }, { merge: true });
    });
}

export async function eliminarConsumoMesa(firestore: Firestore, sucursalId: string, mesaId: string, consumoId: string) {
    const sid = validarSucursal(sucursalId);
    return runTransaction(firestore, async (transaction) => {
        const mR = doc(firestore, `sucursales/${sid}/mesas_de_billar`, mesaId);
        const mD = await transaction.get(mR);
        if (!mD.exists()) throw new Error("La estación no existe.");
        
        const cons = mD.data()?.consumos || [], item = cons.find((c: any) => c.id === consumoId);
        if (!item) throw new Error("Consumo no encontrado.");

        const idProd = item.idProducto || item.productoId; 
        if (idProd !== 'item-manual') {
            transaction.update(doc(firestore, `sucursales/${sid}/${item.esVirtual ? 'productos_virtuales' : 'productos'}`, idProd), { existencia: increment(item.cantidad) });
            if (!item.esVirtual && item.ingredientesConsumidos) {
                item.ingredientesConsumidos.forEach((ing: any) => transaction.update(doc(firestore, `sucursales/${sid}/productos`, ing.productoId), { existencia: increment(ing.cantidad * item.cantidad) }));
            }
        }
        transaction.update(mR, { consumos: cons.filter((c: any) => c.id !== consumoId) });
    });
}
