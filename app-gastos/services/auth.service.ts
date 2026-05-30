/**
 * Servicio de Autenticacion
 * Maneja login, registro y gestion de sesion
 */

import { API_ENDPOINTS } from '../constants/api-endpoints';
import { servicioAlmacenamiento } from './almacenamiento';
import { servicioApi } from './api.service';

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
  /**
   * Iniciar sesion con email y password
   * @param email Email del usuario
   * @param password Password en texto plano
   * @returns RespuestaAuth con token y datos usuario
   */
  async login(email: string, password: string): Promise<RespuestaAuth> {
    try {
      const respuesta = await servicioApi.getCliente().post<RespuestaAuth>(
        API_ENDPOINTS.LOGIN,
        { email, password }
      );

      // Guardar token en storage
      await servicioAlmacenamiento.guardar('token', respuesta.data.accessToken);
      await servicioAlmacenamiento.guardar('usuario', respuesta.data.usuario);

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
      const respuesta = await servicioApi.getCliente().post<RespuestaAuth>(
        API_ENDPOINTS.REGISTRO,
        datos
      );

      // Guardar token en storage
      await servicioAlmacenamiento.guardar('token', respuesta.data.accessToken);
      await servicioAlmacenamiento.guardar('usuario', respuesta.data.usuario);

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
  async obtenerUsuario(): Promise<Usuario | null> {
    return await servicioAlmacenamiento.obtenerObjeto<Usuario>('usuario');
  }

  /**
   * Obtener token del storage
   * @returns Token JWT o null
   */
  async obtenerToken(): Promise<string | null> {
    return await servicioAlmacenamiento.obtenerString('token');
  }

  /**
   * Cerrar sesion (logout)
   */
  async cerrarSesion(): Promise<void> {
    await servicioAlmacenamiento.eliminar('token');
    await servicioAlmacenamiento.eliminar('usuario');
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
