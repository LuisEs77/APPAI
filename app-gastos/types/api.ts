/**
 * Tipos para respuestas de API
 */

export interface RespuestaApi<T> {
  data?: T;
  message?: string;
  success?: boolean;
  statusCode?: number;
  error?: string;
}

export interface ErrorApi {
  statusCode: number;
  message: string;
  error?: string;
}

export interface PaginacionApi<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
