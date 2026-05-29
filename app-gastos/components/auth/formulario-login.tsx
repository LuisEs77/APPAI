import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAutenticacion } from '@/hooks/use-autenticacion';
import { InputSeguro } from './input-seguro';
import { BotonPrimario } from '../comunes/boton-primario';
import {
  COLORES,
  TIPOGRAFIA,
  ESPACIADO,
  RADIO,
  SOMBRAS,
} from '@/constants/colores';
import { TEXTOS } from '@/constants/textos';

/**
 * Componente FormularioLogin
 * Formulario para inicio de sesión
 */
export const FormularioLogin: React.FC = () => {
  const router = useRouter();
  const { iniciarSesion, cargando, error, limpiarError } = useAutenticacion();

  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [erroresValidacion, setErroresValidacion] = useState<{
    email?: string;
    contraseña?: string;
  }>({});

  const validar = (): boolean => {
    const errores: typeof erroresValidacion = {};

    if (!email) {
      errores.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errores.email = 'El email no es valido';
    }

    if (!contraseña) {
      errores.contraseña = 'La contraseña es requerida';
    } else if (contraseña.length < 8) {
      errores.contraseña = 'La contraseña debe tener minimo 8 caracteres';
    }

    setErroresValidacion(errores);
    return Object.keys(errores).length === 0;
  };

  const handleLogin = async () => {
    limpiarError();

    if (!validar()) {
      return;
    }

    try {
      await iniciarSesion(email, contraseña);
      // Navegar a la pantalla de inicio cuando el login es exitoso
      router.replace('/(app)/inicio' as any);
    } catch (err) {
      Alert.alert(
        'Error al iniciar sesion',
        error || 'Verifica tus credenciales e intenta de nuevo',
      );
    }
  };

  const estilos = StyleSheet.create({
    contenedor: {
      flex: 1,
      backgroundColor: COLORES.blanco,
    },
    contenido: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: ESPACIADO.lg,
      paddingVertical: ESPACIADO.xxl,
    },
    encabezado: {
      marginBottom: ESPACIADO.xxl,
      alignItems: 'center',
    },
    titulo: {
      fontSize: TIPOGRAFIA.tamanios.xxxl,
      fontWeight: TIPOGRAFIA.pesos.bold,
      color: COLORES.textoOscuro,
      marginBottom: ESPACIADO.sm,
    },
    subtitulo: {
      fontSize: TIPOGRAFIA.tamanios.base,
      color: COLORES.textoMedio,
    },
    formulario: {
      marginBottom: ESPACIADO.xl,
    },
    boton: {
      marginTop: ESPACIADO.lg,
    },
    pie: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: ESPACIADO.lg,
    },
    textoRegular: {
      fontSize: TIPOGRAFIA.tamanios.base,
      color: COLORES.textoMedio,
    },
    enlace: {
      fontSize: TIPOGRAFIA.tamanios.base,
      color: COLORES.acento,
      fontWeight: TIPOGRAFIA.pesos.semibold,
      marginLeft: ESPACIADO.xs,
    },
    enlacePassword: {
      alignSelf: 'flex-end',
      marginTop: ESPACIADO.md,
      marginBottom: ESPACIADO.lg,
    },
    textoEnlace: {
      fontSize: TIPOGRAFIA.tamanios.sm,
      color: COLORES.acento,
      fontWeight: TIPOGRAFIA.pesos.semibold,
    },
  });

  return (
    <SafeAreaView style={estilos.contenedor}>
      <ScrollView
        contentContainerStyle={estilos.contenido}
        showsVerticalScrollIndicator={false}
      >
        <View style={estilos.encabezado}>
          <Text style={estilos.titulo}>Control de Gastos</Text>
          <Text style={estilos.subtitulo}>{TEXTOS.iniciarSesion}</Text>
        </View>

        <View style={estilos.formulario}>
          <InputSeguro
            label={TEXTOS.email}
            placeholder="correo@ejemplo.com"
            valor={email}
            onChangeText={setEmail}
            tipoTeclado="email-address"
            error={erroresValidacion.email}
          />

          <InputSeguro
            label={TEXTOS.contraseña}
            placeholder="Ingresa tu contraseña"
            valor={contraseña}
            onChangeText={setContraseña}
            esPassword
            error={erroresValidacion.contraseña}
          />

          <TouchableOpacity
            style={estilos.enlacePassword}
            onPress={() => router.push('/(auth)/olvido-password' as any)}
          >
            <Text style={estilos.textoEnlace}>{TEXTOS.olvidoPassword}</Text>
          </TouchableOpacity>

          <BotonPrimario
            texto={TEXTOS.iniciarSesion}
            onPress={handleLogin}
            cargando={cargando}
            estilo={estilos.boton}
          />
        </View>

        <View style={estilos.pie}>
          <Text style={estilos.textoRegular}>{TEXTOS.noHaysCuenta}</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/crear-cuenta' as any)}>
            <Text style={estilos.enlace}>{TEXTOS.registrate}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
