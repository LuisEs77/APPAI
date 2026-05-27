import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { COLORES, ESPACIADO, TIPOGRAFIA } from '@/constants/colores';
import gastosService, { Recibo } from '@/services/gastos.service';

export default function HistorialScreen() {
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarHistorial = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      // Obtener todo el historial
      const datos = await gastosService.obtenerRecibos();
      setRecibos(datos);
    } catch (err: any) {
      setError(err.message || 'Error al cargar historial');
      Alert.alert('Error', error || 'No pudimos cargar tu historial');
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarHistorial();
    }, [cargarHistorial])
  );

  const handleActualizar = async () => {
    setActualizando(true);
    await cargarHistorial();
    setActualizando(false);
  };

  const renderRecibo = ({ item }: { item: Recibo }) => (
    <View style={estilos.tarjetaRecibo}>
      <View style={estilos.infoIzquierda}>
        <Text style={estilos.comercio} numberOfLines={1}>
          {item.comercio}
        </Text>
        <Text style={estilos.categoria}>{item.categoria}</Text>
        <Text style={estilos.fecha}>{item.fecha}</Text>
      </View>
      <View style={estilos.infoDerecha}>
        <Text style={estilos.total}>Q{Number(item.total).toFixed(2)}</Text>
        <Text style={estilos.estado}>{item.estado}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={estilos.contenedor}>
      {cargando ? (
        <View style={estilos.centered}>
          <ActivityIndicator size="large" color={COLORES.acento} />
        </View>
      ) : (
        <FlatList
          data={recibos}
          renderItem={renderRecibo}
          keyExtractor={(item) => item.id}
          contentContainerStyle={estilos.listaContent}
          refreshControl={
            <RefreshControl
              refreshing={actualizando}
              onRefresh={handleActualizar}
              colors={[COLORES.acento]}
            />
          }
          ListEmptyComponent={
            <View style={estilos.centered}>
              <Text style={estilos.textoVacio}>No hay historial disponible</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.blanco,
  },
  listaContent: {
    paddingHorizontal: ESPACIADO.lg,
    paddingVertical: ESPACIADO.lg,
  },
  tarjetaRecibo: {
    marginBottom: ESPACIADO.md,
    borderRadius: 8,
    backgroundColor: COLORES.grisClaro,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: ESPACIADO.lg,
    paddingVertical: ESPACIADO.md,
  },
  infoIzquierda: {
    flex: 1,
  },
  comercio: {
    fontSize: TIPOGRAFIA.tamanios.base,
    fontWeight: '600',
    color: COLORES.textoOscuro,
    marginBottom: ESPACIADO.xs,
  },
  categoria: {
    fontSize: TIPOGRAFIA.tamanios.sm,
    color: COLORES.textoMedio,
    marginBottom: ESPACIADO.xs,
  },
  fecha: {
    fontSize: TIPOGRAFIA.tamanios.xs,
    color: COLORES.textoMedio,
  },
  infoDerecha: {
    alignItems: 'flex-end',
  },
  total: {
    fontSize: TIPOGRAFIA.tamanios.lg,
    fontWeight: '700',
    color: COLORES.exito,
    marginBottom: ESPACIADO.xs,
  },
  estado: {
    fontSize: TIPOGRAFIA.tamanios.xs,
    color: COLORES.textoMedio,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: ESPACIADO.xxl,
  },
  textoVacio: {
    fontSize: TIPOGRAFIA.tamanios.base,
    color: COLORES.textoMedio,
  },
});
