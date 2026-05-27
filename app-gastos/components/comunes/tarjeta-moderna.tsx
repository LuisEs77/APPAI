import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { COLORES, SOMBRAS, RADIO, ESPACIADO } from '@/constants/colores';

interface TarjetaModernaProps {
  children: React.ReactNode;
  estiloPersonalizado?: ViewStyle;
  conSombra?: boolean;
}

/**
 * Tarjeta moderna con bordes redondeados suaves
 */
export const TarjetaModerna: React.FC<TarjetaModernaProps> = ({
  children,
  estiloPersonalizado,
  conSombra = true,
}) => {
  const estilos = StyleSheet.create({
    tarjeta: {
      backgroundColor: COLORES.blanco,
      borderRadius: RADIO.mediano,
      padding: ESPACIADO.lg,
      borderWidth: 1,
      borderColor: COLORES.grisClaro3,
      ...(conSombra && SOMBRAS.leve),
    },
  });

  return (
    <View style={[estilos.tarjeta, estiloPersonalizado]}>
      {children}
    </View>
  );
};