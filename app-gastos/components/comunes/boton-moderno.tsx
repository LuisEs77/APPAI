import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { COLORES, TIPOGRAFIA, RADIO, ESPACIADO, SOMBRAS } from '@/constants/colores';

interface BotonModernoProps {
  titulo: string;
  onPress: () => void;
  tipo?: 'primario' | 'secundario' | 'peligro';
  tamanio?: 'pequeno' | 'mediano' | 'grande';
  deshabilitado?: boolean;
  cargando?: boolean;
  icono?: React.ReactNode;
  estiloPersonalizado?: ViewStyle;
}

/**
 * Botón moderno y amigable con verde lima como acento
 */
export const BotonModerno: React.FC<BotonModernoProps> = ({
  titulo,
  onPress,
  tipo = 'primario',
  tamanio = 'mediano',
  deshabilitado = false,
  cargando = false,
  icono,
  estiloPersonalizado,
}) => {
  const estilos = StyleSheet.create({
    botonPrimario: {
      backgroundColor: COLORES.acento,
      borderRadius: RADIO.mediano,
      paddingVertical: tamanio === 'pequeno' ? ESPACIADO.sm : tamanio === 'mediano' ? ESPACIADO.md : ESPACIADO.lg,
      paddingHorizontal: tamanio === 'pequeno' ? ESPACIADO.md : tamanio === 'mediano' ? ESPACIADO.lg : ESPACIADO.xl,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: ESPACIADO.sm,
      ...SOMBRAS.media,
      opacity: deshabilitado ? 0.5 : 1,
    },
    botonSecundario: {
      backgroundColor: COLORES.fondoSecundario,
      borderRadius: RADIO.mediano,
      borderWidth: 1.5,
      borderColor: COLORES.grisClaro3,
      paddingVertical: tamanio === 'pequeno' ? ESPACIADO.sm : tamanio === 'mediano' ? ESPACIADO.md : ESPACIADO.lg,
      paddingHorizontal: tamanio === 'pequeno' ? ESPACIADO.md : tamanio === 'mediano' ? ESPACIADO.lg : ESPACIADO.xl,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: ESPACIADO.sm,
      opacity: deshabilitado ? 0.5 : 1,
    },
    botonPeligro: {
      backgroundColor: COLORES.error,
      borderRadius: RADIO.mediano,
      paddingVertical: tamanio === 'pequeno' ? ESPACIADO.sm : tamanio === 'mediano' ? ESPACIADO.md : ESPACIADO.lg,
      paddingHorizontal: tamanio === 'pequeno' ? ESPACIADO.md : tamanio === 'mediano' ? ESPACIADO.lg : ESPACIADO.xl,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: ESPACIADO.sm,
      ...SOMBRAS.media,
      opacity: deshabilitado ? 0.5 : 1,
    },
    textoBoton: {
      fontWeight: TIPOGRAFIA.pesos.semibold,
      fontSize: tamanio === 'pequeno' ? TIPOGRAFIA.tamanios.sm : tamanio === 'mediano' ? TIPOGRAFIA.tamanios.base : TIPOGRAFIA.tamanios.lg,
      color: tipo === 'primario' ? COLORES.negro : tipo === 'peligro' ? COLORES.blanco : COLORES.textoOscuro,
    },
  });

  const estiloBase = tipo === 'primario' ? estilos.botonPrimario : tipo === 'peligro' ? estilos.botonPeligro : estilos.botonSecundario;

  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitado || cargando}
      style={({ pressed }) => [
        estiloBase,
        pressed && { opacity: 0.7 },
        estiloPersonalizado,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={tipo === 'primario' ? COLORES.negro : COLORES.textoOscuro} />
      ) : (
        <>
          {icono}
          <Text style={estilos.textoBoton}>{titulo}</Text>
        </>
      )}
    </Pressable>
  );
};