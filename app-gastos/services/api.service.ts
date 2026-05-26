/**
 * Servicio de API
 * Centraliza todas las llamadas HTTP al backend
 * Maneja autenticacion con JWT automáticamente
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_ENDPOINTS } from '../constants/api-endpoints';

class ServicioApi {
  private cliente: AxiosInstance;
  private baseUrl: string = 'http://localhost:3000/api';

  constructor() {
    this.cliente = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token JWT a cada solicitud
    this.cliente.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Interceptor para manejar errores de respuesta
    this.cliente.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expirado, limpiar almacenamiento
          await SecureStore.deleteItemAsync('token');
          await SecureStore.deleteItemAsync('usuario');
        }
        return Promise.reject(error);
      },
    );
  }

  /**
   * GET genérico
   */
  async obtener<T>(url: string): Promise<T> {
    const respuesta = await this.cliente.get<T>(url);
    return respuesta.data;
  }

  /**
   * POST genérico
   */
  async enviar<T>(url: string, datos: any): Promise<T> {
    const respuesta = await this.cliente.post<T>(url, datos);
    return respuesta.data;
  }

  /**
   * PUT genérico
   */
  async actualizar<T>(url: string, datos: any): Promise<T> {
    const respuesta = await this.cliente.put<T>(url, datos);
    return respuesta.data;
  }

  /**
   * DELETE genérico
   */
  async eliminar(url: string): Promise<void> {
    await this.cliente.delete(url);
  }

  /**
   * Obtener instancia de axios para casos especiales
   */
  getCliente(): AxiosInstance {
    return this.cliente;
  }
}

export const servicioApi = new ServicioApi();
