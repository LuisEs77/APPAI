/**
 * Paleta moderna con mayor contraste
 * Blanco, Grises más oscuros, Negro y Verde Lima vibrante
 */

export const COLORES = {
  // Colores base
  blanco: '#FFFFFF',
  negro: '#000000',
  
  // Escala de grises con mayor contraste
  grisClaro: '#F5F5F5',
  grisClaro2: '#EBEBEB',
  grisClaro3: '#DCDCDC',
  grisMedio: '#BDBDBD',
  grisOscuro: '#757575',
  grisOscuro2: '#424242',

  // Acento principal: Verde Lima más vibrante
  acento: '#CCFF00', // Verde lima más brillante
  acentoOscuro: '#B3E600', // Verde lima oscuro para hover

  // Estados con mejor contraste
  exito: '#059669', // Verde más oscuro
  error: '#DC2626', // Rojo más vibrante
  advertencia: '#EA580C', // Naranja más vibrante
  informacion: '#0369A1', // Azul más oscuro

  // Texto
  textoOscuro: '#101010',
  textoMedio: '#424242',
  textoClaro: '#757575',
  textoPlaceholder: '#A0A0A0',

  // Fondos
  fondoPrincipal: '#FFFFFF',
  fondoSecundario: '#F8F8F8',
  fondoTerciario: '#F0F0F0',
};

/**
 * Tipografía moderna y legible
 */
export const TIPOGRAFIA = {
  tamanios: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 19,
    xxl: 22,
    xxxl: 28,
  },
  pesos: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  familias: {
    base: 'System',
    mono: 'Courier New',
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
 * Radio de esquinas redondeadas - más suave
 */
export const RADIO = {
  pequeno: 6,
  mediano: 10,
  grande: 14,
  redondeado: 18,
  completo: 999,
};

/**
 * Sombras sutiles y modernas
 */
export const SOMBRAS = {
  leve: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  media: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  profunda: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
};
