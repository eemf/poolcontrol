'use client';
import { doc, runTransaction, Timestamp, Firestore, collection, query, where, getDocs, increment, updateDoc, getDoc, DocumentSnapshot, limit } from 'firebase/firestore';
import type { Venta, DetalleVenta, Pago, Producto, ProductoVirtual } from '@/lib/tipos';
import { getFullGenerales, validarSucursal } from './utils';
import { registrarMovimientoInventario } from './historial-inventario';
import { registrarAuditoria } from './auditoria';
import { analizarComando, type ComandoAnalizado } from '@/lib/utils/analizar-comando';

/**
 * Guarda una venta en Firestore y actualiza el stock de los productos.
 */
export async function guardarVentaYActualizarStock(
  firestore: Firestore,
  sucursalId: string,
  ventaId: string | null,
  ventaData: Omit<Venta, 'id' | 'idVenta' | 'fecha' | 'total' | 'saldo' | 'estado' | 'metodoPago' | 'sucursalId'>,
  usuarioId: string
) {
    // Capa B: Validación de aislamiento lógico
    const sid = validarSucursal(sucursalId);

    // Si no se proporcionó un ID, buscamos si ya existe una venta pendiente para este cliente
    // Esto previene la creación de cuentas duplicadas por latencia o doble ejecución
    let finalVentaId = ventaId;
    if (!finalVentaId) {
        const q = query(
            collection(firestore, `sucursales/${sid}/ventas`),
            where("clienteId", "==", ventaData.clienteId),
            where("estado", "==", "Pendiente de pago"),
            limit(1)
        );
        const existingSnap = await getDocs(q);
        if (!existingSnap.empty) {
            finalVentaId = existingSnap.docs[0].id;
        }
    }

    return runTransaction(firestore, async (transaction) => {
        // --- 1. FASE DE LECTURA (READS FIRST) ---
        const correlativoVentaRef = doc(firestore, `sucursales/${sid}/correlativos`, "ventas");
        const correlativoDetalleRef = doc(firestore, `sucursales/${sid}/correlativos`, "ventas_detalles");
        const correlativoHistorialRef = doc(firestore, `sucursales/${sid}/correlativos`, "historial_inventario");

        let ventaExistenteSnap;
        if (finalVentaId) {
          const ventaRef = doc(firestore, `sucursales/${sid}/ventas`, finalVentaId);
          ventaExistenteSnap = await transaction.get(ventaRef);
          // Si la búsqueda previa encontró un ID pero por alguna razón el doc no existe en el momento de la tx, se ignora y se crea una nueva
        }
        
        const [correlativoVentaDoc, correlativoDetalleDoc, correlativoHistorialDoc] = await Promise.all([
            transaction.get(correlativoVentaRef),
            transaction.get(correlativoDetalleRef),
            transaction.get(correlativoHistorialRef)
        ]);

        const itemsNuevos = ventaData.detalles.filter(d => d.idDetalle === 0 && d.idProducto !== 'item-manual');
        
        const productosRefs = itemsNuevos
            .filter(d => !d.esVirtual)
            .map(d => doc(firestore, `sucursales/${sid}/productos`, d.idProducto));
        
        const productosVirtualesRefs = itemsNuevos
            .filter(d => d.esVirtual)
            .map(d => doc(firestore, `sucursales/${sid}/productos_virtuales`, d.idProducto));
        
        const [productosDocs, productosVirtDocs] = await Promise.all([
            Promise.all(productosRefs.map(ref => transaction.get(ref))),
            Promise.all(productosVirtualesRefs.map(ref => transaction.get(ref)))
        ]);

        const productosMap = new Map(productosDocs.map((doc, i) => [productosRefs[i].id, doc]));
        const productosVirtMap = new Map(productosVirtDocs.map((doc, i) => [productosVirtualesRefs[i].id, doc]));
        
        // --- 2. FASE DE PROCESAMIENTO (IN-MEMORY) ---
        const ventaExistente = ventaExistenteSnap?.exists() ? (ventaExistenteSnap.data() as Venta) : undefined;

        const siguienteIdVenta = correlativoVentaDoc.exists() ? (correlativoVentaDoc.data().correlativo || 0) + 1 : 1;
        let siguienteIdDetalle = correlativoDetalleDoc.exists() ? (correlativoDetalleDoc.data().correlativo || 0) + 1 : 1;
        let siguienteIdHistorial = (correlativoHistorialDoc.data()?.correlativo || 0) + 1;

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
            sucursalId: sid,
            fecha: ventaExistente ? ventaExistente.fecha : Timestamp.now(),
            detalles: detallesProcesados,
            total: totalVenta,
            saldo: saldoVenta,
            estado: estadoVenta,
            metodoPago: ventaExistente?.metodoPago ?? null,
        };

        // --- 3. FASE DE ESCRITURA (WRITES LAST) ---
        const docIdFinal = ventaExistenteSnap?.id ?? idVentaFinal.toString();
        const ventaRef = doc(firestore, `sucursales/${sid}/ventas`, docIdFinal);

        // Comprobar si se eliminaron productos que estaban guardados en la venta existente
        const itemsEliminados = ventaExistente 
            ? ventaExistente.detalles.filter(oldDet => 
                oldDet.idDetalle !== 0 && 
                !detallesProcesados.some(newDet => newDet.idDetalle === oldDet.idDetalle)
              )
            : [];

        for (const detalle of itemsNuevos) {
            const map = detalle.esVirtual ? productosVirtMap : productosMap;
            const productoDoc = map.get(detalle.idProducto);
            
            if (productoDoc && productoDoc.exists()) {
                const existenciaDespuesDeDescuento = productoDoc.data()!.existencia || 0; 
                const existenciaAntesDeDescuento = existenciaDespuesDeDescuento + detalle.cantidad;
                
                registrarMovimientoInventario(transaction, firestore, sid, siguienteIdHistorial, {
                    productoId: detalle.idProducto,
                    nombreProducto: detalle.nombreProducto,
                    tipoMovimiento: 'Venta',
                    cantidad: -detalle.cantidad,
                    existenciaAnterior: existenciaAntesDeDescuento,
                    existenciaNueva: existenciaDespuesDeDescuento,
                    referencia: `Venta #${idVentaFinal}`,
                    usuarioId: usuarioId,
                });
                siguienteIdHistorial++;
            }
        }

        if (ventaExistente) {
            transaction.update(ventaRef, ventaCompleta);
        } else {
            transaction.set(ventaRef, ventaCompleta);
            transaction.set(correlativoVentaRef, { correlativo: siguienteIdVenta }, { merge: true });
        }

        transaction.set(correlativoDetalleRef, { correlativo: siguienteIdDetalle - 1 }, { merge: true });
        transaction.set(correlativoHistorialRef, { correlativo: siguienteIdHistorial - 1 }, { merge: true });

        const itemsAgregados = ventaExistente 
            ? ventaData.detalles.filter(d => d.idDetalle === 0) 
            : ventaData.detalles;

        const itemsParaMostrar = itemsAgregados.length > 0 ? itemsAgregados : ventaData.detalles;
        const resumenProductos = itemsParaMostrar
            .map(d => `${d.cantidad}x ${d.nombreProducto || 'Producto'} (Q${(d.subtotal || (d.cantidad * d.precioUnitario)).toFixed(2)})`)
            .join(', ');

        const resumenEliminados = itemsEliminados
            .map(d => `${d.cantidad}x ${d.nombreProducto || 'Producto'}`)
            .join(', ');

        const descPartes: string[] = [`${ventaData.nombreCliente || 'Cliente'} - Total: Q${totalVenta.toFixed(2)}`];
        if (resumenProductos) {
            descPartes.push(`${ventaExistente ? 'Agregó' : 'Productos'}: ${resumenProductos}`);
        }
        if (resumenEliminados) {
            descPartes.push(`Eliminó: ${resumenEliminados}`);
        }
        const descCompleta = descPartes.join(' • ');

        registrarAuditoria(firestore, sid, {
            usuarioId,
            categoria: 'VENTAS',
            accion: ventaExistente ? 'VENTA_EDITAR' : 'VENTA_CREAR',
            titulo: ventaExistente ? `Edición de venta #${idVentaFinal}` : `Nueva venta #${idVentaFinal}`,
            descripcion: descCompleta,
            detalles: {
                idVenta: idVentaFinal,
                clienteId: ventaData.clienteId,
                nombreCliente: ventaData.nombreCliente,
                total: totalVenta,
                saldo: saldoVenta,
                estado: estadoVenta,
                itemsAgregados: itemsParaMostrar.map(d => ({
                    nombre: d.nombreProducto || 'Producto',
                    cantidad: d.cantidad,
                    precioUnitario: d.precioUnitario,
                    subtotal: d.subtotal || (d.cantidad * d.precioUnitario)
                })),
                itemsEliminados: itemsEliminados.map(d => ({
                    nombre: d.nombreProducto || 'Producto',
                    cantidad: d.cantidad,
                    precioUnitario: d.precioUnitario,
                    subtotal: d.subtotal || (d.cantidad * d.precioUnitario)
                })),
                cantidadItemsTotal: detallesProcesados.length
            }
        }, transaction);

        return { ventaId: docIdFinal, idVenta: idVentaFinal };
    });
}

