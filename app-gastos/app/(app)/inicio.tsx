import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORES, ESPACIADO, TIPOGRAFIA } from '@/constants/colores';
import { TEXTOS } from '@/constants/textos';
import gastosService, { Recibo } from '@/services/gastos.service';
import { useAutenticacion } from '@/hooks/use-autenticacion';

/**
 * Pantalla Principal (Home)
 * Muestra lista de gastos/recibos con opciones de filtro y navegación
 */
export default function HomeScreen() {
  const router = useRouter();
  const { usuario } = useAutenticacion();

  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mesActual, setMesActual] = useState(new Date().getMonth() + 1);
  const [anioActual, setAnioActual] = useState(new Date().getFullYear());

  /**
   * Cargar recibos del mes actual
   */
  const cargarRecibos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);

      // Construir fechas del mes
      const fechaInicio = `${anioActual}-${String(mesActual).padStart(2, '0')}-01`;
      const fechaFin = new Date(anioActual, mesActual, 0);
      const fechaFinStr = fechaFin.toISOString().split('T')[0];

      const datos = await gastosService.obtenerRecibos({
        fechaInicio,
        fechaFin: fechaFinStr,
      });

      setRecibos(datos);
    } catch (err: any) {
      setError(err.message || 'Error al cargar recibos');
      Alert.alert('Error', error || 'No pudimos cargar tus gastos');
    } finally {
      setCargando(false);
    }
  }, [mesActual, anioActual]);

  /**
   * Recargar recibos cuando la pantalla está enfocada
   */
  useFocusEffect(
    useCallback(() => {
      cargarRecibos();
    }, [cargarRecibos])
  );

  const handleActualizar = async () => {
    setActualizando(true);
    await cargarRecibos();
    setActualizando(false);
  };

  const handleEliminar = (reciboId: string, comercio: string) => {
    Alert.alert(
      'Eliminar gasto',
      `¿Deseas eliminar el gasto en ${comercio}?`,
      [
        { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await gastosService.eliminarRecibo(reciboId);
              setRecibos(recibos.filter((r) => r.id !== reciboId));
              Alert.alert('Exito', 'Gasto eliminado correctamente');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Error al eliminar gasto');
            }
          },
        },
      ]
    );
  };

  const totalMes = recibos.reduce((sum, r) => sum + Number(r.total), 0);

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const renderRecibo = ({ item }: { item: Recibo }) => (
    <TouchableOpacity
      style={estilos.tarjetaRecibo}
      onPress={() => router.push(`/recibo/${item.id}` as any)}
    >
      <View style={estilos.contenidoTarjeta}>
        <View style={estilos.infoIzquierda}>
          <Text style={estilos.comercio} numberOfLines={1}>
            {item.comercio}
          </Text>
          <Text style={estilos.categoria}>{item.categoria}</Text>
          <Text style={estilos.fecha}>{item.fecha}</Text>
        </View>

        <View style={estilos.infoDerecha}>
          <Text style={estilos.total}>Q{Number(item.total).toFixed(2)}</Text>
          <TouchableOpacity
            style={estilos.btnAccion}
            onPress={() => handleEliminar(item.id, item.comercio)}
          >
            <Ionicons name="trash-outline" size={18} color={COLORES.error} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={estilos.contenedor}>
      {/* Encabezado */}
      <View style={estilos.encabezado}>
        <View>
          <Text style={estilos.saludo}>Hola, {usuario?.nombre}</Text>
          <Text style={estilos.subtitulo}>Tus gastos del mes</Text>
        </View>
        <TouchableOpacity
          style={estilos.botonPerfil}
          onPress={() => router.push('/perfil' as any)}
        >
          <Ionicons name="person-circle-outline" size={32} color={COLORES.azulOscuro} />
        </TouchableOpacity>
      </View>

      {/* Card de total mensual */}
      <View style={estilos.cardTotal}>
        <View>
          <Text style={estilos.labelTotal}>Total {meses[mesActual - 1]}</Text>
          <Text style={estilos.montoTotal}>Q{totalMes.toFixed(2)}</Text>
          <Text style={estilos.cantidadGastos}>{recibos.length} gastos registrados</Text>
        </View>
        <Ionicons name="wallet-outline" size={40} color={COLORES.azulClaro} />
      </View>

      {/* Selectores de mes/año */}
      <View style={estilos.selectores}>
        <TouchableOpacity
          style={estilos.selectMes}
          onPress={() => {
            if (mesActual > 1) setMesActual(mesActual - 1);
            else {
              setMesActual(12);
              setAnioActual(anioActual - 1);
            }
          }}
        >
          <Ionicons name="chevron-back" size={20} color={COLORES.azulClaro} />
        </TouchableOpacity>

        <Text style={estilos.textoMes}>
          {meses[mesActual - 1]} {anioActual}
        </Text>

        <TouchableOpacity
          style={estilos.selectMes}
          onPress={() => {
            if (mesActual < 12) setMesActual(mesActual + 1);
            else {
              setMesActual(1);
              setAnioActual(anioActual + 1);
            }
          }}
        >
          <Ionicons name="chevron-forward" size={20} color={COLORES.azulClaro} />
        </TouchableOpacity>
      </View>

      {/* Lista de recibos */}
      {cargando ? (
        <View style={estilos.centered}>
          <ActivityIndicator size="large" color={COLORES.azulClaro} />
        </View>
      ) : recibos.length === 0 ? (
        <View style={estilos.centered}>
          <Ionicons name="document-outline" size={60} color={COLORES.grisClaro} />
          <Text style={estilos.textoVacio}>No hay gastos registrados</Text>
          <Text style={estilos.subtituloVacio}>Captura una factura para comenzar</Text>
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
              colors={[COLORES.azulClaro]}
            />
          }
        />
      )}

      {/* Boton flotante para capturar */}
      <TouchableOpacity
        style={estilos.botonFlotante}
        onPress={() => router.push('/capturador' as any)}
      >
        <Ionicons name="camera" size={28} color={COLORES.blanco} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.blanco,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ESPACIADO.lg,
    paddingVertical: ESPACIADO.lg,
    backgroundColor: COLORES.blanco,
  },
  saludo: {
    fontSize: TIPOGRAFIA.tamanios.xxl,
    fontWeight: '700',
    color: COLORES.azulOscuro,
    marginBottom: ESPACIADO.xs,
  },
  subtitulo: {
    fontSize: TIPOGRAFIA.tamanios.sm,
    color: COLORES.textoMedio,
  },
  botonPerfil: {
    padding: ESPACIADO.sm,
  },
  cardTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: ESPACIADO.lg,
    marginBottom: ESPACIADO.lg,
    paddingHorizontal: ESPACIADO.lg,
    paddingVertical: ESPACIADO.lg,
    backgroundColor: COLORES.azulOscuro,
    borderRadius: 12,
  },
  labelTotal: {
    fontSize: TIPOGRAFIA.tamanios.sm,
    color: COLORES.blanco,
    opacity: 0.8,
    marginBottom: ESPACIADO.xs,
  },
  montoTotal: {
    fontSize: TIPOGRAFIA.tamanios.xxxl,
    fontWeight: '700',
    color: COLORES.blanco,
    marginBottom: ESPACIADO.xs,
  },
  cantidadGastos: {
    fontSize: TIPOGRAFIA.tamanios.sm,
    color: COLORES.blanco,
    opacity: 0.8,
  },
  selectores: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ESPACIADO.lg,
    marginBottom: ESPACIADO.lg,
  },
  selectMes: {
    padding: ESPACIADO.sm,
  },
  textoMes: {
    fontSize: TIPOGRAFIA.tamanios.lg,
    fontWeight: '600',
    color: COLORES.azulOscuro,
  },
  listaContent: {
    paddingHorizontal: ESPACIADO.lg,
    paddingBottom: ESPACIADO.xxl,
  },
  tarjetaRecibo: {
    marginBottom: ESPACIADO.md,
    borderRadius: 8,
    backgroundColor: COLORES.grisClaro,
    overflow: 'hidden',
  },
  contenidoTarjeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ESPACIADO.lg,
    paddingVertical: ESPACIADO.md,
  },
  infoIzquierda: {
    flex: 1,
  },
  comercio: {
    fontSize: TIPOGRAFIA.tamanios.base,
    fontWeight: '600',
    color: COLORES.azulOscuro,
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
  btnAccion: {
    padding: ESPACIADO.xs,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoVacio: {
    fontSize: TIPOGRAFIA.tamanios.lg,
    fontWeight: '600',
    color: COLORES.azulOscuro,
    marginTop: ESPACIADO.lg,
  },
  subtituloVacio: {
    fontSize: TIPOGRAFIA.tamanios.sm,
    color: COLORES.textoMedio,
    marginTop: ESPACIADO.sm,
  },
  botonFlotante: {
    position: 'absolute',
    bottom: ESPACIADO.xxl,
    right: ESPACIADO.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORES.azulClaro,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
