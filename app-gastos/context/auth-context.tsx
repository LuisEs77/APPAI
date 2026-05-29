/**
 * Contexto de Autenticacion
 * Maneja el estado global de autenticacion
 */

import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { Usuario, RespuestaAutenticacion } from '../types/usuario';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { servicioAlmacenamiento } from '../services/almacenamiento';

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
  actualizarUsuario: (datos: Partial<Usuario>) => Promise<Usuario>;
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
  actualizarUsuario: async () => {
    throw new Error('No implementado');
  },
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
      const tokenGuardado = await servicioAlmacenamiento.obtenerString('token');
      const usuarioGuardado = await servicioAlmacenamiento.obtenerObjeto<Usuario>('usuario');

      if (tokenGuardado && usuarioGuardado) {
        setToken(tokenGuardado);
        setUsuario(usuarioGuardado);
      }
    } catch (err) {
      console.error('Error restaurando sesion:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Actualizar usuario (parcial)
   */
  const actualizarUsuario = useCallback(
    async (datos: Partial<Usuario>): Promise<Usuario> => {
      if (!usuario) {
        throw new Error('No autenticado');
      }

      try {
        setCargando(true);
        setError(null);

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        // Debug: mostrar endpoint usado
        // eslint-disable-next-line no-console
        console.log('[auth] PATCH ->', API_ENDPOINTS.USUARIO_ACTUALIZAR(usuario.id));

        const respuesta = await fetch(API_ENDPOINTS.USUARIO_ACTUALIZAR(usuario.id), {
          method: 'PATCH',
          headers,
          body: JSON.stringify(datos),
        });

        if (!respuesta.ok) {
          throw new Error('Error actualizando usuario');
        }

        const usuarioActualizado = (await respuesta.json()) as Usuario;
        setUsuario(usuarioActualizado);
        await servicioAlmacenamiento.guardar('usuario', usuarioActualizado);

        return usuarioActualizado;
      } catch (err) {
        const mensajeError = err instanceof Error ? err.message : 'Error desconocido';
        setError(mensajeError);
        throw err;
      } finally {
        setCargando(false);
      }
    },
    [usuario, token],
  );

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
        // Debug: endpoint de login
        // eslint-disable-next-line no-console
        console.log('[auth] POST ->', API_ENDPOINTS.LOGIN, { email });

        const respuesta = await fetch(API_ENDPOINTS.LOGIN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: contraseña }),
        });

        if (!respuesta.ok) {
          throw new Error('Credenciales invalidas');
        }

        const datos = (await respuesta.json()) as RespuestaAutenticacion;

        // Guardar token y usuario
        setToken(datos.accessToken);
        setUsuario(datos.usuario as unknown as Usuario);

        await servicioAlmacenamiento.guardar('token', datos.accessToken);
        await servicioAlmacenamiento.guardar('usuario', datos.usuario);

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

        // Debug: endpoint de registro
        // eslint-disable-next-line no-console
        console.log('[auth] POST ->', API_ENDPOINTS.REGISTRO, { email, nombre, apellido });

        const respuesta = await fetch(API_ENDPOINTS.REGISTRO, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password: contraseña,
            nombre,
            apellido,
          }),
        });

        if (!respuesta.ok) {
          throw new Error('Error al registrarse');
        }

        const datos = (await respuesta.json()) as RespuestaAutenticacion;

        // Guardar token y usuario
        setToken(datos.accessToken);
        setUsuario(datos.usuario as unknown as Usuario);

        await servicioAlmacenamiento.guardar('token', datos.accessToken);
        await servicioAlmacenamiento.guardar('usuario', datos.usuario);

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

      await servicioAlmacenamiento.eliminar('token');
      await servicioAlmacenamiento.eliminar('usuario');
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
    actualizarUsuario,
  };

  return (
    <ContextoAutenticacionReact.Provider value={valor}>
      {children}
    </ContextoAutenticacionReact.Provider>
  );
};
