/**
 * Tipos para Usuario
 */

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CredencialesLogin {
  email: string;
  contraseña: string;
}

export interface DatosRegistro {
  email: string;
  contraseña: string;
  nombre: string;
  apellido: string;
}

export interface RespuestaAutenticacion {
  accessToken: string;
  tipo: string;
  expiresIn: string;
  usuario: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
  };
}