/**
 * Elimina un producto específico de una venta guardada en Firestore.
 * Reintegra el stock al inventario, registra el movimiento en el Kardex y crea la auditoría correspondiente.
 */
export async function eliminarProductoDeVenta(
    firestore: Firestore,
    sucursalId: string,
    ventaDocId: string,
    itemAEliminar: DetalleVenta,
    usuarioId: string
) {
    const sid = validarSucursal(sucursalId);

    return runTransaction(firestore, async (transaction) => {
        const ventaRef = doc(firestore, `sucursales/${sid}/ventas`, ventaDocId);
        const correlativoHistorialRef = doc(firestore, `sucursales/${sid}/correlativos`, "historial_inventario");

        // 1. FASE DE LECTURAS (READS FIRST)
        const [ventaDoc, correlativoHistorialDoc] = await Promise.all([
            transaction.get(ventaRef),
            transaction.get(correlativoHistorialRef)
        ]);

        if (!ventaDoc.exists()) {
            throw new Error("La venta a la que pertenece este producto no existe o fue eliminada.");
        }

        const ventaData = ventaDoc.data() as Venta;

        // Leer producto principal si no es manual
        let productoDoc: DocumentSnapshot | null = null;
        let productoRef: any = null;
        if (itemAEliminar.idProducto !== 'item-manual') {
            const coll = itemAEliminar.esVirtual ? 'productos_virtuales' : 'productos';
            productoRef = doc(firestore, `sucursales/${sid}/${coll}`, itemAEliminar.idProducto);
            productoDoc = await transaction.get(productoRef);
        }

        // Leer ingredientes si correspondiera
        const ingredientesDocs: { ref: any; doc: DocumentSnapshot; cantidad: number }[] = [];
        if (!itemAEliminar.esVirtual && itemAEliminar.ingredientesConsumidos && itemAEliminar.ingredientesConsumidos.length > 0) {
            for (const ing of itemAEliminar.ingredientesConsumidos) {
                const ingRef = doc(firestore, `sucursales/${sid}/productos`, ing.productoId);
                const ingDoc = await transaction.get(ingRef);
                ingredientesDocs.push({ ref: ingRef, doc: ingDoc, cantidad: ing.cantidad * itemAEliminar.cantidad });
            }
        }

        // 2. FASE DE PROCESAMIENTO
        let eliminado = false;
        const nuevosDetalles = ventaData.detalles.filter(d => {
            if (!eliminado) {
                const coincideId = itemAEliminar.idDetalle && itemAEliminar.idDetalle > 0 && d.idDetalle === itemAEliminar.idDetalle;
                const coincideProducto = d.idProducto === itemAEliminar.idProducto && d.cantidad === itemAEliminar.cantidad && d.precioUnitario === itemAEliminar.precioUnitario;
                if (coincideId || coincideProducto) {
                    eliminado = true;
                    return false;
                }
            }
            return true;
        });

        const nuevoTotal = nuevosDetalles.reduce((acc, item) => acc + (item.subtotal || 0), 0);
        const nuevoSaldo = nuevosDetalles.reduce((acc, item) => acc + (item.saldo || 0), 0);
        const nuevoEstado = nuevoSaldo < 0.01 ? 'Pagada' : 'Pendiente de pago';

        let siguienteIdHistorial = (correlativoHistorialDoc.data()?.correlativo || 0) + 1;

        // 3. FASE DE ESCRITURAS (WRITES LAST)
        // A. Actualizar existencia y registrar en Kardex
        if (productoRef && productoDoc && productoDoc.exists()) {
            const existenciaAnterior = productoDoc.data()!.existencia || 0;
            const cantidadADevolver = itemAEliminar.cantidad;
            const existenciaNueva = existenciaAnterior + cantidadADevolver;

            transaction.update(productoRef, { existencia: existenciaNueva });

            registrarMovimientoInventario(transaction, firestore, sid, siguienteIdHistorial++, {
                productoId: itemAEliminar.idProducto,
                nombreProducto: itemAEliminar.nombreProducto,
                tipoMovimiento: 'Producto Eliminado',
                cantidad: cantidadADevolver,
                existenciaAnterior,
                existenciaNueva,
                referencia: `Eliminado de Venta #${ventaData.idVenta}`,
                usuarioId,
            });
        }

        // B. Reintegrar ingredientes a existencia y Kardex
        for (const ingInfo of ingredientesDocs) {
            if (ingInfo.doc.exists()) {
                const exAnt = ingInfo.doc.data()!.existencia || 0;
                const exNue = exAnt + ingInfo.cantidad;
                transaction.update(ingInfo.ref, { existencia: exNue });

                registrarMovimientoInventario(transaction, firestore, sid, siguienteIdHistorial++, {
                    productoId: ingInfo.ref.id,
                    nombreProducto: ingInfo.doc.data()!.nombre || 'Ingrediente',
                    tipoMovimiento: 'Producto Eliminado',
                    cantidad: ingInfo.cantidad,
                    existenciaAnterior: exAnt,
                    existenciaNueva: exNue,
                    referencia: `Eliminado de Venta #${ventaData.idVenta}`,
                    usuarioId,
                });
            }
        }

        // C. Actualizar correlativo de historial
        transaction.set(correlativoHistorialRef, { correlativo: siguienteIdHistorial - 1 }, { merge: true });

        // D. Actualizar documento de venta
        transaction.update(ventaRef, {
            detalles: nuevosDetalles,
            total: nuevoTotal,
            saldo: nuevoSaldo,
            estado: nuevoEstado,
        });

        // E. Registrar Auditoría
        const precioUnitario = itemAEliminar.precioUnitario || 0;
        const subtotal = itemAEliminar.subtotal || (itemAEliminar.cantidad * precioUnitario);

        registrarAuditoria(firestore, sid, {
            usuarioId,
            categoria: 'VENTAS',
            accion: 'VENTA_ELIMINAR_PRODUCTO',
            titulo: `Producto eliminado de venta #${ventaData.idVenta}`,
            descripcion: `Se eliminó ${itemAEliminar.cantidad}x ${itemAEliminar.nombreProducto} (Q${subtotal.toFixed(2)}) de la venta #${ventaData.idVenta} (${ventaData.nombreCliente || 'Cliente'})`,
            detalles: {
                idVenta: ventaData.idVenta,
                ventaId: ventaDocId,
                clienteId: ventaData.clienteId,
                nombreCliente: ventaData.nombreCliente,
                productoEliminado: itemAEliminar.nombreProducto,
                cantidad: itemAEliminar.cantidad,
                precioUnitario,
                subtotal,
                itemsEliminados: [{
                    nombre: itemAEliminar.nombreProducto,
                    cantidad: itemAEliminar.cantidad,
                    precioUnitario,
                    subtotal,
                }],
                itemsDevueltos: [{
                    nombre: itemAEliminar.nombreProducto,
                    cantidad: itemAEliminar.cantidad,
                    precioUnitario,
                    subtotal,
                }],
                totalAnterior: ventaData.total,
                totalNuevo: nuevoTotal,
                saldoAnterior: ventaData.saldo,
                saldoNuevo: nuevoSaldo,
            }
        }, transaction);

        return {
            nuevosDetalles,
            nuevoTotal,
            nuevoSaldo,
            idVenta: ventaData.idVenta,
            nombreCliente: ventaData.nombreCliente,
        };
    });
}

