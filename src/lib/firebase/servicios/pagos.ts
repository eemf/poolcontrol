'use client';
import { doc, runTransaction, Timestamp, Firestore, increment, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import type { Venta, DetalleVenta, Pago, Cliente, Generales } from '@/lib/tipos';
import { validarSucursal } from './utils';

/**
 * Helper para identificar si un producto es tiempo de mesa o consola.
 */
const esAlquilerMesa = (idProducto: string, nombre: string) => 
    idProducto.startsWith('mesa-') || 
    idProducto.startsWith('division-mesa-') ||
    nombre.includes('Mesa #') ||
    nombre.includes('Consola #');

/**
 * Registra un abono parcial a una cuenta abierta (Pendiente o Crédito).
 */
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
        let abonoAplicadoAMesas = 0;
        let abonoAplicadoAOtros = 0;
        const itemsSaldados: Pago['itemsSaldados'] = [];
        
        const detallesOriginales = venta.detalles;
        const detallesActualizadosMap = new Map<number, DetalleVenta>();
        detallesOriginales.forEach(d => detallesActualizadosMap.set(d.idDetalle, {...d}));

        const detallesPendientes = detallesOriginales.filter(d => d.saldo > 0);
        
        const detallesMonedas = detallesPendientes.filter(d => d.esVirtual).sort((a, b) => new Date(a.fechaAgregado as string).getTime() - new Date(b.fechaAgregado as string).getTime());
        const detallesTiempo = detallesPendientes.filter(d => !d.esVirtual && esAlquilerMesa(d.idProducto, d.nombreProducto)).sort((a, b) => new Date(a.fechaAgregado as string).getTime() - new Date(b.fechaAgregado as string).getTime());
        const detallesConsumo = detallesPendientes.filter(d => !d.esVirtual && !esAlquilerMesa(d.idProducto, d.nombreProducto)).sort((a, b) => new Date(a.fechaAgregado as string).getTime() - new Date(b.fechaAgregado as string).getTime());
        
        const aplicarAbono = (detalle: DetalleVenta) => {
            if (abonoRestante <= 0) return detalle;
            const montoAAplicar = Math.min(detalle.saldo, abonoRestante);
            
            if (detalle.esVirtual) abonoAplicadoAMonedas += montoAAplicar;
            else if (esAlquilerMesa(detalle.idProducto, detalle.nombreProducto)) abonoAplicadoAMesas += montoAAplicar;
            else abonoAplicadoAOtros += montoAAplicar;

            itemsSaldados.push({
                idDetalle: detalle.idDetalle,
                nombreProducto: detalle.nombreProducto,
                montoAplicado: montoAAplicar,
                subtotalItem: detalle.subtotal,
                cantidad: detalle.cantidad || 1,
                esVirtual: !!detalle.esVirtual,
                idProducto: detalle.idProducto
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
            if (detalleOriginal) detallesActualizadosMap.set(d.idDetalle, aplicarAbono(detalleOriginal));
        });
        detallesTiempo.forEach(d => {
            if (abonoRestante > 0) {
                const detalleOriginal = detallesActualizadosMap.get(d.idDetalle);
                if (detalleOriginal) detallesActualizadosMap.set(d.idDetalle, aplicarAbono(detalleOriginal));
            }
        });
        detallesConsumo.forEach(d => {
             if (abonoRestante > 0) {
                const detalleOriginal = detallesActualizadosMap.get(d.idDetalle);
                if (detalleOriginal) detallesActualizadosMap.set(d.idDetalle, aplicarAbono(detalleOriginal));
            }
        });

        const detallesFinales = detallesOriginales.map(original => detallesActualizadosMap.get(original.idDetalle) || original);
        const nuevoSaldoTotal = detallesFinales.reduce((acc, item) => acc + item.saldo, 0);
        const ventaFinalizada = nuevoSaldoTotal < 0.01;

        transaction.update(ventaRef, {
            saldo: nuevoSaldoTotal,
            detalles: detallesFinales,
            estado: ventaFinalizada ? 'Pagada' : venta.estado,
        });

        // Actualizar contadores globales de ingresos
        if (abonoAplicadoAOtros > 0) transaction.update(generalesRef, { totalEfectivo: increment(abonoAplicadoAOtros) });
        if (abonoAplicadoAMesas > 0) transaction.update(generalesRef, { totalMesas: increment(abonoAplicadoAMesas) });
        if (abonoAplicadoAMonedas > 0) transaction.update(generalesRef, { totalVentasMonedas: increment(abonoAplicadoAMonedas) });
        
        // Si la venta estaba a crédito, descontar del contador de deuda global
        if (venta.estado === 'credito' && abonoAplicadoAMonedas > 0) {
            transaction.update(generalesRef, { totalMonedasCredito: increment(-abonoAplicadoAMonedas) });
        }

        const nuevoIdPago = (correlativoDoc.data()?.correlativo || 0) + 1;
        const pagoData: Omit<Pago, 'id'> = {
            idPago: nuevoIdPago,
            sucursalId: sucursalId,
            fecha: Timestamp.now(),
            idVenta: venta.idVenta,
            ventaDocId: ventaId,
            clienteNombre: venta.nombreCliente,
            montoTotalPagado: montoAbono,
            ventaTotal: venta.total,
            metodoPago: 'Efectivo',
            usuarioId,
            itemsSaldados,
        };
        transaction.set(doc(firestore, `sucursales/${sucursalId}/pagos`, nuevoIdPago.toString()), pagoData);
        transaction.set(correlativoPagosRef, { correlativo: nuevoIdPago }, { merge: true });
    });
}

