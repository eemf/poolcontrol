import type { Promocion, TipoPromocion } from '@/lib/tipos';

export interface ItemParaPromocion {
  id: string;
  productoId: string;
  nombre: string;
  precioVenta: number;
  cantidad: number;
  omitirPromocion?: boolean;
}

export interface PromocionAplicadaInfo {
  id: string;
  nombre: string;
  tipo: TipoPromocion;
  descuento: number;
}

export interface ResultadoPromocionItem {
  id: string;
  productoId: string;
  cantidad: number;
  precioOriginal: number;
  subtotalOriginal: number;
  subtotalFinal: number;
  precioUnitarioEfectivo: number;
  descuento: number;
  promocionAplicada?: PromocionAplicadaInfo;
}

function redondearMoneda(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

function aFecha(valor: any): Date | null {
  if (!valor) return null;
  if (valor instanceof Date) return isNaN(valor.getTime()) ? null : valor;
  if (typeof valor?.toDate === 'function') {
    const d = valor.toDate();
    return d instanceof Date && !isNaN(d.getTime()) ? d : null;
  }
  const d = new Date(valor);
  return isNaN(d.getTime()) ? null : d;
}

function horaAMinutos(hhmm: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec((hhmm || '').trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

/**
 * Verifica si una promoción está activa y vigente para la fecha/hora indicada.
 */
export function esPromocionVigente(promo: Promocion, ahora: Date = new Date()): boolean {
  if (!promo.activa) return false;

  const v = promo.vigencia;
  if (!v) return true;

  const inicio = aFecha(v.fechaInicio);
  if (inicio && ahora < inicio) return false;

  const fin = aFecha(v.fechaFin);
  if (fin && ahora > fin) return false;

  if (Array.isArray(v.diasSemana) && v.diasSemana.length > 0) {
    if (!v.diasSemana.includes(ahora.getDay())) return false;
  }

  if (v.horaInicio && v.horaFin) {
    const minInicio = horaAMinutos(v.horaInicio);
    const minFin = horaAMinutos(v.horaFin);
    if (minInicio !== null && minFin !== null) {
      const minActual = ahora.getHours() * 60 + ahora.getMinutes();
      if (minInicio <= minFin) {
        if (minActual < minInicio || minActual > minFin) return false;
      } else {
        // Rango nocturno que cruza medianoche (ej. 22:00 - 02:00)
        if (minActual < minInicio && minActual > minFin) return false;
      }
    }
  }

  return true;
}

/**
 * Calcula el subtotal promocional para una cantidad de un mismo producto.
 */
function calcularSubtotalConReglaIndividual(
  promo: Promocion,
  precioBase: number,
  cantidad: number
): number {
  const subtotalNormal = redondearMoneda(precioBase * cantidad);

  switch (promo.tipo) {
    case 'nxm': {
      const lleva = Math.floor(promo.cantidadLleva || 0);
      const paga = Math.floor(promo.cantidadPaga || 0);
      if (lleva <= 1 || paga <= 0 || paga >= lleva || cantidad < lleva) {
        return subtotalNormal;
      }
      const bloques = Math.floor(cantidad / lleva);
      const restantes = cantidad % lleva;
      const unidadesCobradas = bloques * paga + restantes;
      return redondearMoneda(unidadesCobradas * precioBase);
    }

    case 'precio_especial': {
      const precioPromo = Number(promo.precioPromocion);
      if (isNaN(precioPromo) || precioPromo < 0 || precioPromo >= precioBase) {
        return subtotalNormal;
      }
      return redondearMoneda(cantidad * precioPromo);
    }

    case 'combo': {
      const req = Math.floor(promo.cantidadRequerida || 0);
      const precioPaquete = Number(promo.precioPaquete);
      if (req <= 0 || isNaN(precioPaquete) || precioPaquete < 0 || cantidad < req) {
        return subtotalNormal;
      }
      const bloques = Math.floor(cantidad / req);
      const restantes = cantidad % req;
      return redondearMoneda(bloques * precioPaquete + restantes * precioBase);
    }

    case 'porcentaje': {
      const pct = Number(promo.porcentajeDescuento);
      if (isNaN(pct) || pct <= 0 || pct > 100) {
        return subtotalNormal;
      }
      return redondearMoneda(subtotalNormal * (1 - pct / 100));
    }

    default:
      return subtotalNormal;
  }
}

/**
 * Evalúa la mejor promoción individual para un ítem del carrito.
 */
export function evaluarPromocionItem(
  item: ItemParaPromocion,
  promociones: Promocion[],
  ahora: Date = new Date()
): ResultadoPromocionItem {
  const cantidad = Math.max(0, item.cantidad);
  const precioBase = Math.max(0, item.precioVenta);
  const subtotalOriginal = redondearMoneda(precioBase * cantidad);

  const baseResultado: ResultadoPromocionItem = {
    id: item.id,
    productoId: item.productoId,
    cantidad,
    precioOriginal: precioBase,
    subtotalOriginal,
    subtotalFinal: subtotalOriginal,
    precioUnitarioEfectivo: precioBase,
    descuento: 0,
  };

  if (item.omitirPromocion || cantidad <= 0 || precioBase <= 0) {
    return baseResultado;
  }

  let mejorSubtotal = subtotalOriginal;
  let mejorPromo: Promocion | null = null;

  for (const promo of promociones) {
    if (!promo.productosIds?.includes(item.productoId)) continue;
    if (!esPromocionVigente(promo, ahora)) continue;

    const candidato = calcularSubtotalConReglaIndividual(promo, precioBase, cantidad);
    if (candidato < mejorSubtotal) {
      mejorSubtotal = candidato;
      mejorPromo = promo;
    }
  }

  if (!mejorPromo) {
    return baseResultado;
  }

  const descuento = redondearMoneda(subtotalOriginal - mejorSubtotal);
  return {
    id: item.id,
    productoId: item.productoId,
    cantidad,
    precioOriginal: precioBase,
    subtotalOriginal,
    subtotalFinal: mejorSubtotal,
    precioUnitarioEfectivo: redondearMoneda(mejorSubtotal / cantidad),
    descuento,
    promocionAplicada: {
      id: mejorPromo.id,
      nombre: mejorPromo.nombre,
      tipo: mejorPromo.tipo,
      descuento,
    },
  };
}

/**
 * Evalúa promociones sobre todo el carrito, incluyendo promociones NxM combinables
 * entre distintos productos de la misma promoción (ej. 2x1 en gaseosas variadas).
 */
export function calcularPromocionesCarrito(
  items: ItemParaPromocion[],
  promociones: Promocion[],
  ahora: Date = new Date()
): ResultadoPromocionItem[] {
  const resultados = items.map((item) => evaluarPromocionItem(item, promociones, ahora));

  const promosCombinables = promociones.filter(
    (p) =>
      p.tipo === 'nxm' &&
      p.combinable === true &&
      (p.cantidadLleva || 0) > 1 &&
      (p.cantidadPaga || 0) > 0 &&
      (p.cantidadPaga || 0) < (p.cantidadLleva || 0) &&
      esPromocionVigente(p, ahora)
  );

  for (const promo of promosCombinables) {
    const lleva = Math.floor(promo.cantidadLleva!);
    const paga = Math.floor(promo.cantidadPaga!);
    const gratisPorBloque = lleva - paga;

    const indicesElegibles = items
      .map((item, idx) => ({ item, idx }))
      .filter(
        ({ item }) =>
          !item.omitirPromocion &&
          item.cantidad > 0 &&
          item.precioVenta > 0 &&
          promo.productosIds?.includes(item.productoId)
      );

    const totalUnidades = indicesElegibles.reduce((acc, { item }) => acc + item.cantidad, 0);
    if (totalUnidades < lleva) continue;

    // Expandir unidades para otorgar gratis las de menor precio por cada bloque de N
    const unidades: { idx: number; precio: number }[] = [];
    for (const { item, idx } of indicesElegibles) {
      for (let u = 0; u < item.cantidad; u++) {
        unidades.push({ idx, precio: item.precioVenta });
      }
    }
    unidades.sort((a, b) => a.precio - b.precio);

    const bloques = Math.floor(totalUnidades / lleva);
    const totalGratis = bloques * gratisPorBloque;
    const descuentoPorIdx = new Map<number, number>();
    let descuentoTotalCombinable = 0;

    for (let i = 0; i < totalGratis; i++) {
      const u = unidades[i];
      descuentoTotalCombinable = redondearMoneda(descuentoTotalCombinable + u.precio);
      descuentoPorIdx.set(u.idx, redondearMoneda((descuentoPorIdx.get(u.idx) || 0) + u.precio));
    }

    const descuentoIndividualActual = indicesElegibles.reduce(
      (acc, { idx }) => redondearMoneda(acc + resultados[idx].descuento),
      0
    );

    // Solo aplicar la versión combinable si supera el ahorro individual ya encontrado
    if (descuentoTotalCombinable > descuentoIndividualActual) {
      for (const { idx } of indicesElegibles) {
        const desc = descuentoPorIdx.get(idx) || 0;
        const orig = resultados[idx].subtotalOriginal;
        const final = redondearMoneda(Math.max(0, orig - desc));
        resultados[idx] = {
          ...resultados[idx],
          subtotalFinal: final,
          precioUnitarioEfectivo:
            resultados[idx].cantidad > 0 ? redondearMoneda(final / resultados[idx].cantidad) : 0,
          descuento: desc,
          promocionAplicada:
            desc > 0
              ? {
                  id: promo.id,
                  nombre: promo.nombre,
                  tipo: promo.tipo,
                  descuento: desc,
                }
              : undefined,
        };
      }
    }
  }

  return resultados;
}

