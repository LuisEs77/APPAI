import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Pressable,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORES, TIPOGRAFIA, RADIO, ESPACIADO, SOMBRAS } from '@/constants/colores';

interface InputModernoProps extends TextInputProps {
  etiqueta?: string;
  icono?: keyof typeof Ionicons.glyphMap;
  error?: string;
  estiloContenedor?: ViewStyle;
}

/**
 * Input moderno con etiqueta y validación
 */
export const InputModerno: React.FC<InputModernoProps> = ({
  etiqueta,
  icono,
  error,
  estiloContenedor,
  placeholder,
  secureTextEntry: secureInitial,
  ...props
}) => {
  const [focusedAt, setFocusedAt] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(!secureInitial);

  const estilos = StyleSheet.create({
    contenedor: {
      marginBottom: ESPACIADO.md,
    },
    etiqueta: {
      fontSize: TIPOGRAFIA.tamanios.sm,
      fontWeight: TIPOGRAFIA.pesos.semibold,
      color: COLORES.textoOscuro,
      marginBottom: ESPACIADO.sm,
    },
    contenedorInput: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORES.fondoSecundario,
      borderRadius: RADIO.mediano,
      borderWidth: 1.5,
      borderColor: focusedAt ? COLORES.acento : COLORES.grisClaro3,
      paddingHorizontal: ESPACIADO.md,
      paddingVertical: ESPACIADO.sm,
      gap: ESPACIADO.sm,
    },
    input: {
      flex: 1,
      fontSize: TIPOGRAFIA.tamanios.base,
      color: COLORES.textoOscuro,
      fontWeight: TIPOGRAFIA.pesos.normal,
    },
    icono: {
      color: focusedAt ? COLORES.acento : COLORES.grisOscuro,
    },
    textoError: {
      fontSize: TIPOGRAFIA.tamanios.xs,
      color: COLORES.error,
      marginTop: ESPACIADO.xs,
      fontWeight: TIPOGRAFIA.pesos.medium,
    },
  });

  return (
    <View style={[estilos.contenedor, estiloContenedor]}>
      {etiqueta && <Text style={estilos.etiqueta}>{etiqueta}</Text>}
      <View style={estilos.contenedorInput}>
        {icono && <Ionicons name={icono} size={20} style={estilos.icono} />}
        <TextInput
          {...props}
          placeholder={placeholder || 'Ingresa un valor'}
          placeholderTextColor={COLORES.textoPlaceholder}
          secureTextEntry={secureInitial && !mostrarPassword}
          onFocus={() => setFocusedAt(true)}
          onBlur={() => setFocusedAt(false)}
          style={estilos.input}
        />
        {secureInitial && (
          <Pressable onPress={() => setMostrarPassword(!mostrarPassword)}>
            <Ionicons
              name={mostrarPassword ? 'eye-off' : 'eye'}
              size={20}
              style={estilos.icono}
            />
          </Pressable>
        )}
      </View>
      {error && <Text style={estilos.textoError}>{error}</Text>}
    </View>
  );
};