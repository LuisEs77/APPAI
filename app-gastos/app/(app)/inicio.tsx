import React, { useState, useCallback } from 'react';
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
import { useHaptics } from '@/hooks/use-haptics';
import { COLORES, ESPACIADO, TIPOGRAFIA, RADIO, SOMBRAS } from '@/constants/colores';
import { TEXTOS } from '@/constants/textos';
import gastosService, { Recibo } from '@/services/gastos.service';
import { useAutenticacion } from '@/hooks/use-autenticacion';

/**
 * Mapeo de iconos por categoría para mejorar la UX visual
 */
const CATEGORIA_ICONOS: Record<string, keyof typeof Ionicons.prototype.allNames | string> = {
  [TEXTOS.alimentacion]: 'fast-food',
  [TEXTOS.transporte]: 'car',
  [TEXTOS.servicios]: 'flash',
  [TEXTOS.salud]: 'medkit',
  [TEXTOS.educacion]: 'school',
  [TEXTOS.entretenimiento]: 'game-controller',
  [TEXTOS.ropa]: 'shirt',
  [TEXTOS.otros]: 'ellipsis-horizontal',
  'Comida': 'restaurant',
  'Supermercado': 'cart',
  'Transporte': 'bus',
  'Ocio': 'beer',
};

/**
 * Pantalla Principal (Home) - Rediseñada para una estética móvil moderna
 */
