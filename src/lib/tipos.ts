
import { Timestamp } from 'firebase/firestore';

export interface UserAuthLookup {
  nombre: string;
  email: string;
  rol: string;
  sucursalId: string;
  accesoGlobal?: boolean;
}

export interface Suscripcion {
  plan: 'Básico' | 'Premium' | 'Pro';
  estado: 'activo' | 'vencido' | 'suspendido';
  motivoSuspension?: 'administrativo' | 'tecnico';
  fechaInicio: Timestamp;
  fechaVencimiento: Timestamp;
  ciclo: 'Mensual' | 'Anual';
  montoAcordado: number;
  ultimoPago?: Timestamp;
}

export interface PagoSuscripcion {
  id: string;
  idPago: number;
  fecha: Timestamp;
  monto: number;
  metodo: string;
  meses: number;
  planAlMomento: string;
  vencimientoPrevio: Timestamp;
  vencimientoNuevo: Timestamp;
  usuarioId: string;
}

export interface Sucursal {
  id: string;
  idSucursal: number;
  nombre: string;
  direccion?: string;
  features?: { [key: string]: boolean };
  suscripcion?: Suscripcion;
}

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
  ubicacion?: string;
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
  permiteCredito?: boolean;
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
  metodoPago: 'Efectivo' | 'Tarjeta' | 'Mixto' | 'Consumo Interno' | null;
  estado: 'Pagada' | 'Pendiente de pago';
  fechaAgregado: string | Date | Timestamp;
  ingredientesConsumidos?: { productoId: string; cantidad: number }[];
  esVirtual?: boolean;
  metadata?: {
    tipo?: 'alquiler' | 'ajuste' | 'consumo';
    modo?: 'libre' | 'definido';
    horaInicio?: any;
    horaFin?: any;
    pagadoContado?: boolean;
  };
}

export type EstadoCompra = "Pendiente" | "Pagado";

export interface Compra {
  id: string;
  idCompra: number;
  sucursalId: string;
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
  sucursalId: string;
  fecha: string | Date | Timestamp;
  fechaUltimoPago?: Timestamp;
  clienteId: string;
  nombreCliente: string;
  total: number;
  saldo: number;
  tipoVenta: 'Rapida' | 'POS';
  metodoPago: 'Efectivo' | 'Tarjeta' | 'Mixto' | 'Consumo Interno' | null;
  estado: 'Pagada' | 'Pendiente de pago' | 'credito';
  fueCredito?: boolean;
  detalles: DetalleVenta[];
}

export interface Pago {
  id: string; // Document ID
  idPago: number;
  sucursalId: string;
  fecha: Timestamp;
  idVenta: number;
  ventaDocId: string;
  clienteNombre: string;
  montoTotalPagado: number;
  ventaTotal: number;
  metodoPago: 'Efectivo' | 'Tarjeta' | 'Consumo Interno';
  usuarioId: string;
  itemsSaldados: {
    idDetalle: number;
    nombreProducto: string;
    montoAplicado: number;
    subtotalItem?: number;
    esVirtual?: boolean;
    cantidad?: number;
    idProducto?: string;
  }[];
}

export interface CierreCaja {
    id: string; // Document ID
    idCuadre: number;
    sucursalId: string;
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
    estadoEfectivo: 'procesado' | 'pendiente';
    estadoTarjeta?: 'procesado' | 'pendiente';
    snapshotMonedas: {
        existencia: number;
        existenciaAlInicio: number;
        totalMonedasNetoPeriodo: number;
        efectivoAcumulado: number;
    };
    usuarioId?: string;
    usuarioNombre?: string;
    usuarioEmail?: string;
}

export interface Gasto {
  id: string; // Document ID
  idGasto: number;
  sucursalId: string;
  fecha: Timestamp;
  descripcion: string;
  monto: number;
  categoria?: string;
  usuarioId: string;
  estado: 'pendiente' | 'processed';
}


