import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {
  DrawerNavigationProp,
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { useAutenticacion } from '@/hooks/use-autenticacion';
import { useRouter } from 'expo-router';
import {
  COLORES,
  TIPOGRAFIA,
  ESPACIADO,
  RADIO,
  SOMBRAS,
} from '@/constants/colores';
import { TEXTOS } from '@/constants/textos';

interface MenuLateralProps extends DrawerContentComponentProps {}

/**
 * Componente MenuLateral (Drawer Navigator)
 * Menu lateral con opciones de navegacion
 */
export const MenuLateral: React.FC<MenuLateralProps> = (props) => {
  const { usuario, cerrarSesion } = useAutenticacion();
  const router = useRouter();

  const handleCerrarSesion = async () => {
    await cerrarSesion();
    router.replace('/(auth)/iniciar-sesion' as any);
  };

  const estilos = StyleSheet.create({
    contenedor: {
      flex: 1,
      backgroundColor: COLORES.blanco,
    },
    perfil: {
      backgroundColor: COLORES.azulOscuro,
      padding: ESPACIADO.lg,
      paddingTop: ESPACIADO.xl,
      paddingBottom: ESPACIADO.xl,
    },
    nombreUsuario: {
      fontSize: TIPOGRAFIA.tamanios.lg,
      fontWeight: TIPOGRAFIA.pesos.bold,
      color: COLORES.blanco,
      marginBottom: ESPACIADO.xs,
    },
    email: {
      fontSize: TIPOGRAFIA.tamanios.sm,
      color: COLORES.grisClaro,
    },
    seccion: {
      borderBottomWidth: 1,
      borderBottomColor: COLORES.grisClaro,
      paddingVertical: ESPACIADO.md,
    },
    opcion: {
      paddingVertical: ESPACIADO.md,
      paddingHorizontal: ESPACIADO.lg,
      flexDirection: 'row',
      alignItems: 'center',
    },
    textoOpcion: {
      fontSize: TIPOGRAFIA.tamanios.base,
      color: COLORES.textoOscuro,
      fontWeight: TIPOGRAFIA.pesos.semibold,
      marginLeft: ESPACIADO.md,
    },
    botonCerrar: {
      backgroundColor: COLORES.error,
      marginHorizontal: ESPACIADO.lg,
      marginBottom: ESPACIADO.lg,
      paddingVertical: ESPACIADO.md,
      borderRadius: RADIO.mediano,
      alignItems: 'center',
      ...SOMBRAS.leve,
    },
    textoCerrar: {
      color: COLORES.blanco,
      fontSize: TIPOGRAFIA.tamanios.base,
      fontWeight: TIPOGRAFIA.pesos.semibold,
    },
  });

  return (
    <DrawerContentScrollView {...props} scrollEnabled={false}>
      <View style={estilos.contenedor}>
        {/* Encabezado con datos del usuario */}
        <View style={estilos.perfil}>
          <Text style={estilos.nombreUsuario}>
            {usuario?.nombre} {usuario?.apellido}
          </Text>
          <Text style={estilos.email}>{usuario?.email}</Text>
        </View>

        {/* Opciones de navegacion */}
        <View style={estilos.seccion}>
          <TouchableOpacity
            style={estilos.opcion}
            onPress={() => {
              props.navigation.navigate('inicio');
            }}
          >
            <Text style={estilos.textoOpcion}>{TEXTOS.inicio}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={estilos.opcion}
            onPress={() => {
              props.navigation.navigate('historial');
            }}
          >
            <Text style={estilos.textoOpcion}>{TEXTOS.historial}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={estilos.opcion}
            onPress={() => {
              props.navigation.navigate('perfil');
            }}
          >
            <Text style={estilos.textoOpcion}>{TEXTOS.perfil}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={estilos.opcion}
            onPress={() => {
              props.navigation.navigate('configuracion');
            }}
          >
            <Text style={estilos.textoOpcion}>{TEXTOS.configuracion}</Text>
          </TouchableOpacity>
        </View>

        {/* Boton de cerrar sesion */}
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={estilos.botonCerrar}
          onPress={handleCerrarSesion}
        >
          <Text style={estilos.textoCerrar}>{TEXTOS.cerrarSesion}</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};
