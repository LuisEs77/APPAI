import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Switch } from 'react-native';
import { COLORES, ESPACIADO, TIPOGRAFIA } from '@/constants/colores';

export default function ConfiguracionScreen() {
  const [notificaciones, setNotificaciones] = useState(true);
  const [modoOscuro, setModoOscuro] = useState(false);

  return (
    <SafeAreaView style={estilos.contenedor}>
      <View style={estilos.contenido}>
        <Text style={estilos.titulo}>Configuracion</Text>

        <View style={estilos.opcion}>
          <View style={estilos.textosOpcion}>
            <Text style={estilos.tituloOpcion}>Notificaciones Push</Text>
            <Text style={estilos.descripcionOpcion}>
              Recibe alertas sobre tus gastos y recordatorios
            </Text>
          </View>
          <Switch
            value={notificaciones}
            onValueChange={setNotificaciones}
            trackColor={{ false: COLORES.grisClaro, true: COLORES.acento }}
            thumbColor={COLORES.blanco}
          />
        </View>

        <View style={estilos.opcion}>
          <View style={estilos.textosOpcion}>
            <Text style={estilos.tituloOpcion}>Modo Oscuro</Text>
            <Text style={estilos.descripcionOpcion}>
              Cambia la apariencia de la aplicacion
            </Text>
          </View>
          <Switch
            value={modoOscuro}
            onValueChange={setModoOscuro}
            trackColor={{ false: COLORES.grisClaro, true: COLORES.acento }}
            thumbColor={COLORES.blanco}
          />
        </View>
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
    padding: ESPACIADO.lg,
  },
  titulo: {
    fontSize: TIPOGRAFIA.tamanios.xl,
    fontWeight: '700',
    color: COLORES.textoOscuro,
    marginBottom: ESPACIADO.xl,
  },
  opcion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: ESPACIADO.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.grisClaro,
  },
  textosOpcion: {
    flex: 1,
    paddingRight: ESPACIADO.md,
  },
  tituloOpcion: {
    fontSize: TIPOGRAFIA.tamanios.base,
    fontWeight: '600',
    color: COLORES.textoOscuro,
    marginBottom: 4,
  },
  descripcionOpcion: {
    fontSize: TIPOGRAFIA.tamanios.sm,
    color: COLORES.textoMedio,
  },
});
