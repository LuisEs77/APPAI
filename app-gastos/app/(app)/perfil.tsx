import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useAutenticacion } from '@/hooks/use-autenticacion';
import { COLORES, ESPACIADO, TIPOGRAFIA } from '@/constants/colores';

export default function PerfilScreen() {
  const { usuario, cerrarSesion } = useAutenticacion();

  return (
    <SafeAreaView style={estilos.contenedor}>
      <View style={estilos.contenido}>
        <View style={estilos.avatarContainer}>
          <Text style={estilos.avatarTexto}>
            {usuario?.nombre?.charAt(0) || 'U'}
          </Text>
        </View>

        <Text style={estilos.nombre}>{usuario?.nombre} {usuario?.apellido || ''}</Text>
        <Text style={estilos.email}>{usuario?.email}</Text>

        <TouchableOpacity style={estilos.botonCerrar} onPress={cerrarSesion}>
          <Text style={estilos.textoBotonCerrar}>Cerrar Sesion</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.blanco,
  },
  contenido: {
    padding: ESPACIADO.xl,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORES.azulClaro,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ESPACIADO.lg,
  },
  avatarTexto: {
    fontSize: 40,
    color: COLORES.blanco,
    fontWeight: 'bold',
  },
  nombre: {
    fontSize: TIPOGRAFIA.tamanios.xl,
    fontWeight: '700',
    color: COLORES.azulOscuro,
    marginBottom: ESPACIADO.xs,
  },
  email: {
    fontSize: TIPOGRAFIA.tamanios.base,
    color: COLORES.textoMedio,
    marginBottom: ESPACIADO.xxl,
  },
  botonCerrar: {
    backgroundColor: COLORES.error,
    paddingVertical: ESPACIADO.md,
    paddingHorizontal: ESPACIADO.xl,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  textoBotonCerrar: {
    color: COLORES.blanco,
    fontSize: TIPOGRAFIA.tamanios.base,
    fontWeight: '600',
  },
});
