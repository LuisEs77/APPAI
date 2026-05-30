/**
 * Servicio de Gastos
 * Maneja operaciones con recibos/facturas
 */

import axios from 'axios';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { servicioApi } from './api.service';

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
  /**
   * Procesar una factura
   * @param imagenBase64 Imagen en formato base64
   * @returns Recibo procesado
   */
  async procesarFactura(imagenBase64: string): Promise<Recibo> {
    try {
      return await servicioApi.enviar<Recibo>(API_ENDPOINTS.PROCESAR_FACTURA, {
        imagenBase64,
      });
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
      return await servicioApi.enviar<any>(
        API_ENDPOINTS.BASE + '/gastos/procesar-multiples',
        {
          images,
        }
      );
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
      const params = new URLSearchParams();

      if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
      if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);
      if (filtros?.categoria) params.append('categoria', filtros.categoria);

      const url = `${API_ENDPOINTS.OBTENER_RECIBOS}${
        params.toString() ? '?' + params.toString() : ''
      }`;
      return await servicioApi.obtener<Recibo[]>(url);
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
      return await servicioApi.obtener<Recibo>(
        API_ENDPOINTS.OBTENER_RECIBO(reciboId)
      );
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
      return await servicioApi.obtener<Estadisticas>(
        API_ENDPOINTS.OBTENER_ESTADISTICAS(mes, anio)
      );
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
      await servicioApi.eliminar(API_ENDPOINTS.ELIMINAR_RECIBO(reciboId));
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
      const cliente = servicioApi.getCliente();
      const url = API_ENDPOINTS.BASE + `/reportes/descargar/${mes}/${anio}`;
      const respuesta = await cliente.get(url, {
        responseType: 'blob',
      });
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
  async solicitarReporte(mes: number, anio: number, email?: string): Promise<void> {
    try {
      const url = API_ENDPOINTS.GENERAR_REPORTE(mes, anio);
      console.log(`[GASTOS] Solicitando reporte: POST ${url} con email: ${email}`);
      await servicioApi.enviar(url, { email });
    } catch (error: any) {
      console.error(`[GASTOS] Error en solicitarReporte:`, error.response?.status, error.message, error.response?.data);
      throw new Error(
        error.response?.data?.message ||
          'Error al solicitar reporte. Verifica si tienes gastos en este mes.'
      );
    }
  }

  /**
   * Enviar correo de prueba al email provisto (o al usuario autenticado si no se envia email)
   */
  async enviarReportePrueba(email?: string): Promise<void> {
    try {
      await servicioApi.enviar(API_ENDPOINTS.ENVIAR_REPORTE_PRUEBA, { email });
      return;
    } catch (error: any) {
      // Si falla por no autorizado o por problema de red, reintentar contra endpoint publico de depuracion
      const status = error?.response?.status;
      console.warn('[GASTOS] enviarReportePrueba fallo, status=', status, 'mensaje=', error?.message || error);

      // Intentar endpoint público si disponibles
      try {
        const clientePublico = axios.create({
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        await clientePublico.post(API_ENDPOINTS.ENVIAR_REPORTE_PRUEBA_PUBLIC, { email });
        return;
      } catch (pubErr: any) {
        console.error('[GASTOS] reintento publico fallo', pubErr?.response || pubErr);
        throw new Error(
          pubErr.response?.data?.message || error.response?.data?.message || 'Error al enviar correo de prueba. Intenta mas tarde.'
        );
      }
    }
  }
}

export default new GastosService();