/**
 * Anula una venta y devuelve el stock de los productos involucrados.
 */
export async function cancelarVentaYDevolverStock(
    firestore: Firestore, 
    sucursalId: string, 
    ventaId: string | null, 
    itemsADevolver: DetalleVenta[], 
    usuarioId: string,
    eliminarVenta: boolean = false
) {
    const sid = validarSucursal(sucursalId);

    return runTransaction(firestore, async (transaction) => {
        const correlativoHistorialRef = doc(firestore, `sucursales/${sid}/correlativos`, "historial_inventario");
        const correlativoHistorialDoc = await transaction.get(correlativoHistorialRef);
        let siguienteIdHistorial = (correlativoHistorialDoc.data()?.correlativo || 0) + 1;

        for (const item of itemsADevolver) {
            if (item.idProducto !== 'item-manual') {
                const coll = item.esVirtual ? 'productos_virtuales' : 'productos';
                const productoRef = doc(firestore, `sucursales/${sid}/${coll}`, item.idProducto);
                const productoDoc = await transaction.get(productoRef);
                
                if (productoDoc.exists()) {
                    const existenciaAnterior = productoDoc.data().existencia || 0;
                    const cantidadADevolver = item.cantidad;
                    const existenciaNueva = existenciaAnterior + cantidadADevolver;

                    transaction.update(productoRef, { existencia: existenciaNueva });

                    registrarMovimientoInventario(transaction, firestore, sid, siguienteIdHistorial, {
                        productoId: item.idProducto,
                        nombreProducto: item.nombreProducto,
                        tipoMovimiento: 'Venta Anulada',
                        cantidad: cantidadADevolver,
                        existenciaAnterior,
                        existenciaNueva,
                        referencia: eliminarVenta ? `Anulación en POS (Venta #${ventaId})` : `Descarte de edición en POS (Venta #${ventaId || 'Borrador'})`,
                        usuarioId,
                    });
                    siguienteIdHistorial++;
                }

                if (!item.esVirtual && item.ingredientesConsumidos) {
                    for (const ingredicate of item.ingredientesConsumidos) {
                        const ingredienteRef = doc(firestore, `sucursales/${sid}/productos`, ingredicate.productoId);
                        const ingredienteDoc = await transaction.get(ingredicate.productoId.startsWith('/') ? doc(firestore, ingredicate.productoId) : doc(firestore, `sucursales/${sid}/productos`, ingredicate.productoId));
                        if (ingredienteDoc.exists()) {
                            const existenciaAnterior = ingredienteDoc.data().existencia || 0;
                            const cantidadADevolver = ingredicate.cantidad * item.cantidad;
                            const existenciaNueva = existenciaAnterior + cantidadADevolver;
                            
                            transaction.update(ingredienteRef, { existencia: existenciaNueva });

                             registrarMovimientoInventario(transaction, firestore, sid, siguienteIdHistorial, {
                                productoId: ingredicate.productoId,
                                nombreProducto: ingredienteDoc.data().nombre, 
                                tipoMovimiento: 'Venta Anulada',
                                cantidad: cantidadADevolver,
                                existenciaAnterior,
                                existenciaNueva,
                                referencia: eliminarVenta ? `Anulación en POS (Venta #${ventaId})` : `Descarte de edición en POS (Venta #${ventaId || 'Borrador'})`,
                                usuarioId,
                            });
                            siguienteIdHistorial++;
                        }
                    }
                }
            }
        }
        
        transaction.set(correlativoHistorialRef, { correlativo: siguienteIdHistorial - 1 }, { merge: true });

        if (ventaId && eliminarVenta) {
            const ventaRef = doc(firestore, `sucursales/${sid}/ventas`, ventaId);
            transaction.delete(ventaRef);
        }

        const resumenDevueltos = itemsADevolver
            .map(i => `${i.cantidad}x ${i.nombreProducto}`)
            .join(', ');

        registrarAuditoria(firestore, sid, {
            usuarioId,
            categoria: 'VENTAS',
            accion: eliminarVenta ? 'VENTA_ANULAR' : 'VENTA_EDITAR_DESCARTAR',
            titulo: eliminarVenta ? `Anulación de venta #${ventaId || 'desconocida'}` : `Descarte de ítems sin guardar en venta #${ventaId || 'Borrador'}`,
            descripcion: eliminarVenta ? `Devolución al inventario: ${resumenDevueltos || `${itemsADevolver.length} ítems`}` : `Devolución al inventario de ítems sin guardar: ${resumenDevueltos || `${itemsADevolver.length} ítems`}`,
            detalles: {
                ventaId,
                itemsDevueltos: itemsADevolver.map(i => ({ nombre: i.nombreProducto, cantidad: i.cantidad })),
                itemsEliminados: itemsADevolver.map(i => ({ 
                    nombre: i.nombreProducto, 
                    cantidad: i.cantidad,
                    precioUnitario: i.precioUnitario,
                    subtotal: i.subtotal || (i.cantidad * i.precioUnitario)
                }))
            }
        }, transaction);
    });
}

