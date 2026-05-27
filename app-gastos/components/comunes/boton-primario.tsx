import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { COLORES, TIPOGRAFIA, ESPACIADO, RADIO, SOMBRAS } from '@/constants/colores';

interface BotonPrimarioxProps {
  texto: string;
  onPress: () => void;
  cargando?: boolean;
  deshabilitado?: boolean;
  estilo?: ViewStyle;
  estiloTexto?: TextStyle;
  colorFondo?: string;
}

/**
 * Componente BotonPrimario
 * Boton reutilizable con estetica corporativa
 * Soporta carga y estados deshabilitados
 */
export const BotonPrimario: React.FC<BotonPrimarioxProps> = ({
  texto,
  onPress,
  cargando = false,
  deshabilitado = false,
  estilo,
  estiloTexto,
  colorFondo = COLORES.acento,
}) => {
  const estilosLocales = StyleSheet.create({
    boton: {
      backgroundColor: deshabilitado ? COLORES.grisClaro : colorFondo,
      paddingVertical: ESPACIADO.md,
      paddingHorizontal: ESPACIADO.lg,
      borderRadius: RADIO.grande,
      alignItems: 'center',
      justifyContent: 'center',
      ...SOMBRAS.media,
    },
    texto: {
      color: deshabilitado ? COLORES.textoClaro : COLORES.blanco,
      fontSize: TIPOGRAFIA.tamanios.base,
      fontWeight: TIPOGRAFIA.pesos.semibold,
    },
  });

  return (
    <TouchableOpacity
      style={[estilosLocales.boton, estilo]}
      onPress={onPress}
      disabled={cargando || deshabilitado}
      activeOpacity={0.8}
    >
      {cargando ? (
        <ActivityIndicator color={COLORES.blanco} />
      ) : (
        <Text style={[estilosLocales.texto, estiloTexto]}>{texto}</Text>
      )}
    </TouchableOpacity>
  );
};
