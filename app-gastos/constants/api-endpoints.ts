/**
 * Configuracion de endpoints del API backend
 */

// URL del tunel ngrok proporcionada por el usuario
const API_BASE_URL = 'https://vintage-visitor-wrench.ngrok-free.dev/api';

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
};
