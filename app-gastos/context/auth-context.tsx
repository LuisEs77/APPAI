/**
 * Contexto de Autenticacion
 * Maneja el estado global de autenticacion
 */

import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { Usuario, RespuestaAutenticacion } from '../types/usuario';
import * as SecureStore from 'expo-secure-store';

interface ContextoAutenticacion {
  usuario: Usuario | null;
  token: string | null;
  cargando: boolean;
  error: string | null;
  iniciarSesion: (
    email: string,
    contraseña: string,
  ) => Promise<RespuestaAutenticacion>;
  registrarse: (
    email: string,
    contraseña: string,
    nombre: string,
    apellido: string,
  ) => Promise<RespuestaAutenticacion>;
  cerrarSesion: () => Promise<void>;
  restaurarSesion: () => Promise<void>;
  limpiarError: () => void;
}

export const ContextoAutenticacionDefault: ContextoAutenticacion = {
  usuario: null,
  token: null,
  cargando: false,
  error: null,
  iniciarSesion: async () => {
    throw new Error('No implementado');
  },
  registrarse: async () => {
    throw new Error('No implementado');
  },
  cerrarSesion: async () => {
    throw new Error('No implementado');
  },
  restaurarSesion: async () => {
    throw new Error('No implementado');
  },
  limpiarError: () => {},
};

export const ContextoAutenticacionReact =
  createContext<ContextoAutenticacion>(ContextoAutenticacionDefault);

interface ProveedorAutenticacionProps {
  children: ReactNode;
}

/**
 * Proveedor de Contexto de Autenticacion
 * Envuelve la aplicacion y proporciona funciones de autenticacion
 */
export const ProveedorAutenticacion: React.FC<ProveedorAutenticacionProps> = ({
  children,
}) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Restaurar sesion desde almacenamiento persistente
   */
  const restaurarSesion = useCallback(async () => {
    try {
      setCargando(true);
      const tokenGuardado = await SecureStore.getItemAsync('token');
      const usuarioGuardado = await SecureStore.getItemAsync('usuario');

      if (tokenGuardado && usuarioGuardado) {
        setToken(tokenGuardado);
        setUsuario(JSON.parse(usuarioGuardado));
      }
    } catch (err) {
      console.error('Error restaurando sesion:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Iniciar sesion con email y contraseña
   */
  const iniciarSesion = useCallback(
    async (
      email: string,
      contraseña: string,
    ): Promise<RespuestaAutenticacion> => {
      try {
        setCargando(true);
        setError(null);

        // Llamar al servicio de autenticación
        const respuesta = await fetch(
          'http://localhost:3000/api/auth/login',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: contraseña }),
          },
        );

        if (!respuesta.ok) {
          throw new Error('Credenciales invalidas');
        }

        const datos = (await respuesta.json()) as RespuestaAutenticacion;

        // Guardar token y usuario
        setToken(datos.accessToken);
        setUsuario(datos.usuario as unknown as Usuario);

        await SecureStore.setItemAsync('token', datos.accessToken);
        await SecureStore.setItemAsync('usuario', JSON.stringify(datos.usuario));

        return datos;
      } catch (err) {
        const mensajeError =
          err instanceof Error ? err.message : 'Error desconocido';
        setError(mensajeError);
        throw err;
      } finally {
        setCargando(false);
      }
    },
    [],
  );

  /**
   * Registrar nuevo usuario
   */
  const registrarse = useCallback(
    async (
      email: string,
      contraseña: string,
      nombre: string,
      apellido: string,
    ): Promise<RespuestaAutenticacion> => {
      try {
        setCargando(true);
        setError(null);

        const respuesta = await fetch(
          'http://localhost:3000/api/auth/registro',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              password: contraseña,
              nombre,
              apellido,
            }),
          },
        );

        if (!respuesta.ok) {
          throw new Error('Error al registrarse');
        }

        const datos = (await respuesta.json()) as RespuestaAutenticacion;

        // Guardar token y usuario
        setToken(datos.accessToken);
        setUsuario(datos.usuario as unknown as Usuario);

        await SecureStore.setItemAsync('token', datos.accessToken);
        await SecureStore.setItemAsync('usuario', JSON.stringify(datos.usuario));

        return datos;
      } catch (err) {
        const mensajeError =
          err instanceof Error ? err.message : 'Error desconocido';
        setError(mensajeError);
        throw err;
      } finally {
        setCargando(false);
      }
    },
    [],
  );

  /**
   * Cerrar sesion
   */
  const cerrarSesion = useCallback(async () => {
    try {
      setCargando(true);
      setToken(null);
      setUsuario(null);
      setError(null);

      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('usuario');
    } catch (err) {
      console.error('Error cerrando sesion:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  const valor: ContextoAutenticacion = {
    usuario,
    token,
    cargando,
    error,
    iniciarSesion,
    registrarse,
    cerrarSesion,
    restaurarSesion,
    limpiarError,
  };

  return (
    <ContextoAutenticacionReact.Provider value={valor}>
      {children}
    </ContextoAutenticacionReact.Provider>
  );
};