/**
 * Procesa el pago de ítems específicos de una venta (Pendiente o Crédito).
 */
export async function procesarPagoVenta(
  firestore: Firestore, 
  sucursalId: string, 
  ventaId: string, 
  detalleIds: number[],
  metodoDePago: 'Efectivo' | 'Tarjeta',
  usuarioId: string
) {
    return runTransaction(firestore, async (transaction) => {
        const generalesRef = doc(firestore, `sucursales/${sucursalId}/generales`, 'actual');
        const ventaRef = doc(firestore, `sucursales/${sucursalId}/ventas`, ventaId);
        const correlativoPagosRef = doc(firestore, `sucursales/${sucursalId}/correlativos`, 'pagos');
        
        const [generalesSnap, ventaSnap, corrPagosSnap] = await Promise.all([
            transaction.get(generalesRef),
            transaction.get(ventaRef),
            transaction.get(correlativoPagosRef)
        ]);
        
        if (!ventaSnap.exists()) throw new Error("Venta no encontrada.");
        const ventaActual = ventaSnap.data() as Venta;
        let siguienteIdPago = (corrPagosSnap.data()?.correlativo || 0) + 1;

        let totalPagadoGlobal = 0;
        const resumenSaldados: Pago['itemsSaldados'] = [];

        let totalPagoEfectivoConsumo = 0, totalPagoEfectivoMesas = 0, totalPagoEfectivoMonedas = 0;
        let totalPagoTarjetaMonedas = 0, totalPagoTarjetaConsumo = 0, totalPagoTarjetaMesas = 0;

        const nuevosDetallesActual = ventaActual.detalles.map(detalle => {
            if (detalleIds.includes(detalle.idDetalle) && detalle.estado === 'Pendiente de pago') {
                const montoAPagar = detalle.saldo;
                totalPagadoGlobal += montoAPagar;
                
                resumenSaldados.push({
                    idDetalle: detalle.idDetalle,
                    nombreProducto: detalle.nombreProducto,
                    montoAplicado: montoAPagar,
                    subtotalItem: detalle.subtotal,
                    cantidad: detalle.cantidad,
                    esVirtual: !!detalle.esVirtual,
                    idProducto: detalle.idProducto
                });

                const esMesa = esAlquilerMesa(detalle.idProducto, detalle.nombreProducto);

                if (metodoDePago === 'Tarjeta') {
                    if (detalle.esVirtual) totalPagoTarjetaMonedas += montoAPagar;
                    else if (esMesa) totalPagoTarjetaMesas += montoAPagar;
                    else totalPagoTarjetaConsumo += montoAPagar;
                    
                    return { ...detalle, estado: 'Pagada', saldo: 0, pagadoTarjeta: (detalle.pagadoTarjeta || 0) + montoAPagar, metodoPago: (detalle.pagadoEfectivo > 0 ? 'Mixto' : 'Tarjeta') };
                } else {
                    if (detalle.esVirtual) totalPagoEfectivoMonedas += montoAPagar;
                    else if (esMesa) totalPagoEfectivoMesas += montoAPagar;
                    else totalPagoEfectivoConsumo += montoAPagar;
                    
                    return { ...detalle, estado: 'Pagada', saldo: 0, pagadoEfectivo: (detalle.pagadoEfectivo || 0) + montoAPagar, metodoPago: (detalle.pagadoTarjeta > 0 ? 'Mixto' : 'Efectivo') };
                }
            }
            return detalle;
        });

        const nuevoSaldoActual = nuevosDetallesActual.reduce((acc, item) => acc + item.saldo, 0);
        transaction.update(ventaRef, { 
            detalles: nuevosDetallesActual, 
            saldo: nuevoSaldoActual, 
            estado: nuevoSaldoActual < 0.01 ? 'Pagada' : ventaActual.estado 
        });
        
        // --- ACTUALIZAR GENERALES ---
        // Efectivo
        if (totalPagoEfectivoConsumo > 0) transaction.update(generalesRef, { totalEfectivo: increment(totalPagoEfectivoConsumo) });
        if (totalPagoEfectivoMesas > 0) transaction.update(generalesRef, { totalMesas: increment(totalPagoEfectivoMesas) });
        if (totalPagoEfectivoMonedas > 0) transaction.update(generalesRef, { totalVentasMonedas: increment(totalPagoEfectivoMonedas) });
        
        // Tarjeta
        const totalVentaTarjetaPeriodo = totalPagoTarjetaConsumo + totalPagoTarjetaMesas;
        if (totalVentaTarjetaPeriodo > 0) transaction.update(generalesRef, { totalVentasTarjeta: increment(totalVentaTarjetaPeriodo) });
        
        if (totalPagoTarjetaMonedas > 0) {
            transaction.update(generalesRef, { 
                totalMonedasTarjeta: increment(totalPagoTarjetaMonedas), 
                acumuladoMonedasTarjeta: increment(totalPagoTarjetaMonedas) 
            });
        }

        // Si la venta era a crédito, descontar la porción de monedas saldadas de la deuda global
        if (ventaActual.estado === 'credito') {
            const monedasSaldadasTotal = totalPagoEfectivoMonedas + totalPagoTarjetaMonedas;
            if (monedasSaldadasTotal > 0) {
                transaction.update(generalesRef, { totalMonedasCredito: increment(-monedasSaldadasTotal) });
            }
        }

        // Registrar documento de pago único
        if (totalPagadoGlobal > 0) {
            const pagoData: Omit<Pago, 'id'> = {
                idPago: siguienteIdPago,
                sucursalId: sucursalId,
                fecha: Timestamp.now(),
                idVenta: ventaActual.idVenta,
                ventaDocId: ventaId,
                clienteNombre: ventaActual.nombreCliente,
                montoTotalPagado: totalPagadoGlobal,
                ventaTotal: ventaActual.total,
                metodoPago: metodoDePago,
                usuarioId,
                itemsSaldados: resumenSaldados,
            };
            transaction.set(doc(firestore, `sucursales/${sucursalId}/pagos`, siguienteIdPago.toString()), pagoData);
            transaction.set(correlativoPagosRef, { correlativo: siguienteIdPago }, { merge: true });
        }
    });
}