export default function HomeScreen() {
  const router = useRouter();
  const { usuario } = useAutenticacion();
  const haptics = useHaptics();

  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mesActual, setMesActual] = useState(new Date().getMonth() + 1);
  const [anioActual, setAnioActual] = useState(new Date().getFullYear());

  const cargarRecibos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);

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
    } finally {
      setCargando(false);
    }
  }, [mesActual, anioActual]);

  useFocusEffect(
    useCallback(() => {
      cargarRecibos();
    }, [cargarRecibos])
  );

  const handleActualizar = async () => {
    haptics.impactAsync(haptics.ImpactFeedbackStyle.Light);
    setActualizando(true);
    await cargarRecibos();
    setActualizando(false);
  };

  const handleEliminar = (reciboId: string, comercio: string) => {
    haptics.notificationAsync(haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Eliminar gasto',
      `¿Deseas eliminar el gasto en ${comercio}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await gastosService.eliminarRecibo(reciboId);
              setRecibos(recibos.filter((r) => r.id !== reciboId));
              haptics.notificationAsync(haptics.NotificationFeedbackType.Success);
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

  const renderRecibo = ({ item }: { item: Recibo }) => {
    const iconoName = CATEGORIA_ICONOS[item.categoria] || 'document-text-outline';
    
    return (
      <TouchableOpacity
        style={estilos.tarjetaRecibo}
        onPress={() => {
          haptics.selectionAsync();
          router.push(`/recibo/${item.id}` as any);
        }}
        activeOpacity={0.7}
      >
        <View style={estilos.iconoCategoriaContenedor}>
          <Ionicons name={iconoName as any} size={22} color={COLORES.acento} />
        </View>
        
        <View style={estilos.infoCentro}>
          <Text style={estilos.comercio} numberOfLines={1}>
            {item.comercio}
          </Text>
          <Text style={estilos.fecha}>{item.fecha}</Text>
        </View>

        <View style={estilos.infoDerecha}>
          <Text style={estilos.total}>Q{Number(item.total).toFixed(2)}</Text>
          <TouchableOpacity
            onPress={() => handleEliminar(item.id, item.comercio)}
            style={estilos.btnEliminar}
          >
            <Ionicons name="trash-outline" size={16} color={COLORES.textoClaro} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={estilos.contenedor}>
      <View style={estilos.contenido}>
        {/* Card de Resumen Mensual */}
        <View style={estilos.cardResumen}>
          <View style={estilos.cardHeader}>
            <Text style={estilos.labelResumen}>Balance de {meses[mesActual - 1]}</Text>
            <Ionicons name="stats-chart" size={20} color={COLORES.blanco} style={{ opacity: 0.6 }} />
          </View>
          <Text style={estilos.montoResumen}>Q{totalMes.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</Text>
          <View style={estilos.cardFooter}>
            <View style={estilos.badge}>
              <Text style={estilos.textoBadge}>{recibos.length} Transacciones</Text>
            </View>
          </View>
        </View>

        {/* Control de Periodo */}
        <View style={estilos.controlPeriodo}>
          <TouchableOpacity 
            style={estilos.btnFlecha}
            onPress={() => {
              haptics.impactAsync(haptics.ImpactFeedbackStyle.Light);
              if (mesActual > 1) setMesActual(mesActual - 1);
              else { setMesActual(12); setAnioActual(anioActual - 1); }
            }}
          >
            <Ionicons name="chevron-back" size={24} color={COLORES.textoOscuro} />
          </TouchableOpacity>

          <Text style={estilos.textoPeriodo}>{meses[mesActual - 1]} {anioActual}</Text>

          <TouchableOpacity 
            style={estilos.btnFlecha}
            onPress={() => {
              haptics.impactAsync(haptics.ImpactFeedbackStyle.Light);
              if (mesActual < 12) setMesActual(mesActual + 1);
              else { setMesActual(1); setAnioActual(anioActual + 1); }
            }}
          >
            <Ionicons name="chevron-forward" size={24} color={COLORES.textoOscuro} />
          </TouchableOpacity>
        </View>

        {/* Lista de Movimientos */}
        <View style={estilos.seccionLista}>
          <Text style={estilos.tituloSeccion}>Movimientos recientes</Text>
          
          {cargando ? (
            <View style={estilos.centered}>
              <ActivityIndicator size="large" color={COLORES.acento} />
            </View>
          ) : recibos.length === 0 ? (
            <View style={estilos.centered}>
              <View style={estilos.vacioIcono}>
                <Ionicons name="receipt-outline" size={48} color={COLORES.textoPlaceholder} />
              </View>
              <Text style={estilos.textoVacio}>No hay registros para este mes</Text>
              <TouchableOpacity 
                style={estilos.btnVacio}
                onPress={() => router.push('/capturador' as any)}
              >
                <Text style={estilos.btnVacioTexto}>Empezar a capturar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={recibos}
              renderItem={renderRecibo}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={estilos.listaContent}
              refreshControl={
                <RefreshControl
                  refreshing={actualizando}
                  onRefresh={handleActualizar}
                  tintColor={COLORES.acento}
                />
              }
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.fondoSecundario,
  },
  contenido: {
    flex: 1,
    paddingHorizontal: ESPACIADO.lg,
  },
  cardResumen: {
    backgroundColor: COLORES.grisOscuro2,
    borderRadius: RADIO.grande,
    padding: ESPACIADO.lg,
    marginTop: ESPACIADO.md,
    ...SOMBRAS.profunda,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ESPACIADO.xs,
  },
  labelResumen: {
    color: COLORES.blanco,
    fontSize: TIPOGRAFIA.tamanios.base,
    fontWeight: TIPOGRAFIA.pesos.semibold,
  },
  montoResumen: {
    color: COLORES.acento,
    fontSize: 36,
    fontWeight: TIPOGRAFIA.pesos.bold,
    marginVertical: ESPACIADO.xs,
  },
  cardFooter: {
    marginTop: ESPACIADO.sm,
  },
  badge: {
    backgroundColor: 'rgba(204,255,0,0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: ESPACIADO.sm,
    paddingVertical: ESPACIADO.xs,
    borderRadius: RADIO.pequeno,
  },
  textoBadge: {
    color: COLORES.acento,
    fontSize: TIPOGRAFIA.tamanios.xs,
    fontWeight: TIPOGRAFIA.pesos.bold,
  },
  controlPeriodo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: ESPACIADO.lg,
    backgroundColor: COLORES.blanco,
    borderRadius: RADIO.mediano,
    padding: ESPACIADO.md,
    ...SOMBRAS.leve,
  },
  btnFlecha: {
    padding: ESPACIADO.sm,
  },
  textoPeriodo: {
    fontSize: TIPOGRAFIA.tamanios.base,
    fontWeight: TIPOGRAFIA.pesos.bold,
    color: COLORES.textoOscuro,
  },
  seccionLista: {
    flex: 1,
  },
  tituloSeccion: {
    fontSize: TIPOGRAFIA.tamanios.lg,
    fontWeight: '700',
    color: COLORES.textoOscuro,
    marginBottom: ESPACIADO.md,
  },
  listaContent: {
    paddingBottom: ESPACIADO.xl,
  },
  tarjetaRecibo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.blanco,
    padding: ESPACIADO.md,
    borderRadius: RADIO.grande,
    marginBottom: ESPACIADO.sm,
    ...SOMBRAS.leve,
  },
  iconoCategoriaContenedor: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORES.grisClaro,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ESPACIADO.md,
  },
  infoCentro: {
    flex: 1,
  },
  comercio: {
    fontSize: TIPOGRAFIA.tamanios.base,
    fontWeight: '700',
    color: COLORES.textoOscuro,
  },
  fecha: {
    fontSize: TIPOGRAFIA.tamanios.xs,
    color: COLORES.textoMedio,
    marginTop: 2,
  },
  infoDerecha: {
    alignItems: 'flex-end',
  },
  total: {
    fontSize: TIPOGRAFIA.tamanios.base,
    fontWeight: '800',
    color: COLORES.acento,
  },
  btnEliminar: {
    marginTop: 4,
    padding: 2,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  vacioIcono: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORES.grisClaro,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ESPACIADO.md,
  },
  textoVacio: {
    fontSize: TIPOGRAFIA.tamanios.base,
    color: COLORES.textoMedio,
    marginBottom: ESPACIADO.lg,
  },
  btnVacio: {
    backgroundColor: COLORES.acento,
    paddingHorizontal: ESPACIADO.lg,
    paddingVertical: ESPACIADO.md,
    borderRadius: RADIO.grande,
  },
  btnVacioTexto: {
    color: COLORES.negro,
    fontWeight: '700',
  },
});
