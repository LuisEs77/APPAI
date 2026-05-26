/**
 * Servicio de Autenticacion
 * Maneja login, registro y gestion de sesion
 */

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_ENDPOINTS } from '../constants/api-endpoints';

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  apellido?: string;
  telefono?: string;
}

export interface RespuestaAuth {
  accessToken: string;
  tipo: string;
  expiresIn: string;
  usuario: Usuario;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegistroDto {
  email: string;
  password: string;
  nombre: string;
  apellido?: string;
  telefono?: string;
}

class AuthService {
  private cliente = axios.create({
    baseURL: 'http://localhost:3000/api',
    timeout: 30000,
  });

  /**
   * Iniciar sesion con email y password
   * @param email Email del usuario
   * @param password Password en texto plano
   * @returns RespuestaAuth con token y datos usuario
   */
  async login(email: string, password: string): Promise<RespuestaAuth> {
    try {
      const respuesta = await this.cliente.post<RespuestaAuth>(
        '/auth/login',
        { email, password }
      );

      // Guardar token en storage
      await SecureStore.setItemAsync('token', respuesta.data.accessToken);
      await SecureStore.setItemAsync(
        'usuario',
        JSON.stringify(respuesta.data.usuario)
      );

      return respuesta.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          'Error al iniciar sesion. Verifica tus credenciales.'
      );
    }
  }

  /**
   * Registrar nuevo usuario
   * @param datos Datos del usuario (email, password, nombre, etc)
   * @returns RespuestaAuth con token y datos usuario
   */
  async registrarse(datos: RegistroDto): Promise<RespuestaAuth> {
    try {
      const respuesta = await this.cliente.post<RespuestaAuth>(
        '/auth/registro',
        datos
      );

      // Guardar token en storage
      await SecureStore.setItemAsync('token', respuesta.data.accessToken);
      await SecureStore.setItemAsync(
        'usuario',
        JSON.stringify(respuesta.data.usuario)
      );

      return respuesta.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          'Error al registrarse. Intenta con otro email.'
      );
    }
  }

  /**
   * Obtener usuario actual del storage
   * @returns Usuario o null
   */
  async obtenerUsuarioActual(): Promise<Usuario | null> {
    try {
      const usuarioJson = await SecureStore.getItemAsync('usuario');
      return usuarioJson ? JSON.parse(usuarioJson) : null;
    } catch {
      return null;
    }
  }

  /**
   * Obtener token del storage
   * @returns Token JWT o null
   */
  async obtenerToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('token');
  }

  /**
   * Cerrar sesion (logout)
   */
  async cerrarSesion(): Promise<void> {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('usuario');
  }

  /**
   * Verificar si hay sesion activa
   * @returns true si hay token valido
   */
  async tieneSesionActiva(): Promise<boolean> {
    const token = await this.obtenerToken();
    return !!token;
  }
}

export default new AuthService();