/**
 * Liquida una venta como consumo interno (cortesía).
 */
export async function liquidarComoConsumoInterno(
  firestore: Firestore,
  sucursalId: string,
  ventaDocId: string,
  usuarioId: string
) {
  const sid = validarSucursal(sucursalId);
  const ventaRef = doc(firestore, `sucursales/${sid}/ventas`, ventaDocId);
  
  await updateDoc(ventaRef, { 
    estado: 'Pagada', 
    saldo: 0, 
    metodoPago: 'Consumo Interno' 
  });
}

/**
 * Pasa una venta pendiente al estado de crédito y actualiza el balance global de monedas si corresponde.
 */
export async function pasarVentaACredito(firestore: Firestore, sucursalId: string, ventaId: string) {
    const sid = validarSucursal(sucursalId);
    return runTransaction(firestore, async (transaction) => {
        const ventaRef = doc(firestore, `sucursales/${sid}/ventas`, ventaId);
        const generalesRef = doc(firestore, `sucursales/${sid}/generales`, "actual");

        const [ventaDoc, generalesDoc] = await Promise.all([
            transaction.get(ventaRef),
            transaction.get(generalesRef)
        ]);

        if (!ventaDoc.exists()) throw new Error("La venta a mover a crédito no existe.");
        
        const venta = ventaDoc.data() as Venta;
        const saldoMonedas = venta.detalles.filter(d => d.esVirtual).reduce((acc, item) => acc + item.saldo, 0);

        if (saldoMonedas > 0) {
            transaction.update(generalesRef, {
                totalMonedasCredito: increment(saldoMonedas)
            });
        }
        
        transaction.update(ventaRef, { 
          estado: 'credito',
          fueCredito: true // Marcador persistente para el historial
        });
    });
}

