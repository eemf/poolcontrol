
import { Timestamp } from 'firebase/firestore';

export interface Producto {
  id: string;
  idProducto: number;
  nombre: string;
  codigoBusqueda?: string;
  busquedaTokens?: string[];
  precioCompra: number;
  precioVenta: number;
  existencia: number;
  existenciaMinima?: number;
  preparaciones?: Preparacion[];
}

export interface ProductoVirtual {
  id: string;
  idProductoVirtual: number;
  nombre: string;
  codigoBusqueda?: string;
  precioVenta: number;
  categoria?: string;
  existencia: number;
  incluirEnPOS: boolean;
  incluirEnCompras: boolean;
}

export interface Preparacion {
  nombre: string;
  precioVenta: number;
  ingredientes: {
    productoId: string;
    cantidad: number;
  }[];
}

export interface Cliente {
  id: string;
  idcliente: number;
  nombre: string;
  tipoCliente: 'Cliente' | 'Proveedor' | 'Ambos';
  permiteConsumoInterno?: boolean;
  pinConsumoInterno?: string;
  consumoInterno?: boolean;
}

export interface DetalleVenta {
  idDetalle: number;
  idProducto: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  saldo: number;
  pagadoEfectivo: number;
  pagadoTarjeta: number;
  metodoPago: 'Efectivo' | 'Tarjeta' | 'Mixto' | null;
  estado: 'Pagada' | 'Pendiente de pago';
  fechaAgregado: string | Date | Timestamp;
  ingredientesConsumidos?: { productoId: string; cantidad: number }[];
  esVirtual?: boolean;
}

export type EstadoCompra = "Pendiente" | "Pagado";

export interface Compra {
  id: string;
  idCompra: number;
  fecha: Timestamp;
  proveedorId?: string;
  proveedorNombre?: string;
  items: ItemCompra[];
  montoTotal: number;
  usuarioId: string;
  estado: EstadoCompra;
}

export interface ItemCompra {
  tipo: 'producto' | 'gasto';
  productoId?: string;
  nombreProducto: string;
  cantidad: number;
  costoUnitario: number;
}

export interface Venta {
  id: string; // Document ID
  idVenta: number;
  fecha: string | Date | Timestamp;
  clienteId: string;
  nombreCliente: string;
  total: number;
  saldo: number;
  tipoVenta: 'Rapida' | 'POS';
  metodoPago: 'Efectivo' | 'Tarjeta' | 'Mixto' | null;
  estado: 'Pagada' | 'Pendiente de pago' | 'credito';
  detalles: DetalleVenta[];
}

export interface Pago {
  id: string; // Document ID
  idPago: number;
  fecha: Timestamp;
  idVenta: number;
  ventaDocId: string;
  clienteNombre: string;
  montoTotalPagado: number;
  metodoPago: 'Efectivo' | 'Tarjeta';
  usuarioId: string;
  itemsSaldados: {
    idDetalle: number;
    nombreProducto: string;
    montoAplicado: number;
  }[];
}

export interface CierreCaja {
    id: string; // Document ID
    idCuadre: number;
    fecha: Timestamp;
    inicioDelPeriodo: Timestamp;
    efectivoInicial: number;
    totalIngresoMesas: number;
    totalVentaMonedas: number;
    totalVentaConsumo: number;
    pagosTarjeta: number;
    efectivoEsperado: number;
    efectivoFinalContado: number;
    diferencia: number;
    totalLiquidado: number;
    cajaSiguienteTurno: number;
    observaciones: string;
    estado: 'procesado' | 'pendiente';
    snapshotMonedas: {
        existencia: number;
        totalMonedasNetoPeriodo: number;
        efectivoAcumulado: number;
    }
}

export interface MovimientoConsolidado {
  id: string;
  idRegistro: number; // Corresponde al idCuadre o idCompra/Gasto
  fecha: Timestamp;
  tipo: 'ingreso_caja' | 'ingreso_tarjeta' | 'ingreso_tragamonedas' | 'egreso_compra' | 'egreso_gasto';
  monto: number;
  descripcion: string;
  estado: 'pendiente' | 'procesado';
  origen: string; // Ej: "cierre_caja/21", "compra/105"
}

