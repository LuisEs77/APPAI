import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { InputSeguro } from '@/components/auth/input-seguro';
import { BotonPrimario } from '@/components/comunes/boton-primario';
import {
  COLORES,
  TIPOGRAFIA,
  ESPACIADO,
} from '@/constants/colores';
import { TEXTOS } from '@/constants/textos';

/**
 * Pantalla: Olvido Contraseña
 * Recuperacion de contraseña (placeholder)
 */
export default function OlvidoPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleRecuperar = async () => {
    if (!email) {
      Alert.alert('Error', 'Ingresa tu email');
      return;
    }

    setCargando(true);
    // TODO: Implementar flujo de recuperacion de contraseña
    setTimeout(() => {
      Alert.alert(
        'Exito',
        'Se envio un enlace de recuperacion a tu email',
      );
      setCargando(false);
      router.back();
    }, 1500);
  };

  const estilos = StyleSheet.create({
    contenedor: {
      flex: 1,
      backgroundColor: COLORES.blanco,
    },
    contenido: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: ESPACIADO.lg,
    },
    titulo: {
      fontSize: TIPOGRAFIA.tamanios.xxl,
      fontWeight: TIPOGRAFIA.pesos.bold,
      color: COLORES.textoOscuro,
      marginBottom: ESPACIADO.md,
    },
    descripcion: {
      fontSize: TIPOGRAFIA.tamanios.base,
      color: COLORES.textoMedio,
      marginBottom: ESPACIADO.lg,
    },
    boton: {
      marginTop: ESPACIADO.lg,
    },
    voltear: {
      marginTop: ESPACIADO.xl,
      alignItems: 'center',
    },
    enlace: {
      color: COLORES.acento,
      fontWeight: TIPOGRAFIA.pesos.semibold,
    },
  });

  return (
    <SafeAreaView style={estilos.contenedor}>
      <View style={estilos.contenido}>
        <Text style={estilos.titulo}>{TEXTOS.olvidoPassword}</Text>
        <Text style={estilos.descripcion}>
          Ingresa tu email para recibir instrucciones de recuperacion
        </Text>

        <InputSeguro
          label={TEXTOS.email}
          placeholder="correo@ejemplo.com"
          valor={email}
          onChangeText={setEmail}
          tipoTeclado="email-address"
        />

        <BotonPrimario
          texto="Enviar Enlace"
          onPress={handleRecuperar}
          cargando={cargando}
          estilo={estilos.boton}
        />

        <View style={estilos.voltear}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={estilos.enlace}>{TEXTOS.volverAlLogin}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
