import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { ImageCarousel } from '../../components/image-carousel';
import { CropModal } from '../../components/crop-modal';
import { ProcessingStatus } from '../../components/processing-status';
import uuid from 'react-native-uuid';

// Asegúrate de que esta URL no tenga ".app" al final y apunte a tu Ngrok
const URL_BACKEND = 'https://vintage-visitor-wrench.ngrok-free.dev/gastos';

interface ImageItem {
  uri: string;
  base64: string;
  id: string;
}

interface ProcessingState {
  total: number;
  processed: number;
  successful: number;
  duplicates: number;
  errors: number;
  isLoading: boolean;
  errorDetails?: any;
}

export default function GastosApp() {
  // Estado de imágenes
  const [images, setImages] = useState<ImageItem[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Estado de interfaz
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Estado de modal de recorte
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<ImageItem | null>(null);

  // Estado de procesamiento
  const [processingVisible, setProcessingVisible] = useState(false);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    total: 0,
    processed: 0,
    successful: 0,
    duplicates: 0,
    errors: 0,
    isLoading: false,
  });

  /**
   * Tomar foto con cámara (Versión Segura)
   */
  const tomarFoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        base64: true,
        quality: 0.5, // 💡 Bajamos a 0.5: Las fotos son más ligeras y el Base64 no satura la memoria RAM
        aspect: [4, 3],
      });

      // 💡 Condición más flexible para evitar que falle en silencio
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        const newImage: ImageItem = {
          uri: asset.uri,
          base64: asset.base64 || '', // Si tarda en llegar, evitamos el crash
          id: Date.now().toString(), // 💡 100% nativo y seguro, sin librerías externas
        };

        // 💡 Actualización funcional pura: Fuerza a React a renderizar la pantalla
        setImages((prevImages) => {
          const nuevas = [...prevImages, newImage];
          setCurrentImageIndex(nuevas.length - 1); // Enfocamos la imagen nueva
          return nuevas;
        });
      }
    } catch (error) {
      console.error("Error en cámara: ", error);
      Alert.alert("Error", "No se pudo procesar la fotografía.");
    }
  };

  /**
   * Seleccionar foto de galería (Versión Segura)
   */
  const seleccionarDelGaleria = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permiso denegado', 'Se necesita acceso a la galería.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        base64: true,
        quality: 0.5,
        aspect: [4, 3],
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        const nuevasImagenes = result.assets.map((asset, index) => ({
          uri: asset.uri,
          base64: asset.base64 || '',
          id: `${Date.now().toString()}-${index}`, // IDs únicos basados en tiempo
        }));

        setImages((prevImages) => [...prevImages, ...nuevasImagenes]);
      }
    } catch (error) {
      console.error("Error en galería: ", error);
      Alert.alert("Error", "No se pudo cargar la galería.");
    }
  };

  /**
   * Abre el modal de recorte para la imagen actual
   */
  const abrirRecortador = () => {
    if (images.length === 0) {
      Alert.alert('⚠️', 'Selecciona una imagen primero.');
      return;
    }
    setImageToCrop(images[currentImageIndex]);
    setCropModalVisible(true);
  };

  /**
   * Procesa el recorte y actualiza la imagen
   */
  const procesarRecorte = (base64Recortada: string) => {
    const imagenesActualizadas = [...images];
    imagenesActualizadas[currentImageIndex].base64 = base64Recortada;
    setImages(imagenesActualizadas);
    setCropModalVisible(false);
    Alert.alert('✅', 'Imagen recortada exitosamente.');
  };

  /**
   * Elimina una imagen del array
   */
  const eliminarImagen = (id: string) => {
    const nuevasImagenes = images.filter((img) => img.id !== id);
    setImages(nuevasImagenes);
    if (currentImageIndex >= nuevasImagenes.length && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  /**
   * Envía todas las imágenes al backend
   */
  const procesarTodasLasImagenes = async () => {
    if (images.length === 0) {
      Alert.alert('⚠️', 'Debes agregar al menos una imagen.');
      return;
    }

    setProcessingVisible(true);
    setProcessingState({
      total: images.length,
      processed: 0,
      successful: 0,
      duplicates: 0,
      errors: 0,
      isLoading: true,
    });

    try {
      const base64Array = images.map((img) => img.base64);

      const response = await fetch(`${URL_BACKEND}/procesar-multiples`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: base64Array }),
      });

      const data = await response.json();

      // Actualizar estado de procesamiento
      setProcessingState({
        total: images.length,
        processed: data.resumen.total_procesados,
        successful: data.resumen.total_exitosos,
        duplicates: data.resumen.total_duplicados,
        errors: data.resumen.total_errores,
        isLoading: false,
        errorDetails: data.errores,
      });

      // Limpiar imágenes después del procesamiento exitoso
      if (data.resumen.total_exitosos > 0) {
        setImages([]);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('❌ Error', 'No se pudo procesar las imágenes.');
      setProcessingState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  /**
   * Solicitar reporte de Excel por Telegram
   */
  const solicitarReporte = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${URL_BACKEND}/reporte`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        Alert.alert(
          '✅ Éxito',
          `Reporte generado con ${data.total_recibos} recibos.\nRevisa tu Telegram.`,
        );
      }
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo generar el reporte.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Ver historial de recibos
   */
  const verHistorial = async () => {
    try {
      const response = await fetch(`${URL_BACKEND}/historial`);
      const recibos = await response.json();

      if (recibos.length === 0) {
        Alert.alert('ℹ️', 'No hay recibos registrados aún.');
        return;
      }

      const resumen = recibos.slice(0, 5).map((r: any) => 
        `${r.fecha} - ${r.comercio}: Q${r.total}`
      ).join('\n');

      Alert.alert(
        '📊 Últimos Recibos',
        `${resumen}\n\nTotal registrados: ${recibos.length}`,
      );
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo obtener el historial.');
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#121214" />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.title}>Control de Gastos</Text>
          <Text style={styles.subtitle}>IA Financiera - Fase 2</Text>
        </View>

        {/* Carrusel de Imágenes */}
        <ImageCarousel
          images={images}
          onRemoveImage={eliminarImagen}
          onSelectImage={setCurrentImageIndex}
          currentIndex={currentImageIndex}
        />

        {/* Información del estado */}
        {images.length > 0 && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              📸 {images.length} imagen{images.length !== 1 ? 'es' : ''} seleccionada{images.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {/* Botones de Captura y Edición */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.btnPrimary]}
            onPress={tomarFoto}
          >
            <Ionicons
              name="camera"
              size={24}
              color="#121214"
              style={styles.btnIcon}
            />
            <Text style={styles.btnTextPrimary}>Tomar Foto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.btnSecondary]}
            onPress={seleccionarDelGaleria}
          >
            <Ionicons
              name="images"
              size={24}
              color="#00E676"
              style={styles.btnIcon}
            />
            <Text style={styles.btnTextSecondary}>Galería</Text>
          </TouchableOpacity>
        </View>

        {/* Botón de Recorte (solo si hay imágenes) */}
        {images.length > 0 && (
          <TouchableOpacity
            style={[styles.button, styles.btnCrop]}
            onPress={abrirRecortador}
          >
            <Ionicons
              name="crop"
              size={24}
              color="#fff"
              style={styles.btnIcon}
            />
            <Text style={styles.btnTextPrimary}>Recortar Imagen Actual</Text>
          </TouchableOpacity>
        )}

        {/* Botón Procesar Todas */}
        {images.length > 0 && (
          <TouchableOpacity
            style={[styles.button, styles.btnProcess]}
            onPress={procesarTodasLasImagenes}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-done-circle"
                  size={24}
                  color="#fff"
                  style={styles.btnIcon}
                />
                <Text style={styles.btnTextPrimary}>Procesar Todas</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Botones de Utilidad */}
        <View style={styles.utilityContainer}>
          <TouchableOpacity
            style={[styles.button, styles.btnUtility]}
            onPress={verHistorial}
          >
            <Ionicons
              name="list"
              size={20}
              color="#00E676"
            />
            <Text style={styles.utilityText}>Ver Historial</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.btnUtility]}
            onPress={solicitarReporte}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#00E676" />
            ) : (
              <>
                <Ionicons
                  name="document-text"
                  size={20}
                  color="#00E676"
                />
                <Text style={styles.utilityText}>Excel a Telegram</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Info */}
        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>
            💡 Consejo: Toma fotos claras del recibo para mejores resultados.
          </Text>
        </View>
      </ScrollView>

      {/* Modal de Recorte */}
      {imageToCrop && (
        <CropModal
          visible={cropModalVisible}
          imageUri={imageToCrop.uri}
          onCropComplete={procesarRecorte}
          onCancel={() => setCropModalVisible(false)}
        />
      )}

      {/* Modal de Estado de Procesamiento */}
      <ProcessingStatus
        visible={processingVisible}
        state={processingState}
        onDismiss={() => setProcessingVisible(false)}
      />
    </>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#00E676',
    fontWeight: '600',
    marginTop: 4,
  },
  infoContainer: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#00E676',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    color: '#00E676',
    fontSize: 13,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  utilityContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
    elevation: 4,
    paddingHorizontal: 12,
  },
  btnIcon: {
    marginRight: 8,
  },
  btnPrimary: {
    backgroundColor: '#00E676',
    flex: 1,
  },
  btnSecondary: {
    backgroundColor: '#1E1E28',
    borderWidth: 2,
    borderColor: '#00E676',
    flex: 1,
  },
  btnCrop: {
    backgroundColor: '#FF9800',
    marginBottom: 12,
  },
  btnProcess: {
    backgroundColor: '#4CAF50',
    height: 60,
    marginBottom: 16,
  },
  btnUtility: {
    flex: 1,
    backgroundColor: '#1E1E28',
    borderWidth: 1,
    borderColor: '#00E676',
    height: 48,
  },
  btnTextPrimary: {
    color: '#121214',
    fontSize: 16,
    fontWeight: '700',
  },
  btnTextSecondary: {
    color: '#00E676',
    fontSize: 14,
    fontWeight: '700',
  },
  utilityText: {
    color: '#00E676',
    fontSize: 12,
    fontWeight: '600',
  },
  footerInfo: {
    backgroundColor: '#1E1E28',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: '#00E676',
  },
  footerText: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
});