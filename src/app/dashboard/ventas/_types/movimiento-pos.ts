export type TipoMovimientoPOS = 
  | 'venta_rapida'
  | 'venta_creada'
  | 'productos_agregados'
  | 'pago'
  | 'abono'
  | 'item_eliminado'
  | 'consumo_interno'
  | 'venta_anulada';

export interface ItemMovimientoPOS {
  nombre: string;
  cantidad: number;
  precioUnitario?: number;
  subtotal?: number;
}

export interface MovimientoRecientePOS {
  id: string;
  tipo: TipoMovimientoPOS;
  titulo: string;
  descripcion: string;
  idVenta?: number | string;
  clienteNombre?: string;
  montoTotal?: number;
  metodoPago?: string;
  promocionNombre?: string;
  fecha: Date;
  usuarioNombre?: string;
  items?: ItemMovimientoPOS[];
}

