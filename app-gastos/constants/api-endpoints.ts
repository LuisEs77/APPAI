/**
 * Configuracion de endpoints del API backend
 */

// Base del API. Se prefiere la variable de entorno `EXPO_PUBLIC_API_BASE`.
const envBase = typeof process !== 'undefined' && process.env ? process.env.EXPO_PUBLIC_API_BASE : null;

if (!envBase) {
  console.warn('[API_ENDPOINTS] EXPO_PUBLIC_API_BASE no está definida. Usando localhost por defecto.');
}

const API_BASE_URL = envBase || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  // Base
  BASE: API_BASE_URL,
  // Autenticacion
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTRO: `${API_BASE_URL}/auth/registro`,
  CAMBIAR_PASSWORD: `${API_BASE_URL}/auth/cambiar-password`,
  VERIFICAR_TOKEN: `${API_BASE_URL}/auth/verificar`,

  // Usuarios
  USUARIO_PERFIL: (id: string) => `${API_BASE_URL}/usuarios/${id}`,
  USUARIO_ACTUALIZAR: (id: string) => `${API_BASE_URL}/usuarios/${id}`,
  USUARIO_ELIMINAR: (id: string) => `${API_BASE_URL}/usuarios/${id}`,

  // Gastos
  PROCESAR_FACTURA: `${API_BASE_URL}/gastos/procesar`,
  OBTENER_RECIBOS: `${API_BASE_URL}/gastos`,
  OBTENER_RECIBO: (id: string) => `${API_BASE_URL}/gastos/${id}`,
  ELIMINAR_RECIBO: (id: string) => `${API_BASE_URL}/gastos/${id}`,
  OBTENER_ESTADISTICAS: (mes: number, anio: number) =>
    `${API_BASE_URL}/gastos/estadisticas/${mes}/${anio}`,

  // IA
  PROCESAR_IMAGEN_IA: `${API_BASE_URL}/ia/procesar-factura`,

  // Reportes
  GENERAR_REPORTE: (mes: number, anio: number) =>
    `${API_BASE_URL}/reportes/enviar-mensual/${mes}/${anio}`,
  ENVIAR_REPORTE_PRUEBA: `${API_BASE_URL}/reportes/enviar-prueba`,
  ENVIAR_REPORTE_PRUEBA_PUBLIC: `${API_BASE_URL}/reportes/enviar-prueba-public`,
};

// Log de depuración en tiempo de ejecución para verificar la URL base
try {
  // eslint-disable-next-line no-console
  console.log('[API_ENDPOINTS] BASE =', API_ENDPOINTS.BASE);
} catch (err) {
  // ignore
}
