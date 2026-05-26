import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORES, TIPOGRAFIA, ESPACIADO, RADIO } from '@/constants/colores';

interface InputSeguroProps {
  placeholder: string;
  valor: string;
  onChangeText: (text: string) => void;
  esPassword?: boolean;
  tipoTeclado?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  editable?: boolean;
  label?: string;
  error?: string;
  estilo?: ViewStyle;
}

/**
 * Componente InputSeguro
 * Input reutilizable con soporte para contraseñas y validación
 */
export const InputSeguro: React.FC<InputSeguroProps> = ({
  placeholder,
  valor,
  onChangeText,
  esPassword = false,
  tipoTeclado = 'default',
  editable = true,
  label,
  error,
  estilo,
}) => {
  const [mostrarPassword, setMostrarPassword] = useState(!esPassword);

  const estilosLocales = StyleSheet.create({
    contenedor: {
      marginBottom: ESPACIADO.md,
    },
    label: {
      fontSize: TIPOGRAFIA.tamanios.sm,
      fontWeight: TIPOGRAFIA.pesos.semibold,
      color: COLORES.textoOscuro,
      marginBottom: ESPACIADO.xs,
    },
    input: {
      borderWidth: 1,
      borderColor: error ? COLORES.error : COLORES.grisClaro,
      borderRadius: RADIO.mediano,
      paddingHorizontal: ESPACIADO.md,
      paddingVertical: ESPACIADO.sm,
      fontSize: TIPOGRAFIA.tamanios.base,
      color: COLORES.textoOscuro,
      backgroundColor: COLORES.blanco,
    },
    error: {
      color: COLORES.error,
      fontSize: TIPOGRAFIA.tamanios.xs,
      marginTop: ESPACIADO.xs,
    },
  });

  return (
    <View style={[estilosLocales.contenedor, estilo]}>
      {label && <Text style={estilosLocales.label}>{label}</Text>}
      <TextInput
        style={estilosLocales.input}
        placeholder={placeholder}
        placeholderTextColor={COLORES.textoPlaceholder}
        value={valor}
        onChangeText={onChangeText}
        secureTextEntry={esPassword && !mostrarPassword}
        keyboardType={tipoTeclado}
        editable={editable}
      />
      {error && <Text style={estilosLocales.error}>{error}</Text>}
    </View>
  );
};
