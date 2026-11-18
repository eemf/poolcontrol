import { 
  ArrowLeftRight, CreditCard, AlertTriangle, Gift, Trash2, Coins, Timer, LucideIcon 
} from 'lucide-react';

export type TipoModalSemantico = 'normal' | 'advertencia' | 'destructivo' | 'info';
export type SwalTipoIcono = 'success' | 'warning' | 'error' | 'info' | 'question';

export interface CasoModalReal {
  id: string;
  titulo: string;
  subtitulo: string;
  icono: LucideIcon;
  tipo: TipoModalSemantico;
  swalTipo: SwalTipoIcono;
  tipoTexto: string;
  campoTipo?: 'select' | 'caja_saldo' | 'caja_abono' | 'caja_pin' | 'ninguno';
  detallesCaja?: {
    nombre?: string;
    etiquetaSaldo?: string;
    saldo?: string;
    extra?: string;
    cuentaActual?: string;
    credito?: string;
    total?: string;
  };
  descripcion?: string;
  textoBotonCancelar: string;
  textoBotonConfirmar: string;
  iconoConfirmar?: LucideIcon;
  soloConfirmar?: boolean;
}

export const CASOS_REALES: CasoModalReal[] = [
  {
    id: 'trasladar-mesa',
    titulo: 'Trasladar Mesa #1',
    subtitulo: 'Selecciona una estación disponible para mover la sesión actual con sus consumos.',
    icono: ArrowLeftRight,
    tipo: 'normal',
    swalTipo: 'question',
    tipoTexto: 'Confirmación / Pregunta',
    campoTipo: 'select',
    textoBotonCancelar: 'Cancelar',
    textoBotonConfirmar: 'Confirmar Traslado',
  },
  {
    id: 'mover-credito',
    titulo: '¿Mover Cuenta a Crédito?',
    subtitulo: 'Autorización de traslado a cuentas por cobrar',
    icono: CreditCard,
    tipo: 'advertencia',
    swalTipo: 'question',
    tipoTexto: 'Compromiso Financiero',
    campoTipo: 'caja_saldo',
    detallesCaja: {
      nombre: 'Victor Hugo',
      etiquetaSaldo: 'Saldo Pendiente',
      saldo: 'Q15.00',
    },
    descripcion: 'La cuenta se moverá a Créditos Activos para liquidación posterior.',
    textoBotonCancelar: 'Cancelar',
    textoBotonConfirmar: 'Confirmar Crédito',
    iconoConfirmar: CreditCard,
  },
  {
    id: 'deuda-activa',
    titulo: 'Cliente con Deuda Activa',
    subtitulo: 'Este cliente ya tiene un crédito pendiente registrado. ¿Deseas abrir una nueva cuenta por separado?',
    icono: AlertTriangle,
    tipo: 'advertencia',
    swalTipo: 'warning',
    tipoTexto: 'Alerta Preventiva',
    campoTipo: 'ninguno',
    textoBotonCancelar: 'Revisar Deuda',
    textoBotonConfirmar: 'Continuar Venta',
  },
  {
    id: 'consumo-interno',
    titulo: 'Consumo Interno',
    subtitulo: 'Introduce el PIN del cliente o empleado autorizado.',
    icono: Gift,
    tipo: 'normal',
    swalTipo: 'info',
    tipoTexto: 'Información / PIN',
    campoTipo: 'caja_pin',
    detallesCaja: {
      nombre: 'EDIL MONZÓN',
      etiquetaSaldo: 'Monto en Cortesía',
      saldo: 'Q25.00',
    },
    textoBotonCancelar: 'Cancelar',
    textoBotonConfirmar: 'Liquidar Cuenta',
  },
  {
    id: 'descartar-cambios',
    titulo: '¿Descartar Cambios?',
    subtitulo: 'Se descartarán los artículos nuevos sin guardar y se devolverán automáticamente al stock.',
    icono: AlertTriangle,
    tipo: 'destructivo',
    swalTipo: 'error',
    tipoTexto: 'Acción Destructiva',
    campoTipo: 'ninguno',
    textoBotonCancelar: 'Permanecer',
    textoBotonConfirmar: 'Sí, Descartar',
    iconoConfirmar: Trash2,
  },
  {
    id: 'registrar-abono',
    titulo: 'Abono Registrado',
    subtitulo: 'El abono a la cuenta de EDIL MONZÓN está listo para confirmarse.',
    icono: Coins,
    tipo: 'normal',
    swalTipo: 'success',
    tipoTexto: 'Éxito / Movimiento de Caja',
    campoTipo: 'caja_abono',
    detallesCaja: {
      cuentaActual: 'Q10.00',
      credito: 'Q15.00',
      total: 'Q25.00',
    },
    textoBotonCancelar: 'Cancelar',
    textoBotonConfirmar: 'Confirmar Abono',
    iconoConfirmar: Coins,
  },
  {
    id: 'tiempo-culminado',
    titulo: '¡Tiempo Culminado!',
    subtitulo: 'El tiempo para la sesión de juego de la Mesa #2 ha finalizado.',
    icono: Timer,
    tipo: 'advertencia',
    swalTipo: 'warning',
    tipoTexto: 'Aviso de Sesión',
    campoTipo: 'ninguno',
    textoBotonCancelar: '',
    textoBotonConfirmar: 'Entendido',
    soloConfirmar: true,
  },
];
