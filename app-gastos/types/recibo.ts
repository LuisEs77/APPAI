/**
 * Tipos para Recibos y Gastos
 */

export interface Recibo {
  id: string;
  usuarioId: string;
  imagen_hash: string;
  fecha: string; // YYYY-MM-DD
  comercio: string;
  categoria: string;
  total: number;
  estado: string;
  created_at?: string;
  updated_at?: string;
}

export interface ResultadoFactura {
  comercio: string;
  fecha: string; // YYYY-MM-DD
  categoria: string;
  total: number;
  imagenHash: string;
}

export interface FiltrosRecibos {
  fechaInicio?: string;
  fechaFin?: string;
  categoria?: string;
}

export interface Estadisticas {
  periodo: string;
  totalGastado: number;
  cantidadTransacciones: number;
  promedioPorTransaccion: number;
  porCategoria: {
    [key: string]: {
      cantidad: number;
      total: number;
    };
  };
}
