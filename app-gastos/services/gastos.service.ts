/**
 * Servicio de Gastos
 * Maneja operaciones con recibos/facturas
 */

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export interface Recibo {
  id: string;
  fecha: string;
  comercio: string;
  categoria: string;
  total: number;
  moneda: string;
  imagen?: string;
  estado: string;
  created_at: string;
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
  porCategoria: Record<string, { cantidad: number; total: number }>;
}

class GastosService {
  private baseUrl = 'http://localhost:3000/api';

  /**
   * Crear cliente axios con autenticacion
   */
  private async crearCliente() {
    const token = await SecureStore.getItemAsync('token');
    return axios.create({
      baseURL: this.baseUrl,
      timeout: 60000, // Mayor timeout para procesamiento IA
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * Procesar una factura
   * @param imagenBase64 Imagen en formato base64
   * @returns Recibo procesado
   */
  async procesarFactura(imagenBase64: string): Promise<Recibo> {
    try {
      const cliente = await this.crearCliente();
      const respuesta = await cliente.post<Recibo>('/gastos/procesar', {
        imagenBase64,
      });
      return respuesta.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          'Error al procesar la factura. Intenta con una imagen mas clara.'
      );
    }
  }

  /**
   * Procesar multiples facturas
   * @param images Array de imagenes en formato base64
   * @returns Resultados del procesamiento
   */
  async procesarMultiplesFacturas(images: string[]): Promise<any> {
    try {
      const cliente = await this.crearCliente();
      const respuesta = await cliente.post('/gastos/procesar-multiples', {
        images,
      });
      return respuesta.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          'Error al procesar las facturas. Intenta nuevamente.'
      );
    }
  }

  /**
   * Obtener todos los recibos del usuario

   * @param filtros Filtros opcionales
   * @returns Lista de recibos
   */
  async obtenerRecibos(filtros?: FiltrosRecibos): Promise<Recibo[]> {
    try {
      const cliente = await this.crearCliente();
      const params = new URLSearchParams();

      if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
      if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);
      if (filtros?.categoria) params.append('categoria', filtros.categoria);

      const respuesta = await cliente.get<Recibo[]>(
        `/gastos?${params.toString()}`
      );
      return respuesta.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al obtener recibos.'
      );
    }
  }

  /**
   * Obtener un recibo especifico
   * @param reciboId ID del recibo
   * @returns Recibo
   */
  async obtenerRecibo(reciboId: string): Promise<Recibo> {
    try {
      const cliente = await this.crearCliente();
      const respuesta = await cliente.get<Recibo>(`/gastos/${reciboId}`);
      return respuesta.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al obtener el recibo.'
      );
    }
  }

  /**
   * Obtener estadisticas de un mes
   * @param mes Mes (1-12)
   * @param anio Anio (YYYY)
   * @returns Estadisticas agregadas
   */
  async obtenerEstadisticas(mes: number, anio: number): Promise<Estadisticas> {
    try {
      const cliente = await this.crearCliente();
      const respuesta = await cliente.get<Estadisticas>(
        `/gastos/estadisticas/${mes}/${anio}`
      );
      return respuesta.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al obtener estadisticas.'
      );
    }
  }

  /**
   * Eliminar un recibo
   * @param reciboId ID del recibo a eliminar
   */
  async eliminarRecibo(reciboId: string): Promise<void> {
    try {
      const cliente = await this.crearCliente();
      await cliente.delete(`/gastos/${reciboId}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al eliminar el recibo.'
      );
    }
  }

  /**
   * Descargar reporte Excel del mes
   * @param mes Mes (1-12)
   * @param anio Anio (YYYY)
   */
  async descargarReporte(mes: number, anio: number): Promise<Blob> {
    try {
      const cliente = await this.crearCliente();
      const respuesta = await cliente.get(
        `/reportes/descargar/${mes}/${anio}`,
        {
          responseType: 'blob',
        }
      );
      return respuesta.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al descargar reporte.'
      );
    }
  }

  /**
   * Solicitar envio de reporte por correo
   * @param mes Mes (1-12)
   * @param anio Anio (YYYY)
   */
  async solicitarReporte(mes: number, anio: number): Promise<void> {
    try {
      const cliente = await this.crearCliente();
      await cliente.post(`/reportes/enviar-mensual/${mes}/${anio}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          'Error al solicitar reporte. Intenta mas tarde.'
      );
    }
  }
}

export default new GastosService();