/**
 * Procesa una venta rápida basada en un comando analizado.
 */
export async function procesarVentaRapidaConId(
  firestore: Firestore,
  sucursalId: string,
  usuarioId: string,
  comando: ComandoAnalizado,
  productoId: string,
  productoData: Producto | ProductoVirtual,
  esVirtual: boolean,
  metodoPago: 'Efectivo' | 'Tarjeta' = 'Efectivo'
) {
    const sid = validarSucursal(sucursalId);
    const productoRef = doc(firestore, `sucursales/${sid}/${esVirtual ? 'productos_virtuales' : 'productos'}`, productoId);

    return runTransaction(firestore, async (transaction) => {
        const [productoDoc, generalesDoc, corrVentaDoc, corrPagoDoc, corrDetalleDoc, corrHistorialDoc] = await Promise.all([
            transaction.get(productoRef),
            transaction.get(doc(firestore, `sucursales/${sid}/generales`, 'actual')),
            transaction.get(doc(firestore, `sucursales/${sid}/correlativos`, 'ventas')),
            transaction.get(doc(firestore, `sucursales/${sid}/correlativos`, 'pagos')),
            transaction.get(doc(firestore, `sucursales/${sid}/correlativos`, 'ventas_detalles')),
            transaction.get(doc(firestore, `sucursales/${sid}/correlativos`, 'historial_inventario'))
        ]);

        if (!productoDoc.exists()) {
            throw new Error(`El producto ya no se encuentra disponible.`);
        }
        
        const baseProductoData = productoDoc.data() as Producto | ProductoVirtual;
        const generalesActual = getFullGenerales(generalesDoc.data());
        
        const existenciaActual = baseProductoData.existencia ?? 0;
        if (existenciaActual < comando.cantidad) {
            throw new Error(`Stock insuficiente para "${baseProductoData.nombre}". Existencia disponible: ${existenciaActual}, cantidad solicitada: ${comando.cantidad}.`);
        }

        let nombreVenta = baseProductoData.nombre;
        let precioUnitario = baseProductoData.precioVenta;
        let ingredientesConsumidos: any[] = [];

        // Captura de rastro de stock para notificación
        const stockInfo = {
            producto: {
                nombre: baseProductoData.nombre,
                inicial: existenciaActual,
                final: existenciaActual - comando.cantidad
            },
            ingredientes: [] as { nombre: string; inicial: number; final: number; }[]
        };

        if (!esVirtual && comando.indicePreparacion !== undefined && 'preparaciones' in baseProductoData) {
            const preparaciones = baseProductoData.preparaciones || [];
            const prep = preparaciones[comando.indicePreparacion];
            if (prep) {
                nombreVenta = `${baseProductoData.nombre} (${prep.nombre})`;
                precioUnitario = prep.precioVenta;
                ingredientesConsumidos = prep.ingredientes || [];
                stockInfo.producto.nombre = nombreVenta; // Actualizar nombre para la notificación
            }
        }

        const ingredientesSnapsMap = new Map();
        if (ingredientesConsumidos.length > 0) {
            const ingRefs = ingredientesConsumidos.map(ing => doc(firestore, `sucursales/${sid}/productos`, ing.productoId));
            const ingSnaps = await Promise.all(ingRefs.map(ref => transaction.get(ref)));
            ingSnaps.forEach((snap, i) => {
                const ingId = ingredientesConsumidos[i].productoId;
                ingredientesSnapsMap.set(ingId, snap);
                
                if (snap.exists()) {
                    const cantARestar = ingredientesConsumidos[i].cantidad * comando.cantidad;
                    const inicial = snap.data().existencia ?? 0;
                    if (inicial < cantARestar) {
                        throw new Error(`Stock insuficiente del ingrediente "${snap.data().nombre}". Existencia disponible: ${inicial}, cantidad requerida: ${cantARestar}.`);
                    }
                    stockInfo.ingredientes.push({
                        nombre: snap.data().nombre,
                        inicial,
                        final: inicial - cantARestar
                    });
                }
            });
        }
        
        const totalVenta = comando.cantidad * precioUnitario;
        const nuevoIdVenta = (corrVentaDoc.data()?.correlativo || 0) + 1;
        const nuevoIdPago = (corrPagoDoc.data()?.correlativo || 0) + 1;
        const nuevoIdDetalle = (corrDetalleDoc.data()?.correlativo || 0) + 1;
        let siguienteIdHistorial = (corrHistorialDoc.data()?.correlativo || 0) + 1;

        const detalle: DetalleVenta = {
            idDetalle: nuevoIdDetalle, idProducto: productoId, nombreProducto: nombreVenta,
            cantidad: comando.cantidad, precioUnitario, subtotal: totalVenta, saldo: 0,
            pagadoEfectivo: metodoPago === 'Efectivo' ? totalVenta : 0, 
            pagadoTarjeta: metodoPago === 'Tarjeta' ? totalVenta : 0, 
            metodoPago: metodoPago,
            estado: 'Pagada', fechaAgregado: Timestamp.now(),
            esVirtual: esVirtual,
            ingredientesConsumidos: ingredientesConsumidos
        };
        
        const ventaData: Omit<Venta, 'id'> = {
            idVenta: nuevoIdVenta, 
            sucursalId: sid,
            fecha: Timestamp.now(),
            clienteId: '0', nombreCliente: 'Venta Rápida', total: totalVenta, saldo: 0,
            tipoVenta: 'Rapida', metodoPago: metodoPago, estado: 'Pagada', detalles: [detalle],
        };
        
        const pagoData: Omit<Pago, 'id'> = {
            idPago: nuevoIdPago, 
            sucursalId: sid,
            fecha: Timestamp.now(),
            idVenta: nuevoIdVenta, ventaDocId: nuevoIdVenta.toString(), clienteNombre: 'Venta Rápida',
            montoTotalPagado: totalVenta, ventaTotal: totalVenta, metodoPago: metodoPago, usuarioId,
            itemsSaldados: [{ idDetalle: detalle.idDetalle, nombreProducto: detalle.nombreProducto, montoAplicado: totalVenta, subtotalItem: totalVenta, cantidad: comando.cantidad, esVirtual: esVirtual }]
        };

        const nuevaVentaRef = doc(firestore, `sucursales/${sid}/ventas`, nuevoIdVenta.toString());
        const nuevoPagoRef = doc(firestore, `sucursales/${sid}/pagos`, nuevoIdPago.toString());
        
        transaction.set(nuevaVentaRef, ventaData);
        transaction.set(nuevoPagoRef, pagoData);

        if (esVirtual) {
            transaction.update(productoRef, { existencia: increment(-comando.cantidad) });
            if (metodoPago === 'Efectivo') {
              transaction.update(doc(firestore, `sucursales/${sid}/generales`, 'actual'), {
                  totalVentasMonedas: increment(totalVenta)
              });
            } else {
              transaction.update(doc(firestore, `sucursales/${sid}/generales`, 'actual'), {
                  totalMonedasTarjeta: increment(totalVenta),
                  acumuladoMonedasTarjeta: increment(totalVenta)
              });
            }
        } else {
            transaction.update(productoRef, { existencia: increment(-comando.cantidad) });
            if (metodoPago === 'Efectivo') {
              transaction.update(doc(firestore, `sucursales/${sid}/generales`, 'actual'), { totalEfectivo: increment(totalVenta) });
            } else {
              transaction.update(doc(firestore, `sucursales/${sid}/generales`, 'actual'), { totalVentasTarjeta: increment(totalVenta) });
            }
            
            for (const ing of ingredientesConsumidos) {
                const ingSnap = ingredientesSnapsMap.get(ing.productoId);
                if (ingSnap && ingSnap.exists()) {
                    const cantARestar = ing.cantidad * comando.cantidad;
                    transaction.update(ingSnap.ref, { existencia: increment(-cantARestar) });
                    
                    registrarMovimientoInventario(transaction, firestore, sid, siguienteIdHistorial++, {
                        productoId: ing.productoId,
                        nombreProducto: ingSnap.data().nombre,
                        tipoMovimiento: 'Venta',
                        cantidad: -cantARestar,
                        existenciaAnterior: ingSnap.data().existencia || 0,
                        existenciaNueva: (ingSnap.data().existencia || 0) - cantARestar,
                        referencia: `Venta Rápida #${nuevoIdVenta} (Ingrediente)`,
                        usuarioId,
                    });
                }
            }
        }
        
        registrarMovimientoInventario(transaction, firestore, sid, siguienteIdHistorial++, {
            productoId: productoId,
            nombreProducto: nombreVenta,
            tipoMovimiento: 'Venta',
            cantidad: -comando.cantidad,
            existenciaAnterior: (baseProductoData as any).existencia || 0,
            existenciaNueva: ((baseProductoData as any).existencia || 0) - comando.cantidad,
            referencia: `Venta Rápida #${nuevoIdVenta}`,
            usuarioId,
        });

        transaction.set(doc(firestore, `sucursales/${sid}/correlativos`, 'ventas'), { correlativo: nuevoIdVenta }, { merge: true });
        transaction.set(doc(firestore, `sucursales/${sid}/correlativos`, 'pagos'), { correlativo: nuevoIdPago }, { merge: true });
        transaction.set(doc(firestore, `sucursales/${sid}/correlativos`, 'ventas_detalles'), { correlativo: nuevoIdDetalle }, { merge: true });
        transaction.set(doc(firestore, `sucursales/${sid}/correlativos`, 'historial_inventario'), { correlativo: siguienteIdHistorial - 1 }, { merge: true });

        registrarAuditoria(firestore, sid, {
            usuarioId,
            categoria: 'VENTAS',
            accion: 'VENTA_RAPIDA',
            titulo: `Venta Rápida #${nuevoIdVenta}`,
            descripcion: `${comando.cantidad}x ${nombreVenta} - Q${totalVenta.toFixed(2)} (Efectivo)`,
            detalles: {
                idVenta: nuevoIdVenta,
                idPago: nuevoIdPago,
                producto: nombreVenta,
                cantidad: comando.cantidad,
                total: totalVenta,
                esVirtual
            }
        }, transaction);

        return { nombreProducto: nombreVenta, cantidad: comando.cantidad, totalVenta, stockInfo };
    });
}

/**
 * Sincroniza el contador estático totalMonedasCredito en generales/actual
 * basándose en la suma real de las ventas en estado 'credito'.
 */
export async function sincronizarContadorCredito(firestore: Firestore, sucursalId: string) {
    const q = query(
        collection(firestore, `sucursales/${sucursalId}/ventas`), 
        where('estado', '==', 'credito')
    );
    const snap = await getDocs(q);
    
    let totalReal = 0;
    snap.docs.forEach(d => {
        const v = d.data() as Venta;
        totalReal += v.detalles
            .filter(det => det.esVirtual)
            .reduce((acc, det) => acc + det.saldo, 0);
    });
    
    const ref = doc(firestore, `sucursales/${sucursalId}/generales`, 'actual');
    const genSnap = await getDoc(ref);
    
    if (genSnap.exists()) {
        const dataActual = genSnap.data();
        if (Math.abs((dataActual.totalMonedasCredito || 0) - totalReal) > 0.01) {
            await updateDoc(ref, { totalMonedasCredito: totalReal });
        }
    }
    
    return totalReal;
}