/**
 * Liquida una venta que estaba en estado de crédito completamente.
 * (Usado para pagos rápidos de saldo total).
 */
export async function liquidarVentaACredito(firestore: Firestore, sucursalId: string, ventaId: string, usuarioId: string) {
    const sid = validarSucursal(sucursalId);
    return runTransaction(firestore, async (transaction) => {
        const ventaRef = doc(firestore, `sucursales/${sid}/ventas`, ventaId);
        const generalesRef = doc(firestore, `sucursales/${sid}/generales`, "actual");
        const correlativoPagosRef = doc(firestore, `sucursales/${sid}/correlativos`, 'pagos');
        
        const [ventaSnap, generalesSnap, corrPagosSnap] = await Promise.all([
          transaction.get(ventaRef),
          transaction.get(generalesSnap),
          transaction.get(correlativoPagosRef)
        ]);

        if (!ventaSnap.exists()) throw new Error("La venta a crédito no existe.");
        
        const venta = ventaSnap.data() as Venta;
        
        // Calcular saldos pendientes reales por tipo
        const saldoMonedas = venta.detalles.filter(d => d.esVirtual).reduce((acc, item) => acc + item.saldo, 0);
        const saldoConsumo = venta.detalles.filter(d => !d.esVirtual && !esAlquilerMesa(d.idProducto, d.nombreProducto)).reduce((acc, item) => acc + item.saldo, 0);
        const saldoMesas = venta.detalles.filter(d => !d.esVirtual && esAlquilerMesa(d.idProducto, d.nombreProducto)).reduce((acc, item) => acc + item.saldo, 0);
        
        const totalALiquidar = saldoMonedas + saldoConsumo + saldoMesas;
        if (totalALiquidar <= 0) return { success: true };

        // 1. Actualizar Contadores Globales
        transaction.update(generalesRef, {
            totalVentasMonedas: increment(saldoMonedas),
            totalEfectivo: increment(saldoConsumo),
            totalMesas: increment(saldoMesas),
            totalMonedasCredito: increment(-saldoMonedas),
        });
        
        // 2. Marcar Venta como Pagada
        transaction.update(ventaRef, { estado: 'Pagada', saldo: 0, metodoPago: 'Mixto' });

        // 3. REGISTRAR EL PAGO
        const siguienteIdPago = (corrPagosSnap.data()?.correlativo || 0) + 1;
        const itemsSaldados = venta.detalles
            .filter(d => d.saldo > 0)
            .map(d => ({
                idDetalle: d.idDetalle,
                nombreProducto: d.nombreProducto,
                montoAplicado: d.saldo,
                subtotalItem: d.subtotal,
                cantidad: d.cantidad || 1,
                esVirtual: !!d.esVirtual,
                idProducto: d.idProducto
            }));

        const pagoData: Omit<Pago, 'id'> = {
            idPago: siguienteIdPago,
            sucursalId: sucursalId,
            fecha: Timestamp.now(),
            idVenta: venta.idVenta,
            ventaDocId: ventaId,
            clienteNombre: venta.nombreCliente,
            montoTotalPagado: totalALiquidar,
            ventaTotal: venta.total,
            metodoPago: 'Efectivo',
            usuarioId,
            itemsSaldados,
        };

        transaction.set(doc(firestore, `sucursales/${sid}/pagos`, siguienteIdPago.toString()), pagoData);
        transaction.set(correlativoPagosRef, { correlativo: siguienteIdPago }, { merge: true });

        return { success: true };
    });
}

/**
 * Procesa un Pago Unificado: Liquida ítems de la venta principal y/o deudas de crédito en un solo proceso.
 */