export interface Generales {
    totalEfectivo: number;
    efectivoInicial: number;
    totalMesas: number;
    totalVentasTarjeta: number;
    totalVentasMonedas: number;
    fechaInicioPeriodo: Timestamp;
    monedasIniciales?: number;
    monedasTurnoAbierto?: number;
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
    sucursalId: string;
    fecha: Timestamp;
    tipo: 'premio_total' | 'premio_parcial' | 'base' | 'extraccion';
    monto: number;
    descripcion: string;
    metadata?: any;
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
  tipoDeMesa: "Carambola" | "Billar Pool" | "Consola";
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
  numControles?: number;
  idVentaPrepagada?: string | null;
}

export interface Rol {
  idRol: number;
  nombre: string;
  descripcion?: string;
  permisos: string[];
}

export interface UsuarioSucursal {
  authUid: string;
  nombre: string;
  email: string;
  roles: string[]; // Array de IDs de roles
  permisosExtra?: string[];
  accesoGlobal?: boolean;
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
  tipoDeMesa: "Carambola" | "Billar Pool" | "Consola";
  tipoDeCalculo: "Por minuto" | "Por intervalo";
  costoPorMinuto?: number;
  intervalos?: Intervalo[];
  esDefault?: boolean;
  controlesBase?: number;
  costoControlExtra?: number; // Costo por hora por control adicional
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
  id: string;
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
    totalIngresosTragamonedas: number;
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
    ingresosEfectivo: string[];
    ingresosTarjeta: string[];
    ingresosTragamonedas: string[];
    compras: string[];
    gastos: string[];
  };
  observaciones: string;
  estadoMensual: 'pendiente' | 'procesado';
}

export interface CuadreMensual {
  id: string;
  idCuadreMensual: number;
  fecha: Timestamp;
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
    origenNombre: string;
    destinoId: string;
    destinoNombre: string;
  };
  idsCuadresProcesados: string[];
  observaciones: string;
}

export interface HistorialInventario {
  id: string;
  idHistorial: number;
  sucursalId: string;
  fecha: Timestamp;
  productoId: string;
  nombreProducto: string;
  tipoMovimiento: "Venta" | "Compra" | "Ajuste" | "Venta Anulada";
  cantidad: number; // Negativo para salidas, positivo para entradas
  existenciaAnterior: number;
  existenciaNueva: number;
  referencia: string; // ej: "Venta #123", "Compra #45", "Ajuste #10"
  usuarioId: string;
  verificado?: boolean; // Nuevo campo para auditoría visual de éxito
}

export type CategoriaAuditoria = 'ventas' | 'mesas' | 'caja' | 'compras' | 'inventario' | 'catalogo';

export type AccionAuditoria = 
  | 'venta_guardada' | 'venta_anulada' | 'producto_agregado' | 'producto_eliminado'
  | 'pago_recibido' | 'abono_registrado' | 'credito_otorgado'
  | 'mesa_iniciada' | 'mesa_cobrada' | 'mesa_trasladada' | 'mesa_tiempo_ajustado' | 'mesa_consumo_agregado' | 'mesa_consumo_eliminado'
  | 'cierre_caja' | 'apertura_caja' | 'compra_registrada'
  | 'ajuste_inventario' | 'producto_creado' | 'producto_editado' | 'producto_eliminado_catalogo';

export interface RegistroAuditoria {
  id?: string;
  sucursalId: string;
  fecha: Timestamp | Date;
  usuarioId: string;
  usuarioNombre: string;
  usuarioEmail?: string;
  usuarioRol?: string;
  nombreEquipo?: string;
  tipoDispositivo?: 'computadora' | 'tablet' | 'telefono';
  detallesDispositivo?: {
    so?: string;
    navegador?: string;
    modelo?: string;
    resolucion?: string;
  };
  categoria: CategoriaAuditoria;
  accion: AccionAuditoria;
  titulo: string;
  descripcion: string;
  detalles?: Record<string, any>;
}
