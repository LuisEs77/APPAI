/**
 * Paleta de colores corporativa minimalista
 * Basada en estetica profesional: Azul oscuro, Gris y Blanco
 * SIN emojis y SIN acentos en nombres de variables
 */

export const COLORES = {
  // Colores principales
  azulOscuro: '#003366', // RGB: 0, 51, 102
  azulClaro: '#0055AA', // RGB: 0, 85, 170
  grisOscuro: '#333333', // RGB: 51, 51, 51
  grisClaro: '#EEEEEE', // RGB: 238, 238, 238
  blanco: '#FFFFFF',

  // Estados
  exito: '#27AE60', // Verde para operaciones exitosas
  error: '#E74C3C', // Rojo para errores
  advertencia: '#F39C12', // Naranja para advertencias
  informacion: '#3498DB', // Azul para informacion

  // Variantes de gris para textos
  textoOscuro: '#333333',
  textoMedio: '#666666',
  textoClaro: '#999999',
  textoPlaceholder: '#CCCCCC',

  // Fondos
  fondoOscuro: '#003366',
  fondoLightAlt: '#F8F9FA',
};

/**
 * Tema de tipografia y tamanios
 */
export const TIPOGRAFIA = {
  tamanios: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  pesos: {
    normal: '400' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

/**
 * Espaciado consistente (multiples de 8px)
 */
export const ESPACIADO = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * Radio de esquinas redondeadas
 */
export const RADIO = {
  pequeno: 4,
  mediano: 8,
  grande: 12,
  completo: 999,
};

/**
 * Sombras sutiles
 */
export const SOMBRAS = {
  leve: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  media: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  profunda: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
};