export interface Gasto {
  id: string; // Document ID
  idGasto: number;
  fecha: Timestamp;
  descripcion: string;
  monto: number;
  categoria?: string;
  usuarioId: string;
  estado: 'pendiente' | 'procesado';
}


export interface Generales {
    totalEfectivo: number;
    efectivoInicial: number;
    totalMesas: number;
    totalVentasTarjeta: number;
    totalVentasMonedas: number;
    fechaInicioPeriodo: Timestamp;
    monedasIniciales?: number;
    efectivoAcumuladoMonedas?: number;
    acumuladoMonedasTarjeta?: number;
    totalMonedasCredito?: number;
    totalMonedasTarjeta?: number;
    fechacuadretragamonedas?: Timestamp;
    porcentajetragamonedas?: number;
}

export interface GeneralesTragamonedas {
  id: string;
  idTragamonedas: string;
  nombre: string;
  totalPremios: number;
  totalExtraccion: number;
  totalDeuda: number;
  totalBase: number;
  fechaActualizacion: Timestamp;
}

export interface HistorialTragamonedas {
    id: string;
    maquinaId: string;
    fecha: Timestamp;
    tipo: 'premio_total' | 'premio_parcial' | 'base' | 'extraccion';
    monto: number;
    descripcion: string;
}

export interface CuadreTragamonedas {
    id: string;
    idCuadre: number;
    fecha: Timestamp;
    estado: 'pendiente' | 'procesado';
    gananciaATrasladar: number;
    observaciones: string;
    maquinas: any[];
    resumen: any;
    existenciaSiguiente: number;
    efectivoAcumuladoSiguiente: number;
}


export interface Mesa {
  id: string;
  numeroMesa: number;
  tipoDeMesa: "Carambola" | "Billar Pool";
  tarifaId: string;
  estado: "disponible" | "ocupado" | "mantenimiento";
  horaInicio?: Timestamp | null;
  horaFin?: Timestamp | null;
  tiempoDefinido?: number; // en segundos
  modoJuego?: "libre" | "definido" | null;
  alquilerPagado?: boolean;
  alarmaAck?: boolean;
  montoACobrar?: number | null;
  clienteId?: string | null;
  nombreCliente?: string | null;
  consumos?: any[];
  ajustesDeTiempo?: any[];
  tiempoTranscurrido?: number; 
  costo?: number;
}

// Este tipo es para el estado de caja que se lee en el frontend
export interface EstadoCaja extends Generales {
    ExistenciaMonedas?: number;
}

export interface Cuenta {
    id: string;
    idCuenta: number;
    nombre: string;
    tipo: 'Efectivo' | 'Bancaria';
    saldo: number;
}

export interface Tarifa {
  id: string;
  idTarifa: number;
  nombre: string;
  tipoDeMesa: "Carambola" | "Billar Pool";
  tipoDeCalculo: "Por minuto" | "Por intervalo";
  costoPorMinuto?: number;
  intervalos?: Intervalo[];
  esDefault?: boolean;
}

export interface Intervalo {
  duracionMinutos: number;
  precio: number;
}

export interface DetalleAjusteInventario {
  productoId: string;
  nombreProducto: string;
  existenciaSistema: number;
  existenciaFisica: number;
  diferencia: number;
}

export interface AjusteInventario {
  idAjuste: number;
  fecha: Timestamp;
  usuarioId: string;
  observaciones: string;
  detalles: DetalleAjusteInventario[];
}

export interface CuadreSemanal {
  id: string;
  idCuadreSemanal: number;
  fecha: Timestamp;
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
    origenNombre: string;
    destinoId: string;
    destinoNombre: string;
  };
  idsProcesados: {
    ingresos: string[];
    ingresosTarjeta: string[];
    compras: string[];
    gastos: string[];
  };
  observaciones: string;
}

export interface HistorialInventario {
  id: string;
  idHistorial: number;
  fecha: Timestamp;
  productoId: string;
  nombreProducto: string;
  tipoMovimiento: "Venta" | "Compra" | "Ajuste" | "Venta Anulada";
  cantidad: number; // Negativo para salidas, positivo para entradas
  existenciaAnterior: number;
  existenciaNueva: number;
  referencia: string; // ej: "Venta #123", "Compra #45", "Ajuste #10"
  usuarioId: string;
}

    