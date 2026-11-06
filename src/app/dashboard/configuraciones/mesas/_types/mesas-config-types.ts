export type Intervalo = {
  duracionMinutos: number;
  precio: number;
};

export type Tarifa = {
  idTarifa: number;
  nombre: string;
  tipoDeMesa: "Carambola" | "Billar Pool" | "Consola";
  tipoDeCalculo: "Por minuto" | "Por intervalo";
  costoPorMinuto?: number;
  intervalos?: Intervalo[];
  esDefault?: boolean;
  controlesBase?: number;
  costoControlExtra?: number;
};

export type Mesa = {
  numeroMesa: number;
  tipoDeMesa: "Carambola" | "Billar Pool" | "Consola";
  tarifaId: string;
  estado: "disponible" | "ocupado" | "mantenimiento";
};

export type TarifaConDocId = Tarifa & { docId: string };
export type MesaConDocId = Mesa & { docId: string };

export const initialTarifaForm: Omit<Tarifa, 'idTarifa'> = {
  nombre: '',
  tipoDeMesa: 'Billar Pool',
  tipoDeCalculo: 'Por minuto',
  costoPorMinuto: 0,
  intervalos: [],
  esDefault: false,
  controlesBase: 2,
  costoControlExtra: 0,
};

export const initialMesaForm: Omit<Mesa, 'estado'> = {
  numeroMesa: 0,
  tipoDeMesa: 'Billar Pool',
  tarifaId: '',
};