export async function procesarPagoUnificado(
    firestore: Firestore,
    sucursalId: string,
    usuarioId: string,
    params: {
        ventaPrincipalId: string;
        detalleIdsVentaPrincipal: number[];
        incluirCredito: boolean;
        clienteId: string;
        metodoDePago: 'Efectivo' | 'Tarjeta';
    }
) {
    const sid = validarSucursal(sucursalId);
    const { ventaPrincipalId, detalleIdsVentaPrincipal, incluirCredito, clienteId, metodoDePago } = params;

    return runTransaction(firestore, async (transaction) => {
        const generalesRef = doc(firestore, `sucursales/${sid}/generales`, 'actual');
        const corrPagosRef = doc(firestore, `sucursales/${sid}/correlativos`, 'pagos');
        
        // 1. LECTURAS
        const [generalesSnap, corrPagosSnap, ventaPrincipalSnap] = await Promise.all([
            transaction.get(generalesRef),
            transaction.get(corrPagosRef),
            transaction.get(doc(firestore, `sucursales/${sid}/ventas`, ventaPrincipalId))
        ]);

        let ventasCreditoDocs: any[] = [];
        if (incluirCredito) {
            const q = query(
                collection(firestore, `sucursales/${sid}/ventas`),
                where("clienteId", "==", clienteId),
                where("estado", "==", "credito")
            );
            const snap = await getDocs(q);
            ventasCreditoDocs = snap.docs;
        }

        let siguienteIdPago = (corrPagosSnap.data()?.correlativo || 0) + 1;
        
        // --- PROCESAMIENTO VENTA PRINCIPAL ---
        const ventaPrincipal = ventaPrincipalSnap.data() as Venta;
        const itemsAOperar = detalleIdsVentaPrincipal;

        let totalPagadoPrincipal = 0;
        let efeConsumo = 0, efeMesas = 0, efeMonedas = 0;
        let tarConsumo = 0, tarMesas = 0, tarMonedas = 0;
        const saldadosPrincipal: any[] = [];

        const nuevosDetallesPrincipal = ventaPrincipal.detalles.map(detalle => {
            if (itemsAOperar.includes(detalle.idDetalle) && detalle.estado === 'Pendiente de pago') {
                const monto = detalle.saldo;
                totalPagadoPrincipal += monto;
                saldadosPrincipal.push({
                    idDetalle: detalle.idDetalle, nombreProducto: detalle.nombreProducto, montoAplicado: monto, 
                    subtotalItem: detalle.subtotal, cantidad: detalle.cantidad, esVirtual: !!detalle.esVirtual, idProducto: detalle.idProducto
                });

                const esMesa = esAlquilerMesa(detalle.idProducto, detalle.nombreProducto);
                if (metodoDePago === 'Tarjeta') {
                    if (detalle.esVirtual) tarMonedas += monto; else if (esMesa) tarMesas += monto; else tarConsumo += monto;
                    return { ...detalle, estado: 'Pagada', saldo: 0, pagadoTarjeta: (detalle.pagadoTarjeta || 0) + monto, metodoPago: (detalle.pagadoEfectivo > 0 ? 'Mixto' : 'Tarjeta') };
                } else {
                    if (detalle.esVirtual) efeMonedas += monto; else if (esMesa) efeMesas += monto; else efeConsumo += monto;
                    return { ...detalle, estado: 'Pagada', saldo: 0, pagadoEfectivo: (detalle.pagadoEfectivo || 0) + monto, metodoPago: (detalle.pagadoTarjeta > 0 ? 'Mixto' : 'Efectivo') };
                }
            }
            return detalle;
        });

        const nuevoSaldoPrincipal = nuevosDetallesPrincipal.reduce((acc, item) => acc + item.saldo, 0);
        transaction.update(ventaPrincipalSnap.ref, { 
            detalles: nuevosDetallesPrincipal, 
            saldo: nuevoSaldoPrincipal, 
            estado: nuevoSaldoPrincipal < 0.01 ? 'Pagada' : ventaPrincipal.estado 
        });

        // --- PROCESAMIENTO VENTAS CRÉDITO ---
        for (const vDoc of ventasCreditoDocs) {
            const vData = vDoc.data() as Venta;
            let totalPagadoVenta = 0;
            const saldadosVenta: any[] = [];

            const nuevosDetalles = vData.detalles.map(detalle => {
                if (detalle.estado !== 'Pagada') {
                    const monto = detalle.saldo;
                    totalPagadoVenta += monto;
                    saldadosVenta.push({
                        idDetalle: detalle.idDetalle, nombreProducto: detalle.nombreProducto, montoAplicado: monto,
                        subtotalItem: detalle.subtotal, cantidad: detalle.cantidad, esVirtual: !!detalle.esVirtual, idProducto: detalle.idProducto
                    });

                    const esMesa = esAlquilerMesa(detalle.idProducto, detalle.nombreProducto);
                    if (metodoDePago === 'Tarjeta') {
                        if (detalle.esVirtual) tarMonedas += monto; else if (esMesa) tarMesas += monto; else tarConsumo += monto;
                        return { ...detalle, estado: 'Pagada', saldo: 0, pagadoTarjeta: (detalle.pagadoTarjeta || 0) + monto, metodoPago: (detalle.pagadoEfectivo > 0 ? 'Mixto' : 'Tarjeta') };
                    } else {
                        if (detalle.esVirtual) efeMonedas += monto; else if (esMesa) efeMesas += monto; else efeConsumo += monto;
                        return { ...detalle, estado: 'Pagada', saldo: 0, pagadoEfectivo: (detalle.pagadoEfectivo || 0) + monto, metodoPago: (detalle.pagadoTarjeta > 0 ? 'Mixto' : 'Efectivo') };
                    }
                }
                return detalle;
            });

            // Restar del contador global de monedas a crédito
            const monedasLiquidadasVenta = vData.detalles.filter(d => d.esVirtual).reduce((acc, d) => acc + d.saldo, 0);
            if (monedasLiquidadasVenta > 0) {
                transaction.update(generalesRef, { totalMonedasCredito: increment(-monedasLiquidadasVenta) });
            }

            transaction.update(vDoc.ref, { detalles: nuevosDetalles, saldo: 0, estado: 'Pagada', metodoPago: metodoDePago });

            // Registrar Pago para esta venta de crédito
            const idP = siguienteIdPago++;
            transaction.set(doc(firestore, `sucursales/${sid}/pagos`, idP.toString()), {
                idPago: idP, sucursalId: sid, fecha: Timestamp.now(), idVenta: vData.idVenta, ventaDocId: vDoc.id,
                clienteNombre: vData.nombreCliente, montoTotalPagado: totalPagadoVenta, ventaTotal: vData.total, 
                metodoPago: metodoDePago, usuarioId, itemsSaldados: saldadosVenta
            });
        }

        // --- ACTUALIZAR GENERALES Y REGISTRAR PAGO PRINCIPAL ---
        if (totalPagadoPrincipal > 0) {
            const idP = siguienteIdPago++;
            transaction.set(doc(firestore, `sucursales/${sid}/pagos`, idP.toString()), {
                idPago: idP, sucursalId: sid, fecha: Timestamp.now(), idVenta: ventaPrincipal.idVenta, ventaDocId: ventaPrincipalId,
                clienteNombre: ventaPrincipal.nombreCliente, montoTotalPagado: totalPagadoPrincipal, ventaTotal: ventaPrincipal.total,
                metodoPago: metodoDePago, usuarioId, itemsSaldados: saldadosPrincipal
            });
        }

        // Actualizar contadores globales con lo acumulado de todas las ventas procesadas
        if (efeConsumo > 0) transaction.update(generalesRef, { totalEfectivo: increment(efeConsumo) });
        if (efeMesas > 0) transaction.update(generalesRef, { totalMesas: increment(efeMesas) });
        if (efeMonedas > 0) transaction.update(generalesRef, { totalVentasMonedas: increment(efeMonedas) });
        
        const totalTarPeriodo = tarConsumo + tarMesas;
        if (totalTarPeriodo > 0) transaction.update(generalesRef, { totalVentasTarjeta: increment(totalTarPeriodo) });
        if (tarMonedas > 0) {
            transaction.update(generalesRef, { 
                totalMonedasTarjeta: increment(tarMonedas), 
                acumuladoMonedasTarjeta: increment(tarMonedas) 
            });
        }

        transaction.set(corrPagosRef, { correlativo: siguienteIdPago - 1 }, { merge: true });
    });
}
